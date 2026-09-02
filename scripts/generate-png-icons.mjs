import fs from 'fs';
import zlib from 'zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
}

const crcTable = createCRC32Table();
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function generatePNG(width, height, isMaskable = false) {
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  const bgR = isMaskable ? 15 : 15;
  const bgG = isMaskable ? 23 : 23;
  const bgB = isMaskable ? 42 : 42;

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * (isMaskable ? 0.45 : 0.46);

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // filter type 0: None
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default dark slate background
      let r = bgR, g = bgG, b = bgB, a = 255;

      // Outer shield/circle
      if (dist < radius) {
        r = 220; g = 38; b = 38; // Red #dc2626
      }

      // Inner badge
      if (dist < radius * 0.85) {
        r = 15; g = 23; b = 42; // Dark Navy #0f172a
      }

      // First Aid Cross
      const crossSize = radius * 0.55;
      const crossThick = crossSize * 0.35;
      const inHoriz = Math.abs(dy) <= crossThick / 2 && Math.abs(dx) <= crossSize / 2;
      const inVert = Math.abs(dx) <= crossThick / 2 && Math.abs(dy) <= crossSize / 2;

      if (inHoriz || inVert) {
        r = 255; g = 255; b = 255; // White cross
      }

      // ECG pulse line in center of cross
      if (Math.abs(dy) <= crossThick * 0.22 && Math.abs(dx) <= crossSize * 0.4) {
        if (Math.abs(dx) > crossThick * 0.35 && Math.abs(dx) < crossThick * 0.8) {
          r = 220; g = 38; b = 38; // Red pulse
        }
      }

      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', idatData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([pngHeader, ihdrChunk, idatChunk, iendChunk]);
}

// Generate files
fs.writeFileSync('./public/pwa-192x192.png', generatePNG(192, 192));
fs.writeFileSync('./public/pwa-512x512.png', generatePNG(512, 512));
fs.writeFileSync('./public/pwa-maskable-512x512.png', generatePNG(512, 512, true));
fs.writeFileSync('./public/apple-touch-icon.png', generatePNG(180, 180));
console.log('Successfully generated all PWA icons in ./public');
