// articles.js — 記事投稿・一覧・詳細

const FB_ARTICLES = `${FB_URL}/articles`;
const ADMIN_PASSWORD = '3579';

// ============================================================
// 本文レンダリング（URL自動判別）
// ============================================================
function renderBody(body) {
  if (!body) return '';
  return body.split('\n').map(line => {
    const t = line.trim();
    const yt = t.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (yt) return '<div style="margin:.8rem 0;"><iframe width="100%" height="200" src="https://www.youtube.com/embed/' + yt[1] + '" frameborder="0" allowfullscreen style="border-radius:10px;"></iframe></div>';
    if (t.includes('tiktok.com')) return '<div style="margin:.8rem 0;text-align:center;"><blockquote class="tiktok-embed" cite="' + t + '" data-video-id="' + (t.match(/video\/(\d+)/)||[])[1] + '"><a href="' + t + '">TikTok動画</a></blockquote><script async src="https://www.tiktok.com/embed.js"><\/script></div>';
    if (t.includes('instagram.com')) return '<div style="margin:.8rem 0;"><blockquote class="instagram-media" data-instgrm-permalink="' + t + '"><a href="' + t + '">Instagram投稿</a></blockquote><script async src="//www.instagram.com/embed.js"><\/script></div>';
    if (t.includes('twitter.com') || t.includes('x.com')) return '<div style="margin:.8rem 0;"><blockquote class="twitter-tweet"><a href="' + t + '">ツイート</a></blockquote><script async src="https://platform.twitter.com/widgets.js"><\/script></div>';
    if (t.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)) return '<div style="margin:.8rem 0;"><img src="' + t + '" style="width:100%;border-radius:10px;" onerror="this.style.display=\'none\'"></div>';
    return t ? '<p style="margin:.4rem 0;">' + t + '</p>' : '<br>';
  }).join('');
}

// ============================================================
// 記事一覧を表示
// ============================================================
async function loadArticles() {
  const wrap = document.getElementById('articlesWrap');
  if (!wrap) return;
  wrap.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--tx3);font-size:.75rem;">記事を取得中...</div>';

  try {
    const res = await fetch(FB_ARTICLES + '.json');
    const data = await res.json();
    if (!data) {
      wrap.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--tx3);">まだ記事がありません</div>';
      return;
    }

    const articles = Object.entries(data).map(([id, a]) => ({id, ...a})).sort((a,b) => b.ts - a.ts);

    wrap.innerHTML = articles.map(a => '<div onclick="openArticle(\'' + a.id + '\')" style="background:var(--card);border:1px solid var(--bd);border-radius:10px;padding:.8rem;margin-bottom:.6rem;cursor:pointer;">' +
      (a.img ? '<img src="' + a.img + '" style="width:100%;height:160px;object-fit:cover;border-radius:8px;margin-bottom:.6rem;" onerror="this.style.display=\'none\'">' : '') +
      '<div style="display:flex;gap:.4rem;align-items:center;margin-bottom:.35rem;">' +
      '<span style="font-size:.55rem;background:var(--or);color:#fff;padding:.1rem .4rem;border-radius:6px;">' + (a.category||'NBA') + '</span>' +
      '<span style="font-size:.55rem;color:var(--tx3);">' + new Date(a.ts).toLocaleDateString('ja-JP') + '</span>' +
      '</div>' +
      '<div style="font-size:.85rem;font-weight:700;color:var(--tx);margin-bottom:.3rem;line-height:1.4;">' + a.title + '</div>' +
      '<div style="font-size:.7rem;color:var(--tx3);line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">' + a.body + '</div>' +
      '</div>'
    ).join('');
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
    const res = await fetch(FB_ARTICLES + '/' + id + '.json');
    const a = await res.json();
    body.innerHTML = '<div style="padding:1rem;">' +
      (a.img ? '<img src="' + a.img + '" style="width:100%;border-radius:10px;margin-bottom:1rem;" onerror="this.style.display=\'none\'">' : '') +
      '<div style="display:flex;gap:.4rem;align-items:center;margin-bottom:.5rem;">' +
      '<span style="font-size:.58rem;background:var(--or);color:#fff;padding:.15rem .5rem;border-radius:6px;">' + (a.category||'NBA') + '</span>' +
      '<span style="font-size:.58rem;color:var(--tx3);">' + new Date(a.ts).toLocaleDateString('ja-JP') + '</span>' +
      '</div>' +
      '<div style="font-size:1rem;font-weight:700;color:var(--tx);margin-bottom:.8rem;line-height:1.5;">' + a.title + '</div>' +
      '<div style="font-size:.78rem;color:var(--tx2);line-height:1.8;">' + renderBody(a.body) + '</div>' +
      '</div>';
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
  const m = document.getElementById('adminSelectModal'); if (m) m.style.display = 'block';
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
    await fetch(FB_ARTICLES + '.json', {
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

// ============================================================
// エディタ補助関数
// ============================================================
function insertToBody(type) {
  const textarea = document.getElementById('adminBody');
  const prompts = {
    image: '画像URLを入力してください',
    youtube: 'YouTubeのURLを入力してください',
    tiktok: 'TikTokのURLを入力してください',
    instagram: 'InstagramのURLを入力してください',
    twitter: 'X(Twitter)のURLを入力してください',
  };
  const url = prompt(prompts[type]);
  if (!url) return;
  const pos = textarea.selectionStart;
  const before = textarea.value.substring(0, pos);
  const after = textarea.value.substring(pos);
  textarea.value = before + '\n' + url + '\n' + after;
  updatePreview();
}

function updatePreview() {
  const body = document.getElementById('adminBody').value;
  const preview = document.getElementById('adminPreview');
  if (preview) preview.innerHTML = renderBody(body);
}

// ============================================================
// 広告管理
// ============================================================
const FB_ADS = `${FB_URL}/ads`;

async function loadAds() {
  const res = await fetch(FB_ADS + '.json');
  const data = await res.json();
  if (!data) return [];
  return Object.entries(data).map(([id, a]) => ({id, ...a}));
}

function openAdManager() {
  const pw = prompt('パスワードを入力してください');
  if (pw !== ADMIN_PASSWORD) { alert('パスワードが違います'); return; }
  const modal = document.getElementById('adManagerModal');
  if (modal) { modal.style.display = 'block'; renderAdManager(); }
}

function closeAdManager() {
  const modal = document.getElementById('adManagerModal');
  if (modal) modal.style.display = 'none';
}

async function renderAdManager() {
  const wrap = document.getElementById('adManagerList');
  if (!wrap) return;
  const ads = await loadAds();
  if (!ads.length) { wrap.innerHTML = '<div style="text-align:center;padding:1rem;color:var(--tx3);font-size:.75rem;">広告がありません</div>'; return; }
  wrap.innerHTML = ads.map(a => `
    <div style="background:var(--bg3);border-radius:8px;padding:.7rem;margin-bottom:.5rem;display:flex;align-items:center;gap:.5rem;">
      <div style="flex:1;min-width:0;">
        <div style="font-size:.72rem;font-weight:700;color:var(--tx);margin-bottom:.15rem;">${a.title}</div>
        <div style="font-size:.6rem;color:var(--tx3);">${a.tag} · ${a.price}</div>
      </div>
      <button onclick="deleteAd('${a.id}')" style="background:rgba(255,50,50,.15);border:none;color:#ff5555;padding:.3rem .5rem;border-radius:6px;font-size:.65rem;cursor:pointer;">削除</button>
    </div>
  `).join('');
}

async function submitAd() {
  const title = document.getElementById('adTitle').value.trim();
  const desc  = document.getElementById('adDesc').value.trim();
  const price = document.getElementById('adPrice').value.trim();
  const tag   = document.getElementById('adTag').value.trim();
  const url   = document.getElementById('adUrl').value.trim();
  const icon  = document.getElementById('adIcon').value.trim();
  const color = document.getElementById('adColor').value;

  const places = []; if (document.getElementById('adPlaceSchedule')?.checked) places.push('schedule'); if (document.getElementById('adPlaceNews')?.checked) places.push('news'); if (document.getElementById('adPlaceArticles')?.checked) places.push('articles'); if (document.getElementById('adPlacePlayers')?.checked) places.push('players'); if (!title || !url) { alert('タイトルとURLは必須です'); return; }

  const btn = document.getElementById('adSubmitBtn');
  btn.textContent = '保存中...'; btn.disabled = true;

  await fetch(FB_ADS + '.json', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ title, desc, price, tag, url, icon, color, places, ts: Date.now() })
  });

  alert('広告を追加しました！');
  document.getElementById('adTitle').value = '';
  document.getElementById('adDesc').value = '';
  document.getElementById('adPrice').value = '';
  document.getElementById('adTag').value = '';
  document.getElementById('adUrl').value = '';
  document.getElementById('adIcon').value = '';
  btn.textContent = '追加する'; btn.disabled = false;
  renderAdManager();
}

async function deleteAd(id) {
  if (!confirm('この広告を削除しますか？')) return;
  await fetch(`${FB_ADS}/${id}.json`, { method: 'DELETE' });
  renderAdManager();
}
