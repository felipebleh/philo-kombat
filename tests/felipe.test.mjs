import assert from "node:assert/strict";
import { readFile, access, stat } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import sharp from "sharp";

const source = await readFile(new URL("../app/felipe-animation.ts", import.meta.url), "utf8");
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { FELIPE_ART, FELIPE_TIMING, FELIPE_WALK_DURATION, felipePose, felipeKeyAlpha, felipeEffectEndpoints, felipeAssetUrls } = await import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);
const animationUrl = `data:text/javascript;base64,${Buffer.from(js).toString("base64")}`;
const meshSource = (await readFile(new URL("../app/felipe-walk-mesh.ts", import.meta.url), "utf8")).replace('"./felipe-animation"', JSON.stringify(animationUrl));
const meshJs = ts.transpileModule(meshSource, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { felipeWalkVertex: vertex } = await import(`data:text/javascript;base64,${Buffer.from(meshJs).toString("base64")}`);

test("continuous walking keeps the head fixed and the mesh unfolded in both directions", () => {
  const area = (a,b,c) => (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  for (const retreat of [false, true]) for (let t = 0; t <= FELIPE_WALK_DURATION; t += 20) {
    assert.deepEqual(vertex(.55, .10, t, retreat), [.55, .10]);
    for (let row = 0; row < 48; row++) for (let col = 0; col < 32; col++) {
      const a=vertex(col/32,row/48,t,retreat),b=vertex((col+1)/32,row/48,t,retreat);
      const c=vertex(col/32,(row+1)/48,t,retreat),d=vertex((col+1)/32,(row+1)/48,t,retreat);
      assert.ok(area(a,b,c)>0 && area(b,d,c)>0, "no folds or reversed limbs");
    }
  }
  assert.ok(vertex(.25,.94,160,false)[0] > .25);
  assert.ok(vertex(.75,.94,160,false)[0] < .75);
  assert.ok(vertex(.25,.94,160,true)[0] < .25);
});

test("contact frames match the playable and CPU move clocks", () => {
  const action = { dialetica: "attack-punch", caverna: "attack-kick", ideias: "attack-combo", especial: "special-doubt", transcender: "special-thinker" };
  const expected = { dialetica: "punch", caverna: "kick", ideias: "kick", especial: "cast", transcender: "thinker" };
  for (const [move, timing] of Object.entries(FELIPE_TIMING)) {
    assert.equal(felipePose(action[move], timing.impact), expected[move]);
    assert.equal(felipePose(action[move], timing.duration), "idle");
    assert.ok(timing.impact > 0 && timing.impact < timing.duration);
  }
  assert.equal(felipePose("attack-punch", 220, 1), "hook");
});

test("walking alternates feet, retreat reverses the order, and actions recover", () => {
  assert.equal(felipePose("advance", 170), felipePose("retreat", 490));
  assert.notEqual(felipePose("advance", 170), felipePose("advance", 490));
  assert.equal(felipePose("advance", FELIPE_WALK_DURATION), "idle");
  for (const action of ["jump", "hit", "recover"]) assert.equal(felipePose(action, 1000), "idle");
  assert.equal(felipePose("knocked-out", 2000), "fallen");
  assert.equal(felipePose("victory", 2000), "victory");
  const frames = new Set(Array.from({ length: 100 }, (_, i) => felipePose("attack-combo", i * 10)));
  for (const pose of ["punch", "hook", "kick", "windup", "idle"]) assert.ok(frames.has(pose));
});

test("specials target the other combatant from either side", () => {
  assert.deepEqual(felipeEffectEndpoints(true, 18, 70), { origin: 18, target: 70, facing: 1 });
  assert.deepEqual(felipeEffectEndpoints(false, 27, 63), { origin: 63, target: 27, facing: -1 });
});

test("the sprite key preserves skin, fabric, dark tattoos and the white emblem", () => {
  for (const rgb of [[12, 13, 14], [240, 240, 240], [206, 174, 134], [201, 140, 106], [80, 80, 80]]) assert.equal(felipeKeyAlpha(...rgb), 255);
  for (const rgb of [[255, 0, 255], [249, 4, 250], [220, 12, 221]]) assert.equal(felipeKeyAlpha(...rgb), 0);
});

test("all pose cells contain detailed artwork on a removable background", async () => {
  let bytes = 0;
  for (const url of felipeAssetUrls) {
    const path = new URL(`../public${url}`, import.meta.url);
    await access(path);
    bytes += (await stat(path)).size;
    const { data, info } = await sharp(path.pathname).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    assert.ok(info.width >= 1000 && info.height >= 1000, `${url} has enough native detail`);
    const cells = url.includes("movement") || url.includes("specials") ? 2 : 1;
    for (let row = 0; row < cells; row++) for (let col = 0; col < cells; col++) {
      let opaque = 0, clear = 0;
      for (let y = row * info.height / cells; y < (row + 1) * info.height / cells; y += 12) {
        for (let x = col * info.width / cells; x < (col + 1) * info.width / cells; x += 12) {
          const i = (Math.floor(y) * info.width + Math.floor(x)) * info.channels;
          const alpha = felipeKeyAlpha(data[i], data[i + 1], data[i + 2]);
          if (alpha > 200) opaque++; else if (alpha === 0) clear++;
        }
      }
      assert.ok(opaque > 30 && clear > opaque * .15, `${url} cell ${row},${col} contains art and keyed space`);
    }
  }
  assert.ok(bytes < 4 * 1024 * 1024, `Felipe art pack should remain compact: ${bytes} bytes`);
  for (const pose of Object.values(FELIPE_ART)) assert.ok(pose.height > 0 && pose.height <= 1);
});
