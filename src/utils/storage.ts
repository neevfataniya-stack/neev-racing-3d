import { CarDefinition, PlayerProgress, EnvironmentType } from '../types/game';

export const CAR_CATALOG: CarDefinition[] = [
  {
    id: 'bmw-m-coupe',
    name: 'Bavaria M-Coupe',
    subtitle: 'Twin-Power Performance Coupe (BMW-inspired)',
    tier: 'Sports Coupe',
    price: 0, // Unlocked starter vehicle
    stats: {
      topSpeed: 230,
      acceleration: 82,
      handling: 88,
      nitroBoost: 78,
    },
    baseColor: '#0284c7',
    accentColor: '#0f172a',
    availableColors: ['#0284c7', '#dc2626', '#f8fafc', '#1e293b', '#eab308'],
    description: 'Inspired by legendary Bavarian sports coupes. Iconic twin-intake kidney styling, rear-wheel drive agility, aggressive quad headlights, and high-speed highway stability.',
  },
  {
    id: 'mercedes-luxury-gt',
    name: 'Silverstar Grand GT',
    subtitle: 'Luxury V8 Bi-Turbo Grand Tourer (Mercedes-Benz-inspired)',
    tier: 'Grand Tourer',
    price: 350,
    stats: {
      topSpeed: 248,
      acceleration: 88,
      handling: 82,
      nitroBoost: 85,
    },
    baseColor: '#94a3b8',
    accentColor: '#0f172a',
    availableColors: ['#94a3b8', '#0f172a', '#dc2626', '#2563eb', '#f8fafc'],
    description: 'Inspired by German luxury sports grand tourers. Long sweeping hood, wide vertical-slat performance grille, silver metallic finish, and effortless V8 velocity.',
  },
  {
    id: 'jaguar-perf-coupe',
    name: 'Predator F-Coupe',
    subtitle: 'Supercharged British GT (Jaguar-inspired)',
    tier: 'Performance',
    price: 700,
    stats: {
      topSpeed: 250,
      acceleration: 90,
      handling: 86,
      nitroBoost: 88,
    },
    baseColor: '#047857',
    accentColor: '#1e293b',
    availableColors: ['#047857', '#e11d48', '#0284c7', '#f8fafc', '#d97706'],
    description: 'Inspired by British performance coupes. Low feline stance, sculpted aero hood vents, distinctive central exhaust, and supercharged highway rush.',
  },
  {
    id: 'mahindra-suv',
    name: 'Maha Trekker 4x4',
    subtitle: 'Rugged Heavy Terrain SUV (Mahindra-inspired)',
    tier: 'Rugged SUV',
    price: 1100,
    stats: {
      topSpeed: 195,
      acceleration: 70,
      handling: 74,
      nitroBoost: 75,
    },
    baseColor: '#059669',
    accentColor: '#18181b',
    availableColors: ['#059669', '#d97706', '#dc2626', '#1e293b', '#475569'],
    description: 'Inspired by robust Indian off-road SUVs. Imposing tall stance, raised ground clearance, side running boards, roof rack, and rear-mounted spare wheel.',
  },
  {
    id: 'ferrari-supercar',
    name: 'Rosso Maranello V12',
    subtitle: 'Exotic Mid-Engine Hyper Supercar (Ferrari-inspired)',
    tier: 'Supercar',
    price: 3200,
    stats: {
      topSpeed: 250,
      acceleration: 98,
      handling: 94,
      nitroBoost: 98,
    },
    baseColor: '#dc2626',
    accentColor: '#0f172a',
    availableColors: ['#dc2626', '#eab308', '#0f172a', '#f8fafc', '#0284c7'],
    description: 'Inspired by Italian mid-engine supercars. Ultra-low aerodynamic wedge, aggressive front nostrils, side air scoops, wide diffuser, and screaming V12 top speed.',
  },
  {
    id: 'suzuki-hatchback',
    name: 'Swift City Hatch',
    subtitle: 'Agile Urban Pocket-Rocket (Maruti Suzuki-inspired)',
    tier: 'Hatchback',
    price: 0, // Unlocked starter vehicle
    stats: {
      topSpeed: 175,
      acceleration: 68,
      handling: 90,
      nitroBoost: 65,
    },
    baseColor: '#00d2ff',
    accentColor: '#111827',
    availableColors: ['#00d2ff', '#ef4444', '#10b981', '#f59e0b', '#6366f1'],
    description: 'Inspired by iconic Japanese & Indian city hatchbacks. Lightweight, razor-sharp handling, and perfect for threading through dense highway traffic.',
  },
  {
    id: 'honda-sedan',
    name: 'Civic Type-V Sedan',
    subtitle: 'High-Rev V-TEC Sport Sedan (Honda-inspired)',
    tier: 'Sport Sedan',
    price: 400,
    stats: {
      topSpeed: 205,
      acceleration: 74,
      handling: 85,
      nitroBoost: 72,
    },
    baseColor: '#3b82f6',
    accentColor: '#1e293b',
    availableColors: ['#3b82f6', '#ffffff', '#e11d48', '#0f172a', '#10b981'],
    description: 'Inspired by Japanese high-performance sport sedans. Fastback aerodynamics, crisp steering feedback, and balanced highway cruising.',
  },
  {
    id: 'jeep-offroad',
    name: 'Trail Raider 4x4',
    subtitle: 'Open-Air Trail Master (Jeep-inspired)',
    tier: 'Off-Road 4x4',
    price: 850,
    stats: {
      topSpeed: 190,
      acceleration: 72,
      handling: 76,
      nitroBoost: 78,
    },
    baseColor: '#f59e0b',
    accentColor: '#1c1917',
    availableColors: ['#f59e0b', '#16a34a', '#dc2626', '#0284c7', '#334155'],
    description: 'Inspired by classic American trail jeeps. Seven-slot vertical grille, exposed roll cage, knobby oversized tires, and heavy-duty bumpers.',
  },
  {
    id: 'cargo-truck',
    name: 'Titan Hauler 18',
    subtitle: 'Commercial Heavy Cargo Semi (Heavy Cargo Truck)',
    tier: 'Heavy Cargo',
    price: 1800,
    stats: {
      topSpeed: 200,
      acceleration: 65,
      handling: 70,
      nitroBoost: 95,
    },
    baseColor: '#ea580c',
    accentColor: '#334155',
    availableColors: ['#ea580c', '#2563eb', '#dc2626', '#16a34a', '#475569'],
    description: 'Commercial heavy cargo truck. Tall cab, massive front chrome grille, dual vertical exhaust smokestacks, enclosed cargo container, and 6 heavy wheels.',
  },
  {
    id: 'premium-luxury-suv',
    name: 'Royal Crown SUV',
    subtitle: 'Flagship Full-Size Luxury SUV (Executive SUV)',
    tier: 'Luxury SUV',
    price: 2400,
    stats: {
      topSpeed: 240,
      acceleration: 84,
      handling: 78,
      nitroBoost: 86,
    },
    baseColor: '#1e1b4b',
    accentColor: '#e2e8f0',
    availableColors: ['#1e1b4b', '#0f172a', '#f8fafc', '#7f1d1d', '#713f12'],
    description: 'Inspired by elite full-size executive luxury SUVs. Monolithic presence, chrome mesh shield grille, panoramic tinted glass, and executive cabin.',
  },
];

const STORAGE_KEY = 'neev_racing_3d_save_v1';

const DEFAULT_PROGRESS: PlayerProgress = {
  coins: 200, // Initial gift for exciting garage exploration!
  highScore: 0,
  bestDistance: 0,
  unlockedCarIds: ['bmw-m-coupe', 'suzuki-hatchback'],
  selectedCarId: 'bmw-m-coupe',
  selectedColor: '#0284c7',
  selectedEnvironment: 'city',
  audioEnabled: true,
  engineVolume: 0.7,
  sfxVolume: 0.8,
  graphicsQuality: 'high',
  steeringSensitivity: 1.0,
};

export function loadPlayerProgress(): PlayerProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw);

    // Ensure unlockedCarIds is valid and always includes starter cars
    let unlocked: string[] = Array.isArray(parsed.unlockedCarIds) && parsed.unlockedCarIds.length > 0
      ? parsed.unlockedCarIds
      : ['bmw-m-coupe', 'suzuki-hatchback'];

    if (!unlocked.includes('bmw-m-coupe')) {
      unlocked = ['bmw-m-coupe', ...unlocked];
    }
    if (!unlocked.includes('suzuki-hatchback')) {
      unlocked.push('suzuki-hatchback');
    }

    let selectedId = parsed.selectedCarId;
    if (!selectedId || !CAR_CATALOG.some((c) => c.id === selectedId)) {
      selectedId = 'bmw-m-coupe';
    }

    const currentCar = CAR_CATALOG.find((c) => c.id === selectedId) || CAR_CATALOG[0];

    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      audioEnabled: true, // Audio is never permanently muted; always active
      unlockedCarIds: unlocked,
      selectedCarId: selectedId,
      selectedColor: parsed.selectedColor || currentCar.baseColor,
    };
  } catch (err) {
    console.warn('Failed to load player progress from localStorage, using defaults', err);
    return { ...DEFAULT_PROGRESS };
  }
}

export function savePlayerProgress(progress: PlayerProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.error('Failed to save player progress', err);
  }
}

export function resetPlayerProgress(): PlayerProgress {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear player progress', err);
  }
  return { ...DEFAULT_PROGRESS, coins: 0 };
}
