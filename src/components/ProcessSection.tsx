import { ArrowRight } from 'lucide-react';
import { siteConfig } from '../config/site';

export function ProcessSection() {
  return (
    <section
      id="process"
      aria-labelledby="process-heading"
      className="border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)] py-16 text-[var(--color-ink)] sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <p className="mono-eyebrow text-[var(--color-ink-secondary)]">
              PROCESS
            </p>
            <h2
              id="process-heading"
              className="heading-section mt-3 text-[var(--color-ink)]"
            >
              Four focused steps from offline storefront to measurable growth.
            </h2>
          </div>
          <p className="max-w-md text-[16px] leading-6 text-[var(--color-ink-secondary)]">
            No vague timelines or endless discovery calls. We audit, architect, ship, and report
            on a predictable schedule.
          </p>
        </div>

        <ol className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:mt-14 lg:grid-cols-4">
          {siteConfig.process.map((step, index) => (
            <li
              key={step.number}
              className="novesta-card flex flex-col justify-between p-7 sm:p-8"
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center rounded-[var(--radius-xs)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-2.5 py-1 text-[12px] font-medium text-[var(--color-ink)] tabular-nums">
                    Step {step.number}
                  </span>
                  {index < siteConfig.process.length - 1 && (
                    <ArrowRight
                      className="hidden h-4 w-4 text-[var(--color-ink)] lg:block"
                      aria-hidden="true"
                    />
                  )}
                </div>

                {/* Step progression indicator */}
                <div
                  aria-hidden="true"
                  className="mt-5 h-[2px] w-full overflow-hidden rounded-full bg-[var(--color-border)]"
                >
                  <div
                    className="h-full bg-[var(--color-ink)]"
                    style={{ width: `${(index + 1) * 25}%` }}
                  />
                </div>

                <h3 className="mt-5 text-[20px] font-medium tracking-tight text-[var(--color-ink)]">
                  {step.title}
                </h3>

                <p className="mt-3 text-[16px] leading-6 text-[var(--color-ink-secondary)]">
                  {step.summary}
                </p>
              </div>

              <div className="mt-6 border-t border-[var(--color-border)] pt-4">
                <p className="text-[12px] font-medium text-[var(--color-ink-tertiary)]">
                  Deliverable
                </p>
                <p className="mt-1 text-[14px] font-medium text-[var(--color-ink)]">
                  {step.deliverable}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
