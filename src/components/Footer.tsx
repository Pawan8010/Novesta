import { ArrowUp, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { siteConfig } from '../config/site';

interface FooterProps {
  onNavigate: (path: string, hash?: string) => void;
}

const socialIconMap: Record<string, typeof Instagram> = {
  Instagram,
  Facebook,
  X: Twitter,
  LinkedIn: Linkedin,
};

export function Footer({ onNavigate }: FooterProps) {
  const handleLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    path: string,
    hash?: string
  ) => {
    event.preventDefault();
    onNavigate(path, hash);
  };

  const compactLinks = [
    { label: 'About', path: '/', hash: '#about' },
    { label: 'Services', path: '/', hash: '#services' },
    { label: 'Reach', path: '/', hash: '#reach' },
    { label: 'Careers', path: '/careers' },
    { label: 'Founder', path: '/admin' },
    { label: 'Privacy', path: '/privacy' },
    { label: 'Terms', path: '/terms' },
  ];

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-ink)]">
      {/* Top responsive contact grid above the wordmark */}
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <div className="grid grid-cols-1 gap-6 border-b border-[var(--color-border)] pb-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          <div>
            <p className="text-[13px] font-medium text-[var(--color-ink-secondary)]">
              Call or WhatsApp
            </p>
            <a
              href={siteConfig.contact.phoneHref}
              className="mt-1.5 inline-flex min-h-[44px] items-center text-[18px] font-medium text-[var(--color-ink)] tabular-nums transition-colors hover:text-[var(--color-ink-secondary)]"
            >
              {siteConfig.contact.phoneDisplay}
            </a>
          </div>

          <div>
            <p className="text-[13px] font-medium text-[var(--color-ink-secondary)]">
              Email
            </p>
            <a
              href={siteConfig.contact.emailHref}
              className="mt-1.5 inline-flex min-h-[44px] items-center break-all text-[18px] font-medium text-[var(--color-ink)] transition-colors hover:text-[var(--color-ink-secondary)]"
            >
              {siteConfig.contact.email}
            </a>
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <p className="text-[13px] font-medium text-[var(--color-ink-secondary)]">
              Location
            </p>
            <p className="mt-1.5 flex min-h-[44px] items-center text-[16px] font-medium leading-6 text-[var(--color-ink)]">
              {siteConfig.contact.address.full}
            </p>
          </div>
        </div>
      </div>

      {/* Signature Full-Width Responsive Vector WEBLANCE Wordmark (never clips on mobile) */}
      <div
        role="img"
        aria-label="Weblance"
        className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8"
      >
        <svg
          viewBox="0 0 1000 116"
          className="block h-auto w-full select-none text-[var(--color-ink)]"
          aria-hidden="true"
        >
          <text
            x="500"
            y="98"
            textAnchor="middle"
            textLength="960"
            lengthAdjust="spacing"
            fill="currentColor"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '112px',
              fontWeight: 500,
              letterSpacing: '-0.02em',
            }}
          >
            WEBLANCE
          </text>
        </svg>
      </div>

      {/* Hairline divider + Balanced Mobile/Tablet/Desktop Footer Bar */}
      <div
        id="footer-bottom-bar"
        className="border-t border-[var(--color-border)] bg-[var(--color-bg-subtle)]/50"
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-8 text-center sm:px-6 lg:flex-row lg:items-center lg:px-8 lg:py-7 lg:text-left">
          {/* Left: Dark-badged Weblance logo + copyright */}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            <a
              href="/"
              onClick={(e) => handleLinkClick(e, '/')}
              className="inline-flex h-11 w-[144px] items-center justify-center overflow-hidden rounded-full border border-[var(--color-logo-badge)] bg-[var(--color-logo-badge)] px-2.5 transition-opacity hover:opacity-90"
              aria-label="Weblance home"
            >
              <img
                src={siteConfig.brand.logoPath}
                alt={siteConfig.brand.logoAlt}
                loading="lazy"
                className="h-full w-full scale-[1.18] object-cover object-center"
                width={144}
                height={44}
              />
            </a>
            <p className="text-[13px] text-[var(--color-ink-secondary)]">
              &copy; {siteConfig.brand.copyrightYear} {siteConfig.brand.name}. Founded by{' '}
              {siteConfig.founder.name}.
            </p>
          </div>

          {/* Center: Compact Links */}
          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:gap-x-5"
          >
            {compactLinks.map((item) => (
              <a
                key={item.label}
                href={item.hash ? `${item.path}${item.hash}` : item.path}
                onClick={(e) => handleLinkClick(e, item.path, item.hash)}
                className="inline-flex min-h-[44px] items-center rounded-[var(--radius-xs)] px-2 text-[14px] font-medium text-[var(--color-ink-secondary)] transition-colors hover:text-[var(--color-ink)]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right: Social Icons + Back to Top */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-[13px] font-medium text-[var(--color-ink-secondary)]">
              Follow
            </span>
            <div className="flex items-center gap-2">
              {siteConfig.socials.map((social) => {
                const Icon = socialIconMap[social.name] || Instagram;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${siteConfig.brand.name} on ${social.name}${
                      social.isPlaceholder ? ' (placeholder link)' : ''
                    }`}
                    title={`${social.name} (${social.handle})`}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-ink)]/20 bg-[var(--color-bg)] text-[var(--color-ink)] shadow-[var(--shadow-4)] transition-colors hover:border-[var(--color-inverse-bg)] hover:bg-[var(--color-inverse-bg)] hover:text-[var(--color-inverse-ink)]"
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden="true" />
                  </a>
                );
              })}

              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'auto' })}
                aria-label="Back to top"
                title="Back to top"
                className="ml-1 inline-flex h-11 items-center justify-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 text-[13px] font-medium text-[var(--color-ink)] transition-colors hover:border-[var(--color-ink)] hover:bg-[var(--color-bg-subtle)]"
              >
                <ArrowUp className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Top</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
