/**
 * @file path.ts
 * @description Defines the journey curve the camera flies along, and the
 * mountain "nodes" placed beside it. Nodes alternate left/right (a weave,
 * like a river bending around obstacles) so the trail — and the eagle
 * overlay riding above it — never needs to cross through a mountain base.
 * Peak order here matches PEAKS in ../data/portfolioPeaks.ts exactly.
 */

import * as THREE from 'three';

export interface PathNode {
  id: string;
  x: number;
  y: number;
  z: number;
}

/**
 * Horizontal amplitude of the weave (world units) and forward spacing
 * between consecutive nodes. MOUNTAIN_OFFSET in Scene3D pushes each
 * mountain's apex further out from these x values — as long as that
 * offset plus the mountain radius stays smaller than SPACING_Z, no two
 * mountains (or the trail) can ever overlap.
 */
const WEAVE_X = 5.5;
const SPACING_Z = 22;

// id order must match PEAKS in portfolioPeaks.ts.
const PEAK_IDS = [
  'origin',
  'skills',
  'experience',
  'projects',
  'impact',
  'resume',
  'contact',
] as const;

// Gentle vertical rise/fall so the flight itself has some life to it.
const Y_PATTERN = [0, 0.6, -0.4, 0.9, -0.3, 0.7, -0.2];

export const PATH_NODES: PathNode[] = [
  { id: 'start', x: 0, y: 0, z: -14 },
  ...PEAK_IDS.map((id, i) => ({
    id,
    // Alternate sides: origin(-), skills(+), experience(-), projects(+)...
    x: (i % 2 === 0 ? -1 : 1) * WEAVE_X,
    y: Y_PATTERN[i],
    z: SPACING_Z * (i + 1) - 8,
  })),
  { id: 'end', x: 0, y: 0, z: SPACING_Z * (PEAK_IDS.length + 1) },
];

export const JOURNEY_CURVE = new THREE.CatmullRomCurve3(
  PATH_NODES.map((n) => new THREE.Vector3(n.x, n.y, n.z)),
  false,
  'catmullrom',
  0.5
);

/**
 * Curve parameter (0–1) for each node, evenly spaced by index. Used to
 * drive both the "which peak is active" label logic and the per-mountain
 * reveal fade in Scene3D.
 */
export const PEAK_T: Record<string, number> = Object.fromEntries(
  PATH_NODES.map((n, i) => [n.id, i / (PATH_NODES.length - 1)])
);

const PEAK_ENTRIES = PEAK_IDS.map((id) => ({ id, t: PEAK_T[id] }));

/**
 * Returns the id of the peak nearest the current curve progress `u`,
 * or null before the journey has really begun.
 */
export function getActivePeakId(u: number): string | null {
  if (u < 0.04) return null;

  let closest: { id: string; dist: number } | null = null;
  for (const entry of PEAK_ENTRIES) {
    const dist = Math.abs(entry.t - u);
    if (!closest || dist < closest.dist) {
      closest = { id: entry.id, dist };
    }
  }
  return closest ? closest.id : null;
}