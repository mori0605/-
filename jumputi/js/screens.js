// ============================================================
//  UI: タイトル・ホーム・クエスト・編成・キャラ・ガチャ・リザルト
// ============================================================
const UI = (() => {
  const app = () => $('#app');
  let timer = null;
  const ICON = {
    home: '<svg viewBox="0 0 24 24"><path d="M3 11 12 3l9 8v10h-6v-6H9v6H3Z"/></svg>',
    chara: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="5"/><path d="M3 22c0-5 4-8 9-8s9 3 9 8Z"/></svg>',
    party: '<svg viewBox="0 0 24 24"><circle cx="7" cy="8" r="3.4"/><circle cx="17" cy="8" r="3.4"/><path d="M1 20c0-4 3-6.5 6-6.5s6 2.5 6 6.5Zm10 0c0-4 3-6.5 6-6.5s6 2.5 6 6.5Z"/></svg>',
    quest: '<svg viewBox="0 0 24 24"><path d="M4 21V4h11l-1.5 3.5L15 11H6v10Z"/><path d="M15 4h5l-1.5 3.5L20 11h-5"/></svg>',
    gacha: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18" stroke="#fff" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="#fff"/></svg>',
  };
  const rubyI = '<i class="ic-ruby"></i>', coinI = '<i class="ic-coin"></i>', staI = '<i class="ic-sta"></i>';

  function clearTimer() { if (timer) { clearInterval(timer); timer = null; } }

  // ---------- 共通フレーム ----------
  function frame(tab, inner, cls = '') {
    clearTimer();
    const a = app();
    a.innerHTML = '';
    const s = el('div', 'screen menu ' + cls);
    s.innerHTML = `
      <header class="hd">
        <div class="hd-rank"><small>RANK</small><b>${Save.data.rank}</b><div class="hd-rexp"><i style="width:${Save.data.rankExp / Save.rankNeed(Save.data.rank) * 100}%"></i></div></div>
        <div class="hd-sta">${staI}<div class="hd-stabar"><i></i><span></span></div><em></em></div>
        <div class="hd-res"><span>${rubyI}<b class="v-ruby">${fmt(Save.data.ruby)}</b></span><span>${coinI}<b class="v-coin">${fmt(Save.data.coin)}</b></span></div>
      </header>
      <main class="mn"></main>
      <nav class="nv">${[['home', 'ホーム'], ['chara', 'キャラ'], ['party', '編成'], ['quest', 'クエスト'], ['gacha', 'ガチャ']]
        .map(([k, n]) => `<button data-nav="${k}" class="${k === tab ? 'on' : ''}">${ICON[k]}<span>${n}</span>${k === 'gacha' && Save.data.ruby >= GACHA_COST.ten ? '<i class="badge">!</i>' : ''}</button>`).join('')}</nav>`;
    a.appendChild(s);
    const main = $('.mn', s);
    if (typeof inner === 'string') main.innerHTML = inner; else main.appendChild(inner);
    $$('.nv button', s).forEach(b => b.addEventListener('click', () => { Sfx.tap(); show(b.dataset.nav); }));
    tickHeader();
    timer = setInterval(tickHeader, 1000);
    return main;
  }
  function tickHeader() {
    Save.tickStamina();
    const d = Save.data, max = Save.maxStamina();
    const bar = $('.hd-stabar');
    if (!bar) return;
    bar.querySelector('i').style.width = Math.min(100, d.stamina / max * 100) + '%';
    bar.querySelector('span').textContent = `${d.stamina}/${max}`;
    const nx = Save.staminaNext();
    $('.hd-sta em').textContent = nx ? `${Math.floor(nx / 60000)}:${String(Math.floor(nx / 1000) % 60).padStart(2, '0')}` : 'MAX';
    $('.v-ruby').textContent = fmt(d.ruby);
    $('.v-coin').textContent = fmt(d.coin);
  }

  function modal(html, cls = '') {
    const bg = el('div', 'dialog-bg');
    bg.innerHTML = `<div class="dialog ${cls}">${html}</div>`;
    document.body.appendChild(bg);
    bg.addEventListener('click', e => { if (e.target === bg || e.target.dataset.close != null) { Sfx.tap(); bg.remove(); } });
    return bg;
  }
  function confirmDlg(title, text, ok = 'OK', cancel = 'キャンセル') {
    return new Promise(res => {
      const bg = modal(`<h3>${title}</h3><p>${text}</p><div class="btns"><button class="btn gray" data-r="0">${cancel}</button><button class="btn" data-r="1">${ok}</button></div>`);
      bg.addEventListener('click', e => { const r = e.target.dataset.r; if (r != null) { bg.remove(); res(r === '1'); } });
    });
  }

  const attrIc = a => `<span class="attr-ic a-${a}">${ATTR[a].name}</span>`;
  function faceCard(def, opts = {}) {
    const u = opts.unit;
    return `<div class="fc a-${def.attr} r${def.r || 5} ${opts.cls || ''}" ${opts.data || ''}>
      <img src="${Art.faceUrl(def)}" alt="" loading="lazy">
      ${def.r ? `<span class="fc-r">${stars(def.r)}</span>` : ''}
      ${u ? `<span class="fc-lv">Lv${u.lv}</span>` : ''}
      ${opts.label ? `<span class="fc-lb">${opts.label}</span>` : ''}
    </div>`;
  }

  // ========================================================
  //  タイトル
  // ========================================================
  function title() {
    clearTimer();
    app().innerHTML = '';
    const s = el('div', 'screen title');
    const parade = ['ruhi', 'goku', 'naruto', 'ichigo', 'deku', 'tanjiro', 'gojo', 'jotaro', 'gon', 'ryotsu'];
    s.innerHTML = `
      <img class="tt-bg" src="${Art.sceneUrl('island')}" alt="">
      <div class="tt-rays"></div>
      <div class="tt-logo">
        <div class="tt-l1">ジャンプチ</div>
        <div class="tt-l2">ヒーローズ</div>
        <div class="tt-sub">ファンメイド再現版</div>
      </div>
      <div class="tt-parade">${parade.map((id, i) => `<img src="${Art.url(HERO_MAP[id])}" style="animation-delay:${i * -0.21}s" alt="">`).join('')}</div>
      <div class="tt-tap">TAP TO START</div>
      <div class="tt-note">※ サービス終了したゲームを遊び方だけ再現したファンメイド作品です。<br>登場キャラクターはすべて名前・外見を変えたパロディです。</div>`;
    app().appendChild(s);
    s.addEventListener('click', () => {
      Sfx.unlock(); Sfx.ok();
      const lb = Save.checkLogin();
      show('home');
      if (!Save.data.seen.intro) {
        Save.data.seen.intro = 1; Save.save();
        howto(true);
      } else if (lb) loginBonus(lb);
    }, { once: true });
  }
  function loginBonus(lb) {
    modal(`<h3>ログインボーナス</h3><p class="big-txt">${lb.days}日目</p>
      <p>${rubyI} ルビー ×${lb.ruby}<br>${coinI} コイン ×${fmt(lb.coin)}<br>${staI} スタミナ全回復</p>
      <div class="btns"><button class="btn" data-close>OK</button></div>`);
    tickHeader();
  }
  function howto(first) {
    modal(`<h3>あそびかた</h3>
      <div class="help">
        <p>● バトルは<b>メイン4人</b>が順番に1回ずつプチをタップ。4人の行動が終わると<b>一斉に攻撃</b>!</p>
        <p>● 同じ色のプチがつながっていると<b>まとめて割れる</b>。たくさん割るほど強い攻撃に</p>
        <p>● キャラと<b>同じ色のプチ</b>を割ると攻撃力1.5倍。<span class="hearttxt">ハート</span>はHP回復</p>
        <p>● <b>7個以上</b>つなげて割ると、タップした所から一番遠い場所に<b>必殺プチ</b>が出現!</p>
        <p>● 必殺プチをタップすると周りを巻きこんで<b>大爆発</b>&その顔のキャラの<b>必殺ワザ</b>発動。必殺プチ同士は誘爆するよ</p>
        <p>● サポートの<b>友情ワザ</b>はターン経過で「GO!」。そのキャラの番にタップで発動 (そのキャラはプチを割らない)</p>
        <p>● プチを割るとレジェンドゲージがたまり、満タンで<b>レジェンド召喚</b> (行動を消費しない)</p>
        <p>● 属性相性: <b class="t-red">赤</b>→<b class="t-green">緑</b>→<b class="t-yellow">黄</b>→<b class="t-blue">青</b>→<b class="t-red">赤</b> (有利1.3倍/不利0.7倍)</p>
        <p>● 敵の頭上の数字は攻撃までのターン数。敵をタップで攻撃対象を選べる</p>
      </div>
      ${first ? `<p class="sub">ようこそ! はじめにルビー${fmt(Save.data.ruby)}個をプレゼント。<br>まずは<b>ガチャ</b>で仲間を増やしてから<b>編成</b>しよう!</p>` : ''}
      <div class="btns"><button class="btn" data-close>OK</button></div>`, 'wide');
  }

  // ========================================================
  //  ホーム
  // ========================================================
  function home() {
    const d = Save.data;
    const leaderId = d.party.main.find(id => id && Save.has(id)) || Object.keys(d.heroes)[0];
    const leader = HERO_MAP[leaderId];
    const cleared = AREAS.reduce((a, ar) => a + ar.stages.filter(s => d.clear[s.id]).length, 0);
    const next = nextStage();
    const m = frame('home', `
      <div class="home">
        <img class="home-bg" src="${Art.sceneUrl('island')}" alt="">
        <div class="home-title">ジャンプチアイランド</div>
        <div class="home-leader">
          <div class="bubble">${leader.quote}</div>
          <img src="${Art.url(leader)}" alt="">
          <div class="home-name">${leader.name}</div>
        </div>
        <div class="home-info">
          <div>総合力 <b>${fmt(Save.power())}</b></div>
          <div>クエスト <b>${cleared}</b>/40</div>
          <div>キャラ <b>${Object.keys(d.heroes).length}</b>/${HEROES.length}</div>
        </div>
        <div class="home-walk">${walkers()}</div>
        <div class="home-btns">
          <button class="bigbtn quest" data-go="quest"><b>クエスト</b><small>${next ? `次は ${next.id} ${next.name}` : '全ステージクリア!'}</small></button>
          <button class="bigbtn gacha" data-go="gacha"><b>ガチャ</b><small>10連で★5確定!</small></button>
        </div>
        <div class="home-sub">
          <button class="btn sm" data-go="mission">ミッション${Save.missionsReady() ? `<i class="mbadge">${Save.missionsReady()}</i>` : ''}</button>
          <button class="btn sm gray" data-go="howto">あそびかた</button>
          <button class="btn sm gray" data-go="settings">設定</button>
        </div>
      </div>`);
    m.addEventListener('click', e => {
      const g = e.target.closest('[data-go]');
      if (!g) return;
      Sfx.tap();
      const k = g.dataset.go;
      if (k === 'howto') howto(false);
      else if (k === 'mission') missions();
      else if (k === 'settings') settings();
      else if (k === 'quest' && next) show('quest', next.area);
      else show(k);
    });
    $('.home-leader img', m).addEventListener('click', () => { Sfx.tap(); const b = $('.home-leader .bubble', m); b.textContent = pick(HEROES.filter(h => Save.has(h.id))).quote; });
  }
  function walkers() {
    const owned = HEROES.filter(h => Save.has(h.id));
    const list = owned.sort(() => Math.random() - 0.5).slice(0, 4);
    return list.map((h, i) => `<img class="${i % 2 ? 'flip' : ''}" src="${Art.url(h)}" style="animation-delay:${-i * 2.3}s;animation-duration:${8 + i * 1.7}s;bottom:${(i % 2) * 14}px" alt="">`).join('');
  }
  function missions() {
    const d = Save.data;
    const rows = MISSIONS.map(m => {
      const got = !!d.missions[m.id], ok = m.check(d);
      return `<div class="ms ${got ? 'got' : ok ? 'ok' : ''}"><div><b>${m.name}</b><small>${m.desc}</small></div>
        <span class="ms-rw">${rubyI}${m.ruby}</span>
        ${got ? '<em>受取済</em>' : ok ? `<button class="btn sm" data-m="${m.id}">受け取る</button>` : '<em class="no">未達成</em>'}</div>`;
    }).join('');
    const bg = modal(`<h3>ミッション</h3><div class="ms-list">${rows}</div><div class="btns"><button class="btn gray" data-close>とじる</button></div>`, 'wide');
    bg.addEventListener('click', e => {
      const id = e.target.dataset.m;
      if (!id) return;
      const m = MISSIONS.find(x => x.id === id);
      if (d.missions[id] || !m.check(d)) return;
      d.missions[id] = 1;
      d.ruby += m.ruby;
      Save.save();
      Sfx.ok();
      toast(`ルビー${m.ruby}個を受け取った!`);
      bg.remove();
      home();
      missions();
    });
  }
  function nextStage() {
    for (const a of AREAS) for (const s of a.stages) if (!Save.data.clear[s.id]) return s;
    return null;
  }
  const areaUnlocked = a => a.id === 1 || !!Save.data.clear[`${a.id - 1}-5`];
  const stageUnlocked = (a, i) => areaUnlocked(a) && (i === 0 || !!Save.data.clear[a.stages[i - 1].id]);

  function settings() {
    const s = Save.data.settings;
    const bg = modal(`<h3>設定</h3>
      <div class="set-row"><span>プレイヤー名</span><input class="set-name" maxlength="12" value="${Save.data.name.replace(/"/g, '')}"></div>
      <div class="set-row"><span>効果音</span><button class="btn sm" data-s="sound">${s.sound ? 'ON' : 'OFF'}</button></div>
      <div class="set-row"><span>バトル速度</span><button class="btn sm" data-s="speed">×${s.speed}</button></div>
      <div class="set-row"><span>データ</span><button class="btn sm red" data-s="reset">はじめから</button></div>
      <p class="sub">プレイ記録: ${Save.data.stats.wins}勝 / ${Save.data.stats.battles}戦　ガチャ ${Save.data.stats.gacha}回</p>
      <div class="btns"><button class="btn" data-close>とじる</button></div>`);
    $('.set-name', bg).addEventListener('change', e => { Save.data.name = e.target.value || 'ジャンプチ隊長'; Save.save(); });
    bg.addEventListener('click', async e => {
      const k = e.target.dataset.s;
      if (!k) return;
      Sfx.tap();
      if (k === 'sound') { s.sound = !s.sound; e.target.textContent = s.sound ? 'ON' : 'OFF'; }
      if (k === 'speed') { s.speed = s.speed >= 3 ? 1 : s.speed + 1; e.target.textContent = '×' + s.speed; }
      if (k === 'reset') {
        bg.remove();
        if (await confirmDlg('データ初期化', 'すべてのデータを消して最初からやり直します。よろしいですか?', '初期化する')) { Save.reset(); show('title'); }
        return;
      }
      Save.save();
    });
  }

  // ========================================================
  //  クエスト
  // ========================================================
  function quest(areaId) {
    const d = Save.data;
    if (!areaId) {
      const T = TRAINING;
      const trainCard = `<div class="area train" data-area="T" style="--ac:${T.color}">
          <img class="area-bg" src="${Art.sceneUrl(T.scene)}" alt="">
          <div class="area-no">いつでも挑戦OK</div>
          <div class="area-nm">${T.name}<small>${T.sub}</small></div>
          <img class="area-boss" src="${Art.url({ ...ENEMIES.bigGold, id: 'E_bigGold' })}" alt="">
        </div>`;
      const html = `<div class="qs"><h2 class="ttl">クエスト</h2>${trainCard}${AREAS.map(a => {
        const n = a.stages.filter(s => d.clear[s.id]).length;
        const open = areaUnlocked(a);
        const boss = ENEMIES[a.stages[4].waves[2][0]];
        return `<div class="area ${open ? '' : 'lock'}" data-area="${a.id}" style="--ac:${a.color}">
          <img class="area-bg" src="${Art.sceneUrl(a.scene)}" alt="">
          <div class="area-no">AREA ${a.id}</div>
          <div class="area-nm">${a.name}<small>${a.sub}</small></div>
          <div class="area-pr">${'<i class="on"></i>'.repeat(n)}${'<i></i>'.repeat(5 - n)}</div>
          <img class="area-boss" src="${Art.url({ ...boss, id: 'E_' + a.stages[4].waves[2][0] })}" alt="">
          ${open ? '' : '<div class="area-lock">🔒 前のエリアをクリアで解放</div>'}
        </div>`;
      }).join('')}</div>`;
      const m = frame('quest', html);
      m.addEventListener('click', e => {
        const a = e.target.closest('[data-area]');
        if (!a) return;
        if (a.dataset.area === 'T') { Sfx.tap(); show('quest', 'T'); return; }
        const ar = AREAS.find(x => x.id === +a.dataset.area);
        if (!areaUnlocked(ar)) { Sfx.deny(); toast('前のエリアをクリアすると解放されます'); return; }
        Sfx.tap();
        show('quest', ar.id);
      });
      return;
    }
    const a = findArea(areaId);
    const isT = a.id === 'T';
    const html = `<div class="qs">
      <div class="qs-head" style="--ac:${a.color}"><button class="btn sm gray back">◀ エリア</button><h2>${isT ? '' : `AREA ${a.id} `}${a.name}</h2></div>
      ${a.stages.map((s, i) => {
        const open = isT || stageUnlocked(a, i);
        const last = s.waves[s.waves.length - 1];
        return `<div class="stage ${open ? '' : 'lock'} ${d.clear[s.id] ? 'clr' : ''}" data-stage="${s.id}">
          <div class="st-id">${s.id}</div>
          <div class="st-nm"><b>${s.name}</b><small>スタミナ ${s.stamina}　推奨Lv${Math.max(1, Math.round(s.lv * 0.9))}</small></div>
          <div class="st-en">${last.map(k => `<img src="${Art.faceUrl({ ...ENEMIES[k], id: 'E_' + k })}" alt="">`).join('')}</div>
          <div class="st-mk">${isT ? `${coinI}${fmt(s.coin)}` : d.clear[s.id] ? 'CLEAR' : open ? (i === 4 ? 'BOSS' : 'NEW') : '🔒'}</div>
        </div>`;
      }).join('')}</div>`;
    const m = frame('quest', html);
    $('.back', m).addEventListener('click', () => { Sfx.tap(); show('quest'); });
    m.addEventListener('click', e => {
      const st = e.target.closest('[data-stage]');
      if (!st) return;
      const i = a.stages.findIndex(s => s.id === st.dataset.stage);
      if (!isT && !stageUnlocked(a, i)) { Sfx.deny(); toast('前のステージをクリアしよう'); return; }
      Sfx.tap();
      stageDlg(a.stages[i]);
    });
  }

  function stageDlg(s) {
    const p = Save.data.party;
    const mains = p.main.filter(id => id && Save.has(id));
    const enemyKeys = [...new Set(s.waves.flat())];
    const first = !Save.data.clear[s.id];
    const bg = modal(`<h3>${s.id} ${s.name}</h3>
      <div class="sd-en">${enemyKeys.map(k => { const e = ENEMIES[k]; return `<div class="sd-e">${faceCard({ ...e, id: 'E_' + k, r: 0 }, { cls: 'sm' })}<small>${e.name}</small></div>`; }).join('')}</div>
      <p class="sub">WAVE ${s.waves.length}　消費スタミナ <b>${s.stamina}</b>　(所持 ${Save.data.stamina})</p>
      <p class="sub">報酬: ${coinI}${fmt(s.coin)}　EXP ${s.exp}${first && s.ruby ? `　${rubyI}<b>初回${s.ruby}</b>` : ''}</p>
      <div class="sd-party">${mains.map(id => faceCard(HERO_MAP[id], { unit: Save.unit(id), cls: 'sm' })).join('')}
        ${p.legend ? faceCard({ ...LEGEND_MAP[p.legend], r: 0 }, { cls: 'sm legend' }) : ''}</div>
      <div class="btns"><button class="btn gray" data-r="party">編成</button><button class="btn go" data-r="go">出発!</button></div>`, 'wide');
    bg.addEventListener('click', e => {
      const r = e.target.dataset.r;
      if (!r) return;
      if (r === 'party') { bg.remove(); show('party'); return; }
      if (!mains.length) { Sfx.deny(); toast('メインキャラを編成してください'); return; }
      Save.tickStamina();
      if (Save.data.stamina < s.stamina) {
        Sfx.deny();
        bg.remove();
        staminaDlg();
        return;
      }
      Save.data.stamina -= s.stamina;
      if (Save.data.stamina < Save.maxStamina()) Save.data.staminaAt = Save.data.stamina + s.stamina >= Save.maxStamina() ? Date.now() : Save.data.staminaAt;
      Save.data.stats.battles++;
      Save.save();
      bg.remove();
      Sfx.ok();
      startBattle(s);
    });
  }
  async function staminaDlg() {
    const cost = 50;
    if (await confirmDlg('スタミナが足りません', `ルビー${cost}個でスタミナを全回復しますか?<br><small>(所持ルビー ${fmt(Save.data.ruby)})</small>`, '回復する')) {
      if (Save.data.ruby < cost) { toast('ルビーが足りません'); return; }
      Save.data.ruby -= cost;
      Save.data.stamina = Save.maxStamina();
      Save.save();
      Sfx.heal();
      tickHeader();
      toast('スタミナが全回復した!');
    }
  }

  function startBattle(s) {
    clearTimer();
    app().innerHTML = '';
    Battle.start({ stage: s, onEnd: res => result(s, res) });
  }

  // ========================================================
  //  リザルト
  // ========================================================
  function result(s, res) {
    const d = Save.data;
    d.stats.hiss = (d.stats.hiss || 0) + (res.stats ? res.stats.hiss : 0);
    d.stats.maxDmg = Math.max(d.stats.maxDmg || 0, res.stats ? res.stats.maxDmg : 0);
    const a = app();
    a.innerHTML = '';
    const scr = el('div', 'screen result');
    if (!res.win) {
      scr.innerHTML = `<div class="rs-box lose"><h2>${res.retire ? 'リタイア' : '敗北…'}</h2>
        <p>${s.id} ${s.name}</p>
        <div class="tips"><b>強くなるヒント</b><br>● キャラ画面でコインを使ってレベルアップ<br>● 同じ色のサポートで「属性ブースト」<br>● 敵の弱点属性(1.3倍)のキャラを入れよう<br>● ガチャで新しい仲間を探そう</div>
        <div class="btns"><button class="btn gray" data-r="home">ホーム</button><button class="btn" data-r="retry">再挑戦</button></div></div>`;
      a.appendChild(scr);
      scr.addEventListener('click', e => { const r = e.target.dataset.r; if (!r) return; Sfx.tap(); if (r === 'home') show('home'); else stageDlg(s); });
      Save.save();
      return;
    }
    const first = !d.clear[s.id];
    d.clear[s.id] = (d.clear[s.id] || 0) + 1;
    d.stats.wins++;
    const coin = s.coin, ruby = first ? s.ruby : 0;
    d.coin += coin; d.ruby += ruby;
    const rankUp = Save.addRankExp(Math.round(s.exp / 2));
    const lvs = [];
    d.party.main.forEach((id, i) => {
      if (id && Save.has(id)) lvs.push({ id, up: Save.addExp(id, s.exp), main: true });
      (d.party.sup[i] || []).forEach(sid => { if (sid && Save.has(sid)) lvs.push({ id: sid, up: Save.addExp(sid, Math.round(s.exp / 2)) }); });
    });
    // ドロップ
    let drop = null;
    const roll = Math.random();
    if (roll < 0.22) {
      const pool = HEROES.filter(h => h.r === (roll < 0.04 ? 4 : 3));
      const h = pick(pool);
      drop = { h, res: Save.addHero(h.id) };
    }
    // エリアクリア報酬
    let areaBonus = null;
    const ar = findArea(s.area);
    if (first && s.area !== 'T' && s.id.endsWith('-5')) {
      const LG = { 2: 'L_burori', 3: 'L_hagoromo', 5: 'L_raou', 8: 'L_roja' }[ar.id];
      d.ruby += 300;
      areaBonus = { ruby: 300, legend: LG && Save.addLegend(LG) ? LEGEND_MAP[LG] : null };
    }
    Save.save();
    const turns = res.turns;
    scr.innerHTML = `<div class="rs-box">
      <h2 class="rs-ttl">STAGE CLEAR!</h2>
      <p class="rs-st">${s.id} ${s.name}</p>
      <div class="rs-sc"><div><small>ターン数</small><b>${turns}</b></div><div><small>最大ダメージ</small><b>${fmt(res.stats.maxDmg)}</b></div><div><small>必殺ワザ</small><b>${res.stats.hiss}</b></div><div><small>割ったプチ</small><b>${res.stats.puchi}</b></div></div>
      <div class="rs-rw">
        <div>${coinI} コイン <b>+${fmt(coin)}</b></div>
        ${ruby ? `<div>${rubyI} ルビー <b>+${ruby}</b> <small>初回クリア</small></div>` : ''}
        <div>RANK EXP <b>+${Math.round(s.exp / 2)}</b> ${rankUp ? '<em>RANK UP!</em>' : ''}</div>
      </div>
      <div class="rs-ch">${lvs.filter(l => l.main).map(l => `<div class="rs-c">${faceCard(HERO_MAP[l.id], { unit: Save.unit(l.id), cls: 'sm' })}${l.up ? `<em>Lv UP!</em>` : `<small>+${s.exp}EXP</small>`}</div>`).join('')}</div>
      ${drop ? `<div class="rs-drop"><small>ドロップ!</small>${faceCard(drop.h, { cls: 'sm' })}<span>${drop.h.name}${drop.res.isNew ? ' <em>NEW</em>' : drop.res.lb ? ' 限界突破!' : ''}</span></div>` : ''}
      ${areaBonus ? `<div class="rs-area"><b>AREA ${ar.id} 制覇!</b><br>${rubyI} ボーナス +${areaBonus.ruby}${areaBonus.legend ? `<br>レジェンド <b>${areaBonus.legend.name}</b> が仲間になった!` : ''}</div>` : ''}
      <div class="btns"><button class="btn gray" data-r="home">ホーム</button><button class="btn gray" data-r="again">もう一度</button><button class="btn" data-r="next">${nextStage() ? '次へ' : 'クエスト'}</button></div>
    </div>`;
    a.appendChild(scr);
    scr.addEventListener('click', e => {
      const r = e.target.dataset.r;
      if (!r) return;
      Sfx.tap();
      if (r === 'home') show('home');
      else if (r === 'again') stageDlg(s);
      else { const n = nextStage(); if (n) { show('quest', n.area); stageDlg(n); } else show('quest'); }
    });
  }

  // ========================================================
  //  編成
  // ========================================================
  function party() {
    const p = Save.data.party;
    const slot = (id, k, cls, label) => id && Save.has(id)
      ? `<div class="pslot ${cls}" data-k="${k}">${faceCard(HERO_MAP[id], { unit: Save.unit(id) })}${label ? `<span class="pl">${label}</span>` : ''}</div>`
      : `<div class="pslot ${cls} empty" data-k="${k}"><span>+</span>${label ? `<span class="pl">${label}</span>` : ''}</div>`;
    const mainStats = i => {
      const id = p.main[i];
      if (!id || !Save.has(id)) return '';
      const def = HERO_MAP[id];
      let { hp, atk } = Save.statsOf(id);
      let same = 0;
      (p.sup[i] || []).forEach(s => { if (!s || !Save.has(s)) return; const t = Save.statsOf(s); const k = HERO_MAP[s].attr === def.attr ? 0.18 : 0.15; if (k > 0.15) same++; hp += t.hp * k; atk += t.atk * k; });
      const b = 1 + 0.04 * same;
      return `<div class="ps-st"><span>攻 ${fmt(atk * b)}</span><span>HP ${fmt(hp * b)}</span>${same ? `<span class="boost">属性ブースト${same}</span>` : ''}</div>`;
    };
    let hpSum = 0;
    p.main.forEach((id, i) => {
      if (!id || !Save.has(id)) return;
      const def = HERO_MAP[id];
      let { hp } = Save.statsOf(id); let same = 0;
      (p.sup[i] || []).forEach(s => { if (!s || !Save.has(s)) return; const k = HERO_MAP[s].attr === def.attr ? 0.18 : 0.15; if (k > 0.15) same++; hp += Save.statsOf(s).hp * k; });
      hpSum += hp * (1 + 0.04 * same);
    });
    const L = p.legend ? LEGEND_MAP[p.legend] : null;
    const html = `<div class="pt">
      <h2 class="ttl">編成</h2>
      <div class="pt-grid">${[0, 1, 2, 3].map(i => `
        <div class="pt-col">
          <div class="pt-no">${i + 1}</div>
          ${slot(p.main[i], `m${i}`, 'main')}
          <div class="pt-sups">${[0, 1, 2].map(j => slot((p.sup[i] || [])[j], `s${i}_${j}`, 'sup', j === 0 ? '友情' : '')).join('')}</div>
          ${mainStats(i)}
        </div>`).join('')}
      </div>
      <div class="pt-row">
        <div class="pt-legend" data-k="L">${L ? `<img src="${Art.faceUrl(L)}" alt=""><div><small>レジェンド</small><b>${L.name}</b><span>${L.s.n} / ゲージ${L.gauge}</span></div>` : '<div><small>レジェンド</small><b>未設定</b></div>'}</div>
      </div>
      <div class="pt-sum"><div>チームHP <b>${fmt(hpSum)}</b></div><div>総合力 <b>${fmt(Save.power())}</b></div></div>
      <p class="sub">メインの下の3枠はサポート。左端の<b>友情</b>枠のキャラの友情ワザが使えます。<br>サポートのステータスの一部がメインに加算 (同じ属性ならさらにブースト)</p>
      <div class="btns"><button class="btn gray" data-a="auto">おまかせ編成</button><button class="btn" data-a="quest">クエストへ</button></div>
    </div>`;
    const m = frame('party', html);
    m.addEventListener('click', e => {
      const a = e.target.closest('[data-a]');
      if (a) {
        Sfx.tap();
        if (a.dataset.a === 'auto') { autoParty(); Save.save(); party(); toast('おまかせ編成しました'); }
        else { const n = nextStage(); show('quest', n ? n.area : undefined); }
        return;
      }
      const s = e.target.closest('[data-k]');
      if (!s) return;
      Sfx.tap();
      const k = s.dataset.k;
      if (k === 'L') legendPicker();
      else heroPicker(k);
    });
  }
  function slotGet(k) {
    const p = Save.data.party;
    if (k[0] === 'm') return p.main[+k[1]];
    const [i, j] = k.slice(1).split('_').map(Number);
    return (p.sup[i] || [])[j];
  }
  function slotSet(k, id) {
    const p = Save.data.party;
    if (k[0] === 'm') { p.main[+k[1]] = id || null; return; }
    const [i, j] = k.slice(1).split('_').map(Number);
    p.sup[i] = p.sup[i] || [];
    p.sup[i][j] = id || null;
  }
  function allSlots() {
    const out = ['m0', 'm1', 'm2', 'm3'];
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) out.push(`s${i}_${j}`);
    return out;
  }
  function heroPicker(k) {
    const curId = slotGet(k);
    const owned = HEROES.filter(h => Save.has(h.id)).sort((a, b) => b.r - a.r || Save.unit(b.id).lv - Save.unit(a.id).lv);
    const where = {};
    allSlots().forEach(s => { const id = slotGet(s); if (id) where[id] = s; });
    let filter = 'all';
    const bg = modal(`<h3>${k[0] === 'm' ? 'メインキャラ' : 'サポートキャラ'}を選択</h3>
      <div class="flt-row">${['all', ...ATTRS].map(a => `<button class="chip ${a === 'all' ? 'on' : ''} ${a !== 'all' ? 'a-' + a : ''}" data-f="${a}">${a === 'all' ? '全て' : ATTR[a].name}</button>`).join('')}</div>
      <div class="pick-list"></div>
      <div class="btns">${curId ? '<button class="btn gray" data-x="remove">はずす</button>' : ''}<button class="btn gray" data-close>キャンセル</button></div>`, 'wide');
    const list = $('.pick-list', bg);
    const render = () => {
      list.innerHTML = owned.filter(h => filter === 'all' || h.attr === filter).map(h => {
        const w = where[h.id];
        const lab = w ? (w[0] === 'm' ? `メイン${+w[1] + 1}` : `サポ${+w[1] + 1}`) : '';
        const info = k[0] === 's' && k.endsWith('_0') ? h.y.n : h.h.n;
        return `<div class="pick ${h.id === curId ? 'cur' : ''}" data-id="${h.id}">${faceCard(h, { unit: Save.unit(h.id), label: lab })}<small>${h.short}</small><i>${info}</i></div>`;
      }).join('') || '<p class="sub">該当キャラがいません</p>';
    };
    render();
    bg.addEventListener('click', e => {
      const f = e.target.closest('[data-f]');
      if (f) { filter = f.dataset.f; $$('.chip', bg).forEach(c => c.classList.toggle('on', c === f)); render(); return; }
      if (e.target.dataset.x === 'remove') {
        slotSet(k, null);
        if (k[0] === 'm' && !Save.data.party.main.some(Boolean)) { toast('メインは最低1人必要です'); slotSet(k, curId); return; }
        Save.save(); bg.remove(); party(); return;
      }
      const pk = e.target.closest('[data-id]');
      if (!pk) return;
      const id = pk.dataset.id;
      const from = where[id];
      if (from && from !== k) slotSet(from, curId || null);
      slotSet(k, id);
      Save.save();
      Sfx.ok();
      bg.remove();
      party();
    });
  }
  function legendPicker() {
    const bg = modal(`<h3>レジェンドを選択</h3><div class="lg-list">${LEGENDS.map(L => {
      const own = Save.data.legends.includes(L.id);
      return `<div class="lg ${own ? '' : 'lock'} ${Save.data.party.legend === L.id ? 'cur' : ''}" data-id="${L.id}">
        <img src="${Art.faceUrl(L)}" alt=""><div><b>${own ? L.name : '？？？'}</b><small>${own ? `${L.title}　${attrIc(L.attr)}` : '未入手 (エリア制覇で入手)'}</small>
        ${own ? `<span>${L.s.n}: 敵全体に大ダメージ(×${L.s.m})${L.s.ef.length ? '。' + describeEffects(L.s.ef) : ''}　必要ゲージ${L.gauge}</span>` : ''}</div></div>`;
    }).join('')}</div><div class="btns"><button class="btn gray" data-close>とじる</button></div>`, 'wide');
    bg.addEventListener('click', e => {
      const l = e.target.closest('[data-id]');
      if (!l) return;
      if (!Save.data.legends.includes(l.dataset.id)) { Sfx.deny(); return; }
      Save.data.party.legend = l.dataset.id;
      Save.save(); Sfx.ok(); bg.remove(); party();
    });
  }
  function autoParty() {
    const p = Save.data.party;
    const score = id => { const s = Save.statsOf(id); return s.atk * 2 + s.hp * 0.5 + s.rcv; };
    const owned = HEROES.filter(h => Save.has(h.id)).map(h => h.id).sort((a, b) => score(b) - score(a));
    // メイン: 強い順だが回復役を1人入れる
    const mains = [];
    const rcvBest = owned.find(id => HERO_MAP[id].type === 'rcv');
    for (const id of owned) { if (mains.length >= (rcvBest ? 3 : 4)) break; if (id !== rcvBest) mains.push(id); }
    if (rcvBest) mains.push(rcvBest);
    const rest = owned.filter(id => !mains.includes(id));
    p.main = [0, 1, 2, 3].map(i => mains[i] || null);
    p.sup = p.main.map(() => []);
    // サポート: 同属性優先で割り振り
    for (let round = 0; round < 3; round++) {
      p.main.forEach((mid, i) => {
        if (!mid || !rest.length) return;
        const a = HERO_MAP[mid].attr;
        let k = rest.findIndex(id => HERO_MAP[id].attr === a);
        if (k < 0) k = 0;
        p.sup[i].push(rest.splice(k, 1)[0]);
      });
    }
    const L = Save.data.legends.map(id => LEGEND_MAP[id]).sort((a, b) => b.atk - a.atk)[0];
    if (L) p.legend = L.id;
  }

  // ========================================================
  //  キャラ一覧・詳細
  // ========================================================
  let charaSort = 'rarity';
  function chara() {
    const owned = HEROES.filter(h => Save.has(h.id));
    const sorter = {
      rarity: (a, b) => b.r - a.r || Save.unit(b.id).lv - Save.unit(a.id).lv,
      level: (a, b) => Save.unit(b.id).lv - Save.unit(a.id).lv,
      attr: (a, b) => ATTRS.indexOf(a.attr) - ATTRS.indexOf(b.attr) || b.r - a.r,
    }[charaSort];
    const lock = HEROES.filter(h => !Save.has(h.id));
    const html = `<div class="ch">
      <h2 class="ttl">キャラ <small>${owned.length}/${HEROES.length}</small></h2>
      <div class="flt-row">${[['rarity', 'レア度順'], ['level', 'レベル順'], ['attr', '属性順']].map(([k, n]) => `<button class="chip ${k === charaSort ? 'on' : ''}" data-sort="${k}">${n}</button>`).join('')}</div>
      <div class="ch-grid">${owned.sort(sorter).map(h => `<div class="ch-it" data-id="${h.id}">${faceCard(h, { unit: Save.unit(h.id) })}<small>${h.short}</small></div>`).join('')}
      ${lock.map(h => `<div class="ch-it lock"><div class="fc unknown"><span>?</span></div><small>？？？</small></div>`).join('')}</div>
    </div>`;
    const m = frame('chara', html);
    m.addEventListener('click', e => {
      const s = e.target.closest('[data-sort]');
      if (s) { charaSort = s.dataset.sort; Sfx.tap(); chara(); return; }
      const it = e.target.closest('[data-id]');
      if (it) { Sfx.tap(); charaDetail(it.dataset.id); }
    });
  }
  function charaDetail(id) {
    const h = HERO_MAP[id], u = Save.unit(id);
    const st = Save.statsOf(id);
    const max = Save.maxLv(id);
    const cost = Save.lvUpCost(id);
    const ycd = Math.max(2, h.y.cd - (u.wl >= 3 ? 1 : 0) - (u.wl >= 5 ? 1 : 0));
    const bg = modal(`
      <div class="cd-top a-${h.attr}">
        <img class="cd-art" src="${Art.url(h)}" alt="">
        <div class="cd-nm"><span class="cd-r">${stars(h.r)}</span><small>${h.title}</small><b>${h.name}</b><em>${h.series}</em>
          <div>${attrIc(h.attr)} <span class="type">${TYPES[h.type].name}タイプ</span></div></div>
      </div>
      <p class="cd-q">「${h.quote}」</p>
      <div class="cd-lv"><b>Lv ${u.lv}</b>/${max}<div class="cd-exp"><i style="width:${u.lv >= max ? 100 : u.exp / Save.expNeed(u.lv) * 100}%"></i></div>
        <span class="lbk">限界突破 ${'◆'.repeat(u.lb)}${'◇'.repeat(4 - u.lb)}</span><span class="wl">ワザLv ${u.wl}</span></div>
      <div class="cd-st"><div><small>HP</small><b>${fmt(st.hp)}</b></div><div><small>攻撃</small><b>${fmt(st.atk)}</b></div><div><small>回復</small><b>${fmt(st.rcv)}</b></div></div>
      <div class="cd-sk"><b class="lbl">必殺ワザ</b><span>${h.h.n}</span><small>${describeHissatsu(h.h)}${u.wl > 1 ? `　(ワザLvボーナス+${(u.wl - 1) * 10}%)` : ''}</small></div>
      <div class="cd-sk"><b class="lbl y">友情ワザ</b><span>${h.y.n}</span><small>${describeEffects(h.y.ef)}　チャージ${ycd}ターン</small></div>
      <div class="cd-sk"><b class="lbl t">特性</b><span>${h.t.n}</span><small>${describeTrait(h.t)}</small></div>
      <div class="btns"><button class="btn gray" data-close>とじる</button>
        <button class="btn" data-lv="1" ${u.lv >= max ? 'disabled' : ''}>Lv+1<small>${coinI}${fmt(cost)}</small></button>
        <button class="btn" data-lv="10" ${u.lv >= max ? 'disabled' : ''}>Lv+10<small>${coinI}${fmt(lvCost(id, 10))}</small></button></div>`, 'wide detail');
    bg.addEventListener('click', e => {
      const b = e.target.closest('[data-lv]');
      if (!b || b.disabled) return;
      const n = +b.dataset.lv;
      const c = lvCost(id, n);
      if (Save.data.coin < c) { Sfx.deny(); toast('コインが足りません'); return; }
      const before = u.lv;
      Save.data.coin -= c;
      u.lv = Math.min(max, u.lv + n);
      u.exp = 0;
      Save.save();
      Sfx.ok();
      toast(`Lv ${before} → ${u.lv}!`);
      bg.remove();
      charaDetail(id);
      tickHeader();
    });
  }
  function lvCost(id, n) {
    const u = Save.unit(id), max = Save.maxLv(id);
    let c = 0;
    const lv0 = u.lv;
    for (let k = 0; k < n && lv0 + k < max; k++) c += Math.round((80 + (lv0 + k) * 30) * (HERO_MAP[id].r - 1) / 2);
    return c;
  }

  // ========================================================
  //  ガチャ
  // ========================================================
  let bannerIdx = 0;
  function gacha() {
    const g = GACHA[bannerIdx];
    const feat = g.pick.length ? g.pick : ['ruhi', 'goku', 'naruto', 'ichigo'];
    const html = `<div class="gc">
      <h2 class="ttl">ガチャ</h2>
      <div class="gc-tabs">${GACHA.map((b, i) => `<button class="chip ${i === bannerIdx ? 'on' : ''}" data-b="${i}">${b.name}</button>`).join('')}</div>
      <div class="gc-banner" style="--gc:${g.color}">
        <div class="gc-rays"></div>
        <div class="gc-chars">${feat.map((id, i) => `<img src="${Art.url(HERO_MAP[id])}" style="animation-delay:${i * -0.3}s" alt="">`).join('')}</div>
        <div class="gc-name">${g.name}</div>
        <div class="gc-desc">${g.desc}</div>
      </div>
      <div class="gc-btns">
        <button class="btn gc1" data-n="1"><b>1回ひく</b><small>${rubyI}${GACHA_COST.single}</small></button>
        <button class="btn gc10" data-n="10"><b>10連ガチャ</b><small>${rubyI}${GACHA_COST.ten}　★5 1体確定!</small></button>
      </div>
      <p class="sub">出現率: ★5 ${GACHA_RATE[5] * 100}% / ★4 ${GACHA_RATE[4] * 100}% / ★3 ${GACHA_RATE[3] * 100}%<br>重複したキャラは「限界突破」「ワザLvアップ」に使われます</p>
      <div class="gc-list"><small>ラインナップ</small><div>${[5, 4, 3].map(r => HEROES.filter(h => h.r === r).map(h => `<img src="${Art.faceUrl(h)}" title="${h.name}" class="${Save.has(h.id) ? '' : 'dim'}" alt="">`).join('')).join('')}</div></div>
    </div>`;
    const m = frame('gacha', html);
    m.addEventListener('click', e => {
      const b = e.target.closest('[data-b]');
      if (b) { bannerIdx = +b.dataset.b; Sfx.tap(); gacha(); return; }
      const n = e.target.closest('[data-n]');
      if (n) pull(+n.dataset.n);
    });
  }
  function roll(g, minR = 3) {
    const x = Math.random();
    let r = x < GACHA_RATE[5] ? 5 : x < GACHA_RATE[5] + GACHA_RATE[4] ? 4 : 3;
    r = Math.max(r, minR);
    let pool = HEROES.filter(h => h.r === r);
    if (r === 5 && g.pick.length && Math.random() < 0.6) pool = pool.filter(h => g.pick.includes(h.id));
    return pick(pool);
  }
  async function pull(n) {
    const cost = n === 10 ? GACHA_COST.ten : GACHA_COST.single;
    if (Save.data.ruby < cost) { Sfx.deny(); toast('ルビーが足りません'); return; }
    if (!await confirmDlg(n === 10 ? '10連ガチャ' : 'ガチャ', `ルビー${cost}個を使って${n}回ひきますか?<br><small>所持ルビー ${fmt(Save.data.ruby)}</small>`, 'ひく!')) return;
    const g = GACHA[bannerIdx];
    Save.data.ruby -= cost;
    Save.data.stats.gacha += n;
    const res = [];
    for (let i = 0; i < n; i++) res.push(roll(g));
    if (n === 10 && !res.some(h => h.r === 5)) res[9] = roll(g, 5);
    const results = res.map(h => ({ h, r: Save.addHero(h.id) }));
    Save.save();
    await gachaShow(results);
    gacha();
  }
  // 演出
  function gachaShow(results) {
    return new Promise(resolve => {
      const best = Math.max(...results.map(x => x.h.r));
      const ov = el('div', 'gacha-ov');
      ov.innerHTML = `<div class="go-stage r${best}"><div class="go-rays"></div><div class="go-ball"></div><div class="go-txt">TAP!</div></div><button class="go-skip">SKIP ▶▶</button>`;
      document.body.appendChild(ov);
      let i = 0, skipped = false, phase = 'intro';
      const stage = $('.go-stage', ov);
      const showResults = () => {
        phase = 'list';
        stage.className = 'go-list';
        stage.innerHTML = `<h3>ガチャ結果</h3><div class="go-grid">${results.map(x => `<div class="go-it r${x.h.r}">${faceCard(x.h)}<small>${x.h.short}</small>${x.r.isNew ? '<em>NEW</em>' : x.r.lb ? '<em class="lb">限界突破</em>' : x.r.coin ? '<em class="cn">+800コイン</em>' : '<em class="lb">ワザLv</em>'}</div>`).join('')}</div><button class="btn">OK</button>`;
        $('.go-skip', ov).remove();
        $('.btn', stage).addEventListener('click', () => { Sfx.tap(); ov.remove(); resolve(); });
      };
      const reveal = () => {
        if (i >= results.length) { showResults(); return; }
        const x = results[i++];
        phase = 'card';
        stage.className = `go-card r${x.h.r} a-${x.h.attr}`;
        stage.innerHTML = `<div class="go-rays"></div><img class="go-art" src="${Art.url(x.h)}" alt="">
          <div class="go-info"><span class="go-r">${stars(x.h.r)}</span><small>${x.h.title}</small><b>${x.h.name}</b><em>${x.h.series}</em>
          ${x.r.isNew ? '<i class="new">NEW!</i>' : ''}</div>
          ${x.h.r === 5 ? `<div class="go-quote">「${x.h.quote}」</div>` : ''}
          <div class="go-cnt">${i}/${results.length}</div>`;
        Sfx.gacha(x.h.r);
      };
      stage.addEventListener('click', () => {
        if (phase === 'intro') {
          phase = 'opening';
          stage.classList.add('open');
          Sfx.charge();
          setTimeout(reveal, 900);
        } else if (phase === 'card') reveal();
      });
      $('.go-skip', ov).addEventListener('click', e => { e.stopPropagation(); if (!skipped) { skipped = true; Sfx.tap(); showResults(); } });
    });
  }

  // ========================================================
  function show(name, arg) {
    $$('.dialog-bg').forEach(d => d.remove());
    switch (name) {
      case 'title': return title();
      case 'home': return home();
      case 'quest': return quest(arg);
      case 'party': return party();
      case 'chara': return chara();
      case 'gacha': return gacha();
    }
  }
  return { show, modal, toast };
})();
