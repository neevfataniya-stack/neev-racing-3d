import React, { useEffect } from 'react';
import { EndGameStats } from '../types/game';
import { RotateCcw, Warehouse, Home, Award, Zap, Gauge, DollarSign } from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import confetti from 'canvas-confetti';

interface GameOverModalProps {
  stats: EndGameStats;
  totalCoins: number;
  highScore: number;
  onPlayAgain: () => void;
  onGarage: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  totalCoins,
  highScore,
  onPlayAgain,
  onGarage,
  onHome,
}) => {
  useEffect(() => {
    if (stats.isNewHighScore) {
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
        });
      } catch (_) {}
    }
  }, [stats.isNewHighScore]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 select-none animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center space-y-3 sm:space-y-4 my-auto">
        {/* Banner */}
        <div className="text-center">
          <span className="text-xs font-black uppercase tracking-widest text-rose-500">
            HIGHWAY CRASH
          </span>
          <h2 className="text-3xl font-black text-white italic tracking-tight">RACE FINISHED</h2>
        </div>

        {/* New High Score Callout */}
        {stats.isNewHighScore && (
          <div className="w-full py-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl text-center shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center justify-center space-x-2">
            <Award size={18} />
            <span>NEW HIGH SCORE!</span>
          </div>
        )}

        {/* Main Score Display */}
        <div className="w-full bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 text-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">FINAL SCORE</span>
          <div className="text-4xl font-black text-amber-300 tabular-nums tracking-tight">
            {stats.score.toLocaleString()}
          </div>
          <span className="text-xs text-slate-400 block mt-1">
            ALL-TIME BEST: <span className="text-white font-bold">{highScore.toLocaleString()}</span>
          </span>
        </div>

        {/* Run Detailed Breakdown Grid */}
        <div className="w-full grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-2.5 flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400">
              <Gauge size={16} />
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">DISTANCE</span>
              <span className="font-bold text-white tabular-nums">
                {(stats.distanceMeters / 1000).toFixed(2)} KM
              </span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-2.5 flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-950 text-amber-400">
              <DollarSign size={16} />
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">COINS EARNED</span>
              <span className="font-bold text-amber-300 tabular-nums">+{stats.coinsCollected}</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-2.5 flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400">
              <Zap size={16} />
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">NEAR MISSES</span>
              <span className="font-bold text-emerald-300 tabular-nums">{stats.nearMisses}</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-2.5 flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-pink-950 text-pink-400">
              <Gauge size={16} />
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">TOP SPEED</span>
              <span className="font-bold text-pink-300 tabular-nums">{stats.topSpeedReached} KM/H</span>
            </div>
          </div>
        </div>

        {/* Total Bank Balance */}
        <div className="w-full flex items-center justify-between text-xs text-slate-300 px-1">
          <span>TOTAL BANK BALANCE:</span>
          <span className="font-black text-amber-400 tabular-nums flex items-center space-x-1">
            <span>$</span>
            <span>{totalCoins.toLocaleString()}</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col space-y-2.5 pt-2">
          <button
            onClick={() => {
              soundManager.playClick();
              onPlayAgain();
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-base uppercase tracking-wider flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition active:scale-98"
          >
            <RotateCcw size={18} />
            <span>PLAY AGAIN</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                soundManager.playClick();
                onGarage();
              }}
              className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition active:scale-98"
            >
              <Warehouse size={15} />
              <span>GARAGE</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onHome();
              }}
              className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition active:scale-98"
            >
              <Home size={15} />
              <span>MAIN MENU</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
