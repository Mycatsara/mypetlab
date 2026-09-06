// 상단 머리(로고·메뉴) 공용 조각을 페이지에 심는다. 홈(index.html)은 직접 쓰고, 나머지 페이지는 이 도구로 넣는다.
// 사용: node tools/sitehead.js guide/index.html age/index.html ...   (이미 들어 있는 파일은 건너뛴다)
// 조각을 고치면 여기만 고치고, 들어간 파일은 --force 로 다시 심는다.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const CSS = `  /* 상단 머리(로고·메뉴) — 홈·가이드·계산기·소개 공용. 원본: tools/sitehead.js */
  .site{border-bottom:1.5px solid var(--orange);margin-bottom:26px}
  .site .title{display:inline-flex;align-items:center;gap:6px;font-size:30px;font-weight:900;letter-spacing:-1px;line-height:1.2;color:var(--ink);text-decoration:none}
  .site .title::after{content:"";display:inline-block;width:30px;height:28px;margin-bottom:-3px;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 38'%3E%3Cg fill='%23E07A3F'%3E%3Ccircle cx='9' cy='15' r='4.4'/%3E%3Ccircle cx='17' cy='8' r='4.4'/%3E%3Ccircle cx='26' cy='8' r='4.4'/%3E%3Ccircle cx='33' cy='15' r='4.4'/%3E%3Cellipse cx='21' cy='27' rx='10.5' ry='8.5'/%3E%3C/g%3E%3C/svg%3E") no-repeat center/contain}
  .site .desc{font-size:13px;color:var(--sub);margin-top:2px}
  .site nav.menu{display:flex;flex-wrap:wrap;margin-top:6px}
  .site nav.menu a{color:var(--ink);font-size:14.5px;font-weight:700;line-height:46px;padding:0 13px;text-decoration:none;transition:color .15s,box-shadow .15s}
  .site nav.menu a:first-child{padding-left:0}
  .site nav.menu a.on,.site nav.menu a:hover{color:var(--orange-deep);box-shadow:inset 0 -2px 0 var(--orange)}
  @media (max-width:480px){
    .site .title{font-size:26px}
    .site .title::after{width:26px;height:24px}
    .site nav.menu a{font-size:13.5px;padding:0 9px;line-height:42px}
  }
`;

const MENU = [
  ['/', '홈'],
  ['/guide/', '가이드'],
  ['/age/', '나이 계산기'],
  ['/feed/', '사료 계산기'],
  ['/about.html', '소개'],
];

// 파일 경로 → 현재 메뉴 항목
function current(file) {
  const f = file.replace(/\\/g, '/');
  if (f === 'index.html') return '/';
  if (f.startsWith('guide/')) return '/guide/';
  if (f.startsWith('age/')) return '/age/';
  if (f.startsWith('feed/')) return '/feed/';
  if (f === 'about.html') return '/about.html';
  return '';
}

function html(file) {
  const on = current(file);
  const items = MENU.map(([href, label]) => `<a href="${href}"${href === on ? ' class="on"' : ''}>${label}</a>`).join('');
  return `  <header class="site">
    <a class="title" href="/">마이펫랩</a>
    <p class="desc">우리 아이 돌봄 계산기</p>
    <nav class="menu">${items}</nav>
  </header>
`;
}

function inject(file, force) {
  const abs = path.join(ROOT, file);
  let s = fs.readFileSync(abs, 'utf8');
  const has = s.includes('<header class="site">');
  if (has && !force) { console.log(`건너뜀(이미 있음): ${file}`); return false; }
  if (has) {
    s = s.replace(/  \/\* 상단 머리\(로고·메뉴\)[\s\S]*?\n  }\n/, '');
    s = s.replace(/  <header class="site">[\s\S]*?<\/header>\n/, '');
  }
  if (!s.includes('</style>')) throw new Error(`${file}: </style> 없음`);
  s = s.replace('</style>', `${CSS}</style>`);
  // 예전 "← 마이펫랩 홈" 링크(계산기 .home-link / 소개 .back)는 메뉴가 대신하므로 뺀다
  s = s.replace(/  <a class="(?:home-link|back)" href="[^"]*">← 마이펫랩 홈<\/a>\n\n?/, '');
  const m = s.match(/<div class="wrap">\n\n?/);
  if (!m) throw new Error(`${file}: <div class="wrap"> 없음`);
  s = s.replace(m[0], `${m[0]}${html(file)}\n`);
  fs.writeFileSync(abs, s, 'utf8');
  console.log(`심음: ${file}`);
  return true;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const files = args.filter((a) => a !== '--force');
  if (!files.length) { console.log('사용법: node tools/sitehead.js <파일...> [--force]'); process.exit(1); }
  files.forEach((f) => inject(f, force));
}
module.exports = { inject, CSS, html };
