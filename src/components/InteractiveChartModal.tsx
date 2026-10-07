import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MarketAsset, Timeframe, CandleData, TechnicalRating } from '../types/market';
import { generateCandles } from '../data/marketData';
import {
  X,
  Star,
  TrendingUp,
  TrendingDown,
  BarChart2,
  LineChart as LineChartIcon,
  Maximize2,
  Share2,
  Sliders,
  Compass,
} from 'lucide-react';

interface InteractiveChartModalProps {
  asset: MarketAsset;
  onClose: () => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (id: string) => void;
}

export const InteractiveChartModal: React.FC<InteractiveChartModalProps> = ({
  asset,
  onClose,
  isWatchlisted,
  onToggleWatchlist,
}) => {
  const [chartType, setChartType] = useState<'candles' | 'line'>('candles');
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [showSMA, setShowSMA] = useState(true);
  const [showEMA, setShowEMA] = useState(false);
  const [showVolume, setShowVolume] = useState(true);
  const [activeTab, setActiveTab] = useState<'chart' | 'technical' | 'financials' | 'orderbook'>('chart');

  // Generate candle data dynamically based on timeframe
  const candleSeries = useMemo(() => {
    return generateCandles(asset, timeframe);
  }, [asset, timeframe]);

  // Mouse hover crosshair state
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Keyboard shortcut Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Calculate chart boundaries
  const prices = candleSeries.map((c) => [c.high, c.low]).flat();
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  // Max volume for volume bars
  const maxVolume = Math.max(...candleSeries.map((c) => c.volume));

  // Current active display candle (default to latest)
  const activeCandle = hoverIndex !== null && candleSeries[hoverIndex]
    ? candleSeries[hoverIndex]
    : candleSeries[candleSeries.length - 1];

  const isUp = asset.changePercent >= 0;

  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = 360;
  const chartHeight = showVolume ? 280 : 340;
  const volumeHeight = 70;
  const paddingX = 16;
  const paddingY = 20;

  // 52-week position calculation
  const range52 = asset.fiftyTwoWeekHigh - asset.fiftyTwoWeekLow || 1;
  const pos52 = Math.min(100, Math.max(0, ((asset.price - asset.fiftyTwoWeekLow) / range52) * 100));

  // Day range position
  const dayRange = asset.high - asset.low || 1;
  const posDay = Math.min(100, Math.max(0, ((asset.price - asset.low) / dayRange) * 100));

  // Technical Speedometer Gauge angles (-90deg to +90deg)
  const getGaugeAngle = (rating: TechnicalRating) => {
    switch (rating) {
      case 'Strong Sell':
        return -72;
      case 'Sell':
        return -36;
      case 'Neutral':
        return 0;
      case 'Buy':
        return 36;
      case 'Strong Buy':
        return 72;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="flex h-[94vh] max-h-[880px] w-full max-w-6xl flex-col rounded-xl border border-[#2a2e39] bg-[#1e222d] shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-[#2a2e39] px-5 py-3 bg-[#181c27] gap-3">
          {/* Symbol Info */}
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white shadow-md"
              style={{ backgroundColor: asset.logoColor || '#2962ff' }}
            >
              {asset.symbol.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">{asset.symbol}</h2>
                <span className="text-xs text-[#787b86]">· {asset.exchange}:{asset.symbol}</span>
                <span className="rounded bg-[#2a2e39] px-1.5 py-0.5 text-[10px] font-medium text-[#d1d4dc] uppercase">
                  {asset.category}
                </span>
              </div>
              <p className="text-xs text-[#787b86] truncate max-w-md">{asset.name}</p>
            </div>
          </div>

          {/* Current Live Price */}
          <div className="flex items-center gap-4">
            <div className="text-right font-mono tabular-nums">
              <div className="text-xl font-bold text-white">
                {asset.price.toLocaleString(undefined, {
                  minimumFractionDigits: asset.category === 'forex' ? 4 : asset.category === 'bonds' ? 3 : 2,
                  maximumFractionDigits: asset.category === 'forex' ? 4 : asset.category === 'bonds' ? 3 : 2,
                })}
                {asset.currency === '%' ? '%' : ` ${asset.currency}`}
              </div>
              <div
                className={`flex items-center justify-end gap-1 text-xs font-semibold ${
                  isUp ? 'text-[#089981]' : 'text-[#f23645]'
                }`}
              >
                {isUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                <span>
                  {isUp ? '+' : ''}
                  {asset.change.toFixed(asset.category === 'forex' ? 4 : 2)} ({isUp ? '+' : ''}
                  {asset.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 border-l border-[#2a2e39] pl-3">
              <button
                onClick={() => onToggleWatchlist(asset.id)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  isWatchlisted
                    ? 'border-[#f59e0b] bg-[#f59e0b]/10 text-[#f59e0b]'
                    : 'border-[#2a2e39] bg-[#1e222d] text-[#787b86] hover:text-white'
                }`}
              >
                <Star className={`h-3.5 w-3.5 ${isWatchlisted ? 'fill-[#f59e0b]' : ''}`} />
                <span>{isWatchlisted ? 'Watchlisted' : 'Add to Watchlist'}</span>
              </button>

              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-[#787b86] hover:bg-[#2a2e39] hover:text-white transition-colors"
                title="Close (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* View mode tabs */}
        <div className="flex items-center justify-between border-b border-[#2a2e39] px-5 py-2 bg-[#161a25] text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('chart')}
              className={`px-3 py-1 font-semibold rounded transition-colors ${
                activeTab === 'chart'
                  ? 'bg-[#2962ff] text-white'
                  : 'text-[#787b86] hover:text-[#d1d4dc]'
              }`}
            >
              Interactive Chart
            </button>
            <button
              onClick={() => setActiveTab('technical')}
              className={`px-3 py-1 font-semibold rounded transition-colors ${
                activeTab === 'technical'
                  ? 'bg-[#2962ff] text-white'
                  : 'text-[#787b86] hover:text-[#d1d4dc]'
              }`}
            >
              Technicals & Gauges
            </button>
            <button
              onClick={() => setActiveTab('financials')}
              className={`px-3 py-1 font-semibold rounded transition-colors ${
                activeTab === 'financials'
                  ? 'bg-[#2962ff] text-white'
                  : 'text-[#787b86] hover:text-[#d1d4dc]'
              }`}
            >
              Key Statistics
            </button>
            <button
              onClick={() => setActiveTab('orderbook')}
              className={`px-3 py-1 font-semibold rounded transition-colors ${
                activeTab === 'orderbook'
                  ? 'bg-[#2962ff] text-white'
                  : 'text-[#787b86] hover:text-[#d1d4dc]'
              }`}
            >
              Market Depth
            </button>
          </div>

          <div className="text-[11px] text-[#787b86]">
            Real-time feed provided by TradingView Markets Cloud
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'chart' && (
            <div className="flex flex-col h-full gap-4">
              {/* Chart Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#131722] p-2 border border-[#2a2e39]">
                {/* Timeframes */}
                <div className="flex items-center gap-1">
                  {(['1D', '5D', '1M', '6M', '1Y', 'ALL'] as Timeframe[]).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                        timeframe === tf
                          ? 'bg-[#2a2e39] text-white shadow-sm'
                          : 'text-[#787b86] hover:text-[#d1d4dc]'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>

                {/* Chart Style Toggle */}
                <div className="flex items-center gap-1 border-l border-[#2a2e39] pl-2">
                  <button
                    onClick={() => setChartType('candles')}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                      chartType === 'candles' ? 'bg-[#2a2e39] text-[#2962ff]' : 'text-[#787b86] hover:text-white'
                    }`}
                    title="Candlestick Chart"
                  >
                    <BarChart2 className="h-3.5 w-3.5" />
                    <span>Candles</span>
                  </button>
                  <button
                    onClick={() => setChartType('line')}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                      chartType === 'line' ? 'bg-[#2a2e39] text-[#2962ff]' : 'text-[#787b86] hover:text-white'
                    }`}
                    title="Line Chart"
                  >
                    <LineChartIcon className="h-3.5 w-3.5" />
                    <span>Line</span>
                  </button>
                </div>

                {/* Indicators Toggles */}
                <div className="flex items-center gap-2 border-l border-[#2a2e39] pl-2 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer text-[#787b86] hover:text-white">
                    <input
                      type="checkbox"
                      checked={showSMA}
                      onChange={(e) => setShowSMA(e.target.checked)}
                      className="rounded border-[#363a45] text-[#f59e0b] focus:ring-0"
                    />
                    <span className="text-[#f59e0b] font-medium">SMA 20</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[#787b86] hover:text-white">
                    <input
                      type="checkbox"
                      checked={showEMA}
                      onChange={(e) => setShowEMA(e.target.checked)}
                      className="rounded border-[#363a45] text-[#3b82f6] focus:ring-0"
                    />
                    <span className="text-[#3b82f6] font-medium">EMA 50</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[#787b86] hover:text-white">
                    <input
                      type="checkbox"
                      checked={showVolume}
                      onChange={(e) => setShowVolume(e.target.checked)}
                      className="rounded border-[#363a45] text-[#787b86] focus:ring-0"
                    />
                    <span>Volume</span>
                  </label>
                </div>

                {/* OHLC Bar */}
                {activeCandle && (
                  <div className="flex items-center gap-3 font-mono text-[11px] tabular-nums text-[#787b86]">
                    <span>T: <strong className="text-white">{activeCandle.time}</strong></span>
                    <span>O: <strong className="text-white">{activeCandle.open}</strong></span>
                    <span>H: <strong className="text-white">{activeCandle.high}</strong></span>
                    <span>L: <strong className="text-white">{activeCandle.low}</strong></span>
                    <span>C: <strong className="text-white">{activeCandle.close}</strong></span>
                    {showVolume && <span>V: <strong className="text-white">{activeCandle.volume.toLocaleString()}</strong></span>}
                  </div>
                )}
              </div>

              {/* Chart SVG Canvas */}
              <div className="relative w-full rounded-lg bg-[#131722] p-2 border border-[#2a2e39] select-none flex-1 min-h-[360px]">
                {/* Horizontal price guide grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none p-4 opacity-15">
                  <div className="border-b border-dashed border-[#787b86] w-full" />
                  <div className="border-b border-dashed border-[#787b86] w-full" />
                  <div className="border-b border-dashed border-[#787b86] w-full" />
                  <div className="border-b border-dashed border-[#787b86] w-full" />
                </div>

                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                  onMouseLeave={() => setHoverIndex(null)}
                >
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2962ff" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#2962ff" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Volume Bars at Bottom */}
                  {showVolume &&
                    candleSeries.map((c, idx) => {
                      const colWidth = (svgWidth - paddingX * 2) / candleSeries.length;
                      const x = paddingX + idx * colWidth;
                      const barH = (c.volume / maxVolume) * volumeHeight;
                      const y = svgHeight - barH;
                      const isCandleUp = c.close >= c.open;
                      return (
                        <rect
                          key={`vol-${idx}`}
                          x={x + colWidth * 0.15}
                          y={y}
                          width={colWidth * 0.7}
                          height={barH}
                          fill={isCandleUp ? 'rgba(8, 153, 129, 0.25)' : 'rgba(242, 54, 69, 0.25)'}
                        />
                      );
                    })}

                  {/* Candlesticks Mode */}
                  {chartType === 'candles' &&
                    candleSeries.map((c, idx) => {
                      const colWidth = (svgWidth - paddingX * 2) / candleSeries.length;
                      const x = paddingX + idx * colWidth;
                      const candleW = Math.max(3, colWidth * 0.65);
                      const isCandleUp = c.close >= c.open;
                      const color = isCandleUp ? '#089981' : '#f23645';

                      // Scaled Y coords
                      const yHigh = paddingY + (1 - (c.high - minPrice) / priceRange) * (chartHeight - paddingY * 2);
                      const yLow = paddingY + (1 - (c.low - minPrice) / priceRange) * (chartHeight - paddingY * 2);
                      const yOpen = paddingY + (1 - (c.open - minPrice) / priceRange) * (chartHeight - paddingY * 2);
                      const yClose = paddingY + (1 - (c.close - minPrice) / priceRange) * (chartHeight - paddingY * 2);

                      const bodyY = Math.min(yOpen, yClose);
                      const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));

                      return (
                        <g key={`candle-${idx}`}>
                          {/* Upper/Lower Wick Line */}
                          <line
                            x1={x + colWidth / 2}
                            y1={yHigh}
                            x2={x + colWidth / 2}
                            y2={yLow}
                            stroke={color}
                            strokeWidth="1.25"
                          />
                          {/* Candle Body */}
                          <rect
                            x={x + (colWidth - candleW) / 2}
                            y={bodyY}
                            width={candleW}
                            height={bodyHeight}
                            fill={color}
                            rx="1"
                          />
                        </g>
                      );
                    })}

                  {/* Line Chart Mode */}
                  {chartType === 'line' && (
                    <>
                      {/* Area Fill */}
                      <path
                        d={(() => {
                          const colWidth = (svgWidth - paddingX * 2) / candleSeries.length;
                          const points = candleSeries.map((c, idx) => {
                            const x = paddingX + idx * colWidth + colWidth / 2;
                            const y = paddingY + (1 - (c.close - minPrice) / priceRange) * (chartHeight - paddingY * 2);
                            return `${x},${y}`;
                          });
                          const firstX = paddingX + colWidth / 2;
                          const lastX = paddingX + (candleSeries.length - 1) * colWidth + colWidth / 2;
                          return `M ${firstX} ${chartHeight} L ${points.join(' L ')} L ${lastX} ${chartHeight} Z`;
                        })()}
                        fill="url(#chartGradient)"
                      />
                      {/* Stroke */}
                      <path
                        d={(() => {
                          const colWidth = (svgWidth - paddingX * 2) / candleSeries.length;
                          const points = candleSeries.map((c, idx) => {
                            const x = paddingX + idx * colWidth + colWidth / 2;
                            const y = paddingY + (1 - (c.close - minPrice) / priceRange) * (chartHeight - paddingY * 2);
                            return `${x},${y}`;
                          });
                          return `M ${points.join(' L ')}`;
                        })()}
                        fill="none"
                        stroke="#2962ff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  )}

                  {/* SMA 20 Overlay Line */}
                  {showSMA && (
                    <path
                      d={(() => {
                        const colWidth = (svgWidth - paddingX * 2) / candleSeries.length;
                        const points: string[] = [];
                        for (let i = 4; i < candleSeries.length; i++) {
                          const slice = candleSeries.slice(Math.max(0, i - 10), i + 1);
                          const avg = slice.reduce((acc, curr) => acc + curr.close, 0) / slice.length;
                          const x = paddingX + i * colWidth + colWidth / 2;
                          const y = paddingY + (1 - (avg - minPrice) / priceRange) * (chartHeight - paddingY * 2);
                          points.push(`${x},${y}`);
                        }
                        return `M ${points.join(' L ')}`;
                      })()}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                      strokeDasharray="4 2"
                    />
                  )}

                  {/* EMA 50 Overlay Line */}
                  {showEMA && (
                    <path
                      d={(() => {
                        const colWidth = (svgWidth - paddingX * 2) / candleSeries.length;
                        const points: string[] = [];
                        let ema = candleSeries[0].close;
                        const k = 2 / (20 + 1);
                        candleSeries.forEach((c, i) => {
                          ema = c.close * k + ema * (1 - k);
                          const x = paddingX + i * colWidth + colWidth / 2;
                          const y = paddingY + (1 - (ema - minPrice) / priceRange) * (chartHeight - paddingY * 2);
                          points.push(`${x},${y}`);
                        });
                        return `M ${points.join(' L ')}`;
                      })()}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="1.5"
                    />
                  )}

                  {/* Interactive Crosshair & Tracking Hover */}
                  {hoverIndex !== null && candleSeries[hoverIndex] && (
                    <>
                      {/* Vertical tracker */}
                      <line
                        x1={paddingX + hoverIndex * ((svgWidth - paddingX * 2) / candleSeries.length) + ((svgWidth - paddingX * 2) / candleSeries.length) / 2}
                        y1={0}
                        x2={paddingX + hoverIndex * ((svgWidth - paddingX * 2) / candleSeries.length) + ((svgWidth - paddingX * 2) / candleSeries.length) / 2}
                        y2={svgHeight}
                        stroke="#787b86"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                      />
                      {/* Horizontal tracker */}
                      <line
                        x1={0}
                        y1={paddingY + (1 - (candleSeries[hoverIndex].close - minPrice) / priceRange) * (chartHeight - paddingY * 2)}
                        x2={svgWidth}
                        y2={paddingY + (1 - (candleSeries[hoverIndex].close - minPrice) / priceRange) * (chartHeight - paddingY * 2)}
                        stroke="#787b86"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                      />
                    </>
                  )}

                  {/* Invisible hit targets across candles */}
                  {candleSeries.map((_, idx) => {
                    const colWidth = (svgWidth - paddingX * 2) / candleSeries.length;
                    const x = paddingX + idx * colWidth;
                    return (
                      <rect
                        key={`hit-${idx}`}
                        x={x}
                        y={0}
                        width={colWidth}
                        height={svgHeight}
                        fill="transparent"
                        onMouseEnter={() => setHoverIndex(idx)}
                      />
                    );
                  })}
                </svg>

                {/* Y-Axis Price Labels */}
                <div className="absolute right-2 top-4 bottom-12 flex flex-col justify-between font-mono text-[10px] tabular-nums text-[#787b86] pointer-events-none text-right">
                  <span>{maxPrice.toFixed(2)}</span>
                  <span>{((maxPrice + minPrice) / 2).toFixed(2)}</span>
                  <span>{minPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Technicals & Gauges Tab */}
          {activeTab === 'technical' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Summary Speedometer */}
              <div className="flex flex-col items-center justify-between rounded-xl border border-[#2a2e39] bg-[#161a25] p-5 text-center">
                <div>
                  <span className="text-xs font-semibold text-[#787b86] uppercase tracking-wider">
                    Summary Rating
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">{asset.technicalRating}</h3>
                </div>

                {/* Speedometer SVG Gauge */}
                <div className="relative my-4 h-36 w-64 flex items-center justify-center">
                  <svg viewBox="0 0 200 110" className="w-full h-full">
                    {/* Background Arc */}
                    <path
                      d="M 20 100 A 80 80 0 0 1 180 100"
                      fill="none"
                      stroke="#2a2e39"
                      strokeWidth="16"
                      strokeLinecap="round"
                    />
                    {/* Colored Segment Arc */}
                    <path
                      d="M 20 100 A 80 80 0 0 1 60 40"
                      fill="none"
                      stroke="#f23645"
                      strokeWidth="16"
                    />
                    <path
                      d="M 60 40 A 80 80 0 0 1 100 20"
                      fill="none"
                      stroke="#d97706"
                      strokeWidth="16"
                    />
                    <path
                      d="M 100 20 A 80 80 0 0 1 140 40"
                      fill="none"
                      stroke="#787b86"
                      strokeWidth="16"
                    />
                    <path
                      d="M 140 40 A 80 80 0 0 1 180 100"
                      fill="none"
                      stroke="#089981"
                      strokeWidth="16"
                    />

                    {/* Needle */}
                    <g transform={`rotate(${getGaugeAngle(asset.technicalRating)}, 100, 100)`}>
                      <line
                        x1="100"
                        y1="100"
                        x2="100"
                        y2="30"
                        stroke="#ffffff"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <circle cx="100" cy="100" r="6" fill="#ffffff" />
                    </g>
                  </svg>
                </div>

                <div className="flex w-full justify-between text-[11px] font-medium text-[#787b86]">
                  <span className="text-[#f23645]">Strong Sell</span>
                  <span>Neutral</span>
                  <span className="text-[#089981]">Strong Buy</span>
                </div>
              </div>

              {/* Oscillators breakdown */}
              <div className="rounded-xl border border-[#2a2e39] bg-[#161a25] p-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#2a2e39]">
                  <span className="text-xs font-semibold text-[#787b86] uppercase tracking-wider">
                    Oscillators
                  </span>
                  <span className="text-xs font-bold text-[#0da088]">{asset.oscillatorsRating || 'Neutral'}</span>
                </div>
                <div className="mt-3 space-y-2.5 font-mono text-xs tabular-nums">
                  <div className="flex justify-between py-1 border-b border-[#2a2e39]/50">
                    <span className="text-[#787b86]">Relative Strength Index (14)</span>
                    <span className="text-white font-semibold">58.42 (Neutral)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#2a2e39]/50">
                    <span className="text-[#787b86]">Stochastic %K (14, 3, 3)</span>
                    <span className="text-[#089981] font-semibold">74.10 (Buy)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#2a2e39]/50">
                    <span className="text-[#787b86]">Commodity Channel Index (20)</span>
                    <span className="text-white font-semibold">62.30 (Neutral)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#2a2e39]/50">
                    <span className="text-[#787b86]">Awesome Oscillator</span>
                    <span className="text-[#089981] font-semibold">+1.84 (Buy)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#787b86]">MACD Level (12, 26)</span>
                    <span className="text-[#089981] font-semibold">+2.15 (Buy)</span>
                  </div>
                </div>
              </div>

              {/* Moving Averages breakdown */}
              <div className="rounded-xl border border-[#2a2e39] bg-[#161a25] p-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#2a2e39]">
                  <span className="text-xs font-semibold text-[#787b86] uppercase tracking-wider">
                    Moving Averages
                  </span>
                  <span className="text-xs font-bold text-[#089981]">{asset.movingAveragesRating || 'Strong Buy'}</span>
                </div>
                <div className="mt-3 space-y-2.5 font-mono text-xs tabular-nums">
                  <div className="flex justify-between py-1 border-b border-[#2a2e39]/50">
                    <span className="text-[#787b86]">Exponential MA (20)</span>
                    <span className="text-[#089981] font-semibold">Buy</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#2a2e39]/50">
                    <span className="text-[#787b86]">Simple MA (50)</span>
                    <span className="text-[#089981] font-semibold">Buy</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#2a2e39]/50">
                    <span className="text-[#787b86]">Exponential MA (100)</span>
                    <span className="text-[#089981] font-semibold">Buy</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#2a2e39]/50">
                    <span className="text-[#787b86]">Simple MA (200)</span>
                    <span className="text-[#089981] font-semibold">Buy</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#787b86]">Ichimoku Base Line</span>
                    <span className="text-white font-semibold">Neutral</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Key Statistics / Financials Tab */}
          {activeTab === 'financials' && (
            <div className="space-y-5">
              {/* Range Meters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Day Range */}
                <div className="rounded-xl border border-[#2a2e39] bg-[#161a25] p-4">
                  <div className="flex items-center justify-between text-xs text-[#787b86] mb-2 font-mono tabular-nums">
                    <span>Day's Range</span>
                    <span>High: {asset.high.toFixed(2)}</span>
                  </div>
                  <div className="relative h-2 w-full rounded-full bg-[#2a2e39]">
                    <div
                      className="absolute top-0 bottom-0 rounded-full bg-[#2962ff]"
                      style={{ width: `${posDay}%` }}
                    />
                    <div
                      className="absolute top-1/2 -mt-1.5 h-3 w-3 -ml-1.5 rounded-full bg-white shadow-md ring-2 ring-[#2962ff]"
                      style={{ left: `${posDay}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between font-mono text-[11px] tabular-nums text-[#787b86]">
                    <span>Low: {asset.low.toFixed(2)}</span>
                    <span className="text-white font-semibold">Current: {asset.price.toFixed(2)}</span>
                  </div>
                </div>

                {/* 52-Week Range */}
                <div className="rounded-xl border border-[#2a2e39] bg-[#161a25] p-4">
                  <div className="flex items-center justify-between text-xs text-[#787b86] mb-2 font-mono tabular-nums">
                    <span>52-Week Range</span>
                    <span>High: {asset.fiftyTwoWeekHigh.toFixed(2)}</span>
                  </div>
                  <div className="relative h-2 w-full rounded-full bg-[#2a2e39]">
                    <div
                      className="absolute top-0 bottom-0 rounded-full bg-[#089981]"
                      style={{ width: `${pos52}%` }}
                    />
                    <div
                      className="absolute top-1/2 -mt-1.5 h-3 w-3 -ml-1.5 rounded-full bg-white shadow-md ring-2 ring-[#089981]"
                      style={{ left: `${pos52}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between font-mono text-[11px] tabular-nums text-[#787b86]">
                    <span>Low: {asset.fiftyTwoWeekLow.toFixed(2)}</span>
                    <span className="text-white font-semibold">Current: {asset.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Fundamental Metrics Table */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                <div className="rounded-lg border border-[#2a2e39] bg-[#161a25] p-3">
                  <div className="text-[11px] text-[#787b86]">Market Capitalization</div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">{asset.marketCap || 'N/A'}</div>
                </div>
                <div className="rounded-lg border border-[#2a2e39] bg-[#161a25] p-3">
                  <div className="text-[11px] text-[#787b86]">Price-to-Earnings (P/E)</div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">{asset.peRatio ? asset.peRatio.toFixed(1) : 'N/A'}</div>
                </div>
                <div className="rounded-lg border border-[#2a2e39] bg-[#161a25] p-3">
                  <div className="text-[11px] text-[#787b86]">Earnings Per Share (EPS)</div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">{asset.eps ? `$${asset.eps.toFixed(2)}` : 'N/A'}</div>
                </div>
                <div className="rounded-lg border border-[#2a2e39] bg-[#161a25] p-3">
                  <div className="text-[11px] text-[#787b86]">Dividend Yield</div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">{asset.divYield || '0.00%'}</div>
                </div>
                <div className="rounded-lg border border-[#2a2e39] bg-[#161a25] p-3">
                  <div className="text-[11px] text-[#787b86]">24h Trading Volume</div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">{asset.volume}</div>
                </div>
                <div className="rounded-lg border border-[#2a2e39] bg-[#161a25] p-3">
                  <div className="text-[11px] text-[#787b86]">Primary Exchange</div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">{asset.exchange}</div>
                </div>
                <div className="rounded-lg border border-[#2a2e39] bg-[#161a25] p-3">
                  <div className="text-[11px] text-[#787b86]">Market Sector</div>
                  <div className="text-base font-bold text-white font-mono mt-0.5 truncate">{asset.sector || 'Broad Market'}</div>
                </div>
                <div className="rounded-lg border border-[#2a2e39] bg-[#161a25] p-3">
                  <div className="text-[11px] text-[#787b86]">Country / Region</div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">{asset.country || 'Global'}</div>
                </div>
              </div>

              {/* Description */}
              {asset.description && (
                <div className="rounded-xl border border-[#2a2e39] bg-[#161a25] p-4 text-xs leading-relaxed text-[#d1d4dc]">
                  <h4 className="font-bold text-white mb-1">About {asset.name}</h4>
                  <p>{asset.description}</p>
                </div>
              )}
            </div>
          )}

          {/* Market Depth / Order Book Tab */}
          {activeTab === 'orderbook' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bids */}
              <div className="rounded-xl border border-[#2a2e39] bg-[#161a25] p-4">
                <div className="flex justify-between text-xs font-semibold text-[#089981] pb-2 border-b border-[#2a2e39]">
                  <span>Bid Orders</span>
                  <span>Size</span>
                  <span>Total</span>
                </div>
                <div className="mt-2 space-y-1 font-mono text-xs tabular-nums">
                  {[
                    { price: asset.price * 0.999, size: '1,420', depth: 85 },
                    { price: asset.price * 0.998, size: '2,890', depth: 72 },
                    { price: asset.price * 0.997, size: '3,100', depth: 65 },
                    { price: asset.price * 0.996, size: '5,420', depth: 52 },
                    { price: asset.price * 0.995, size: '8,900', depth: 40 },
                    { price: asset.price * 0.994, size: '12,500', depth: 25 },
                  ].map((row, idx) => (
                    <div key={idx} className="relative flex justify-between py-1 px-1 rounded overflow-hidden">
                      <div
                        className="absolute right-0 top-0 bottom-0 bg-[#089981]/15 pointer-events-none rounded"
                        style={{ width: `${row.depth}%` }}
                      />
                      <span className="text-[#089981] font-semibold relative z-10">{row.price.toFixed(2)}</span>
                      <span className="text-[#d1d4dc] relative z-10">{row.size}</span>
                      <span className="text-[#787b86] relative z-10">${(row.price * 2.5).toFixed(0)}K</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Asks */}
              <div className="rounded-xl border border-[#2a2e39] bg-[#161a25] p-4">
                <div className="flex justify-between text-xs font-semibold text-[#f23645] pb-2 border-b border-[#2a2e39]">
                  <span>Ask Orders</span>
                  <span>Size</span>
                  <span>Total</span>
                </div>
                <div className="mt-2 space-y-1 font-mono text-xs tabular-nums">
                  {[
                    { price: asset.price * 1.001, size: '1,120', depth: 80 },
                    { price: asset.price * 1.002, size: '2,400', depth: 68 },
                    { price: asset.price * 1.003, size: '4,150', depth: 55 },
                    { price: asset.price * 1.004, size: '6,200', depth: 44 },
                    { price: asset.price * 1.005, size: '9,850', depth: 32 },
                    { price: asset.price * 1.006, size: '14,200', depth: 18 },
                  ].map((row, idx) => (
                    <div key={idx} className="relative flex justify-between py-1 px-1 rounded overflow-hidden">
                      <div
                        className="absolute right-0 top-0 bottom-0 bg-[#f23645]/15 pointer-events-none rounded"
                        style={{ width: `${row.depth}%` }}
                      />
                      <span className="text-[#f23645] font-semibold relative z-10">{row.price.toFixed(2)}</span>
                      <span className="text-[#d1d4dc] relative z-10">{row.size}</span>
                      <span className="text-[#787b86] relative z-10">${(row.price * 2.5).toFixed(0)}K</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
