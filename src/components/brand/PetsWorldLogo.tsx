import React from "react";
import Link from "next/link";

interface PetsWorldLogoProps {
  variant?: "default" | "light" | "emblem-only";
  className?: string;
  showTagline?: boolean;
  asLink?: boolean;
}

export function PetsWorldLogo({
  variant = "default",
  className = "",
  showTagline = true,
  asLink = true,
}: PetsWorldLogoProps) {
  const isLight = variant === "light";
  const greenColor = isLight ? "#FFFFFF" : "#1F4D3A";
  const amberColor = isLight ? "#F4DFCB" : "#D98E3F";
  const taglineColor = isLight ? "#F4DFCB" : "#6B6560";

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Emblem SVG */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 w-9 h-9 sm:w-11 sm:h-11"
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="48" fill={isLight ? "#173B2C" : "#FFF8F0"} stroke={amberColor} strokeWidth="2.5" />
        
        {/* Stylized Dog profile */}
        <path
          d="M28 65C28 45 42 32 58 32C64 32 68 35 70 38C62 40 56 46 54 55C52 64 45 68 35 68C32 68 30 67 28 65Z"
          fill={greenColor}
        />
        {/* Stylized Cat profile */}
        <path
          d="M72 65C72 50 62 42 54 44C58 50 60 58 58 66C63 67 68 67 72 65Z"
          fill={amberColor}
        />
        {/* Stylized Bird perched */}
        <path
          d="M62 26C62 22 66 18 70 19C70 23 67 27 62 28V26Z"
          fill={amberColor}
        />
        {/* Central Paw Print */}
        <ellipse cx="50" cy="58" rx="6" ry="5" fill={isLight ? "#FFFFFF" : "#FFF8F0"} />
        <circle cx="43" cy="50" r="2.2" fill={isLight ? "#FFFFFF" : "#FFF8F0"} />
        <circle cx="47" cy="46" r="2.2" fill={isLight ? "#FFFFFF" : "#FFF8F0"} />
        <circle cx="53" cy="46" r="2.2" fill={isLight ? "#FFFFFF" : "#FFF8F0"} />
        <circle cx="57" cy="50" r="2.2" fill={isLight ? "#FFFFFF" : "#FFF8F0"} />
      </svg>

      {variant !== "emblem-only" && (
        <div className="flex flex-col">
          <div className="flex items-center text-xl sm:text-2xl font-black tracking-tight font-display leading-none">
            <span style={{ color: greenColor }}>Pets</span>
            <span style={{ color: amberColor }}>World</span>
            <span
              style={{ color: amberColor }}
              className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-current ml-0.5 mb-1"
            />
          </div>
          {showTagline && (
            <span
              style={{ color: taglineColor }}
              className="text-[8px] sm:text-[9px] font-bold tracking-[0.2em] uppercase mt-0.5 font-sans hidden min-[360px]:inline"
            >
              Happy Pets • Healthy Lives
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link href="/" aria-label="PetsWorld Home" className="inline-block transition-opacity hover:opacity-95">
        {content}
      </Link>
    );
  }

  return content;
}
