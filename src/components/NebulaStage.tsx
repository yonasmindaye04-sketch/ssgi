import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  SECTION_ROTATION_SPEEDS,
  SECTION_BREATHING_FLAGS,
  SECTION_METADATA,
  smootherstep,
  clamp01,
  computeSectionScrollState,
  getProgressForSectionIndex,
  getSectionIndexForHash,
  SubpageId,
  getFormationIndexForSubpage,
} from '../utils/nebulaMath';
import { generateNebulaBaseData } from '../utils/nebulaParticles';
import { InquiryModal } from './InquiryModal';
import { SSGISubpageView } from './SSGISubpageView';

const VERTEX_SHADER = `
  uniform float uSize;
  uniform float uScale;
  uniform float uNear;
  uniform float uFar;
  attribute float aSize;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vFog;
  void main() {
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float depth = -mv.z;
    gl_PointSize = uSize * aSize * (uScale / max(0.001, depth));
    // depth fade: bright up close, dissolving into the far fog
    vFog = clamp((uFar - depth) / (uFar - uNear), 0.04, 1.0);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;
  varying vec3 vColor;
  varying float vFog;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.0, d);
    a = pow(a, 1.5);
    gl_FragColor = vec4(vColor, a * vFog);
  }
`;

function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export const NebulaStage: React.FC = () => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  const [activeSection, setActiveSection] = useState<number>(0);
  const [activeSubpage, setActiveSubpage] = useState<SubpageId | null>(null);
  const [subpageFocusItem, setSubpageFocusItem] = useState<string | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTab, setModalTab] = useState<'inquiry' | 'social' | 'legal'>('inquiry');
  const [modalTopic, setModalTopic] = useState<string>('');
  const [submittedCount, setSubmittedCount] = useState<number>(0);

  const scrollTargetProgressRef = useRef<number | null>(null);
  const subpageOverrideProgressRef = useRef<number | null>(null);

  const openSubpage = useCallback((subpage: SubpageId, focusItem?: string) => {
    const formationIdx = getFormationIndexForSubpage(subpage);
    subpageOverrideProgressRef.current = getProgressForSectionIndex(formationIdx);
    setSubpageFocusItem(focusItem);
    setActiveSubpage(subpage);
  }, []);

  const scrollToSection = useCallback((sectionIndex: number) => {
    const rootEl = rootRef.current;
    if (!rootEl) return;
    subpageOverrideProgressRef.current = null;
    setActiveSubpage(null);
    const progress = getProgressForSectionIndex(sectionIndex);
    const maxScroll = Math.max(0, rootEl.offsetHeight - window.innerHeight);
    const targetY = progress * maxScroll;
    scrollTargetProgressRef.current = progress;
    setActiveSection(sectionIndex);
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  }, []);

  const handleBackToStage = useCallback(
    (targetSectionIndex?: number) => {
      subpageOverrideProgressRef.current = null;
      setActiveSubpage(null);
      if (typeof targetSectionIndex === 'number') {
        requestAnimationFrame(() => {
          scrollToSection(targetSectionIndex);
        });
      }
    },
    [scrollToSection]
  );

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
      e.preventDefault();
      const idx = getSectionIndexForHash(hash);
      if (idx !== null) {
        window.history.replaceState(null, '', hash);
        scrollToSection(idx);
      }
    },
    [scrollToSection]
  );

  const openModalWith = useCallback((tab: 'inquiry' | 'social' | 'legal', topic = '') => {
    setModalTab(tab);
    setModalTopic(topic);
    setModalOpen(true);
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      const idx = getSectionIndexForHash(window.location.hash);
      if (idx !== null) {
        scrollToSection(idx);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [scrollToSection]);

  useEffect(() => {
    const rootEl = rootRef.current;
    const stageEl = stageRef.current;
    const mountEl = canvasMountRef.current;
    if (!rootEl || !stageEl || !mountEl) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const isCardMode = new URLSearchParams(window.location.search).has('card');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const width = window.innerWidth;
    const cores = navigator.hardwareConcurrency || 8;
    let particleCount = 56000;
    if (width >= 1600 && cores >= 8) particleCount = 70000;
    if (width < 1280) particleCount = 44000;
    if (width < 900) particleCount = 32000;
    if (width < 720) particleCount = 20000;
    if (cores <= 4) particleCount = Math.round(0.62 * particleCount);
    if (isCardMode) particleCount = Math.min(particleCount, 14000);
    if (isSoftwareGl) particleCount = Math.min(particleCount, 32000);

    const canvas = document.createElement('canvas');
    canvas.className = 'neb-gl';
    canvas.setAttribute('data-testid', 'nebula-webgl-canvas');
    mountEl.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    let pixelRatio = isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 1.75);
    renderer.setPixelRatio(pixelRatio);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();

    // Populate studio environment map per Three.js skill standard
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
    camera.position.set(0, 0, 15);

    let halfHeight = 15 * Math.tan((Math.PI / 180) * 22.5);
    let halfWidth = halfHeight;

    const baseData = generateNebulaBaseData(particleCount);
    const positions = new Float32Array(3 * particleCount);
    const colors = new Float32Array(3 * particleCount);
    const sizes = baseData.baseSizes.slice();
    const repulseOffsets = new Float32Array(3 * particleCount);
    const repulseIntensity = new Float32Array(particleCount);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: {
        uSize: { value: 0.05 },
        uScale: { value: 1000 },
        uNear: { value: 2 },
        uFar: { value: 58 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // 7 Scaled formation target buffers
    const sectionClouds: Float32Array[] = [];
    for (let s = 0; s < 7; s++) {
      sectionClouds.push(new Float32Array(3 * particleCount));
    }
    const offsetX = new Float32Array(7);
    const offsetY = new Float32Array(7);
    const rotCos = new Float32Array(7);
    const rotSin = new Float32Array(7);
    let tunnelDepth = 48;
    let breathingScale = 1;
    let tunnelFlowZ = 0;

    function sampleSectionParticle(
      secIdx: number,
      pIdx: number,
      out: [number, number, number]
    ): void {
      const cloud = sectionClouds[secIdx];
      const base = 3 * pIdx;
      const x = cloud[base];
      let y = cloud[base + 1];
      const z = cloud[base + 2];
      const c = rotCos[secIdx];
      const s = rotSin[secIdx];
      let rx = x * c + z * s;
      let rz = -x * s + z * c;
      if (SECTION_BREATHING_FLAGS[secIdx]) {
        rx *= breathingScale;
        y *= breathingScale;
        rz *= breathingScale;
      }
      if (secIdx === 3) {
        rz += tunnelFlowZ;
        if (rz > 9) rz -= tunnelDepth;
      }
      out[0] = rx + offsetX[secIdx];
      out[1] = y + offsetY[secIdx];
      out[2] = rz;
    }

    function rebuildViewportFormations(): void {
      if (!stageEl) return;
      const w = stageEl.clientWidth || window.innerWidth;
      const h = stageEl.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      halfHeight = 15 * Math.tan((Math.PI / 180) * 22.5);
      halfWidth = (w / h) * halfHeight;
      pixelRatio = isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 1.75);
      material.uniforms.uScale.value = (h * pixelRatio) / (2 * Math.tan((Math.PI / 180) * 22.5));
      material.uniforms.uSize.value = w < 720 ? 0.075 : 0.05;

      const isPortraitMobile = w < 760 && w < h;
      const portraitScale = isPortraitMobile ? Math.max(0.58, (w / h) * 1.15) : 1;

      const rocketScale = 0.98 * halfHeight * portraitScale;
      const atomScale = 0.8 * halfHeight * portraitScale;
      const globeScale = 0.98 * halfHeight * portraitScale;
      const astroLargeScale = 0.5 * halfHeight * portraitScale;
      const astroSmallScale = 0.3 * halfHeight * portraitScale;

      for (let i = 0; i < particleCount; i++) {
        const idx3 = 3 * i;
        sectionClouds[0][idx3] = baseData.rocketPos[idx3] * rocketScale;
        sectionClouds[0][idx3 + 1] = baseData.rocketPos[idx3 + 1] * rocketScale;
        sectionClouds[0][idx3 + 2] = baseData.rocketPos[idx3 + 2] * rocketScale;

        sectionClouds[2][idx3] = baseData.atomPos[idx3] * atomScale;
        sectionClouds[2][idx3 + 1] = baseData.atomPos[idx3 + 1] * atomScale;
        sectionClouds[2][idx3 + 2] = baseData.atomPos[idx3 + 2] * atomScale;

        sectionClouds[5][idx3] = baseData.astronautPos[idx3] * astroLargeScale;
        sectionClouds[5][idx3 + 1] = baseData.astronautPos[idx3 + 1] * astroLargeScale;
        sectionClouds[5][idx3 + 2] = baseData.astronautPos[idx3 + 2] * astroLargeScale;

        sectionClouds[6][idx3] = baseData.astronautPos[idx3] * astroSmallScale;
        sectionClouds[6][idx3 + 1] = baseData.astronautPos[idx3 + 1] * astroSmallScale;
        sectionClouds[6][idx3 + 2] = baseData.astronautPos[idx3 + 2] * astroSmallScale;
      }

      // Section 1: Deep Starfield
      const starCloud = sectionClouds[1];
      for (let i = 0; i < particleCount; i++) {
        const r1 = baseData.randomA[i];
        const r2 = baseData.randomB[i];
        const r3 = (r1 * 17.37 + r2 * 31.71) % 1;
        starCloud[3 * i] = (r1 - 0.5) * halfWidth * 4.4;
        starCloud[3 * i + 1] = (r2 - 0.5) * halfHeight * 3.4;
        starCloud[3 * i + 2] = 9 - 50 * Math.pow(r3, 0.7);
      }

      // Section 3: Vortex Tunnel
      const tunnelCloud = sectionClouds[3];
      tunnelDepth = 50;
      for (let i = 0; i < particleCount; i++) {
        const t = baseData.randomA[i];
        const z = 9 - t * tunnelDepth;
        const spiralAngle = t * Math.PI * 7 + (i % 11);
        const radius = halfHeight * (0.16 + 0.82 * t);
        tunnelCloud[3 * i] = Math.cos(spiralAngle) * radius;
        tunnelCloud[3 * i + 1] = Math.sin(spiralAngle) * radius * 0.82;
        tunnelCloud[3 * i + 2] = z;
      }

      // Section 4: Earth Globe
      const globeCloud = sectionClouds[4];
      for (let i = 0; i < particleCount; i++) {
        const r = globeScale * (1 + 0.014 * baseData.globeElevation[i]);
        globeCloud[3 * i] = baseData.globeUnitPos[3 * i] * r;
        globeCloud[3 * i + 1] = baseData.globeUnitPos[3 * i + 1] * r;
        globeCloud[3 * i + 2] = baseData.globeUnitPos[3 * i + 2] * r;
      }

      offsetX[0] = isPortraitMobile ? 0.12 * halfWidth : 0.4 * halfWidth;
      offsetY[0] = isPortraitMobile ? 0.28 * halfHeight : 0.04 * halfHeight;
      offsetX[1] = 0;
      offsetY[1] = 0;
      offsetX[2] = isPortraitMobile ? 0 : -0.32 * halfWidth;
      offsetY[2] = isPortraitMobile ? 0.25 * halfHeight : 0.02 * halfHeight;
      offsetX[3] = 0;
      offsetY[3] = 0;
      offsetX[4] = isPortraitMobile ? 0.22 * halfWidth : 0.48 * halfWidth;
      offsetY[4] = isPortraitMobile ? 0.24 * halfHeight : -0.02 * halfHeight;
      offsetX[5] = 0;
      offsetY[5] = -0.04 * halfHeight;
      offsetX[6] = 0;
      offsetY[6] = isPortraitMobile ? 0.18 * halfHeight : 0;
    }

    rebuildViewportFormations();

    let resizePending = false;
    const resizeObserver = new ResizeObserver(() => {
      if (!resizePending) {
        resizePending = true;
        requestAnimationFrame(() => {
          resizePending = false;
          rebuildViewportFormations();
        });
      }
    });
    resizeObserver.observe(stageEl);

    const sectionEls = Array.from(stageEl.querySelectorAll<HTMLElement>('.neb-sec'));
    const dotEls = Array.from(stageEl.querySelectorAll<HTMLElement>('.neb-dot'));
    const teamRowEl = stageEl.querySelector<HTMLElement>('.neb-team-row');

    const interactiveEnabled = !isCardMode;
    let pointerNdcX = 0;
    let pointerNdcY = 0;
    let pointerActive = false;

    const handlePointerMove = (e: PointerEvent) => {
      pointerNdcX = (e.clientX / window.innerWidth - 0.5) * 2;
      pointerNdcY = -((e.clientY / window.innerHeight - 0.5) * 2);
      pointerActive = true;
    };
    const handlePointerLeave = () => {
      pointerActive = false;
    };

    if (interactiveEnabled) {
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      document.addEventListener('pointerleave', handlePointerLeave);
    }

    const unprojectVec = new THREE.Vector3();
    let pointerWorldX = 0;
    let pointerWorldY = 0;
    let pointerWorldZ = 0;
    let hasPointerWorld = false;
    const posA: [number, number, number] = [0, 0, 0];
    const posB: [number, number, number] = [0, 0, 0];
    let currentScatterEnvelope = 0;
    let lastReportedDot = 0;

    function updateParticlesAndDOM(scrollProgress: number, elapsedSec: number): void {
      for (let s = 0; s < 7; s++) {
        const ang = elapsedSec * SECTION_ROTATION_SPEEDS[s];
        rotCos[s] = Math.cos(ang);
        rotSin[s] = Math.sin(ang);
      }
      breathingScale = 1 + 0.024 * Math.sin(0.7 * elapsedSec);
      tunnelFlowZ = (2.4 * elapsedSec) % tunnelDepth;

      const scrollState = computeSectionScrollState(scrollProgress);
      const { segmentIndex, morphT, scatterEnvelope, activeDotIndex, sectionStyles } = scrollState;
      const scatterAmplitude = scatterEnvelope * halfHeight * 0.62;
      currentScatterEnvelope = scatterEnvelope;

      const colorA = baseData.sectionColors[segmentIndex];
      const colorB = baseData.sectionColors[segmentIndex + 1];

      hasPointerWorld = false;
      if (interactiveEnabled && pointerActive) {
        unprojectVec.set(pointerNdcX, pointerNdcY, 0.5).unproject(camera).sub(camera.position);
        if (Math.abs(unprojectVec.z) > 1e-4) {
          const dist = -camera.position.z / unprojectVec.z;
          pointerWorldX = camera.position.x + unprojectVec.x * dist;
          pointerWorldY = camera.position.y + unprojectVec.y * dist;
          pointerWorldZ = camera.position.z + unprojectVec.z * dist;
          hasPointerWorld = true;
        }
      }

      const repulseRadius = 0.5 * halfHeight;
      const repulseRadiusSq = repulseRadius * repulseRadius;
      const repulseStrength = 0.36 * halfHeight;

      for (let i = 0; i < particleCount; i++) {
        const staggeredT = clamp01((morphT - 0.34 * baseData.randomA[i]) / 0.66);
        const pMorph = smootherstep(staggeredT);

        sampleSectionParticle(segmentIndex, i, posA);
        sampleSectionParticle(segmentIndex + 1, i, posB);

        const phase = baseData.randomB[i];
        const waveX = Math.sin(0.6 * elapsedSec + 6.283 * phase);
        const waveY = Math.cos(0.47 * elapsedSec + 6.283 * phase);
        const idx3 = 3 * i;

        const px =
          posA[0] +
          (posB[0] - posA[0]) * pMorph +
          baseData.scatterDirs[idx3] * scatterAmplitude +
          0.05 * waveX;
        const py =
          posA[1] +
          (posB[1] - posA[1]) * pMorph +
          baseData.scatterDirs[idx3 + 1] * scatterAmplitude +
          0.05 * waveY;
        const pz =
          posA[2] +
          (posB[2] - posA[2]) * pMorph +
          baseData.scatterDirs[idx3 + 2] * scatterAmplitude +
          waveX * waveY * 0.06;

        let rx = 0;
        let ry = 0;
        let rz = 0;
        let rBoost = 0;

        if (hasPointerWorld) {
          const dx = px - pointerWorldX;
          const dy = py - pointerWorldY;
          const dz = pz - pointerWorldZ;
          const distSq = dx * dx + dy * dy + dz * dz;
          if (distSq < repulseRadiusSq) {
            const d = Math.sqrt(distSq) || 0.001;
            const falloff = 1 - d / repulseRadius;
            rBoost = falloff * falloff;
            const push = (repulseStrength * rBoost) / d;
            rx = dx * push;
            ry = dy * push;
            rz = dz * push;
          }
        }

        repulseOffsets[idx3] += (rx - repulseOffsets[idx3]) * 0.16;
        repulseOffsets[idx3 + 1] += (ry - repulseOffsets[idx3 + 1]) * 0.16;
        repulseOffsets[idx3 + 2] += (rz - repulseOffsets[idx3 + 2]) * 0.16;
        repulseIntensity[i] += (rBoost - repulseIntensity[i]) * 0.16;

        positions[idx3] = px + repulseOffsets[idx3];
        positions[idx3 + 1] = py + repulseOffsets[idx3 + 1];
        positions[idx3 + 2] = pz + repulseOffsets[idx3 + 2];

        const colorGain = 1 + 0.95 * repulseIntensity[i];
        colors[idx3] = Math.min(1.55, (colorA[idx3] + (colorB[idx3] - colorA[idx3]) * morphT) * colorGain);
        colors[idx3 + 1] = Math.min(
          1.55,
          (colorA[idx3 + 1] + (colorB[idx3 + 1] - colorA[idx3 + 1]) * morphT) * colorGain
        );
        colors[idx3 + 2] = Math.min(
          1.55,
          (colorA[idx3 + 2] + (colorB[idx3 + 2] - colorA[idx3 + 2]) * morphT) * colorGain
        );

        if (interactiveEnabled) {
          sizes[i] = baseData.baseSizes[i] * (1 + 1.4 * repulseIntensity[i]);
        }
      }

      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.aColor.needsUpdate = true;
      if (interactiveEnabled) {
        geometry.attributes.aSize.needsUpdate = true;
      }

      for (let s = 0; s < sectionEls.length; s++) {
        const style = sectionStyles[s];
        sectionEls[s].style.opacity = String(style.opacity);
        sectionEls[s].style.transform = `translate3d(${style.translateX}px, ${style.translateY}px, 0)`;
        sectionEls[s].style.pointerEvents = style.opacity > 0.45 ? 'auto' : 'none';
      }

      if (teamRowEl) {
        teamRowEl.style.transform = `translateX(${scrollState.teamRowTranslateFactor * window.innerWidth}px)`;
      }

      for (let s = 0; s < dotEls.length; s++) {
        const isActive = s === activeDotIndex;
        dotEls[s].style.opacity = isActive ? '1' : '0.32';
        dotEls[s].style.transform = `scale(${isActive ? 1.7 : 1})`;
      }

      stageEl?.setAttribute('data-active-section', String(activeDotIndex));
      if (activeDotIndex !== lastReportedDot) {
        lastReportedDot = activeDotIndex;
        setActiveSection(activeDotIndex);
      }
    }

    if (prefersReducedMotion) {
      updateParticlesAndDOM(0, 0);
      renderer.render(scene, camera);
      return () => {
        if (interactiveEnabled) {
          window.removeEventListener('pointermove', handlePointerMove);
          document.removeEventListener('pointerleave', handlePointerLeave);
        }
        resizeObserver.disconnect();
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        canvas.remove();
      };
    }

    let frameId = 0;
    let isRunning = true;
    let smoothedScroll = 0;
    let targetScroll = 0;
    let elapsedTime = isCardMode ? 1.6 : 0;
    let lastNow = performance.now();

    function afterDraw(cb: () => void): void {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      if (!sync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const poll = () => {
        if (!isRunning) return;
        const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick(): void {
      if (!isRunning) return;
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastNow) / 1000);
      lastNow = now;
      elapsedTime += dt;

      if (subpageOverrideProgressRef.current !== null) {
        targetScroll = subpageOverrideProgressRef.current;
      } else if (isCardMode) {
        const cycle = (elapsedTime / 9) % 2;
        targetScroll = cycle < 1 ? cycle : 2 - cycle;
      } else if (rootEl) {
        const rect = rootEl.getBoundingClientRect();
        const maxScroll = rootEl.offsetHeight - window.innerHeight;
        targetScroll = maxScroll > 0 ? clamp01(-rect.top / maxScroll) : 0;
      }

      // Snap faster when in software WebGL mode so scroll jumps settle immediately for screenshots
      const lerpFactor = isSoftwareGl ? 0.38 : 0.07;
      smoothedScroll += (targetScroll - smoothedScroll) * lerpFactor;
      if (Math.abs(targetScroll - smoothedScroll) < 0.001) {
        smoothedScroll = targetScroll;
      }

      updateParticlesAndDOM(smoothedScroll, elapsedTime);

      const targetCamZ = 15 - 5.5 * currentScatterEnvelope;
      camera.position.x += (1.7 * pointerNdcX - camera.position.x) * 0.05;
      camera.position.y += (1.7 * pointerNdcY * 0.7 - camera.position.y) * 0.05;
      camera.position.z += (targetCamZ - camera.position.z) * 0.06;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isRunning) {
          isRunning = false;
          cancelAnimationFrame(frameId);
          clearTimeout(frameId);
        }
      } else if (!isRunning) {
        isRunning = true;
        lastNow = performance.now();
        frameId = requestAnimationFrame(tick);
      }
    };

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    frameId = requestAnimationFrame(tick);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isRunning = false;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (interactiveEnabled) {
        window.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerleave', handlePointerLeave);
      }
      resizeObserver.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  const stageOverlayHiddenStyle: React.CSSProperties = activeSubpage
    ? { visibility: 'hidden', pointerEvents: 'none' }
    : {};

  return (
    <div ref={rootRef} className="neb-root">
      <div ref={stageRef} className="neb-stage" data-active-section={activeSection}>
        {/* Dedicated WebGL Mount Container — Always active behind both 3D Stage & Sub-Pages */}
        <div ref={canvasMountRef} className="neb-canvas-mount" />

        {/* Top Navigation Bar */}
        <header className="neb-nav" style={stageOverlayHiddenStyle}>
          <a
            href="#hero"
            onClick={(e) => handleNavClick(e, '#hero')}
            className="neb-logo"
            aria-label="SSGI Ethiopian Space Agency Home"
          >
            SSGI<span>ET</span>
          </a>
          <nav className="neb-links" aria-label="Primary Navigation">
            <a
              href="#work"
              data-testid="nav-subpage-missions"
              onClick={(e) => {
                e.preventDefault();
                openSubpage('missions');
              }}
            >
              Missions
            </a>
            <a
              href="#studio"
              data-testid="nav-subpage-observatory"
              onClick={(e) => {
                e.preventDefault();
                openSubpage('observatory');
              }}
            >
              Observatory
            </a>
            <a
              href="#expertise"
              data-testid="nav-subpage-capabilities"
              onClick={(e) => {
                e.preventDefault();
                openSubpage('capabilities');
              }}
            >
              Capabilities
            </a>
            <a
              href="#team"
              data-testid="nav-subpage-scientists"
              onClick={(e) => {
                e.preventDefault();
                openSubpage('scientists');
              }}
            >
              Scientists
            </a>
            <a
              href="#portal"
              data-testid="nav-subpage-portal"
              onClick={(e) => {
                e.preventDefault();
                openSubpage('portal');
              }}
            >
              Data Portal
            </a>
            <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')}>
              Contact
            </a>
          </nav>
        </header>

        {/* Section 0 — Hero */}
        <section
          id="hero"
          className="neb-sec neb-hero"
          style={{
            opacity: 1,
            transform: 'translate3d(0px, 0px, 0px)',
            ...stageOverlayHiddenStyle,
          }}
          aria-label="Ethiopia In Orbit"
        >
          <div className="neb-hero-copy">
            <h1 className="neb-display">
              Ethiopia
              <br />
              In
              <br />
              <span className="neb-outline">Orbit</span>
            </h1>
            <p className="neb-lead">
              Ethiopian Space Science and Geospatial Institute — advancing Earth observation
              satellites, Entoto optical astronomy, and sovereign orbital telemetry from Addis
              Ababa.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 pointer-events-auto">
              <button
                type="button"
                onClick={() => openSubpage('missions')}
                data-testid="hero-explore-missions-btn"
                className="neb-cta-btn"
              >
                Explore Orbital Fleet →
              </button>
              <button
                type="button"
                onClick={() => openSubpage('portal')}
                data-testid="hero-open-portal-btn"
                className="rounded-full border border-white/20 bg-white/5 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d6dcff] hover:border-[#6f8cff] hover:text-white transition-colors cursor-pointer"
              >
                Satellite Data Portal
              </button>
            </div>
          </div>
        </section>

        {/* Section 1 — Statement */}
        <section
          id="craft"
          className="neb-sec neb-statement"
          style={{
            opacity: 0,
            transform: 'translate3d(0px, 34px, 0px)',
            ...stageOverlayHiddenStyle,
          }}
          aria-label="East African Orbital Science"
        >
          <h2 className="neb-statement-text">
            Pioneering <span className="neb-outline">East African</span> orbital science with
            sovereign <span className="neb-outline">satellite</span> engineering
          </h2>
        </section>

        {/* Section 2 — Studio / Observatory */}
        <section
          id="studio"
          className="neb-sec neb-right"
          style={{
            opacity: 0,
            transform: 'translate3d(46px, 0px, 0px)',
            ...stageOverlayHiddenStyle,
          }}
          aria-label="Observatory"
        >
          <div className="neb-side-copy">
            <h2 className="neb-h2">Entoto</h2>
            <p className="neb-para">
              From our 3,200-meter Entoto Observatory ridges to our multi-satellite ground
              receiving station, we unite astronomers, aerospace engineers, and geospatial
              scientists.
            </p>
            <div className="mt-5 pointer-events-auto">
              <button
                type="button"
                onClick={() => openSubpage('observatory')}
                className="neb-cta-btn"
              >
                Enter Entoto Observatory →
              </button>
            </div>
          </div>
        </section>

        {/* Section 3 — Work / Missions */}
        <section
          id="work"
          className="neb-sec neb-left"
          style={{
            opacity: 0,
            transform: 'translate3d(-46px, 0px, 0px)',
            ...stageOverlayHiddenStyle,
          }}
          aria-label="Missions"
        >
          <div className="neb-side-copy">
            <h2 className="neb-h2">Missions</h2>
            <p className="neb-para">
              Operating ETRSS-1 and ET-SMART-RSS in sun-synchronous orbit to deliver multispectral
              Earth imagery for agriculture, water basins, and climate resilience.
            </p>
            <div className="mt-5 pointer-events-auto">
              <button
                type="button"
                onClick={() => openSubpage('missions')}
                className="neb-cta-btn"
              >
                Inspect ETRSS-1 &amp; ET-SMART-RSS →
              </button>
            </div>
          </div>
        </section>

        {/* Section 4 — Expertise / Capabilities */}
        <section
          id="expertise"
          className="neb-sec neb-expertise"
          style={{
            opacity: 0,
            transform: 'translate3d(0px, 40px, 0px)',
            ...stageOverlayHiddenStyle,
          }}
          aria-label="Where We Lead"
        >
          <h2 className="neb-expertise-title">
            Where we <span className="neb-outline">lead</span>
          </h2>
          <div className="neb-cols pointer-events-auto">
            <div
              className="neb-col cursor-pointer group"
              onClick={() => openSubpage('capabilities', 'Satellites')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') openSubpage('capabilities', 'Satellites');
              }}
            >
              <h4 className="group-hover:text-white transition-colors">Satellites ↗</h4>
              <ul>
                <li>ETRSS-1 Earth Observation</li>
                <li>ET-SMART-RSS NanoSat</li>
                <li>CubeSat Assembly &amp; AIT</li>
              </ul>
            </div>
            <div
              className="neb-col cursor-pointer group"
              onClick={() => openSubpage('capabilities', 'Astronomy')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') openSubpage('capabilities', 'Astronomy');
              }}
            >
              <h4 className="group-hover:text-white transition-colors">Astronomy ↗</h4>
              <ul>
                <li>Entoto Twin 1m Telescopes</li>
                <li>Ionospheric Space Weather</li>
                <li>Deep-Sky Astrometry</li>
              </ul>
            </div>
            <div
              className="neb-col cursor-pointer group"
              onClick={() => openSubpage('capabilities', 'Geospatial')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') openSubpage('capabilities', 'Geospatial');
              }}
            >
              <h4 className="group-hover:text-white transition-colors">Geospatial ↗</h4>
              <ul>
                <li>National Base Cartography</li>
                <li>Drought &amp; Crop Telemetry</li>
                <li>Nile &amp; Rift Basin Hydrology</li>
              </ul>
            </div>
            <div
              className="neb-col cursor-pointer group"
              onClick={() => openSubpage('capabilities', 'Operations')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') openSubpage('capabilities', 'Operations');
              }}
            >
              <h4 className="group-hover:text-white transition-colors">Operations ↗</h4>
              <ul>
                <li>Entoto Ground Station</li>
                <li>S/X-Band Telemetry Reception</li>
                <li>Orbital Mission Control</li>
              </ul>
            </div>
          </div>
          <div className="mt-7 pointer-events-auto">
            <button
              type="button"
              onClick={() => openSubpage('capabilities')}
              className="neb-cta-btn"
            >
              Explore All 4 Directorates →
            </button>
          </div>
        </section>

        {/* Section 5 — Team */}
        <section
          id="team"
          className="neb-sec neb-team"
          style={{
            opacity: 0,
            transform: 'translate3d(0px, 32px, 0px)',
            ...stageOverlayHiddenStyle,
          }}
          aria-label="The Scientists Behind It"
        >
          <h2 className="neb-team-title">The scientists behind it</h2>
          <div className="neb-team-row pointer-events-auto">
            {(['Abdisa', 'Solomon', 'Betelhem', 'Tulu', 'Yohannes', 'Melaku'] as const).map(
              (sciName, idx) => (
                <button
                  key={sciName}
                  type="button"
                  onClick={() => openSubpage('scientists', sciName)}
                  className={`neb-name bg-transparent border-0 p-0 cursor-pointer hover:text-[#8aa0ff] transition-colors ${
                    idx % 2 === 1 ? 'neb-outline' : ''
                  }`}
                >
                  {sciName}
                </button>
              )
            )}
          </div>
          <div className="mt-8 pointer-events-auto">
            <button
              type="button"
              onClick={() => openSubpage('scientists')}
              className="neb-cta-btn"
            >
              View Directorate &amp; Fellowships →
            </button>
          </div>
        </section>

        {/* Section 6 — Contact */}
        <section
          id="contact"
          className="neb-sec neb-contact"
          style={{
            opacity: 0,
            transform: 'translate3d(0px, 26px, 0px)',
            ...stageOverlayHiddenStyle,
          }}
          aria-label="Contact Ethiopian Space Agency"
        >
          <button
            type="button"
            onClick={() => openModalWith('inquiry', 'Initiate Mission Proposal')}
            className="neb-email"
            aria-label="mission@ssgi.gov.et — Open Mission Proposal"
          >
            mission@ssgi.gov.et
          </button>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 pointer-events-auto">
            <button
              type="button"
              data-testid="open-inquiry-btn"
              onClick={() => openModalWith('inquiry', 'Initiate Mission Proposal')}
              className="neb-cta-btn"
            >
              Submit Mission Proposal
            </button>
            <button
              type="button"
              onClick={() => openSubpage('portal')}
              className="rounded-full border border-white/20 bg-white/5 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d6dcff] hover:border-[#6f8cff] hover:text-white transition-colors cursor-pointer"
            >
              Open Satellite Data Archive →
            </button>
            {submittedCount > 0 && (
              <span className="text-xs tracking-wider uppercase text-[#8aa0ff]">
                {submittedCount} {submittedCount === 1 ? 'Proposal Logged' : 'Proposals Logged'}
              </span>
            )}
          </div>
          <footer className="neb-footer">
            <div className="neb-divider" />
            <div className="neb-foot-links">
              <a
                href="#observatory"
                onClick={(e) => {
                  e.preventDefault();
                  openSubpage('observatory');
                }}
              >
                Entoto Observatory
              </a>
              <a
                href="#missions"
                onClick={(e) => {
                  e.preventDefault();
                  openSubpage('missions');
                }}
              >
                Orbital Fleet
              </a>
              <a
                href="#telemetry"
                onClick={(e) => {
                  e.preventDefault();
                  openSubpage('portal');
                }}
              >
                Satellite Data
              </a>
              <a
                href="#scientists"
                onClick={(e) => {
                  e.preventDefault();
                  openSubpage('scientists');
                }}
              >
                Scientists
              </a>
              <a
                href="#privacy"
                onClick={(e) => {
                  e.preventDefault();
                  openModalWith('legal', 'Data Sovereignty & Privacy');
                }}
              >
                Privacy
              </a>
              <a
                href="#terms"
                onClick={(e) => {
                  e.preventDefault();
                  openModalWith('legal', 'Orbital Data Terms of Use');
                }}
              >
                Terms
              </a>
            </div>
          </footer>
        </section>

        {/* Right Progress Rail (Interactive buttons for each of the 7 chapters) */}
        <div
          className="neb-rail"
          role="navigation"
          aria-label="Chapter Progress"
          style={stageOverlayHiddenStyle}
        >
          {SECTION_METADATA.map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => scrollToSection(sec.index)}
              aria-label={`Jump to ${sec.label} section`}
              className="neb-dot-btn"
            >
              <span
                className="neb-dot"
                style={{
                  opacity: sec.index === 0 ? 1 : 0.32,
                  transform: `scale(${sec.index === 0 ? 1.7 : 1})`,
                }}
              />
            </button>
          ))}
        </div>

        {/* Bottom-left scroll hint */}
        <div className="neb-hint" style={stageOverlayHiddenStyle}>
          Scroll to explore · Or select a sub-page above
        </div>

        {/* Full Interactive Sub-Page Overlay (Backed by the live 3D WebGL Particle Formation) */}
        {activeSubpage && (
          <SSGISubpageView
            activeSubpage={activeSubpage}
            initialFocusItem={subpageFocusItem}
            onSelectSubpage={(sub, focus) => openSubpage(sub, focus)}
            onBackToStage={handleBackToStage}
            onOpenProposalModal={(topic) => openModalWith('inquiry', topic)}
          />
        )}
      </div>

      {/* Scroll height spacer driving the 7-stage WebGL particle timeline */}
      <div className="neb-spacer" />

      {/* Interactive Mission Inquiry / Channels / Legal Modal */}
      <InquiryModal
        isOpen={modalOpen}
        initialTab={modalTab}
        activeTopic={modalTopic}
        onClose={() => setModalOpen(false)}
        onSubmitted={() => setSubmittedCount((c) => c + 1)}
      />
    </div>
  );
};
