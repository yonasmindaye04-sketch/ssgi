import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateYekisEscrowBreakdown,
  computeCorporateScrollState,
  filterFaqItems,
  validateWorkspaceOnboarding,
  FaqItemData,
} from './yekisMath';

test('calculateYekisEscrowBreakdown computes 2.5% split and 97.5% freelancer share without withholding', () => {
  const res = calculateYekisEscrowBreakdown(25000, false, true);
  assert.equal(res.safeAmount, 25000);
  assert.equal(res.clientFee, 625);
  assert.equal(res.freelancerFee, 625);
  assert.equal(res.totalPlatformFee, 1250);
  assert.equal(res.clientTotalDeposit, 25625);
  assert.equal(res.withholdingTax, 0);
  assert.equal(res.freelancerNetPayout, 24375);
  assert.equal(res.talentSharePercent, 97.5);
});

test('calculateYekisEscrowBreakdown applies 3% TIN verified and 30% unverified ERCA withholding tax on >= 10,000 ETB', () => {
  const tinVerified = calculateYekisEscrowBreakdown(20000, true, true);
  assert.equal(tinVerified.withholdingRate, 0.03);
  assert.equal(tinVerified.withholdingTax, 600);
  assert.equal(tinVerified.freelancerNetPayout, 20000 - 500 - 600);

  const tinUnverified = calculateYekisEscrowBreakdown(20000, true, false);
  assert.equal(tinUnverified.withholdingRate, 0.3);
  assert.equal(tinUnverified.withholdingTax, 6000);
  assert.equal(tinUnverified.freelancerNetPayout, 20000 - 500 - 6000);

  const belowThreshold = calculateYekisEscrowBreakdown(8000, true, false);
  assert.equal(belowThreshold.withholdingTax, 0);
});

test('computeCorporateScrollState interpolates smoothly across 7 chapters', () => {
  const start = computeCorporateScrollState(0);
  assert.equal(start.activeChapter, 0);
  assert.equal(start.sectionA, 0);
  assert.equal(start.morphMix, 0);

  const mid = computeCorporateScrollState(0.5);
  assert.equal(mid.activeChapter, 3);
  assert.equal(mid.sectionA, 3);

  const end = computeCorporateScrollState(1);
  assert.equal(end.activeChapter, 6);
  assert.equal(end.sectionB, 6);
});

test('filterFaqItems filters by category and search query', () => {
  const items: FaqItemData[] = [
    {
      id: '1',
      category: 'escrow',
      question: 'How does milestone escrow work?',
      answer: 'Funds are locked in Telebirr or CBE Birr until approval.',
    },
    {
      id: '2',
      category: 'kyc',
      question: 'Why is Fayda National ID required?',
      answer: 'Fayda verifies every Ethiopian freelancer.',
    },
  ];
  assert.equal(filterFaqItems(items, '', 'all').length, 2);
  assert.equal(filterFaqItems(items, '', 'kyc').length, 1);
  assert.equal(filterFaqItems(items, 'telebirr', 'all').length, 1);
  assert.equal(filterFaqItems(items, 'nonexistent', 'all').length, 0);
});

test('validateWorkspaceOnboarding enforces valid name, Ethiopian phone or email, and brief', () => {
  const invalid = validateWorkspaceOnboarding({
    fullName: 'A',
    emailOrPhone: 'bad-contact',
    role: 'CLIENT',
    city: 'Addis Ababa',
    briefOrSkill: 'short',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.fullName);
  assert.ok(invalid.errors.emailOrPhone);
  assert.ok(invalid.errors.briefOrSkill);

  const valid = validateWorkspaceOnboarding({
    fullName: 'Yared Kebede',
    emailOrPhone: '+251 911 223 344',
    role: 'CLIENT',
    city: 'Addis Ababa',
    briefOrSkill: 'Need a full-stack React & Node engineer for a 4-milestone dispatch dashboard.',
  });
  assert.equal(valid.valid, true);
});
