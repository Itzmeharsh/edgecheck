import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const visualValidationSchema = z.object({
  chart_visible: z.boolean(),
  ema_visible: z.boolean(),
  ema_count: z.number().int().min(0),
  valid: z.boolean(),
  message: z.string(),
});

const chartSetupSchema = z.object({
  indicators: z.object({
    ema9: z.boolean(),
    ema21: z.boolean(),
    ema50: z.boolean(),
  }),
});

export async function POST(request: Request) {
  try {

        const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }
    
    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null
    ) {
      return NextResponse.json(
        {
          error: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    const requestBody = body as {
      screenshot?: unknown;
      requiredEmaPeriods?: unknown;
      chartSetup?: unknown;
    };

    // -----------------------------------------------------
    // Screenshot
    // -----------------------------------------------------

    const screenshot =
      typeof requestBody.screenshot === "string"
        ? requestBody.screenshot
        : "";

    if (!screenshot) {
      return NextResponse.json(
        {
          error:
            "Chart screenshot is required.",
        },
        { status: 400 }
      );
    }

    const base64Match = screenshot.match(
      /^data:image\/(png|jpeg|jpg);base64,(.+)$/
    );

    if (!base64Match) {
      return NextResponse.json(
        {
          error:
            "Invalid chart screenshot format.",
        },
        { status: 400 }
      );
    }

    const mimeType =
      base64Match[1] === "png"
        ? "image/png"
        : "image/jpeg";

    const base64Data = base64Match[2];

    // -----------------------------------------------------
    // Required EMA periods
    // -----------------------------------------------------

    const requiredEmaPeriods = Array.isArray(
      requestBody.requiredEmaPeriods
    )
      ? requestBody.requiredEmaPeriods.filter(
          (value): value is number =>
            typeof value === "number" &&
            Number.isInteger(value)
        )
      : [];

    // -----------------------------------------------------
    // Chart setup
    // -----------------------------------------------------

    const chartSetupResult =
      chartSetupSchema.safeParse(
        requestBody.chartSetup
      );

    if (!chartSetupResult.success) {
      return NextResponse.json(
        {
          error:
            "Chart setup information is required.",
        },
        { status: 400 }
      );
    }

    const chartSetup =
      chartSetupResult.data;

    // -----------------------------------------------------
    // Determine currently enabled EMAs
    // -----------------------------------------------------

    const enabledEmaPeriods: number[] = [];

    if (chartSetup.indicators.ema9) {
      enabledEmaPeriods.push(9);
    }

    if (chartSetup.indicators.ema21) {
      enabledEmaPeriods.push(21);
    }

    if (chartSetup.indicators.ema50) {
      enabledEmaPeriods.push(50);
    }

    // -----------------------------------------------------
    // Strategy requires specific EMA(s)
    // -----------------------------------------------------

    if (requiredEmaPeriods.length > 0) {
      const missingEmaPeriods =
        requiredEmaPeriods.filter(
          (period: number) =>
            !enabledEmaPeriods.includes(period)
        );

      if (missingEmaPeriods.length > 0) {
        const periodText =
          missingEmaPeriods.length === 1
            ? `EMA ${missingEmaPeriods[0]}`
            : missingEmaPeriods
                .map(
                  (period: number) =>
                    `EMA ${period}`
                )
                .join(" and ");

        return NextResponse.json({
          validation: {
            chart_visible: true,
            ema_visible:
              enabledEmaPeriods.length > 0,
            ema_count:
              enabledEmaPeriods.length,
            valid: false,
            message: `Add ${periodText} to the chart before analyzing.`,
          },
        });
      }

      // ---------------------------------------------------
      // Don't allow unrelated EMA indicators
      // ---------------------------------------------------

      const unexpectedEmaPeriods =
        enabledEmaPeriods.filter(
          (period: number) =>
            !requiredEmaPeriods.includes(period)
        );

      if (unexpectedEmaPeriods.length > 0) {
        const requiredText =
          requiredEmaPeriods
            .map(
              (period: number) =>
                `EMA ${period}`
            )
            .join(" and ");

        return NextResponse.json({
          validation: {
            chart_visible: true,
            ema_visible: true,
            ema_count:
              enabledEmaPeriods.length,
            valid: false,
            message: `Use only ${requiredText} on the chart before analyzing.`,
          },
        });
      }
    }

    // -----------------------------------------------------
    // Gemini visual validation
    // -----------------------------------------------------

    const response =
      await gemini.models.generateContent({
        model: "gemini-3.5-flash-lite",

        contents: [
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
          {
            text: `
You are validating a trading chart screenshot for EdgeCheck.

This is ONLY visual validation.

Determine:

1. Is an actual trading chart visible?
2. Is at least one EMA line visibly present?
3. How many visually distinct EMA lines are visible?

Rules:

- Do NOT determine EMA periods from line colors.
- Do NOT invent EMA periods.
- Do NOT assume an EMA exists because candles look smooth.
- Only count clearly visible EMA lines.
- Ignore candles.
- Ignore price-axis lines.
- Ignore crosshair lines.
- Do not perform trading analysis.

The application separately knows which EMA indicators are enabled.

Return only the requested JSON.
            `,
          },
        ],

        config: {
          responseMimeType: "application/json",

          responseSchema: {
            type: Type.OBJECT,

            properties: {
              chart_visible: {
                type: Type.BOOLEAN,
              },

              ema_visible: {
                type: Type.BOOLEAN,
              },

              ema_count: {
                type: Type.INTEGER,
              },

              valid: {
                type: Type.BOOLEAN,
              },

              message: {
                type: Type.STRING,
              },
            },

            required: [
              "chart_visible",
              "ema_visible",
              "ema_count",
              "valid",
              "message",
            ],
          },
        },
      });

    const text =
      response.text?.trim();

    if (!text) {
      throw new Error(
        "Gemini returned an empty response."
      );
    }

    const parsed: unknown =
      JSON.parse(text);

    const visualValidation =
      visualValidationSchema.parse(
        parsed
      );

    // -----------------------------------------------------
    // Chart itself not visible
    // -----------------------------------------------------

    if (!visualValidation.chart_visible) {
      return NextResponse.json({
        validation: {
          chart_visible: false,
          ema_visible:
            visualValidation.ema_visible,
          ema_count:
            visualValidation.ema_count,
          valid: false,
          message:
            "The trading chart could not be verified. Please wait for the chart to load and try again.",
        },
      });
    }

    // -----------------------------------------------------
    // Strategy requires EMA
    // -----------------------------------------------------

    if (requiredEmaPeriods.length > 0) {
      if (!visualValidation.ema_visible) {
        return NextResponse.json({
          validation: {
            chart_visible: true,
            ema_visible: false,
            ema_count: 0,
            valid: false,
            message:
              requiredEmaPeriods.length === 1
                ? `Add EMA ${requiredEmaPeriods[0]} to the chart before analyzing.`
                : "Add the required EMAs to the chart before analyzing.",
          },
        });
      }

      if (
        visualValidation.ema_count !==
        requiredEmaPeriods.length
      ) {
        return NextResponse.json({
          validation: {
            chart_visible: true,
            ema_visible: true,
            ema_count:
              visualValidation.ema_count,
            valid: false,
            message:
              requiredEmaPeriods.length === 1
                ? `Use only EMA ${requiredEmaPeriods[0]} on the chart before analyzing.`
                : "Use only the required EMAs on the chart before analyzing.",
          },
        });
      }
    }

    // -----------------------------------------------------
    // Strategy does not require EMA
    // -----------------------------------------------------

    if (requiredEmaPeriods.length === 0) {
      return NextResponse.json({
        validation: {
          chart_visible: true,
          ema_visible:
            visualValidation.ema_visible,
          ema_count:
            visualValidation.ema_count,
          valid: true,
          message:
            "Chart setup is valid.",
        },
      });
    }

    // -----------------------------------------------------
    // Valid
    // -----------------------------------------------------

    return NextResponse.json({
      validation: {
        chart_visible: true,
        ema_visible: true,
        ema_count:
          visualValidation.ema_count,
        valid: true,
        message:
          "Chart setup is valid.",
      },
    });
  } catch (error) {
    console.error(
      "Chart validation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to validate chart.",
      },
      { status: 500 }
    );
  }
}