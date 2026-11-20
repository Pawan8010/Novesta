import {
  ArrowRight,
  Building2,
  Coffee,
  Rocket,
  Stethoscope,
  Store,
  UtensilsCrossed,
} from 'lucide-react';
import { siteConfig, type IndustryItem } from '../config/site';
import { DrawingHairline } from './DrawingHairline';

interface IndustriesSectionProps {
  onSelectIndustry: (businessType: string) => void;
}

const industryIconMap: Record<IndustryItem['iconName'], typeof Building2> = {
  Building2,
  UtensilsCrossed,
  Coffee,
  Store,
  Stethoscope,
  Rocket,
};

const businessTypeMap: Record<string, string> = {
  hotels: 'Hotel / Resort',
  restaurants: 'Restaurant / Cloud Kitchen',
  cafes: 'Cafe / Bakery',
  retail: 'Retail Shop / Showroom',
  clinics: 'Clinic / Healthcare',
  startups: 'Startup / Tech Product',
};

export function IndustriesSection({ onSelectIndustry }: IndustriesSectionProps) {
  return (
    <section
      id="industries"
      aria-labelledby="industries-heading"
      className="bg-[var(--color-bg)] pt-16 text-[var(--color-ink)] sm:pt-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="mono-eyebrow text-[var(--color-ink-secondary)]">
            INDUSTRIES
          </p>
          <h2 id="industries-heading" className="heading-section mt-2 text-[var(--color-ink)]">
            Built for local businesses.
          </h2>
          <p className="mt-3 text-[16px] leading-6 text-[var(--color-ink-secondary)]">
            Tailored ordering, bookings, and search visibility for your category.
          </p>
        </div>

        {/* Clean responsive 1 / 2 / 3 column grid aligned across mobile, tablet, and desktop */}
        <div
          role="list"
          aria-label="Industries we serve"
          className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {siteConfig.industries.map((industry) => {
            const Icon = industryIconMap[industry.iconName];
            return (
              <article
                key={industry.id}
                role="listitem"
                className="flex flex-col justify-between rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-6 transition-colors hover:border-[var(--color-ink)] hover:bg-[var(--color-bg)]"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-xs)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-ink)]">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <h3 className="text-[18px] font-medium tracking-tight text-[var(--color-ink)]">
                      {industry.name}
                    </h3>
                  </div>

                  <p className="mt-4 text-[15px] leading-6 text-[var(--color-ink-secondary)]">
                    {industry.outcome}
                  </p>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => onSelectIndustry(businessTypeMap[industry.id] || 'Other')}
                    className="inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-full px-1 text-[14px] font-medium text-[var(--color-ink)] transition-colors hover:text-[var(--color-ink-secondary)]"
                  >
                    <span>Plan for {industry.name.split(' ')[0]}</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <DrawingHairline className="mt-16 sm:mt-24" />
    </section>
  );
}
