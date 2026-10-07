export type MarketCategory = 'all' | 'indices' | 'stocks' | 'crypto' | 'forex' | 'commodities' | 'bonds';

export type ScreenerFilter = 'all' | 'gainers' | 'losers' | 'active' | 'large_cap' | 'high_52w';

export type Timeframe = '1D' | '5D' | '1M' | '6M' | '1Y' | '5Y' | 'ALL';

export type TechnicalRating = 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell';

export interface MarketAsset {
  id: string;
  symbol: string;
  name: string;
  category: 'indices' | 'stocks' | 'crypto' | 'forex' | 'commodities' | 'bonds';
  sector?: string;
  price: number;
  change: number;
  changePercent: number;
  prevClose: number;
  open: number;
  high: number;
  low: number;
  volume: string;
  avgVolume?: string;
  marketCap?: string;
  marketCapNum?: number; // In billions USD for heatmap layout
  peRatio?: number | null;
  eps?: number;
  divYield?: string;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  technicalRating: TechnicalRating;
  oscillatorsRating?: TechnicalRating;
  movingAveragesRating?: TechnicalRating;
  sparkline: number[];
  country?: string;
  exchange: string;
  currency: string;
  logoColor?: string;
  description?: string;
}

export interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface NewsArticle {
  id: string;
  headline: string;
  source: string;
  timeAgo: string;
  category: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  relatedSymbols: string[];
  summary: string;
}

export interface EconomicEvent {
  id: string;
  time: string;
  country: string;
  flag: string;
  event: string;
  impact: 'high' | 'medium' | 'low';
  actual: string;
  forecast: string;
  previous: string;
}
