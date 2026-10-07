"use client";

import { useState } from "react";
import {
  Loader2,
  Sparkles,
  X,
} from "lucide-react";

type Strategy = {
  id: string;
  name: string;
  rules: Record<string, unknown>;
};

type AnalysisResult = {
  match_percentage: number;
  direction:
    | "BULLISH"
    | "BEARISH"
    | "NEUTRAL";
};

type ChartValidation = {
  chart_visible: boolean;
  ema_visible: boolean;
  ema_count: number;
  valid: boolean;
  message: string;
};

type ChartSetup = {
  index:
    | "nifty"
    | "niftyBank"
    | "sensex"
    | "niftyFinService"
    | "niftyMidSelect"
    | "indiaVix";

  timeframe:
    | "5m"
    | "15m"
    | "1h"
    | "1d";

  indicators: {
    ema9: boolean;
    ema21: boolean;
    ema50: boolean;
  };

  drawings: unknown[];
};

type StrategyAnalysisProps = {
  strategies: Strategy[];
  chartScreenshot?: string | null;
  chartSetup: ChartSetup;
};

// ---------------------------------------------------------
// Extract EMA requirements from saved strategy rules
// ---------------------------------------------------------

function getRequiredEmaPeriods(
  rules: Record<string, unknown>
): number[] {
  const text = JSON.stringify(rules)
    .toLowerCase()
    .replace(/_/g, " ");

  const periods = new Set<number>();

  const regex =
    /(?:ema|exponential moving average)\s*(?:period\s*)?(\d+)/gi;

  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const period = Number(match[1]);

    if (
      period === 9 ||
      period === 21 ||
      period === 50
    ) {
      periods.add(period);
    }
  }

  // Also support formats like:
  //
  // "9 EMA"
  // "21 EMA"
  // "50 EMA"
  //

  const reverseRegex =
    /\b(9|21|50)\s*(?:ema|exponential moving average)\b/gi;

  while (
    (match = reverseRegex.exec(text)) !== null
  ) {
    periods.add(Number(match[1]));
  }

  return Array.from(periods).sort(
    (a, b) => a - b
  );
}

export default function StrategyAnalysis({
  strategies,
  chartScreenshot,
  chartSetup,
}: StrategyAnalysisProps) {
  const [results, setResults] =
    useState<Record<string, AnalysisResult>>(
      {}
    );

  const [loadingId, setLoadingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [snackbar, setSnackbar] =
    useState<string | null>(null);

  const showSnackbar = (
    message: string
  ) => {
    setSnackbar(message);

    window.setTimeout(() => {
      setSnackbar(null);
    }, 4000);
  };

  const clearStrategyResult = (
    strategyId: string
  ) => {
    setResults((current) => {
      const next = { ...current };

      delete next[strategyId];

      return next;
    });
  };

  const analyzeStrategy = async (
    strategy: Strategy
  ) => {
    const strategyId = strategy.id;

    try {
      setLoadingId(strategyId);
      setError(null);
      setSnackbar(null);

      // Remove old result immediately.
      clearStrategyResult(strategyId);

      // ---------------------------------------------------
      // STEP 1
      // Screenshot
      // ---------------------------------------------------

      if (!chartScreenshot) {
        showSnackbar(
          "Chart is not ready yet. Please wait for the chart to load."
        );

        return;
      }

      // ---------------------------------------------------
      // STEP 2
      // Determine what this strategy requires
      // ---------------------------------------------------

      const requiredEmaPeriods =
        getRequiredEmaPeriods(
          strategy.rules
        );

      console.log(
        "Strategy:",
        strategy.name
      );

      console.log(
        "Required EMA periods:",
        requiredEmaPeriods
      );

      console.log(
        "Current chart setup:",
        chartSetup
      );

      // ---------------------------------------------------
      // STEP 3
      // Validate chart setup
      // ---------------------------------------------------

      const validationResponse =
        await fetch(
          "/api/chart/validate",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              screenshot:
                chartScreenshot,

              requiredEmaPeriods,

              chartSetup,
            }),
          }
        );

      const validationData =
        await validationResponse.json();

      if (!validationResponse.ok) {
        clearStrategyResult(strategyId);

        showSnackbar(
          validationData.error ||
            "Unable to validate the chart."
        );

        return;
      }

      const validation =
        validationData.validation as ChartValidation;

      // ---------------------------------------------------
      // STEP 4
      // Invalid setup
      // ---------------------------------------------------

      if (!validation.valid) {
        clearStrategyResult(strategyId);

        showSnackbar(
          validation.message
        );

        return;
      }

      // ---------------------------------------------------
      // STEP 5
      // Run analysis using the SAME chart
      // index + timeframe
      // ---------------------------------------------------

      const response =
        await fetch(
          `/api/strategies/${strategyId}/analyze`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              index:
                chartSetup.index,

              timeframe:
                chartSetup.timeframe,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        clearStrategyResult(strategyId);

        setError(
          data.error ||
            "Unable to analyze this strategy."
        );

        return;
      }

      if (!data.analysis) {
        clearStrategyResult(strategyId);

        setError(
          "The analysis API returned no analysis result."
        );

        return;
      }

      // ---------------------------------------------------
      // STEP 6
      // Show result
      // ---------------------------------------------------

      setResults((current) => ({
        ...current,

        [strategyId]: {
          match_percentage:
            data.analysis
              .match_percentage,

          direction:
            data.analysis.direction,
        },
      }));
    } catch (error) {
      console.error(error);

      clearStrategyResult(strategyId);

      setError(
        "Something went wrong while analyzing the strategy."
      );
    } finally {
      setLoadingId(null);
    }
  };

  const getDirectionClass = (
    direction: AnalysisResult["direction"]
  ) => {
    if (direction === "BULLISH") {
      return "bg-emerald-50 text-emerald-600";
    }

    if (direction === "BEARISH") {
      return "bg-red-50 text-red-600";
    }

    return "bg-slate-100 text-slate-600";
  };

  return (
    <>
      <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-[#dceff5] bg-white shadow-sm">
        {strategies.length > 0 ? (
          <>
            {strategies.map(
              (strategy, index) => {
                const result =
                  results[strategy.id];

                const loading =
                  loadingId ===
                  strategy.id;

                return (
                  <div
                    key={strategy.id}
                    className={`flex min-w-0 items-center gap-2 px-4 py-5 sm:gap-4 sm:px-6 ${
                      index !==
                      strategies.length - 1
                        ? "border-b border-[#edf4f6]"
                        : ""
                    }`}
                  >
                    {/* Strategy name */}

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-bold text-[#173944]">
                        {strategy.name}
                      </h3>
                    </div>

                    {/* Direction */}

                    <div className="hidden shrink-0 sm:block">
                      {result ? (
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-bold ${getDirectionClass(
                            result.direction
                          )}`}
                        >
                          {
                            result.direction
                          }
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#f1f8fa] px-3 py-1.5 text-xs font-bold text-[#78919a]">
                          —
                        </span>
                      )}
                    </div>

                    {/* Percentage */}

                    <div className="w-14 shrink-0 text-right sm:w-16">
                      {result ? (
                        <span className="text-lg font-bold text-[#173944]">
                          {
                            result.match_percentage
                          }
                          %
                        </span>
                      ) : (
                        <span className="text-lg font-bold text-[#173944]">
                          —
                        </span>
                      )}
                    </div>

                    {/* Analyze */}

                    <button
                      type="button"
                      onClick={() =>
                        analyzeStrategy(
                          strategy
                        )
                      }
                      disabled={loading}
                      aria-label={`Analyze ${strategy.name}`}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2da8cf] text-white transition hover:bg-[#269abd] disabled:cursor-not-allowed disabled:opacity-60 sm:h-auto sm:w-auto sm:gap-2 sm:px-3.5 sm:py-2.5 sm:text-xs sm:font-semibold"
                    >
                      {loading ? (
                        <>
                          <Loader2
                            size={15}
                            className="animate-spin"
                          />

                          <span className="hidden sm:inline">
                            Analyzing
                          </span>
                        </>
                      ) : (
                        <>
                          <Sparkles
                            size={15}
                          />

                          <span className="hidden sm:inline">
                            Analyze
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                );
              }
            )}

            {error && (
              <div className="border-t border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 sm:px-6">
                {error}
              </div>
            )}
          </>
        ) : (
          <div className="px-6 py-10 text-center">
            <p className="text-sm font-medium text-[#78919a]">
              No strategies added yet.
            </p>

            <p className="mt-1 text-xs text-[#9aafb6]">
              Add a strategy to see its market
              analysis here.
            </p>
          </div>
        )}
      </div>

      {/* Snackbar */}

      {snackbar && (
        <div className="fixed bottom-6 left-1/2 z-[100] w-[calc(100%-2rem)] max-w-md -translate-x-1/2">
          <div className="flex items-start gap-3 rounded-2xl border border-[#dceff5] bg-white px-4 py-3.5 shadow-xl">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#173944]">
                Chart setup required
              </p>

              <p className="mt-0.5 text-xs leading-5 text-[#78919a]">
                {snackbar}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setSnackbar(null)
              }
              className="shrink-0 rounded-lg p-1 text-[#8aa0a8] transition hover:bg-[#f1f8fa] hover:text-[#173944]"
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}