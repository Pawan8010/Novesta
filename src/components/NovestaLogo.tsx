import { siteConfig } from '../config/site';

interface NovestaLogoProps {
  variant?: 'header' | 'hero' | 'footer';
}

export function NovestaLogo({ variant = 'header' }: NovestaLogoProps) {
  if (variant === 'header') {
    return (
      <span className="group inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--color-ink)]/15 bg-[var(--color-logo-badge)] shadow-[var(--shadow-4)] ring-1 ring-[var(--color-inverse-ink)]/15 transition-all duration-200 hover:ring-[var(--color-inverse-ink)]/30">
        <img
          src={siteConfig.brand.iconPath}
          alt={siteConfig.brand.iconAlt}
          className="h-full w-full scale-[1.36] object-cover transition-transform duration-300 group-hover:scale-[1.44]"
          width={44}
          height={44}
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </span>
    );
  }

  const isHero = variant === 'hero';
  const isFooter = variant === 'footer';

  const containerSize = isHero
    ? 'h-12 pl-1.5 pr-5 gap-2.5 sm:h-[52px] sm:pl-2 sm:pr-6 sm:gap-3'
    : 'h-11 pl-1.5 pr-4 gap-2.5';

  const emblemSize = isHero ? 'h-9 w-9 sm:h-10 sm:w-10' : 'h-8 w-8';
  const textSize = isHero
    ? 'text-[16px] tracking-[0.18em] sm:text-[18px]'
    : 'text-[15px] tracking-[0.17em]';

  return (
    <span
      className={`group inline-flex shrink-0 items-center rounded-full border border-[var(--color-ink)]/15 bg-[var(--color-logo-badge)] text-[var(--color-inverse-ink)] shadow-[var(--shadow-4)] ring-1 ring-[var(--color-inverse-ink)]/10 transition-all duration-200 hover:ring-[var(--color-inverse-ink)]/25 ${containerSize}`}
    >
      <span
        className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-logo-badge)] ring-1 ring-[var(--color-inverse-ink)]/15 ${emblemSize}`}
      >
        <img
          src={siteConfig.brand.iconPath}
          alt={siteConfig.brand.iconAlt}
          className="h-full w-full scale-[1.36] object-cover transition-transform duration-300 group-hover:scale-[1.44]"
          width={40}
          height={40}
          loading={isFooter ? 'lazy' : 'eager'}
          decoding="async"
          fetchPriority={isFooter ? 'low' : 'high'}
        />
      </span>

      <span
        aria-hidden="true"
        className="h-4 w-px shrink-0 bg-[var(--color-inverse-ink)]/20"
      />

      <span
        className={`select-none whitespace-nowrap font-semibold uppercase leading-none text-[var(--color-inverse-ink)] ${textSize}`}
      >
        NOVESTA
      </span>
    </span>
  );
}
