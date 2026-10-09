import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import { webpMetadata } from "./webp-metadata.mjs";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../app/krenak.css", import.meta.url), "utf8");
const assets = await readFile(new URL("../app/fighter-assets.ts", import.meta.url), "utf8");
const walk = await readFile(new URL("../app/fighter-walk.tsx", import.meta.url), "utf8");
const source = await readFile(new URL("../app/krenak-walk-mesh.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { krenakWalkVertex: vertex, KRENAK_WALK_DURATION: duration } =
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

test("Krenak has five complete moves and two opponent-bound specials", () => {
  const moves = pageConstant("KRENAK_MOVES");
  assert.deepEqual(Object.keys(moves), ["dialetica", "caverna", "ideias", "especial", "transcender"]);
  assert.equal(moves.especial.label, "Ideias para Adiar o Fim do Mundo");
  assert.equal(moves.especial.action, "special-delay-world-end");
  assert.equal(moves.transcender.label, "Watu Resiste");
  assert.equal(moves.transcender.action, "special-watu-resists");
  for (const move of Object.values(moves)) assert.ok(move.damage > 0 && move.cooldown > 0);
  const effect = pageConstant("specialEffect");
  assert.equal(effect("krenak", "especial"), "krenak-world");
  assert.equal(effect("krenak", "transcender"), "krenak-watu");
  assert.ok(pageConstant("usesExtendedSpecialTiming")("krenak"));
});

test("Krenak remains in the unique expanded central roster", () => {
  const order = pageConstant("FIGHTER_ORDER");
  assert.equal(new Set(order).size, order.length);
  assert.ok(order.includes("krenak"));
  assert.equal(pageConstant("FIGHTER_GRID_COLUMNS"), 7);
});

test("the articulated stride preserves face, glasses, hands, necklaces and torso", () => {
  for (const retreat of [false, true]) {
    for (const time of [0, duration]) {
      for (let y = 0; y <= 1; y += .05) for (let x = 0; x <= 1; x += .05) {
        const [movedX, movedY] = vertex(x, y, time, retreat);
        assert.ok(Math.abs(movedX - x) < 1e-10 && Math.abs(movedY - y) < 1e-10);
      }
    }
    for (let time = 0; time < duration; time += 13) {
      for (const x of [.24,.42,.60,.78]) for (const y of [.05,.15,.25,.35,.44]) {
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

test("all five Krenak poses use sanitized transparent high-resolution canvases and fixed scale", async () => {
  for (const name of ["fullbody","punch","kick","combo","victory"]) {
    const path = name === "victory"
      ? "krenak-victory-final-hq.webp"
      : `krenak-${name}-clean-hq.webp`;
    const version = name === "victory" ? "4.10" : "4.9";
    const webp = await readFile(new URL(`../public/game/${path}`, import.meta.url));
    assert.deepEqual(webpMetadata(webp), { width: 1400, height: 1536, hasAlpha: true });
    assert.ok(assets.includes(`/game/${path}?v=${version}`));
    assert.ok(css.includes(`/game/${path}?v=${version}`));
  }
  assert.match(css, /aspect-ratio:175 \/ 192/);
  assert.match(css, /inset:auto auto 0 50%/);
  assert.match(css, /width:auto/);
  assert.match(css, /height:100%/);
  assert.match(walk, /krenak: \{ src: "\/game\/krenak-fullbody-clean-hq\.webp\?v=4\.9"/);
});

test("the Watu arena and both nature effects keep enough visual detail", async () => {
  const arena = await readFile(new URL("../public/game/arena-krenak.webp", import.meta.url));
  assert.equal(arena.subarray(0, 4).toString(), "RIFF");
  assert.ok(arena.length > 100_000, "the arena keeps enough detail for the full battle frame");
  const earth = await readFile(new URL("../public/game/krenak-earth-hq.webp", import.meta.url));
  assert.equal(earth.subarray(0, 4).toString(), "RIFF");
  assert.ok(earth.length > 100_000, "the Earth remains detailed enough for the special attack");
  assert.ok(assets.includes("/game/krenak-earth-hq.webp?v=4.9"));
  const watu = await readFile(new URL("../public/game/krenak-watu-hq.webp", import.meta.url));
  assert.deepEqual(webpMetadata(watu), { width: 1672, height: 941, hasAlpha: true });
  assert.ok(assets.includes("/game/krenak-watu-hq.webp?v=4.9"));
});

test("both specials hit only the opponent and victory reconnects Krenak to the earth", () => {
  assert.match(page, /krenakTarget = krenakEffectFromPlayer \? enemyPosition : playerPosition/);
  assert.match(page, /"--krenak-target": `\$\{krenakTarget\}%`/);
  assert.equal((page.match(/className="krenak-earth"/g) ?? []).length, 1);
  assert.equal((page.match(/className=\{`krenak-watu-wave/g) ?? []).length, 1);
  assert.match(css, /left:var\(--krenak-target\)/);
  assert.match(css, /@keyframes krenak-earth-arrival/);
  assert.match(css, /translateX\(var\(--krenak-travel\)\)/);
  assert.match(css, /@keyframes krenak-watu-charge-enemy/);
  assert.match(page, /O amanhã não está à venda\./);
  assert.match(page, /fighterVictoryArt\(matchWinner\)/);
  assert.match(css, /\.fighter-krenak\.victory \.fighter-sprite/);
  assert.match(page, /selectedFighter !== "krenak"/);
  assert.match(page, /opponentFighter !== "krenak"/);
});
