import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import { webpMetadata } from "./webp-metadata.mjs";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../app/beauvoir.css", import.meta.url), "utf8");
const assets = await readFile(new URL("../app/fighter-assets.ts", import.meta.url), "utf8");
const source = await readFile(new URL("../app/beauvoir-walk-mesh.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { beauvoirWalkVertex: vertex, BEAUVOIR_WALK_DURATION: duration } =
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

test("Beauvoir has five playable moves and both requested specials", () => {
  const moves = pageConstant("BEAUVOIR_MOVES");
  assert.deepEqual(Object.keys(moves), ["dialetica", "caverna", "ideias", "especial", "transcender"]);
  assert.equal(moves.especial.label, "O Outro");
  assert.equal(moves.especial.action, "special-beauvoir-other");
  assert.equal(moves.transcender.label, "Tornar-se");
  assert.equal(moves.transcender.action, "special-becoming");
  for (const move of Object.values(moves)) assert.ok(move.damage > 0 && move.cooldown > 0);
  const effect = pageConstant("specialEffect");
  assert.equal(effect("beauvoir", "especial"), "beauvoir-other");
  assert.equal(effect("beauvoir", "transcender"), "beauvoir-becoming");
  assert.ok(pageConstant("usesExtendedSpecialTiming")("beauvoir"));
});

test("the central roster remains keyboard-navigable", () => {
  const order = pageConstant("FIGHTER_ORDER");
  assert.equal(new Set(order).size, order.length);
  assert.ok(order.includes("beauvoir"));
  assert.equal(pageConstant("FIGHTER_GRID_COLUMNS"), 7);
  assert.match(page, /"beauvoir:olympe"/);
});

test("walking preserves size, face and a continuous native-resolution mesh", () => {
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

test("combat poses share one canvas and no pose changes Beauvoir's scale", async () => {
  for (const name of ["guard-frame","punch-hq","kick-hq","combo-hq"]) {
    const path = `beauvoir-${name}-clean-v2.webp`;
    const webp = await readFile(new URL(`../public/game/${path}`, import.meta.url));
    assert.deepEqual(webpMetadata(webp), { width: 2048, height: 1536, hasAlpha: true });
    assert.ok(assets.includes(`/game/${path}`));
    assert.ok(css.includes(`/game/${path}`));
  }
  assert.match(css, /aspect-ratio: 4 \/ 3/);
  for (const line of css.split("\n").filter(line => /^@keyframes beauvoir-(idle|jab|kick|combo|becoming-poses)/.test(line))) {
    assert.ok(!line.includes("scale(1."), "No pose-dependent body growth");
  }
});

test("Beauvoir's special effects use the committed opponent position", async () => {
  const effects = await readFile(new URL("../app/beauvoir-effects.tsx", import.meta.url), "utf8");
  assert.match(page, /<BeauvoirEffects\b[^>]+contact=\{beauvoirImpact\}/);
  assert.match(page, /beauvoirContact\("player",moveName,current\.playerPosition,current\.enemyPosition\)/);
  assert.match(page, /beauvoirContact\("enemy",moveName,current\.enemyPosition,impactPosition\)/);
  assert.match(effects, /x=hit\.position\*w\/100/);
});
