"use client";

import { useState } from "react";
import MarketPanel from "@/components/market-panel";
import StrategyAnalysis from "@/components/strategy-analysis";
import PremiumModal from "@/components/premium-modal";

type Strategy = {
  id: string;
  name: string;
  rules: Record<string, unknown>;
};

export type ChartSetup = {
  index:
    | "nifty"
    | "niftyBank"
    | "sensex"
    | "niftyFinService"
    | "niftyMidSelect"
    | "indiaVix";

  timeframe: "5m" | "15m" | "1h" | "1d";

  indicators: {
    ema9: boolean;
    ema21: boolean;
    ema50: boolean;
  };

  drawings: unknown[];
};

export default function DashboardMarket({
  strategies,
}: {
  strategies: Strategy[];
}) {
  const [chartScreenshot, setChartScreenshot] =
    useState<string | null>(null);

  const [chartSetup, setChartSetup] =
    useState<ChartSetup>({
      index: "nifty",
      timeframe: "5m",
      indicators: {
        ema9: true,
        ema21: true,
        ema50: true,
      },
      drawings: [],
    });

  const [premiumOpen, setPremiumOpen] =
    useState(false);

  return (
    <>
      <MarketPanel
        onChartScreenshot={setChartScreenshot}
        onChartSetupChange={setChartSetup}
      />

      <div className="mt-8">
        <div className="mb-3">
          <h2 className="text-lg font-bold text-[#173944]">
            Strategy Analysis
          </h2>

          <p className="mt-1 text-sm text-[#78919a]">
            Analyze your saved strategies against the current market.
          </p>
        </div>

        <StrategyAnalysis
          strategies={strategies}
          chartScreenshot={chartScreenshot}
          chartSetup={chartSetup}
        />
      </div>

      <PremiumModal
        open={premiumOpen}
        onClose={() => setPremiumOpen(false)}
      />
    </>
  );
}