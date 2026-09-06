// 사이트 골격 검사 — 카테고리 페이지·마커·site.css·필수 태그·sitemap·내부 링크·buildlist 멱등
// 실행: node --test tools/test/shell.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..', '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const data = JSON.parse(read('tools/posts.json'));

function pages() {
  const out = [];
  for (const d of ['.', 'guide', 'age', 'feed', ...data.cats.map((c) => `guide/${c.slug}`)]) {
    for (const f of fs.readdirSync(path.join(ROOT, d))) if (f.endsWith('.html')) out.push(d === '.' ? f : `${d}/${f}`);
  }
  return out;
}

test('posts.json: cats 3~4개, 글마다 cat 하나, 옛 tag 없음', () => {
  assert.ok(data.cats.length >= 3 && data.cats.length <= 4, `카테고리 ${data.cats.length}개`);
  for (const p of data.posts) {
    assert.ok(data.cats.some((c) => c.slug === p.cat), `${p.slug}: cat "${p.cat}" 없음`);
    assert.strictEqual(p.tag, undefined, `${p.slug}: 옛 tag 필드 남음`);
  }
});

test('카테고리 페이지가 있고 canonical·설명·편수가 맞다', () => {
  for (const c of data.cats) {
    const f = `guide/${c.slug}/index.html`;
    assert.ok(fs.existsSync(path.join(ROOT, f)), `${f} 없음`);
    const s = read(f);
    const n = data.posts.filter((p) => p.cat === c.slug).length;
    assert.ok(s.includes(`href="https://mypetlab.kr/guide/${c.slug}/"`), `${f}: canonical`);
    assert.ok(s.includes(`· 전체 ${n}편</p>`), `${f}: 편수 ${n} 표시`);
    assert.ok(s.includes(c.desc), `${f}: 설명`);
  }
});

test('모든 페이지에 골격(site.css·NAV·CALCS·SIDE)과 필수 태그(애드센스·GA)가 있다', () => {
  for (const f of pages()) {
    const s = read(f);
    for (const k of ['/site.css', 'AUTO:NAV:START', 'AUTO:CALCS:START', 'AUTO:SIDE:START', 'ca-pub-4428587485814712', 'G-K3SMLQRKGM']) {
      assert.ok(s.includes(k), `${f}: ${k} 없음`);
    }
  }
});

test('사이드바·메뉴 편수가 실제 글 수와 같다', () => {
  const s = read('index.html');
  for (const c of data.cats) {
    const n = data.posts.filter((p) => p.cat === c.slug).length;
    assert.ok(s.includes(`${c.name} <span>(${n})</span>`), `사이드바 ${c.name} (${n})`);
    assert.ok(s.includes(`<a href="/guide/${c.slug}/">${c.name}</a>`), `메뉴 ${c.name}`);
  }
});

test('내부 링크가 전부 실제 파일로 연결된다', () => {
  const bad = [];
  for (const f of pages()) {
    for (const m of read(f).matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
      let p = m[1]; if (p.endsWith('/')) p += 'index.html';
      if (!fs.existsSync(path.join(ROOT, p))) bad.push(`${f} -> ${m[1]}`);
    }
  }
  assert.deepStrictEqual([...new Set(bad)], []);
});

test('sitemap·llms.txt에 카테고리가 들어 있다', () => {
  const sm = read('sitemap.xml'); const ll = read('llms.txt');
  for (const c of data.cats) {
    assert.ok(sm.includes(`https://mypetlab.kr/guide/${c.slug}/`), `sitemap: ${c.slug}`);
    assert.ok(ll.includes(`https://mypetlab.kr/guide/${c.slug}/`), `llms: ${c.slug}`);
  }
});

test('buildlist를 다시 실행하면 갱신 0개(멱등)', () => {
  const out = execFileSync('node', ['tools/buildlist.js'], { cwd: ROOT, encoding: 'utf8' });
  assert.match(out, /갱신된 파일 0개/, out);
});
