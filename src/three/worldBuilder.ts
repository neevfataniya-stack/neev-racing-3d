import * as THREE from 'three';
import { EnvironmentType } from '../types/game';
import { createBuildingTexture, createRoadTexture } from './materials';

export interface RoadChunk {
  group: THREE.Group;
  roadMesh: THREE.Mesh;
  zPos: number;
}

export interface EnvironmentSettings {
  skyColor: number;
  fogColor: number;
  fogNear: number;
  fogFar: number;
  ambientColor: number;
  ambientIntensity: number;
  sunColor: number;
  sunIntensity: number;
  hemisphereSky: number;
  hemisphereGround: number;
}

export const ENV_CONFIGS: Record<EnvironmentType, EnvironmentSettings> = {
  city: {
    skyColor: 0x050814,
    fogColor: 0x090e24,
    fogNear: 150,
    fogFar: 450,
    ambientColor: 0x1e293b,
    ambientIntensity: 0.8,
    sunColor: 0x38bdf8,
    sunIntensity: 1.5,
    hemisphereSky: 0x0284c7,
    hemisphereGround: 0x0f172a,
  },
  desert: {
    skyColor: 0x451a03,
    fogColor: 0x78350f,
    fogNear: 160,
    fogFar: 460,
    ambientColor: 0xfef3c7,
    ambientIntensity: 0.9,
    sunColor: 0xfbbf24,
    sunIntensity: 2.2,
    hemisphereSky: 0xf59e0b,
    hemisphereGround: 0x78350f,
  },
  mountain: {
    skyColor: 0x0f172a,
    fogColor: 0x1e293b,
    fogNear: 140,
    fogFar: 420,
    ambientColor: 0x94a3b8,
    ambientIntensity: 0.85,
    sunColor: 0xe2e8f0,
    sunIntensity: 1.8,
    hemisphereSky: 0x64748b,
    hemisphereGround: 0x1e293b,
  },
};

export const ROAD_WIDTH = 20.0; // 4 lanes of 4.6m each + shoulders/curbs
// Lane 0: Leftmost on screen (+6.9), Lane 1: Middle-Left (+2.3), Lane 2: Middle-Right (-2.3), Lane 3: Rightmost (-6.9)
export const LANE_CENTERS = [6.9, 2.3, -2.3, -6.9];
export const CHUNK_LENGTH = 80;
export const TOTAL_CHUNKS = 8; // 8 x 80 = 640m view distance

/**
 * Creates a procedural 3-part cactus for desert
 */
function createCactus(): THREE.Group {
  const group = new THREE.Group();
  const cactusMat = new THREE.MeshStandardMaterial({
    color: 0x15803d,
    roughness: 0.7,
    metalness: 0.1,
  });

  // Main Trunk
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 4.5, 8), cactusMat);
  trunk.position.y = 2.25;
  trunk.castShadow = true;
  group.add(trunk);

  // Left arm
  const armL1 = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.2, 6), cactusMat);
  armL1.rotateZ(Math.PI / 2);
  armL1.position.set(-0.7, 2.5, 0);
  const armL2 = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.6, 6), cactusMat);
  armL2.position.set(-1.2, 3.2, 0);
  group.add(armL1, armL2);

  // Right arm
  const armR1 = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.0, 6), cactusMat);
  armR1.rotateZ(Math.PI / 2);
  armR1.position.set(0.6, 1.8, 0);
  const armR2 = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.4, 6), cactusMat);
  armR2.position.set(1.0, 2.4, 0);
  group.add(armR1, armR2);

  return group;
}

/**
 * Creates a procedural 4-part Pine Tree for mountains
 */
function createPineTree(): THREE.Group {
  const group = new THREE.Group();
  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x451a03,
    roughness: 0.9,
  });
  const foliageMat = new THREE.MeshStandardMaterial({
    color: 0x064e3b,
    roughness: 0.8,
  });

  // Trunk
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 2.0, 8), trunkMat);
  trunk.position.y = 1.0;
  trunk.castShadow = true;
  group.add(trunk);

  // 3 stacked foliage cones
  const cone1 = new THREE.Mesh(new THREE.ConeGeometry(2.2, 2.8, 8), foliageMat);
  cone1.position.y = 2.6;
  cone1.castShadow = true;

  const cone2 = new THREE.Mesh(new THREE.ConeGeometry(1.7, 2.4, 8), foliageMat);
  cone2.position.y = 4.0;
  cone2.castShadow = true;

  const cone3 = new THREE.Mesh(new THREE.ConeGeometry(1.2, 2.0, 8), foliageMat);
  cone3.position.y = 5.2;
  cone3.castShadow = true;

  group.add(cone1, cone2, cone3);
  return group;
}

/**
 * Creates a procedural streetlight
 */
function createStreetlight(isRightSide: boolean): THREE.Group {
  const group = new THREE.Group();
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
  const lightMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x67e8f9,
    emissiveIntensity: 2.0,
  });

  // Vertical pole
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 7.5, 8), poleMat);
  pole.position.y = 3.75;
  group.add(pole);

  // Arm curving over road
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.0, 8), poleMat);
  arm.position.set(isRightSide ? -1.3 : 1.3, 7.3, 0);
  arm.rotateZ(isRightSide ? -Math.PI / 4 : Math.PI / 4);
  group.add(arm);

  // Lamp fixture
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.18, 0.9), lightMat);
  lamp.position.set(isRightSide ? -2.2 : 2.2, 6.8, 0);
  group.add(lamp);

  return group;
}

/**
 * Build one road chunk with side scenery
 */
export function buildRoadChunk(chunkIndex: number, env: EnvironmentType): RoadChunk {
  const chunkGroup = new THREE.Group();
  const zPos = chunkIndex * CHUNK_LENGTH;
  chunkGroup.position.z = zPos;

  // 1. Asphalt Road Plane
  const roadTex = createRoadTexture(env);
  roadTex.repeat.set(1, CHUNK_LENGTH / 20);

  const roadGeom = new THREE.PlaneGeometry(ROAD_WIDTH, CHUNK_LENGTH);
  roadGeom.rotateX(-Math.PI / 2);
  const roadMat = new THREE.MeshStandardMaterial({
    map: roadTex,
    roughness: 0.85,
    metalness: 0.1,
  });
  const roadMesh = new THREE.Mesh(roadGeom, roadMat);
  roadMesh.receiveShadow = true;
  chunkGroup.add(roadMesh);

  // 2. Roadside Guardrails / Barriers
  const railGeom = new THREE.BoxGeometry(0.5, 0.9, CHUNK_LENGTH);
  const railMat = new THREE.MeshStandardMaterial({
    color: env === 'desert' ? 0xd97706 : 0x94a3b8,
    metalness: 0.8,
    roughness: 0.3,
  });

  const railLeft = new THREE.Mesh(railGeom, railMat);
  railLeft.position.set(-ROAD_WIDTH * 0.5 - 0.3, 0.45, 0);
  railLeft.castShadow = true;

  const railRight = new THREE.Mesh(railGeom, railMat);
  railRight.position.set(ROAD_WIDTH * 0.5 + 0.3, 0.45, 0);
  railRight.castShadow = true;
  chunkGroup.add(railLeft, railRight);

  // 3. Terrain Side Strips (Ground beyond road)
  let terrainColor = 0x090d16; // Dark concrete for city
  if (env === 'desert') terrainColor = 0xb45309; // Warm desert sand
  if (env === 'mountain') terrainColor = 0x1e293b; // Rocky ground

  const sideGroundGeom = new THREE.PlaneGeometry(160, CHUNK_LENGTH);
  sideGroundGeom.rotateX(-Math.PI / 2);
  const sideGroundMat = new THREE.MeshStandardMaterial({
    color: terrainColor,
    roughness: 0.95,
    metalness: 0.05,
  });

  const groundL = new THREE.Mesh(sideGroundGeom, sideGroundMat);
  groundL.position.set(-90, -0.05, 0);
  groundL.receiveShadow = true;

  const groundR = new THREE.Mesh(sideGroundGeom, sideGroundMat);
  groundR.position.set(90, -0.05, 0);
  groundR.receiveShadow = true;
  chunkGroup.add(groundL, groundR);

  // 4. Streetlights (every 40m)
  [-20, 20].forEach((zOffset) => {
    const lightL = createStreetlight(false);
    lightL.position.set(-ROAD_WIDTH * 0.5 - 1.5, 0, zOffset);
    const lightR = createStreetlight(true);
    lightR.position.set(ROAD_WIDTH * 0.5 + 1.5, 0, zOffset);
    chunkGroup.add(lightL, lightR);
  });

  // 5. Environment-specific roadside objects
  if (env === 'city') {
    // Modern Skyscrapers flanking the highway
    const buildingTex = createBuildingTexture();
    const buildingMat = new THREE.MeshStandardMaterial({
      map: buildingTex,
      roughness: 0.4,
      metalness: 0.6,
    });

    [-1, 1].forEach((side) => {
      for (let i = 0; i < 3; i++) {
        const height = 40 + Math.random() * 80;
        const width = 18 + Math.random() * 14;
        const depth = 20 + Math.random() * 15;
        const bldGeom = new THREE.BoxGeometry(width, height, depth);
        const bld = new THREE.Mesh(bldGeom, buildingMat);

        const xPos = side * (ROAD_WIDTH * 0.5 + 16 + Math.random() * 30 + i * 20);
        const zOff = -CHUNK_LENGTH * 0.4 + i * (CHUNK_LENGTH * 0.4);
        bld.position.set(xPos, height * 0.5, zOff);
        bld.castShadow = true;
        chunkGroup.add(bld);
      }
    });

    // Occasional highway overhead sign gantry (every 3rd chunk)
    if (chunkIndex % 3 === 0) {
      const gantryGroup = new THREE.Group();
      const gantryMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });
      const pillarGeom = new THREE.CylinderGeometry(0.2, 0.2, 10, 8);
      const beamGeom = new THREE.BoxGeometry(ROAD_WIDTH + 6, 0.4, 0.4);

      const pL = new THREE.Mesh(pillarGeom, gantryMat);
      pL.position.set(-ROAD_WIDTH * 0.5 - 2, 5, 0);
      const pR = new THREE.Mesh(pillarGeom, gantryMat);
      pR.position.set(ROAD_WIDTH * 0.5 + 2, 5, 0);
      const beam = new THREE.Mesh(beamGeom, gantryMat);
      beam.position.set(0, 9.5, 0);

      // Signboard
      const signMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.4,
        metalness: 0.2,
      });
      const sign = new THREE.Mesh(new THREE.BoxGeometry(7, 2.2, 0.2), signMat);
      sign.position.set(0, 8.5, 0);

      gantryGroup.add(pL, pR, beam, sign);
      chunkGroup.add(gantryGroup);
    }
  } else if (env === 'desert') {
    // Saguaro cacti and desert sandstone rock formations
    [-1, 1].forEach((side) => {
      // 4 cacti per side
      for (let c = 0; c < 3; c++) {
        const cactus = createCactus();
        const scale = 0.8 + Math.random() * 0.6;
        cactus.scale.set(scale, scale, scale);
        cactus.position.set(
          side * (ROAD_WIDTH * 0.5 + 4 + Math.random() * 35),
          0,
          -CHUNK_LENGTH * 0.4 + c * (CHUNK_LENGTH * 0.35)
        );
        chunkGroup.add(cactus);
      }

      // Sandstone mesa
      const mesaMat = new THREE.MeshStandardMaterial({
        color: 0x9a3412,
        roughness: 0.9,
      });
      const mesa = new THREE.Mesh(new THREE.CylinderGeometry(14, 20, 18, 7), mesaMat);
      mesa.position.set(side * (ROAD_WIDTH * 0.5 + 45), 9, (Math.random() - 0.5) * 40);
      chunkGroup.add(mesa);
    });
  } else {
    // Mountain Highway (Alpine Pine trees and jagged snow mountains)
    [-1, 1].forEach((side) => {
      for (let p = 0; p < 4; p++) {
        const pine = createPineTree();
        const scale = 0.9 + Math.random() * 0.6;
        pine.scale.set(scale, scale, scale);
        pine.position.set(
          side * (ROAD_WIDTH * 0.5 + 5 + Math.random() * 30),
          0,
          -CHUNK_LENGTH * 0.4 + p * (CHUNK_LENGTH * 0.28)
        );
        chunkGroup.add(pine);
      }

      // Distant jagged mountain cone
      const mtnMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.85,
      });
      const mountain = new THREE.Mesh(new THREE.ConeGeometry(35, 45, 6), mtnMat);
      mountain.position.set(side * (ROAD_WIDTH * 0.5 + 75), 20, (Math.random() - 0.5) * 50);
      chunkGroup.add(mountain);
    });
  }

  return {
    group: chunkGroup,
    roadMesh,
    zPos,
  };
}
