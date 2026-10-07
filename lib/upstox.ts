const UPSTOX_BASE_URL = "https://api.upstox.com";

export const MARKET_INDICES = {
  nifty: {
    name: "NIFTY 50",
    shortName: "NIFTY",
    instrumentKey: "NSE_INDEX|Nifty 50",
  },

  niftyBank: {
    name: "NIFTY BANK",
    shortName: "BANKNIFTY",
    instrumentKey: "NSE_INDEX|Nifty Bank",
  },

  sensex: {
    name: "SENSEX",
    shortName: "SENSEX",
    instrumentKey: "BSE_INDEX|SENSEX",
  },

  niftyFinService: {
    name: "NIFTY FIN SERVICE",
    shortName: "FINNIFTY",
    instrumentKey: "NSE_INDEX|Nifty Fin Service",
  },

  niftyMidSelect: {
    name: "NIFTY MID SELECT",
    shortName: "MIDCPNIFTY",
    instrumentKey: "NSE_INDEX|NIFTY MID SELECT",
  },

  indiaVix: {
    name: "INDIA VIX",
    shortName: "VIX",
    instrumentKey: "NSE_INDEX|India VIX",
  },
} as const;

export type MarketIndex = keyof typeof MARKET_INDICES;

export type UpstoxCandle = [
  string,
  number,
  number,
  number,
  number,
  number,
  number
];

export async function getUpstoxCandles(
  instrumentKey: string,
  interval: "5" | "15" | "60" | "1d"
) {
  const token = process.env.UPSTOX_ANALYTICS_TOKEN;

  if (
    !token ||
    token === "paste_your_analytics_token_here"
  ) {
    throw new Error(
      "UPSTOX_ANALYTICS_TOKEN is not configured."
    );
  }

  let unit: string;
  let intervalValue: string;

  if (interval === "5") {
    unit = "minutes";
    intervalValue = "5";
  } else if (interval === "15") {
    unit = "minutes";
    intervalValue = "15";
  } else if (interval === "60") {
    unit = "hours";
    intervalValue = "1";
  } else {
    unit = "days";
    intervalValue = "1";
  }

  const today = new Date();

  const toDate = today.toISOString().slice(0, 10);

  const from = new Date(today);
  from.setDate(from.getDate() - 30);

  const fromDate = from.toISOString().slice(0, 10);

  const url =
    `${UPSTOX_BASE_URL}/v3/historical-candle/` +
    `${encodeURIComponent(instrumentKey)}/` +
    `${unit}/` +
    `${intervalValue}/` +
    `${toDate}/` +
    `${fromDate}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Upstox API error ${response.status}: ${errorText}`
    );
  }

  const json = await response.json();

  return json.data?.candles as UpstoxCandle[];
}