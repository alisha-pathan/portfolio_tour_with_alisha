/**
 * @file Scene3D.tsx
 * @description Real 3D scroll-driven runner scene — the "world" only.
 * The eagle itself lives outside the Canvas as a screen-locked overlay
 * (see EagleOverlay.tsx), Subway-Surfer style, while this camera flies a
 * rail through the mountains beneath/around it.
 * Colors updated to a warm golden desert sunset palette.
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
    const targetY = tmpPos.y + 2.6;
    const targetZ = tmpPos.z - 6.5;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.08);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.08);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.08);

    camera.lookAt(tmpLookAhead.x, tmpLookAhead.y + 0.4, tmpLookAhead.z);

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
  const radialSegments = 7;
  const heightSegments = 5;
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
      const jitter = 1 + (rng() - 0.5) * 0.3;
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

// Warm Golden Desert Palette
const FOREGROUND_PALETTE = { base: '#2a0902', mid: '#8b3a1a', high: '#e27b38' };
const RIDGE_PALETTE = { base: '#3a1206', mid: '#b24c23', high: '#f6a23a' };

const MOUNTAIN_RADIUS = 3.2;
const MOUNTAIN_HEIGHT = 7.2;
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

            <mesh position={[0, MOUNTAIN_HEIGHT + 0.2, 0]}>
              <sphereGeometry args={[0.22, 12, 12]} />
              <meshStandardMaterial
                color="#fff3dd"
                emissive="#ffd27a"
                emissiveIntensity={1.5}
              />
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
   Active peak label — only the nearest peak
   renders, anchored near its mountain apex.
───────────────────────────────────────────── */

function ActivePeakLabel({ activePeakId }: { activePeakId: string | null }) {
  const node = PATH_NODES.find((n) => n.id === activePeakId);
  const peak = PEAKS.find((p) => p.id === activePeakId);

  if (!node || !peak) return null;

  const sideSign = Math.sign(node.x) || 1;
  const apexX = node.x + sideSign * MOUNTAIN_OFFSET;

  return (
    <Html position={[apexX, MOUNTAIN_HEIGHT + 1.4, node.z]} center distanceFactor={9} occlude={false}>
      <div className="pointer-events-none select-none whitespace-nowrap rounded-full border border-[rgba(255,210,122,0.4)] bg-[rgba(26,8,2,0.85)] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#ffd27a] shadow-[0_4px_16px_rgba(255,140,42,0.3)] backdrop-blur-md">
        {peak.label}
      </div>
    </Html>
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

        <hemisphereLight args={['#ffd27a', '#1a0802', 0.6]} />
        <directionalLight position={[6, 10, -4]} intensity={1.2} color="#ff8a2a" />

        <ChaseCamera progressRef={progressRef} onActivePeakChange={onActivePeakChange} />
        <Sun />
        <DistantRidges />
        <Trail />
        <Mountains onPeakClick={onPeakClick} />
        <ActivePeakLabel activePeakId={activePeakId} />
      </Canvas>
    </div>
  );
}