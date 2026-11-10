import React, { useState } from 'react';
import { HotspotItem } from '../types/declutter';
import { Eye, EyeOff, AlertTriangle, ArrowRight, Tag, Check, Sparkles } from 'lucide-react';

interface RoomPhotoAnnotatorProps {
  imageUrl: string;
  roomName: string;
  hotspots: HotspotItem[];
  selectedHotspotId: string | null;
  onSelectHotspot: (id: string | null) => void;
}

export const RoomPhotoAnnotator: React.FC<RoomPhotoAnnotatorProps> = ({
  imageUrl,
  roomName,
  hotspots,
  selectedHotspotId,
  onSelectHotspot,
}) => {
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [urgencyFilter, setUrgencyFilter] = useState<'All' | 'High'>('All');

  const filteredHotspots = hotspots.filter((h) => {
    if (urgencyFilter === 'High') return h.urgency === 'High';
    return true;
  });

  const activeHotspot = hotspots.find((h) => h.id === selectedHotspotId);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
      {/* Annotator Header Bar */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800">Spatial Hotspot Map</span>
          <span className="text-xs text-slate-500 font-mono">
            ({hotspots.length} zones tagged)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Urgency Filter */}
          <div className="inline-flex rounded-lg bg-slate-200/70 p-0.5 text-xs font-medium">
            <button
              onClick={() => setUrgencyFilter('All')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                urgencyFilter === 'All'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Zones
            </button>
            <button
              onClick={() => setUrgencyFilter('High')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                urgencyFilter === 'High'
                  ? 'bg-white text-rose-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              High Urgency
            </button>
          </div>

          {/* Toggle Visibility */}
          <button
            onClick={() => setShowOverlays(!showOverlays)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg shadow-2xs transition-colors"
          >
            {showOverlays ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                <span>Hide Tags</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>Show Tags</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Photo Container with Overlays */}
      <div className="relative aspect-4/3 sm:aspect-16/10 w-full bg-slate-950 overflow-hidden select-none">
        <img
          src={imageUrl}
          alt={roomName}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain"
        />

        {showOverlays && (
          <div className="absolute inset-0 pointer-events-none">
            {filteredHotspots.map((spot, idx) => {
              const [ymin, xmin, ymax, xmax] = spot.box_2d || [0, 0, 0, 0];
              const top = Math.max(0, Math.min(100, ymin / 10));
              const left = Math.max(0, Math.min(100, xmin / 10));
              const width = Math.max(8, Math.min(100 - left, (xmax - xmin) / 10));
              const height = Math.max(8, Math.min(100 - top, (ymax - ymin) / 10));

              const isSelected = selectedHotspotId === spot.id;
              const isHigh = spot.urgency === 'High';

              return (
                <div key={spot.id}>
                  {/* Bounding box outline */}
                  <div
                    style={{
                      top: `${top}%`,
                      left: `${left}%`,
                      width: `${width}%`,
                      height: `${height}%`,
                    }}
                    className={`absolute rounded-lg border-2 pointer-events-auto transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-500/20 ring-4 ring-emerald-400/40 z-20'
                        : isHigh
                        ? 'border-rose-400/80 bg-rose-500/10 hover:border-rose-300 hover:bg-rose-500/20 z-10'
                        : 'border-amber-400/80 bg-amber-500/10 hover:border-amber-300 hover:bg-amber-500/20 z-10'
                    }`}
                    onClick={() => onSelectHotspot(isSelected ? null : spot.id)}
                  >
                    {/* Corner Tag with Index */}
                    <div
                      className={`absolute -top-3 left-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-tight text-white shadow-xs ${
                        isSelected
                          ? 'bg-emerald-600 ring-1 ring-white'
                          : isHigh
                          ? 'bg-rose-600'
                          : 'bg-amber-600'
                      }`}
                    >
                      #{idx + 1}
                    </div>
                  </div>

                  {/* Center Pin Marker */}
                  <button
                    type="button"
                    style={{
                      top: `${top + height / 2}%`,
                      left: `${left + width / 2}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    onClick={() => onSelectHotspot(isSelected ? null : spot.id)}
                    className={`absolute pointer-events-auto w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-md transition-all ${
                      isSelected
                        ? 'bg-emerald-600 scale-125 ring-2 ring-white z-30'
                        : isHigh
                        ? 'bg-rose-600 hover:scale-110 z-20'
                        : 'bg-amber-600 hover:scale-110 z-20'
                    }`}
                    title={spot.label}
                  >
                    {idx + 1}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Floating Active Hotspot Drawer/Tooltip */}
        {activeHotspot && showOverlays && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:max-w-md bg-white/95 backdrop-blur-md rounded-xl p-3.5 shadow-lg border border-slate-200 z-30">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    activeHotspot.urgency === 'High'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {activeHotspot.urgency} Urgency
                </span>
                <span className="text-xs font-bold text-slate-900">{activeHotspot.label}</span>
              </div>
              <button
                onClick={() => onSelectHotspot(null)}
                className="text-slate-400 hover:text-slate-600 text-xs px-1"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed mb-2 font-medium">
              {activeHotspot.action}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-400" />
                {activeHotspot.category}
              </span>
              <span className="text-emerald-700 font-semibold">Highlighted on photo</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Hotspot Strip Below Photo */}
      <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-slate-400 font-medium whitespace-nowrap shrink-0">Click to focus:</span>
        {hotspots.map((h, i) => {
          const isSelected = selectedHotspotId === h.id;
          return (
            <button
              key={h.id}
              onClick={() => onSelectHotspot(isSelected ? null : h.id)}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap shrink-0 transition-colors border text-left ${
                isSelected
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              #{i + 1} {h.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
