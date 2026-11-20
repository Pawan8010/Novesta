import { useRef, useState } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import type { ReachCity } from '../config/site';

interface CityPillsProps {
  cities: ReachCity[];
  selectedCityId: string;
  onSelectCity: (cityId: string) => void;
  onGrowInCity: (cityName: string) => void;
}

export function CityPills({
  cities,
  selectedCityId,
  onSelectCity,
  onGrowInCity,
}: CityPillsProps) {
  const pillRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [customOpen, setCustomOpen] = useState(false);
  const [customCity, setCustomCity] = useState('');

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const total = cities.length;
    let nextIndex: number | null = null;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (index + 1) % total;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (index - 1 + total) % total;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = total - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      onSelectCity(cities[nextIndex].id);
      pillRefs.current[nextIndex]?.focus();
    }
  };

  const handleCustomSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = customCity.trim();
    if (!trimmed) return;
    onGrowInCity(trimmed);
    setCustomCity('');
    setCustomOpen(false);
  };

  return (
    <div>
      <div
        role="radiogroup"
        aria-label="Choose a city"
        className="flex flex-wrap gap-2"
      >
        {cities.map((city, index) => {
          const isSelected = city.id === selectedCityId;
          return (
            <button
              key={city.id}
              ref={(el) => {
                pillRefs.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => {
                setCustomOpen(false);
                onSelectCity(city.id);
              }}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`inline-flex min-h-[40px] shrink-0 items-center whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                isSelected
                  ? 'border-[var(--color-accent-signal)] bg-[var(--color-accent-signal)] text-[var(--color-surface-inverse)]'
                  : 'border-[var(--color-globe-hairline)] bg-transparent text-[var(--color-inverse-ink)] hover:border-[var(--color-inverse-ink)]'
              }`}
            >
              {city.city}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setCustomOpen((prev) => !prev)}
          aria-expanded={customOpen}
          className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-dashed border-[var(--color-globe-hairline)] bg-transparent px-3.5 py-1.5 text-[13px] font-medium text-[var(--color-surface-strong)] transition-colors hover:border-[var(--color-inverse-ink)] hover:text-[var(--color-inverse-ink)]"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          <span>more cities</span>
        </button>
      </div>

      {customOpen && (
        <form
          onSubmit={handleCustomSubmit}
          className="mt-3 flex flex-col gap-2 rounded-[var(--radius-xs)] border border-[var(--color-globe-hairline)] bg-[var(--color-surface-inverse)] p-3 sm:flex-row sm:items-center"
        >
          <label htmlFor="reach-custom-city" className="sr-only">
            Enter your city name
          </label>
          <input
            id="reach-custom-city"
            type="text"
            value={customCity}
            onChange={(e) => setCustomCity(e.target.value)}
            placeholder="Enter any city or region..."
            className="min-h-[44px] flex-1 rounded-[var(--radius-xs)] border border-[var(--color-globe-hairline)] bg-[var(--color-surface-inverse)] px-3.5 py-2 text-[14px] text-[var(--color-inverse-ink)] placeholder:text-[var(--color-surface-strong)] focus:border-[var(--color-accent-signal)]"
          />
          <button
            type="submit"
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-[var(--color-accent-signal)] px-4 py-2 text-[13px] font-medium text-[var(--color-surface-inverse)] transition-opacity hover:opacity-90"
          >
            <span>Request city</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </form>
      )}
    </div>
  );
}
