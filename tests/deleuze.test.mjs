import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import { webpMetadata } from "./webp-metadata.mjs";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../app/deleuze.css", import.meta.url), "utf8");
const assets = await readFile(new URL("../app/fighter-assets.ts", import.meta.url), "utf8");
const walk = await readFile(new URL("../app/fighter-walk.tsx", import.meta.url), "utf8");
const source = await readFile(new URL("../app/deleuze-walk-mesh.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { deleuzeWalkVertex: vertex, DELEUZE_WALK_DURATION: duration } =
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

test("Deleuze has five complete moves, a crutch combo and two target-bound specials", () => {
  const moves = pageConstant("DELEUZE_MOVES");
  assert.deepEqual(Object.keys(moves), ["dialetica", "caverna", "ideias", "especial", "transcender"]);
  assert.equal(moves.ideias.label, "Combo — Linha de Fuga");
  assert.equal(moves.especial.label, "Rizoma");
  assert.equal(moves.especial.action, "special-rhizome");
  assert.equal(moves.transcender.label, "Mil Platôs");
  assert.equal(moves.transcender.action, "special-mille-plateaux");
  for (const move of Object.values(moves)) assert.ok(move.damage > 0 && move.cooldown > 0);
  const effect = pageConstant("specialEffect");
  assert.equal(effect("deleuze", "especial"), "deleuze-rhizome");
  assert.equal(effect("deleuze", "transcender"), "deleuze-mille-plateaux");
  assert.ok(pageConstant("usesExtendedSpecialTiming")("deleuze"));
});

test("Deleuze remains in the unique expanded roster", () => {
  const order = pageConstant("FIGHTER_ORDER");
  assert.equal(new Set(order).size, order.length);
  assert.ok(order.includes("deleuze"));
  assert.equal(pageConstant("FIGHTER_GRID_COLUMNS"), 7);
});

test("Deleuze keeps native-resolution transparent art and one stable combat canvas", async () => {
  for (const name of ["fullbody", "punch", "kick", "combo", "victory"]) {
    const path = `deleuze-${name}-hq.webp`;
    const webp = await readFile(new URL(`../public/game/${path}`, import.meta.url));
    assert.deepEqual(webpMetadata(webp), { width: 1400, height: 1536, hasAlpha: true });
    assert.ok(assets.includes(`/game/${path}?v=4.12`));
    assert.ok(css.includes(`/game/${path}?v=4.12`));
  }
  const guattari = await readFile(new URL("../public/game/guattari-assist-hq.webp", import.meta.url));
  assert.deepEqual(webpMetadata(guattari), { width: 1400, height: 1536, hasAlpha: true });
  assert.match(css, /aspect-ratio:175 \/ 192/);
  assert.match(css, /height:100%/);
  assert.match(walk, /deleuze: \{ src: "\/game\/deleuze-fullbody-hq\.webp\?v=4\.12"/);
});

test("the articulated crutch stride never changes scale or folds the mesh", () => {
  const area = (a,b,c) => (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  for (const retreat of [false, true]) {
    for (const time of [0, duration]) {
      for (let y = 0; y <= 1; y += .05) for (let x = 0; x <= 1; x += .05) {
        const [movedX, movedY] = vertex(x, y, time, retreat);
        assert.ok(Math.abs(movedX - x) < 1e-10 && Math.abs(movedY - y) < 1e-10);
      }
    }
    for (let time = 0; time < duration; time += 17) {
      for (let y = 0; y <= 1; y += .05) for (let x = 0; x <= 1; x += .05) {
        const [movedX,movedY] = vertex(x,y,time,retreat);
        assert.ok(Math.hypot(movedX-x,movedY-y) < .027);
      }
    }
    for (let time = 0; time < duration; time += 25) for (let row = 0; row < 48; row++) for (let col = 0; col < 32; col++) {
      const a=vertex(col/32,row/48,time,retreat), b=vertex((col+1)/32,row/48,time,retreat);
      const c=vertex(col/32,(row+1)/48,time,retreat), d=vertex((col+1)/32,(row+1)/48,time,retreat);
      assert.ok(area(a,b,c)>0 && area(b,d,c)>0);
    }
  }
});

test("Rizoma and Guattari converge on the opponent from either side", async () => {
  const effects = await readFile(new URL("../app/deleuze-effects.tsx", import.meta.url), "utf8");
  const assist = await readFile(new URL("../app/deleuze-guattari.tsx", import.meta.url), "utf8");
  assert.match(page, /<DeleuzeEffects\b[^>]+contact=\{deleuzeImpact\}/);
  assert.match(page, /deleuzeContact\("player",moveName,current\.playerPosition,current\.enemyPosition\)/);
  assert.match(page, /deleuzeContact\("enemy",moveName,current\.enemyPosition,impactPosition\)/);
  assert.match(effects, /x=hit\.position\*w\/100/);
  assert.match(page, /<DeleuzeGuattari origin=\{playerPosition\} target=\{enemyPosition\}/);
  assert.match(page, /<DeleuzeGuattari origin=\{enemyPosition\} target=\{playerPosition\}/);
  assert.match(assist, /src="\/game\/guattari-assist-hq\.webp\?v=4\.12"/);
});
