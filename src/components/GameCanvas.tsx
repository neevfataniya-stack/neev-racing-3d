import React, { useEffect, useRef } from 'react';
import { GameScene } from '../three/gameScene';

interface GameCanvasProps {
  onSceneReady: (scene: GameScene) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ onSceneReady }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let sceneInstance: GameScene | null = null;
    try {
      sceneInstance = new GameScene(containerRef.current, {
        onHUDUpdate: () => {},
        onGameOver: () => {},
        onCoinCollected: () => {},
      });
      onSceneReady(sceneInstance);
    } catch (err) {
      console.error('Failed to initialize 3D Game Scene', err);
    }

    return () => {
      if (sceneInstance) {
        sceneInstance.dispose();
      }
    };
  }, [onSceneReady]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden bg-black select-none pointer-events-auto"
      style={{ touchAction: 'none' }}
    />
  );
};
