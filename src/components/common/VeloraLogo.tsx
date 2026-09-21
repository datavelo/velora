import React from 'react';

interface VeloraLogoProps {
  /**
   * 'wordmark': Horizontal "VELORA" (ideal for headers and compact spaces)
   * 'brand': Gold monogram emblem + "VELORA" (ideal for invoice top, checkout, admin)
   * 'full': Gold monogram emblem + "VELORA" + "@velora.lk" (ideal for footer, auth portal)
   * 'icon': Standalone gold circular monogram emblem (for badges, avatars, watermarks)
   */
  variant?: 'wordmark' | 'brand' | 'full' | 'icon';
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
  height?: number | string;
  withTagline?: boolean;
}

export const VeloraEmblemSVG: React.FC<{ size?: number | string; className?: string }> = ({
  size = 48,
  className = '',
}) => (
  <svg
    viewBox="0 0 200 200"
    width={size}
    height={size}
    className={`shrink-0 ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="veloraGoldGrad" x1="15%" y1="0%" x2="85%" y2="100%">
        <stop offset="0%" stopColor="#C5A059" />
        <stop offset="25%" stopColor="#E2C98A" />
        <stop offset="50%" stopColor="#B88E44" />
        <stop offset="75%" stopColor="#EBD8A3" />
        <stop offset="100%" stopColor="#9C732B" />
      </linearGradient>
      <linearGradient id="veloraInnerCut" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF9E6" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#D9B76A" stopOpacity="0.2" />
      </linearGradient>
    </defs>

    {/* Outer Interlocking Circular Ring */}
    <circle
      cx="100"
      cy="112"
      r="44"
      stroke="url(#veloraGoldGrad)"
      strokeWidth="11"
      fill="none"
      strokeLinecap="round"
    />

    {/* Left Arm of 'V' - Outer Thick Diagonal */}
    <polygon
      points="48,34 76,34 100,146 86,146"
      fill="url(#veloraGoldGrad)"
    />

    {/* Left Arm of 'V' - Inner Parallel Rail (slotted channel) */}
    <polygon
      points="84,34 98,34 100,90 92,90"
      fill="url(#veloraGoldGrad)"
    />

    {/* Right Arm of 'V' - Solid Angled Band overlapping the ring */}
    <polygon
      points="152,34 124,34 100,146 114,146"
      fill="url(#veloraGoldGrad)"
    />

    {/* Inner Cut Accent to create distinct interlace depth */}
    <polygon
      points="63,46 72,46 97,138 92,138"
      fill="url(#veloraInnerCut)"
    />
  </svg>
);

export const VeloraLogo: React.FC<VeloraLogoProps> = ({
  variant = 'wordmark',
  className = '',
  theme = 'light',
  height,
  withTagline = false,
}) => {
  const isDark = theme === 'dark';
  const textColor = isDark ? '#FFFFFF' : '#0F0F0F';
  const handleColor = isDark ? '#D4AF37' : '#111111';

  // 1. Standalone Icon
  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <VeloraEmblemSVG size={height || 48} />
      </div>
    );
  }

  // 2. Horizontal Header Wordmark (matching 04_velora_header_wordmark & 05_velora_header_wordmark)
  if (variant === 'wordmark') {
    return (
      <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
        <VeloraEmblemSVG size={height ? Number(height) * 0.85 : 34} />
        <div className="flex flex-col justify-center">
          <span
            className="font-heading font-semibold tracking-[0.24em] text-lg sm:text-xl leading-none transition-colors"
            style={{ color: textColor, fontFamily: "'Cinzel', 'Playfair Display', serif" }}
          >
            VELORA
          </span>
          {withTagline && (
            <span className="text-[8px] tracking-[0.3em] uppercase text-neutral-400 font-medium mt-1">
              Colombo • Sri Lanka
            </span>
          )}
        </div>
      </div>
    );
  }

  // 3. Main Brand Logo (Emblem + VELORA text, matching 03_velora_main_brand_logo_1000x520)
  if (variant === 'brand') {
    return (
      <div className={`inline-flex flex-col items-center justify-center select-none text-center ${className}`}>
        <VeloraEmblemSVG size={height ? Number(height) * 0.65 : 62} />
        <span
          className="font-heading font-semibold tracking-[0.28em] text-xl sm:text-2xl mt-2 leading-none"
          style={{ color: textColor, fontFamily: "'Cinzel', 'Playfair Display', serif" }}
        >
          VELORA
        </span>
        {withTagline && (
          <span className="text-[9px] tracking-[0.32em] uppercase text-neutral-400 font-medium mt-1.5">
            Haute Couture &amp; Lifestyle
          </span>
        )}
      </div>
    );
  }

  // 4. Full Logo with @velora.lk handle (matching 02_velora_full_logo_1000x650)
  return (
    <div className={`inline-flex flex-col items-center justify-center select-none text-center ${className}`}>
      <VeloraEmblemSVG size={height ? Number(height) * 0.55 : 66} />
      <span
        className="font-heading font-semibold tracking-[0.28em] text-2xl sm:text-3xl mt-2 leading-none"
        style={{ color: textColor, fontFamily: "'Cinzel', 'Playfair Display', serif" }}
      >
        VELORA
      </span>
      <span
        className="text-xs sm:text-sm tracking-widest font-serif italic mt-2 opacity-90"
        style={{ color: handleColor, fontFamily: "'Playfair Display', 'Times New Roman', serif" }}
      >
        @velora.lk
      </span>
    </div>
  );
};
