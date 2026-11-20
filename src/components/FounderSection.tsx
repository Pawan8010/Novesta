import { ArrowUpRight, Mail, MessageCircle } from 'lucide-react';
import { siteConfig } from '../config/site';

export function FounderSection() {
  const { founder, contact } = siteConfig;

  const whatsappHref = `${contact.whatsappUrl}?text=${encodeURIComponent(
    contact.whatsappPrefillText
  )}`;

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="border-b border-[var(--color-border)] bg-[var(--color-bg)] py-16 text-[var(--color-ink)] sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="mono-eyebrow text-[var(--color-ink-secondary)]">
            FOUNDER
          </p>

          <h2
            id="about-heading"
            className="heading-founder mt-3 text-[var(--color-ink)]"
          >
            {founder.name}
          </h2>

          <p className="mt-4 text-[18px] font-medium tracking-tight text-[var(--color-ink)] sm:text-[20px]">
            {founder.role}
          </p>

          <p className="mt-3 max-w-2xl text-[16px] leading-7 text-[var(--color-ink-secondary)]">
            {founder.teamLine}
          </p>

          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[var(--color-inverse-bg)] px-6 py-2.5 text-[14px] font-medium text-[var(--color-inverse-ink)] transition-opacity hover:opacity-90"
            >
              <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>WhatsApp</span>
              <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </a>

            <a
              href={founder.emailHref}
              className="inline-flex min-h-[44px] max-w-full items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-5 py-2.5 text-[14px] font-medium text-[var(--color-ink)] transition-colors hover:border-[var(--color-ink)] hover:bg-[var(--color-bg)]"
            >
              <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{founder.email}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
