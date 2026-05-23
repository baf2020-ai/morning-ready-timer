/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import type { CharacterType } from "@/lib/types";

type Expression = "sleeping" | "happy" | "excited" | "cool" | "worried";
type CharacterVariant = "icon" | "card" | "cutout";

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
  { label: string; icon: string; card: string; cutout: string }
> = {
  byeol: {
    label: "토토",
    icon: "/images/characters/byeol-icon.png",
    card: "/images/characters/byeol-card.png",
    cutout: "/images/characters/cutouts/byeol-cutout.png",
  },
  mori: {
    label: "도도",
    icon: "/images/characters/mori-icon.png",
    card: "/images/characters/mori-card.png",
    cutout: "/images/characters/cutouts/mori-cutout.png",
  },
  pari: {
    label: "초롱이",
    icon: "/images/characters/pari-icon.png",
    card: "/images/characters/pari-card.png",
    cutout: "/images/characters/cutouts/pari-cutout.png",
  },
  sosol: {
    label: "뾰족이",
    icon: "/images/characters/sosol-icon.png",
    card: "/images/characters/sosol-card.png",
    cutout: "/images/characters/cutouts/sosol-cutout.png",
  },
  dali: {
    label: "귀요미",
    icon: "/images/characters/dali-icon.png",
    card: "/images/characters/dali-card.png",
    cutout: "/images/characters/cutouts/dali-cutout.png",
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
  const src = variant === "card" ? asset.card : variant === "cutout" ? asset.cutout : asset.icon;
  const style: CSSProperties = isCard
    ? { width: Math.round(size * CARD_ASPECT_RATIO), height: size }
    : { width: size, height: size };

  return (
    <span
      className={`inline-flex items-center justify-center overflow-hidden ${className ?? ""}`}
      style={style}
    >
      <img
        src={src}
        alt={asset.label}
        className="h-full w-full object-contain"
        draggable={false}
      />
    </span>
  );
}
