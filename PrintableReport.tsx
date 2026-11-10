import React from 'react';
import { RoomAnalysisResult } from './declutter';
import { Printer, X, Sparkles, CheckSquare } from 'lucide-react';

interface PrintableReportProps {
  room: RoomAnalysisResult;
  onClose: () => void;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({ room, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-8 shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="no-print px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">Printable Room Action Sheet</span>
            <span className="text-xs text-slate-500">· Ready for PDF or physical clipboard</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-900">
          {/* Document Header */}
          <div className="flex items-start justify-between border-b pb-4 border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold tracking-widest text-emerald-800 uppercase">
                  ClutterZero Decluttering Action Sheet
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900">{room.roomName}</h1>
              <p className="text-xs text-slate-500 mt-1">
                Room Type: {room.roomType} · Strategy: {room.strategy} · Generated:{' '}
                {new Date(room.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-500">Clutter Severity</div>
              <div className="text-xl font-bold font-mono text-emerald-700 tabular-nums">
                {room.clutterScore}/100 ({room.clutterLevel})
              </div>
              <div className="text-xs text-slate-500">⏱️ Est: {room.estimatedSortTimeMinutes} mins</div>
            </div>
          </div>

          {/* Photo and Executive Summary */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-5 rounded-xl overflow-hidden border border-slate-200">
              <img
                src={room.imageUrl}
                alt={room.roomName}
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="md:col-span-7 space-y-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Spatial Diagnostic
                </h3>
                <p className="text-xs leading-relaxed text-slate-700">{room.summary}</p>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Primary Clutter Drivers
                </h3>
                <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                  {room.primaryIssues.map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* The 4-Box Sorting Checklist */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 border-b pb-2 mb-3 border-slate-200">
              The 4-Box Sorting Triage
            </h2>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/20">
                <h4 className="font-bold text-emerald-900 mb-2">1. Keep & Reposition</h4>
                <div className="space-y-1.5">
                  {room.fourBoxSorting.keep.map((k, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-3.5 h-3.5 border border-slate-400 rounded-xs shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-800">{k.item}</span>
                        <span className="text-slate-500 text-[11px] block">{k.recommendation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg border border-sky-200 bg-sky-50/20">
                <h4 className="font-bold text-sky-900 mb-2">2. Relocate to Other Rooms</h4>
                <div className="space-y-1.5">
                  {room.fourBoxSorting.relocate.map((r, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-3.5 h-3.5 border border-slate-400 rounded-xs shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-800">{r.item}</span>
                        <span className="text-sky-700 text-[11px] block font-medium">
                          → {r.targetRoom} ({r.note})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/20">
                <h4 className="font-bold text-amber-900 mb-2">3. Donate or Resell</h4>
                <div className="space-y-1.5">
                  {room.fourBoxSorting.donateSell.map((d, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-3.5 h-3.5 border border-slate-400 rounded-xs shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-800">{d.item}</span>
                        <span className="text-slate-500 text-[11px] block">{d.note}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/20">
                <h4 className="font-bold text-rose-900 mb-2">4. Discard & Recycle</h4>
                <div className="space-y-1.5">
                  {room.fourBoxSorting.discardRecycle.map((x, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-3.5 h-3.5 border border-slate-400 rounded-xs shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-800">{x.item}</span>
                        <span className="text-slate-500 text-[11px] block">{x.note}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Phased Action Checklist */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 border-b pb-2 mb-3 border-slate-200">
              Phased Execution Steps
            </h2>
            <div className="space-y-3 text-xs">
              <div>
                <h4 className="font-bold text-slate-800 mb-1.5">Phase 1: Quick Wins (5-10 mins)</h4>
                <div className="space-y-1">
                  {room.phasedActionPlan.phase1QuickWins.map((t) => (
                    <div key={t.id} className="flex items-start gap-2">
                      <span className="w-3.5 h-3.5 border border-slate-400 rounded-xs shrink-0 mt-0.5" />
                      <span>
                        <strong>{t.title}:</strong> {t.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-1.5">Phase 2: Category Sorting</h4>
                <div className="space-y-1">
                  {room.phasedActionPlan.phase2Sorting.map((t) => (
                    <div key={t.id} className="flex items-start gap-2">
                      <span className="w-3.5 h-3.5 border border-slate-400 rounded-xs shrink-0 mt-0.5" />
                      <span>
                        <strong>{t.title}:</strong> {t.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-1.5">
                  Phase 3: Spatial Zoning & Storage Systems
                </h4>
                <div className="space-y-1">
                  {room.phasedActionPlan.phase3ZoningStorage.map((t) => (
                    <div key={t.id} className="flex items-start gap-2">
                      <span className="w-3.5 h-3.5 border border-slate-400 rounded-xs shrink-0 mt-0.5" />
                      <span>
                        <strong>{t.title}:</strong> {t.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-1.5">Phase 4: Maintenance Ritual</h4>
                <div className="space-y-1">
                  {room.phasedActionPlan.phase4MaintenanceRitual.map((t) => (
                    <div key={t.id} className="flex items-start gap-2">
                      <span className="w-3.5 h-3.5 border border-slate-400 rounded-xs shrink-0 mt-0.5" />
                      <span>
                        <strong>{t.title}:</strong> {t.description} ({t.frequency})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
