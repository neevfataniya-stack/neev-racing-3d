import * as THREE from 'three';
import { EnvironmentType } from '../types/game';

// Cache generated textures so we don't recreate them every frame
const textureCache = new Map<string, THREE.Texture>();

/**
 * Creates procedural road texture with realistic asphalt grain, 4 lanes, dashed lane dividers, and curbs.
 */
export function createRoadTexture(env: EnvironmentType): THREE.CanvasTexture {
  const cacheKey = `road_${env}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey) as THREE.CanvasTexture;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Base asphalt color by environment
  let baseColor = '#1e2124';
  let curbColor1 = '#ef4444';
  let curbColor2 = '#ffffff';

  if (env === 'desert') {
    baseColor = '#2d251e';
    curbColor1 = '#d97706';
    curbColor2 = '#fef3c7';
  } else if (env === 'mountain') {
    baseColor = '#1f2429';
    curbColor1 = '#3b82f6';
    curbColor2 = '#f1f5f9';
  }

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle asphalt noise
  const imgData = ctx.getImageData(0, 0, 1024, 1024);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 16;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Road curbs / rumble strips at left (0..40px) and right (984..1024px)
  const curbSegments = 16;
  const segHeight = 1024 / curbSegments;
  for (let i = 0; i < curbSegments; i++) {
    ctx.fillStyle = i % 2 === 0 ? curbColor1 : curbColor2;
    // Left curb
    ctx.fillRect(0, i * segHeight, 40, segHeight);
    // Right curb
    ctx.fillRect(984, i * segHeight, 40, segHeight);
  }

  // Solid shoulder lines (white)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(41, 0, 6, 1024);
  ctx.fillRect(977, 0, 6, 1024);

  // 4 lanes with 3 dividers placed at exact 4.6m intervals (276px, 512px, 748px)
  const dividers = [276, 512, 748];
  const dashCount = 8;
  const dashLen = 64;
  const gapLen = 64;

  dividers.forEach((x, idx) => {
    // Center divider (idx === 1) is yellow center dash
    if (idx === 1) {
      ctx.fillStyle = '#fbbf24';
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    }

    for (let d = 0; d < dashCount; d++) {
      const y = d * (dashLen + gapLen) + 16;
      ctx.fillRect(x - 3, y, 6, dashLen);
    }
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates procedural building facade texture with illuminated windows.
 */
export function createBuildingTexture(): THREE.CanvasTexture {
  const cacheKey = 'building_facade';
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey) as THREE.CanvasTexture;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Dark steel facade
  ctx.fillStyle = '#0b0f19';
  ctx.fillRect(0, 0, 512, 1024);

  const cols = 8;
  const rows = 24;
  const padX = 14;
  const padY = 16;
  const winW = (512 - padX * (cols + 1)) / cols;
  const winH = (1024 - padY * (rows + 1)) / rows;

  const windowGlows = ['#38bdf8', '#fbbf24', '#f43f5e', '#a78bfa', '#34d399', '#ffffff'];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = padX + c * (winW + padX);
      const y = padY + r * (winH + padY);

      const isLit = Math.random() > 0.35;
      if (isLit) {
        ctx.fillStyle = windowGlows[Math.floor(Math.random() * windowGlows.length)];
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 6;
      } else {
        ctx.fillStyle = '#1e293b';
        ctx.shadowBlur = 0;
      }
      ctx.fillRect(x, y, winW, winH);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates carbon fiber micro-pattern texture.
 */
export function createCarbonFiberTexture(): THREE.CanvasTexture {
  const cacheKey = 'carbon_fiber';
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey) as THREE.CanvasTexture;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#18181b';
  ctx.fillRect(0, 0, 32, 32);

  ctx.fillStyle = '#27272a';
  ctx.fillRect(0, 0, 16, 16);
  ctx.fillRect(16, 16, 16, 16);

  ctx.fillStyle = '#09090b';
  ctx.fillRect(0, 16, 16, 16);
  ctx.fillRect(16, 0, 16, 16);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Procedural Wheel Rim Texture for sports cars.
 */
export function createWheelRimTexture(): THREE.CanvasTexture {
  const cacheKey = 'wheel_rim';
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey) as THREE.CanvasTexture;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const center = 128;

  // Outer tire rubber
  ctx.fillStyle = '#18181b';
  ctx.beginPath();
  ctx.arc(center, center, 124, 0, Math.PI * 2);
  ctx.fill();

  // Alloy rim outer ring
  ctx.fillStyle = '#d4d4d8';
  ctx.beginPath();
  ctx.arc(center, center, 84, 0, Math.PI * 2);
  ctx.fill();

  // Inner brake rotor
  ctx.fillStyle = '#3f3f46';
  ctx.beginPath();
  ctx.arc(center, center, 74, 0, Math.PI * 2);
  ctx.fill();

  // 5 Twin spokes
  ctx.strokeStyle = '#e4e4e7';
  ctx.lineWidth = 10;
  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5;
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineTo(center + Math.cos(angle) * 78, center + Math.sin(angle) * 78);
    ctx.stroke();
  }

  // Red brake caliper accent
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(center + 30, center - 20, 18, 0, Math.PI * 2);
  ctx.fill();

  // Center hubcap
  ctx.fillStyle = '#18181b';
  ctx.beginPath();
  ctx.arc(center, center, 22, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}
