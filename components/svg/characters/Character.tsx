/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import type { CharacterType } from "@/lib/types";

type Expression = "sleeping" | "happy" | "excited" | "cool" | "worried";
type CharacterVariant = "icon" | "card";

interface CharacterProps {
  type: CharacterType;
  expression?: Expression;
  size?: number;
  className?: string;
  variant?: CharacterVariant;
}

const CARD_ASPECT_RATIO = 760 / 1200;

const CHARACTER_ASSETS: Record<
  CharacterType,
  { label: string; icon: string; card: string }
> = {
  byeol: {
    label: "별이",
    icon: "/images/characters/byeol-icon.png",
    card: "/images/characters/byeol-card.png",
  },
  mori: {
    label: "모리",
    icon: "/images/characters/mori-icon.png",
    card: "/images/characters/mori-card.png",
  },
  pari: {
    label: "파리",
    icon: "/images/characters/pari-icon.png",
    card: "/images/characters/pari-card.png",
  },
  sosol: {
    label: "소솔",
    icon: "/images/characters/sosol-icon.png",
    card: "/images/characters/sosol-card.png",
  },
  dali: {
    label: "달이",
    icon: "/images/characters/dali-icon.png",
    card: "/images/characters/dali-card.png",
  },
};

export default function Character({
  type,
  size = 80,
  className,
  variant = "icon",
}: CharacterProps) {
  const asset = CHARACTER_ASSETS[type];
  const isCard = variant === "card";
  const style: CSSProperties = isCard
    ? { width: Math.round(size * CARD_ASPECT_RATIO), height: size }
    : { width: size, height: size };

  return (
    <span
      className={`inline-flex items-center justify-center overflow-hidden ${className ?? ""}`}
      style={style}
    >
      <img
        src={isCard ? asset.card : asset.icon}
        alt={asset.label}
        className="h-full w-full object-contain"
        draggable={false}
      />
    </span>
  );
}
