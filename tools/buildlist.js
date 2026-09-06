// 글 목록 자동 생성 — tools/posts.json 하나만 고치면 아래 세 곳이 한 번에 갱신된다.
//   1) guide/index.html : 태그 칩 + 전체 편수 + 글 카드 목록(번호 포함)
//   2) index.html(홈)    : 최신 N편 카드 그리드(썸네일) + "가이드 전체 N편 보기" + 사이드바 태그 칩
//   3) guide/<글>.html   : 글 하단 "이어서 읽으면 좋은 글" 3편 (CTA 앞)
// 사용: node tools/buildlist.js
// 규칙: 자동 생성 구간은 <!-- AUTO:XXX:START --> ~ <!-- AUTO:XXX:END --> 사이만 바뀐다. 그 밖은 손대지 않는다.

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const CFG = {
  cardArrowClass: 'go',            // 카드 하단 링크 클래스 (mypetlab: .go)
  cardArrowText: '읽어보기 →',
  homeMax: 6,                       // 홈에 노출할 글 수 (2열 카드 × 3행)
  nextMax: 3,                       // 글 하단 관련 글 수
  nextHeading: '이어서 읽으면 좋은 글',
  moreText: (n) => `가이드 전체 ${n}편 보기 →`,
  countText: (n) => `전체 ${n}편`,
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const num = (i) => String(i + 1).padStart(2, '0');

function read(f) { return fs.readFileSync(path.join(ROOT, f), 'utf8'); }
function write(f, s) { fs.writeFileSync(path.join(ROOT, f), s, 'utf8'); }

function fill(file, name, inner) {
  const s = read(file);
  const re = new RegExp(`(<!-- AUTO:${name}:START -->)[\\s\\S]*?(<!-- AUTO:${name}:END -->)`);
  if (!re.test(s)) { throw new Error(`${file}: AUTO:${name} 마커가 없습니다`); }
  const next = s.replace(re, `$1\n${inner}\n$2`);
  if (next === s) return false;
  write(file, next);
  return true;
}

// ---------- 데이터 ----------
const data = JSON.parse(read('tools/posts.json'));
const posts = data.posts;

// 검증: posts.json ↔ 실제 파일
const files = fs.readdirSync(path.join(ROOT, 'guide'))
  .filter((f) => f.endsWith('.html') && f !== 'index.html')
  .map((f) => f.replace('.html', ''));
const slugs = posts.map((p) => p.slug);
const missing = slugs.filter((s) => !files.includes(s));
const orphan = files.filter((f) => !slugs.includes(f));
if (missing.length) { console.error('오류: posts.json에 있으나 파일이 없음 →', missing.join(', ')); process.exit(1); }
if (orphan.length) { console.error('오류: 파일은 있으나 posts.json에 없음 →', orphan.join(', ')); process.exit(1); }
const dupe = slugs.filter((s, i) => slugs.indexOf(s) !== i);
if (dupe.length) { console.error('오류: posts.json 슬러그 중복 →', dupe.join(', ')); process.exit(1); }

// ---------- 조각 ----------
const listItem = (p, i) => `        <li><a href="/guide/${p.slug}.html"><span class="n">${num(i)}</span><span class="t">${esc(p.short || p.title)}</span><span class="g">→</span></a></li>`;

const card = (p, i) => `      <a class="post-card" href="/guide/${p.slug}.html" data-tag="${esc(p.tag)}" data-text="${esc((p.title + ' ' + p.summary + ' ' + p.tag).replace(/\s+/g, ' '))}">
        <span class="num">${num(i)}</span><span class="tag">${esc(p.tag)}</span>
        <h2>${esc(p.title)}</h2>
        <p>${esc(p.summary)}</p>
        <span class="${CFG.cardArrowClass}">${CFG.cardArrowText}</span>
      </a>`;

// 관련 글: 같은 태그 우선 → 나머지 최신순으로 채움
function related(p) {
  const byS = (s) => posts.find((x) => x.slug === s);
  const picked = (p.related || []).map(byS).filter((x) => x && x.slug !== p.slug);
  const others = posts.filter((x) => x.slug !== p.slug && !picked.includes(x));
  const same = others.filter((x) => x.tag === p.tag);
  const rest = others.filter((x) => x.tag !== p.tag);
  return [...picked, ...same, ...rest].slice(0, CFG.nextMax);
}

// ---------- 1) 가이드 목록 ----------
const usedTags = data.tags.filter((t) => posts.some((p) => p.tag === t));
const chips = ['        <button class="chip on" type="button" data-tag="">전체</button>']
  .concat(usedTags.map((t) => `        <button class="chip" type="button" data-tag="${esc(t)}">${esc(t)}</button>`))
  .join('\n');

let changed = 0;
if (fill('guide/index.html', 'CHIPS', chips)) changed++;
if (fill('guide/index.html', 'COUNT', `  <p class=\"count\" id=\"count\">${CFG.countText(posts.length)}</p>`)) changed++;
if (fill('guide/index.html', 'LIST', posts.map(card).join('\n'))) changed++;

// ---------- 2) 홈 ----------
// 카드 썸네일은 img/<슬러그>-hero.webp 가 있을 때만 붙는다 (posts.json에 따로 적지 않는다)
const heroOf = (p) => (fs.existsSync(path.join(ROOT, 'img', `${p.slug}-hero.webp`)) ? `/img/${p.slug}-hero.webp` : '');
const kdate = (d) => { const [y, m, dd] = d.split('-').map(Number); return `${y}년 ${m}월 ${dd}일`; };
const homeCard = (p) => {
  const img = heroOf(p);
  return `        <a class="post-card" href="/guide/${p.slug}.html">
${img ? `          <img class="thumb" src="${img}" alt="" width="1200" height="686" loading="lazy" decoding="async">\n` : ''}          <span class="tag">${esc(p.tag)}</span>
          <h3>${esc(p.short || p.title)}</h3>
          <p>${esc(p.summary)}</p>
          <span class="foot"><span class="date">${kdate(p.date)}</span><span class="${CFG.cardArrowClass}">${CFG.cardArrowText}</span></span>
        </a>`;
};
const home = `        <div class="grid">
${posts.slice(0, CFG.homeMax).map(homeCard).join('\n')}
        </div>
        <a class="rel-more" href="/guide/">${CFG.moreText(posts.length)}</a>`;
if (fill('index.html', 'HOME', home)) changed++;

// 홈 사이드바 "주제별 가이드" 칩 — 가이드 목록의 해시 필터(/guide/#태그)로 연결
const tagLinks = `          <div class="tag-list">
${usedTags.map((t) => `            <a href="/guide/#${encodeURIComponent(t)}">${esc(t)}</a>`).join('\n')}
          </div>`;
if (fill('index.html', 'TAGS', tagLinks)) changed++;

// ---------- 3) 각 글의 관련 글 ----------
for (const p of posts) {
  const items = related(p).map(listItem).join('\n');
  const block = `    <div class="next-read">
      <h2>${CFG.nextHeading}</h2>
      <ol class="post-list">
${items}
      </ol>
    </div>`;
  if (fill(`guide/${p.slug}.html`, 'NEXT', block)) changed++;
}

console.log(`글 ${posts.length}편 · 태그 ${usedTags.length}개 · 갱신된 파일 ${changed}개`);
