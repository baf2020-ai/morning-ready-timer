"use client";

import { motion } from "framer-motion";
import type { TaskItem } from "@/lib/types";
import CountdownTimer from "./CountdownTimer";
import TaskIcon from "@/components/svg/icons/TaskIcons";
import { soundManager } from "@/lib/sounds";

interface TaskCardProps {
  task: TaskItem;
  remainingSeconds: number;
  onComplete: () => void;
  nextTask?: TaskItem | null;
}

export default function TaskCard({ task, remainingSeconds, onComplete, nextTask }: TaskCardProps) {
  const handleComplete = () => {
    soundManager.play("tap");
    onComplete();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 아이콘 + 이름 */}
      <motion.div
        key={task.id}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center"
      >
        <TaskIcon icon={task.icon} size={70} />
        <h2 className="text-xl font-bold mt-1" style={{ color: "#2D3436" }}>
          {task.label}
        </h2>
      </motion.div>

      {/* 타이머 */}
      <CountdownTimer
        totalSeconds={task.durationSeconds}
        remainingSeconds={remainingSeconds}
        size={160}
      />

      {/* 완료 버튼 */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={handleComplete}
        className="w-full max-w-[260px] py-4 rounded-2xl text-xl font-bold text-white shadow-lg active:shadow-md"
        style={{ backgroundColor: "#FF6B6B", minHeight: "64px" }}
      >
        완료! ✓
      </motion.button>

      {/* 다음 항목 미리보기 */}
      {nextTask && (
        <p className="text-sm mt-1" style={{ color: "#636E72" }}>
          다음: {nextTask.label} ({Math.floor(nextTask.durationSeconds / 60)}분)
        </p>
      )}
    </div>
  );
}
