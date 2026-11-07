/**
 * Pure mathematical, financial escrow calculation, scroll-choreography,
 * and validation logic for the Yekis 3D Corporate Office & Marketplace website.
 */

export type PaymentRail = 'TELEBIRR' | 'CBE_BIRR' | 'M_PESA';
export type UserRoleOption = 'CLIENT' | 'FREELANCER';
export type SupportedLang = 'en' | 'am' | 'om' | 'ti';

export interface EscrowBreakdownResult {
  safeAmount: number;
  clientFee: number;
  freelancerFee: number;
  totalPlatformFee: number;
  clientTotalDeposit: number;
  withholdingRate: number;
  withholdingTax: number;
  freelancerNetPayout: number;
  talentSharePercent: number;
}

export const CHAPTER_IDS = [
  'top',
  'metrics',
  'escrow',
  'fees',
  'categories',
  'case-studies',
  'about',
] as const;

export const CHAPTER_CAMERA_ORBITS: ReadonlyArray<{
  camX: number;
  camY: number;
  camZ: number;
  lookX: number;
  lookY: number;
  rotSpeed: number;
}> = [
  // 01: Corporate HQ Tower (right-offset tower so left hero typography is 100% clear)
  { camX: -0.35, camY: 0.25, camZ: 5.2, lookX: -0.45, lookY: 0.05, rotSpeed: 0.14 },
  // 02: Executive Boardroom & Analytics Sphere
  { camX: 0.0, camY: 0.55, camZ: 5.5, lookX: 0.0, lookY: -0.1, rotSpeed: 0.18 },
  // 03: Architectural Escrow Vault (shifted right to frame left stepper or vice versa)
  { camX: -0.4, camY: 0.18, camZ: 5.3, lookX: -0.35, lookY: 0.0, rotSpeed: 0.22 },
  // 04: Precision Balance Scale & Financial Prism
  { camX: 0.35, camY: 0.22, camZ: 5.4, lookX: 0.3, lookY: 0.0, rotSpeed: 0.15 },
  // 05: Six Modular Corporate Studio Pods
  { camX: -0.3, camY: 0.35, camZ: 5.6, lookX: -0.25, lookY: 0.0, rotSpeed: 0.16 },
  // 06: Ethiopian Regional Escrow Network Corridor
  { camX: 0.25, camY: 0.4, camZ: 5.3, lookX: 0.2, lookY: 0.05, rotSpeed: 0.12 },
  // 07: Twin Pillars of Trust & Executive Atrium
  { camX: 0.0, camY: 0.2, camZ: 5.1, lookX: 0.0, lookY: 0.0, rotSpeed: 0.1 },
];

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function smootherstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * t * (t * (6 * t - 15) + 10);
}

/**
 * Computes exact Yekis ETB milestone escrow fees, ERCA withholding tax, and net payout.
 * Platform fee is 5% total split equally: 2.5% client fee + 2.5% freelancer fee.
 * ERCA withholding tax (when applicable on >= 10,000 ETB): 3% with verified TIN, 30% without.
 */
export function calculateYekisEscrowBreakdown(
  amountEtb: number,
  includeWithholding: boolean,
  hasVerifiedTin: boolean
): EscrowBreakdownResult {
  const safeAmount = Number.isFinite(amountEtb) && amountEtb > 0 ? Math.round(amountEtb) : 0;
  const clientFee = Math.round(safeAmount * 0.025);
  const freelancerFee = Math.round(safeAmount * 0.025);
  const totalPlatformFee = clientFee + freelancerFee;
  const clientTotalDeposit = safeAmount + clientFee;

  const withholdingRate =
    includeWithholding && safeAmount >= 10000 ? (hasVerifiedTin ? 0.03 : 0.3) : 0;
  const withholdingTax = Math.round(safeAmount * withholdingRate);
  const freelancerNetPayout = Math.max(0, safeAmount - freelancerFee - withholdingTax);
  const talentSharePercent =
    safeAmount > 0 ? Number(((freelancerNetPayout / safeAmount) * 100).toFixed(1)) : 97.5;

  return {
    safeAmount,
    clientFee,
    freelancerFee,
    totalPlatformFee,
    clientTotalDeposit,
    withholdingRate,
    withholdingTax,
    freelancerNetPayout,
    talentSharePercent,
  };
}

export interface CorporateScrollState {
  activeChapter: number;
  sectionA: number;
  sectionB: number;
  morphMix: number;
  camX: number;
  camY: number;
  camZ: number;
  lookX: number;
  lookY: number;
  rotSpeed: number;
}

/**
 * Given normalized page scroll progress in [0, 1], returns the active chapter,
 * morph pair (sectionA, sectionB, morphMix), and interpolated 3D camera target.
 */
export function computeCorporateScrollState(progress: number): CorporateScrollState {
  const count = CHAPTER_IDS.length;
  const maxIdx = count - 1;
  const p = clamp01(progress);
  const scaled = p * maxIdx;
  const sectionA = Math.min(maxIdx, Math.max(0, Math.floor(scaled)));
  const sectionB = Math.min(maxIdx, sectionA + 1);
  const rawFraction = scaled - sectionA;
  const morphMix = smootherstep(0.08, 0.92, rawFraction);
  const activeChapter = Math.min(maxIdx, Math.max(0, Math.round(scaled)));

  const orbitA = CHAPTER_CAMERA_ORBITS[sectionA];
  const orbitB = CHAPTER_CAMERA_ORBITS[sectionB];

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t || 0;

  return {
    activeChapter,
    sectionA,
    sectionB,
    morphMix,
    camX: lerp(orbitA.camX, orbitB.camX, morphMix),
    camY: lerp(orbitA.camY, orbitB.camY, morphMix),
    camZ: lerp(orbitA.camZ, orbitB.camZ, morphMix),
    lookX: lerp(orbitA.lookX, orbitB.lookX, morphMix),
    lookY: lerp(orbitA.lookY, orbitB.lookY, morphMix),
    rotSpeed: lerp(orbitA.rotSpeed, orbitB.rotSpeed, morphMix),
  };
}

export interface FaqItemData {
  id: string;
  category: 'escrow' | 'kyc' | 'payouts' | 'disputes';
  question: string;
  answer: string;
}

export function filterFaqItems(
  items: ReadonlyArray<FaqItemData>,
  query: string,
  category: string
): FaqItemData[] {
  const q = query.trim().toLowerCase();
  return items.filter((item) => {
    const matchesCat = category === 'all' || item.category === category;
    if (!matchesCat) return false;
    if (!q) return true;
    return (
      item.question.toLowerCase().includes(q) ||
      item.answer.toLowerCase().includes(q)
    );
  });
}

export interface OnboardingFormInput {
  fullName: string;
  emailOrPhone: string;
  role: UserRoleOption;
  city: string;
  briefOrSkill: string;
}

export interface OnboardingValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof OnboardingFormInput, string>>;
}

export function validateWorkspaceOnboarding(
  input: OnboardingFormInput
): OnboardingValidationResult {
  const errors: Partial<Record<keyof OnboardingFormInput, string>> = {};
  if (!input.fullName || input.fullName.trim().length < 2) {
    errors.fullName = 'Please enter your full name or company name.';
  }
  const contact = (input.emailOrPhone || '').trim();
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  const isPhone = /^(\+?251|0)?[79]\d{8}$/.test(contact.replace(/\s+/g, ''));
  if (!contact || (!isEmail && !isPhone)) {
    errors.emailOrPhone = 'Enter a valid email or Ethiopian phone (+251 9... / 09...).';
  }
  if (!input.briefOrSkill || input.briefOrSkill.trim().length < 8) {
    errors.briefOrSkill =
      input.role === 'CLIENT'
        ? 'Briefly describe the project or expertise you want to hire (min 8 chars).'
        : 'Briefly describe your primary skill and experience (min 8 chars).';
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
