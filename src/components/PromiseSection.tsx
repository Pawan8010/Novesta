import { ArrowRight } from 'lucide-react';
import { siteConfig } from '../config/site';

interface PromiseSectionProps {
  onConsultationClick: () => void;
}

export function PromiseSection({ onConsultationClick }: PromiseSectionProps) {
  const { promise } = siteConfig;

  return (
    <section
      aria-labelledby="promise-heading"
      className="dark-signal-surface border-y border-[var(--color-globe-hairline)] bg-[var(--color-surface-inverse)] py-14 text-[var(--color-inverse-ink)] sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left: Static Statement */}
          <div className="lg:col-span-7">
            <p className="mono-eyebrow text-[var(--color-surface-strong)]">
              {promise.eyebrow}
            </p>

            <h2
              id="promise-heading"
              className="mt-4 font-normal leading-[1.04] tracking-[-0.04em] text-[var(--color-inverse-ink)]"
              style={{ fontSize: 'clamp(34px, 5.5vw, 76px)' }}
            >
              <span className="block">{promise.line1}</span>
              <span className="block">{promise.line2}</span>
              <span className="mt-1 block text-[var(--color-accent-signal)]">
                websites, search &amp; AI growth.
              </span>
            </h2>
          </div>

          {/* Right: Business Growth Guarantee */}
          <div className="lg:col-span-5">
            <p className="text-[18px] font-medium leading-7 tracking-tight text-[var(--color-inverse-ink)] sm:text-[22px]">
              {promise.guaranteeHeadline}
            </p>
            <p className="mt-4 text-[15px] leading-7 text-[var(--color-surface-strong)] sm:text-[16px]">
              {promise.guaranteeCopy}
            </p>

            <div className="mt-7">
              <button
                type="button"
                onClick={onConsultationClick}
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[var(--color-accent-signal)] px-6 py-3 text-[14px] font-medium text-[var(--color-surface-inverse)] transition-opacity hover:opacity-90 sm:w-auto"
              >
                <span>Start Growing Your Business</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Clean 3-column commitment hairline row */}
        <div className="mt-12 grid grid-cols-1 gap-6 border-t border-[var(--color-globe-hairline)] pt-10 md:grid-cols-3 lg:mt-14">
          {promise.commitments.map((item) => (
            <div key={item.code}>
              <p className="mono-eyebrow text-[var(--color-accent-signal)]">
                {item.code}
              </p>
              <h3 className="mt-2 text-[18px] font-medium tracking-tight text-[var(--color-inverse-ink)]">
                {item.title}
              </h3>
              <p className="mt-1.5 text-[15px] leading-6 text-[var(--color-surface-strong)]">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
