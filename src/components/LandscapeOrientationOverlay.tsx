import React from 'react';
import { Smartphone, Maximize2, Play } from 'lucide-react';

interface LandscapeOrientationOverlayProps {
  onEnterGame: () => void;
  onDismiss?: () => void;
}

export const LandscapeOrientationOverlay: React.FC<LandscapeOrientationOverlayProps> = ({
  onEnterGame,
  onDismiss,
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl text-center select-none overflow-hidden animate-in fade-in duration-300">
      {/* Background ambient neon glow */}
      <div className="absolute w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none -top-10" />
      <div className="absolute w-72 h-72 rounded-full bg-pink-500/10 blur-3xl pointer-events-none -bottom-10" />

      {/* Main Container Card */}
      <div className="relative flex flex-col items-center max-w-sm sm:max-w-md w-full bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.2)]">
        {/* Animated Phone Rotation Icon */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center mb-6">
          {/* Glowing pulse ring */}
          <div className="absolute inset-0 rounded-full border border-cyan-400/40 animate-ping opacity-30" />
          <div className="absolute inset-2 rounded-full bg-cyan-950/60 border border-cyan-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.35)]" />

          {/* SVG with smoothly rotating phone */}
          <svg
            className="w-16 h-16 sm:w-20 sm:h-20 text-cyan-400 drop-shadow-[0_0_12px_#22d3ee]"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Curved rotation guidance arrows */}
            <path
              d="M 22 28 A 32 32 0 0 1 78 28"
              stroke="#38bdf8"
              strokeWidth="3.5"
              strokeDasharray="6 4"
              strokeLinecap="round"
            />
            <polygon points="76,20 86,28 78,38" fill="#38bdf8" />

            <path
              d="M 78 72 A 32 32 0 0 1 22 72"
              stroke="#38bdf8"
              strokeWidth="3.5"
              strokeDasharray="6 4"
              strokeLinecap="round"
            />
            <polygon points="24,80 14,72 22,62" fill="#38bdf8" />

            {/* Rotating Smartphone Graphic */}
            <g className="origin-center animate-[spin_4s_ease-in-out_infinite]">
              <rect
                x="34"
                y="20"
                width="32"
                height="60"
                rx="6"
                fill="#0f172a"
                stroke="#06b6d4"
                strokeWidth="3"
              />
              {/* Screen */}
              <rect x="38" y="27" width="24" height="46" rx="2" fill="#0284c7" fillOpacity="0.3" />
              {/* Speaker / Notch */}
              <line x1="46" y1="23.5" x2="54" y2="23.5" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
              {/* Home bar */}
              <line x1="45" y1="76" x2="55" y2="76" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
            </g>
          </svg>
        </div>

        {/* Required Headline Message */}
        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white italic drop-shadow-md leading-tight mb-2">
          PLEASE ROTATE YOUR PHONE TO LANDSCAPE MODE
        </h2>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-slate-300 font-medium mb-6 leading-relaxed max-w-xs">
          Turn your device horizontally for the optimal highway racing view and mobile thumb controls.
        </p>

        {/* Action Button: TAP TO PLAY / ENTER GAME */}
        <button
          onClick={onEnterGame}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-base sm:text-lg tracking-wider uppercase flex items-center justify-center space-x-3 shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-95 transition-all cursor-pointer"
        >
          <Play size={22} fill="currentColor" />
          <span>ENTER GAME</span>
          <Maximize2 size={18} className="opacity-70 ml-1" />
        </button>

        {/* Secondary Dismiss Option (Allows desktop testing or bypass if preferred) */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="mt-4 text-xs font-semibold text-slate-400 hover:text-slate-200 underline underline-offset-4 transition active:opacity-75 cursor-pointer py-1"
          >
            Continue in portrait mode
          </button>
        )}
      </div>
    </div>
  );
};
