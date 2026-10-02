// ============================================================
//  Data: 属性・キャラクター・レジェンド・敵・クエスト・ガチャ
//  ※ 個人で遊ぶための非公開ファンメイド。絵はプログラムで描いたちびキャラ (自分の画像に差し替え可)
// ============================================================
const ATTR = {
  red: { name: '赤', color: '#ff4b5c', dark: '#b3172c', light: '#ffc2c8' },
  green: { name: '緑', color: '#35c45a', dark: '#16803a', light: '#c4f2cf' },
  blue: { name: '青', color: '#3b86ff', dark: '#1550b8', light: '#c4dcff' },
  yellow: { name: '黄', color: '#ffbd1f', dark: '#b97a00', light: '#fff0bf' },
};
const ATTRS = ['red', 'green', 'blue', 'yellow'];
// 赤→緑→黄→青→赤 (有利 1.3倍 / 不利 0.7倍)
const ADV = { red: 'green', green: 'yellow', yellow: 'blue', blue: 'red' };
const attrMult = (a, d) => ADV[a] === d ? 1.3 : ADV[d] === a ? 0.7 : 1;
const PUCHI = {
  red: { color: '#ff4b5c', light: '#ffc2c8', dark: '#b3172c' },
  green: { color: '#35c45a', light: '#c4f2cf', dark: '#16803a' },
  blue: { color: '#3b86ff', light: '#c4dcff', dark: '#1550b8' },
  yellow: { color: '#ffbd1f', light: '#fff0bf', dark: '#b97a00' },
  heart: { color: '#ff73b0', light: '#ffd3e6', dark: '#c2286a' },
};
const TYPES = {
  atk: { name: '攻撃', hp: 0.9, atk: 1.2, rcv: 0.8 },
  bal: { name: 'バランス', hp: 1, atk: 1, rcv: 1 },
  hp: { name: '体力', hp: 1.35, atk: 0.85, rcv: 0.9 },
  rcv: { name: '回復', hp: 0.95, atk: 0.8, rcv: 1.6 },
};
const RARITY = {
  3: { hp: 1200, atk: 420, rcv: 180, max: 40, grow: 2.4 },
  4: { hp: 1500, atk: 540, rcv: 230, max: 50, grow: 2.6 },
  5: { hp: 1850, atk: 680, rcv: 280, max: 60, grow: 2.8 },
};

// ---------- ヒーロー ----------
// h: 必殺ワザ { n:名前, tg:'s'単体|'a'全体, m:倍率, fx:演出, ef:[追加効果] }
// y: 友情ワザ { n, cd:ターン, ef:[効果] }
// t: 特性 { n, k:種類, ... }
const HEROES = [
  {
    id: 'ruhi', name: 'モンキー・D・ルフィ', short: 'ルフィ', title: '麦わらの船長', series: 'ONE PIECE', r: 5, attr: 'red', type: 'atk',
    quote: '海賊王に、おれはなる!!!',
    h: { n: 'ゴムゴムの火拳銃(レッドホーク)', tg: 's', m: 11, fx: 'fire' },
    y: { n: 'ゴムゴムの風船', cd: 7, ef: [{ t: 'conv', to: 'red', n: 10, shape: 'heart' }] },
    t: { n: 'ゴムゴムの実の能力', k: 'hpHigh', hp: 0.9, short: 1, atk: 0.05 },
    art: {
      hair: { c: '#1c1a22', style: 'spike', n: 7, len: 7, vary: 0.6, side: 72, line: 47, bangs: { n: 5, len: 12, vary: 0.6 } },
      eye: { t: 'big', c: '#2a1a12' }, brow: 'n', mouth: 'grin', marks: ['scarL'],
      outfit: { top: '#d9312b', open: true, sleeveless: true, pants: '#3d68b0', shorts: true, belt: '#f2c230', knot: true, shoes: '#c9a46a' },
      acc: ['strawhat'],
    },
  },
  {
    id: 'zoro', name: 'ロロノア・ゾロ', short: 'ゾロ', title: '海賊狩り', series: 'ONE PIECE', r: 4, attr: 'green', type: 'atk',
    quote: '背中の傷は剣士の恥だ',
    h: { n: '三刀流 鬼斬り', tg: 's', m: 10, fx: 'slash' },
    y: { n: '三刀流 刀狼流し', cd: 6, ef: [{ t: 'dmg', tg: 'a', m: 3 }] },
    t: { n: '三刀流', k: 'chain', n: 5, v: 0.3 },
    art: {
      hair: { c: '#4caf50', style: 'puff', n: 10, len: 3, vary: 0.3, side: 66, line: 43, bangs: { n: 6, len: 5, style: 'puff' } },
      eye: { t: 'sharp', c: '#3a2a1a' }, brow: 'a', mouth: 'smirk',
      outfit: { top: '#f2f2f2', pants: '#2d3a2a', belt: '#3f8f46', knot: true, boots: '#222' },
      wpn: ['swords3'],
    },
  },
  {
    id: 'sanji', name: '黒足のサンジ', short: 'サンジ', title: '一味のコック', series: 'ONE PIECE', r: 4, attr: 'yellow', type: 'atk',
    quote: 'レディには手を上げねェ',
    h: { n: '悪魔風脚 画竜点睛ショット', tg: 's', m: 10, fx: 'fire' },
    y: { n: '特製まかない', cd: 7, ef: [{ t: 'heal', v: 0.3 }] },
    t: { n: '黒足', k: 'chain', n: 4, v: 0.2 },
    art: {
      hair: { c: '#ffd85a', style: 'smooth', n: 6, len: 6, side: 76, line: 44, bangs: { n: 4, lens: [27, 13, 8, 6] } },
      eye: { t: 'big', c: '#3a6ab0' }, brow: 'swirl', mouth: 'smirk',
      outfit: { top: '#1c1c22', inner: '#5a8ad8', tie: '#1c1c22', pants: '#1c1c22', shoes: '#1c1c22' },
      wpn: ['cig'],
    },
  },
  {
    id: 'usoppu', name: 'ウソップ', short: 'ウソップ', title: '狙撃の王様', series: 'ONE PIECE', r: 3, attr: 'yellow', type: 'bal',
    quote: 'おれには八千人の部下がいる!!',
    h: { n: '必殺 火薬星', tg: 's', m: 8, fx: 'explosion' },
    y: { n: 'ウソップ工場', cd: 5, ef: [{ t: 'conv', to: 'yellow', n: 8 }] },
    t: { n: 'ウソも方便', k: 'atk', v: 0.1 },
    art: {
      skin: '#c88a5a',
      hair: { c: '#1c1a22', back: 'mid', style: 'puff', n: 8, len: 5, side: 74, line: 42, bangs: { n: 0 } },
      eye: { t: 'big', c: '#2a1a12' }, brow: 'n', mouth: 'grin', marks: ['nose'],
      outfit: { top: '#c8a060', belt: '#5a3a20', pants: '#c8a060', shoes: '#5a3a20' },
      acc: ['bandana'], bandC: '#e8d9b0', wpn: ['slingshot'],
    },
  },
  {
    id: 'nami', name: '泥棒猫ナミ', short: 'ナミ', title: '一味の航海士', series: 'ONE PIECE', r: 4, attr: 'yellow', type: 'rcv',
    quote: 'お宝の匂いがするわ♪',
    h: { n: 'サンダーボルト=テンポ', tg: 'a', m: 5, fx: 'thunder', ef: [{ t: 'heal', v: 0.1 }] },
    y: { n: '天候予報', cd: 5, ef: [{ t: 'conv', to: 'yellow', n: 8, shape: 'cross' }] },
    t: { n: '航海術', k: 'heal', v: 0.3 },
    art: {
      hair: { c: '#ff8a3a', back: 'long', style: 'smooth', n: 6, len: 5, side: 78, line: 46, bangs: { n: 4, lens: [18, 11, 11, 18] } },
      eye: { t: 'big', c: '#6a4020' }, brow: 'thin', mouth: 'smile', marks: ['blush'],
      outfit: { top: '#5aa0e8', sleeveless: true, robe: '#2c4a8a', shoes: '#c98a3a' },
    },
  },
  {
    id: 'goku', name: '孫悟空', short: '悟空', title: '地球育ちのサイヤ人', series: 'ドラゴンボール', r: 5, attr: 'yellow', type: 'atk',
    quote: 'オッス! オラ悟空!',
    h: { n: 'かめはめ波', tg: 's', m: 11, fx: 'beam', c: '#6fd0ff' },
    y: { n: '界王拳', cd: 7, ef: [{ t: 'atkUp', v: 0.25, turns: 2 }] },
    t: { n: '戦闘民族の血', k: 'special', v: 0.3 },
    art: {
      hair: { c: '#1c1a22', style: 'spike', n: 7, lens: [24, 30, 26, 34, 30, 28, 24], lean: 0.45, a0: -208, a1: 28, side: 70, line: 45, bangs: { n: 4, lens: [9, 17, 19, 10], lean: 0.25 } },
      eye: { t: 'big', c: '#1a1414' }, brow: 'n', mouth: 'grin',
      outfit: { top: '#f48a1e', inner: '#2f56c4', sleeve: '#2f56c4', belt: '#2f56c4', knot: true, wrist: '#2f56c4', pants: '#f48a1e', boots: '#2f56c4', emblem: '悟' },
    },
  },
  {
    id: 'vegeta', name: 'ベジータ', short: 'ベジータ', title: 'サイヤ人の王子', series: 'ドラゴンボール', r: 4, attr: 'blue', type: 'atk',
    quote: 'オレはサイヤ人の王子だ!',
    h: { n: 'ギャリック砲', tg: 's', m: 10, fx: 'beam', c: '#c06aff' },
    y: { n: 'ファイナルフラッシュ', cd: 7, ef: [{ t: 'dmg', tg: 'a', m: 3.5 }] },
    t: { n: '王子のプライド', k: 'lowHp', hp: 0.5, v: 0.4 },
    art: {
      hair: { c: '#1c1a22', style: 'spike', n: 5, lens: [26, 34, 38, 34, 26], lean: 0.12, a0: -158, a1: -22, side: 64, line: 38, bangs: { n: 1, lens: [8] } },
      eye: { t: 'sharp', c: '#1a1414' }, brow: 'a', mouth: 'smirk',
      outfit: { top: '#2a4fb0', armor: '#f4f4f4', pads: '#e8c24a', pants: '#2a4fb0', boots: '#f4f4f4', gloves: '#f4f4f4' },
    },
  },
  {
    id: 'kuririn', name: 'クリリン', short: 'クリリン', title: '地球人最強の男', series: 'ドラゴンボール', r: 3, attr: 'yellow', type: 'bal',
    quote: '気円斬!!',
    h: { n: '気円斬', tg: 's', m: 9, fx: 'disk' },
    y: { n: '太陽拳', cd: 6, ef: [{ t: 'delay', v: 1 }] },
    t: { n: '修行の成果', k: 'cut', v: 0.05 },
    art: {
      head: 'bald', marks: ['dots6'], eye: { t: 'dot' }, brow: 'n', mouth: 'smile',
      outfit: { top: '#f48a1e', inner: '#2f56c4', belt: '#2f56c4', knot: true, pants: '#f48a1e', boots: '#2f56c4', emblem: '亀' },
    },
  },
  {
    id: 'piccolo', name: 'ピッコロ', short: 'ピッコロ', title: 'ナメック星の戦士', series: 'ドラゴンボール', r: 4, attr: 'green', type: 'bal',
    quote: '修行が足りんぞ',
    h: { n: '魔貫光殺砲', tg: 's', m: 11, fx: 'beam', c: '#fff36b' },
    y: { n: '再生', cd: 6, ef: [{ t: 'heal', v: 0.25 }] },
    t: { n: 'ナメック星人', k: 'heal', v: 0.2 },
    art: {
      skin: '#7cc46a', ears: 'elf', eye: { t: 'sharp', c: '#1a1a1a' }, brow: 'a', mouth: 'flat',
      outfit: { top: '#6a3a9a', cape: '#f4f4f4', belt: '#5aa0d0', knot: true, pants: '#6a3a9a', shoes: '#8a5a2a', wrist: '#c33' },
      acc: ['cape', 'turban'],
    },
  },
  {
    id: 'naruto', name: 'うずまきナルト', short: 'ナルト', title: '木ノ葉隠れの里の忍', series: 'NARUTO', r: 5, attr: 'green', type: 'atk',
    quote: 'まっすぐ自分の言葉は曲げねぇ!',
    h: { n: '螺旋丸', tg: 's', m: 11, fx: 'wind' },
    y: { n: '多重影分身の術', cd: 8, ef: [{ t: 'hissatsu' }] },
    t: { n: '意外性No.1', k: 'lowHpShort', hp: 0.5, short: 1, atk: 0.2 },
    art: {
      hair: { c: '#ffd23a', style: 'spike', n: 12, len: 14, vary: 0.5, lean: 0.35, side: 70, line: 44, bangs: { n: 6, len: 12, vary: 0.5 } },
      eye: { t: 'big', c: '#2f8fff' }, brow: 'n', mouth: 'grin', marks: ['whisk'],
      outfit: { top: '#ff8a1e', highCollar: '#f4f4f4', zip: true, pads: '#2a2a2a', pants: '#ff8a1e', shoes: '#2b3a8a' },
      acc: ['headband'],
    },
  },
  {
    id: 'sasuke', name: 'うちはサスケ', short: 'サスケ', title: 'うちは一族の末裔', series: 'NARUTO', r: 4, attr: 'blue', type: 'atk',
    quote: 'オレは…復讐者だ',
    h: { n: '千鳥', tg: 's', m: 10.5, fx: 'thunder' },
    y: { n: '天照', cd: 6, ef: [{ t: 'defDown', v: 0.25, turns: 2 }] },
    t: { n: '写輪眼', k: 'chain', n: 4, v: 0.25 },
    art: {
      hair: { c: '#22263a', style: 'spike', n: 5, len: 12, lean: 0.5, tilt: 12, side: 76, line: 45, bangs: { n: 4, lens: [24, 10, 10, 24], lean: 0.02 }, back: { style: 'spike', n: 5, len: 22, a0: -120, a1: 40, lean: 0.6 } },
      eye: { t: 'sharp', c: '#d21f2f' }, brow: 'a', mouth: 'flat',
      outfit: { top: '#f4f4f4', open: true, belt: '#6b3fa0', knot: true, pants: '#22263a', shoes: '#22263a' },
      wpn: ['katana'],
    },
  },
  {
    id: 'sakuna', name: '春野サクラ', short: 'サクラ', title: '医療忍者', series: 'NARUTO', r: 3, attr: 'red', type: 'rcv',
    quote: 'しゃーんなろー!!',
    h: { n: 'しゃーんなろー!!', tg: 's', m: 8, fx: 'punch', ef: [{ t: 'heal', v: 0.15 }] },
    y: { n: '医療忍術', cd: 5, ef: [{ t: 'heal', v: 0.25 }] },
    t: { n: '百豪の印', k: 'heal', v: 0.3 },
    art: {
      hair: { c: '#f4a6c8', back: 'bob', style: 'smooth', n: 6, len: 5, side: 76, line: 46, bangs: { n: 4, lens: [17, 10, 10, 17] } },
      eye: { t: 'big', c: '#3aa86a' }, brow: 'thin', mouth: 'smile', marks: ['blush', 'gem'],
      outfit: { top: '#d8322a', highCollar: '#d8322a', sleeveless: true, pants: '#3a3a3a', shoes: '#2b3a8a', gloves: '#2a2a2a' },
      acc: ['headband'],
    },
  },
  {
    id: 'kakashi', name: 'はたけカカシ', short: 'カカシ', title: 'コピー忍者', series: 'NARUTO', r: 4, attr: 'yellow', type: 'bal',
    quote: '仲間を大切にしない奴は…',
    h: { n: '雷切', tg: 's', m: 10, fx: 'thunder' },
    y: { n: '写輪眼コピー', cd: 6, ef: [{ t: 'short', v: 2, turns: 2 }] },
    t: { n: '千の術', k: 'chain', n: 4, v: 0.2 },
    art: {
      hair: { c: '#d8dce8', c2: '#9aa0b4', style: 'spike', n: 6, len: 20, vary: 0.3, a0: -175, a1: -5, lean: 0.2, tilt: 22, side: 66, line: 44, bangs: { n: 3, len: 9 } },
      eye: { t: 'narrow', c: '#3a3a3a' }, brow: 'n',
      outfit: { top: '#2f3a4f', armor: '#4a6a3a', pants: '#2f3a4f', shoes: '#2b3a8a' },
      acc: ['mask', 'headbandEye'], maskC: '#2f3a4f',
    },
  },
  {
    id: 'ichigo', name: '黒崎一護', short: '一護', title: '死神代行', series: 'BLEACH', r: 5, attr: 'blue', type: 'atk',
    quote: '護りてえモンがあるんだよ',
    h: { n: '月牙天衝', tg: 's', m: 11, fx: 'getsuga' },
    y: { n: '卍解', cd: 8, ef: [{ t: 'atkUp', v: 0.3, turns: 2 }] },
    t: { n: '死神の力', k: 'boss', v: 0.3 },
    art: {
      hair: { c: '#ff8a2a', style: 'spike', n: 9, len: 16, vary: 0.45, lean: 0.4, side: 72, line: 45, bangs: { n: 5, len: 13 } },
      eye: { t: 'sharp', c: '#6b3a1a' }, brow: 'a', mouth: 'flat',
      outfit: { top: '#1c1c22', inner: '#f4f4f4', belt: '#f4f4f4', pants: '#1c1c22', shoes: '#f4f4f4' },
      wpn: ['bigsword'],
    },
  },
  {
    id: 'rukiya', name: '朽木ルキア', short: 'ルキア', title: '十三番隊の死神', series: 'BLEACH', r: 3, attr: 'blue', type: 'bal',
    quote: '舞え、袖白雪',
    h: { n: '袖白雪 初の舞', tg: 's', m: 8.5, fx: 'ice' },
    y: { n: '縛道の六十一', cd: 6, ef: [{ t: 'delay', v: 1 }] },
    t: { n: '氷雪系', k: 'atk', v: 0.1 },
    art: {
      hair: { c: '#1c1a22', back: 'bob', style: 'smooth', n: 6, len: 4, side: 76, line: 46, bangs: { n: 4, lens: [15, 8, 8, 15] }, strand: 58 },
      eye: { t: 'big', c: '#5a4ab0' }, brow: 'thin', mouth: 'smile',
      outfit: { top: '#1c1c22', inner: '#f4f4f4', belt: '#f4f4f4', pants: '#1c1c22', shoes: '#f4f4f4' },
      wpn: ['katana'],
    },
  },
  {
    id: 'gon', name: 'ゴン=フリークス', short: 'ゴン', title: 'ハンター志望の少年', series: 'HUNTER×HUNTER', r: 4, attr: 'green', type: 'atk',
    quote: '最初はグー!! ジャン! ケン!',
    h: { n: 'ジャジャン拳「グー」', tg: 's', m: 10, fx: 'punch' },
    y: { n: '釣りザオ', cd: 5, ef: [{ t: 'conv', to: 'green', n: 9 }] },
    t: { n: '野生の勘', k: 'chain', n: 6, v: 0.4 },
    art: {
      hair: { c: '#1f2a1c', c2: '#0e3a12', style: 'spike', n: 6, lens: [26, 34, 38, 36, 32, 24], lean: 0.06, a0: -172, a1: -8, side: 66, line: 44, bangs: { n: 4, len: 8 } },
      eye: { t: 'big', c: '#4a3018' }, brow: 'n', mouth: 'grin',
      outfit: { top: '#3f9a46', highCollar: '#3f9a46', pants: '#3f9a46', shorts: true, boots: '#2b6a2f' },
      wpn: ['rod'],
    },
  },
  {
    id: 'kirua', name: 'キルア=ゾルディック', short: 'キルア', title: '暗殺一家の天才', series: 'HUNTER×HUNTER', r: 4, attr: 'yellow', type: 'atk',
    quote: 'ゴン、オレ達友達だろ?',
    h: { n: '雷掌(イズツシ)', tg: 's', m: 10, fx: 'thunder' },
    y: { n: '神速(カンムル)', cd: 7, ef: [{ t: 'delay', v: 1 }] },
    t: { n: '暗殺術', k: 'first', v: 0.6 },
    art: {
      hair: { c: '#e6e8f0', c2: '#b8bcd0', style: 'puff', n: 9, len: 7, vary: 0.4, side: 72, line: 46, bangs: { n: 5, len: 11, style: 'puff' } },
      eye: { t: 'sharp', c: '#3a8ad8' }, brow: 'n', mouth: 'cat',
      outfit: { top: '#5b4f9a', collar: '#f4f4f4', pants: '#3a3a50', shorts: true, shoes: '#5a4a3a' },
    },
  },
  {
    id: 'deku', name: '緑谷出久', short: 'デク', title: 'ワン・フォー・オールの継承者', series: '僕のヒーローアカデミア', r: 5, attr: 'green', type: 'atk',
    quote: '君はヒーローになれる',
    h: { n: 'デトロイトスマッシュ', tg: 's', m: 11, fx: 'punch', c: '#7dff7a' },
    y: { n: 'フルカウル', cd: 6, ef: [{ t: 'atkUp', v: 0.2, turns: 2 }, { t: 'conv', to: 'green', n: 5 }] },
    t: { n: 'ワン・フォー・オール', k: 'attrAtk', attr: 'green', v: 0.15 },
    art: {
      hair: { c: '#1f5a3a', c2: '#123a24', style: 'puff', n: 10, len: 9, vary: 0.6, side: 74, line: 46, bangs: { n: 6, len: 12, style: 'puff', vary: 0.6 } },
      eye: { t: 'big', c: '#2f9a5a' }, brow: 'n', mouth: 'shout', marks: ['freckles'],
      outfit: { top: '#2e7d5b', belt: '#333', pants: '#2e7d5b', boots: '#d33', gloves: '#f4f4f4' },
      pose: 'fist',
    },
  },
  {
    id: 'bakugo', name: '爆豪勝己', short: '爆豪', title: '爆破の天才', series: '僕のヒーローアカデミア', r: 4, attr: 'red', type: 'atk',
    quote: '死ねぇ!! …じゃなくて勝つ!!',
    h: { n: '榴弾砲・着弾(ハウザーインパクト)', tg: 's', m: 10, fx: 'explosion' },
    y: { n: 'APショット', cd: 5, ef: [{ t: 'dmg', tg: 's', m: 4 }] },
    t: { n: '爆破', k: 'lowHp', hp: 0.5, v: 0.5 },
    art: {
      hair: { c: '#f3e7a8', c2: '#cfc07a', style: 'spike', n: 14, len: 12, vary: 0.55, lean: 0.45, side: 72, line: 45, bangs: { n: 7, len: 11 } },
      eye: { t: 'angry', c: '#d81e1e' }, brow: 'a', mouth: 'teeth',
      outfit: { top: '#2b2b2b', pants: '#2b2b2b', boots: '#3a3a3a', gloves: '#ff8a1e', wrist: '#3a3a3a' },
    },
  },
  {
    id: 'ochako', name: '麗日お茶子', short: 'お茶子', title: 'ウラビティ', series: '僕のヒーローアカデミア', r: 3, attr: 'green', type: 'rcv',
    quote: 'デクくん、がんばって!',
    h: { n: 'ゼロ重力メテオ', tg: 's', m: 8, fx: 'meteor', ef: [{ t: 'heal', v: 0.1 }] },
    y: { n: 'ふわふわ', cd: 5, ef: [{ t: 'conv', to: 'heart', n: 6 }] },
    t: { n: 'ゼロ重力', k: 'heal', v: 0.25 },
    art: {
      hair: { c: '#7a4a2a', back: 'bob', style: 'smooth', n: 6, len: 5, side: 78, line: 46, bangs: { n: 4, lens: [18, 9, 9, 18] } },
      eye: { t: 'big', c: '#7a4a2a' }, brow: 'thin', mouth: 'smile', marks: ['blush'],
      outfit: { top: '#2a2a3a', pads: '#f4a0c0', pants: '#2a2a3a', boots: '#f4a0c0', gloves: '#f4f4f4' },
    },
  },
  {
    id: 'allmight', name: 'オールマイト', short: 'オールマイト', title: '平和の象徴', series: '僕のヒーローアカデミア', r: 5, attr: 'yellow', type: 'hp',
    quote: 'もう大丈夫! 私が来た!!',
    h: { n: 'テキサス・スマッシュ', tg: 'a', m: 7, fx: 'punch' },
    y: { n: 'ヒーローの笑顔', cd: 7, ef: [{ t: 'shield', v: 0.3, turns: 2 }] },
    t: { n: '平和の象徴', k: 'cut', v: 0.1 },
    art: {
      hair: { c: '#ffd23a', style: 'spike', n: 6, len: 5, side: 70, line: 44, bangs: { n: 3, lens: [12, 9, 12] } },
      acc: ['vbangs', 'cape'], eye: { t: 'sharp', c: '#3a6ad8' }, brow: 't', mouth: 'teeth',
      outfit: { top: '#2f56c4', collar: '#e33', belt: '#f2c230', pants: '#2f56c4', boots: '#e33', gloves: '#f4f4f4', cape: '#e33' },
    },
  },
  {
    id: 'tanjiro', name: '竈門炭治郎', short: '炭治郎', title: '心優しき鬼殺隊士', series: '鬼滅の刃', r: 5, attr: 'blue', type: 'bal',
    quote: '頑張れ炭治郎頑張れ!!',
    h: { n: '水の呼吸 拾ノ型 生生流転', tg: 's', m: 10, fx: 'water' },
    y: { n: '匂いの糸', cd: 6, ef: [{ t: 'conv', to: 'blue', n: 9, shape: 'cross' }] },
    t: { n: '優しい心', k: 'heartAtk', v: 0.5 },
    art: {
      hair: { c: '#7a2a24', c2: '#3a0e0c', style: 'spike', n: 9, len: 9, vary: 0.5, lean: 0.35, side: 72, line: 46, bangs: { n: 5, lens: [12, 3, 13, 11, 12] } },
      eye: { t: 'big', c: '#a8322c' }, brow: 'n', mouth: 'smile', marks: ['foreScar'],
      outfit: { top: '#1c1c26', pattern: 'check', pa: '#1c7a52', pb: '#141414', sides: true, belt: '#f4f4f4', pants: '#1c1c26', shoes: '#f4f4f4' },
      acc: ['earrings'], wpn: ['katana', 'blackblade'],
    },
  },
  {
    id: 'nezuko', name: '竈門禰豆子', short: '禰豆子', title: '鬼になった妹', series: '鬼滅の刃', r: 4, attr: 'red', type: 'rcv',
    quote: 'ムー! ムー!',
    h: { n: '血鬼術 爆血', tg: 'a', m: 5, fx: 'fire', ef: [{ t: 'heal', v: 0.1 }] },
    y: { n: 'ねむねむ回復', cd: 6, ef: [{ t: 'heal', v: 0.25 }] },
    t: { n: '鬼の回復力', k: 'heal', v: 0.3 },
    art: {
      hair: { c: '#1c1420', c2: '#c0562a', back: 'long', style: 'smooth', n: 6, len: 5, side: 78, line: 46, bangs: { n: 6, len: 13, vary: 0.3 } },
      eye: { t: 'big', c: '#ff6ab4' }, brow: 'thin', marks: ['blush'],
      outfit: { top: '#f29ab6', pattern: 'hemp', pa: '#f29ab6', pb: '#d8628e', robe: '#9b4a3a', shoes: '#3b2a20' },
      acc: ['muzzle', 'ribbon'],
    },
  },
  {
    id: 'zenitsu', name: '我妻善逸', short: '善逸', title: '眠れる雷の剣士', series: '鬼滅の刃', r: 4, attr: 'yellow', type: 'atk',
    quote: 'もう無理ぃぃぃ!! …zzz',
    h: { n: '雷の呼吸 壱ノ型 霹靂一閃 六連', tg: 's', m: 12, fx: 'thunder' },
    y: { n: '地獄耳', cd: 5, ef: [{ t: 'rainbow', n: 3 }] },
    t: { n: '眠りの剣技', k: 'lowHp', hp: 0.5, v: 0.6 },
    art: {
      hair: { c: '#ffd23a', c2: '#ff8a1e', style: 'spike', n: 10, len: 10, vary: 0.4, lean: 0.3, side: 78, line: 46, bangs: { n: 5, len: 14 } },
      eye: { t: 'closed' }, brow: 'w', mouth: 'flat',
      outfit: { top: '#1c1c26', pattern: 'triangle', pa: '#ffcc33', pb: '#fff1b8', sides: true, belt: '#f4f4f4', pants: '#1c1c26', shoes: '#f4f4f4' },
      wpn: ['katana'],
    },
  },
  {
    id: 'inosuke', name: '嘴平伊之助', short: '伊之助', title: '猪突猛進の剣士', series: '鬼滅の刃', r: 3, attr: 'green', type: 'atk',
    quote: '猪突猛進!! 猪突猛進!!',
    h: { n: '獣の呼吸 伍ノ牙 狂い裂き', tg: 'a', m: 5, fx: 'slash' },
    y: { n: '猪突猛進', cd: 5, ef: [{ t: 'atkUp', v: 0.15, turns: 2 }] },
    t: { n: '山育ち', k: 'chain', n: 3, v: 0.2 },
    art: {
      head: 'boar', skin: '#f0c8a0',
      outfit: { top: '#f0c8a0', sleeveless: true, belt: '#8a8a8a', pants: '#e8e0d0', shoes: '#8a6a4a' },
      wpn: ['katana', 'katanaL'],
    },
  },
  {
    id: 'yuji', name: '虎杖悠仁', short: '悠仁', title: '呪力の器', series: '呪術廻戦', r: 4, attr: 'red', type: 'atk',
    quote: '長生きしろよ',
    h: { n: '黒閃', tg: 's', m: 11, fx: 'dark' },
    y: { n: '逕庭拳', cd: 4, ef: [{ t: 'dmg', tg: 's', m: 4 }] },
    t: { n: '超人的身体能力', k: 'chain', n: 4, v: 0.25 },
    art: {
      hair: { c: '#f2a0a0', c2: '#c46a6a', style: 'spike', n: 8, len: 6, vary: 0.5, lean: 0.2, side: 66, line: 44, bangs: { n: 5, len: 9 } },
      eye: { t: 'big', c: '#6a3a2a' }, brow: 'n', mouth: 'grin',
      outfit: { top: '#1f2440', highCollar: '#1f2440', buttons: '#d8b440', pants: '#1f2440', shoes: '#c22', hood: '#c8303a' },
      acc: ['hood'],
    },
  },
  {
    id: 'gojo', name: '五条悟', short: '五条', title: '最強の呪術師', series: '呪術廻戦', r: 5, attr: 'blue', type: 'bal',
    quote: '大丈夫、僕最強だから',
    h: { n: '虚式「紫」', tg: 'a', m: 7, fx: 'purple' },
    y: { n: '無量空処', cd: 9, ef: [{ t: 'delay', v: 2 }] },
    t: { n: '無下限呪術', k: 'cut', v: 0.1 },
    art: {
      hair: { c: '#f4f6ff', c2: '#c9d0e8', style: 'spike', n: 10, len: 14, vary: 0.35, lean: 0.1, side: 68, line: 46, bangs: { n: 5, len: 12 } },
      mouth: 'smirk', brow: 'none',
      outfit: { top: '#1f2440', highCollar: '#1f2440', pants: '#1f2440', shoes: '#222' },
      acc: ['blindfold'],
    },
  },
  {
    id: 'megumi', name: '伏黒恵', short: '恵', title: '影使いの呪術師', series: '呪術廻戦', r: 4, attr: 'blue', type: 'bal',
    quote: '不平等に人を助ける',
    h: { n: '十種影法術「玉犬」', tg: 's', m: 9.5, fx: 'dark' },
    y: { n: '十種影法術「鵺」', cd: 5, ef: [{ t: 'dmg', tg: 'a', m: 2.5 }] },
    t: { n: '十種影法術', k: 'special', v: 0.15 },
    art: {
      hair: { c: '#1c1e2a', style: 'spike', n: 12, len: 13, vary: 0.5, lean: 0.5, side: 70, line: 44, bangs: { n: 5, len: 10 } },
      eye: { t: 'sharp', c: '#1f4a5a' }, brow: 'n', mouth: 'flat',
      outfit: { top: '#1f2440', highCollar: '#1f2440', buttons: '#d8b440', pants: '#1f2440', shoes: '#222' },
    },
  },
  {
    id: 'jotaro', name: '空条承太郎', short: '承太郎', title: '星の白金の使い手', series: 'ジョジョの奇妙な冒険', r: 5, attr: 'blue', type: 'atk',
    quote: 'やれやれだぜ',
    h: { n: 'オラオラのラッシュ', tg: 's', m: 12, fx: 'rush' },
    y: { n: 'スタープラチナ・ザ・ワールド', cd: 8, ef: [{ t: 'delay', v: 1 }, { t: 'atkUp', v: 0.15, turns: 1 }] },
    t: { n: 'スタンド使い', k: 'special', v: 0.25 },
    art: {
      hair: { c: '#1c1a22', style: 'spike', n: 4, len: 10, a0: -60, a1: 28, lean: 0.5, side: 72, line: 46, bangs: { n: 5, len: 11 } },
      eye: { t: 'sharp', c: '#2f8a8a' }, brow: 'a', mouth: 'flat',
      outfit: { top: '#1c2238', highCollar: '#1c2238', buttons: '#d8b440', pants: '#1c2238', shoes: '#3a2a1a' },
      acc: ['cap'], capC: '#1c2238',
    },
  },
  {
    id: 'gintoki', name: '坂田銀時', short: '銀時', title: '万事屋オーナー', series: '銀魂', r: 4, attr: 'green', type: 'bal',
    quote: 'いちご牛乳しか勝たん',
    h: { n: '木刀・洞爺湖', tg: 's', m: 9.5, fx: 'slash' },
    y: { n: 'いちご牛乳', cd: 5, ef: [{ t: 'heal', v: 0.2 }] },
    t: { n: '白夜叉', k: 'lowHp', hp: 0.3, v: 0.8 },
    art: {
      hair: { c: '#e8eaf2', c2: '#b8bccc', style: 'puff', n: 10, len: 6, vary: 0.5, side: 72, line: 46, bangs: { n: 6, len: 10, style: 'puff' } },
      eye: { t: 'narrow', c: '#a03030' }, brow: 'n', mouth: 'flat',
      outfit: { top: '#f4f4f4', inner: '#1c1c22', sleeve: '#1c1c22', belt: '#3a5aa0', pants: '#1c1c22', boots: '#2a2a2a' },
      wpn: ['woodsword'],
    },
  },
  {
    id: 'sakuragi', name: '桜木花道', short: '花道', title: '自称・天才', series: 'SLAM DUNK', r: 3, attr: 'red', type: 'atk',
    quote: '天才ですから',
    h: { n: '天才ダンク', tg: 's', m: 9, fx: 'punch' },
    y: { n: 'リバウンド王', cd: 5, ef: [{ t: 'conv', to: 'red', n: 8 }] },
    t: { n: '天才', k: 'chain', n: 5, v: 0.3 },
    art: {
      hair: { c: '#d8322a', style: 'smooth', n: 5, len: 6, side: 66, line: 42, bangs: { n: 0 } },
      eye: { t: 'sharp', c: '#3a2a1a' }, brow: 'a', mouth: 'grin',
      outfit: { top: '#d8322a', sleeveless: true, number: '10', pants: '#d8322a', shorts: true, shoes: '#f4f4f4' },
      wpn: ['ball'],
    },
  },
  {
    id: 'kenjiro', name: 'ケンシロウ', short: 'ケンシロウ', title: '北斗神拳伝承者', series: '北斗の拳', r: 5, attr: 'red', type: 'hp',
    quote: 'お前はもう死んでいる',
    h: { n: '北斗百裂拳', tg: 's', m: 9, fx: 'rush' },
    y: { n: '無想転生', cd: 8, ef: [{ t: 'shield', v: 0.4, turns: 2 }] },
    t: { n: '北斗神拳', k: 'cut', v: 0.1 },
    art: {
      skin: '#f0c8a0',
      hair: { c: '#1c1a22', style: 'spike', n: 6, len: 8, vary: 0.4, lean: 0.3, side: 70, line: 44, bangs: { n: 3, lens: [10, 14, 8] } },
      eye: { t: 'sharp', c: '#2a2a3a' }, brow: 't', mouth: 'flat',
      outfit: { top: '#2f4a8a', open: true, chest: 'scars', sleeveless: true, pads: '#8a8f99', belt: '#3a2a20', pants: '#3a3f4a', boots: '#5a4a3a' },
    },
  },
  {
    id: 'yusuke', name: '浦飯幽助', short: '幽助', title: '霊界探偵', series: '幽☆遊☆白書', r: 4, attr: 'blue', type: 'atk',
    quote: '霊丸ーーっ!!',
    h: { n: '霊丸', tg: 's', m: 11, fx: 'beam', c: '#7ad8ff' },
    y: { n: 'ショットガン', cd: 6, ef: [{ t: 'dmg', tg: 'a', m: 3 }] },
    t: { n: '霊界探偵', k: 'boss', v: 0.25 },
    art: {
      hair: { c: '#1c1a22', style: 'smooth', n: 5, len: 7, side: 68, line: 40, bangs: { n: 0 } },
      eye: { t: 'sharp', c: '#3a2a1a' }, brow: 'a', mouth: 'smirk',
      outfit: { top: '#2e7d3a', highCollar: '#2e7d3a', buttons: '#d8b440', pants: '#2e7d3a', shoes: '#3a2a1a' },
      pose: 'fist',
    },
  },
  {
    id: 'kenshin', name: '緋村剣心', short: '剣心', title: '流浪の剣客', series: 'るろうに剣心', r: 4, attr: 'red', type: 'bal',
    quote: 'おろ?',
    h: { n: '天翔龍閃', tg: 's', m: 12, fx: 'slash' },
    y: { n: '九頭龍閃', cd: 6, ef: [{ t: 'dmg', tg: 's', m: 5 }] },
    t: { n: '飛天御剣流', k: 'special', v: 0.2 },
    art: {
      hair: { c: '#c8322a', c2: '#8a1a14', back: 'pony', style: 'spike', n: 8, len: 8, vary: 0.4, side: 76, line: 46, bangs: { n: 5, lens: [18, 10, 14, 10, 18] } },
      eye: { t: 'big', c: '#6a4ac8' }, brow: 'n', mouth: 'smile', marks: ['xScar'],
      outfit: { top: '#b8306a', pants: '#efe8da', shoes: '#efe8da' },
      wpn: ['katana'],
    },
  },
  {
    id: 'ryotsu', name: '両津勘吉', short: '両さん', title: '派出所の巡査長', series: 'こちら葛飾区亀有公園前派出所', r: 5, attr: 'yellow', type: 'hp',
    quote: '部長ーっ!!',
    h: { n: '両さん大暴れ', tg: 'a', m: 6.5, fx: 'explosion' },
    y: { n: 'へそくりパワー', cd: 6, ef: [{ t: 'rainbow', n: 4 }] },
    t: { n: '不死身の体', k: 'cut', v: 0.15 },
    art: {
      skin: '#f0c8a0',
      hair: { c: '#1c1a22', style: 'puff', n: 10, len: 3, side: 66, line: 44, bangs: { n: 0 } },
      eye: { t: 'dot' }, brow: 'u', mouth: 'grin', marks: ['stubble'],
      outfit: { top: '#a8c8e8', belt: '#3a2a20', pants: '#2a3a5a', shoes: '#222' },
      acc: ['police'],
    },
  },
  {
    id: 'asta', name: 'アスタ', short: 'アスタ', title: '魔法帝を目指す少年', series: 'ブラッククローバー', r: 4, attr: 'green', type: 'atk',
    quote: '諦めないのがオレの魔法だ!!',
    h: { n: 'ブラックディバイダー', tg: 's', m: 11, fx: 'dark' },
    y: { n: '反魔法', cd: 5, ef: [{ t: 'clearJama' }, { t: 'defDown', v: 0.2, turns: 2 }] },
    t: { n: '反魔法の剣', k: 'chain', n: 5, v: 0.35 },
    art: {
      hair: { c: '#d8d8c0', c2: '#a8a890', style: 'spike', n: 11, len: 12, vary: 0.5, lean: 0.4, side: 70, line: 44, bangs: { n: 5, len: 10 } },
      eye: { t: 'big', c: '#3a8a3a' }, brow: 'a', mouth: 'shout',
      outfit: { top: '#2a2a2e', cape: '#1a1a1a', pants: '#3a3a3a', boots: '#3a2a20' },
      acc: ['blackband', 'cape'], wpn: ['blacksword'],
    },
  },
  {
    id: 'denji', name: 'デンジ', short: 'デンジ', title: 'チェーンソーの悪魔', series: 'チェンソーマン', r: 4, attr: 'red', type: 'atk',
    quote: 'ジャム塗ったパンが食いてえ',
    h: { n: 'チェーンソー乱舞', tg: 'a', m: 5.5, fx: 'slash' },
    y: { n: 'ポチ太', cd: 4, ef: [{ t: 'atkUp', v: 0.2, turns: 1 }] },
    t: { n: '悪魔の心臓', k: 'lowHp', hp: 0.5, v: 0.5 },
    art: {
      hair: { c: '#f2d25a', c2: '#c8a030', style: 'spike', n: 9, len: 7, vary: 0.6, lean: 0.3, side: 68, line: 45, bangs: { n: 5, len: 13, vary: 0.6 } },
      eye: { t: 'big', c: '#c86a2a' }, brow: 'n', mouth: 'fang',
      outfit: { top: '#f4f4f4', tie: '#1c1c22', pants: '#1c1c22', shoes: '#3a2a1a' },
      wpn: ['chainsaw'],
    },
  },
  {
    id: 'anya', name: 'アーニャ', short: 'アーニャ', title: 'ちいさなエスパー', series: 'SPY×FAMILY', r: 3, attr: 'yellow', type: 'rcv',
    quote: 'わくわく!',
    h: { n: 'ピーナッツパワー', tg: 's', m: 7, fx: 'meteor', ef: [{ t: 'heal', v: 0.15 }] },
    y: { n: 'こころ読み', cd: 5, ef: [{ t: 'rainbow', n: 3 }] },
    t: { n: 'エスパー', k: 'heal', v: 0.25 },
    art: {
      hair: { c: '#f7a8c8', back: 'bob', style: 'smooth', n: 6, len: 5, side: 76, line: 46, bangs: { flat: true, len: 13 } },
      eye: { t: 'big', c: '#2fa86a' }, brow: 'thin', mouth: 'cat', marks: ['blush'],
      outfit: { top: '#1c1c22', collar: '#f4f4f4', robe: '#1c1c22', shoes: '#3a2a20' },
      acc: ['horns'], hornC: '#2a2a2a',
    },
  },
  {
    id: 'arara', name: '則巻アラレ', short: 'アラレ', title: 'ペンギン村のロボット少女', series: 'Dr.スランプ', r: 4, attr: 'green', type: 'rcv',
    quote: 'んちゃ!',
    h: { n: 'んちゃ砲', tg: 'a', m: 5.5, fx: 'beam', c: '#ffe36b', ef: [{ t: 'heal', v: 0.1 }] },
    y: { n: 'キーーン!', cd: 6, ef: [{ t: 'conv', to: 'heart', n: 6 }, { t: 'heal', v: 0.1 }] },
    t: { n: 'ロボのパワー', k: 'heal', v: 0.3 },
    art: {
      hair: { c: '#5a3a8a', back: 'bob', style: 'smooth', n: 6, len: 5, side: 76, line: 46, bangs: { flat: true, len: 12 } },
      eye: { t: 'big', c: '#2a2a2a' }, brow: 'thin', mouth: 'grin', marks: ['blush'],
      outfit: { top: '#e8c84a', robe: '#3a5aa0', shoes: '#c22' },
      acc: ['glasses', 'wingcap'],
    },
  },
];

// ---------- レジェンド ----------
const LEGENDS = [
  {
    id: 'L_roja', name: 'ゴール・D・ロジャー', title: '伝説の海賊王', series: 'ONE PIECE', attr: 'red', atk: 2600, gauge: 55,
    s: { n: '神避', m: 9, ef: [{ t: 'defDown', v: 0.2, turns: 2 }] },
    art: {
      hair: { c: '#1c1a22', back: 'mid', style: 'puff', n: 8, len: 6, side: 76, line: 44, bangs: { n: 0 } },
      eye: { t: 'sharp', c: '#3a2a1a' }, brow: 'a', mouth: 'grin', marks: ['mustache'],
      outfit: { top: '#c8302a', inner: '#f4f4f4', pants: '#3a3a3a', boots: '#2a2a2a', cape: '#a8241e' },
      acc: ['cape', 'pirate'], wpn: ['katana'],
    },
  },
  {
    id: 'L_burori', name: 'ブロリー', title: '伝説の超サイヤ人', series: 'ドラゴンボール', attr: 'green', atk: 2800, gauge: 65,
    s: { n: 'ギガンティックミーティア', m: 10, ef: [] },
    art: {
      skin: '#f0c09a',
      hair: { c: '#c8f05a', c2: '#6a9a2a', back: 'wild', style: 'spike', n: 9, len: 18, vary: 0.4, lean: 0.4, side: 74, line: 42, bangs: { n: 4, len: 14 } },
      eye: { t: 'glow', c: '#f4fff0' }, brow: 'a', mouth: 'shout',
      outfit: { top: '#f0c09a', sleeveless: true, collar: '#e8c24a', belt: '#e8c24a', pants: '#f4f4f4', boots: '#c8c8c8', wrist: '#e8c24a' },
    },
  },
  {
    id: 'L_raou', name: 'ラオウ', title: '世紀末覇者', series: '北斗の拳', attr: 'blue', atk: 2700, gauge: 60,
    s: { n: '天将奔烈', m: 9, ef: [{ t: 'delay', v: 1 }] },
    art: {
      skin: '#f0c8a0',
      hair: { c: '#1c1a22', back: 'long', style: 'smooth', n: 6, len: 4, side: 74, line: 44, bangs: { n: 0 } },
      eye: { t: 'sharp', c: '#c22' }, brow: 't', mouth: 'flat',
      outfit: { top: '#3a3640', armor: '#3a3640', pads: '#c9b37a', pants: '#2a2a30', boots: '#3a3640', cape: '#4a1a2a' },
      acc: ['cape', 'helmet'],
    },
  },
  {
    id: 'L_hagoromo', name: '大筒木ハゴロモ', title: '忍の祖', series: 'NARUTO', attr: 'yellow', atk: 2300, gauge: 50,
    s: { n: '六道・地爆天星', m: 7.5, ef: [{ t: 'heal', v: 0.3 }] },
    art: {
      skin: '#f6efe8',
      hair: { c: '#e8e8f0', back: 'long', style: 'smooth', n: 6, len: 5, side: 76, line: 42, bangs: { n: 0 } },
      eye: { t: 'ring', c: '#c8b8e8' }, brow: 'thin', mouth: 'flat', marks: ['beard'],
      outfit: { top: '#f4f0e6', pattern: 'dots', pa: '#f4f0e6', pb: '#2a2a2a', robe: '#f4f0e6', shoes: '#3a2a20' },
      acc: ['horns', 'halo'], hornC: '#e8e0d0',
    },
  },
  {
    id: 'L_genkai', name: '幻海', title: '霊光波動拳の達人', series: '幽☆遊☆白書', attr: 'green', atk: 2200, gauge: 45,
    s: { n: '霊光波動拳', m: 7, ef: [{ t: 'heal', v: 0.25 }, { t: 'atkUp', v: 0.2, turns: 2 }] },
    art: {
      skin: '#f2dcc8',
      hair: { c: '#f0c8d8', back: 'mid', style: 'smooth', n: 6, len: 5, side: 76, line: 42, bangs: { n: 0 } },
      eye: { t: 'narrow', c: '#3a2a20' }, brow: 'thin', mouth: 'flat',
      outfit: { top: '#e85a3a', belt: '#1c1c22', robe: '#3a3a5a', shoes: '#3a2a20' },
    },
  },
];

// ---------- 敵 ----------
// hp/atk は基準値に対する倍率。act は行動パターン (順番に実行)
const ENEMIES = {
  pirate: { name: '海賊の下っ端', attr: 'red', hp: 0.8, atk: 0.9, cd: 2, act: ['atk'], art: { hair: { c: '#3a2a1a', style: 'puff', n: 6, len: 3, side: 66, line: 44, bangs: { n: 0 } }, acc: ['bandana'], bandC: '#c8302a', eye: { t: 'dot' }, brow: 'a', mouth: 'teeth', marks: ['stubble'], outfit: { top: '#f4f4f4', pattern: 'stripe', pa: '#f4f4f4', pb: '#3a5ad8', pants: '#3a3a3a', shoes: '#3a2a20' }, wpn: ['katana'] } },
  crab: { name: 'カニ兵士', attr: 'blue', hp: 1.1, atk: 0.8, cd: 3, act: ['atk'], monster: { t: 'crab', c: '#ff6a4a' } },
  serpent: { name: '海王類の子', attr: 'blue', hp: 1.6, atk: 1.2, cd: 3, act: ['atk', 'heavy'], monster: { t: 'serpent', c: '#4ab0a0' } },
  slime: { name: 'プチスライム', attr: 'green', hp: 0.7, atk: 0.7, cd: 2, act: ['atk'], monster: { t: 'slime', c: '#5ad06a' } },
  slimeY: { name: 'キラスライム', attr: 'yellow', hp: 0.7, atk: 0.7, cd: 2, act: ['atk'], monster: { t: 'slime', c: '#ffcd3a' } },
  slimeK: { name: 'スライムキング', attr: 'blue', hp: 2.2, atk: 1.1, cd: 3, act: ['atk', 'jama'], monster: { t: 'slime', c: '#4a8aff', crown: true } },
  saibai: { name: 'サイバイマン', attr: 'green', hp: 0.9, atk: 1, cd: 2, act: ['atk', 'atk', 'heavy'], art: { skin: '#5aa04a', head: 'bald', eye: { t: 'glow', c: '#ff2a2a' }, brow: 'none', mouth: 'evil', outfit: { top: '#5aa04a', pants: '#4a8a3a', shoes: '#3a6a2a' } } },
  rrRobot: { name: 'レッドリボン軍兵', attr: 'red', hp: 1.3, atk: 1, cd: 3, act: ['atk', 'multi'], monster: { t: 'robot', c: '#c84a4a', mark: 'RR' } },
  dino: { name: '修行の恐竜', attr: 'green', hp: 1.5, atk: 1.2, cd: 3, act: ['atk', 'heavy'], monster: { t: 'dragon', c: '#7aa04a' } },
  wolf: { name: '荒野のオオカミ', attr: 'yellow', hp: 1, atk: 1.1, cd: 2, act: ['atk'], monster: { t: 'beast', c: '#9a8a7a' } },
  ninja: { name: '抜け忍', attr: 'blue', hp: 0.9, atk: 1, cd: 2, act: ['atk', 'jama'], art: { hair: { c: '#2a2a3a', style: 'spike', n: 7, len: 6, side: 68, line: 44, bangs: { n: 4, len: 8 } }, eye: { t: 'sharp', c: '#3a3a3a' }, brow: 'a', outfit: { top: '#3a3f4a', armor: '#4a5a4a', pants: '#2a2a3a', shoes: '#2b3a8a' }, acc: ['mask', 'headband', 'scratched'], maskC: '#3a3f4a', wpn: ['kunai'] } },
  gama: { name: '口寄せガマ', attr: 'yellow', hp: 1.8, atk: 1, cd: 3, act: ['atk', 'heal'], monster: { t: 'frog', c: '#e88a3a' } },
  puppet: { name: '傀儡人形', attr: 'red', hp: 1.2, atk: 1.1, cd: 3, act: ['multi'], monster: { t: 'spider', c: '#8a6a4a', e: '#ffd23a' } },
  hollow: { name: '虚(ホロウ)', attr: 'blue', hp: 1.2, atk: 1.1, cd: 3, act: ['atk', 'heavy'], monster: { t: 'hollow', c: '#c22' } },
  menos: { name: 'メノス', attr: 'yellow', hp: 2, atk: 1.2, cd: 3, act: ['atk', 'jama', 'heavy'], monster: { t: 'ghost', c: '#2a2a32', e: '#ffd23a' } },
  ghostW: { name: 'さまよう魂', attr: 'green', hp: 0.8, atk: 0.9, cd: 2, act: ['atk'], monster: { t: 'ghost', c: '#e8e8f8', e: '#3a6aff' } },
  oni: { name: '雑魚鬼', attr: 'red', hp: 1, atk: 1.1, cd: 2, act: ['atk', 'atk', 'heavy'], art: { skin: '#e8907a', hair: { c: '#3a2a3a', style: 'spike', n: 8, len: 8, side: 70, line: 44, bangs: { n: 4, len: 9 } }, acc: ['horns'], hornC: '#f2e6c8', eye: { t: 'glow', c: '#ffd23a' }, brow: 'a', mouth: 'evil', outfit: { top: '#5a3a6a', pants: '#3a2a3a', shoes: '#2a1a2a' }, wpn: ['club'] } },
  oniB: { name: '青鬼', attr: 'blue', hp: 1.3, atk: 1, cd: 3, act: ['atk', 'heal'], art: { skin: '#8aa8e8', hair: { c: '#1c1a22', style: 'spike', n: 8, len: 8, side: 70, line: 44, bangs: { n: 4, len: 9 } }, acc: ['horn1'], eye: { t: 'glow', c: '#ff4a4a' }, brow: 'a', mouth: 'evil', outfit: { top: '#e8e0d0', pattern: 'stripe', pa: '#ffd23a', pb: '#1c1c1c', pants: '#2a2a2a', shoes: '#2a1a2a' }, wpn: ['club'] } },
  spider: { name: '蜘蛛鬼', attr: 'green', hp: 1.4, atk: 1, cd: 3, act: ['atk', 'jama'], monster: { t: 'spider', c: '#e8e0f0' } },
  curse: { name: '呪霊', attr: 'red', hp: 1.2, atk: 1.1, cd: 2, act: ['atk', 'jama'], monster: { t: 'curse', c: '#8a4ab0' } },
  curseG: { name: '特級呪霊もどき', attr: 'green', hp: 2.2, atk: 1.3, cd: 3, act: ['atk', 'heavy', 'jama'], monster: { t: 'curse', c: '#4a8a5a', e: '#ffd23a' } },
  golem: { name: '呪骸ゴーレム', attr: 'yellow', hp: 1.8, atk: 1, cd: 3, act: ['atk', 'shield'], monster: { t: 'golem', c: '#a89a7a' } },
  mohican: { name: 'モヒカン野郎', attr: 'red', hp: 0.9, atk: 1.2, cd: 2, act: ['atk'], art: { skin: '#f0c09a', hair: { c: '#e83a5a', style: 'spike', n: 3, lens: [22, 30, 22], a0: -116, a1: -64, lean: 0, side: 46, sideX: 7, hl: false, bangs: { skip: true } }, eye: { t: 'sharp', c: '#2a2a2a' }, brow: 'a', mouth: 'shout', outfit: { top: '#2a2a2a', open: true, spikes: true, pants: '#3a3a4a', boots: '#4a3a2a' } } },
  bandit: { name: '世紀末の野盗', attr: 'yellow', hp: 1.1, atk: 1.1, cd: 3, act: ['atk', 'multi'], art: { skin: '#e8b08a', hair: { c: '#3a2a1a', style: 'puff', n: 6, len: 4, side: 66, line: 44, bangs: { n: 0 } }, acc: ['goggles'], eye: { t: 'dot' }, brow: 'a', mouth: 'teeth', marks: ['stubble'], outfit: { top: '#8a6a4a', pads: '#6a6a6a', pants: '#4a3a2a', boots: '#3a2a1a' }, wpn: ['club'] } },
  bigbeast: { name: '巨大魔獣', attr: 'blue', hp: 2.2, atk: 1.3, cd: 3, act: ['atk', 'heavy'], monster: { t: 'beast', c: '#5a6a8a', e: '#ff4a4a' } },
  dragonR: { name: '紅蓮のドラゴン', attr: 'red', hp: 2.4, atk: 1.4, cd: 3, act: ['atk', 'heavy', 'atkUp'], monster: { t: 'dragon', c: '#d84a3a' } },

  goldSlime: { name: 'ゴールドプチ', attr: 'yellow', hp: 1.6, atk: 0.6, cd: 3, act: ['atk'], monster: { t: 'slime', c: '#ffd84a', crown: true } },
  metalSlime: { name: 'メタルプチ', attr: 'blue', hp: 1.4, atk: 0.7, cd: 3, act: ['atk', 'shield'], monster: { t: 'slime', c: '#b8c4d8' } },
  bigGold: { boss: true, name: 'キングゴールドプチ', attr: 'red', hp: 5, atk: 1, cd: 2, act: ['atk', 'shield', 'heavy'], monster: { t: 'slime', c: '#ffb52e', crown: true } },

  // ---- ボス ----
  baki: { boss: true, name: '道化のバギー', attr: 'blue', hp: 6, atk: 1.3, cd: 2, act: ['atk', 'jama', 'heavy'], art: { hair: { c: '#3a7ad8', back: 'mid', style: 'smooth', n: 6, len: 5, side: 76, line: 44, bangs: { n: 0 } }, acc: ['pirate'], marks: ['clown'], eye: { t: 'sharp', c: '#3a2a1a' }, brow: 'a', mouth: 'evil', outfit: { top: '#c83030', pattern: 'stripe', pa: '#c83030', pb: '#f4f4f4', pants: '#3a5aa0', shoes: '#2a2a2a', cape: '#3a5aa0' } } },
  aaro: { boss: true, name: 'ノコギリのアーロン', attr: 'green', hp: 7, atk: 1.5, cd: 2, act: ['atk', 'heavy', 'jama', 'multi'], art: { skin: '#7fb2e5', hair: { c: '#1c1a22', style: 'spike', n: 8, len: 6, side: 70, line: 42, bangs: { n: 0 } }, eye: { t: 'sharp', c: '#c22' }, brow: 'a', mouth: 'evil', marks: ['sawnose', 'gills'], outfit: { top: '#f4c040', pattern: 'dots', pa: '#f4c040', pb: '#e8603a', pants: '#2a3a5a', shoes: '#3a2a20' } } },
  frieda: { boss: true, name: 'フリーザ様', attr: 'blue', hp: 7, atk: 1.6, cd: 2, act: ['atk', 'multi', 'heavy', 'atkUp'], art: { skin: '#f4f0fa', acc: ['dome', 'tail'], tailC: '#f4f0fa', eye: { t: 'sharp', c: '#c22' }, brow: 'none', mouth: 'smirk', outfit: { top: '#f4f0fa', pads: '#8b3fb5', armor: '#f4f0fa', pants: '#f4f0fa', boots: '#f4f0fa' } } },
  orochi: { boss: true, name: '大蛇丸', attr: 'green', hp: 6.5, atk: 1.5, cd: 2, act: ['atk', 'seal', 'heavy'], art: { skin: '#f4ece6', hair: { c: '#1c1a22', back: 'long', style: 'smooth', n: 6, len: 5, side: 78, line: 44, bangs: { n: 4, lens: [24, 10, 10, 24] } }, eye: { t: 'sharp', c: '#d8b020' }, brow: 'none', mouth: 'smirk', marks: ['eyeliner'], outfit: { top: '#e8e4dc', belt: '#7b3fa0', knot: true, pants: '#3a3a3a', shoes: '#3a3a3a' } } },
  peiso: { boss: true, name: 'ペイン', attr: 'yellow', hp: 8, atk: 1.6, cd: 2, act: ['atk', 'jama', 'multi', 'heavy'], art: { hair: { c: '#ff8a3a', style: 'spike', n: 12, len: 12, side: 70, line: 44, bangs: { n: 5, len: 10 } }, eye: { t: 'ring', c: '#b8a8d8' }, brow: 'none', mouth: 'flat', marks: ['pierce'], outfit: { top: '#1c1c22', pattern: 'cloud', pa: '#1c1c22', pb: '#d8322a', highCollar: '#1c1c22', pants: '#1c1c22', shoes: '#3a3a3a' } } },
  aizen: { boss: true, name: '藍染惣右介', attr: 'yellow', hp: 8, atk: 1.6, cd: 2, act: ['atk', 'seal', 'heavy', 'atkUp'], art: { hair: { c: '#5a3a2a', style: 'smooth', n: 6, len: 6, side: 70, line: 38, bangs: { n: 0 }, strand: 64 }, eye: { t: 'narrow', c: '#5a3a2a' }, brow: 'n', mouth: 'smirk', outfit: { top: '#f4f4f4', inner: '#1c1c22', belt: '#9a6ad8', pants: '#f4f4f4', shoes: '#f4f4f4' }, wpn: ['katana'] } },
  akasa: { boss: true, name: '上弦の参・猗窩座', attr: 'red', hp: 7, atk: 1.6, cd: 2, act: ['multi', 'atk', 'heavy'], art: { skin: '#f0d8d0', hair: { c: '#f4a0b8', style: 'spike', n: 9, len: 10, side: 70, line: 44, bangs: { n: 5, len: 9 } }, eye: { t: 'glow', c: '#f2d23a' }, brow: 'a', mouth: 'smirk', marks: ['stripes'], outfit: { top: '#e8f0ff', open: '#f0d8d0', pants: '#e8f0ff', shoes: '#3a3a3a' }, pose: 'fist' } },
  muzan: { boss: true, name: '鬼舞辻無惨', attr: 'red', hp: 9, atk: 1.7, cd: 2, act: ['atk', 'jama', 'heavy', 'heal'], art: { skin: '#f6eee8', hair: { c: '#1c1a22', style: 'puff', n: 9, len: 5, side: 74, line: 44, bangs: { n: 5, len: 9, style: 'puff' } }, eye: { t: 'glow', c: '#e01b3c' }, brow: 'n', mouth: 'flat', outfit: { top: '#1c1c22', inner: '#f4f4f4', tie: '#c22', pants: '#1c1c22', shoes: '#1c1c22' }, acc: ['fedora'] } },
  sukuna: { boss: true, name: '両面宿儺', attr: 'blue', hp: 9, atk: 1.6, cd: 2, act: ['atk', 'multi', 'heavy', 'seal'], art: { hair: { c: '#f2a0a0', c2: '#c46a6a', style: 'spike', n: 8, len: 8, side: 66, line: 44, bangs: { n: 5, len: 9 } }, eye: { t: 'glow', c: '#e01b3c' }, brow: 'a', mouth: 'evil', marks: ['tattoo', 'eyes4'], outfit: { top: '#f4f4f4', scarf: '#1c1c22', belt: '#1c1c22', pants: '#f4f4f4', shoes: '#3a3a3a' } } },
  sauza: { boss: true, name: '聖帝サウザー', attr: 'yellow', hp: 9, atk: 1.55, cd: 2, act: ['atk', 'heavy', 'shield', 'multi'], art: { hair: { c: '#ffd23a', back: 'mid', style: 'smooth', n: 6, len: 5, side: 76, line: 44, bangs: { n: 3, lens: [16, 8, 16] } }, eye: { t: 'sharp', c: '#3a6ad8' }, brow: 'a', mouth: 'evil', outfit: { top: '#e8e0d0', armor: '#d8c8a0', pads: '#c8b080', pants: '#3a3a3a', boots: '#6a5a3a', cape: '#f4f4f4' }, acc: ['cape'] } },
  hisoko: { boss: true, name: '奇術師ヒソカ', attr: 'green', hp: 9, atk: 1.5, cd: 2, act: ['multi', 'jama', 'heavy'], art: { hair: { c: '#e84a7a', style: 'spike', n: 7, len: 16, lean: 0.15, a0: -170, a1: -10, side: 66, line: 40, bangs: { n: 0 } }, eye: { t: 'sharp', c: '#d8b020' }, brow: 'n', mouth: 'smirk', marks: ['star'], outfit: { top: '#e8e0f0', pattern: 'dots', pa: '#e8e0f0', pb: '#d84a8a', pants: '#8a4ab0', shoes: '#3a2a3a' }, wpn: ['cards'] } },
  dofura: { boss: true, name: 'ドンキホーテ・ドフラミンゴ', attr: 'red', hp: 9, atk: 1.5, cd: 2, act: ['atk', 'seal', 'multi', 'heavy'], art: { skin: '#f0c8a0', hair: { c: '#ffd85a', style: 'puff', n: 8, len: 3, side: 66, line: 42, bangs: { n: 0 } }, acc: ['sunglass'], eye: { t: 'dot' }, brow: 'n', mouth: 'evil', outfit: { top: '#f4f4f4', open: '#f0c8a0', pants: '#e8a8c8', shoes: '#3a2a20', feather: '#f48ab0' } } },
  meruemo: { boss: true, name: '蟻の王メルエム', attr: 'blue', hp: 10, atk: 1.6, cd: 2, act: ['atk', 'heavy', 'atkUp', 'multi'], art: { skin: '#9ab0a0', head: 'bald', acc: ['horn1', 'tail'], hornC: '#9ab0a0', tailC: '#7a9080', eye: { t: 'sharp', c: '#1a1a1a' }, brow: 'none', mouth: 'flat', outfit: { top: '#7a9080', armor: '#8aa090', pants: '#7a9080', shoes: '#6a7a70' } } },
  diou: { boss: true, name: 'DIO', attr: 'yellow', hp: 12, atk: 1.6, cd: 2, act: ['atk', 'seal', 'heavy', 'multi', 'atkUp'], art: { hair: { c: '#ffd23a', style: 'smooth', n: 6, len: 6, side: 76, line: 44, bangs: { n: 4, lens: [22, 8, 8, 22] } }, acc: ['hearthead'], eye: { t: 'sharp', c: '#c22' }, brow: 'a', mouth: 'lips', outfit: { top: '#f2c230', inner: '#1c1c22', heart: '#2a8a3a', pants: '#f2c230', boots: '#2a8a3a' }, pose: 'cross' } },
  puu: { boss: true, name: '魔人ブウ', attr: 'green', hp: 11, atk: 1.6, cd: 2, act: ['atk', 'heal', 'multi', 'heavy'], monster: { t: 'buu', c: '#ff9ac8' } },
};

// ---------- クエスト ----------
const AREAS = [
  {
    id: 1, name: 'はじまりの島', sub: 'ONE PIECE', scene: 'beach', color: '#3a9ae8',
    stages: [
      { name: '麦わらの出航', waves: [['slime', 'pirate'], ['pirate', 'pirate'], ['crab']] },
      { name: '海賊船の甲板', waves: [['pirate', 'crab'], ['pirate', 'slimeY', 'pirate'], ['serpent']] },
      { name: '道化の一味', waves: [['pirate', 'pirate'], ['crab', 'crab'], ['baki']] },
      { name: '魚人の入り江', waves: [['crab', 'serpent'], ['pirate', 'crab', 'pirate'], ['slimeK']] },
      { name: '決戦! ノコギリのアーロン', waves: [['crab', 'pirate', 'crab'], ['serpent', 'pirate'], ['aaro']] },
    ],
  },
  {
    id: 2, name: '修行の荒野', sub: 'ドラゴンボール', scene: 'mountain', color: '#f0902a',
    stages: [
      { name: '亀仙流の修行', waves: [['wolf', 'saibai'], ['saibai', 'saibai'], ['dino']] },
      { name: 'リボソ軍の砦', waves: [['rrRobot', 'saibai'], ['rrRobot', 'rrRobot'], ['dragonR']] },
      { name: '栽培の脅威', waves: [['saibai', 'saibai', 'saibai'], ['wolf', 'dino'], ['rrRobot', 'dino']] },
      { name: '恐竜の谷', waves: [['dino', 'wolf'], ['dino', 'saibai', 'wolf'], ['dragonR']] },
      { name: '決戦! 宇宙の帝王', waves: [['saibai', 'rrRobot', 'saibai'], ['dino', 'dragonR'], ['frieda']] },
    ],
  },
  {
    id: 3, name: '隠れ忍の里', sub: 'NARUTO', scene: 'village', color: '#3ab45a',
    stages: [
      { name: '中忍試験', waves: [['ninja', 'ninja'], ['gama', 'ninja'], ['ninja', 'ninja', 'ninja']] },
      { name: '死の森', waves: [['spider', 'ninja'], ['puppet', 'gama'], ['spider', 'puppet']] },
      { name: '大蛇の影', waves: [['ninja', 'puppet', 'ninja'], ['gama', 'gama'], ['orochi']] },
      { name: '口寄せ大合戦', waves: [['gama', 'ninja'], ['puppet', 'puppet', 'ninja'], ['slimeK', 'gama']] },
      { name: '決戦! 六道のペイン', waves: [['ninja', 'puppet', 'ninja'], ['orochi'], ['peiso']] },
    ],
  },
  {
    id: 4, name: '魂の都', sub: 'BLEACH', scene: 'soul', color: '#5a6ad8',
    stages: [
      { name: '虚の出現', waves: [['ghostW', 'hollow'], ['hollow', 'hollow'], ['menos']] },
      { name: '尸魂の街', waves: [['hollow', 'ghostW', 'hollow'], ['menos', 'ghostW'], ['bigbeast']] },
      { name: '虚圏の砂漠', waves: [['hollow', 'menos'], ['bigbeast', 'hollow'], ['menos', 'menos']] },
      { name: '十刃の影', waves: [['menos', 'hollow', 'menos'], ['bigbeast', 'bigbeast'], ['dragonR']] },
      { name: '決戦! 天に立つ者', waves: [['hollow', 'menos', 'hollow'], ['bigbeast', 'menos'], ['aizen']] },
    ],
  },
  {
    id: 5, name: '鬼の棲む森', sub: '鬼滅の刃', scene: 'forest', color: '#8a4ad8',
    stages: [
      { name: '最終選別', waves: [['oni', 'oni'], ['oniB', 'oni'], ['spider']] },
      { name: '那田蜘蛛山', waves: [['spider', 'oni'], ['spider', 'spider'], ['oniB', 'spider', 'oniB']] },
      { name: '無限列車', waves: [['oni', 'oniB', 'oni'], ['spider', 'oniB'], ['akasa']] },
      { name: '遊郭の夜', waves: [['oniB', 'oniB'], ['oni', 'spider', 'oni'], ['bigbeast', 'oniB']] },
      { name: '決戦! 鬼の始祖・無惨', waves: [['oni', 'oniB', 'oni'], ['akasa'], ['muzan']] },
    ],
  },
  {
    id: 6, name: '呪いの学園', sub: '呪術廻戦', scene: 'school', color: '#c0407a',
    stages: [
      { name: '呪霊の発生', waves: [['curse', 'curse'], ['golem', 'curse'], ['curseG']] },
      { name: '交流会', waves: [['golem', 'golem'], ['curse', 'curseG'], ['curse', 'golem', 'curse']] },
      { name: '少年院の異変', waves: [['curse', 'ghostW', 'curse'], ['curseG', 'golem'], ['curseG', 'curseG']] },
      { name: '渋谷の夜', waves: [['curseG', 'curse'], ['golem', 'curseG', 'golem'], ['dragonR', 'curseG']] },
      { name: '決戦! 呪いの王', waves: [['curse', 'curseG', 'curse'], ['golem', 'curseG'], ['sukuna']] },
    ],
  },
  {
    id: 7, name: '世紀末荒野', sub: '北斗の拳', scene: 'waste', color: '#d8602a',
    stages: [
      { name: '水を求めて', waves: [['mohican', 'mohican'], ['bandit', 'mohican'], ['wolf', 'wolf', 'bandit']] },
      { name: '野盗の村', waves: [['bandit', 'bandit'], ['mohican', 'bandit', 'mohican'], ['bigbeast']] },
      { name: 'ヒャッハー祭', waves: [['mohican', 'mohican', 'mohican'], ['bandit', 'bandit'], ['golem', 'bigbeast']] },
      { name: '聖帝十字陵', waves: [['bandit', 'mohican', 'bandit'], ['bigbeast', 'golem'], ['dragonR', 'bigbeast']] },
      { name: '決戦! 聖帝サウザー', waves: [['mohican', 'bandit', 'mohican'], ['bigbeast', 'bandit'], ['sauza']] },
    ],
  },
  {
    id: 8, name: '最終決戦の地', sub: 'オールスター', scene: 'final', color: '#a03ad8',
    stages: [
      { name: '奇術師の罠', waves: [['hollow', 'oni', 'curse'], ['bigbeast', 'dragonR'], ['hisoko']] },
      { name: '天夜叉の糸', waves: [['pirate', 'mohican', 'ninja'], ['curseG', 'menos'], ['dofura']] },
      { name: '蟻の王', waves: [['spider', 'bigbeast', 'spider'], ['dragonR', 'curseG'], ['meruemo']] },
      { name: '魔人復活', waves: [['saibai', 'rrRobot', 'saibai'], ['frieda'], ['puu']] },
      { name: '最終決戦! 世界の支配者', waves: [['hisoko', 'dofura'], ['meruemo', 'sukuna'], ['diou']] },
    ],
  },
];
AREAS.forEach((a, ai) => a.stages.forEach((s, si) => {
  s.id = `${a.id}-${si + 1}`;
  s.area = a.id;
  s.lv = ai * 5 + si + 1;              // 難易度レベル 1..40
  s.stamina = 5 + Math.floor(s.lv / 6);
  s.coin = 300 + s.lv * 60;
  s.exp = 120 + s.lv * 40;
  s.ruby = si === 4 ? 150 : 50;        // 初回クリア報酬
}));

// ---------- 修行の間 (いつでも挑戦できる強化クエスト) ----------
const TRAINING = {
  id: 'T', name: '修行の間', sub: 'コイン・経験値をたくさんゲット!', scene: 'mountain', color: '#d8a020',
  stages: [
    { id: 'T-1', name: 'コイン修行・初級', waves: [['goldSlime', 'goldSlime'], ['goldSlime', 'metalSlime', 'goldSlime']], lv: 4, stamina: 6, coin: 3000, exp: 400 },
    { id: 'T-2', name: '経験値修行・中級', waves: [['metalSlime', 'metalSlime'], ['goldSlime', 'metalSlime', 'metalSlime'], ['bigGold']], lv: 14, stamina: 10, coin: 5000, exp: 1600 },
    { id: 'T-3', name: '黄金修行・上級', waves: [['metalSlime', 'goldSlime', 'metalSlime'], ['goldSlime', 'goldSlime', 'goldSlime'], ['bigGold', 'metalSlime']], lv: 26, stamina: 15, coin: 12000, exp: 3500 },
  ],
};
TRAINING.stages.forEach(s => { s.area = 'T'; s.ruby = 0; });
const findArea = id => id === 'T' ? TRAINING : AREAS.find(a => a.id === id);

// ---------- ガチャ ----------
const GACHA = [
  { id: 'fes', name: 'ジャンプチ超フェス', desc: '全キャラ対象! ★5の出現率5%', color: '#ff4b6e', pick: [] },
  { id: 'battle', name: 'バトル漫画ピックアップ', desc: '悟空・一護・サトル・承太郎の出現率UP!', color: '#3b86ff', pick: ['goku', 'ichigo', 'gojo', 'jotaro'] },
  { id: 'hero', name: 'ヒーロー大集結ピックアップ', desc: 'ルフィ・ナルト・デク・炭治郎の出現率UP!', color: '#35c45a', pick: ['ruhi', 'naruto', 'deku', 'tanjiro'] },
];
const GACHA_COST = { single: 100, ten: 1000 };
const GACHA_RATE = { 5: 0.05, 4: 0.25, 3: 0.70 };

const HERO_MAP = Object.fromEntries(HEROES.map(h => [h.id, h]));
const LEGEND_MAP = Object.fromEntries(LEGENDS.map(l => [l.id, l]));

// ---------- ミッション ----------
const MISSIONS = [
  { id: 'clear1', name: 'はじめの一歩', desc: '1-1をクリアする', ruby: 100, check: d => !!d.clear['1-1'] },
  { id: 'gacha10', name: 'はじめてのガチャ', desc: 'ガチャを10回ひく', ruby: 100, check: d => d.stats.gacha >= 10 },
  { id: 'train', name: '修行開始', desc: '修行の間をどれかクリア', ruby: 100, check: d => !!(d.clear['T-1'] || d.clear['T-2'] || d.clear['T-3']) },
  { id: 'hiss10', name: '必殺ワザ見習い', desc: '必殺ワザを累計10回発動', ruby: 100, check: d => (d.stats.hiss || 0) >= 10 },
  { id: 'area1', name: 'はじまりの島 制覇', desc: 'エリア1をすべてクリア', ruby: 200, check: d => !!d.clear['1-5'] },
  { id: 'chara15', name: '仲間集め', desc: 'キャラを15種類集める', ruby: 200, check: d => Object.keys(d.heroes).length >= 15 },
  { id: 'dmg50k', name: '一撃5万', desc: '1回の攻撃で50,000ダメージ', ruby: 200, check: d => (d.stats.maxDmg || 0) >= 50000 },
  { id: 'lv30', name: '育成上手', desc: 'キャラをLv30まで育てる', ruby: 200, check: d => Object.values(d.heroes).some(u => u.lv >= 30) },
  { id: 'area4', name: '魂の都 制覇', desc: 'エリア4をすべてクリア', ruby: 300, check: d => !!d.clear['4-5'] },
  { id: 'hiss100', name: '必殺ワザマスター', desc: '必殺ワザを累計100回発動', ruby: 300, check: d => (d.stats.hiss || 0) >= 100 },
  { id: 'rank10', name: 'ランク10', desc: 'プレイヤーランク10に到達', ruby: 300, check: d => d.rank >= 10 },
  { id: 'lb4', name: '限界の先へ', desc: 'キャラを4回限界突破する', ruby: 300, check: d => Object.values(d.heroes).some(u => u.lb >= 4) },
  { id: 'win30', name: '歴戦の勇者', desc: 'バトルに30回勝利', ruby: 300, check: d => d.stats.wins >= 30 },
  { id: 'chara30', name: 'ジャンプチ大集合', desc: 'キャラを30種類集める', ruby: 500, check: d => Object.keys(d.heroes).length >= 30 },
  { id: 'dmg150k', name: '一撃15万', desc: '1回の攻撃で150,000ダメージ', ruby: 500, check: d => (d.stats.maxDmg || 0) >= 150000 },
  { id: 'area8', name: 'アイランド救出', desc: '最終決戦をクリアする', ruby: 1000, check: d => !!d.clear['8-5'] },
];
