import React, { useState } from 'react';
import { RoomAnalysisResult, PhasedActionPlan } from './declutter';
import { RoomPhotoAnnotator } from './RoomPhotoAnnotator';
import { FourBoxMatrix } from './FourBoxMatrix';
import { ActionChecklist } from './ActionChecklist';
import { StorageRecommendations } from './StorageRecommendations';
import { OrganizerChat } from './OrganizerChat';
import {
  Sparkles,
  Clock,
  Layers,
  CheckSquare,
  Box,
  MessageSquare,
  Printer,
  Share2,
  Copy,
  Check,
  AlertTriangle,
  Flame,
} from 'lucide-react';

interface RoomStudioProps {
  room: RoomAnalysisResult;
  onUpdateRoom: (updated: RoomAnalysisResult) => void;
  onPrintReport: () => void;
}

export const RoomStudio: React.FC<RoomStudioProps> = ({ room, onUpdateRoom, onPrintReport }) => {
  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'checklist' | 'storage' | 'chat'>('checklist');
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Toggle four-box item
  const handleToggleFourBox = (
    category: 'keep' | 'relocate' | 'donateSell' | 'discardRecycle',
    index: number
  ) => {
    const updated = { ...room };
    const list = [...(updated.fourBoxSorting[category] as any[])];
    if (list[index]) {
      list[index] = { ...list[index], completed: !list[index].completed };
      updated.fourBoxSorting = {
        ...updated.fourBoxSorting,
        [category]: list,
      };
      onUpdateRoom(updated);
    }
  };

  // Toggle checklist task
  const handleToggleTask = (phase: keyof PhasedActionPlan, taskId: string) => {
    const updated = { ...room };
    const taskList = [...(updated.phasedActionPlan[phase] || [])];
    const targetIdx = taskList.findIndex((t) => t.id === taskId);
    if (targetIdx !== -1) {
      taskList[targetIdx] = {
        ...taskList[targetIdx],
        completed: !taskList[targetIdx].completed,
      };
      updated.phasedActionPlan = {
        ...updated.phasedActionPlan,
        [phase]: taskList,
      };
      onUpdateRoom(updated);
    }
  };

  const copySummaryToClipboard = () => {
    const text = `ClutterZero Decluttering Summary for: ${room.roomName}
Clutter Level: ${room.clutterScore}/100 (${room.clutterLevel})
Estimated Sort Time: ~${room.estimatedSortTimeMinutes} mins

Key Issues:
${room.primaryIssues.map((i) => `• ${i}`).join('\n')}

Phase 1 Quick Wins:
${room.phasedActionPlan.phase1QuickWins.map((t) => `[ ] ${t.title}: ${t.description}`).join('\n')}

Storage Ideas:
${room.storageSolutions.map((s) => `• ${s.name} (${s.placement})`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSeverityBadge = (level: string) => {
    switch (level) {
      case 'Severe':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'High':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Moderate':
        return 'bg-amber-50 text-amber-900 border-amber-200/60';
      default:
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Studio Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5 text-xs">
            <span className="font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md">
              {room.roomType}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-600 font-medium">Strategy: {room.strategy.replace('_', ' ')}</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500 font-mono">
              Created {new Date(room.createdAt).toLocaleDateString()}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {room.roomName}
          </h1>
        </div>

        {/* Metrics & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-slate-50 border-slate-200">
            <Flame className="w-4 h-4 text-amber-600" />
            <div className="text-xs">
              <span className="text-slate-500 font-medium">Clutter Index: </span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {room.clutterScore}/100
              </span>
            </div>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getSeverityBadge(
                room.clutterLevel
              )}`}
            >
              {room.clutterLevel}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-slate-50 border-slate-200 text-xs">
            <Clock className="w-4 h-4 text-emerald-700" />
            <span className="text-slate-500">Est. Sort: </span>
            <span className="font-mono font-bold text-slate-900 tabular-nums">
              ~{room.estimatedSortTimeMinutes}m
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={copySummaryToClipboard}
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              title="Copy plain-text checklist"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={onPrintReport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Sheet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Split: Annotated Photo Viewport (Left) + Spatial Diagnostic (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Annotated Room Photo */}
        <div className="lg:col-span-7">
          <RoomPhotoAnnotator
            imageUrl={room.imageUrl}
            roomName={room.roomName}
            hotspots={room.hotspots || []}
            selectedHotspotId={selectedHotspotId}
            onSelectHotspot={setSelectedHotspotId}
          />
        </div>

        {/* Right: Spatial Diagnostic & Identified Zones */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                Spatial Diagnostic Summary
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{room.summary}</p>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-800 mb-2">Observed Clutter Drivers:</div>
              <ul className="space-y-1.5">
                {room.primaryIssues.map((issue, idx) => (
                  <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="text-rose-600 font-bold shrink-0 mt-0.5">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Spatial Zones Detected */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-700" />
              Identified Spatial Zones
            </h3>

            <div className="space-y-2.5">
              {room.spatialZones?.map((zone) => (
                <div
                  key={zone.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{zone.name}</span>
                    <span className="text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
                      {zone.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{zone.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Sub-Tabs Navigation */}
      <div className="border-b border-slate-200">
        <div className="flex items-center gap-2 overflow-x-auto pb-px">
          <button
            onClick={() => setActiveSubTab('checklist')}
            className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap shrink-0 border-b-2 flex items-center gap-2 transition-colors ${
              activeSubTab === 'checklist'
                ? 'border-emerald-700 text-emerald-800 bg-emerald-50/40 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            Phased Action Checklist
          </button>

          <button
            onClick={() => setActiveSubTab('matrix')}
            className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap shrink-0 border-b-2 flex items-center gap-2 transition-colors ${
              activeSubTab === 'matrix'
                ? 'border-emerald-700 text-emerald-800 bg-emerald-50/40 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            The 4-Box Sorting Triage
          </button>

          <button
            onClick={() => setActiveSubTab('storage')}
            className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap shrink-0 border-b-2 flex items-center gap-2 transition-colors ${
              activeSubTab === 'storage'
                ? 'border-emerald-700 text-emerald-800 bg-emerald-50/40 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Box className="w-4 h-4" />
            Storage Systems & Hardware
          </button>

          <button
            onClick={() => setActiveSubTab('chat')}
            className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap shrink-0 border-b-2 flex items-center gap-2 transition-colors ${
              activeSubTab === 'chat'
                ? 'border-emerald-700 text-emerald-800 bg-emerald-50/40 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            AI Organization Coach
          </button>
        </div>
      </div>

      {/* Sub-Tab Viewport Content */}
      <div className="pt-2">
        {activeSubTab === 'checklist' && (
          <ActionChecklist
            plan={room.phasedActionPlan}
            onToggleTask={handleToggleTask}
            motivationalTip={room.motivationalTip}
          />
        )}

        {activeSubTab === 'matrix' && (
          <FourBoxMatrix
            sorting={room.fourBoxSorting}
            onToggleItem={handleToggleFourBox}
          />
        )}

        {activeSubTab === 'storage' && (
          <StorageRecommendations solutions={room.storageSolutions || []} />
        )}

        {activeSubTab === 'chat' && (
          <OrganizerChat roomContext={room} />
        )}
      </div>
    </div>
  );
};
