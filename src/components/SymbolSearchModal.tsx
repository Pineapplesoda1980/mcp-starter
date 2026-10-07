import React, { useState, useEffect, useRef } from 'react';
import { MarketAsset } from '../types/market';
import { Search, X, TrendingUp, TrendingDown } from 'lucide-react';

interface SymbolSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
}

export const SymbolSearchModal: React.FC<SymbolSearchModalProps> = ({
  isOpen,
  onClose,
  assets,
  onSelectAsset,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        onSelectAsset(filtered[selectedIndex]);
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!isOpen) return null;

  const filtered = query.trim()
    ? assets.filter(
        (a) =>
          a.symbol.toLowerCase().includes(query.toLowerCase()) ||
          a.name.toLowerCase().includes(query.toLowerCase()) ||
          a.category.toLowerCase().includes(query.toLowerCase())
      )
    : assets.slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl overflow-hidden rounded-xl border border-[#2a2e39] bg-[#1e222d] shadow-2xl">
        {/* Input bar */}
        <div className="flex items-center border-b border-[#2a2e39] px-4 py-3 bg-[#181c27]">
          <Search className="h-4 w-4 text-[#787b86] mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search markets, stocks, crypto, currencies..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-sm text-white placeholder-[#787b86] focus:outline-none"
          />
          <button onClick={onClose} className="rounded p-1 text-[#787b86] hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto divide-y divide-[#2a2e39]/50 p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#787b86]">
              No instruments found for "{query}"
            </div>
          ) : (
            filtered.map((asset, idx) => {
              const isSelected = idx === selectedIndex;
              const isUp = asset.changePercent >= 0;

              return (
                <div
                  key={asset.id}
                  onClick={() => {
                    onSelectAsset(asset);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#2962ff]/15 border-l-2 border-[#2962ff]' : 'hover:bg-[#242938]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded text-xs font-bold text-white shadow-sm"
                      style={{ backgroundColor: asset.logoColor || '#2962ff' }}
                    >
                      {asset.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{asset.symbol}</span>
                        <span className="rounded bg-[#2a2e39] px-1.5 py-0.2 text-[9px] font-semibold text-[#787b86] uppercase">
                          {asset.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#787b86] truncate max-w-xs">{asset.name}</div>
                    </div>
                  </div>

                  <div className="text-right font-mono tabular-nums">
                    <div className="text-xs font-semibold text-white">
                      {asset.price.toLocaleString(undefined, {
                        minimumFractionDigits: asset.category === 'forex' ? 4 : asset.category === 'bonds' ? 3 : 2,
                        maximumFractionDigits: asset.category === 'forex' ? 4 : asset.category === 'bonds' ? 3 : 2,
                      })}
                    </div>
                    <div
                      className={`text-[10px] font-medium flex items-center justify-end gap-0.5 ${
                        isUp ? 'text-[#089981]' : 'text-[#f23645]'
                      }`}
                    >
                      {isUp ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                      {isUp ? '+' : ''}
                      {asset.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-[#2a2e39] px-4 py-2 bg-[#161a25] text-[10px] text-[#787b86]">
          <div className="flex items-center gap-2">
            <span>Use <kbd className="rounded border border-[#363a45] px-1 py-0.5">↑</kbd> <kbd className="rounded border border-[#363a45] px-1 py-0.5">↓</kbd> to navigate</span>
            <span>·</span>
            <span><kbd className="rounded border border-[#363a45] px-1 py-0.5">Enter</kbd> to select</span>
          </div>
          <span><kbd className="rounded border border-[#363a45] px-1 py-0.5">Esc</kbd> to close</span>
        </div>
      </div>
    </div>
  );
};
