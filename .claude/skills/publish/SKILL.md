---
name: publish
description: mypetlab.kr 가이드 글 배포 파이프라인. 검수 완료된 원고 md를 HTML로 변환해 목록·sitemap·홈 카드에 반영하고 커밋·푸시까지 완료한다. 운영자가 "/publish <원고파일>" 또는 "올려줘"라고 하면 사용한다.
---

# mypetlab.kr 글 배포 파이프라인

운영자가 승인한 원고 md 파일을 받아 mypetlab.kr에 게시하는 전 과정. 아래 단계를 **순서대로 전부** 수행한다. 하나라도 건너뛰지 않는다.

원고 위치: `C:\Users\사라띠\Documents\원고대기\mypetlab\` (파일명 = 슬러그, 예: `morae.md` → `/guide/morae.html`)
저장소: `C:\Users\사라띠\Documents\mypetlab\`

## 0단계: 사전 점검 (멀티 기기 대응)

1. `git pull` 먼저 실행 — 운영자가 회사 PC와 노트북을 오가므로 반드시 최신화 후 시작
2. git 사용자 정보 확인: 미설정 기기라면 `git config user.name "wptjsdkenl"`, `git config user.email "wptjsdkenl@gmail.com"` (저장소 로컬로만 설정)
3. 원고 작업 전 `Documents\글쓰기규칙.md`를 **매번 새로 읽는다.** 운영자가 수시로 추가하는 살아있는 문서라, 같은 세션에서 앞서 읽었더라도 그 사이 항목이 늘었을 수 있다. 기억에 의존하지 않는다
4. 원고 승인 보고에 아래 3가지를 **반드시 포함**한다 (2026-08-23 누락 사고 후 추가)
   - **페르소나 한 줄**: 검색자 상황 시나리오 2~3개를 뽑고 그중 하나를 골라 "이 글은 누구에게 쓴 글인지" 명시. 첫 문단은 그 사람에게 쓴다
   - **키워드 검증 결과**: 블랙키위·네이버 키워드도구로 타겟 검색어의 검색량·연관어를 확인해 보고. 클로드가 직접 조회할 수 없으면 확인할 키워드 목록을 운영자에게 넘기고, 검증 전임을 명시한다
   - **제목 후보 4방향**: 구체적 수치 / A vs B 비교 / 통념 뒤집기 / 상황 몰입으로 5~6개를 만들고, 검색 키워드가 제목 앞에 오는 안을 고른 이유를 적는다. 불안 자극·자존심 긁기·초성 숨기기 금지

## 1단계: 발행 한도 확인 (하루 최대 2편 — 절대 규칙)

오늘 자정 이후 커밋에서 새로 추가된 `guide/*.html` 수를 센다:
```bash
git log --since=midnight --diff-filter=A --name-only --pretty=format: -- guide/ | grep -c "guide/.*\.html"
```
(guide/index.html 제외) **이미 2편이면 여기서 중단하고 운영자에게 보고한다.** 운영자가 명시적으로 한도 초과를 지시해도 리듬 규칙을 상기시킨 뒤 재확인받는다.

## 2단계: 원고 파싱

- 첫 줄 `# 제목` → `<title>`(뒤에 " | 마이펫랩" 붙임), `og:title`, JSON-LD headline, `<h1>`에 사용
- `메타 설명(검색용):` 줄 → `<meta name="description">`과 JSON-LD description에**만** 사용. **본문에 절대 노출 금지**
- 슬러그: md 파일명 (영문 소문자)

## 3단계: HTML 페이지 생성 → `guide/<슬러그>.html`

**가장 최근 게시된 글 페이지(예: guide/nomyo.html)를 열어 그 구조·CSS를 그대로 복사**하고 내용만 교체한다. 스타일을 새로 짓지 않는다. 구성 요소:

- head: title, meta description, og 3종(og:type=article), Google Fonts, JSON-LD Article (mainEntityOfPage는 `https://mypetlab.kr/guide/<슬러그>.html`, datePublished는 게시일)
- head 끝(`</head>` 직전): **Google Analytics 4 스니펫(측정 ID G-K3SMLQRKGM)** — 최근 글 페이지의 것을 그대로 복사. 빠지면 안 됨
- `<meta charset>` 바로 아래: **애드센스 확인 스크립트(ca-pub-4428587485814712)** — 8/27 심사 신청부터 전 페이지 필수. 최근 글 페이지에서 그대로 복사
- head 공유·검색 태그(8/22~ 필수): `og:url`(페이지 절대 URL) · `og:image`=`https://mypetlab.kr/og.png` + width 1200/height 630 · `og:site_name`=마이펫랩 · `twitter:card=summary_large_image` · `<link rel="canonical">` — 최근 글 페이지에서 복사하고 URL만 교체. 그리고 `</head>` 직전에 **BreadcrumbList JSON-LD**(홈 › 가이드 › 짧은 주제명, item은 절대 URL). `html{}`에 `-webkit-text-size-adjust:100%` 유지
- **날짜(GEO·최신성 신호)**: Article JSON-LD에 `datePublished`(게시일)와 `dateModified`를 **둘 다** 넣는다. 신규 글은 두 값이 같다. 헤더 `.meta` 바로 아래에 `<p class="pubdate">YYYY년 M월 D일 게시</p>` 표시. **기존 글의 세율·법령·수치를 고치면 `dateModified`와 화면 문구를 그날 날짜로 갱신**하고 문구는 `~ 게시 · YYYY년 M월 D일 수정`으로 바꾼다. 오탈자·디자인 수정만 한 경우에는 갱신하지 않는다
- 본문: crumb(홈/가이드/짧은 주제명) → eyebrow(주제 태그) → h1 → .meta 한 줄 소개 → article
- article 내부: 첫 문단은 `.lead`, `##` → `<h2>`, `**굵게**` → `<b>`, 목록 → `<ul>/<ol>`, 원고의 링크는 그대로 `<a href>`
- **이미지(2026-09-02~)**: 원고의 `![alt](/img/파일.webp)` 줄은 그 자리에 `<figure class="fig"><img src="/img/파일.webp" width="1200" height="686" alt="…" loading="lazy" decoding="async"></figure>`로 변환한다. 규칙:
  - **alt 필수** — 원고의 대괄호 문구 그대로(장면을 한 문장으로). 빈 alt·"이미지"·파일명 금지
  - **width/height 속성 필수**(레이아웃 밀림 방지). 값은 `node tools/imgopt.js`가 출력한 것을 쓴다
  - **첫 번째 이미지(히어로)는 `loading="lazy"` 빼고 `fetchpriority="high"`**, 나머지는 lazy
  - **파일은 300KB 이하 webp, 폭 1200px** — 생성 원본(PNG 1.5MB)은 반드시 `Documents`에서 `node tools/imgopt.js 원본.png --out mypetlab/img/슬러그-용도.webp`로 압축한 것만 올린다. 파일명은 `슬러그-용도.webp`(예: dubu-hero, dubu-mix)
  - 마이펫랩 이미지는 **일러스트 풍만** 쓴다(실사 사진으로 "우리 집 고양이"처럼 보이게 하지 않는다). 글마다 1~3장, 히어로 1장은 .lead 문단 바로 아래
  - CSS는 최근 글에서 `.fig` 블록을 복사: `article .fig{margin:22px 0}` `article .fig img{display:block;width:100%;height:auto;border-radius:12px}`
  - 생성은 `Documents`에서 `node tools/genimg.js "프롬프트" --ratio 16:9 --out 원고대기/사진/슬러그-용도.png` (월 상한·장부 `tools/genimg-usage.json`)
  - **프롬프트는 반드시 `Documents/기록/이미지생성_진행상황.md`의 "★ 프롬프트 규칙" 6개를 따른다** — 핵심: 사람은 상반신 이상 보이게(손만 금지) / 집사는 동화풍·이목구비 단순 / 서명·글자 없음 / 물건 목록 명시 / 소품 3개 이하. 생성 후 검수 3단계(시트·구석 확대·체크리스트) 통과 전 게시 금지
- `## 정리` 섹션 → `.summary-box`
- 마지막 행동 유도 문장 → `.cta` 박스 (링크 하나만)
- `※` 면책 문구 → `.footnote`
- 하단 "함께 보면 좋아요" .rel-card 2개(관련 글 + 계산기) + 푸터

**본문 내용, 특히 건강·수의학 관련 표현은 원고에서 임의로 바꾸지 않는다.** 개선이 필요해 보이면 게시 전에 운영자에게 물어본다.

## 4단계: 목록 반영 (tools/posts.json 한 곳만 고친다)

1. **tools/posts.json**의 `posts` 배열 **맨 앞**에 새 글 항목을 추가한다:
   `{ "slug", "date"(게시일), "tag"(반드시 파일 위쪽 "tags" 목록 안의 값), "title"(목록용 전체 제목), "short"(홈·관련글용 짧은 제목, 30자 안팎), "summary"(목록 카드 설명 2줄) }`
   문맥상 꼭 이어 읽히면 좋은 글이 있으면 `"related": ["슬러그", ...]`로 직접 지정한다. 생략하면 같은 태그 우선 → 최신순으로 자동 선정된다.
2. `node tools/buildlist.js` 실행 → **가이드 목록·태그 칩·전체 편수·홈 최신 5편·모든 글의 "이어서 읽으면 좋은 글"이 한 번에 갱신**된다. 오류가 나면(파일 없음, 슬러그 중복 등) 메시지대로 고친 뒤 다시 실행한다.
3. **sitemap.xml**: `</urlset>` 앞에 새 url 블록 추가 (`<lastmod>`=게시일 YYYY-MM-DD). **글의 `dateModified`를 갱신하면 sitemap의 `<lastmod>`도 같은 날짜로 함께 갱신**한다(불일치 금지).

※ guide/index.html·index.html·각 글의 `<!-- AUTO:... -->` 구간은 **손으로 고치지 않는다.** 전부 buildlist.js가 생성한다.

## 5단계: 배포 전 검사

- `node tools/readcheck.js guide/<슬러그>.html` 실행 → 긴 문장(70자+)·1,000자 넘는 문단·같은 어미 4연속·금지 표현 경고를 확인한다. 경고는 **고칠지 운영자에게 보고**하고 자동 수정하지 않는다(수치·법령 임의 수정 금지). 경고 0건이 목표지만 사실 단정("절대 불가" 등 사실인 경우)은 유지 가능
- 새 페이지와 수정된 파일의 내부 링크(`href="/..."`)가 모두 실제 파일로 연결되는지 전수 확인. 깨진 링크가 있으면 **배포 중단**하고 수정
- 메타 설명 문구가 본문에 노출되지 않았는지 확인
- 이미지가 있는 글: `img/` 파일 존재·300KB 이하·alt 비어 있지 않음·width/height 있음 확인. 배포 후 **375px 폭(모바일)으로 열어 이미지가 본문 폭을 넘지 않고 글자와 겹치지 않는지** 스크린샷으로 확인

## 6단계: 커밋·푸시

- 한글 커밋 메시지 (예: `가이드 게시: 고양이 모래 종류 총정리 (목록·sitemap·홈 카드 반영)`)
- **푸시까지 완료해야 실제 반영** — 커밋만 하고 끝내지 않는다

## 7단계: 색인 알림 (IndexNow — 네이버·빙 자동, 9/5~)

1. 실사이트에서 새 글 URL이 **200을 돌려주는지 먼저 확인**한다(반영 전에 보내면 엔진이 404를 받고 무시). 폴링 금지, 1~2분 뒤 1회 확인
2. `node tools/indexnow.js https://mypetlab.kr/guide/새글.html` 실행, 응답 200/202면 접수
3. dateModified를 올린 수정 글도 같은 방법으로 다시 보낸다
4. 응답 의미: 400 형식 오류 · 403 키 불일치 · 422 키 파일이 루트가 아니거나 URL 호스트 다름 · 429 과다
5. 구글은 IndexNow를 안 받는다 — 사이트맵 자연 색인이 기본, 빠른 색인이 필요하면 운영자 크롬(서치콘솔 로그인)에서 URL 검사 → 색인 생성 요청(하루 10건 안팎)

## 8단계: 마무리

1. 원고 파일을 `원고대기\mypetlab` → `원고완료\mypetlab`로 이동
2. `C:\Users\사라띠\Documents\CLAUDE.md`의 2호 사이트(마이펫랩) 현황 갱신
3. 운영자에게 보고: 게시된 URL, GitHub Pages 반영 1~2분 소요 안내, IndexNow 응답 코드, **구글 색인 요청은 필요 시 운영자 크롬으로** 안내

## 수익화 관련 (중요)

- **애드센스 승인 전까지 쿠팡파트너스 링크를 넣지 않는다.** 비교글도 "고르는 기준" 중심으로 깨끗하게 게시하고, 승인 후 일괄 삽입한다
- 쿠파스 링크를 넣기 시작하면 글에 제휴 고지 문구를 반드시 추가한다
