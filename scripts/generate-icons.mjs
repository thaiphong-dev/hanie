/**
 * Hanie Studio — PWA Icon Generator
 * Tạo icon-192.png, icon-512.png, badge-72.png
 * Chạy: node scripts/generate-icons.mjs
 * Không cần external dependency — chỉ dùng Node.js built-in zlib
 */

import { deflateSync } from 'zlib';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT   = join(__dir, '..', 'public', 'icons');

// ── Brand colors ─────────────────────────────────────────────────────────────
const ACCENT = [201, 168, 130];   // #C9A882 — vàng đồng thương hiệu
const DARK   = [160, 128,  90];   // #A0805A — tông tối hơn cho gradient
const WHITE  = [255, 255, 255];

// ── Minimal PNG encoder (không cần external deps) ─────────────────────────────

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (const b of buf) crc = CRC_TABLE[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const tb = Buffer.from(type, 'ascii');
  const db = Buffer.isBuffer(data) ? data : Buffer.from(data);
  const lenBuf = Buffer.allocUnsafe(4);
  lenBuf.writeUInt32BE(db.length, 0);
  const crcInput = Buffer.concat([tb, db]);
  const crcBuf = Buffer.allocUnsafe(4);
  crcBuf.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([lenBuf, tb, db, crcBuf]);
}

function encodePNG(width, height, rgba) {
  const sig   = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr  = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // colour type: RGBA
  ihdr[10] = ihdr[11] = ihdr[12] = 0;

  const rowLen = 1 + width * 4;
  const raw    = Buffer.allocUnsafe(height * rowLen);
  for (let y = 0; y < height; y++) {
    raw[y * rowLen] = 0; // filter: None
    for (let x = 0; x < width; x++) {
      const si = (y * width + x) * 4;
      const di = y * rowLen + 1 + x * 4;
      raw[di]     = rgba[si];
      raw[di + 1] = rgba[si + 1];
      raw[di + 2] = rgba[si + 2];
      raw[di + 3] = rgba[si + 3];
    }
  }

  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', deflateSync(raw, { level: 6 })),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── Canvas helper ─────────────────────────────────────────────────────────────

function createCanvas(w, h) {
  const px = new Uint8ClampedArray(w * h * 4); // starts transparent

  function blend(i, r, g, b, a) {
    const sa = a / 255;
    const da = px[i + 3] / 255;
    const oa = sa + da * (1 - sa);
    if (oa === 0) return;
    px[i]     = Math.round((r * sa + px[i]     * da * (1 - sa)) / oa);
    px[i + 1] = Math.round((g * sa + px[i + 1] * da * (1 - sa)) / oa);
    px[i + 2] = Math.round((b * sa + px[i + 2] * da * (1 - sa)) / oa);
    px[i + 3] = Math.round(oa * 255);
  }

  function setPixel(x, y, r, g, b, a = 255) {
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    blend((y * w + x) * 4, r, g, b, a);
  }

  function fillRect(x, y, rw, rh, r, g, b, a = 255) {
    const x1 = Math.max(0, Math.round(x));
    const y1 = Math.max(0, Math.round(y));
    const x2 = Math.min(w, Math.round(x + rw));
    const y2 = Math.min(h, Math.round(y + rh));
    for (let cy = y1; cy < y2; cy++)
      for (let cx = x1; cx < x2; cx++)
        blend((cy * w + cx) * 4, r, g, b, a);
  }

  // Anti-aliased rounded rectangle
  function fillRoundRect(rx, ry, rw, rh, radius, r, g, b) {
    const x2 = rx + rw - 1, y2 = ry + rh - 1;
    for (let cy = Math.max(0, ry); cy <= Math.min(h - 1, y2); cy++) {
      for (let cx = Math.max(0, rx); cx <= Math.min(w - 1, x2); cx++) {
        let alpha = 255;
        // Corner regions
        let cornerDist = -1;
        if (cx < rx + radius && cy < ry + radius)
          cornerDist = Math.sqrt((cx - rx - radius) ** 2 + (cy - ry - radius) ** 2) - radius;
        else if (cx > x2 - radius && cy < ry + radius)
          cornerDist = Math.sqrt((cx - x2 + radius) ** 2 + (cy - ry - radius) ** 2) - radius;
        else if (cx < rx + radius && cy > y2 - radius)
          cornerDist = Math.sqrt((cx - rx - radius) ** 2 + (cy - y2 + radius) ** 2) - radius;
        else if (cx > x2 - radius && cy > y2 - radius)
          cornerDist = Math.sqrt((cx - x2 + radius) ** 2 + (cy - y2 + radius) ** 2) - radius;

        if (cornerDist > 0.5) continue;
        if (cornerDist > -0.5) alpha = Math.round((0.5 - cornerDist) * 255); // AA

        blend((cy * w + cx) * 4, r, g, b, alpha);
      }
    }
  }

  // Anti-aliased filled circle
  function fillCircle(cx, cy, radius, r, g, b, a = 255) {
    const x1 = Math.max(0, Math.ceil(cx - radius - 1));
    const x2 = Math.min(w - 1, Math.floor(cx + radius + 1));
    const y1 = Math.max(0, Math.ceil(cy - radius - 1));
    const y2 = Math.min(h - 1, Math.floor(cy + radius + 1));
    for (let py = y1; py <= y2; py++) {
      for (let px2 = x1; px2 <= x2; px2++) {
        const d = Math.sqrt((px2 - cx) ** 2 + (py - cy) ** 2) - radius;
        if (d > 0.5) continue;
        const alpha2 = d < -0.5 ? a : Math.round((0.5 - d) * a);
        blend((py * w + px2) * 4, r, g, b, alpha2);
      }
    }
  }

  return { px, setPixel, fillRect, fillRoundRect, fillCircle, w, h };
}

// ── Design: Main icon ─────────────────────────────────────────────────────────
// Background: rounded rect gradient (gold top → darker gold bottom)
// Foreground: letter "H" in white with subtle drop-shadow

function drawIcon(size) {
  const c   = createCanvas(size, size);
  const rad = Math.round(size * 0.22);   // iOS-style corner radius

  // Background: vertical gradient emulation (scan line by line)
  for (let y = 0; y < size; y++) {
    const t   = y / (size - 1);
    const r   = Math.round(ACCENT[0] * (1 - t) + DARK[0] * t);
    const g   = Math.round(ACCENT[1] * (1 - t) + DARK[1] * t);
    const b   = Math.round(ACCENT[2] * (1 - t) + DARK[2] * t);
    c.fillRoundRect(0, y, size, 1, rad, r, g, b);
  }

  // Subtle inner highlight (top-left glow)
  const glowR = Math.round(size * 0.45);
  for (let gy = 0; gy < size; gy++) {
    for (let gx = 0; gx < size; gx++) {
      const dist = Math.sqrt(gx * gx + gy * gy);
      if (dist < glowR) {
        const a = Math.round((1 - dist / glowR) * 30);
        c.setPixel(gx, gy, 255, 255, 255, a);
      }
    }
  }

  // Letter "H" — white with pixel-perfect proportions
  const pad  = Math.round(size * 0.20);
  const pilW = Math.round(size * 0.135);
  const pilH = size - pad * 2;
  const barH = Math.round(pilW * 1.0);
  const barY = Math.round(size / 2 - barH / 2);
  const lx   = pad;
  const rx   = size - pad - pilW;

  // Soft shadow (1-pixel dark offset)
  const shadowAlpha = 45;
  c.fillRect(lx + 2, pad + 2,          pilW, pilH, ...DARK, shadowAlpha);
  c.fillRect(rx + 2, pad + 2,          pilW, pilH, ...DARK, shadowAlpha);
  c.fillRect(lx + pilW + 2, barY + 2,  rx - lx - pilW, barH, ...DARK, shadowAlpha);

  // White pillars + crossbar
  c.fillRect(lx, pad,          pilW, pilH,                  ...WHITE, 255);
  c.fillRect(rx, pad,          pilW, pilH,                  ...WHITE, 255);
  c.fillRect(lx + pilW, barY,  rx - lx - pilW, barH,       ...WHITE, 255);

  // Small decorative dot above H (a circle — feminine touch)
  const dotR = Math.round(size * 0.04);
  const dotY = Math.round(pad * 0.48);
  c.fillCircle(size / 2, dotY, dotR, ...WHITE, 200);

  return c.px;
}

// ── Design: Badge icon (72px — small bell on brand circle) ───────────────────

function drawBadge(size) {
  const c   = createCanvas(size, size);
  const cx  = size / 2;
  const cy  = size / 2;

  // Filled circle
  c.fillCircle(cx, cy, size * 0.46, ...ACCENT, 255);

  // Bell body (simplified: round-top rectangle)
  const bw = Math.round(size * 0.34);
  const bh = Math.round(size * 0.28);
  const bx = Math.round(cx - bw / 2);
  const by = Math.round(cy - bh / 2 + size * 0.04);

  // Bell dome (semi-circle on top)
  const domeR = Math.round(bw / 2);
  c.fillCircle(cx, by, domeR, ...WHITE, 255);

  // Bell body rect
  c.fillRect(bx, by, bw, bh, ...WHITE, 255);

  // Bell clapper (small circle at bottom)
  const clapR = Math.round(size * 0.07);
  c.fillCircle(cx, by + bh + clapR, clapR, ...WHITE, 255);

  // Tiny handle on top
  c.fillRect(Math.round(cx - size * 0.05), by - domeR - Math.round(size * 0.08), Math.round(size * 0.1), Math.round(size * 0.1), ...WHITE, 255);

  return c.px;
}

// ── Write files ───────────────────────────────────────────────────────────────

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const icons = [
  ['icon-192.png', 192, drawIcon],
  ['icon-512.png', 512, drawIcon],
  ['badge-72.png',  72, drawBadge],
];

for (const [name, sz, fn] of icons) {
  const pixels = fn(sz);
  writeFileSync(join(OUT, name), encodePNG(sz, sz, pixels));
  console.log(`✓ ${name} (${sz}x${sz})`);
}

console.log('\n✅ Icons generated → public/icons/');
