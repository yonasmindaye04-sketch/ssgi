import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { computeCorporateScrollState } from '../utils/yekisMath';
import { buildAllYekisCorporateClouds } from '../utils/yekisCorporateParticles';

interface YekisCorporateCanvasProps {
  scrollProgressRef: React.MutableRefObject<number>;
  theme: 'dark' | 'light';
}

export const YekisCorporateCanvas: React.FC<YekisCorporateCanvasProps> = ({
  scrollProgressRef,
  theme,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const themeRef = useRef<'dark' | 'light'>(theme);
  themeRef.current = theme;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / Math.max(1, container.clientHeight),
      0.1,
      100
    );
    camera.position.set(0, 0.18, 5.1);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    const gl = renderer.getContext();
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererStr = debugInfo
      ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL))
      : '';
    const isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software/i.test(rendererStr);

    const dpr = isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.domElement.setAttribute('data-testid', 'yekis-corporate-3d-canvas');
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const particleCount = isSoftwareGl ? 10500 : 18000;
    const rawClouds = buildAllYekisCorporateClouds(particleCount);

    const scaledClouds = rawClouds.map((c) => ({
      pos: new Float32Array(c.pos),
      col: c.col,
    }));

    const updateViewportFormations = () => {
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      const aspect = w / h;
      const isMobile = w < 860;
      const scaleFactor = isMobile ? Math.max(0.66, Math.min(0.9, aspect * 1.18)) : 1.14;

      // Position each 3D corporate formation in the open half of the viewport opposite the minimal text
      // Ch 0 (Hero text left) -> Tower right (+1.08)
      // Ch 1 (Statement center) -> Atrium center (0.0)
      // Ch 2 (Escrow text right) -> Vault left (-1.08)
      // Ch 3 (Fees text left) -> Balance Scale right (+1.08)
      // Ch 4 (Departments text left) -> Studio Pods right (+1.02)
      // Ch 5 (Case Studies text right) -> Ethiopia Corridor left (-1.05)
      // Ch 6 (Finale center) -> Twin Pillars center (0.0)
      const chapterOffsetsX = isMobile
        ? [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
        : [1.08, 0.0, -1.08, 1.08, 1.02, -1.05, 0.0];
      const chapterOffsetsY = isMobile
        ? [0.34, 0.25, 0.34, 0.34, 0.34, 0.34, 0.28]
        : [0.04, 0.0, 0.02, 0.04, 0.02, 0.04, 0.04];

      for (let cIdx = 0; cIdx < rawClouds.length; cIdx++) {
        const src = rawClouds[cIdx].pos;
        const dst = scaledClouds[cIdx].pos;
        const ox = chapterOffsetsX[cIdx];
        const oy = chapterOffsetsY[cIdx];
        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;
          dst[i3] = src[i3] * scaleFactor + ox;
          dst[i3 + 1] = src[i3 + 1] * scaleFactor + oy;
          dst[i3 + 2] = src[i3 + 2] * scaleFactor;
        }
      }
    };

    updateViewportFormations();

    const geometry = new THREE.BufferGeometry();
    const seed = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      seed[i] = Math.random();
    }

    const posAAttr = new THREE.BufferAttribute(new Float32Array(scaledClouds[0].pos), 3);
    const posBAttr = new THREE.BufferAttribute(new Float32Array(scaledClouds[1].pos), 3);
    const colAAttr = new THREE.BufferAttribute(new Float32Array(scaledClouds[0].col), 3);
    const colBAttr = new THREE.BufferAttribute(new Float32Array(scaledClouds[1].col), 3);

    geometry.setAttribute('position', posAAttr);
    geometry.setAttribute('aPosB', posBAttr);
    geometry.setAttribute('aColA', colAAttr);
    geometry.setAttribute('aColB', colBAttr);
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: themeRef.current === 'dark' ? THREE.AdditiveBlending : THREE.NormalBlending,
      uniforms: {
        uTime: { value: 0 },
        uMix: { value: 0 },
        uDpr: { value: dpr },
        uRotY: { value: 0 },
        uRotX: { value: 0 },
        uLightMode: { value: themeRef.current === 'light' ? 1.0 : 0.0 },
      },
      vertexShader: `
        attribute vec3 aPosB;
        attribute vec3 aColA;
        attribute vec3 aColB;
        attribute float aSeed;
        uniform float uTime;
        uniform float uMix;
        uniform float uDpr;
        uniform float uRotY;
        uniform float uRotX;
        uniform float uLightMode;
        varying vec3 vColor;
        varying float vAlpha;

        mat3 rotateY(float a) {
          float s = sin(a), c = cos(a);
          return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c);
        }
        mat3 rotateX(float a) {
          float s = sin(a), c = cos(a);
          return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c);
        }

        void main() {
          float stagger = clamp((uMix - aSeed * 0.16) / 0.84, 0.0, 1.0);
          float m = stagger * stagger * (3.0 - 2.0 * stagger);

          vec3 pA = rotateX(uRotX * 0.35) * rotateY(uRotY * 0.45) * position;
          vec3 pB = rotateX(uRotX * 0.35) * rotateY(uRotY * 0.45) * aPosB;
          vec3 pos = mix(pA, pB, m);

          float arc = sin(m * 3.14159265);
          pos.y += arc * (aSeed - 0.5) * 0.28;
          pos.x += cos(uTime * 0.7 + aSeed * 6.2831) * 0.008;
          pos.y += sin(uTime * 0.6 + aSeed * 6.2831) * 0.008;

          vec3 rawCol = mix(aColA, aColB, m);
          vColor = mix(rawCol, rawCol * vec3(0.10, 0.45, 0.30), uLightMode * 0.82);

          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mv;

          float baseSize = mix(1.6, 4.1, pow(aSeed, 1.5));
          gl_PointSize = baseSize * uDpr * (4.4 / max(1.2, -mv.z));
          vAlpha = mix(0.60, 0.98, aSeed);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        uniform float uLightMode;
        void main() {
          vec2 d = gl_PointCoord - 0.5;
          float r = length(d) * 2.0;
          if (r > 1.0) discard;
          float core = exp(-r * r * 3.6);
          float halo = (1.0 - r) * 0.35;
          float a = (core + halo) * vAlpha;
          vec3 col = mix(vColor * (1.0 + core * 0.5), vColor, uLightMode);
          gl_FragColor = vec4(col, a);
        }
      `,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Subtle Corporate Atrium Horizon Grid
    const atriumGroup = new THREE.Group();
    const gridVerts: number[] = [];
    const gridSpan = 5.5;
    const gridSteps = 14;
    const floorY = -1.62;

    for (let i = -gridSteps; i <= gridSteps; i++) {
      const t = (i / gridSteps) * gridSpan;
      gridVerts.push(-gridSpan, floorY, t, gridSpan, floorY, t);
      gridVerts.push(t, floorY, -gridSpan, t, floorY, gridSpan);
    }

    const gridGeo = new THREE.BufferGeometry();
    gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridVerts, 3));
    const gridMat = new THREE.LineBasicMaterial({
      color: themeRef.current === 'dark' ? 0x22c55e : 0x0f5132,
      transparent: true,
      opacity: themeRef.current === 'dark' ? 0.08 : 0.06,
    });
    const gridLines = new THREE.LineSegments(gridGeo, gridMat);
    atriumGroup.add(gridLines);
    scene.add(atriumGroup);

    let activePairA = -1;
    let activePairB = -1;
    const applyPairAttributes = (idxA: number, idxB: number) => {
      if (idxA === activePairA && idxB === activePairB) return;
      activePairA = idxA;
      activePairB = idxB;
      posAAttr.set(scaledClouds[idxA].pos);
      posAAttr.needsUpdate = true;
      colAAttr.set(scaledClouds[idxA].col);
      colAAttr.needsUpdate = true;
      posBAttr.set(scaledClouds[idxB].pos);
      posBAttr.needsUpdate = true;
      colBAttr.set(scaledClouds[idxB].col);
      colBAttr.needsUpdate = true;
    };
    applyPairAttributes(0, 1);

    let pointerX = 0;
    let pointerY = 0;
    const onPointerMove = (e: PointerEvent) => {
      pointerX = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
      pointerY = (e.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const onResize = () => {
      if (!container) return;
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      updateViewportFormations();
      activePairA = -1;
      activePairB = -1;
      const state = computeCorporateScrollState(scrollProgressRef.current);
      applyPairAttributes(state.sectionA, state.sectionB);
    };
    window.addEventListener('resize', onResize);

    let disposed = false;
    let rafId = 0;
    let rotY = 0;
    let lastTime = performance.now() * 0.001;

    const gl2 = gl as WebGL2RenderingContext;
    const afterDraw = (cb: () => void) => {
      if (!isSoftwareGl || typeof gl2.fenceSync !== 'function') {
        rafId = requestAnimationFrame(cb);
        return;
      }
      const sync = gl2.fenceSync(gl2.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl2.flush();
      const poll = () => {
        if (disposed) return;
        const status = gl2.clientWaitSync(sync!, 0, 0);
        if (status === gl2.TIMEOUT_EXPIRED) {
          setTimeout(poll, 16);
          return;
        }
        gl2.deleteSync(sync);
        rafId = requestAnimationFrame(cb);
      };
      setTimeout(poll, 16);
    };

    const tick = () => {
      if (disposed) return;
      const now = performance.now() * 0.001;
      const dt = Math.min(0.05, Math.max(0.001, now - lastTime));
      lastTime = now;

      const state = computeCorporateScrollState(scrollProgressRef.current);
      applyPairAttributes(state.sectionA, state.sectionB);

      rotY += dt * state.rotSpeed;
      material.uniforms.uTime.value = now;
      material.uniforms.uMix.value = state.morphMix;
      material.uniforms.uRotY.value = Math.sin(rotY) * 0.35 + pointerX * 0.18;
      material.uniforms.uRotX.value = pointerY * 0.14;

      const isLight = themeRef.current === 'light';
      material.uniforms.uLightMode.value = isLight ? 1.0 : 0.0;
      material.blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
      gridMat.color.setHex(isLight ? 0x0f5132 : 0x22c55e);
      gridMat.opacity = isLight ? 0.06 : 0.08;

      camera.position.x += (pointerX * 0.12 - camera.position.x) * 0.08;
      camera.position.y += (0.14 - pointerY * 0.08 - camera.position.y) * 0.08;
      camera.lookAt(0, 0, 0);

      atriumGroup.rotation.y = Math.sin(rotY * 0.5) * 0.08 + pointerX * 0.04;

      renderer.render(scene, camera);
      afterDraw(tick);
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      geometry.dispose();
      material.dispose();
      gridGeo.dispose();
      gridMat.dispose();
      renderer.dispose();
    };
  }, [scrollProgressRef]);

  return <div ref={mountRef} className="yk-neb-canvas" aria-hidden="true" />;
};
