import { ArrowRight } from 'lucide-react';
import { siteConfig } from '../config/site';
import { DrawingHairline } from './DrawingHairline';

interface HeroSectionProps {
  onConsultationClick: () => void;
}

export function HeroSection({ onConsultationClick }: HeroSectionProps) {
  const whatsappHref = `${siteConfig.contact.whatsappUrl}?text=${encodeURIComponent(
    siteConfig.contact.whatsappPrefillText
  )}`;

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="bg-[var(--color-bg)] pt-14 text-[var(--color-ink)] sm:pt-24 lg:pt-28"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
        {/* Small Black Weblance Logo Badge */}
        <div className="inline-flex h-11 w-[156px] items-center justify-center overflow-hidden rounded-[var(--radius-xs)] bg-[var(--color-logo-badge)] px-2.5 sm:h-12 sm:w-[172px]">
          <img
            src={siteConfig.brand.logoPath}
            alt={siteConfig.brand.logoAlt}
            className="h-full w-full scale-[1.2] object-cover object-center"
            width={172}
            height={48}
          />
        </div>

        {/* Giant Centered Display Headline */}
        <h1
          id="hero-heading"
          className="heading-hero mt-7 max-w-5xl text-center text-[var(--color-ink)] sm:mt-8"
        >
          {siteConfig.hero.headline}
        </h1>

        <p className="mt-5 max-w-2xl text-[16px] leading-7 text-[var(--color-ink-secondary)] sm:mt-6 sm:text-[20px] sm:leading-8">
          {siteConfig.hero.subheadline}
        </p>

        {/* Two Centered Pill CTAs */}
        <div className="mt-8 flex w-full max-w-xs flex-col items-stretch gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-4">
          <button
            type="button"
            onClick={onConsultationClick}
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[var(--color-inverse-bg)] px-7 py-3 text-[15px] font-medium text-[var(--color-inverse-ink)] transition-opacity hover:opacity-90 sm:w-auto"
          >
            <span>{siteConfig.hero.primaryCta}</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[48px] w-full items-center justify-center whitespace-nowrap rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-7 py-3 text-[15px] font-medium text-[var(--color-ink)] transition-colors hover:border-[var(--color-ink)] hover:bg-[var(--color-bg)] sm:w-auto"
          >
            {siteConfig.hero.secondaryCta}
          </a>
        </div>
      </div>

      <DrawingHairline className="mt-14 sm:mt-24 lg:mt-28" />
    </section>
  );
}
