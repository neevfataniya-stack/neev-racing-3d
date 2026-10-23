import * as THREE from 'three';
import { createCarbonFiberTexture, createWheelRimTexture } from './materials';

export interface BuiltCar {
  group: THREE.Group;
  wheels: THREE.Mesh[];
  leftExhaust: THREE.Vector3;
  rightExhaust: THREE.Vector3;
  bodyMesh: THREE.Mesh;
  paintMaterial: THREE.MeshPhysicalMaterial;
  width: number;
  length: number;
  height: number;
}

export interface BuiltTraffic {
  group: THREE.Group;
  wheels: THREE.Mesh[];
  width: number;
  length: number;
  height: number;
}

// Shared materials across instances to optimize draw calls
const wheelRimTex = createWheelRimTexture();
const carbonTex = createCarbonFiberTexture();

const tireMaterial = new THREE.MeshStandardMaterial({
  color: 0x18181b,
  roughness: 0.85,
  metalness: 0.1,
});

const rimMaterial = new THREE.MeshStandardMaterial({
  map: wheelRimTex,
  roughness: 0.25,
  metalness: 0.85,
});

const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x0f172a,
  roughness: 0.1,
  metalness: 0.9,
  transmission: 0.3,
  transparent: true,
  opacity: 0.85,
  depthWrite: false,
});

const carbonMaterial = new THREE.MeshStandardMaterial({
  map: carbonTex,
  roughness: 0.4,
  metalness: 0.3,
});

const headlightMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  emissive: 0x67e8f9,
  emissiveIntensity: 2.5,
  roughness: 0.1,
});

const taillightMaterial = new THREE.MeshStandardMaterial({
  color: 0xff0000,
  emissive: 0xff1e1e,
  emissiveIntensity: 2.8,
  roughness: 0.1,
});

const chromeMaterial = new THREE.MeshStandardMaterial({
  color: 0xe2e8f0,
  roughness: 0.15,
  metalness: 0.95,
});

function createWheelMesh(radius = 0.38, width = 0.26): THREE.Mesh {
  const wheelGeom = new THREE.CylinderGeometry(radius, radius, width, 16);
  wheelGeom.rotateZ(Math.PI / 2); // Axis along X
  const materials = [tireMaterial, rimMaterial, rimMaterial];
  const wheel = new THREE.Mesh(wheelGeom, materials);
  wheel.castShadow = true;
  return wheel;
}

/**
 * Procedural composite player car (3-14 parts depending on vehicle type).
 */
export function createPlayerCar(carId: string, initialColor: string): BuiltCar {
  const root = new THREE.Group();
  const wheels: THREE.Mesh[] = [];

  const paintMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(initialColor),
    metalness: 0.8,
    roughness: 0.22,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  });

  let width = 2.0;
  let length = 4.4;
  let height = 1.25;
  let wheelRadius = 0.38;
  let wheelWidth = 0.28;
  let wheelY = wheelRadius;

  let cabinW = 1.6;
  let cabinH = 0.52;
  let cabinD = 2.3;
  let chassisGeom: THREE.BoxGeometry;
  let cabinGeom: THREE.BoxGeometry;
  let cabinPos: [number, number, number] = [0, 0.8, -0.2];
  let chassisY = 0.52;

  // Custom exhaust offsets
  let exX = 0.45;
  let exY = 0.32;
  let exZ = -length * 0.5;

  if (carId === 'suzuki-hatchback' || carId === 'starter-hatchback') {
    // 1. Maruti Suzuki-inspired Hatchback (Swift City Hatch)
    width = 1.95;
    length = 3.95;
    height = 1.4;
    cabinW = 1.62;
    cabinH = 0.62;
    cabinD = 2.25;
    chassisGeom = new THREE.BoxGeometry(1.85, 0.56, 3.85);
    cabinGeom = new THREE.BoxGeometry(cabinW, cabinH, cabinD);
    cabinPos = [0, 0.86, -0.28];
    chassisY = 0.54;
  } else if (carId === 'honda-sedan') {
    // 2. Honda-inspired Sedan (Civic Type-V Sedan)
    width = 2.0;
    length = 4.55;
    height = 1.32;
    cabinW = 1.58;
    cabinH = 0.52;
    cabinD = 2.45;
    chassisGeom = new THREE.BoxGeometry(1.92, 0.5, 4.45);
    cabinGeom = new THREE.BoxGeometry(cabinW, cabinH, cabinD);
    cabinPos = [0, 0.78, -0.18];
    chassisY = 0.52;
  } else if (carId === 'bmw-m-coupe') {
    // 3. BMW-inspired Sports Coupe (Bavaria M-Coupe)
    width = 2.06;
    length = 4.5;
    height = 1.25;
    cabinW = 1.56;
    cabinH = 0.5;
    cabinD = 2.35;
    chassisGeom = new THREE.BoxGeometry(1.98, 0.48, 4.4);
    cabinGeom = new THREE.BoxGeometry(cabinW, cabinH, cabinD);
    cabinPos = [0, 0.74, -0.22];
    chassisY = 0.5;
  } else if (carId === 'mahindra-suv') {
    // 4. Mahindra-inspired Rugged SUV (Maha Trekker 4x4)
    width = 2.15;
    length = 4.35;
    height = 1.82;
    wheelRadius = 0.44;
    wheelWidth = 0.32;
    wheelY = wheelRadius;
    cabinW = 1.82;
    cabinH = 0.74;
    cabinD = 2.65;
    chassisGeom = new THREE.BoxGeometry(2.05, 0.65, 4.25);
    cabinGeom = new THREE.BoxGeometry(cabinW, cabinH, cabinD);
    cabinPos = [0, 1.15, -0.2];
    chassisY = 0.72;
  } else if (carId === 'jeep-offroad') {
    // 5. Jeep-inspired Off-Road 4x4 (Trail Raider 4x4)
    width = 2.15;
    length = 4.2;
    height = 1.85;
    wheelRadius = 0.46;
    wheelWidth = 0.34;
    wheelY = wheelRadius;
    cabinW = 1.76;
    cabinH = 0.68;
    cabinD = 2.1;
    chassisGeom = new THREE.BoxGeometry(2.0, 0.62, 4.05);
    cabinGeom = new THREE.BoxGeometry(cabinW, cabinH, cabinD);
    cabinPos = [0, 1.12, 0.1];
    chassisY = 0.72;
  } else if (carId === 'mercedes-luxury-gt') {
    // 6. Mercedes-Benz-inspired Luxury GT (Silverstar Grand GT)
    width = 2.1;
    length = 4.72;
    height = 1.22;
    cabinW = 1.54;
    cabinH = 0.48;
    cabinD = 2.2;
    chassisGeom = new THREE.BoxGeometry(2.02, 0.46, 4.65);
    cabinGeom = new THREE.BoxGeometry(cabinW, cabinH, cabinD);
    cabinPos = [0, 0.73, -0.38];
    chassisY = 0.5;
  } else if (carId === 'jaguar-perf-coupe') {
    // 7. Jaguar-inspired Performance Coupe (Predator F-Coupe)
    width = 2.08;
    length = 4.56;
    height = 1.23;
    cabinW = 1.52;
    cabinH = 0.48;
    cabinD = 2.3;
    chassisGeom = new THREE.BoxGeometry(2.0, 0.46, 4.48);
    cabinGeom = new THREE.BoxGeometry(cabinW, cabinH, cabinD);
    cabinPos = [0, 0.72, -0.24];
    chassisY = 0.49;
  } else if (carId === 'premium-luxury-suv') {
    // 8. Premium Full-Size SUV (Royal Crown SUV)
    width = 2.25;
    length = 4.95;
    height = 1.78;
    wheelRadius = 0.42;
    wheelWidth = 0.3;
    wheelY = wheelRadius;
    cabinW = 1.9;
    cabinH = 0.72;
    cabinD = 3.1;
    chassisGeom = new THREE.BoxGeometry(2.15, 0.68, 4.85);
    cabinGeom = new THREE.BoxGeometry(cabinW, cabinH, cabinD);
    cabinPos = [0, 1.1, -0.28];
    chassisY = 0.68;
  } else if (carId === 'cargo-truck') {
    // 9. Heavy Cargo Truck (Titan Hauler 18)
    width = 2.5;
    length = 5.85;
    height = 2.45;
    wheelRadius = 0.46;
    wheelWidth = 0.35;
    wheelY = wheelRadius;
    cabinW = 2.38;
    cabinH = 1.25;
    cabinD = 2.1;
    chassisGeom = new THREE.BoxGeometry(2.4, 0.75, 5.7);
    cabinGeom = new THREE.BoxGeometry(cabinW, cabinH, cabinD);
    cabinPos = [0, 1.55, 1.5];
    chassisY = 0.85;
  } else {
    // 10. Ferrari-inspired Supercar (Rosso Maranello V12)
    width = 2.2;
    length = 4.75;
    height = 1.12;
    cabinW = 1.44;
    cabinH = 0.44;
    cabinD = 2.25;
    chassisGeom = new THREE.BoxGeometry(2.12, 0.42, 4.68);
    cabinGeom = new THREE.BoxGeometry(cabinW, cabinH, cabinD);
    cabinPos = [0, 0.65, 0.12];
    chassisY = 0.46;
  }

  // Update default exhaust position based on car length
  exZ = -length * 0.495;
  exY = chassisY - 0.16;

  // Part 1: Main Body Chassis
  const bodyMesh = new THREE.Mesh(chassisGeom, paintMaterial);
  bodyMesh.position.y = chassisY;
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  root.add(bodyMesh);

  // Part 2: Aerodynamic Cabin & Glass
  const cabinMesh = new THREE.Mesh(cabinGeom, glassMaterial);
  cabinMesh.position.set(...cabinPos);
  cabinMesh.castShadow = true;
  root.add(cabinMesh);

  // Part 3: Roof plate in paint / carbon finish
  const roofGeom = new THREE.BoxGeometry(cabinW * 0.94, 0.08, cabinD * 0.72);
  const roofMesh = new THREE.Mesh(roofGeom, carId === 'bmw-m-coupe' ? carbonMaterial : paintMaterial);
  roofMesh.position.set(cabinPos[0], cabinPos[1] + cabinH * 0.5 + 0.03, cabinPos[2] - 0.08);
  roofMesh.castShadow = true;
  root.add(roofMesh);

  // Vehicle-Specific Recognizable Details:
  if (carId === 'bmw-m-coupe') {
    // Iconic BMW Dual Kidney Grille
    const kidneyL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.08), chromeMaterial);
    const kidneyR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.08), chromeMaterial);
    kidneyL.position.set(-0.16, chassisY + 0.02, length * 0.495);
    kidneyR.position.set(0.16, chassisY + 0.02, length * 0.495);
    root.add(kidneyL, kidneyR);

    // Quad exhaust
    exX = 0.52;
  } else if (carId === 'mercedes-luxury-gt') {
    // Panamericana Vertical Slat Grille
    const grilleMesh = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.22, 0.08), chromeMaterial);
    grilleMesh.position.set(0, chassisY + 0.02, length * 0.495);
    root.add(grilleMesh);
  } else if (carId === 'jaguar-perf-coupe') {
    // Oval Mesh Grille
    const ovalGrille = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 16), chromeMaterial);
    ovalGrille.rotateX(Math.PI / 2);
    ovalGrille.position.set(0, chassisY, length * 0.495);
    root.add(ovalGrille);
    // Central trumpet exhaust
    exX = 0.15;
  } else if (carId === 'mahindra-suv') {
    // Roof Luggage Rails
    const railL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 2.3), chromeMaterial);
    const railR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 2.3), chromeMaterial);
    railL.position.set(-cabinW * 0.45, cabinPos[1] + cabinH * 0.5 + 0.1, cabinPos[2]);
    railR.position.set(cabinW * 0.45, cabinPos[1] + cabinH * 0.5 + 0.1, cabinPos[2]);
    root.add(railL, railR);

    // Side Running Boards (Foot steps)
    const stepL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 2.2), chromeMaterial);
    const stepR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 2.2), chromeMaterial);
    stepL.position.set(-width * 0.52, 0.32, -0.1);
    stepR.position.set(width * 0.52, 0.32, -0.1);
    root.add(stepL, stepR);

    // Rear Tailgate Spare Tire
    const spareTire = createWheelMesh(wheelRadius * 0.9, 0.24);
    spareTire.position.set(0, chassisY + 0.3, -length * 0.52);
    spareTire.rotateY(Math.PI / 2);
    root.add(spareTire);
  } else if (carId === 'jeep-offroad') {
    // 7-Slot Grille & Heavy Bumper
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(width * 0.95, 0.2, 0.3), carbonMaterial);
    bumper.position.set(0, 0.42, length * 0.5);
    root.add(bumper);

    // Exposed Roll-Cage bars over open bed
    const barGeom = new THREE.CylinderGeometry(0.05, 0.05, 1.4, 8);
    const barL = new THREE.Mesh(barGeom, carbonMaterial);
    const barR = new THREE.Mesh(barGeom, carbonMaterial);
    barL.position.set(-cabinW * 0.44, 1.2, -0.9);
    barR.position.set(cabinW * 0.44, 1.2, -0.9);
    root.add(barL, barR);
  } else if (carId === 'premium-luxury-suv') {
    // Chrome shield grille & roof rails
    const shieldGrille = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.35, 0.08), chromeMaterial);
    shieldGrille.position.set(0, chassisY + 0.1, length * 0.495);
    root.add(shieldGrille);

    const railL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 2.7), chromeMaterial);
    const railR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 2.7), chromeMaterial);
    railL.position.set(-cabinW * 0.46, cabinPos[1] + cabinH * 0.5 + 0.1, cabinPos[2]);
    railR.position.set(cabinW * 0.46, cabinPos[1] + cabinH * 0.5 + 0.1, cabinPos[2]);
    root.add(railL, railR);
  } else if (carId === 'cargo-truck') {
    // Commercial Cargo Container Box on Rear
    const containerGeom = new THREE.BoxGeometry(2.42, 1.5, 3.4);
    const containerMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.6,
      metalness: 0.4,
    });
    const containerMesh = new THREE.Mesh(containerGeom, containerMat);
    containerMesh.position.set(0, 1.4, -1.05);
    containerMesh.castShadow = true;
    root.add(containerMesh);

    // Massive Upright Chrome Front Grille
    const truckGrille = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 0.1), chromeMaterial);
    truckGrille.position.set(0, chassisY + 0.4, length * 0.49);
    root.add(truckGrille);

    // Dual Tall Vertical Chrome Exhaust Smokestacks
    const stackGeom = new THREE.CylinderGeometry(0.09, 0.09, 1.9, 12);
    const stackL = new THREE.Mesh(stackGeom, chromeMaterial);
    const stackR = new THREE.Mesh(stackGeom, chromeMaterial);
    stackL.position.set(-1.18, 1.85, 0.4);
    stackR.position.set(1.18, 1.85, 0.4);
    root.add(stackL, stackR);

    // Cab Visor
    const visor = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.1, 0.4), carbonMaterial);
    visor.position.set(0, 2.18, 2.45);
    root.add(visor);
  } else if (carId === 'ferrari-supercar') {
    // Side aero vents and rear aggressive diffuser
    const ventL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.28, 0.9), carbonMaterial);
    const ventR = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.28, 0.9), carbonMaterial);
    ventL.position.set(-width * 0.48, 0.46, 0.0);
    ventR.position.set(width * 0.48, 0.46, 0.0);
    root.add(ventL, ventR);

    const spoilerWing = new THREE.Mesh(new THREE.BoxGeometry(width * 0.92, 0.06, 0.4), carbonMaterial);
    spoilerWing.position.set(0, 0.92, -length * 0.45);
    root.add(spoilerWing);
  }

  // Headlights (Front +Z)
  const headW = carId === 'jeep-offroad' ? 0.22 : 0.36;
  const headGeom = carId === 'jeep-offroad'
    ? new THREE.CylinderGeometry(0.16, 0.16, 0.1, 16)
    : new THREE.BoxGeometry(headW, 0.12, 0.1);
  if (carId === 'jeep-offroad') headGeom.rotateX(Math.PI / 2);

  const headL = new THREE.Mesh(headGeom, headlightMaterial);
  const headR = new THREE.Mesh(headGeom, headlightMaterial);
  const headY = chassisY + (carId === 'cargo-truck' ? 0.2 : 0.04);
  headL.position.set(-width * 0.36, headY, length * 0.495);
  headR.position.set(width * 0.36, headY, length * 0.495);
  root.add(headL, headR);

  // Taillights (Rear -Z)
  const tailGeom = new THREE.BoxGeometry(0.4, 0.1, 0.1);
  const tailL = new THREE.Mesh(tailGeom, taillightMaterial);
  const tailR = new THREE.Mesh(tailGeom, taillightMaterial);
  const tailY = chassisY + 0.08;
  tailL.position.set(-width * 0.36, tailY, -length * 0.495);
  tailR.position.set(width * 0.36, tailY, -length * 0.495);
  root.add(tailL, tailR);

  // Dual Exhaust Tips
  const exhaustGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.25, 12);
  exhaustGeom.rotateX(Math.PI / 2);
  const exL = new THREE.Mesh(exhaustGeom, chromeMaterial);
  const exR = new THREE.Mesh(exhaustGeom, chromeMaterial);
  exL.position.set(-exX, exY, exZ);
  exR.position.set(exX, exY, exZ);
  root.add(exL, exR);

  // Wheels Placement
  const wheelHalfX = width * 0.48;
  const wheelFrontZ = length * 0.32;
  const wheelRearZ = -length * 0.32;

  // For Cargo Truck, add 6 wheels (front + tandem rear axle)
  const wheelPositions = carId === 'cargo-truck'
    ? [
        [-wheelHalfX, wheelY, wheelFrontZ], // Front-Left
        [wheelHalfX, wheelY, wheelFrontZ],  // Front-Right
        [-wheelHalfX, wheelY, wheelRearZ + 0.55], // Mid-Left
        [wheelHalfX, wheelY, wheelRearZ + 0.55],  // Mid-Right
        [-wheelHalfX, wheelY, wheelRearZ - 0.55], // Rear-Left
        [wheelHalfX, wheelY, wheelRearZ - 0.55],  // Rear-Right
      ]
    : [
        [-wheelHalfX, wheelY, wheelFrontZ], // Front-Left
        [wheelHalfX, wheelY, wheelFrontZ],  // Front-Right
        [-wheelHalfX, wheelY, wheelRearZ],  // Rear-Left
        [wheelHalfX, wheelY, wheelRearZ],   // Rear-Right
      ];

  wheelPositions.forEach(([wx, wy, wz]) => {
    const wheel = createWheelMesh(wheelRadius, wheelWidth);
    wheel.position.set(wx, wy, wz);
    wheels.push(wheel);
    root.add(wheel);
  });

  // Soft contact shadow plane beneath the vehicle
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 128;
  shadowCanvas.height = 256;
  const sctx = shadowCanvas.getContext('2d')!;
  const gradient = sctx.createRadialGradient(64, 128, 10, 64, 128, 110);
  gradient.addColorStop(0, 'rgba(0,0,0,0.7)');
  gradient.addColorStop(0.6, 'rgba(0,0,0,0.3)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  sctx.fillStyle = gradient;
  sctx.fillRect(0, 0, 128, 256);
  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const shadowGeom = new THREE.PlaneGeometry(width * 1.3, length * 1.25);
  shadowGeom.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
  });
  const shadowMesh = new THREE.Mesh(shadowGeom, shadowMat);
  shadowMesh.position.y = 0.03;
  root.add(shadowMesh);

  return {
    group: root,
    wheels,
    leftExhaust: new THREE.Vector3(-exX, exY, exZ),
    rightExhaust: new THREE.Vector3(exX, exY, exZ),
    bodyMesh,
    paintMaterial,
    width,
    length,
    height,
  };
}

/**
 * Procedural composite traffic vehicles (Sedans, Heavy Trucks, SUVs, Vans).
 */
export function createTrafficVehicle(type: 'sedan' | 'truck' | 'suv' | 'van', colorHex: string): BuiltTraffic {
  const root = new THREE.Group();
  const wheels: THREE.Mesh[] = [];

  const paintMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex),
    roughness: 0.35,
    metalness: 0.6,
  });

  let width = 2.0;
  let length = 4.3;
  let height = 1.3;
  const wheelRadius = 0.38;

  if (type === 'truck') {
    // Heavy Semi Truck with Box Cargo
    width = 2.5;
    length = 7.5;
    height = 3.2;

    // Cab (Front, +Z)
    const cabGeom = new THREE.BoxGeometry(2.4, 2.2, 2.2);
    const cab = new THREE.Mesh(cabGeom, paintMat);
    cab.position.set(0, 1.4, 2.4);
    cab.castShadow = true;
    root.add(cab);

    // Cab Windshield
    const cabGlassGeom = new THREE.BoxGeometry(2.2, 0.9, 0.1);
    const cabGlass = new THREE.Mesh(cabGlassGeom, glassMaterial);
    cabGlass.position.set(0, 1.8, 3.48);
    root.add(cabGlass);

    // Large Box Trailer (Rear, -Z)
    const trailerMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.6,
      metalness: 0.2,
    });
    const trailerGeom = new THREE.BoxGeometry(2.45, 2.6, 5.0);
    const trailer = new THREE.Mesh(trailerGeom, trailerMat);
    trailer.position.set(0, 1.7, -1.0);
    trailer.castShadow = true;
    root.add(trailer);

    // 6 Wheels (2 front, 4 rear tandem)
    const wheelPositions = [
      [-1.25, wheelRadius, 2.5],
      [1.25, wheelRadius, 2.5],
      [-1.25, wheelRadius, -1.8],
      [1.25, wheelRadius, -1.8],
      [-1.25, wheelRadius, -2.8],
      [1.25, wheelRadius, -2.8],
    ];
    wheelPositions.forEach(([wx, wy, wz]) => {
      const w = createWheelMesh(wheelRadius * 1.1, 0.32);
      w.position.set(wx, wy, wz);
      wheels.push(w);
      root.add(w);
    });
  } else if (type === 'suv') {
    // Taller SUV / Crossover
    width = 2.15;
    length = 4.7;
    height = 1.7;

    const body = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.7, 4.6), paintMat);
    body.position.set(0, 0.6, 0);
    body.castShadow = true;
    root.add(body);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.75, 3.0), glassMaterial);
    cabin.position.set(0, 1.25, -0.2);
    cabin.castShadow = true;
    root.add(cabin);

    // Roof rack rails
    const railGeom = new THREE.BoxGeometry(0.06, 0.06, 2.6);
    const railL = new THREE.Mesh(railGeom, chromeMaterial);
    const railR = new THREE.Mesh(railGeom, chromeMaterial);
    railL.position.set(-0.75, 1.68, -0.2);
    railR.position.set(0.75, 1.68, -0.2);
    root.add(railL, railR);

    // 4 Wheels
    [
      [-1.05, wheelRadius, 1.5],
      [1.05, wheelRadius, 1.5],
      [-1.05, wheelRadius, -1.5],
      [1.05, wheelRadius, -1.5],
    ].forEach(([wx, wy, wz]) => {
      const w = createWheelMesh(wheelRadius * 1.05, 0.28);
      w.position.set(wx, wy, wz);
      wheels.push(w);
      root.add(w);
    });
  } else if (type === 'van') {
    // Delivery Van
    width = 2.2;
    length = 5.2;
    height = 2.3;

    const body = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.8, 5.0), paintMat);
    body.position.set(0, 1.15, 0);
    body.castShadow = true;
    root.add(body);

    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.8, 0.1), glassMaterial);
    windshield.position.set(0, 1.45, 2.48);
    root.add(windshield);

    [
      [-1.08, wheelRadius, 1.6],
      [1.08, wheelRadius, 1.6],
      [-1.08, wheelRadius, -1.6],
      [1.08, wheelRadius, -1.6],
    ].forEach(([wx, wy, wz]) => {
      const w = createWheelMesh(wheelRadius, 0.28);
      w.position.set(wx, wy, wz);
      wheels.push(w);
      root.add(w);
    });
  } else {
    // Standard City Sedan
    width = 2.0;
    length = 4.4;
    height = 1.35;

    const body = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.55, 4.3), paintMat);
    body.position.set(0, 0.52, 0);
    body.castShadow = true;
    root.add(body);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.58, 2.4), glassMaterial);
    cabin.position.set(0, 0.98, -0.2);
    cabin.castShadow = true;
    root.add(cabin);

    [
      [-0.98, wheelRadius, 1.4],
      [0.98, wheelRadius, 1.4],
      [-0.98, wheelRadius, -1.4],
      [0.98, wheelRadius, -1.4],
    ].forEach(([wx, wy, wz]) => {
      const w = createWheelMesh(wheelRadius, 0.26);
      w.position.set(wx, wy, wz);
      wheels.push(w);
      root.add(w);
    });
  }

  // Headlights & Taillights for traffic
  const headL = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.1), headlightMaterial);
  const headR = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.1), headlightMaterial);
  headL.position.set(-width * 0.36, 0.6, length * 0.49);
  headR.position.set(width * 0.36, 0.6, length * 0.49);

  const tailL = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.1), taillightMaterial);
  const tailR = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.1), taillightMaterial);
  tailL.position.set(-width * 0.36, 0.65, -length * 0.49);
  tailR.position.set(width * 0.36, 0.65, -length * 0.49);

  root.add(headL, headR, tailL, tailR);

  return {
    group: root,
    wheels,
    width,
    length,
    height,
  };
}
