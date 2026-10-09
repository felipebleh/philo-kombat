import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import { webpMetadata } from "./webp-metadata.mjs";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../app/wittgenstein.css", import.meta.url), "utf8");
const assets = await readFile(new URL("../app/fighter-assets.ts", import.meta.url), "utf8");
const source = await readFile(new URL("../app/wittgenstein-walk-mesh.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { wittgensteinWalkVertex: vertex, WITTGENSTEIN_WALK_DURATION: duration } =
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

test("Wittgenstein has five complete moves and two opponent-bound specials", () => {
  const moves = pageConstant("WITTGENSTEIN_MOVES");
  assert.deepEqual(Object.keys(moves), ["dialetica", "caverna", "ideias", "especial", "transcender"]);
  assert.equal(moves.especial.label, "O Atiçador de Cambridge");
  assert.equal(moves.especial.action, "special-poker");
  assert.equal(moves.transcender.label, "Limites da Linguagem");
  assert.equal(moves.transcender.action, "special-language-limits");
  for (const move of Object.values(moves)) assert.ok(move.damage > 0 && move.cooldown > 0);
  const effect = pageConstant("specialEffect");
  assert.equal(effect("wittgenstein", "especial"), "wittgenstein-poker");
  assert.equal(effect("wittgenstein", "transcender"), "wittgenstein-language");
  assert.ok(pageConstant("usesExtendedSpecialTiming")("wittgenstein"));
});

test("Wittgenstein remains in the expanded roster", () => {
  const order = pageConstant("FIGHTER_ORDER");
  assert.equal(new Set(order).size, order.length);
  assert.ok(order.includes("wittgenstein"));
  assert.equal(pageConstant("FIGHTER_GRID_COLUMNS"), 7);
});

test("the articulated walk preserves his face, hands, torso and poker", () => {
  for (const retreat of [false, true]) {
    for (const time of [0, duration]) {
      for (let y = 0; y <= 1; y += .05) for (let x = 0; x <= 1; x += .05) {
        const [movedX, movedY] = vertex(x, y, time, retreat);
        assert.ok(Math.abs(movedX - x) < 1e-10 && Math.abs(movedY - y) < 1e-10);
      }
    }
    for (let time = 0; time < duration; time += 11) {
      for (const x of [.15,.32,.50,.68,.85]) for (const y of [.04,.16,.28,.40,.52]) {
        assert.deepEqual(vertex(x, y, time, retreat), [x,y]);
      }
    }
    const quarter = duration / 4;
    for (const [x,y] of [[.32,.82],[.70,.82],[.34,.94],[.68,.94]]) {
      const [movedX,movedY] = vertex(x,y,quarter,retreat);
      assert.ok(Math.hypot(movedX-x,movedY-y) > .0008);
    }
    for (let time = 0; time < duration; time += 17) {
      for (let y = 0; y <= 1; y += .05) for (let x = 0; x <= 1; x += .05) {
        const [movedX,movedY] = vertex(x,y,time,retreat);
        assert.ok(Math.hypot(movedX-x,movedY-y) < .025, "No rubber-like stretching");
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

test("all four poses share one transparent high-resolution canvas", async () => {
  for (const name of ["fullbody-hq","punch-hq","kick-hq","poker-hq"]) {
    const path = `wittgenstein-${name}.webp`;
    const webp = await readFile(new URL(`../public/game/${path}`, import.meta.url));
    assert.deepEqual(webpMetadata(webp), { width: 1400, height: 1536, hasAlpha: true });
    assert.ok(assets.includes(`/game/${path}?v=4.4`));
    assert.ok(css.includes(`/game/${path}?v=4.4`));
  }
  assert.match(css, /aspect-ratio: 175 \/ 192/);
  assert.match(css, /inset: auto auto 0 50%/);
  assert.match(css, /width: auto/);
  assert.match(css, /height: 100%/);
});

test("both effects land at the opponent while only one Wittgenstein is drawn", () => {
  assert.match(page, /wittgensteinTarget = wittgensteinEffectFromPlayer \? enemyPosition : playerPosition/);
  assert.match(page, /"--wittgenstein-target": `\$\{wittgensteinTarget\}%`/);
  assert.match(css, /left: var\(--wittgenstein-target\)/);
  assert.match(page, /selectedFighter !== "wittgenstein"/);
  assert.match(page, /opponentFighter !== "wittgenstein"/);
  assert.equal((page.match(/className="wittgenstein-poker-line"/g) ?? []).length, 1);
});
