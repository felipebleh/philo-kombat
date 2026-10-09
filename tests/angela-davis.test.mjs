import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import { webpMetadata } from "./webp-metadata.mjs";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../app/angela-davis.css", import.meta.url), "utf8");
const assets = await readFile(new URL("../app/fighter-assets.ts", import.meta.url), "utf8");
const walk = await readFile(new URL("../app/fighter-walk.tsx", import.meta.url), "utf8");
const source = await readFile(new URL("../app/angela-davis-walk-mesh.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { angelaDavisWalkVertex: vertex, ANGELA_DAVIS_WALK_DURATION: duration } =
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

test("Angela Davis has five complete moves and two opponent-bound specials", () => {
  const moves = pageConstant("ANGELA_DAVIS_MOVES");
  assert.deepEqual(Object.keys(moves), ["dialetica", "caverna", "ideias", "especial", "transcender"]);
  assert.equal(moves.especial.label, "Correntes Rompidas");
  assert.equal(moves.especial.action, "special-broken-chains");
  assert.equal(moves.transcender.label, "A Liberdade é uma Luta Constante");
  assert.equal(moves.transcender.action, "special-constant-struggle");
  for (const move of Object.values(moves)) assert.ok(move.damage > 0 && move.cooldown > 0);
  const effect = pageConstant("specialEffect");
  assert.equal(effect("angela-davis", "especial"), "angela-davis-chains");
  assert.equal(effect("angela-davis", "transcender"), "angela-davis-struggle");
  assert.ok(pageConstant("usesExtendedSpecialTiming")("angela-davis"));
});

test("Angela Davis remains in the unique expanded roster", () => {
  const order = pageConstant("FIGHTER_ORDER");
  assert.equal(new Set(order).size, order.length);
  assert.ok(order.includes("angela-davis"));
  assert.equal(pageConstant("FIGHTER_GRID_COLUMNS"), 7);
});

test("the articulated stride alternates planted feet without deforming her face", () => {
  for (const retreat of [false, true]) {
    for (const time of [0, duration]) {
      for (let y = 0; y <= 1; y += .05) for (let x = 0; x <= 1; x += .05) {
        const [movedX, movedY] = vertex(x, y, time, retreat);
        assert.ok(Math.abs(movedX - x) < 1e-10 && Math.abs(movedY - y) < 1e-10);
      }
    }
    for (let time = 0; time < duration; time += 13) {
      for (const x of [.38,.50,.62]) for (const y of [.04,.12,.20]) {
        assert.deepEqual(vertex(x, y, time, retreat), [x,y]);
      }
      for (const y of [.30,.40,.52]) assert.deepEqual(vertex(.50, y, time, retreat), [.50,y]);
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
    const path = `angela-davis-${name}.webp`;
    const webp = await readFile(new URL(`../public/game/${path}`, import.meta.url));
    assert.deepEqual(webpMetadata(webp), { width: 1400, height: 1536, hasAlpha: true });
    assert.ok(assets.includes(`/game/${path}?v=4.5`));
    assert.ok(css.includes(`/game/${path}?v=4.5`));
  }
  assert.match(css, /aspect-ratio: 175 \/ 192/);
  assert.match(css, /inset: auto auto 0 50%/);
  assert.match(css, /width: auto/);
  assert.match(css, /height: 100%/);
  assert.match(walk, /"angela-davis": \{ src: "\/game\/angela-davis-fullbody-hq\.webp\?v=4\.5"/);
});

test("specials target only the opponent and victory uses the raised-fist pose", () => {
  assert.match(page, /angelaDavisTarget = angelaDavisEffectFromPlayer \? enemyPosition : playerPosition/);
  assert.match(page, /"--angela-target": `\$\{angelaDavisTarget\}%`/);
  assert.equal((page.match(/className="angela-broken-chain"/g) ?? []).length, 1);
  assert.equal((page.match(/className=\{`angela-panther/g) ?? []).length, 1);
  assert.match(page, /angela-davis-broken-chain-hq\.webp\?v=4\.5\.1/);
  assert.match(page, /angela-davis-panther-hq\.webp\?v=4\.5\.1/);
  assert.match(css, /left:var\(--angela-target\)/);
  assert.match(css, /translateX\(var\(--angela-travel\)\)/);
  assert.match(page, /fighterVictoryArt\(matchWinner\)/);
  assert.match(css, /\.fighter-angela-davis\.victory \.fighter-sprite/);
  assert.match(page, /selectedFighter !== "angela-davis"/);
  assert.match(page, /opponentFighter !== "angela-davis"/);
});

test("the broken chain and leaping panther are transparent HQ effects", async () => {
  for (const name of ["broken-chain", "panther"]) {
    const path = `angela-davis-${name}-hq.webp`;
    const webp = await readFile(new URL(`../public/game/${path}`, import.meta.url));
    assert.deepEqual(webpMetadata(webp), { width: 1672, height: 941, hasAlpha: true });
    assert.ok(assets.includes(`/game/${path}?v=4.5.1`));
  }
  assert.match(css, /@keyframes angela-chain-break/);
  assert.match(css, /@keyframes angela-panther-leap/);
  assert.match(css, /@keyframes angela-panther-leap-enemy/);
});
