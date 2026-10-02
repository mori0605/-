// ============================================================
//  Art: SVG ちびキャラ・モンスター・背景の生成
// ============================================================
const Art = (() => {
  let uid = 0;
  const urlCache = new Map();
  const imgCache = new Map();

  // ---------- ユーティリティ ----------
  function hash(s) {
    let h = 2166136261;
    for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shade(hex, amt) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const n = parseInt(c, 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    if (amt < 0) { r *= 1 + amt; g *= 1 + amt; b *= 1 + amt; }
    else { r += (255 - r) * amt; g += (255 - g) * amt; b += (255 - b) * amt; }
    return '#' + [r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
  }
  const f = v => (Math.round(v * 10) / 10).toString();
  const P = (cx, cy, r, a) => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)];
  const lg = (id, c1, c2, x2 = 0, y2 = 1) =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`;
  const rg = (id, c1, c2, cx = 0.35, cy = 0.3) =>
    `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="0.75"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient>`;

  const VIEW = '-6 -24 132 170';
  const wrap = (body, defs, view = VIEW) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${view}"><defs>${defs}</defs>${body}</svg>`;

  // ---------- 髪 ----------
  // 頭頂部の髪 (トゲ/もこもこ) + 前髪 を 1 本のパスで生成
  function hairPath(h, rnd) {
    const cx = 60, cy = h.cy ?? 58, rb = h.rb ?? 40;
    const a0 = h.a0 ?? -195, a1 = h.a1 ?? 15;
    const n = h.n ?? 8;
    const sideY = h.side ?? 70;
    const sideX = h.sideX ?? 38.5;
    let d = `M${f(cx - sideX)} ${f(sideY)}`;
    const s0 = P(cx, cy, rb, a0);
    d += ` L${f(s0[0])} ${f(s0[1])}`;
    const step = (a1 - a0) / n;
    const lens = h.lens;
    for (let i = 0; i < n; i++) {
      const sa = a0 + i * step, ea = sa + step, ma = (sa + ea) / 2;
      const t = Math.max(-1, Math.min(1, (ma + 90) / 90));
      let L = h.len ?? 14;
      if (h.profile === 'top') L *= 1 - 0.5 * Math.abs(t);
      else if (h.profile === 'side') L *= 0.55 + 0.6 * Math.abs(t);
      else if (h.profile === 'right') L *= 0.6 + 0.5 * (t + 1) / 2;
      L *= 1 + (rnd() - 0.5) * (h.vary ?? 0.45);
      if (lens) L = lens[i % lens.length];
      const lean = h.lean ?? 0.3;
      // 下向きになりすぎないよう角度を制限 (横の毛が細い線にならないように)
      const ta = Math.max(-202, Math.min(22, ma + lean * (ma + 90) + (h.tilt ?? 0)));
      if (ma < -186 || ma > 6) L *= 0.55;
      const e = P(cx, cy, rb, ea);
      if (h.style === 'puff') {
        const c = P(cx, cy, rb + L * 1.6, ma);
        d += ` Q${f(c[0])} ${f(c[1])} ${f(e[0])} ${f(e[1])}`;
      } else if (h.style === 'smooth') {
        const c = P(cx, cy, rb + L, ma);
        d += ` Q${f(c[0])} ${f(c[1])} ${f(e[0])} ${f(e[1])}`;
      } else {
        const tip = P(cx, cy, rb + L, ta);
        const w = h.curve ?? 0;
        if (w) {
          const m1 = P(cx, cy, rb + L * 0.55, ta - w);
          d += ` Q${f(m1[0])} ${f(m1[1])} ${f(tip[0])} ${f(tip[1])} L${f(e[0])} ${f(e[1])}`;
        } else d += ` L${f(tip[0])} ${f(tip[1])} L${f(e[0])} ${f(e[1])}`;
      }
    }
    d += ` L${f(cx + sideX)} ${f(sideY)}`;
    // 前髪
    const line = h.line ?? 45;
    const yl = x => line + (sideY - 3 - line) * Math.pow((x - 60) / 36.5, 2);
    const b = h.bangs || {};
    const bn = b.n ?? 5;
    if (b.skip) {
      // 生え際なし (モヒカン等)
    } else if (b.flat) {
      const cut = line + (b.len ?? 12);
      d += ` L${f(96.5)} ${f(sideY - 3)} L${f(93)} ${f(cut + 4)} Q60 ${f(cut + 2)} 27 ${f(cut + 4)} L23.5 ${f(sideY - 3)}`;
    } else if (bn > 0) {
      const xR = 96.5, xL = 23.5;
      const bw = (xR - xL) / bn;
      d += ` L${f(xR)} ${f(yl(xR))}`;
      for (let j = 0; j < bn; j++) {
        const xa = xR - j * bw, xb = xa - bw, xm = (xa + xb) / 2;
        let len = b.lens ? b.lens[j % b.lens.length] : (b.len ?? 10) * (1 + (rnd() - 0.5) * (b.vary ?? 0.5));
        if (b.center) len *= 1 - 0.35 * Math.abs(xm - 60) / 36;
        const lean = b.leanX ?? ((xm - 60) * (b.lean ?? 0.12));
        const tipX = xm + lean, tipY = yl(xm) + len;
        if (b.style === 'puff') d += ` Q${f(xm + lean * 0.5)} ${f(yl(xm) + len * 1.5)} ${f(xb)} ${f(yl(xb))}`;
        else d += ` L${f(tipX)} ${f(tipY)} L${f(xb)} ${f(yl(xb))}`;
      }
    } else {
      d += ` L96.5 ${f(sideY - 3)} Q60 ${f(line - 4)} 23.5 ${f(sideY - 3)}`;
    }
    return d + ' Z';
  }

  function backHair(h, hairFill, st) {
    const t = h.back;
    if (!t) return '';
    if (typeof t === 'object') {
      // 後ろ側のトゲ (頭の後ろに描く)
      const rnd = rng(hash(JSON.stringify(t)));
      const d = hairPath({ ...t, bangs: { n: 0 }, line: 70, side: t.side ?? 80 }, rnd);
      return `<path d="${d}" fill="${hairFill}" ${st}/>`;
    }
    switch (t) {
      case 'long': return `<path d="M22 52 Q12 96 18 126 Q30 120 40 128 Q60 122 80 128 Q90 120 102 126 Q108 96 98 52 Z" fill="${hairFill}" ${st}/>`;
      case 'mid': return `<path d="M21 52 Q14 84 20 104 Q34 98 46 104 L74 104 Q86 98 100 104 Q106 84 99 52 Z" fill="${hairFill}" ${st}/>`;
      case 'bob': return `<path d="M20 50 Q14 80 22 94 Q40 90 60 94 Q80 90 98 94 Q106 80 100 50 Z" fill="${hairFill}" ${st}/>`;
      case 'pony': return `<path d="M88 58 Q112 70 108 104 Q104 124 92 132 Q98 108 92 92 Q86 78 80 70 Z" fill="${hairFill}" ${st}/>`;
      case 'wild': return `<path d="M20 50 L6 70 L16 74 L4 92 L18 92 L10 114 L28 104 L30 124 L44 108 L60 120 L76 108 L90 124 L92 104 L110 114 L102 92 L116 92 L104 74 L114 70 L100 50 Z" fill="${hairFill}" ${st}/>`;
      case 'bun': return `<circle cx="60" cy="18" r="13" fill="${hairFill}" ${st}/>`;
      case 'twin': return `<path d="M22 56 Q2 70 8 104 Q20 96 26 80 Z" fill="${hairFill}" ${st}/><path d="M98 56 Q118 70 112 104 Q100 96 94 80 Z" fill="${hairFill}" ${st}/>`;
    }
    return '';
  }

  // ---------- 目・眉・口 ----------
  function eyes(e, O, id, defs) {
    const out = [];
    const t = e.t || 'big';
    const ic = e.c || '#3a2a20';
    defs.push(lg(id + 'i', shade(ic, -0.35), shade(ic, 0.35)));
    const Y = e.y ?? 71;
    for (const [x, s] of [[47, -1], [73, 1]]) {
      const xo = x + 8 * s, xi = x - 8 * s; // 目尻 / 目頭
      switch (t) {
        case 'big':
          out.push(`<ellipse cx="${x}" cy="${Y}" rx="7.2" ry="9" fill="#fff" stroke="${O}" stroke-width="1.6"/>`,
            `<ellipse cx="${x}" cy="${Y + 1}" rx="5.6" ry="7.4" fill="url(#${id}i)"/>`,
            `<ellipse cx="${x}" cy="${Y + 1.6}" rx="2.6" ry="3.6" fill="#140c0c"/>`,
            `<circle cx="${x - 2.1}" cy="${Y - 2.4}" r="2.3" fill="#fff"/>`,
            `<circle cx="${x + 2.2}" cy="${Y + 4}" r="1.1" fill="#fff"/>`,
            `<path d="M${x - 7.8} ${Y - 3.5} Q${x} ${Y - 13.5} ${x + 7.8} ${Y - 3.5}" stroke="${O}" stroke-width="2.8" fill="none" stroke-linecap="round"/>`);
          break;
        case 'sharp': case 'angry': case 'glow': {
          const cid = `${id}e${s}`;
          const shape = `M${xo} ${Y - 3} Q${x} ${Y - 9.5} ${xi} ${Y + 0.5} Q${x} ${Y + 7.5} ${xo} ${Y - 3} Z`;
          defs.push(`<clipPath id="${cid}"><path d="${shape}"/></clipPath>`);
          const fill = t === 'glow' ? (e.c || '#ff2a2a') : '#fff';
          out.push(`<path d="${shape}" fill="${fill}" stroke="${O}" stroke-width="1.4"/>`);
          if (t === 'sharp') {
            out.push(`<g clip-path="url(#${cid})"><ellipse cx="${x + s * 0.5}" cy="${Y - 0.5}" rx="4.6" ry="6.2" fill="url(#${id}i)"/>` +
              `<ellipse cx="${x + s * 0.5}" cy="${Y}" rx="2.1" ry="3" fill="#140c0c"/><circle cx="${x - 1.4}" cy="${Y - 2.6}" r="1.6" fill="#fff"/></g>`);
          } else if (t === 'angry') {
            out.push(`<g clip-path="url(#${cid})"><circle cx="${x + s * 0.6}" cy="${Y - 0.6}" r="2.6" fill="${ic}"/><circle cx="${x + s * 0.6}" cy="${Y - 0.6}" r="1" fill="#140c0c"/></g>`);
          } else {
            out.push(`<ellipse cx="${x + s * 0.6}" cy="${Y - 1}" rx="1.1" ry="3.4" fill="#1a0000"/>`);
          }
          out.push(`<path d="M${xo + s * 0.8} ${Y - 3.4} Q${x} ${Y - 10.5} ${xi} ${Y + 0.2}" stroke="${O}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`);
          break;
        }
        case 'narrow':
          out.push(`<path d="M${x - 7.5} ${Y - 1} Q${x} ${Y + 6} ${x + 7.5} ${Y - 1} Z" fill="#fff" stroke="${O}" stroke-width="1.4"/>`,
            `<ellipse cx="${x}" cy="${Y + 1.2}" rx="3.6" ry="3" fill="url(#${id}i)"/>`,
            `<circle cx="${x}" cy="${Y + 1.4}" r="1.4" fill="#140c0c"/>`,
            `<path d="M${x - 8.2} ${Y - 1.2} L${x + 8.2} ${Y - 1.2}" stroke="${O}" stroke-width="2.8" stroke-linecap="round"/>`);
          break;
        case 'smile':
          out.push(`<path d="M${x - 6.5} ${Y + 2} Q${x} ${Y - 7} ${x + 6.5} ${Y + 2}" stroke="${O}" stroke-width="2.8" fill="none" stroke-linecap="round"/>`);
          break;
        case 'closed':
          out.push(`<path d="M${x - 6.5} ${Y} Q${x} ${Y + 5} ${x + 6.5} ${Y}" stroke="${O}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`);
          break;
        case 'dot':
          out.push(`<ellipse cx="${x}" cy="${Y}" rx="2.6" ry="3.8" fill="${O}"/><circle cx="${x - 0.8}" cy="${Y - 1.4}" r="0.9" fill="#fff"/>`);
          break;
        case 'ring':
          out.push(`<ellipse cx="${x}" cy="${Y}" rx="7" ry="8.4" fill="${ic}" stroke="${O}" stroke-width="1.6"/>`,
            `<ellipse cx="${x}" cy="${Y}" rx="4.6" ry="5.6" fill="none" stroke="${O}" stroke-width="1"/>`,
            `<ellipse cx="${x}" cy="${Y}" rx="2.4" ry="2.8" fill="none" stroke="${O}" stroke-width="1"/>`,
            `<circle cx="${x}" cy="${Y}" r="0.9" fill="${O}"/>`);
          break;
      }
    }
    return out.join('');
  }

  function brows(b, O, hairC) {
    if (!b || b === 'none') return '';
    const c = hairC && b !== 'thin' ? shade(hairC, -0.35) : O;
    const out = [];
    for (const [x, s] of [[47, -1], [73, 1]]) {
      const xo = x + 7 * s, xi = x - 7 * s;
      if (b === 'n' || b === 'thin') out.push(`<path d="M${xi} 59.5 Q${x} 56 ${xo} 59" stroke="${c}" stroke-width="${b === 'thin' ? 1.6 : 2.6}" fill="none" stroke-linecap="round"/>`);
      else if (b === 'a') out.push(`<path d="M${xi + s * 0.5} 62 L${xo} 56" stroke="${c}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`);
      else if (b === 'w') out.push(`<path d="M${xi} 56 Q${x} 57 ${xo} 60.5" stroke="${c}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`);
      else if (b === 't') out.push(`<path d="M${xi} 61 L${xo} 56.5 L${xo} 60 L${xi} 63.5 Z" fill="${c}" stroke="${c}" stroke-width="1.4" stroke-linejoin="round"/>`);
      else if (b === 'swirl') {
        if (s < 0) out.push(`<path d="M${xi} 59.5 Q${x} 56 ${xo} 59" stroke="${c}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`);
        else out.push(`<path d="M${xi} 59 Q${x} 55.5 ${xo} 58.5 Q${xo + 3} 61 ${xo} 62.5 Q${xo - 2.5} 61.5 ${xo - 1} 59.8" stroke="${c}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`);
      }
    }
    if (b === 'u') return `<path d="M38 60 Q47 54.5 60 58.5 Q73 54.5 82 60 L82 63 Q73 58 60 61.5 Q47 58 38 63 Z" fill="${c}"/>`;
    return out.join('');
  }

  function mouth(m, O) {
    switch (m || 'smile') {
      case 'grin':
        return `<path d="M49 83 Q60 86.5 71 83 Q69 96 60 96 Q51 96 49 83 Z" fill="#7a1f24" stroke="${O}" stroke-width="2" stroke-linejoin="round"/>` +
          `<path d="M50.5 84 Q60 87.5 69.5 84 L68.8 87 Q60 90 51.2 87 Z" fill="#fff"/>` +
          `<path d="M54 93 Q60 89 66 93 Q60 96 54 93 Z" fill="#ef7f8a"/>`;
      case 'shout':
        return `<path d="M48 81 L72 81 Q71 99 60 99 Q49 99 48 81 Z" fill="#7a1f24" stroke="${O}" stroke-width="2" stroke-linejoin="round"/>` +
          `<path d="M49.5 82 L70.5 82 L70 85 L50 85 Z" fill="#fff"/><path d="M53 95 Q60 89 67 95 Q60 99 53 95 Z" fill="#ef7f8a"/>`;
      case 'open':
        return `<ellipse cx="60" cy="88" rx="4.4" ry="5.4" fill="#7a1f24" stroke="${O}" stroke-width="1.8"/><ellipse cx="60" cy="90.5" rx="2.8" ry="2" fill="#ef7f8a"/>`;
      case 'smirk':
        return `<path d="M53 87.5 Q61 90 67.5 83.5" stroke="${O}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
      case 'flat':
        return `<path d="M55 88 L65 88" stroke="${O}" stroke-width="2.4" stroke-linecap="round"/>`;
      case 'frown':
        return `<path d="M54 90 Q60 85.5 66 90" stroke="${O}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
      case 'fang':
        return `<path d="M52 85 Q60 92 68 85" stroke="${O}" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M62.5 87.6 L64.5 91.5 L66 86.6 Z" fill="#fff" stroke="${O}" stroke-width="1"/>`;
      case 'teeth':
        return `<path d="M50 83.5 L70 83.5 Q69 92 60 92 Q51 92 50 83.5 Z" fill="#fff" stroke="${O}" stroke-width="2" stroke-linejoin="round"/>` +
          `<path d="M50.6 87.6 L69.4 87.6 M55 84 L55 91 M60 84 L60 92 M65 84 L65 91" stroke="${O}" stroke-width="1"/>`;
      case 'evil':
        return `<path d="M47 82 Q60 90 73 81 Q68 95 60 95 Q52 95 47 82 Z" fill="#5a0d12" stroke="${O}" stroke-width="2" stroke-linejoin="round"/>` +
          `<path d="M48.5 83 L51 87 L53.5 84.6 L56 88 L58.5 85.4 L61 88.4 L63.5 85.4 L66 88 L68.5 84.6 L71 86.4 L72 82.4 Q60 89 48.5 83 Z" fill="#fff"/>`;
      case 'cat':
        return `<path d="M53 86 Q56.5 90 60 86.5 Q63.5 90 67 86" stroke="${O}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
      case 'lips':
        return `<path d="M53 86.5 Q60 84 67 86.5 Q60 91 53 86.5 Z" fill="#3b8f3b" stroke="${O}" stroke-width="1.4"/>`;
      default:
        return `<path d="M52.5 85 Q60 92 67.5 85" stroke="${O}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    }
  }

  function marks(list, O, sk, over) {
    const out = [];
    for (const m of list || []) {
      if ((m === 'foreScar' || m === 'dots6' || m === 'gem') !== !!over) continue;
      switch (m) {
        case 'scarL': out.push(`<path d="M39 80 Q44 83 49.5 80" stroke="${O}" stroke-width="1.6" fill="none"/><path d="M41.5 79.5 L41 83 M44.5 80.5 L44.5 84 M47.5 79.7 L48 83" stroke="${O}" stroke-width="1.1"/>`); break;
        case 'whisk':
          for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
            const x0 = 60 + s * 21, x1 = 60 + s * 33, y = 78 + k * 3.6;
            out.push(`<path d="M${x0} ${y} L${x1} ${y - 1 + k * 0.8}" stroke="${O}" stroke-width="1.5" stroke-linecap="round"/>`);
          }
          break;
        case 'foreScar': out.push(`<path d="M66 53 Q69.5 48.5 74 51.5 Q72.5 54 75.5 56.5 Q71 58.5 67.5 56.8 Q70 55 66 53 Z" fill="#a8332f" opacity=".85"/>`); break;
        case 'xScar': out.push(`<path d="M34 76 L42 86 M43 76 L36 84" stroke="#b33" stroke-width="1.7" stroke-linecap="round"/>`); break;
        case 'dots6': for (const [x, y] of [[54, 40], [60, 39], [66, 40], [54, 46], [60, 45], [66, 46]]) out.push(`<circle cx="${x}" cy="${y}" r="1.3" fill="${O}"/>`); break;
        case 'blush': out.push(`<ellipse cx="37" cy="81" rx="5.5" ry="3" fill="#ff8aa0" opacity=".55"/><ellipse cx="83" cy="81" rx="5.5" ry="3" fill="#ff8aa0" opacity=".55"/>`); break;
        case 'nose': out.push(`<path d="M58 77 Q74 77 86 81.5 Q75 84.5 58 82 Z" fill="${sk}" stroke="${O}" stroke-width="1.6" stroke-linejoin="round"/>`); break;
        case 'tattoo': out.push(`<path d="M33 78 L43 79 M34 82 L43 82.5 M77 79 L87 78 M77 82.5 L86 82 M54 50 L66 50" stroke="#2a1010" stroke-width="1.6" stroke-linecap="round"/>`); break;
        case 'eyes4': out.push(`<path d="M37 80 Q41 77 45 80 Q41 82 37 80 Z M75 80 Q79 77 83 80 Q79 82 75 80 Z" fill="#c22" stroke="${O}" stroke-width="1"/>`); break;
        case 'clown': out.push(`<circle cx="60" cy="80" r="5" fill="#e3262f" stroke="${O}" stroke-width="1.5"/><circle cx="58.4" cy="78.4" r="1.4" fill="#fff"/>`); break;
        case 'star': out.push(`<path d="M35 81 l1.6 3.4 3.7 .5 -2.7 2.6 .7 3.7 -3.3 -1.8 -3.3 1.8 .7 -3.7 -2.7 -2.6 3.7 -.5 Z" fill="#3c6ee0"/><path d="M84 79 q2 4 0 7 q-2 -3 0 -7 Z" fill="#e0405a"/>`); break;
        case 'pierce': for (const [x, y] of [[40, 82], [80, 82], [56, 79], [64, 79], [60, 94], [44, 58], [76, 58]]) out.push(`<circle cx="${x}" cy="${y}" r="1.4" fill="#ccc" stroke="${O}" stroke-width=".6"/>`); break;
        case 'gem': out.push(`<path d="M60 44 L63.5 49 L60 54 L56.5 49 Z" fill="#c04de0" stroke="${O}" stroke-width="1.2"/>`); break;
        case 'stripes': out.push(`<path d="M30 73 L40 75 M30 79 L40 79 M80 75 L90 73 M80 79 L90 79" stroke="#8a2bd8" stroke-width="1.8" stroke-linecap="round"/>`); break;
        case 'gills': out.push(`<path d="M31 84 Q34 87 31 90 M35 84 Q38 87 35 90 M85 84 Q82 87 85 90 M89 84 Q86 87 89 90" stroke="${O}" stroke-width="1.2" fill="none"/>`); break;
        case 'sweat': out.push(`<path d="M92 50 Q96 56 92 59 Q88 56 92 50 Z" fill="#9fd7ff" stroke="${O}" stroke-width="1"/>`); break;
        case 'mustache': out.push(`<path d="M60 82 Q52 78 42 84 Q50 86 60 84 Q70 86 78 84 Q68 78 60 82 Z" fill="#1c1410" stroke="${O}" stroke-width="1"/>`); break;
        case 'beard': out.push(`<path d="M34 84 Q40 100 60 102 Q80 100 86 84 Q76 94 60 94 Q44 94 34 84 Z" fill="#1c1410"/>`); break;
        case 'freckles': for (const [x, y] of [[33, 80], [37, 83], [36, 78.5], [87, 80], [83, 83], [84, 78.5]]) out.push(`<circle cx="${x}" cy="${y}" r="1" fill="#a0603a" opacity=".8"/>`); break;
        case 'stubble': out.push(`<path d="M36 84 Q60 106 84 84 Q80 97 60 99 Q40 97 36 84 Z" fill="#5a5a6a" opacity=".22"/>`); break;
        case 'sawnose': out.push(`<path d="M58 74 L104 70 L104 75 L60 81 Z" fill="${sk}" stroke="${O}" stroke-width="1.6" stroke-linejoin="round"/><path d="M66 73.6 L68 70.6 L70 73.3 L72 70.3 L74 73 L76 70 L78 72.8 L80 69.8 L82 72.5 L84 69.5 L86 72.2 L88 69.3 L90 71.9 L92 69 L94 71.6 L96 68.8 L98 71.3" fill="none" stroke="${O}" stroke-width="1.2"/>`); break;
        case 'eyeliner': out.push(`<path d="M38 67 Q42 72 39 78 M82 67 Q78 72 81 78" stroke="#7d3fb5" stroke-width="2.2" fill="none" stroke-linecap="round"/>`); break;
      }
    }
    return out.join('');
  }

  // ---------- 服 ----------
  function patternDef(id, p, a, b) {
    switch (p) {
      case 'check': return `<pattern id="${id}" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" fill="${a}"/><rect width="4.5" height="4.5" fill="${b}"/><rect x="4.5" y="4.5" width="4.5" height="4.5" fill="${b}"/></pattern>`;
      case 'stripe': return `<pattern id="${id}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><rect width="6" height="6" fill="${a}"/><rect width="3" height="6" fill="${b}"/></pattern>`;
      case 'hemp': return `<pattern id="${id}" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="${a}"/><path d="M5 0 L5 10 M0 5 L10 5 M0 0 L10 10 M10 0 L0 10" stroke="${b}" stroke-width=".8"/></pattern>`;
      case 'tortoise': return `<pattern id="${id}" width="10" height="9" patternUnits="userSpaceOnUse"><rect width="10" height="9" fill="${a}"/><path d="M2.5 0 L7.5 0 L10 4.5 L7.5 9 L2.5 9 L0 4.5 Z" fill="none" stroke="${b}" stroke-width="1.2"/></pattern>`;
      case 'triangle': return `<pattern id="${id}" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="${a}"/><path d="M0 10 L5 0 L10 10 Z" fill="${b}"/></pattern>`;
      case 'cloud': return `<pattern id="${id}" width="22" height="16" patternUnits="userSpaceOnUse"><rect width="22" height="16" fill="${a}"/><path d="M4 10 q1 -4 5 -3 q2 -3 5 0 q4 0 3 4 Z" fill="${b}" stroke="#fff" stroke-width=".8"/></pattern>`;
      case 'dots': return `<pattern id="${id}" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="${a}"/><circle cx="3.5" cy="3.5" r="1.4" fill="${b}"/></pattern>`;
    }
    return '';
  }

  function body(c, O, st, sk, id, defs) {
    const fit = c.outfit || {};
    const out = [];
    const top = fit.top || '#e94b3c';
    defs.push(lg(id + 't', shade(top, 0.12), shade(top, -0.2)));
    const pants = fit.pants || shade(top, -0.35);
    const shoes = fit.shoes || '#3b2a20';
    // 脚
    if (fit.robe) {
      out.push(`<path d="M41 112 L37 132 Q60 136 83 132 L79 112 Z" fill="${fit.robe}" ${st}/>`);
      out.push(`<ellipse cx="50" cy="134" rx="7.5" ry="4" fill="${shoes}" ${st}/><ellipse cx="70" cy="134" rx="7.5" ry="4" fill="${shoes}" ${st}/>`);
    } else {
      for (const x of [44.5, 63.5]) {
        if (fit.shorts) out.push(`<rect x="${x}" y="114" width="12" height="18" rx="4" fill="${sk}" ${st}/>`, `<rect x="${x - 0.5}" y="113" width="13" height="10" rx="3" fill="${pants}" ${st}/>`);
        else out.push(`<rect x="${x}" y="113" width="12" height="19" rx="4" fill="${pants}" ${st}/>`);
        if (fit.boots) out.push(`<rect x="${x - 0.5}" y="122" width="13" height="10" rx="3" fill="${fit.boots}" ${st}/>`);
      }
      out.push(`<ellipse cx="50.5" cy="133" rx="8" ry="4.6" fill="${fit.boots || shoes}" ${st}/><ellipse cx="69.5" cy="133" rx="8" ry="4.6" fill="${fit.boots || shoes}" ${st}/>`);
    }
    // 胴体
    const torso = 'M39 98 Q60 89 81 98 L79.5 120 Q60 124 40.5 120 Z';
    out.push(`<path d="${torso}" fill="url(#${id}t)" ${st}/>`);
    if (fit.pattern) {
      defs.push(patternDef(id + 'p', fit.pattern, fit.pa || top, fit.pb || shade(top, -0.4)));
      if (fit.sides) {
        out.push(`<path d="M39 98 Q45 93.5 52.5 94.5 L55.5 121.5 Q47 121.6 40.5 120 Z" fill="url(#${id}p)" ${st}/>`,
          `<path d="M81 98 Q75 93.5 67.5 94.5 L64.5 121.5 Q73 121.6 79.5 120 Z" fill="url(#${id}p)" ${st}/>`);
      } else out.push(`<path d="${torso}" fill="url(#${id}p)" ${st}/>`);
    } else if (fit.sides) {
      out.push(`<path d="M39 98 Q45 93.5 52.5 94.5 L55.5 121.5 Q47 121.6 40.5 120 Z" fill="${fit.sides}" ${st}/>`,
        `<path d="M81 98 Q75 93.5 67.5 94.5 L64.5 121.5 Q73 121.6 79.5 120 Z" fill="${fit.sides}" ${st}/>`);
    }
    if (fit.open) {
      out.push(`<path d="M52.5 94 L67.5 94 L64 121.6 L56 121.6 Z" fill="${fit.open === true ? sk : fit.open}"/>`,
        `<path d="M52.5 94 L56 121.5 M67.5 94 L64 121.5" stroke="${O}" stroke-width="1.8"/>`);
      if (fit.chest === 'scars') for (const [x, y] of [[56, 100], [61, 98.5], [65, 101], [57.5, 106], [62.5, 107], [58.5, 113], [62, 116]]) out.push(`<circle cx="${x}" cy="${y}" r="1.2" fill="#b0453a"/>`);
      if (fit.chest === 'x') out.push(`<path d="M55 99 L65 113 M65 99 L55 113" stroke="#b0453a" stroke-width="1.4"/>`);
    }
    if (fit.inner) out.push(`<path d="M51 94.5 L60 106 L69 94.5 Z" fill="${fit.inner}" ${st}/>`);
    if (fit.collar) out.push(`<path d="M47 94 Q60 101 73 94 L71.5 98.5 Q60 105 48.5 98.5 Z" fill="${fit.collar}" ${st}/>`);
    if (fit.highCollar) out.push(`<path d="M46 92 Q60 98 74 92 L74 99 Q60 104 46 99 Z" fill="${fit.highCollar}" ${st}/>`);
    if (fit.zip) out.push(`<path d="M60 99 L60 121" stroke="${shade(top, -0.45)}" stroke-width="1.4"/>`);
    if (fit.buttons) for (const y of [102, 108, 114]) out.push(`<circle cx="60" cy="${y}" r="1.5" fill="${fit.buttons}" stroke="${O}" stroke-width=".7"/>`);
    if (fit.tie) out.push(`<path d="M58 97 L62 97 L63.5 112 L60 115.5 L56.5 112 Z" fill="${fit.tie}" ${st}/>`);
    if (fit.belt) {
      out.push(`<path d="M40.3 111.5 Q60 116 79.7 111.5 L79.6 117 Q60 121.4 40.4 117 Z" fill="${fit.belt}" ${st}/>`);
      if (fit.knot) out.push(`<path d="M70 114 L77 126 L72 127 L68 117 Z" fill="${fit.belt}" ${st}/>`);
    }
    if (fit.emblem) {
      out.push(`<circle cx="69.5" cy="103.5" r="5.2" fill="${fit.emblemBg || '#fff'}" stroke="${O}" stroke-width="1.4"/>`,
        `<text x="69.5" y="106.5" font-size="7.5" font-weight="900" text-anchor="middle" fill="${fit.emblemC || '#222'}" font-family="sans-serif">${fit.emblem}</text>`);
    }
    if (fit.number) out.push(`<text x="60" y="114" font-size="12" font-weight="900" text-anchor="middle" fill="${fit.numC || '#fff'}" stroke="${O}" stroke-width=".8" font-family="sans-serif">${fit.number}</text>`);
    if (fit.heart) out.push(`<path d="M60 108 Q53 101 56 99 Q59 97.5 60 101 Q61 97.5 64 99 Q67 101 60 108 Z" fill="${fit.heart}" stroke="${O}" stroke-width="1"/>`);
    if (fit.armor) {
      out.push(`<path d="M43 97 Q60 92 77 97 L76 112 Q60 116 44 112 Z" fill="${fit.armor}" ${st}/>`);
    }
    if (fit.pads) out.push(`<ellipse cx="40.5" cy="98" rx="8.5" ry="5.2" fill="${fit.pads}" ${st}/><ellipse cx="79.5" cy="98" rx="8.5" ry="5.2" fill="${fit.pads}" ${st}/>`);
    if (fit.spikes) out.push(`<path d="M33 96 L30 86 L37 93 L38 83 L42 93 Z M87 96 L90 86 L83 93 L82 83 L78 93 Z" fill="#ccc" ${st}/>`);
    if (fit.scarf) out.push(`<path d="M42 95 Q60 103 78 95 L78 100 Q60 108 42 100 Z" fill="${fit.scarf}" ${st}/><path d="M72 99 L78 114 L72 115 L68 101 Z" fill="${fit.scarf}" ${st}/>`);
    if (fit.feather) out.push(`<path d="M30 97 Q22 108 28 122 Q32 116 36 121 Q36 112 40 104 Z M90 97 Q98 108 92 122 Q88 116 84 121 Q84 112 80 104 Z" fill="${fit.feather}" ${st}/>`);
    return out.join('');
  }

  function arms(c, O, st, sk) {
    const fit = c.outfit || {};
    const sleeve = fit.sleeveless ? sk : (fit.sleeve || fit.top || '#e94b3c');
    const pose = c.pose || 'idle';
    let L, R;
    if (pose === 'fist') {
      L = `<ellipse cx="36.5" cy="105" rx="5.5" ry="10" transform="rotate(28 36.5 105)" fill="${sleeve}" ${st}/>`;
      R = `<ellipse cx="86" cy="98" rx="5.5" ry="10.5" transform="rotate(-60 86 98)" fill="${sleeve}" ${st}/>`;
    } else if (pose === 'cross') {
      L = `<ellipse cx="48" cy="106" rx="5.5" ry="11" transform="rotate(-62 48 106)" fill="${sleeve}" ${st}/>`;
      R = `<ellipse cx="72" cy="106" rx="5.5" ry="11" transform="rotate(62 72 106)" fill="${sleeve}" ${st}/>`;
    } else {
      L = `<ellipse cx="36.5" cy="105" rx="5.5" ry="10" transform="rotate(28 36.5 105)" fill="${sleeve}" ${st}/>`;
      R = `<ellipse cx="83.5" cy="105" rx="5.5" ry="10" transform="rotate(-28 83.5 105)" fill="${sleeve}" ${st}/>`;
    }
    return { arms: L + R, pose };
  }

  function hands(c, O, st, sk) {
    const fit = c.outfit || {};
    const pose = c.pose || 'idle';
    const hc = fit.gloves || sk;
    const wb = fit.wrist ? (x, y) => `<rect x="${x - 5}" y="${y - 7}" width="10" height="4" rx="1.5" fill="${fit.wrist}" ${st}/>` : () => '';
    if (pose === 'fist') return wb(32.5, 114) + `<circle cx="32.5" cy="114" r="5.2" fill="${hc}" ${st}/>` + `<circle cx="93" cy="92" r="5.6" fill="${hc}" ${st}/>`;
    if (pose === 'cross') return `<circle cx="57" cy="110.5" r="5" fill="${hc}" ${st}/><circle cx="63" cy="110.5" r="5" fill="${hc}" ${st}/>`;
    return wb(32.5, 114) + wb(87.5, 114) + `<circle cx="32.5" cy="114" r="5.2" fill="${hc}" ${st}/><circle cx="87.5" cy="114" r="5.2" fill="${hc}" ${st}/>`;
  }

  // ---------- 武器 ----------
  function weaponsBack(w, O, st) {
    const out = [];
    if (w.has('bigsword')) out.push(`<g transform="rotate(28 92 80)"><rect x="83" y="18" width="20" height="78" rx="2" fill="#dfe6ee" ${st}/><path d="M86 22 L86 92" stroke="#fff" stroke-width="2.4" opacity=".8"/><rect x="88" y="96" width="10" height="22" fill="#1b1b1b" ${st}/><path d="M88 100 L98 104 M88 106 L98 110 M88 112 L98 116" stroke="#888" stroke-width="1.2"/></g>`);
    if (w.has('blacksword')) out.push(`<g transform="rotate(30 92 80)"><path d="M84 14 L100 14 L102 98 L82 98 Z" fill="#2b2b33" ${st}/><path d="M88 22 L88 92" stroke="#6f6f80" stroke-width="2"/><rect x="87" y="98" width="10" height="20" fill="#5a3b22" ${st}/></g>`);
    if (w.has('rod')) out.push(`<path d="M30 118 L2 6" stroke="${O}" stroke-width="4.5" stroke-linecap="round"/><path d="M30 118 L2 6" stroke="#9c6b3c" stroke-width="2.4" stroke-linecap="round"/><circle cx="25" cy="100" r="4" fill="#ccc" ${st}/>`);
    if (w.has('staff')) out.push(`<path d="M20 132 L100 20" stroke="${O}" stroke-width="6.5" stroke-linecap="round"/><path d="M20 132 L100 20" stroke="#d63a2c" stroke-width="4" stroke-linecap="round"/><path d="M24 126.5 L28 121 M92 31 L96 25.5" stroke="#f2c230" stroke-width="4.2"/>`);
    if (w.has('woodsword')) out.push(`<path d="M18 126 L50 92" stroke="${O}" stroke-width="7" stroke-linecap="round"/><path d="M18 126 L50 92" stroke="#c99a5b" stroke-width="4.6" stroke-linecap="round"/><path d="M24 120 L28 116" stroke="#7b5631" stroke-width="5"/>`);
    if (w.has('cape2')) out.push('');
    return out.join('');
  }
  function weaponsHand(w, O, st) {
    const out = [];
    const katana = (x, y, ang, col = '#e9eef5') =>
      `<g transform="rotate(${ang} ${x} ${y})"><rect x="${x - 2.5}" y="${y - 2}" width="5" height="16" rx="1.5" fill="#26222e" ${st}/><rect x="${x - 6}" y="${y - 4.5}" width="12" height="3.5" rx="1.5" fill="#d4a93a" ${st}/><path d="M${x - 2.4} ${y - 4.5} L${x - 2.4} ${y - 52} Q${x} ${y - 58} ${x + 2.6} ${y - 52} L${x + 2.6} ${y - 4.5} Z" fill="${col}" stroke="${O}" stroke-width="1.6" stroke-linejoin="round"/><path d="M${x + 0.6} ${y - 8} L${x + 0.6} ${y - 50}" stroke="#fff" stroke-width="1.2"/></g>`;
    if (w.has('katana') || w.has('swords3')) out.push(katana(88, 116, 32, w.has('blackblade') ? '#2e2e38' : '#e9eef5'));
    if (w.has('swords3') || w.has('katanaL')) out.push(katana(32, 116, -32, w.has('swords3') ? '#f3f0e6' : '#e9eef5'));
    if (w.has('ball')) out.push(`<circle cx="95" cy="112" r="10" fill="#e8762c" ${st}/><path d="M85.5 110 Q95 114 104.5 110 M95 102 Q91 112 95 122 M88 104 Q96 108 102 105" stroke="${O}" stroke-width="1.2" fill="none"/>`);
    if (w.has('kunai')) out.push(`<path d="M88 112 L100 96 L102 98 L91 114 Z" fill="#c9d2dc" ${st}/>`);
    if (w.has('slingshot')) out.push(`<path d="M88 118 L88 102 M88 104 L82 94 M88 104 L94 94" stroke="#7b4a24" stroke-width="3.6" stroke-linecap="round" fill="none"/>`);
    if (w.has('chainsaw')) out.push(`<path d="M86 108 L118 92 L121 98 L90 115 Z" fill="#c9cfd6" ${st}/><path d="M89 107 L91 104 M95 104 L97 101 M101 101 L103 98 M107 98 L109 95 M113 95 L115 92" stroke="${O}" stroke-width="1.6"/>`);
    if (w.has('book')) out.push(`<rect x="92" y="86" width="16" height="20" rx="2" fill="#2a2a2a" ${st}/><path d="M96 92 L104 92 M96 96 L104 96" stroke="#ddd" stroke-width="1"/>`);
    if (w.has('cards')) out.push(`<g transform="rotate(-15 96 102)"><rect x="90" y="94" width="10" height="14" rx="1.5" fill="#fff" ${st}/><text x="95" y="104" font-size="7" text-anchor="middle" fill="#d22">♥</text></g>`);
    if (w.has('club')) out.push(`<path d="M88 118 L104 74" stroke="${O}" stroke-width="10" stroke-linecap="round"/><path d="M88 118 L104 74" stroke="#7d5a3a" stroke-width="7" stroke-linecap="round"/><circle cx="100" cy="84" r="1.6" fill="#ddd"/><circle cx="103" cy="78" r="1.6" fill="#ddd"/>`);
    if (w.has('trident')) out.push(`<path d="M92 124 L110 40" stroke="${O}" stroke-width="5" stroke-linecap="round"/><path d="M92 124 L110 40" stroke="#c8a040" stroke-width="3" stroke-linecap="round"/><path d="M103 44 L111 30 L114 46 M107 38 L111 30 L117 38" stroke="#c8a040" stroke-width="3" fill="none"/>`);
    return out.join('');
  }
  function weaponsFront(w, O, st) {
    const out = [];
    if (w.has('swords3')) out.push(`<rect x="50" y="85" width="13" height="4.6" rx="1.6" fill="#2d2440" ${st}/><path d="M63 85.2 L104 82 Q108 84 104 86.5 L63 89.3 Z" fill="#e9eef5" stroke="${O}" stroke-width="1.5" stroke-linejoin="round"/>`);
    if (w.has('cig')) out.push(`<path d="M64 88 L74 86" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><path d="M74 86 L75.5 85.7" stroke="#f55" stroke-width="2.4" stroke-linecap="round"/><path d="M77 82 Q80 78 77 74 Q74 70 78 66" stroke="#bbb" stroke-width="1.4" fill="none" opacity=".8"/>`);
    return out.join('');
  }

  // ---------- 頭のアクセサリ ----------
  function accBack(a, O, st, c) {
    const out = [];
    if (a.has('ribbon')) out.push(`<path d="M86 30 L104 18 L104 40 Z M86 30 L70 14 L74 34 Z" fill="#f28aa8" ${st}/><circle cx="86" cy="30" r="4" fill="#e66a90" ${st}/>`);
    if (a.has('hood')) out.push(`<ellipse cx="60" cy="96" rx="27" ry="9" fill="${c.outfit?.hood || '#c8303a'}" ${st}/>`);
    if (a.has('cape')) out.push(`<path d="M37 95 Q28 118 20 140 Q60 147 100 140 Q92 118 83 95 Z" fill="${c.outfit?.cape || '#f2f2f2'}" ${st}/>`);
    if (a.has('wings')) out.push(`<path d="M40 100 Q10 70 2 84 Q12 92 8 100 Q20 98 22 108 Q30 100 40 108 Z M80 100 Q110 70 118 84 Q108 92 112 100 Q100 98 98 108 Q90 100 80 108 Z" fill="${c.wingC || '#5a2a6a'}" ${st}/>`);
    if (a.has('tail')) out.push(`<path d="M76 124 Q104 130 108 108 Q110 96 100 98 Q104 112 92 118 Q84 120 76 116 Z" fill="${c.tailC || '#7b4a24'}" ${st}/>`);
    if (a.has('halo')) out.push(`<ellipse cx="60" cy="0" rx="22" ry="6" fill="none" stroke="#ffe36b" stroke-width="4"/>`);
    return out.join('');
  }

  function accFront(a, O, st, c) {
    const out = [];
    if (a.has('strawhat')) {
      out.push(`<ellipse cx="60" cy="40" rx="53" ry="11.5" fill="#f2cf5b" ${st}/>`,
        `<path d="M29 41 Q28 13 60 12 Q92 13 91 41 Q60 46 29 41 Z" fill="#f6d86b" ${st}/>`,
        `<path d="M29.4 33 Q60 38 90.6 33 L91 40.5 Q60 46 29 40.5 Z" fill="#d62828" ${st}/>`,
        `<path d="M14 42 Q60 52 106 42" stroke="#c9a23a" stroke-width="1.2" fill="none"/><path d="M38 22 Q60 18 82 22" stroke="#d9b54a" stroke-width="1.2" fill="none"/>`);
    }
    if (a.has('headband')) {
      const bc = c.bandC || '#2c4a9a';
      out.push(`<path d="M22.5 50 Q60 39 97.5 50 L97.5 58.5 Q60 47.5 22.5 58.5 Z" fill="${bc}" ${st}/>`,
        `<rect x="45" y="41.5" width="30" height="12.5" rx="2.5" fill="#d9dee6" ${st}/>`,
        `<path d="M60 47.6 m-3.4 0 a3.4 3.4 0 1 1 3.4 3.4 a5 5 0 1 1 -5 -5" stroke="#596474" stroke-width="1.4" fill="none"/>`);
      if (a.has('scratched')) out.push(`<path d="M47 50 L73 45" stroke="#596474" stroke-width="1.3"/>`);
    }
    if (a.has('headbandEye')) {
      out.push(`<path d="M22 60 Q48 52 98 46 L98 57 Q50 64 22 75 Z" fill="#2c4a9a" ${st}/>`,
        `<rect x="34" y="55" width="24" height="12" rx="2.5" transform="rotate(-14 46 61)" fill="#d9dee6" ${st}/>`,
        `<path d="M46 61 m-3 0 a3 3 0 1 1 3 3 a4.5 4.5 0 1 1 -4.5 -4.5" transform="rotate(-14 46 61)" stroke="#596474" stroke-width="1.3" fill="none"/>`);
    }
    if (a.has('bandana')) out.push(`<path d="M21 60 Q16 22 60 19 Q104 22 99 60 Q60 47 21 60 Z" fill="${c.bandC || '#1f2a1f'}" ${st}/><path d="M97 52 L112 60 L104 64 L110 74 L98 64 Z" fill="${c.bandC || '#1f2a1f'}" ${st}/>`);
    if (a.has('blackband')) out.push(`<path d="M22 52 Q60 42 98 52 L98 60 Q60 50 22 60 Z" fill="#1b1b1b" ${st}/><path d="M96 54 L110 46 L108 56 L114 62 L98 59 Z" fill="#1b1b1b" ${st}/>`);
    if (a.has('blindfold')) out.push(`<path d="M21 61 Q60 54 99 61 L99 76 Q60 69 21 76 Z" fill="#141414" ${st}/>`);
    if (a.has('sunglass')) out.push(`<path d="M34 64 L56 64 Q56 76 45 76 Q34 76 34 64 Z M64 64 L86 64 Q86 76 75 76 Q64 76 64 64 Z" fill="${c.glassC || '#e0457a'}" ${st}/><path d="M56 66 L64 66" stroke="${O}" stroke-width="2"/>`);
    if (a.has('glasses')) out.push(`<circle cx="47" cy="71" r="9.5" fill="#fff" fill-opacity=".15" stroke="${O}" stroke-width="2"/><circle cx="73" cy="71" r="9.5" fill="#fff" fill-opacity=".15" stroke="${O}" stroke-width="2"/><path d="M56.5 70 L63.5 70" stroke="${O}" stroke-width="2"/>`);
    if (a.has('cap')) out.push(`<path d="M24 47 Q24 15 60 14 Q96 15 96 47 Q60 39 24 47 Z" fill="${c.capC || '#1f2540'}" ${st}/><path d="M26 47 Q60 37 94 47 L95 52 Q60 44 25 52 Z" fill="${shade(c.capC || '#1f2540', -0.3)}" ${st}/><rect x="52" y="26" width="16" height="9" rx="2" fill="#d8b440" ${st}/>`);
    if (a.has('police')) out.push(`<path d="M24 46 Q22 18 60 16 Q98 18 96 46 Z" fill="#46619e" ${st}/><path d="M22 46 Q60 38 98 46 L96 53 Q60 46 24 53 Z" fill="#20283f" ${st}/><circle cx="60" cy="30" r="5" fill="#e3c04a" ${st}/>`);
    if (a.has('turban')) out.push(`<path d="M23 50 Q20 10 60 8 Q100 10 97 50 Q60 41 23 50 Z" fill="#f4f4f4" ${st}/><path d="M23 50 Q60 41 97 50 L96 56 Q60 47 24 56 Z" fill="#7b3fa0" ${st}/><path d="M52 42 Q48 30 40 26 M68 42 Q72 30 80 26" stroke="${O}" stroke-width="4.2" fill="none" stroke-linecap="round"/><path d="M52 42 Q48 30 40 26 M68 42 Q72 30 80 26" stroke="#7cc46a" stroke-width="2.4" fill="none" stroke-linecap="round"/>`);
    if (a.has('dome')) out.push(`<path d="M24 54 Q22 14 60 12 Q98 14 96 54 Q60 44 24 54 Z" fill="#8b3fb5" ${st}/><ellipse cx="46" cy="28" rx="9" ry="5" fill="#fff" opacity=".35"/>`);
    if (a.has('horns')) out.push(`<path d="M34 34 L26 8 L44 28 Z M86 34 L94 8 L76 28 Z" fill="${c.hornC || '#f2e6c8'}" ${st}/>`);
    if (a.has('horn1')) out.push(`<path d="M52 30 L60 2 L68 30 Z" fill="${c.hornC || '#f2e6c8'}" ${st}/>`);
    if (a.has('antenna')) out.push(`<path d="M60 26 Q58 10 66 2" stroke="${O}" stroke-width="2.4" fill="none"/><circle cx="66" cy="2" r="3.6" fill="${c.antC || '#ff6b9a'}" ${st}/>`);
    if (a.has('crown')) out.push(`<path d="M38 30 L42 12 L51 24 L60 8 L69 24 L78 12 L82 30 Z" fill="#f2c230" ${st}/><circle cx="60" cy="20" r="2.4" fill="#e33"/>`);
    if (a.has('pirate')) out.push(`<path d="M18 42 Q24 10 60 8 Q96 10 102 42 Q60 32 18 42 Z" fill="#2a2a2a" ${st}/><path d="M18 42 Q60 30 102 42 Q60 50 18 42 Z" fill="#1a1a1a" ${st}/><path d="M54 20 L66 30 M66 20 L54 30" stroke="#eee" stroke-width="2"/><circle cx="60" cy="22" r="4" fill="#eee"/>`);
    if (a.has('fedora')) out.push(`<ellipse cx="60" cy="38" rx="46" ry="9" fill="#f2f2f2" ${st}/><path d="M32 38 Q30 10 60 9 Q90 10 88 38 Q60 43 32 38 Z" fill="#f7f7f7" ${st}/><path d="M32.4 31 Q60 36 87.6 31 L88 37 Q60 42 32 37 Z" fill="#222" ${st}/>`);
    if (a.has('helmet')) out.push(`<path d="M20 58 Q16 14 60 10 Q104 14 100 58 L92 52 Q60 40 28 52 Z" fill="#3a3640" ${st}/><path d="M28 30 L8 8 L36 22 Z M92 30 L112 8 L84 22 Z" fill="#c9b37a" ${st}/><path d="M50 22 L60 12 L70 22 L60 30 Z" fill="#c9b37a" ${st}/>`);
    if (a.has('goggles')) out.push(`<path d="M22 44 Q60 34 98 44 L98 50 Q60 40 22 50 Z" fill="#6b4a2a" ${st}/><circle cx="48" cy="42" r="7" fill="#7fd0ff" ${st}/><circle cx="72" cy="42" r="7" fill="#7fd0ff" ${st}/>`);
    if (a.has('vbangs')) {
      const hc = c.hair ? c.hair.c : '#ffd23a';
      out.push(`<path d="M57 46 Q46 22 34 -10 Q54 10 63 44 Z" fill="${hc}" ${st}/><path d="M63 46 Q74 22 86 -10 Q66 10 57 44 Z" fill="${hc}" ${st}/>`);
    }
    if (a.has('wingcap')) out.push(`<path d="M25 46 Q24 14 60 13 Q96 14 95 46 Q60 38 25 46 Z" fill="#e8343a" ${st}/><path d="M24 34 Q6 22 2 34 Q10 36 8 42 Q16 40 24 42 Z M96 34 Q114 22 118 34 Q110 36 112 42 Q104 40 96 42 Z" fill="#f4f4f4" ${st}/><text x="60" y="34" font-size="9" font-weight="900" text-anchor="middle" fill="#fff" font-family="sans-serif">ARARA</text>`);
    if (a.has('hearthead')) out.push(`<path d="M22.5 50 Q60 40 97.5 50 L97.5 57 Q60 47 22.5 57 Z" fill="#2a8a3a" ${st}/><path d="M60 56 Q50 47 54 43 Q58 40.5 60 45 Q62 40.5 66 43 Q70 47 60 56 Z" fill="#2a8a3a" ${st}/>`);
    if (a.has('flower')) out.push(`<g transform="translate(86 40)"><circle r="7" fill="#ffd6e7" ${st}/><circle r="3" fill="#ffd34d"/></g>`);
    if (a.has('hairclip')) out.push(`<path d="M80 40 L92 36 L92 42 Z" fill="${c.clipC || '#f2c230'}" ${st}/>`);
    if (a.has('earrings')) out.push(`<rect x="17.5" y="77" width="6" height="10" rx="1" fill="#fff" ${st}/><circle cx="20.5" cy="82" r="2" fill="#d3312b"/><rect x="96.5" y="77" width="6" height="10" rx="1" fill="#fff" ${st}/><circle cx="99.5" cy="82" r="2" fill="#d3312b"/>`);
    if (a.has('mask')) out.push(`<path d="M22.5 74 Q60 69 97.5 74 Q96 95 60 97.5 Q24 95 22.5 74 Z" fill="${c.maskC || '#33404f'}" ${st}/><path d="M56 78 Q60 75 64 78" stroke="${shade(c.maskC || '#33404f', -0.4)}" stroke-width="1.4" fill="none"/>`);
    if (a.has('muzzle')) out.push(`<path d="M24 84 L44 86 M76 86 L96 84" stroke="#8a2a20" stroke-width="2"/><rect x="43" y="82.5" width="34" height="8" rx="3.5" fill="#79b350" ${st}/><path d="M53 83 L53 90 M67 83 L67 90" stroke="#4d7a2e" stroke-width="1.4"/>`);
    if (a.has('bandage')) out.push(`<path d="M22 78 Q60 72 98 78 L98 98 Q60 104 22 98 Z" fill="#eee8dc" ${st}/><path d="M24 84 Q60 78 96 84 M24 91 Q60 85 96 91" stroke="#c9c0ae" stroke-width="1.2" fill="none"/>`);
    if (a.has('hollowmask')) out.push(`<path d="M30 56 Q60 46 90 56 L88 84 Q60 100 32 84 Z" fill="#f4f2ec" ${st}/><path d="M36 64 L56 70 L56 76 L36 72 Z M84 64 L64 70 L64 76 L84 72 Z" fill="#111"/><path d="M44 84 L76 84" stroke="#111" stroke-width="2"/><path d="M48 80 L48 88 M54 80 L54 89 M60 80 L60 89 M66 80 L66 89 M72 80 L72 88" stroke="#111" stroke-width="1.2"/><path d="M40 56 L46 70 M80 56 L74 70" stroke="#c22" stroke-width="2.4"/>`);
    return out.join('');
  }

  // ---------- 特殊な頭 ----------
  function specialHead(c, O, st) {
    if (c.head === 'boar') {
      const rnd = rng(7);
      const fur = hairPath({ style: 'spike', n: 16, len: 9, a0: -230, a1: 50, side: 92, sideX: 30, rb: 38, cy: 62, line: 96, bangs: { n: 0 } }, rnd);
      return `<path d="${fur}" fill="#76869a" ${st}/>` +
        `<ellipse cx="60" cy="64" rx="34" ry="31" fill="#8a9aae" ${st}/>` +
        `<path d="M28 34 L22 12 L40 28 Z M92 34 L98 12 L80 28 Z" fill="#76869a" ${st}/>` +
        `<ellipse cx="44" cy="62" rx="6" ry="7" fill="#1a1a1a"/><ellipse cx="76" cy="62" rx="6" ry="7" fill="#1a1a1a"/>` +
        `<circle cx="45.5" cy="60" r="2" fill="#fff"/><circle cx="77.5" cy="60" r="2" fill="#fff"/>` +
        `<ellipse cx="60" cy="82" rx="15" ry="11" fill="#c9a8a0" ${st}/><ellipse cx="54.5" cy="82" rx="3" ry="4" fill="#3a2020"/><ellipse cx="65.5" cy="82" rx="3" ry="4" fill="#3a2020"/>` +
        `<path d="M44 90 L40 98 L48 93 Z M76 90 L80 98 L72 93 Z" fill="#fff" ${st}/>`;
    }
    return null;
  }

  // ---------- ちびキャラ本体 ----------
  function chibi(c) {
    const id = 'g' + (uid++);
    const O = c.outline || '#2a1a16';
    const st = `stroke="${O}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"`;
    const sk = c.skin || '#ffdcc0';
    const rnd = rng(hash(c.seed || c.name || id));
    const H = c.hair;
    const acc = new Set(c.acc || []);
    const wpn = new Set(c.wpn || []);
    const defs = [];
    const L = [];
    defs.push(rg(id + 's', shade(sk, 0.1), shade(sk, -0.07), 0.4, 0.35));
    let hairFill = '#222';
    if (H) {
      defs.push(lg(id + 'h', shade(H.c, 0.22), H.c2 || shade(H.c, -0.25)));
      hairFill = `url(#${id}h)`;
    }
    // 影
    L.push(`<ellipse cx="60" cy="137" rx="28" ry="5" fill="#000" opacity=".22"/>`);
    // 後ろ
    L.push(accBack(acc, O, st, c));
    L.push(weaponsBack(wpn, O, st));
    if (H) L.push(backHair(H, hairFill, st));
    // 体
    L.push(body(c, O, st, sk, id, defs));
    const am = arms(c, O, st, sk);
    L.push(am.arms);
    L.push(weaponsHand(wpn, O, st));
    L.push(hands(c, O, st, sk));
    // 頭
    const sp = specialHead(c, O, st);
    if (sp) L.push(sp);
    else {
      L.push(`<ellipse cx="22.5" cy="71" rx="5" ry="7" fill="${sk}" ${st}/><ellipse cx="97.5" cy="71" rx="5" ry="7" fill="${sk}" ${st}/>`);
      if (c.ears === 'elf') L.push(`<path d="M24 66 L8 54 L22 78 Z M96 66 L112 54 L98 78 Z" fill="${sk}" ${st}/>`);
      L.push(`<ellipse cx="60" cy="63" rx="37" ry="34" fill="url(#${id}s)" ${st}/>`);
      // 目・眉・口
      if (!acc.has('blindfold')) L.push(eyes(c.eye || {}, O, id, defs));
      L.push(marks(c.marks, O, sk, false));
      if (!acc.has('mask') && !acc.has('bandage')) L.push(mouth(c.mouth, O));
      if (c.head === 'bald') L.push(`<ellipse cx="46" cy="40" rx="9" ry="5" fill="#fff" opacity=".45" transform="rotate(-25 46 40)"/>`);
      // 前髪
      if (H && !H.none) {
        L.push(`<path d="${hairPath(H, rnd)}" fill="${hairFill}" ${st}/>`);
        if (H.hl !== false) {
        const hl1 = P(60, H.cy ?? 58, (H.rb ?? 40) - 5, -150), hl2 = P(60, H.cy ?? 58, (H.rb ?? 40) - 5, -112);
        L.push(`<path d="M${f(hl1[0])} ${f(hl1[1])} Q${f(P(60, H.cy ?? 58, (H.rb ?? 40) - 3, -131)[0])} ${f(P(60, H.cy ?? 58, (H.rb ?? 40) - 3, -131)[1])} ${f(hl2[0])} ${f(hl2[1])}" stroke="#fff" stroke-opacity=".45" stroke-width="3.2" fill="none" stroke-linecap="round"/>`);
        }
        if (H.strand) L.push(`<path d="M${H.strand} 44 Q${H.strand - 4} 60 ${H.strand + 2} 74" stroke="${O}" stroke-width="4.4" fill="none" stroke-linecap="round"/><path d="M${H.strand} 44 Q${H.strand - 4} 60 ${H.strand + 2} 74" stroke="${H.c}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`);
      }
      L.push(brows(c.brow ?? 'n', O, H && !H.none ? H.c : null));
      L.push(marks(c.marks, O, sk, true));
    }
    L.push(accFront(acc, O, st, c));
    L.push(weaponsFront(wpn, O, st));
    return wrap(L.join(''), defs.join(''));
  }

  // ---------- モンスター ----------
  function monster(m) {
    const id = 'm' + (uid++);
    const O = '#1e1418';
    const st = `stroke="${O}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"`;
    const c = m.c || '#6bbf59';
    const defs = [rg(id + 'b', shade(c, 0.3), shade(c, -0.25))];
    const B = `url(#${id}b)`;
    const out = [`<ellipse cx="60" cy="137" rx="34" ry="6" fill="#000" opacity=".22"/>`];
    const eyePair = (y, r = 7, col = '#fff', pc = '#111', dx = 13) =>
      `<ellipse cx="${60 - dx}" cy="${y}" rx="${r}" ry="${r * 1.15}" fill="${col}" stroke="${O}" stroke-width="1.8"/><ellipse cx="${60 + dx}" cy="${y}" rx="${r}" ry="${r * 1.15}" fill="${col}" stroke="${O}" stroke-width="1.8"/>` +
      `<circle cx="${60 - dx + 1.5}" cy="${y + 1}" r="${r * 0.48}" fill="${pc}"/><circle cx="${60 + dx - 1.5}" cy="${y + 1}" r="${r * 0.48}" fill="${pc}"/>`;
    const angry = (y, dx = 13) => `<path d="M${60 - dx - 9} ${y - 12} L${60 - dx + 7} ${y - 6} M${60 + dx + 9} ${y - 12} L${60 + dx - 7} ${y - 6}" stroke="${O}" stroke-width="3.4" stroke-linecap="round"/>`;
    switch (m.t) {
      case 'slime':
        out.push(`<path d="M18 132 Q12 96 36 74 Q60 48 84 74 Q108 96 102 132 Q60 140 18 132 Z" fill="${B}" ${st}/>`,
          `<ellipse cx="44" cy="80" rx="10" ry="6" fill="#fff" opacity=".45" transform="rotate(-30 44 80)"/>`,
          eyePair(100, 7.5), angry(100), `<path d="M48 118 Q60 126 72 118" stroke="${O}" stroke-width="2.6" fill="none"/>`);
        if (m.crown) out.push(`<path d="M44 66 L46 48 L54 58 L60 44 L66 58 L74 48 L76 66 Z" fill="#f2c230" ${st}/>`);
        break;
      case 'ghost':
        out.push(`<path d="M28 74 Q28 26 60 26 Q92 26 92 74 L94 126 L82 116 L72 128 L60 116 L48 128 L38 116 L26 126 Z" fill="${B}" ${st}/>`,
          `<ellipse cx="46" cy="70" rx="7" ry="10" fill="#160c1c"/><ellipse cx="74" cy="70" rx="7" ry="10" fill="#160c1c"/>`,
          `<circle cx="46" cy="72" r="2.4" fill="${m.e || '#ff4b6e'}"/><circle cx="74" cy="72" r="2.4" fill="${m.e || '#ff4b6e'}"/>`,
          `<path d="M48 94 Q60 104 72 94 Q60 98 48 94 Z" fill="#160c1c"/>`,
          `<path d="M28 88 Q14 92 12 104 M92 88 Q106 92 108 104" stroke="${O}" stroke-width="7" stroke-linecap="round"/><path d="M28 88 Q14 92 12 104 M92 88 Q106 92 108 104" stroke="${c}" stroke-width="4.4" stroke-linecap="round"/>`);
        break;
      case 'beast':
        out.push(`<ellipse cx="60" cy="112" rx="30" ry="22" fill="${B}" ${st}/>`,
          `<path d="M26 60 L22 22 L46 42 Z M94 60 L98 22 L74 42 Z" fill="${shade(c, -0.15)}" ${st}/>`,
          `<ellipse cx="60" cy="68" rx="38" ry="32" fill="${B}" ${st}/>`,
          `<ellipse cx="60" cy="84" rx="18" ry="13" fill="${shade(c, 0.45)}" ${st}/><ellipse cx="60" cy="76" rx="6" ry="4.4" fill="#1a1a1a"/>`,
          `<path d="M50 92 L53 100 L56 92 M64 92 L67 100 L70 92" fill="#fff" stroke="${O}" stroke-width="1.4"/>`,
          `<path d="M38 60 L54 66 L50 70 L38 66 Z M82 60 L66 66 L70 70 L82 66 Z" fill="${m.e || '#ffd23a'}" ${st}/>`,
          `<ellipse cx="42" cy="132" rx="10" ry="6" fill="${shade(c, -0.2)}" ${st}/><ellipse cx="78" cy="132" rx="10" ry="6" fill="${shade(c, -0.2)}" ${st}/>`);
        break;
      case 'crab':
        out.push(`<path d="M30 112 L14 132 M38 116 L28 136 M90 112 L106 132 M82 116 L92 136" stroke="${O}" stroke-width="6" stroke-linecap="round"/><path d="M30 112 L14 132 M38 116 L28 136 M90 112 L106 132 M82 116 L92 136" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>`,
          `<ellipse cx="60" cy="104" rx="40" ry="24" fill="${B}" ${st}/>`,
          `<path d="M22 92 Q2 74 10 52 Q22 48 26 62 L18 66 Q24 78 32 86 Z M98 92 Q118 74 110 52 Q98 48 94 62 L102 66 Q96 78 88 86 Z" fill="${B}" ${st}/>`,
          `<path d="M48 82 L46 66 M72 82 L74 66" stroke="${O}" stroke-width="3"/>`,
          `<circle cx="46" cy="62" r="7" fill="#fff" ${st}/><circle cx="74" cy="62" r="7" fill="#fff" ${st}/><circle cx="47" cy="63" r="3" fill="#111"/><circle cx="73" cy="63" r="3" fill="#111"/>`,
          `<path d="M48 108 Q60 116 72 108" stroke="${O}" stroke-width="2.6" fill="none"/>`);
        break;
      case 'golem':
        out.push(`<rect x="22" y="86" width="22" height="34" rx="8" fill="${B}" ${st}/><rect x="76" y="86" width="22" height="34" rx="8" fill="${B}" ${st}/>`,
          `<rect x="34" y="78" width="52" height="54" rx="10" fill="${B}" ${st}/>`,
          `<rect x="36" y="34" width="48" height="44" rx="10" fill="${B}" ${st}/>`,
          `<path d="M42 40 L50 48 M76 72 L70 64 M40 96 L52 104 M74 112 L82 120" stroke="${shade(c, -0.4)}" stroke-width="2"/>`,
          `<rect x="42" y="50" width="12" height="7" rx="2" fill="${m.e || '#4cf0ff'}" ${st}/><rect x="66" y="50" width="12" height="7" rx="2" fill="${m.e || '#4cf0ff'}" ${st}/>`,
          `<path d="M48 68 L72 68" stroke="${O}" stroke-width="3"/>`);
        break;
      case 'robot':
        out.push(`<rect x="38" y="88" width="44" height="38" rx="6" fill="${B}" ${st}/>`,
          `<path d="M38 96 L22 116 M82 96 L98 116" stroke="${O}" stroke-width="8" stroke-linecap="round"/><path d="M38 96 L22 116 M82 96 L98 116" stroke="#9aa4b0" stroke-width="5" stroke-linecap="round"/>`,
          `<rect x="44" y="124" width="10" height="10" fill="#555" ${st}/><rect x="66" y="124" width="10" height="10" fill="#555" ${st}/>`,
          `<rect x="28" y="36" width="64" height="50" rx="10" fill="${B}" ${st}/>`,
          `<rect x="34" y="50" width="52" height="16" rx="6" fill="#1a1a2a" ${st}/><rect x="40" y="54" width="40" height="8" rx="4" fill="${m.e || '#ff3355'}"/>`,
          `<path d="M60 36 L60 20" stroke="${O}" stroke-width="3"/><circle cx="60" cy="18" r="4.5" fill="${m.e || '#ff3355'}" ${st}/>`,
          `<circle cx="60" cy="104" r="7" fill="${m.e || '#ff3355'}" ${st}/>`, m.mark ? `<text x="60" y="80" font-size="10" text-anchor="middle" fill="#fff" font-weight="900">${m.mark}</text>` : '');
        break;
      case 'dragon':
        out.push(`<path d="M40 92 Q6 60 4 30 Q24 44 30 40 Q30 60 48 80 Z M80 92 Q114 60 116 30 Q96 44 90 40 Q90 60 72 80 Z" fill="${shade(c, -0.2)}" ${st}/>`,
          `<ellipse cx="60" cy="112" rx="28" ry="22" fill="${B}" ${st}/><ellipse cx="60" cy="116" rx="16" ry="14" fill="${shade(c, 0.5)}"/>`,
          `<path d="M38 40 L28 14 L48 32 Z M82 40 L92 14 L72 32 Z" fill="#f2e6c8" ${st}/>`,
          `<ellipse cx="60" cy="58" rx="32" ry="26" fill="${B}" ${st}/>`,
          `<ellipse cx="60" cy="74" rx="20" ry="12" fill="${shade(c, 0.3)}" ${st}/><circle cx="53" cy="72" r="2" fill="#111"/><circle cx="67" cy="72" r="2" fill="#111"/>`,
          `<path d="M38 52 L54 58 L50 62 L38 58 Z M82 52 L66 58 L70 62 L82 58 Z" fill="${m.e || '#ffdf3a'}" ${st}/>`,
          `<path d="M44 82 L48 88 L52 82 M68 82 L72 88 L76 82" fill="#fff" stroke="${O}" stroke-width="1.2"/>`);
        break;
      case 'curse':
        out.push(`<path d="M16 128 Q8 92 26 70 Q30 40 58 38 Q92 34 98 66 Q116 92 104 128 Q60 138 16 128 Z" fill="${B}" ${st}/>`);
        for (const [x, y, r] of [[40, 64, 6], [62, 56, 8], [84, 70, 5], [30, 92, 4.5], [90, 96, 6], [52, 82, 5]]) out.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${O}" stroke-width="1.6"/><circle cx="${x}" cy="${y}" r="${r * 0.45}" fill="${m.e || '#d01818'}"/>`);
        out.push(`<path d="M36 108 Q60 128 84 108 Q60 116 36 108 Z" fill="#2a0a14" ${st}/><path d="M40 109 L44 116 L48 111 L52 118 L56 112 L60 119 L64 112 L68 118 L72 111 L76 116 L80 109" fill="none" stroke="#fff" stroke-width="2"/>`);
        break;
      case 'hollow':
        out.push(`<path d="M30 96 Q18 118 22 132 L98 132 Q102 118 90 96 Q60 84 30 96 Z" fill="#1d1d24" ${st}/>`,
          `<circle cx="60" cy="112" r="8" fill="${m.bg || '#5b4a8a'}" ${st}/>`,
          `<path d="M30 100 L12 122 M90 100 L108 122" stroke="${O}" stroke-width="8" stroke-linecap="round"/><path d="M30 100 L12 122 M90 100 L108 122" stroke="#2c2c36" stroke-width="5" stroke-linecap="round"/>`,
          `<path d="M24 64 Q24 26 60 24 Q96 26 96 64 Q96 92 60 96 Q24 92 24 64 Z" fill="#f4f2ec" ${st}/>`,
          `<path d="M34 54 L54 60 L52 70 L34 64 Z M86 54 L66 60 L68 70 L86 64 Z" fill="#111"/>`,
          `<circle cx="44" cy="62" r="2.4" fill="${m.e || '#ffd400'}"/><circle cx="76" cy="62" r="2.4" fill="${m.e || '#ffd400'}"/>`,
          `<path d="M38 80 Q60 92 82 80 L80 86 Q60 96 40 86 Z" fill="#111"/><path d="M42 82 L44 88 M50 85 L51 91 M58 86 L58 92 M66 86 L66 91 M74 84 L75 89" stroke="#f4f2ec" stroke-width="2"/>`,
          `<path d="M38 32 L46 50 M82 32 L74 50" stroke="${c}" stroke-width="3"/>`);
        break;
      case 'serpent':
        out.push(`<path d="M10 130 Q20 96 50 108 Q76 118 76 92 Q76 72 60 64" stroke="${O}" stroke-width="26" fill="none" stroke-linecap="round"/><path d="M10 130 Q20 96 50 108 Q76 118 76 92 Q76 72 60 64" stroke="${c}" stroke-width="21" fill="none" stroke-linecap="round"/>`,
          `<path d="M84 92 L104 82 L96 100 Z" fill="${shade(c, -0.25)}" ${st}/>`,
          `<path d="M30 52 Q32 26 60 24 Q92 24 98 46 Q104 62 94 74 Q70 82 40 76 Q28 68 30 52 Z" fill="${B}" ${st}/>`,
          `<circle cx="52" cy="46" r="6" fill="#fff" ${st}/><circle cx="76" cy="44" r="6" fill="#fff" ${st}/><circle cx="53" cy="47" r="2.6" fill="#111"/><circle cx="75" cy="45" r="2.6" fill="#111"/>`,
          `<path d="M44 64 Q66 72 92 62" stroke="${O}" stroke-width="2.6" fill="none"/><path d="M52 66 L55 72 L58 67 M72 67 L75 73 L78 66" fill="#fff" stroke="${O}" stroke-width="1.2"/>`,
          `<path d="M40 30 L36 14 L50 26 M64 24 L66 8 L74 24" stroke="${O}" stroke-width="2" fill="${shade(c, -0.2)}"/>`);
        break;
      case 'frog':
        out.push(`<ellipse cx="60" cy="104" rx="44" ry="32" fill="${B}" ${st}/>`,
          `<ellipse cx="60" cy="112" rx="28" ry="18" fill="${shade(c, 0.5)}"/>`,
          `<circle cx="38" cy="70" r="14" fill="${B}" ${st}/><circle cx="82" cy="70" r="14" fill="${B}" ${st}/>`,
          `<circle cx="38" cy="70" r="8" fill="#fff" ${st}/><circle cx="82" cy="70" r="8" fill="#fff" ${st}/><rect x="34" y="68" width="8" height="4" rx="2" fill="#111"/><rect x="78" y="68" width="8" height="4" rx="2" fill="#111"/>`,
          `<path d="M30 96 Q60 112 90 96" stroke="${O}" stroke-width="2.6" fill="none"/>`,
          `<path d="M18 132 L30 120 M102 132 L90 120" stroke="${O}" stroke-width="2"/>`);
        break;
      case 'buu':
        out.push(`<ellipse cx="60" cy="108" rx="36" ry="28" fill="${B}" ${st}/><path d="M24 104 L96 104 L94 114 L26 114 Z" fill="#fff" ${st}/>`,
          `<rect x="54" y="104" width="12" height="10" fill="#f2c230" ${st}/>`,
          `<circle cx="60" cy="64" r="30" fill="${B}" ${st}/>`,
          `<path d="M60 34 Q74 20 88 30 Q76 32 70 40" fill="${B}" ${st}/>`,
          `<path d="M44 64 Q50 60 54 64 M66 64 Q70 60 76 64" stroke="${O}" stroke-width="2.6" fill="none"/>`,
          `<path d="M48 78 Q60 88 72 78" stroke="${O}" stroke-width="2.6" fill="none"/>`);
        break;
      case 'spider':
        for (let k = 0; k < 4; k++) {
          const y = 92 + k * 9;
          out.push(`<path d="M44 ${y} Q24 ${y - 18} ${8 + k * 3} ${y + 18} M76 ${y} Q96 ${y - 18} ${112 - k * 3} ${y + 18}" stroke="${O}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M44 ${y} Q24 ${y - 18} ${8 + k * 3} ${y + 18} M76 ${y} Q96 ${y - 18} ${112 - k * 3} ${y + 18}" stroke="${c}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`);
        }
        out.push(`<ellipse cx="60" cy="112" rx="26" ry="22" fill="${B}" ${st}/><circle cx="60" cy="74" r="22" fill="${B}" ${st}/>`);
        for (const [x, y] of [[52, 70], [68, 70], [56, 62], [64, 62]]) out.push(`<circle cx="${x}" cy="${y}" r="3.4" fill="${m.e || '#e01b3c'}" ${st}/>`);
        out.push(`<path d="M54 84 L52 92 M66 84 L68 92" stroke="#fff" stroke-width="2.4"/>`);
        break;
    }
    return wrap(out.join(''), defs.join(''));
  }

  // ---------- 背景 ----------
  const SCENES = {
    beach: { sky: ['#5ec8ff', '#bdeaff'], ground: '#f2d896', deco: s => `<rect y="118" width="400" height="34" fill="#2f9fe0"/><path d="M0 120 Q50 114 100 120 T200 120 T300 120 T400 120" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/><circle cx="330" cy="40" r="22" fill="#fff6b0"/><path d="M40 160 Q46 110 60 90" stroke="#7b5631" stroke-width="7" fill="none"/><path d="M60 90 Q30 86 20 100 M60 90 Q84 80 100 92 M60 90 Q50 70 36 70 M60 90 Q74 70 90 72" stroke="#2f9e3a" stroke-width="8" fill="none" stroke-linecap="round"/>` },
    mountain: { sky: ['#ffb36b', '#ffe1b0'], ground: '#b98a5a', deco: s => `<path d="M0 150 L60 70 L110 130 L170 50 L240 140 L300 80 L400 150 Z" fill="#a2785a"/><path d="M170 50 L184 68 L170 64 L158 68 Z M60 70 L70 82 L58 80 Z" fill="#fff" opacity=".8"/><circle cx="80" cy="36" r="18" fill="#fff3c4"/>` },
    village: { sky: ['#7fd3ff', '#d8f4ff'], ground: '#8cc66b', deco: s => `<path d="M0 150 Q100 110 200 140 T400 130 L400 160 L0 160 Z" fill="#6fb04e"/><g fill="#3d8a3a"><circle cx="40" cy="120" r="22"/><circle cx="70" cy="128" r="18"/><circle cx="350" cy="118" r="24"/></g><path d="M220 140 L220 112 L260 100 L300 112 L300 140 Z" fill="#c98f5a"/><path d="M212 114 L260 92 L308 114 Z" fill="#8a4b2a"/><rect x="250" y="122" width="16" height="18" fill="#5a3320"/>` },
    soul: { sky: ['#1d2550', '#56619e'], ground: '#d8d4cc', deco: s => `<circle cx="320" cy="44" r="24" fill="#fff8d8"/><rect x="0" y="112" width="400" height="38" fill="#f0ece4"/><path d="M0 112 L400 112" stroke="#9b958a" stroke-width="3"/><g fill="#3a3a52"><rect x="40" y="70" width="14" height="42"/><path d="M30 72 L47 60 L64 72 Z"/><rect x="250" y="80" width="12" height="32"/><path d="M240 82 L256 70 L272 82 Z"/></g>` },
    forest: { sky: ['#14183a', '#3c2f63'], ground: '#3a4a2e', deco: s => `<circle cx="300" cy="46" r="26" fill="#fff4c8"/><g fill="#0f1a12">${[0, 60, 120, 180, 240, 300, 360].map((x, i) => `<path d="M${x} 150 L${x + 30} ${50 + (i % 3) * 20} L${x + 60} 150 Z"/>`).join('')}</g><g fill="#b98ae0" opacity=".6"><circle cx="90" cy="40" r="5"/><circle cx="100" cy="52" r="4"/><circle cx="84" cy="58" r="4"/></g>` },
    school: { sky: ['#3a1d5a', '#c06a8a'], ground: '#4a4458', deco: s => `<rect x="200" y="70" width="160" height="70" fill="#2a2238"/><g fill="#ffd36b" opacity=".8">${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${212 + i * 24}" y="86" width="12" height="10"/>`).join('')}</g><path d="M40 140 L40 90 M90 140 L90 90 M30 90 L100 90 M34 100 L96 100" stroke="#c22" stroke-width="7"/>` },
    waste: { sky: ['#e8542e', '#f7b552'], ground: '#a8693c', deco: s => `<circle cx="200" cy="70" r="40" fill="#ffd36b" opacity=".85"/><path d="M0 140 L80 110 L120 128 L200 100 L280 130 L340 108 L400 132 L400 160 L0 160 Z" fill="#7a4526"/><path d="M60 150 L80 140 L70 132 M300 152 L320 140" stroke="#4a2410" stroke-width="2" fill="none"/>` },
    final: { sky: ['#0a0418', '#3a1450'], ground: '#2a1838', deco: s => `<g fill="#fff">${Array.from({ length: 30 }, (_, i) => `<circle cx="${(i * 97) % 400}" cy="${(i * 53) % 110}" r="${i % 3 === 0 ? 1.6 : 1}"/>`).join('')}</g><circle cx="300" cy="50" r="30" fill="#ff4b6e" opacity=".25"/><circle cx="300" cy="50" r="18" fill="#ff8aa0" opacity=".35"/>` },
    island: { sky: ['#56c3ff', '#c9efff'], ground: '#7dd16a', deco: s => `<circle cx="70" cy="40" r="22" fill="#fff6b0"/><g fill="#fff" opacity=".9"><ellipse cx="250" cy="40" rx="30" ry="10"/><ellipse cx="275" cy="34" rx="20" ry="10"/></g><path d="M0 128 Q100 100 200 120 T400 116 L400 160 L0 160 Z" fill="#5cb84a"/>` },
  };
  function scene(name) {
    const s = SCENES[name] || SCENES.beach;
    const id = 'bg' + (uid++);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 160" preserveAspectRatio="xMidYMax slice"><defs>${lg(id, s.sky[0], s.sky[1])}</defs>` +
      `<rect width="400" height="160" fill="url(#${id})"/>${s.deco(s)}<rect y="140" width="400" height="20" fill="${s.ground}"/><path d="M0 140 L400 140" stroke="#000" stroke-opacity=".2" stroke-width="2"/></svg>`;
  }

  // ---------- 公開 API ----------
  function svgOf(def) { return def.monster ? monster(def.monster) : chibi(def.art || def); }
  function url(def, key) {
    const k = key || def.id || def.name;
    if (!urlCache.has(k)) urlCache.set(k, 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgOf(def)));
    return urlCache.get(k);
  }
  // 顔アップ用 (viewBox を切り替え)
  function faceUrl(def, key) {
    const k = 'face:' + (key || def.id || def.name);
    if (!urlCache.has(k)) {
      const svg = svgOf(def).replace(`viewBox="${VIEW}"`, def.monster ? 'viewBox="8 18 104 104"' : 'viewBox="12 10 96 96"');
      urlCache.set(k, 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
    }
    return urlCache.get(k);
  }
  function image(def, face) {
    const k = (face ? 'F' : 'B') + (def.id || def.name);
    if (!imgCache.has(k)) {
      const img = new Image();
      img.src = face ? faceUrl(def) : url(def);
      imgCache.set(k, img);
    }
    return imgCache.get(k);
  }
  function sceneUrl(name) {
    const k = 'scene:' + name;
    if (!urlCache.has(k)) urlCache.set(k, 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(scene(name)));
    return urlCache.get(k);
  }

  return { chibi, monster, url, faceUrl, image, sceneUrl, shade, hash, rng };
})();
