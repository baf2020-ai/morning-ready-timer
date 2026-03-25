"use client";

import { motion } from "framer-motion";
import type { TaskItem } from "@/lib/types";
import TaskIcon from "@/components/svg/icons/TaskIcons";
import { COLORS } from "@/lib/constants";

interface ProgressStepsProps {
  tasks: TaskItem[];
  currentStep: number;
  compact?: boolean;
}

export default function ProgressSteps({ tasks, currentStep, compact }: ProgressStepsProps) {
  return (
    <div className="w-full flex items-center justify-center gap-1 px-2">
      {tasks.map((task, i) => {
        const done = i < currentStep;
        const active = i === currentStep;

        return (
          <div key={task.id} className="flex items-center">
            {/* 스텝 아이템 */}
            <motion.div
              animate={active ? { scale: [1, 1.1, 1] } : {}}
              transition={active ? { repeat: Infinity, duration: 2 } : {}}
              className="flex flex-col items-center"
              style={{ opacity: done ? 0.5 : 1 }}
            >
              {/* 아이콘 원 */}
              <div
                className="relative flex items-center justify-center rounded-full"
                style={{
                  width: compact ? 32 : 38,
                  height: compact ? 32 : 38,
                  backgroundColor: done ? COLORS.mint : active ? COLORS.primary : "#F0EBFF",
                  border: active ? `3px solid ${COLORS.primary}` : "2px solid transparent",
                  boxShadow: active ? `0 0 0 3px rgba(108,92,231,0.2)` : "none",
                }}
              >
                {done ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <TaskIcon icon={task.icon} size={compact ? 20 : 24} />
                )}
              </div>
              {/* 라벨 (현재만 표시) */}
              {active && !compact && (
                <span className="text-[10px] mt-0.5 whitespace-nowrap" style={{ color: COLORS.primary }}>
                  {task.label}
                </span>
              )}
            </motion.div>

            {/* 연결선 (마지막 제외) */}
            {i < tasks.length - 1 && (
              <div
                className="mx-0.5"
                style={{
                  width: compact ? 8 : 12,
                  height: 2,
                  backgroundColor: i < currentStep ? COLORS.mint : "#E8E0F0",
                  borderRadius: 1,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
