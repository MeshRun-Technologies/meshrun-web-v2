// Bakes the hero's lighting into two tiny textures, src/lib/heroEnv.ts.
//
//   node scripts/bake-hero-env.mjs
//
// The hero's surface is lit only by an environment, "city" from ShaderGradient
// (a 1.5 MB HDR photograph of a street). At the material's roughness every
// reflection is a broad blur, so the photograph's detail never reaches the
// screen: two small prefiltered maps carry everything it contributes. One is
// blurred for the specular lobe at roughness 0.6, the other for diffuse light.
// Both are equirectangular, stored RGBM in 8 bits so they stay a few kilobytes.

import { writeFile } from "node:fs/promises";

const HDR = "https://ruucm.github.io/shadergradient/ui@0.0.0/assets/hdr/city.hdr";
const OUT = new URL("../src/lib/heroEnv.ts", import.meta.url);

/* ------------------------------------------------------------------------ */
// Radiance (.hdr) decoding: header, then run-length encoded RGBE scanlines.

function decodeHdr(buf) {
  let pos = 0;
  const line = () => {
    let s = "";
    while (buf[pos] !== 0x0a) s += String.fromCharCode(buf[pos++]);
    pos++;
    return s;
  };
  while (line() !== "");
  const [, h, , w] = line().split(" ").map((x, i) => (i % 2 ? Number(x) : x));
  const rgbe = new Uint8Array(w * h * 4);
  const row = new Uint8Array(w * 4);
  for (let y = 0; y < h; y++) {
    if (buf[pos] !== 2 || buf[pos + 1] !== 2) throw new Error("Only RLE scanlines are supported.");
    pos += 4;
    for (let c = 0; c < 4; c++) {
      for (let x = 0; x < w; ) {
        let n = buf[pos++];
        if (n > 128) {
          n -= 128;
          const v = buf[pos++];
          while (n--) row[x++ * 4 + c] = v;
        } else {
          while (n--) row[x++ * 4 + c] = buf[pos++];
        }
      }
    }
    rgbe.set(row, y * w * 4);
  }
  const rgb = new Float32Array(w * h * 3);
  for (let i = 0; i < w * h; i++) {
    const e = rgbe[i * 4 + 3];
    const f = e ? 2 ** (e - 136) : 0;
    rgb[i * 3] = rgbe[i * 4] * f;
    rgb[i * 3 + 1] = rgbe[i * 4 + 1] * f;
    rgb[i * 3 + 2] = rgbe[i * 4 + 2] * f;
  }
  return { w, h, rgb };
}

/** Box-averages an equirect image down to w×h. */
function shrink(img, w, h) {
  const out = new Float32Array(w * h * 3);
  const sx = img.w / w;
  const sy = img.h / h;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0, n = 0;
      for (let yy = Math.floor(y * sy); yy < Math.floor((y + 1) * sy); yy++)
        for (let xx = Math.floor(x * sx); xx < Math.floor((x + 1) * sx); xx++) {
          const i = (yy * img.w + xx) * 3;
          r += img.rgb[i]; g += img.rgb[i + 1]; b += img.rgb[i + 2]; n++;
        }
      out.set([r / n, g / n, b / n], (y * w + x) * 3);
    }
  return { w, h, rgb: out };
}

/*
 * Equirect layout, matching three.js (and so the original): the top row looks
 * straight up; u = atan(z, x) / 2π + 0.5.
 */
function direction(x, y, w, h) {
  const u = (x + 0.5) / w;
  const v = 1 - (y + 0.5) / h;
  const phi = (u - 0.5) * 2 * Math.PI;
  const lat = (v - 0.5) * Math.PI;
  return [Math.cos(lat) * Math.cos(phi), Math.sin(lat), Math.cos(lat) * Math.sin(phi)];
}

/** Convolves with a cosine-power lobe: exponent 1 is diffuse, higher is a sharper reflection. */
function convolve(src, w, h, exponent) {
  const dirs = [];
  const weights = [];
  for (let y = 0; y < src.h; y++)
    for (let x = 0; x < src.w; x++) {
      dirs.push(direction(x, y, src.w, src.h));
      // Rows near the poles cover less of the sphere.
      weights.push(Math.cos(((y + 0.5) / src.h - 0.5) * Math.PI));
    }
  const out = new Float32Array(w * h * 3);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const d = direction(x, y, w, h);
      let r = 0, g = 0, b = 0, total = 0;
      for (let i = 0; i < dirs.length; i++) {
        const c = d[0] * dirs[i][0] + d[1] * dirs[i][1] + d[2] * dirs[i][2];
        if (c <= 0) continue;
        const k = c ** exponent * weights[i];
        r += src.rgb[i * 3] * k; g += src.rgb[i * 3 + 1] * k; b += src.rgb[i * 3 + 2] * k;
        total += k;
      }
      out.set([r / total, g / total, b / total], (y * w + x) * 3);
    }
  return { w, h, rgb: out };
}

/** RGBM: colour divided by its own multiplier, which goes in alpha, over a fixed range. */
function rgbm(img, range) {
  const out = new Uint8Array(img.w * img.h * 4);
  for (let i = 0; i < img.w * img.h; i++) {
    const [r, g, b] = [0, 1, 2].map((c) => img.rgb[i * 3 + c] / range);
    const m = Math.min(Math.ceil(Math.max(r, g, b, 1e-6) * 255) / 255, 1);
    out.set([r / m, g / m, b / m].map((v) => Math.round(Math.min(v, 1) * 255)), i * 4);
    out[i * 4 + 3] = Math.round(m * 255);
  }
  return Buffer.from(out).toString("base64");
}

const peak = (img) => img.rgb.reduce((a, b) => Math.max(a, b), 0);

/* ------------------------------------------------------------------------ */

const res = await fetch(HDR);
if (!res.ok) throw new Error(`HDR ${res.status}`);
const hdr = decodeHdr(new Uint8Array(await res.arrayBuffer()));
console.log(`[env] ${hdr.w}×${hdr.h}`);

const small = shrink(hdr, 128, 64);
// Roughness 0.6 as a Phong exponent: 2 / α² − 2, with α = roughness².
const specular = convolve(small, 64, 32, 2 / 0.36 ** 2 - 2);
const diffuse = convolve(small, 32, 16, 1);
const range = Math.max(peak(specular), peak(diffuse));
console.log(`[env] peak ${range.toFixed(2)}`);

await writeFile(
  OUT,
  `// Generated by scripts/bake-hero-env.mjs from ShaderGradient's "city"
// environment. Equirectangular, RGBM over RANGE, rows top (up) to bottom.

export const RANGE = ${range.toFixed(4)};

/** Prefiltered for the reflection at roughness 0.6. */
export const SPECULAR = { width: ${specular.w}, height: ${specular.h}, data: "${rgbm(specular, range)}" };

/** Prefiltered for diffuse light. */
export const DIFFUSE = { width: ${diffuse.w}, height: ${diffuse.h}, data: "${rgbm(diffuse, range)}" };
`,
);
console.log("[env] wrote src/lib/heroEnv.ts");
