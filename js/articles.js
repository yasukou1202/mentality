// articles.js — 記事投稿・一覧・詳細

const FB_ARTICLES = `${FB_URL}/articles`;
const ADMIN_PASSWORD = 'mentality2026';

// ============================================================
// 記事一覧を表示
// ============================================================
async function loadArticles() {
  const wrap = document.getElementById('articlesWrap');
  if (!wrap) return;
  wrap.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--tx3);font-size:.75rem;">📰 記事を取得中...</div>';

  try {
    const res = await fetch(`${FB_ARTICLES}.json?orderBy="ts"&limitToLast=50`);
    const data = await res.json();
    if (!data) { wrap.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--tx3);">まだ記事がありません</div>'; return; }

    const articles = Object.entries(data).map(([id, a]) => ({id, ...a})).sort((a,b) => b.ts - a.ts);

    wrap.innerHTML = articles.map(a => `
      <div onclick="openArticle('${a.id}')" style="background:var(--card);border:1px solid var(--bd);border-radius:10px;padding:.8rem;margin-bottom:.6rem;cursor:pointer;">
        ${a.img ? `<img src="${a.img}" style="width:100%;height:160px;object-fit:cover;border-radius:8px;margin-bottom:.6rem;" onerror="this.style.display='none'">` : ''}
        <div style="display:flex;gap:.4rem;align-items:center;margin-bottom:.35rem;">
          <span style="font-size:.55rem;background:var(--or);color:#fff;padding:.1rem .4rem;border-radius:6px;">${a.category||'NBA'}</span>
          <span style="font-size:.55rem;color:var(--tx3);">${new Date(a.ts).toLocaleDateString('ja-JP')}</span>
        </div>
        <div style="font-size:.85rem;font-weight:700;color:var(--tx);margin-bottom:.3rem;line-height:1.4;">${a.title}</div>
        <div style="font-size:.7rem;color:var(--tx3);line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${a.body}</div>
      </div>
    `).join('');
  } catch(e) {
    wrap.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--tx3);">取得に失敗しました</div>';
  }
}

// ============================================================
// 記事詳細モーダル
// ============================================================
async function openArticle(id) {
  const modal = document.getElementById('articleModal');
  const body = document.getElementById('articleModalBody');
  if (!modal || !body) return;
  modal.style.display = 'block';
  body.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--tx3);">読み込み中...</div>';

  try {
    const res = await fetch(`${FB_ARTICLES}/${id}.json`);
    const a = await res.json();
    body.innerHTML = `
      <div style="padding:1rem;">
        ${a.img ? `<img src="${a.img}" style="width:100%;border-radius:10px;margin-bottom:1rem;" onerror="this.style.display='none'">` : ''}
        <div style="display:flex;gap:.4rem;align-items:center;margin-bottom:.5rem;">
          <span style="font-size:.58rem;background:var(--or);color:#fff;padding:.15rem .5rem;border-radius:6px;">${a.category||'NBA'}</span>
          <span style="font-size:.58rem;color:var(--tx3);">${new Date(a.ts).toLocaleDateString('ja-JP')}</span>
        </div>
        <div style="font-size:1rem;font-weight:700;color:var(--tx);margin-bottom:.8rem;line-height:1.5;">${a.title}</div>
        <div style="font-size:.78rem;color:var(--tx2);line-height:1.8;white-space:pre-wrap;">${a.body}</div>
      </div>
    `;
  } catch(e) {
    body.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--tx3);">取得に失敗しました</div>';
  }
}

function closeArticleModal() {
  const modal = document.getElementById('articleModal');
  if (modal) modal.style.display = 'none';
}

// ============================================================
// 管理者ページ
// ============================================================
function openAdminPage() {
  const pw = prompt('パスワードを入力してください');
  if (pw !== ADMIN_PASSWORD) { alert('パスワードが違います'); return; }
  const modal = document.getElementById('adminModal');
  if (modal) modal.style.display = 'block';
}

function closeAdminModal() {
  const modal = document.getElementById('adminModal');
  if (modal) modal.style.display = 'none';
}

async function submitArticle() {
  const title    = document.getElementById('adminTitle').value.trim();
  const body     = document.getElementById('adminBody').value.trim();
  const img      = document.getElementById('adminImg').value.trim();
  const category = document.getElementById('adminCategory').value;

  if (!title || !body) { alert('タイトルと本文は必須です'); return; }

  const btn = document.getElementById('adminSubmitBtn');
  btn.textContent = '投稿中...';
  btn.disabled = true;

  try {
    await fetch(`${FB_ARTICLES}.json`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ title, body, img, category, ts: Date.now() })
    });
    alert('投稿しました！');
    document.getElementById('adminTitle').value = '';
    document.getElementById('adminBody').value = '';
    document.getElementById('adminImg').value = '';
    closeAdminModal();
    loadArticles();
  } catch(e) {
    alert('投稿に失敗しました');
  } finally {
    btn.textContent = '投稿する';
    btn.disabled = false;
  }
}
