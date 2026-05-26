/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import type { CharacterType } from "@/lib/types";
import { getCharacterDefinition, type CharacterAssetVariant } from "@/lib/constants";

type Expression = "sleeping" | "happy" | "excited" | "cool" | "worried";

interface CharacterProps {
  type: CharacterType | string | null | undefined;
  expression?: Expression;
  size?: number;
  className?: string;
  variant?: CharacterAssetVariant;
  fallbackType?: CharacterType;
}

const CARD_ASPECT_RATIO = 760 / 1200;

export default function Character({
  type,
  size = 80,
  className,
  variant = "icon",
  fallbackType,
}: CharacterProps) {
  const character = getCharacterDefinition(type, fallbackType);
  const isCard = variant === "card";
  const src = character.assets[variant];
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
        alt={character.label}
        className="h-full w-full object-contain"
        draggable={false}
      />
    </span>
  );
}
