import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const meshSource = await readFile(new URL("../app/olympe-walk-mesh.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(meshSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText;
const { olympeWalkVertex: vertex, OLYMPE_WALK_DURATION: duration } =
  await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

test("Olympe starts and ends the walk at the original scale and pose", () => {
  for (const retreat of [false, true]) {
    for (const time of [0, duration]) {
      for (let y = 0; y <= 1; y += .05) {
        for (let x = 0; x <= 1; x += .05) {
          const point = vertex(x, y, time, retreat);
          assert.ok(Math.abs(point[0] - x) < 1e-10);
          assert.ok(Math.abs(point[1] - y) < 1e-10);
        }
      }
    }
  }
});

test("Olympe's face and hair are rigid in every walking phase", () => {
  for (const retreat of [false, true]) {
    for (let time = 0; time < duration; time += 11) {
      for (const x of [.36, .40, .48, .55, .59]) {
        for (const y of [.02, .08, .14, .20, .23]) {
          assert.deepEqual(vertex(x, y, time, retreat), [x, y]);
        }
      }
    }
  }
});

test("boots alternate their stride and lift; retreat reverses the movement", () => {
  const left = vertex(.16, .90, duration / 4, false);
  const right = vertex(.86, .95, duration / 4, false);
  assert.ok(left[0] > .16 && right[0] < .86);
  assert.ok(left[1] < .90 && right[1] === .95);
  const reverseLeft = vertex(.16, .90, duration / 4, true);
  const reverseRight = vertex(.86, .95, duration / 4, true);
  assert.ok(reverseLeft[0] < .16 && reverseLeft[1] === .90);
  assert.ok(reverseRight[0] > .86 && reverseRight[1] < .95);
});

test("skirt and both guarded props move without moving the face", () => {
  const time = duration / 8;
  for (const [x, y] of [[.72, .65], [.14, .21], [.80, .36]]) {
    assert.notDeepEqual(vertex(x, y, time, false), [x, y]);
  }
});

test("Olympe's mesh stays continuous with no inverted triangles", () => {
  const area = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) -
    (b[1] - a[1]) * (c[0] - a[0]);
  for (const retreat of [false, true]) {
    for (let time = 0; time < duration; time += 22) {
      for (let row = 0; row < 48; row++) {
        for (let column = 0; column < 32; column++) {
          const a = vertex(column / 32, row / 48, time, retreat);
          const b = vertex((column + 1) / 32, row / 48, time, retreat);
          const c = vertex(column / 32, (row + 1) / 48, time, retreat);
          const d = vertex((column + 1) / 32, (row + 1) / 48, time, retreat);
          assert.ok(area(a, b, c) > 0);
          assert.ok(area(b, d, c) > 0);
        }
      }
    }
  }
});

test("the HQ art, attack images and arena remain unchanged; both sides use the rig", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const component = await readFile(new URL("../app/fighter-walk.tsx", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(component, /olympe-fullbody-hq\.webp\?v=3\.9/);
  assert.match(component, /canvas\.width = art\.naturalWidth/);
  assert.match(component, /canvas\.height = art\.naturalHeight/);
  for (const move of ["punch", "kick", "combo"]) {
    assert.ok(css.includes(`/game/olympe-${move}-hq.webp?v=3.9`));
  }
  assert.ok(css.includes("/game/arena-revolution-francaise.webp?v=3.9"));
  assert.ok(page.includes('<FighterWalk fighter={selectedFighter}'));
  assert.ok(page.includes('<FighterWalk fighter={opponentFighter}'));
  assert.match(page, /fighter === "olympe" \? OLYMPE_WALK_DURATION/);
  assert.match(css, new RegExp(`transition: left ${duration}ms linear`));
});
