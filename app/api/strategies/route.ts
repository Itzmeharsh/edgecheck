import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const strategySchema = z.object({
  is_sufficient: z.boolean(),
  insufficient_reason: z.string(),

  description: z.string().max(500),

  market_bias: z.enum([
    "bullish",
    "bearish",
    "neutral",
    "conditional",
  ]),

  timeframe: z.array(
    z.enum(["5m", "15m", "1h", "1d"])
  ),

  entry_conditions: z.array(z.string()).max(10),
  confirmation_conditions: z.array(z.string()).max(10),
  invalidation_conditions: z.array(z.string()).max(10),

  stop_loss_logic: z.string(),
  take_profit_logic: z.string(),

  important_levels: z.array(z.string()).max(10),
  indicators: z.array(z.string()).max(10),
  trend_conditions: z.array(z.string()).max(10),
  rules_summary: z.array(z.string()).max(10),
});

export async function POST(request: Request) {
  try {
    // -----------------------------------------
    // AUTHENTICATION
    // -----------------------------------------

    const supabase = await createClient();

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

    // -----------------------------------------
    // REQUEST BODY
    // -----------------------------------------

    const body = await request.json();

    const name = body.name?.trim();
    const strategyText = body.strategyText?.trim();

    if (!name || !strategyText) {
      return NextResponse.json(
        {
          error:
            "Strategy name and description are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        {
          error: "Strategy name is too long.",
        },
        {
          status: 400,
        }
      );
    }

    if (strategyText.length < 10) {
      return NextResponse.json(
        {
          code: "INSUFFICIENT_INFORMATION",
          error:
            "Not enough information. Please provide a brief description of your strategy.",
        },
        {
          status: 422,
        }
      );
    }

    // -----------------------------------------
    // CHECK GEMINI API KEY
    // -----------------------------------------

    if (!process.env.GEMINI_API_KEY) {
      console.error(
        "GEMINI_API_KEY is not configured."
      );

      return NextResponse.json(
        {
          error:
            "Gemini API key is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    // -----------------------------------------
    // GET USER PLAN
    // -----------------------------------------

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error(
        "Profile error:",
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

    const plan = profile?.plan ?? "free";

    // -----------------------------------------
    // STRATEGY LIMIT
    // -----------------------------------------

    const strategyLimit =
      plan === "premium" ? 25 : 3;

    const {
      count,
      error: countError,
    } = await supabase
      .from("strategies")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("user_id", user.id);

    if (countError) {
      console.error(
        "Strategy count error:",
        countError
      );

      return NextResponse.json(
        {
          error:
            "Unable to check your strategy limit.",
        },
        {
          status: 500,
        }
      );
    }

    if ((count ?? 0) >= strategyLimit) {
      return NextResponse.json(
        {
          code: "STRATEGY_LIMIT_REACHED",
          error:
            plan === "premium"
              ? "You have reached your strategy limit."
              : "Free users can have up to 3 active strategies.",
        },
        {
          status: 403,
        }
      );
    }

    // -----------------------------------------
    // GEMINI STRATEGY ANALYSIS
    // -----------------------------------------

    const response =
      await gemini.models.generateContent({
        model: "gemini-3.5-flash-lite",

        contents: `
You are a trading strategy structuring assistant for EdgeCheck.

Your job is to understand a user's trading strategy description and convert
it into structured rules that can later be compared against real market data.

IMPORTANT RULES:

1. Determine whether the user's description contains enough information
   to identify an actual trading strategy.

2. A strategy does NOT need to contain every possible detail.

3. A brief but meaningful strategy is sufficient if it contains at least
   some actionable trading logic.

Examples of actionable logic include:

- entry condition
- trend condition
- indicator condition
- support/resistance condition
- breakout/retest condition
- price action condition
- stop-loss logic
- take-profit logic
- confirmation condition

4. If the input is only vague text such as:

"I trade stocks"

"I use technical analysis"

"I trade breakouts"

"I want to make profit"

or otherwise does not provide enough information to identify actionable
rules, set is_sufficient to false.

5. Do NOT reject a strategy merely because the user did not provide every
possible detail.

6. If is_sufficient is false, do not invent trading rules.

7. If is_sufficient is true, extract ONLY information supported by the
user's description.

8. NEVER invent indicators, entry conditions, stop loss, take profit,
timeframes, or confirmations that the user did not mention.

9. timeframe must contain only timeframes explicitly mentioned or clearly
implied by the user's description.

10. If no timeframe is specified, return an empty array.

11. Keep the description concise and useful.

12. market_bias should represent the strategy's stated bias.
If the strategy can work in both directions depending on conditions,
use "conditional".

13. Do not provide financial advice.

14. Return ONLY the structured JSON object.

USER STRATEGY

Strategy name:
${name}

Strategy description:
${strategyText}
`,

        config: {
          responseMimeType: "application/json",

          responseSchema: {
            type: Type.OBJECT,

            properties: {
              is_sufficient: {
                type: Type.BOOLEAN,
              },

              insufficient_reason: {
                type: Type.STRING,
              },

              description: {
                type: Type.STRING,
              },

              market_bias: {
                type: Type.STRING,
                enum: [
                  "bullish",
                  "bearish",
                  "neutral",
                  "conditional",
                ],
              },

              timeframe: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                  enum: [
                    "5m",
                    "15m",
                    "1h",
                    "1d",
                  ],
                },
              },

              entry_conditions: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
              },

              confirmation_conditions: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
              },

              invalidation_conditions: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
              },

              stop_loss_logic: {
                type: Type.STRING,
              },

              take_profit_logic: {
                type: Type.STRING,
              },

              important_levels: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
              },

              indicators: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
              },

              trend_conditions: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
              },

              rules_summary: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
              },
            },

            required: [
              "is_sufficient",
              "insufficient_reason",
              "description",
              "market_bias",
              "timeframe",
              "entry_conditions",
              "confirmation_conditions",
              "invalidation_conditions",
              "stop_loss_logic",
              "take_profit_logic",
              "important_levels",
              "indicators",
              "trend_conditions",
              "rules_summary",
            ],
          },
        },
      });

    // -----------------------------------------
    // GET GEMINI RESPONSE
    // -----------------------------------------

    const output = response.text;

    if (!output) {
      console.error(
        "Gemini returned an empty response."
      );

      return NextResponse.json(
        {
          error:
            "Gemini did not return a result.",
        },
        {
          status: 500,
        }
      );
    }

    // -----------------------------------------
    // PARSE JSON
    // -----------------------------------------

    let parsed: unknown;

    try {
      parsed = JSON.parse(output);
    } catch (error) {
      console.error(
        "Gemini JSON parse error:",
        error
      );

      console.error(
        "Gemini raw output:",
        output
      );

      return NextResponse.json(
        {
          error:
            "Gemini returned an invalid strategy format.",
        },
        {
          status: 500,
        }
      );
    }

    // -----------------------------------------
    // VALIDATE WITH ZOD
    // -----------------------------------------

    const structuredStrategy =
      strategySchema.safeParse(parsed);

    if (!structuredStrategy.success) {
      console.error(
        "Strategy validation error:",
        structuredStrategy.error
      );

      return NextResponse.json(
        {
          error:
            "Gemini returned an invalid strategy structure.",
        },
        {
          status: 500,
        }
      );
    }

    const strategyData =
      structuredStrategy.data;

    // -----------------------------------------
    // INSUFFICIENT INFORMATION
    // -----------------------------------------

    if (!strategyData.is_sufficient) {
      return NextResponse.json(
        {
          code:
            "INSUFFICIENT_INFORMATION",

          error:
            strategyData.insufficient_reason ||
            "Not enough information. Please provide a brief description of your strategy.",
        },
        {
          status: 422,
        }
      );
    }

    // -----------------------------------------
    // SAVE STRATEGY
    // -----------------------------------------

    const {
      data: strategy,
      error: insertError,
    } = await supabase
      .from("strategies")
      .insert({
        user_id: user.id,
        name,
        description:
          strategyData.description,
        rules: strategyData,
      })
      .select()
      .single();

    if (insertError) {
      console.error(
        "Strategy insert error:",
        insertError
      );

      return NextResponse.json(
        {
          error:
            "Unable to save your strategy.",
        },
        {
          status: 500,
        }
      );
    }

    // -----------------------------------------
    // SUCCESS
    // -----------------------------------------

    return NextResponse.json({
      success: true,
      strategy,
      provider: "gemini",
    });
  } catch (error) {
    console.error(
      "Create strategy error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while processing your strategy.",
      },
      {
        status: 500,
      }
    );
  }
}