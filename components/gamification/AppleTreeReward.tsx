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

const TREE_SLOTS = [
  { x: 41, y: 29, size: 5.4 },
  { x: 46, y: 33, size: 4.1 },
  { x: 61, y: 32, size: 5.6 },
  { x: 68, y: 36, size: 5.2 },
  { x: 58, y: 41, size: 5.9 },
  { x: 66, y: 44, size: 5.3 },
  { x: 38, y: 43, size: 4.4 },
  { x: 54, y: 36, size: 4.2 },
  { x: 31, y: 42, size: 4.1 },
  { x: 73, y: 42, size: 4.8 },
  { x: 48, y: 22, size: 4.1 },
  { x: 63, y: 23, size: 4.2 },
] as const;

const GROUND_SLOTS = [
  { x: 38, y: 74 },
  { x: 47, y: 77 },
  { x: 56, y: 75 },
  { x: 63, y: 77 },
  { x: 70, y: 74 },
  { x: 31, y: 76 },
] as const;

type TreeSlot = (typeof TREE_SLOTS)[number];
type GroundSlot = (typeof GROUND_SLOTS)[number];
type RewardItem =
  | { kind: "grow"; index: number; delay: number; slot: TreeSlot }
  | { kind: "fall"; index: number; delay: number; startSlot: TreeSlot; groundSlot: GroundSlot };

function AppleSprite() {
  return (
    <svg viewBox="-24 -30 48 58" width="100%" height="100%" fill="none" aria-hidden="true">
      <path
        d="M-5 -12C-10 -20 -22 -15 -22 -3C-22 10 -12 25 -2 25C2 25 5 23 7 20C9 23 12 25 16 25C25 25 32 8 29 -5C27 -16 15 -19 8 -11C4 -16 0 -16 -5 -12Z"
        fill="#F45D47"
        stroke="#B7382D"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M7 -12C7 -21 12 -26 18 -28"
        stroke="#8B5A2B"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M12 -22C20 -28 29 -25 31 -16C23 -15 17 -16 12 -22Z"
        fill="#70C85A"
        stroke="#3C8D3F"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="-9" cy="-6" r="5" fill="#FFEFA0" opacity="0.62" />
      <circle cx="-13" cy="-12" r="2.2" fill="#FFFFFF" opacity="0.75" />
      <path d="M-1 20C6 23 14 20 19 14" stroke="#D94A38" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function buildSequence(appleCount: number, fallenCount: number): AppleRewardKind[] {
  return [
    ...Array.from({ length: Math.max(appleCount, 0) }, () => "grow" as const),
    ...Array.from({ length: Math.max(fallenCount, 0) }, () => "fall" as const),
  ];
}

function buildRewardItems(rewardSequence: AppleRewardKind[]): RewardItem[] {
  let grownIndex = 0;
  let fallenIndex = 0;

  return rewardSequence.map((kind, index) => {
    const delay = 0.45 + index * 0.38;

    if (kind === "grow") {
      const item: RewardItem = {
        kind,
        index,
        delay,
        slot: TREE_SLOTS[grownIndex % TREE_SLOTS.length],
      };
      grownIndex += 1;
      return item;
    }

    const item: RewardItem = {
      kind,
      index,
      delay,
      startSlot: TREE_SLOTS[(grownIndex + fallenIndex) % TREE_SLOTS.length],
      groundSlot: GROUND_SLOTS[fallenIndex % GROUND_SLOTS.length],
    };
    fallenIndex += 1;
    return item;
  });
}

export default function AppleTreeReward({
  appleCount,
  fallenCount = 0,
  sequence,
  className,
}: AppleTreeRewardProps) {
  const rewardSequence = sequence ?? buildSequence(appleCount, fallenCount);
  const rewardItems = buildRewardItems(rewardSequence);

  return (
    <div
      className={`relative w-full overflow-hidden ${className ?? ""}`}
      style={{ aspectRatio: "2816 / 1536" }}
      aria-hidden="true"
    >
      <img
        src="/images/apple-tree-reward-bg.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 pointer-events-none">
        {rewardItems.map((item) => {
          if (item.kind === "grow") {
            return (
              <motion.div
                key={`grow-${item.index}`}
                className="absolute"
                style={{ left: `${item.slot.x}%`, top: `${item.slot.y}%`, width: `${item.slot.size}%` }}
                initial={{ opacity: 0, y: -24, scale: 0.4, rotate: -8 }}
                animate={{ opacity: 1, y: 0, scale: [0.4, 1.18, 1], rotate: [-8, 5, 0] }}
                transition={{ delay: item.delay, duration: 0.62, ease: "backOut" }}
              >
                <div style={{ transform: "translate(-50%, -50%)" }}>
                  <AppleSprite />
                </div>
              </motion.div>
            );
          }

          return (
            <motion.div
              key={`fall-${item.index}`}
              className="absolute"
              style={{ width: `${item.startSlot.size}%` }}
              initial={{
                left: `${item.startSlot.x}%`,
                top: `${item.startSlot.y}%`,
                opacity: 0,
                scale: 0.78,
                rotate: -4,
              }}
              animate={{
                left: [`${item.startSlot.x}%`, `${item.startSlot.x}%`, `${item.groundSlot.x}%`],
                top: [`${item.startSlot.y}%`, `${item.startSlot.y + 3}%`, `${item.groundSlot.y}%`],
                opacity: [0, 1, 1],
                scale: [0.78, 1.05, 0.92],
                rotate: [-4, 10, 128],
              }}
              transition={{ delay: item.delay, duration: 1.02, ease: [0.2, 0.7, 0.2, 1] }}
            >
              <div style={{ transform: "translate(-50%, -50%)" }}>
                <AppleSprite />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
