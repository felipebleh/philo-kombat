import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import { webpMetadata } from "./webp-metadata.mjs";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../app/superintelligence.css", import.meta.url), "utf8");
const assets = await readFile(new URL("../app/fighter-assets.ts", import.meta.url), "utf8");
const walk = await readFile(new URL("../app/fighter-walk.tsx", import.meta.url), "utf8");
const source = await readFile(new URL("../app/superintelligence-walk-mesh.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { superintelligenceWalkVertex: vertex, SUPERINTELLIGENCE_WALK_DURATION: duration } =
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

test("the Superintelligence has five algorithmic and electrical moves", () => {
  const moves = pageConstant("SUPERINTELLIGENCE_MOVES");
  assert.deepEqual(Object.keys(moves), ["dialetica", "caverna", "ideias", "especial", "transcender"]);
  assert.equal(moves.dialetica.label, "Pulso Lógico");
  assert.equal(moves.caverna.label, "Arco Voltaico");
  assert.equal(moves.ideias.label, "Combo — Loop Recursivo");
  assert.equal(moves.especial.label, "Algoritmo Supremo");
  assert.equal(moves.transcender.label, "Sobrecarga da Noosfera");
  for (const move of Object.values(moves)) assert.ok(move.damage > 0 && move.cooldown > 0);
  const effect = pageConstant("specialEffect");
  assert.equal(effect("superintelligence", "especial"), "superintelligence-algorithm");
  assert.equal(effect("superintelligence", "transcender"), "superintelligence-noosphere");
  assert.ok(pageConstant("usesExtendedSpecialTiming")("superintelligence"));
});

test("the final boss follows the philosophers and playable teacher in the unique roster", () => {
  const order = pageConstant("FIGHTER_ORDER");
  assert.equal(order.length, 42);
  assert.equal(new Set(order).size, order.length);
  assert.equal(order.at(-1), "superintelligence");
  assert.equal(pageConstant("FIGHTER_GRID_COLUMNS"), 7);
});

test("every robot pose uses the same high-resolution transparent combat canvas", async () => {
  for (const name of ["fullbody", "punch-windup", "punch", "kick", "combo", "special", "victory"]) {
    const path = `superintelligence-${name}-hq.webp`;
    const webp = await readFile(new URL(`../public/game/${path}`, import.meta.url));
    assert.deepEqual(webpMetadata(webp), { width: 1400, height: 1536, hasAlpha: true });
    assert.ok(assets.includes(`/game/${path}?v=5.1`));
    assert.ok(css.includes(`/game/${path}?v=5.1`));
  }
  assert.match(css, /aspect-ratio:175 \/ 192/);
  assert.match(css, /height:100%/);
  assert.match(walk, /superintelligence: \{ src: "\/game\/superintelligence-fullbody-hq\.webp\?v=5\.1"/);
});

test("the punch uses a directional three-frame sequence and mirrored opponent facing", () => {
  assert.match(css, /@keyframes super-punch-poses/);
  assert.match(css, /superintelligence-punch-windup-hq\.webp\?v=5\.1/);
  assert.match(css, /superintelligence-punch-hq\.webp\?v=5\.1/);
  assert.match(css, /fighter-enemy\.fighter-superintelligence \.fighter-sprite \{ transform:translateX\(-50%\) scaleX\(-1\)/);
  assert.match(css, /\.fighter-superintelligence\.attack-punch \{ animation:super-jab 640ms/);
});

test("the robotic stride preserves scale and mesh continuity", () => {
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
        assert.ok(Math.hypot(movedX-x,movedY-y) < .03);
      }
    }
    for (let time = 0; time < duration; time += 25) for (let row = 0; row < 48; row++) for (let col = 0; col < 32; col++) {
      const a=vertex(col/32,row/48,time,retreat), b=vertex((col+1)/32,row/48,time,retreat);
      const c=vertex(col/32,(row+1)/48,time,retreat), d=vertex((col+1)/32,(row+1)/48,time,retreat);
      assert.ok(area(a,b,c)>0 && area(b,d,c)>0);
    }
  }
});

test("both specials calculate and strike only the opponent", () => {
  assert.match(page, /superintelligenceTarget = superintelligenceEffectFromPlayer \? enemyPosition : playerPosition/);
  assert.match(css, /left:var\(--super-target\)/);
  assert.match(css, /left:var\(--super-origin\)/);
  assert.equal((page.match(/className=\{`superintelligence-effect/g) ?? []).length, 1);
  assert.match(page, /Vocês pensaram o mundo\. Eu contenho todos os mundos possíveis\./);
});
