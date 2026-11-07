import test from 'node:test';
import assert from 'node:assert/strict';
import {
  smootherstep,
  clamp01,
  computeContinentDensity,
  computeSectionScrollState,
  getProgressForSectionIndex,
  getSectionIndexForHash,
  validateInquiryForm,
  getFormationIndexForSubpage,
  computeTelescopeSNR,
  filterSatelliteScenes,
  SatelliteArchiveScene,
} from './nebulaMath';

test('smootherstep and clamp01 behave accurately at boundaries and midpoint', () => {
  assert.equal(clamp01(-0.5), 0);
  assert.equal(clamp01(1.5), 1);
  assert.equal(clamp01(0.4), 0.4);

  assert.equal(smootherstep(0), 0);
  assert.equal(smootherstep(1), 1);
  assert.equal(smootherstep(0.5), 0.5);
  assert.ok(smootherstep(0.25) < 0.25);
  assert.ok(smootherstep(0.75) > 0.75);
});

test('computeSectionScrollState transitions cleanly across all 7 sections', () => {
  const heroState = computeSectionScrollState(0);
  assert.equal(heroState.activeDotIndex, 0);
  assert.equal(heroState.segmentIndex, 0);
  assert.equal(heroState.morphT, 0);
  assert.equal(heroState.sectionStyles[0].opacity, 1);
  assert.equal(heroState.sectionStyles[0].translateX, 0);
  assert.equal(heroState.sectionStyles[1].opacity, 0);

  const studioState = computeSectionScrollState(2 / 6);
  assert.equal(studioState.activeDotIndex, 2);
  assert.ok(studioState.sectionStyles[2].opacity > 0.99);
  assert.ok(Math.abs(studioState.sectionStyles[2].translateX) < 0.01);

  const expertiseState = computeSectionScrollState(4 / 6);
  assert.equal(expertiseState.activeDotIndex, 4);
  assert.ok(expertiseState.sectionStyles[4].opacity > 0.99);

  const contactState = computeSectionScrollState(1);
  assert.equal(contactState.activeDotIndex, 6);
  assert.equal(contactState.segmentIndex, 5);
  assert.equal(contactState.morphT, 1);
  assert.equal(contactState.sectionStyles[6].opacity, 1);
});

test('getSectionIndexForHash and getProgressForSectionIndex resolve navigation anchors', () => {
  assert.equal(getSectionIndexForHash('#studio'), 2);
  assert.equal(getSectionIndexForHash('#work'), 3);
  assert.equal(getSectionIndexForHash('#expertise'), 4);
  assert.equal(getSectionIndexForHash('#contact'), 6);
  assert.equal(getSectionIndexForHash('#unknown'), null);

  assert.equal(getProgressForSectionIndex(0), 0);
  assert.equal(getProgressForSectionIndex(3), 0.5);
  assert.equal(getProgressForSectionIndex(6), 1);
});

test('computeContinentDensity distinguishes landmasses and polar cap from open ocean', () => {
  // South pole (y = -1) is Antarctica (> 0.6)
  const southPoleDensity = computeContinentDensity(0, -1, 0);
  assert.ok(southPoleDensity >= 0.8);

  // Mid-Pacific Ocean (lat 0, lon -160) should be low density
  const lonRad = (-160 * Math.PI) / 180;
  const pacificDensity = computeContinentDensity(Math.cos(lonRad), 0, Math.sin(lonRad));
  assert.ok(pacificDensity < 0.4);
});

test('validateInquiryForm enforces required fields and email format', () => {
  const emptyResult = validateInquiryForm({
    name: '',
    email: 'invalid-email',
    scope: '',
    message: 'short',
  });
  assert.equal(emptyResult.valid, false);
  assert.ok(emptyResult.errors.name);
  assert.ok(emptyResult.errors.email);
  assert.ok(emptyResult.errors.scope);
  assert.ok(emptyResult.errors.message);

  const validResult = validateInquiryForm({
    name: 'Sienna Vance',
    email: 'sienna@example.com',
    scope: '3D WebGL & Interactive Build',
    message: 'We are launching a new spatial web flagship in Q4.',
  });
  assert.equal(validResult.valid, true);
  assert.equal(Object.keys(validResult.errors).length, 0);
});

test('getFormationIndexForSubpage maps each SSGI subpage to its 3D particle formation', () => {
  assert.equal(getFormationIndexForSubpage('missions'), 0);
  assert.equal(getFormationIndexForSubpage('observatory'), 2);
  assert.equal(getFormationIndexForSubpage('capabilities'), 4);
  assert.equal(getFormationIndexForSubpage('scientists'), 5);
  assert.equal(getFormationIndexForSubpage('portal'), 6);
});

test('computeTelescopeSNR computes realistic SNR and limiting magnitude for Entoto 1m telescopes', () => {
  const brightTarget = computeTelescopeSNR(13.5, 300, 0.9, 'V');
  assert.equal(brightTarget.status, 'Optimal');
  assert.ok(brightTarget.snr > 100);
  assert.equal(brightTarget.recommendedFrames, 1);

  const faintTarget = computeTelescopeSNR(21.5, 30, 1.8, 'U');
  assert.equal(faintTarget.status, 'Low SNR');
  assert.ok(faintTarget.recommendedFrames > 1);
  assert.ok(brightTarget.limitingMagnitude > faintTarget.limitingMagnitude);
});

test('filterSatelliteScenes filters by platform, cloud cover, and search query', () => {
  const sampleScenes: SatelliteArchiveScene[] = [
    {
      id: 'ETRSS1-ABBAY-2026',
      title: 'Abbay River Basin & GERD Reservoir Multispectral',
      region: 'Benishangul-Gumuz & Amhara',
      platform: 'ETRSS-1',
      resolution: '13.75m GSD',
      cloudCover: 4,
      acquiredDate: '2026-10-12',
      coordinates: '11.21°N, 35.09°E',
      bands: 'B1–B4 + PAN',
      summary: 'Water level and watershed vegetation index across the Blue Nile gorge.',
    },
    {
      id: 'SMART-AFAR-2026',
      title: 'Afar Rift Geothermal & Erta Ale Fault Line',
      region: 'Afar Regional State',
      platform: 'ET-SMART-RSS',
      resolution: '5.8m GSD',
      cloudCover: 18,
      acquiredDate: '2026-09-28',
      coordinates: '13.60°N, 40.66°E',
      bands: 'VNIR + Thermal',
      summary: 'High-resolution fault deformation and volcanic thermal anomaly mapping.',
    },
  ];

  assert.equal(filterSatelliteScenes(sampleScenes, 'All', 25, '').length, 2);
  assert.equal(filterSatelliteScenes(sampleScenes, 'ETRSS-1', 25, '').length, 1);
  assert.equal(filterSatelliteScenes(sampleScenes, 'All', 10, '').length, 1);
  assert.equal(filterSatelliteScenes(sampleScenes, 'All', 25, 'geothermal').length, 1);
});


