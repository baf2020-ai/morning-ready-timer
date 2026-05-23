"use client";

import { motion } from "framer-motion";
import type { TaskItem } from "@/lib/types";
import TaskIcon from "@/components/svg/icons/TaskIcons";
import { COLORS } from "@/lib/constants";

interface ProgressStepsProps {
  tasks: TaskItem[];
  currentStep: number;
  completedCount?: number;  // 실제 완료된 항목 수
  compact?: boolean;
  onStepClick?: (index: number) => void;
  viewingStep?: number;
}

export default function ProgressSteps({ tasks, currentStep, completedCount, compact, onStepClick, viewingStep }: ProgressStepsProps) {
  return (
    <div className="w-full flex items-center justify-center gap-1 px-2">
      {tasks.map((task, i) => {
        const done = i < (completedCount ?? currentStep);
        const active = i === currentStep;
        const isViewing = viewingStep === i;
        const isNext = i === currentStep + 1;
        const showLabel = !compact && (done || active || isViewing || isNext);
        const labelColor = isViewing
          ? COLORS.secondary
          : active
            ? COLORS.primary
            : done
              ? COLORS.mint
              : COLORS.textSub;
        const labelBg = active || isViewing
          ? "#F0EBFF"
          : done
            ? "#E8FFF8"
            : "#F7F3FF";

        return (
          <div key={task.id} className="flex items-center">
            {/* 스텝 아이템 */}
            <motion.div
              animate={active && viewingStep === undefined ? { scale: [1, 1.1, 1] } : {}}
              transition={active && viewingStep === undefined ? { repeat: Infinity, duration: 2 } : {}}
              whileTap={onStepClick ? { scale: 0.9 } : undefined}
              className="flex flex-col items-center"
              style={{
                opacity: done && !isViewing ? 0.82 : 1,
                cursor: onStepClick ? "pointer" : "default",
              }}
              onClick={() => onStepClick?.(i)}
            >
              {/* 아이콘 원 */}
              <div
                className="relative flex items-center justify-center rounded-full"
                style={{
                  width: compact ? 32 : 38,
                  height: compact ? 32 : 38,
                  backgroundColor: done ? COLORS.mint : active ? COLORS.primary : "#F0EBFF",
                  border: isViewing
                    ? `3px solid ${COLORS.secondary}`
                    : active ? `3px solid ${COLORS.primary}` : "2px solid transparent",
                  boxShadow: isViewing
                    ? `0 0 0 3px rgba(255,165,0,0.3)`
                    : active ? `0 0 0 3px rgba(108,92,231,0.2)` : "none",
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
              {/* 라벨: 완료된 단계도 다음 단계로 넘어간 뒤 계속 보이게 유지 */}
              {showLabel && (
                <span
                  className="mt-1 max-w-[68px] rounded-md px-1 py-0.5 text-center text-[9px] leading-tight"
                  style={{ color: labelColor, backgroundColor: labelBg }}
                >
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
                  backgroundColor: i < (completedCount ?? currentStep) ? COLORS.mint : "#E8E0F0",
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
