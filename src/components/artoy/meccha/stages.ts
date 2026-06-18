import novaBg from "@/assets/artoy/sim/nova-stage-bg.png";
import mochiBg from "@/assets/artoy/sim/mochi-stage-bg.png";
import hexxBg from "@/assets/artoy/sim/hexx-stage-bg.png";
import novaSeeker from "@/assets/artoy/sim/nova-seeker.png";
import mochiSeeker from "@/assets/artoy/sim/mochi-seeker.png";
import hexxSeeker from "@/assets/artoy/sim/hexx-seeker.png";

export type SampleId = "nova" | "mochi" | "hexx";

export type Vec2 = { x: number; y: number };
export type Rect = { x: number; y: number; w: number; h: number };

export type SeekerCfg =
  | { kind: "horizontal"; y: number; minX: number; maxX: number; speed: number; coneLen: number; coneHalf: number; swingSpeed: number; swingAmp: number; phase?: number }
  | { kind: "circle"; cx: number; cy: number; radius: number; speed: number; coneLen: number; coneHalf: number; phase?: number };

export type Stage = {
  id: SampleId;
  name: string;
  flavor: string;
  hint: string;
  bg: string;
  seekerSprite: string;
  accent: string;
  spawn: Vec2;
  gems: Vec2[];
  obstacles: Rect[];   // block movement AND seeker line-of-sight
  paintPads: Rect[];   // 2x paint speed when standing here
  seekers: SeekerCfg[];
};

export const W = 640;
export const H = 640;

export const STAGES: Record<SampleId, Stage> = {
  nova: {
    id: "nova",
    name: "Nova",
    flavor: "Cyan Plaza · tutorial sweep",
    hint: "Three color zones. Paint to match the band you stand on, then walk over each gem.",
    bg: novaBg,
    seekerSprite: novaSeeker,
    accent: "#22d3ee",
    spawn: { x: W / 2, y: H - 90 },
    gems: [
      { x: 140, y: 130 },  // top cyan band
      { x: 500, y: 320 },  // middle navy band
      { x: 320, y: 520 },  // bottom tile band
    ],
    obstacles: [],
    paintPads: [],
    seekers: [
      { kind: "horizontal", y: 88, minX: 90, maxX: W - 90, speed: 0.75, coneLen: 360, coneHalf: 0.55, swingSpeed: 0.016, swingAmp: 0.85 },
    ],
  },

  mochi: {
    id: "mochi",
    name: "Mochi",
    flavor: "Pastel Town · hide-and-seek",
    hint: "Crates block the seeker's beam. Duck behind them or paint to blend with the pastel floor.",
    bg: mochiBg,
    seekerSprite: mochiSeeker,
    accent: "#ff5fa8",
    spawn: { x: 80, y: H - 80 },
    gems: [
      { x: 110, y: 140 },  // top alley left
      { x: 530, y: 140 },  // top alley right
      { x: 320, y: 540 },  // bottom alley center
    ],
    obstacles: [
      { x: 110, y: 290, w: 80, h: 60 },
      { x: 280, y: 290, w: 80, h: 60 },
      { x: 450, y: 290, w: 80, h: 60 },
    ],
    paintPads: [],
    seekers: [
      { kind: "circle", cx: W / 2, cy: H / 2, radius: 180, speed: 0.01, coneLen: 300, coneHalf: 0.5 },
    ],
  },

  hexx: {
    id: "hexx",
    name: "Hexx",
    flavor: "Arcade Alley · neon punks",
    hint: "Two drones patrol. Stand on a glowing pad to paint twice as fast.",
    bg: hexxBg,
    seekerSprite: hexxSeeker,
    accent: "#fb923c",
    spawn: { x: W / 2, y: H - 80 },
    gems: [
      { x: 120, y: 200 },
      { x: 520, y: 240 },
      { x: 320, y: 500 },
    ],
    obstacles: [],
    paintPads: [
      { x: 60,  y: 380, w: 110, h: 90 },
      { x: 460, y: 90,  w: 110, h: 90 },
    ],
    seekers: [
      { kind: "horizontal", y: 90,  minX: 90, maxX: W - 90, speed: 1.0, coneLen: 320, coneHalf: 0.45, swingSpeed: 0.022, swingAmp: 0.7, phase: 0 },
      { kind: "horizontal", y: 320, minX: 90, maxX: W - 90, speed: 1.0, coneLen: 320, coneHalf: 0.45, swingSpeed: 0.022, swingAmp: 0.7, phase: Math.PI },
    ],
  },
};
