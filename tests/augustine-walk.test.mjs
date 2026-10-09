import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../app/augustine-walk-mesh.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { augustineWalkVertex: vertex, AUGUSTINE_WALK_DURATION: duration } =
  await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

test("either direction completes both steps and lands on the idle pose", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const ast = ts.createSourceFile("page.tsx", page, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const declaration = ast.statements.flatMap(statement => ts.isVariableStatement(statement)
    ? [...statement.declarationList.declarations] : []).find(item => item.name.getText(ast) === "articulatedWalkDuration");
  const js = ts.transpileModule(`const timing = ${declaration.initializer.getText(ast)};`, {}).outputText;
  const timing = Function("AUGUSTINE_WALK_DURATION", `${js}; return timing;`)(duration);
  assert.equal(timing("agostinho"), duration);
  for (const retreat of [false, true]) {
    for (const time of [0, duration]) for (let y = 0; y <= 1; y += .05) for (let x = 0; x <= 1; x += .05) {
      const moved = vertex(x, y, time, retreat);
      assert.ok(Math.hypot(moved[0] - x, moved[1] - y) < 1e-10);
    }
    const firstLeft = vertex(.3, .97, duration / 4, retreat);
    const firstRight = vertex(.76, .97, duration / 4, retreat);
    const secondLeft = vertex(.3, .97, duration * .75, retreat);
    const secondRight = vertex(.76, .97, duration * .75, retreat);
    const [firstSwing, firstSupport, secondSwing, secondSupport] = retreat
      ? [firstRight, firstLeft, secondLeft, secondRight]
      : [firstLeft, firstRight, secondRight, secondLeft];
    assert.ok(firstSwing[1] < .955 && secondSwing[1] < .955);
    assert.equal(firstSupport[1], .97);
    assert.equal(secondSupport[1], .97);
    assert.ok(Math.abs(firstLeft[0] - .3) > .03);
    assert.ok(Math.abs(firstRight[0] - .76) > .03);
  }
});

test("the face, hands and book move together without stretching", () => {
  for (const retreat of [false, true]) for (let time = 0; time < duration; time += 13) {
    const reference = vertex(.5, .1, time, retreat);
    for (const [x, y] of [[.45,.08],[.6,.2],[.3,.4],[.7,.53]]) {
      const moved = vertex(x, y, time, retreat);
      assert.ok(Math.abs((moved[0] - x) - (reference[0] - .5)) < 1e-10);
      assert.ok(Math.abs((moved[1] - y) - (reference[1] - .1)) < 1e-10);
    }
  }
});

test("the robe mesh stays continuous and never folds through itself", () => {
  const area = (a,b,c) => (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  for (const retreat of [false, true]) for (let time = 0; time < duration; time += 16) {
    for (let row = 0; row < 48; row++) for (let column = 0; column < 32; column++) {
      const a = vertex(column/32,row/48,time,retreat);
      const b = vertex((column+1)/32,row/48,time,retreat);
      const c = vertex(column/32,(row+1)/48,time,retreat);
      const d = vertex((column+1)/32,(row+1)/48,time,retreat);
      assert.ok(area(a,b,c) > 0 && area(b,d,c) > 0);
    }
  }
});
