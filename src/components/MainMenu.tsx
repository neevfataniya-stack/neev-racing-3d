import React, { useState, useEffect } from 'react';
import { EnvironmentType, PlayerProgress } from '../types/game';
import { CAR_CATALOG } from '../utils/storage';
import { Play, Warehouse, Settings as SettingsIcon, HelpCircle, ChevronLeft, ChevronRight, Lock, Check, Gauge, Zap } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface MainMenuProps {
  progress: PlayerProgress;
  onStartRace: () => void;
  onOpenGarage: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onSelectEnvironment: (env: EnvironmentType) => void;
  onToggleAudio?: () => void;
  onSelectCar: (carId: string) => void;
  onChangePreviewCar: (carId: string, color: string) => void;
  onUnlockCar: (carId: string, cost: number) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  progress,
  onStartRace,
  onOpenGarage,
  onOpenSettings,
  onOpenHelp,
  onSelectEnvironment,
  onSelectCar,
  onChangePreviewCar,
  onUnlockCar,
}) => {
  // Preview index allows browsing all 10 real 3D cars freely
  const [previewIdx, setPreviewIdx] = useState(() => {
    const idx = CAR_CATALOG.findIndex((c) => c.id === progress.selectedCarId);
    return idx >= 0 ? idx : 0;
  });

  const selectedCar = CAR_CATALOG[previewIdx] || CAR_CATALOG[0];
  const isUnlocked = progress.unlockedCarIds.includes(selectedCar.id);
  const isCurrentlyActive = progress.selectedCarId === selectedCar.id;
  const canAfford = progress.coins >= selectedCar.price;

  // Keep preview in sync if selected car is changed from garage
  useEffect(() => {
    const idx = CAR_CATALOG.findIndex((c) => c.id === progress.selectedCarId);
    if (idx >= 0 && idx !== previewIdx) {
      setPreviewIdx(idx);
    }
  }, [progress.selectedCarId]);

  const handlePrevCar = () => {
    soundManager.playClick();
    const nextIdx = (previewIdx - 1 + CAR_CATALOG.length) % CAR_CATALOG.length;
    setPreviewIdx(nextIdx);
    const nextCar = CAR_CATALOG[nextIdx];
    onChangePreviewCar(nextCar.id, nextCar.baseColor);
    if (progress.unlockedCarIds.includes(nextCar.id)) {
      onSelectCar(nextCar.id);
    }
  };

  const handleNextCar = () => {
    soundManager.playClick();
    const nextIdx = (previewIdx + 1) % CAR_CATALOG.length;
    setPreviewIdx(nextIdx);
    const nextCar = CAR_CATALOG[nextIdx];
    onChangePreviewCar(nextCar.id, nextCar.baseColor);
    if (progress.unlockedCarIds.includes(nextCar.id)) {
      onSelectCar(nextCar.id);
    }
  };

  const environments: { id: EnvironmentType; label: string; icon: string; desc: string }[] = [
    { id: 'city', label: 'City Highway', icon: '🌃', desc: 'Neon skyscrapers & midnight asphalt' },
    { id: 'desert', label: 'Desert Dunes', icon: '🏜️', desc: 'Golden sands & blazing canyon sunset' },
    { id: 'mountain', label: 'Alpine Peak', icon: '🏔️', desc: 'Snowy ridges & pine mist' },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2 sm:p-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))] pl-[max(0.8rem,env(safe-area-inset-left))] pr-[max(0.8rem,env(safe-area-inset-right))] select-none z-10 overflow-y-auto">
      {/* TOP HEADER: Branding & Currencies */}
      <div className="flex items-start justify-between w-full">
        {/* Bespoke Logo & Tagline */}
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <svg
              className="h-8 sm:h-10 md:h-11 w-auto fill-current drop-shadow-md"
              viewBox="0 0 320 60"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="50%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
                <linearGradient id="neonSub" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
              <text
                x="0"
                y="45"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontWeight="900"
                fontStyle="italic"
                fontSize="42"
                letterSpacing="2"
                fill="url(#titleGrad)"
              >
                NEEV RACING
              </text>
              <rect x="255" y="14" width="60" height="34" rx="6" fill="url(#neonSub)" />
              <text
                x="285"
                y="39"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontWeight="900"
                fontSize="22"
                fill="#ffffff"
                textAnchor="middle"
              >
                3D
              </text>
            </svg>
          </div>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-slate-400 font-bold ml-1">
            Mobile-First 3D Highway Velocity
          </span>
        </div>

        {/* Top-Right Badges: Coins & High Score */}
        <div className="flex items-center space-x-2 sm:space-x-2.5 pointer-events-auto">
          {/* Total Coins */}
          <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-700/70 rounded-2xl px-3.5 py-1.5 shadow-xl backdrop-blur-md">
            <div className="w-5 h-5 rounded-full bg-amber-400 border border-amber-200 flex items-center justify-center text-slate-900 font-black text-xs shadow-[0_0_8px_#f59e0b]">
              $
            </div>
            <span className="text-sm sm:text-base md:text-lg font-black text-amber-300 tabular-nums">
              {progress.coins.toLocaleString()}
            </span>
          </div>

          {/* High Score */}
          <div className="hidden sm:flex flex-col bg-slate-900/90 border border-slate-700/70 rounded-2xl px-3.5 py-1 shadow-xl backdrop-blur-md text-right">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              BEST SCORE
            </span>
            <span className="text-sm sm:text-base font-black text-white tabular-nums">
              {progress.highScore.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* CENTER 10-VEHICLE 3D CAR PREVIEW CAROUSEL
          The center area is completely clear so the authentic rotating 3D car model is visible!
          LEFT and RIGHT arrows flank the centered 3D car. */}
      <div className="my-auto py-1 sm:py-2 flex items-center justify-between w-full pointer-events-auto px-1 sm:px-4 max-w-5xl mx-auto">
        {/* Left Arrow Button */}
        <button
          onClick={handlePrevCar}
          className="p-2 sm:p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:bg-cyan-600 border border-slate-700/80 text-white shadow-2xl transition active:scale-90 backdrop-blur-md z-20"
          aria-label="Previous Vehicle"
          title="Previous Vehicle"
        >
          <ChevronLeft size={26} />
        </button>

        {/* Center Vehicle Details & Floating Telemetry Overlay (Transparent Center reveals rotating 3D car) */}
        <div className="flex flex-col items-center justify-between text-center w-full max-w-lg min-h-[90px] sm:min-h-[150px] md:min-h-[220px] pointer-events-none px-2">
          {/* Top Info Header Pill */}
          <div className="pointer-events-auto flex flex-col items-center space-y-0.5 sm:space-y-1 bg-slate-900/90 border border-slate-700/80 rounded-2xl px-3 sm:px-6 py-1 sm:py-2 shadow-2xl backdrop-blur-md">
            <div className="flex items-center space-x-2">
              <span
                className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]"
                style={{ backgroundColor: selectedCar.baseColor }}
              />
              <span className="text-[10px] sm:text-xs font-black text-cyan-400 uppercase tracking-wider">
                {selectedCar.tier}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-[10px] sm:text-xs font-black text-amber-300">
                VEHICLE {previewIdx + 1} OF {CAR_CATALOG.length}
              </span>
            </div>

            <h2 className="text-base sm:text-xl md:text-3xl font-black text-white italic tracking-tight">
              {selectedCar.name}
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-300 font-medium">
              {selectedCar.subtitle}
            </p>
          </div>

          {/* Transparent Middle Area: The real 3D car model rotates here without any obscuring flat image! */}
          <div className="w-full flex-1 my-1" />

          {/* Bottom Floating Specs Dock & Select/Unlock Action */}
          <div className="pointer-events-auto flex flex-col items-center space-y-1.5 sm:space-y-2 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-2 sm:p-3.5 shadow-2xl backdrop-blur-md w-full">
            {/* Real Vehicle Performance Stats */}
            <div className="flex items-center justify-center space-x-3 sm:space-x-5 text-xs text-slate-300 w-full">
              <div className="flex items-center space-x-1 font-bold">
                <Gauge size={14} className="text-cyan-400" />
                <span className="text-slate-400">TOP:</span>
                <span className="text-white tabular-nums font-black">{selectedCar.stats.topSpeed} KM/H</span>
              </div>
              <span className="text-slate-700">•</span>
              <div className="flex items-center space-x-1 font-bold">
                <Zap size={14} className="text-amber-400" />
                <span className="text-slate-400">ACCEL:</span>
                <span className="text-white tabular-nums font-black">{selectedCar.stats.acceleration}%</span>
              </div>
              <span className="text-slate-700">•</span>
              <div className="flex items-center space-x-1 font-bold">
                <span className="text-emerald-400 text-xs">🎯</span>
                <span className="text-slate-400">STEER:</span>
                <span className="text-white tabular-nums font-black">{selectedCar.stats.handling}%</span>
              </div>
            </div>

            {/* Lock / Unlock Status & Quick Drive Selection */}
            <div className="w-full flex items-center justify-center pt-1">
              {!isUnlocked ? (
                <button
                  onClick={() => onUnlockCar(selectedCar.id, selectedCar.price)}
                  disabled={!canAfford}
                  className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-2 transition shadow-xl ${
                    canAfford
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <Lock size={14} />
                  <span>
                    {canAfford
                      ? `UNLOCK FOR ${selectedCar.price} COINS`
                      : `LOCKED (${selectedCar.price} COINS)`}
                  </span>
                </button>
              ) : isCurrentlyActive ? (
                <div className="w-full py-2 flex items-center justify-center space-x-1.5 text-emerald-400 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  <Check size={14} />
                  <span>SELECTED & READY TO RACE</span>
                </div>
              ) : (
                <button
                  onClick={() => onSelectCar(selectedCar.id)}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-lg active:scale-95 transition"
                >
                  DRIVE THIS VEHICLE
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={handleNextCar}
          className="p-3 sm:p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:bg-cyan-600 border border-slate-700/80 text-white shadow-2xl transition active:scale-90 backdrop-blur-md z-20"
          aria-label="Next Vehicle"
          title="Next Vehicle"
        >
          <ChevronRight size={30} />
        </button>
      </div>

      {/* BOTTOM CONSOLE: Quick Environment Picker & Main Action Buttons */}
      <div className="flex flex-col items-center space-y-1.5 sm:space-y-2.5 w-full max-w-4xl mx-auto">
        {/* Environment Track Selector */}
        <div className="pointer-events-auto flex items-center justify-center space-x-1.5 md:space-x-3 bg-slate-900/90 border border-slate-800 p-1 sm:p-1.5 rounded-2xl shadow-2xl w-full max-w-lg backdrop-blur-md">
          {environments.map((env) => {
            const isSelected = progress.selectedEnvironment === env.id;
            return (
              <button
                key={env.id}
                onClick={() => {
                  soundManager.playClick();
                  onSelectEnvironment(env.id);
                }}
                className={`flex-1 py-1 sm:py-1.5 px-2 sm:px-3 rounded-xl flex items-center justify-center space-x-1.5 sm:space-x-2 text-[11px] sm:text-xs md:text-sm font-bold transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg scale-102 border border-cyan-400/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>{env.icon}</span>
                <span>{env.label}</span>
              </button>
            );
          })}
        </div>

        {/* Primary Action Buttons */}
        <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 w-full">
          {/* Main START RACE Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              onStartRace();
            }}
            className="flex-1 min-w-[140px] sm:min-w-[180px] max-w-xs py-2 sm:py-3.5 px-4 sm:px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm sm:text-lg md:text-xl tracking-wider uppercase flex items-center justify-center space-x-2 sm:space-x-3 shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(16,185,129,0.7)] transition active:scale-98"
          >
            <Play size={18} fill="currentColor" />
            <span>PLAY NOW</span>
          </button>

          {/* Garage / Car Selection */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenGarage();
            }}
            className="py-2 sm:py-3.5 px-3.5 sm:px-5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-white font-bold text-xs sm:text-sm md:text-base flex items-center space-x-1.5 sm:space-x-2 shadow-xl transition active:scale-98 backdrop-blur-md"
          >
            <Warehouse size={16} className="text-cyan-400" />
            <span>GARAGE</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenSettings();
            }}
            className="py-2 sm:py-3.5 px-2.5 sm:px-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition shadow-xl active:scale-98 backdrop-blur-md"
            title="Settings"
            aria-label="Settings"
          >
            <SettingsIcon size={16} />
          </button>

          {/* How to Play Guide */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenHelp();
            }}
            className="py-2 sm:py-3.5 px-2.5 sm:px-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition shadow-xl active:scale-98 backdrop-blur-md"
            title="How to Play"
            aria-label="How to Play"
          >
            <HelpCircle size={16} />
          </button>
        </div>

        {/* Control Hint Line */}
        <div className="text-center text-[10px] sm:text-[11px] font-semibold text-slate-400 tracking-wide pb-0.5">
          <span className="text-emerald-400 font-bold">LEFT:</span> Gas & Brake &nbsp;·&nbsp;{' '}
          <span className="text-cyan-400 font-bold">RIGHT:</span> Left & Right Steering &nbsp;·&nbsp;{' '}
          <span className="text-slate-300">0 to 250 KM/H</span>
        </div>
      </div>
    </div>
  );
};
