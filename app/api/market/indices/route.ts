import { NextResponse } from "next/server";
import {
  MARKET_INDICES,
  getUpstoxCandles,
  type MarketIndex,
  type UpstoxCandle,
} from "@/lib/upstox";
import { createClient } from "@/lib/supabase/server";

const TIMEFRAME_MAP = {
  "5m": "5",
  "15m": "15",
  "1h": "60",
  "1d": "1d",
} as const;

export async function GET(request: Request) {
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
    
    const { searchParams } = new URL(request.url);

    const index =
      (searchParams.get("index") as MarketIndex) || "nifty";

    const timeframe =
      searchParams.get("timeframe") || "5m";

    if (!(index in MARKET_INDICES)) {
      return NextResponse.json(
        {
          error: "Invalid market index.",
          availableIndices: Object.keys(MARKET_INDICES),
        },
        { status: 400 }
      );
    }

    if (!(timeframe in TIMEFRAME_MAP)) {
      return NextResponse.json(
        {
          error: "Invalid timeframe.",
          availableTimeframes: Object.keys(TIMEFRAME_MAP),
        },
        { status: 400 }
      );
    }

    const selectedIndex = MARKET_INDICES[index];

    const candles = await getUpstoxCandles(
      selectedIndex.instrumentKey,
      TIMEFRAME_MAP[
        timeframe as keyof typeof TIMEFRAME_MAP
      ]
    );

    const formattedCandles = (candles ?? [])
      .reverse()
      .map((candle: UpstoxCandle) => ({
        time: Math.floor(
          new Date(candle[0]).getTime() / 1000
        ),
        open: candle[1],
        high: candle[2],
        low: candle[3],
        close: candle[4],
        volume: candle[5],
      }));

    return NextResponse.json({
      index: {
        id: index,
        name: selectedIndex.name,
        shortName: selectedIndex.shortName,
        instrumentKey: selectedIndex.instrumentKey,
      },

      timeframe,

      candles: formattedCandles,
    });
  } catch (error) {
    console.error("Market data error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch market data.",
      },
      { status: 500 }
    );
  }
}