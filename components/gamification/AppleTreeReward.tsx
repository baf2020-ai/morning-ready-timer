"use client";

/* eslint-disable @next/next/no-img-element */
import { motion } from "framer-motion";

export type AppleRewardKind = "grow" | "fall";

interface AppleTreeRewardProps {
  appleCount: number;
  fallenCount?: number;
  sequence?: AppleRewardKind[];
  className?: string;
}

const RESULT_IMAGES: Record<AppleRewardKind, string> = {
  grow: "/images/morning-ready-success.png",
  fall: "/images/morning-ready-fail.png",
};

function getRewardKind({
  appleCount,
  fallenCount = 0,
  sequence,
}: Pick<AppleTreeRewardProps, "appleCount" | "fallenCount" | "sequence">): AppleRewardKind {
  if (sequence?.includes("fall") || fallenCount > 0) return "fall";
  if (sequence?.includes("grow") || appleCount > 0) return "grow";
  return "grow";
}

export default function AppleTreeReward({
  appleCount,
  fallenCount = 0,
  sequence,
  className,
}: AppleTreeRewardProps) {
  const rewardKind = getRewardKind({ appleCount, fallenCount, sequence });

  return (
    <motion.div
      className={`relative w-full overflow-hidden bg-[#FFF8F0] ${className ?? ""}`}
      style={{ aspectRatio: "1448 / 1086" }}
      aria-hidden="true"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <img
        src={RESULT_IMAGES[rewardKind]}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
    </motion.div>
  );
}
