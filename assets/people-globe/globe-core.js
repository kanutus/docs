/* Shared core of the Kanutus dot-matrix globes (ES module, plain 2D canvas, no dependencies).
   Used by globe.js (hero: green city markers + arcs) and people-globe.js (photo balloons + speech bubbles).
   The core owns: land dots (globe-data.js), projection, sizing (square, DPR-aware), auto-rotation, drag to spin,
   prefers-reduced-motion (one static frame, redraw only on drag), pause when off-screen / tab hidden.
   Anything on top of the sphere is drawn by `overlay(ctx, globe, clockMs, dtMs)`. */
import "./globe-data.js"; // sets window.KANUTUS_GLOBE_POINTS (lat*100, lng*100 pairs)

export const ACCENT = "#76b900";
const DOT = "209,209,214"; // --ink-2
const D2R = Math.PI / 180;

export function unit(lat, lng) {
  const la = lat * D2R;
  const lo = lng * D2R;
  return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
}

/** Great-circle samples between unit vectors a and b, lifted in the middle (so arcs read as arcs). */
export function arcPath(a, b, seg = 48) {
  const dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const omega = Math.acos(Math.max(-1, Math.min(1, dot)));
  const so = Math.sin(omega) || 1e-6;
  const p = new Float32Array((seg + 1) * 3);
  const lifts = new Float32Array(seg + 1);
  for (let s = 0; s <= seg; s++) {
    const t = s / seg;
    const wa = Math.sin((1 - t) * omega) / so;
    const wb = Math.sin(t * omega) / so;
    const lift = 1 + 0.14 * Math.sin(Math.PI * t) * (omega / Math.PI + 0.5);
    p[s * 3] = (wa * a[0] + wb * b[0]) * lift;
    p[s * 3 + 1] = (wa * a[1] + wb * b[1]) * lift;
    p[s * 3 + 2] = (wa * a[2] + wb * b[2]) * lift;
    lifts[s] = lift;
  }
  return { p, lifts, seg };
}

let landCache = null;
function landVectors() {
  if (landCache) return landCache;
  const pts = window.KANUTUS_GLOBE_POINTS;
  if (!pts) return null;
  const n = pts.length / 2;
  const land = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const u = unit(pts[i * 2] / 100, pts[i * 2 + 1] / 100);
    land[i * 3] = u[0];
    land[i * 3 + 1] = u[1];
    land[i * 3 + 2] = u[2];
  }
  landCache = { land, n };
  return landCache;
}

export const prefersReducedMotion = () => typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * createGlobe(canvas, options) → globe | null
 * options: phi (start rotation, rad; front longitude = -phi), theta (tilt), spin (rad/ms), radius (fraction of the side),
 *          reduce (bool, default from the media query), dragTarget (element receiving pointer events, default canvas),
 *          sizeTarget (element measured for the square size, default canvas), overlay(ctx, globe, clockMs, dtMs).
 * globe: { ctx, W, H, R, CX, CY, phi, reduce, project(x,y,z,out), draw(), start(), stop(), destroy() }
 * project() writes [screenX, screenY, depth] (depth > 0 = visible hemisphere, 1 = centre of the disc).
 */
export function createGlobe(canvas, options = {}) {
  const data = landVectors();
  if (!canvas || !data || !canvas.getContext) return null;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const { land, n: N } = data;
  const reduce = options.reduce ?? prefersReducedMotion();
  const theta = options.theta ?? 0.38;
  const cT = Math.cos(theta);
  const sT = Math.sin(theta);
  const spin = options.spin ?? 0.00011;
  const radius = options.radius ?? 0.42;
  const dragTarget = options.dragTarget || canvas;
  const sizeTarget = options.sizeTarget || canvas;
  const overlay = options.overlay || null;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const g = {
    ctx, canvas, reduce,
    W: 0, H: 0, R: 0, CX: 0, CY: 0,
    phi: options.phi ?? -0.9,
    clock: 0, // ms of animation time (only advances while running)
    dragging: false,
    project,
    draw,
    start,
    stop,
    destroy,
    resize,
  };
  let cP = Math.cos(g.phi);
  let sP = Math.sin(g.phi);
  let cachedPhi = g.phi;
  let vel = 0;
  let lastX = 0;
  let running = false;
  let visible = true;
  let raf = 0;
  let last = 0;

  function resize() {
    const rect = sizeTarget.getBoundingClientRect();
    const size = Math.max(1, Math.round(Math.min(rect.width, rect.height || rect.width)));
    g.W = g.H = size;
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.R = size * radius;
    g.CX = size / 2;
    g.CY = size / 2;
  }

  function project(x, y, z, out) {
    if (cachedPhi !== g.phi) {
      cachedPhi = g.phi;
      cP = Math.cos(g.phi);
      sP = Math.sin(g.phi);
    }
    const x1 = x * cP + z * sP;
    const z1 = -x * sP + z * cP;
    out[0] = g.CX + x1 * g.R;
    out[1] = g.CY - (y * cT - z1 * sT) * g.R;
    out[2] = y * sT + z1 * cT;
    return out;
  }

  const tmp = [0, 0, 0];
  function draw(dt = 0) {
    const { W, H, R, CX, CY } = g;
    ctx.clearRect(0, 0, W, H);
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, Math.PI * 2);
    ctx.fillStyle = "#0e0e10";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.stroke();

    const r = Math.max(0.9, R / 190);
    for (let i = 0; i < N; i++) {
      project(land[i * 3], land[i * 3 + 1], land[i * 3 + 2], tmp);
      const z = tmp[2];
      if (z <= 0.02) continue;
      ctx.fillStyle = "rgba(" + DOT + "," + (0.18 + 0.72 * z).toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(tmp[0], tmp[1], r * (0.75 + 0.45 * z), 0, Math.PI * 2);
      ctx.fill();
    }
    if (overlay) overlay(ctx, g, g.clock, dt);
  }

  function frame(now) {
    if (!running) return;
    const dt = last ? Math.min(50, now - last) : 16;
    last = now;
    g.clock += dt;
    if (!g.dragging) {
      g.phi += (spin + vel) * dt;
      vel *= 0.94;
    }
    draw(dt);
    raf = requestAnimationFrame(frame);
  }
  function start() {
    if (running || reduce || !visible || document.hidden) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  // drag to rotate
  function down(e) {
    if (e.button !== undefined && e.button !== 0) return;
    g.dragging = true;
    lastX = e.clientX;
    vel = 0;
    try {
      dragTarget.setPointerCapture(e.pointerId);
    } catch {}
  }
  function move(e) {
    if (!g.dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    g.phi += dx * 0.006;
    vel = dx * 0.00025;
    if (reduce) draw(0);
  }
  function up() {
    g.dragging = false;
  }
  dragTarget.addEventListener("pointerdown", down);
  dragTarget.addEventListener("pointermove", move);
  dragTarget.addEventListener("pointerup", up);
  dragTarget.addEventListener("pointercancel", up);

  let io = null;
  if (!reduce && "IntersectionObserver" in window) {
    io = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      visible ? start() : stop();
    }, { threshold: 0.05 });
    io.observe(sizeTarget);
  }
  const onVis = () => (document.hidden ? stop() : start());
  document.addEventListener("visibilitychange", onVis);

  let rt = 0;
  const onResize = () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      resize();
      draw(0);
    }, 80);
  };
  let ro = null;
  if ("ResizeObserver" in window) {
    ro = new ResizeObserver(onResize);
    ro.observe(sizeTarget);
  } else window.addEventListener("resize", onResize);

  function destroy() {
    stop();
    clearTimeout(rt);
    io && io.disconnect();
    ro ? ro.disconnect() : window.removeEventListener("resize", onResize);
    document.removeEventListener("visibilitychange", onVis);
    dragTarget.removeEventListener("pointerdown", down);
    dragTarget.removeEventListener("pointermove", move);
    dragTarget.removeEventListener("pointerup", up);
    dragTarget.removeEventListener("pointercancel", up);
  }

  resize();
  if (!io) start();
  return g;
}
