type OrnamentProps = {
  className?: string;
};

/**
 * Arkhar Muyuz — the iconic Kyrgyz ram's horn ornament.
 * Two opposing filled comma-spiral scrolls, the most characteristic
 * motif of Kyrgyz shyrdak felt art.
 */
export function ArkharMuyuz({ className = '' }: OrnamentProps) {
  return (
    <svg className={className} viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left horn — curls clockwise, tip at top */}
      <path
        d="M100 60
           C 70 60, 45 45, 40 25
           C 37 12, 50 5, 62 8
           C 73 11, 78 22, 73 30
           C 69 37, 60 38, 56 33
           C 53 29, 55 25, 58 25
           C 61 25, 62 27, 61 29"
        fill="currentColor"
        opacity="0.85"
      />
      {/* Right horn — curls counter-clockwise, mirrored */}
      <path
        d="M100 60
           C 130 60, 155 45, 160 25
           C 163 12, 150 5, 138 8
           C 127 11, 122 22, 127 30
           C 131 37, 140 38, 144 33
           C 147 29, 145 25, 142 25
           C 139 25, 138 27, 139 29"
        fill="currentColor"
        opacity="0.85"
      />
      {/* Central dot */}
      <circle cx="100" cy="60" r="5" fill="currentColor" />
      {/* Outer accent curves */}
      <path
        d="M100 60 C 80 80, 60 90, 50 85 C 42 81, 42 72, 48 70"
        stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"
      />
      <path
        d="M100 60 C 120 80, 140 90, 150 85 C 158 81, 158 72, 152 70"
        stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"
      />
    </svg>
  );
}

/**
 * Single horn scroll — for corners and accents.
 * Filled comma shape curling inward.
 */
export function ArkharSingle({ className = '' }: OrnamentProps) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M50 50
           C 50 30, 35 15, 20 18
           C 8 21, 5 35, 12 42
           C 18 48, 28 47, 32 42
           C 35 38, 33 33, 28 33
           C 24 33, 23 36, 25 38"
        fill="currentColor"
        opacity="0.8"
      />
      <path
        d="M50 50
           C 50 70, 65 85, 80 82
           C 92 79, 95 65, 88 58
           C 82 52, 72 53, 68 58
           C 65 62, 67 67, 72 67
           C 76 67, 77 64, 75 62"
        fill="currentColor"
        opacity="0.8"
      />
      <circle cx="50" cy="50" r="4" fill="currentColor" />
    </svg>
  );
}

/**
 * Tunduk — the Kyrgyz yurt crown symbol.
 * Concentric circles with radiating spokes and diamond accents.
 */
export function TundukMotif({ className = '' }: OrnamentProps) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="currentColor" strokeWidth="1.5" fill="none">
        {/* Outer ring */}
        <circle cx="60" cy="60" r="52" strokeWidth="2" />
        <circle cx="60" cy="60" r="42" />
        <circle cx="60" cy="60" r="28" strokeWidth="2" />
        <circle cx="60" cy="60" r="14" />
        <circle cx="60" cy="60" r="5" fill="currentColor" />

        {/* Radiating spokes */}
        <line x1="60" y1="8" x2="60" y2="112" strokeWidth="2" />
        <line x1="8" y1="60" x2="112" y2="60" strokeWidth="2" />
        <line x1="23" y1="23" x2="97" y2="97" />
        <line x1="97" y1="23" x2="23" y2="97" />

        {/* Diamond accents at spoke ends */}
        <path d="M60 4 L64 12 L60 20 L56 12 Z" fill="currentColor" opacity="0.4" />
        <path d="M60 100 L64 108 L60 116 L56 108 Z" fill="currentColor" opacity="0.4" />
        <path d="M4 60 L12 56 L20 60 L12 64 Z" fill="currentColor" opacity="0.4" />
        <path d="M100 60 L108 56 L116 60 L108 64 Z" fill="currentColor" opacity="0.4" />

        {/* Inner curl accents between spokes */}
        <path d="M60 28 C 68 28, 72 34, 68 38 C 65 41, 60 39, 62 35" fill="none" strokeWidth="1" opacity="0.5" />
        <path d="M60 92 C 52 92, 48 86, 52 82 C 55 79, 60 81, 58 85" fill="none" strokeWidth="1" opacity="0.5" />
        <path d="M28 60 C 28 52, 34 48, 38 52 C 41 55, 39 60, 35 58" fill="none" strokeWidth="1" opacity="0.5" />
        <path d="M92 60 C 92 68, 86 72, 82 68 C 79 65, 81 60, 85 62" fill="none" strokeWidth="1" opacity="0.5" />
      </g>
    </svg>
  );
}

/**
 * Horn border — horizontal repeating scroll pattern for dividers and borders.
 */
export function HornMotif({ className = '' }: OrnamentProps) {
  return (
    <svg className={className} viewBox="0 0 300 50" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <g fill="currentColor" opacity="0.7">
        {/* Left scroll */}
        <path d="M20 25 C 10 25, 5 15, 12 10 C 18 6, 25 10, 25 16 C 25 20, 21 22, 18 20 C 16 19, 16 17, 18 17" />
        {/* Right scroll (mirrored) */}
        <path d="M50 25 C 60 25, 65 15, 58 10 C 52 6, 45 10, 45 16 C 45 20, 49 22, 52 20 C 54 19, 54 17, 52 17" />
        {/* Center connecting curl */}
        <path d="M35 25 C 33 20, 37 15, 35 10 C 33 15, 37 20, 35 25" fill="currentColor" opacity="0.4" />

        {/* Repeat pattern */}
        <path d="M120 25 C 110 25, 105 15, 112 10 C 118 6, 125 10, 125 16 C 125 20, 121 22, 118 20 C 116 19, 116 17, 118 17" />
        <path d="M150 25 C 160 25, 165 15, 158 10 C 152 6, 145 10, 145 16 C 145 20, 149 22, 152 20 C 154 19, 154 17, 152 17" />
        <path d="M135 25 C 133 20, 137 15, 135 10 C 133 15, 137 20, 135 25" fill="currentColor" opacity="0.4" />

        {/* Third repeat */}
        <path d="M220 25 C 210 25, 205 15, 212 10 C 218 6, 225 10, 225 16 C 225 20, 221 22, 218 20 C 216 19, 216 17, 218 17" />
        <path d="M250 25 C 260 25, 265 15, 258 10 C 252 6, 245 10, 245 16 C 245 20, 249 22, 252 20 C 254 19, 254 17, 252 17" />
        <path d="M235 25 C 233 20, 237 15, 235 10 C 233 15, 237 20, 235 25" fill="currentColor" opacity="0.4" />
      </g>
      {/* Connecting line */}
      <line x1="0" y1="25" x2="300" y2="25" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
    </svg>
  );
}

/**
 * Shyrdak pattern — geometric felt rug motif with scrolling horns.
 */
export function ShyrdakPattern({ className = '' }: OrnamentProps) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g fill="currentColor" opacity="0.5">
        {/* Top horn pair */}
        <path d="M60 15 C 50 15, 42 8, 45 20 C 47 28, 55 28, 58 22 C 60 18, 57 16, 55 18" />
        <path d="M60 15 C 70 15, 78 8, 75 20 C 73 28, 65 28, 62 22 C 60 18, 63 16, 65 18" />
        {/* Bottom horn pair */}
        <path d="M60 105 C 50 105, 42 112, 45 100 C 47 92, 55 92, 58 98 C 60 102, 57 104, 55 102" />
        <path d="M60 105 C 70 105, 78 112, 75 100 C 73 92, 65 92, 62 98 C 60 102, 63 104, 65 102" />
        {/* Left horn pair */}
        <path d="M15 60 C 15 50, 8 42, 20 45 C 28 47, 28 55, 22 58 C 18 60, 16 57, 18 55" />
        <path d="M15 60 C 15 70, 8 78, 20 75 C 28 73, 28 65, 22 62 C 18 60, 16 63, 18 65" />
        {/* Right horn pair */}
        <path d="M105 60 C 105 50, 112 42, 100 45 C 92 47, 92 55, 98 58 C 102 60, 104 57, 102 55" />
        <path d="M105 60 C 105 70, 112 78, 100 75 C 92 73, 92 65, 98 62 C 102 60, 104 63, 102 65" />
        {/* Center */}
        <circle cx="60" cy="60" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="60" cy="60" r="2" />
      </g>
    </svg>
  );
}

/**
 * Kochkor — four-horn cross pattern (kochkor muyuz).
 * Four ram's horn scrolls radiating from center.
 */
export function KochkorMotif({ className = '' }: OrnamentProps) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g fill="currentColor" opacity="0.7">
        {/* Top horn */}
        <path d="M50 50 C 50 35, 42 22, 35 20 C 28 18, 25 28, 30 33 C 34 37, 40 36, 42 32 C 43 29, 41 27, 39 28" />
        {/* Bottom horn */}
        <path d="M50 50 C 50 65, 58 78, 65 80 C 72 82, 75 72, 70 67 C 66 63, 60 64, 58 68 C 57 71, 59 73, 61 72" />
        {/* Left horn */}
        <path d="M50 50 C 35 50, 22 42, 20 35 C 18 28, 28 25, 33 30 C 37 34, 36 40, 32 42 C 29 43, 27 41, 28 39" />
        {/* Right horn */}
        <path d="M50 50 C 65 50, 78 58, 80 65 C 82 72, 72 75, 67 70 C 63 66, 64 60, 68 58 C 71 57, 73 59, 72 61" />
      </g>
      <circle cx="50" cy="50" r="4" fill="currentColor" />
    </svg>
  );
}

/**
 * Corner ornament — L-shaped scroll for framing corners.
 */
export function CornerOrnament({ className = '' }: OrnamentProps) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g fill="currentColor" opacity="0.6">
        {/* Horizontal horn */}
        <path d="M10 10 L 60 10 C 68 10, 72 16, 68 22 C 64 27, 56 26, 54 21 C 53 18, 55 16, 57 17" />
        {/* Vertical horn */}
        <path d="M10 10 L 10 60 C 10 68, 16 72, 22 68 C 27 64, 26 56, 21 54 C 18 53, 16 55, 17 57" />
        {/* Corner curl */}
        <path d="M10 10 C 20 20, 30 25, 35 22 C 38 20, 36 16, 32 18 C 30 19, 28 21, 26 20" />
      </g>
      <circle cx="10" cy="10" r="3" fill="currentColor" />
    </svg>
  );
}

/**
 * Border ornament — repeating horn scrolls for horizontal dividers.
 */
export function BorderOrnament({ className = '' }: OrnamentProps) {
  return (
    <svg className={className} viewBox="0 0 400 30" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <g fill="currentColor" opacity="0.5">
        {Array.from({ length: 8 }).map((_, i) => {
          const x = 25 + i * 50;
          return (
            <g key={i}>
              <path d={`M${x} 15 C ${x - 8} 15, ${x - 12} 8, ${x - 4} 5 C ${x + 2} 2, ${x + 8} 6, ${x + 6} 11 C ${x + 4} 14, ${x} 14, ${x - 1} 11`} />
              <path d={`M${x} 15 C ${x + 8} 15, ${x + 12} 22, ${x + 4} 25 C ${x - 2} 28, ${x - 8} 24, ${x - 6} 19 C ${x - 4} 16, ${x} 16, ${x + 1} 19`} />
              <circle cx={x} cy="15" r="1.5" />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
