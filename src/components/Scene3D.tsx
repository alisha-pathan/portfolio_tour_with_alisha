/**
 * @file Scene3D.tsx
 * @description Real 3D scroll-driven runner scene — the "world" only.
 * The eagle itself lives outside the Canvas as a screen-locked overlay
 * (see EagleOverlay.tsx), Subway-Surfer style, while this camera flies a
 * rail through the mountains beneath/around it.
 * Colors: warm golden desert sunset palette — locked, do not change.
 *
 * Peak labels: only the nearest peak's label is ever shown, anchored right
 * above that mountain's summit, and it plays a reveal/dismiss animation as
 * the eagle approaches/leaves — a "one at a time" landmark reveal rather
 * than a persistent map or a side list.
 *
 * v5: added the vertical progress-dot trail on the right edge (reference
 * screenshot had it, this file didn't — it previously only existed in the
 * old 2D JourneySections component, which is no longer mounted). It's a
 * plain DOM overlay, sibling to the Canvas, driven by the same
 * activePeakId this file already computes — no separate/driftable copy of
 * peak-tracking logic.
 *
 * v8: SceneGround was two flat, hard-edged planes at different fixed
 * opacities (0.18 and 0.999) — the visible rectangular edges + opacity
 * jump between them is what read as a disconnected "floating patch."
 * Replaced with ONE plane using a true per-vertex alpha gradient (same
 * two colors, #f27a1e near center fading to #d94a12, then to fully
 * transparent at the edges via THREE.MathUtils.smoothstep) — a seamless
 * fade instead of a hard boundary. No other color, position, mountain,
 * camera, or scroll logic changed. Image background kept as-is (this is
 * the confirmed direction — illustrated sky/mountains/dunes stays, only
 * the 3D ground's blend into it was ever the problem).
 */

import { useMemo, useRef, type MutableRefObject, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useScroll, useSpring, useMotionValueEvent } from 'framer-motion';
import * as THREE from 'three';

import { JOURNEY_CURVE, PATH_NODES, getActivePeakId } from '../three/path';
import { PEAKS } from '../data/portfolioPeaks';
import desertBg from '../assets/images/desert-bg.png';

interface Scene3DProps {
  onPeakClick: (id: string, origin?: { x: number; y: number }) => void;
  activePeakId: string | null;
  onActivePeakChange: (id: string | null) => void;
  // NEW: which peak's detail page is currently open — camera dollies in
  // to that specific mountain while this is set, null = normal scroll ride.
  zoomPeakId: string | null;
}

const tmpPos = new THREE.Vector3();
const tmpLookAhead = new THREE.Vector3();

/* ─────────────────────────────────────────────
   Small deterministic PRNG so mountain jitter is
   stable across renders (same node = same shape).
───────────────────────────────────────────── */

function mulberry32(seed: number) {
  let s = seed | 0;
  return function random() {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ─────────────────────────────────────────────
   Bridges framer-motion's page scroll progress
   into a ref R3F can read every frame.
───────────────────────────────────────────── */

function useJourneyProgress() {
  const { scrollYProgress } = useScroll();
  const smoothed = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20,
    mass: 0.6,
  });
  const progressRef = useRef(0);

  useMotionValueEvent(smoothed, 'change', (value) => {
    progressRef.current = value;
  });

  return progressRef;
}

/* ─────────────────────────────────────────────
   Chase camera — rides the curve, looks ahead.
   Also owns the "which peak is nearest" check,
   since the eagle avatar no longer lives in 3D.
───────────────────────────────────────────── */

function ChaseCamera({
  progressRef,
  onActivePeakChange,
  zoomPeakId,
}: {
  progressRef: MutableRefObject<number>;
  onActivePeakChange: (id: string | null) => void;
  zoomPeakId: string | null;
}) {
  const { camera } = useThree();
  const lastActiveId = useRef<string | null>(null);

  useFrame(() => {
    // ── Focus mode: a peak page is open. Dolly the camera in close to
    // that specific mountain and hold there — this is what actually makes
    // it look like the mountain is "zooming in," not just the DOM card. ──
    if (zoomPeakId) {
      const node = PATH_NODES.find((n) => n.id === zoomPeakId);
      if (node) {
        const sideSign = Math.sign(node.x) || 1;
        const apexX = node.x + sideSign * MOUNTAIN_OFFSET;

        const targetX = apexX;
        const targetY = MOUNTAIN_HEIGHT * 0.5;
        // Pulled back slightly (0.85 -> 1.05) so there's more room in
        // frame for the sideways offset below without clipping the peak.
        const targetZ = node.z - MOUNTAIN_RADIUS * 1.05;

        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.07);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.07);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.07);

        // Aim right of the mountain's true center — this is what pushes
        // it to render on the LEFT side of the screen (raising this
        // number moves it further left/outer; lowering brings it back
        // toward center; past ~4 it'll clip out of frame again).
        camera.lookAt(apexX - 4.8, MOUNTAIN_HEIGHT * 0.48, node.z);
      }
      return;
    }

    // ── Normal mode: ride the scroll-driven curve, exactly as before. ──
    const u = THREE.MathUtils.clamp(progressRef.current, 0, 1);
    const uAhead = THREE.MathUtils.clamp(u + 0.05, 0, 1);

    JOURNEY_CURVE.getPointAt(u, tmpPos);
    JOURNEY_CURVE.getPointAt(uAhead, tmpLookAhead);

    const targetX = tmpPos.x;
    const targetY = tmpPos.y + 4.4;
    const targetZ = tmpPos.z - 8.5;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.08);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.08);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.08);

    // Look further ahead and above the path itself — keeps a visible
    // horizon/sky band in frame instead of the camera pointing down at the ground.
    camera.lookAt(tmpLookAhead.x, tmpLookAhead.y + 2.6, tmpLookAhead.z + 6);

    const activeId = getActivePeakId(u);
    if (activeId !== lastActiveId.current) {
      lastActiveId.current = activeId;
      onActivePeakChange(activeId);
    }
  });

  return null;
}

/* ─────────────────────────────────────────────
   Painted mountain geometry — jittered cone with
   a baked vertex-color gradient, no textures.
───────────────────────────────────────────── */

function createMountainGeometry(
  radius: number,
  height: number,
  seed: number,
  palette: { base: string; mid: string; high: string }
): THREE.BufferGeometry {
  const radialSegments = 32;
  const heightSegments = 12;
  const geometry = new THREE.CylinderGeometry(
    radius * 0.12,
    radius,
    height,
    radialSegments,
    heightSegments,
    true
  );

  const position = geometry.attributes.position;
  const colors: number[] = [];
  const rng = mulberry32(seed);

  const baseColor = new THREE.Color(palette.base);
  const midColor = new THREE.Color(palette.mid);
  const highColor = new THREE.Color(palette.high);

  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);

    const angle = Math.atan2(z, x);
    const distFromAxis = Math.sqrt(x * x + z * z);
    const heightT = THREE.MathUtils.clamp((y + height / 2) / height, 0, 1);

    if (distFromAxis > 0.05) {
      const longDune =
        Math.sin(angle * 1.25 + seed * 0.18) * 0.2 +
        Math.sin(angle * 2.6 + seed * 0.33) * 0.12 +
        Math.sin(angle * 5.4 + seed * 0.67) * 0.05;

      const layeredErosion =
        Math.sin(heightT * Math.PI * 1.6 + seed * 0.11) * 0.04 +
        Math.sin(heightT * Math.PI * 3.2 + angle * 0.6) * 0.03;

      const randomBreak = 1 + (rng() - 0.5) * 0.045;
      const baseSpread = 1.08 + (1 - heightT) * 0.42;
      const duneLean = 1 + longDune * (0.9 - heightT * 0.4);

      position.setX(i, x * baseSpread * duneLean * randomBreak);
      position.setZ(i, z * (0.52 + (1 - heightT) * 0.16 + layeredErosion) * randomBreak);
      position.setY(i, y - Math.pow(heightT, 2.25) * height * 0.16);
    }

    const color =
      heightT < 0.5
        ? baseColor.clone().lerp(midColor, heightT / 0.5)
        : midColor.clone().lerp(highColor, (heightT - 0.5) / 0.5);

    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

// Warm Golden Desert Palette — locked, do not change.
const FOREGROUND_PALETTE = { base: '#9f3918', mid: '#e26624', high: '#ffad45' };
const RIDGE_PALETTE = { base: '#b84a1d', mid: '#ef7c28', high: '#ffc05f' };

const MOUNTAIN_RADIUS = 6.8;
const MOUNTAIN_HEIGHT = 3.65;
// Must clear MOUNTAIN_RADIUS + trail radius with margin, or the base pokes into the path.
const MOUNTAIN_OFFSET = 7.4;

/* ─────────────────────────────────────────────
   Foreground mountains — pushed clear of the
   path so the eagle overlay's lane drift and
   the trail underneath never clip into them.
───────────────────────────────────────────── */

function Mountains({
  onPeakClick,
}: {
  onPeakClick: (id: string, origin?: { x: number; y: number }) => void;
}) {
  const peakNodes = useMemo(
    () => PATH_NODES.filter((n) => n.id !== 'start' && n.id !== 'end'),
    []
  );

  return (
    <>
      {peakNodes.map((node, index) => (
        <ForegroundMountain
          key={node.id}
          node={node}
          index={index}
          onPeakClick={onPeakClick}
        />
      ))}
    </>
  );
}

function ForegroundMountain({
  node,
  index,
  onPeakClick,
}: {
  node: (typeof PATH_NODES)[number];
  index: number;
  onPeakClick: (id: string, origin?: { x: number; y: number }) => void;
}) {
  const sideSign = Math.sign(node.x) || 1;
  const apexX = node.x + sideSign * MOUNTAIN_OFFSET;

  const geometry = useMemo(
    () =>
      createMountainGeometry(
        MOUNTAIN_RADIUS,
        MOUNTAIN_HEIGHT,
        index * 97 + 11,
        FOREGROUND_PALETTE
      ),
    [index]
  );

  return (
    <SwayingMountain key={node.id} position={[apexX, -0.25, node.z]} phase={index * 1.3}>
      <mesh
        geometry={geometry}
        position={[0, MOUNTAIN_HEIGHT / 2, 0]}
        onClick={(event) => {
          event.stopPropagation();
          onPeakClick(node.id, {
            x: event.nativeEvent.clientX,
            y: event.nativeEvent.clientY,
          });
        }}
      >
        <meshStandardMaterial
          vertexColors
          roughness={0.96}
          metalness={0}
          flatShading
        />
      </mesh>
    </SwayingMountain>
  );
}

function SwayingMountain({
  position,
  phase,
  children,
}: {
  position: [number, number, number];
  phase: number;
  children: ReactNode;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.35 + phase) * 0.008;
  });

  return (
    <group ref={groupRef} position={position}>
      {children}
    </group>
  );
}

/* ─────────────────────────────────────────────
   Distant ridges — hazy, desaturated mountains
   scattered behind the real peaks for depth.
───────────────────────────────────────────── */

function DistantRidges() {
  const ridges = useMemo(() => {
    const rng = mulberry32(4242);
    return Array.from({ length: 14 }, (_, i) => {
      const x = (rng() - 0.5) * 70;
      const z = 18 + rng() * 142;
      const radius = 9 + rng() * 10;
      const height = 3.2 + rng() * 4.8;
      return { x, z, radius, height, seed: i * 53 + 5 };
    });
  }, []);

  return (
    <>
      {ridges.map((ridge, i) => (
        <RidgeMountain key={i} ridge={ridge} index={i} />
      ))}
    </>
  );
}

function RidgeMountain({
  ridge,
  index,
}: {
  ridge: {
    x: number;
    z: number;
    radius: number;
    height: number;
    seed: number;
  };
  index: number;
}) {
  const geometry = useMemo(
    () => createMountainGeometry(ridge.radius, ridge.height, ridge.seed, RIDGE_PALETTE),
    [ridge.height, ridge.radius, ridge.seed]
  );

  return (
    <mesh
      key={index}
      geometry={geometry}
      position={[ridge.x, ridge.height / 2 - 1.55, ridge.z]}
      scale={[1.25, 0.82, 1]}
    >
      <meshStandardMaterial
        vertexColors
        roughness={1}
        metalness={0}
        flatShading
        fog
        transparent
        opacity={0.74}
      />
    </mesh>
  );
}


function SceneGround() {
  const geometry = useMemo(() => {
    const width = 220;
    const depth = 260;
    const geo = new THREE.PlaneGeometry(width, depth, 48, 48);

    const colorNear = new THREE.Color('#f27a1e');
    const colorFar = new THREE.Color('#d94a12');

    const position = geo.attributes.position;
    const colors: number[] = [];

    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i);
      const y = position.getY(i);

      const nx = x / (width / 2);
      const ny = y / (depth / 2);
      const dist = Math.sqrt(nx * nx + ny * ny);
      const t = THREE.MathUtils.clamp(dist, 0, 1);

      // Fully opaque near the center, smoothly fading to fully
      // transparent by the edge — the actual "graceful" part.
      const alpha = 1 - THREE.MathUtils.smoothstep(dist, 0.32, 1);
      const color = colorNear.clone().lerp(colorFar, t);

      colors.push(color.r, color.g, color.b, alpha);
    }

    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4));
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.76, 72]}>
      <meshBasicMaterial vertexColors transparent depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ─────────────────────────────────────────────
   Ground / Trail
───────────────────────────────────────────── */

function Trail() {
  const geometry = useMemo(
    () => new THREE.TubeGeometry(JOURNEY_CURVE, 300, 0.45, 8, false),
    []
  );

  return (
    <mesh geometry={geometry} position={[0, -0.55, 0]}>
      <meshStandardMaterial
        color="#ffd27a"
        emissive="#ff8a2a"
        emissiveIntensity={0.6}
        roughness={0.4}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

/* ─────────────────────────────────────────────
   Checkpoint cards — anchored directly above each
   mountain's own summit (not beside the path, not
   docked to the screen edge), so the card visually
   belongs to that specific peak. A thin glowing
   connector beam + dot ties the card down to the
   summit when active, matching the "pinned to its
   mountain" look rather than floating loose.
───────────────────────────────────────────── */

const SUMMIT_TOP = MOUNTAIN_HEIGHT + 0.3;
const CARD_Y = MOUNTAIN_HEIGHT + 1.5;

function Signposts({
  onPeakClick,
  activePeakId,
  zoomPeakId,
}: {
  onPeakClick: (id: string, origin?: { x: number; y: number }) => void;
  activePeakId: string | null;
  zoomPeakId: string | null;
}) {
  const peakNodes = useMemo(
    () => PATH_NODES.filter((n) => n.id !== 'start' && n.id !== 'end'),
    []
  );

  return (
    <>
      {peakNodes.map((node, index) => {
        const peak = PEAKS.find((p) => p.id === node.id);
        if (!peak) return null;

        const sideSign = Math.sign(node.x) || 1;
        // Same position as the mountain's own apex in Mountains — the
        // card sits directly above the peak it belongs to.
        const apexX = node.x + sideSign * MOUNTAIN_OFFSET;
        const isActive = activePeakId === node.id;
        const isZoomed = zoomPeakId === node.id;

        return (
          <group key={node.id} position={[apexX, -1.15, node.z]}>
            {/* Connector beam + dot — ties the card down to the summit */}
            {isActive && (
              <>
                <mesh position={[0, (SUMMIT_TOP + CARD_Y) / 2 - 0.35, 0]}>
                  {/* <cylinderGeometry args={[0.035, 0.01, CARD_Y - SUMMIT_TOP - 0.55, 8, 1, true]} /> */}
                  <cylinderGeometry args={[0.015, 0.01, CARD_Y - SUMMIT_TOP - 0.5, 8, 1, true]} />
                  <meshBasicMaterial
                    color="#ffd27a"
                    transparent
                    opacity={0.55}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    side={THREE.DoubleSide}
                  />
                </mesh>
                <mesh position={[0, SUMMIT_TOP + 0.56, 0]}>
                  <sphereGeometry args={[0.091, 32, 18]} />
                  <meshBasicMaterial color="#ffd27a" transparent opacity={0.95} />
                </mesh>
              </>
            )}
            <Html
              position={[
                0,
                isActive
                  ? (isZoomed ? CARD_Y - 0.5 : CARD_Y)
                  : SUMMIT_TOP,
                0,
              ]}
              center
              distanceFactor={isActive ? 4.2 : 9}
              occlude={false}
            >
              {isActive ? (
                <button
                  type="button"
                  className="checkpoint-pop pointer-events-auto flex min-w-[640px] max-w-[720px] cursor-pointer flex-col items-center gap-4 rounded-[2rem] border-2 border-[#ffd27a] px-12 py-9 text-center transition duration-200 hover:-translate-y-1"
                  style={{
                    background: '#290d05',
                    transform: isZoomed ? 'scale(0.65)' : 'scale(1)',
                    transformOrigin: 'center center',
                    boxShadow:
                      '0 0 0 1px rgba(255,190,83,0.36), 0 20px 56px rgba(41,13,5,0.72), 0 0 58px rgba(249,146,47,0.56)',
                  }}
                  onClick={(event) => onPeakClick(node.id, { x: event.clientX, y: event.clientY })}
                >
                  <span className="text-sm font-extrabold uppercase tracking-[0.28em] text-[#ffbd53]">
                    Checkpoint {String(index + 1).padStart(2, '0')} /{' '}
                    {String(peakNodes.length).padStart(2, '0')}
                  </span>

                  <span className="font-display text-[4rem] font-extrabold leading-[0.95] tracking-[-0.04em] text-[#fff0c7] drop-shadow-[0_5px_18px_rgba(0,0,0,0.7)]">
                    {peak.label}
                  </span>

                  <span className="text-xl font-extrabold uppercase tracking-[0.22em] text-[#ffbd53]">
                    {peak.subtitle}
                  </span>

                  <span className="mt-4 flex items-center gap-3 rounded-full bg-[#ffbd53] px-8 py-4 text-base font-extrabold uppercase tracking-[0.16em] text-[#290d05] shadow-[0_0_20px_rgba(255,190,83,0.35)]">
                    <span className="h-3 w-3 animate-pulse rounded-full bg-[#290d05]" />
                    Tap to explore
                    <span className="text-xl leading-none">→</span>
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(event) => onPeakClick(node.id, { x: event.clientX, y: event.clientY })}
                  className="pointer-events-auto h-3 w-3 rounded-full border border-[rgba(255,189,83,0.5)] bg-[rgba(255,189,83,0.35)]"
                  aria-label={peak.label}
                />
              )}
            </Html>
          </group>
        );
      })}
    </>
  );
}

/* ─────────────────────────────────────────────
   Progress trail — plain DOM overlay (not R3F),
   fixed to the right edge. One dot per peak, in
   journey order. Filled = passed, glowing = active,
   dim = upcoming. Driven entirely by activePeakId,
   which Scene3D already computes via getActivePeakId
   — no separate scroll-tracking logic to drift out
   of sync.
───────────────────────────────────────────── */

function ProgressTrail({ activePeakId }: { activePeakId: string | null }) {
  const peakNodes = useMemo(
    () => PATH_NODES.filter((n) => n.id !== 'start' && n.id !== 'end'),
    []
  );
  const activeIndex = peakNodes.findIndex((n) => n.id === activePeakId);

  return (
    <div
      className="pointer-events-none fixed right-6 top-1/2 z-[90] flex -translate-y-1/2 flex-col items-center gap-3"
      aria-hidden="true"
    >
      {peakNodes.map((node, i) => {
        const isActive = node.id === activePeakId;
        const isPassed = activeIndex >= 0 && i <= activeIndex;

        return (
          <div
            key={node.id}
            className="rounded-full transition-all duration-300"
            style={{
              width: isActive ? 10 : 7,
              height: isActive ? 10 : 7,
              background: isPassed ? '#ffbd53' : 'rgba(255,189,83,0.25)',
              border: '1.5px solid rgba(255,189,83,0.5)',
              boxShadow: isActive
                ? '0 0 14px #ffbd53, 0 0 28px rgba(255,189,83,0.5)'
                : 'none',
            }}
          />
        );
      })}

      {/* Trail line connecting the dots */}
      <div
        className="absolute left-1/2 top-0 -z-10 -translate-x-1/2"
        style={{
          width: 1,
          height: '100%',
          background:
            'linear-gradient(to bottom, transparent, rgba(255,189,83,0.2) 15%, rgba(255,189,83,0.2) 85%, transparent)',
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Scene root
───────────────────────────────────────────── */

export function Scene3D({
  onPeakClick,
  activePeakId,
  onActivePeakChange,
  zoomPeakId,
}: Scene3DProps) {
  const progressRef = useJourneyProgress();

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* ── Fixed illustrated desert background — not a 3D paper plane ── */}
      <div className="absolute inset-0 z-0">
        <img
          src={desertBg}
          alt=""
          draggable={false}
          className="h-full w-full select-none object-cover object-center"
          style={{
            transform: 'scale(1.08)',
            transformOrigin: 'center center',
          }}
        />
      </div>

      {/* ── Color blend layer — makes Canvas mountains belong to the image ── */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(to bottom, rgba(230,104,35,0.04) 0%, rgba(230,104,35,0.10) 42%, rgba(105,30,8,0.38) 100%)',
        }}
      />

      {/* ── Bottom sand haze — hides hard intersection between 3D and bg ── */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[34vh]"
        style={{
          background:
            'linear-gradient(to top, rgba(41,13,5,0.55) 0%, rgba(175,55,12,0.26) 45%, transparent 100%)',
        }}
      />

      <Canvas
        className="relative z-[2]"
        gl={{ antialias: true, alpha: true }}
        camera={{ fov: 55, near: 0.1, far: 300, position: [0, 2.6, -6.5] }}
        style={{ background: 'transparent' }}
      >
        <fog attach="fog" args={['#ef7c28', 18, 118]} />

        <hemisphereLight args={['#ffbd53', '#a83818', 0.92]} />
        <ambientLight color="#ff9c37" intensity={0.28} />
        <directionalLight position={[-7, 11, -5]} intensity={1.18} color="#ffbd53" />
        <directionalLight position={[6, 5, -10]} intensity={0.32} color="#d9471d" />

        <ChaseCamera
          progressRef={progressRef}
          onActivePeakChange={onActivePeakChange}
          zoomPeakId={zoomPeakId}
        />
        <SceneGround />
        <DistantRidges />
        {/* <Trail /> */}
        <Mountains onPeakClick={onPeakClick} />
        <Signposts
          onPeakClick={onPeakClick}
          activePeakId={activePeakId}
          zoomPeakId={zoomPeakId}
        />
      </Canvas>

      {/* Plain DOM overlay — outside the Canvas, so it's cheap to
          re-render on every scroll tick without touching R3F. */}
      <ProgressTrail activePeakId={activePeakId} />
    </div>
  );
}