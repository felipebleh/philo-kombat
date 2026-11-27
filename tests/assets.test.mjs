import assert from "node:assert/strict";
import { access, readFile, readdir, stat } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../app/fighter-assets.ts", import.meta.url), "utf8");
const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const sidartaArtUrl = new URL("../app/sidarta-hd-art.json", import.meta.url);
const compiled = ts.transpileModule(source.replace(
  '"./sidarta-hd-art.json";',
  `${JSON.stringify(sidartaArtUrl.href)} with { type: "json" };`,
), {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText;
const { FIGHTER_THUMBNAILS, fightAssetUrls } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
);

test("the roster uses lightweight WebP thumbnails", async () => {
  assert.ok(Object.keys(FIGHTER_THUMBNAILS).length >= 41);
  for (const url of Object.values(FIGHTER_THUMBNAILS)) {
    assert.match(url, /^\/game\/thumb-[a-z-]+(?:-v\d+)?\.webp$/);
    await access(new URL(`../public${url}`, import.meta.url));
  }
  assert.match(page, /fighterThumbnailArt\(fighter\)/);
});

test("a fight loads only both combatants, the active arena and shared victory art", async () => {
  const urls = fightAssetUrls("arendt", "plato");
  assert.ok(urls.some((url) => url.includes("arendt-guard-frame.webp")));
  assert.ok(urls.some((url) => url.includes("plato-spritesheet-v2.webp")));
  assert.ok(urls.some((url) => url.includes("arena-eichmann-courtroom.webp")));
  assert.ok(urls.includes("/game/victory-spritesheet.webp"));
  assert.ok(!urls.some((url) => url.includes("marx-")));
  assert.equal(urls.length, new Set(urls).size);

  for (const url of urls) {
    assert.match(url, /\.webp(?:\?|$)/);
    const pathname = url.split("?")[0];
    await access(new URL(`../public${pathname}`, import.meta.url));
  }
});

test("every fighter preload pack points to existing WebP assets", async () => {
  for (const fighter of Object.keys(FIGHTER_THUMBNAILS)) {
    const urls = fightAssetUrls(fighter, fighter === "plato" ? "arendt" : "plato");
    assert.ok(urls.length >= 4, `${fighter} has an incomplete preload pack`);

    for (const url of urls) {
      assert.match(url, /\.webp(?:\?|$)/);
      const pathname = url.split("?")[0];
      await access(new URL(`../public${pathname}`, import.meta.url));
    }
  }
});

test("História prepara sua arena real e Versus mantém a arena do jogador", () => {
  const story = fightAssetUrls("felipe", "socrates", "/game/arena-agora.webp");
  assert.ok(story.includes("/game/arena-agora.webp"));
  assert.ok(!story.includes("/game/arena-felipe-classroom.webp"));
  assert.ok(fightAssetUrls("felipe", "socrates").includes("/game/arena-felipe-classroom.webp"));
});

test("the final Grande Filósofo fight preloads the giant and its arena in place of the regular SuperIA pack", () => {
  const giant = "/game/superia-grand-final-colossus.webp";
  const arena = "/game/arena-grand-final-servers.webp";
  const final = fightAssetUrls("felipe", "superintelligence", arena, giant);
  assert.ok(final.includes(giant));
  assert.ok(final.includes(arena));
  assert.ok(!final.some(url => url.includes("superintelligence-fullbody")));
  const regular = fightAssetUrls("felipe", "superintelligence", "/game/arena-supercomputer.webp");
  assert.ok(regular.some(url => url.includes("superintelligence-fullbody")));
  assert.ok(!regular.includes(giant));
  assert.ok(!regular.includes(arena));
});

test("roster thumbnails stay within a lightweight initial budget", async () => {
  let totalBytes = 0;
  for (const url of Object.values(FIGHTER_THUMBNAILS)) {
    totalBytes += (await stat(new URL(`../public${url}`, import.meta.url))).size;
  }
  assert.ok(totalBytes < 1024 * 1024, `thumbnails use ${totalBytes} bytes`);
});

test("every WebP referenced by the app exists", async () => {
  const appDirectory = new URL("../app/", import.meta.url);
  const files = await readdir(appDirectory, { withFileTypes: true });
  const sources = await Promise.all(
    files
      .filter((entry) => entry.isFile() && /\.(?:css|tsx?|jsx?)$/.test(entry.name))
      .map((entry) => readFile(new URL(entry.name, appDirectory), "utf8")),
  );
  const references = new Set(
    sources.flatMap((contents) =>
      [...contents.matchAll(/\/game\/[A-Za-z0-9._/-]+\.webp/g)].map(
        (match) => match[0],
      ),
    ),
  );

  assert.ok(references.size > 150);
  for (const pathname of references) {
    await access(new URL(`../public${pathname}`, import.meta.url));
  }
});

test("the previous all-roster preloader is gone", () => {
  assert.doesNotMatch(page, /new window\.Image\(\)/);
  assert.match(page, /preloadFightAssets\(selectedFighter, fighter, setLoadingProgress\)/);
  assert.match(page, /phase === "loading"/);
});

test('the clone preloads its complete pose pack and dystopian classroom on either side',()=>{
 for(const sides of [['felipe-cyborg','felipe'],['felipe','felipe-cyborg']]){
  const urls=fightAssetUrls(...sides);assert.ok(urls.includes('/game/arena-felipe-dystopia-v1.webp'));assert.ok(urls.includes('/game/cyborg-drone-v1.webp'));
  for(const name of ['idle','walk0','walk1','walk2','walk3','punch','kick','hook','guard','jump','cast','hit','fallen','rise','victory','charge'])assert.ok(urls.includes(`/game/cyborg-v1/${name}.webp`));
  assert.ok(!urls.includes('/game/arena-felipe-classroom.webp'));
 }
 assert.ok(fightAssetUrls('felipe','socrates').includes('/game/arena-felipe-classroom.webp'));
});
