import React from 'react';
import { RoomAnalysisResult } from './declutter';
import { Trash2, ExternalLink, Calendar, CheckCircle2, AlertCircle, Plus } from 'lucide-react';

interface SavedRoomsDrawerProps {
  savedRooms: RoomAnalysisResult[];
  onSelectRoom: (room: RoomAnalysisResult) => void;
  onDeleteRoom: (id: string) => void;
  onNewScan: () => void;
}

export const SavedRoomsDrawer: React.FC<SavedRoomsDrawerProps> = ({
  savedRooms,
  onSelectRoom,
  onDeleteRoom,
  onNewScan,
}) => {
  // Count total completed tasks across saved rooms
  const totalTasksCompleted = savedRooms.reduce((acc, room) => {
    let count = 0;
    const plan = room.phasedActionPlan;
    if (plan) {
      count += (plan.phase1QuickWins || []).filter((t) => t.completed).length;
      count += (plan.phase2Sorting || []).filter((t) => t.completed).length;
      count += (plan.phase3ZoningStorage || []).filter((t) => t.completed).length;
      count += (plan.phase4MaintenanceRitual || []).filter((t) => t.completed).length;
    }
    const box = room.fourBoxSorting;
    if (box) {
      count += (box.keep || []).filter((i) => i.completed).length;
      count += (box.relocate || []).filter((i) => i.completed).length;
      count += (box.donateSell || []).filter((i) => i.completed).length;
      count += (box.discardRecycle || []).filter((i) => i.completed).length;
    }
    return acc + count;
  }, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header and Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Your Saved Room Audits
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track your organization progress and revisitations across your home.
          </p>
        </div>

        <button
          onClick={onNewScan}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          Scan Another Room
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Rooms Documented</div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums mt-1">
            {savedRooms.length}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Actions & Items Completed</div>
          <div className="text-2xl font-extrabold text-emerald-700 font-mono tabular-nums mt-1 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            {totalTasksCompleted}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Active Storage Plans</div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums mt-1">
            {savedRooms.reduce((acc, r) => acc + (r.storageSolutions?.length || 0), 0)}
          </div>
        </div>
      </div>

      {/* Room Cards Grid */}
      {savedRooms.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">No room audits saved yet</h3>
          <p className="text-xs text-slate-500 mb-5 leading-relaxed">
            Upload a photo of your desk, bedroom, closet, or kitchen to generate your first AI declutter plan.
          </p>
          <button
            onClick={onNewScan}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Start Your First Room Scan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedRooms.map((room) => {
            const formattedDate = new Date(room.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={room.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-16/10 bg-slate-900 overflow-hidden">
                    <img
                      src={room.imageUrl}
                      alt={room.roomName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-mono px-2 py-0.5 rounded-md font-bold">
                      Score: {room.clutterScore}/100
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{formattedDate}</span>
                      <span>·</span>
                      <span className="font-medium text-slate-700">{room.roomType}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1 mb-1">
                      {room.roomName}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                      {room.summary}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-mono">
                        {room.hotspots?.length || 0} hotspots
                      </span>
                      <span>·</span>
                      <span className="bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                        ⏱️ ~{room.estimatedSortTimeMinutes}m
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onDeleteRoom(room.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50 text-xs flex items-center gap-1"
                    title="Delete room audit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>

                  <button
                    onClick={() => onSelectRoom(room)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-100/60 hover:bg-emerald-100 rounded-lg transition-colors"
                  >
                    <span>View Plan</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
