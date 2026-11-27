import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import sharp from 'sharp';

test('all 36 HD frames retain their placement and the original body silhouette', async () => {
  const boxes = JSON.parse(fs.readFileSync('app/marcus-frame-data.json', 'utf8'));
  assert.equal(boxes.length, 36);
  for (let i = 0; i < 36; i++) {
    const b = boxes[i];
    const path = `public/game/marco-aurelio-hd-v2/frame-${String(i).padStart(2, '0')}.webp`;
    const info = await sharp(path).metadata();
    assert.equal(info.width, b.width * 4, `frame ${i} width`);
    assert.equal(info.height, b.height * 4, `frame ${i} height`);
    assert.equal(info.hasAlpha, true, `frame ${i} alpha`);
    const original = await sharp('public/game/marco-aurelio-spritesheet.webp').extract({left:(i%6)*418+b.x, top:Math.floor(i/6)*418+b.y, width:b.width, height:b.height}).extractChannel('alpha').raw().toBuffer();
    const actual = await sharp(path).extractChannel('alpha').resize(b.width,b.height).raw().toBuffer();
    let diff = 0;
    const bodyStart = Math.ceil(b.height * 0.32) * b.width;
    for (let p = bodyStart; p < original.length; p++) diff += Math.abs(original[p] - actual[p]);
    assert.ok(diff / (original.length - bodyStart) < 3, `frame ${i} alpha deviation`);
  }
});

// The former alpha mask cut off the nose in this fighting pose.
test('the fighting pose retains the restored nose contour', async () => {
  const region = {left:475, top:110, width:50, height:55};
  const old = await sharp('public/game/marco-aurelio-hd-v1/frame-04.webp').extract(region).extractChannel('alpha').raw().toBuffer();
  const fixed = await sharp('public/game/marco-aurelio-hd-v2/frame-04.webp').extract(region).extractChannel('alpha').raw().toBuffer();
  let restored = 0;
  for (let i = 0; i < old.length; i++) if (old[i] < 64 && fixed[i] > 192) restored++;
  assert.ok(restored > 100, `only ${restored} nose pixels restored`);
});
