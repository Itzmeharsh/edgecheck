export type DrawingType =
  | "horizontal"
  | "trendline";

export type ChartPoint = {
  time: number;
  price: number;
};

export type HorizontalDrawing = {
  id: string;
  type: "horizontal";
  price: number;
};

export type TrendlineDrawing = {
  id: string;
  type: "trendline";
  start: ChartPoint;
  end: ChartPoint;
};

export type Drawing =
  | HorizontalDrawing
  | TrendlineDrawing;