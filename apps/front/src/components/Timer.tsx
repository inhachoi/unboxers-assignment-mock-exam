import { useEffect, useRef, useState } from "react";

type Phase = "waiting" | "exam" | "ended";

interface TimerProps {
  onExamStart: () => void;
  onExamEnd: () => void;
}

const WAIT_SECONDS = 5;
const EXAM_SECONDS = 60;

export default function Timer({ onExamStart, onExamEnd }: TimerProps) {
  const [phase, setPhase] = useState<Phase>("waiting");
  const [seconds, setSeconds] = useState(WAIT_SECONDS);
  const onExamStartRef = useRef(onExamStart);
  const onExamEndRef = useRef(onExamEnd);

  useEffect(() => {
    onExamStartRef.current = onExamStart;
    onExamEndRef.current = onExamEnd;
  });

  // 페이즈 전환 시 콜백 호출 (setState updater 밖에서 실행하여 React 경고 방지)
  useEffect(() => {
    if (phase === "exam") {
      onExamStartRef.current();
    } else if (phase === "ended") {
      onExamEndRef.current();
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "ended") return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          if (phase === "waiting") {
            setPhase("exam");
            return EXAM_SECONDS;
          } else {
            setPhase("ended");
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timeStr =
    mins > 0 ? `${mins}분 ${String(secs).padStart(2, "0")}초` : `${secs}초`;

  if (phase === "waiting") {
    return (
      <div className="text-center">
        <p className="text-sm text-gray-500">시험이 곧 시작됩니다...</p>
        <p className="text-xl font-extrabold text-gray-800">
          {timeStr} 뒤 시작
        </p>
        <p className="text-xs text-gray-400">시험 시간 1분</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-xs text-gray-500">시험 종료까지 남은 시간</p>
      <p
        className={`text-2xl font-extrabold tabular-nums ${seconds <= 10 ? "text-red-500" : "text-gray-800"}`}
      >
        {timeStr}
      </p>
    </div>
  );
}
