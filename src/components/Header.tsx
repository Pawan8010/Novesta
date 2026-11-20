import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { siteConfig } from '../config/site';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string, hash?: string) => void;
}

export function Header({ currentPath, onNavigate }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const handleLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    event.preventDefault();
    setMobileMenuOpen(false);
    if (href.startsWith('#')) {
      onNavigate('/', href);
    } else {
      onNavigate(href);
    }
  };

  const whatsappHref = `${siteConfig.contact.whatsappUrl}?text=${encodeURIComponent(
    siteConfig.contact.whatsappPrefillText
  )}`;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:gap-6 sm:px-6 lg:px-8">
          {/* Left: White-on-black Weblance logo inside small black rounded badge */}
          <a
            href="/"
            onClick={(e) => handleLinkClick(e, '/')}
            className="inline-flex h-11 w-[138px] shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-xs)] bg-[var(--color-logo-badge)] px-2 transition-opacity hover:opacity-90 sm:w-[152px]"
            aria-label="Weblance home"
          >
            <img
              src={siteConfig.brand.logoPath}
              alt={siteConfig.brand.logoAlt}
              className="h-full w-full scale-[1.2] object-cover object-center"
              width={152}
              height={44}
            />
          </a>

          {/* Center: Clean single-line navigation links */}
          <nav aria-label="Primary Navigation" className="hidden items-center gap-5 lg:flex xl:gap-7">
            {siteConfig.navLinks.map((item) => {
              const isHash = item.href.startsWith('#');
              const isActive = isHash
                ? currentPath === '/' &&
                  typeof window !== 'undefined' &&
                  window.location.hash === item.href
                : currentPath === item.href;

              return (
                <a
                  key={item.href}
                  href={isHash ? `/${item.href}` : item.href}
                  onClick={(e) => handleLinkClick(e, item.href)}
                  className={`shrink-0 whitespace-nowrap px-1 py-2 text-[14px] font-medium transition-colors hover:text-[var(--color-ink)] hover:underline hover:underline-offset-4 ${
                    isActive
                      ? 'text-[var(--color-ink)] underline underline-offset-4'
                      : 'text-[var(--color-ink-secondary)]'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Right: Soft pill WhatsApp + Black filled pill Get Free Consultation */}
          <div className="flex shrink-0 items-center gap-2.5">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden min-h-[44px] items-center justify-center whitespace-nowrap rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-5 py-2 text-[14px] font-medium text-[var(--color-ink)] transition-colors hover:border-[var(--color-ink)] hover:bg-[var(--color-bg)] sm:inline-flex"
            >
              WhatsApp
            </a>

            <a
              href="/#contact"
              onClick={(e) => handleLinkClick(e, '#contact')}
              className="hidden min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[var(--color-inverse-bg)] px-5 py-2 text-[14px] font-medium text-[var(--color-inverse-ink)] transition-opacity hover:opacity-90 md:inline-flex"
            >
              <span>{siteConfig.hero.primaryCta}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>

            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-fullscreen-menu"
              aria-label="Open navigation menu"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-ink)] transition-colors hover:border-[var(--color-ink)] lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile / Tablet Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-fullscreen-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="fixed inset-0 z-50 flex flex-col justify-between gap-6 overflow-y-auto bg-[var(--color-bg)] px-6 py-6 text-[var(--color-ink)] lg:hidden"
        >
          <div>
            <div className="flex items-center justify-between">
              <a
                href="/"
                onClick={(e) => handleLinkClick(e, '/')}
                className="inline-flex h-11 w-[138px] items-center justify-center overflow-hidden rounded-[var(--radius-xs)] bg-[var(--color-logo-badge)] px-2"
                aria-label="Weblance home"
              >
                <img
                  src={siteConfig.brand.logoPath}
                  alt={siteConfig.brand.logoAlt}
                  className="h-full w-full scale-[1.2] object-cover object-center"
                  width={138}
                  height={44}
                />
              </a>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  menuButtonRef.current?.focus();
                }}
                aria-label="Close navigation menu"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-ink)] hover:border-[var(--color-ink)]"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Mobile links" className="mt-10 flex flex-col gap-1">
              {siteConfig.navLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href.startsWith('#') ? `/${item.href}` : item.href}
                  onClick={(e) => handleLinkClick(e, item.href)}
                  className="flex min-h-[52px] items-center border-b border-[var(--color-border)] text-[20px] font-normal tracking-tight text-[var(--color-ink)]"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-3">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-6 text-[15px] font-medium text-[var(--color-ink)]"
            >
              WhatsApp
            </a>

            <a
              href="/#contact"
              onClick={(e) => handleLinkClick(e, '#contact')}
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-[var(--color-inverse-bg)] px-6 text-[15px] font-medium text-[var(--color-inverse-ink)]"
            >
              <span>{siteConfig.hero.primaryCta}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      )}
    </>
  );
}
