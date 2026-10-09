import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import { webpMetadata } from "./webp-metadata.mjs";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../app/kierkegaard.css", import.meta.url), "utf8");
const assets = await readFile(new URL("../app/fighter-assets.ts", import.meta.url), "utf8");
const source = await readFile(new URL("../app/kierkegaard-walk-mesh.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { kierkegaardWalkVertex: vertex, KIERKEGAARD_WALK_DURATION: duration } =
  await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

function pageConstant(name) {
  const ast = ts.createSourceFile("page.tsx", page, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  for (const statement of ast.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (declaration.name.getText(ast) !== name) continue;
      const js = ts.transpileModule(`const value = ${declaration.initializer.getText(ast)};`, {}).outputText;
      return Function(`${js}; return value;`)();
    }
  }
  throw new Error(`Missing ${name}`);
}

test("Kierkegaard has all five moves, correct special dispatch and a unique roster slot", () => {
  const moves = pageConstant("KIERKEGAARD_MOVES");
  assert.deepEqual(Object.keys(moves), ["dialetica", "caverna", "ideias", "especial", "transcender"]);
  assert.equal(moves.especial.label, "Angústia");
  assert.equal(moves.transcender.label, "Salto da Fé");
  for (const move of Object.values(moves)) assert.ok(move.damage > 0 && move.cooldown > 0);
  const effect = pageConstant("specialEffect");
  assert.equal(effect("kierkegaard", "especial"), "kierkegaard-anxiety");
  assert.equal(effect("kierkegaard", "transcender"), "kierkegaard-faith-leap");
  assert.ok(pageConstant("usesExtendedSpecialTiming")("kierkegaard"));
  const order = pageConstant("FIGHTER_ORDER");
  assert.equal(new Set(order).size, order.length);
  assert.ok(order.includes("kierkegaard"));
  assert.equal(pageConstant("FIGHTER_GRID_COLUMNS"), 7);
});

test("walking returns to its initial pose and holds the face rigid", () => {
  for (const retreat of [false, true]) {
    for (const t of [0, duration]) {
      for (let y = 0; y <= 1; y += .05) {
        for (let x = 0; x <= 1; x += .05) {
          const p = vertex(x, y, t, retreat);
          assert.ok(Math.abs(p[0] - x) < 1e-10 && Math.abs(p[1] - y) < 1e-10);
        }
      }
    }
    for (let t = 0; t < duration; t += 11) {
      for (const x of [.43, .48, .52, .56]) {
        for (const y of [.04, .10, .15, .20]) assert.deepEqual(vertex(x, y, t, retreat), [x, y]);
      }
    }
  }
});

test("feet alternate and reverse for retreat without folding the texture", () => {
  const leftX = (240 + 286) / 1664;
  const rightX = (850 + 286) / 1664;
  assert.ok(vertex(leftX, .9, duration / 4, false)[0] > leftX);
  assert.ok(vertex(rightX, .9, duration / 4, false)[0] < rightX);
  assert.ok(vertex(leftX, .9, duration / 4, true)[0] < leftX);
  const area = (a, b, c) => (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  for (const retreat of [false, true]) {
    for (let t = 0; t < duration; t += 22) {
      for (let row = 0; row < 48; row++) {
        for (let col = 0; col < 32; col++) {
          const a = vertex(col/32, row/48, t, retreat);
          const b = vertex((col+1)/32, row/48, t, retreat);
          const c = vertex(col/32, (row+1)/48, t, retreat);
          const d = vertex((col+1)/32, (row+1)/48, t, retreat);
          assert.ok(area(a,b,c)>0 && area(b,d,c)>0);
        }
      }
    }
  }
});

test("all combat poses use one transparent canvas size and are preloaded", async () => {
  for (const name of ["guard-frame", "punch-hq", "kick-hq", "combo-hq"]) {
    const path = `kierkegaard-${name}.webp`;
    const webp = await readFile(new URL(`../public/game/${path}`, import.meta.url));
    assert.deepEqual(webpMetadata(webp), { width: 1664, height: 1536, hasAlpha: true });
    assert.ok(assets.includes(`/game/${path}?v=4.0`));
    assert.ok(css.includes(`/game/${path}?v=4.0`));
  }
  assert.match(css, /aspect-ratio: 13 \/ 12/);
  for (const line of css.split("\n").filter(line => /^@keyframes kierkegaard-(idle|jab|kick|combo|umbrella|leap-pose)/.test(line))) {
    assert.ok(!line.includes("scale("), "No pose-dependent growth");
  }
});

test("leap targets the opponent on either side with one visible actor", () => {
  assert.match(page, /kierkegaardTarget = kierkegaardEffectFromPlayer \? enemyPosition : playerPosition/);
  assert.match(page, /"--kierkegaard-facing": kierkegaardEffectFromPlayer \? 1 : -1/);
  assert.match(css, /\.effect-kierkegaard-faith-leap \.fighter-kierkegaard \{ visibility: hidden; \}/);
  assert.equal((page.match(/className="kierkegaard-leap-actor"/g) || []).length, 1);
  assert.match(css, /78%,86%\{left:var\(--kierkegaard-landing\);bottom:2\.8%\}/);
  assert.match(page, /selectedFighter !== "kierkegaard"/);
  assert.match(page, /opponentFighter !== "kierkegaard"/);
});
