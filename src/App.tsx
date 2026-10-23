import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { MainMenu } from './components/MainMenu';
import { GarageMenu } from './components/GarageMenu';
import { PauseMenu } from './components/PauseMenu';
import { GameOverModal } from './components/GameOverModal';
import { SettingsModal } from './components/SettingsModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { LandscapeOrientationOverlay } from './components/LandscapeOrientationOverlay';
import { GameScene } from './three/gameScene';
import { EnvironmentType, GameplayHUDData, GameStatus, EndGameStats, PlayerProgress } from './types/game';
import { loadPlayerProgress, savePlayerProgress, resetPlayerProgress } from './utils/storage';
import { soundManager } from './audio/soundManager';

export default function App() {
  const [progress, setProgress] = useState<PlayerProgress>(loadPlayerProgress);
  const [gameStatus, setGameStatus] = useState<GameStatus>('menu');
  const [previousStatus, setPreviousStatus] = useState<GameStatus>('menu');

  // Real-time HUD data
  const [hudData, setHudData] = useState<GameplayHUDData>({
    speedKmh: 0,
    distanceMeters: 0,
    score: 0,
    runCoins: 0,
    nitroPercent: 100,
    isNitroActive: false,
    shieldActive: false,
    magnetActive: false,
    magnetTimer: 0,
    comboMultiplier: 1,
    lastCloseCallText: null,
  });

  // End Game Stats for Game Over screen
  const [endStats, setEndStats] = useState<EndGameStats>({
    distanceMeters: 0,
    coinsCollected: 0,
    score: 0,
    nearMisses: 0,
    topSpeedReached: 0,
    isNewHighScore: false,
  });

  const sceneRef = useRef<GameScene | null>(null);

  // Landscape Mode & Orientation Management
  const [isPortrait, setIsPortrait] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerHeight > window.innerWidth;
  });
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (('maxTouchPoints' in navigator && navigator.maxTouchPoints > 0) &&
        window.matchMedia('(pointer: coarse)').matches)
    );
  });
  const [isOverlayDismissed, setIsOverlayDismissed] = useState<boolean>(false);

  // Request Fullscreen and Landscape Orientation across modern mobile platforms
  const requestLandscapeFullscreen = useCallback(async () => {
    // 1. Fullscreen API
    try {
      const docEl = document.documentElement as any;
      if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen().catch(() => {});
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen();
        }
      }
    } catch (_) {
      // Handled safely without interrupting game
    }

    // 2. Screen Orientation API
    try {
      const screenOrientation = window.screen?.orientation as any;
      if (screenOrientation && typeof screenOrientation.lock === 'function') {
        await screenOrientation.lock('landscape').catch(() => {});
      } else if ((window.screen as any).lockOrientation) {
        (window.screen as any).lockOrientation('landscape');
      } else if ((window.screen as any).webkitLockOrientation) {
        (window.screen as any).webkitLockOrientation('landscape');
      }
    } catch (_) {
      // Handled safely without interrupting game
    }
  }, []);

  // 1-second auto request: On mobile phone launch, wait ~1s, then request fullscreen & landscape automatically
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isMobile) {
        requestLandscapeFullscreen();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isMobile, requestLandscapeFullscreen]);

  // Orientation and window resize listener
  useEffect(() => {
    const handleOrientationChange = () => {
      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(portrait);
      if (!portrait) {
        setIsOverlayDismissed(false);
      }
      if (sceneRef.current) {
        sceneRef.current.handleResize();
      }
      // Re-measure after mobile UI transition settles
      setTimeout(() => {
        if (sceneRef.current) {
          sceneRef.current.handleResize();
        }
      }, 100);
    };

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);
    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener('change', handleOrientationChange);
    }

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener('change', handleOrientationChange);
      }
    };
  }, []);

  // User interaction trigger for Enter Game / Tap to Play on orientation overlay
  const handleEnterLandscapeMode = async () => {
    soundManager.resumeAudio();
    await requestLandscapeFullscreen();
    const portrait = window.innerHeight > window.innerWidth;
    setIsPortrait(portrait);
    if (sceneRef.current) {
      sceneRef.current.handleResize();
    }
    setTimeout(() => {
      if (sceneRef.current) {
        sceneRef.current.handleResize();
      }
    }, 120);
  };

  // Sync player progress changes to localStorage
  const updateProgress = useCallback((updated: Partial<PlayerProgress>) => {
    setProgress((prev) => {
      const next = { ...prev, ...updated };
      savePlayerProgress(next);
      return next;
    });
  }, []);

  // When Three.js scene finishes initialization
  const handleSceneReady = useCallback((scene: GameScene) => {
    sceneRef.current = scene;

    // Connect callbacks
    (scene as any).callbacks = {
      onHUDUpdate: (data: GameplayHUDData) => {
        setHudData(data);
      },
      onCoinCollected: (_runCoins: number) => {
        // live coin pickup audio handled by scene
      },
      onGameOver: (stats: EndGameStats) => {
        soundManager.stopRacingMusic();
        setProgress((prev) => {
          const isNewHigh = stats.score > prev.highScore;
          const updatedHighScore = Math.max(prev.highScore, stats.score);
          const updatedCoins = prev.coins + stats.coinsCollected;
          const updatedDistance = Math.max(prev.bestDistance, stats.distanceMeters);

          const newProgress: PlayerProgress = {
            ...prev,
            coins: updatedCoins,
            highScore: updatedHighScore,
            bestDistance: updatedDistance,
          };
          savePlayerProgress(newProgress);

          setEndStats({
            ...stats,
            isNewHighScore: isNewHigh,
          });

          return newProgress;
        });

        setGameStatus('gameover');
      },
    };

    // Initial scene configuration from saved progress
    const saved = loadPlayerProgress();
    scene.applyEnvironment(saved.selectedEnvironment);
    scene.setCar(saved.selectedCarId, saved.selectedColor);
    scene.setSensitivity(saved.steeringSensitivity);
    scene.setGraphicsQuality(saved.graphicsQuality);
    soundManager.setMuted(!saved.audioEnabled);
    soundManager.setVolumes(saved.engineVolume, saved.sfxVolume);
  }, []);

  // Unlock Web Audio context on first user interaction for mobile browser compliance
  useEffect(() => {
    const handleFirstGesture = () => {
      soundManager.resumeAudio();
    };
    window.addEventListener('touchstart', handleFirstGesture, { once: true, passive: true });
    window.addEventListener('pointerdown', handleFirstGesture, { once: true, passive: true });
    window.addEventListener('click', handleFirstGesture, { once: true, passive: true });
    return () => {
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('click', handleFirstGesture);
    };
  }, []);

  // Keyboard navigation for Pause (Escape/P) and Start (Enter/Space on menu)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameStatus === 'playing') {
        if (e.code === 'Escape' || e.code === 'KeyP') {
          e.preventDefault();
          handlePause();
        }
      } else if (gameStatus === 'paused') {
        if (e.code === 'Escape' || e.code === 'KeyP') {
          e.preventDefault();
          handleResume();
        }
      } else if (gameStatus === 'menu') {
        if (e.code === 'Enter') {
          e.preventDefault();
          handleStartRace();
        }
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameStatus]);

  const handleStartRace = () => {
    if (!sceneRef.current) return;
    soundManager.resumeAudio();
    soundManager.startRacingMusic();
    setGameStatus('playing');
    sceneRef.current.setCar(progress.selectedCarId, progress.selectedColor);
    sceneRef.current.applyEnvironment(progress.selectedEnvironment);
    sceneRef.current.startRace();
  };

  const handlePause = () => {
    if (!sceneRef.current) return;
    setGameStatus('paused');
    sceneRef.current.setMode('paused');
    soundManager.stopEngine();
    soundManager.pauseRacingMusic();
  };

  const handleResume = () => {
    if (!sceneRef.current) return;
    soundManager.resumeAudio();
    soundManager.startRacingMusic();
    setGameStatus('playing');
    sceneRef.current.setMode('playing');
  };

  const handleRestart = () => {
    handleStartRace();
  };

  const handleHome = () => {
    if (!sceneRef.current) return;
    soundManager.stopRacingMusic();
    soundManager.stopEngine();
    setGameStatus('menu');
    sceneRef.current.setMode('showcase');
    sceneRef.current.setCar(progress.selectedCarId, progress.selectedColor);
  };

  const handleOpenGarage = () => {
    if (!sceneRef.current) return;
    soundManager.stopRacingMusic();
    soundManager.stopEngine();
    setGameStatus('garage');
    sceneRef.current.setMode('showcase');
    sceneRef.current.setCar(progress.selectedCarId, progress.selectedColor);
  };

  const handleSelectCar = (carId: string) => {
    updateProgress({ selectedCarId: carId });
    if (sceneRef.current) {
      sceneRef.current.setCar(carId, progress.selectedColor);
    }
  };

  const handleSelectColor = (color: string) => {
    updateProgress({ selectedColor: color });
    if (sceneRef.current) {
      sceneRef.current.setPaintColor(color);
    }
  };

  const handleUnlockCar = (carId: string, cost: number) => {
    if (progress.coins < cost) return;
    const newUnlocked = [...progress.unlockedCarIds, carId];
    const newCoins = progress.coins - cost;
    updateProgress({
      unlockedCarIds: newUnlocked,
      coins: newCoins,
      selectedCarId: carId,
    });
    if (sceneRef.current) {
      sceneRef.current.setCar(carId, progress.selectedColor);
    }
  };

  const handleChangePreviewCar = (carId: string, color: string) => {
    if (sceneRef.current) {
      sceneRef.current.setCar(carId, color);
    }
  };

  const handleSelectEnvironment = (env: EnvironmentType) => {
    updateProgress({ selectedEnvironment: env });
    if (sceneRef.current) {
      sceneRef.current.applyEnvironment(env);
    }
  };

  const handleToggleAudio = () => {
    const newVal = !progress.audioEnabled;
    soundManager.setMuted(!newVal);
    updateProgress({ audioEnabled: newVal });
  };

  const handleOpenSettings = () => {
    setPreviousStatus(gameStatus);
    setGameStatus('settings');
  };

  const handleCloseSettings = () => {
    setGameStatus(previousStatus);
  };

  const handleOpenHelp = () => {
    setPreviousStatus(gameStatus);
    setGameStatus('help');
  };

  const handleCloseHelp = () => {
    setGameStatus(previousStatus);
  };

  const handleResetProgress = () => {
    const fresh = resetPlayerProgress();
    setProgress(fresh);
    if (sceneRef.current) {
      sceneRef.current.setCar(fresh.selectedCarId, fresh.selectedColor);
      sceneRef.current.applyEnvironment(fresh.selectedEnvironment);
    }
  };

  // Mobile Touch Controls Handlers
  const handleSteerLeft = () => {
    if (sceneRef.current) sceneRef.current.steerLeft();
  };
  const handleSteerRight = () => {
    if (sceneRef.current) sceneRef.current.steerRight();
  };
  const handleAccelerateStart = () => {
    if (sceneRef.current) sceneRef.current.setAccelerate(true);
  };
  const handleAccelerateEnd = () => {
    if (sceneRef.current) sceneRef.current.setAccelerate(false);
  };
  const handleBrakeStart = () => {
    if (sceneRef.current) sceneRef.current.setBrake(true);
  };
  const handleBrakeEnd = () => {
    if (sceneRef.current) sceneRef.current.setBrake(false);
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 1. Underlying persistent 3D WebGL Canvas */}
      <GameCanvas onSceneReady={handleSceneReady} />

      {/* 2. In-Game HUD (Visible during 'playing') */}
      {gameStatus === 'playing' && (
        <HUD
          hudData={hudData}
          audioEnabled={progress.audioEnabled}
          onToggleAudio={handleToggleAudio}
          onPause={handlePause}
          onSteerLeft={handleSteerLeft}
          onSteerRight={handleSteerRight}
          onAccelerateStart={handleAccelerateStart}
          onAccelerateEnd={handleAccelerateEnd}
          onBrakeStart={handleBrakeStart}
          onBrakeEnd={handleBrakeEnd}
        />
      )}

      {/* 3. Main Menu */}
      {gameStatus === 'menu' && (
        <MainMenu
          progress={progress}
          onStartRace={handleStartRace}
          onOpenGarage={handleOpenGarage}
          onOpenSettings={handleOpenSettings}
          onOpenHelp={handleOpenHelp}
          onSelectEnvironment={handleSelectEnvironment}
          onToggleAudio={handleToggleAudio}
          onSelectCar={handleSelectCar}
          onChangePreviewCar={handleChangePreviewCar}
          onUnlockCar={handleUnlockCar}
        />
      )}

      {/* 4. Garage / Car Selection */}
      {gameStatus === 'garage' && (
        <GarageMenu
          progress={progress}
          onSelectCar={handleSelectCar}
          onSelectColor={handleSelectColor}
          onUnlockCar={handleUnlockCar}
          onBack={handleHome}
          onChangePreviewCar={handleChangePreviewCar}
        />
      )}

      {/* 5. Pause Menu */}
      {gameStatus === 'paused' && (
        <PauseMenu
          score={hudData.score}
          distanceMeters={hudData.distanceMeters}
          coins={hudData.runCoins}
          audioEnabled={progress.audioEnabled}
          onResume={handleResume}
          onRestart={handleRestart}
          onGarage={handleOpenGarage}
          onHome={handleHome}
          onToggleAudio={handleToggleAudio}
        />
      )}

      {/* 6. Game Over Modal */}
      {gameStatus === 'gameover' && (
        <GameOverModal
          stats={endStats}
          totalCoins={progress.coins}
          highScore={progress.highScore}
          onPlayAgain={handleRestart}
          onGarage={handleOpenGarage}
          onHome={handleHome}
        />
      )}

      {/* 7. Settings Modal */}
      {gameStatus === 'settings' && (
        <SettingsModal
          progress={progress}
          onUpdateProgress={updateProgress}
          onResetProgress={handleResetProgress}
          onClose={handleCloseSettings}
        />
      )}

      {/* 8. How to Play Guide Modal */}
      {gameStatus === 'help' && <HowToPlayModal onClose={handleCloseHelp} />}

      {/* 9. Fullscreen Landscape Mode Requirement Overlay */}
      {isPortrait && isMobile && !isOverlayDismissed && (
        <LandscapeOrientationOverlay
          onEnterGame={handleEnterLandscapeMode}
          onDismiss={() => setIsOverlayDismissed(true)}
        />
      )}
    </main>
  );
}
