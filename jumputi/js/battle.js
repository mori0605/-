// ============================================================
//  Battle: パズルバトル本体
//   - メイン4人が1人1回ずつプチを割る → 全員の行動後にまとめて攻撃
//   - 7個以上つなげて割ると、タップ位置から最も遠い場所に必殺プチ
//   - 必殺プチは周囲を爆発 (誘爆あり) → 持ち主の必殺ワザが発動
//   - ハートプチで回復 / 友情ワザ (ターン経過でGO!) / レジェンド召喚
// ============================================================
const Battle = (() => {
  const COLS = 7, ROWS = 6;
  const NB = [
    [[0, -1], [0, 1], [-1, -1], [-1, 0], [1, -1], [1, 0]],
    [[0, -1], [0, 1], [-1, 0], [-1, 1], [1, 0], [1, 1]],
  ];
  const KINDS = ['red', 'green', 'blue', 'yellow', 'heart'];
  const KW = [1, 1, 1, 1, 0.68];
  const EB = { hp: 5000, atk: 1400 };
  const BLAST = [0, 1.05, 1.8, 2.05];
  const isColor = k => k === 'red' || k === 'green' || k === 'blue' || k === 'yellow';
  const inB = (x, y) => x >= 0 && y >= 0 && x < COLS && y < ROWS;
  const nbs = (x, y) => NB[x & 1].map(([dx, dy]) => [x + dx, y + dy]).filter(([a, b]) => inB(a, b));
  const key = (x, y) => x * ROWS + y;
  const ux = x => x * 0.866, uy = (x, y) => y + (x & 1) * 0.5;
  const udist = (a, b, c, d) => Math.hypot(ux(a) - ux(c), uy(a, b) - uy(c, d));
  function randKind() {
    let r = Math.random() * KW.reduce((a, b) => a + b, 0);
    for (let i = 0; i < KINDS.length; i++) { r -= KW[i]; if (r < 0) return KINDS[i]; }
    return 'heart';
  }
  const mkCell = k => ({ k: k || randKind(), fy: 0, vy: 0, pop: 0 });
  const rand = () => 0.95 + Math.random() * 0.1;

  let B = null;

  // ========================================================
  //  開始
  // ========================================================
  function start(opts) {
    B = {
      opts, stage: opts.stage, area: findArea(opts.stage.area),
      wave: 0, turn: 1, grid: [], queue: [],
      party: [], hp: 0, maxHp: 0, enemies: [], target: null,
      cur: 0, acts: [], state: 'busy',
      buffs: { atk: [], shield: [], short: [] },
      legend: null, lgauge: 0, particles: [], fx: [], hover: null,
      alive: true, waveChanged: false, continued: 0,
      stats: { maxDmg: 0, hiss: 0, puchi: 0, combo: 0 },
    };
    buildParty();
    buildDom();
    initBoard();
    layout();
    B.lt = performance.now();
    requestAnimationFrame(loop);
    beginWave(true).then(() => { if (B && !Save.data.seen.battleTut) tutorial(); });
  }
  function tutorial() {
    Save.data.seen.battleTut = 1;
    Save.save();
    B.state = 'busy';
    const dlg = el('div', 'dialog-bg');
    dlg.innerHTML = `<div class="dialog"><h3>バトルのきほん</h3>
      <div class="help">
        <p>① 光っているキャラの番! <b>プチをタップ</b>すると、つながった同じ色のプチがまとめて割れる</p>
        <p>② 4人全員がプチを割ると、<b>一斉に攻撃</b>! 同じ色のプチは攻撃1.5倍、ハートは回復</p>
        <p>③ <b>7個以上</b>つなげると<b>必殺プチ</b>が出現。タップで爆発して必殺ワザ!</p>
        <p>④ 右下の顔アイコンが「GO!」になったら<b>友情ワザ</b>が使える</p>
      </div>
      <div class="btns"><button class="btn" data-a="ok">バトル開始!</button></div></div>`;
    B.dom.root.appendChild(dlg);
    dlg.addEventListener('click', e => { if (!e.target.dataset.a) return; dlg.remove(); if (B) { B.state = 'input'; updateUI(); } });
  }

  function buildParty() {
    const p = Save.data.party;
    p.main.forEach((id, i) => {
      if (!id || !Save.has(id)) return;
      const def = HERO_MAP[id];
      let { hp, atk, rcv } = Save.statsOf(id);
      let same = 0;
      const sups = (p.sup[i] || []).filter(s => s && Save.has(s)).map(s => HERO_MAP[s]);
      for (const s of sups) {
        const t = Save.statsOf(s.id);
        const k = s.attr === def.attr ? 0.18 : 0.15;
        if (s.attr === def.attr) same++;
        hp += t.hp * k; atk += t.atk * k; rcv += t.rcv * k;
      }
      const boost = 1 + 0.04 * same;
      const fr = sups[0] || null;
      const fwl = fr ? Save.unit(fr.id).wl : 1;
      const ycd = fr ? Math.max(2, fr.y.cd - (fwl >= 3 ? 1 : 0) - (fwl >= 5 ? 1 : 0)) : 0;
      B.party.push({
        idx: B.party.length, id, def, attr: def.attr, type: def.type,
        hp: Math.round(hp * boost), atk: Math.round(atk * boost), rcv: Math.round(rcv),
        sups, fr, ycd, cd: ycd, wl: Save.unit(id).wl,
      });
    });
    B.maxHp = B.party.reduce((a, m) => a + m.hp, 0);
    B.hp = B.maxHp;
    const lid = p.legend && Save.data.legends.includes(p.legend) ? p.legend : null;
    B.legend = lid ? LEGEND_MAP[lid] : null;
    B.cut = Math.min(0.4, B.party.reduce((a, m) => a + (m.def.t.k === 'cut' ? m.def.t.v : 0), 0));
  }

  // ---------- 特性・バフ ----------
  const hpRate = () => B.hp / B.maxHp;
  const buffSum = k => B.buffs[k].reduce((a, b) => a + b.v, 0);
  function atkMult(m, normal, n) {
    let v = 1;
    const t = m.def.t;
    if (t.k === 'atk') v += t.v;
    if (t.k === 'hpHigh' && hpRate() >= t.hp) v += t.atk;
    if (t.k === 'lowHpShort' && hpRate() <= t.hp) v += t.atk;
    if (t.k === 'lowHp' && hpRate() <= t.hp) v += t.v;
    if (t.k === 'first' && B.turn === 1) v += t.v;
    if (normal && t.k === 'chain' && n >= t.n) v += t.v;
    for (const o of B.party) if (o.def.t.k === 'attrAtk' && o.def.t.attr === m.attr) v += o.def.t.v;
    return v + buffSum('atk');
  }
  function needFor(m) {
    let need = 7 - buffSum('short');
    const t = m.def.t;
    if (t.k === 'hpHigh' && hpRate() >= t.hp) need -= t.short;
    if (t.k === 'lowHpShort' && hpRate() <= t.hp) need -= t.short;
    return Math.max(3, need);
  }
  function defMult(e) {
    if (!e) return 1;
    let v = 1 + (e.st.defDown ? e.st.defDown.v : 0);
    if (e.st.shield) v *= 1 - e.st.shield.v;
    return v;
  }
  function normalDmg(m, rec, e, noRand) {
    const n = rec.dmgN;
    let d = 0;
    if (n) {
      const cb = 1 + 0.5 * (rec.match / n);
      d = m.atk * atkMult(m, true, n) * Math.pow(n, 0.8) * cb;
    }
    if (rec.heartN && m.def.t.k === 'heartAtk') d += m.atk * atkMult(m, false, 0) * Math.pow(rec.heartN, 0.8) * m.def.t.v;
    if (!d) return 0;
    d *= (e ? attrMult(m.attr, e.attr) : 1) * defMult(e);
    if (e && e.boss && m.def.t.k === 'boss') d *= 1 + m.def.t.v;
    if (!noRand) d *= rand();
    return Math.round(d);
  }
  function healAmt(m, n) {
    let h = m.rcv * Math.pow(n, 0.85) * 1.3;
    if (m.def.t.k === 'heal') h *= 1 + m.def.t.v;
    return Math.round(h);
  }
  function specialDmg(m, e) {
    const h = m.def.h;
    const base = m.type === 'hp' ? m.hp * 0.32 : m.type === 'rcv' ? m.rcv * 2.4 : m.atk * atkMult(m, false, 0);
    let d = base * h.m * (1 + 0.1 * (m.wl - 1)) * attrMult(m.attr, e.attr) * defMult(e);
    if (m.def.t.k === 'special') d *= 1 + m.def.t.v;
    if (e.boss && m.def.t.k === 'boss') d *= 1 + m.def.t.v;
    return Math.round(d * rand());
  }

  // ========================================================
  //  DOM
  // ========================================================
  function buildDom() {
    const root = el('div', 'screen battle');
    root.id = 'battle';
    root.innerHTML = `
      <div class="bt-top">
        <div class="bt-wave">WAVE <b>1</b>/${B.stage.waves.length}</div>
        <div class="bt-stage">${B.stage.id} ${B.stage.name}</div>
        <div class="bt-turn">TURN <b>1</b></div>
        <button class="bt-auto">AUTO</button>
        <button class="bt-speed">×1</button>
        <button class="bt-menu">Ⅱ</button>
      </div>
      <div class="bt-field">
        <img class="bt-bg" src="${Art.sceneUrl(B.area.scene)}" alt="">
        <div class="bt-party"></div>
        <div class="bt-enemies"></div>
        <canvas class="bt-fx"></canvas>
        <div class="bt-float"></div>
      </div>
      <div class="bt-hpwrap"><div class="bt-buffs"></div><div class="bt-hp"><i></i><span></span></div></div>
      <div class="bt-chars"></div>
      <div class="bt-hint"></div>
      <div class="bt-board"><canvas></canvas><div class="bt-bfloat"></div></div>`;
    $('#app').appendChild(root);
    const D = B.dom = {
      root, field: $('.bt-field', root), partyEl: $('.bt-party', root), enemiesEl: $('.bt-enemies', root),
      fxc: $('.bt-fx', root), float: $('.bt-float', root), hp: $('.bt-hp', root), buffs: $('.bt-buffs', root),
      chars: $('.bt-chars', root), board: $('.bt-board', root), cv: $('.bt-board canvas', root),
      hint: $('.bt-hint', root), bfloat: $('.bt-bfloat', root),
    };
    B.ctx = D.cv.getContext('2d');
    B.fctx = D.fxc.getContext('2d');
    root.style.setProperty('--spd', gameSpeed());

    // 味方スプライト
    const pos = [[23, 3], [13, 25], [3, 1], [-4, 23]];
    B.party.forEach((m, i) => {
      const s = el('div', 'bt-hero');
      s.style.left = pos[i][0] + '%';
      s.style.bottom = pos[i][1] + '%';
      s.style.zIndex = 10 - i;
      s.style.animationDelay = (i * -0.37) + 's';
      s.innerHTML = `<img src="${Art.url(m.def)}" alt="">`;
      D.partyEl.appendChild(s);
      m.sprite = s;
    });

    // キャラ欄
    B.party.forEach((m, i) => {
      const s = el('div', `bt-slot a-${m.attr}`);
      s.innerHTML = `
        <div class="bt-face"><img src="${Art.faceUrl(m.def)}" alt=""><span class="bt-no">${i + 1}</span></div>
        <div class="bt-pend"></div>
        <div class="bt-sup ${m.fr ? '' : 'none'}">${m.fr ? `<img src="${Art.faceUrl(m.fr)}" alt=""><span class="cd"></span>` : ''}</div>`;
      s.querySelector('.bt-face').addEventListener('click', () => showUnitInfo(m));
      if (m.fr) s.querySelector('.bt-sup').addEventListener('click', e => { e.stopPropagation(); useYujo(i); });
      D.chars.appendChild(s);
      m.slot = s;
    });
    const lg = el('div', 'bt-legend' + (B.legend ? '' : ' none'));
    lg.innerHTML = B.legend ? `<svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="19" class="trk"/><circle cx="22" cy="22" r="19" class="val"/></svg><img src="${Art.faceUrl(B.legend)}" alt=""><span>0%</span>` : '<span>レジェンド<br>なし</span>';
    lg.addEventListener('click', useLegend);
    D.chars.appendChild(lg);
    D.legend = lg;

    // 入力
    D.cv.addEventListener('pointerdown', onPointer);
    D.cv.addEventListener('pointermove', onHover);
    D.cv.addEventListener('pointerleave', () => { B.hover = null; });
    $('.bt-menu', root).addEventListener('click', pauseMenu);
    const auBtn = $('.bt-auto', root);
    B.auto = !!Save.data.settings.auto;
    auBtn.classList.toggle('on', B.auto);
    auBtn.addEventListener('click', () => {
      B.auto = !B.auto;
      Save.data.settings.auto = B.auto;
      Save.save();
      auBtn.classList.toggle('on', B.auto);
      Sfx.tap();
    });
    const spBtn = $('.bt-speed', root);
    spBtn.textContent = '×' + gameSpeed();
    spBtn.addEventListener('click', () => {
      const s = Save.data.settings;
      s.speed = s.speed >= 3 ? 1 : s.speed + 1;
      Save.save();
      spBtn.textContent = '×' + s.speed;
      root.style.setProperty('--spd', s.speed);
    });
    B.onResize = () => layout();
    window.addEventListener('resize', B.onResize);
  }

  function layout() {
    if (!B) return;
    const D = B.dom;
    const W = D.board.clientWidth, H = D.board.clientHeight;
    const d = Math.max(20, Math.min((W - 10) / (1 + (COLS - 1) * 0.866), (H - 8) / (ROWS + 0.5 + 0.62)));
    B.d = d;
    B.bw = d * (1 + (COLS - 1) * 0.866);
    B.ox = (W - B.bw) / 2;
    B.oy = (H - d * (ROWS + 0.5 + 0.62)) / 2 + d * 0.62;
    const dpr = window.devicePixelRatio || 1;
    D.cv.width = Math.round(W * dpr); D.cv.height = Math.round(H * dpr);
    D.cv.style.width = W + 'px'; D.cv.style.height = H + 'px';
    B.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    B.W = W; B.H = H;
    const fw = D.field.clientWidth, fh = D.field.clientHeight;
    D.fxc.width = Math.round(fw * dpr); D.fxc.height = Math.round(fh * dpr);
    D.fxc.style.width = fw + 'px'; D.fxc.style.height = fh + 'px';
    B.fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    B.fw = fw; B.fh = fh;
  }
  const px = x => B.ox + B.d / 2 + x * B.d * 0.866;
  const py = (x, y) => B.oy + B.d / 2 + (y + (x & 1) * 0.5) * B.d;

  // ========================================================
  //  盤面
  // ========================================================
  function initBoard() {
    B.grid = []; B.queue = [];
    for (let x = 0; x < COLS; x++) {
      const col = [];
      for (let y = 0; y < ROWS; y++) {
        const c = mkCell();
        c.fy = ROWS + 1.5 + x * 0.25;
        col.push(c);
      }
      B.grid.push(col);
      B.queue.push([randKind(), randKind()]);
    }
  }

  function groupAt(x, y, actorAttr) {
    const c = B.grid[x][y];
    if (c.k === 'jama') return null;
    if (c.k === 'hissatsu') return { type: 'blast', ...blastFrom(x, y) };
    const color = c.k === 'rainbow' ? actorAttr : c.k;
    const seen = new Set([key(x, y)]);
    const cells = [[x, y]], st = [[x, y]];
    while (st.length) {
      const [a, b] = st.pop();
      for (const [nx, ny] of nbs(a, b)) {
        const kk = key(nx, ny);
        if (seen.has(kk)) continue;
        const k = B.grid[nx][ny].k;
        if (k === color || k === 'rainbow') { seen.add(kk); cells.push([nx, ny]); st.push([nx, ny]); }
      }
    }
    return { type: 'group', color, cells };
  }
  // 必殺プチの爆発 (範囲内の必殺プチは誘爆)
  function blastFrom(x0, y0) {
    const set = new Map([[key(x0, y0), [x0, y0]]]);
    const owners = [], q = [[x0, y0]], done = new Set();
    while (q.length) {
      const [x, y] = q.shift();
      if (done.has(key(x, y))) continue;
      done.add(key(x, y));
      const c = B.grid[x][y];
      if (c.k !== 'hissatsu') continue;
      owners.push(c.owner);
      const R = BLAST[c.power || 1];
      for (let a = 0; a < COLS; a++) for (let b = 0; b < ROWS; b++) {
        if (udist(x, y, a, b) > R) continue;
        const k = key(a, b);
        if (!set.has(k)) set.set(k, [a, b]);
        if (B.grid[a][b].k === 'hissatsu' && !done.has(k)) q.push([a, b]);
      }
    }
    return { cells: [...set.values()], owners };
  }

  function gravity() {
    for (let x = 0; x < COLS; x++) {
      const col = B.grid[x];
      const kept = [];
      for (let y = ROWS - 1; y >= 0; y--) if (!col[y].dead) kept.push([y, col[y]]);
      const nc = new Array(ROWS);
      let ny = ROWS - 1;
      for (const [oy, c] of kept) { c.fy += ny - oy; nc[ny] = c; ny--; }
      const miss = ny + 1;
      for (let y = ny; y >= 0; y--) {
        const k = B.queue[x].shift() || randKind();
        B.queue[x].push(randKind());
        const c = mkCell(k);
        c.fy = miss + 0.35;
        nc[y] = c;
      }
      B.grid[x] = nc;
    }
  }
  function waitFall() {
    return new Promise(res => {
      const chk = () => {
        if (!B || !B.alive) return res();
        for (const col of B.grid) for (const c of col) if (c.fy > 0) return requestAnimationFrame(chk);
        res();
      };
      chk();
    });
  }
  function normalCells(excludeKind) {
    const out = [];
    for (let x = 0; x < COLS; x++) for (let y = 0; y < ROWS; y++) {
      const k = B.grid[x][y].k;
      if (k === 'hissatsu' || k === 'jama') continue;
      if (excludeKind && k === excludeKind) continue;
      out.push([x, y]);
    }
    return out;
  }
  // 形状つき変換 (ランダム / 十字 / ハート型)
  function shapeCells(shape, n, to) {
    const cxu = ux(COLS - 1) / 2, cyu = (ROWS - 0.5) / 2;
    const cand = normalCells(shape ? null : to);
    const score = ([x, y]) => {
      const u = ux(x) - cxu, v = uy(x, y) - cyu;
      if (shape === 'cross') return Math.min(Math.abs(u), Math.abs(v)) * 10 + Math.abs(u) + Math.abs(v);
      if (shape === 'heart') {
        const X = u / 2.1, Y = -v / 2.1 + 0.25;
        return Math.pow(X * X + Y * Y - 1, 3) - X * X * Y * Y * Y;
      }
      return Math.random();
    };
    return cand.map(c => [score(c), c]).sort((a, b) => a[0] - b[0]).slice(0, n).map(a => a[1]);
  }
  async function convert(ef) {
    const cells = shapeCells(ef.shape, ef.n, ef.to);
    const now = performance.now();
    cells.forEach(([x, y], i) => {
      const c = B.grid[x][y];
      setTimeout(() => { c.k = ef.to; c.flash = performance.now(); }, i * 35 / gameSpeed());
    });
    Sfx.ok();
    await wait(cells.length * 35 + 250);
  }
  function placeJama(n) {
    const cells = normalCells().sort(() => Math.random() - 0.5).slice(0, n);
    for (const [x, y] of cells) { const c = B.grid[x][y]; c.k = 'jama'; c.flash = performance.now(); }
  }
  async function clearJama() {
    let any = false;
    const now = performance.now();
    for (let x = 0; x < COLS; x++) for (let y = 0; y < ROWS; y++) {
      const c = B.grid[x][y];
      if (c.k === 'jama') { c.pop = now; any = true; burst(x, y, '#888'); }
    }
    if (!any) return;
    await wait(180);
    for (const col of B.grid) for (const c of col) if (c.pop) c.dead = true;
    gravity();
    await waitFall();
  }
  function makeHissatsu(owner, power = 1) {
    const cells = normalCells();
    if (!cells.length) return;
    const [x, y] = pick(cells);
    Object.assign(B.grid[x][y], { k: 'hissatsu', owner, power, spawn: performance.now() });
  }

  // ========================================================
  //  描画ループ
  // ========================================================
  function loop(t) {
    if (!B || !B.alive) return;
    const dt = Math.min(40, t - B.lt);
    B.lt = t;
    update(dt);
    drawBoard(t);
    drawFx(t);
    if (B.auto && B.state === 'input' && !B.autoT && !$('.dialog-bg', B.dom.root)) B.autoT = setTimeout(autoStep, 420 / gameSpeed());
    requestAnimationFrame(loop);
  }
  // オートバトル: レジェンド → 友情ワザ → 一番よさそうなプチ
  function autoStep() {
    if (!B) return;
    B.autoT = null;
    if (!B.auto || B.state !== 'input') return;
    const m = B.party[B.cur];
    if (B.legend && B.lgauge >= B.legend.gauge) { useLegend(); return; }
    if (m.fr && m.cd <= 0) { useYujo(B.cur); return; }
    const c = bestCell();
    if (c) tapCell(c[0], c[1]);
  }
  function bestCell() {
    const m = B.party[B.cur];
    const need = needFor(m);
    let best = null, bs = -Infinity;
    for (let x = 0; x < COLS; x++) for (let y = 0; y < ROWS; y++) {
      const g = groupAt(x, y, m.attr);
      if (!g) continue;
      const n = g.cells.length;
      let sc;
      if (g.type === 'blast') sc = 100 + n;
      else if (g.color === 'heart') sc = (hpRate() < 0.55 ? 40 + n : hpRate() < 0.9 ? n * 0.9 : n - 3) + (n >= need ? 30 : 0);
      else sc = n + (g.color === m.attr ? n * 0.5 : 0) + (n >= need ? 30 : 0);
      sc += Math.random() * 0.3;
      if (sc > bs) { bs = sc; best = [x, y]; }
    }
    return best;
  }
  function update(dt) {
    const g = 0.00016 * gameSpeed() * gameSpeed();
    for (const col of B.grid) for (const c of col) {
      if (c.fy > 0) {
        c.vy += g * dt;
        c.fy -= c.vy * dt;
        if (c.fy <= 0) { c.fy = 0; c.vy = 0; c.land = performance.now(); }
      }
    }
    for (const p of B.particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 0.0012 * dt; p.life -= dt; }
    B.particles = B.particles.filter(p => p.life > 0);
  }

  function heartPath(ctx, X, Y, s) {
    ctx.beginPath();
    ctx.moveTo(X, Y + s * 0.9);
    ctx.bezierCurveTo(X - s * 1.3, Y + s * 0.05, X - s * 0.95, Y - s * 1.0, X, Y - s * 0.42);
    ctx.bezierCurveTo(X + s * 0.95, Y - s * 1.0, X + s * 1.3, Y + s * 0.05, X, Y + s * 0.9);
    ctx.closePath();
  }
  function drawPuchi(ctx, c, X, Y, r, t) {
    const k = c.k;
    if (k === 'hissatsu') return drawHissatsu(ctx, c, X, Y, r, t);
    if (k === 'jama') {
      const g = ctx.createRadialGradient(X - r * 0.3, Y - r * 0.35, r * 0.1, X, Y, r);
      g.addColorStop(0, '#cfcfd8'); g.addColorStop(1, '#5a5a66');
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * Math.PI * 2, rr = r * (i % 2 ? 0.86 : 1);
        ctx.lineTo(X + Math.cos(a) * rr, Y + Math.sin(a) * rr);
      }
      ctx.closePath(); ctx.fillStyle = g; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = '#2a2a33'; ctx.stroke();
      ctx.strokeStyle = 'rgba(30,30,40,.7)'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(X - r * 0.4, Y - r * 0.3); ctx.lineTo(X - r * 0.05, Y + r * 0.05); ctx.lineTo(X + r * 0.35, Y - r * 0.1); ctx.moveTo(X - r * 0.05, Y + r * 0.05); ctx.lineTo(X + r * 0.05, Y + r * 0.45); ctx.stroke();
      return;
    }
    if (k === 'heart') {
      const s = r * 0.98;
      const g = ctx.createRadialGradient(X - s * 0.35, Y - s * 0.4, s * 0.1, X, Y, s * 1.1);
      g.addColorStop(0, PUCHI.heart.light); g.addColorStop(0.5, PUCHI.heart.color); g.addColorStop(1, PUCHI.heart.dark);
      heartPath(ctx, X, Y + s * 0.04, s);
      ctx.fillStyle = g; ctx.fill();
      ctx.lineWidth = Math.max(1.2, r * 0.07); ctx.strokeStyle = 'rgba(90,0,40,.45)'; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(X - s * 0.42, Y - s * 0.36, s * 0.22, s * 0.13, -0.7, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fill();
      return;
    }
    let g;
    if (k === 'rainbow') {
      if (ctx.createConicGradient) {
        g = ctx.createConicGradient(t / 600, X, Y);
        ['#ff4b5c', '#ffbd1f', '#35c45a', '#3b86ff', '#b45cff', '#ff4b5c'].forEach((c2, i) => g.addColorStop(i / 5, c2));
      } else {
        g = ctx.createLinearGradient(X - r, Y - r, X + r, Y + r);
        ['#ff4b5c', '#ffbd1f', '#35c45a', '#3b86ff', '#b45cff'].forEach((c2, i) => g.addColorStop(i / 4, c2));
      }
    } else {
      const P = PUCHI[k];
      g = ctx.createRadialGradient(X - r * 0.35, Y - r * 0.4, r * 0.08, X, Y, r);
      g.addColorStop(0, P.light); g.addColorStop(0.5, P.color); g.addColorStop(1, P.dark);
    }
    ctx.beginPath(); ctx.arc(X, Y, r, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = Math.max(1.2, r * 0.07); ctx.strokeStyle = 'rgba(20,0,10,.35)'; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(X - r * 0.33, Y - r * 0.42, r * 0.3, r * 0.17, -0.6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fill();
    // 顔 (色ごとに表情を変えて、色が見分けにくくても区別できるように)
    ctx.fillStyle = ctx.strokeStyle = 'rgba(35,10,20,.85)';
    ctx.lineCap = 'round';
    if (k === 'green') {
      ctx.lineWidth = Math.max(1.4, r * 0.08);
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(X + s * r * 0.25, Y + r * 0.2, r * 0.11, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
    } else {
      for (const s of [-1, 1]) {
        ctx.beginPath(); ctx.ellipse(X + s * r * 0.25, Y + r * 0.1, r * 0.075, r * 0.13, 0, 0, Math.PI * 2); ctx.fill();
      }
      if (k === 'red') {
        ctx.lineWidth = Math.max(1.4, r * 0.07);
        for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(X + s * r * 0.4, Y - r * 0.15); ctx.lineTo(X + s * r * 0.13, Y - r * 0.04); ctx.stroke(); }
      }
    }
    if (k === 'yellow') {
      const sx = X + r * 0.5, sy = Y - r * 0.5, q = r * 0.2;
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.moveTo(sx, sy - q); ctx.quadraticCurveTo(sx, sy, sx + q, sy); ctx.quadraticCurveTo(sx, sy, sx, sy + q); ctx.quadraticCurveTo(sx, sy, sx - q, sy); ctx.quadraticCurveTo(sx, sy, sx, sy - q); ctx.fill();
    }
    if (k === 'blue') {
      const dx = X + r * 0.52, dy = Y - r * 0.18, q = r * 0.15;
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      ctx.beginPath(); ctx.moveTo(dx, dy - q * 1.6); ctx.quadraticCurveTo(dx + q, dy, dx, dy + q * 0.6); ctx.quadraticCurveTo(dx - q, dy, dx, dy - q * 1.6); ctx.fill();
    }
    if (k === 'rainbow') {
      ctx.fillStyle = '#fff'; ctx.font = `bold ${r * 0.7}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('★', X, Y - r * 0.05);
    }
  }
  function drawHissatsu(ctx, c, X, Y, r, t) {
    const m = B.party[c.owner];
    const col = ATTR[m.attr];
    ctx.save();
    ctx.translate(X, Y);
    ctx.rotate(t / 900);
    ctx.fillStyle = 'rgba(255,236,120,.55)';
    const rays = 6 + c.power * 2;
    for (let i = 0; i < rays; i++) {
      ctx.rotate(Math.PI * 2 / rays);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r * (1.25 + c.power * 0.08), -r * 0.2); ctx.lineTo(r * (1.25 + c.power * 0.08), r * 0.2); ctx.fill();
    }
    ctx.restore();
    const g = ctx.createRadialGradient(X, Y - r * 0.3, r * 0.1, X, Y, r);
    g.addColorStop(0, col.light); g.addColorStop(1, col.color);
    ctx.beginPath(); ctx.arc(X, Y, r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
    const img = Art.image(m.def, true);
    if (img.complete && img.naturalWidth) {
      ctx.save();
      ctx.beginPath(); ctx.arc(X, Y, r * 0.86, 0, Math.PI * 2); ctx.clip();
      const iw = img.naturalWidth, ih = img.naturalHeight;
      if (iw !== ih) { const q = Math.min(iw, ih); ctx.drawImage(img, (iw - q) / 2, 0, q, q, X - r * 0.9, Y - r * 0.9, r * 1.8, r * 1.8); }
      else ctx.drawImage(img, X - r * 0.95, Y - r * 0.9, r * 1.9, r * 1.9);
      ctx.restore();
    }
    ctx.lineWidth = Math.max(2, r * 0.14);
    ctx.strokeStyle = '#ffd84a';
    ctx.beginPath(); ctx.arc(X, Y, r * 0.93, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 1.2; ctx.strokeStyle = '#8a5a00';
    ctx.beginPath(); ctx.arc(X, Y, r, 0, Math.PI * 2); ctx.stroke();
    // 威力 (爆発範囲)
    ctx.font = `900 ${r * 0.42}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 3; ctx.strokeStyle = '#5a3000'; ctx.fillStyle = '#fff36b';
    const label = '★'.repeat(c.power);
    ctx.strokeText(label, X, Y + r * 0.78); ctx.fillText(label, X, Y + r * 0.78);
  }

  function drawBoard(t) {
    const ctx = B.ctx, d = B.d, r = d * 0.46;
    ctx.clearRect(0, 0, B.W, B.H);
    // 次に落ちてくるプチ
    for (let x = 0; x < COLS; x++) {
      const k = B.queue[x][0];
      ctx.globalAlpha = 0.7;
      drawPuchi(ctx, { k }, px(x), B.oy - d * 0.33, r * 0.42, t);
      ctx.globalAlpha = 1;
    }
    // 穴
    ctx.fillStyle = 'rgba(0,0,0,.22)';
    for (let x = 0; x < COLS; x++) for (let y = 0; y < ROWS; y++) {
      ctx.beginPath(); ctx.arc(px(x), py(x, y), r * 1.02, 0, Math.PI * 2); ctx.fill();
    }
    ctx.save();
    ctx.beginPath(); ctx.rect(0, B.oy - 2, B.W, B.H); ctx.clip();
    const now = performance.now();
    // 爆発範囲のプレビュー
    for (let x = 0; x < COLS; x++) for (let y = 0; y < ROWS; y++) {
      const c = B.grid[x][y];
      if (!c) continue;
      let X = px(x), Y = py(x, y) - c.fy * d, rr = r, a = 1;
      if (c.pop) {
        const p = (now - c.pop) / (170 / gameSpeed());
        if (p >= 1) continue;
        rr *= 1 + p * 0.45; a = 1 - p;
      }
      if (c.spawn) {
        const p = (now - c.spawn) / 380;
        if (p < 1) rr *= 0.4 + 0.6 * Math.min(1, p * 1.4) + Math.sin(p * Math.PI) * 0.25;
        else c.spawn = 0;
      }
      let sx = 1, sy = 1;
      if (c.land) {
        const p = (now - c.land) / 160;
        if (p < 1) { const s = Math.sin(p * Math.PI) * 0.12; sx = 1 + s; sy = 1 - s; Y += r * s; }
        else c.land = 0;
      }
      const hv = B.hover && B.hover.has(key(x, y));
      if (hv) { Y -= r * 0.12; }
      ctx.globalAlpha = a;
      if (sx !== 1) { ctx.save(); ctx.translate(X, Y); ctx.scale(sx, sy); drawPuchi(ctx, c, 0, 0, rr, t); ctx.restore(); }
      else drawPuchi(ctx, c, X, Y, rr, t);
      if (hv) {
        ctx.lineWidth = 3; ctx.strokeStyle = '#fff';
        ctx.beginPath(); ctx.arc(X, Y, rr * 1.04, 0, Math.PI * 2); ctx.stroke();
      }
      if (c.flash) {
        const p = (now - c.flash) / 350;
        if (p < 1) {
          ctx.globalAlpha = 1 - p;
          ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.arc(X, Y, rr * (1 + p * 0.3), 0, Math.PI * 2); ctx.fill();
        } else c.flash = 0;
      }
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    // パーティクル
    for (const p of B.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  function burst(x, y, color, n = 7) {
    const X = px(x), Y = py(x, y);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = 0.08 + Math.random() * 0.22;
      B.particles.push({ x: X, y: Y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 0.12, r: 2 + Math.random() * 3.5, c: color, life: 420, max: 420 });
    }
  }

  // ========================================================
  //  入力
  // ========================================================
  function cellAt(e) {
    const rect = B.dom.cv.getBoundingClientRect();
    const X = e.clientX - rect.left, Y = e.clientY - rect.top;
    let best = null, bd = Infinity;
    for (let x = 0; x < COLS; x++) for (let y = 0; y < ROWS; y++) {
      const dd = (px(x) - X) ** 2 + (py(x, y) - Y) ** 2;
      if (dd < bd) { bd = dd; best = [x, y]; }
    }
    return bd <= (B.d * 0.56) ** 2 ? best : null;
  }
  function onPointer(e) {
    if (!B || B.state !== 'input') return;
    e.preventDefault();
    Sfx.unlock();
    const p = cellAt(e);
    if (p) tapCell(p[0], p[1]);
  }
  function onHover(e) {
    if (!B || B.state !== 'input' || e.pointerType !== 'mouse') { if (B) B.hover = null; return; }
    const p = cellAt(e);
    const m = B.party[B.cur];
    const g = p && m ? groupAt(p[0], p[1], m.attr) : null;
    B.hover = g ? new Set(g.cells.map(([a, b]) => key(a, b))) : null;
    if (g && g.type === 'group') {
      const need = needFor(m);
      setHint(g.cells.length >= need ? `<b>${g.cells.length}個</b> 必殺プチ生成!` : `${g.cells.length}個 (必殺プチまであと${need - g.cells.length})`);
    } else if (g && g.type === 'blast') setHint('<b>必殺プチ</b> 爆発!');
    else turnHint();
  }

  // ---------- プチをタップ ----------
  async function tapCell(x, y) {
    const m = B.party[B.cur];
    const g = groupAt(x, y, m.attr);
    if (!g) { Sfx.deny(); setHint('邪魔プチはタップできない!'); return; }
    B.state = 'busy';
    B.hover = null;
    const rec = { dmgN: 0, match: 0, heartN: 0, hiss: [], yujo: false };
    let newHiss = null;
    const now = performance.now();
    if (g.type === 'blast') {
      rec.hiss.push(...g.owners);
      B.stats.hiss += g.owners.length;
      Sfx.boom();
      shake(B.dom.board, 'shake-s');
    } else {
      const need = needFor(m);
      if (g.cells.length >= need) {
        let far = null, fd = -1;
        for (const [a, b] of g.cells) { const dd = udist(x, y, a, b); if (dd > fd) { fd = dd; far = [a, b]; } }
        newHiss = { pos: far, power: g.cells.length >= need + 4 ? 3 : g.cells.length >= need + 2 ? 2 : 1 };
      }
      Sfx.pop(g.cells.length);
    }
    const brk = new Map(g.cells.map(([a, b]) => [key(a, b), [a, b]]));
    if (g.type === 'group') for (const [a, b] of g.cells) for (const [na, nb] of nbs(a, b)) if (B.grid[na][nb].k === 'jama') brk.set(key(na, nb), [na, nb]);
    for (const [a, b] of brk.values()) {
      const k = B.grid[a][b].k;
      if (k === 'heart') rec.heartN++;
      else if (isColor(k)) { rec.dmgN++; if (k === m.attr) rec.match++; }
      else if (k === 'rainbow') { if (g.color === 'heart') rec.heartN++; else { rec.dmgN++; rec.match++; } }
    }
    for (const [a, b] of brk.values()) {
      if (newHiss && a === newHiss.pos[0] && b === newHiss.pos[1]) continue;
      const c = B.grid[a][b];
      c.pop = now;
      burst(a, b, c.k === 'heart' ? PUCHI.heart.color : isColor(c.k) ? PUCHI[c.k].color : c.k === 'hissatsu' ? '#ffd84a' : '#aaa');
    }
    if (newHiss) {
      const [a, b] = newHiss.pos;
      Object.assign(B.grid[a][b], { k: 'hissatsu', owner: B.cur, power: newHiss.power, spawn: now, flash: now });
      setTimeout(() => Sfx.charge(), 120);
    }
    B.stats.puchi += brk.size;
    if (B.legend) B.lgauge = Math.min(B.legend.gauge, B.lgauge + brk.size);
    // 盤面上の表示
    const label = g.type === 'blast' ? `必殺プチ ×${g.owners.length}!!` : newHiss ? `${g.cells.length}個! 必殺プチ!` : g.color === 'heart' ? `${g.cells.length}個 回復` : `${g.cells.length}個`;
    boardFloat(label, px(x), py(x, y), g.type === 'blast' || newHiss ? 'big' : '');
    await wait(180);
    for (const [a, b] of brk.values()) {
      if (newHiss && a === newHiss.pos[0] && b === newHiss.pos[1]) continue;
      B.grid[a][b].dead = true;
    }
    gravity();
    rec.preview = { dmg: normalDmg(m, rec, targetEnemy(), true), heal: rec.heartN ? healAmt(m, rec.heartN) : 0 };
    B.acts[B.cur] = rec;
    bounceSprite(m);
    updateUI();
    await waitFall();
    nextActor();
  }

  function nextActor() {
    if (!B || !B.alive) return;
    B.cur++;
    if (B.cur >= B.party.length) { resolveTurn(); return; }
    B.state = 'input';
    updateUI();
  }

  // ---------- 友情ワザ ----------
  async function useYujo(i) {
    if (!B || B.state !== 'input') return;
    const m = B.party[i];
    if (i !== B.cur) { Sfx.deny(); setHint(`友情ワザは <b>${B.party[B.cur].def.short}</b> の番に使えるよ`); return; }
    if (!m.fr || m.cd > 0) { Sfx.deny(); setHint(`友情ワザはあと${m.cd}ターンで使える`); return; }
    B.state = 'busy';
    m.cd = m.ycd;
    B.acts[i] = { dmgN: 0, match: 0, heartN: 0, hiss: [], yujo: true, preview: null };
    updateUI();
    await cutin(m.fr, m.fr.y.n, '友情ワザ', m.attr, true);
    await applyEffects(m.fr.y.ef, m);
    updateUI();
    if (await checkWave()) return;
    nextActor();
  }

  // ---------- レジェンド召喚 ----------
  async function useLegend() {
    if (!B || B.state !== 'input' || !B.legend) return;
    if (B.lgauge < B.legend.gauge) { Sfx.deny(); setHint(`レジェンドゲージがたまると召喚できる (${Math.floor(B.lgauge / B.legend.gauge * 100)}%)`); return; }
    B.state = 'busy';
    B.lgauge = 0;
    updateUI();
    const L = B.legend;
    await cutin(L, L.s.n, 'レジェンド召喚', L.attr, false, true);
    const targets = aliveEnemies();
    await specialFx('explosion', ATTR[L.attr].color, targets, null);
    for (const e of targets) {
      const d = L.atk * (1 + Save.data.rank * 0.03) * L.s.m * attrMult(L.attr, e.attr) * defMult(e) * rand();
      hitEnemy(e, d, { big: true, am: attrMult(L.attr, e.attr) });
    }
    Sfx.hit(true);
    shake(B.dom.field, 'shake');
    await wait(500);
    await applyEffects(L.s.ef, null);
    if (await checkWave()) return;
    B.state = 'input';
    updateUI();
  }

  // ========================================================
  //  攻撃フェイズ
  // ========================================================
  async function resolveTurn() {
    B.state = 'busy';
    updateUI();
    setHint('<b>攻撃!!</b>');
    for (let i = 0; i < B.party.length; i++) {
      const m = B.party[i], rec = B.acts[i];
      if (!rec || rec.yujo) continue;
      m.slot.classList.add('acting');
      if (rec.heartN) {
        healParty(healAmt(m, rec.heartN), m);
        await wait(260);
      }
      const e = targetEnemy();
      if (e && (rec.dmgN || (rec.heartN && m.def.t.k === 'heartAtk'))) await heroAttack(m, e, rec);
      for (const o of rec.hiss) {
        if (!anyAlive()) break;
        await doHissatsu(B.party[o]);
      }
      m.slot.classList.remove('acting');
      if (!B.alive) return;
    }
    B.acts = [];
    if (await checkWave()) return;
    if (B.waveChanged) { B.waveChanged = false; endTurn(); return; }
    await enemyPhase();
    if (!B.alive) return;
    if (B.hp <= 0) { await defeat(); return; }
    endTurn();
  }

  async function heroAttack(m, e, rec) {
    m.sprite.classList.remove('atk'); void m.sprite.offsetWidth;
    m.sprite.classList.add('atk');
    await wait(170);
    const am = attrMult(m.attr, e.attr);
    const d = normalDmg(m, rec, e);
    const [x, y] = enemyPos(e);
    const col = ATTR[m.attr].color;
    fx({ type: 'slash', x, y, ang: -0.6 + Math.random() * 0.4, len: 70, color: '#fff', w: 7, dur: 260 });
    fx({ type: 'burst', x, y, n: 10, color: col, r: 50, dur: 420 });
    hitEnemy(e, d, { am, n: rec.dmgN });
    Sfx.hit(false);
    await wait(300);
    m.sprite.classList.remove('atk');
  }

  async function doHissatsu(m) {
    const h = m.def.h;
    await cutin(m.def, h.n, '必殺ワザ', m.attr);
    const targets = h.tg === 'a' ? aliveEnemies() : [targetEnemy()].filter(Boolean);
    if (!targets.length) return;
    await specialFx(h.fx, h.c || ATTR[m.attr].color, targets, m);
    for (const e of targets) hitEnemy(e, specialDmg(m, e), { big: true, am: attrMult(m.attr, e.attr) });
    Sfx.hit(true);
    shake(B.dom.field, 'shake');
    await wait(520);
    if (h.ef) await applyEffects(h.ef, m);
  }

  async function applyEffects(list, m) {
    for (const ef of list || []) {
      switch (ef.t) {
        case 'conv': await convert(ef); break;
        case 'rainbow': await convert({ to: 'rainbow', n: ef.n }); break;
        case 'heal': healParty(B.maxHp * ef.v, m); await wait(250); break;
        case 'atkUp': B.buffs.atk.push({ v: ef.v, t: ef.turns }); partyText(`攻撃力${Math.round(ef.v * 100)}%UP!`, '#ffcf3a'); Sfx.ok(); await wait(300); break;
        case 'shield': B.buffs.shield.push({ v: ef.v, t: ef.turns }); partyText(`ダメージ${Math.round(ef.v * 100)}%軽減!`, '#7ad8ff'); Sfx.ok(); await wait(300); break;
        case 'short': B.buffs.short.push({ v: ef.v, t: ef.turns }); partyText(`必殺プチ生成 -${ef.v}個!`, '#ffcf3a'); Sfx.ok(); await wait(300); break;
        case 'delay':
          for (const e of aliveEnemies()) { e.cnt += ef.v; enemyText(e, `行動遅延+${ef.v}`, '#c9a8ff'); }
          Sfx.ok(); await wait(350); break;
        case 'defDown':
          for (const e of aliveEnemies()) { e.st.defDown = { v: ef.v, t: ef.turns }; enemyText(e, '防御DOWN', '#ff9a5a'); }
          Sfx.ok(); await wait(350); break;
        case 'dmg': {
          const targets = ef.tg === 'a' ? aliveEnemies() : [targetEnemy()].filter(Boolean);
          const att = m || B.party[0];
          for (const e of targets) {
            const [x, y] = enemyPos(e);
            fx({ type: 'burst', x, y, n: 14, color: ATTR[att.attr].color, r: 60, dur: 450 });
            fx({ type: 'ring', x, y, r0: 10, r1: 70, color: '#fff', w: 5, dur: 380 });
            hitEnemy(e, att.atk * atkMult(att, false, 0) * ef.m * attrMult(att.attr, e.attr) * defMult(e) * rand(), { am: attrMult(att.attr, e.attr) });
          }
          Sfx.hit(true);
          await wait(450);
          break;
        }
        case 'hissatsu': if (m) { makeHissatsu(m.idx, 1); Sfx.charge(); await wait(400); } break;
        case 'clearJama': await clearJama(); break;
      }
      updateUI();
    }
  }

  // ---------- 敵 ----------
  function makeEnemy(k, i, wave) {
    const t = ENEMIES[k];
    const lv = B.stage.lv;
    // ボスが複数並ぶウェーブは1体あたりを控えめに
    const multi = t.boss && wave.filter(x => ENEMIES[x].boss).length > 1;
    const hp = Math.round(EB.hp * t.hp * (1 + 0.13 * (lv - 1)) * (multi ? 0.6 : 1));
    return {
      k, def: t, name: t.name, attr: t.attr, boss: !!t.boss, maxHp: hp, hp,
      atk: EB.atk * t.atk * (1 + 0.06 * (lv - 1)) * (multi ? 0.65 : 1), cd: t.cd, cnt: t.cd + (t.boss ? 0 : rint(2)), actI: 0, st: {},
    };
  }
  const aliveEnemies = () => B.enemies.filter(e => e.hp > 0);
  const anyAlive = () => B.enemies.some(e => e.hp > 0);
  function targetEnemy() {
    if (B.target && B.target.hp > 0) return B.target;
    const a = aliveEnemies();
    return a.length ? a[0] : null;
  }
  function setTarget(e) {
    if (!B || e.hp <= 0) return;
    B.target = e;
    Sfx.tap();
    renderEnemyStatus();
    if (B.state === 'input') {
      // 予測ダメージ更新
      B.acts.forEach((rec, i) => { if (rec && !rec.yujo) rec.preview.dmg = normalDmg(B.party[i], rec, targetEnemy(), true); });
      updateUI();
    }
  }

  function renderEnemies() {
    const wrap = B.dom.enemiesEl;
    wrap.innerHTML = '';
    const n = B.enemies.length;
    const slots = n === 1 ? [72] : n === 2 ? [63, 85] : [57, 73, 89];
    B.enemies.forEach((e, i) => {
      const d = el('div', 'bt-enemy n' + n + (e.boss ? ' boss' : ''));
      d.style.left = slots[i] + '%';
      d.style.animationDelay = (i * 0.12) + 's';
      d.innerHTML = `
        <div class="be-cnt"><small>あと</small><b></b></div>
        <div class="be-target"></div>
        <img src="${Art.url({ ...e.def, id: 'E_' + e.k })}" alt="">
        <div class="be-info"><span class="attr-ic a-${e.attr}">${ATTR[e.attr].name}</span><div class="be-hp"><i></i></div></div>
        <div class="be-st"></div>`;
      d.addEventListener('click', () => setTarget(e));
      wrap.appendChild(d);
      e.el = d;
    });
    renderEnemyStatus();
  }
  function renderEnemyStatus() {
    const tgt = targetEnemy();
    for (const e of B.enemies) {
      if (!e.el) continue;
      e.el.querySelector('.be-hp i').style.width = (e.hp / e.maxHp * 100) + '%';
      const c = e.el.querySelector('.be-cnt');
      c.querySelector('b').textContent = e.cnt;
      c.classList.toggle('danger', e.cnt <= 1);
      e.el.classList.toggle('tgt', e === tgt && aliveEnemies().length > 1);
      const st = [];
      if (e.st.defDown) st.push('<i class="s-def">防↓</i>');
      if (e.st.atkUp) st.push('<i class="s-atk">攻↑</i>');
      if (e.st.shield) st.push('<i class="s-shd">盾</i>');
      e.el.querySelector('.be-st').innerHTML = st.join('');
    }
  }
  function enemyPos(e) {
    const r = e.el.querySelector('img').getBoundingClientRect(), f = B.dom.field.getBoundingClientRect();
    return [r.left - f.left + r.width / 2, r.top - f.top + r.height * 0.55];
  }
  function heroPos(m) {
    const r = m.sprite.getBoundingClientRect(), f = B.dom.field.getBoundingClientRect();
    return [r.left - f.left + r.width / 2, r.top - f.top + r.height * 0.5];
  }

  function hitEnemy(e, d, o = {}) {
    if (!e || e.hp <= 0) return;
    d = Math.max(1, Math.round(d));
    e.hp = Math.max(0, e.hp - d);
    B.stats.maxDmg = Math.max(B.stats.maxDmg, d);
    const [x, y] = enemyPos(e);
    const cls = o.am > 1 ? 'weak' : o.am < 1 ? 'resist' : '';
    floatAt(B.dom.float, fmt(d), x + (Math.random() * 30 - 15), y - 10 + (Math.random() * 16 - 8), `dmg ${cls} ${o.big ? 'big' : ''}`);
    if (o.am > 1 && o.big) floatAt(B.dom.float, 'WEAK!', x, y - 46, 'tag weak');
    shake(e.el, 'hit');
    renderEnemyStatus();
    if (e.hp <= 0) {
      e.el.classList.add('dead');
      Sfx.boom();
      if (B.target === e) B.target = null;
      renderEnemyStatus();
    }
  }

  async function enemyPhase() {
    for (const e of aliveEnemies()) {
      e.cnt--;
      renderEnemyStatus();
      if (e.cnt > 0) continue;
      const a = e.def.act[e.actI % e.def.act.length];
      e.actI++;
      e.cnt = e.cd;
      await enemyAct(e, a);
      renderEnemyStatus();
      if (B.hp <= 0 || !B.alive) return;
    }
  }
  const ACT_LABEL = { atk: '攻撃', heavy: '強攻撃!!', multi: '連続攻撃!', jama: '邪魔プチ設置!', heal: '回復', atkUp: '攻撃力UP!', shield: 'ガード!', seal: '友情ワザ封印!' };
  async function enemyAct(e, a) {
    const bub = el('div', 'be-say', ACT_LABEL[a]);
    e.el.appendChild(bub);
    setTimeout(() => bub.remove(), 1100 / gameSpeed());
    await wait(380);
    switch (a) {
      case 'atk': await enemyHit(e, 1); break;
      case 'heavy': await enemyHit(e, 1.7); break;
      case 'multi': for (let k = 0; k < 3 && B.hp > 0; k++) await enemyHit(e, 0.42, true); break;
      case 'jama': placeJama(e.boss ? 4 : 3); Sfx.deny(); await enemyHit(e, 0.5); break;
      case 'heal': {
        const h = Math.round(e.maxHp * 0.15);
        e.hp = Math.min(e.maxHp, e.hp + h);
        const [x, y] = enemyPos(e);
        floatAt(B.dom.float, '+' + fmt(h), x, y, 'heal');
        Sfx.heal();
        await wait(400);
        break;
      }
      case 'atkUp': e.st.atkUp = { v: 0.5, t: 3 }; enemyText(e, '攻撃力UP', '#ff6a5a'); await wait(400); break;
      case 'shield': e.st.shield = { v: 0.5, t: 2 }; enemyText(e, 'ダメージ軽減', '#7ad8ff'); await wait(400); break;
      case 'seal':
        for (const m of B.party) if (m.fr) m.cd += 2;
        updateUI();
        await enemyHit(e, 0.6);
        break;
    }
  }
  async function enemyHit(e, mult, quick) {
    shake(e.el, 'lunge');
    Sfx.enemy();
    let d = e.atk * mult * (1 + (e.st.atkUp ? e.st.atkUp.v : 0)) * (0.9 + Math.random() * 0.2);
    d *= 1 - Math.min(0.6, B.cut + buffSum('shield'));
    d = Math.round(d);
    await wait(120);
    B.hp = Math.max(0, B.hp - d);
    shake(B.dom.root, 'shake');
    const fl = el('div', 'bt-redflash');
    B.dom.field.appendChild(fl);
    setTimeout(() => fl.remove(), 400);
    B.party.forEach(m => shake(m.sprite, 'hurt'));
    const f = B.dom.field.getBoundingClientRect(), h = B.dom.hp.getBoundingClientRect();
    floatAt(B.dom.float, '-' + fmt(d), h.left - f.left + h.width * 0.5, f.height - 12, 'pdmg');
    updateUI();
    await wait(quick ? 230 : 420);
  }

  function healParty(h, m) {
    h = Math.round(h);
    B.hp = Math.min(B.maxHp, B.hp + h);
    const f = B.dom.field.getBoundingClientRect(), hb = B.dom.hp.getBoundingClientRect();
    floatAt(B.dom.float, '+' + fmt(h), hb.left - f.left + hb.width * 0.5, f.height - 12, 'heal');
    if (m && m.sprite) shake(m.sprite, 'healfx');
    Sfx.heal();
    updateUI();
  }

  // ========================================================
  //  ウェーブ・ターン
  // ========================================================
  async function beginWave(first) {
    B.enemies = B.stage.waves[B.wave].map(makeEnemy);
    B.target = null;
    renderEnemies();
    updateUI();
    const boss = B.enemies.some(e => e.boss);
    await banner(boss ? 'BOSS BATTLE' : `WAVE ${B.wave + 1}/${B.stage.waves.length}`, boss ? 'boss' : '');
    if (first) { B.state = 'input'; updateUI(); }
  }
  async function checkWave() {
    if (anyAlive()) return false;
    await wait(350);
    if (B.wave + 1 >= B.stage.waves.length) { await victory(); return true; }
    await banner('WAVE CLEAR!', 'clear');
    B.dom.field.classList.add('run');
    await wait(600);
    B.dom.field.classList.remove('run');
    B.wave++;
    await beginWave(false);
    B.waveChanged = B.state === 'busy' && B.cur >= B.party.length;
    return false;
  }
  function endTurn() {
    for (const m of B.party) if (m.fr && m.cd > 0) m.cd--;
    for (const k of ['atk', 'shield', 'short']) {
      B.buffs[k].forEach(b => b.t--);
      B.buffs[k] = B.buffs[k].filter(b => b.t > 0);
    }
    for (const e of B.enemies) for (const s of Object.keys(e.st)) { e.st[s].t--; if (e.st[s].t <= 0) delete e.st[s]; }
    B.turn++;
    B.cur = 0;
    B.acts = [];
    B.state = 'input';
    renderEnemyStatus();
    updateUI();
  }

  async function victory() {
    B.state = 'end';
    Sfx.win();
    await banner('STAGE CLEAR!!', 'win', 1700);
    finish({ win: true, turns: B.turn, stats: B.stats, continued: B.continued });
  }
  async function defeat() {
    B.state = 'end';
    Sfx.lose();
    await banner('全滅…', 'lose', 1200);
    const cost = 50;
    const dlg = el('div', 'dialog-bg');
    dlg.innerHTML = `<div class="dialog">
      <h3>コンティニューしますか?</h3>
      <p>ルビー<b>${cost}</b>個でHP全回復、友情ワザもすぐ使えるようになります。</p>
      <p class="sub">所持ルビー: ${fmt(Save.data.ruby)}</p>
      <div class="btns"><button class="btn gray" data-a="no">あきらめる</button><button class="btn" data-a="yes" ${Save.data.ruby < cost ? 'disabled' : ''}>コンティニュー</button></div></div>`;
    B.dom.root.appendChild(dlg);
    const ans = await new Promise(res => dlg.addEventListener('click', e => { const a = e.target.dataset.a; if (a) res(a); }));
    dlg.remove();
    if (ans === 'yes' && Save.data.ruby >= cost) {
      Save.data.ruby -= cost;
      Save.save();
      B.continued++;
      B.hp = B.maxHp;
      for (const m of B.party) m.cd = 0;
      Sfx.heal();
      endTurn();
    } else finish({ win: false, turns: B.turn, stats: B.stats });
  }
  function finish(res) {
    if (!B) return;
    const cb = B.opts.onEnd;
    if (B.autoT) clearTimeout(B.autoT);
    B.alive = false;
    window.removeEventListener('resize', B.onResize);
    B.dom.root.remove();
    B = null;
    cb(res);
  }
  function pauseMenu() {
    if (!B || B.state !== 'input') return;
    const dlg = el('div', 'dialog-bg');
    dlg.innerHTML = `<div class="dialog">
      <h3>ポーズ</h3>
      <p>${B.stage.id} ${B.stage.name}<br>WAVE ${B.wave + 1}/${B.stage.waves.length}　TURN ${B.turn}</p>
      <div class="help">
        <p>● 4人が順番に1回ずつプチをタップ → 全員の行動後に一斉攻撃</p>
        <p>● キャラと同じ色のプチは攻撃力1.5倍。ハートは回復</p>
        <p>● 7個以上つなげると必殺プチ! タップで爆発&必殺ワザ</p>
        <p>● 友情ワザは「GO!」でその人の番にタップ</p>
        <p>● 属性: 赤→緑→黄→青→赤 (有利1.3倍/不利0.7倍)</p>
      </div>
      <div class="btns"><button class="btn gray" data-a="sound">効果音: ${Save.data.settings.sound ? 'ON' : 'OFF'}</button></div>
      <div class="btns"><button class="btn red" data-a="retire">リタイア</button><button class="btn" data-a="back">バトルにもどる</button></div></div>`;
    B.dom.root.appendChild(dlg);
    dlg.addEventListener('click', e => {
      const a = e.target.dataset.a;
      if (!a) return;
      if (a === 'sound') { Save.data.settings.sound = !Save.data.settings.sound; Save.save(); e.target.textContent = '効果音: ' + (Save.data.settings.sound ? 'ON' : 'OFF'); return; }
      dlg.remove();
      if (a === 'retire') finish({ win: false, retire: true, turns: B.turn, stats: B.stats });
    });
  }
  function showUnitInfo(m) {
    if (!B) return;
    const t = describeTrait(m.def.t);
    const dlg = el('div', 'dialog-bg');
    dlg.innerHTML = `<div class="dialog unit-info">
      <div class="ui-head"><img src="${Art.faceUrl(m.def)}" alt=""><div><small>${m.def.title}</small><b>${m.def.name}</b><span class="attr-ic a-${m.attr}">${ATTR[m.attr].name}</span> ${TYPES[m.type].name}タイプ</div></div>
      <p>HP ${fmt(m.hp)} / 攻撃 ${fmt(m.atk)} / 回復 ${fmt(m.rcv)}</p>
      <p><b class="lbl">必殺ワザ</b> ${m.def.h.n}<br><small>${describeHissatsu(m.def.h)}</small></p>
      <p><b class="lbl">特性</b> ${m.def.t.n}<br><small>${t}</small></p>
      ${m.fr ? `<p><b class="lbl y">友情ワザ</b> ${m.fr.y.n} (${m.fr.short})<br><small>${describeEffects(m.fr.y.ef)}　チャージ${m.ycd}ターン</small></p>` : '<p><small>友情サポーター未設定</small></p>'}
      <p class="sub">必殺プチ生成に必要な数: ${needFor(m)}個</p>
      <div class="btns"><button class="btn" data-a="ok">とじる</button></div></div>`;
    B.dom.root.appendChild(dlg);
    dlg.addEventListener('click', e => { if (e.target.dataset.a || e.target === dlg) dlg.remove(); });
  }

  // ========================================================
  //  UI 更新
  // ========================================================
  function updateUI() {
    if (!B || !B.dom) return;
    const D = B.dom;
    $('.bt-wave b', D.root).textContent = B.wave + 1;
    $('.bt-turn b', D.root).textContent = B.turn;
    D.hp.querySelector('i').style.width = (B.hp / B.maxHp * 100) + '%';
    D.hp.classList.toggle('low', hpRate() < 0.3);
    D.hp.querySelector('span').textContent = `${fmt(B.hp)} / ${fmt(B.maxHp)}`;
    const bf = [];
    if (buffSum('atk')) bf.push(`<i class="b-atk">攻↑${Math.round(buffSum('atk') * 100)}%</i>`);
    if (buffSum('shield')) bf.push(`<i class="b-shd">軽減${Math.round(buffSum('shield') * 100)}%</i>`);
    if (buffSum('short')) bf.push(`<i class="b-sht">短縮-${buffSum('short')}</i>`);
    D.buffs.innerHTML = bf.join('');
    B.party.forEach((m, i) => {
      const s = m.slot;
      const rec = B.acts[i];
      s.classList.toggle('cur', B.state === 'input' && i === B.cur);
      s.classList.toggle('done', !!rec);
      const pend = s.querySelector('.bt-pend');
      if (rec) {
        const parts = [];
        if (rec.yujo) parts.push('<em class="y">友情</em>');
        if (rec.preview && rec.preview.dmg) parts.push(`<em>${fmt(rec.preview.dmg)}</em>`);
        if (rec.preview && rec.preview.heal) parts.push(`<em class="h">+${fmt(rec.preview.heal)}</em>`);
        if (rec.hiss.length) parts.push(`<em class="s">必殺×${rec.hiss.length}</em>`);
        pend.innerHTML = parts.join('');
      } else pend.innerHTML = '';
      if (m.fr) {
        const sup = s.querySelector('.bt-sup');
        sup.classList.toggle('go', m.cd <= 0);
        sup.classList.toggle('usable', m.cd <= 0 && B.state === 'input' && i === B.cur);
        sup.querySelector('.cd').textContent = m.cd <= 0 ? 'GO!' : m.cd;
      }
    });
    if (B.legend) {
      const p = B.lgauge / B.legend.gauge;
      const c = D.legend.querySelector('.val');
      c.style.strokeDasharray = `${(p * 119.4).toFixed(1)} 200`;
      D.legend.querySelector('span').textContent = p >= 1 ? '召喚!' : Math.floor(p * 100) + '%';
      D.legend.classList.toggle('full', p >= 1);
    }
    turnHint();
  }
  function turnHint() {
    if (!B) return;
    if (B.state === 'input') {
      const m = B.party[B.cur];
      const need = needFor(m);
      setHint(`<span class="nm a-${m.attr}">${m.def.short}</span> の番! プチをタップ <small>(${need}個以上で必殺プチ)</small>`);
    }
  }
  function setHint(h) { if (B) B.dom.hint.innerHTML = h; }

  // ========================================================
  //  演出
  // ========================================================
  function shake(e, cls) {
    if (!e) return;
    e.classList.remove(cls); void e.offsetWidth; e.classList.add(cls);
    setTimeout(() => e.classList.remove(cls), 700 / gameSpeed());
  }
  function bounceSprite(m) { shake(m.sprite, 'hop'); }
  function floatAt(layer, text, x, y, cls) {
    const f = el('div', 'flt ' + (cls || ''), text);
    f.style.left = x + 'px'; f.style.top = y + 'px';
    layer.appendChild(f);
    setTimeout(() => f.remove(), 1100 / gameSpeed());
  }
  function boardFloat(text, x, y, cls) { floatAt(B.dom.bfloat, text, x, y, 'bf ' + cls); }
  function partyText(t, c) {
    const [x, y] = heroPos(B.party[0]);
    const f = el('div', 'flt tag', t);
    f.style.left = (x - 30) + 'px'; f.style.top = (y - 40) + 'px'; f.style.color = c;
    B.dom.float.appendChild(f);
    setTimeout(() => f.remove(), 1100 / gameSpeed());
  }
  function enemyText(e, t, c) {
    const [x, y] = enemyPos(e);
    const f = el('div', 'flt tag', t);
    f.style.left = x + 'px'; f.style.top = (y - 50) + 'px'; f.style.color = c;
    B.dom.float.appendChild(f);
    setTimeout(() => f.remove(), 1100 / gameSpeed());
  }
  async function banner(text, cls = '', ms = 1000) {
    const b = el('div', 'bt-banner ' + cls, `<span>${text}</span>`);
    B.dom.root.appendChild(b);
    await wait(ms);
    b.remove();
  }
  // カットイン
  async function cutin(def, name, label, attr, small, legend) {
    Sfx.special();
    const c = el('div', `cutin a-${attr}${small ? ' small' : ''}${legend ? ' legend' : ''}`);
    c.innerHTML = `<div class="ci-band"><div class="ci-lines"></div></div>
      <img class="ci-img" src="${Art.url(def)}" alt="">
      <div class="ci-txt"><small>${label}</small><b>${name}</b>${!small && def.quote ? `<i>「${def.quote}」</i>` : ''}</div>`;
    B.dom.root.appendChild(c);
    await wait(small ? 900 : 1250);
    c.remove();
  }

  // ---------- エフェクト (fx キャンバス) ----------
  function fx(o) { o.t0 = performance.now() + (o.delay || 0) / gameSpeed(); o.seed = Math.random(); B.fx.push(o); }
  async function specialFx(type, color, targets, m) {
    const [hx, hy] = m ? heroPos(m) : [B.fw * 0.15, B.fh * 0.55];
    const tp = targets.map(enemyPos);
    const [tx, ty] = tp[0] || [B.fw * 0.7, B.fh * 0.5];
    if (m) shake(m.sprite, 'atk');
    switch (type) {
      case 'beam':
        for (const [x, y] of tp) fx({ type: 'beam', x0: hx + 20, y0: hy, x1: x, y1: y, w: 26, color, dur: 700 });
        tp.forEach(([x, y]) => fx({ type: 'burst', x, y, n: 24, color, r: 90, dur: 650, delay: 250 }));
        break;
      case 'fire':
        tp.forEach(([x, y]) => { fx({ type: 'flame', x, y, color: '#ff5a1e', dur: 800 }); fx({ type: 'burst', x, y, n: 26, color: '#ffb02e', r: 90, dur: 700 }); });
        break;
      case 'slash':
        tp.forEach(([x, y]) => [0, 1, 2].forEach(i => fx({ type: 'slash', x: x + (i - 1) * 14, y: y + (i - 1) * 10, ang: -0.7 + i * 0.5, len: 120, color: '#fff', w: 10, dur: 380, delay: i * 90 })));
        tp.forEach(([x, y]) => fx({ type: 'burst', x, y, n: 14, color, r: 70, dur: 500, delay: 200 }));
        break;
      case 'thunder':
        tp.forEach(([x, y]) => { fx({ type: 'bolt', x, y, color: '#fff36b', dur: 650 }); fx({ type: 'bolt', x: x + 18, y, color: '#ffffff', dur: 500, delay: 120 }); fx({ type: 'burst', x, y, n: 18, color: '#ffe04a', r: 80, dur: 600 }); });
        fx({ type: 'flash', color: '#fffbd0', dur: 250 });
        break;
      case 'wind':
        tp.forEach(([x, y]) => { fx({ type: 'ball', x0: hx, y0: hy, x1: x, y1: y, r: 22, color: '#7ad8ff', spin: true, dur: 520 }); fx({ type: 'ring', x, y, r0: 10, r1: 110, color: '#bfefff', w: 10, dur: 600, delay: 480 }); fx({ type: 'burst', x, y, n: 20, color: '#7ad8ff', r: 90, dur: 600, delay: 480 }); });
        break;
      case 'water':
        tp.forEach(([x, y]) => { fx({ type: 'wave', x, y, color: '#3b9bff', dur: 800 }); fx({ type: 'burst', x, y, n: 22, color: '#bfe4ff', r: 90, dur: 700, delay: 200 }); });
        break;
      case 'getsuga':
        tp.forEach(([x, y]) => { fx({ type: 'crescent', x0: hx, y0: hy, x1: x, y1: y, color: '#1a1a2a', edge: '#ff3a3a', dur: 560 }); fx({ type: 'burst', x, y, n: 20, color: '#ff4a4a', r: 90, dur: 600, delay: 500 }); });
        break;
      case 'punch':
        tp.forEach(([x, y]) => { fx({ type: 'star', x, y, r: 70, color, dur: 500 }); fx({ type: 'ring', x, y, r0: 20, r1: 140, color: '#fff', w: 12, dur: 600 }); });
        fx({ type: 'flash', color: '#ffffff', dur: 200 });
        break;
      case 'explosion':
        tp.forEach(([x, y], i) => { fx({ type: 'explode', x, y, r: 80, dur: 700, delay: i * 80 }); fx({ type: 'burst', x, y, n: 26, color: '#ff8a2a', r: 110, dur: 750, delay: i * 80 }); });
        fx({ type: 'flash', color: '#ffe0b0', dur: 250 });
        break;
      case 'dark':
        tp.forEach(([x, y]) => { fx({ type: 'star', x, y, r: 60, color: '#1a0a1a', dur: 450 }); fx({ type: 'burst', x, y, n: 26, color: '#ff2a4a', r: 100, dur: 650 }); fx({ type: 'bolt', x, y, color: '#ff3a5a', dur: 400 }); });
        break;
      case 'purple':
        fx({ type: 'ball', x0: hx, y0: hy, x1: tx, y1: ty, r: 46, color: '#b45cff', dur: 650 });
        tp.forEach(([x, y]) => fx({ type: 'ring', x, y, r0: 20, r1: 160, color: '#d9a8ff', w: 16, dur: 650, delay: 600 }));
        fx({ type: 'flash', color: '#e6ccff', dur: 300, delay: 600 });
        break;
      case 'rush':
        tp.forEach(([x, y]) => { for (let i = 0; i < 12; i++) fx({ type: 'star', x: x + (Math.random() - 0.5) * 70, y: y + (Math.random() - 0.5) * 60, r: 26, color, dur: 220, delay: i * 55 }); });
        break;
      case 'ice':
        tp.forEach(([x, y]) => { fx({ type: 'shards', x, y, color: '#e8f8ff', dur: 750 }); fx({ type: 'ring', x, y, r0: 10, r1: 100, color: '#bfefff', w: 8, dur: 600 }); });
        break;
      case 'disk':
        tp.forEach(([x, y]) => { fx({ type: 'ball', x0: hx, y0: hy - 20, x1: x, y1: y, r: 24, color: '#fff36b', disk: true, dur: 480 }); fx({ type: 'slash', x, y, ang: 0.1, len: 120, color: '#fff36b', w: 8, dur: 300, delay: 460 }); });
        break;
      case 'meteor':
        tp.forEach(([x, y]) => [0, 1, 2].forEach(i => fx({ type: 'ball', x0: x - 120 + i * 30, y0: -30, x1: x + (i - 1) * 20, y1: y, r: 14, color: '#ffb02e', dur: 420, delay: i * 120 })));
        tp.forEach(([x, y]) => fx({ type: 'burst', x, y, n: 24, color: '#ffb02e', r: 90, dur: 600, delay: 420 }));
        break;
      default:
        tp.forEach(([x, y]) => fx({ type: 'burst', x, y, n: 20, color, r: 80, dur: 600 }));
    }
    await wait(type === 'purple' ? 900 : type === 'rush' ? 750 : 600);
  }
  function drawFx(now) {
    const ctx = B.fctx;
    ctx.clearRect(0, 0, B.fw, B.fh);
    const spd = gameSpeed();
    for (const f of B.fx) {
      const p = (now - f.t0) / (f.dur / spd);
      if (p < 0) continue;
      if (p >= 1) { f.done = true; continue; }
      ctx.save();
      switch (f.type) {
        case 'ring':
          ctx.globalAlpha = 1 - p; ctx.strokeStyle = f.color; ctx.lineWidth = f.w * (1 - p) + 1;
          ctx.beginPath(); ctx.arc(f.x, f.y, f.r0 + (f.r1 - f.r0) * p, 0, Math.PI * 2); ctx.stroke(); break;
        case 'burst':
          for (let i = 0; i < f.n; i++) {
            const a = (i / f.n) * Math.PI * 2 + f.seed * 6, s = (0.5 + ((i * 7919 + f.seed * 1000) % 50) / 100);
            const d = f.r * s * Math.sqrt(p);
            ctx.globalAlpha = 1 - p; ctx.fillStyle = f.color;
            ctx.beginPath(); ctx.arc(f.x + Math.cos(a) * d, f.y + Math.sin(a) * d, 5 * (1 - p) + 1.5, 0, Math.PI * 2); ctx.fill();
          }
          break;
        case 'beam': {
          const g = Math.min(1, p / 0.3), fade = p > 0.7 ? 1 - (p - 0.7) / 0.3 : 1;
          const x = f.x0 + (f.x1 - f.x0) * g, y = f.y0 + (f.y1 - f.y0) * g;
          ctx.globalAlpha = fade; ctx.lineCap = 'round';
          ctx.strokeStyle = f.color; ctx.lineWidth = f.w * (1 + Math.sin(now / 40) * 0.12);
          ctx.shadowColor = f.color; ctx.shadowBlur = 20;
          ctx.beginPath(); ctx.moveTo(f.x0, f.y0); ctx.lineTo(x, y); ctx.stroke();
          ctx.strokeStyle = '#fff'; ctx.lineWidth = f.w * 0.4; ctx.stroke();
          ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, f.w * 0.9, 0, Math.PI * 2); ctx.fill();
          break;
        }
        case 'slash': {
          const g = Math.min(1, p / 0.35);
          ctx.globalAlpha = 1 - Math.max(0, (p - 0.4) / 0.6);
          ctx.translate(f.x, f.y); ctx.rotate(f.ang);
          ctx.strokeStyle = f.color; ctx.lineWidth = f.w; ctx.lineCap = 'round';
          ctx.shadowColor = f.color; ctx.shadowBlur = 12;
          ctx.beginPath(); ctx.moveTo(-f.len / 2, 0); ctx.lineTo(-f.len / 2 + f.len * g, 0); ctx.stroke();
          break;
        }
        case 'bolt': {
          ctx.globalAlpha = p < 0.7 ? 1 : 1 - (p - 0.7) / 0.3;
          ctx.strokeStyle = f.color; ctx.lineWidth = 5; ctx.shadowColor = f.color; ctx.shadowBlur = 16; ctx.lineJoin = 'miter';
          ctx.beginPath(); ctx.moveTo(f.x + (Math.random() - 0.5) * 20, 0);
          const steps = 7;
          for (let i = 1; i <= steps; i++) ctx.lineTo(f.x + (Math.random() - 0.5) * 34 * (i < steps ? 1 : 0), f.y * i / steps);
          ctx.stroke();
          break;
        }
        case 'flame':
          for (let i = 0; i < 14; i++) {
            const a = f.seed * 10 + i, rr = 20 + (i % 5) * 9;
            const yy = f.y + 30 - p * 90 * ((i % 3) + 1) / 2;
            ctx.globalAlpha = (1 - p) * 0.85;
            ctx.fillStyle = i % 2 ? '#ffcf3a' : f.color;
            ctx.beginPath(); ctx.arc(f.x + Math.sin(a * 3) * 34, yy, rr * (1 - p * 0.5), 0, Math.PI * 2); ctx.fill();
          }
          break;
        case 'wave':
          ctx.globalAlpha = 1 - p; ctx.strokeStyle = f.color; ctx.lineWidth = 10; ctx.lineCap = 'round';
          for (let k = 0; k < 3; k++) {
            ctx.beginPath();
            for (let i = 0; i <= 20; i++) {
              const xx = f.x - 90 + i * 9, yy = f.y + Math.sin(i / 2 + p * 14 + k) * 16 - 26 + k * 24;
              i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
            }
            ctx.stroke();
          }
          break;
        case 'ball': {
          const g = Math.min(1, p / 0.85);
          const x = f.x0 + (f.x1 - f.x0) * g, y = f.y0 + (f.y1 - f.y0) * g;
          ctx.globalAlpha = p > 0.85 ? 1 - (p - 0.85) / 0.15 : 1;
          ctx.shadowColor = f.color; ctx.shadowBlur = 24;
          if (f.disk) {
            ctx.translate(x, y); ctx.scale(1, 0.35);
            ctx.fillStyle = f.color; ctx.beginPath(); ctx.arc(0, 0, f.r, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, f.r * 0.5, 0, Math.PI * 2); ctx.fill();
          } else {
            const gr = ctx.createRadialGradient(x, y, 2, x, y, f.r);
            gr.addColorStop(0, '#fff'); gr.addColorStop(0.5, f.color); gr.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, f.r * (1 + Math.sin(now / 50) * 0.1), 0, Math.PI * 2); ctx.fill();
            if (f.spin) {
              ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
              for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x, y, f.r * 0.7, now / 60 + i * 2, now / 60 + i * 2 + 1.4); ctx.stroke(); }
            }
          }
          break;
        }
        case 'crescent': {
          const g = Math.min(1, p / 0.85);
          const x = f.x0 + (f.x1 - f.x0) * g, y = f.y0 + (f.y1 - f.y0) * g;
          ctx.globalAlpha = p > 0.85 ? 1 - (p - 0.85) / 0.15 : 1;
          ctx.translate(x, y);
          ctx.shadowColor = f.edge; ctx.shadowBlur = 18;
          ctx.fillStyle = f.color; ctx.strokeStyle = f.edge; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.arc(0, 0, 50, -1.2, 1.2); ctx.arc(-22, 0, 44, 1.1, -1.1, true); ctx.closePath(); ctx.fill(); ctx.stroke();
          break;
        }
        case 'star': {
          ctx.globalAlpha = 1 - p;
          ctx.translate(f.x, f.y); ctx.rotate(f.seed * 3);
          const R = f.r * (0.6 + p * 0.6);
          ctx.fillStyle = '#fff'; ctx.strokeStyle = f.color; ctx.lineWidth = 6;
          ctx.beginPath();
          for (let i = 0; i < 16; i++) { const rr = i % 2 ? R * 0.45 : R; const a = i / 16 * Math.PI * 2; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
          ctx.closePath(); ctx.stroke(); ctx.fill();
          break;
        }
        case 'explode': {
          ctx.globalAlpha = 1 - p;
          const gr = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * (0.5 + p));
          gr.addColorStop(0, '#fff'); gr.addColorStop(0.35, '#ffd84a'); gr.addColorStop(0.7, '#ff5a1e'); gr.addColorStop(1, 'rgba(255,60,0,0)');
          ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (0.5 + p), 0, Math.PI * 2); ctx.fill();
          break;
        }
        case 'shards':
          ctx.globalAlpha = 1 - p; ctx.fillStyle = f.color; ctx.strokeStyle = '#7ac8ff'; ctx.lineWidth = 2;
          for (let i = 0; i < 9; i++) {
            const a = i / 9 * Math.PI * 2 + f.seed, d = 20 + p * 70;
            ctx.save(); ctx.translate(f.x + Math.cos(a) * d, f.y + Math.sin(a) * d); ctx.rotate(a);
            ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(0, -5); ctx.lineTo(16, 0); ctx.lineTo(0, 5); ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.restore();
          }
          break;
        case 'flash':
          ctx.globalAlpha = (1 - p) * 0.7; ctx.fillStyle = f.color; ctx.fillRect(0, 0, B.fw, B.fh); break;
      }
      ctx.restore();
    }
    B.fx = B.fx.filter(f => !f.done);
  }

  // テスト・デバッグ用: 現在の状態と、最良手の画面座標
  function peek() { return B; }
  function bestMove() {
    if (!B || B.state !== 'input') return null;
    const best = bestCell();
    if (!best) return null;
    const r = B.dom.cv.getBoundingClientRect();
    return { x: r.left + px(best[0]), y: r.top + py(best[0], best[1]) };
  }
  return { start, peek, bestMove, COLS, ROWS };
})();

// ---------- スキル説明文 ----------
function describeEffects(list) {
  const C = k => ({ red: '赤', green: '緑', blue: '青', yellow: '黄', heart: 'ハート', rainbow: '虹' }[k]);
  return (list || []).map(ef => {
    switch (ef.t) {
      case 'conv': return `${ef.shape === 'heart' ? 'ハート型に' : ef.shape === 'cross' ? '十字型に' : 'ランダムな'}プチ${ef.n}個を${C(ef.to)}プチに変換`;
      case 'rainbow': return `ランダムなプチ${ef.n}個を虹プチに変換`;
      case 'heal': return `HPを${Math.round(ef.v * 100)}%回復`;
      case 'atkUp': return `${ef.turns}ターンの間、味方の攻撃力${Math.round(ef.v * 100)}%UP`;
      case 'shield': return `${ef.turns}ターンの間、受けるダメージを${Math.round(ef.v * 100)}%軽減`;
      case 'short': return `${ef.turns}ターンの間、必殺プチ生成に必要な数-${ef.v}`;
      case 'delay': return `敵の行動を${ef.v}ターン遅らせる`;
      case 'defDown': return `${ef.turns}ターンの間、敵の防御力${Math.round(ef.v * 100)}%DOWN`;
      case 'dmg': return `敵${ef.tg === 'a' ? '全体' : '単体'}に攻撃力×${ef.m}倍のダメージ`;
      case 'hissatsu': return 'このキャラの必殺プチを1個生成';
      case 'clearJama': return '邪魔プチをすべて消す';
    }
    return '';
  }).join('。');
}
function describeHissatsu(h) {
  let s = `敵${h.tg === 'a' ? '全体' : '単体'}に大ダメージ(×${h.m})`;
  if (h.ef && h.ef.length) s += '。' + describeEffects(h.ef);
  return s;
}
function describeTrait(t) {
  switch (t.k) {
    case 'hpHigh': return `HP${Math.round(t.hp * 100)}%以上のとき、必殺プチ生成に必要なプチ数-${t.short}、攻撃力${Math.round(t.atk * 100)}%UP`;
    case 'lowHpShort': return `HP${Math.round(t.hp * 100)}%以下のとき、必殺プチ生成に必要なプチ数-${t.short}、攻撃力${Math.round(t.atk * 100)}%UP`;
    case 'chain': return `${t.n}個以上プチを割ったとき、攻撃力${Math.round(t.v * 100)}%UP`;
    case 'special': return `必殺ワザのダメージ${Math.round(t.v * 100)}%UP`;
    case 'heal': return `ハートプチの回復量${Math.round(t.v * 100)}%UP`;
    case 'atk': return `攻撃力${Math.round(t.v * 100)}%UP`;
    case 'first': return `1ターン目の攻撃力${Math.round(t.v * 100)}%UP`;
    case 'lowHp': return `HP${Math.round(t.hp * 100)}%以下のとき、攻撃力${Math.round(t.v * 100)}%UP`;
    case 'boss': return `ボスへのダメージ${Math.round(t.v * 100)}%UP`;
    case 'cut': return `味方が受けるダメージを${Math.round(t.v * 100)}%軽減`;
    case 'attrAtk': return `味方の${ATTR[t.attr].name}属性キャラの攻撃力${Math.round(t.v * 100)}%UP`;
    case 'heartAtk': return `ハートプチを割ったときも攻撃する(攻撃力の${Math.round(t.v * 100)}%)`;
  }
  return '';
}
