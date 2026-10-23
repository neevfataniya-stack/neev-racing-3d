import * as THREE from 'three';

export interface Particle {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  color: THREE.Color;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export class ParticleManager {
  private particles: Particle[] = [];
  private geom: THREE.BufferGeometry;
  private pMesh: THREE.Points;
  private posArr: Float32Array;
  private colArr: Float32Array;
  private maxParticles = 600;

  // Speed lines
  private speedLinesGeom: THREE.BufferGeometry;
  private speedLinesMesh: THREE.LineSegments;
  private speedLinesCount = 70;
  private speedLinePositions: Float32Array;

  constructor(scene: THREE.Scene) {
    // 1. Point particles for exhaust, sparks, coin collection
    this.geom = new THREE.BufferGeometry();
    this.posArr = new Float32Array(this.maxParticles * 3);
    this.colArr = new Float32Array(this.maxParticles * 3);

    this.geom.setAttribute('position', new THREE.BufferAttribute(this.posArr, 3));
    this.geom.setAttribute('color', new THREE.BufferAttribute(this.colArr, 3));

    // Circle sprite texture for round glowing particles
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.4, 'rgba(255,255,255,0.8)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const pTex = new THREE.CanvasTexture(canvas);

    const pMat = new THREE.PointsMaterial({
      size: 0.6,
      map: pTex,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.pMesh = new THREE.Points(this.geom, pMat);
    scene.add(this.pMesh);

    // 2. Speed lines (warp streaks during high speed / nitro)
    this.speedLinesGeom = new THREE.BufferGeometry();
    this.speedLinePositions = new Float32Array(this.speedLinesCount * 6);
    this.speedLinesGeom.setAttribute('position', new THREE.BufferAttribute(this.speedLinePositions, 3));

    const lineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    this.speedLinesMesh = new THREE.LineSegments(this.speedLinesGeom, lineMat);
    this.speedLinesMesh.visible = false;
    scene.add(this.speedLinesMesh);
  }

  public emitExhaust(pos: THREE.Vector3, isNitro: boolean) {
    if (this.particles.length >= this.maxParticles) return;

    const count = isNitro ? 3 : 1;
    for (let i = 0; i < count; i++) {
      const p: Particle = {
        pos: pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.15, (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1)),
        vel: new THREE.Vector3((Math.random() - 0.5) * 0.4, Math.random() * 0.3, -2.5 - Math.random() * 2),
        color: isNitro
          ? (Math.random() > 0.4 ? new THREE.Color(0x06b6d4) : new THREE.Color(0xa855f7))
          : (Math.random() > 0.5 ? new THREE.Color(0xf97316) : new THREE.Color(0x64748b)),
        size: isNitro ? 0.75 : 0.45,
        alpha: 1.0,
        life: 0,
        maxLife: isNitro ? 0.35 : 0.25,
      };
      this.particles.push(p);
    }
  }

  public emitSparks(pos: THREE.Vector3, count = 25) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const speed = 4 + Math.random() * 8;
      const angle = Math.random() * Math.PI * 2;
      const up = 1 + Math.random() * 4;

      const p: Particle = {
        pos: pos.clone(),
        vel: new THREE.Vector3(Math.cos(angle) * speed, up, Math.sin(angle) * speed),
        color: new THREE.Color(Math.random() > 0.3 ? 0xfbbf24 : 0xef4444),
        size: 0.5,
        alpha: 1.0,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.4,
      };
      this.particles.push(p);
    }
  }

  public emitCoinPickup(pos: THREE.Vector3) {
    for (let i = 0; i < 20; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = (i / 20) * Math.PI * 2;
      const speed = 3.5 + Math.random() * 2;
      const p: Particle = {
        pos: pos.clone(),
        vel: new THREE.Vector3(Math.cos(angle) * speed, 1.5 + Math.random() * 2, Math.sin(angle) * speed),
        color: new THREE.Color(0xfef08a),
        size: 0.6,
        alpha: 1.0,
        life: 0,
        maxLife: 0.45,
      };
      this.particles.push(p);
    }
  }

  public update(dt: number, playerPos: THREE.Vector3, speedKmh: number, isNitro: boolean) {
    // 1. Update point particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }
      p.pos.addScaledVector(p.vel, dt);
      p.vel.y -= 3 * dt; // gravity
      p.alpha = 1 - p.life / p.maxLife;
    }

    // Write to buffer
    const pLen = this.particles.length;
    for (let i = 0; i < this.maxParticles; i++) {
      if (i < pLen) {
        const p = this.particles[i];
        this.posArr[i * 3] = p.pos.x;
        this.posArr[i * 3 + 1] = p.pos.y;
        this.posArr[i * 3 + 2] = p.pos.z;

        this.colArr[i * 3] = p.color.r * p.alpha;
        this.colArr[i * 3 + 1] = p.color.g * p.alpha;
        this.colArr[i * 3 + 2] = p.color.b * p.alpha;
      } else {
        this.posArr[i * 3] = 0;
        this.posArr[i * 3 + 1] = -1000;
        this.posArr[i * 3 + 2] = 0;
      }
    }
    this.geom.attributes.position.needsUpdate = true;
    this.geom.attributes.color.needsUpdate = true;

    // 2. Speed lines during fast driving (>160 km/h or nitro)
    if (speedKmh > 160 || isNitro) {
      this.speedLinesMesh.visible = true;
      const spreadX = 20;
      const spreadY = 8;
      const lineLen = 8 + (speedKmh / 20);

      for (let i = 0; i < this.speedLinesCount; i++) {
        const idx = i * 6;
        // Seed pseudo-random positions centered around player
        const rx = playerPos.x + (Math.sin(i * 99 + playerPos.z * 0.05) * spreadX);
        const ry = playerPos.y + 1 + (Math.cos(i * 77) * spreadY * 0.5);
        const rz = playerPos.z + 10 + ((i * 123 + playerPos.z * 1.5) % 80);

        this.speedLinePositions[idx] = rx;
        this.speedLinePositions[idx + 1] = ry;
        this.speedLinePositions[idx + 2] = rz;

        this.speedLinePositions[idx + 3] = rx;
        this.speedLinePositions[idx + 4] = ry;
        this.speedLinePositions[idx + 5] = rz - lineLen;
      }
      this.speedLinesGeom.attributes.position.needsUpdate = true;
    } else {
      this.speedLinesMesh.visible = false;
    }
  }

  public dispose(scene: THREE.Scene) {
    scene.remove(this.pMesh);
    scene.remove(this.speedLinesMesh);
    this.geom.dispose();
    this.speedLinesGeom.dispose();
  }
}

/**
 * Creates 3D Golden Coin collectible
 */
export function createCoinMesh(): THREE.Group {
  const group = new THREE.Group();

  const coinGeom = new THREE.CylinderGeometry(0.85, 0.85, 0.16, 20);
  coinGeom.rotateX(Math.PI / 2); // Face forward

  const coinMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xd97706,
    emissiveIntensity: 0.6,
    metalness: 0.9,
    roughness: 0.15,
  });

  const mesh = new THREE.Mesh(coinGeom, coinMat);
  mesh.castShadow = true;
  group.add(mesh);

  // Outer rim
  const rimGeom = new THREE.TorusGeometry(0.85, 0.06, 8, 20);
  const rim = new THREE.Mesh(rimGeom, coinMat);
  group.add(rim);

  group.position.y = 1.0;
  return group;
}

/**
 * Creates Nitro Canister collectible
 */
export function createNitroPickupMesh(): THREE.Group {
  const group = new THREE.Group();

  // Cyan glowing bottle
  const bottleMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    emissive: 0x0891b2,
    emissiveIntensity: 1.2,
    metalness: 0.8,
    roughness: 0.2,
  });
  const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.2, 16), bottleMat);
  bottle.castShadow = true;

  // Cap
  const capMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.1 });
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.3, 12), capMat);
  cap.position.y = 0.75;

  group.add(bottle, cap);
  group.position.y = 1.0;
  return group;
}

/**
 * Creates Shield Power-up collectible
 */
export function createShieldPickupMesh(): THREE.Group {
  const group = new THREE.Group();

  const shieldMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x059669,
    emissiveIntensity: 1.4,
    metalness: 0.4,
    roughness: 0.2,
    transparent: true,
    opacity: 0.9,
  });

  const icosa = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 1), shieldMat);
  icosa.castShadow = true;
  group.add(icosa);
  group.position.y = 1.0;
  return group;
}

/**
 * Creates Magnet Power-up collectible
 */
export function createMagnetPickupMesh(): THREE.Group {
  const group = new THREE.Group();

  const magnetMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xb91c1c,
    emissiveIntensity: 1.0,
    metalness: 0.7,
    roughness: 0.3,
  });

  const horseshoe = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.18, 12, 16, Math.PI), magnetMat);
  horseshoe.rotateZ(Math.PI);
  group.add(horseshoe);

  const tipMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.1 });
  const tip1 = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.2, 0.36), tipMat);
  tip1.position.set(-0.55, -0.1, 0);
  const tip2 = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.2, 0.36), tipMat);
  tip2.position.set(0.55, -0.1, 0);
  group.add(tip1, tip2);

  group.position.y = 1.0;
  return group;
}

/**
 * Creates Energy Shield bubble attached around player car
 */
export function createShieldBubbleMesh(): THREE.Mesh {
  const geom = new THREE.SphereGeometry(3.0, 24, 20);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.8,
    metalness: 0.1,
    roughness: 0.1,
    transmission: 0.8,
    transparent: true,
    opacity: 0.45,
    wireframe: true,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.visible = false;
  return mesh;
}
