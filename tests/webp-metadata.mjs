import assert from "node:assert/strict";

const readUint24LE = (buffer, offset) =>
  buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16);

export function webpMetadata(buffer) {
  assert.equal(buffer.toString("ascii", 0, 4), "RIFF");
  assert.equal(buffer.toString("ascii", 8, 12), "WEBP");
  if (buffer.toString("ascii",12,16) === "VP8L") {
    assert.equal(buffer[20],0x2f);
    const bits=buffer.readUInt32LE(21);
    return {width:(bits&0x3fff)+1,height:((bits>>>14)&0x3fff)+1,hasAlpha:!!(bits&0x10000000)};
  }
  assert.equal(buffer.toString("ascii", 12, 16), "VP8X");

  return {
    width: readUint24LE(buffer, 24) + 1,
    height: readUint24LE(buffer, 27) + 1,
    hasAlpha: (buffer[20] & 0x10) !== 0,
  };
}
