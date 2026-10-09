import assert from "node:assert/strict";

const readUint24LE = (buffer, offset) =>
  buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16);

export function webpMetadata(buffer) {
  assert.equal(buffer.toString("ascii", 0, 4), "RIFF");
  assert.equal(buffer.toString("ascii", 8, 12), "WEBP");
  assert.equal(buffer.toString("ascii", 12, 16), "VP8X");

  return {
    width: readUint24LE(buffer, 24) + 1,
    height: readUint24LE(buffer, 27) + 1,
    hasAlpha: (buffer[20] & 0x10) !== 0,
  };
}
