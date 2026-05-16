"use client";
import { cn } from "@/lib/utils";

interface PebloLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  white?: boolean;
}

export function PebloLogo({ size = 32, className, showText = true, white }: PebloLogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Peblo mascot — inline SVG matching the uploaded logo character */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Body — rounded pebble shape */}
        <ellipse cx="20" cy="24" rx="13" ry="12" fill="#A78BFA" />
        <ellipse cx="20" cy="24" rx="13" ry="12" fill="url(#bodyGrad)" />

        {/* Shine */}
        <ellipse cx="15" cy="18" rx="3.5" ry="2" fill="white" fillOpacity="0.3" transform="rotate(-20 15 18)" />

        {/* Eyes */}
        <circle cx="16" cy="23" r="2.2" fill="#1E1B4B" />
        <circle cx="24" cy="23" r="2.2" fill="#1E1B4B" />
        <circle cx="16.8" cy="22.2" r="0.7" fill="white" />
        <circle cx="24.8" cy="22.2" r="0.7" fill="white" />

        {/* Smile */}
        <path d="M16.5 27 Q20 30 23.5 27" stroke="#1E1B4B" strokeWidth="1.2" strokeLinecap="round" fill="none" />

        {/* Cheeks */}
        <ellipse cx="13" cy="26" rx="2" ry="1.2" fill="#F9A8D4" fillOpacity="0.5" />
        <ellipse cx="27" cy="26" rx="2" ry="1.2" fill="#F9A8D4" fillOpacity="0.5" />

        {/* Crown */}
        <path d="M11 16 L13 10 L17 14 L20 8 L23 14 L27 10 L29 16 Z" fill="#FCD34D" />
        <path d="M11 16 L29 16 L28 19 L12 19 Z" fill="#F59E0B" />
        {/* Crown gems */}
        <circle cx="20" cy="11" r="1.5" fill="#7C3AED" />
        <circle cx="14" cy="13.5" r="1" fill="#EF4444" />
        <circle cx="26" cy="13.5" r="1" fill="#EF4444" />

        {/* Bag strap */}
        <path d="M26 30 Q30 28 31 32 Q30 35 26 34" fill="#D97706" />
        <rect x="24" y="30" width="8" height="6" rx="2" fill="#F59E0B" />
        <rect x="26" y="32" width="4" height="0.8" rx="0.4" fill="#D97706" />
        <circle cx="28" cy="33.5" r="0.8" fill="#D97706" />

        <defs>
          <linearGradient id="bodyGrad" x1="10" y1="14" x2="30" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C4B5FD" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
      </svg>

      {showText && (
        <span
          className={cn("font-bold text-sm tracking-tight", white ? "text-white" : "")}
          style={!white ? { color: "var(--text-primary)" } : {}}
        >
          Peblo Notes
        </span>
      )}
    </div>
  );
}
