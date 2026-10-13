import test from "node:test";
import assert from "node:assert/strict";
import {
  createQuest,
  stepQuest,
  questScore,
  onLand,
  patrolPosition,
  SHRINES,
  SPAWN,
  PORTAL,
  DURATION,
  ROCKS,
} from "../src/components/artoy/quest/engine.ts";
const idle = { x: 0, y: 0 };
const start = () => {
  const s = createQuest();
  s.phase = "playing";
  return s;
};
const advance = (s, seconds, fps = 60, direction = idle) => {
  for (let i = 0; i < Math.round(seconds * fps); i++) stepQuest(s, 1 / fps, direction, false);
};

test("only collecting all fragments AND entering the portal completes the quest", () => {
  const s = start();
  s.player = { ...PORTAL };
  stepQuest(s, 1 / 60, idle, false);
  assert.equal(s.phase, "playing");
  for (let i = 0; i < SHRINES.length; i++) {
    s.player = { ...SHRINES[i] };
    stepQuest(s, 1 / 60, idle, false);
    assert.equal(s.fragments[i], true);
    assert.equal(s.phase, "playing");
  }
  s.player = { ...PORTAL };
  stepQuest(s, 1 / 60, idle, false);
  assert.equal(s.phase, "won");
  assert.ok(s.events.includes("won"));
  const score = questScore(s);
  stepQuest(s, 1 / 60, idle, true);
  assert.equal(questScore(s), score);
  assert.equal(s.phase, "won");
});

test("timeout is a loss at 30, 60 and 120 fps, never a passive victory", () => {
  for (const fps of [30, 60, 120]) {
    const s = start();
    advance(s, DURATION + 1, fps);
    assert.equal(s.phase, "lost");
    assert.ok(Math.abs(s.elapsed - DURATION) < 1 / fps + 0.001);
    assert.deepEqual(s.fragments, [false, false, false]);
  }
});

test("ready, pause and terminal screens freeze simulation and timer", () => {
  for (const phase of ["ready", "paused", "won", "lost"]) {
    const s = createQuest();
    s.phase = phase;
    advance(s, 3, 60, { x: 1, y: 0 });
    assert.equal(s.elapsed, 0);
    assert.deepEqual(s.player, SPAWN);
    assert.equal(s.cooldown, 0);
  }
});

test("movement speed is normalized diagonally and consistent across frame rates", () => {
  const travel = [];
  for (const fps of [30, 60, 120]) {
    const s = start();
    advance(s, 0.5, fps, { x: 1, y: 0 });
    travel.push(s.player.x - SPAWN.x);
    assert.ok(Math.abs(travel.at(-1) - 92.5) < 0.001);
  }
  const s = start();
  advance(s, 0.5, 60, { x: 1, y: -1 });
  assert.ok(Math.abs(Math.hypot(s.player.x - SPAWN.x, s.player.y - SPAWN.y) - 92.5) < 0.001);
});

test("dash protects the hero, stuns inklings and cannot bypass its cooldown", () => {
  const s = start();
  s.player = patrolPosition(0, 1 / 60);
  stepQuest(s, 1 / 60, idle, true);
  assert.equal(s.hearts, 3);
  assert.equal(s.stunned[0], 2.5);
  const cooldown = s.cooldown;
  stepQuest(s, 1 / 60, idle, true);
  assert.ok(s.cooldown < cooldown);
  assert.equal(s.events.includes("dash"), false);
});

test("damage has a grace period and losing all hearts ends the quest", () => {
  const s = start();
  for (let hit = 0; hit < 3; hit++) {
    s.invulnerable = 0;
    s.player = patrolPosition(0, s.elapsed + 1 / 60);
    stepQuest(s, 1 / 60, idle, false);
    assert.equal(s.hearts, 2 - hit);
    s.player = patrolPosition(0, s.elapsed + 1 / 60);
    stepQuest(s, 1 / 60, idle, false);
    assert.equal(s.hearts, 2 - hit);
  }
  assert.equal(s.phase, "lost");
});

test("solid rocks and island boundaries stop movement, including a dash", () => {
  const s = start();
  s.player = { x: ROCKS[0].x - ROCKS[0].r - 16, y: ROCKS[0].y };
  for (let i = 0; i < 20; i++) stepQuest(s, 1 / 60, { x: 1, y: 0 }, i === 0);
  assert.ok(onLand(s.player));
  assert.ok(s.player.x < ROCKS[0].x);
  const edge = start();
  advance(edge, 20, 60, { x: -1, y: 0 });
  assert.ok(onLand(edge.player));
  assert.ok(edge.player.x > 0);
});

test("all three fragments and portal are reachable on the authored map", () => {
  const queue = [{ x: SPAWN.x, y: SPAWN.y }];
  const visited = new Set();
  for (let i = 0; i < queue.length; i++) {
    const p = queue[i];
    for (const d of [
      { x: 10, y: 0 },
      { x: -10, y: 0 },
      { x: 0, y: 10 },
      { x: 0, y: -10 },
    ]) {
      const next = { x: p.x + d.x, y: p.y + d.y };
      const key = `${next.x},${next.y}`;
      if (!visited.has(key) && onLand(next)) {
        visited.add(key);
        queue.push(next);
      }
    }
  }
  for (const target of [...SHRINES, PORTAL])
    assert.ok(queue.some((p) => Math.hypot(p.x - target.x, p.y - target.y) < 15));
});

test("restarting clears run state and scores reward actual objectives", () => {
  const s = createQuest();
  assert.equal(questScore(s), 0);
  s.fragments[0] = true;
  s.sparks[0] = true;
  assert.equal(questScore(s), 350);
  assert.equal(questScore(createQuest()), 0);
});

test("fragment progression awakens the world, guardian and capped final escape", () => {
  const s = start();
  for (let i = 0; i < 3; i++) {
    s.player = { ...SHRINES[i] };
    stepQuest(s, 1 / 60, idle, false);
    assert.ok(s.events.includes(["awaken", "guardian", "escape"][i]));
  }
  assert.equal(s.guardian.active, true);
  assert.ok(Math.abs(s.escapeDeadline - s.elapsed - 20) < 0.001);
  assert.ok(s.escapeDeadline <= DURATION);
});

test("guardian locks a warning target before a dodgeable burst and never attacks before awakening", () => {
  const s = start();
  advance(s, 3);
  assert.equal(s.guardian.active, false);
  s.guardian.active = true;
  s.guardian.mode = "stalk";
  s.guardian.timer = 0;
  stepQuest(s, 1 / 60, idle, false);
  assert.equal(s.guardian.mode, "warning");
  const target = { ...s.guardian.target };
  s.player = { x: target.x + 100, y: target.y };
  advance(s, 0.9);
  assert.equal(s.hearts, 3);
  assert.deepEqual(s.guardian.target, target);
  assert.equal(s.guardian.mode, "burst");
});

test("guardian burst causes one hit; a dash shields and stuns the stalking guardian", () => {
  const s = start();
  s.guardian.active = true;
  s.guardian.mode = "warning";
  s.guardian.timer = 1 / 60;
  s.guardian.target = { ...s.player };
  stepQuest(s, 1 / 60, idle, false);
  assert.equal(s.hearts, 2);
  assert.equal(s.hitLeft, 0.3);
  advance(s, 0.2);
  assert.equal(s.hearts, 2);
  const dash = start();
  dash.guardian.active = true;
  dash.guardian.mode = "stalk";
  dash.guardian.timer = 1;
  dash.guardian.position = { ...dash.player };
  stepQuest(dash, 1 / 60, idle, true);
  assert.equal(dash.hearts, 3);
  assert.equal(dash.guardian.mode, "stunned");
  assert.ok(dash.events.includes("stun"));
});

test("final escape expires without granting passive victory and pause freezes guardian warning", () => {
  const s = start();
  s.fragments = [true, true, true];
  s.escapeDeadline = 1;
  s.player = { x: 208, y: 362 };
  advance(s, 1.1);
  assert.equal(s.phase, "lost");
  const p = start();
  p.guardian.active = true;
  p.guardian.mode = "warning";
  p.guardian.timer = 0.9;
  p.phase = "paused";
  advance(p, 4);
  assert.equal(p.guardian.timer, 0.9);
  assert.equal(p.elapsed, 0);
});
