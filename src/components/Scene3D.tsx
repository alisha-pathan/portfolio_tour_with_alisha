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
 * v3: checkpoint card pulled down close to the summit (was floating 2.7
 * units above it, well outside where the camera is actually looking) and
 * restyled for contrast — solid dark panel, stronger border/glow, bigger
 * text — so it reads clearly against the bright sunset sky instead of
 * blending into it.
 */

import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useScroll, useSpring, useMotionValueEvent } from 'framer-motion';
import * as THREE from 'three';

import { JOURNEY_CURVE, PATH_NODES, getActivePeakId } from '../three/path';
import { PEAKS } from '../data/portfolioPeaks';

interface Scene3DProps {
  onPeakClick: (id: string) => void;
  activePeakId: string | null;
  onActivePeakChange: (id: string | null) => void;
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
}: {
  progressRef: React.MutableRefObject<number>;
  onActivePeakChange: (id: string | null) => void;
}) {
  const { camera } = useThree();
  const lastActiveId = useRef<string | null>(null);

  useFrame(() => {
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
  const radialSegments = 10;
  const heightSegments = 7;
  const geometry = new THREE.ConeGeometry(radius, height, radialSegments, heightSegments, false);
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

    const distFromAxis = Math.sqrt(x * x + z * z);
    if (distFromAxis > 0.05) {
      const jitter = 1 + (rng() - 0.5) * 0.2;
      position.setX(i, x * jitter);
      position.setZ(i, z * jitter);
    }

    const heightT = THREE.MathUtils.clamp((y + height / 2) / height, 0, 1);
    const color =
      heightT < 0.55
        ? baseColor.clone().lerp(midColor, heightT / 0.55)
        : midColor.clone().lerp(highColor, (heightT - 0.55) / 0.45);

    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

// Warm Golden Desert Palette — locked, do not change.
const FOREGROUND_PALETTE = { base: '#6b2811', mid: '#a8501f', high: '#ffb066' };
const RIDGE_PALETTE = { base: '#5c2a14', mid: '#c16a2c', high: '#ffcf8a' };

const MOUNTAIN_RADIUS = 4.4;
const MOUNTAIN_HEIGHT = 4.8;
// Must clear MOUNTAIN_RADIUS + trail radius with margin, or the base pokes into the path.
const MOUNTAIN_OFFSET = 6.4;

/* ─────────────────────────────────────────────
   Foreground mountains — pushed clear of the
   path so the eagle overlay's lane drift and
   the trail underneath never clip into them.
───────────────────────────────────────────── */

function Mountains({ onPeakClick }: { onPeakClick: (id: string) => void }) {
  const peakNodes = useMemo(
    () => PATH_NODES.filter((n) => n.id !== 'start' && n.id !== 'end'),
    []
  );

  return (
    <>
      {peakNodes.map((node, index) => {
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
          <SwayingMountain key={node.id} position={[apexX, 0, node.z]} phase={index * 1.3}>
            <mesh
              geometry={geometry}
              position={[0, MOUNTAIN_HEIGHT / 2, 0]}
              onClick={(event) => {
                event.stopPropagation();
                onPeakClick(node.id);
              }}
            >
              <meshStandardMaterial vertexColors roughness={0.9} flatShading />
            </mesh>
          </SwayingMountain>
        );
      })}
    </>
  );
}

function SwayingMountain({
  position,
  phase,
  children,
}: {
  position: [number, number, number];
  phase: number;
  children: React.ReactNode;
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
    return Array.from({ length: 12 }, (_, i) => {
      const x = (rng() - 0.5) * 60;
      const z = 20 + rng() * 130;
      const radius = 6 + rng() * 6;
      const height = 8 + rng() * 8;
      return { x, z, radius, height, seed: i * 53 + 5 };
    });
  }, []);

  return (
    <>
      {ridges.map((ridge, i) => {
        const geometry = useMemo(
          () => createMountainGeometry(ridge.radius, ridge.height, ridge.seed, RIDGE_PALETTE),
          [i]
        );

        return (
          <mesh key={i} geometry={geometry} position={[ridge.x, ridge.height / 2 - 1.2, ridge.z]}>
            <meshStandardMaterial
              vertexColors
              roughness={1}
              flatShading
              fog
              transparent
              opacity={0.7}
            />
          </mesh>
        );
      })}
    </>
  );
}

/* ─────────────────────────────────────────────
   Sun — stays locked in the sky relative to the
   camera, unaffected by fog, with a warm halo.
───────────────────────────────────────────── */

function Sun() {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.position.set(
      camera.position.x + 18,
      camera.position.y + 14,
      camera.position.z + 55
    );
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[3.2, 24, 24]} />
        <meshBasicMaterial color="#fff3dd" fog={false} />
      </mesh>
      {[5, 7, 9.5].map((r, i) => (
        <mesh key={r}>
          <sphereGeometry args={[r, 24, 24]} />
          <meshBasicMaterial
            color="#ff8a2a"
            transparent
            opacity={0.16 - i * 0.045}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            fog={false}
          />
        </mesh>
      ))}
    </group>
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
   mountain's own summit (not beside the path), so
   the card visually belongs to that specific peak.
   Pulled in close (1.3 units above the summit, was
   2.7) so it sits right where the camera is actually
   looking instead of floating up near the sky.
───────────────────────────────────────────── */

const SUMMIT_TOP = MOUNTAIN_HEIGHT + 0.3;
const CARD_Y = MOUNTAIN_HEIGHT + 1.3;

function Signposts({
  onPeakClick,
  activePeakId,
}: {
  onPeakClick: (id: string) => void;
  activePeakId: string | null;
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

        return (
          <group key={node.id} position={[apexX, 0, node.z]}>
            <Html
              position={[0, isActive ? CARD_Y : SUMMIT_TOP, 0]}
              center
              distanceFactor={isActive ? 5 : 9}
              occlude={false}
            >
              {isActive ? (
              <button
  type="button"
  onClick={() => onPeakClick(node.id)}
  className="checkpoint-pop pointer-events-auto group relative flex min-w-[520px] max-w-[620px] flex-col items-center overflow-hidden rounded-[2rem] border-2 border-[#ffd27a] px-10 py-8 text-center transition duration-300 hover:-translate-y-1 hover:border-[#fff3dd]"
  style={{
    background:
      'linear-gradient(180deg, rgba(39,12,3,0.98) 0%, rgba(26,9,2,0.97) 58%, rgba(58,18,6,0.98) 100%)',
    boxShadow:
      '0 0 0 1px rgba(255,210,122,0.26), 0 20px 54px rgba(0,0,0,0.66), 0 0 54px rgba(255,140,42,0.48)',
  }}
>
  {/* ── Soft Inner Glow ───────────────────── */}
  <span
    className="pointer-events-none absolute inset-0 opacity-90"
    style={{
      background:
        'radial-gradient(circle at 50% 0%, rgba(255,210,122,0.24), transparent 44%)',
    }}
  />

  {/* ── Top Checkpoint Badge ───────────────── */}
  <span className="relative mb-5 inline-flex items-center gap-2 rounded-full border border-[#ffd27a]/45 bg-[#ffd27a]/12 px-5 py-2 text-sm font-extrabold uppercase tracking-[0.24em] text-[#ffd27a]">
    <span className="h-2 w-2 rounded-full bg-[#ffd27a] shadow-[0_0_12px_#ffd27a]" />
    Checkpoint {String(index + 1).padStart(2, '0')} / {String(peakNodes.length).padStart(2, '0')}
  </span>

  {/* ── Main Portfolio Stop Title ──────────── */}
  <span className="relative font-display text-[2.65rem] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#fff8ee] drop-shadow-[0_4px_16px_rgba(0,0,0,0.55)]">
    {peak.label}
  </span>

  {/* ── Subtitle / Developer Category ──────── */}
  <span className="relative mt-3 text-[1.05rem] font-extrabold uppercase tracking-[0.2em] text-[#ffd27a]">
    {peak.subtitle}
  </span>

  {/* ── Small Developer Signal Line ────────── */}
  <span className="relative mt-5 max-w-[460px] text-base font-medium leading-7 text-[#f6d4a0]">
    Open this checkpoint to explore the work, skills, and engineering story behind it.
  </span>

  {/* ── CTA Line ───────────────────────────── */}
  <span className="relative mt-6 inline-flex items-center gap-3 rounded-full bg-[#ffd27a] px-6 py-3 text-sm font-extrabold uppercase tracking-[0.16em] text-[#2a0902] transition duration-300 group-hover:scale-105 group-hover:bg-[#fff3dd]">
    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#2a0902]" />
    Tap to explore
    <span className="text-lg leading-none transition duration-300 group-hover:translate-x-1">→</span>
  </span>

  {/* ── Bottom Glow Line ───────────────────── */}
  <span className="pointer-events-none absolute bottom-0 left-1/2 h-[3px] w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#ffd27a] to-transparent opacity-80" />
</button>
              ) : (
                <button
                  type="button"
                  onClick={() => onPeakClick(node.id)}
                  className="pointer-events-auto h-3 w-3 rounded-full border border-[rgba(255,210,122,0.5)] bg-[rgba(255,210,122,0.35)]"
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
   Scene root
───────────────────────────────────────────── */

export function Scene3D({ onPeakClick, activePeakId, onActivePeakChange }: Scene3DProps) {
  const progressRef = useJourneyProgress();

  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        gl={{ antialias: true }}
        camera={{ fov: 55, near: 0.1, far: 300, position: [0, 2.6, -6.5] }}
      >
        <color attach="background" args={['#2a0d04']} />
        <fog attach="fog" args={['#4c1a05', 14, 85]} />

        <hemisphereLight args={['#ffd27a', '#5c2410', 0.8]} />
        <ambientLight color="#ffb066" intensity={0.25} />
        <directionalLight position={[6, 10, -4]} intensity={1.2} color="#ff8a2a" />

        <ChaseCamera progressRef={progressRef} onActivePeakChange={onActivePeakChange} />
        <Sun />
        <DistantRidges />
        <Trail />
        <Mountains onPeakClick={onPeakClick} />
        <Signposts onPeakClick={onPeakClick} activePeakId={activePeakId} />
      </Canvas>
    </div>
  );
}