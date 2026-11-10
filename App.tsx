/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { UploadSection } from './components/UploadSection';
import { RoomStudio } from './components/RoomStudio';
import { SavedRoomsDrawer } from './components/SavedRoomsDrawer';
import { PrintableReport } from './components/PrintableReport';
import { RoomAnalysisResult, StrategyType } from './types/declutter';
import { SAMPLE_ROOMS } from './data/sampleRooms';
import { AlertCircle, X, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'clutterzero_saved_rooms';

export default function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'studio' | 'history'>('upload');
  const [currentRoom, setCurrentRoom] = useState<RoomAnalysisResult | null>(null);
  const [savedRooms, setSavedRooms] = useState<RoomAnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // Load saved rooms from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedRooms(parsed);
          setCurrentRoom(parsed[0]);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to parse saved rooms from localStorage', e);
    }
  }, []);

  // Save rooms to localStorage whenever updated
  const syncSavedRooms = (rooms: RoomAnalysisResult[]) => {
    setSavedRooms(rooms);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
    } catch (e) {
      console.error('Failed to save rooms to localStorage', e);
    }
  };

  const handleAnalyze = async (data: {
    imageBase64: string;
    mimeType: string;
    roomType: string;
    strategy: StrategyType;
    notes: string;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/analyze-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const result: RoomAnalysisResult = await response.json();
      setCurrentRoom(result);

      // Add to saved rooms list (avoid duplicates)
      const existingIdx = savedRooms.findIndex((r) => r.id === result.id);
      let updatedRooms: RoomAnalysisResult[];
      if (existingIdx !== -1) {
        updatedRooms = [...savedRooms];
        updatedRooms[existingIdx] = result;
      } else {
        updatedRooms = [result, ...savedRooms];
      }
      syncSavedRooms(updatedRooms);

      setActiveTab('studio');
    } catch (err: any) {
      console.error('Room analysis error:', err);
      setErrorMessage(
        err.message || 'Failed to complete AI room analysis. Please check your photo and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRoom = (updated: RoomAnalysisResult) => {
    setCurrentRoom(updated);
    const updatedList = savedRooms.map((r) => (r.id === updated.id ? updated : r));
    syncSavedRooms(updatedList);
  };

  const handleSelectRoom = (room: RoomAnalysisResult) => {
    setCurrentRoom(room);
    setActiveTab('studio');
  };

  const handleDeleteRoom = (id: string) => {
    const updated = savedRooms.filter((r) => r.id !== id);
    syncSavedRooms(updated);
    if (currentRoom?.id === id) {
      setCurrentRoom(updated.length > 0 ? updated[0] : null);
      if (updated.length === 0) {
        setActiveTab('upload');
      }
    }
  };

  const handleNewScan = () => {
    setActiveTab('upload');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasActiveAnalysis={!!currentRoom}
        onNewScan={handleNewScan}
        onPrintReport={() => setShowPrintModal(true)}
        savedCount={savedRooms.length}
      />

      {/* Error alert toast */}
      {errorMessage && (
        <div className="max-w-4xl mx-auto px-4 mt-4 w-full">
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 flex items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Viewport Container */}
      <main className="flex-1">
        {activeTab === 'upload' && (
          <UploadSection onAnalyze={handleAnalyze} isLoading={isLoading} />
        )}

        {activeTab === 'studio' && currentRoom && (
          <RoomStudio
            room={currentRoom}
            onUpdateRoom={handleUpdateRoom}
            onPrintReport={() => setShowPrintModal(true)}
          />
        )}

        {activeTab === 'history' && (
          <SavedRoomsDrawer
            savedRooms={savedRooms}
            onSelectRoom={handleSelectRoom}
            onDeleteRoom={handleDeleteRoom}
            onNewScan={handleNewScan}
          />
        )}
      </main>

      {/* Footer (Anti-slop compliant: Quiet, no buzzword engines or fake stats) */}
      <footer className="no-print mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">ClutterZero</span>
            <span>·</span>
            <span>AI Spatial Organization & Decluttering Coach</span>
          </div>
          <div>All room analysis runs securely with local device persistence</div>
        </div>
      </footer>

      {/* Printable Report Modal */}
      {showPrintModal && currentRoom && (
        <PrintableReport room={currentRoom} onClose={() => setShowPrintModal(false)} />
      )}
    </div>
  );
}
