// ============================================================
//  Save: プレイヤーデータ (localStorage)
// ============================================================
const Save = (() => {
  const KEY = 'jumputi_remake_v1';
  const STAMINA_MIN = 60 * 1000;          // 1分で1回復
  const today = () => new Date().toISOString().slice(0, 10);

  function fresh() {
    const heroes = {};
    for (const id of ['zoro', 'vegeta', 'usoppu', 'sakuragi', 'sakuna', 'kuririn']) heroes[id] = { lv: 1, exp: 0, lb: 0, wl: 1 };
    return {
      v: 1,
      name: 'ジャンプチ隊長',
      rank: 1, rankExp: 0,
      ruby: 3000, coin: 3000,
      stamina: 30, staminaAt: Date.now(),
      heroes,
      legends: ['L_genkai'],
      party: { main: ['sakuragi', 'zoro', 'vegeta', 'sakuna'], sup: [['usoppu'], ['kuririn'], [], []], legend: 'L_genkai' },
      clear: {},
      stats: { battles: 0, wins: 0, gacha: 0, hiss: 0, maxDmg: 0 },
      missions: {},
      lastLogin: '', loginDays: 0,
      settings: { speed: 1, sound: true },
      seen: {},
    };
  }

  const S = { data: null };

  S.load = () => {
    try {
      const raw = localStorage.getItem(KEY);
      S.data = raw ? Object.assign(fresh(), JSON.parse(raw)) : fresh();
    } catch (e) {
      S.data = fresh();
    }
    S.tickStamina();
    return S.data;
  };
  S.save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(S.data)); } catch (e) { /* 保存不可でも続行 */ }
  };
  S.reset = () => {
    try { localStorage.removeItem(KEY); } catch (e) { }
    S.data = fresh();
    S.save();
  };

  // ---------- ランク・スタミナ ----------
  S.maxStamina = () => 30 + (S.data.rank - 1) * 2;
  S.rankNeed = r => 200 + r * 120;
  S.tickStamina = () => {
    const d = S.data, max = S.maxStamina();
    if (d.stamina >= max) { d.staminaAt = Date.now(); return; }
    const gained = Math.floor((Date.now() - d.staminaAt) / STAMINA_MIN);
    if (gained > 0) {
      d.stamina = Math.min(max, d.stamina + gained);
      d.staminaAt += gained * STAMINA_MIN;
    }
  };
  S.staminaNext = () => {
    const d = S.data;
    if (d.stamina >= S.maxStamina()) return 0;
    return Math.max(0, STAMINA_MIN - (Date.now() - d.staminaAt));
  };
  S.addRankExp = n => {
    const d = S.data;
    let up = 0;
    d.rankExp += n;
    while (d.rankExp >= S.rankNeed(d.rank)) {
      d.rankExp -= S.rankNeed(d.rank);
      d.rank++; up++;
    }
    if (up) d.stamina = Math.max(d.stamina, S.maxStamina());   // ランクアップで全回復
    return up;
  };

  // ---------- キャラ ----------
  S.unit = id => S.data.heroes[id];
  S.has = id => !!S.data.heroes[id];
  S.maxLv = id => RARITY[HERO_MAP[id].r].max + S.unit(id).lb * 5;
  S.expNeed = lv => 40 + lv * 25;
  S.statsOf = (id, lvOverride) => {
    const def = HERO_MAP[id], u = S.unit(id) || { lv: 1, lb: 0 };
    const R = RARITY[def.r], T = TYPES[def.type];
    const lv = lvOverride || u.lv;
    const g = 1 + (R.grow - 1) * (lv - 1) / (R.max - 1);
    return {
      hp: Math.round(R.hp * T.hp * g),
      atk: Math.round(R.atk * T.atk * g),
      rcv: Math.round(R.rcv * T.rcv * g),
    };
  };
  S.addExp = (id, n) => {
    const u = S.unit(id);
    if (!u) return 0;
    const max = S.maxLv(id);
    let up = 0;
    if (u.lv >= max) return 0;
    u.exp += n;
    while (u.lv < max && u.exp >= S.expNeed(u.lv)) {
      u.exp -= S.expNeed(u.lv);
      u.lv++; up++;
    }
    if (u.lv >= max) u.exp = 0;
    return up;
  };
  S.lvUpCost = id => {
    const u = S.unit(id);
    return Math.round((80 + u.lv * 30) * (HERO_MAP[id].r - 1) / 2);
  };
  // ガチャ等で入手。重複は限界突破→ワザLv→コイン
  S.addHero = id => {
    const d = S.data;
    const u = d.heroes[id];
    if (!u) { d.heroes[id] = { lv: 1, exp: 0, lb: 0, wl: 1 }; return { isNew: true }; }
    const res = {};
    if (u.lb < 4) { u.lb++; res.lb = u.lb; }
    if (u.wl < 5) { u.wl++; res.wl = u.wl; }
    if (!res.lb && !res.wl) { d.coin += 800; res.coin = 800; }
    return res;
  };
  S.addLegend = id => {
    if (S.data.legends.includes(id)) return false;
    S.data.legends.push(id);
    return true;
  };

  // ---------- ログインボーナス ----------
  S.checkLogin = () => {
    const d = S.data, t = today();
    if (d.lastLogin === t) return null;
    d.lastLogin = t;
    d.loginDays++;
    const ruby = d.loginDays % 7 === 0 ? 300 : 100;
    const coin = 1000;
    d.ruby += ruby; d.coin += coin;
    d.stamina = Math.max(d.stamina, S.maxStamina());
    S.save();
    return { days: d.loginDays, ruby, coin };
  };

  // ミッション
  S.missionsReady = () => MISSIONS.filter(m => !S.data.missions[m.id] && m.check(S.data)).length;

  // 編成の総合力 (目安)
  S.power = () => {
    const p = S.data.party;
    let sum = 0;
    p.main.forEach((id, i) => {
      if (!id || !S.has(id)) return;
      const s = S.statsOf(id);
      sum += s.atk * 2 + s.hp * 0.5 + s.rcv;
      (p.sup[i] || []).forEach(sid => { if (sid && S.has(sid)) { const t = S.statsOf(sid); sum += (t.atk * 2 + t.hp * 0.5 + t.rcv) * 0.16; } });
    });
    return Math.round(sum);
  };

  return S;
})();
