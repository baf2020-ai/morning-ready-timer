import type { CharacterType } from "@/lib/types";
import { COLORS } from "@/lib/constants";

type Expression = "sleeping" | "happy" | "excited" | "cool" | "worried";

interface CharacterProps {
  type: CharacterType;
  expression?: Expression;
  size?: number;
  className?: string;
}

function Eyes({ expression }: { expression: Expression }) {
  switch (expression) {
    case "sleeping":
      return (
        <>
          <path d="M65 85 Q70 82 75 85" stroke="#333" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M125 85 Q130 82 135 85" stroke="#333" strokeWidth="3" strokeLinecap="round" fill="none" />
        </>
      );
    case "worried":
      return (
        <>
          <circle cx="70" cy="82" r="6" fill="#333" />
          <circle cx="130" cy="82" r="6" fill="#333" />
          <circle cx="72" cy="80" r="2" fill="#FFF" />
          <circle cx="132" cy="80" r="2" fill="#FFF" />
        </>
      );
    case "cool":
      return (
        <>
          <rect x="55" y="76" width="35" height="14" rx="7" fill="#333" />
          <rect x="110" y="76" width="35" height="14" rx="7" fill="#333" />
          <line x1="90" y1="83" x2="110" y2="83" stroke="#333" strokeWidth="2" />
        </>
      );
    case "excited":
      return (
        <>
          <circle cx="70" cy="80" r="8" fill="#333" />
          <circle cx="130" cy="80" r="8" fill="#333" />
          <circle cx="73" cy="77" r="3" fill="#FFF" />
          <circle cx="133" cy="77" r="3" fill="#FFF" />
        </>
      );
    default: // happy
      return (
        <>
          <circle cx="70" cy="82" r="7" fill="#333" />
          <circle cx="130" cy="82" r="7" fill="#333" />
          <circle cx="72" cy="80" r="2.5" fill="#FFF" />
          <circle cx="132" cy="80" r="2.5" fill="#FFF" />
        </>
      );
  }
}

function Mouth({ expression }: { expression: Expression }) {
  switch (expression) {
    case "sleeping":
      return <ellipse cx="100" cy="108" rx="6" ry="4" fill="#333" />;
    case "worried":
      return <path d="M85 112 Q100 105 115 112" stroke="#333" strokeWidth="3" strokeLinecap="round" fill="none" />;
    case "excited":
      return (
        <>
          <path d="M80 105 Q100 125 120 105" fill="#FF6B6B" stroke="#333" strokeWidth="2" />
          <path d="M85 105 Q100 115 115 105" fill="#FFF" />
        </>
      );
    case "cool":
      return <path d="M88 108 Q100 118 112 108" stroke="#333" strokeWidth="3" strokeLinecap="round" fill="none" />;
    default: // happy
      return <path d="M82 105 Q100 120 118 105" stroke="#333" strokeWidth="3" strokeLinecap="round" fill="none" />;
  }
}

function Cheeks() {
  return (
    <>
      <circle cx="55" cy="100" r="8" fill="#FFB3BA" opacity="0.5" />
      <circle cx="145" cy="100" r="8" fill="#FFB3BA" opacity="0.5" />
    </>
  );
}

function CharacterExtras({ type }: { type: CharacterType }) {
  switch (type) {
    case "bunny":
      return (
        <>
          <ellipse cx="75" cy="30" rx="12" ry="30" fill={COLORS.bunny} stroke="#FF6B6B" strokeWidth="3" />
          <ellipse cx="75" cy="30" rx="6" ry="20" fill="#FFF0F2" />
          <ellipse cx="125" cy="30" rx="12" ry="30" fill={COLORS.bunny} stroke="#FF6B6B" strokeWidth="3" />
          <ellipse cx="125" cy="30" rx="6" ry="20" fill="#FFF0F2" />
        </>
      );
    case "bear":
      return (
        <>
          <circle cx="55" cy="48" r="16" fill={COLORS.bear} stroke="#2ECC71" strokeWidth="3" />
          <circle cx="55" cy="48" r="8" fill="#E8FFE8" />
          <circle cx="145" cy="48" r="16" fill={COLORS.bear} stroke="#2ECC71" strokeWidth="3" />
          <circle cx="145" cy="48" r="8" fill="#E8FFE8" />
        </>
      );
    case "cat":
      return (
        <>
          <polygon points="60,35 45,55 75,55" fill={COLORS.cat} stroke="#74B9FF" strokeWidth="3" strokeLinejoin="round" />
          <polygon points="60,40 52,52 68,52" fill="#E8F4FF" />
          <polygon points="140,35 125,55 155,55" fill={COLORS.cat} stroke="#74B9FF" strokeWidth="3" strokeLinejoin="round" />
          <polygon points="140,40 132,52 148,52" fill="#E8F4FF" />
          {/* 수염 */}
          <line x1="45" y1="96" x2="25" y2="92" stroke="#AAA" strokeWidth="2" />
          <line x1="45" y1="100" x2="25" y2="102" stroke="#AAA" strokeWidth="2" />
          <line x1="155" y1="96" x2="175" y2="92" stroke="#AAA" strokeWidth="2" />
          <line x1="155" y1="100" x2="175" y2="102" stroke="#AAA" strokeWidth="2" />
        </>
      );
    case "penguin":
      return (
        <>
          {/* 흰 배 */}
          <ellipse cx="100" cy="115" rx="30" ry="35" fill="#FFFFFF" />
          {/* 작은 날개 */}
          <ellipse cx="45" cy="105" rx="10" ry="22" fill={COLORS.penguin} stroke="#A29BFE" strokeWidth="3" transform="rotate(-10 45 105)" />
          <ellipse cx="155" cy="105" rx="10" ry="22" fill={COLORS.penguin} stroke="#A29BFE" strokeWidth="3" transform="rotate(10 155 105)" />
        </>
      );
  }
}

const BODY_COLORS: Record<CharacterType, string> = {
  bunny: COLORS.bunny,
  bear: COLORS.bear,
  cat: COLORS.cat,
  penguin: COLORS.penguin,
};

const STROKE_COLORS: Record<CharacterType, string> = {
  bunny: "#FF6B6B",
  bear: "#2ECC71",
  cat: "#74B9FF",
  penguin: "#A29BFE",
};

export default function Character({ type, expression = "happy", size = 80, className }: CharacterProps) {
  return (
    <div className={className}>
      <svg width={size} height={size} viewBox="0 0 200 180" fill="none">
        {/* Extras behind body */}
        {type === "bunny" && <CharacterExtras type={type} />}
        {type === "bear" && <CharacterExtras type={type} />}
        {type === "cat" && <CharacterExtras type={type} />}

        {/* Body */}
        <ellipse cx="100" cy="105" rx="55" ry="60" fill={BODY_COLORS[type]} stroke={STROKE_COLORS[type]} strokeWidth="3" />

        {/* Penguin extras (on top of body) */}
        {type === "penguin" && <CharacterExtras type={type} />}

        {/* Face */}
        <Eyes expression={expression} />
        <Cheeks />
        <Mouth expression={expression} />

      </svg>
    </div>
  );
}
