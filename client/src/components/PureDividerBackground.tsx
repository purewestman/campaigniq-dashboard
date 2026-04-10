import React from "react";

interface PureDividerProps {
  colorLeft?: string;
  colorTopRight?: string;
  colorBottomRight?: string;
  lineColor?: string;
  lineWidth?: number;
  className?: string;
}

export default function PureDividerBackground({
  colorLeft = "var(--color-basil-green)",
  colorTopRight = "color-mix(in srgb, var(--color-basil-green) 85%, var(--color-cloud-white))",
  colorBottomRight = "color-mix(in srgb, var(--color-basil-green) 70%, var(--color-cloud-white))",
  lineColor = "color-mix(in srgb, var(--color-cloud-white) 50%, transparent)",
  lineWidth = 0.5,
  className = "",
}: PureDividerProps) {
  return (
    <div className={`absolute inset-0 z-0 overflow-hidden pointer-events-none ${className}`}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        {/* Left Sector */}
        <path
          d="M 0 0 L 45 0 C 55 25, 60 50, 65 50 C 60 50, 55 75, 45 100 L 0 100 Z"
          fill={colorLeft}
        />
        
        {/* Top Right Sector */}
        <path
          d="M 45 0 C 55 25, 60 50, 65 50 L 100 50 L 100 0 Z"
          fill={colorTopRight}
        />
        
        {/* Bottom Right Sector */}
        <path
          d="M 45 100 C 55 75, 60 50, 65 50 L 100 50 L 100 100 Z"
          fill={colorBottomRight}
        />

        {/* Swooping Divider Lines */}
        <path
          d="M 45 0 C 55 25, 60 50, 65 50 L 100 50"
          fill="none"
          stroke={lineColor}
          strokeWidth={lineWidth}
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M 45 100 C 55 75, 60 50, 65 50"
          fill="none"
          stroke={lineColor}
          strokeWidth={lineWidth}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
