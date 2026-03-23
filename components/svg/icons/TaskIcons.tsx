import type { TaskIconType } from "@/lib/types";

interface IconProps {
  className?: string;
  size?: number;
}

function BlanketIcon({ size = 80 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* 베개 */}
      <rect x="25" y="20" width="50" height="20" rx="10" fill="#FFB3BA" stroke="#FF6B6B" strokeWidth="3" />
      {/* 이불 */}
      <rect x="15" y="38" width="70" height="42" rx="8" fill="#FFDEE2" stroke="#FF6B6B" strokeWidth="3" />
      {/* 이불 접힌 부분 */}
      <path d="M15 55 Q50 48 85 55" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* 별 무늬 */}
      <circle cx="40" cy="62" r="4" fill="#FFE66D" />
      <circle cx="60" cy="58" r="3" fill="#FFE66D" />
    </svg>
  );
}

function MealIcon({ size = 80 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* 밥그릇 */}
      <ellipse cx="50" cy="65" rx="32" ry="10" fill="#FFE66D" stroke="#FF9F43" strokeWidth="3" />
      <path d="M18 65 Q18 45 50 40 Q82 45 82 65" fill="#FFE66D" stroke="#FF9F43" strokeWidth="3" />
      {/* 밥 */}
      <ellipse cx="50" cy="48" rx="25" ry="8" fill="#FFFFFF" stroke="#DDD" strokeWidth="2" />
      {/* 김 올라오는 효과 */}
      <path d="M40 30 Q38 22 42 15" stroke="#DDD" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M50 28 Q48 20 52 12" stroke="#CCC" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M60 30 Q58 22 62 15" stroke="#DDD" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function BrushIcon({ size = 80 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* 칫솔 손잡이 */}
      <rect x="22" y="50" width="56" height="12" rx="6" fill="#4ECDC4" stroke="#2EAF9F" strokeWidth="3" />
      {/* 칫솔 머리 */}
      <rect x="12" y="45" width="18" height="22" rx="4" fill="#FFFFFF" stroke="#2EAF9F" strokeWidth="3" />
      {/* 칫솔모 */}
      <line x1="16" y1="50" x2="16" y2="62" stroke="#BAE1FF" strokeWidth="2" strokeLinecap="round" />
      <line x1="21" y1="50" x2="21" y2="62" stroke="#BAE1FF" strokeWidth="2" strokeLinecap="round" />
      <line x1="26" y1="50" x2="26" y2="62" stroke="#BAE1FF" strokeWidth="2" strokeLinecap="round" />
      {/* 거품 방울 */}
      <circle cx="35" cy="32" r="6" fill="#E8F8FF" stroke="#BAE1FF" strokeWidth="2" />
      <circle cx="50" cy="28" r="8" fill="#E8F8FF" stroke="#BAE1FF" strokeWidth="2" />
      <circle cx="62" cy="35" r="5" fill="#E8F8FF" stroke="#BAE1FF" strokeWidth="2" />
    </svg>
  );
}

function ClothesIcon({ size = 80 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* 티셔츠 */}
      <path
        d="M30 30 L20 40 L28 44 L28 75 Q28 78 31 78 L69 78 Q72 78 72 75 L72 44 L80 40 L70 30 L62 36 Q56 28 44 28 Q38 36 30 30Z"
        fill="#BAE1FF"
        stroke="#74B9FF"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* 옷걸이 */}
      <path d="M50 10 L50 20" stroke="#888" strokeWidth="3" strokeLinecap="round" />
      <path d="M35 28 Q50 15 65 28" stroke="#888" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* 별 장식 */}
      <circle cx="50" cy="55" r="5" fill="#FFE66D" />
    </svg>
  );
}

function BackpackIcon({ size = 80 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* 가방 본체 */}
      <rect x="25" y="30" width="50" height="50" rx="12" fill="#51CF66" stroke="#2ECC71" strokeWidth="3" />
      {/* 가방 뚜껑 */}
      <path d="M30 35 Q50 20 70 35" fill="#51CF66" stroke="#2ECC71" strokeWidth="3" />
      {/* 포켓 */}
      <rect x="35" y="55" width="30" height="18" rx="5" fill="#BAFFC9" stroke="#2ECC71" strokeWidth="2" />
      {/* 지퍼 */}
      <line x1="50" y1="55" x2="50" y2="73" stroke="#2ECC71" strokeWidth="2" />
      {/* 어깨끈 */}
      <path d="M30 35 Q25 15 35 12" stroke="#2ECC71" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M70 35 Q75 15 65 12" stroke="#2ECC71" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* 체크마크 */}
      <path d="M42 64 L48 70 L58 58" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShoesIcon({ size = 80 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* 왼쪽 신발 */}
      <path
        d="M12 55 Q12 40 25 38 L40 38 Q48 38 48 50 L48 60 Q48 68 40 68 L20 68 Q12 68 12 60Z"
        fill="#E8BAFF"
        stroke="#A29BFE"
        strokeWidth="3"
      />
      <circle cx="30" cy="48" r="3" fill="#FFFFFF" />
      <circle cx="38" cy="48" r="3" fill="#FFFFFF" />
      {/* 오른쪽 신발 */}
      <path
        d="M52 55 Q52 40 65 38 L80 38 Q88 38 88 50 L88 60 Q88 68 80 68 L60 68 Q52 68 52 60Z"
        fill="#E8BAFF"
        stroke="#A29BFE"
        strokeWidth="3"
      />
      <circle cx="70" cy="48" r="3" fill="#FFFFFF" />
      <circle cx="78" cy="48" r="3" fill="#FFFFFF" />
      {/* 끈 */}
      <path d="M22 48 Q30 42 38 48" stroke="#A29BFE" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M62 48 Q70 42 78 48" stroke="#A29BFE" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

const ICON_MAP: Record<TaskIconType, React.FC<IconProps>> = {
  blanket: BlanketIcon,
  meal: MealIcon,
  brush: BrushIcon,
  clothes: ClothesIcon,
  backpack: BackpackIcon,
  shoes: ShoesIcon,
};

export default function TaskIcon({ icon, size = 80, className }: IconProps & { icon: TaskIconType }) {
  const Component = ICON_MAP[icon];
  return (
    <div className={className}>
      <Component size={size} />
    </div>
  );
}
