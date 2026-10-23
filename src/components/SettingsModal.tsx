import React, { useState } from 'react';
import { PlayerProgress } from '../types/game';
import { X, Monitor, Sliders, AlertTriangle } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface SettingsModalProps {
  progress: PlayerProgress;
  onUpdateProgress: (updated: Partial<PlayerProgress>) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  progress,
  onUpdateProgress,
  onResetProgress,
  onClose,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleSens = (val: number) => {
    onUpdateProgress({ steeringSensitivity: val });
  };

  const handleGraphics = (q: 'high' | 'medium' | 'low') => {
    soundManager.playClick();
    onUpdateProgress({ graphicsQuality: q });
  };

  const handleConfirmReset = () => {
    soundManager.playClick();
    onResetProgress();
    setShowConfirmReset(false);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-white italic tracking-wider">SETTINGS</h2>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Steering Sensitivity Section */}
        <div className="space-y-2 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <Sliders size={16} className="text-amber-400" />
              <span>Steering Sensitivity</span>
            </span>
            <span className="font-bold text-white tabular-nums">{progress.steeringSensitivity.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.6"
            max="1.6"
            step="0.1"
            value={progress.steeringSensitivity}
            onChange={(e) => handleSens(parseFloat(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
        </div>

        {/* Graphics Quality */}
        <div className="space-y-2 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2 mb-2">
            <Monitor size={16} className="text-purple-400" />
            <span>Graphics Quality Preset</span>
          </span>
          <div className="grid grid-cols-3 gap-2">
            {(['low', 'medium', 'high'] as const).map((q) => (
              <button
                key={q}
                onClick={() => handleGraphics(q)}
                className={`py-2 rounded-xl text-xs font-bold uppercase transition ${
                  progress.graphicsQuality === q
                    ? 'bg-purple-600 text-white shadow-md border border-purple-400'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Reset Progress */}
        <div className="pt-1">
          {showConfirmReset ? (
            <div className="p-3 bg-red-950/80 border border-red-700 rounded-2xl space-y-2 text-center">
              <div className="flex items-center justify-center space-x-2 text-red-300 text-xs font-bold">
                <AlertTriangle size={16} />
                <span>Reset all unlocked cars and coins?</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={handleConfirmReset}
                  className="px-4 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-500"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="text-xs text-red-400 hover:text-red-300 underline block text-center w-full"
            >
              Reset Game Progress
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
