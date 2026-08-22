---
name: design
description: 마이펫랩 mypetlab.kr 디자인 규칙(색상·폰트·컴포넌트·금지사항). 새 계산기 페이지나 새 페이지를 만들거나 기존 페이지 디자인을 손댈 때 코드를 쓰기 전에 반드시 먼저 읽는다. 글(guide) 변환은 /publish 스킬이 담당하지만 그때도 이 규칙이 우선한다.
---

# 마이펫랩 디자인 스킬

**목적**: AI가 페이지를 만들 때마다 디자인이 달라지는 것을 막는다. 아래 값을 그대로 쓴다. 새 색·새 폰트·새 그림자·새 모서리 값을 발명하지 않는다. 기준 구현체는 `age/index.html`(계산기), `index.html`(홈), 가장 최근 `guide/*.html`(글)이다 — 애매하면 그 파일의 CSS를 복사한다.

## 1. 컨셉 한 줄
**"따뜻한 건강수첩"** — 크림색 바탕에 흰 카드, 발바닥 주황으로 강조, 건강 초록 보조. 포근하고 믿음직. 화려함·네온·차가운 블루 금지. (taxtool의 영수증 구조를 빌렸지만 색·온도가 다르다)

## 2. 색상 토큰 (`:root`에 그대로 선언)
```css
--bg:#F7F2E9;        /* 페이지 배경: 따뜻한 크림 */
--ink:#2B241C;       /* 본문 글자: 진한 갈색 먹색 */
--paper:#FFFFFF;     /* 카드 */
--orange:#E07A3F;    /* 주색: 발바닥 주황 — 강조·링크·결과 박스·CTA·포커스 */
--orange-deep:#B85C28; /* 글 본문 링크 */
--green:#3E8E6D;     /* 보조: 건강 초록 (건강·정상 표시 정도로만) */
--line:#E4DCCE;      /* 테두리·구분선 */
--sub:#6E6455;       /* 보조 글자 */
```
고정 보조색: 본문 회갈색 `#3E362B` / 태그·선택 chip 배경 `#FDF1E8` / 팁 박스 배경 `#FDF6EA` 테두리 `#F0DDBB` 글자 `#6B5320` / 결과 노트 배경 `#FDF9F2` / 표 머리 `#F3EDE1` / 푸터·crumb 글자 `#A29883` / 탭 트랙 `#EAE3D5` / 입력 배경 `#FBFAF7`.

## 3. 타이포
- Google Fonts: `Noto+Sans+KR:wght@400;500;700;900` + `IBM+Plex+Mono:wght@500;600`
- 본문 `'Noto Sans KR'`. line-height **계산기 1.6 / 글 1.75**. 숫자(체중·결과·입력값)는 `'IBM Plex Mono'` 600
- h1: 홈 30px, 계산기 29px, 글 27px — 모두 900, letter-spacing -0.5px. 강조 단어는 `<span class="hi">` 주황
- h2: 19~20px/900. 글 본문 p 15.5px(#3E362B), lead 16.5px ink. 계산기 본문 p 14.5px
- eyebrow: 12px/700 letter-spacing 2px, 주황 글자+1.5px 주황 테두리, radius 4px

## 4. 레이아웃
- `.wrap{max-width:560px}` 홈·계산기 / `640px` 글. `padding:32px 20px 60px`
- 모바일 우선 단일 컬럼. 계산기 상단 `.home-link "← 마이펫랩 홈"`, 글 상단 `.crumb 홈 › 가이드 › 주제`
- 세로 리듬: 헤더 → 탭(26px) → 카드(14px) → 결과(22px) → 섹션(44px) → 푸터(48px)

## 5. 컴포넌트 (클래스명·수치 고정)
| 컴포넌트 | 규칙 |
|---|---|
| `.tool-card` 홈 도구 카드 | paper, 1px line, **radius 16px**, padding 22px 20px, 그림자 `0 3px 12px rgba(43,36,28,.06)`, hover 주황 테두리+`translateY(-2px)`, 우하단 `.paw` 워터마크(opacity .07, -20deg) |
| `.tabs` 동물 선택 | 트랙 #EAE3D5 radius 12px padding 4px / 버튼 15px/700 radius 9px / `.on` paper + `0 1px 3px rgba(43,36,28,.12)` |
| `.card` 입력 카드 | paper, 1px line, radius 14px, padding 22px 20px |
| `input[type=text]` | Plex Mono 24px/600 우측 정렬, 2px line radius 10px, focus 주황 |
| `.size-chips` / `.kcal-chips` 선택 버튼 | flex 균등, radius 10px, 1.5px line, `.on` 주황 테두리 + #FDF1E8 배경, `small` 11px 보조 설명 |
| `.result` 결과(건강수첩 카드) | radius 14px, 그림자 `0 6px 20px rgba(43,36,28,.10)`, 머리 1.5px dashed, `.stamp`(주황, -6deg), `.r-line`(Plex Mono 15px), `.r-total`(**주황 배경** 흰 글자 36px/600, `.stage` pill rgba(255,255,255,.2)), `.r-note`(#FDF9F2 배경 13.5px) |
| `table` | paper, 1px line, radius 10px, 13.5px, th #F3EDE1 12.5px sub, 중앙 정렬 |
| `details/summary` FAQ | paper radius 10px, `::after` "+"/"–" |
| `.rel-card` | 가로 flex radius 10px, hover 주황, `.tag` 주황 글자 #FDF1E8 배경 |
| `.tip` | #FDF6EA / #F0DDBB / #6B5320 radius 10px |
| `.summary-box` (글) | paper, 1px line, **왼쪽 4px 주황 보더**, radius 10px |
| `.cta` (글) | 주황 배경 흰 글자 radius 12px padding 20px, 링크 하나만, 밑줄 offset 3px |
| `.footnote` | 13px #A29883 |
| `footer` | 12px #A29883 중앙, `.disclaimer`(수의사 상담 문구) → "마이펫랩 mypetlab.kr · 우리 아이 돌봄 계산기" → 가이드·사이트 소개·개인정보처리방침 |

그림자는 세 가지(`0 1px 3px` / `0 3px 12px` / `0 6px 20px`)만. 모서리 4 / 9 / 10 / 12 / 14 / 16 / 999px만. transition `.15s`만.

## 6. 이모지 규칙 (taxtool과 다름)
이 사이트는 **이모지를 "아이콘"으로 제한적으로 허용**한다: 홈 `.tool-card .emoji`, 계산기 탭 라벨(🐱 고양이 / 🐶 강아지), 워터마크 `.paw`. **그 외 본문·제목·글 안에는 금지.** 새 계산기도 탭에 동물 이모지 1개까지만.

## 7. 새 계산기 페이지 뼈대
```
.home-link → header(eyebrow → h1 → p) → .tabs(고양이/강아지) → .card(입력) 
→ .result(result-head(제목+stamp) → result-body(.r-line → .r-total(.stage)) → .r-note)
→ .tip(선택) → section(안내·표) → section(FAQ, JSON-LD FAQPage와 일치) → .rel-card 2개 → footer
```
- head: charset, viewport, title(" | 마이펫랩"), description, og 3종, **og:url·og:image(/og.png 1200×630)·og:site_name·twitter:card·canonical**, Google Fonts, JSON-LD, **BreadcrumbList(홈 › 계산기명)**, **GA4 스니펫(G-K3SMLQRKGM) `</head>` 직전** — `age/index.html`에서 복사. (AdSense 스크립트는 승인 후 추가 예정)
- GA 이벤트: 첫 입력 `calc_use{tool,species}`, 동물 전환 `calc_species` — `typeof gtag==='function'` 가드. **체중·나이 값은 담지 않는다**
- 쿠파스·쉐어링크 링크가 들어가는 페이지는 제휴 고지 문구 필수(privacy 6항과 일치). 링크 클릭은 GA 스니펫이 `affiliate_click`으로 자동 추적

## 8. 금지
- 차가운 파랑·보라 계열, 그라데이션, 네온, 유리 효과, 파스텔 무지개 카드
- 새 폰트·아이콘 라이브러리·Tailwind 도입 금지 — 순수 HTML/CSS/JS 단일 파일
- 건강·수의학 문구는 원고 그대로. 디자인 작업 중 문구 수정 금지
- 조급함 파는 문구 금지

## 9. 모바일 체크 (배포 전)
- 375px에서 `.r-total .v` 36px가 한 줄인지, 탭 라벨(이모지 포함)이 안 꺾이는지, `.size-chips` 3개가 한 줄에 들어가는지
- 글은 호흡 단위 줄바꿈(`~입니다.`), 표는 가로 스크롤 없이 들어가는지(열 4개 이하 권장)
- 인앱브라우저 폰트 확대 시 `-webkit-text-size-adjust:100%`

## 10. 스킬 갱신 규칙
새 컴포넌트를 만들면 5번 표에 추가. 기준 구현체가 바뀌면 값 재검토. PET.md 로드맵 변경(광고 배치·쿠파스 삽입) 시 7번 head/고지 항목도 갱신.
