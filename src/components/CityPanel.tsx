import { ArrowRight } from 'lucide-react';
import { siteConfig, type ReachCity } from '../config/site';

interface CityPanelProps {
  city: ReachCity;
  cityIndex: number;
  onGrowInCity: (cityName: string) => void;
}

const CITY_BENEFITS_BY_SERVICE: Record<string, string> = {
  'web-development': 'Fast mobile storefront launched in weeks',
  'online-product-building': 'Direct ordering and booking zero commission',
  'social-media-marketing': 'Targeted local reels and paid campaigns',
  'seo-google-ranking': 'Top search positions across city keywords',
  'google-maps-gbp': 'More map calls and route directions',
  'multi-platform-presence': 'Synced menus on Zomato and Swiggy',
  'ai-automation': 'Instant WhatsApp replies and lead capture',
};

export function CityPanel({ city, cityIndex, onGrowInCity }: CityPanelProps) {
  const allServices = siteConfig.services;
  const featuredServices = [0, 1, 2].map((offset) => {
    const idx = (cityIndex + offset) % allServices.length;
    return allServices[idx];
  });

  const hasVerifiedCounts =
    typeof city.clients === 'number' || typeof city.comingSoon === 'number';

  return (
    <div
      aria-live="polite"
      className="border-t border-[var(--color-globe-hairline)] pt-6"
    >
      <p className="mono-eyebrow text-[var(--color-surface-strong)]">
        {city.country}
      </p>

      <h3 className="heading-city mt-2 text-[var(--color-inverse-ink)]">
        {city.city}
      </h3>

      <p className="mt-3 text-[15px] leading-6 text-[var(--color-surface-strong)]">
        {city.summary}
      </p>

      {hasVerifiedCounts ? (
        <div className="mt-6 grid grid-cols-2 gap-6 border-y border-[var(--color-globe-hairline)] py-4">
          {typeof city.clients === 'number' && (
            <div>
              <p className="text-[36px] font-light leading-none tracking-[-0.03em] text-[var(--color-inverse-ink)] tabular-nums">
                {city.clients}
              </p>
              <p className="mono-eyebrow mt-2 text-[var(--color-surface-strong)]">
                ACTIVE CLIENTS
              </p>
            </div>
          )}
          {typeof city.comingSoon === 'number' && (
            <div>
              <p className="text-[36px] font-light leading-none tracking-[-0.03em] text-[var(--color-accent-signal)] tabular-nums">
                {city.comingSoon}
              </p>
              <p className="mono-eyebrow mt-2 text-[var(--color-surface-strong)]">
                IN LAUNCH QUEUE
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => onGrowInCity(city.city)}
            className="inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-full bg-[var(--color-accent-signal)] px-5 py-2.5 text-[14px] font-medium text-[var(--color-surface-inverse)] transition-opacity hover:opacity-90"
          >
            <span>Grow my business in {city.city}</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      <ul
        aria-label={`Priority services for ${city.city}`}
        className="mt-7 divide-y divide-[var(--color-globe-hairline)] border-t border-[var(--color-globe-hairline)]"
      >
        {featuredServices.map((service) => (
          <li
            key={service.id}
            className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
          >
            <div className="flex items-baseline gap-3">
              <span className="mono-eyebrow shrink-0 text-[var(--color-accent-signal)] tabular-nums">
                SV{service.number}
              </span>
              <span className="text-[14px] font-medium text-[var(--color-inverse-ink)]">
                {service.title}
              </span>
            </div>
            <span className="text-[13px] text-[var(--color-surface-strong)] sm:text-right">
              {CITY_BENEFITS_BY_SERVICE[service.id] || service.outcome}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
