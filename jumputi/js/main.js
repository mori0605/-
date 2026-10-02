// ============================================================
//  起動
// ============================================================
(() => {
  Save.load();
  // 画像を先読み (必殺プチの顔など)
  HEROES.forEach(h => Art.image(h, true));
  UI.show('title');
  // 画面の拡大縮小やダブルタップズームを抑止
  document.addEventListener('dblclick', e => e.preventDefault());
  document.addEventListener('visibilitychange', () => { if (!document.hidden) Save.tickStamina(); });
  window.addEventListener('beforeunload', () => Save.save());
})();
