import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import { webpMetadata } from "./webp-metadata.mjs";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../app/arendt.css", import.meta.url), "utf8");
const assets = await readFile(new URL("../app/fighter-assets.ts", import.meta.url), "utf8");
const source = await readFile(new URL("../app/arendt-walk-mesh.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { arendtWalkVertex: vertex, ARENDT_WALK_DURATION: duration } =
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

test("Arendt has five moves and both opponent-bound specials", () => {
  const moves = pageConstant("ARENDT_MOVES");
  assert.deepEqual(Object.keys(moves), ["dialetica", "caverna", "ideias", "especial", "transcender"]);
  assert.equal(moves.especial.label, "Banalidade do Mal");
  assert.equal(moves.especial.action, "special-banality");
  assert.equal(moves.transcender.label, "Natalidade");
  assert.equal(moves.transcender.action, "special-natality");
  for (const move of Object.values(moves)) assert.ok(move.damage > 0 && move.cooldown > 0);
  const effect = pageConstant("specialEffect");
  assert.equal(effect("arendt", "especial"), "arendt-banality");
  assert.equal(effect("arendt", "transcender"), "arendt-natality");
  assert.ok(pageConstant("usesExtendedSpecialTiming")("arendt"));
});

test("Arendt remains in the unique central roster", () => {
  const order = pageConstant("FIGHTER_ORDER");
  assert.equal(new Set(order).size, order.length);
  assert.ok(order.includes("arendt"));
  assert.equal(pageConstant("FIGHTER_GRID_COLUMNS"), 7);
  assert.match(page, /"arendt:foucault"/);
});

test("restrained walking preserves the full upper body and mesh continuity", () => {
  for (const retreat of [false, true]) {
    for (const time of [0, duration]) {
      for (let y = 0; y <= 1; y += .05) for (let x = 0; x <= 1; x += .05) {
        const point = vertex(x, y, time, retreat);
        assert.ok(Math.abs(point[0] - x) < 1e-10 && Math.abs(point[1] - y) < 1e-10);
      }
    }
    for (let time = 0; time < duration; time += 11) {
      for (const x of [.18,.34,.50,.66,.82]) for (const y of [.04,.16,.28,.40,.52]) {
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
        assert.ok(Math.hypot(movedX-x,movedY-y) < .022, "No rubber-like stretching");
      }
    }
    const area = (a,b,c) => (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
    for (let time = 0; time < duration; time += 20) for (let row = 0; row < 48; row++) for (let col = 0; col < 32; col++) {
      const a=vertex(col/32,row/48,time,retreat), b=vertex((col+1)/32,row/48,time,retreat);
      const c=vertex(col/32,(row+1)/48,time,retreat), d=vertex((col+1)/32,(row+1)/48,time,retreat);
      assert.ok(area(a,b,c)>0 && area(b,d,c)>0);
    }
    let previous = vertex(.38,.71,0,retreat);
    for (let time = 8; time <= duration; time += 8) {
      const current = vertex(.38,.71,time,retreat);
      assert.ok(Math.hypot(current[0]-previous[0],current[1]-previous[1]) < .003);
      previous = current;
    }
  }
});

test("all action poses use one high-resolution canvas without body scaling", async () => {
  for (const name of ["guard-frame","punch-hq","kick-hq","combo-hq"]) {
    const path = `arendt-${name}.webp`;
    const webp = await readFile(new URL(`../public/game/${path}`, import.meta.url));
    assert.deepEqual(webpMetadata(webp), { width: 2048, height: 1536, hasAlpha: true });
    assert.ok(assets.includes(`/game/${path}?v=4.3`));
    assert.ok(css.includes(`/game/${path}?v=4.3`));
  }
  assert.match(css, /aspect-ratio: 4 \/ 3/);
  assert.match(css, /inset: auto auto 0 50%/);
  assert.match(css, /width: auto/);
  assert.match(css, /height: 100%/);
  for (const line of css.split("\n").filter(line => /^@keyframes arendt-(idle|jab|kick|combo)/.test(line))) {
    assert.ok(!line.includes("scale(1."), "No pose-dependent body growth");
  }
});

test("the sprite keeps the same centered anchor in every state", () => {
  assert.match(page, /setPlayerPosition\(18\)/);
  assert.match(css, /\.fighter-player\.fighter-arendt \.fighter-sprite \{ transform: translateX\(-50%\); \}/);
  assert.match(css, /\.fighter-enemy\.fighter-arendt \.fighter-sprite \{ transform: translateX\(-50%\) scaleX\(-1\); \}/);
  const playerIdle = css.match(/@keyframes arendt-idle-player \{([\s\S]*?)\n\}/)?.[1] ?? "";
  const enemyIdle = css.match(/@keyframes arendt-idle-enemy \{([\s\S]*?)\n\}/)?.[1] ?? "";
  assert.match(playerIdle, /translateX\(-50%\)/);
  assert.match(enemyIdle, /translateX\(-50%\) scaleX\(-1\)/);
});

test("the stamp lands once on the opponent and leaves the exact word MAL", () => {
  assert.match(page, /arendtTarget = arendtEffectFromPlayer \? enemyPosition : playerPosition/);
  assert.match(page, /"--arendt-target": `\$\{arendtTarget\}%`/);
  assert.equal((page.match(/className="arendt-mal-mark">MAL</g) ?? []).length, 1);
  assert.match(css, /left: var\(--arendt-target\)/);
  assert.match(css, /0%,78%\{opacity:0/);
  assert.match(css, /79%\{opacity:1/);
  assert.match(page, /selectedFighter !== "arendt"/);
  assert.match(page, /opponentFighter !== "arendt"/);
});
