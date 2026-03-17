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

**정보 입력 화면**
- 이름, 학교, 학년, 번호, 좌석번호 5개 필드를 입력받아 `examStore`의 `studentInfo`에 저장
- 튜토리얼 건너뛰기 버튼으로 `screen` 상태를 `'exam'`으로 직행 가능

**인터랙티브 튜토리얼 (10단계)**
- 시험지 이미지 → 시험지+OMR 미리보기 → 객관식 실습(마킹·삭제·복수 정답) → 주관식 실습(입력·수정) → 타이머 안내 순으로 진행
- `TutorialScreen` 내부에서 답안 상태(`objAnswers`, `subjAnswers`)를 독립 관리해 전역 `examStore`에 영향 없음
- 각 단계의 `checkDone()` 함수가 지정 액션 완료 여부를 검사해 다음 단계 버튼 활성화
- `MiniOMRPreview`는 CSS `zoom: 0.58`로 실제 OMR 컴포넌트를 축소 표시

**OMR 카드**
- 객관식: `answers.objective: Record<number, number>`, 재클릭 시 해당 키 `delete`로 선택 해제
- 주관식: `answers.subjective: Record<number, string>`, 숫자·소수점·`/`·`-` 입력 허용, 제출 시 `parseSubjectiveAnswer()`로 정수 변환
  ```ts
  // "3/2" → 2, "21" → 21, "-1.5" → -2
  function parseSubjectiveAnswer(raw: string): number | null
  ```
- 키패드는 모달 대신 `sticky top-16` 사이드 패널로 고정 — 스크롤해도 항상 노출

**타이머**
- `useEffect` + `setInterval`로 1초 카운트다운, 잔여 시간 ≤ 10초 시 `text-red-500` 전환
- `remainingTime === 0` 도달 시 TanStack Query의 `submitExam` mutation 자동 호출

**결과 화면**
- 서버 채점 응답(`ExamResult`)을 `examStore.setResult()`로 저장, `ResultScreen`이 구독해 렌더링
- 총점·카운트 요약 + `results[]` 순회로 25문항 전체 결과 아이콘 표시

<br>

### UI/UX 개선 작업

**화면 전환 애니메이션**
- `screen` 변경 감지 → `fading: true`(opacity 0, 150ms) → `displayed` 교체 → `fading: false`
- `key={displayed}`로 새 화면 마운트 시 `@keyframes slideUp` 트리거
  ```css
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  ```

**스크롤바 CLS 수정**
- 슬라이드 업 중 콘텐츠가 뷰포트 상단 밖으로 나가 스크롤바가 순간 생겼다 사라지는 CLS 발생
- `html { scrollbar-gutter: stable }`로 스크롤바 공간 상시 확보 + `translateY` 방향을 `-8px → 0`(위→아래)으로 변경해 아래쪽 overflow 원천 차단

**홈으로 버튼**
- 시험·결과 화면 상단 Nav에 항상 노출
- 시험 중: `showHomeConfirm` 상태로 확인 모달 조건부 렌더링 → 확인 시 `reset()` 호출
- 결과 화면: 확인 없이 바로 `reset()`

**상단 Nav 통합**
- 기존: `<Header>` + 타이머 바 2줄 구조 → OMR 영역 압박
- 변경: `grid grid-cols-3` 단일 Nav로 `홈으로 | 모드·학생명 | 타이머` 1줄 통합

**타이머 CLS 수정**
- 대기 중 `"시험 시작까지 · 시험 시간 N분"` 텍스트가 시험 시작 시 `"시험 종료까지"`로 바뀌며 줄 수 변화 → 레이아웃 흔들림
- 대기·시험 중 모두 `text-xs 레이블 / text-2xl 숫자` 동일 2줄 구조로 통일

**OMR 카드 min-width**
- `grid grid-cols-2` 내 객관식·주관식이 좁은 화면에서 겹치는 문제
- `min-w-180` 적용으로 컨테이너 최소 너비 고정

<br>

### 주요 구현 패턴

**`useShallow`로 불필요한 리렌더링 방지**

Zustand에서 여러 상태를 한 번에 구독할 때 객체를 반환하면 매 렌더링마다 새 참조가 생성되어 불필요한 리렌더링이 발생합니다. `useShallow`로 shallow 비교를 적용해 실제로 값이 바뀐 경우에만 리렌더링되도록 했습니다.

```ts
const { studentInfo, answers, setResult } = useExamStore(
  useShallow((s) => ({ studentInfo: s.studentInfo, answers: s.answers, setResult: s.setResult }))
)
```

**매직넘버 상수화**

`OMRCard`에서 문항 수와 보기 번호를 하드코딩하지 않고 상수로 분리해 의미를 부여하고 수정 시 한 곳만 바꾸면 되도록 했습니다.

```ts
const OBJECTIVE_COUNT = 14
const SUBJECTIVE_COUNT = 11
const CHOICES = [1, 2, 3, 4, 5]
```

**결과 스타일 룩업 테이블**

`ResultScreen`에서 `correct | wrong | unanswered` 세 가지 상태에 따른 스타일을 `if/switch` 대신 객체 룩업으로 처리해 렌더링 코드를 단순하게 유지했습니다.

```ts
const RESULT_STYLE = {
  correct:    { label: '정답', icon: '✓', color: 'text-green-600', ... },
  wrong:      { label: '오답', icon: '✗', color: 'text-red-500',   ... },
  unanswered: { label: '미응답', icon: '—', color: 'text-gray-400', ... },
}
// 사용
const style = RESULT_STYLE[r.result]
```

**순수 함수로 API 변환 로직 분리**

Store의 `answers` 형태(`Record<number, string>`)를 서버 payload 형태(`SubmitAnswer[]`)로 변환하는 로직을 `buildAnswerPayload()`, 주관식 문자열 파싱을 `parseSubjectiveAnswer()`로 분리해 컴포넌트 바깥에서 독립적으로 테스트 가능하도록 구성했습니다.

**`useCallback`으로 함수 참조 안정화**

`handleSubmit`, `handleExamEnd`, `handleExamStart` 등 이벤트 핸들러를 `useCallback`으로 메모이제이션해 자식 컴포넌트(`Timer`)에 props로 전달 시 불필요한 리렌더링을 방지했습니다.

<br>

### 개발 환경 개선

- **Prettier + import 정렬** — `@trivago/prettier-plugin-sort-imports`로 저장 시 자동 포맷, import를 `react → 외부 라이브러리 → @/ → 상대경로` 순 정렬
- **`@/` 절대경로 alias** — `tsconfig.app.json` `paths`와 `vite.config.ts` `resolve.alias` 양쪽 설정해 IDE 자동완성 + 번들러 모두 동작
  ```ts
  // before
  import { useExamStore } from '../../store/examStore'
  // after
  import { useExamStore } from '@/store'
  ```
- **barrel index.ts** — `components`, `screens`, `store`, `api` 각 폴더에 `index.ts`를 두어 named export로 통일

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
