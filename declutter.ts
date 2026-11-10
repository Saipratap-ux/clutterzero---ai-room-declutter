export type StrategyType =
  | 'quick_blitz'
  | 'konmari'
  | 'adhd_friendly'
  | 'minimalist'
  | 'family_functional';

export interface SpatialZone {
  id: string;
  name: string;
  status: string;
  description: string;
}

export interface HotspotItem {
  id: string;
  label: string;
  category: string;
  urgency: 'High' | 'Medium' | 'Low';
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
  action: string;
}

export interface FourBoxKeepItem {
  item: string;
  recommendation: string;
  completed?: boolean;
}

export interface FourBoxRelocateItem {
  item: string;
  targetRoom: string;
  note: string;
  completed?: boolean;
}

export interface FourBoxDonateSellItem {
  item: string;
  note: string;
  completed?: boolean;
}

export interface FourBoxDiscardItem {
  item: string;
  note: string;
  completed?: boolean;
}

export interface FourBoxSorting {
  keep: FourBoxKeepItem[];
  relocate: FourBoxRelocateItem[];
  donateSell: FourBoxDonateSellItem[];
  discardRecycle: FourBoxDiscardItem[];
}

export interface ChecklistTask {
  id: string;
  title: string;
  description: string;
  timeMinutes?: number;
  frequency?: string;
  completed?: boolean;
}

export interface PhasedActionPlan {
  phase1QuickWins: ChecklistTask[];
  phase2Sorting: ChecklistTask[];
  phase3ZoningStorage: ChecklistTask[];
  phase4MaintenanceRitual: ChecklistTask[];
}

export interface StorageSolution {
  name: string;
  placement: string;
  benefit: string;
  estimatedCost: string;
}

export interface RoomAnalysisResult {
  id: string;
  roomName: string;
  roomType: string;
  strategy: StrategyType;
  clutterScore: number; // 0 - 100
  clutterLevel: 'Mild' | 'Moderate' | 'High' | 'Severe';
  estimatedSortTimeMinutes: number;
  summary: string;
  primaryIssues: string[];
  spatialZones: SpatialZone[];
  hotspots: HotspotItem[];
  fourBoxSorting: FourBoxSorting;
  phasedActionPlan: PhasedActionPlan;
  storageSolutions: StorageSolution[];
  motivationalTip: string;
  imageUrl: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface SampleRoom {
  id: string;
  title: string;
  roomType: string;
  recommendedStrategy: StrategyType;
  description: string;
  imageUrl: string;
  sampleNotes: string;
}
