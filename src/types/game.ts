export type EnvironmentType = 'city' | 'desert' | 'mountain';

export interface CarStats {
  topSpeed: number; // in km/h (e.g. 180 to 280)
  acceleration: number; // 0-100 score (e.g. 60 to 98)
  handling: number; // 0-100 score (steer responsiveness)
  nitroBoost: number; // 0-100 score (nitro strength & recharge)
}

export interface CarDefinition {
  id: string;
  name: string;
  subtitle: string;
  tier: string;
  price: number;
  stats: CarStats;
  baseColor: string;
  accentColor: string;
  availableColors: string[];
  description: string;
}

export interface PlayerProgress {
  coins: number;
  highScore: number;
  bestDistance: number;
  unlockedCarIds: string[];
  selectedCarId: string;
  selectedColor: string;
  selectedEnvironment: EnvironmentType;
  audioEnabled: boolean;
  engineVolume: number;
  sfxVolume: number;
  graphicsQuality: 'high' | 'medium' | 'low';
  steeringSensitivity: number; // 0.8 to 1.5
}

export type GameStatus = 'menu' | 'garage' | 'playing' | 'paused' | 'gameover' | 'settings' | 'help';

export interface GameplayHUDData {
  speedKmh: number;
  distanceMeters: number;
  score: number;
  runCoins: number;
  nitroPercent: number;
  isNitroActive: boolean;
  shieldActive: boolean;
  magnetActive: boolean;
  magnetTimer: number;
  comboMultiplier: number;
  lastCloseCallText: string | null;
}

export interface EndGameStats {
  distanceMeters: number;
  coinsCollected: number;
  score: number;
  nearMisses: number;
  topSpeedReached: number;
  isNewHighScore: boolean;
}
