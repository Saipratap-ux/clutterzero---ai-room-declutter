import React from 'react';
import { FourBoxSorting } from '../types/declutter';
import { Check, CheckCircle2, Home, ArrowRightLeft, Gift, Trash2 } from 'lucide-react';

interface FourBoxMatrixProps {
  sorting: FourBoxSorting;
  onToggleItem: (category: 'keep' | 'relocate' | 'donateSell' | 'discardRecycle', index: number) => void;
}

export const FourBoxMatrix: React.FC<FourBoxMatrixProps> = ({ sorting, onToggleItem }) => {
  const countCategory = (items: { completed?: boolean }[]) => {
    const done = items.filter((i) => i.completed).length;
    return { done, total: items.length };
  };

  const keepStats = countCategory(sorting.keep);
  const relocateStats = countCategory(sorting.relocate);
  const donateStats = countCategory(sorting.donateSell);
  const discardStats = countCategory(sorting.discardRecycle);

  const totalAll = keepStats.total + relocateStats.total + donateStats.total + discardStats.total;
  const doneAll = keepStats.done + relocateStats.done + donateStats.done + discardStats.done;
  const progressPct = totalAll > 0 ? Math.round((doneAll / totalAll) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Overview & Progress Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">The 4-Box Sorting Matrix</h3>
            <p className="text-xs text-slate-500">
              Pick up items one by one and allocate them into one of these 4 dedicated physical bins or staging areas.
            </p>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-center">
            <span className="text-xs font-mono font-bold text-slate-700 tabular-nums">
              {doneAll} / {totalAll} items sorted ({progressPct}%)
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* 4 Quadrants / Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* BOX 1: KEEP */}
        <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-emerald-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                <Home className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">1. Keep & Reposition</h4>
                <span className="text-[11px] text-emerald-800 font-medium">Belongs in this room</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-100/70 px-2 py-0.5 rounded-md">
              {keepStats.done}/{keepStats.total}
            </span>
          </div>

          <div className="space-y-2.5 flex-1">
            {sorting.keep.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No specific keepers tagged.</p>
            ) : (
              sorting.keep.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onToggleItem('keep', idx)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    item.completed
                      ? 'bg-emerald-100/40 border-emerald-300 opacity-70'
                      : 'bg-white border-slate-200 hover:border-emerald-300 shadow-2xs'
                  }`}
                >
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                      item.completed
                        ? 'bg-emerald-700 border-emerald-700 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-bold text-slate-900 leading-snug ${
                        item.completed ? 'line-through text-slate-500' : ''
                      }`}
                    >
                      {item.item}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      {item.recommendation}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* BOX 2: RELOCATE */}
        <div className="bg-sky-50/40 border border-sky-200/80 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-sky-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-700 text-white flex items-center justify-center shadow-xs">
                <ArrowRightLeft className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">2. Relocate to Other Rooms</h4>
                <span className="text-[11px] text-sky-800 font-medium">Wrong room drop-offs</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-sky-900 bg-sky-100/70 px-2 py-0.5 rounded-md">
              {relocateStats.done}/{relocateStats.total}
            </span>
          </div>

          <div className="space-y-2.5 flex-1">
            {sorting.relocate.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No relocated items tagged.</p>
            ) : (
              sorting.relocate.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onToggleItem('relocate', idx)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    item.completed
                      ? 'bg-sky-100/40 border-sky-300 opacity-70'
                      : 'bg-white border-slate-200 hover:border-sky-300 shadow-2xs'
                  }`}
                >
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                      item.completed
                        ? 'bg-sky-700 border-sky-700 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-xs font-bold text-slate-900 leading-snug ${
                          item.completed ? 'line-through text-slate-500' : ''
                        }`}
                      >
                        {item.item}
                      </p>
                      <span className="text-[10px] font-semibold text-sky-800 bg-sky-100 px-2 py-0.5 rounded shrink-0">
                        → {item.targetRoom}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      {item.note}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* BOX 3: DONATE / SELL */}
        <div className="bg-amber-50/40 border border-amber-200/80 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-amber-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-700 text-white flex items-center justify-center shadow-xs">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">3. Donate or Resell</h4>
                <span className="text-[11px] text-amber-800 font-medium">Usable but unneeded</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded-md">
              {donateStats.done}/{donateStats.total}
            </span>
          </div>

          <div className="space-y-2.5 flex-1">
            {sorting.donateSell.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No donate items identified.</p>
            ) : (
              sorting.donateSell.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onToggleItem('donateSell', idx)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    item.completed
                      ? 'bg-amber-100/40 border-amber-300 opacity-70'
                      : 'bg-white border-slate-200 hover:border-amber-300 shadow-2xs'
                  }`}
                >
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                      item.completed
                        ? 'bg-amber-700 border-amber-700 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-bold text-slate-900 leading-snug ${
                        item.completed ? 'line-through text-slate-500' : ''
                      }`}
                    >
                      {item.item}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      {item.note}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* BOX 4: DISCARD & RECYCLE */}
        <div className="bg-rose-50/30 border border-rose-200/80 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-rose-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-700 text-white flex items-center justify-center shadow-xs">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">4. Discard & Recycle</h4>
                <span className="text-[11px] text-rose-800 font-medium">Scrap, trash, expired</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-rose-900 bg-rose-100/70 px-2 py-0.5 rounded-md">
              {discardStats.done}/{discardStats.total}
            </span>
          </div>

          <div className="space-y-2.5 flex-1">
            {sorting.discardRecycle.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No obvious trash detected.</p>
            ) : (
              sorting.discardRecycle.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onToggleItem('discardRecycle', idx)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    item.completed
                      ? 'bg-rose-100/40 border-rose-300 opacity-70'
                      : 'bg-white border-slate-200 hover:border-rose-300 shadow-2xs'
                  }`}
                >
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                      item.completed
                        ? 'bg-rose-700 border-rose-700 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-bold text-slate-900 leading-snug ${
                        item.completed ? 'line-through text-slate-500' : ''
                      }`}
                    >
                      {item.item}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      {item.note}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
