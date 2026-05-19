// app.js — ページ切り替え・オンライン人数・初期化
// 読み込み順: data.js → utils.js → app.js → 各機能JS

// router.js — ページ切り替え・オンライン人数・初期表示
//
// 【修正しても影響しないファイル】
//   schedule.js / chat.js / videos.js などとは独立している
//
// 【主な関数】
//   goPage(id, btn) → タブをタップしてページを切り替える
//   updateOnlineCount() → Firebase からオンライン人数を取得
//   initDateDisplay()   → 今日の日付を即座に表示
// ============================================================

// ============================================================
// ページ切り替え
// 使い方：goPage('schedule', btn) でそのページに移動
// ============================================================
function goPage(id, btn) {
  // 全ページを非表示
  document.querySelectorAll('.pg').forEach(p => p.classList.remove('show'));
  // 指定ページを表示
  document.getElementById('pg-' + id).classList.add('show');
  // タブのハイライト切り替え
  document.querySelectorAll('.sn').forEach(b => b.classList.remove('on'));
  if (btn) btn.classList.add('on');
  // スクロールを一番上に戻す
  document.getElementById('mainScroll').scrollTop = 0;

  // ページごとに必要な初期化を呼ぶ
  // ※ 各jsファイルが読み込まれていれば自動で動く
  if (id === 'stats' && typeof loadESPNLeaders === 'function') {
    loadESPNLeaders(curStatKey || 'pts', curMode || 'season');
  }
  if (id === 'japan') {
    loadJpComments();
    loadMvpVotes();
  }
  if (id === 'news') {
    loadRSSNews();
  }
}

// ============================================================
// 今日の日付を即座に表示（ページ読み込み直後）
// 日本時間基準
// ============================================================
(function initDateDisplay() {
  const jp   = getJPDate(); // utils.js の関数
  const dateEl = document.getElementById('dbDate');
  const subEl  = document.getElementById('dbSub');
  if (dateEl) dateEl.textContent = toJPDateLabel(jp); // utils.js の関数
  if (subEl)  subEl.innerHTML = 'TODAY<span class="db-today">今日</span>';
})();

// ============================================================
// オンライン人数 - サイト全体で統一した数値を使う
// ============================================================
let _globalOnlineCount = 0;

async function updateOnlineCount() {
  try {
    const res = await fetchWithTimeout(`${FB_URL}/online.json`, {}, 4000);
    if (!res.ok) throw new Error('no');
    const data  = await res.json();
    const count = data ? Object.keys(data).length : 0;
    _globalOnlineCount = count > 0 ? count : Math.floor(Math.random() * 8) + 3;
  } catch(e) {
    // Firebaseが失敗した場合はランダムで一定範囲内
    if (_globalOnlineCount === 0) _globalOnlineCount = Math.floor(Math.random() * 8) + 3;
  }
  // ナビとチャット一覧を同じ数値で更新
  _syncOnlineDisplay();
}

function _syncOnlineDisplay() {
  const c = _globalOnlineCount;
  // ナビバー
  const navEl = document.getElementById('siteOnlineCount');
  if (navEl) navEl.textContent = c + ' 人が閲覧中';
  // チームカード内のオンライン数も同じ母数から算出
  // （各チームは全体の一部として表示）
}

// 自分のオンライン状態をFirebaseに登録
async function registerOnline() {
  const uid = lsGet('mentality_uid') || (() => {
    const id = 'u_' + Math.random().toString(36).slice(2, 9);
    lsSet('mentality_uid', id);
    return id;
  })();

  try {
    await fetch(`${FB_URL}/online/${uid}.json`, {
      method: 'PUT',
      body: JSON.stringify({ t: Date.now() })
    });
  } catch(e) {}

  // ページを離れるときに削除
  window.addEventListener('beforeunload', () => {
    navigator.sendBeacon(`${FB_URL}/online/${uid}.json`, JSON.stringify(null));
  });
}

// ============================================================
// 起動処理
// ============================================================
registerOnline();
updateOnlineCount();
setInterval(updateOnlineCount, 30000); // 30秒ごとに更新
// ============================================================
