# 모의고사 웹앱 과제

## 💻 실행 방법

```bash
pnpm install
pnpm start
```

- 서버: http://localhost:3001 
- 웹앱: http://localhost:5173


<br>

## ⚒️ 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | React 19 + Vite |
| 스타일링 | Tailwind CSS v4 |
| 상태관리 | Zustand |
| 서버 상태 | TanStack Query |
| 서버 | Fastify + Prisma + SQLite |
| 패키지 매니저 | pnpm (monorepo) |
| 포매터 | Prettier + @trivago/prettier-plugin-sort-imports |

<br>

## 📜 프로젝트 구조

```
apps/
  front/         # React 웹앱
    src/
      api/       # 서버 통신 (exam.ts)
      components/# 공통 컴포넌트 (OMRCard, Keypad, Timer, Header)
      screens/   # 화면 단위 컴포넌트 (Info, Tutorial, Exam, Result)
      store/     # 전역 상태 (examStore)
  server/        # Fastify API 서버
```

각 폴더에 `index.ts` barrel file을 두어 `@/components`, `@/screens` 등 절대경로로 import할 수 있도록 구성했습니다.

<br>

## 🍀 주요 설계 결정

<br>

### 라우터 대신 상태 기반 화면 전환

React Router 같은 라우터를 쓰지 않고 Zustand store의 `screen` 상태값으로 화면을 전환합니다.

시험 특성상 브라우저의 뒤로가기 버튼이나 URL 직접 입력으로 시험 화면을 이탈하거나 결과 화면으로 바로 접근하는 것은 크리티컬한 문제입니다. 상태 기반으로 제어하면 이런 우발적인 이탈을 원천 차단할 수 있습니다.

<br>

### Zustand 선택

Zustand를 선택한 가장 큰 이유는 간결함과 유연성입니다. 다른 전역 상태관리 도구에 비해 스토어 설정이 직관적이고 보일러플레이트가 거의 없어 빠르게 적용할 수 있었고, Hook 기반 API라 함수형 컴포넌트와도 잘 어울립니다.

또한 Redux나 Context API처럼 Provider로 감싸지 않아도 되어 구조가 단순해지고, 상태를 비교적 자유롭게 설계할 수 있어 유지보수와 확장 측면에서도 적합하다고 판단했습니다.

<br>

### 키보드 인터랙션 미구현

요구사항에서 **터치스크린**을 이용해 시험을 응시한다고 명시되어 있으므로, 키보드 단축키나 Tab 포커스 이동 같은 키보드 인터랙션은 의도적으로 구현하지 않았습니다.

<br>

## 🍀 구현 기능 및 개선 작업

<br>

### 기능

- **정보 입력 화면** — 학생 이름, 학교, 학년, 번호 입력 후 튜토리얼 또는 시험으로 이동
- **인터랙티브 튜토리얼** — 단계별 OMR 실습 (마킹, 삭제, 복수 정답, 주관식 입력/수정)
- **OMR 카드** — 객관식 14문항 + 주관식 11문항, 우측 고정 키패드
- **타이머** — 카운트다운, 시간 종료 시 자동 제출
- **결과 화면** — 점수, 정답/오답/미응답 통계, 문항별 결과 탭

<br>

### UI/UX 개선 작업

| 작업 | 내용 |
|------|------|
| 화면 전환 애니메이션 | 페이드 아웃 → 슬라이드 업 페이드 인 |
| 스크롤바 CLS 수정 | `scrollbar-gutter: stable` + `translateY` 방향 수정으로 overflow 제거 |
| 홈으로 버튼 | 시험/결과 화면 상단 고정, 시험 중 누르면 확인 모달 |
| 상단 Nav 통합 | 시험 화면의 Header + 타이머 바를 한 줄로 합쳐 공간 확보 |
| 타이머 CLS 수정 | 대기/시험 중 모두 동일한 2줄 구조로 레이아웃 변화 없음 |
| min-width | OMR 카드가 일정 너비 이하로 줄어들지 않도록 제한 |

<br>

### 개발 환경 개선

- **Prettier + import 정렬** — 저장 시 자동 포맷 및 import 순서 정렬
- **`@/` 절대경로 alias** — `tsconfig` + `vite.config` 양쪽 설정
- **barrel index.ts** — 각 폴더별 public API 정의

<br>

### Claude 활용

[Superpowers 프레임워크](https://github.com/mcp-plugins/superpowers)를 통해 Claude Code를 활용하여 빠르게 개발했습니다. Figma MCP를 연동해 디자인 파일을 직접 참조하며 UI를 구현했고, 반복적인 코드 작업이나 설정 작업에 적극 활용했습니다.

<br>

## 🍀 더 시간이 있었다면

- **테스트 코드** — TDD로 진행하지 못한 것이 가장 아쉽습니다. OMR 상태 로직, 채점 API, 튜토리얼 단계 전환 등 테스트 커버리지가 필요한 부분이 많습니다.
- **복수 정답 실제 지원** — 현재 튜토리얼에서만 복수 선택이 가능하고 실제 시험 OMR은 단일 선택입니다. 서버 API와 함께 완성할 수 있습니다.
- **오프라인 대응** — 시험 중 네트워크가 끊겨도 답안이 유실되지 않도록 로컬 스토리지 임시 저장
- **접근성** — 터치 타겟 크기, 색상 대비 등 접근성 기준 검토

<br>

---

## 📈 API

### `GET /api/exams`

시험 기본 정보를 조회합니다.

```json
{
  "data": {
    "title": "모의고사 응시 테스트",
    "totalQuestions": 25,
    "totalScore": 100
  }
}
```

<br>

### `POST /api/exams/submit`

학생 정보와 답안을 제출하면 채점 결과를 반환합니다.

**Request**

```json
{
  "name": "홍길동",
  "school": "베이스고",
  "grade": 1,
  "studentNumber": 12,
  "seatNumber": 3,
  "answers": [
    { "answerType": "objective", "number": 1, "answer": "3" },
    { "answerType": "subjective", "number": 1, "answer": "6" }
  ]
}
```

**Response**

```json
{
  "data": {
    "score": 5,
    "correctCount": 2,
    "wrongCount": 0,
    "unansweredCount": 23,
    "results": [
      { "answerType": "objective", "number": 1, "result": "correct" }
    ]
  }
}
```

<br>

## 💯 Seed 정답표

### 객관식

| 번호 | 정답 | 배점 |
|------|------|------|
| 1 | 3 | 2 |
| 2 | 3 | 2 |
| 3 | 4 | 2.5 |
| 4 | 5 | 2.5 |
| 5 | 3 | 2.5 |
| 6 | 5 | 2.5 |
| 7 | 5 | 3 |
| 8 | 2 | 3 |
| 9 | 3 | 3.5 |
| 10 | 4 | 3.5 |
| 11 | 5 | 4 |
| 12 | 5 | 4 |
| 13 | 2 | 4.5 |
| 14 | 4 | 5.5 |

### 주관식

| 번호 | 정답 | 배점 |
|------|------|------|
| 1 | 6 | 3 |
| 2 | 2 | 4 |
| 3 | 21 | 4 |
| 4 | 32 | 4 |
| 5 | 2 | 4 |
| 6 | 9 | 4.5 |
| 7 | 24 | 4.5 |
| 8 | 11 | 5 |
| 9 | 12 | 6 |
| 10 | 1 | 8 |
| 11 | 104 | 8 |
