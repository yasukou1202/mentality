// news.js — 速報・RSSフィード（notable.js + videos.js）
// 読み込み順: data.js → utils.js → app.js → 各機能JS

// notable.js — 記事・海外ニュース（ESPN RSS リアルデータ）
//
// ESPN・Google News RSSからリアルなNBAニュースを取得
// APIキー不要・無料
// ============================================================

// ============================================================
// RSSフィード一覧（Google News RSS - 確実に動く）
// ============================================================
const NEWS_FEEDS = [
  { name:'NBA ニュース',  color:'#1D428A', av:'N',
    url:'https://news.google.com/rss/search?q=NBA&hl=en-US&gl=US&ceid=US:en' },
  { name:'NBA プレーオフ', color:'#D00020', av:'P',
    url:'https://news.google.com/rss/search?q=NBA+playoffs&hl=en-US&gl=US&ceid=US:en' },
  { name:'河村勇輝',      color:'#FF5A00', av:'K',
    url:'https://news.google.com/rss/search?q=%E6%B2%B3%E6%9D%91%E5%8B%87%E8%BC%9BNBA&hl=ja&gl=JP&ceid=JP:ja' },
];

// RSS2JSONを使ってCORSを回避
const RSS2JSON = 'https://api.rss2json.com/v1/api.json?rss_url=';

let _allArticles = [];
let articleFilter = 'all';

// ============================================================
// 記事ページを初期化
// ============================================================
async function initNotable() {
  const list    = document.getElementById('articleList');
  const loading = document.getElementById('articleLoading');
  if (loading) loading.style.display = 'block';
  if (list)    list.innerHTML = '';

  const RSS2JSON = 'https://api.rss2json.com/v1/api.json?count=8&rss_url=';

  try {
    const results = await Promise.all(
      NEWS_FEEDS.map(async feed => {
        try {
          const res  = await fetchWithTimeout(
            `${RSS2JSON}${encodeURIComponent(feed.url)}`, {}, 8000
          );
          if (!res.ok) return [];
          const data = await res.json();
          if (data.status !== 'ok') return [];
          return (data.items || []).map(item => ({
            title:   (item.title||'').replace(/&#39;/g,"'").replace(/&amp;/g,'&').replace(/&quot;/g,'"'),
            link:    item.link    || '',
            pubDate: item.pubDate || '',
            desc:    (item.description || '').replace(/<[^>]*>/g,'').replace(/&#39;/g,"'").replace(/&amp;/g,'&').slice(0,150),
            img:     item.thumbnail || (item.enclosure && item.enclosure.link) || '',
            name:    feed.name,
            color:   feed.color,
            av:      feed.av,
          }));
        } catch(e) { return []; }
      })
    );

    _allArticles = results.flat().sort((a, b) =>
      new Date(b.pubDate) - new Date(a.pubDate)
    );

    if (loading) loading.style.display = 'none';
    if (!_allArticles.length) throw new Error('記事なし');
    renderArticles(_allArticles);
    console.log('✅ ニュース取得成功:', _allArticles.length, '件');

  } catch(e) {
    console.warn('ニュース取得失敗:', e.message);
    if (loading) loading.style.display = 'none';
    if (list) list.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--tx3);font-size:.78rem;">ニュースの取得に失敗しました。<br>しばらくしてから再度お試しください。</div>';
  }
}

// ============================================================
// 時刻を「○分前」「○時間前」に変換
// ============================================================
function timeAgo(pubDate) {
  if (!pubDate) return '';
  const diff = Date.now() - new Date(pubDate).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 6)  return new Date(pubDate).toLocaleDateString('ja-JP', {month:'numeric', day:'numeric'});
  if (d > 0)  return d + '日前';
  if (h > 0)  return h + '時間前';
  if (m > 0)  return m + '分前';
  return 'たった今';
}

// ============================================================
// メディアフィルター
// ============================================================
function filterArticles(media) {
  articleFilter = media;

  document.querySelectorAll('.media-filter-btn').forEach(btn => {
    btn.classList.remove('active-media');
  });
  const activeBtn = document.getElementById('media-btn-' + media);
  if (activeBtn) activeBtn.classList.add('active-media');

  const filtered = media === 'all'
    ? _allArticles
    : _allArticles.filter(a => a.name.toLowerCase().includes(media));

  renderArticles(filtered);
}

// ============================================================
// 記事を描画
// ============================================================
function renderArticles(articles) {
  const list = document.getElementById('articleList');
  if (!list) return;

  if (!articles.length) {
    list.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--tx3);font-size:.78rem;">記事が見つかりませんでした</div>';
    return;
  }

  list.innerHTML = articles.map(a => `
    <div class="nf" onclick="window.open('${a.link}','_blank')" style="cursor:pointer;">
      ${a.img ? `<img src="${a.img}" style="width:100%;height:160px;object-fit:cover;border-radius:8px;margin-bottom:.5rem;" onerror="this.style.display='none'">` : ''}
      <div class="nf-head">
        <div class="nf-src">
          <div class="nf-av" style="background:${a.color};">${a.av}</div>
          <div>
            <div class="nf-name">${a.name}</div>
          </div>
        </div>
        <div class="nf-t">${timeAgo(a.pubDate)}</div>
      </div>
      <div class="nf-body">
        <div style="font-size:.82rem;font-weight:600;color:var(--tx);line-height:1.5;margin-bottom:.4rem;">${a.title}</div>
        <div style="font-size:.72rem;color:var(--tx2);line-height:1.6;">${a.desc}</div>
        <div style="margin-top:.5rem;">
          <span style="font-size:.65rem;color:var(--or);font-weight:600;">続きを読む →</span>
        </div>
      </div>
    </div>
  `).join('');
}
// ============================================================
// videos.js — ハイライト動画
//
// 【このファイルだけで完結する機能】
//   - YouTube Data API v3 で最新動画を自動取得
//   - チャンネル切り替え（NBA公式 / NBA JAPAN）
