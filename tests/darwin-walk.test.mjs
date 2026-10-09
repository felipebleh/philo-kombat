import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const meshSource = await readFile(new URL("../app/darwin-walk-mesh.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(meshSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText;
const { darwinWalkVertex: vertex, DARWIN_WALK_DURATION: duration } =
  await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

test("walk returns to the original pose at either end of a cycle", () => {
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

test("head stays rigid and the feet alternate rather than scaling the figure", () => {
  for (let time = 0; time < duration; time += 11) {
    for (const x of [.40, .48, .55]) {
      assert.deepEqual(vertex(x, .15, time, false), [x, .15]);
    }
  }
  const left = vertex(.25, .87, duration / 4, false);
  const right = vertex(.75, .87, duration / 4, false);
  assert.ok(left[0] > .25 && right[0] < .75);
  assert.ok(left[1] < .87 && right[1] === .87);
  const reverseLeft = vertex(.25, .87, duration / 4, true);
  assert.ok(reverseLeft[0] < .25 && reverseLeft[1] === .87);
});

test("mesh never folds over or tears throughout the stride", () => {
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

test("walking and attacks retain the approved high-resolution source images", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const component = await readFile(new URL("../app/fighter-walk.tsx", import.meta.url), "utf8");
  assert.match(component, /darwin-fullbody-hq\.webp\?v=3\.8\.1/);
  assert.match(component, /canvas\.width = art\.naturalWidth/);
  assert.match(component, /canvas\.height = art\.naturalHeight/);
  for (const move of ["punch", "kick", "combo"]) {
    assert.ok(css.includes(`/game/darwin-${move}-hq.webp?v=3.8.1`));
  }
  assert.ok(!css.includes("darwin-walk-spritesheet"));
});
