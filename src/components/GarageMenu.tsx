import React, { useState } from 'react';
import { CarDefinition, PlayerProgress } from '../types/game';
import { CAR_CATALOG } from '../utils/storage';
import { CarPhotorealisticCard } from './CarPhotorealisticCard';
import { ChevronLeft, ChevronRight, Check, Lock, ArrowLeft, Zap, Gauge, Flame, Sparkles } from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import confetti from 'canvas-confetti';

interface GarageMenuProps {
  progress: PlayerProgress;
  onSelectCar: (carId: string) => void;
  onSelectColor: (color: string) => void;
  onUnlockCar: (carId: string, cost: number) => void;
  onBack: () => void;
  onChangePreviewCar: (carId: string, color: string) => void;
}

export const GarageMenu: React.FC<GarageMenuProps> = ({
  progress,
  onSelectCar,
  onSelectColor,
  onUnlockCar,
  onBack,
  onChangePreviewCar,
}) => {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const idx = CAR_CATALOG.findIndex((c) => c.id === progress.selectedCarId);
    return idx >= 0 ? idx : 0;
  });

  const [showPhotoCard, setShowPhotoCard] = useState(false);

  const car = CAR_CATALOG[currentIndex];
  const isUnlocked = progress.unlockedCarIds.includes(car.id);
  const isSelected = progress.selectedCarId === car.id;
  const canAfford = progress.coins >= car.price;

  const handlePrev = () => {
    soundManager.playClick();
    const nextIdx = (currentIndex - 1 + CAR_CATALOG.length) % CAR_CATALOG.length;
    setCurrentIndex(nextIdx);
    const nextCar = CAR_CATALOG[nextIdx];
    onChangePreviewCar(nextCar.id, nextCar.availableColors[0]);
  };

  const handleNext = () => {
    soundManager.playClick();
    const nextIdx = (currentIndex + 1) % CAR_CATALOG.length;
    setCurrentIndex(nextIdx);
    const nextCar = CAR_CATALOG[nextIdx];
    onChangePreviewCar(nextCar.id, nextCar.availableColors[0]);
  };

  const handleColorChange = (c: string) => {
    soundManager.playClick();
    onSelectColor(c);
    onChangePreviewCar(car.id, c);
  };

  const handleBuy = () => {
    if (!canAfford || isUnlocked) return;
    soundManager.playPowerUp();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (_) {}
    onUnlockCar(car.id, car.price);
  };

  const handleSelect = () => {
    soundManager.playClick();
    onSelectCar(car.id);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-6 select-none z-10 overflow-y-auto">
      {/* TOP BAR */}
      <div className="flex items-center justify-between w-full pointer-events-auto">
        <button
          onClick={() => {
            soundManager.playClick();
            onBack();
          }}
          className="flex items-center space-x-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-2xl px-4 py-2 text-white font-bold text-xs sm:text-sm shadow-xl transition backdrop-blur-md"
        >
          <ArrowLeft size={16} />
          <span>BACK TO MENU</span>
        </button>

        {/* View Toggle (3D Model vs 2D Diagram) */}
        <button
          onClick={() => setShowPhotoCard(!showPhotoCard)}
          className="flex items-center space-x-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-2xl px-3.5 py-1.5 text-xs font-bold text-cyan-300 shadow-xl backdrop-blur-md"
        >
          <Sparkles size={14} />
          <span>{showPhotoCard ? 'SHOW 3D CAR' : 'SPEC CARD'}</span>
        </button>

        {/* Current Coins */}
        <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-700/80 rounded-2xl px-3.5 py-2 shadow-xl backdrop-blur-md">
          <div className="w-5 h-5 rounded-full bg-amber-400 border border-amber-200 flex items-center justify-center text-slate-900 font-black text-xs shadow-[0_0_8px_#f59e0b]">
            $
          </div>
          <span className="text-base sm:text-lg font-black text-amber-300 tabular-nums">
            {progress.coins.toLocaleString()}
          </span>
        </div>
      </div>

      {/* CAR SWITCHER ARROWS (Floating Left & Right) & 3D TURNTABLE VIEW */}
      <div className="flex items-center justify-between w-full pointer-events-auto px-1 sm:px-4 my-auto">
        <button
          onClick={handlePrev}
          className="p-3 sm:p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-white shadow-2xl transition active:scale-90 backdrop-blur-md z-20"
          aria-label="Previous Car"
        >
          <ChevronLeft size={28} />
        </button>

        {/* Optional floating 2D spec diagram only if explicitly toggled on; by default, transparent 3D car turntable */}
        {showPhotoCard ? (
          <div className="w-full max-w-sm sm:max-w-md mx-2 animate-fadeIn pointer-events-auto">
            <CarPhotorealisticCard car={car} activeColor={progress.selectedColor} />
          </div>
        ) : (
          <div className="w-full flex-1 min-h-[140px] pointer-events-none" />
        )}

        <button
          onClick={handleNext}
          className="p-3 sm:p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-white shadow-2xl transition active:scale-90 backdrop-blur-md z-20"
          aria-label="Next Car"
        >
          <ChevronRight size={28} />
        </button>
      </div>

      {/* BOTTOM VEHICLE SPEC DOCK & ACTIONS */}
      <div className="pointer-events-auto w-full max-w-4xl mx-auto bg-slate-900/95 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-md mt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5 items-center">
          {/* Left: Car Title, Tier, & Stats */}
          <div className="flex flex-col space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-cyan-400">
                  {car.tier}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white italic tracking-tight">{car.name}</h2>
                <p className="text-[11px] text-slate-400">{car.subtitle}</p>
              </div>
              <span className="text-xs text-amber-300 font-black bg-slate-800 px-2.5 py-1 rounded-xl">
                {currentIndex + 1} / {CAR_CATALOG.length}
              </span>
            </div>

            <p className="text-xs text-slate-300 line-clamp-2">{car.description}</p>

            {/* Performance Stat Bars */}
            <div className="space-y-1.5 pt-1">
              {/* Top Speed */}
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center space-x-1.5 text-slate-400 font-semibold">
                  <Gauge size={13} className="text-cyan-400" />
                  <span>Top Speed</span>
                </span>
                <span className="font-bold text-white tabular-nums">{car.stats.topSpeed} KM/H</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full"
                  style={{ width: `${(car.stats.topSpeed / 250) * 100}%` }}
                />
              </div>

              {/* Acceleration */}
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center space-x-1.5 text-slate-400 font-semibold">
                  <Zap size={13} className="text-amber-400" />
                  <span>Acceleration</span>
                </span>
                <span className="font-bold text-white tabular-nums">{car.stats.acceleration}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${car.stats.acceleration}%` }}
                />
              </div>

              {/* Handling */}
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center space-x-1.5 text-slate-400 font-semibold">
                  <span>🎯</span>
                  <span>Handling</span>
                </span>
                <span className="font-bold text-white tabular-nums">{car.stats.handling}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full"
                  style={{ width: `${car.stats.handling}%` }}
                />
              </div>

              {/* Nitro Power */}
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center space-x-1.5 text-slate-400 font-semibold">
                  <Flame size={13} className="text-pink-400" />
                  <span>Nitro Boost</span>
                </span>
                <span className="font-bold text-white tabular-nums">{car.stats.nitroBoost}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-500 rounded-full"
                  style={{ width: `${car.stats.nitroBoost}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right: Color Customization & Purchase/Select Action */}
          <div className="flex flex-col space-y-3 md:border-l md:border-slate-800 md:pl-5">
            {/* Color Swatches */}
            <div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                Custom Paint Finish
              </span>
              <div className="flex items-center space-x-2.5">
                {car.availableColors.map((color) => {
                  const isColorActive = progress.selectedColor === color;
                  return (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color)}
                      className={`w-8 h-8 rounded-full transition-transform border-2 ${
                        isColorActive ? 'scale-115 border-white shadow-[0_0_12px_rgba(255,255,255,0.6)]' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      title={`Select Color ${color}`}
                      aria-label={`Select Color ${color}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Action Button: Select vs Unlock */}
            <div className="pt-1">
              {isUnlocked ? (
                <button
                  onClick={handleSelect}
                  disabled={isSelected}
                  className={`w-full py-3 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition ${
                    isSelected
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 cursor-default'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-98'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check size={18} />
                      <span>SELECTED CAR</span>
                    </>
                  ) : (
                    <span>DRIVE THIS CAR</span>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleBuy}
                  disabled={!canAfford}
                  className={`w-full py-3 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition ${
                    canAfford
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.5)] active:scale-98'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  <Lock size={16} />
                  <span>
                    {canAfford ? `UNLOCK FOR ${car.price.toLocaleString()} COINS` : `NEED ${car.price.toLocaleString()} COINS`}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
