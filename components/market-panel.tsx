"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  CandlestickData,
  Time,
} from "lightweight-charts";

import MarketChart from "./market-chart";
import type { Drawing } from "./chart/drawings";

const MARKET_INDICES = [
  {
    id: "nifty",
    name: "NIFTY 50",
  },
  {
    id: "niftyBank",
    name: "NIFTY BANK",
  },
  {
    id: "sensex",
    name: "SENSEX",
  },
  {
    id: "niftyFinService",
    name: "NIFTY FIN SERVICE",
  },
  {
    id: "niftyMidSelect",
    name: "NIFTY MID SELECT",
  },
  {
    id: "indiaVix",
    name: "INDIA VIX",
  },
] as const;

const TIMEFRAMES = [
  "5m",
  "15m",
  "1h",
  "1d",
] as const;

type MarketIndex =
  (typeof MARKET_INDICES)[number]["id"];

type Timeframe =
  (typeof TIMEFRAMES)[number];

type ApiCandle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

type MarketPanelProps = {
  onChartScreenshot?: (
    screenshot: string
  ) => void;

  onChartSetupChange?: (setup: {
    index: MarketIndex;
    timeframe: Timeframe;
    indicators: {
      ema9: boolean;
      ema21: boolean;
      ema50: boolean;
    };
    drawings: Drawing[];
  }) => void;
};

export default function MarketPanel({
  onChartScreenshot,
  onChartSetupChange,
}: MarketPanelProps) {
  const [index, setIndex] =
    useState<MarketIndex>("nifty");

  const [timeframe, setTimeframe] =
    useState<Timeframe>("5m");

  const [candles, setCandles] =
    useState<
      CandlestickData<Time>[]
    >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  /*
   * =====================================================
   * INDICATORS
   * =====================================================
   */

  const [indicators, setIndicators] =
    useState({
      ema9: true,
      ema21: true,
      ema50: true,
    });

  const [
    showIndicatorPanel,
    setShowIndicatorPanel,
  ] = useState(false);

  /*
   * =====================================================
   * DRAWINGS
   * =====================================================
   */

  const [drawings, setDrawings] =
    useState<Drawing[]>([]);

  const [
    activeDrawingTool,
    setActiveDrawingTool,
  ] = useState<
    "none" |
    "horizontal" |
    "trendline"
  >("none");

  const [
    showDrawingPanel,
    setShowDrawingPanel,
  ] = useState(false);

  const [snackbar, setSnackbar] =
    useState<string | null>(null);

  /*
   * =====================================================
   * SEND CHART SETUP TO PARENT
   * =====================================================
   */

  useEffect(() => {
    onChartSetupChange?.({
      index,
      timeframe,
      indicators,
      drawings,
    });
  }, [
    index,
    timeframe,
    indicators,
    drawings,
    onChartSetupChange,
  ]);

  /*
   * =====================================================
   * MARKET DATA
   * =====================================================
   */

  useEffect(() => {
    const controller =
      new AbortController();

    async function loadMarketData() {
      try {
        setLoading(true);
        setError(null);

        setCandles([]);

        const response =
          await fetch(
            `/api/market/indices?index=${index}&timeframe=${timeframe}`,
            {
              method: "GET",
              cache: "no-store",
              signal:
                controller.signal,
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to load market data."
          );
        }

        const formattedCandles =
          (
            data.candles as ApiCandle[]
          ).map((candle) => ({
            time:
              candle.time as Time,

            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
          }));

        setCandles(
          formattedCandles
        );
      } catch (err) {
        if (
          err instanceof DOMException &&
          err.name ===
            "AbortError"
        ) {
          return;
        }

        setCandles([]);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load market data."
        );
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setLoading(false);
        }
      }
    }

    loadMarketData();

    return () => {
      controller.abort();
    };
  }, [
    index,
    timeframe,
  ]);

  /*
   * =====================================================
   * SELECTED INDEX
   * =====================================================
   */

  const selectedIndex =
    useMemo(
      () =>
        MARKET_INDICES.find(
          (item) =>
            item.id === index
        ),
      [index]
    );

  /*
   * =====================================================
   * CURRENT PRICE
   * =====================================================
   */

  const latestPrice =
    candles.length > 0
      ? candles[
          candles.length - 1
        ].close
      : null;

  /*
   * =====================================================
   * INDICATOR TOGGLE
   * =====================================================
   */

  function toggleIndicator(
    indicator:
      | "ema9"
      | "ema21"
      | "ema50"
  ) {
    setIndicators(
      (current) => ({
        ...current,

        [indicator]:
          !current[indicator],
      })
    );
  }

  /*
   * =====================================================
   * ADD DRAWING
   * =====================================================
   */

  function addDrawing(
    drawing: Drawing
  ) {
    setDrawings(
      (current) => [
        ...current,
        drawing,
      ]
    );

    setActiveDrawingTool(
      "none"
    );

    setSnackbar(null);
  }

  /*
   * =====================================================
   * UPDATE DRAWING
   * =====================================================
   */

  function updateDrawing(
    updatedDrawing: Drawing
  ) {
    setDrawings(
      (current) =>
        current.map(
          (drawing) =>
            drawing.id ===
            updatedDrawing.id
              ? updatedDrawing
              : drawing
        )
    );
  }

  /*
   * =====================================================
   * DELETE DRAWING
   * =====================================================
   */

  function deleteDrawing(
    drawingId: string
  ) {
    setDrawings(
      (current) =>
        current.filter(
          (drawing) =>
            drawing.id !==
            drawingId
        )
    );
  }

  /*
   * =====================================================
   * HORIZONTAL TOOL
   * =====================================================
   */

  function selectHorizontalTool() {
    if (
      activeDrawingTool ===
      "horizontal"
    ) {
      setActiveDrawingTool(
        "none"
      );

      setSnackbar(null);
    } else {
      setActiveDrawingTool(
        "horizontal"
      );

      setSnackbar(
        "Add a horizontal line to the chart."
      );
    }

    setShowDrawingPanel(false);
  }

  /*
   * =====================================================
   * TRENDLINE TOOL
   * =====================================================
   */

  function selectTrendlineTool() {
    if (
      activeDrawingTool ===
      "trendline"
    ) {
      setActiveDrawingTool(
        "none"
      );

      setSnackbar(null);
    } else {
      setActiveDrawingTool(
        "trendline"
      );

      setSnackbar(
        "Add a trendline to the chart."
      );
    }

    setShowDrawingPanel(false);
  }

  /*
   * =====================================================
   * RENDER
   * =====================================================
   */

  return (
    <section className="mb-8 overflow-visible rounded-2xl border border-[#dceff5] bg-white shadow-sm">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="border-b border-[#edf4f6] px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          {/* Market name */}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#2da8cf]">
              Market
            </p>

            <h2 className="mt-1 text-xl font-bold text-[#173944]">
              {selectedIndex?.name}
            </h2>
          </div>

          {/* Controls */}

          <div className="flex flex-wrap items-center gap-3">

            {/* Last price */}

            {latestPrice !== null && (
              <div className="text-right">
                <p className="text-xs text-[#8aa0a8]">
                  Last price
                </p>

                <p className="text-lg font-bold text-[#173944]">
                  {latestPrice.toLocaleString(
                    "en-IN",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </p>
              </div>
            )}

            {/* ================================================= */}
            {/* INDEX */}
            {/* ================================================= */}

            <select
              value={index}
              onChange={(event) =>
                setIndex(
                  event.target
                    .value as MarketIndex
                )
              }
              className="rounded-xl border border-[#dceff5] bg-[#f8fcfd] px-3 py-2 text-sm font-semibold text-[#173944] outline-none transition focus:border-[#7bc7dd]"
            >
              {MARKET_INDICES.map(
                (marketIndex) => (
                  <option
                    key={
                      marketIndex.id
                    }
                    value={
                      marketIndex.id
                    }
                  >
                    {
                      marketIndex.name
                    }
                  </option>
                )
              )}
            </select>

            {/* ================================================= */}
            {/* INDICATORS */}
            {/* ================================================= */}

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowIndicatorPanel(
                    (current) =>
                      !current
                  );

                  setShowDrawingPanel(
                    false
                  );
                }}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  showIndicatorPanel
                    ? "border-[#2da8cf] bg-[#eaf8fc] text-[#258eaf]"
                    : "border-[#dceff5] bg-[#f8fcfd] text-[#66838d] hover:border-[#b9dfeb]"
                }`}
              >
                Indicators
              </button>

              {showIndicatorPanel && (
                <div className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-2xl border border-[#dceff5] bg-white shadow-xl">

                  <div className="border-b border-[#edf4f6] px-4 py-3">
                    <p className="text-sm font-bold text-[#173944]">
                      Indicators
                    </p>

                    <p className="mt-1 text-xs text-[#8aa0a8]">
                      Add or remove indicators
                      from the chart.
                    </p>
                  </div>

                  <div className="p-2">

                    <p className="px-2 py-2 text-[11px] font-bold uppercase tracking-wider text-[#9aafb6]">
                      Moving Averages
                    </p>

                    {/* EMA 9 */}

                    <button
                      type="button"
                      onClick={() =>
                        toggleIndicator(
                          "ema9"
                        )
                      }
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition hover:bg-[#f5fafc]"
                    >
                      <div className="flex items-center gap-3">

                        <span className="h-3 w-3 rounded-full bg-[#2563eb]" />

                        <div>
                          <p className="text-sm font-semibold text-[#173944]">
                            EMA 9
                          </p>

                          <p className="text-[11px] text-[#8aa0a8]">
                            Exponential Moving Average
                          </p>
                        </div>

                      </div>

                      <span
                        className={`flex h-5 w-9 items-center rounded-full p-0.5 ${
                          indicators.ema9
                            ? "bg-[#2da8cf]"
                            : "bg-[#dce8ec]"
                        }`}
                      >
                        <span
                          className={`h-4 w-4 rounded-full bg-white shadow-sm transition ${
                            indicators.ema9
                              ? "translate-x-4"
                              : "translate-x-0"
                          }`}
                        />
                      </span>
                    </button>

                    {/* EMA 21 */}

                    <button
                      type="button"
                      onClick={() =>
                        toggleIndicator(
                          "ema21"
                        )
                      }
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition hover:bg-[#f5fafc]"
                    >
                      <div className="flex items-center gap-3">

                        <span className="h-3 w-3 rounded-full bg-[#f59e0b]" />

                        <div>
                          <p className="text-sm font-semibold text-[#173944]">
                            EMA 21
                          </p>

                          <p className="text-[11px] text-[#8aa0a8]">
                            Exponential Moving Average
                          </p>
                        </div>

                      </div>

                      <span
                        className={`flex h-5 w-9 items-center rounded-full p-0.5 ${
                          indicators.ema21
                            ? "bg-[#2da8cf]"
                            : "bg-[#dce8ec]"
                        }`}
                      >
                        <span
                          className={`h-4 w-4 rounded-full bg-white shadow-sm transition ${
                            indicators.ema21
                              ? "translate-x-4"
                              : "translate-x-0"
                          }`}
                        />
                      </span>
                    </button>

                    {/* EMA 50 */}

                    <button
                      type="button"
                      onClick={() =>
                        toggleIndicator(
                          "ema50"
                        )
                      }
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition hover:bg-[#f5fafc]"
                    >
                      <div className="flex items-center gap-3">

                        <span className="h-3 w-3 rounded-full bg-[#9333ea]" />

                        <div>
                          <p className="text-sm font-semibold text-[#173944]">
                            EMA 50
                          </p>

                          <p className="text-[11px] text-[#8aa0a8]">
                            Exponential Moving Average
                          </p>
                        </div>

                      </div>

                      <span
                        className={`flex h-5 w-9 items-center rounded-full p-0.5 ${
                          indicators.ema50
                            ? "bg-[#2da8cf]"
                            : "bg-[#dce8ec]"
                        }`}
                      >
                        <span
                          className={`h-4 w-4 rounded-full bg-white shadow-sm transition ${
                            indicators.ema50
                              ? "translate-x-4"
                              : "translate-x-0"
                          }`}
                        />
                      </span>
                    </button>

                  </div>
                </div>
              )}
            </div>

            {/* ================================================= */}
            {/* DRAW */}
            {/* ================================================= */}

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowDrawingPanel(
                    (current) =>
                      !current
                  );

                  setShowIndicatorPanel(
                    false
                  );
                }}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  showDrawingPanel ||
                  activeDrawingTool !==
                    "none"
                    ? "border-[#2da8cf] bg-[#eaf8fc] text-[#258eaf]"
                    : "border-[#dceff5] bg-[#f8fcfd] text-[#66838d] hover:border-[#b9dfeb]"
                }`}
              >
                Draw
              </button>

              {showDrawingPanel && (
                <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-[#dceff5] bg-white shadow-xl">

                  <div className="border-b border-[#edf4f6] px-4 py-3">
                    <p className="text-sm font-bold text-[#173944]">
                      Drawing Tools
                    </p>

                    <p className="mt-1 text-xs text-[#8aa0a8]">
                      Draw directly over the
                      market chart.
                    </p>
                  </div>

                  <div className="p-2">

                    {/* Horizontal */}

                    <button
                      type="button"
                      onClick={
                        selectHorizontalTool
                      }
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                        activeDrawingTool ===
                        "horizontal"
                          ? "bg-[#eaf8fc] text-[#258eaf]"
                          : "text-[#173944] hover:bg-[#f5fafc]"
                      }`}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f1f8fa] text-[#2da8cf]">
                        ─
                      </span>

                      <div>
                        <p className="text-sm font-semibold">
                          Horizontal Line
                        </p>

                        <p className="text-[11px] text-[#8aa0a8]">
                          Support / resistance
                        </p>
                      </div>
                    </button>

                    {/* Trendline */}

                    <button
                      type="button"
                      onClick={
                        selectTrendlineTool
                      }
                      className={`mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                        activeDrawingTool ===
                        "trendline"
                          ? "bg-[#eaf8fc] text-[#258eaf]"
                          : "text-[#173944] hover:bg-[#f5fafc]"
                      }`}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f1f8fa] text-[#2da8cf]">
                        ↗
                      </span>

                      <div>
                        <p className="text-sm font-semibold">
                          Trend Line
                        </p>

                        <p className="text-[11px] text-[#8aa0a8]">
                          Connect two market points
                        </p>
                      </div>
                    </button>

                    {/* Fibonacci */}

                    <div className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 opacity-40">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f1f8fa] text-[#78919a]">
                        F
                      </span>

                      <div>
                        <p className="text-sm font-semibold text-[#173944]">
                          Fibonacci
                        </p>

                        <p className="text-[11px] text-[#8aa0a8]">
                          Coming later
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ================================================= */}
        {/* TIMEFRAMES */}
        {/* ================================================= */}

        <div className="mt-4 flex flex-wrap gap-2">
          {TIMEFRAMES.map(
            (item) => {
              const active =
                timeframe === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setTimeframe(item)
                  }
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "bg-[#2da8cf] text-white"
                      : "bg-[#f1f8fa] text-[#66838d] hover:bg-[#e7f4f8]"
                  }`}
                >
                  {item}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* ================================================= */}
      {/* CHART */}
      {/* ================================================= */}

      <div className="relative">

        {candles.length > 0 ? (
          <MarketChart
            candles={candles}
            indicators={indicators}
            activeDrawingTool={
              activeDrawingTool
            }
            drawings={drawings}
            onAddDrawing={
              addDrawing
            }
            onUpdateDrawing={
              updateDrawing
            }
            onDeleteDrawing={
              deleteDrawing
            }
            onChartScreenshot={
              onChartScreenshot
            }
          />
        ) : (
          <div className="flex h-[500px] items-center justify-center">

            {loading ? (
              <div className="text-sm text-[#78919a]">
                Loading market data...
              </div>
            ) : (
              <div className="text-sm text-[#78919a]">
                No market data available.
              </div>
            )}

          </div>
        )}

        {loading &&
          candles.length > 0 && (
            <div className="pointer-events-none absolute right-4 top-4 rounded-lg bg-white/90 px-3 py-2 text-xs font-medium text-[#78919a] shadow-sm">
              Updating...
            </div>
          )}
      </div>

      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (
        <div className="border-t border-[#edf4f6] bg-[#fff8f8] px-5 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ================================================= */}
      {/* SNACKBAR */}
      {/* ================================================= */}

      {snackbar && (
        <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-xl bg-[#173944] px-4 py-3 text-sm font-medium text-white shadow-xl">

            <span>
              {snackbar}
            </span>

            <button
              type="button"
              onClick={() => {
                setSnackbar(
                  null
                );

                setActiveDrawingTool(
                  "none"
                );
              }}
              className="text-white/70 transition hover:text-white"
              aria-label="Close"
            >
              ×
            </button>

          </div>
        </div>
      )}

    </section>
  );
}