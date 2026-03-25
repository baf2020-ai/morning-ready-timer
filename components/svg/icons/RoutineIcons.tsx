// WKWebView 호환 루틴 아이콘 (이모지 대신 SVG)

export function SunIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="5" fill="#FFAD42" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 12 + 7.5 * Math.cos(rad);
        const y1 = 12 + 7.5 * Math.sin(rad);
        const x2 = 12 + 10 * Math.cos(rad);
        const y2 = 12 + 10 * Math.sin(rad);
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FFAD42" strokeWidth="2" strokeLinecap="round" />;
      })}
    </svg>
  );
}

export function MoonIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        fill="#7C6CDB"
        stroke="#5B4BBE"
        strokeWidth="1"
      />
    </svg>
  );
}
