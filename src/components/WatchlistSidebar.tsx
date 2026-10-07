import React, { useState } from 'react';
import { MarketAsset } from '../types/market';
import { X, Trash2, Plus, TrendingUp, TrendingDown, Star } from 'lucide-react';

interface WatchlistSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  watchlistIds: string[];
  allAssets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  onRemoveFromWatchlist: (id: string) => void;
  onAddToWatchlist: (id: string) => void;
}

export const WatchlistSidebar: React.FC<WatchlistSidebarProps> = ({
  isOpen,
  onClose,
  watchlistIds,
  allAssets,
  onSelectAsset,
  onRemoveFromWatchlist,
  onAddToWatchlist,
}) => {
  const [addSearch, setAddSearch] = useState('');
  const [showAddDropdown, setShowAddDropdown] = useState(false);

  if (!isOpen) return null;

  const savedAssets = allAssets.filter((a) => watchlistIds.includes(a.id));

  const availableToAdd = addSearch.trim()
    ? allAssets.filter(
        (a) =>
          !watchlistIds.includes(a.id) &&
          (a.symbol.toLowerCase().includes(addSearch.toLowerCase()) ||
            a.name.toLowerCase().includes(addSearch.toLowerCase()))
      )
    : [];

  return (
    <aside className="fixed inset-y-0 right-0 z-50 flex w-80 flex-col border-l border-[#2a2e39] bg-[#1e222d] shadow-2xl animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="flex items-center justify-between border-b border-[#2a2e39] px-4 py-3 bg-[#181c27]">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 fill-[#f59e0b] text-[#f59e0b]" />
          <h3 className="text-sm font-bold text-white">Watchlist</h3>
          <span className="rounded-full bg-[#2a2e39] px-2 py-0.5 text-[10px] font-mono text-[#d1d4dc]">
            {savedAssets.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-[#787b86] hover:bg-[#2a2e39] hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Add Symbol Input */}
      <div className="p-3 border-b border-[#2a2e39] relative">
        <div className="flex items-center gap-1.5 rounded-lg border border-[#2a2e39] bg-[#131722] px-2.5 py-1 text-xs">
          <Plus className="h-3.5 w-3.5 text-[#787b86]" />
          <input
            type="text"
            placeholder="Add symbol to list..."
            value={addSearch}
            onChange={(e) => {
              setAddSearch(e.target.value);
              setShowAddDropdown(true);
            }}
            onFocus={() => setShowAddDropdown(true)}
            className="w-full bg-transparent text-white placeholder-[#787b86] focus:outline-none"
          />
        </div>

        {/* Search Results Dropdown */}
        {showAddDropdown && availableToAdd.length > 0 && (
          <div className="absolute left-3 right-3 top-12 z-20 max-h-48 overflow-y-auto rounded-lg border border-[#2a2e39] bg-[#161a25] shadow-lg divide-y divide-[#2a2e39]">
            {availableToAdd.slice(0, 6).map((asset) => (
              <button
                key={asset.id}
                onClick={() => {
                  onAddToWatchlist(asset.id);
                  setAddSearch('');
                  setShowAddDropdown(false);
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-[#202533]"
              >
                <div>
                  <div className="font-bold text-white text-xs">{asset.symbol}</div>
                  <div className="text-[10px] text-[#787b86] truncate max-w-[140px]">{asset.name}</div>
                </div>
                <div className="font-mono text-xs text-white">${asset.price.toFixed(2)}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#2a2e39]/50">
        {savedAssets.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#787b86]">
            No symbols in your watchlist. Star assets in the table or search above to add them!
          </div>
        ) : (
          savedAssets.map((asset) => {
            const isUp = asset.changePercent >= 0;
            return (
              <div
                key={asset.id}
                onClick={() => onSelectAsset(asset)}
                className="group flex items-center justify-between px-4 py-2.5 hover:bg-[#242938] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-[10px] font-bold text-white"
                    style={{ backgroundColor: asset.logoColor || '#2962ff' }}
                  >
                    {asset.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs group-hover:text-[#2962ff] transition-colors">
                      {asset.symbol}
                    </div>
                    <div className="text-[10px] text-[#787b86] truncate max-w-[85px]">{asset.name}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
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

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFromWatchlist(asset.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 rounded p-1 text-[#787b86] hover:text-[#f23645] transition-opacity"
                    title="Remove from Watchlist"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
