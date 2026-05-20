const ESPNID_MAP = {};
// data.js — 定数・API設定・固定データ（チーム・選手・試合）
// 読み込み順: data.js → utils.js → app.js → 各機能JS

// ============================================================
// config.js — 定数・API設定
// ここだけ変えれば全ファイルに反映される
// ============================================================

// ---------- Firebase ----------
const FB_URL = 'https://mentality-nba-default-rtdb.firebaseio.com';

// ---------- ESPN API ----------
const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba';
const ESPN_SCOREBOARD = `${ESPN_BASE}/scoreboard`;
const ESPN_STANDINGS  = `${ESPN_BASE}/standings`;

// ---------- NBA API ----------
const NBA_API_BASE = 'https://api.server.nbaapi.com/api';

// ---------- NBA CDN ----------
const NBA_CDN_LOGO    = (id)  => `https://cdn.nba.com/logos/nba/${id}/global/L/logo.svg`;
const NBA_CDN_HEADSHOT= (id)  => `https://cdn.nba.com/headshots/nba/latest/1040x760/${id}.png`;
const ESPN_HEADSHOT   = (id)  => `https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${id}.png&w=96&h=70&cb=1`;

// ---------- サイト設定 ----------
const SITE_NAME    = 'MENTALITY';
const SITE_VERSION = '2.0.0';
const POLL_INTERVAL_MS = 30000; // スコア自動更新（30秒）
const CHAT_POLL_MS     = 5000;  // チャット自動更新（5秒）

// ---------- チームCDN ID ----------
const TEAM_CDN_IDS = {
  ATL:1610612737, BOS:1610612738, BKN:1610612751, CHA:1610612766,
  CHI:1610612741, CLE:1610612739, DAL:1610612742, DEN:1610612743,
  DET:1610612765, GSW:1610612744, HOU:1610612745, IND:1610612754,
  LAC:1610612746, LAL:1610612747, MEM:1610612763, MIA:1610612748,
  MIL:1610612749, MIN:1610612750, NOP:1610612740, NYK:1610612752,
  OKC:1610612760, ORL:1610612753, PHI:1610612755, PHX:1610612756,
  POR:1610612757, SAC:1610612758, SAS:1610612759, TOR:1610612761,
  UTA:1610612762, WAS:1610612764,
};

// ---------- 選手名 日本語マッピング ----------
const JA_NAME_MAP = {
  'LeBron James'            : 'レブロン・ジェームズ',
  'Stephen Curry'           : 'ステフィン・カリー',
  'Kevin Durant'            : 'ケビン・デュラント',
  'Giannis Antetokounmpo'   : 'ヤニス・アデトクンボ',
  'Luka Doncic'             : 'ルカ・ドンチッチ',
  'Nikola Jokic'            : 'ニコラ・ヨキッチ',
  'Joel Embiid'             : 'ジョエル・エンビード',
  'Jayson Tatum'            : 'ジェイソン・テイタム',
  'Damian Lillard'          : 'デイミアン・リラード',
  'Ja Morant'               : 'ジャ・モラント',
  'Anthony Davis'           : 'アンソニー・デイビス',
  'Kawhi Leonard'           : 'カワイ・レナード',
  'Devin Booker'            : 'デビン・ブッカー',
  'Donovan Mitchell'        : 'ドノバン・ミッチェル',
  'Trae Young'              : 'トレイ・ヤング',
  'Anthony Edwards'         : 'アンソニー・エドワーズ',
  'Tyrese Haliburton'       : 'タイリース・ハリバートン',
  'Shai Gilgeous-Alexander' : 'SGA',
  'James Harden'            : 'ジェームズ・ハーデン',
  'Kyrie Irving'            : 'カイリー・アービング',
  'Draymond Green'          : 'ドレイモンド・グリーン',
  'Klay Thompson'           : 'クレイ・トンプソン',
  'Bam Adebayo'             : 'バム・アデバヨ',
  'Jimmy Butler'            : 'ジミー・バトラー',
  'Karl-Anthony Towns'      : 'カール・アンソニー・タウンズ',
  'Jaylen Brown'            : 'ジェイレン・ブラウン',
  'Cade Cunningham'         : 'ケイド・カニングハム',
  'Evan Mobley'             : 'エバン・モブリー',
  'Darius Garland'          : 'ダリアス・ガーランド',
  "De'Aaron Fox"            : 'ダアロン・フォックス',
  'Domantas Sabonis'        : 'ドマンタス・サボニス',
  'Jaren Jackson Jr.'       : 'ジャレン・ジャクソンJr.',
  'Victor Wembanyama'       : 'ウェンバンヤマ',
  'Yuki Kawamura'           : '河村 勇輝',
  'Rui Hachimura'           : '八村 塁',
  'Tyrese Maxey'            : 'タイリース・マクシー',
  'Jalen Brunson'           : 'ジェイレン・ブランソン',
  'Julius Randle'           : 'ジュリアス・ランドル',
  'OG Anunoby'              : 'OGアヌノビー',
  'Paolo Banchero'          : 'パオロ・バンケロ',
  'Franz Wagner'            : 'フランツ・ワグナー',
  'Scottie Barnes'          : 'スコッティ・バーンズ',
  'Jamal Murray'            : 'ジャマール・マレー',
  'Nikola Jokić'            : 'ニコラ・ヨキッチ',
  'Luka Dončić'             : 'ルカ・ドンチッチ',
  'Jalen Johnson'           : 'ジェイレン・ジョンソン',
  'Stephon Castle'          : 'ステフォン・キャッスル',
  'Isaiah Collier'          : 'アイザイア・コリアー',
  'LaMelo Ball'             : 'ラメロ・ボール',
  'Alperen Sengun'          : 'アルペレン・シェングン',
  'Zach LaVine'             : 'ザック・ラビーン',
  'Desmond Bane'            : 'デズモンド・ベイン',
  'Brandon Ingram'          : 'ブランドン・インガム',
  'Dejounte Murray'         : 'デジョンテ・マレー',
  'Mikal Bridges'           : 'ミカル・ブリッジズ',
  'Josh Hart'               : 'ジョシュ・ハート',
  'Jrue Holiday'            : 'ジュー・ホリデー',
  'Khris Middleton'         : 'クリス・ミドルトン',
  'Brook Lopez'             : 'ブルック・ロペス',
  'Rudy Gobert'             : 'ルディ・ゴベア',
  'Karl-Anthony Towns'      : 'KAT',
  'Mike Conley'             : 'マイク・コンリー',
  'Chris Paul'              : 'クリス・ポール',
  'Russell Westbrook'       : 'ラッセル・ウェストブルック',
  'Paul George'             : 'ポール・ジョージ',
  'Tobias Harris'           : 'トバイアス・ハリス',
  'Gordon Hayward'          : 'ゴードン・ヘイワード',
  'Buddy Hield'             : 'バディ・ヒールド',
  'Tim Hardaway Jr.'        : 'ティム・ハーダウェイJr.',
  'Marcus Smart'            : 'マーカス・スマート',
  'Derrick White'           : 'デリック・ホワイト',
  'Al Horford'              : 'アル・ホーフォード',
  'Robert Williams'         : 'ロバート・ウィリアムズ',
  'Grant Williams'          : 'グラント・ウィリアムズ',
  'Precious Achiuwa'        : 'プレシャス・アチウワ',
  'Immanuel Quickley'       : 'イマニュエル・クイックリー',
  'Obi Toppin'              : 'オビ・トッピン',
  'Quentin Grimes'          : 'クエンティン・グライムス',
  'RJ Barrett'              : 'RJバレット',
  'Cam Thomas'              : 'カム・トーマス',
  'Ben Simmons'             : 'ベン・シモンズ',
  'Nic Claxton'             : 'ニック・クラクストン',
  'Royce O'Neale'          : 'ロイス・オニール',
  'Dennis Schroder'         : 'デニス・シュルーダー',
  'Spencer Dinwiddie'       : 'スペンサー・ディンウィディ',
  'Lonzo Ball'              : 'ロンゾ・ボール',
  'Zion Williamson'         : 'ザイオン・ウィリアムソン',
  'Brandon Clarke'          : 'ブランドン・クラーク',
  'Steven Adams'            : 'スティーブン・アダムス',
  'Saddiq Bey'              : 'サディク・ベイ',
  'Bojan Bogdanovic'        : 'ボヤン・ボグダノビッチ',
  'Serge Ibaka'             : 'セルジュ・イバカ',
  'Nikola Vucevic'          : 'ニコラ・ブチェビッチ',
  'DeMar DeRozan'           : 'デマー・デローザン',
  'Zach Collins'            : 'ザック・コリンズ',
  'Keldon Johnson'          : 'ケルドン・ジョンソン',
  'Devin Vassell'           : 'デビン・ヴァッセル',
  'Josh Giddey'             : 'ジョシュ・ギデイ',
  'Luguentz Dort'           : 'ルーゲンツ・ドート',
  'Isaiah Joe'              : 'アイザイア・ジョー',
  'Chet Holmgren'           : 'チェット・ホルムグレン',
  'Jalen Williams'          : 'ジェイレン・ウィリアムズ',
  'Aaron Wiggins'           : 'アーロン・ウィギンズ',
  'Tre Mann'                : 'トレ・マン',
  'Andrew Nembhard'         : 'アンドリュー・ネンバード',
  'Bennedict Mathurin'      : 'ベネジクト・マチュリン',
  'Aaron Nesmith'           : 'アーロン・ネスミス',
  'T.J. McConnell'          : 'TJマクコネル',
  'Myles Turner'            : 'マイルズ・ターナー',
  'Pascal Siakam'           : 'パスカル・シアカム',
  'Obi Toppin'              : 'オビ・トッピン',
  'James Wiseman'           : 'ジェームズ・ワイズマン',
  'Jonathan Kuminga'        : 'ジョナサン・クミンガ',
  'Moses Moody'             : 'モーゼス・ムーディ',
  'Jordan Poole'            : 'ジョーダン・プール',
  'Gary Payton II'          : 'ゲイリー・ペイトンII',
  'Andrew Wiggins'          : 'アンドリュー・ウィギンズ',
  'Kevon Looney'            : 'ケボン・ルーニー',
  'Donte DiVincenzo'        : 'ドンテ・ディビンセンゾ',
  'Isaiah Hartenstein'      : 'アイザイア・ハーテンシュタイン',
  'OG Anunoby'              : 'OGアヌノビー',
  'Evan Fournier'           : 'エバン・フルニエ',
  'Kevin Knox'              : 'ケビン・ノックス',
  'Kemba Walker'            : 'ケンバ・ウォーカー',
  'Elfrid Payton'           : 'エルフリッド・ペイトン',
  'Nerlens Noel'            : 'ネルレンス・ノエル',
  'Taj Gibson'              : 'タジ・ギブソン',
  'Alec Burks'              : 'アレック・バークス',
  'Derrick Rose'            : 'デリック・ローズ',
};

// ---------- チャット内 広告データ ----------
const TEAM_ADS = {
  lal: { img:'👟', tag:'選手着用バッシュ', title:'ナイキ レブロン22 LALカラー',    old:'¥24,200', price:'¥19,360', url:'https://amzn.to/lebron-shoe' },
  gsw: { img:'👟', tag:'選手着用バッシュ', title:'アンダーアーマー カリー12 GS',   old:'¥22,000', price:'¥18,700', url:'https://amzn.to/curry-shoe'  },
  bos: { img:'🏀', tag:'チームグッズ',     title:'セルティックス ユニフォーム #0', old:'¥18,000', price:'¥14,400', url:'https://amzn.to/celtics'     },
  nyk: { img:'🏀', tag:'チームグッズ',     title:'ニックス ユニフォーム #11',       old:'¥18,000', price:'¥14,400', url:'https://amzn.to/knicks'      },
  default: { img:'🎮', tag:'NBA2K26',      title:'NBA 2K26 PS5版 予約受付中',       old:'¥8,980',  price:'¥7,480',  url:'https://amzn.to/nba2k26'    },
};

// ---------- ダミー試合データ（APIフォールバック用） ----------
const GAMES_DUMMY = {
  '-2':[ { id:'d2a', status:'final',
    home:{ abbr:'MIL', city:'MILWAUKEE',     score:118 },
    away:{ abbr:'IND', city:'INDIANA',       score:112 },
    qh:[28,34,28,28], qa:[26,28,30,28],
    note:'ヤニス38得点の怪物パフォ', plays:[], hpl:[], apl:[] } ],
  '-1':[ { id:'d1a', status:'final',
    home:{ abbr:'MIN', city:'MINNESOTA',     score:122 },
    away:{ abbr:'UTA', city:'UTAH',          score:97  },
    qh:[30,32,30,30], qa:[24,24,25,24],
    note:'ミネソタ圧勝25点差', plays:[], hpl:[], apl:[] } ],
  '0':  [
    { id:'t0', status:'live', timeLeft:263, q:'Q3',
      home:{ abbr:'LAL', city:'LOS ANGELES',   score:89 },
      away:{ abbr:'GSW', city:'GOLDEN STATE',  score:84 },
      qh:[28,31,30], qa:[24,29,31],
      note:'河村12得点6AS🔥',
      plays:[
        { q:'Q3', t:'4:23', txt:'<strong>河村 勇輝</strong> ドライブレイアップ！12得点目🔥', s:true,  sc:'89-84' },
        { q:'Q3', t:'5:41', txt:'<strong>カリー</strong> コーナー3P！GSW3点差に迫る',         s:true,  sc:'87-84' },
      ],
      hpl:[ { num:8,  name:'河村 勇輝', pos:'PG', pts:12, ast:6, reb:2,  pm:'+8', on:true,  hot:true  },
            { num:23, name:'LeBron',    pos:'SF', pts:22, ast:8, reb:7,  pm:'+5', on:true,  hot:false },
            { num:3,  name:'A.Davis',   pos:'C',  pts:18, ast:2, reb:11, pm:'+3', on:true,  hot:false } ],
      apl:[ { num:30, name:'Curry',     pos:'PG', pts:28, ast:5, reb:3,  pm:'-2', on:true,  hot:true  },
            { num:11, name:'Thompson',  pos:'SG', pts:14, ast:1, reb:4,  pm:'-4', on:true,  hot:false } ] },
    { id:'t1', status:'pre', startTime:'12:00',
      home:{ abbr:'BOS', city:'BOSTON',        score:0 },
      away:{ abbr:'NYK', city:'NEW YORK',      score:0 },
      note:'テイタムvsブランソン', plays:[], hpl:[], apl:[] },
  ],
  '1':  [ { id:'m0', status:'pre', startTime:'10:00',
    home:{ abbr:'ATL', city:'ATLANTA',       score:0 },
    away:{ abbr:'ORL', city:'ORLANDO',       score:0 },
    note:'イースト8位争い', plays:[], hpl:[], apl:[] } ],
};
// ============================================================
