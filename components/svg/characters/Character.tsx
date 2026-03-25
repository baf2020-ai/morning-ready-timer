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
          <path d="M65 85 Q70 82 75 85" stroke="#2B2040" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M125 85 Q130 82 135 85" stroke="#2B2040" strokeWidth="3" strokeLinecap="round" fill="none" />
        </>
      );
    case "worried":
      return (
        <>
          <circle cx="70" cy="82" r="6" fill="#2B2040" />
          <circle cx="130" cy="82" r="6" fill="#2B2040" />
          <circle cx="72" cy="80" r="2" fill="#FFF" />
          <circle cx="132" cy="80" r="2" fill="#FFF" />
        </>
      );
    case "cool":
      return (
        <>
          <rect x="55" y="76" width="35" height="14" rx="7" fill="#2B2040" />
          <rect x="110" y="76" width="35" height="14" rx="7" fill="#2B2040" />
          <line x1="90" y1="83" x2="110" y2="83" stroke="#2B2040" strokeWidth="2" />
        </>
      );
    case "excited":
      return (
        <>
          <circle cx="70" cy="80" r="8" fill="#2B2040" />
          <circle cx="130" cy="80" r="8" fill="#2B2040" />
          <circle cx="73" cy="77" r="3.5" fill="#FFF" />
          <circle cx="133" cy="77" r="3.5" fill="#FFF" />
          {/* 반짝이 */}
          <circle cx="78" cy="74" r="1.5" fill="#FFF" />
          <circle cx="138" cy="74" r="1.5" fill="#FFF" />
        </>
      );
    default: // happy
      return (
        <>
          <circle cx="70" cy="82" r="7" fill="#2B2040" />
          <circle cx="130" cy="82" r="7" fill="#2B2040" />
          <circle cx="73" cy="79" r="2.5" fill="#FFF" />
          <circle cx="133" cy="79" r="2.5" fill="#FFF" />
        </>
      );
  }
}

function Mouth({ expression }: { expression: Expression }) {
  switch (expression) {
    case "sleeping":
      return <ellipse cx="100" cy="108" rx="6" ry="4" fill="#2B2040" />;
    case "worried":
      return <path d="M85 112 Q100 105 115 112" stroke="#2B2040" strokeWidth="3" strokeLinecap="round" fill="none" />;
    case "excited":
      return (
        <>
          <path d="M78 105 Q100 128 122 105" fill={COLORS.accent} stroke="#2B2040" strokeWidth="2.5" />
          <path d="M84 105 Q100 118 116 105" fill="#FFF" />
        </>
      );
    case "cool":
      return <path d="M88 108 Q100 118 112 108" stroke="#2B2040" strokeWidth="3" strokeLinecap="round" fill="none" />;
    default: // happy
      return <path d="M82 105 Q100 122 118 105" stroke="#2B2040" strokeWidth="3.5" strokeLinecap="round" fill="none" />;
  }
}

function Cheeks({ type }: { type: CharacterType }) {
  const cheekColors: Record<CharacterType, string> = {
    bunny: "#FFB3C1",
    bear: "#B5E48C",
    cat: "#A0C4FF",
    penguin: "#C4B5FD",
  };
  return (
    <>
      <circle cx="53" cy="100" r="9" fill={cheekColors[type]} opacity="0.5" />
      <circle cx="147" cy="100" r="9" fill={cheekColors[type]} opacity="0.5" />
    </>
  );
}

function CharacterExtras({ type }: { type: CharacterType }) {
  switch (type) {
    case "bunny":
      return (
        <>
          {/* 더 부드러운 귀 (약간 비대칭) */}
          <ellipse cx="73" cy="28" rx="13" ry="32" fill={COLORS.bunny} stroke={COLORS.bunnyStroke} strokeWidth="3" transform="rotate(-5 73 28)" />
          <ellipse cx="73" cy="28" rx="6" ry="20" fill="#FFE0E6" />
          <ellipse cx="127" cy="26" rx="13" ry="32" fill={COLORS.bunny} stroke={COLORS.bunnyStroke} strokeWidth="3" transform="rotate(8 127 26)" />
          <ellipse cx="127" cy="26" rx="6" ry="20" fill="#FFE0E6" />
        </>
      );
    case "bear":
      return (
        <>
          <circle cx="55" cy="48" r="17" fill={COLORS.bear} stroke={COLORS.bearStroke} strokeWidth="3" />
          <circle cx="55" cy="48" r="9" fill="#D4EDAA" />
          <circle cx="145" cy="48" r="17" fill={COLORS.bear} stroke={COLORS.bearStroke} strokeWidth="3" />
          <circle cx="145" cy="48" r="9" fill="#D4EDAA" />
        </>
      );
    case "cat":
      return (
        <>
          <polygon points="60,33 43,55 77,55" fill={COLORS.cat} stroke={COLORS.catStroke} strokeWidth="3" strokeLinejoin="round" />
          <polygon points="60,39 50,52 70,52" fill="#D6EAFF" />
          <polygon points="140,33 123,55 157,55" fill={COLORS.cat} stroke={COLORS.catStroke} strokeWidth="3" strokeLinejoin="round" />
          <polygon points="140,39 130,52 150,52" fill="#D6EAFF" />
          {/* 수염 - 약간 곡선 */}
          <path d="M45 96 Q30 92 20 90" stroke={COLORS.textSub} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M45 102 Q30 103 20 106" stroke={COLORS.textSub} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M155 96 Q170 92 180 90" stroke={COLORS.textSub} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M155 102 Q170 103 180 106" stroke={COLORS.textSub} strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      );
    case "penguin":
      return (
        <>
          <ellipse cx="100" cy="115" rx="30" ry="35" fill="#FFFFFF" />
          {/* 날개 - 더 귀여운 형태 */}
          <ellipse cx="43" cy="105" rx="12" ry="24" fill={COLORS.penguin} stroke={COLORS.penguinStroke} strokeWidth="3" transform="rotate(-12 43 105)" />
          <ellipse cx="157" cy="105" rx="12" ry="24" fill={COLORS.penguin} stroke={COLORS.penguinStroke} strokeWidth="3" transform="rotate(12 157 105)" />
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
  bunny: COLORS.bunnyStroke,
  bear: COLORS.bearStroke,
  cat: COLORS.catStroke,
  penguin: COLORS.penguinStroke,
};

export default function Character({ type, expression = "happy", size = 80, className }: CharacterProps) {
  return (
    <div className={className}>
      <svg width={size} height={size} viewBox="0 0 200 180" fill="none">
        {/* Extras behind body */}
        {type !== "penguin" && <CharacterExtras type={type} />}

        {/* Body */}
        <ellipse cx="100" cy="105" rx="55" ry="60" fill={BODY_COLORS[type]} stroke={STROKE_COLORS[type]} strokeWidth="3.5" />

        {/* Penguin extras (on top of body) */}
        {type === "penguin" && <CharacterExtras type={type} />}

        {/* Face */}
        <Eyes expression={expression} />
        <Cheeks type={type} />
        <Mouth expression={expression} />
      </svg>
    </div>
  );
}
