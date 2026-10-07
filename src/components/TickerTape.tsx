import React, { useEffect, useState } from 'react';
import { MarketAsset } from '../types/market';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TickerTapeProps {
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
}

export const TickerTape: React.FC<TickerTapeProps> = ({ assets, onSelectAsset }) => {
  // Simulate live price micro-fluctuations on random items
  const [tickerPrices, setTickerPrices] = useState<Record<string, { price: number; change: number; flash: 'up' | 'down' | null }>>({});

  useEffect(() => {
    // Initialize prices
    const initialMap: Record<string, { price: number; change: number; flash: 'up' | 'down' | null }> = {};
    assets.forEach((a) => {
      initialMap[a.symbol] = { price: a.price, change: a.changePercent, flash: null };
    });
    setTickerPrices(initialMap);

    const interval = setInterval(() => {
      // Pick a random asset to update
      const randomIndex = Math.floor(Math.random() * assets.length);
      const target = assets[randomIndex];
      if (!target) return;

      const deltaPercent = (Math.random() - 0.49) * 0.15;
      const isUp = deltaPercent >= 0;

      setTickerPrices((prev) => {
        const current = prev[target.symbol] || { price: target.price, change: target.changePercent, flash: null };
        const newPrice = Number((current.price * (1 + deltaPercent / 100)).toFixed(target.category === 'forex' ? 4 : target.category === 'bonds' ? 3 : 2));
        const newChange = Number((current.change + deltaPercent * 0.5).toFixed(2));

        return {
          ...prev,
          [target.symbol]: {
            price: newPrice,
            change: newChange,
            flash: isUp ? 'up' : 'down'
          }
        };
      });

      // Clear flash after 800ms
      setTimeout(() => {
        setTickerPrices((prev) => {
          if (!prev[target.symbol]) return prev;
          return {
            ...prev,
            [target.symbol]: {
              ...prev[target.symbol],
              flash: null
            }
          };
        });
      }, 800);
    }, 2800);

    return () => clearInterval(interval);
  }, [assets]);

  // Duplicate the list so it scrolls seamlessly or can be scrolled horizontally
  const displayItems = [...assets, ...assets];

  return (
    <div className="relative w-full border-b border-[#2a2e39] bg-[#161a25] text-xs">
      <div className="flex w-full items-center overflow-x-auto no-scrollbar py-2 px-4 divide-x divide-[#2a2e39]/60">
        {displayItems.map((asset, idx) => {
          const current = tickerPrices[asset.symbol] || { price: asset.price, change: asset.changePercent, flash: null };
          const isUp = current.change >= 0;

          return (
            <button
              key={`${asset.symbol}-${idx}`}
              onClick={() => onSelectAsset(asset)}
              className={`flex shrink-0 items-center gap-2.5 px-4 transition-colors hover:bg-[#202533] text-left cursor-pointer ${
                current.flash === 'up'
                  ? 'bg-[#089981]/15 text-[#089981]'
                  : current.flash === 'down'
                  ? 'bg-[#f23645]/15 text-[#f23645]'
                  : ''
              }`}
            >
              <span className="font-semibold text-white tracking-wide">{asset.symbol}</span>
              <span className="font-mono tabular-nums text-[#d1d4dc]">
                {current.price.toLocaleString(undefined, {
                  minimumFractionDigits: asset.category === 'forex' ? 4 : asset.category === 'bonds' ? 3 : 2,
                  maximumFractionDigits: asset.category === 'forex' ? 4 : asset.category === 'bonds' ? 3 : 2,
                })}
              </span>
              <span
                className={`flex items-center gap-0.5 font-mono tabular-nums text-[11px] font-medium ${
                  isUp ? 'text-[#089981]' : 'text-[#f23645]'
                }`}
              >
                {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {isUp ? '+' : ''}
                {current.change.toFixed(2)}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
