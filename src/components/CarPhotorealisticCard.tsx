import React from 'react';
import { CarDefinition } from '../types/game';

interface CarPhotorealisticCardProps {
  car: CarDefinition;
  activeColor?: string;
  className?: string;
}

export const CarPhotorealisticCard: React.FC<CarPhotorealisticCardProps> = ({
  car,
  activeColor,
  className = '',
}) => {
  const color = activeColor || car.baseColor;

  // Render high-fidelity, distinct automotive illustrations with realistic lighting and metallic gradients
  const renderVehicleGraphic = () => {
    switch (car.id) {
      case 'bmw-m-coupe':
        // BMW-inspired sports coupe: Twin kidney grille, angel-eye quad DRLs, aerodynamic roofline
        return (
          <svg viewBox="0 0 500 240" className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]">
            <defs>
              <linearGradient id="bmwBody" x1="0%" y1="0%" x2="100%" y2="40%">
                <stop offset="0%" stopColor={color} />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#081b2f" />
              </linearGradient>
              <linearGradient id="bmwGlass" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.75" />
                <stop offset="60%" stopColor="#0f172a" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.4" />
              </linearGradient>
              <radialGradient id="bmwWheel" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#cbd5e1" />
                <stop offset="60%" stopColor="#334155" />
                <stop offset="100%" stopColor="#0f172a" />
              </radialGradient>
            </defs>
            {/* Ground shadow */}
            <ellipse cx="250" cy="215" rx="210" ry="18" fill="#000000" opacity="0.65" />
            {/* Lower diffuser & skirts */}
            <path d="M 60 188 L 440 188 L 420 196 L 70 196 Z" fill="#0f172a" />
            {/* Main Coupe Body */}
            <path
              d="M 50 175 Q 60 148 105 142 L 160 138 L 220 90 Q 280 82 350 88 L 415 132 Q 445 138 460 162 Q 465 178 440 182 L 65 182 Q 48 180 50 175 Z"
              fill="url(#bmwBody)"
            />
            {/* Greenhouse Glass */}
            <path
              d="M 172 135 L 226 95 Q 280 88 344 94 L 398 135 Z"
              fill="url(#bmwGlass)"
              stroke="#0f172a"
              strokeWidth="3"
            />
            {/* A-pillar / B-pillar */}
            <line x1="285" y1="91" x2="280" y2="135" stroke="#0f172a" strokeWidth="4" />
            {/* Distinctive BMW Twin Kidney Grille on Front Nose */}
            <rect x="428" y="146" width="14" height="22" rx="4" fill="#020617" stroke="#cbd5e1" strokeWidth="2" />
            <rect x="445" y="146" width="14" height="22" rx="4" fill="#020617" stroke="#cbd5e1" strokeWidth="2" />
            {/* Kidney Grille Slats */}
            <line x1="435" y1="147" x2="435" y2="167" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="452" y1="147" x2="452" y2="167" stroke="#94a3b8" strokeWidth="1.5" />
            {/* Angel-Eye LED Headlight Glow */}
            <ellipse cx="420" cy="144" rx="7" ry="4" fill="#38bdf8" />
            <circle cx="420" cy="144" r="2.5" fill="#ffffff" />
            {/* Wheels */}
            <circle cx="115" cy="182" r="34" fill="#0f172a" stroke="#475569" strokeWidth="4" />
            <circle cx="115" cy="182" r="24" fill="url(#bmwWheel)" />
            <circle cx="375" cy="182" r="34" fill="#0f172a" stroke="#475569" strokeWidth="4" />
            <circle cx="375" cy="182" r="24" fill="url(#bmwWheel)" />
            {/* Calipers */}
            <rect x="122" y="174" width="8" height="16" rx="2" fill="#0284c7" />
            <rect x="382" y="174" width="8" height="16" rx="2" fill="#0284c7" />
          </svg>
        );

      case 'mercedes-luxury-gt':
        // Mercedes-Benz-inspired luxury sports car: Sweeping long hood, Panamericana vertical grille
        return (
          <svg viewBox="0 0 500 240" className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]">
            <defs>
              <linearGradient id="mercBody" x1="0%" y1="0%" x2="100%" y2="30%">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="40%" stopColor={color} />
                <stop offset="75%" stopColor="#ffffff" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
            </defs>
            <ellipse cx="250" cy="216" rx="215" ry="18" fill="#000000" opacity="0.65" />
            {/* Long Hood Grand Tourer Body */}
            <path
              d="M 52 172 Q 58 142 98 136 L 150 134 L 205 98 Q 260 92 310 96 L 430 132 Q 462 140 468 162 Q 465 178 440 182 L 68 182 Z"
              fill="url(#mercBody)"
            />
            {/* Low Sleek Cockpit */}
            <path d="M 160 132 L 210 102 Q 255 96 305 100 L 335 132 Z" fill="#0f172a" opacity="0.9" />
            {/* Panamericana Grille Vanes */}
            <path d="M 436 142 Q 456 142 462 165 L 436 166 Z" fill="#020617" stroke="#cbd5e1" strokeWidth="2" />
            <line x1="442" y1="145" x2="442" y2="164" stroke="#ffffff" strokeWidth="2" />
            <line x1="448" y1="144" x2="448" y2="165" stroke="#ffffff" strokeWidth="2" />
            <line x1="454" y1="146" x2="454" y2="164" stroke="#ffffff" strokeWidth="2" />
            {/* Star badge emblem */}
            <circle cx="448" cy="154" r="5" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
            {/* Wheels with AMG Multi-spokes */}
            <circle cx="118" cy="182" r="33" fill="#020617" stroke="#64748b" strokeWidth="4" />
            <circle cx="118" cy="182" r="23" fill="#94a3b8" />
            <circle cx="380" cy="182" r="33" fill="#020617" stroke="#64748b" strokeWidth="4" />
            <circle cx="380" cy="182" r="23" fill="#94a3b8" />
          </svg>
        );

      case 'jaguar-perf-coupe':
        // Jaguar-inspired performance coupe: Low feline stance, aero hood vents, British racing green
        return (
          <svg viewBox="0 0 500 240" className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]">
            <ellipse cx="250" cy="216" rx="212" ry="18" fill="#000000" opacity="0.65" />
            <path
              d="M 54 174 Q 60 146 100 140 L 175 136 L 225 94 Q 280 88 335 92 L 418 132 Q 452 138 462 160 Q 460 178 438 182 L 68 182 Z"
              fill={color}
            />
            {/* Highlight */}
            <path d="M 110 142 L 412 134 Q 440 140 454 154" stroke="#6ee7b7" strokeWidth="3" fill="none" opacity="0.6" />
            {/* Cockpit */}
            <path d="M 180 134 L 228 98 Q 275 92 328 96 L 368 134 Z" fill="#064e3b" opacity="0.95" />
            {/* J-blade DRL */}
            <path d="M 426 142 Q 442 144 448 152" stroke="#ffffff" strokeWidth="3" fill="none" />
            <circle cx="120" cy="182" r="33" fill="#020617" stroke="#475569" strokeWidth="4" />
            <circle cx="120" cy="182" r="22" fill="#64748b" />
            <circle cx="376" cy="182" r="33" fill="#020617" stroke="#475569" strokeWidth="4" />
            <circle cx="376" cy="182" r="22" fill="#64748b" />
          </svg>
        );

      case 'mahindra-suv':
        // Mahindra-inspired SUV: Tall boxy muscular stance, 6-slot vertical grille, rear spare wheel
        return (
          <svg viewBox="0 0 500 240" className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]">
            <ellipse cx="250" cy="218" rx="215" ry="18" fill="#000000" opacity="0.65" />
            {/* Rear Spare Wheel Mount */}
            <rect x="36" y="118" width="22" height="54" rx="8" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
            {/* Boxy Tough SUV Body */}
            <path
              d="M 52 176 L 56 112 Q 60 98 75 96 L 160 92 L 340 92 L 398 126 L 452 134 Q 466 144 466 168 L 442 178 L 68 178 Z"
              fill={color}
            />
            {/* Roof Rack */}
            <rect x="100" y="84" width="220" height="6" rx="2" fill="#27272a" />
            <line x1="120" y1="90" x2="120" y2="84" stroke="#52525b" strokeWidth="3" />
            <line x1="200" y1="90" x2="200" y2="84" stroke="#52525b" strokeWidth="3" />
            <line x1="280" y1="90" x2="280" y2="84" stroke="#52525b" strokeWidth="3" />
            {/* High Windows */}
            <path d="M 72 104 L 160 102 L 160 130 L 72 130 Z" fill="#09090b" opacity="0.85" />
            <path d="M 172 102 L 255 102 L 255 130 L 172 130 Z" fill="#09090b" opacity="0.85" />
            <path d="M 267 102 L 334 102 L 378 130 L 267 130 Z" fill="#09090b" opacity="0.85" />
            {/* Front Rugged Slotted Grille */}
            <rect x="424" y="142" width="34" height="24" rx="4" fill="#18181b" stroke="#71717a" strokeWidth="2" />
            <line x1="432" y1="145" x2="432" y2="163" stroke="#e4e4e7" strokeWidth="2" />
            <line x1="440" y1="145" x2="440" y2="163" stroke="#e4e4e7" strokeWidth="2" />
            <line x1="448" y1="145" x2="448" y2="163" stroke="#e4e4e7" strokeWidth="2" />
            {/* Big Heavy-Duty Tires */}
            <circle cx="120" cy="180" r="36" fill="#09090b" stroke="#3f3f46" strokeWidth="5" />
            <circle cx="120" cy="180" r="22" fill="#52525b" />
            <circle cx="370" cy="180" r="36" fill="#09090b" stroke="#3f3f46" strokeWidth="5" />
            <circle cx="370" cy="180" r="22" fill="#52525b" />
          </svg>
        );

      case 'jeep-offroad':
        // Jeep-inspired off-road SUV: Open roll cage, 7-slot front grille, round retro headlights
        return (
          <svg viewBox="0 0 500 240" className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]">
            <ellipse cx="250" cy="218" rx="215" ry="18" fill="#000000" opacity="0.65" />
            {/* Roll Cage Tubing */}
            <path d="M 70 145 L 80 88 L 310 88 L 335 138" stroke="#1c1917" strokeWidth="6" fill="none" />
            <path d="M 180 88 L 180 145" stroke="#1c1917" strokeWidth="5" fill="none" />
            <path d="M 260 88 L 260 145" stroke="#1c1917" strokeWidth="5" fill="none" />
            {/* Body Tub */}
            <path
              d="M 60 176 L 62 140 L 330 140 L 410 140 L 452 146 Q 464 154 464 172 L 436 178 L 74 178 Z"
              fill={color}
            />
            {/* 7-Slot Grille on Flat Front */}
            <rect x="424" y="146" width="34" height="22" rx="3" fill="#1c1917" stroke="#78716c" strokeWidth="1.5" />
            <line x1="430" y1="149" x2="430" y2="165" stroke="#f59e0b" strokeWidth="1.5" />
            <line x1="435" y1="149" x2="435" y2="165" stroke="#f59e0b" strokeWidth="1.5" />
            <line x1="440" y1="149" x2="440" y2="165" stroke="#f59e0b" strokeWidth="1.5" />
            <line x1="445" y1="149" x2="445" y2="165" stroke="#f59e0b" strokeWidth="1.5" />
            <line x1="450" y1="149" x2="450" y2="165" stroke="#f59e0b" strokeWidth="1.5" />
            {/* Round Retro Headlights */}
            <circle cx="418" cy="154" r="6" fill="#fef08a" stroke="#ffffff" strokeWidth="1.5" />
            {/* Huge Knobby Tires */}
            <circle cx="120" cy="180" r="38" fill="#1c1917" stroke="#44403c" strokeWidth="6" />
            <circle cx="120" cy="180" r="22" fill="#78716c" />
            <circle cx="365" cy="180" r="38" fill="#1c1917" stroke="#44403c" strokeWidth="6" />
            <circle cx="365" cy="180" r="22" fill="#78716c" />
          </svg>
        );

      case 'ferrari-supercar':
        // Ferrari-inspired supercar: Ultra-low wedge, Rosso Corsa red, side scoops, yellow calipers
        return (
          <svg viewBox="0 0 500 240" className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]">
            <ellipse cx="250" cy="216" rx="215" ry="18" fill="#000000" opacity="0.65" />
            {/* Ultra Low Supercar Wedge */}
            <path
              d="M 45 174 Q 48 152 75 146 L 160 142 L 235 98 Q 300 90 355 106 L 442 144 Q 470 152 475 168 L 445 180 L 55 180 Z"
              fill={color}
            />
            {/* Aggressive Roof Canopy Glass */}
            <path d="M 180 140 L 240 102 Q 295 94 345 108 L 380 140 Z" fill="#09090b" opacity="0.95" />
            {/* Side Intake Scoop */}
            <path d="M 165 148 L 220 148 L 195 168 Z" fill="#450a0a" stroke="#7f1d1d" strokeWidth="1" />
            {/* Front Aero Winglet */}
            <path d="M 425 152 L 468 156 L 460 170 Z" fill="#09090b" />
            {/* Screaming LED Blade */}
            <path d="M 410 144 Q 436 148 448 155" stroke="#fef08a" strokeWidth="3" fill="none" />
            {/* Wheels & Maranello Yellow Calipers */}
            <circle cx="115" cy="182" r="33" fill="#09090b" stroke="#27272a" strokeWidth="4" />
            <circle cx="115" cy="182" r="23" fill="#3f3f46" />
            <rect x="122" y="174" width="7" height="15" rx="2" fill="#eab308" />
            <circle cx="382" cy="182" r="33" fill="#09090b" stroke="#27272a" strokeWidth="4" />
            <circle cx="382" cy="182" r="23" fill="#3f3f46" />
            <rect x="389" y="174" width="7" height="15" rx="2" fill="#eab308" />
          </svg>
        );

      case 'suzuki-hatchback':
        // Maruti Suzuki-inspired hatchback: Compact, agile urban hot hatch, floating roof
        return (
          <svg viewBox="0 0 500 240" className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]">
            <ellipse cx="250" cy="216" rx="205" ry="18" fill="#000000" opacity="0.65" />
            {/* Compact Hatchback Body */}
            <path
              d="M 68 174 L 62 136 Q 66 108 95 106 L 270 102 L 350 128 L 430 146 Q 448 155 450 172 L 425 180 L 80 180 Z"
              fill={color}
            />
            {/* Floating Black Roof */}
            <path d="M 85 102 L 285 98 L 280 106 L 85 106 Z" fill="#0f172a" />
            {/* Hatch Glass */}
            <path d="M 98 110 L 260 106 L 275 136 L 105 136 Z" fill="#0f172a" opacity="0.88" />
            <path d="M 282 108 L 338 128 L 332 136 L 282 136 Z" fill="#0f172a" opacity="0.88" />
            {/* Honeycomb Grille */}
            <ellipse cx="426" cy="160" rx="16" ry="10" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
            {/* Wheels */}
            <circle cx="125" cy="182" r="32" fill="#0f172a" stroke="#475569" strokeWidth="4" />
            <circle cx="125" cy="182" r="22" fill="#94a3b8" />
            <circle cx="360" cy="182" r="32" fill="#0f172a" stroke="#475569" strokeWidth="4" />
            <circle cx="360" cy="182" r="22" fill="#94a3b8" />
          </svg>
        );

      case 'honda-sedan':
        // Honda-inspired sedan: Fastback sport sedan, aerodynamic wedge, high-rev character
        return (
          <svg viewBox="0 0 500 240" className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]">
            <ellipse cx="250" cy="216" rx="212" ry="18" fill="#000000" opacity="0.65" />
            {/* Sport Sedan Body */}
            <path
              d="M 50 174 Q 56 146 95 140 L 160 136 L 225 96 Q 285 90 350 96 L 420 134 Q 455 140 464 162 Q 460 178 438 182 L 68 182 Z"
              fill={color}
            />
            {/* Fastback Glass */}
            <path d="M 168 134 L 230 100 Q 280 94 345 98 L 392 134 Z" fill="#0f172a" opacity="0.9" />
            {/* Jewel Eye Headlights */}
            <path d="M 425 140 L 452 144 L 444 152 Z" fill="#38bdf8" />
            <line x1="428" y1="142" x2="448" y2="145" stroke="#ffffff" strokeWidth="2" />
            {/* Wheels */}
            <circle cx="118" cy="182" r="33" fill="#0f172a" stroke="#475569" strokeWidth="4" />
            <circle cx="118" cy="182" r="23" fill="#64748b" />
            <circle cx="375" cy="182" r="33" fill="#0f172a" stroke="#475569" strokeWidth="4" />
            <circle cx="375" cy="182" r="23" fill="#64748b" />
          </svg>
        );

      case 'cargo-truck':
        // Heavy cargo truck: Tall cab, massive front chrome grille, dual vertical exhaust smokestacks
        return (
          <svg viewBox="0 0 500 240" className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]">
            <ellipse cx="250" cy="218" rx="220" ry="18" fill="#000000" opacity="0.65" />
            {/* Dual Chrome Exhaust Smokestacks */}
            <rect x="290" y="45" width="8" height="90" rx="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
            <rect x="302" y="45" width="8" height="90" rx="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
            {/* Enclosed Heavy Container Cargo Box */}
            <rect x="45" y="70" width="235" height="106" rx="4" fill="#334155" stroke="#475569" strokeWidth="3" />
            <line x1="120" y1="70" x2="120" y2="176" stroke="#1e293b" strokeWidth="2" />
            <line x1="195" y1="70" x2="195" y2="176" stroke="#1e293b" strokeWidth="2" />
            {/* Tall Cab Front */}
            <path
              d="M 285 176 L 285 78 Q 288 64 305 64 L 385 64 L 442 115 L 465 125 Q 472 135 472 168 L 445 178 L 285 178 Z"
              fill={color}
            />
            {/* Cab Windshield */}
            <path d="M 320 72 L 378 72 L 425 115 L 320 115 Z" fill="#0f172a" opacity="0.88" />
            {/* Giant Chrome Grille */}
            <rect x="430" y="125" width="38" height="42" rx="4" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
            <line x1="438" y1="128" x2="438" y2="164" stroke="#475569" strokeWidth="2" />
            <line x1="448" y1="128" x2="448" y2="164" stroke="#475569" strokeWidth="2" />
            <line x1="458" y1="128" x2="458" y2="164" stroke="#475569" strokeWidth="2" />
            {/* 6 Wheels / Tandem Axles */}
            <circle cx="95" cy="180" r="32" fill="#0f172a" stroke="#475569" strokeWidth="5" />
            <circle cx="165" cy="180" r="32" fill="#0f172a" stroke="#475569" strokeWidth="5" />
            <circle cx="390" cy="180" r="34" fill="#0f172a" stroke="#475569" strokeWidth="5" />
          </svg>
        );

      case 'premium-luxury-suv':
      default:
        // Premium full-size SUV: Monolithic executive stance, large chrome mesh grille, tinted glass
        return (
          <svg viewBox="0 0 500 240" className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]">
            <ellipse cx="250" cy="218" rx="215" ry="18" fill="#000000" opacity="0.65" />
            {/* Executive Monolith Body */}
            <path
              d="M 52 176 L 56 120 Q 60 98 80 96 L 310 94 L 388 126 L 448 136 Q 465 146 465 168 L 440 178 L 68 178 Z"
              fill={color}
            />
            {/* Chrome Window Trim & Privacy Glass */}
            <path
              d="M 85 104 L 175 102 L 175 130 L 85 130 Z"
              fill="#020617"
              stroke="#cbd5e1"
              strokeWidth="2"
              opacity="0.95"
            />
            <path
              d="M 185 102 L 275 102 L 275 130 L 185 130 Z"
              fill="#020617"
              stroke="#cbd5e1"
              strokeWidth="2"
              opacity="0.95"
            />
            <path
              d="M 285 102 L 340 102 L 378 130 L 285 130 Z"
              fill="#020617"
              stroke="#cbd5e1"
              strokeWidth="2"
              opacity="0.95"
            />
            {/* Huge Chrome Mesh Grille */}
            <rect x="424" y="140" width="36" height="28" rx="4" fill="#020617" stroke="#e2e8f0" strokeWidth="2.5" />
            {/* LED Matrix Headlights */}
            <path d="M 408 138 L 424 140 L 420 148 Z" fill="#ffffff" />
            {/* Big 22-inch Multi-Spoke Wheels */}
            <circle cx="120" cy="180" r="35" fill="#020617" stroke="#cbd5e1" strokeWidth="4" />
            <circle cx="120" cy="180" r="23" fill="#64748b" />
            <circle cx="375" cy="180" r="35" fill="#020617" stroke="#cbd5e1" strokeWidth="4" />
            <circle cx="375" cy="180" r="23" fill="#64748b" />
          </svg>
        );
    }
  };

  return (
    <div
      className={`relative rounded-3xl overflow-hidden bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-black border border-slate-700/60 p-4 shadow-2xl flex flex-col items-center justify-between ${className}`}
    >
      {/* Studio Lighting Rim & Spotlight Effects */}
      <div className="absolute top-0 left-1/4 right-1/4 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />

      {/* Vehicle Top Header */}
      <div className="w-full flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-[11px] font-black uppercase tracking-widest text-cyan-400">
            {car.tier}
          </span>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-800/80 px-2 py-0.5 rounded-md">
          {car.stats.topSpeed} KM/H TOP
        </span>
      </div>

      {/* Main Automotive Studio Render */}
      <div className="w-full max-w-[420px] aspect-[16/9] my-2 flex items-center justify-center relative z-10">
        {renderVehicleGraphic()}
      </div>

      {/* Subtitle & Specs Footer */}
      <div className="w-full flex items-center justify-between text-xs text-slate-300 z-10 pt-1 border-t border-slate-800/80">
        <span className="font-bold text-white tracking-tight truncate max-w-[160px] sm:max-w-[200px]">
          {car.name}
        </span>
        <div className="flex items-center space-x-2 text-[11px] font-semibold text-slate-400 tabular-nums">
          <span>⚡ {car.stats.acceleration}%</span>
          <span>•</span>
          <span>🎯 {car.stats.handling}%</span>
        </div>
      </div>
    </div>
  );
};
