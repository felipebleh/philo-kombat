import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import { webpMetadata } from "./webp-metadata.mjs";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../app/paulo-freire.css", import.meta.url), "utf8");
const assets = await readFile(new URL("../app/fighter-assets.ts", import.meta.url), "utf8");
const walk = await readFile(new URL("../app/fighter-walk.tsx", import.meta.url), "utf8");
const source = await readFile(new URL("../app/paulo-freire-walk-mesh.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { pauloFreireWalkVertex: vertex, PAULO_FREIRE_WALK_DURATION: duration } =
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

test("Paulo Freire has five complete moves and two opponent-bound specials", () => {
  const moves = pageConstant("PAULO_FREIRE_MOVES");
  assert.deepEqual(Object.keys(moves), ["dialetica", "caverna", "ideias", "especial", "transcender"]);
  assert.equal(moves.especial.label, "Educação Bancária");
  assert.equal(moves.especial.action, "special-banking-education");
  assert.equal(moves.transcender.label, "Educação Libertadora");
  assert.equal(moves.transcender.action, "special-liberating-education");
  for (const move of Object.values(moves)) assert.ok(move.damage > 0 && move.cooldown > 0);
  const effect = pageConstant("specialEffect");
  assert.equal(effect("paulo-freire", "especial"), "paulo-banking");
  assert.equal(effect("paulo-freire", "transcender"), "paulo-liberating-book");
  assert.ok(pageConstant("usesExtendedSpecialTiming")("paulo-freire"));
});

test("Paulo Freire remains in the unique expanded roster", () => {
  const order = pageConstant("FIGHTER_ORDER");
  assert.equal(new Set(order).size, order.length);
  assert.ok(order.includes("paulo-freire"));
  assert.equal(pageConstant("FIGHTER_GRID_COLUMNS"), 7);
});

test("the articulated stride keeps his face, glasses, torso and book rigid", () => {
  for (const retreat of [false, true]) {
    for (const time of [0, duration]) {
      for (let y = 0; y <= 1; y += .05) for (let x = 0; x <= 1; x += .05) {
        const [movedX, movedY] = vertex(x, y, time, retreat);
        assert.ok(Math.abs(movedX - x) < 1e-10 && Math.abs(movedY - y) < 1e-10);
      }
    }
    for (let time = 0; time < duration; time += 13) {
      for (const x of [.34,.48,.62]) for (const y of [.04,.12,.20]) {
        assert.deepEqual(vertex(x, y, time, retreat), [x,y]);
      }
      for (const y of [.30,.40,.52]) assert.deepEqual(vertex(.45, y, time, retreat), [.45,y]);
    }
    const first = vertex(.32,.88,duration / 4,retreat);
    const opposite = vertex(.70,.88,duration / 4,retreat);
    assert.ok(Math.abs(first[0] - .32) > .006);
    assert.ok(Math.abs(opposite[0] - .70) > .006);
    assert.notEqual(Math.sign(first[0] - .32), Math.sign(opposite[0] - .70));

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

test("all five poses share one transparent high-resolution canvas and fixed scale", async () => {
  for (const name of ["fullbody-hq","punch-hq","kick-hq","combo-hq","victory-hq"]) {
    const path = `paulo-freire-${name}.webp`;
    const webp = await readFile(new URL(`../public/game/${path}`, import.meta.url));
    assert.deepEqual(webpMetadata(webp), { width: 1400, height: 1536, hasAlpha: true });
    assert.ok(assets.includes(`/game/${path}?v=4.6`));
    assert.ok(css.includes(`/game/${path}?v=4.6`));
  }
  assert.match(css, /aspect-ratio:175 \/ 192/);
  assert.match(css, /inset:auto auto 0 50%/);
  assert.match(css, /width:auto/);
  assert.match(css, /height:100%/);
  assert.match(walk, /"paulo-freire": \{ src: "\/game\/paulo-freire-fullbody-hq\.webp\?v=4\.6"/);
});

test("Freire's classroom and special effects use the committed opponent position", async () => {
  const arena = await readFile(new URL("../public/game/arena-paulo-freire.webp", import.meta.url));
  assert.equal(arena.subarray(0, 4).toString(), "RIFF");
  assert.ok(arena.length > 100_000);
  const effects = await readFile(new URL("../app/freire-effects.tsx", import.meta.url), "utf8");
  assert.match(page, /<FreireEffects\b[^>]+contact=\{freireImpact\}/);
  assert.match(page, /freireContact\("player",moveName,current\.playerPosition,current\.enemyPosition\)/);
  assert.match(page, /freireContact\("enemy",moveName,current\.enemyPosition,impactPosition\)/);
  assert.match(effects, /x=hit\.position\*w\/100/);
  assert.match(page, /A leitura do mundo precede a leitura da palavra\./);
  assert.match(page, /fighterVictoryArt\(matchWinner\)/);
  assert.match(css, /\.fighter-paulo-freire\.victory \.fighter-sprite/);
  assert.match(effects, /EDUCAÇÃO BANCÁRIA!/);
  assert.match(effects, /EDUCAÇÃO LIBERTADORA!/);
});
