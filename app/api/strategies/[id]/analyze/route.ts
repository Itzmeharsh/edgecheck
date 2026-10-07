import OpenAI from "openai";
import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { decryptApiKey } from "@/lib/api-key-crypto";
import {
  MARKET_INDICES,
  getUpstoxCandles,
  type MarketIndex,
  type UpstoxCandle,
} from "@/lib/upstox";

const TIMEFRAME_MAP = {
  "5m": "5",
  "15m": "15",
  "1h": "60",
  "1d": "1d",
} as const;

const analysisSchema = z.object({
  match_percentage: z
    .number()
    .int()
    .min(0)
    .max(100),

  direction: z.enum([
    "BULLISH",
    "BEARISH",
    "NEUTRAL",
  ]),

  market_observation: z.string(),

  important_levels: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
    })
  ),

  matched_conditions: z.array(
    z.string()
  ),

  missing_conditions: z.array(
    z.string()
  ),

  entry_levels: z.array(
    z.string()
  ),

  exit_levels: z.array(
    z.string()
  ),

  invalidation_level: z.string(),

  summary: z.string(),
});

type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type AIProvider = "gemini" | "openai";

function calculateEMA(
  candles: Candle[],
  period: number
) {
  if (candles.length === 0) {
    return null;
  }

  const multiplier = 2 / (period + 1);

  let ema = candles[0].close;

  for (let i = 1; i < candles.length; i++) {
    ema =
      candles[i].close * multiplier +
      ema * (1 - multiplier);
  }

  return ema;
}

function calculateMarketSnapshot(
  candles: Candle[]
) {
  if (candles.length === 0) {
    throw new Error(
      "No market candles available."
    );
  }

  const latest =
    candles[candles.length - 1];

  const ema9 = calculateEMA(candles, 9);
  const ema21 = calculateEMA(candles, 21);
  const ema50 = calculateEMA(candles, 50);

  const recentCandles =
    candles.slice(-20);

  const recentHigh = Math.max(
    ...recentCandles.map(
      (candle) => candle.high
    )
  );

  const recentLow = Math.min(
    ...recentCandles.map(
      (candle) => candle.low
    )
  );

  let trend:
    | "BULLISH"
    | "BEARISH"
    | "NEUTRAL" = "NEUTRAL";

  if (
    ema9 !== null &&
    ema21 !== null &&
    ema50 !== null
  ) {
    if (
      latest.close > ema9 &&
      ema9 > ema21 &&
      ema21 > ema50
    ) {
      trend = "BULLISH";
    } else if (
      latest.close < ema9 &&
      ema9 < ema21 &&
      ema21 < ema50
    ) {
      trend = "BEARISH";
    }
  }

  return {
    latestPrice: latest.close,

    latestCandle: {
      open: latest.open,
      high: latest.high,
      low: latest.low,
      close: latest.close,
    },

    ema9,
    ema21,
    ema50,

    recent20High: recentHigh,
    recent20Low: recentLow,

    deterministicTrend: trend,
  };
}

function buildAnalysisPrompt({
  selectedIndexName,
  timeframe,
  snapshot,
  recentCandles,
  strategy,
}: {
  selectedIndexName: string;
  timeframe: string;
  snapshot: ReturnType<
    typeof calculateMarketSnapshot
  >;
  recentCandles: Candle[];
  strategy: {
    name: string;
    description: string | null;
    rules: unknown;
  };
}) {
  return `
You are EdgeCheck's market-analysis engine.

Your job is to compare a user's SAVED TRADING STRATEGY
against REAL MARKET OHLC DATA.

IMPORTANT RULES:

1. The supplied OHLC data is authoritative.
2. Never invent candles.
3. Never invent prices.
4. Never invent indicators.
5. Never assume a breakout happened unless the supplied
   data supports it.
6. Never assume a trendline exists unless the strategy
   can reasonably be evaluated from the supplied data.
7. Do not modify or recreate the market data.
8. Do not provide financial guarantees.
9. The match percentage represents how closely the CURRENT
   MARKET SETUP satisfies the saved strategy.
10. A high match percentage does NOT mean a profitable trade
    is guaranteed.

MARKET:

Index:
${selectedIndexName}

Timeframe:
${timeframe}

Latest price:
${snapshot.latestPrice}

Latest candle:
${JSON.stringify(snapshot.latestCandle)}

EMA 9:
${snapshot.ema9}

EMA 21:
${snapshot.ema21}

EMA 50:
${snapshot.ema50}

Recent 20-candle high:
${snapshot.recent20High}

Recent 20-candle low:
${snapshot.recent20Low}

Deterministic EMA trend:
${snapshot.deterministicTrend}

RECENT REAL OHLC DATA:

${JSON.stringify(recentCandles)}

SAVED STRATEGY:

Name:
${strategy.name}

Description:
${strategy.description ?? ""}

Structured rules:
${JSON.stringify(
  strategy.rules,
  null,
  2
)}

ANALYSIS INSTRUCTIONS:

Compare the saved strategy rules with the actual
market data.

Determine:

- match percentage
- whether the current setup is BULLISH,
  BEARISH, or NEUTRAL
- what strategy conditions are currently matched
- what conditions are missing
- important levels that can actually be supported
  by the supplied OHLC data
- possible entry/exit areas only if the strategy
  explicitly defines such logic
- invalidation level only if it can be supported
  by the strategy and market data
- concise market observation
- concise summary

Do NOT invent strategy rules that were not saved.

If a strategy requires information that cannot be
determined from the available OHLC data, put that
condition in missing_conditions instead of guessing.

Return ONLY the requested structured JSON.
`;
}

function getGeminiSchema() {
  return {
    type: Type.OBJECT,

    properties: {
      match_percentage: {
        type: Type.INTEGER,
      },

      direction: {
        type: Type.STRING,
        enum: [
          "BULLISH",
          "BEARISH",
          "NEUTRAL",
        ],
      },

      market_observation: {
        type: Type.STRING,
      },

      important_levels: {
        type: Type.ARRAY,

        items: {
          type: Type.OBJECT,

          properties: {
            name: {
              type: Type.STRING,
            },

            description: {
              type: Type.STRING,
            },
          },

          required: [
            "name",
            "description",
          ],
        },
      },

      matched_conditions: {
        type: Type.ARRAY,

        items: {
          type: Type.STRING,
        },
      },

      missing_conditions: {
        type: Type.ARRAY,

        items: {
          type: Type.STRING,
        },
      },

      entry_levels: {
        type: Type.ARRAY,

        items: {
          type: Type.STRING,
        },
      },

      exit_levels: {
        type: Type.ARRAY,

        items: {
          type: Type.STRING,
        },
      },

      invalidation_level: {
        type: Type.STRING,
      },

      summary: {
        type: Type.STRING,
      },
    },

    required: [
      "match_percentage",
      "direction",
      "market_observation",
      "important_levels",
      "matched_conditions",
      "missing_conditions",
      "entry_levels",
      "exit_levels",
      "invalidation_level",
      "summary",
    ],
  };
}

async function runGeminiAnalysis({
  apiKey,
  prompt,
}: {
  apiKey: string;
  prompt: string;
}) {
  const gemini = new GoogleGenAI({
    apiKey,
  });

  const response =
    await gemini.models.generateContent({
      model: "gemini-3.5-flash-lite",

      contents: prompt,

      config: {
        responseMimeType:
          "application/json",

        responseSchema:
          getGeminiSchema(),
      },
    });

  return response.text;
}

async function runOpenAIAnalysis({
  apiKey,
  prompt,
}: {
  apiKey: string;
  prompt: string;
}) {
  const openai = new OpenAI({
    apiKey,
  });

  const response =
    await openai.responses.create({
      model: "gpt-5-mini",

      input: [
        {
          role: "system",
          content:
            "You are EdgeCheck's market-analysis engine. Return only valid JSON matching the requested schema.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],

      text: {
        format: {
          type: "json_schema",
          name: "edgecheck_market_analysis",
          strict: true,
          schema: {
            type: "object",

            additionalProperties: false,

            properties: {
              match_percentage: {
                type: "integer",
                minimum: 0,
                maximum: 100,
              },

              direction: {
                type: "string",
                enum: [
                  "BULLISH",
                  "BEARISH",
                  "NEUTRAL",
                ],
              },

              market_observation: {
                type: "string",
              },

              important_levels: {
                type: "array",

                items: {
                  type: "object",

                  additionalProperties: false,

                  properties: {
                    name: {
                      type: "string",
                    },

                    description: {
                      type: "string",
                    },
                  },

                  required: [
                    "name",
                    "description",
                  ],
                },
              },

              matched_conditions: {
                type: "array",

                items: {
                  type: "string",
                },
              },

              missing_conditions: {
                type: "array",

                items: {
                  type: "string",
                },
              },

              entry_levels: {
                type: "array",

                items: {
                  type: "string",
                },
              },

              exit_levels: {
                type: "array",

                items: {
                  type: "string",
                },
              },

              invalidation_level: {
                type: "string",
              },

              summary: {
                type: "string",
              },
            },

            required: [
              "match_percentage",
              "direction",
              "market_observation",
              "important_levels",
              "matched_conditions",
              "entry_levels",
              "exit_levels",
              "invalidation_level",
              "summary",
            ],
          },
        },
      },
    });

  return response.output_text;
}

export async function POST(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    // -----------------------------------------------------
    // Authentication
    // -----------------------------------------------------

    const supabase =
      await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // -----------------------------------------------------
    // Request
    // -----------------------------------------------------

    const body = await request.json();

    const timeframe =
      body.timeframe;

    const index =
      (body.index as MarketIndex) ||
      "nifty";

    // -----------------------------------------------------
    // Validate timeframe
    // -----------------------------------------------------

    if (
      !Object.prototype.hasOwnProperty.call(
        TIMEFRAME_MAP,
        timeframe
      )
    ) {
      return NextResponse.json(
        {
          error: "Invalid timeframe.",
          availableTimeframes:
            Object.keys(TIMEFRAME_MAP),
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------------------------------
    // Validate index
    // -----------------------------------------------------

    if (
      !Object.prototype.hasOwnProperty.call(
        MARKET_INDICES,
        index
      )
    ) {
      return NextResponse.json(
        {
          error: "Invalid market index.",
          availableIndices:
            Object.keys(MARKET_INDICES),
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------------------------------
    // Strategy
    // -----------------------------------------------------

    const { id: strategyId } =
      await context.params;

    const {
      data: strategy,
      error: strategyError,
    } = await supabase
      .from("strategies")
      .select(
        "id, name, description, rules"
      )
      .eq("id", strategyId)
      .eq("user_id", user.id)
      .single();

    if (
      strategyError ||
      !strategy
    ) {
      console.error(
        "Strategy lookup error:",
        strategyError
      );

      return NextResponse.json(
        {
          error: "Strategy not found.",
        },
        {
          status: 404,
        }
      );
    }

    // -----------------------------------------------------
    // User profile + AI provider
    // -----------------------------------------------------

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select(
        "plan, ai_provider"
      )
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error(
        "Profile lookup error:",
        profileError
      );

      return NextResponse.json(
        {
          error:
            "Unable to load your account.",
        },
        {
          status: 500,
        }
      );
    }

    const plan =
      profile?.plan === "premium"
        ? "premium"
        : "free";

    const aiProvider: AIProvider =
      profile?.ai_provider === "openai"
        ? "openai"
        : "gemini";

    // -----------------------------------------------------
    // Daily limit
    // -----------------------------------------------------

    const dailyLimit =
      plan === "premium"
        ? 50
        : 5;

    const usageDate =
      new Intl.DateTimeFormat(
        "en-CA",
        {
          timeZone: "Asia/Kolkata",
        }
      ).format(new Date());

    const {
      data: usage,
      error: usageError,
    } = await supabase
      .from("daily_usage")
      .select("analysis_count")
      .eq("user_id", user.id)
      .eq("usage_date", usageDate)
      .maybeSingle();

    if (usageError) {
      console.error(
        "Usage lookup error:",
        usageError
      );

      return NextResponse.json(
        {
          error:
            "Unable to check your daily analysis limit.",
        },
        {
          status: 500,
        }
      );
    }

    const currentUsage =
      usage?.analysis_count ?? 0;

    if (
      currentUsage >= dailyLimit
    ) {
      return NextResponse.json(
        {
          code:
            "DAILY_LIMIT_REACHED",

          error:
            plan === "premium"
              ? "You have reached your daily analysis limit."
              : "You have used all 5 free analyses for today.",
        },
        {
          status: 403,
        }
      );
    }

    // -----------------------------------------------------
    // Fetch REAL Upstox market data
    // -----------------------------------------------------

    const selectedIndex =
      MARKET_INDICES[index];

    const rawCandles =
      await getUpstoxCandles(
        selectedIndex.instrumentKey,
        TIMEFRAME_MAP[
          timeframe as keyof typeof TIMEFRAME_MAP
        ]
      );

    const candles: Candle[] = (
      rawCandles ?? []
    )
      .reverse()
      .map(
        (
          candle: UpstoxCandle
        ) => ({
          time: Math.floor(
            new Date(
              candle[0]
            ).getTime() / 1000
          ),

          open: candle[1],
          high: candle[2],
          low: candle[3],
          close: candle[4],
          volume: candle[5],
        })
      );

    if (candles.length < 20) {
      return NextResponse.json(
        {
          error:
            "Not enough market data is available for analysis.",
        },
        {
          status: 503,
        }
      );
    }

    // -----------------------------------------------------
    // Deterministic market calculations
    // -----------------------------------------------------

    const snapshot =
      calculateMarketSnapshot(
        candles
      );

    const recentCandles =
      candles.slice(-100);

    // -----------------------------------------------------
    // Get user's selected AI key
    // -----------------------------------------------------

    const {
      data: userKey,
      error: userKeyError,
    } = await supabase
      .from("user_api_keys")
      .select(
        "api_key"
      )
      .eq("user_id", user.id)
      .eq("provider", aiProvider)
      .maybeSingle();

    if (userKeyError) {
      console.error(
        "User AI key lookup error:",
        userKeyError
      );

      return NextResponse.json(
        {
          error:
            "Unable to load your AI provider configuration.",
        },
        {
          status: 500,
        }
      );
    }

    let aiApiKey: string | null =
      null;

    if (userKey?.api_key) {
      try {
        aiApiKey =
          decryptApiKey(
            userKey.api_key
          );
      } catch (error) {
        console.error(
          "API key decryption error:",
          error
        );

        return NextResponse.json(
          {
            error:
              "Your saved AI API key could not be decrypted.",
          },
          {
            status: 500,
          }
        );
      }
    }

    // -----------------------------------------------------
    // Provider fallback
    // -----------------------------------------------------

    if (
      aiProvider === "gemini" &&
      !aiApiKey
    ) {
      aiApiKey =
        process.env.GEMINI_API_KEY ??
        null;
    }

    if (
      aiProvider === "openai" &&
      !aiApiKey
    ) {
      return NextResponse.json(
        {
          error:
            "OpenAI is selected, but no OpenAI API key is configured in your profile.",
        },
        {
          status: 400,
        }
      );
    }

    if (!aiApiKey) {
      return NextResponse.json(
        {
          error:
            "No AI provider API key is configured.",
        },
        {
          status: 500,
        }
      );
    }

    // -----------------------------------------------------
    // Build analysis prompt
    // -----------------------------------------------------

    const prompt =
      buildAnalysisPrompt({
        selectedIndexName:
          selectedIndex.name,

        timeframe,

        snapshot,

        recentCandles,

        strategy: {
          name: strategy.name,

          description:
            strategy.description,

          rules: strategy.rules,
        },
      });

    // -----------------------------------------------------
    // AI analysis
    // -----------------------------------------------------

    let output: string | undefined;

    if (
      aiProvider === "openai"
    ) {
      output =
        await runOpenAIAnalysis({
          apiKey: aiApiKey,
          prompt,
        });
    } else {
      output =
        await runGeminiAnalysis({
          apiKey: aiApiKey,
          prompt,
        });
    }

    if (!output) {
      return NextResponse.json(
        {
          error:
            `${aiProvider === "openai" ? "OpenAI" : "Gemini"} did not return an analysis.`,
        },
        {
          status: 500,
        }
      );
    }

    // -----------------------------------------------------
    // Parse AI response
    // -----------------------------------------------------

    let parsed: unknown;

    try {
      parsed =
        JSON.parse(output);
    } catch (error) {
      console.error(
        "AI JSON parse error:",
        error
      );

      return NextResponse.json(
        {
          error:
            `${aiProvider === "openai" ? "OpenAI" : "Gemini"} returned invalid JSON.`,
        },
        {
          status: 500,
        }
      );
    }

    const validated =
      analysisSchema.safeParse(
        parsed
      );

    if (!validated.success) {
      console.error(
        "Analysis schema error:",
        validated.error
      );

      return NextResponse.json(
        {
          error:
            `${aiProvider === "openai" ? "OpenAI" : "Gemini"} returned an invalid analysis structure.`,
        },
        {
          status: 500,
        }
      );
    }

    const analysis =
      validated.data;

    // -----------------------------------------------------
    // Save analysis
    // -----------------------------------------------------

    const {
      data: savedAnalysis,
      error: insertError,
    } = await supabase
      .from("analyses")
      .insert({
        user_id: user.id,

        strategy_id:
          strategy.id,

        timeframe,

        image_url: null,

        match_percentage:
          analysis.match_percentage,

        important_levels:
          analysis.important_levels,

        matched_conditions:
          analysis.matched_conditions,

        missing_conditions:
          analysis.missing_conditions,

        ai_summary:
          JSON.stringify({
            direction:
              analysis.direction,

            market_observation:
              analysis.market_observation,

            entry_levels:
              analysis.entry_levels,

            exit_levels:
              analysis.exit_levels,

            invalidation_level:
              analysis.invalidation_level,

            summary:
              analysis.summary,

            index:
              selectedIndex.name,

            latest_price:
              snapshot.latestPrice,

            ai_provider:
              aiProvider,
          }),
      })
      .select()
      .single();

    if (insertError) {
      console.error(
        "Analysis insert error:",
        insertError
      );

      return NextResponse.json(
        {
          error:
            "Analysis was completed but could not be saved.",
        },
        {
          status: 500,
        }
      );
    }

    // -----------------------------------------------------
    // Increment daily usage
    // -----------------------------------------------------

    let finalUsageCount =
      currentUsage + 1;

    if (usage) {
      const {
        data: updatedUsage,
        error: updateUsageError,
      } = await supabase
        .from("daily_usage")
        .update({
          analysis_count:
            currentUsage + 1,

          updated_at:
            new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq(
          "usage_date",
          usageDate
        )
        .select(
          "analysis_count"
        )
        .single();

      if (updateUsageError) {
        console.error(
          "Usage update error:",
          updateUsageError
        );
      } else {
        finalUsageCount =
          updatedUsage?.analysis_count ??
          currentUsage + 1;
      }
    } else {
      const {
        data: insertedUsage,
        error: insertUsageError,
      } = await supabase
        .from("daily_usage")
        .insert({
          user_id: user.id,

          usage_date:
            usageDate,

          analysis_count: 1,
        })
        .select(
          "analysis_count"
        )
        .single();

      if (!insertUsageError) {
        finalUsageCount =
          insertedUsage?.analysis_count ??
          1;
      } else if (
        insertUsageError.code ===
        "23505"
      ) {
        const {
          data: latestUsage,
          error:
            latestUsageError,
        } = await supabase
          .from("daily_usage")
          .select(
            "analysis_count"
          )
          .eq(
            "user_id",
            user.id
          )
          .eq(
            "usage_date",
            usageDate
          )
          .single();

        if (latestUsageError) {
          console.error(
            "Usage retry lookup error:",
            latestUsageError
          );
        } else {
          const latestCount =
            latestUsage?.analysis_count ??
            0;

          const {
            data:
              retryUpdatedUsage,
            error:
              retryUpdateError,
          } = await supabase
            .from("daily_usage")
            .update({
              analysis_count:
                latestCount + 1,

              updated_at:
                new Date().toISOString(),
            })
            .eq(
              "user_id",
              user.id
            )
            .eq(
              "usage_date",
              usageDate
            )
            .select(
              "analysis_count"
            )
            .single();

          if (retryUpdateError) {
            console.error(
              "Usage retry update error:",
              retryUpdateError
            );
          } else {
            finalUsageCount =
              retryUpdatedUsage?.analysis_count ??
              latestCount + 1;
          }
        }
      } else {
        console.error(
          "Usage insert error:",
          insertUsageError
        );
      }
    }

    // -----------------------------------------------------
    // Return
    // -----------------------------------------------------

    return NextResponse.json({
      success: true,

      analysis: {
        ...analysis,

        id:
          savedAnalysis.id,
      },

      market: {
        index: {
          id: index,

          name:
            selectedIndex.name,

          shortName:
            selectedIndex.shortName,
        },

        timeframe,

        latestPrice:
          snapshot.latestPrice,

        ema9:
          snapshot.ema9,

        ema21:
          snapshot.ema21,

        ema50:
          snapshot.ema50,

        trend:
          snapshot.deterministicTrend,
      },

      provider:
        aiProvider,

      usage: {
        used:
          finalUsageCount,

        limit:
          dailyLimit,
      },
    });
  } catch (error) {
    console.error(
      "Market analysis error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while analyzing the market.",
      },
      {
        status: 500,
      }
    );
  }
}