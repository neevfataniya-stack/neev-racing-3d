import React from 'react';
import { X, Flame, Shield, Zap, DollarSign, Smartphone, Laptop } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 select-none animate-in fade-in duration-150 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col space-y-5 my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-white italic tracking-wider">HOW TO PLAY</h2>
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

        {/* Desktop Controls */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-black uppercase tracking-wider">
            <Laptop size={16} />
            <span>DESKTOP KEYBOARD CONTROLS</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-900 p-2 rounded-xl flex items-center justify-between">
              <span className="text-slate-400">Steer Left / Right</span>
              <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded">A / D or ← / →</span>
            </div>
            <div className="bg-slate-900 p-2 rounded-xl flex items-center justify-between">
              <span className="text-slate-400">Accelerate (Gas)</span>
              <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded">W or ↑</span>
            </div>
            <div className="bg-slate-900 p-2 rounded-xl flex items-center justify-between">
              <span className="text-slate-400">Brake</span>
              <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded">S or ↓</span>
            </div>
            <div className="bg-slate-900 p-2 rounded-xl flex items-center justify-between">
              <span className="text-slate-400">Nitro Boost</span>
              <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded">SPACE</span>
            </div>
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-black uppercase tracking-wider">
            <Smartphone size={16} />
            <span>MOBILE CONTROLS (4 LARGE THUMB CONTROLS)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-900 p-2.5 rounded-xl flex flex-col space-y-1">
              <span className="font-bold text-emerald-300">Bottom-Left: Gas & Brake</span>
              <span className="text-slate-400 text-[11px]">Hold <strong className="text-white">GAS</strong> to accelerate up to top speed. Hold <strong className="text-white">BRAKE</strong> to slow down safely. Releasing cruises smoothly without abrupt stops.</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-xl flex flex-col space-y-1">
              <span className="font-bold text-cyan-300">Bottom-Right: Left & Right Steer</span>
              <span className="text-slate-400 text-[11px]">Tap <strong className="text-white">◀ LEFT</strong> or <strong className="text-white">RIGHT ▶</strong> to switch between the 4 highway lanes. Steer while accelerating or braking!</span>
            </div>
          </div>
        </div>

        {/* Power-ups & Scoring Tips */}
        <div className="space-y-2">
          <span className="text-xs font-black text-slate-300 uppercase tracking-wider block">
            COLLECTIBLES & SCORING
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl flex items-start space-x-2.5">
              <div className="p-1.5 rounded-lg bg-amber-950 text-amber-400 mt-0.5">
                <DollarSign size={16} />
              </div>
              <div>
                <span className="font-bold text-white block">Highway Coins</span>
                <span className="text-slate-400 text-[11px]">Save up coins to unlock all 10 vehicles in the Garage!</span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl flex items-start space-x-2.5">
              <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 mt-0.5">
                <Flame size={16} />
              </div>
              <div>
                <span className="font-bold text-white block">Nitro Canister</span>
                <span className="text-slate-400 text-[11px]">Instantly refills +35% nitro energy for extreme burst speed.</span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl flex items-start space-x-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 mt-0.5">
                <Shield size={16} />
              </div>
              <div>
                <span className="font-bold text-white block">Energy Shield</span>
                <span className="text-slate-400 text-[11px]">Absorbs one major collision with traffic cars safely.</span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl flex items-start space-x-2.5">
              <div className="p-1.5 rounded-lg bg-rose-950 text-rose-400 mt-0.5">
                <Zap size={16} />
              </div>
              <div>
                <span className="font-bold text-white block">Close Calls</span>
                <span className="text-slate-400 text-[11px]">Overtake traffic closely at high speed for score multipliers!</span>
              </div>
            </div>
          </div>
        </div>

        {/* OK Button */}
        <button
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm uppercase tracking-wider transition"
        >
          GOT IT, LET'S RACE!
        </button>
      </div>
    </div>
  );
};
