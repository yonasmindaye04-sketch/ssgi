/**
 * Procedural 3D Corporate Office & Architectural Particle + Wireframe Generators
 * for the 7 chapters of the Yekis 3D Corporate Landing Page.
 *
 * Palette:
 * - Emerald Executive Green: [0.13, 0.77, 0.37] (#22c55e)
 * - Architectural Teal Glass: [0.08, 0.72, 0.65] (#14b8a6)
 * - Warm Corporate Brass/Gold: [0.92, 0.75, 0.42] (#eab308 / warm office light)
 * - Crisp Architectural Alabaster/Glass: [0.91, 0.97, 0.94]
 */

export interface ParticleCloud {
  pos: Float32Array;
  col: Float32Array;
}

const COL_EMERALD: readonly [number, number, number] = [0.15, 0.82, 0.42];
const COL_TEAL: readonly [number, number, number] = [0.1, 0.76, 0.68];
const COL_BRASS: readonly [number, number, number] = [0.95, 0.78, 0.44];
const COL_GLASS_WHITE: readonly [number, number, number] = [0.9, 0.97, 0.94];
const COL_DEEP_PINE: readonly [number, number, number] = [0.08, 0.48, 0.32];

function mixColor(
  a: readonly [number, number, number],
  b: readonly [number, number, number],
  t: number
): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

function setParticle(
  pos: Float32Array,
  col: Float32Array,
  idx: number,
  x: number,
  y: number,
  z: number,
  c: readonly [number, number, number],
  brightness = 1
): void {
  const i3 = idx * 3;
  pos[i3] = x;
  pos[i3 + 1] = y;
  pos[i3 + 2] = z;
  col[i3] = Math.min(1, c[0] * brightness);
  col[i3 + 1] = Math.min(1, c[1] * brightness);
  col[i3 + 2] = Math.min(1, c[2] * brightness);
}

/**
 * Chapter 01 · Hero: The Yekis Corporate HQ Tower & Atrium (Bole Atlas, Addis Ababa)
 * High-rise architectural glass office tower with 16 illuminated floor slabs,
 * vertical curtain-wall mullions, a podium lobby atrium, and rooftop beacon.
 */
export function generateCorporateTowerCloud(count: number): ParticleCloud {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  let idx = 0;

  const floors = 16;
  const towerHeight = 2.55;
  const baseY = -1.28;
  const towerWidth = 0.78;
  const towerDepth = 0.68;

  // 1. Illuminated Corporate Floor Slabs (42% of particles)
  const floorLimit = Math.floor(count * 0.42);
  while (idx < floorLimit) {
    const f = idx % floors;
    const fy = baseY + (f / (floors - 1)) * towerHeight;
    // Stepped setback on upper executive floors
    const setback = f > 12 ? 0.72 : f > 9 ? 0.86 : 1.0;
    const w = towerWidth * setback;
    const d = towerDepth * setback;

    const edgeChoice = Math.random();
    let x = 0;
    let z = 0;
    if (edgeChoice < 0.72) {
      // Perimeter glass curtain wall along floor slab
      const side = Math.floor(Math.random() * 4);
      const t = (Math.random() - 0.5) * 2;
      if (side === 0) {
        x = t * w * 0.5;
        z = d * 0.5;
      } else if (side === 1) {
        x = t * w * 0.5;
        z = -d * 0.5;
      } else if (side === 2) {
        x = w * 0.5;
        z = t * d * 0.5;
      } else {
        x = -w * 0.5;
        z = t * d * 0.5;
      }
    } else {
      // Interior warm office desk lights & conference rooms
      x = (Math.random() - 0.5) * w * 0.85;
      z = (Math.random() - 0.5) * d * 0.85;
    }

    const isWarmOfficeLight = (f + Math.floor((x + 1) * 6)) % 3 === 0;
    const c = isWarmOfficeLight
      ? mixColor(COL_BRASS, COL_GLASS_WHITE, 0.35)
      : mixColor(COL_EMERALD, COL_TEAL, f / floors);
    setParticle(pos, col, idx++, x, fy + (Math.random() - 0.5) * 0.018, z, c, 0.95);
  }

  // 2. Vertical Curtain-Wall Mullions & Corner Columns (28% of particles)
  const mullionLimit = Math.floor(count * 0.7);
  const colsPerSide = 5;
  while (idx < mullionLimit) {
    const u = Math.random();
    const y = baseY + u * towerHeight;
    const fApprox = u * (floors - 1);
    const setback = fApprox > 12 ? 0.72 : fApprox > 9 ? 0.86 : 1.0;
    const w = towerWidth * setback;
    const d = towerDepth * setback;

    const colIdx = Math.floor(Math.random() * colsPerSide);
    const step = (colIdx / (colsPerSide - 1) - 0.5) * 2;
    const side = idx % 4;
    let x = 0;
    let z = 0;
    if (side === 0) {
      x = step * w * 0.5;
      z = d * 0.5;
    } else if (side === 1) {
      x = step * w * 0.5;
      z = -d * 0.5;
    } else if (side === 2) {
      x = w * 0.5;
      z = step * d * 0.5;
    } else {
      x = -w * 0.5;
      z = step * d * 0.5;
    }
    const isCorner = colIdx === 0 || colIdx === colsPerSide - 1;
    const c = isCorner ? COL_GLASS_WHITE : COL_TEAL;
    setParticle(pos, col, idx++, x, y, z, c, isCorner ? 1.05 : 0.78);
  }

  // 3. Executive Podium Plaza & Terraced Courtyard (18% of particles)
  const plazaLimit = Math.floor(count * 0.88);
  while (idx < plazaLimit) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.45 + Math.random() * 0.95;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = baseY - 0.04 + (Math.random() - 0.5) * 0.03;
    const ringGlow = Math.abs((radius * 6) % 1 - 0.5) < 0.15;
    const c = ringGlow ? COL_EMERALD : COL_DEEP_PINE;
    setParticle(pos, col, idx++, x, y, z, c, ringGlow ? 0.95 : 0.65);
  }

  // 4. Rooftop Crown Spire & Ascending Escrow Data Streams (remaining 12%)
  while (idx < count) {
    if (idx % 2 === 0) {
      // Crown spire & helipad ring
      const t = Math.random();
      const y = baseY + towerHeight + t * 0.42;
      const r = (1 - t) * 0.18;
      const a = Math.random() * Math.PI * 2;
      setParticle(
        pos,
        col,
        idx++,
        Math.cos(a) * r,
        y,
        Math.sin(a) * r,
        mixColor(COL_BRASS, COL_GLASS_WHITE, t),
        1.1
      );
    } else {
      // Ambient corporate atrium dust
      const a = Math.random() * Math.PI * 2;
      const r = 0.85 + Math.random() * 0.9;
      const y = (Math.random() - 0.5) * 2.6;
      setParticle(pos, col, idx++, Math.cos(a) * r, y, Math.sin(a) * r, COL_TEAL, 0.55);
    }
  }

  return { pos, col };
}

/**
 * Chapter 02 · Platform Metrics: 3D Executive Boardroom & Rising KPI Monuments
 */
export function generateExecutiveBoardroomCloud(count: number): ParticleCloud {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  let idx = 0;

  // 4 Rising Architectural KPI Columns + Circular Executive Rotunda
  const barHeights = [1.35, 1.65, 2.05, 2.35];
  const barX = [-0.82, -0.27, 0.27, 0.82];
  const barColors = [COL_TEAL, COL_EMERALD, COL_BRASS, COL_GLASS_WHITE];

  const barsLimit = Math.floor(count * 0.56);
  while (idx < barsLimit) {
    const b = idx % 4;
    const h = barHeights[b];
    const cx = barX[b];
    const bw = 0.32;
    const bd = 0.32;
    const u = Math.random();
    const y = -1.05 + u * h;

    const side = Math.floor(Math.random() * 5);
    let x = cx;
    let z = 0;
    if (side === 4) {
      // Top cap of KPI pillar
      x = cx + (Math.random() - 0.5) * bw;
      z = (Math.random() - 0.5) * bd;
      setParticle(pos, col, idx++, x, -1.05 + h, z, COL_GLASS_WHITE, 1.1);
      continue;
    }
    const t = (Math.random() - 0.5) * 2;
    if (side === 0) {
      x = cx + t * bw * 0.5;
      z = bd * 0.5;
    } else if (side === 1) {
      x = cx + t * bw * 0.5;
      z = -bd * 0.5;
    } else if (side === 2) {
      x = cx + bw * 0.5;
      z = t * bd * 0.5;
    } else {
      x = cx - bw * 0.5;
      z = t * bd * 0.5;
    }
    setParticle(pos, col, idx++, x, y, z, barColors[b], 0.85 + u * 0.25);
  }

  // Circular Executive Boardroom Table & Orbital Rings
  while (idx < count) {
    const ring = idx % 3;
    const angle = Math.random() * Math.PI * 2;
    const radius = ring === 0 ? 1.35 : ring === 1 ? 1.68 : 0.5 + Math.random() * 1.3;
    const y = ring < 2 ? -1.08 + ring * 0.08 : 0.95 + Math.sin(angle * 3) * 0.22;
    const c = ring === 0 ? COL_EMERALD : ring === 1 ? COL_BRASS : COL_TEAL;
    setParticle(
      pos,
      col,
      idx++,
      Math.cos(angle) * radius,
      y + (Math.random() - 0.5) * 0.03,
      Math.sin(angle) * radius,
      c,
      0.85
    );
  }

  return { pos, col };
}

/**
 * Chapter 03 · Escrow Protection: 3D Architectural Escrow Vault & Precision Lock
 */
export function generateEscrowVaultCloud(count: number): ParticleCloud {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  let idx = 0;

  // 1. Concentric Vault Security Rings & Locking Bolts (52%)
  const ringLimit = Math.floor(count * 0.52);
  const ringRadii = [0.58, 0.92, 1.24, 1.48];
  while (idx < ringLimit) {
    const rIdx = idx % 4;
    const r = ringRadii[rIdx];
    const angle = Math.random() * Math.PI * 2;
    const depth = (Math.random() - 0.5) * (0.28 - rIdx * 0.04);
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    const z = depth;
    const isBolt = Math.abs(Math.sin(angle * 6)) > 0.92;
    const c = isBolt
      ? COL_BRASS
      : rIdx % 2 === 0
        ? COL_EMERALD
        : COL_TEAL;
    setParticle(pos, col, idx++, x, y, z, c, isBolt ? 1.1 : 0.9);
  }

  // 2. 12 Radial Vault Spokes & Interlocking Teeth (24%)
  const spokeLimit = Math.floor(count * 0.76);
  while (idx < spokeLimit) {
    const spoke = idx % 12;
    const angle = (spoke / 12) * Math.PI * 2;
    const dist = 0.28 + Math.random() * 1.18;
    const x = Math.cos(angle) * dist + (Math.random() - 0.5) * 0.03;
    const y = Math.sin(angle) * dist + (Math.random() - 0.5) * 0.03;
    const z = (Math.random() - 0.5) * 0.16;
    setParticle(pos, col, idx++, x, y, z, COL_GLASS_WHITE, 0.92);
  }

  // 3. Central Protected Escrow Core Sphere (24%)
  while (idx < count) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * Math.PI * 2;
    const phi = Math.acos(2 * v - 1);
    const r = Math.cbrt(Math.random()) * 0.42;
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    const c = mixColor(COL_BRASS, COL_EMERALD, r / 0.42);
    setParticle(pos, col, idx++, x, y, z, c, 1.08);
  }

  return { pos, col };
}

/**
 * Chapter 04 · Transparent Fees: 3D Twin-Beam Financial Balance Scale & Prism
 */
export function generateBalanceScaleCloud(count: number): ParticleCloud {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  let idx = 0;

  // 1. Central Fulcrum Column & 97.5% Diamond Prism (35%)
  const pillarLimit = Math.floor(count * 0.35);
  while (idx < pillarLimit) {
    const u = Math.random();
    const y = -1.2 + u * 2.25;
    const radius = u > 0.78 ? (1 - (u - 0.78) / 0.22) * 0.34 : 0.14 + (1 - u) * 0.12;
    const a = (Math.floor(Math.random() * 6) / 6) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
    const c = u > 0.78 ? COL_BRASS : COL_GLASS_WHITE;
    setParticle(pos, col, idx++, Math.cos(a) * radius, y, Math.sin(a) * radius, c, 0.98);
  }

  // 2. Horizontal Precision Balance Beam (20%)
  const beamLimit = Math.floor(count * 0.55);
  while (idx < beamLimit) {
    const x = (Math.random() - 0.5) * 2.3;
    const y = 0.65 + (Math.random() - 0.5) * 0.08;
    const z = (Math.random() - 0.5) * 0.12;
    setParticle(pos, col, idx++, x, y, z, COL_EMERALD, 0.96);
  }

  // 3. Left & Right Suspended Equilibrium Trays (2.5% Client / 2.5% Freelancer) (45%)
  while (idx < count) {
    const side = idx % 2 === 0 ? -1 : 1;
    const cx = side * 1.05;
    const cy = -0.25;
    if (idx % 5 === 0) {
      // Suspension cables from beam (y=0.65) to tray (y=-0.25)
      const t = Math.random();
      const cableAngle = ((idx % 4) / 4) * Math.PI * 2;
      const r = t * 0.44;
      setParticle(
        pos,
        col,
        idx++,
        cx + Math.cos(cableAngle) * r,
        0.65 - t * 0.9,
        Math.sin(cableAngle) * r,
        COL_GLASS_WHITE,
        0.8
      );
    } else {
      // Circular tray + glowing ETB coin stack inside tray
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 0.46;
      const h = r < 0.25 ? Math.random() * 0.28 : (Math.random() - 0.5) * 0.04;
      const c = r < 0.25 ? COL_BRASS : side < 0 ? COL_EMERALD : COL_TEAL;
      setParticle(pos, col, idx++, cx + Math.cos(a) * r, cy + h, Math.sin(a) * r, c, 0.96);
    }
  }

  return { pos, col };
}

/**
 * Chapter 05 · Six Launch Categories: 3D Six Modular Corporate Studio Pods
 */
export function generateStudioPodsCloud(count: number): ParticleCloud {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  let idx = 0;

  // 6 Terraced Isometric Office Pods arranged in a 3D Helix Atrium
  const podCenters: ReadonlyArray<readonly [number, number, number]> = [
    [-0.78, 0.78, 0.25],
    [0.78, 0.78, -0.25],
    [-0.86, 0.0, -0.2],
    [0.86, 0.0, 0.2],
    [-0.78, -0.78, 0.25],
    [0.78, -0.78, -0.25],
  ];
  const podColors = [
    COL_EMERALD,
    COL_TEAL,
    COL_BRASS,
    COL_GLASS_WHITE,
    COL_EMERALD,
    COL_TEAL,
  ];

  const podsLimit = Math.floor(count * 0.82);
  while (idx < podsLimit) {
    const pIdx = idx % 6;
    const [cx, cy, cz] = podCenters[pIdx];
    const pw = 0.68;
    const ph = 0.34;
    const pd = 0.54;

    const face = Math.floor(Math.random() * 6);
    let x = (Math.random() - 0.5) * pw;
    let y = (Math.random() - 0.5) * ph;
    let z = (Math.random() - 0.5) * pd;
    if (face === 0) y = ph * 0.5;
    else if (face === 1) y = -ph * 0.5;
    else if (face === 2) x = pw * 0.5;
    else if (face === 3) x = -pw * 0.5;
    else if (face === 4) z = pd * 0.5;
    else z = -pd * 0.5;

    setParticle(pos, col, idx++, cx + x, cy + y, cz + z, podColors[pIdx], 0.94);
  }

  // Central Elevator Atrium Core connecting all 6 Studio Floors
  while (idx < count) {
    const y = (Math.random() - 0.5) * 2.3;
    const a = Math.random() * Math.PI * 2;
    const r = 0.18 + Math.random() * 0.12;
    setParticle(pos, col, idx++, Math.cos(a) * r, y, Math.sin(a) * r, COL_GLASS_WHITE, 0.85);
  }

  return { pos, col };
}

/**
 * Chapter 06 · Case Studies: 3D Ethiopian Regional Escrow Hub & Corridor Network
 * Connects Addis Ababa (center hub) with Bahir Dar, Hawassa, Mekelle, and Dire Dawa.
 */
export function generateEthiopiaCorridorCloud(count: number): ParticleCloud {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  let idx = 0;

  const hubs: ReadonlyArray<readonly [number, number, number]> = [
    [0.0, -0.15, 0.15], // Addis Ababa HQ
    [-0.55, 0.52, -0.1], // Bahir Dar
    [-0.18, -0.78, 0.25], // Hawassa
    [0.08, 0.92, -0.25], // Mekelle
    [0.82, 0.08, 0.05], // Dire Dawa
  ];

  // 1. High-arching Parabolic Escrow Corridors from Addis Ababa to each Regional Hub (45%)
  const arcLimit = Math.floor(count * 0.45);
  while (idx < arcLimit) {
    const targetHub = hubs[1 + (idx % 4)];
    const t = Math.random();
    const x = hubs[0][0] + (targetHub[0] - hubs[0][0]) * t;
    const baseY = hubs[0][1] + (targetHub[1] - hubs[0][1]) * t;
    const z = hubs[0][2] + (targetHub[2] - hubs[0][2]) * t + Math.sin(t * Math.PI) * 0.45;
    const y = baseY + Math.sin(t * Math.PI) * 0.38;
    const c = mixColor(COL_EMERALD, COL_BRASS, Math.sin(t * Math.PI));
    setParticle(
      pos,
      col,
      idx++,
      x + (Math.random() - 0.5) * 0.03,
      y + (Math.random() - 0.5) * 0.03,
      z + (Math.random() - 0.5) * 0.03,
      c,
      1.05
    );
  }

  // 2. Regional Corporate Hub Towers & Concentric Beacons (30%)
  const hubLimit = Math.floor(count * 0.75);
  while (idx < hubLimit) {
    const hIdx = idx % hubs.length;
    const [hx, hy, hz] = hubs[hIdx];
    const isAddis = hIdx === 0;
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * (isAddis ? 0.34 : 0.22);
    const height = Math.random() * (isAddis ? 0.55 : 0.32);
    const c = isAddis ? COL_BRASS : COL_EMERALD;
    setParticle(pos, col, idx++, hx + Math.cos(a) * r, hy + height, hz + Math.sin(a) * r, c, 1.0);
  }

  // 3. Topographic Highland Grid & Sovereign Ring (25%)
  while (idx < count) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * 1.45;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r * 0.85;
    const z = -0.35 + Math.cos(r * 4) * 0.12;
    setParticle(pos, col, idx++, x, y, z, COL_TEAL, 0.65);
  }

  return { pos, col };
}

/**
 * Chapter 07 · About & FAQ: 3D Twin Executive Pillars & Bridge of Trust
 */
export function generateTwinPillarsTrustCloud(count: number): ParticleCloud {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  let idx = 0;

  // 1. Twin Fluted Architectural Columns (Client & Freelancer) (55%)
  const colLimit = Math.floor(count * 0.55);
  while (idx < colLimit) {
    const side = idx % 2 === 0 ? -1 : 1;
    const cx = side * 0.82;
    const u = Math.random();
    const y = -1.22 + u * 2.35;
    const flute = Math.floor(Math.random() * 12);
    const a = (flute / 12) * Math.PI * 2 + (Math.random() - 0.5) * 0.12;
    const r = 0.28 + (u < 0.08 || u > 0.92 ? 0.08 : 0);
    const c = side < 0 ? COL_EMERALD : COL_TEAL;
    setParticle(pos, col, idx++, cx + Math.cos(a) * r, y, Math.sin(a) * r, c, 0.95);
  }

  // 2. Luminous Escrow Archway Connecting the Twin Pillars (25%)
  const archLimit = Math.floor(count * 0.8);
  while (idx < archLimit) {
    const t = Math.random();
    const angle = t * Math.PI;
    const x = Math.cos(angle) * 0.82;
    const y = 0.55 + Math.sin(angle) * 0.58 + (Math.random() - 0.5) * 0.08;
    const z = (Math.random() - 0.5) * 0.28;
    const c = mixColor(COL_BRASS, COL_GLASS_WHITE, Math.sin(angle));
    setParticle(pos, col, idx++, x, y, z, c, 1.05);
  }

  // 3. Executive Atrium Floor Grid (20%)
  while (idx < count) {
    const x = (Math.random() - 0.5) * 2.5;
    const z = (Math.random() - 0.5) * 1.8;
    const y = -1.24 + (Math.random() - 0.5) * 0.02;
    setParticle(pos, col, idx++, x, y, z, COL_DEEP_PINE, 0.72);
  }

  return { pos, col };
}

export function buildAllYekisCorporateClouds(count: number): ParticleCloud[] {
  return [
    generateCorporateTowerCloud(count),
    generateExecutiveBoardroomCloud(count),
    generateEscrowVaultCloud(count),
    generateBalanceScaleCloud(count),
    generateStudioPodsCloud(count),
    generateEthiopiaCorridorCloud(count),
    generateTwinPillarsTrustCloud(count),
  ];
}
