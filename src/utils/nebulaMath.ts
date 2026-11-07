/**
 * Pure mathematical, scroll-choreography, and validation logic for the Nebula 3D landing page.
 */

export const SECTION_OFFSETS: ReadonlyArray<readonly [number, number]> = [
  [-46, 0],
  [0, 34],
  [46, 0],
  [-46, 0],
  [0, 40],
  [0, 32],
  [0, 26],
];

export const SECTION_ROTATION_SPEEDS: ReadonlyArray<number> = [
  0.12, 0.02, 0.18, 0, 0.06, 0.18, 0.05,
];

export const SECTION_BREATHING_FLAGS: ReadonlyArray<number> = [
  1, 0, 1, 0, 1, 1, 1,
];

export interface ContinentPatch {
  lat: number;
  lon: number;
  dlat: number;
  dlon: number;
}

export const CONTINENT_PATCHES: ReadonlyArray<ContinentPatch> = [
  { lat: 60, lon: -103, dlat: 16, dlon: 30 },
  { lat: 43, lon: -98, dlat: 11, dlon: 20 },
  { lat: 64, lon: -150, dlat: 8, dlon: 16 },
  { lat: 26, lon: -103, dlat: 8, dlon: 8 },
  { lat: 12, lon: -84, dlat: 6, dlon: 6 },
  { lat: 73, lon: -42, dlat: 9, dlon: 14 },
  { lat: 6, lon: -68, dlat: 8, dlon: 9 },
  { lat: -9, lon: -55, dlat: 13, dlon: 15 },
  { lat: -27, lon: -62, dlat: 11, dlon: 8 },
  { lat: -43, lon: -69, dlat: 10, dlon: 5 },
  { lat: 20, lon: -2, dlat: 12, dlon: 16 },
  { lat: 6, lon: 21, dlat: 12, dlon: 15 },
  { lat: -12, lon: 23, dlat: 13, dlon: 12 },
  { lat: -30, lon: 23, dlat: 8, dlon: 7 },
  { lat: 9, lon: 42, dlat: 8, dlon: 7 },
  { lat: 52, lon: 12, dlat: 9, dlon: 20 },
  { lat: 60, lon: 40, dlat: 10, dlon: 20 },
  { lat: 58, lon: 92, dlat: 18, dlon: 44 },
  { lat: 40, lon: 70, dlat: 13, dlon: 24 },
  { lat: 30, lon: 106, dlat: 12, dlon: 18 },
  { lat: 22, lon: 80, dlat: 9, dlon: 11 },
  { lat: 28, lon: 46, dlat: 9, dlon: 11 },
  { lat: -26, lon: 134, dlat: 10, dlon: 17 },
  { lat: -2, lon: 117, dlat: 6, dlon: 15 },
];

export const SECTION_METADATA = [
  { index: 0, id: 'hero', label: 'Orbit', navHash: '#hero' },
  { index: 1, id: 'statement', label: 'Craft', navHash: '#craft' },
  { index: 2, id: 'studio', label: 'Studio', navHash: '#studio' },
  { index: 3, id: 'work', label: 'Work', navHash: '#work' },
  { index: 4, id: 'expertise', label: 'Expertise', navHash: '#expertise' },
  { index: 5, id: 'team', label: 'Minds', navHash: '#team' },
  { index: 6, id: 'contact', label: 'Contact', navHash: '#contact' },
] as const;

/**
 * Quintic smootherstep curve (6t^5 - 15t^4 + 10t^3).
 */
export function smootherstep(x: number): number {
  return x * x * x * (x * (6 * x - 15) + 10);
}

/**
 * Clamps a numeric value to [0, 1].
 */
export function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

/**
 * Evaluates the continent landmass density for a unit sphere coordinate (x, y, z).
 */
export function computeContinentDensity(x: number, y: number, z: number): number {
  const lat = (180 * Math.asin(Math.max(-1, Math.min(1, y)))) / Math.PI;
  const lon = (180 * Math.atan2(z, x)) / Math.PI;
  let density = 0;

  for (const patch of CONTINENT_PATCHES) {
    let dlon = Math.abs(lon - patch.lon);
    if (dlon > 180) dlon = 360 - dlon;
    const nLat = (lat - patch.lat) / patch.dlat;
    const nLon = dlon / patch.dlon;
    const weight = Math.exp(-(nLat * nLat + nLon * nLon));
    if (weight > density) density = weight;
  }

  density += 0.1 * Math.sin(0.5 * lat + 1) * Math.sin(0.4 * lon + 2);
  if (lat < -68) {
    density = Math.max(density, 0.8);
  }
  return density;
}

export interface SectionScrollState {
  continuousIndex: number;
  segmentIndex: number;
  morphT: number;
  scatterEnvelope: number;
  activeDotIndex: number;
  sectionStyles: Array<{
    opacity: number;
    translateX: number;
    translateY: number;
  }>;
  teamRowTranslateFactor: number;
}

/**
 * Computes the scroll-driven state for all 7 sections and the 3D particle morph progress.
 */
export function computeSectionScrollState(progress: number): SectionScrollState {
  const clamped = clamp01(progress);
  const continuousIndex = 6 * clamped;
  const segmentIndex = Math.min(5, Math.floor(continuousIndex));
  const morphT = smootherstep(clamp01((continuousIndex - segmentIndex - 0.2) / 0.6));
  const scatterEnvelope = Math.sin(morphT * Math.PI);
  const activeDotIndex = Math.round(continuousIndex);

  const sectionStyles = SECTION_OFFSETS.map(([ox, oy], idx) => {
    const t = Math.max(0, 1 - Math.abs(continuousIndex - idx) / 0.6);
    const opacity = t * t;
    const translateX = ox * (1 - t) || 0;
    const translateY = oy * (1 - t) || 0;
    return {
      opacity,
      translateX,
      translateY,
    };
  });

  const teamRowTranslateFactor = (5 - continuousIndex) * 0.1;

  return {
    continuousIndex,
    segmentIndex,
    morphT,
    scatterEnvelope,
    activeDotIndex,
    sectionStyles,
    teamRowTranslateFactor,
  };
}

/**
 * Maps a section index (0..6) to its normalized scroll progress [0..1].
 */
export function getProgressForSectionIndex(sectionIndex: number): number {
  const clampedIndex = Math.max(0, Math.min(6, Math.round(sectionIndex)));
  return clampedIndex / 6;
}

/**
 * Maps a navigation hash (#work, #studio, #expertise, #contact, etc.) to its section index.
 */
export function getSectionIndexForHash(hash: string): number | null {
  const normalized = hash.trim().toLowerCase().replace(/^#/, '');
  switch (normalized) {
    case 'hero':
    case 'orbit':
    case 'top':
      return 0;
    case 'statement':
    case 'craft':
      return 1;
    case 'studio':
    case 'agency':
      return 2;
    case 'work':
    case 'solutions':
      return 3;
    case 'expertise':
      return 4;
    case 'team':
    case 'minds':
      return 5;
    case 'contact':
      return 6;
    default:
      return null;
  }
}

export interface InquiryFormInput {
  name: string;
  email: string;
  scope: string;
  message: string;
}

export interface InquiryValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof InquiryFormInput, string>>;
}

/**
 * Validates the studio project inquiry form without silent fallbacks.
 */
export function validateInquiryForm(input: InquiryFormInput): InquiryValidationResult {
  const errors: Partial<Record<keyof InquiryFormInput, string>> = {};
  const trimmedName = input.name.trim();
  const trimmedEmail = input.email.trim();
  const trimmedScope = input.scope.trim();
  const trimmedMessage = input.message.trim();

  if (trimmedName.length < 2) {
    errors.name = 'Please enter your name (at least 2 characters).';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!trimmedScope) {
    errors.scope = 'Please select a project discipline.';
  }
  if (trimmedMessage.length < 10) {
    errors.message = 'Please share a brief project summary (at least 10 characters).';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export type SubpageId = 'missions' | 'observatory' | 'capabilities' | 'scientists' | 'portal';

/**
 * Maps each sub-page to its background 3D particle formation index (0..6).
 */
export function getFormationIndexForSubpage(subpage: SubpageId): number {
  switch (subpage) {
    case 'missions':
      return 0; // 3D Rocket
    case 'observatory':
      return 2; // 3D Atom / Orbital Rings
    case 'capabilities':
      return 4; // 3D Earth Globe
    case 'scientists':
      return 5; // 3D Astronaut
    case 'portal':
      return 6; // 3D Astronaut Contact
  }
}

export interface TelescopeSNRResult {
  snr: number;
  limitingMagnitude: number;
  status: 'Optimal' | 'Viable' | 'Low SNR';
  recommendedFrames: number;
}

/**
 * Computes estimated Signal-to-Noise Ratio (SNR) for the Entoto 1.0m Ritchey-Chrétien
 * telescope at 3,200m altitude based on target apparent magnitude, exposure time (s),
 * atmospheric seeing (arcsec), and Johnson-Cousins filter band.
 */
export function computeTelescopeSNR(
  targetMagnitude: number,
  exposureSec: number,
  seeingArcsec: number,
  filterBand: 'U' | 'B' | 'V' | 'R' | 'I'
): TelescopeSNRResult {
  const clampedMag = Math.max(8, Math.min(23, targetMagnitude));
  const clampedExp = Math.max(5, Math.min(3600, exposureSec));
  const clampedSeeing = Math.max(0.6, Math.min(2.8, seeingArcsec));

  const bandZeroPointFlux: Record<'U' | 'B' | 'V' | 'R' | 'I', number> = {
    U: 4.2e5,
    B: 1.1e6,
    V: 1.45e6,
    R: 1.65e6,
    I: 1.25e6,
  };

  const zeroFlux = bandZeroPointFlux[filterBand];
  const objectFluxRate = zeroFlux * Math.pow(10, -0.4 * (clampedMag - 10));
  const totalSignal = objectFluxRate * clampedExp;

  // Sky background and readout noise for 1.0m aperture at 3,200m
  const aperturePixels = Math.PI * Math.pow((clampedSeeing * 2.1) / 0.45, 2);
  const skyRatePerArcsec = filterBand === 'I' || filterBand === 'R' ? 38 : 22;
  const skyNoise = aperturePixels * skyRatePerArcsec * clampedExp;
  const readoutNoiseSq = aperturePixels * 16;

  const rawSnr = totalSignal / Math.sqrt(Math.max(1, totalSignal + skyNoise + readoutNoiseSq));
  const snr = Math.round(rawSnr * 10) / 10;

  const limitingMagnitude =
    Math.round((19.4 + 1.25 * Math.log10(clampedExp / 60) - (clampedSeeing - 0.9) * 0.45) * 10) / 10;

  const status: 'Optimal' | 'Viable' | 'Low SNR' =
    snr >= 40 ? 'Optimal' : snr >= 12 ? 'Viable' : 'Low SNR';

  const recommendedFrames = snr >= 50 ? 1 : Math.min(24, Math.max(2, Math.ceil(45 / Math.max(1, snr))));

  return {
    snr,
    limitingMagnitude,
    status,
    recommendedFrames,
  };
}

export interface SatelliteArchiveScene {
  id: string;
  title: string;
  region: string;
  platform: 'ETRSS-1' | 'ET-SMART-RSS' | 'Entoto 1m' | 'GNSS Space Weather';
  resolution: string;
  cloudCover: number;
  acquiredDate: string;
  coordinates: string;
  bands: string;
  summary: string;
}

/**
 * Filters SSGI satellite and observatory archive scenes by platform, cloud cover, and search query.
 */
export function filterSatelliteScenes(
  scenes: ReadonlyArray<SatelliteArchiveScene>,
  platformFilter: string,
  maxCloudCover: number,
  searchQuery: string
): SatelliteArchiveScene[] {
  const normalizedPlatform = platformFilter.trim();
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return scenes.filter((scene) => {
    if (normalizedPlatform && normalizedPlatform !== 'All' && scene.platform !== normalizedPlatform) {
      return false;
    }
    if (scene.cloudCover > maxCloudCover) {
      return false;
    }
    if (normalizedQuery) {
      const haystack = `${scene.id} ${scene.title} ${scene.region} ${scene.platform} ${scene.summary}`.toLowerCase();
      if (!haystack.includes(normalizedQuery)) {
        return false;
      }
    }
    return true;
  });
}



