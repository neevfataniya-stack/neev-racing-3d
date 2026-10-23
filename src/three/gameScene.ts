import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CarDefinition, EnvironmentType, GameplayHUDData, EndGameStats } from '../types/game';
import { CAR_CATALOG } from '../utils/storage';
import { BuiltCar, BuiltTraffic, createPlayerCar, createTrafficVehicle } from './carBuilder';
import {
  buildRoadChunk,
  CHUNK_LENGTH,
  ENV_CONFIGS,
  LANE_CENTERS,
  ROAD_WIDTH,
  RoadChunk,
  TOTAL_CHUNKS,
} from './worldBuilder';
import {
  createCoinMesh,
  createMagnetPickupMesh,
  createNitroPickupMesh,
  createShieldBubbleMesh,
  createShieldPickupMesh,
  ParticleManager,
} from './particleSystem';
import { soundManager } from '../audio/soundManager';

// Pre-allocated math objects to eliminate GC in render loop
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _boxPlayer = new THREE.Box3();
const _boxTarget = new THREE.Box3();

export interface GameSceneCallbacks {
  onHUDUpdate: (data: GameplayHUDData) => void;
  onGameOver: (stats: EndGameStats) => void;
  onCoinCollected: (totalRunCoins: number) => void;
}

interface ActiveTraffic {
  traffic: BuiltTraffic;
  lane: number;
  speedKmh: number;
  z: number;
  x: number;
  hasNearMissed: boolean;
}

interface ActiveCollectible {
  group: THREE.Group;
  type: 'coin' | 'nitro' | 'shield' | 'magnet';
  x: number;
  z: number;
  collected: boolean;
}

export class GameScene {
  private container: HTMLDivElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private isSoftwareGl: boolean = false;
  private isDisposed: boolean = false;
  private animFrameId: number = 0;

  // Environment & Lighting
  private currentEnv: EnvironmentType = 'city';
  private hemiLight!: THREE.HemisphereLight;
  private dirLight!: THREE.DirectionalLight;
  private roadChunks: RoadChunk[] = [];

  // Player state
  private playerCarId: string = 'suzuki-hatchback';
  private playerColor: string = '#00d2ff';
  private playerBuiltCar: BuiltCar | null = null;
  private shieldBubbleMesh: THREE.Mesh | null = null;

  // Racing Speed System Constants (0 km/h start, 80-160 km/h normal racing, 250 km/h max)
  public static readonly INITIAL_SPEED_KMH = 0;
  public static readonly NORMAL_CRUISE_MIN = 80;
  public static readonly NORMAL_CRUISE_MAX = 160;
  public static readonly MAX_TECHNICAL_SPEED_LIMIT = 250; // Hard max speed cap: 250 km/h

  // Physics & Movement
  private currentLaneIndex: number = 1; // Middle-left lane by default
  private targetX: number = LANE_CENTERS[1];
  private playerX: number = LANE_CENTERS[1];
  private playerZ: number = 0;
  private prevPlayerZ: number = 0;
  private isGameOver: boolean = false;
  private autoSpeedKmh: number = 0;
  private playerSpeedKmh: number = 0;
  private playerTargetSpeedKmh: number = 0;
  private carDef!: CarDefinition;

  // Powerups & Nitro
  private nitroPercent: number = 100;
  private isNitroActive: boolean = false;
  private shieldActive: boolean = false;
  private magnetActive: boolean = false;
  private magnetTimer: number = 0;

  // Traffic & Collectibles
  private trafficList: ActiveTraffic[] = [];
  private collectibleList: ActiveCollectible[] = [];
  private particles!: ParticleManager;

  // Camera & Juice
  private cameraTargetY: number = 3.6;
  private cameraTargetZOffset: number = -8.5;
  private cameraFovBase: number = 62;
  private cameraShakeIntensity: number = 0;
  private hitstopTimer: number = 0;

  // Scoring & Stats
  private distanceMeters: number = 0;
  private score: number = 0;
  private runCoins: number = 0;
  private nearMissCount: number = 0;
  private topSpeedReached: number = 0;
  private lastCloseCallText: string | null = null;
  private closeCallTimer: number = 0;
  private comboMultiplier: number = 1;

  // Mode & Controls
  private mode: 'showcase' | 'playing' | 'paused' | 'gameover' = 'showcase';
  private turntableAngle: number = 0;
  private callbacks: GameSceneCallbacks;

  // Input states
  public input = {
    left: false,
    right: false,
    accelerate: false,
    brake: false,
    nitro: false,
  };

  private sensitivity: number = 1.0;
  private clock = new THREE.Clock();

  constructor(container: HTMLDivElement, callbacks: GameSceneCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.initWebGL();
    this.initScene();
    this.initLights();
    this.initRoad();
    this.setCar('suzuki-hatchback', '#00d2ff');
    this.particles = new ParticleManager(this.scene);

    window.addEventListener('resize', this.onResize);
    window.addEventListener('orientationchange', this.onOrientationChange);
    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener('change', this.onOrientationChange);
    }
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    this.startLoop();
  }

  private initWebGL() {
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height);

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);
  }

  private initScene() {
    this.scene = new THREE.Scene();
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(this.cameraFovBase, width / height, 0.2, 500);

    // Setup RoomEnvironment reflection map
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    this.applyEnvironment(this.currentEnv);
  }

  private initLights() {
    const envCfg = ENV_CONFIGS[this.currentEnv];

    this.hemiLight = new THREE.HemisphereLight(envCfg.hemisphereSky, envCfg.hemisphereGround, 0.9);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(envCfg.sunColor, envCfg.sunIntensity);
    this.dirLight.position.set(25, 45, -20);
    this.dirLight.castShadow = !this.isSoftwareGl;
    if (this.dirLight.castShadow) {
      this.dirLight.shadow.mapSize.width = 1024;
      this.dirLight.shadow.mapSize.height = 1024;
      this.dirLight.shadow.camera.near = 10;
      this.dirLight.shadow.camera.far = 160;
      const d = 35;
      this.dirLight.shadow.camera.left = -d;
      this.dirLight.shadow.camera.right = d;
      this.dirLight.shadow.camera.top = d;
      this.dirLight.shadow.camera.bottom = -d;
      this.dirLight.shadow.bias = -0.0005;
      this.dirLight.shadow.normalBias = 0.02;
    }
    this.scene.add(this.dirLight);
  }

  public applyEnvironment(env: EnvironmentType) {
    this.currentEnv = env;
    const cfg = ENV_CONFIGS[env];

    this.scene.background = new THREE.Color(cfg.skyColor);
    this.scene.fog = new THREE.Fog(cfg.fogColor, cfg.fogNear, cfg.fogFar);

    if (this.hemiLight) {
      this.hemiLight.color.setHex(cfg.hemisphereSky);
      this.hemiLight.groundColor.setHex(cfg.hemisphereGround);
    }
    if (this.dirLight) {
      this.dirLight.color.setHex(cfg.sunColor);
      this.dirLight.intensity = cfg.sunIntensity;
    }

    // Rebuild road chunks for new environment
    this.initRoad();
  }

  private initRoad() {
    // Clear previous chunks
    this.roadChunks.forEach((c) => this.scene.remove(c.group));
    this.roadChunks = [];

    // Create chunks along Z axis
    for (let i = 0; i < TOTAL_CHUNKS; i++) {
      const chunk = buildRoadChunk(i, this.currentEnv);
      this.roadChunks.push(chunk);
      this.scene.add(chunk.group);
    }
  }

  public setCar(carId: string, color: string) {
    this.playerCarId = carId;
    this.playerColor = color;
    const found = CAR_CATALOG.find((c) => c.id === carId) || CAR_CATALOG[0];
    this.carDef = found;

    if (this.playerBuiltCar) {
      this.scene.remove(this.playerBuiltCar.group);
    }

    this.playerBuiltCar = createPlayerCar(carId, color);
    this.scene.add(this.playerBuiltCar.group);

    // Attach shield bubble
    if (this.shieldBubbleMesh) {
      this.scene.remove(this.shieldBubbleMesh);
    }
    this.shieldBubbleMesh = createShieldBubbleMesh();
    this.playerBuiltCar.group.add(this.shieldBubbleMesh);
    this.shieldBubbleMesh.position.set(0, 0.6, 0);
  }

  public setPaintColor(color: string) {
    this.playerColor = color;
    if (this.playerBuiltCar) {
      this.playerBuiltCar.paintMaterial.color.set(color);
    }
  }

  public setSensitivity(sens: number) {
    this.sensitivity = Math.max(0.5, Math.min(2.0, sens));
  }

  public setGraphicsQuality(quality: 'high' | 'medium' | 'low') {
    if (quality === 'low' || this.isSoftwareGl) {
      this.renderer.shadowMap.enabled = false;
      this.renderer.setPixelRatio(1);
    } else if (quality === 'medium') {
      this.renderer.shadowMap.enabled = true;
      this.renderer.setPixelRatio(1.2);
    } else {
      this.renderer.shadowMap.enabled = true;
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
  }

  public setMode(newMode: 'showcase' | 'playing' | 'paused' | 'gameover') {
    this.mode = newMode;
    if (newMode === 'playing') {
      soundManager.startEngine();
      soundManager.startRacingMusic();
    } else if (newMode === 'paused') {
      soundManager.stopEngine();
      soundManager.pauseRacingMusic();
    } else {
      soundManager.stopEngine();
      soundManager.stopRacingMusic();
    }
  }

  public steerLeft() {
    if (this.mode !== 'playing' || this.isGameOver) return;
    // Moving left on screen means moving toward Lane 0 (+6.9m)
    if (this.currentLaneIndex > 0) {
      this.currentLaneIndex -= 1;
      this.targetX = LANE_CENTERS[this.currentLaneIndex];
    }
  }

  public steerRight() {
    if (this.mode !== 'playing' || this.isGameOver) return;
    // Moving right on screen means moving toward Lane 3 (-6.9m)
    if (this.currentLaneIndex < 3) {
      this.currentLaneIndex += 1;
      this.targetX = LANE_CENTERS[this.currentLaneIndex];
    }
  }

  public setAccelerate(active: boolean) {
    if (this.isGameOver || this.mode !== 'playing') {
      this.input.accelerate = false;
      return;
    }
    this.input.accelerate = active;
  }

  public setBrake(active: boolean) {
    if (this.isGameOver || this.mode !== 'playing') {
      this.input.brake = false;
      return;
    }
    this.input.brake = active;
  }

  public startRace() {
    this.mode = 'playing';
    this.isGameOver = false;
    this.currentLaneIndex = 1; // Start centered in Middle-Left lane (X = +2.3m)
    this.playerX = LANE_CENTERS[this.currentLaneIndex];
    this.targetX = this.playerX;
    this.playerZ = 0;
    this.prevPlayerZ = 0;
    this.autoSpeedKmh = 0; // Starts strictly at 0 km/h
    this.playerSpeedKmh = 0; // Starts strictly at 0 km/h
    this.playerTargetSpeedKmh = 0; // Starts strictly at 0 km/h
    this.input.accelerate = false;
    this.input.brake = false;
    this.input.nitro = false;
    this.nitroPercent = 100;
    this.isNitroActive = false;
    this.shieldActive = false;
    this.magnetActive = false;
    this.magnetTimer = 0;
    this.distanceMeters = 0;
    this.score = 0;
    this.runCoins = 0;
    this.nearMissCount = 0;
    this.topSpeedReached = 0;
    this.lastCloseCallText = null;
    this.closeCallTimer = 0;
    this.comboMultiplier = 1;
    this.hitstopTimer = 0;

    // Reset player car position, forward orientation and wheels cleanly
    if (this.playerBuiltCar) {
      this.playerBuiltCar.group.position.set(this.playerX, 0, 0);
      this.playerBuiltCar.group.rotation.set(0, 0, 0);
      this.playerBuiltCar.wheels.forEach((w) => {
        w.rotation.set(0, 0, 0);
      });
    }

    if (this.shieldBubbleMesh) this.shieldBubbleMesh.visible = false;

    // Reset road chunks positions cleanly
    this.roadChunks.forEach((chunk, idx) => {
      chunk.group.position.z = idx * CHUNK_LENGTH;
    });

    // Reset traffic & collectibles
    this.clearWorldEntities();
    this.initTraffic();
    this.initCollectibles();

    soundManager.startEngine();
    soundManager.startRacingMusic();
  }

  private clearWorldEntities() {
    this.trafficList.forEach((t) => this.scene.remove(t.traffic.group));
    this.trafficList = [];

    this.collectibleList.forEach((c) => this.scene.remove(c.group));
    this.collectibleList = [];
  }

  private initTraffic() {
    const trafficTypes: ('sedan' | 'truck' | 'suv' | 'van')[] = ['sedan', 'truck', 'suv', 'van', 'sedan'];
    const colors = ['#2563eb', '#dc2626', '#f59e0b', '#ffffff', '#475569', '#10b981', '#7c3aed'];

    // Spawn 8 initial traffic vehicles ahead of player with realistic highway spacing
    for (let i = 0; i < 8; i++) {
      const type = trafficTypes[i % trafficTypes.length];
      const color = colors[i % colors.length];
      const built = createTrafficVehicle(type, color);

      const lane = i % 4;
      const x = LANE_CENTERS[lane];
      const z = this.playerZ + 75 + i * 50 + (Math.random() - 0.5) * 15;
      // Initial traffic starts at ~55-75 km/h
      const speedKmh = 55 + Math.random() * 20;

      built.group.position.set(x, 0, z);
      this.scene.add(built.group);

      this.trafficList.push({
        traffic: built,
        lane,
        speedKmh,
        z,
        x,
        hasNearMissed: false,
      });
    }
  }

  private initCollectibles() {
    // Spawn coins in alternating lanes ahead
    for (let i = 0; i < 6; i++) {
      this.spawnCoinGroup(this.playerZ + 40 + i * 55);
    }

    // Spawn 1 nitro canister and 1 shield/magnet
    this.spawnPowerUp(this.playerZ + 120, 'nitro');
    this.spawnPowerUp(this.playerZ + 240, Math.random() > 0.5 ? 'shield' : 'magnet');
  }

  private spawnCoinGroup(baseZ: number) {
    const lane = Math.floor(Math.random() * 4);
    const x = LANE_CENTERS[lane];
    const count = 3 + Math.floor(Math.random() * 3);

    for (let c = 0; c < count; c++) {
      const coinMesh = createCoinMesh();
      const z = baseZ + c * 4.5;
      coinMesh.position.set(x, 1.0, z);
      this.scene.add(coinMesh);

      this.collectibleList.push({
        group: coinMesh,
        type: 'coin',
        x,
        z,
        collected: false,
      });
    }
  }

  private spawnPowerUp(z: number, type: 'nitro' | 'shield' | 'magnet') {
    const lane = Math.floor(Math.random() * 4);
    const x = LANE_CENTERS[lane];

    let mesh: THREE.Group;
    if (type === 'nitro') mesh = createNitroPickupMesh();
    else if (type === 'shield') mesh = createShieldPickupMesh();
    else mesh = createMagnetPickupMesh();

    mesh.position.set(x, 1.0, z);
    this.scene.add(mesh);

    this.collectibleList.push({
      group: mesh,
      type,
      x,
      z,
      collected: false,
    });
  }

  public handleResize = () => {
    this.onResize();
    // Subsequent check for smooth mobile browser layout settling
    setTimeout(() => {
      if (!this.isDisposed) {
        this.onResize();
      }
    }, 80);
  };

  private onOrientationChange = () => {
    this.handleResize();
  };

  private onResize = () => {
    if (!this.container || this.isDisposed) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private onKeyDown = (e: KeyboardEvent) => {
    // Prevent scrolling during racing
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }

    // Ignore continuous OS repeat so a single key press only changes one lane
    if (e.repeat) return;

    if (e.code === 'KeyA' || e.key === 'ArrowLeft') this.steerLeft();
    if (e.code === 'KeyD' || e.key === 'ArrowRight') this.steerRight();
    if (e.code === 'KeyW' || e.key === 'ArrowUp') this.input.accelerate = true;
    if (e.code === 'KeyS' || e.key === 'ArrowDown') this.input.brake = true;
    if (e.code === 'Space') this.input.nitro = true;
  };

  private onKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'KeyW' || e.key === 'ArrowUp') this.input.accelerate = false;
    if (e.code === 'KeyS' || e.key === 'ArrowDown') this.input.brake = false;
    if (e.code === 'Space') this.input.nitro = false;
  };

  private startLoop() {
    const tick = () => {
      if (this.isDisposed) return;
      const rawDt = this.clock.getDelta();
      const dt = Math.min(rawDt, 0.05); // Clamp frame delta

      this.update(dt);
      this.render();

      this.animFrameId = requestAnimationFrame(tick);
    };
    this.animFrameId = requestAnimationFrame(tick);
  }

  private update(dt: number) {
    if (this.mode === 'showcase') {
      this.updateShowcase(dt);
      return;
    }

    // Immediately halt all movement and simulation if paused or game over
    if (this.mode === 'paused' || this.mode === 'gameover' || this.isGameOver) {
      return;
    }

    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      return;
    }

    if (this.mode === 'playing') {
      this.updateRacePhysics(dt);
      this.updateRoadChunks();
      this.updateTraffic(dt);
      this.updateCollectibles(dt);
      this.updateParticles(dt);
      this.updateCamera(dt);
      this.updateHUD();
    }
  }

  private updateShowcase(dt: number) {
    this.turntableAngle += dt * 0.8;
    if (this.playerBuiltCar) {
      this.playerBuiltCar.group.position.set(0, 0, 0);
      this.playerBuiltCar.group.rotation.set(0, this.turntableAngle, 0);
    }

    const carLen = this.playerBuiltCar?.length || 4.4;
    const carH = this.playerBuiltCar?.height || 1.3;
    const radius = Math.max(7.2, carLen * 1.55);
    const camY = Math.max(2.4, carH * 1.6);
    this.camera.position.set(
      Math.sin(this.turntableAngle * 0.4) * radius,
      camY,
      Math.cos(this.turntableAngle * 0.4) * radius
    );
    this.camera.lookAt(0, carH * 0.45, 0);
  }

  private updateRacePhysics(dt: number) {
    if (!this.playerBuiltCar || this.isGameOver) return;

    // 1. Target Cruising Speed in Normal Racing Range (80–160 km/h) based on vehicle stats
    const carTopSpeed = this.carDef ? Math.min(GameScene.MAX_TECHNICAL_SPEED_LIMIT, this.carDef.stats.topSpeed) : 220;
    const carAccelRating = this.carDef ? this.carDef.stats.acceleration : 75;
    // Normal racing speed baseline between 80 km/h and 160 km/h (centered ~115–140 km/h)
    const normalCruisingSpeed = GameScene.NORMAL_CRUISE_MIN + (carAccelRating / 100) * 55;

    // From 0 km/h start, baseline cruising builds up smoothly and gradually
    if (this.autoSpeedKmh < normalCruisingSpeed) {
      const startRampRate = 18 + (carAccelRating / 100) * 14;
      this.autoSpeedKmh = Math.min(normalCruisingSpeed, this.autoSpeedKmh + startRampRate * dt);
    }

    // 2. Throttle (GAS) and Brake controls
    if (this.input.accelerate) {
      // Holding GAS increases speed gradually and smoothly up to maximum 250 km/h (capped at car top speed)
      const accelRate = 28 + (carAccelRating / 100) * 22; // 28-50 km/h per second
      this.playerTargetSpeedKmh = Math.min(carTopSpeed, this.playerTargetSpeedKmh + accelRate * dt);
      this.autoSpeedKmh = Math.max(this.autoSpeedKmh, Math.min(normalCruisingSpeed, this.playerTargetSpeedKmh));
    } else if (this.input.brake) {
      // Holding BRAKE decreases speed smoothly down to 0 km/h
      const brakeRate = 58; // 58 km/h per second smooth progressive deceleration
      this.playerTargetSpeedKmh = Math.max(0, this.playerTargetSpeedKmh - brakeRate * dt);
    } else {
      // Releasing either button DOES NOT abruptly stop the car — smoothly cruises & coasts in 80–160 km/h range
      if (this.playerTargetSpeedKmh > normalCruisingSpeed) {
        // High-speed coasting with natural aerodynamic drag deceleration towards normal cruising speed
        this.playerTargetSpeedKmh = THREE.MathUtils.damp(this.playerTargetSpeedKmh, normalCruisingSpeed, 0.85, dt);
      } else {
        // Smoothly accelerate up towards the normal racing speed from low speed or stop
        this.playerTargetSpeedKmh = THREE.MathUtils.damp(this.playerTargetSpeedKmh, this.autoSpeedKmh, 1.6, dt);
      }
    }

    // 3. Nitro Boost calculation (hard-capped at 250 km/h)
    let targetSpeed = this.playerTargetSpeedKmh;
    const nitroBoostAmount = this.carDef ? (20 + (this.carDef.stats.nitroBoost / 100) * 15) : 30;
    if (this.isNitroActive && this.nitroPercent > 5) {
      targetSpeed = Math.min(GameScene.MAX_TECHNICAL_SPEED_LIMIT, targetSpeed + nitroBoostAmount);
      this.nitroPercent = Math.max(0, this.nitroPercent - dt * 25);
      soundManager.startNitro();
    } else {
      this.isNitroActive = false;
      soundManager.stopNitro();
    }

    // Smooth analog damping prevents sudden speed jumps or jerky movements
    this.playerSpeedKmh = THREE.MathUtils.damp(this.playerSpeedKmh, targetSpeed, 2.6, dt);
    // Hard clamp to ensure strictly 0 <= speed <= 250 km/h
    this.playerSpeedKmh = Math.min(GameScene.MAX_TECHNICAL_SPEED_LIMIT, Math.max(0, this.playerSpeedKmh));
    if (this.playerSpeedKmh > this.topSpeedReached) {
      this.topSpeedReached = Math.round(this.playerSpeedKmh);
    }

    // Advance forward position: speedMs strictly drives world position, distance, wheel roll & collisions
    this.prevPlayerZ = this.playerZ;
    const speedMs = this.playerSpeedKmh / 3.6;
    this.playerZ += speedMs * dt;
    this.distanceMeters = Math.floor(this.playerZ);

    // Score increments with distance and speed
    this.score += Math.floor((this.playerSpeedKmh / 35) * dt * 25 * this.comboMultiplier);

    // Four-lane discrete smooth positioning (scaled by vehicle handling stat)
    this.targetX = LANE_CENTERS[this.currentLaneIndex];
    const handlingModifier = this.carDef ? (12.0 + (this.carDef.stats.handling / 100) * 8.0) : 16.0;
    this.playerX = THREE.MathUtils.damp(this.playerX, this.targetX, handlingModifier, dt);
    if (Math.abs(this.playerX - this.targetX) < 0.01) {
      this.playerX = this.targetX;
    }

    // Strict road boundary clamping: keeps the car securely within road edges (-7.2m to +7.2m)
    this.playerX = THREE.MathUtils.clamp(this.playerX, -7.2, 7.2);

    // Subtle tilt while transitioning between lanes; straightens out to 0 (parallel to road) when in lane
    const diffX = this.targetX - this.playerX;
    const steerAngle = THREE.MathUtils.clamp(diffX * 0.035, -0.09, 0.09);
    const bodyRoll = THREE.MathUtils.clamp(diffX * 0.012, -0.04, 0.04);

    // Update car 3D transforms
    this.playerBuiltCar.group.position.set(this.playerX, 0, this.playerZ);
    this.playerBuiltCar.group.rotation.set(0, steerAngle, bodyRoll);

    // Rotate wheels
    const wheelRollSpeed = (speedMs / 0.38) * dt;
    this.playerBuiltCar.wheels.forEach((w, idx) => {
      w.rotation.x += wheelRollSpeed;
      if (idx < 2) {
        // Front wheels turn with steering
        w.rotation.y = steerAngle * 1.5;
      }
    });

    // Exhaust particles
    const worldExL = _vec3A.copy(this.playerBuiltCar.leftExhaust).applyMatrix4(this.playerBuiltCar.group.matrixWorld);
    const worldExR = _vec3B.copy(this.playerBuiltCar.rightExhaust).applyMatrix4(this.playerBuiltCar.group.matrixWorld);
    this.particles.emitExhaust(worldExL, this.isNitroActive);
    this.particles.emitExhaust(worldExR, this.isNitroActive);

    // Update Web Audio engine pitch (synchronized with continuous automatic speed)
    soundManager.updateEngine(Math.min(1.5, this.playerSpeedKmh / 140), true);

    // Magnet power-up countdown
    if (this.magnetActive) {
      this.magnetTimer -= dt;
      if (this.magnetTimer <= 0) {
        this.magnetActive = false;
      }
    }

    // Close call text timer
    if (this.closeCallTimer > 0) {
      this.closeCallTimer -= dt;
      if (this.closeCallTimer <= 0) {
        this.lastCloseCallText = null;
      }
    }
  }

  private updateRoadChunks() {
    // Check if player passed the earliest road chunk
    this.roadChunks.forEach((chunk) => {
      if (chunk.group.position.z < this.playerZ - CHUNK_LENGTH * 1.5) {
        // Move this chunk ahead of the furthest chunk
        let maxZ = -Infinity;
        this.roadChunks.forEach((c) => {
          if (c.group.position.z > maxZ) maxZ = c.group.position.z;
        });
        chunk.group.position.z = maxZ + CHUNK_LENGTH;
      }
    });

    // Move directional light with player
    this.dirLight.position.z = this.playerZ - 20;
    this.dirLight.target.position.z = this.playerZ + 40;
    this.dirLight.target.updateMatrixWorld();
  }

  private updateTraffic(dt: number) {
    if (!this.playerBuiltCar || this.isGameOver || this.mode !== 'playing') return;

    // Player physical bounding box (half dimensions)
    const pHalfW = (this.playerBuiltCar.width || 2.0) * 0.44;
    const pHalfL = (this.playerBuiltCar.length || 4.4) * 0.46;
    const pMinX = this.playerX - pHalfW;
    const pMaxX = this.playerX + pHalfW;
    // Swept Z bounds between prevPlayerZ and playerZ ensures high speed never tunnels through
    const pMinZ = Math.min(this.prevPlayerZ, this.playerZ) - pHalfL;
    const pMaxZ = Math.max(this.prevPlayerZ, this.playerZ) + pHalfL;

    for (let i = 0; i < this.trafficList.length; i++) {
      const item = this.trafficList[i];

      // Gradually synchronize traffic cruising speed with player's continuous progression:
      // Traffic smoothly scales to 68-78% of player's continuous auto-speed
      const desiredTrafficSpeed = Math.max(18, this.autoSpeedKmh * (0.68 + (item.lane % 2) * 0.08));
      item.speedKmh = THREE.MathUtils.damp(item.speedKmh, desiredTrafficSpeed, 0.6, dt);

      // Traffic moves along +Z at its own speed (m/s)
      const prevTrafficZ = item.z;
      const trafficSpeedMs = item.speedKmh / 3.6;
      item.z += trafficSpeedMs * dt;
      item.traffic.group.position.set(item.x, 0, item.z);

      // Rotate traffic wheels proportional to actual movement
      const wheelRoll = (trafficSpeedMs / 0.38) * dt;
      item.traffic.wheels.forEach((w) => {
        w.rotation.x += wheelRoll;
      });

      // Traffic physical bounding box with swept Z bounds
      const tHalfW = (item.traffic.width || 2.0) * 0.44;
      const tHalfL = (item.traffic.length || 4.4) * 0.46;
      const tMinX = item.x - tHalfW;
      const tMaxX = item.x + tHalfW;
      const tMinZ = Math.min(prevTrafficZ, item.z) - tHalfL;
      const tMaxZ = Math.max(prevTrafficZ, item.z) + tHalfL;

      // Reliable swept 3D AABB Collision Check
      const overlapX = pMinX <= tMaxX && pMaxX >= tMinX;
      const overlapZ = pMinZ <= tMaxZ && pMaxZ >= tMinZ;

      if (overlapX && overlapZ) {
        if (this.shieldActive) {
          // Shield saves the player!
          this.shieldActive = false;
          if (this.shieldBubbleMesh) this.shieldBubbleMesh.visible = false;
          soundManager.playShieldBreak();
          this.particles.emitSparks(this.playerBuiltCar.group.position, 40);
          this.cameraShakeIntensity = 0.5;

          // Push traffic away
          item.z += 35;
          item.traffic.group.position.z = item.z;
        } else {
          // Major Crash! Immediately triggers Game Over without delay or spinning
          this.handleCollision(item);
          return;
        }
      }

      // Near miss detection: player overtook traffic closely
      if (!item.hasNearMissed && Math.abs(this.playerZ - item.z) < 2.5) {
        const lateralDist = Math.abs(this.playerX - item.x);
        // If close (between 2.2 and 3.6m lateral distance) and passing at overtaking speed
        if (lateralDist < 3.4 && this.playerSpeedKmh > item.speedKmh + 6) {
          item.hasNearMissed = true;
          this.nearMissCount++;
          const bonus = 50 * this.comboMultiplier;
          this.score += bonus;
          this.lastCloseCallText = `CLOSE CALL! +${bonus}`;
          this.closeCallTimer = 1.2;
          this.comboMultiplier = Math.min(4, this.comboMultiplier + 1);
          this.cameraShakeIntensity = Math.max(this.cameraShakeIntensity, 0.15);
          soundManager.playNearMiss();
        }
      }

      // Recycle traffic car when it falls behind player
      if (item.z < this.playerZ - 40) {
        // Find furthest traffic car Z
        let maxTrafficZ = this.playerZ + 80;
        this.trafficList.forEach((t) => {
          if (t.z > maxTrafficZ) maxTrafficZ = t.z;
        });

        item.lane = Math.floor(Math.random() * 4);
        item.x = LANE_CENTERS[item.lane];
        const spawnBuffer = Math.max(45, (this.playerSpeedKmh / 3.6) * 1.6);
        item.z = maxTrafficZ + spawnBuffer + Math.random() * 45;
        // Traffic speed matches continuous race progression
        item.speedKmh = Math.max(18, this.autoSpeedKmh * (0.68 + Math.random() * 0.1));
        item.hasNearMissed = false;
      }
    }
  }

  private updateCollectibles(dt: number) {
    if (!this.playerBuiltCar) return;

    const magnetRadius = this.magnetActive ? 18.0 : 2.4;
    const playerPos = this.playerBuiltCar.group.position;

    for (let i = 0; i < this.collectibleList.length; i++) {
      const item = this.collectibleList[i];
      if (item.collected) continue;

      // Bobbing & spinning animation
      item.group.rotation.y += dt * 3.5;
      item.group.position.y = 1.0 + Math.sin(this.playerZ * 0.1 + i) * 0.2;

      const dist = Math.hypot(playerPos.x - item.x, playerPos.z - item.z);

      // Magnet pull towards player car
      if (this.magnetActive && item.type === 'coin' && dist < magnetRadius) {
        const pullSpeed = 25 * dt;
        item.x = THREE.MathUtils.damp(item.x, playerPos.x, 8.0, dt);
        item.z = THREE.MathUtils.damp(item.z, playerPos.z, 8.0, dt);
        item.group.position.set(item.x, item.group.position.y, item.z);
      }

      // Collect when close
      if (dist < 2.4) {
        item.collected = true;
        this.scene.remove(item.group);

        if (item.type === 'coin') {
          this.runCoins += 1;
          this.score += 25;
          soundManager.playCoin();
          this.particles.emitCoinPickup(item.group.position);
          this.callbacks.onCoinCollected(this.runCoins);
        } else if (item.type === 'nitro') {
          this.nitroPercent = Math.min(100, this.nitroPercent + 35);
          soundManager.playPowerUp();
          this.lastCloseCallText = 'NITRO BOOST +35%';
          this.closeCallTimer = 1.2;
        } else if (item.type === 'shield') {
          this.shieldActive = true;
          if (this.shieldBubbleMesh) this.shieldBubbleMesh.visible = true;
          soundManager.playPowerUp();
          this.lastCloseCallText = 'ENERGY SHIELD ACTIVATED!';
          this.closeCallTimer = 1.2;
        } else if (item.type === 'magnet') {
          this.magnetActive = true;
          this.magnetTimer = 8.0;
          soundManager.playPowerUp();
          this.lastCloseCallText = 'COIN MAGNET ACTIVE!';
          this.closeCallTimer = 1.2;
        }
      }

      // Recycle if passed
      if (item.z < this.playerZ - 30) {
        item.collected = true;
        this.scene.remove(item.group);
      }
    }

    // Clean up collected items
    this.collectibleList = this.collectibleList.filter((c) => !c.collected);

    // Periodically spawn new coin clusters and powerups ahead
    if (this.collectibleList.length < 15) {
      this.spawnCoinGroup(this.playerZ + 180 + Math.random() * 50);
      if (Math.random() > 0.6) {
        const pickType = Math.random() > 0.5 ? 'nitro' : (Math.random() > 0.5 ? 'shield' : 'magnet');
        this.spawnPowerUp(this.playerZ + 240, pickType);
      }
    }
  }

  private updateParticles(dt: number) {
    if (!this.playerBuiltCar) return;
    this.particles.update(dt, this.playerBuiltCar.group.position, this.playerSpeedKmh, this.isNitroActive);
  }

  private updateCamera(dt: number) {
    if (!this.playerBuiltCar) return;

    const carLen = this.playerBuiltCar?.length || 4.4;
    const carH = this.playerBuiltCar?.height || 1.3;
    const dynamicZOffset = -(carLen * 1.55 + 2.0);
    const dynamicY = Math.max(3.2, carH * 2.0 + 0.8);

    // Camera pulls back on nitro, tilts subtly into turns
    const targetZ = this.playerZ + dynamicZOffset - (this.isNitroActive ? 1.5 : 0);
    const targetX = this.playerX * 0.7; // slight sway follow
    const targetY = dynamicY + (this.isNitroActive ? 0.3 : 0);

    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, targetX, 8.0, dt);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, targetY, 8.0, dt);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, targetZ, 12.0, dt);

    // Camera shake decay
    if (this.cameraShakeIntensity > 0) {
      const shakeX = (Math.random() - 0.5) * this.cameraShakeIntensity;
      const shakeY = (Math.random() - 0.5) * this.cameraShakeIntensity;
      this.camera.position.x += shakeX;
      this.camera.position.y += shakeY;
      this.cameraShakeIntensity = Math.max(0, this.cameraShakeIntensity - dt * 2.0);
    }

    // Look ahead of car
    const lookAheadZ = this.playerZ + 18;
    this.camera.lookAt(this.playerX * 0.3, 1.2, lookAheadZ);

    // Dynamic FOV for speed sensation
    const speedRatio = Math.min(1.0, this.playerSpeedKmh / this.carDef.stats.topSpeed);
    const targetFov = this.cameraFovBase + speedRatio * 8 + (this.isNitroActive ? 8 : 0);
    this.camera.fov = THREE.MathUtils.damp(this.camera.fov, targetFov, 4.0, dt);
    this.camera.updateProjectionMatrix();
  }

  private handleCollision(trafficHit: ActiveTraffic) {
    if (this.isGameOver) return; // Trigger collision detection only once per run
    this.isGameOver = true;
    this.mode = 'gameover';

    // 1. Immediately stop the player's movement and racing gameplay
    this.playerSpeedKmh = 0;
    this.playerTargetSpeedKmh = 0;
    this.autoSpeedKmh = 0;
    this.input.accelerate = false;
    this.input.brake = false;
    this.input.nitro = false;
    this.isNitroActive = false;

    // 2. Freeze car in normal forward-facing orientation — NEVER SPIN OR ROTATE!
    if (this.playerBuiltCar) {
      this.playerBuiltCar.group.rotation.set(0, 0, 0);
      this.playerBuiltCar.wheels.forEach((w) => {
        w.rotation.y = 0;
      });
    }

    // 3. Audio & Sparks
    soundManager.playCrash();
    soundManager.stopEngine();
    soundManager.stopNitro();
    soundManager.stopRacingMusic();

    if (this.playerBuiltCar) {
      this.particles.emitSparks(this.playerBuiltCar.group.position, 40);
    }

    // 4. Immediately trigger Game Over without delay or background motion
    this.callbacks.onGameOver({
      distanceMeters: this.distanceMeters,
      coinsCollected: this.runCoins,
      score: this.score,
      nearMisses: this.nearMissCount,
      topSpeedReached: this.topSpeedReached,
      isNewHighScore: false, // Calculated by App.tsx
    });
  }

  private updateHUD() {
    this.callbacks.onHUDUpdate({
      speedKmh: Math.round(this.playerSpeedKmh),
      distanceMeters: this.distanceMeters,
      score: this.score,
      runCoins: this.runCoins,
      nitroPercent: Math.round(this.nitroPercent),
      isNitroActive: this.isNitroActive,
      shieldActive: this.shieldActive,
      magnetActive: this.magnetActive,
      magnetTimer: Math.ceil(this.magnetTimer),
      comboMultiplier: this.comboMultiplier,
      lastCloseCallText: this.lastCloseCallText,
    });
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    this.isDisposed = true;
    cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('orientationchange', this.onOrientationChange);
    if (window.screen?.orientation) {
      window.screen.orientation.removeEventListener('change', this.onOrientationChange);
    }
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);

    soundManager.stopEngine();
    this.renderer.dispose();
  }
}
