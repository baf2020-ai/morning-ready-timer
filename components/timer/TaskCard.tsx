"use client";

import { motion } from "framer-motion";
import type { TaskItem } from "@/lib/types";
import CountdownTimer from "./CountdownTimer";
import TaskIcon from "@/components/svg/icons/TaskIcons";
import { soundManager } from "@/lib/sounds";
import { COLORS } from "@/lib/constants";

interface TaskCardProps {
  task: TaskItem;
  remainingSeconds: number;
  onComplete: () => void;
  nextTask?: TaskItem | null;
  remainingTasks?: TaskItem[];
}

export default function TaskCard({ task, remainingSeconds, onComplete, nextTask, remainingTasks = [] }: TaskCardProps) {
  const handleComplete = () => {
    soundManager.play("tap");
    onComplete();
  };

  // ETA 계산
  const remainingTasksDuration = remainingTasks.reduce((sum, t) => sum + t.durationSeconds, 0);
  const totalRemaining = Math.max(remainingSeconds, 0) + remainingTasksDuration;
  const etaDate = new Date(Date.now() + totalRemaining * 1000);
  const etaHH = etaDate.getHours().toString().padStart(2, "0");
  const etaMM = etaDate.getMinutes().toString().padStart(2, "0");
  const totalMin = Math.ceil(totalRemaining / 60);

  return (
    <div className="flex flex-col items-center gap-2">
      {/* 아이콘 + 이름 */}
      <motion.div
        key={task.id}
        initial={{ scale: 0.5, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="flex flex-col items-center"
      >
        <TaskIcon icon={task.icon} size={60} />
        <h2 className="text-xl mt-1" style={{ color: COLORS.textDark }}>
          {task.label}
        </h2>
      </motion.div>

      {/* 뽀모도로 타이머 - 태블릿용 크게 */}
      <CountdownTimer
        totalSeconds={task.durationSeconds}
        remainingSeconds={remainingSeconds}
        size={280}
      />

      {/* 완료 버튼 - 젤리 스타일 */}
      <motion.button
        whileTap={{ scale: 0.88, rotate: -2 }}
        onClick={handleComplete}
        className="jelly-btn w-full max-w-[260px] py-4 text-xl text-white"
        style={{
          backgroundColor: COLORS.primary,
          "--btn-shadow": "#5041C0",
          minHeight: "64px",
        } as React.CSSProperties}
      >
        완료!
      </motion.button>

      {/* 예상 완료 시간 */}
      <p className="text-lg font-bold mt-1" style={{ color: COLORS.mint }}>
        예상 완료 {etaHH}:{etaMM} ({totalMin}분 남음)
      </p>

      {/* 다음 항목 미리보기 */}
      {nextTask && (
        <p className="text-sm mt-1" style={{ color: COLORS.textSub }}>
          다음: {nextTask.label} ({Math.floor(nextTask.durationSeconds / 60)}분)
        </p>
      )}
    </div>
  );
}
