// stats.js — スタッツリーダー・順位表
// 読み込み順: data.js → utils.js → app.js → 各機能JS

// stats.js — スタッツリーダー・順位表
//
// 【このファイルだけで完結する機能】
//   - スタッツリーダー（PTS/AST/REB/STL/BLK/3P%/FG%）
//   - 平均/合計切り替え
//   - レギュラー/プレーオフ切り替え
//   - 順位表（イースト/ウェスト）
//   - NBA API + ESP Nフォールバック
//
// 【修正したいときの場所】
//   スタッツカテゴリ追加 → initStats() の cats 配列
//   順位表データ更新    → STANDINGS オブジェクト
//   APIエンドポイント変更 → loadESPNLeaders()
// ============================================================

// ============================================================
// ダミースタッツデータ（API失敗時のバックアップ）
// ============================================================
const STATS = {
  pts:[
    {name:'ヤニス・アデトクンボ', team:'MIL', val:30.2, unit:'PPG', gp:69},
    {name:'ルカ・ドンチッチ',     team:'DAL', val:29.8, unit:'PPG', gp:72},
    {name:'ジェイソン・テイタム', team:'BOS', val:28.4, unit:'PPG', gp:74},
    {name:'ジェイレン・ブランソン',team:'NYK', val:27.8, unit:'PPG', gp:75},
    {name:'SGA',                  team:'OKC', val:26.8, unit:'PPG', gp:73},
    {name:'ステフィン・カリー',   team:'GSW', val:26.4, unit:'PPG', gp:68},
    {name:'レブロン・ジェームズ', team:'LAL', val:25.8, unit:'PPG', gp:71},
    {name:'アンソニー・エドワーズ',team:'MIN', val:25.2, unit:'PPG', gp:76},
    {name:'ケビン・デュラント',   team:'PHX', val:24.6, unit:'PPG', gp:65},
    {name:'デイミアン・リラード', team:'MIL', val:23.8, unit:'PPG', gp:70},
  ],
  ast:[
    {name:'タイリース・ハリバートン',team:'IND', val:11.2, unit:'APG', gp:71},
    {name:'ニコラ・ヨキッチ',        team:'DEN', val:9.1,  unit:'APG', gp:72},
    {name:'レブロン・ジェームズ',    team:'LAL', val:8.2,  unit:'APG', gp:71},
    {name:'河村 勇輝',               team:'LAL', val:6.2,  unit:'APG', gp:61},
    {name:'SGA',                     team:'OKC', val:7.6,  unit:'APG', gp:73},
  ],
  reb:[
    {name:'ニコラ・ヨキッチ',        team:'DEN', val:14.2, unit:'RPG', gp:72},
    {name:'ヤニス・アデトクンボ',    team:'MIL', val:12.1, unit:'RPG', gp:69},
    {name:'アンソニー・デイビス',    team:'LAL', val:11.8, unit:'RPG', gp:70},
    {name:'ウェンバンヤマ',          team:'SAS', val:10.4, unit:'RPG', gp:68},
  ],
};

// ============================================================
// 順位表データ（ダミー。ESPN APIで更新予定）
// ============================================================
const STANDINGS = {
  east:[
    {r:1,  logo:'⚔️', abbr:'CLE', w:52, l:18, pct:.743, gb:'-',  badge:'po'},
    {r:2,  logo:'🍀', abbr:'BOS', w:50, l:20, pct:.714, gb:'2',  badge:'po'},
    {r:3,  logo:'🦌', abbr:'MIL', w:46, l:24, pct:.657, gb:'6',  badge:'po'},
    {r:4,  logo:'🗽', abbr:'NYK', w:44, l:26, pct:.629, gb:'8',  badge:'po'},
    {r:5,  logo:'⚡', abbr:'IND', w:40, l:30, pct:.571, gb:'12', badge:'po'},
    {r:6,  logo:'🔥', abbr:'MIA', w:38, l:32, pct:.543, gb:'14', badge:'po'},
    {r:7,  logo:'✨', abbr:'ORL', w:36, l:34, pct:.514, gb:'16', badge:'pi'},
    {r:8,  logo:'🔔', abbr:'PHI', w:38, l:32, pct:.543, gb:'14', badge:'pi'},
    {r:9,  logo:'🐂', abbr:'CHI', w:36, l:34, pct:.514, gb:'16', badge:'pi'},
    {r:10, logo:'🦅', abbr:'ATL', w:32, l:38, pct:.457, gb:'20', badge:'pi'},
    {r:11, logo:'🦖', abbr:'TOR', w:26, l:44, pct:.371, gb:'26', badge:''},
    {r:12, logo:'🕸', abbr:'BKN', w:28, l:42, pct:.400, gb:'24', badge:''},
    {r:13, logo:'🏎️',abbr:'DET', w:14, l:56, pct:.200, gb:'38', badge:''},
    {r:14, logo:'🐝', abbr:'CHA', w:18, l:52, pct:.257, gb:'34', badge:''},
    {r:15, logo:'🧙', abbr:'WAS', w:12, l:58, pct:.171, gb:'40', badge:''},
  ],
  west:[
    {r:1,  logo:'⚡', abbr:'OKC', w:54, l:16, pct:.771, gb:'-',  badge:'po'},
    {r:2,  logo:'⛰️',abbr:'DEN', w:50, l:20, pct:.714, gb:'4',  badge:'po'},
    {r:3,  logo:'🐺', abbr:'MIN', w:46, l:24, pct:.657, gb:'8',  badge:'po'},
    {r:4,  logo:'👑', abbr:'LAL', w:44, l:26, pct:.629, gb:'10', badge:'po'},
    {r:5,  logo:'🤠', abbr:'DAL', w:44, l:26, pct:.629, gb:'10', badge:'po'},
    {r:6,  logo:'🚀', abbr:'HOU', w:40, l:30, pct:.571, gb:'14', badge:'po'},
    {r:7,  logo:'🎯', abbr:'GSW', w:40, l:30, pct:.571, gb:'14', badge:'pi'},
    {r:8,  logo:'⚓', abbr:'LAC', w:36, l:34, pct:.514, gb:'18', badge:'pi'},
    {r:9,  logo:'👑', abbr:'SAC', w:38, l:32, pct:.543, gb:'16', badge:'pi'},
    {r:10, logo:'🐻', abbr:'MEM', w:32, l:38, pct:.457, gb:'22', badge:'pi'},
    {r:11, logo:'☀️', abbr:'PHX', w:36, l:34, pct:.514, gb:'18', badge:''},
    {r:12, logo:'🦅', abbr:'NOP', w:34, l:36, pct:.486, gb:'20', badge:''},
    {r:13, logo:'🎵', abbr:'UTA', w:20, l:50, pct:.286, gb:'34', badge:''},
    {r:14, logo:'🌹', abbr:'POR', w:22, l:48, pct:.314, gb:'32', badge:''},
    {r:15, logo:'⚜️', abbr:'SAS', w:18, l:52, pct:.257, gb:'36', badge:''},
  ],
};

// ============================================================
// NBA API ソートキー対応表
// ============================================================
const NBAAPI_SORT_MAP = {
  pts: { sortKey:'points',        label:'PPG', totLabel:'PTS', pct:false },
  ast: { sortKey:'assists',       label:'APG', totLabel:'AST', pct:false },
  reb: { sortKey:'totalRb',       label:'RPG', totLabel:'REB', pct:false },
  stl: { sortKey:'steals',        label:'SPG', totLabel:'STL', pct:false },
  blk: { sortKey:'blocks',        label:'BPG', totLabel:'BLK', pct:false },
  fg3: { sortKey:'threePercent',  label:'3P%', totLabel:'3P%', pct:true  },
  fg:  { sortKey:'fieldPercent',  label:'FG%', totLabel:'FG%', pct:true  },
  ft:  { sortKey:'ftPercent',     label:'FT%', totLabel:'FT%', pct:true  },
  to:  { sortKey:'turnovers',     label:'TPG', totLabel:'TO',  pct:false },
  pf:  { sortKey:'personalFouls', label:'FPG', totLabel:'PF',  pct:false },
  min: { sortKey:'minutesPg',     label:'MPG', totLabel:'MIN', pct:false },
};

// ============================================================
// 状態管理
// ============================================================
let curConf     = 'east';
let curMode     = 'season';
let curStatKey  = 'pts';
let curStatType = 'avg';

// ============================================================
// スタッツページ初期化
// ============================================================
function initStats() {
  const cats = [
    ['pts','PTS'], ['ast','AST'], ['reb','REB'],
    ['stl','STL'], ['blk','BLK'], ['fg3','3P%'], ['fg','FG%'], ['ft','FT%'],
    ['to','TO'],   ['pf','PF'],   ['min','MIN'],
  ];
  document.getElementById('statCats').innerHTML = cats.map((c, i) =>
    `<button class="scat${i === 0 ? ' on' : ''}" onclick="showStat(this,'${c[0]}')">${c[1]}</button>`
  ).join('');
  loadESPNLeaders('pts', 'season');
  renderStandings();
}

// カテゴリ切り替え
function showStat(btn, stat) {
  document.querySelectorAll('.scat').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  curStatKey = stat;
  loadESPNLeaders(stat, curMode);
}

// シーズン/プレーオフ切り替え
function switchMode(btn, mode) {
  document.querySelectorAll('#btn-season, #btn-playoff').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  curMode = mode;
  loadESPNLeaders(curStatKey, mode);
}

// 平均/合計切り替え
function switchStatType(btn, type) {
  document.querySelectorAll('.stat-type-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  curStatType = type;
  loadESPNLeaders(curStatKey, curMode);
}

// ============================================================
// ESPN APIのスタッツカテゴリ対応表
// ============================================================
const ESPN_STAT_MAP = {
  pts: { espnStat:'pointsPerGame',       label:'PPG', totLabel:'PTS', pct:false },
  ast: { espnStat:'assistsPerGame',      label:'APG', totLabel:'AST', pct:false },
  reb: { espnStat:'reboundsPerGame',     label:'RPG', totLabel:'REB', pct:false },
  stl: { espnStat:'stealsPerGame',       label:'SPG', totLabel:'STL', pct:false },
  blk: { espnStat:'blocksPerGame',       label:'BPG', totLabel:'BLK', pct:false },
  fg3: { espnStat:'threePointPct',       label:'3P%', totLabel:'3P%', pct:true  },
  fg:  { espnStat:'fieldGoalPct',        label:'FG%', totLabel:'FG%', pct:true  },
  ft:  { espnStat:'freeThrowPct',        label:'FT%', totLabel:'FT%', pct:true  },
  to:  { espnStat:'turnoversPerGame',    label:'TPG', totLabel:'TO',  pct:false },
  min: { espnStat:'minutesPerGame',      label:'MPG', totLabel:'MIN', pct:false },
};

// ============================================================
// NBA APIからスタッツリーダーを取得（ESPN API使用）
// ============================================================
async function loadESPNLeaders(stat, mode) {
  const list    = document.getElementById('leaderList');
  const loading = document.getElementById('statsLoading');
  if (!list) return;
  list.innerHTML = '';
  if (loading) loading.style.display = 'block';

  try {
    const statInfo   = ESPN_STAT_MAP[stat] || ESPN_STAT_MAP.pts;
    const seasontype = mode === 'playoff' ? 3 : mode === 'playin' ? 5 : 2;

    // ESPN スタッツリーダーAPI
    const url = `https://api.allorigins.win/raw?url=https://site.api.espn.com/apis/site/v2/sports/basketball/nba/leaders?limit=15&season=2025&seasontype=${seasontype}`;
    const res = await fetchWithTimeout(url, {}, 8000);
    if (!res.ok) throw new Error('ESPN Stats ' + res.status);
    const data = await res.json();

    // ESPN APIのレスポンスからスタッツカテゴリを探す
    const categories = data.leaders || [];
    const category   = categories.find(c =>
      c.name === statInfo.espnStat ||
      c.abbreviation?.toLowerCase() === stat.toLowerCase()
    ) || categories[0];

    if (!category || !category.leaders) throw new Error('カテゴリなし');

    if (loading) loading.style.display = 'none';
    const medals = ['🥇','🥈','🥉'];

    list.innerHTML = category.leaders.map((entry, i) => {
      const rank    = i + 1;
      const medal   = rank <= 3 ? medals[i] : rank;
      const athlete = entry.athlete || {};
      const name    = athlete.displayName || '';
      const jaName  = JA_NAME_MAP[name] || '';
      const team    = entry.team?.abbreviation || '';
      const rawVal  = parseFloat(entry.value) || 0;
      const isTop3  = rank <= 3;

      let val = '-';
      if (statInfo.pct) {
        val = (rawVal * 100).toFixed(1) + '%';
      } else {
        val = rawVal.toFixed(1);
      }
      const unitLabel = statInfo.label;
      const espnId    = athlete.id || '';
      const photoUrl  = espnId ? `https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${espnId}.png&w=96&h=70` : '';

      return `<div class="lc${isTop3 ? ' t' + rank : ''}" onclick="openPlayerModalByName('${name.replace(/'/g,"\\'")}','${team}')">
        <div class="lc-rank r${rank <= 3 ? rank : ''}">${medal}</div>
        <div style="width:42px;height:32px;flex-shrink:0;border-radius:5px;overflow:hidden;background:var(--bg3);">
          ${photoUrl
            ? `<img src="${photoUrl}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'">`
            : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:700;color:var(--tx3);">${name.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>`
          }
        </div>
        <div class="lc-info">
          <div class="lc-name">${jaName || name.split(' ').slice(-1)[0]}</div>
          <div class="lc-sub">${name} · ${team}</div>
        </div>
        <div class="lc-val">
          <div class="lc-v${isTop3 ? ' gold' : ''}">${val}</div>
          <div class="lc-u">${unitLabel}</div>
        </div>
      </div>`;
    }).join('');

    console.log('✅ ESPN スタッツ取得成功:', stat, mode);

  } catch(e) {
    console.warn('ESPNスタッツ失敗:', e.message, '→ ダミーデータ');
    if (loading) loading.style.display = 'none';
    showStatFallback(stat);
  }
}

// ダミーデータでスタッツ表示（API失敗時）
function showStatFallback(stat) {
  const list    = document.getElementById('leaderList');
  const data    = STATS[stat] || STATS.pts;
  const medals  = ['🥇','🥈','🥉'];
  list.innerHTML = data.map((p, i) => {
    const rank   = i + 1;
    const isTop3 = rank <= 3;
    return `<div class="lc${isTop3 ? ' t' + rank : ''}">
      <div class="lc-rank r${rank <= 3 ? rank : ''}">${rank <= 3 ? medals[i] : rank}</div>
      <div style="width:42px;height:32px;flex-shrink:0;border-radius:5px;background:var(--bg3);display:flex;align-items:center;justify-content:center;">
        <span style="font-size:.65rem;font-weight:700;color:var(--tx3);">${p.name.slice(0,2)}</span>
      </div>
      <div class="lc-info">
        <div class="lc-name">${p.name}</div>
        <div class="lc-sub">${p.team} · ${p.gp}G</div>
      </div>
      <div class="lc-val">
        <div class="lc-v${isTop3 ? ' gold' : ''}">${p.val}</div>
        <div class="lc-u">${p.unit}</div>
      </div>
    </div>`;
  }).join('');
}

// ============================================================
// 選手モーダルを名前から開く（スタッツページ用）
// ============================================================
async function openPlayerModalByName(name, team) {
  const modal = document.getElementById('playerModal');
  const inner = document.getElementById('playerModalInner');
  if (!modal || !inner) return;
  modal.style.display = 'block';

  inner.innerHTML = `<div style="padding:2rem;text-align:center;color:var(--tx3);">📊 選手データ取得中...</div>`;

  // ESPN IDを探す
  const norm = (s) => (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  let espnId  = ESPNID_MAP[name];
  if (!espnId) {
    const ln = norm(name.split(' ').slice(-1)[0]);
    for (const [key, val] of Object.entries(ESPNID_MAP)) {
      if (norm(key.split(' ').slice(-1)[0]) === ln) { espnId = val; break; }
    }
  }

  const photoUrl = espnId ? ESPN_HEADSHOT(espnId) : ''; // config.js
  renderPlayerModal(inner, name, team, photoUrl, espnId);
}

// 選手モーダルのHTML描画
async function renderPlayerModal(inner, name, team, photoUrl, espnId) {
  const jaName = JA_NAME_MAP[name] || name; // config.js

  inner.innerHTML = `
    <div style="background:linear-gradient(135deg,#0a1628,#1d428a);padding:1rem;position:relative;">
      <button onclick="closePlayerModal()" style="position:absolute;top:.6rem;right:.6rem;background:rgba(255,255,255,.15);border:none;color:#fff;width:30px;height:30px;border-radius:50%;font-size:.8rem;cursor:pointer;">✕</button>
      <div style="display:flex;gap:.8rem;align-items:flex-end;">
        <div style="width:80px;height:64px;border-radius:8px;overflow:hidden;background:rgba(255,255,255,.1);flex-shrink:0;">
          ${photoUrl ? `<img src="${photoUrl}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'">` : ''}
        </div>
        <div>
          <div style="font-size:.65rem;color:rgba(255,255,255,.6);">${jaName}</div>
          <div style="font-size:1.2rem;font-weight:700;color:#fff;line-height:1.2;">${name}</div>
          <div style="font-size:.62rem;color:rgba(255,255,255,.5);margin-top:.2rem;">${team}</div>
        </div>
      </div>
    </div>
    <div id="pm-body" style="padding:.85rem;">
      <div style="text-align:center;padding:2rem;color:var(--tx3);font-size:.75rem;">📊 データ取得中...</div>
    </div>`;

  try {
    const seasons = ['2026','2025','2024'];
    const results = await Promise.all(seasons.map(async yr => {
      const r = await fetchWithTimeout(
        `https://api.server.nbaapi.com/api/playertotals?page=1&pageSize=500&sortBy=points&ascending=false&season=${yr}&isPlayoff=false`,
        {}, 6000
      );
      if (!r.ok) return null;
      const d = await r.json();
      return (d.data || []).find(p => p.playerName === name) || null;
    }));

    const cur = results[0];
    if (!cur) throw new Error('データなし');
    const g   = cur.games || 1;
    const fmt = (v, div = true) => v !== undefined ? (div ? (v / g).toFixed(1) : v) : '-';
    const pct = (v) => v !== undefined ? (v * 100).toFixed(1) + '%' : '-';

    const statsItems = [
      {k:'GP',  v:cur.games},
      {k:'PTS', v:fmt(cur.points)},
      {k:'REB', v:fmt(cur.totalRb)},
      {k:'AST', v:fmt(cur.assists)},
      {k:'STL', v:fmt(cur.steals)},
      {k:'BLK', v:fmt(cur.blocks)},
      {k:'FG%', v:pct(cur.fieldPercent)},
      {k:'3P%', v:pct(cur.threePercent)},
      {k:'FT%', v:pct(cur.ftPercent)},
    ];

    const histRows = results.map((r, i) => {
      if (!r) return '';
      const yr = ['25-26','24-25','23-24'][i];
      const gg = r.games || 1;
      return `<tr style="border-bottom:1px solid var(--bd);${i===0?'background:rgba(255,90,0,.04);':''}">
        <td style="padding:.3rem .4rem;font-weight:700;color:${i===0?'var(--or)':'var(--tx)'};">${yr}</td>
        <td style="padding:.3rem .4rem;color:var(--tx3);text-align:center;">${r.team||''}</td>
        <td style="padding:.3rem .4rem;text-align:center;">${r.games}</td>
        <td style="padding:.3rem .4rem;font-weight:700;text-align:center;">${(r.points/gg).toFixed(1)}</td>
        <td style="padding:.3rem .4rem;text-align:center;">${(r.totalRb/gg).toFixed(1)}</td>
        <td style="padding:.3rem .4rem;text-align:center;">${(r.assists/gg).toFixed(1)}</td>
        <td style="padding:.3rem .4rem;text-align:center;">${r.fieldPercent?(r.fieldPercent*100).toFixed(1)+'%':'-'}</td>
      </tr>`;
    }).join('');

    document.getElementById('pm-body').innerHTML = `
      <div style="font-size:.7rem;font-weight:700;color:var(--tx2);margin-bottom:.5rem;">スタッツ（2025-26）</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.35rem;margin-bottom:.8rem;">
        ${statsItems.map(s => `<div style="background:var(--bg3);border-radius:6px;padding:.45rem .3rem;text-align:center;">
          <div style="font-size:.55rem;color:var(--tx3);margin-bottom:.15rem;">${s.k}</div>
          <div style="font-size:.9rem;font-weight:700;color:var(--tx);">${s.v||'-'}</div>
        </div>`).join('')}
      </div>
      <div style="font-size:.7rem;font-weight:700;color:var(--tx2);margin-bottom:.4rem;">過去シーズン</div>
      <div style="overflow-x:auto;border-radius:6px;border:1px solid var(--bd);">
        <table style="width:100%;border-collapse:collapse;font-size:.62rem;min-width:320px;">
          <thead><tr style="background:var(--bg3);">
            ${['シーズン','チーム','G','PTS','REB','AST','FG%'].map(c=>`<th style="padding:.3rem .2rem;text-align:center;color:var(--tx3);border-bottom:1px solid var(--bd);">${c}</th>`).join('')}
          </tr></thead>
          <tbody>${histRows}</tbody>
        </table>
      </div>`;
  } catch(e) {
    document.getElementById('pm-body').innerHTML = `<div style="color:var(--tx3);font-size:.72rem;text-align:center;padding:2rem;">データ取得に失敗しました</div>`;
  }
}

function closePlayerModal() {
  const modal = document.getElementById('playerModal');
  if (modal) modal.style.display = 'none';
}

// ============================================================
// 順位表 — ESPN APIから取得
// ============================================================
function showConf(btn, conf) {
  document.querySelectorAll('#pg-stats .conf-row:last-of-type .conf-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  curConf = conf;
  renderStandings();
}

async function renderStandings() {
  const wrap = document.getElementById('standingsWrap');
  if (!wrap) return;
  wrap.innerHTML = '<div style="text-align:center;padding:1.5rem;color:var(--tx3);font-size:.75rem;">📊 順位表取得中...</div>';

  try {
    // シーズンタイプをモードに合わせる
    const seasontype = curMode === 'playoff' ? 3 : 2;
    const res = await fetchWithTimeout(
      `https://api.allorigins.win/raw?url=https://site.api.espn.com/apis/v2/sports/basketball/nba/standings?season=2025&seasontype=${seasontype}`,
      {}, 8000
    );
    if (!res.ok) throw new Error('ESPN standings ' + res.status);
    const data = await res.json();

    const groups  = data.children || [];
    const confName = curConf === 'east' ? 'Eastern' : 'Western';
    const group   = groups.find(g => (g.name || '').includes(confName)) || groups[curConf === 'east' ? 0 : 1];
    if (!group) throw new Error('グループなし');

    const standings = group.standings?.entries || [];
    if (!standings.length) throw new Error('データなし');

    let h = `<div class="sw">
      <div class="sw-head">
        <div class="sw-cn">チーム</div>
        <div class="sw-c">W</div>
        <div class="sw-c">L</div>
        <div class="sw-c">PCT</div>
        <div class="sw-c">GB</div>
      </div>`;

    standings.forEach((entry, i) => {
      const team  = entry.team || {};
      const abbr  = (team.abbreviation || '').toUpperCase();
      const stats = entry.stats || [];
      const getStat = (name) => stats.find(s => s.name === name)?.value ?? '-';
      const w    = getStat('wins');
      const l    = getStat('losses');
      const pct  = getStat('winPercent');
      const gb   = getStat('gamesBehind');
      const hw   = getStat('homeWins');
      const hl   = getStat('homeLosses');
      const aw   = getStat('awayWins');
      const al   = getStat('awayLosses');
      const rank = i + 1;

      // プレーオフ圏内判定
      const badge = rank <= 6 ? 'po' : rank <= 10 ? 'pi' : '';
      const cls   = badge === 'po' ? 'sw-row po' : badge === 'pi' ? 'sw-row pi' : 'sw-row';
      const cdnId = TEAM_CDN_IDS[abbr] || '';
      const logo  = cdnId
        ? `<img src="${NBA_CDN_LOGO(cdnId)}" style="width:22px;height:22px;object-fit:contain;" onerror="this.style.display='none'">`
        : `<span style="font-size:.9rem;">🏀</span>`;
      const pctDisp = typeof pct === 'number' ? pct.toFixed(3).replace(/^0/, '') : '-';
      const gbDisp  = gb === 0 ? '-' : (typeof gb === 'number' ? gb.toFixed(1) : gb);

      // ホーム/アウェイ成績をサブテキストで表示
      const recordSub = (hw !== '-' && aw !== '-')
        ? `<div style="font-size:.44rem;color:var(--tx3);">H:${hw}-${hl} A:${aw}-${al}</div>` : '';

      h += `<div class="${cls}">
        <div class="sw-rk">${rank}</div>
        <div class="sw-tm">
          <div class="sw-logo">${logo}</div>
          <div>
            <div class="sw-abbr">${abbr}${badge ? ` <span class="sw-badge b${badge}">${badge.toUpperCase()}</span>` : ''}</div>
            ${recordSub}
          </div>
        </div>
        <div class="sw-n hi">${w}</div>
        <div class="sw-n">${l}</div>
        <div class="sw-n">${pctDisp}</div>
        <div class="sw-n">${gbDisp}</div>
      </div>`;
      if (i === 5) h += `<div class="sw-div1"></div>`;
      if (i === 9) h += `<div class="sw-div2"></div>`;
    });

    h += '</div>';
    wrap.innerHTML = h;
    console.log('✅ ESPN順位表取得成功');

  } catch(e) {
    console.warn('ESPN順位表失敗、ダミーデータ:', e.message);
    _renderDummyStandings();
  }
}

// ダミー順位表（API失敗時）
function _renderDummyStandings() {
  const wrap = document.getElementById('standingsWrap');
  if (!wrap) return;
  const data = STANDINGS[curConf];
  let h = `<div class="sw">
    <div class="sw-head">
      <div class="sw-cn">チーム</div>
      <div class="sw-c">W</div><div class="sw-c">L</div>
      <div class="sw-c">PCT</div><div class="sw-c">GB</div>
    </div>`;
  data.forEach((t, i) => {
    const cls   = t.badge === 'po' ? 'sw-row po' : t.badge === 'pi' ? 'sw-row pi' : 'sw-row';
    const cdnId = TEAM_CDN_IDS[t.abbr] || '';
    const logo  = cdnId ? `<img src="${NBA_CDN_LOGO(cdnId)}" style="width:22px;height:22px;object-fit:contain;" onerror="this.outerHTML='<span style=\\'font-size:.9rem;\\'>${t.logo}</span>'">` : `<span style="font-size:.9rem;">${t.logo}</span>`;
    h += `<div class="${cls}">
      <div class="sw-rk">${t.r}</div>
      <div class="sw-tm"><div class="sw-logo">${logo}</div><div class="sw-abbr">${t.abbr}${t.badge ? ` <span class="sw-badge b${t.badge}">${t.badge.toUpperCase()}</span>` : ''}</div></div>
      <div class="sw-n hi">${t.w}</div><div class="sw-n">${t.l}</div>
      <div class="sw-n">${t.pct.toFixed(3).slice(1)}</div><div class="sw-n">${t.gb}</div>
    </div>`;
    if (i === 5) h += `<div class="sw-div1"></div>`;
    if (i === 9) h += `<div class="sw-div2"></div>`;
  });
  h += '</div>';
  wrap.innerHTML = h;
}

// ============================================================
// 起動処理
// ============================================================
initStats();
// ============================================================
