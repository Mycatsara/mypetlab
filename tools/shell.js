// 페이지 골격(공용 site.css 링크 + 상단 머리 + 모바일 계산기 줄 + 2단 레이아웃 + 사이드바 자리)을 심는다.
// 메뉴·계산기·사이드바 내용은 마커만 두고 tools/buildlist.js 가 채운다.
// 사용: node tools/shell.js guide/새글.html [파일...]   (이미 들어 있는 파일은 건너뛴다)
// 새 글은 /publish 3단계에서 최근 글을 복사하므로 골격이 이미 들어 있다 — 이 도구는 골격 없는 옛 페이지·새 유형 페이지용.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const CSSV = '20260906'; // buildlist.js CFG.cssVersion 과 맞춘다

const HEAD = `<header class="site"><div class="in">
  <a class="title" href="/">마이펫랩</a>
  <p class="desc">우리 아이 돌봄 계산기</p>
  <nav class="menu" aria-label="주요 메뉴">
<!-- AUTO:NAV:START -->
<!-- AUTO:NAV:END -->
  </nav>
</div></header>
<div class="calc-strip">
<!-- AUTO:CALCS:START -->
<!-- AUTO:CALCS:END -->
</div>
<div class="layout">
<main class="main">
`;
const TAIL = `</main>
<aside class="side">
<!-- AUTO:SIDE:START -->
<!-- AUTO:SIDE:END -->
</aside>
</div>
`;

function inject(file) {
  const abs = path.join(ROOT, file);
  let s = fs.readFileSync(abs, 'utf8');
  if (s.includes('<!-- AUTO:SIDE:START -->')) { console.log(`건너뜀(이미 있음): ${file}`); return false; }

  // 9/6 오전에 심었던 옛 머리(tools/sitehead.js 판) 제거
  s = s.replace(/  \/\* 상단 머리\(로고·메뉴\)[\s\S]*?\n  }\n/, '');
  s = s.replace(/  <header class="site">[\s\S]*?<\/header>\n\n?/, '');
  // 예전 "← 마이펫랩 홈" 링크는 메뉴가 대신한다
  s = s.replace(/  <a class="(?:home-link|back)" href="[^"]*">← 마이펫랩 홈<\/a>\n\n?/, '');

  if (!s.includes('/site.css')) {
    if (!s.includes('<style>')) throw new Error(`${file}: <style> 없음`);
    s = s.replace('<style>', `<link rel="stylesheet" href="/site.css?v=${CSSV}">\n<style>`);
  }
  const open = s.match(/<body>\n<div class="wrap">\n/);
  if (!open) throw new Error(`${file}: <body>\\n<div class="wrap"> 골격이 아님`);
  s = s.replace(open[0], `<body>\n${HEAD}<div class="wrap">\n`);

  // 푸터를 .wrap 밖(전체 폭)으로 꺼내고 사이드바 자리를 붙인다
  const foot = s.match(/\n  <footer>[\s\S]*?<\/footer>\n<\/div>\n/);
  if (!foot) throw new Error(`${file}: <footer>…</footer>\\n</div> 골격이 아님`);
  const footer = foot[0].replace(/^\n/, '').replace(/<\/div>\n$/, '').replace(/^  /gm, '');
  s = s.replace(foot[0], `\n</div>\n${TAIL}${footer}`);

  // 사이드바·계산기 줄 클릭도 GA 내부 링크로 잡는다
  s = s.replace(/if\(a\.closest\('\.cta,\.rel-card,\.post-card,\.post-list,\.card(?:,\.tool-card)?'\)\)\{gtag\('event','internal_link',\{link_url:h,link_text:t,page_path:location\.pathname\}\);\}/,
    "var area=a.closest('.calc-strip')?'strip':a.closest('.side')?'side':a.closest('.cta,.rel-card,.post-card,.post-list,.card,.tool-card')?'body':'';if(area){gtag('event','internal_link',{link_url:h,link_text:t,link_area:area,page_path:location.pathname});}");

  fs.writeFileSync(abs, s, 'utf8');
  console.log(`심음: ${file}`);
  return true;
}

if (require.main === module) {
  const files = process.argv.slice(2);
  if (!files.length) { console.log('사용법: node tools/shell.js <파일...>'); process.exit(1); }
  files.forEach((f) => inject(f));
}
module.exports = { inject };
