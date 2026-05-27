// sneakers.js — バッシュ情報

const FB_SNEAKERS = `${FB_URL}/sneakers`;
let _allSneakers = [];

const BRANDS = {
  nike: 'Nike', jordan: 'Jordan', adidas: 'Adidas',
  underarmour: 'Under Armour', puma: 'Puma',
  newbalance: 'New Balance', anta: 'Anta', lining: 'Li-Ning'
};

async function loadSneakers() {
  const wrap = document.getElementById('sneakersWrap');
  if (!wrap) return;
  wrap.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--tx3);font-size:.75rem;">取得中...</div>';

  try {
    const res = await fetch(FB_SNEAKERS + '.json');
    const data = await res.json();
    if (!data) { wrap.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--tx3);">まだ情報がありません</div>'; return; }
    _allSneakers = Object.entries(data).map(([id,s]) => ({id,...s})).sort((a,b) => b.ts - a.ts);
    renderSneakers(_allSneakers);
  } catch(e) {
    wrap.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--tx3);">取得に失敗しました</div>';
  }
}

function renderSneakers(list) {
  const wrap = document.getElementById('sneakersWrap');
  if (!wrap) return;
  if (!list.length) { wrap.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--tx3);">該当するバッシュがありません</div>'; return; }

  wrap.innerHTML = list.map(s => `
    <div style="background:var(--card);border:1px solid var(--bd);border-radius:12px;margin-bottom:.8rem;overflow:hidden;">
      ${s.img ? `<img src="${s.img}" style="width:100%;height:200px;object-fit:cover;" onerror="this.style.display='none'">` : '<div style="width:100%;height:160px;background:var(--bg3);display:flex;align-items:center;justify-content:center;font-size:3rem;">👟</div>'}
      <div style="padding:.8rem;">
        <div style="display:flex;align-items:center;gap:.4rem;margin-bottom:.4rem;">
          ${s.isNew ? '<span style="font-size:.55rem;background:#ff5a00;color:#fff;padding:.1rem .5rem;border-radius:10px;font-weight:700;">NEW</span>' : ''}
          <span style="font-size:.6rem;background:var(--bg3);color:var(--tx3);padding:.1rem .5rem;border-radius:10px;">${BRANDS[s.brand]||s.brand||''}</span>
          ${s.player ? `<span style="font-size:.6rem;color:var(--tx3);">👤 ${s.player}</span>` : ''}
        </div>
        <div style="font-size:.9rem;font-weight:700;color:var(--tx);margin-bottom:.3rem;">${s.name}</div>
        ${s.desc ? `<div style="font-size:.75rem;color:var(--tx2);line-height:1.6;margin-bottom:.5rem;">${s.desc}</div>` : ''}
        <div style="display:flex;align-items:center;justify-content:space-between;">
          ${s.price ? `<span style="font-size:.9rem;font-weight:700;color:var(--or);">${s.price}</span>` : '<span></span>'}
          ${s.url ? `<a href="${s.url}" target="_blank" style="background:var(--or);color:#fff;padding:.4rem .9rem;border-radius:8px;font-size:.75rem;font-weight:700;text-decoration:none;">購入する →</a>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

function filterSneakers(btn, brand) {
  document.querySelectorAll('#pg-sneakers .conf-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  const filtered = brand === 'all' ? _allSneakers : _allSneakers.filter(s => s.brand === brand);
  renderSneakers(filtered);
}

// 管理画面から投稿
async function submitSneaker() {
  const name   = document.getElementById('snkName').value.trim();
  const brand  = document.getElementById('snkBrand').value;
  const player = document.getElementById('snkPlayer').value.trim();
  const img    = document.getElementById('snkImg').value.trim();
  const price  = document.getElementById('snkPrice').value.trim();
  const url    = document.getElementById('snkUrl').value.trim();
  const desc   = document.getElementById('snkDesc').value.trim();
  const isNew  = document.getElementById('snkIsNew').checked;

  if (!name) { alert('商品名は必須です'); return; }

  const btn = document.getElementById('snkSubmitBtn');
  btn.textContent = '投稿中...'; btn.disabled = true;

  await fetch(FB_SNEAKERS + '.json', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ name, brand, player, img, price, url, desc, isNew, ts: Date.now() })
  });

  alert('投稿しました！');
  ['snkName','snkPlayer','snkImg','snkPrice','snkUrl','snkDesc'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('snkIsNew').checked = false;
  btn.textContent = '投稿する'; btn.disabled = false;
  closeSnkModal();
  loadSneakers();
}

function openSnkModal() {
  const modal = document.getElementById('snkModal');
  if (modal) modal.style.display = 'block';
}

function closeSnkModal() {
  const modal = document.getElementById('snkModal');
  if (modal) modal.style.display = 'none';
}
