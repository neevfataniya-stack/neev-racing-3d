import React from 'react';
import { GameplayHUDData } from '../types/game';
import { Pause, Shield, Zap, Flame, Disc3, ChevronsUp } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface HUDProps {
  hudData: GameplayHUDData;
  audioEnabled?: boolean;
  onToggleAudio?: () => void;
  onPause: () => void;
  onSteerLeft: () => void;
  onSteerRight: () => void;
  onAccelerateStart: () => void;
  onAccelerateEnd: () => void;
  onBrakeStart: () => void;
  onBrakeEnd: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  hudData,
  onPause,
  onSteerLeft,
  onSteerRight,
  onAccelerateStart,
  onAccelerateEnd,
  onBrakeStart,
  onBrakeEnd,
}) => {
  const nitroColor = hudData.isNitroActive
    ? 'bg-cyan-400 shadow-[0_0_15px_#22d3ee]'
    : hudData.nitroPercent > 30
    ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
    : 'bg-red-500';

  // Gauge bar color based on 0-250 km/h range
  const speed = hudData.speedKmh;
  const speedPercent = Math.min(100, Math.round((speed / 250) * 100));
  const speedBarColor =
    speed >= 220
      ? 'from-pink-500 via-rose-500 to-red-500 shadow-[0_0_12px_#f43f5e]'
      : speed >= 160
      ? 'from-amber-400 via-orange-500 to-red-500'
      : speed >= 80
      ? 'from-cyan-400 via-teal-400 to-emerald-400'
      : 'from-blue-500 to-cyan-400';

  const speedStatusLabel =
    speed === 0
      ? 'START 0 KM/H'
      : speed < 80
      ? 'ACCELERATING'
      : speed <= 160
      ? 'RACING (80-160)'
      : speed < 240
      ? 'HIGH SPEED'
      : 'MAX 250 KM/H';

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-2.5 sm:p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] overflow-hidden z-10">
      {/* TOP BAR / TELEMETRY CLUSTERS */}
      <div className="flex items-start justify-between w-full">
        {/* Top-Left: Large Clear Real-Time Speedometer (0 - 250 km/h) & Distance */}
        <div className="flex flex-col bg-slate-900/90 border border-slate-700/70 rounded-2xl p-2.5 sm:p-3 shadow-2xl backdrop-blur-md min-w-[140px] sm:min-w-[170px]">
          <div className="flex items-baseline justify-between space-x-1.5">
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tighter text-white tabular-nums leading-none">
                {speed}
              </span>
              <span className="text-[11px] sm:text-xs font-black text-cyan-400 uppercase tracking-wider">
                KM/H
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400">
              / 250
            </span>
          </div>

          {/* Speed Progression Gauge Bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1.5 border border-slate-700/50">
            <div
              className={`h-full bg-gradient-to-r rounded-full transition-all duration-75 ${speedBarColor}`}
              style={{ width: `${speedPercent}%` }}
            />
          </div>

          {/* Speed Status & Distance */}
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 pt-1">
            <span className="text-cyan-300 font-extrabold text-[9px] sm:text-[10px] tracking-tight">
              {speedStatusLabel}
            </span>
            <span className="tabular-nums text-slate-300">
              {(hudData.distanceMeters / 1000).toFixed(2)} KM
            </span>
          </div>
        </div>

        {/* Top-Center: Score & Close Call Combo Banner (Elevated, Never Blocks Road) */}
        <div className="flex flex-col items-center">
          <div className="bg-slate-900/90 border border-slate-700/70 rounded-2xl px-4 sm:px-5 py-1.5 sm:py-2 shadow-2xl backdrop-blur-md flex items-center space-x-2">
            <span className="text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-widest">
              SCORE
            </span>
            <span className="text-xl sm:text-2xl md:text-3xl font-black text-amber-300 tabular-nums tracking-tight">
              {hudData.score.toLocaleString()}
            </span>
            {hudData.comboMultiplier > 1 && (
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-black text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full uppercase">
                {hudData.comboMultiplier}x
              </span>
            )}
          </div>

          {/* Near-miss close call alert banner */}
          {hudData.lastCloseCallText && (
            <div className="mt-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-black font-black text-xs md:text-sm px-3.5 py-0.5 rounded-full uppercase tracking-wider shadow-lg animate-bounce">
              ⚡ {hudData.lastCloseCallText}
            </div>
          )}
        </div>

        {/* Top-Right: Coins, Nitro Meter & Pause */}
        <div className="flex flex-col items-end space-y-1.5 sm:space-y-2">
          <div className="flex items-center space-x-2">
            {/* Run Coins */}
            <div className="flex items-center space-x-1.5 bg-slate-900/90 border border-slate-700/70 rounded-2xl px-3 py-1.5 shadow-2xl backdrop-blur-md">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-400 border border-amber-200 flex items-center justify-center text-slate-900 font-black text-[10px] sm:text-xs shadow-[0_0_8px_#f59e0b]">
                $
              </div>
              <span className="text-base sm:text-lg font-black text-amber-300 tabular-nums">
                {hudData.runCoins}
              </span>
            </div>

            {/* Pause Button */}
            <button
              onClick={() => {
                soundManager.playClick();
                onPause();
              }}
              className="pointer-events-auto p-2 sm:p-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/70 text-slate-300 hover:text-white hover:bg-slate-800 transition shadow-2xl active:scale-95"
              title="Pause Race"
              aria-label="Pause Race"
            >
              <Pause size={18} />
            </button>
          </div>

          {/* Nitro Gauge Bar */}
          <div className="w-28 sm:w-36 md:w-44 bg-slate-900/90 border border-slate-700/70 rounded-xl p-1.5 sm:p-2 shadow-2xl backdrop-blur-md flex flex-col space-y-1">
            <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-bold">
              <span className="flex items-center space-x-1 text-cyan-400">
                <Flame size={11} />
                <span>NITRO</span>
              </span>
              <span className="text-slate-300 tabular-nums">{hudData.nitroPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/40">
              <div
                className={`h-full rounded-full transition-all duration-75 ${nitroColor}`}
                style={{ width: `${hudData.nitroPercent}%` }}
              />
            </div>
          </div>

          {/* Active Power-up Badges */}
          <div className="flex items-center space-x-1.5 pt-0.5">
            {hudData.shieldActive && (
              <div className="flex items-center space-x-1 bg-emerald-950/90 border border-emerald-500/80 rounded-xl px-2 py-0.5 text-emerald-300 text-[10px] sm:text-xs font-bold shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                <Shield size={12} />
                <span>SHIELD</span>
              </div>
            )}
            {hudData.magnetActive && (
              <div className="flex items-center space-x-1 bg-rose-950/90 border border-rose-500/80 rounded-xl px-2 py-0.5 text-rose-300 text-[10px] sm:text-xs font-bold shadow-[0_0_12px_rgba(244,63,94,0.4)]">
                <Zap size={12} />
                <span>MAGNET {hudData.magnetTimer}s</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM MOBILE CONTROLS: 4 ERGONOMIC BUTTONS IN 2 DISTINCT GROUPS */}
      <div className="flex items-end justify-between w-full">
        {/* GROUP 1: BOTTOM-LEFT (ACCELERATOR & BRAKE) */}
        <div className="pointer-events-auto flex items-end space-x-2 sm:space-x-3.5">
          {/* BRAKE BUTTON (Leftmost) */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              try {
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              } catch (_) {}
              onBrakeStart();
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              try {
                (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
              } catch (_) {}
              onBrakeEnd();
            }}
            onPointerCancel={(e) => {
              e.preventDefault();
              try {
                (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
              } catch (_) {}
              onBrakeEnd();
            }}
            onPointerLeave={onBrakeEnd}
            className="w-[74px] h-[74px] sm:w-[82px] sm:h-[82px] md:w-[88px] md:h-[88px] rounded-3xl bg-rose-950/90 active:bg-rose-600 border-2 border-rose-600/70 active:border-rose-300 text-rose-200 active:text-white flex flex-col items-center justify-center shadow-[0_8px_25px_rgba(225,29,72,0.45)] transition-all active:scale-92 touch-none select-none backdrop-blur-md"
            aria-label="Hold to Brake"
          >
            <Disc3 size={26} className="stroke-[2.5]" />
            <span className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase mt-1">
              BRAKE
            </span>
          </button>

          {/* ACCELERATOR / GAS BUTTON */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              try {
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              } catch (_) {}
              onAccelerateStart();
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              try {
                (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
              } catch (_) {}
              onAccelerateEnd();
            }}
            onPointerCancel={(e) => {
              e.preventDefault();
              try {
                (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
              } catch (_) {}
              onAccelerateEnd();
            }}
            onPointerLeave={onAccelerateEnd}
            className="w-[74px] h-[74px] sm:w-[82px] sm:h-[82px] md:w-[88px] md:h-[88px] rounded-3xl bg-emerald-950/90 active:bg-emerald-600 border-2 border-emerald-500/70 active:border-emerald-300 text-emerald-200 active:text-white flex flex-col items-center justify-center shadow-[0_8px_25px_rgba(16,185,129,0.45)] transition-all active:scale-92 touch-none select-none backdrop-blur-md"
            aria-label="Hold to Accelerate (Gas)"
          >
            <ChevronsUp size={28} className="stroke-[2.5]" />
            <span className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase mt-0.5">
              GAS
            </span>
          </button>
        </div>

        {/* CENTER VIEW: Clean & clear road view with subtle keyboard hints on desktop */}
        <div className="hidden lg:flex items-center space-x-2 bg-slate-900/80 border border-slate-700/60 rounded-full px-4 py-1.5 text-xs text-slate-300 font-medium mb-2 backdrop-blur-md">
          <span className="text-cyan-400 font-bold">W/S</span> Gas/Brake
          <span className="text-slate-600">•</span>
          <span className="text-cyan-400 font-bold">A/D</span> Steer
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 font-bold">SPACE</span> Nitro
        </div>

        {/* GROUP 2: BOTTOM-RIGHT (LEFT & RIGHT STEERING) */}
        <div className="pointer-events-auto flex items-end space-x-2 sm:space-x-3.5">
          {/* STEER LEFT BUTTON */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onSteerLeft();
            }}
            className="w-[74px] h-[74px] sm:w-[82px] sm:h-[82px] md:w-[88px] md:h-[88px] rounded-3xl bg-slate-900/90 active:bg-cyan-600 border-2 border-slate-600/80 active:border-cyan-300 text-white flex flex-col items-center justify-center shadow-[0_8px_25px_rgba(0,0,0,0.65)] transition-all active:scale-92 touch-none select-none backdrop-blur-md"
            aria-label="Steer Left"
          >
            <span className="text-2xl sm:text-3xl font-black leading-none">◀</span>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-300 tracking-wider uppercase mt-1">
              LEFT
            </span>
          </button>

          {/* STEER RIGHT BUTTON */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onSteerRight();
            }}
            className="w-[74px] h-[74px] sm:w-[82px] sm:h-[82px] md:w-[88px] md:h-[88px] rounded-3xl bg-slate-900/90 active:bg-cyan-600 border-2 border-slate-600/80 active:border-cyan-300 text-white flex flex-col items-center justify-center shadow-[0_8px_25px_rgba(0,0,0,0.65)] transition-all active:scale-92 touch-none select-none backdrop-blur-md"
            aria-label="Steer Right"
          >
            <span className="text-2xl sm:text-3xl font-black leading-none">▶</span>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-300 tracking-wider uppercase mt-1">
              RIGHT
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
