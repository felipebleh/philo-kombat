import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const ast = ts.createSourceFile("page.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
function declaration(name) {
  for (const statement of ast.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name?.text === name) return statement.getText(ast);
    if (!ts.isVariableStatement(statement)) continue;
    for (const item of statement.declarationList.declarations) {
      if (item.name.getText(ast) === name) return `const ${name} = ${item.initializer.getText(ast)};`;
    }
  }
  throw new Error(`Missing ${name}`);
}
function compile(text) {
  return ts.transpileModule(text, { compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.ESNext } }).outputText;
}
const { order, next, fighters, Panel } = Function("React", "FelipeSprite", compile([
  declaration("FIGHTERS"), declaration("FIGHTER_ORDER"), declaration("FIGHTER_GRID_COLUMNS"),
  declaration("nextFighterInGrid"), declaration("fighterArt"), declaration("fighterSelectionArt"),
  declaration("VersusFighterPanel"),
  "return {order:FIGHTER_ORDER, next:nextFighterInGrid, fighters:FIGHTERS, Panel:VersusFighterPanel};",
].join("\n")))(React, () => React.createElement("canvas", { "aria-label": "Felipe Bleh" }));

let selection;
function visit(node) {
  if (ts.isBinaryExpression(node) && node.left.getText(ast) === 'phase === "select"') selection = node.right.getText(ast);
  ts.forEachChild(node, visit);
}
visit(ast);
function fixture(step, player, preview) {
  const actions = [];
  const names = ["React", "selectionStep", "selectedFighter", "previewFighter", "FIGHTERS", "FIGHTER_ORDER",
    "VersusFighterPanel", "FelipeSprite", "fighterThumbnailArt", "undoPlayerSelection", "openModeMenu", "setPreviewFighter", "confirmSelection"];
  const tree = Function(...names, compile(`return ${selection};`))(
    React, step, player, preview, fighters, order, Panel,
    () => React.createElement("canvas"), fighter => `/game/thumb-${fighter}.webp`,
    () => {}, () => {}, fighter => actions.push(["preview", fighter]), fighter => actions.push(["confirm", fighter]),
  );
  return { tree, actions, html: renderToStaticMarkup(tree) };
}
function descendants(node) {
  if (!React.isValidElement(node)) return [];
  return [node, ...React.Children.toArray(node.props.children).flatMap(descendants)];
}

test("arrows visit all six rows, wrap at edges and skip the confirmed player", () => {
  for (let index = 0; index < order.length; index++) {
    const fighter = order[index];
    assert.equal(next(fighter,"arrowdown"), order[(index + 7) % 42]);
    assert.equal(next(fighter,"arrowup"), order[(index + 35) % 42]);
    const row = Math.floor(index / 7) * 7;
    assert.equal(next(fighter,"arrowright"), order[row + (index + 1) % 7]);
    assert.equal(next(fighter,"arrowleft"), order[row + (index + 6) % 7]);
    for (const key of ["arrowleft","arrowright","arrowup","arrowdown"]) {
      const blocked = next(fighter, key);
      assert.notEqual(next(fighter, key, blocked), blocked);
      assert.ok(order.includes(next(fighter, key, blocked)));
    }
  }
});

test("the player preview has a biography and all 42 portraits have accessible names without visible labels", () => {
  const { tree, html } = fixture("player", "plato", "homero");
  assert.match(html, /<h3>HOMERO<\/h3>/);
  assert.ok(html.includes(fighters.homero.biography));
  assert.match(html, /Confirme seu personagem para escolher o adversário/);
  const portraits = descendants(tree).filter(node => node.props.role === "option");
  assert.equal(portraits.length, 42);
  for (const node of portraits) {
    assert.ok(node.props["aria-label"]);
    assert.ok(!React.Children.toArray(node.props.children).some(child => React.isValidElement(child) && child.type === "span"));
  }
});

test("the confirmed player stays left while a distinct opponent and biography appear right", () => {
  const { html } = fixture("opponent", "homero", "agostinho");
  assert.match(html, /<h3>HOMERO<\/h3>/);
  assert.match(html, /<h3>SANTO AGOSTINHO<\/h3>/);
  assert.ok(html.includes(fighters.agostinho.biography));
  assert.match(html, /CONFIRMADO/);
  assert.match(html, /id="fighter-option-homero"[^>]*disabled/);
});

test("a click or touch selects immediately in both selection stages", () => {
  for (const step of ["player", "opponent"]) {
    const { tree, actions } = fixture(step, "plato", "homero");
    const nodes = descendants(tree);
    nodes.find(node => node.props.id === "fighter-option-agostinho").props.onClick();
    assert.deepEqual(actions, [["confirm", "agostinho"]]);
    assert.ok(!nodes.some(node => node.props.className === "versus-confirm"));
  }
});
