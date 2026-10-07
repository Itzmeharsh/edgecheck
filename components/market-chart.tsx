"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import {
  createChart,
  CandlestickSeries,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type LineData,
  type Time,
} from "lightweight-charts";

import type { Drawing } from "./chart/drawings";
import DrawingActionBar from "./chart/drawing-action-bar";

type MarketChartProps = {
  candles: CandlestickData<Time>[];

  onChartScreenshot?: (
    screenshot: string
  ) => void;

  indicators?: {
    ema9?: boolean;
    ema21?: boolean;
    ema50?: boolean;
  };

  activeDrawingTool?:
    | "none"
    | "horizontal"
    | "trendline";

  drawings?: Drawing[];

  onAddDrawing?: (
    drawing: Drawing
  ) => void;

  onUpdateDrawing?: (
    drawing: Drawing
  ) => void;

  onDeleteDrawing?: (
    drawingId: string
  ) => void;
};

function calculateEMA(
  candles: CandlestickData<Time>[],
  period: number
): LineData<Time>[] {
  if (candles.length === 0) {
    return [];
  }

  const multiplier = 2 / (period + 1);

  let ema = candles[0].close;

  return candles.map((candle) => {
    ema =
      (candle.close - ema) * multiplier +
      ema;

    return {
      time: candle.time,
      value: ema,
    };
  });
}

export default function MarketChart({
  candles,
  onChartScreenshot,
  indicators = {
    ema9: true,
    ema21: true,
    ema50: true,
  },
  activeDrawingTool = "none",
  drawings = [],
  onAddDrawing,
  onUpdateDrawing,
  onDeleteDrawing,
}: MarketChartProps) {
  const containerRef =
    useRef<HTMLDivElement | null>(null);

  const chartRef =
    useRef<IChartApi | null>(null);

  const candleSeriesRef =
    useRef<ISeriesApi<"Candlestick"> | null>(
      null
    );

  const ema9Ref =
    useRef<ISeriesApi<"Line"> | null>(null);

  const ema21Ref =
    useRef<ISeriesApi<"Line"> | null>(null);

  const ema50Ref =
    useRef<ISeriesApi<"Line"> | null>(null);

  const trendlineStartRef =
    useRef<{
      time: Time;
      price: number;
    } | null>(null);

  const [
    trendlinePreview,
    setTrendlinePreview,
  ] = useState<{
    start: {
      time: Time;
      price: number;
    };
    end: {
      time: Time;
      price: number;
    };
  } | null>(null);

  const onAddDrawingRef =
    useRef(onAddDrawing);

  useEffect(() => {
    onAddDrawingRef.current =
      onAddDrawing;
  }, [onAddDrawing]);

  /*
   * =====================================================
   * SELECTION
   * =====================================================
   */

  const [
    selectedDrawingId,
    setSelectedDrawingId,
  ] = useState<string | null>(null);

  /*
   * Forces SVG redraw when chart viewport changes.
   */
  const [
    viewportVersion,
    setViewportVersion,
  ] = useState(0);

  /*
   * =====================================================
   * CREATE CHART
   * =====================================================
   */

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const container =
      containerRef.current;

    const chart = createChart(
      container,
      {
        width: container.clientWidth,
        height: 500,

        layout: {
          background: {
            color: "#ffffff",
          },

          textColor: "#64748b",
        },

        grid: {
          vertLines: {
            color: "#f1f5f9",
          },

          horzLines: {
            color: "#f1f5f9",
          },
        },

        crosshair: {
          mode: 0,

          vertLine: {
            color: "#111827",
            width: 1,
            style: 2,
            labelBackgroundColor:
              "#111827",
          },

          horzLine: {
            color: "#111827",
            width: 1,
            style: 2,
            labelBackgroundColor:
              "#111827",
          },
        },

        rightPriceScale: {
          borderColor: "#e2e8f0",
        },

        timeScale: {
          borderColor: "#e2e8f0",
          timeVisible: true,
          secondsVisible: false,
        },
      }
    );

    /*
     * Candles
     */

    const candleSeries =
      chart.addSeries(
        CandlestickSeries,
        {
          upColor: "#16a34a",
          downColor: "#ef4444",

          borderUpColor: "#16a34a",
          borderDownColor: "#ef4444",

          wickUpColor: "#16a34a",
          wickDownColor: "#ef4444",
        }
      );

    /*
     * EMA 9
     */

    const ema9 =
      chart.addSeries(
        LineSeries,
        {
          lineWidth: 2,
          color: "#2563eb",

          priceLineVisible: false,
          lastValueVisible: true,
        }
      );

    /*
     * EMA 21
     */

    const ema21 =
      chart.addSeries(
        LineSeries,
        {
          lineWidth: 2,
          color: "#f59e0b",

          priceLineVisible: false,
          lastValueVisible: true,
        }
      );

    /*
     * EMA 50
     */

    const ema50 =
      chart.addSeries(
        LineSeries,
        {
          lineWidth: 2,
          color: "#9333ea",

          priceLineVisible: false,
          lastValueVisible: true,
        }
      );

    chartRef.current = chart;

    candleSeriesRef.current =
      candleSeries;

    ema9Ref.current = ema9;
    ema21Ref.current = ema21;
    ema50Ref.current = ema50;

    /*
     * Viewport updates
     */

    const updateViewport = () => {
      setViewportVersion(
        (value) => value + 1
      );
    };

    chart
      .timeScale()
      .subscribeVisibleLogicalRangeChange(
        updateViewport
      );

    chart.subscribeCrosshairMove(
      updateViewport
    );

    /*
     * Resize
     */

    const resizeObserver =
      new ResizeObserver(() => {
        if (!containerRef.current) {
          return;
        }

        chart.applyOptions({
          width:
            containerRef.current
              .clientWidth,

          height:
            containerRef.current
              .clientHeight,
        });

        updateViewport();
      });

    resizeObserver.observe(container);

    /*
     * Cleanup
     */

    return () => {
      resizeObserver.disconnect();

      chart
        .timeScale()
        .unsubscribeVisibleLogicalRangeChange(
          updateViewport
        );

      chart.unsubscribeCrosshairMove(
        updateViewport
      );

      chart.remove();

      chartRef.current = null;

      candleSeriesRef.current = null;
      ema9Ref.current = null;
      ema21Ref.current = null;
      ema50Ref.current = null;
    };
  }, []);

  /*
   * =====================================================
   * UPDATE CANDLES + INDICATORS
   * =====================================================
   */

  useEffect(() => {
    if (!candleSeriesRef.current) {
      return;
    }

    candleSeriesRef.current.setData(
      candles
    );

    const ema9 =
      calculateEMA(candles, 9);

    const ema21 =
      calculateEMA(candles, 21);

    const ema50 =
      calculateEMA(candles, 50);

    if (indicators.ema9) {
      ema9Ref.current?.setData(
        ema9
      );
    } else {
      ema9Ref.current?.setData([]);
    }

    if (indicators.ema21) {
      ema21Ref.current?.setData(
        ema21
      );
    } else {
      ema21Ref.current?.setData([]);
    }

    if (indicators.ema50) {
      ema50Ref.current?.setData(
        ema50
      );
    } else {
      ema50Ref.current?.setData([]);
    }

    if (candles.length > 0) {
      const visibleCandles =
        Math.min(
          candles.length,
          100
        );

      chartRef.current
        ?.timeScale()
        .setVisibleLogicalRange({
          from:
            candles.length -
            visibleCandles,

          to:
            candles.length + 2,
        });
    }
  }, [
    candles,
    indicators,
  ]);

  /*
   * =====================================================
   * SCREENSHOT
   * =====================================================
   */

  useEffect(() => {
    if (!onChartScreenshot) {
      return;
    }

    if (!containerRef.current) {
      return;
    }

    if (candles.length === 0) {
      return;
    }

    const frame =
      requestAnimationFrame(() => {
        const canvas =
          containerRef.current?.querySelector(
            "canvas"
          );

        if (!canvas) {
          return;
        }

        try {
          const screenshot =
            canvas.toDataURL(
              "image/png"
            );

          onChartScreenshot(
            screenshot
          );
        } catch (error) {
          console.error(
            "Failed to capture chart screenshot:",
            error
          );
        }
      });

    return () =>
      cancelAnimationFrame(frame);
  }, [
    candles,
    indicators,
    onChartScreenshot,
  ]);

  /*
   * =====================================================
   * DRAWING CREATION
   * =====================================================
   */

  useEffect(() => {
    const container =
      containerRef.current;

    const chart =
      chartRef.current;

    const series =
      candleSeriesRef.current;

    if (
      !container ||
      !chart ||
      !series
    ) {
      return;
    }

    trendlineStartRef.current =
      null;

    setTrendlinePreview(null);

    if (
      activeDrawingTool !==
        "horizontal" &&
      activeDrawingTool !==
        "trendline"
    ) {
      container.style.cursor =
        "default";

      return;
    }

    container.style.cursor =
      "crosshair";

    function getChartPoint(
      event:
        | MouseEvent
        | PointerEvent
    ) {
      const rect =
        container!.getBoundingClientRect();

      const x =
        event.clientX -
        rect.left;

      const y =
        event.clientY -
        rect.top;

      const price =
        series!.coordinateToPrice(
          y
        );

      const time =
        chart!.timeScale()
          .coordinateToTime(x);

      if (
        price === null ||
        time === null
      ) {
        return null;
      }

      return {
        time,
        price,
      };
    }

    function handlePointerMove(
      event: PointerEvent
    ) {
      if (
        activeDrawingTool !==
        "trendline"
      ) {
        return;
      }

      const start =
        trendlineStartRef.current;

      if (!start) {
        return;
      }

      const point =
        getChartPoint(event);

      if (!point) {
        return;
      }

      setTrendlinePreview({
        start: {
          time: start.time,
          price: start.price,
        },

        end: {
          time: point.time,
          price: point.price,
        },
      });
    }

    function handleClick(
      event: MouseEvent
    ) {
      const point =
        getChartPoint(event);

      if (!point) {
        return;
      }

      /*
       * Horizontal line
       */

      if (
        activeDrawingTool ===
        "horizontal"
      ) {
        onAddDrawingRef.current?.({
          id: crypto.randomUUID(),

          type: "horizontal",

          price: point.price,
        });

        return;
      }

      /*
       * Trendline
       */

      if (
        activeDrawingTool ===
        "trendline"
      ) {
        if (
          trendlineStartRef.current ===
          null
        ) {
          trendlineStartRef.current = {
            time: point.time,
            price: point.price,
          };

          setTrendlinePreview({
            start: point,
            end: point,
          });

          return;
        }

        const start =
          trendlineStartRef.current;

        onAddDrawingRef.current?.({
          id: crypto.randomUUID(),

          type: "trendline",

          start: {
            time: Number(
              start.time
            ),

            price: start.price,
          },

          end: {
            time: Number(
              point.time
            ),

            price: point.price,
          },
        });

        trendlineStartRef.current =
          null;

        setTrendlinePreview(null);

        setViewportVersion(
          (value) => value + 1
        );
      }
    }

    container.addEventListener(
      "pointermove",
      handlePointerMove
    );

    container.addEventListener(
      "click",
      handleClick
    );

    return () => {
      container.removeEventListener(
        "pointermove",
        handlePointerMove
      );

      container.removeEventListener(
        "click",
        handleClick
      );

      container.style.cursor =
        "default";

      trendlineStartRef.current =
        null;

      setTrendlinePreview(null);
    };
  }, [
    activeDrawingTool,
  ]);

  /*
   * =====================================================
   * DRAWING FILTERS
   * =====================================================
   */

  const horizontalDrawings =
    drawings.filter(
      (
        drawing
      ): drawing is Extract<
        Drawing,
        {
          type: "horizontal";
        }
      > =>
        drawing.type ===
        "horizontal"
    );

  const trendlineDrawings =
    drawings.filter(
      (
        drawing
      ): drawing is Extract<
        Drawing,
        {
          type: "trendline";
        }
      > =>
        drawing.type ===
        "trendline"
    );

  /*
   * =====================================================
   * HORIZONTAL LINE DRAG
   * =====================================================
   */

  function startHorizontalDrag(
    drawing: Extract<
      Drawing,
      {
        type: "horizontal";
      }
    >,
    event: ReactPointerEvent<SVGLineElement>
  ) {
    if (!onUpdateDrawing) {
      return;
    }

    if (
      activeDrawingTool !==
      "none"
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    setSelectedDrawingId(
      drawing.id
    );

    const handleMove = (
      moveEvent: PointerEvent
    ) => {
      const container =
        containerRef.current;

      const series =
        candleSeriesRef.current;

      if (
        !container ||
        !series
      ) {
        return;
      }

      const rect =
        container.getBoundingClientRect();

      const y =
        moveEvent.clientY -
        rect.top;

      const price =
        series.coordinateToPrice(
          y
        );

      if (price === null) {
        return;
      }

      onUpdateDrawing({
        ...drawing,
        price,
      });

      setViewportVersion(
        (value) => value + 1
      );
    };

    const handleUp = () => {
      window.removeEventListener(
        "pointermove",
        handleMove
      );

      window.removeEventListener(
        "pointerup",
        handleUp
      );

      window.removeEventListener(
        "pointercancel",
        handleUp
      );
    };

    window.addEventListener(
      "pointermove",
      handleMove
    );

    window.addEventListener(
      "pointerup",
      handleUp
    );

    window.addEventListener(
      "pointercancel",
      handleUp
    );
  }

  /*
   * =====================================================
   * TRENDLINE ENDPOINT DRAG
   * =====================================================
   */

  function startTrendlineEndpointDrag(
    drawing: Extract<
      Drawing,
      {
        type: "trendline";
      }
    >,
    endpoint:
      | "start"
      | "end",
    event: ReactPointerEvent<SVGCircleElement>
  ) {
    if (!onUpdateDrawing) {
      return;
    }

    if (
      activeDrawingTool !==
      "none"
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    setSelectedDrawingId(
      drawing.id
    );

    try {
      event.currentTarget.setPointerCapture(
        event.pointerId
      );
    } catch {}

    const handleMove = (
      moveEvent: PointerEvent
    ) => {
      const container =
        containerRef.current;

      const chart =
        chartRef.current;

      const series =
        candleSeriesRef.current;

      if (
        !container ||
        !chart ||
        !series
      ) {
        return;
      }

      const rect =
        container.getBoundingClientRect();

      const x =
        moveEvent.clientX -
        rect.left;

      const y =
        moveEvent.clientY -
        rect.top;

      const time =
        chart.timeScale()
          .coordinateToTime(x);

      const price =
        series.coordinateToPrice(y);

      if (
        time === null ||
        price === null
      ) {
        return;
      }

      if (
        typeof time !==
        "number"
      ) {
        return;
      }

      onUpdateDrawing({
        ...drawing,

        [endpoint]: {
          time,
          price,
        },
      });

      setViewportVersion(
        (value) => value + 1
      );
    };

    const handleUp = () => {
      window.removeEventListener(
        "pointermove",
        handleMove
      );

      window.removeEventListener(
        "pointerup",
        handleUp
      );

      window.removeEventListener(
        "pointercancel",
        handleUp
      );

      try {
        event.currentTarget.releasePointerCapture(
          event.pointerId
        );
      } catch {}
    };

    window.addEventListener(
      "pointermove",
      handleMove
    );

    window.addEventListener(
      "pointerup",
      handleUp
    );

    window.addEventListener(
      "pointercancel",
      handleUp
    );
  }

  /*
   * =====================================================
   * MOVE ENTIRE TRENDLINE
   * =====================================================
   */

  function startTrendlineMove(
    drawing: Extract<
      Drawing,
      {
        type: "trendline";
      }
    >,
    event: ReactPointerEvent<SVGLineElement>
  ) {
    if (!onUpdateDrawing) {
      return;
    }

    if (
      activeDrawingTool !==
      "none"
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    setSelectedDrawingId(
      drawing.id
    );

    const container =
      containerRef.current;

    const chart =
      chartRef.current;

    const series =
      candleSeriesRef.current;

    if (
      !container ||
      !chart ||
      !series
    ) {
      return;
    }

    const rect =
      container.getBoundingClientRect();

    const initialX =
      event.clientX -
      rect.left;

    const initialY =
      event.clientY -
      rect.top;

    const startX =
      chart.timeScale()
        .timeToCoordinate(
          drawing.start.time as Time
        );

    const endX =
      chart.timeScale()
        .timeToCoordinate(
          drawing.end.time as Time
        );

    const startY =
      series.priceToCoordinate(
        drawing.start.price
      );

    const endY =
      series.priceToCoordinate(
        drawing.end.price
      );

    if (
      startX === null ||
      endX === null ||
      startY === null ||
      endY === null
    ) {
      return;
    }

    const handleMove = (
      moveEvent: PointerEvent
    ) => {
      const currentRect =
        container.getBoundingClientRect();

      const currentX =
        moveEvent.clientX -
        currentRect.left;

      const currentY =
        moveEvent.clientY -
        currentRect.top;

      const deltaX =
        currentX -
        initialX;

      const deltaY =
        currentY -
        initialY;

      const newStartX =
        startX + deltaX;

      const newEndX =
        endX + deltaX;

      const newStartY =
        startY + deltaY;

      const newEndY =
        endY + deltaY;

      const newStartTime =
        chart.timeScale()
          .coordinateToTime(
            newStartX
          );

      const newEndTime =
        chart.timeScale()
          .coordinateToTime(
            newEndX
          );

      const newStartPrice =
        series.coordinateToPrice(
          newStartY
        );

      const newEndPrice =
        series.coordinateToPrice(
          newEndY
        );

      if (
        newStartTime === null ||
        newEndTime === null ||
        newStartPrice === null ||
        newEndPrice === null
      ) {
        return;
      }

      if (
        typeof newStartTime !==
          "number" ||
        typeof newEndTime !==
          "number"
      ) {
        return;
      }

      onUpdateDrawing({
        ...drawing,

        start: {
          time: newStartTime,
          price: newStartPrice,
        },

        end: {
          time: newEndTime,
          price: newEndPrice,
        },
      });

      setViewportVersion(
        (value) => value + 1
      );
    };

    const handleUp = () => {
      window.removeEventListener(
        "pointermove",
        handleMove
      );

      window.removeEventListener(
        "pointerup",
        handleUp
      );

      window.removeEventListener(
        "pointercancel",
        handleUp
      );
    };

    window.addEventListener(
      "pointermove",
      handleMove
    );

    window.addEventListener(
      "pointerup",
      handleUp
    );

    window.addEventListener(
      "pointercancel",
      handleUp
    );
  }

  /*
   * =====================================================
   * SELECTED DRAWING
   * =====================================================
   */

  const selectedDrawing =
    drawings.find(
      (drawing) =>
        drawing.id ===
        selectedDrawingId
    );

  /*
   * =====================================================
   * ACTION BAR POSITION
   * =====================================================
   *
   * Recalculated every time:
   *
   * - drawing moves
   * - endpoint moves
   * - chart scrolls
   * - chart zooms
   * - selected drawing changes
   */

  const actionBarPosition =
    useMemo(() => {
      if (
        !selectedDrawing ||
        !chartRef.current ||
        !candleSeriesRef.current ||
        !containerRef.current
      ) {
        return null;
      }

      const chart =
        chartRef.current;

      const series =
        candleSeriesRef.current;

      const container =
        containerRef.current;

      if (
        selectedDrawing.type ===
        "horizontal"
      ) {
        const y =
          series.priceToCoordinate(
            selectedDrawing.price
          );

        if (y === null) {
          return null;
        }

        return {
          x:
            container.clientWidth / 2,

          y,
        };
      }

      const x1 =
        chart.timeScale()
          .timeToCoordinate(
            selectedDrawing.start
              .time as Time
          );

      const x2 =
        chart.timeScale()
          .timeToCoordinate(
            selectedDrawing.end
              .time as Time
          );

      const y1 =
        series.priceToCoordinate(
          selectedDrawing.start.price
        );

      const y2 =
        series.priceToCoordinate(
          selectedDrawing.end.price
        );

      if (
        x1 === null ||
        x2 === null ||
        y1 === null ||
        y2 === null
      ) {
        return null;
      }

      return {
        x: (x1 + x2) / 2,
        y: Math.min(y1, y2),
      };
    }, [
      selectedDrawing,
      viewportVersion,
    ]);

  /*
   * =====================================================
   * DESELECT
   * =====================================================
   */

  useEffect(() => {
    if (
      activeDrawingTool !==
      "none"
    ) {
      return;
    }

    const container =
      containerRef.current;

    if (!container) {
      return;
    }

    const handleChartClick = (
      event: MouseEvent
    ) => {
      const target =
        event.target as Element | null;

      if (
        target?.closest(
          "[data-drawing-hit='true'], [data-drawing-action-bar='true']"
        )
      ) {
        return;
      }

      setSelectedDrawingId(
        null
      );
    };

    container.addEventListener(
      "click",
      handleChartClick
    );

    return () => {
      container.removeEventListener(
        "click",
        handleChartClick
      );
    };
  }, [
    activeDrawingTool,
  ]);

  /*
   * =====================================================
   * RENDER
   * =====================================================
   */

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full ${
        activeDrawingTool !==
        "none"
          ? "cursor-crosshair"
          : "cursor-default"
      }`}
    >
      <svg
        className="pointer-events-none absolute inset-0 z-30 h-full w-full overflow-visible"
        width="100%"
        height="100%"
      >
        {/* ================================================= */}
        {/* TRENDLINE PREVIEW */}
        {/* ================================================= */}

        {trendlinePreview &&
          (() => {
            const chart =
              chartRef.current;

            const series =
              candleSeriesRef.current;

            if (
              !chart ||
              !series
            ) {
              return null;
            }

            const x1 =
              chart.timeScale()
                .timeToCoordinate(
                  trendlinePreview
                    .start.time
                );

            const x2 =
              chart.timeScale()
                .timeToCoordinate(
                  trendlinePreview
                    .end.time
                );

            const y1 =
              series.priceToCoordinate(
                trendlinePreview
                  .start.price
              );

            const y2 =
              series.priceToCoordinate(
                trendlinePreview
                  .end.price
              );

            if (
              x1 === null ||
              x2 === null ||
              y1 === null ||
              y2 === null
            ) {
              return null;
            }

            return (
              <g>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#2563eb"
                  strokeWidth="2"
                  strokeDasharray="6 5"
                  opacity="0.75"
                  style={{
                    pointerEvents:
                      "none",
                  }}
                />

                <circle
                  cx={x1}
                  cy={y1}
                  r="5"
                  fill="white"
                  stroke="#2563eb"
                  strokeWidth="2"
                  style={{
                    pointerEvents:
                      "none",
                  }}
                />
              </g>
            );
          })()}

        {/* ================================================= */}
        {/* HORIZONTAL LINES */}
        {/* ================================================= */}

        {horizontalDrawings.map(
          (drawing) => {
            const series =
              candleSeriesRef.current;

            if (!series) {
              return null;
            }

            const y =
              series.priceToCoordinate(
                drawing.price
              );

            if (y === null) {
              return null;
            }

            const selected =
              selectedDrawingId ===
              drawing.id;

            return (
              <g
                key={drawing.id}
              >
                <line
                  data-drawing-hit="true"
                  x1="0"
                  x2="100%"
                  y1={y}
                  y2={y}
                  stroke="transparent"
                  strokeWidth="16"
                  style={{
                    pointerEvents:
                      activeDrawingTool ===
                      "none"
                        ? "stroke"
                        : "none",

                    cursor:
                      "ns-resize",
                  }}
                  onPointerDown={(
                    event
                  ) => {
                    startHorizontalDrag(
                      drawing,
                      event
                    );
                  }}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    setSelectedDrawingId(
                      drawing.id
                    );
                  }}
                />

                <line
                  x1="0"
                  x2="100%"
                  y1={y}
                  y2={y}
                  stroke={
                    selected
                      ? "#111827"
                      : "#2da8cf"
                  }
                  strokeWidth={
                    selected
                      ? 3
                      : 2
                  }
                  strokeDasharray="6 5"
                  style={{
                    pointerEvents:
                      "none",
                  }}
                />

                <rect
                  x="calc(100% - 72px)"
                  y={y - 11}
                  width="68"
                  height="22"
                  rx="5"
                  fill={
                    selected
                      ? "#111827"
                      : "#2da8cf"
                  }
                  style={{
                    pointerEvents:
                      "none",
                  }}
                />

                <text
                  x="calc(100% - 38px)"
                  y={y + 4}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="600"
                  style={{
                    pointerEvents:
                      "none",
                  }}
                >
                  {drawing.price.toFixed(
                    2
                  )}
                </text>
              </g>
            );
          }
        )}

        {/* ================================================= */}
        {/* TRENDLINES */}
        {/* ================================================= */}

        {trendlineDrawings.map(
          (drawing) => {
            const chart =
              chartRef.current;

            const series =
              candleSeriesRef.current;

            if (
              !chart ||
              !series
            ) {
              return null;
            }

            const x1 =
              chart.timeScale()
                .timeToCoordinate(
                  drawing.start
                    .time as Time
                );

            const x2 =
              chart.timeScale()
                .timeToCoordinate(
                  drawing.end
                    .time as Time
                );

            const y1 =
              series.priceToCoordinate(
                drawing.start.price
              );

            const y2 =
              series.priceToCoordinate(
                drawing.end.price
              );

            if (
              x1 === null ||
              x2 === null ||
              y1 === null ||
              y2 === null
            ) {
              return null;
            }

            const selected =
              selectedDrawingId ===
              drawing.id;

            return (
              <g
                key={drawing.id}
              >
                {/* Hit area */}

                <line
                  data-drawing-hit="true"
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="transparent"
                  strokeWidth="18"
                  style={{
                    pointerEvents:
                      activeDrawingTool ===
                      "none"
                        ? "stroke"
                        : "none",

                    cursor:
                      selected
                        ? "move"
                        : "pointer",
                  }}
                  onPointerDown={(
                    event
                  ) => {
                    if (selected) {
                      startTrendlineMove(
                        drawing,
                        event
                      );

                      return;
                    }

                    event.preventDefault();
                    event.stopPropagation();

                    setSelectedDrawingId(
                      drawing.id
                    );
                  }}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    setSelectedDrawingId(
                      drawing.id
                    );
                  }}
                />

                {/* Visible line */}

                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={
                    selected
                      ? "#111827"
                      : "#2da8cf"
                  }
                  strokeWidth={
                    selected
                      ? 3
                      : 2
                  }
                  style={{
                    pointerEvents:
                      "none",
                  }}
                />

                {/* Start handle */}

                {selected && (
                  <circle
                    data-drawing-hit="true"
                    cx={x1}
                    cy={y1}
                    r="10"
                    fill="white"
                    stroke="#111827"
                    strokeWidth="2"
                    style={{
                      pointerEvents:
                        "all",

                      cursor:
                        "nwse-resize",

                      touchAction:
                        "none",
                    }}
                    onPointerDown={(
                      event
                    ) =>
                      startTrendlineEndpointDrag(
                        drawing,
                        "start",
                        event
                      )
                    }
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                  />
                )}

                {/* End handle */}

                {selected && (
                  <circle
                    data-drawing-hit="true"
                    cx={x2}
                    cy={y2}
                    r="10"
                    fill="white"
                    stroke="#111827"
                    strokeWidth="2"
                    style={{
                      pointerEvents:
                        "all",

                      cursor:
                        "nesw-resize",

                      touchAction:
                        "none",
                    }}
                    onPointerDown={(
                      event
                    ) =>
                      startTrendlineEndpointDrag(
                        drawing,
                        "end",
                        event
                      )
                    }
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                  />
                )}
              </g>
            );
          }
        )}
      </svg>

      {/* ================================================= */}
      {/* TRENDLINE INSTRUCTION */}
      {/* ================================================= */}

      {activeDrawingTool ===
        "trendline" &&
        trendlineStartRef.current && (
          <div className="pointer-events-none absolute left-3 top-3 z-40 rounded-lg bg-[#173944] px-3 py-2 text-xs font-medium text-white shadow-sm">
            Select the second point
          </div>
        )}

      {/* ================================================= */}
      {/* DRAWING ACTION BAR */}
      {/* ================================================= */}

      {selectedDrawing &&
        actionBarPosition && (
          <div
            data-drawing-action-bar="true"
            className="pointer-events-auto absolute z-[100]"
            style={{
              left:
                actionBarPosition.x,

              top: Math.max(
                12,
                actionBarPosition.y -
                  14
              ),

              transform:
                "translate(-50%, -100%)",
            }}
            onPointerDown={(
              event
            ) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
          >
            <DrawingActionBar
              onDelete={() => {
                onDeleteDrawing?.(
                  selectedDrawing.id
                );

                setSelectedDrawingId(
                  null
                );
              }}
            />
          </div>
        )}
    </div>
  );
}