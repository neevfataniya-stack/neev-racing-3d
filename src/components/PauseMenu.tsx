import React from 'react';
import { Play, RotateCcw, Warehouse, Home } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface PauseMenuProps {
  score: number;
  distanceMeters: number;
  coins: number;
  audioEnabled?: boolean;
  onResume: () => void;
  onRestart: () => void;
  onGarage: () => void;
  onHome: () => void;
  onToggleAudio?: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  score,
  distanceMeters,
  coins,
  onResume,
  onRestart,
  onGarage,
  onHome,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 select-none overflow-y-auto">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center space-y-3 sm:space-y-4 animate-in fade-in zoom-in-95 duration-150 my-auto">
        <h2 className="text-xl sm:text-2xl font-black text-white italic tracking-wider">GAME PAUSED</h2>

        {/* Stats summary */}
        <div className="w-full bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 grid grid-cols-3 gap-2 text-center">
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">SCORE</span>
            <span className="text-sm font-black text-amber-300 tabular-nums">{score}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">DISTANCE</span>
            <span className="text-sm font-black text-white tabular-nums">{(distanceMeters / 1000).toFixed(2)} km</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">COINS</span>
            <span className="text-sm font-black text-amber-400 tabular-nums">{coins}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col space-y-2.5">
          <button
            onClick={() => {
              soundManager.playClick();
              onResume();
            }}
            className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-base uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg transition active:scale-98"
          >
            <Play size={18} fill="currentColor" />
            <span>RESUME</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onRestart();
            }}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition active:scale-98"
          >
            <RotateCcw size={16} />
            <span>RESTART RACE</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onGarage();
            }}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition active:scale-98"
          >
            <Warehouse size={16} />
            <span>GARAGE</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onHome();
            }}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition active:scale-98"
          >
            <Home size={16} />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
