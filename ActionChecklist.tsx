import React, { useState, useEffect } from 'react';
import { PhasedActionPlan, ChecklistTask } from '../types/declutter';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  Zap,
  Layers,
  Archive,
  RefreshCw,
} from 'lucide-react';

interface ActionChecklistProps {
  plan: PhasedActionPlan;
  onToggleTask: (phase: keyof PhasedActionPlan, taskId: string) => void;
  motivationalTip: string;
}

export const ActionChecklist: React.FC<ActionChecklistProps> = ({
  plan,
  onToggleTask,
  motivationalTip,
}) => {
  // Focus Timer state
  const [activeTimerSeconds, setActiveTimerSeconds] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [activeTaskTitle, setActiveTaskTitle] = useState<string>('');

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && activeTimerSeconds !== null && activeTimerSeconds > 0) {
      interval = setInterval(() => {
        setActiveTimerSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (activeTimerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, activeTimerSeconds]);

  const startTaskTimer = (task: ChecklistTask) => {
    const minutes = task.timeMinutes || 5;
    setActiveTimerSeconds(minutes * 60);
    setActiveTaskTitle(task.title);
    setIsTimerRunning(true);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const allPhases: {
    key: keyof PhasedActionPlan;
    title: string;
    badge: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    tasks: ChecklistTask[];
  }[] = [
    {
      key: 'phase1QuickWins',
      title: 'Phase 1: Quick Wins (5-10 Minutes)',
      badge: 'Immediate Relief',
      icon: Zap,
      description: 'Clear obvious visual irritants (trash, mugs, clothes) to get quick dopamine.',
      tasks: plan.phase1QuickWins || [],
    },
    {
      key: 'phase2Sorting',
      title: 'Phase 2: Category Sorting (15-20 Minutes)',
      badge: 'Categorize',
      icon: Layers,
      description: 'Group like-with-like on the primary surface without scattering items.',
      tasks: plan.phase2Sorting || [],
    },
    {
      key: 'phase3ZoningStorage',
      title: 'Phase 3: Spatial Zoning & Systems (20-30 Minutes)',
      badge: 'Permanent Homes',
      icon: Archive,
      description: 'Assign dedicated containers, cable channels, and upright storage zones.',
      tasks: plan.phase3ZoningStorage || [],
    },
    {
      key: 'phase4MaintenanceRitual',
      title: 'Phase 4: Maintenance Habit',
      badge: 'Stay Tidy',
      icon: RefreshCw,
      description: 'The 2-minute daily ritual to prevent the room from ever backsliding.',
      tasks: plan.phase4MaintenanceRitual || [],
    },
  ];

  const totalTasks = allPhases.reduce((acc, p) => acc + p.tasks.length, 0);
  const doneTasks = allPhases.reduce(
    (acc, p) => acc + p.tasks.filter((t) => t.completed).length,
    0
  );
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Timer Bar if Active */}
      {activeTimerSeconds !== null && (
        <div className="bg-emerald-900 text-white rounded-2xl p-4 shadow-md flex flex-wrap items-center justify-between gap-4 border border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center font-mono text-base font-bold text-emerald-200">
              <Clock className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="text-xs text-emerald-200 font-medium">Focus Sprint</div>
              <div className="text-sm font-bold truncate max-w-sm">{activeTaskTitle}</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="font-mono text-2xl font-bold tracking-wider text-emerald-100 tabular-nums">
              {formatTimer(activeTimerSeconds)}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="p-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white transition-colors"
                title={isTimerRunning ? 'Pause timer' : 'Resume timer'}
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  setActiveTimerSeconds(null);
                  setIsTimerRunning(false);
                }}
                className="p-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white transition-colors text-xs"
                title="Dismiss timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress & Tip Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Phased Execution Plan</h3>
            <p className="text-xs text-slate-500">
              Tackle each phase sequentially. Never start Phase 3 before finishing Phase 1.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700 tabular-nums self-end sm:self-center">
            {doneTasks} of {totalTasks} steps complete ({progressPct}%)
          </span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-4">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {motivationalTip && (
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Coach Insight:</strong> {motivationalTip}
            </p>
          </div>
        )}
      </div>

      {/* The 4 Phases */}
      <div className="space-y-4">
        {allPhases.map((phase) => {
          const Icon = phase.icon;
          const phaseTotal = phase.tasks.length;
          const phaseDone = phase.tasks.filter((t) => t.completed).length;

          return (
            <div
              key={phase.key}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs"
            >
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{phase.title}</h4>
                    <p className="text-xs text-slate-500">{phase.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    {phaseDone}/{phaseTotal}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                {phase.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      task.completed
                        ? 'bg-emerald-50/40 border-emerald-200 opacity-75'
                        : 'bg-slate-50/50 border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className="flex items-start gap-3 cursor-pointer flex-1"
                      onClick={() => onToggleTask(phase.key, task.id)}
                    >
                      <div
                        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                          task.completed
                            ? 'bg-emerald-700 border-emerald-700 text-white'
                            : 'border-slate-300 bg-white hover:border-emerald-600'
                        }`}
                      >
                        {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>

                      <div>
                        <p
                          className={`text-xs font-bold text-slate-900 leading-snug ${
                            task.completed ? 'line-through text-slate-500' : ''
                          }`}
                        >
                          {task.title}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          {task.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-center">
                      {task.timeMinutes && !task.completed && (
                        <button
                          type="button"
                          onClick={() => startTaskTimer(task)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200/60"
                          title="Start focus timer for this task"
                        >
                          <Play className="w-3 h-3 fill-emerald-800" />
                          <span>{task.timeMinutes}m</span>
                        </button>
                      )}

                      {task.frequency && (
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {task.frequency}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
