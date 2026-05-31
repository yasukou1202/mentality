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
  { name:'八村塁',         color:'#552583', av:'H',
    url:'https://news.google.com/rss/search?q=%E5%85%AB%E6%9D%91%E5%A1%81NBA&hl=ja&gl=JP&ceid=JP:ja' },
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
            title:   (item.title||'').replace(/&#39;/g,"'").replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#[0-9]+;/g,c=>String.fromCharCode(parseInt(c.slice(2,-1)))),
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
async function renderArticles(articles) {
  const list = document.getElementById('articleList');
  if (!list) return;

  if (!articles.length) {
    list.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--tx3);font-size:.78rem;">記事が見つかりませんでした</div>';
    return;
  }

  // adslots取得
  let newsAds = [];
  try {
    const ar = await fetch(FB_URL + '/adslots.json');
    const ad = await ar.json() || {};
    newsAds = ['news_1','news_2'].map(k => ad[k]).filter(a => a && a.url && a.enabled !== false);
  } catch(e) {}

  const adCardHTML = (ad) => `
    <a href="${ad.url}" target="_blank" style="display:block;text-decoration:none;margin:.5rem 0;background:var(--card);border:1px solid var(--bd);border-radius:10px;padding:.7rem .8rem;">
      <div style="display:flex;align-items:center;gap:.5rem;">
        ${ad.img ? `<img src="${ad.img}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;flex-shrink:0;" onerror="this.style.display='none'">` : '<div style="width:48px;height:48px;border-radius:8px;background:var(--bg3);flex-shrink:0;"></div>'}
        <div style="flex:1;min-width:0;">
          <div style="margin-bottom:.2rem;"><span style="font-size:.5rem;background:rgba(255,90,0,.15);color:var(--or);padding:.1rem .4rem;border-radius:10px;font-weight:700;">PR</span></div>
          <div style="font-size:.72rem;font-weight:700;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${ad.title}</div>
        </div>
        <div style="color:var(--tx3);font-size:.8rem;">›</div>
      </div>
    </a>`;

  list.innerHTML = (newsAds[0] ? adCardHTML(newsAds[0]) : '') + articles.map((a, i) => `
    <div onclick="window.open('${a.link}','_blank')" style="cursor:pointer;border-bottom:1px solid var(--bd);padding:.85rem 0;display:flex;gap:.6rem;align-items:flex-start;">
      <div style="flex-shrink:0;width:42px;height:42px;border-radius:50%;background:${a.color};display:flex;align-items:center;justify-content:center;font-size:.85rem;font-weight:700;color:#fff;">${a.av}</div>
      <div style="flex:1;min-width:0;">
        <div style="display:flex;align-items:center;gap:.4rem;margin-bottom:.2rem;">
          <span style="font-size:.75rem;font-weight:700;color:var(--tx);">${a.name}</span>
          <span style="font-size:.65rem;color:var(--tx3);">·</span>
          <span style="font-size:.65rem;color:var(--tx3);">${timeAgo(a.pubDate)}</span>
        </div>
        <div style="font-size:.8rem;font-weight:600;color:var(--tx);line-height:1.5;margin-bottom:.3rem;">${a.title}</div>
        <div style="font-size:.7rem;color:var(--tx3);line-height:1.5;margin-bottom:.4rem;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${a.desc}</div>
        ${a.img ? `<img src="${a.img}" style="width:100%;max-height:200px;object-fit:cover;border-radius:12px;border:1px solid var(--bd);" onerror="this.style.display='none'">` : ''}
        <div style="margin-top:.4rem;"><span style="font-size:.65rem;color:var(--or);">続きを読む →</span></div>
      </div>
    </div>
    ${i === articles.length-1 && newsAds[1] ? adCardHTML(newsAds[1]) : ''}
  `).join('');
}
// ============================================================
// videos.js — ハイライト動画
//
// 【このファイルだけで完結する機能】
//   - YouTube Data API v3 で最新動画を自動取得
//   - チャンネル切り替え（NBA公式 / NBA JAPAN）
