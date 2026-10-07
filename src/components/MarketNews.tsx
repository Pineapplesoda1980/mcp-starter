import React from 'react';
import { NEWS_FEED } from '../data/marketData';
import { Newspaper, ExternalLink, TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface MarketNewsProps {
  onSelectSymbol: (symbol: string) => void;
}

export const MarketNews: React.FC<MarketNewsProps> = ({ onSelectSymbol }) => {
  return (
    <div className="w-full rounded-xl border border-[#2a2e39] bg-[#1e222d] p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-[#2a2e39] mb-4">
        <div className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-[#2962ff]" />
          <h3 className="text-lg font-bold text-white tracking-tight">Market News & Insights</h3>
        </div>
        <span className="text-xs text-[#787b86]">Updated in real-time</span>
      </div>

      <div className="divide-y divide-[#2a2e39]/60">
        {NEWS_FEED.map((article) => {
          return (
            <article key={article.id} className="py-3.5 first:pt-0 last:pb-0 group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs text-[#787b86] mb-1">
                    <span className="font-semibold text-[#d1d4dc]">{article.source}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {article.timeAgo}
                    </span>
                    <span>·</span>
                    <span>{article.category}</span>
                  </div>

                  <h4 className="text-sm font-semibold text-white group-hover:text-[#2962ff] transition-colors leading-snug">
                    {article.headline}
                  </h4>

                  <p className="mt-1 text-xs text-[#787b86] line-clamp-2 leading-relaxed">
                    {article.summary}
                  </p>

                  <div className="mt-2.5 flex items-center gap-2">
                    {article.relatedSymbols.map((sym) => (
                      <button
                        key={sym}
                        onClick={() => onSelectSymbol(sym)}
                        className="rounded bg-[#131722] px-2 py-0.5 text-[11px] font-mono font-bold text-[#2962ff] hover:bg-[#2962ff] hover:text-white transition-colors"
                      >
                        ${sym}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
