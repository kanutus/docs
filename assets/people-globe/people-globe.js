/* "People globe" (ES module, vanilla, no dependencies): the Kanutus dot globe (globe-core.js) with round photo
   balloons of real people at their cities, green arcs between pairs and speech bubbles — the sentence in the
   speaker's language at A and, when the arc lands, the translation in B's language.

   Usage:   import { mountPeopleGlobe } from "/assets/people-globe.js";
            const globe = mountPeopleGlobe(element, options);   // element needs a definite width and height
            globe.destroy();

   options: people, conversations (defaults below) · assets (base URL of photos/ and flags/, default = folder of this
            file) · maxConcurrent (1–2, default 2; 1 when the element is narrower than 520 px) · radius (default 0.4)
            · reduce (default = prefers-reduced-motion: one still frame with one conversation) · phi (start rotation)
            · maxVisible (balloons on screen at once, default 9; 8 on small globes) · spacing (min arc between
            balloons in degrees, default 16; the default cities are already ≥ 18° apart)
            · lost (default false): the "connection lost" variant of the 404 pages — the message leaves A, the arc
            breaks halfway, a red ✕ marks the spot and B never answers (the quiet network is drawn broken too).
   Behaviour: balloons only on the visible hemisphere (fade near the rim), never two circles touching on screen (the
   one farther from the centre fades out), max 1–2 conversations at a time from a queue (pairs in view when they
   start and still in view when B answers), bubbles placed so they do not overlap, pauses off-screen / hidden tab,
   drag to spin. Photos (640 px) are requested only when a person is about to rotate into view, and a balloon only
   shows once its photo has loaded. Decorative: aria-hidden. */
import { ACCENT, arcPath, createGlobe, prefersReducedMotion, unit } from "./globe-core.js";

const D2R = Math.PI / 180;

/** 24 people spread over every continent, every pair at least ~18° of arc apart (Europe keeps only Lisbon, Berlin and
    Reykjavík; East Asia only Beijing and Tokyo), so any rotation shows several faces and none of them collide.
    The Pacific side gets Honolulu, Papeete, Auckland, Vancouver, Lima and Santiago.
    focus = object-position of the 4:3 photo inside the round crop (moves the face to the centre before the zoom). */
export const PEOPLE = [
  { id: "ana", name: "Ana", cc: "br", lang: "pt-BR", code: "PT", lat: -23.55, lng: -46.63, focus: "50% 50%" },
  { id: "tom", name: "Tom", cc: "us", lang: "en-US", code: "EN", lat: 40.71, lng: -74.0, focus: "50% 50%" },
  { id: "diego", name: "Diego", cc: "mx", lang: "es-MX", code: "ES", lat: 19.43, lng: -99.13, focus: "62% 50%" },
  { id: "lena", name: "Lena", cc: "fr", lang: "fr-FR", code: "FR", lat: 38.72, lng: -9.14, focus: "50% 50%" },
  { id: "sigrun", name: "Sigrún", cc: "is", lang: "is-IS", code: "IS", lat: 64.15, lng: -21.94, focus: "50% 50%" },
  { id: "jonas", name: "Jonas", cc: "de", lang: "de-DE", code: "DE", lat: 52.52, lng: 13.4, focus: "50% 50%" },
  { id: "marcus", name: "Marcus", cc: "ng", lang: "en-NG", code: "EN", lat: 6.52, lng: 3.38, focus: "50% 50%" },
  { id: "sipho", name: "Sipho", cc: "za", lang: "zu-ZA", code: "ZU", lat: -33.92, lng: 18.42, focus: "50% 50%" },
  { id: "wanjiru", name: "Wanjiru", cc: "ke", lang: "sw-KE", code: "SW", lat: -1.29, lng: 36.82, focus: "56% 50%" },
  { id: "emre", name: "Emre", cc: "tr", lang: "tr-TR", code: "TR", lat: 39.93, lng: 32.86, focus: "50% 50%" },
  { id: "olga", name: "Olga", cc: "ru", lang: "ru-RU", code: "RU", lat: 56.84, lng: 60.6, focus: "50% 50%" },
  { id: "omar", name: "Omar", cc: "ae", lang: "ar-AE", code: "AR", lat: 25.2, lng: 55.27, focus: "50% 50%" },
  { id: "priya", name: "Priya", cc: "in", lang: "en-IN", code: "EN", lat: 12.97, lng: 77.59, focus: "50% 50%" },
  { id: "ploy", name: "Ploy", cc: "th", lang: "th-TH", code: "TH", lat: 13.75, lng: 100.5, focus: "50% 50%" },
  { id: "mei", name: "Mei", cc: "cn", lang: "zh-CN", code: "ZH", lat: 39.9, lng: 116.4, focus: "50% 50%" },
  { id: "kenji", name: "Kenji", cc: "jp", lang: "ja", code: "JA", lat: 35.68, lng: 139.69, focus: "50% 50%" },
  { id: "budi", name: "Budi", cc: "id", lang: "id-ID", code: "ID", lat: -6.2, lng: 106.85, focus: "50% 50%" },
  { id: "kate", name: "Kate", cc: "au", lang: "en-AU", code: "EN", lat: -33.87, lng: 151.21, focus: "46% 50%" },
  { id: "aroha", name: "Aroha", cc: "nz", lang: "en-NZ", code: "EN", lat: -36.85, lng: 174.76, focus: "50% 50%" },
  { id: "moana", name: "Moana", cc: "pf", lang: "fr-PF", code: "FR", lat: -17.53, lng: -149.57, focus: "50% 50%" },
  { id: "keoni", name: "Keoni", cc: "us", lang: "en-US", code: "EN", lat: 21.31, lng: -157.86, focus: "50% 50%" },
  { id: "liam", name: "Liam", cc: "ca", lang: "en-CA", code: "EN", lat: 49.28, lng: -123.12, focus: "50% 50%" },
  { id: "lucia", name: "Lucía", cc: "pe", lang: "es-PE", code: "ES", lat: -12.05, lng: -77.04, focus: "50% 50%" },
  { id: "valentina", name: "Valentina", cc: "cl", lang: "es-CL", code: "ES", lat: -33.45, lng: -70.67, focus: "50% 50%" },
];

const NNBSP = " "; // French puts a narrow no-break space before ? and !
/** Short, idiomatic lines: `say` in the speaker's language, `tr` as a native of the listener's language would say it.
    Pairs sit on the same side of the globe; the queue only starts the ones whose two people are both in view. */
export const CONVERSATIONS = [
  { from: "ana", to: "lena", say: "Vamos fechar na sexta?", tr: `On boucle ça vendredi${NNBSP}?` },
  { from: "omar", to: "priya", say: "مرحبًا! نبدأ الآن؟", tr: "Hi! Shall we get started?" },
  { from: "tom", to: "diego", say: "Let’s ship it.", tr: "¡Lancémoslo!" },
  { from: "kenji", to: "mei", say: "来週のリリース、いけそうです。", tr: "下周的发布应该没问题。" },
  { from: "jonas", to: "sigrun", say: "Ich schicke dir die Dateien morgen früh.", tr: "Ég sendi þér skjölin í fyrramálið." },
  { from: "moana", to: "keoni", say: `On commence dans cinq minutes${NNBSP}?`, tr: "Starting in five, okay?" },
  { from: "priya", to: "mei", say: "Can we move the demo to Monday?", tr: "演示能改到周一吗？" },
  { from: "sipho", to: "marcus", say: "Ngiyabonga kakhulu, sizobonana kusasa!", tr: "Thanks so much, see you tomorrow!" },
  { from: "lucia", to: "tom", say: "Te paso el informe en una hora.", tr: "I’ll send you the report in an hour." },
  { from: "kenji", to: "kate", say: "明日の朝、確認します。", tr: "I’ll check it first thing tomorrow." },
  { from: "emre", to: "olga", say: "Toplantıyı yarına alalım mı?", tr: "Перенесём встречу на завтра?" },
  { from: "valentina", to: "ana", say: "¡Quedó increíble, gracias!", tr: "Ficou incrível, valeu!" },
  { from: "budi", to: "mei", say: "Desainnya sudah siap.", tr: "设计稿已经好了。" },
  { from: "wanjiru", to: "omar", say: "Asante sana, tuonane kesho!", tr: "شكرًا جزيلًا، نراك غدًا!" },
  { from: "aroha", to: "moana", say: "Kia ora! Thanks for joining.", tr: `Merci d’être venue${NNBSP}!` },
  { from: "keoni", to: "diego", say: "Ready when you are.", tr: "Cuando quieras, empezamos." },
  { from: "lena", to: "jonas", say: "Je t’envoie le contrat ce soir.", tr: "Ich schicke dir heute Abend den Vertrag." },
  { from: "ploy", to: "budi", say: "เริ่มกันเลยไหมคะ", tr: "Kita mulai sekarang?" },
  { from: "marcus", to: "wanjiru", say: "We’re live in Lagos!", tr: "Tumezindua huduma Lagos!" },
  { from: "liam", to: "diego", say: "Can we push the call to three?", tr: "¿Podemos mover la llamada a las tres?" },
  { from: "olga", to: "mei", say: "Отправлю договор вечером.", tr: "我今晚把合同发过去。" },
  { from: "kate", to: "ploy", say: "No worries, I’ll sort it out.", tr: "ไม่ต้องห่วงนะคะ เดี๋ยวจัดการให้เองค่ะ" },
  { from: "sigrun", to: "lena", say: "Getum við byrjað núna?", tr: `On commence maintenant${NNBSP}?` },
  { from: "diego", to: "ana", say: "¿Nos vemos a las diez?", tr: "A gente se vê às dez?" },
  { from: "omar", to: "emre", say: "العرض جاهز للمراجعة.", tr: "Sunum incelemeye hazır." },
  { from: "budi", to: "kate", say: "Terima kasih, sampai besok!", tr: "Cheers, see you tomorrow!" },
  { from: "keoni", to: "kenji", say: "Mahalo! Talk soon.", tr: "ありがとう！また話しましょう。" },
  { from: "marcus", to: "ana", say: "Quick sync before lunch?", tr: "Bora alinhar antes do almoço?" },
  { from: "emre", to: "jonas", say: "Harika iş çıkardınız!", tr: "Super gemacht, Leute!" },
  { from: "kate", to: "moana", say: "Can you send me the slides?", tr: `Tu peux m’envoyer les slides${NNBSP}?` },
  { from: "priya", to: "budi", say: "Let’s lock in the date.", tr: "Yuk, kita pastikan tanggalnya." },
  { from: "jonas", to: "olga", say: "Danke, bis morgen!", tr: "Спасибо, до завтра!" },
  { from: "lucia", to: "ana", say: "¿Revisamos el plan juntas?", tr: "Vamos revisar o plano juntas?" },
  { from: "wanjiru", to: "priya", say: "Tuanze sasa?", tr: "Shall we start now?" },
  { from: "mei", to: "kenji", say: "没问题，我来安排。", tr: "了解です。こちらで手配しますね。" },
  { from: "sipho", to: "wanjiru", say: "Sawubona! Singaqala manje?", tr: "Habari! Tuanze sasa?" },
  { from: "tom", to: "ana", say: "Can you take this one?", tr: "Consegue pegar essa?" },
  { from: "aroha", to: "budi", say: "Sweet as, let’s do it!", tr: "Siap, ayo kita kerjakan!" },
  { from: "sigrun", to: "tom", say: "Takk fyrir, sjáumst á morgun!", tr: "Thanks, see you tomorrow!" },
  { from: "lena", to: "marcus", say: `Bravo à toute l’équipe${NNBSP}!`, tr: "Great work, everyone!" },
  { from: "kenji", to: "priya", say: "資料、ありがとうございます！", tr: "Thanks so much for the deck!" },
  { from: "ploy", to: "priya", say: "ขอบคุณมากค่ะ เจอกันพรุ่งนี้นะคะ", tr: "Thank you so much, see you tomorrow!" },
  { from: "liam", to: "moana", say: "Great call, thanks everyone!", tr: `Super réunion, merci à tous${NNBSP}!` },
];

// timeline of one conversation (ms)
const ARC_START = 650;
const ARC_END = 1850;
const B_IN = 1850;
const OUT = 5300;
const END = 5700;
const GAP = 2900; // between the starts of two conversations
const SEG = 40;
// lost variant: where the arc breaks (fraction of A → B) and the red of the ✕ (--danger)
const BREAK = 0.52;
const DANGER = "255,105,97";

const CSS = `
.kpg{position:relative;container-type:size;touch-action:pan-y;cursor:grab;user-select:none;-webkit-user-select:none;overflow:visible}
.kpg:active{cursor:grabbing}
.kpg-stage{position:absolute;left:50%;top:50%;width:min(100cqw,100cqh);height:min(100cqw,100cqh);transform:translate(-50%,-50%)}
.kpg-canvas{display:block;width:100%;height:100%}
.kpg-layer{position:absolute;inset:0;pointer-events:none}
.kpg-person{position:absolute;left:0;top:0;width:var(--kpg-av,44px);height:var(--kpg-av,44px);will-change:transform,opacity;visibility:hidden}
.kpg-ph{position:absolute;inset:0;border-radius:50%;overflow:hidden;background:#2c2c2e;box-shadow:0 0 0 1.5px rgba(245,245,247,.9),0 6px 16px rgba(0,0,0,.55);transition:box-shadow .2s cubic-bezier(.2,.8,.2,1)}
.kpg-ph img{display:block;width:100%;height:100%;object-fit:cover;transform:scale(1.45);transform-origin:50% 38%}
.kpg-person.is-on .kpg-ph{box-shadow:0 0 0 2px ${ACCENT},0 6px 16px rgba(0,0,0,.55)}
.kpg-flag{position:absolute;right:-3px;bottom:-3px;width:40%;height:40%;border-radius:50%;overflow:hidden;box-shadow:0 0 0 2px #000;background:#000}
.kpg-flag img{display:block;width:100%;height:100%;object-fit:cover}
.kpg-bubble{position:absolute;left:0;top:0;z-index:1000;box-sizing:border-box;width:max-content;max-width:var(--kpg-bw,230px);padding:.5em .8em .65em;font-size:var(--kpg-fs,14px);border-radius:14px;background:#1c1c1e;border:1px solid #48484a;color:#f5f5f7;box-shadow:0 10px 28px rgba(0,0,0,.6);opacity:0;will-change:transform,opacity;text-align:left}
.kpg-meta{display:flex;gap:6px;align-items:baseline;font-size:var(--kpg-ms,11px);line-height:1.27;font-weight:600;color:#a1a1a6;white-space:nowrap}
.kpg-meta b{font-weight:600;color:#8e8e93;letter-spacing:.02em}
.kpg-meta b i{font-style:normal;color:#9be01f}
.kpg-text{margin:3px 0 0;text-align:start;unicode-bidi:plaintext;font-size:var(--kpg-fs,14px);line-height:1.36;font-weight:500;color:#f5f5f7}
.kpg-tail{position:absolute;width:10px;height:10px;background:#1c1c1e;border:1px solid #48484a;transform:rotate(45deg)}
.kpg-bubble.is-up .kpg-tail{bottom:-6px;border-top:0;border-left:0}
.kpg-bubble.is-down .kpg-tail{top:-6px;border-bottom:0;border-right:0}
.kpg-meta b s{text-decoration:line-through;text-decoration-thickness:1.5px;color:rgb(${DANGER})}
`;

function injectCss() {
  if (document.getElementById("kpg-css")) return;
  const s = document.createElement("style");
  s.id = "kpg-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const smooth = (a, b, v) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/** Balloon positions (`d`, unit vectors): the real cities pushed apart until every pair is at least `min` radians
    apart, with a weak spring back to the city. Runs once at mount (~25 people, a few ms); the pin line covers the gap. */
function spread(people, min) {
  const n = people.length;
  for (const p of people) p.d = p.v.slice();
  for (let it = 0; it < 160; it++) {
    for (let i = 0; i < n; i++) {
      const a = people[i].d;
      for (let j = i + 1; j < n; j++) {
        const b = people[j].d;
        const ang = Math.acos(clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1));
        if (ang >= min) continue;
        let dx = a[0] - b[0], dy = a[1] - b[1], dz = a[2] - b[2];
        const len = Math.hypot(dx, dy, dz) || 1e-6;
        const k = ((min - ang) * 0.5) / len;
        dx *= k; dy *= k; dz *= k;
        a[0] += dx; a[1] += dy; a[2] += dz;
        b[0] -= dx; b[1] -= dy; b[2] -= dz;
      }
    }
    for (const p of people) {
      const d = p.d;
      if (it < 120) for (let c = 0; c < 3; c++) d[c] += (p.v[c] - d[c]) * 0.04; // last passes: spacing only
      const l = Math.hypot(d[0], d[1], d[2]);
      d[0] /= l; d[1] /= l; d[2] /= l;
    }
  }
  for (const p of people) p.pin = Math.acos(clamp(p.v[0] * p.d[0] + p.v[1] * p.d[1] + p.v[2] * p.d[2], -1, 1)) > 1.2 * D2R;
}

export function mountPeopleGlobe(el, options = {}) {
  if (!el) return null;
  injectCss();
  const base = options.assets ? String(options.assets).replace(/\/?$/, "/") : new URL("./", import.meta.url).href;
  const people = (options.people || PEOPLE).map((p) => ({ ...p, v: unit(p.lat, p.lng), x: 0, y: 0, z: -1, alpha: 0, pres: 0, target: false, on: false, shown: false }));
  spread(people, (options.spacing ?? 16) * D2R);
  const byId = Object.fromEntries(people.map((p) => [p.id, p]));
  const convs = (options.conversations || CONVERSATIONS).filter((c) => byId[c.from] && byId[c.to]);
  const reduce = options.reduce ?? prefersReducedMotion();
  const lost = Boolean(options.lost);
  const still = convs[0];
  const midLng = still ? (byId[still.from].lng + byId[still.to].lng) / 2 : 20;
  const phi0 = options.phi ?? -midLng * D2R;

  el.classList.add("kpg");
  el.setAttribute("aria-hidden", "true");
  // Laid out in screen coordinates and speaking the people's languages: stays LTR on RTL pages too.
  el.setAttribute("dir", "ltr");
  const stage = document.createElement("div");
  stage.className = "kpg-stage";
  const canvas = document.createElement("canvas");
  canvas.className = "kpg-canvas";
  stage.appendChild(canvas);
  const layer = document.createElement("div");
  layer.className = "kpg-layer";
  el.append(stage, layer);

  for (const p of people) {
    const d = document.createElement("div");
    d.className = "kpg-person";
    d.innerHTML = `<div class="kpg-ph"><img alt="" decoding="async" draggable="false"></div><span class="kpg-flag"><img alt="" decoding="async" draggable="false"></span>`;
    const [photo, flag] = d.querySelectorAll("img");
    photo.style.objectPosition = p.focus || "50% 50%";
    p.photo = photo;
    p.flag = flag;
    p.ready = false; // a balloon is only shown once its photo has loaded (never an empty grey disc)
    layer.appendChild(d);
    p.el = d;
  }
  // lazy photos: requested when the person is about to rotate into view (or is in view), not at mount
  function request(p) {
    if (p.req) return;
    p.req = true;
    p.photo.onload = () => (p.ready = true);
    p.photo.src = `${base}photos/face-${p.id}-640.webp`;
    p.flag.src = `${base}flags/${p.cc}.svg`;
  }

  // element size (layer coordinates) and the square stage offset inside it
  let EW = 0, EH = 0, OX = 0, OY = 0, AV = 44, BW = 230, sizeKey = "";
  function measure(w, h) {
    EW = w;
    EH = h;
    const s = Math.min(w, h);
    OX = (w - s) / 2;
    OY = (h - s) / 2;
  }
  const r0 = el.getBoundingClientRect();
  measure(r0.width, r0.height);

  const active = [];
  let queue = 0;
  let nextAt = 400;
  const busy = (id) => active.some((c) => c.a.id === id || c.b.id === id);

  const g = createGlobe(canvas, { phi: phi0, radius: options.radius ?? 0.4, reduce, dragTarget: el, sizeTarget: stage, overlay });
  if (!g) {
    el.removeChild(stage);
    el.removeChild(layer);
    return null;
  }
  const spin = 0.00011;

  function depthAt(v, phi) {
    const z1 = -v[0] * Math.sin(phi) + v[2] * Math.cos(phi);
    return v[1] * Math.sin(0.38) + z1 * Math.cos(0.38);
  }

  function makeBubble(person, partner, text, lang, meta) {
    const b = document.createElement("div");
    b.className = "kpg-bubble";
    b.innerHTML = `<div class="kpg-meta"><span></span><b></b></div><p class="kpg-text"></p><i class="kpg-tail"></i>`;
    b.querySelector(".kpg-meta span").textContent = person.name;
    b.querySelector(".kpg-meta b").innerHTML = meta;
    const t = b.querySelector(".kpg-text");
    t.textContent = text;
    t.setAttribute("lang", lang);
    t.dir = "auto";
    layer.appendChild(b);
    const bub = { el: b, tail: b.querySelector(".kpg-tail"), w: b.offsetWidth, h: b.offsetHeight, up: true, ax: 0, person, rect: null };
    // pick the spot (above/below × centred/left/right) that stays in the box and covers the fewest bubbles and
    // balloons — never the other person of the conversation if it can be helped
    const others = active.flatMap((c) => [c.bubA, c.bubB]).filter((o) => o && o !== bub && o.rect);
    const faces = people.filter((q) => q !== person && q.alpha > 0.2).map((q) => ({ w: partner === q ? 4 : 1.5, r: { x: q.x - AV / 2, y: q.y - AV / 2, w: AV, h: AV } }));
    const score = (r) => {
      let s = 0;
      if (r.y < 2) s += 1000 + (2 - r.y) * 10;
      if (r.y + r.h > EH - 2) s += 1000 + (r.y + r.h - EH) * 10;
      for (const o of others) s += overlap(r, o.rect, 8);
      for (const f of faces) s += f.w * overlap(r, f.r, 4);
      return s;
    };
    let best = null;
    for (const [up, ax, bias] of [[true, 0, 0], [false, 0, 40], [true, -1, 120], [true, 1, 120], [false, -1, 160], [false, 1, 160]]) {
      const sc = score(rectFor(bub, up, ax)) + bias;
      if (!best || sc < best.sc) best = { up, ax, sc };
    }
    bub.up = best.up;
    bub.ax = best.ax;
    b.classList.add(bub.up ? "is-up" : "is-down");
    bub.rect = rectFor(bub, bub.up, bub.ax);
    return bub;
  }
  function rectFor(bub, up, ax = bub.ax) {
    const p = bub.person;
    const half = (AV / 2) * (0.8 + 0.2 * p.alpha);
    const left = ax === 0 ? p.x - bub.w / 2 : ax < 0 ? p.x - bub.w + 26 : p.x - 26;
    const x = clamp(left, 4, Math.max(4, EW - bub.w - 4));
    const y = up ? p.y - half - 12 - bub.h : p.y + half + 12;
    return { x, y, w: bub.w, h: bub.h };
  }
  function overlap(a, b, m) {
    const ox = Math.min(a.x + a.w + m, b.x + b.w + m) - Math.max(a.x - m, b.x - m);
    const oy = Math.min(a.y + a.h + m, b.y + b.h + m) - Math.max(a.y - m, b.y - m);
    return ox > 0 && oy > 0 ? ox * oy : 0;
  }
  function placeBubble(bub, k) {
    if (!bub) return;
    const r = rectFor(bub, bub.up, bub.ax);
    bub.rect = r;
    const a = k * bub.person.alpha;
    if (a <= 0.01) {
      bub.el.style.opacity = "0";
      return;
    }
    const s = 0.92 + 0.08 * k;
    bub.el.style.transformOrigin = `${clamp(bub.person.x - r.x, 12, r.w - 12)}px ${bub.up ? "100%" : "0%"}`;
    bub.el.style.transform = `translate3d(${r.x.toFixed(1)}px,${(r.y + (1 - k) * (bub.up ? 6 : -6)).toFixed(1)}px,0) scale(${s.toFixed(3)})`;
    bub.el.style.opacity = a.toFixed(3);
    bub.tail.style.left = `${(clamp(bub.person.x - r.x, 14, r.w - 14) - 5).toFixed(1)}px`;
  }

  function pick(clock) {
    const maxC = options.maxConcurrent ?? (EW < 520 ? 1 : 2);
    if (active.length >= maxC || clock < nextAt || !convs.length) return;
    const future = g.phi + spin * OUT * 0.7; // both must still be in view when B answers
    for (let i = 0; i < convs.length; i++) {
      const idx = (queue + i) % convs.length;
      const c = convs[idx];
      const a = byId[c.from];
      const b = byId[c.to];
      if (busy(a.id) || busy(b.id)) continue;
      if (!a.target || !b.target || a.pres < 0.6 || b.pres < 0.6) continue;
      if (a.z < 0.22 || b.z < 0.22 || depthAt(a.d, future) < 0.08 || depthAt(b.d, future) < 0.08) continue;
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < g.R * 0.25) continue;
      if (active.some((o) => Math.hypot(o.a.x - a.x, o.a.y - a.y) < g.R * 0.3 || Math.hypot(o.b.x - b.x, o.b.y - b.y) < g.R * 0.3)) continue;
      start(c, a, b, clock);
      queue = idx + 1;
      nextAt = clock + GAP;
      return;
    }
    nextAt = clock + 250;
  }
  function start(c, a, b, t0) {
    const conv = { c, a, b, t0, path: arcPath(a.d, b.d, SEG), bubA: null, bubB: null };
    active.push(conv);
    conv.bubA = makeBubble(a, b, c.say, a.lang, a.code);
    return conv;
  }
  function end(conv) {
    conv.bubA && conv.bubA.el.remove();
    conv.bubB && conv.bubB.el.remove();
    active.splice(active.indexOf(conv), 1);
  }

  const tmp = [0, 0, 0];
  function strokeArc(ctx, path, from, to, alphaFn) {
    const P = path.p;
    let prev = null;
    for (let s = 0; s <= SEG; s++) {
      g.project(P[s * 3], P[s * 3 + 1], P[s * 3 + 2], tmp);
      const zs = tmp[2] / path.lifts[s];
      const t = s / SEG;
      if (prev && zs > 0 && prev[3] > 0 && t > from && t - 1 / SEG < to) {
        const limb = Math.min(1, Math.min(prev[3], zs) / 0.3);
        const a = alphaFn(t, tmp[2]) * limb;
        if (a > 0.004) {
          ctx.strokeStyle = "rgba(118,185,0," + a.toFixed(3) + ")";
          ctx.lineWidth = a > 0.45 ? 2 : 1.2;
          ctx.beginPath();
          ctx.moveTo(prev[0], prev[1]);
          ctx.lineTo(tmp[0], tmp[1]);
          ctx.stroke();
        }
      }
      prev = [tmp[0], tmp[1], tmp[2], zs];
    }
  }

  // lost variant: the head runs A → BREAK, the line it leaves behind dims, a red ✕ pops where it broke
  function drawLost(ctx, globe, conv, t, u, fade) {
    const reach = u * BREAK;
    const broken = u >= 1;
    strokeArc(ctx, conv.path, 0, reach, (s, z) => {
      const head = broken ? 0 : smooth(reach - 0.3, reach, s);
      const tailFade = broken ? 0.16 + 0.2 * smooth(0, reach, s) : 0.18;
      return (tailFade + 0.75 * head) * Math.min(1, z * 2 + 0.3) * fade;
    });
    const si = Math.min(SEG, Math.round(reach * SEG));
    globe.project(conv.path.p[si * 3], conv.path.p[si * 3 + 1], conv.path.p[si * 3 + 2], tmp);
    if (tmp[2] / conv.path.lifts[si] <= 0.05) return;
    if (!broken) {
      ctx.fillStyle = ACCENT;
      ctx.beginPath();
      ctx.arc(tmp[0], tmp[1], 3, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    const bt = t - ARC_END; // ms since the break
    const pop = reduce ? 1 : ease(clamp(bt / 260, 0, 1));
    const a = fade * (reduce ? 1 : 0.55 + 0.45 * pop);
    const s = Math.max(6, AV * 0.2) * (0.6 + 0.4 * pop);
    // ring that spreads once from the break
    if (!reduce && bt < 900) {
      const k = bt / 900;
      ctx.strokeStyle = "rgba(" + DANGER + "," + (0.6 * (1 - k) * fade).toFixed(3) + ")";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(tmp[0], tmp[1], s + 4 + k * 18, 0, Math.PI * 2);
      ctx.stroke();
    }
    // dark disc behind the ✕ so it reads over dots and arcs
    ctx.fillStyle = "rgba(14,14,16," + (0.9 * a).toFixed(3) + ")";
    ctx.beginPath();
    ctx.arc(tmp[0], tmp[1], s + 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(" + DANGER + "," + a.toFixed(3) + ")";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(tmp[0] - s, tmp[1] - s);
    ctx.lineTo(tmp[0] + s, tmp[1] + s);
    ctx.moveTo(tmp[0] + s, tmp[1] - s);
    ctx.lineTo(tmp[0] - s, tmp[1] + s);
    ctx.stroke();
  }

  const pairs = [];
  {
    const seen = new Set();
    for (const c of convs) {
      const k = [c.from, c.to].sort().join("|");
      if (seen.has(k)) continue;
      seen.add(k);
      pairs.push({ a: byId[c.from], b: byId[c.to], path: arcPath(byId[c.from].d, byId[c.to].d, SEG) });
    }
  }

  function overlay(ctx, globe, clock, dt) {
    // big globes (wide hero, R ≥ ~300 px) get proportionally larger faces and balloons
    const big = clamp((globe.R - 190) / 110, 0, 1);
    AV = Math.round(clamp(globe.R * 0.17, 30, 58));
    BW = Math.round(Math.min(240 + 50 * big, Math.max(150, EW * 0.56)));
    if (AV + "|" + BW + "|" + big !== sizeKey) {
      sizeKey = AV + "|" + BW + "|" + big;
      layer.style.setProperty("--kpg-av", AV + "px");
      layer.style.setProperty("--kpg-bw", BW + "px");
      layer.style.setProperty("--kpg-fs", (14 + 2.5 * big).toFixed(2) + "px");
      layer.style.setProperty("--kpg-ms", (11 + 1.5 * big).toFixed(2) + "px");
    }

    for (const p of people) {
      globe.project(p.d[0], p.d[1], p.d[2], tmp);
      p.x = OX + tmp[0];
      p.y = OY + tmp[1];
      p.z = tmp[2];
      p.vis = smooth(0.06, 0.32, p.z);
      if (p.z > -0.35) request(p); // about to rotate in: load the photo now
    }
    // Which balloons show: people in a conversation first, then the nearest to the centre of the disc, at most
    // `cap`, and never two whose circles would touch on screen (the one farther from the centre fades out).
    const cap = options.maxVisible ?? (globe.R < 170 ? 8 : 9);
    for (const p of people) p.rank = p.z + (p.target ? 0.04 : 0) + (busy(p.id) ? 10 : 0);
    const order = people.slice().sort((a, b) => b.rank - a.rank);
    const kept = [];
    for (const p of order) {
      const conv = p.rank >= 9;
      p.target = false;
      if (!p.ready || p.z < 0.06) continue;
      if (!conv && kept.length >= cap) continue;
      const r = (AV / 2) * (0.7 + 0.3 * p.vis);
      if (!conv && kept.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < r + q.r + 4)) continue;
      p.r = r;
      p.target = true;
      kept.push(p);
    }
    const step = !dt || reduce ? 1 : dt / 350;
    for (const p of people) {
      p.pres = clamp(p.pres + (p.target ? step : -step), 0, 1);
      p.alpha = p.vis * p.pres;
    }

    // conversations: in reduced motion, one still exchange; otherwise the queue
    let convNow;
    if (reduce) {
      if (!active.length && still) start(still, byId[still.from], byId[still.to], -3000);
      convNow = 3000;
    } else {
      for (const c of active.slice()) if (clock - c.t0 >= END) end(c);
      pick(clock);
    }

    ctx.save();
    ctx.beginPath();
    ctx.arc(globe.CX, globe.CY, globe.R * 1.012, 0, Math.PI * 2);
    ctx.clip();
    ctx.lineCap = "round";
    // the quiet network of everyone who talks to each other
    for (const pr of pairs) {
      const k = Math.min(pr.a.pres, pr.b.pres);
      if (k > 0.02) strokeArc(ctx, pr.path, 0, 1, lost ? (t, z) => (t > 0.4 && t < 0.62 ? 0 : (0.04 + 0.06 * z) * k) : (t, z) => (0.05 + 0.07 * z) * k);
    }
    // the live exchange: a bright head runs A → B, then the whole arc glows until the bubbles fade
    for (const conv of active) {
      const t = reduce ? convNow : clock - conv.t0;
      const fade = 1 - smooth(OUT - 200, END, t);
      const u = ease((t - ARC_START) / (ARC_END - ARC_START));
      if (lost) {
        if (t >= ARC_START) drawLost(ctx, globe, conv, t, u, fade);
        continue;
      }
      if (t >= ARC_START) {
        strokeArc(ctx, conv.path, 0, u, (s, z) => {
          const head = u < 1 ? smooth(u - 0.4, u, s) : 0;
          const glow = u >= 1 ? 0.55 : 0.18;
          return (glow + 0.75 * head) * Math.min(1, z * 2 + 0.3) * fade;
        });
        if (u < 1) {
          const si = Math.min(SEG, Math.floor(u * SEG));
          globe.project(conv.path.p[si * 3], conv.path.p[si * 3 + 1], conv.path.p[si * 3 + 2], tmp);
          if (tmp[2] / conv.path.lifts[si] > 0.05) {
            ctx.fillStyle = ACCENT;
            ctx.beginPath();
            ctx.arc(tmp[0], tmp[1], 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      // landing ripple around B
      const rt = t - B_IN;
      if (!reduce && rt > 0 && rt < 700 && conv.b.alpha > 0.05) {
        const k = rt / 700;
        ctx.strokeStyle = "rgba(118,185,0," + (0.7 * (1 - k) * conv.b.alpha).toFixed(3) + ")";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(conv.b.x - OX, conv.b.y - OY, AV / 2 + 3 + k * 16, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();

    // DOM: balloons follow the globe, fade at the rim, nearest on top
    for (const p of people) p.on = false;
    for (const conv of active) {
      const t = reduce ? convNow : clock - conv.t0;
      if (t < OUT) conv.a.on = true;
      if (!lost && t >= B_IN && t < OUT) conv.b.on = true;
    }
    for (const p of people) {
      const st = p.el.style;
      if (p.alpha <= 0.01) {
        if (p.shown) {
          st.visibility = "hidden";
          p.shown = false;
        }
        continue;
      }
      if (!p.shown) {
        st.visibility = "visible";
        p.shown = true;
      }
      const s = 0.7 + 0.3 * p.alpha;
      st.transform = `translate3d(${(p.x - AV / 2).toFixed(1)}px,${(p.y - AV / 2).toFixed(1)}px,0) scale(${s.toFixed(3)})`;
      st.opacity = p.alpha.toFixed(3);
      st.zIndex = String(Math.round(p.z * 100) + (p.on ? 200 : 0));
      p.el.classList.toggle("is-on", p.on);
    }
    for (const conv of active) {
      const t = reduce ? convNow : clock - conv.t0;
      const out = 1 - smooth(OUT, END, t);
      placeBubble(conv.bubA, smooth(0, 240, t) * out);
      if (lost) {
        if (t >= ARC_END && conv.bubA && !conv.bubA.cut) {
          conv.bubA.cut = true;
          conv.bubA.el.querySelector(".kpg-meta b").innerHTML = `${conv.a.code} <s>→ ${conv.b.code}</s>`;
        }
        continue;
      }
      if (t >= B_IN && !conv.bubB) {
        const a = conv.a;
        conv.bubB = makeBubble(conv.b, conv.a, conv.c.tr, conv.b.lang, `${a.code} <i>→ ${conv.b.code}</i>`);
      }
      placeBubble(conv.bubB, smooth(B_IN, B_IN + 240, t) * out);
    }
  }

  el.setAttribute("data-ready", "true");
  g.draw(0);

  let ro = null;
  if ("ResizeObserver" in window) {
    ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      measure(r.width, r.height);
    });
    ro.observe(el);
  }

  return {
    globe: g,
    destroy() {
      g.destroy();
      ro && ro.disconnect();
      stage.remove();
      layer.remove();
      el.classList.remove("kpg");
      el.removeAttribute("data-ready");
    },
  };
}
