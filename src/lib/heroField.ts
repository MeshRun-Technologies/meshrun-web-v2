// The hero's render: a reimplementation of ShaderGradient's sphere (MIT,
// github.com/ruucm/shadergradient) in plain WebGL, at the settings the
// landing was designed with. ShaderGradient draws it through three.js and
// react-three-fiber; this draws the same mesh, the same vertex motion, the
// same colour rule and the same image-based lighting, in a few kilobytes.
//
// What it is: a unit icosphere, its surface pushed in and out by periodic
// Perlin noise and each latitude twisted round the vertical axis by a sine of
// its height. The camera sits inside it, looking up at the far wall through a
// very long lens, so the twist's stretched triangles read as broad bands of
// colour. Colour runs teal to orange with height, falling to periwinkle where
// the surface dips; light comes only from a baked street environment (see
// heroEnv.ts); a halftone grain sits over the top.

import { DIFFUSE, RANGE, SPECULAR } from "./heroEnv";

export interface FieldSettings {
  colors: [string, string, string];
  /** Noise scale over the sphere. */
  density: number;
  /** How far the noise pushes the surface. */
  strength: number;
  /** Twists per unit of latitude. */
  frequency: number;
  /** How far each latitude twists, in radians. */
  amplitude: number;
  /** Time scale for both. */
  speed: number;
  roughness: number;
  metalness: number;
  /** Strength of the film grain; 0 leaves the image clean. */
  grain: number;
}

/** The landing's look, from the shadergradient.co link it was chosen from. */
export const LANDING: FieldSettings = {
  colors: ["#73bfc4", "#ff810a", "#8da0ce"],
  density: 0.8,
  strength: 0.3,
  frequency: 5.5,
  amplitude: 3.2,
  speed: 0.3,
  // reflection 0.4 → roughness 0.6, as ShaderGradient maps it.
  roughness: 0.6,
  metalness: 0.2,
  grain: 0.25,
};

/* ------------------------------------------------------------------------ */
// Geometry: three.js's IcosahedronGeometry(1, 64), indexed. Every vertex lies
// on the unit sphere, so its normal and latitude are derived in the shader
// from its position alone.

const DETAIL = 64;

function icosphere(detail: number) {
  const t = (1 + Math.sqrt(5)) / 2;
  // prettier-ignore
  const base = [-1, t, 0, 1, t, 0, -1, -t, 0, 1, -t, 0, 0, -1, t, 0, 1, t, 0, -1, -t, 0, 1, -t, t, 0, -1, t, 0, 1, -t, 0, -1, -t, 0, 1];
  // prettier-ignore
  const faces = [0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11, 1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8, 3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9, 4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1];

  const positions: number[] = [];
  const indices: number[] = [];
  const seen = new Map<string, number>();
  const vertex = (x: number, y: number, z: number) => {
    const l = Math.hypot(x, y, z);
    const [px, py, pz] = [x / l, y / l, z / l];
    const key = `${px.toFixed(5)},${py.toFixed(5)},${pz.toFixed(5)}`;
    let i = seen.get(key);
    if (i === undefined) {
      i = positions.length / 3;
      positions.push(px, py, pz);
      seen.set(key, i);
    }
    return i;
  };
  const corner = (i: number) => [base[i * 3], base[i * 3 + 1], base[i * 3 + 2]];
  const lerp = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k);

  // Subdivided exactly as three.js does, so the triangles (and so the bands
  // the twist stretches them into) match.
  const cols = detail + 1;
  for (let f = 0; f < faces.length; f += 3) {
    const [a, b, c] = [corner(faces[f]), corner(faces[f + 1]), corner(faces[f + 2])];
    const grid: number[][] = [];
    for (let i = 0; i <= cols; i++) {
      grid[i] = [];
      const aj = lerp(a, c, i / cols);
      const bj = lerp(b, c, i / cols);
      const rows = cols - i;
      for (let j = 0; j <= rows; j++) {
        const p = j === 0 && i === cols ? aj : lerp(aj, bj, j / rows);
        grid[i][j] = vertex(p[0], p[1], p[2]);
      }
    }
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < 2 * (cols - i) - 1; j++) {
        const k = Math.floor(j / 2);
        if (j % 2 === 0) indices.push(grid[i][k + 1], grid[i + 1][k], grid[i][k]);
        else indices.push(grid[i][k + 1], grid[i + 1][k + 1], grid[i + 1][k]);
      }
    }
  }
  return { positions: new Float32Array(positions), indices: new Uint16Array(indices) };
}

/* ------------------------------------------------------------------------ */
// Matrices, column-major as GL wants them.

type Mat4 = Float32Array;

const DEG = Math.PI / 180;

/** Position and Euler XYZ rotation, in degrees, as three.js composes them. */
function model(position: number[], rotation: number[]): Mat4 {
  const [x, y, z] = rotation.map((r) => r * DEG);
  const [a, b, c, d, e, f] = [Math.cos(x), Math.sin(x), Math.cos(y), Math.sin(y), Math.cos(z), Math.sin(z)];
  // prettier-ignore
  return new Float32Array([
    c * e, a * f + b * e * d, b * f - a * e * d, 0,
    -c * f, a * e - b * f * d, b * e + a * f * d, 0,
    d, -b * c, a * c, 0,
    position[0], position[1], position[2], 1,
  ]);
}

/**
 * The view from a camera orbiting the origin, placed the way camera-controls
 * places it: polar angle from +Y, azimuth round it, kept a hair off the pole.
 * Returns the view matrix and its rotation's inverse (view to world).
 */
function orbit(distance: number, azimuth: number, polar: number) {
  const phi = Math.min(Math.max(polar * DEG, 1e-6), Math.PI - 1e-6);
  const theta = azimuth * DEG;
  const eye = [
    distance * Math.sin(phi) * Math.sin(theta),
    distance * Math.cos(phi),
    distance * Math.sin(phi) * Math.cos(theta),
  ];
  const norm = (v: number[]) => {
    const l = Math.hypot(v[0], v[1], v[2]);
    return v.map((x) => x / l);
  };
  const cross = (p: number[], q: number[]) => [
    p[1] * q[2] - p[2] * q[1],
    p[2] * q[0] - p[0] * q[2],
    p[0] * q[1] - p[1] * q[0],
  ];
  const zAxis = norm(eye);
  const xAxis = norm(cross([0, 1, 0], zAxis));
  const yAxis = cross(zAxis, xAxis);
  const dot = (p: number[], q: number[]) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
  // prettier-ignore
  const view = new Float32Array([
    xAxis[0], yAxis[0], zAxis[0], 0,
    xAxis[1], yAxis[1], zAxis[1], 0,
    xAxis[2], yAxis[2], zAxis[2], 0,
    -dot(xAxis, eye), -dot(yAxis, eye), -dot(zAxis, eye), 1,
  ]);
  // prettier-ignore
  const viewToWorld = new Float32Array([...xAxis, ...yAxis, ...zAxis]);
  return { view, viewToWorld };
}

function perspective(fovY: number, aspect: number, near: number, far: number): Mat4 {
  const f = 1 / Math.tan(fovY / 2);
  const nf = 1 / (near - far);
  // prettier-ignore
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]);
}

/* ------------------------------------------------------------------------ */
// Shaders.

const VERTEX = /* glsl */ `
precision highp float;
attribute vec3 position;
uniform mat4 uModel, uView, uProjection;
uniform float uTime, uDensity, uStrength, uFrequency, uAmplitude;
varying vec3 vPos, vNormal, vViewPosition;

// Periodic Perlin noise, from github.com/hughsk/glsl-noise (MIT), scaled by
// 2.2 as ShaderGradient scales it.
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec3 fade(vec3 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }
float pnoise(vec3 P, vec3 rep) {
  vec3 Pi0 = mod(floor(P), rep);
  vec3 Pi1 = mod(Pi0 + vec3(1.0), rep);
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P);
  vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;
  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);
  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);
  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);
  vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
  vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
  vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
  vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
  vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
  vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
  vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
  vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);
  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x; g010 *= norm0.y; g100 *= norm0.z; g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x; g011 *= norm1.y; g101 *= norm1.z; g111 *= norm1.w;
  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);
  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  return 2.2 * mix(n_yz.x, n_yz.y, fade_xyz.x);
}

vec3 rotateY(vec3 v, float a) {
  float c = cos(a), s = sin(a);
  return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c) * v;
}

void main() {
  vec3 normal = position;
  // three.js's spherical uv.y, which it stores flipped: 1 at the top pole,
  // 0 at the bottom.
  float v = 0.5 - atan(-position.y, length(position.xz)) / 3.14159265;

  float distortion = pnoise((normal + uTime) * uDensity, vec3(10.0)) * uStrength;
  float angle = sin(v * uFrequency + uTime) * uAmplitude;
  vec3 pos = rotateY(position + normal * distortion, angle);

  vPos = pos;
  // Lit as the undisplaced sphere, as the original is: its object-space
  // normal stands in for the view-space one.
  vNormal = normal;
  vViewPosition = -(uView * uModel * vec4(position, 1.0)).xyz;
  gl_Position = uProjection * uView * uModel * vec4(pos, 1.0);
}
`;

const FRAGMENT = /* glsl */ `
precision highp float;
varying vec3 vPos, vNormal, vViewPosition;
uniform vec3 uColor1, uColor2, uColor3;
uniform mat3 uViewToWorld;
uniform sampler2D uSpecular, uDiffuse;
uniform float uRange, uRoughness, uMetalness, uGrain, uPixel;

vec3 environment(sampler2D map, vec3 d) {
  vec2 uv = vec2(atan(d.z, d.x) / 6.28318531 + 0.5, 0.5 - asin(clamp(d.y, -1.0, 1.0)) / 3.14159265);
  vec4 c = texture2D(map, uv);
  return c.rgb * c.a * uRange;
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec3 albedo = mix(uColor3, mix(uColor2, uColor1, smoothstep(-1.0, 1.0, vPos.y)), length(vPos));

  // Image-based lighting as three.js's MeshPhysicalMaterial does it.
  // Not flipped for back faces: the folds the twist makes would otherwise
  // shade as dark slivers the original never shows.
  vec3 n = normalize(vNormal);
  vec3 view = normalize(vViewPosition);
  float roughness = uRoughness;
  vec3 r = normalize(mix(reflect(-view, n), n, roughness * roughness));
  vec3 radiance = environment(uSpecular, uViewToWorld * r);
  vec3 irradiance = environment(uDiffuse, uViewToWorld * n);

  vec3 diffuseColor = albedo * (1.0 - uMetalness);
  vec3 specularColor = mix(vec3(0.04), albedo, uMetalness);
  float nv = clamp(dot(n, view), 0.0, 1.0);
  vec4 r4 = roughness * vec4(-1.0, -0.0275, -0.572, 0.022) + vec4(1.0, 0.0425, 1.04, -0.04);
  float a004 = min(r4.x * r4.x, exp2(-9.28 * nv)) * r4.x + r4.y;
  vec2 fab = vec2(-1.04, 1.04) * a004 + r4.zw;
  vec3 single = specularColor * fab.x + fab.y;
  float ems = 1.0 - (fab.x + fab.y);
  vec3 favg = specularColor + (1.0 - specularColor) * 0.047619;
  vec3 multi = single * favg / (1.0 - ems * favg) * ems;
  vec3 scattered = single + multi;
  vec3 diffuse = diffuseColor * (1.0 - max(max(scattered.r, scattered.g), scattered.b));
  // A touch over 1: the baked environment loses a little energy to its blur.
  vec3 color = (diffuse * irradiance + radiance * single + multi * irradiance) * 1.06;

  // ShaderGradient's grain is a halftone pass, and a halftone's dots cover
  // area, not brightness: it deepens the mids into that saturated, near-black
  // contrast. Measured off its output, the curve is 1.88·c^3.24.
  color = min(1.882 * pow(max(color, 0.0), vec3(3.237)), 1.0);
  // Then the dots themselves, as fine noise per channel, strongest in the
  // mids where a halftone is most visibly broken up.
  vec2 cell = floor(gl_FragCoord.xy / uPixel);
  vec3 noise = vec3(hash(cell), hash(cell + 17.0), hash(cell + 41.0)) - 0.5;
  color += noise * uGrain * 2.0 * sqrt(color * (1.0 - color));

  gl_FragColor = vec4(color, 1.0);
}
`;

/* ------------------------------------------------------------------------ */

/** Hex to 0–1 channels, taken as they are: ShaderGradient does no colour conversion. */
function channels(hex: string) {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
}

function decode(base64: string) {
  const bin = atob(base64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/**
 * Where the camera looks from: round the sphere (azimuth, degrees), down from
 * its pole (polar, degrees; 180 looks up from beneath, the original view) and
 * how close (zoom: 1 frames the whole object, about 6 is the shadergradient.co
 * close-up of its surface).
 */
export interface View {
  azimuth: number;
  polar: number;
  zoom: number;
}

export const OBJECT_VIEW: View = { azimuth: 270, polar: 180, zoom: 1 };

export interface Field {
  /** Draws one frame at a time in seconds, easing the camera toward its view. */
  draw: (seconds: number) => void;
  /** Sends the camera somewhere; `jump` goes there at once instead of gliding. */
  setView: (view: View, jump?: boolean) => void;
  /** Matches the drawing buffer to the canvas's size on screen. */
  resize: () => void;
  destroy: () => void;
}

/** Sets up the render on a canvas, or returns null where WebGL isn't available. */
export function createField(
  canvas: HTMLCanvasElement,
  initial: View = OBJECT_VIEW,
  settings: FieldSettings = LANDING,
): Field | null {
  const gl = canvas.getContext("webgl", { antialias: true, alpha: false, powerPreference: "low-power" });
  if (!gl) return null;

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) ?? "Shader failed to compile.");
    }
    return shader;
  };
  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? "Shader failed to link.");
  }
  gl.useProgram(program);

  const mesh = icosphere(DETAIL);
  const positions = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positions);
  gl.bufferData(gl.ARRAY_BUFFER, mesh.positions, gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0);
  const indices = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);

  const textures = [SPECULAR, DIFFUSE].map((map, unit) => {
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, map.width, map.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, decode(map.data));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return texture;
  });

  const at = (name: string) => gl.getUniformLocation(program, name);
  gl.uniformMatrix4fv(at("uModel"), false, model([-0.1, 0, 0], [0, 130, 70]));
  const uView = at("uView");
  const uViewToWorld = at("uViewToWorld");
  settings.colors.forEach((hex, i) => gl.uniform3fv(at(`uColor${i + 1}`), channels(hex)));
  gl.uniform1f(at("uDensity"), settings.density);
  gl.uniform1f(at("uStrength"), settings.strength);
  gl.uniform1f(at("uFrequency"), settings.frequency);
  gl.uniform1f(at("uAmplitude"), settings.amplitude);
  gl.uniform1f(at("uRoughness"), settings.roughness);
  gl.uniform1f(at("uMetalness"), settings.metalness);
  gl.uniform1f(at("uGrain"), settings.grain);
  gl.uniform1f(at("uRange"), RANGE);
  gl.uniform1i(at("uSpecular"), 0);
  gl.uniform1i(at("uDiffuse"), 1);
  const uTime = at("uTime");
  const uProjection = at("uProjection");
  const uPixel = at("uPixel");

  gl.enable(gl.DEPTH_TEST);
  // The page's black (#050505), so the canvas edge never shows.
  gl.clearColor(5 / 255, 5 / 255, 5 / 255, 1);

  // A 45° lens zoomed 15.1×, as the camera was set. At zoom 1 the camera
  // pulls back for the whole object: a little under half the height on a wide
  // screen, most of the width on a tall one. Higher zooms close in from there.
  const lens = Math.tan(22.5 * DEG) / 15.1;
  const OBJECT_HEIGHT = lens * 5.9;
  const OBJECT_WIDTH = lens * 3.6;
  let aspect = 1;

  // The camera eases toward its target; the current view is what's drawn.
  const current: View = { ...initial };
  let target: View = { ...initial };
  let lastSeconds = -1;

  const place = () => {
    const { view, viewToWorld } = orbit(14, current.azimuth, current.polar);
    gl.uniformMatrix4fv(uView, false, view);
    gl.uniformMatrix3fv(uViewToWorld, false, viewToWorld);
    const half = Math.max(OBJECT_HEIGHT, OBJECT_WIDTH / aspect) / current.zoom;
    gl.uniformMatrix4fv(uProjection, false, perspective(2 * Math.atan(half), aspect, 0.1, 1000));
  };

  const resize = () => {
    // The image is soft and the grain is the texture; one buffer pixel per
    // CSS pixel is all it needs, and keeps the fill cost flat on Retina.
    const width = Math.max(1, Math.round(canvas.clientWidth));
    const height = Math.max(1, Math.round(canvas.clientHeight));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, width, height);
    aspect = width / height;
    place();
    // Grain at a single CSS pixel: fine enough to read as film, not dots.
    gl.uniform1f(uPixel, 1);
  };
  resize();

  return {
    draw(seconds) {
      const dt = lastSeconds < 0 ? 0 : Math.min(Math.max(seconds - lastSeconds, 0), 0.1);
      lastSeconds = seconds;
      // Exponential glide: quick to leave, slow to arrive.
      const k = 1 - Math.exp(-dt * 2.4);
      current.azimuth += (target.azimuth - current.azimuth) * k;
      current.polar += (target.polar - current.polar) * k;
      current.zoom += (target.zoom - current.zoom) * k;
      place();
      gl.uniform1f(uTime, seconds * settings.speed);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawElements(gl.TRIANGLES, mesh.indices.length, gl.UNSIGNED_SHORT, 0);
    },
    setView(view, jump = false) {
      target = { ...view };
      if (jump) {
        Object.assign(current, view);
        place();
      }
    },
    resize,
    destroy() {
      gl.deleteBuffer(positions);
      gl.deleteBuffer(indices);
      textures.forEach((t) => gl.deleteTexture(t));
      gl.deleteProgram(program);
    },
  };
}
