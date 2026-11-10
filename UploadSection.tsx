import React, { useState, useRef } from 'react';
import { Upload, Camera, Zap, Heart, Brain, Minimize2, Users, ArrowRight, Image as ImageIcon, Sparkles, CheckCircle2 } from 'lucide-react';
import { StrategyType, SampleRoom } from './declutter';
import { SAMPLE_ROOMS } from './sampleRooms';

interface UploadSectionProps {
  onAnalyze: (data: {
    imageBase64: string;
    mimeType: string;
    roomType: string;
    strategy: StrategyType;
    notes: string;
  }) => Promise<void>;
  isLoading: boolean;
}

const STRATEGIES: {
  id: StrategyType;
  title: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  bestFor: string;
}[] = [
  {
    id: 'quick_blitz',
    title: '15-Minute Blitz',
    badge: 'Fastest',
    icon: Zap,
    description: 'High-speed visual relief. Rapid sweeps for obvious trash, dishes, and quick relocations.',
    bestFor: 'Surprise guests coming or quick end-of-day resets',
  },
  {
    id: 'konmari',
    title: 'KonMari Method',
    badge: 'Mindful',
    icon: Heart,
    description: 'Category-by-category sorting (Clothes, Books, Papers, Misc) keeping only what sparks joy and utility.',
    bestFor: 'Wardrobes, book collections, and deep weekend overhauls',
  },
  {
    id: 'adhd_friendly',
    title: 'ADHD Micro-Steps',
    badge: 'Gentle',
    icon: Brain,
    description: 'Low cognitive load. Attacks one tiny 1-foot square at a time with dopamine-friendly milestones.',
    bestFor: 'High overwhelm, executive dysfunction, or cluttered paralysis',
  },
  {
    id: 'minimalist',
    title: 'Minimalist Reset',
    badge: 'Essential',
    icon: Minimize2,
    description: 'Ruthless surface discipline. Strict hidden storage systems, zero visual friction, essentialism.',
    bestFor: 'Desks, kitchen counters, and modern focus workspaces',
  },
  {
    id: 'family_functional',
    title: 'Family & Shared Hub',
    badge: 'Practical',
    icon: Users,
    description: 'Drop zones, intuitive open bins, and child-friendly categorization for multi-person households.',
    bestFor: 'Living rooms, play areas, entryways, and family kitchens',
  },
];

const ROOM_TYPES = [
  'Home Office & Desk',
  'Bedroom Closet & Wardrobe',
  'Kitchen & Pantry',
  'Living Room & Play Area',
  'Bathroom & Vanity',
  'Kids Bedroom / Playroom',
  'Garage & Workshop',
  'Entryway & Mudroom',
  'Storage Room / Attic',
];

export const UploadSection: React.FC<UploadSectionProps> = ({ onAnalyze, isLoading }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(SAMPLE_ROOMS[0].imageUrl);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [roomType, setRoomType] = useState<string>('Home Office & Desk');
  const [strategy, setStrategy] = useState<StrategyType>('quick_blitz');
  const [notes, setNotes] = useState<string>(SAMPLE_ROOMS[0].sampleNotes);
  const [activeSampleId, setActiveSampleId] = useState<string | null>('sample-office');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setActiveSampleId(null);
    setMimeType(file.type || 'image/jpeg');

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setSelectedImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (sample: SampleRoom) => {
    setActiveSampleId(sample.id);
    setSelectedImage(sample.imageUrl);
    setMimeType('image/jpeg');
    setStrategy(sample.recommendedStrategy);
    setNotes(sample.sampleNotes);

    const matchingRoom = ROOM_TYPES.find((r) =>
      r.toLowerCase().includes(sample.roomType.toLowerCase().split(' ')[0])
    );
    if (matchingRoom) {
      setRoomType(matchingRoom);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) return;

    await onAnalyze({
      imageBase64: selectedImage,
      mimeType,
      roomType,
      strategy,
      notes,
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Intro Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Multimodal Spatial Intelligence
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
          Transform Your Cluttered Rooms Into Peaceful, Functional Spaces
        </h1>
        <p className="mt-3 text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Upload any room photo. Our AI identifies high-impact clutter zones, maps coordinate hotspots, and generates a personalized, step-by-step 4-box decluttering system.
        </p>
      </div>

      {/* Preset Quick-Test Sample Selector */}
      <div className="mb-10 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Try Instant Sample Rooms</h2>
            <p className="text-xs text-slate-500">Test the AI immediately with realistic cluttered home spaces</p>
          </div>
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
            1-Click Demo
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SAMPLE_ROOMS.map((sample) => {
            const isSelected = activeSampleId === sample.id;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className={`relative group rounded-xl overflow-hidden border text-left transition-all ${
                  isSelected
                    ? 'border-emerald-600 ring-2 ring-emerald-500/30 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="aspect-4/3 w-full bg-slate-100 overflow-hidden relative">
                  <img
                    src={sample.imageUrl}
                    alt={sample.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-emerald-600 text-white rounded-full p-1 shadow-sm">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="p-2.5 bg-white">
                  <div className="text-xs font-bold text-slate-900 truncate">{sample.title}</div>
                  <div className="text-[11px] text-slate-500 truncate">{sample.roomType}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Image Upload & Preview */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-emerald-700" />
              Room Photo
            </label>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-4 transition-all flex flex-col items-center justify-center text-center min-h-[340px] bg-white ${
                dragActive
                  ? 'border-emerald-600 bg-emerald-50/40'
                  : selectedImage
                  ? 'border-slate-200'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {selectedImage ? (
                <div className="relative w-full h-full flex flex-col items-center">
                  <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden bg-slate-900 shadow-sm border border-slate-100">
                    <img
                      src={selectedImage}
                      alt="Room to analyze"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      Change Photo
                    </button>
                    <span className="text-xs text-slate-500">
                      {activeSampleId ? 'Sample photo loaded' : 'Custom photo ready'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-8 px-4 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 shadow-xs">
                    <Upload className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    Upload or drag room photo here
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mb-5">
                    Supports high-resolution JPG, PNG, or camera uploads up to 20MB
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
                  >
                    Select File From Device
                  </button>
                </div>
              )}
            </div>

            <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Tip for best results:</strong> Capture a wide-angle shot showing both the main surfaces (desks, counters, beds) and vertical storage (shelves, racks) with natural lighting.
              </span>
            </div>
          </div>

          {/* Right Column: Customization & Strategy */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Room Type */}
            <div>
              <label className="text-sm font-bold text-slate-900 block mb-2">
                Room Category
              </label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent font-medium shadow-xs"
              >
                {ROOM_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Organizing Strategy Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-slate-900">
                  Decluttering Philosophy & Pace
                </label>
                <span className="text-xs text-slate-500">Pick what fits your mental energy</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {STRATEGIES.map((strat) => {
                  const Icon = strat.icon;
                  const isSelected = strategy === strat.id;
                  return (
                    <div
                      key={strat.id}
                      onClick={() => setStrategy(strat.id)}
                      className={`cursor-pointer rounded-xl p-3.5 border transition-all text-left ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-500/30'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1.5 rounded-lg ${
                              isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-slate-900">{strat.title}</span>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {strat.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-snug line-clamp-2">
                        {strat.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Specific Notes & Pain Points */}
            <div>
              <label className="text-sm font-bold text-slate-900 block mb-1.5">
                Your Specific Pain Points or Goals (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="e.g. Cables are completely tangled; I can never find clean clothes; need a place for incoming mail..."
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent resize-none shadow-xs"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || !selectedImage}
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all shadow-md ${
                  isLoading || !selectedImage
                    ? 'bg-slate-400 cursor-not-allowed opacity-80'
                    : 'bg-emerald-700 hover:bg-emerald-800 hover:shadow-lg active:scale-[0.99]'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing Room Clutter with Gemini Vision...</span>
                  </>
                ) : (
                  <>
                    <span>Generate AI Organization & Decluttering Plan</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {isLoading && (
                <div className="mt-3 text-center">
                  <p className="text-xs text-slate-500 animate-pulse">
                    Scanning spatial zones, item densities, coordinate hotspots, and custom storage solutions...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
