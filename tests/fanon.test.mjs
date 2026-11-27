import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import { webpMetadata } from "./webp-metadata.mjs";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../app/fanon.css", import.meta.url), "utf8");
const assets = await readFile(new URL("../app/fighter-assets.ts", import.meta.url), "utf8");
const walk = await readFile(new URL("../app/fighter-walk.tsx", import.meta.url), "utf8");
const source = await readFile(new URL("../app/fanon-walk-mesh.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { fanonWalkVertex: vertex, FANON_WALK_DURATION: duration } =
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

test("Fanon has five complete moves and two opponent-bound specials", () => {
  const moves = pageConstant("FANON_MOVES");
  assert.deepEqual(Object.keys(moves), ["dialetica", "caverna", "ideias", "especial", "transcender"]);
  assert.equal(moves.especial.label, "Pele Negra, Máscaras Brancas");
  assert.equal(moves.especial.action, "special-black-skin-white-masks");
  assert.equal(moves.transcender.label, "Os Condenados da Terra");
  assert.equal(moves.transcender.action, "special-wretched-earth");
  for (const move of Object.values(moves)) assert.ok(move.damage > 0 && move.cooldown > 0);
  const effect = pageConstant("specialEffect");
  assert.equal(effect("fanon", "especial"), "fanon-mask");
  assert.equal(effect("fanon", "transcender"), "fanon-condemned");
  assert.ok(pageConstant("usesExtendedSpecialTiming")("fanon"));
});

test("Fanon remains in the unique central roster", () => {
  const order = pageConstant("FIGHTER_ORDER");
  assert.equal(new Set(order).size, order.length);
  assert.ok(order.includes("fanon"));
  assert.equal(pageConstant("FIGHTER_GRID_COLUMNS"), 7);
});

test("the articulated stride keeps Fanon's face, mask, hands and torso stable", () => {
  for (const retreat of [false, true]) {
    for (const time of [0, duration]) {
      for (let y = 0; y <= 1; y += .05) for (let x = 0; x <= 1; x += .05) {
        const [movedX, movedY] = vertex(x, y, time, retreat);
        assert.ok(Math.abs(movedX - x) < 1e-10 && Math.abs(movedY - y) < 1e-10);
      }
    }
    for (let time = 0; time < duration; time += 13) {
      for (const x of [.24,.42,.60,.78]) for (const y of [.05,.15,.25,.35,.42]) {
        assert.deepEqual(vertex(x, y, time, retreat), [x,y]);
      }
    }
    const left = vertex(.32,.90,duration / 4,retreat);
    const right = vertex(.70,.90,duration / 4,retreat);
    assert.ok(Math.abs(left[0] - .32) > .006);
    assert.ok(Math.abs(right[0] - .70) > .006);
    assert.notEqual(Math.sign(left[0] - .32), Math.sign(right[0] - .70));

    for (let time = 0; time < duration; time += 17) {
      for (let y = 0; y <= 1; y += .05) for (let x = 0; x <= 1; x += .05) {
        const [movedX,movedY] = vertex(x,y,time,retreat);
        assert.ok(Math.hypot(movedX-x,movedY-y) < .031, "No rubber-like stretching");
      }
    }
    const area = (a,b,c) => (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
    for (let time = 0; time < duration; time += 24) for (let row = 0; row < 48; row++) for (let col = 0; col < 32; col++) {
      const a=vertex(col/32,row/48,time,retreat), b=vertex((col+1)/32,row/48,time,retreat);
      const c=vertex(col/32,(row+1)/48,time,retreat), d=vertex((col+1)/32,(row+1)/48,time,retreat);
      assert.ok(area(a,b,c)>0 && area(b,d,c)>0);
    }
  }
});

test("all five Fanon poses share one transparent high-resolution canvas and fixed scale", async () => {
  for (const name of ["fullbody-hq","punch-hq","kick-hq","combo-hq","victory-hq"]) {
    const path = `fanon-${name}.webp`;
    const webp = await readFile(new URL(`../public/game/${path}`, import.meta.url));
    assert.deepEqual(webpMetadata(webp), { width: 1400, height: 1536, hasAlpha: true });
    assert.ok(assets.includes(`/game/${path}?v=4.7`));
    assert.ok(css.includes(`/game/${path}?v=4.7`));
  }
  assert.match(css, /aspect-ratio:175 \/ 192/);
  assert.match(css, /inset:auto auto 0 50%/);
  assert.match(css, /width:auto/);
  assert.match(css, /height:100%/);
  assert.match(walk, /fanon: \{ src: "\/game\/fanon-fullbody-hq\.webp\?v=4\.7"/);
});

test("the Casbah arena and both special effects keep native detail and transparency", async () => {
  const arena = await readFile(new URL("../public/game/arena-fanon.webp", import.meta.url));
  assert.equal(arena.subarray(0, 4).toString(), "RIFF");
  assert.ok(arena.length > 100_000, "the arena keeps enough detail for the full battle frame");
  for (const name of ["mask-shatter", "condemned-earth"]) {
    const path = `fanon-${name}-hq.webp`;
    const webp = await readFile(new URL(`../public/game/${path}`, import.meta.url));
    assert.deepEqual(webpMetadata(webp), { width: 1672, height: 941, hasAlpha: true });
    assert.ok(assets.includes(`/game/${path}?v=4.7`));
  }
});

test("Fanon's specials use committed contact and victory raises the mask", async () => {
  const effects = await readFile(new URL("../app/fanon-effects.tsx", import.meta.url), "utf8");
  assert.match(page, /<FanonEffects\b[^>]+contact=\{fanonImpact\}/);
  assert.match(page, /fanonContact\("player",moveName,current\.playerPosition,current\.enemyPosition\)/);
  assert.match(page, /fanonContact\("enemy",moveName,current\.enemyPosition,impactPosition\)/);
  assert.match(effects, /x=hit\.position\*w\/100/);
  assert.match(effects, /PELE NEGRA, MÁSCARAS BRANCAS!/);
  assert.match(effects, /OS CONDENADOS DA TERRA!/);
  assert.match(page, /Cada geração deve descobrir sua missão, cumpri-la ou traí-la\./);
  assert.match(page, /fighterVictoryArt\(matchWinner\)/);
  assert.match(css, /\.fighter-fanon\.victory \.fighter-sprite/);
});
