import { computeContinentDensity } from './nebulaMath';

export const COLOR_WHITE: readonly [number, number, number] = [0.95, 0.97, 1.0];
export const COLOR_GOLD_LIGHT: readonly [number, number, number] = [1.0, 0.84, 0.56];
export const COLOR_AMBER: readonly [number, number, number] = [1.0, 0.62, 0.26];
export const COLOR_COBALT: readonly [number, number, number] = [0.26, 0.5, 1.0];
export const COLOR_SLATE: readonly [number, number, number] = [0.36, 0.39, 0.49];

const TWO_PI = Math.PI * 2;

interface WeightedEmitter {
  w: number;
  emit: (pos: Float32Array, col: Float32Array, idx: number, t: number) => void;
}

interface OrbitRing {
  rx: number;
  ry: number;
  a: number;
  b: number;
}

const ORBIT_RINGS: ReadonlyArray<OrbitRing> = [
  { rx: 0.2, ry: 0, a: 1, b: 0.6 },
  { rx: 1.15, ry: 0.5, a: 0.86, b: 0.62 },
  { rx: 0.6, ry: -0.7, a: 1.02, b: 0.54 },
  { rx: 1.45, ry: 0.95, a: 0.78, b: 0.7 },
  { rx: 0.35, ry: 1.25, a: 0.92, b: 0.5 },
  { rx: -0.5, ry: 0.4, a: 0.84, b: 0.66 },
];

const ELECTRON_CLUSTERS = [
  { o: 0, ang: 0.6, blue: true },
  { o: 1, ang: 2.4, blue: true },
  { o: 2, ang: 4.1, blue: true },
  { o: 3, ang: 1.2, blue: true },
  { o: 4, ang: 3.3, blue: false },
  { o: 1, ang: 5.0, blue: false },
  { o: 5, ang: 0.25, blue: false },
] as const;

function writeColor(
  target: Float32Array,
  index: number,
  rgb: readonly [number, number, number],
  gain = 1
): void {
  const base = 3 * index;
  target[base] = Math.min(1.35, rgb[0] * gain);
  target[base + 1] = Math.min(1.35, rgb[1] * gain);
  target[base + 2] = Math.min(1.35, rgb[2] * gain);
}

function sampleUnitSphere(out: [number, number, number], rand: () => number): void {
  const theta = rand() * TWO_PI;
  const z = 2 * rand() - 1;
  const r = Math.sqrt(Math.max(0, 1 - z * z));
  out[0] = Math.cos(theta) * r;
  out[1] = z;
  out[2] = Math.sin(theta) * r;
}

function emitWeightedCloud(
  count: number,
  pos: Float32Array,
  col: Float32Array,
  emitters: ReadonlyArray<WeightedEmitter>,
  rand: () => number
): void {
  const totalWeight = emitters.reduce((acc, item) => acc + item.w, 0);
  let cursor = 0;
  for (let i = 0; i < emitters.length; i++) {
    const share =
      i === emitters.length - 1
        ? count - cursor
        : Math.round((emitters[i].w / totalWeight) * count);
    for (let j = 0; j < share && cursor < count; j++, cursor++) {
      emitters[i].emit(pos, col, cursor, share > 1 ? j / (share - 1) : 0);
    }
  }
  while (cursor < count) {
    emitters[emitters.length - 1].emit(pos, col, cursor, rand());
    cursor++;
  }
}

function centerOrientAndNormalize(
  count: number,
  pos: Float32Array,
  rx: number,
  ry: number,
  rz: number
): void {
  let cx = 0;
  let cy = 0;
  let cz = 0;
  for (let i = 0; i < count; i++) {
    cx += pos[3 * i];
    cy += pos[3 * i + 1];
    cz += pos[3 * i + 2];
  }
  cx /= count;
  cy /= count;
  cz /= count;

  const cosX = Math.cos(rx);
  const sinX = Math.sin(rx);
  const cosY = Math.cos(ry);
  const sinY = Math.sin(ry);
  const cosZ = Math.cos(rz);
  const sinZ = Math.sin(rz);

  let maxSq = 1e-6;
  for (let i = 0; i < count; i++) {
    let x = pos[3 * i] - cx;
    let y = pos[3 * i + 1] - cy;
    let z = pos[3 * i + 2] - cz;

    const y1 = y * cosX - z * sinX;
    const z1 = y * sinX + z * cosX;
    y = y1;
    z = z1;

    const x2 = x * cosY + z * sinY;
    const z2 = -x * sinY + z * cosY;
    x = x2;
    z = z2;

    const x3 = x * cosZ - y * sinZ;
    const y3 = x * sinZ + y * cosZ;
    x = x3;
    y = y3;

    pos[3 * i] = x;
    pos[3 * i + 1] = y;
    pos[3 * i + 2] = z;

    const sq = x * x + y * y + z * z;
    if (sq > maxSq) maxSq = sq;
  }

  const invRadius = 1 / Math.sqrt(maxSq);
  for (let i = 0; i < count; i++) {
    pos[3 * i] *= invRadius;
    pos[3 * i + 1] *= invRadius;
    pos[3 * i + 2] *= invRadius;
  }
}

function sampleOrbitPoint(
  ring: OrbitRing,
  angle: number,
  scale: number,
  out: [number, number, number]
): void {
  let x = Math.cos(angle) * ring.a * scale;
  let y = Math.sin(angle) * ring.b * scale;
  let z = 0;

  const y1 = y * Math.cos(ring.rx) - z * Math.sin(ring.rx);
  const z1 = y * Math.sin(ring.rx) + z * Math.cos(ring.rx);
  y = y1;
  z = z1;

  const x2 = x * Math.cos(ring.ry) + z * Math.sin(ring.ry);
  const z2 = -x * Math.sin(ring.ry) + z * Math.cos(ring.ry);
  x = x2;
  z = z2;

  out[0] = x;
  out[1] = y;
  out[2] = z;
}

export interface NebulaBaseData {
  count: number;
  rocketPos: Float32Array;
  rocketCol: Float32Array;
  atomPos: Float32Array;
  atomCol: Float32Array;
  astronautPos: Float32Array;
  astronautCol: Float32Array;
  globeUnitPos: Float32Array;
  globeElevation: Float32Array;
  globeCol: Float32Array;
  starfieldCol: Float32Array;
  baseSizes: Float32Array;
  randomA: Float32Array;
  randomB: Float32Array;
  scatterDirs: Float32Array;
  sectionColors: Float32Array[];
}

/**
 * Generates all 7 base particle clouds and color buffers matching Kexsio Nebula.
 */
export function generateNebulaBaseData(
  count: number,
  rand: () => number = Math.random
): NebulaBaseData {
  const randomA = new Float32Array(count);
  const randomB = new Float32Array(count);
  const scatterDirs = new Float32Array(3 * count);
  const baseSizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    randomA[i] = rand();
    randomB[i] = rand();
    const theta = rand() * TWO_PI;
    const phi = (rand() - 0.5) * Math.PI;
    scatterDirs[3 * i] = Math.cos(theta) * Math.cos(phi);
    scatterDirs[3 * i + 1] = Math.sin(phi);
    scatterDirs[3 * i + 2] = Math.sin(theta) * Math.cos(phi);
    baseSizes[i] = rand() < 0.14 ? 1 + 0.8 * rand() : 0.5 + 0.7 * rand();
  }

  // 0: Rocket formation
  const rocketPos = new Float32Array(3 * count);
  const rocketCol = new Float32Array(3 * count);
  emitWeightedCloud(
    count,
    rocketPos,
    rocketCol,
    [
      {
        // Cylindrical fuselage hull
        w: 24,
        emit: (pos, col, idx) => {
          const x = -0.55 + 1.05 * rand();
          const r = 0.34 + (rand() - 0.5) * 0.012;
          const ang = rand() * TWO_PI;
          pos[3 * idx] = x;
          pos[3 * idx + 1] = Math.cos(ang) * r;
          pos[3 * idx + 2] = Math.sin(ang) * r;
          writeColor(col, idx, rand() < 0.12 ? COLOR_WHITE : COLOR_AMBER, 0.85 + 0.3 * rand());
        },
      },
      {
        // Structural hull rings
        w: 6,
        emit: (pos, col, idx) => {
          const rings = [-0.4, -0.12, 0.16, 0.42];
          const x = rings[Math.floor(rand() * rings.length)] + (rand() - 0.5) * 0.015;
          const ang = rand() * TWO_PI;
          const r = 0.34 + 0.012;
          pos[3 * idx] = x;
          pos[3 * idx + 1] = Math.cos(ang) * r;
          pos[3 * idx + 2] = Math.sin(ang) * r;
          writeColor(col, idx, rand() < 0.3 ? COLOR_WHITE : COLOR_AMBER, 0.95 + 0.3 * rand());
        },
      },
      {
        // Tapered nose cone
        w: 13,
        emit: (pos, col, idx) => {
          const t = rand();
          const r = 0.34 * (1 - t) + 0.005;
          const ang = rand() * TWO_PI;
          pos[3 * idx] = 0.5 + 0.62 * t;
          pos[3 * idx + 1] = Math.cos(ang) * r;
          pos[3 * idx + 2] = Math.sin(ang) * r;
          writeColor(col, idx, t > 0.86 ? COLOR_WHITE : COLOR_AMBER, 0.9 + 0.3 * rand());
        },
      },
      {
        // Glowing porthole window
        w: 13,
        emit: (pos, col, idx) => {
          const ang = rand() * TWO_PI;
          const u = rand();
          let radius: number;
          let color: readonly [number, number, number];
          let gain: number;
          if (u < 0.62) {
            radius = 0.092 * Math.sqrt(rand());
            color = rand() < 0.15 ? COLOR_WHITE : COLOR_COBALT;
            gain = 1.15 + 0.3 * rand();
          } else if (u < 0.84) {
            radius = 0.112 + (rand() - 0.5) * 0.012;
            color = COLOR_AMBER;
            gain = 1 + 0.2 * rand();
          } else {
            radius = 0.145 + (rand() - 0.5) * 0.014;
            color = rand() < 0.45 ? COLOR_WHITE : COLOR_AMBER;
            gain = 1;
          }
          const c = Math.cos(ang) * radius;
          const s = Math.sin(ang) * radius;
          pos[3 * idx] = 0.16 + c;
          pos[3 * idx + 1] = 0.2 + 0.819 * s;
          pos[3 * idx + 2] = 0.29 - 0.574 * s;
          writeColor(col, idx, color, gain);
        },
      },
      {
        // Three swept stabilizer fins
        w: 18,
        emit: (pos, col, idx) => {
          const finAngle = Math.floor(3 * rand()) * (TWO_PI / 3) + 0.4;
          const u = rand();
          const v = rand();
          const radial = 0.34 + 0.36 * v * (0.45 + 0.55 * u);
          const cosA = Math.cos(finAngle);
          const sinA = Math.sin(finAngle);
          const thickness = (rand() - 0.5) * 0.03;
          pos[3 * idx] = -0.5 - 0.46 * u;
          pos[3 * idx + 1] = cosA * radial - sinA * thickness;
          pos[3 * idx + 2] = sinA * radial + cosA * thickness;
          if (v > 0.78) {
            writeColor(col, idx, COLOR_AMBER, 0.95);
          } else if (v < 0.35 && rand() < 0.5) {
            writeColor(col, idx, COLOR_COBALT, 0.92);
          } else {
            writeColor(col, idx, rand() < 0.5 ? COLOR_AMBER : COLOR_COBALT, 0.85);
          }
        },
      },
      {
        // Rocket thruster exhaust plume
        w: 18,
        emit: (pos, col, idx) => {
          const u = rand();
          const r = (0.05 + 0.24 * u) * Math.sqrt(rand());
          const ang = rand() * TWO_PI;
          pos[3 * idx] = -0.92 - 0.95 * u;
          pos[3 * idx + 1] = Math.cos(ang) * r;
          pos[3 * idx + 2] = Math.sin(ang) * r;
          writeColor(
            col,
            idx,
            rand() < 0.5 ? COLOR_AMBER : COLOR_COBALT,
            0.8 - 0.45 * u + 0.2 * rand()
          );
        },
      },
      {
        // Interior core volume
        w: 8,
        emit: (pos, col, idx) => {
          const x = -0.55 + 1.05 * rand();
          const r = 0.23 * rand();
          const ang = rand() * TWO_PI;
          pos[3 * idx] = x;
          pos[3 * idx + 1] = Math.cos(ang) * r;
          pos[3 * idx + 2] = Math.sin(ang) * r;
          writeColor(col, idx, COLOR_SLATE, 0.7 + 0.3 * rand());
        },
      },
    ],
    rand
  );
  centerOrientAndNormalize(count, rocketPos, 0.06, -0.22, 0.55);

  // 2: Atomic orbital formation (Agency)
  const atomPos = new Float32Array(3 * count);
  const atomCol = new Float32Array(3 * count);
  const scratchSphere: [number, number, number] = [0, 0, 0];
  const scratchOrbit: [number, number, number] = [0, 0, 0];

  emitWeightedCloud(
    count,
    atomPos,
    atomCol,
    [
      {
        w: 20,
        emit: (pos, col, idx) => {
          sampleUnitSphere(scratchSphere, rand);
          const r = 0.27 * Math.pow(rand(), 0.5);
          pos[3 * idx] = scratchSphere[0] * r;
          pos[3 * idx + 1] = scratchSphere[1] * r;
          pos[3 * idx + 2] = scratchSphere[2] * r;
          writeColor(
            col,
            idx,
            r < 0.08 ? COLOR_WHITE : rand() < 0.2 ? COLOR_GOLD_LIGHT : COLOR_AMBER,
            0.95 + 0.4 * rand()
          );
        },
      },
      {
        w: 6,
        emit: (pos, col, idx) => {
          sampleUnitSphere(scratchSphere, rand);
          const r = 0.27 + 0.2 * rand();
          pos[3 * idx] = scratchSphere[0] * r;
          pos[3 * idx + 1] = scratchSphere[1] * r;
          pos[3 * idx + 2] = scratchSphere[2] * r;
          writeColor(col, idx, rand() < 0.5 ? COLOR_WHITE : COLOR_AMBER, 0.7 + 0.3 * rand());
        },
      },
      {
        w: 42,
        emit: (pos, col, idx) => {
          const ring = ORBIT_RINGS[Math.floor(rand() * ORBIT_RINGS.length)];
          sampleOrbitPoint(ring, rand() * TWO_PI, 1, scratchOrbit);
          pos[3 * idx] = scratchOrbit[0] + (rand() - 0.5) * 0.014;
          pos[3 * idx + 1] = scratchOrbit[1] + (rand() - 0.5) * 0.014;
          pos[3 * idx + 2] = scratchOrbit[2] + (rand() - 0.5) * 0.014;
          writeColor(col, idx, rand() < 0.15 ? COLOR_WHITE : COLOR_AMBER, 0.8 + 0.3 * rand());
        },
      },
      {
        w: 26,
        emit: (pos, col, idx) => {
          const cluster = ELECTRON_CLUSTERS[Math.floor(rand() * ELECTRON_CLUSTERS.length)];
          sampleOrbitPoint(ORBIT_RINGS[cluster.o], cluster.ang, 1, scratchOrbit);
          sampleUnitSphere(scratchSphere, rand);
          const spread = cluster.blue ? 0.12 : 0.075;
          pos[3 * idx] = scratchOrbit[0] + scratchSphere[0] * spread;
          pos[3 * idx + 1] = scratchOrbit[1] + scratchSphere[1] * spread;
          pos[3 * idx + 2] = scratchOrbit[2] + scratchSphere[2] * spread;
          writeColor(
            col,
            idx,
            cluster.blue ? COLOR_COBALT : COLOR_AMBER,
            cluster.blue ? 1 + 0.3 * rand() : 0.9 + 0.3 * rand()
          );
        },
      },
      {
        w: 6,
        emit: (pos, col, idx) => {
          const ring = ORBIT_RINGS[Math.floor(rand() * ORBIT_RINGS.length)];
          sampleOrbitPoint(ring, rand() * TWO_PI, 0.4 + 0.6 * rand(), scratchOrbit);
          pos[3 * idx] = scratchOrbit[0];
          pos[3 * idx + 1] = scratchOrbit[1];
          pos[3 * idx + 2] = scratchOrbit[2];
          writeColor(col, idx, COLOR_SLATE, 0.5 + 0.3 * rand());
        },
      },
    ],
    rand
  );
  centerOrientAndNormalize(count, atomPos, 0.38, 0.12, 0);

  // 5 & 6: Astronaut character formation (Team & Contact)
  const astronautPos = new Float32Array(3 * count);
  const astronautCol = new Float32Array(3 * count);
  const limbSphere: [number, number, number] = [0, 0, 0];

  function emitCapsuleSegment(
    pos: Float32Array,
    idx: number,
    x1: number,
    y1: number,
    z1: number,
    x2: number,
    y2: number,
    z2: number,
    radius: number
  ): void {
    const t = rand();
    sampleUnitSphere(limbSphere, rand);
    pos[3 * idx] = x1 + (x2 - x1) * t + limbSphere[0] * radius;
    pos[3 * idx + 1] = y1 + (y2 - y1) * t + limbSphere[1] * radius;
    pos[3 * idx + 2] = z1 + (z2 - z1) * t + limbSphere[2] * radius;
  }

  emitWeightedCloud(
    count,
    astronautPos,
    astronautCol,
    [
      {
        // Helmet sphere
        w: 20,
        emit: (pos, col, idx) => {
          sampleUnitSphere(limbSphere, rand);
          pos[3 * idx] = 0.5 * limbSphere[0];
          pos[3 * idx + 1] = 0.72 + 0.5 * limbSphere[1];
          pos[3 * idx + 2] = 0.5 * limbSphere[2];
          if (Math.abs(limbSphere[0]) > 0.72 && rand() < 0.6) {
            writeColor(col, idx, COLOR_COBALT, 0.9);
          } else {
            writeColor(col, idx, COLOR_WHITE, 0.9 + 0.25 * rand());
          }
        },
      },
      {
        // Helmet visor
        w: 10,
        emit: (pos, col, idx) => {
          const ang = rand() * TWO_PI;
          const r = 0.31 * (0.2 + 0.8 * Math.sqrt(rand()));
          const vx = Math.cos(ang) * r;
          const vy = Math.sin(ang) * r;
          const vz = Math.sqrt(Math.max(0, 0.25 - r * r));
          pos[3 * idx] = vx;
          pos[3 * idx + 1] = 0.72 + 0.9 * vy;
          pos[3 * idx + 2] = vz + 0.02;
          writeColor(col, idx, rand() < 0.3 ? COLOR_COBALT : COLOR_WHITE, 1 + 0.2 * rand());
        },
      },
      {
        // Torso suit
        w: 17,
        emit: (pos, col, idx) => {
          const yOff = -0.16 + 0.5 * rand();
          const r = 0.34 * (0.86 + 0.14 * Math.sin(((yOff + 0.16) / 0.5) * Math.PI));
          const ang = rand() * TWO_PI;
          pos[3 * idx] = Math.cos(ang) * r;
          pos[3 * idx + 1] = 0.1 + yOff;
          pos[3 * idx + 2] = Math.sin(ang) * r;
          if (Math.sin(ang) > 0.55 && rand() < 0.4) {
            writeColor(col, idx, COLOR_WHITE);
          } else {
            writeColor(
              col,
              idx,
              rand() < 0.2 ? COLOR_GOLD_LIGHT : COLOR_AMBER,
              0.85 + 0.35 * rand()
            );
          }
        },
      },
      {
        // Life-support backpack
        w: 6,
        emit: (pos, col, idx) => {
          pos[3 * idx] = (rand() - 0.5) * 0.34;
          pos[3 * idx + 1] = 0.16 + (rand() - 0.5) * 0.34;
          pos[3 * idx + 2] = -0.34 - 0.12 * rand();
          writeColor(col, idx, rand() < 0.5 ? COLOR_COBALT : COLOR_SLATE, 0.85);
        },
      },
      {
        // Raised waving arm
        w: 9,
        emit: (pos, col, idx) => {
          emitCapsuleSegment(pos, idx, -0.34, 0.26, 0, -0.5, 0.64, 0.06, 0.12);
          writeColor(
            col,
            idx,
            pos[3 * idx + 1] > 0.55 ? COLOR_WHITE : COLOR_COBALT,
            0.9 + 0.2 * rand()
          );
        },
      },
      {
        // Lowered arm
        w: 9,
        emit: (pos, col, idx) => {
          emitCapsuleSegment(pos, idx, 0.34, 0.2, 0, 0.46, -0.08, 0.06, 0.12);
          writeColor(
            col,
            idx,
            pos[3 * idx + 1] < 0 ? COLOR_WHITE : COLOR_COBALT,
            0.9 + 0.2 * rand()
          );
        },
      },
      {
        // Left leg
        w: 7,
        emit: (pos, col, idx) => {
          emitCapsuleSegment(pos, idx, -0.16, -0.18, 0, -0.18, -0.56, 0.02, 0.135);
          writeColor(col, idx, rand() < 0.4 ? COLOR_AMBER : COLOR_COBALT, 0.85);
        },
      },
      {
        // Right leg
        w: 7,
        emit: (pos, col, idx) => {
          emitCapsuleSegment(pos, idx, 0.16, -0.18, 0, 0.18, -0.56, 0.02, 0.135);
          writeColor(col, idx, rand() < 0.4 ? COLOR_AMBER : COLOR_COBALT, 0.85);
        },
      },
      {
        // Left boot
        w: 4,
        emit: (pos, col, idx) => {
          sampleUnitSphere(limbSphere, rand);
          pos[3 * idx] = -0.18 + 0.14 * limbSphere[0];
          pos[3 * idx + 1] = -0.72 + 0.1 * limbSphere[1];
          pos[3 * idx + 2] = 0.06 + 0.16 * limbSphere[2];
          writeColor(col, idx, rand() < 0.5 ? COLOR_WHITE : COLOR_COBALT, 0.9);
        },
      },
      {
        // Right boot
        w: 4,
        emit: (pos, col, idx) => {
          sampleUnitSphere(limbSphere, rand);
          pos[3 * idx] = 0.18 + 0.14 * limbSphere[0];
          pos[3 * idx + 1] = -0.72 + 0.1 * limbSphere[1];
          pos[3 * idx + 2] = 0.06 + 0.16 * limbSphere[2];
          writeColor(col, idx, rand() < 0.5 ? COLOR_WHITE : COLOR_COBALT, 0.9);
        },
      },
    ],
    rand
  );
  centerOrientAndNormalize(count, astronautPos, 0.05, -0.3, 0);

  // 4: Fibonacci sphere Earth Globe with continents (Expertise)
  const globeUnitPos = new Float32Array(3 * count);
  const globeElevation = new Float32Array(count);
  const globeCol = new Float32Array(3 * count);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const rad = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * i;
    const x = Math.cos(theta) * rad;
    const z = Math.sin(theta) * rad;

    const density = computeContinentDensity(x, y, z);
    globeUnitPos[3 * i] = x;
    globeUnitPos[3 * i + 1] = y;
    globeUnitPos[3 * i + 2] = z;
    globeElevation[i] = density;

    if (density > 0.6) {
      writeColor(
        globeCol,
        i,
        rand() < 0.16 ? COLOR_WHITE : COLOR_AMBER,
        0.9 + 0.3 * rand()
      );
    } else if (density > 0.42) {
      writeColor(
        globeCol,
        i,
        rand() < 0.32 ? COLOR_GOLD_LIGHT : COLOR_AMBER,
        1.12 + 0.3 * rand()
      );
    } else {
      const lonDeg = (180 * Math.atan2(z, x)) / Math.PI;
      const latDeg = (180 * Math.asin(y)) / Math.PI;
      const isGridLine =
        Math.abs(((latDeg + 900) % 18) - 9) < 1.1 ||
        Math.abs(((lonDeg + 900) % 18) - 9) < 1.1;
      writeColor(
        globeCol,
        i,
        COLOR_COBALT,
        isGridLine ? 0.7 + 0.2 * rand() : 0.4 + 0.18 * rand()
      );
    }
  }

  // 1 & 3: Starfield / Vortex color buffer
  const starfieldCol = new Float32Array(3 * count);
  for (let i = 0; i < count; i++) {
    const u = rand();
    if (u < 0.5) {
      writeColor(starfieldCol, i, COLOR_WHITE, 0.68 + 0.4 * rand());
    } else if (u < 0.78) {
      writeColor(starfieldCol, i, COLOR_COBALT, 0.68 + 0.4 * rand());
    } else if (u < 0.92) {
      writeColor(starfieldCol, i, COLOR_AMBER, 0.68 + 0.4 * rand());
    } else {
      writeColor(starfieldCol, i, COLOR_SLATE, 0.6 + 0.3 * rand());
    }
  }

  const sectionColors = [
    rocketCol,
    starfieldCol,
    atomCol,
    starfieldCol,
    globeCol,
    astronautCol,
    astronautCol,
  ];

  return {
    count,
    rocketPos,
    rocketCol,
    atomPos,
    atomCol,
    astronautPos,
    astronautCol,
    globeUnitPos,
    globeElevation,
    globeCol,
    starfieldCol,
    baseSizes,
    randomA,
    randomB,
    scatterDirs,
    sectionColors,
  };
}
