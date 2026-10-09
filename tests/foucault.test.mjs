import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import { webpMetadata } from "./webp-metadata.mjs";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../app/foucault.css", import.meta.url), "utf8");
const assets = await readFile(new URL("../app/fighter-assets.ts", import.meta.url), "utf8");
const source = await readFile(new URL("../app/foucault-walk-mesh.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { foucaultWalkVertex: vertex, FOUCAULT_WALK_DURATION: duration } =
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

test("Foucault has five moves and the two target-bound specials", () => {
  const moves = pageConstant("FOUCAULT_MOVES");
  assert.deepEqual(Object.keys(moves), ["dialetica", "caverna", "ideias", "especial", "transcender"]);
  assert.equal(moves.especial.label, "Panóptico");
  assert.equal(moves.especial.action, "special-panopticon");
  assert.equal(moves.transcender.label, "Biopoder");
  assert.equal(moves.transcender.action, "special-biopower");
  for (const move of Object.values(moves)) assert.ok(move.damage > 0 && move.cooldown > 0);
  const effect = pageConstant("specialEffect");
  assert.equal(effect("foucault", "especial"), "foucault-panopticon");
  assert.equal(effect("foucault", "transcender"), "foucault-biopower");
  assert.ok(pageConstant("usesExtendedSpecialTiming")("foucault"));
});

test("Foucault remains in the balanced expanded roster", () => {
  const order = pageConstant("FIGHTER_ORDER");
  assert.equal(new Set(order).size, order.length);
  assert.ok(order.includes("foucault"));
  assert.equal(pageConstant("FIGHTER_GRID_COLUMNS"), 7);
  assert.match(page, /"foucault:freud"/);
});

test("walking preserves the face, original size and mesh continuity", () => {
  for (const retreat of [false, true]) {
    for (const time of [0, duration]) {
      for (let y = 0; y <= 1; y += .05) for (let x = 0; x <= 1; x += .05) {
        const point = vertex(x, y, time, retreat);
        assert.ok(Math.abs(point[0] - x) < 1e-10 && Math.abs(point[1] - y) < 1e-10);
      }
    }
    for (let time = 0; time < duration; time += 11) {
      for (const x of [.40,.46,.52,.58]) for (const y of [.04,.10,.16,.22]) {
        assert.deepEqual(vertex(x, y, time, retreat), [x,y]);
      }
    }
    const area = (a,b,c) => (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
    for (let time = 0; time < duration; time += 22) for (let row = 0; row < 48; row++) for (let col = 0; col < 32; col++) {
      const a=vertex(col/32,row/48,time,retreat), b=vertex((col+1)/32,row/48,time,retreat);
      const c=vertex(col/32,(row+1)/48,time,retreat), d=vertex((col+1)/32,(row+1)/48,time,retreat);
      assert.ok(area(a,b,c)>0 && area(b,d,c)>0);
    }
  }
});

test("all action poses use one high-resolution canvas without body scaling", async () => {
  for (const name of ["guard-frame","punch-hq","kick-hq","combo-hq"]) {
    const path = `foucault-${name}.webp`;
    const webp = await readFile(new URL(`../public/game/${path}`, import.meta.url));
    assert.deepEqual(webpMetadata(webp), { width: 2048, height: 1536, hasAlpha: true });
    assert.ok(assets.includes(`/game/${path}?v=4.2`));
    assert.ok(css.includes(`/game/${path}?v=4.2`));
  }
  assert.match(css, /aspect-ratio: 4 \/ 3/);
  assert.match(css, /inset: auto auto 0 50%/);
  assert.match(css, /width: auto/);
  assert.match(css, /height: 100%/);
  for (const line of css.split("\n").filter(line => /^@keyframes foucault-(idle|jab|kick|combo)/.test(line))) {
    assert.ok(!line.includes("scale(1."), "No pose-dependent body growth");
  }
});

test("Panóptico and Biopoder resolve exactly on the opponent", () => {
  assert.match(page, /foucaultTarget = foucaultEffectFromPlayer \? enemyPosition : playerPosition/);
  assert.match(page, /"--foucault-target": `\$\{foucaultTarget\}%`/);
  assert.match(css, /left: var\(--foucault-target\)/);
  assert.match(css, /0%,76%\{opacity:0/);
  assert.match(css, /79%\{opacity:1/);
  assert.match(page, /selectedFighter !== "foucault"/);
  assert.match(page, /opponentFighter !== "foucault"/);
});
