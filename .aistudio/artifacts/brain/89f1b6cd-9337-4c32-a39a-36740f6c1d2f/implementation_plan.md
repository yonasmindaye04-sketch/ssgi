# Sub-Page 3D Particle Hover Dispersion & Luminous Halo Interaction

Enhance the WebGL particle engine in the Space Science and Geospatial Institute (SSGI) sub-pages so that passing the cursor over the 3D background formations (`Missions`, `Observatory`, `Capabilities`, `Scientists`, and `Data Portal`) triggers a volumetric 3D radial dispersion, a bright cyan-indigo spectral glow halo, and an elastic spring-back recovery with a lingering afterglow trail.

## User Review & Critical Decisions

> [!IMPORTANT]
> All interactive hover design choices were confirmed during clarification and are incorporated directly into this plan:

- **Confirmed Visual Effect**: **Radial dispersion plus bright cyan-indigo glow halo** — Hovered particles disperse radially outward from the cursor ray while blooming with an additive cyan-indigo (`#38bdf8` → `#6f8cff`) spectral corona and expanded point size.
- **Confirmed Interaction Field**: **Medium-wide 3D ray field with smooth falloff** — Uses true 3D point-to-ray distance math across the camera frustum so the cursor interacts seamlessly with particles at any depth (Rocket, Equatorial Atom, Earth Globe, Astronaut, and Vortex Tunnel) using a smooth quintic falloff curve.
- **Confirmed Recovery Motion**: **Smooth elastic spring-back with lingering afterglow** — Displaced particles return to their orbital coordinates via a damped spring-velocity integrator while their cyan-indigo glow decays more gradually to leave a subtle orbital afterglow trail.

---

## 1. Overview & Core Concept

- **What It Does**: Transforms the 3D WebGL particle formations visible in the open hero viewports and translucent sections of all five SSGI sub-pages into a responsive, tactile particle field that reacts in real time to cursor movement across the page.
- **Target Audience / Persona**: Aerospace engineers, visiting astronomers, and scientific researchers exploring SSGI's orbital fleet, Entoto Observatory instruments, and satellite ground archive.
- **Key Value**: Bridges the EnduroSat-inspired architectural sub-page interface with the live 3D WebGL stage, making the background spacecraft, telescope atom rings, and planetary globe feel physically alive without obstructing UI controls or typography.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Entering a Sub-Page**: When a user opens any sub-page (`Missions`, `Observatory`, `Capabilities`, `Scientists`, or `Data Portal`), the 3D particle engine morphs to that page's dedicated formation and activates the enhanced sub-page 3D hover field.
  2. **Sweeping Across the 3D Formation**: As the mouse cursor moves across the sub-page (including over the open split-stage hero viewport or across content sections), a 3D ray is cast from the camera through the cursor position. Particles within the medium-wide cylindrical/conical ray field experience a smooth radial push outward perpendicular to the view ray, paired with a gentle orbital swirl.
  3. **Cyan-Indigo Glow Halo**: Affected particles smoothly transition their color and shader halo intensity (`aHover`) toward a luminous cyan-indigo plasma tint (`#38bdf8` / `#6f8cff` / `#e0f2fe` core) and expand in point radius.
  4. **Elastic Spring-Back & Afterglow Trail**: As the cursor moves onward or leaves the window, displaced particles rebound toward their target orbital coordinates with a damped elastic spring while their glow halo fades out over a slightly longer decay window, leaving a visible comet-like afterglow trail.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Calibrated aerospace telemetry and deep-space astrophysics, harmonizing with the EnduroSat-inspired tonal dark architecture.
  - *Color Palette & Mood*: Deep obsidian void (`#04050a`), elevated tonal surfaces (`#070a17`, `#090d1e`), primary orbital indigo accent (`#6f8cff`), and excited particle emission highlights in electric cyan (`#38bdf8`) and core white-blue (`#e0f2fe`).
  - *Typography & Hierarchy*: Preserves `Sora` display headers and `Plus Jakarta Sans` tabular telemetry readouts layered cleanly above the WebGL canvas (`z-10`) with full pointer pass-through.

- **Interactive Feedback & Motion**:
  - Zero-latency pointer tracking via passive `pointermove` listeners so scrolling and clicking sub-page controls remain completely unblocked.
  - Respects `prefers-reduced-motion: reduce` by disabling particle displacement and velocity springs when reduced motion is requested.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Volumetric 3D Ray-Distance Field vs. Single Z-Plane Projection**
  - *Chosen Approach*: Compute perpendicular 3D distance from each particle to the camera-through-cursor ray (`rayOrigin + t * rayDirection`), weighted by a depth window so foreground and mid-ground formation particles respond evenly.
  - *Why*: The 3D formations (such as the tilted Atom rings on `Observatory`, the 3D Earth sphere on `Capabilities`, and the deep Vortex Tunnel on `Data Portal`) span a wide range of $Z$ depths (`z ∈ [-35, +9]`). A flat `z = 0` plane intersection misses most of the 3D volume, whereas a 3D ray field slices cleanly through every formation.
  - *Alternatives Considered*: `THREE.Raycaster.intersectObject(points)` on CPU per event was rejected because running generic raycast intersection array allocations against 56,000–70,000 dynamic points every pointer event causes GC churn; inline typed-array ray math inside the particle update loop runs with zero allocations at 60fps.

- **Decision 2: Damped Spring Velocity Integrator + Decoupled Afterglow Decay**
  - *Chosen Approach*: Track per-particle 3D displacement (`repulseOffsets`), 3D velocity (`repulseVelocities`), and scalar glow excitation (`hoverGlowIntensity`) in pre-allocated `Float32Array` buffers, combined with a dedicated `aHover` vertex attribute in the custom GLSL shader.
  - *Why*: Separating spatial spring kinematics from the scalar glow decay allows particles to snap back elastically with subtle oscillation while their cyan-indigo glow halo lingers smoothly behind fast cursor sweeps.
  - *Alternatives Considered*: Simple linear interpolation (`lerp`) on position and color was passed over because it lacks elastic rebound and extinguishes the glow at the exact same rate as position recovery.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       Window Pointer Event Stream                       │
│         (pointermove / pointerdown / pointerleave — Passive)            │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ Normalized Device Coords (NDC x, y)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                3D Camera Ray Unprojection & Sub-Page State              │
│   • Ray Origin: camera.position                                         │
│   • Ray Direction: normalize(unproject(ndcX, ndcY, 0.5) - camera.pos)   │
│   • Mode Multiplier: Enhanced Medium-Wide Field when Sub-Page Active    │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│               Pure 3D Ray-Particle Kinematics & Glow Math               │
│   • Perpendicular Ray Vector: v = P - (O + clamp(dot(P-O, D)) * D)      │
│   • Quintic Falloff: smootherstep(1 - dist / fieldRadius)               │
│   • Radial Dispersion + Tangential Swirl Impulse                        │
│   • Damped Elastic Spring Integrator (stiffness k, damping c)           │
│   • Asymmetric Afterglow Envelope (fast attack, lingering decay)        │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ TypedArray Buffer Updates
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    WebGL Custom GLSL Particle Shader                    │
│   • Attributes: position (vec3), aColor (vec3), aSize (float),          │
│                 aHover (float)                                          │
│   • Vertex Shader: Expands point size & passes vHover to fragment       │
│   • Fragment Shader: Renders soft radial core + cyan-indigo halo corona │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - `subpageActiveRef`: Synchronizes React `activeSubpage` state (`'missions' | 'observatory' | 'capabilities' | 'scientists' | 'portal' | null`) into the WebGL animation loop without tearing down or recreating the Three.js context.
  - `repulseOffsets` (`Float32Array(3 * N)`): Current 3D spatial displacement of each particle from its orbital formation target.
  - `repulseVelocities` (`Float32Array(3 * N)`): Current 3D velocity vector of each particle for underdamped spring-back recovery.
  - `hoverGlowIntensity` (`Float32Array(N)`): Per-particle excitation value in `[0, 1]` with fast attack (`0.28`) when inside the cursor ray field and lingering exponential decay (`0.045`) after the cursor leaves.
  - `aHover` (`THREE.BufferAttribute`): Per-vertex float attribute driving the GLSL cyan-indigo corona blend and soft outer halo falloff in `FRAGMENT_SHADER`.

- **Interactive Component & State Mapping**:
  - **Sub-Page Mode Detection**: Whenever `activeSubpage` is non-null, `subpageActiveRef.current` enables the sub-page medium-wide 3D ray field (`radius = 0.72 * halfHeight`), boosted radial dispersion + subtle tangential swirl, and full cyan-indigo glow halo.
  - **Pure Math Helper & Unit Test Coverage**: Extract the core 3D ray-particle interaction and elastic spring-afterglow step calculation into a pure, deterministic helper function with unit tests verifying radial dispersion direction, smooth falloff bounds, elastic spring oscillation/convergence, and lingering afterglow decay.
