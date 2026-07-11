/**
 * @file peakZones.ts
 * @description Single source of truth for where each peak sits along the
 * scroll journey. BackgroundScene (mountain visuals), JourneySections
 * (labels/cards), and EagleOverlay (lane drift) all read from this file —
 * previously each had its own hardcoded copy of these numbers, which is
 * exactly how they drifted out of sync (and how BackgroundScene ended up
 * with peak ids that didn't even exist in PEAKS).
 */

export interface PeakZone {
    id: string;
    scrollAt: number;
    xVw: number;
    side: 'left' | 'right' | 'center';
}

// id order + values match PEAKS in ../data/portfolioPeaks.ts.
export const PEAK_ZONES: PeakZone[] = [
    { id: 'origin', scrollAt: 0.09, xVw: 22, side: 'left' },
    { id: 'skills', scrollAt: 0.215, xVw: 78, side: 'right' },
    { id: 'experience', scrollAt: 0.34, xVw: 25, side: 'left' },
    { id: 'projects', scrollAt: 0.465, xVw: 75, side: 'right' },
    { id: 'impact', scrollAt: 0.59, xVw: 28, side: 'left' },
    { id: 'resume', scrollAt: 0.715, xVw: 72, side: 'right' },
    { id: 'contact', scrollAt: 0.84, xVw: 50, side: 'center' },
];

// How close (in scroll progress) the journey needs to be to a zone's
// scrollAt for that peak to count as "active".
export const ACTIVE_WINDOW = 0.06;

// Shared interpolation stops — start (0) → each peak in order → end (1).
export const SCROLL_STOPS = [0, ...PEAK_ZONES.map((z) => z.scrollAt), 1];

// Eagle's screen-space lane position (vw) at each stop.
export const EAGLE_X_STOPS = [50, ...PEAK_ZONES.map((z) => z.xVw), 50];

// Eagle's lean/bank angle (degrees) at each stop — leans toward whichever
// side the upcoming peak is on.
export const EAGLE_ROTATE_STOPS = [
    0,
    ...PEAK_ZONES.map((z) => (z.side === 'left' ? -9 : z.side === 'right' ? 9 : 0)),
    0,
];

// Foreground mountain layer's horizontal drift (vw) at each stop — moves
// opposite the eagle's lean, so the eagle visually threads around it
// instead of the mountain just sliding underneath in a straight line.
export const MOUNTAIN_WEAVE_STOPS = [
    0,
    ...PEAK_ZONES.map((z) => (z.side === 'left' ? 2.6 : z.side === 'right' ? -2.6 : 0)),
    0,
];