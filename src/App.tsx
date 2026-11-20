import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { PromiseSection } from './components/PromiseSection';
import { FeaturePanel } from './components/FeaturePanel';
import { ReachSection } from './components/ReachSection';
import { PricingSection } from './components/PricingSection';
import { IndustriesSection } from './components/IndustriesSection';
import { ProcessSection } from './components/ProcessSection';
import { FounderSection } from './components/FounderSection';
import { FeedbackSection } from './components/FeedbackSection';
import { FaqAccordion } from './components/FaqAccordion';
import { Footer } from './components/Footer';
import { siteConfig } from './config/site';

const ContactSection = lazy(() =>
  import('./components/ContactSection').then((m) => ({ default: m.ContactSection }))
);
const CareersPage = lazy(() =>
  import('./components/CareersPage').then((m) => ({ default: m.CareersPage }))
);
const LegalPage = lazy(() =>
  import('./components/LegalPages').then((m) => ({ default: m.LegalPage }))
);
const FounderPortal = lazy(() =>
  import('./components/FounderPortal').then((m) => ({ default: m.FounderPortal }))
);

type AppRoute = '/' | '/careers' | '/privacy' | '/terms' | '/admin';

function normalizePath(pathname: string): AppRoute {
  if (pathname === '/careers') return '/careers';
  if (pathname === '/privacy') return '/privacy';
  if (pathname === '/terms') return '/terms';
  if (pathname === '/admin') return '/admin';
  return '/';
}

export default function App() {
  const [currentPath, setCurrentPath] = useState<AppRoute>(() =>
    typeof window !== 'undefined' ? normalizePath(window.location.pathname) : '/'
  );
  const [selectedService, setSelectedService] = useState<string | undefined>(undefined);
  const [selectedBusinessType, setSelectedBusinessType] = useState<string | undefined>(
    undefined
  );
  const [selectedPlan, setSelectedPlan] = useState<string | undefined>(undefined);
  const [selectedCity, setSelectedCity] = useState<string | undefined>(undefined);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // Listen for Google Maps Platform Demo Key quota exhaustion events
  useEffect(() => {
    const handleQuotaExceeded = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  // Optional GA4 script injection when a real Measurement ID is configured
  useEffect(() => {
    const gaId = siteConfig.seo.ga4MeasurementId;
    if (!gaId || gaId.startsWith('G-XXXX')) return;
    if (document.getElementById('weblance-ga4-script')) return;

    const script = document.createElement('script');
    script.id = 'weblance-ga4-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
    document.head.appendChild(script);

    const inline = document.createElement('script');
    inline.text = `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${gaId}');`;
    document.head.appendChild(inline);
  }, []);

  // Sync browser history navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(normalizePath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update document title, meta tags, OpenGraph & canonical URL per route
  useEffect(() => {
    const routeMeta: Record<AppRoute, { title: string; description: string }> = {
      '/': {
        title: siteConfig.seo.title,
        description: siteConfig.seo.description,
      },
      '/careers': {
        title: `Careers at ${siteConfig.brand.name} — Engineering & Growth Roles`,
        description: `Join ${siteConfig.brand.name} in Jalgaon or remotely. Build high-speed websites, SEO engines, Google Maps visibility, and AI WhatsApp automation.`,
      },
      '/privacy': {
        title: `Privacy Policy — ${siteConfig.brand.name} Digital Growth`,
        description: `Read ${siteConfig.brand.name}'s privacy policy covering inquiry data, consultation requests, analytics, and embedded Google Maps usage details.`,
      },
      '/terms': {
        title: `Terms of Service — ${siteConfig.brand.name} Digital Growth`,
        description: `Review ${siteConfig.brand.name}'s terms of service covering project scope, client code and domain ownership, and third-party platform integrations.`,
      },
      '/admin': {
        title: `Founder Workspace — ${siteConfig.brand.name}`,
        description: `Private founder workspace for managing ${siteConfig.brand.name} career role listings and submitted inquiries.`,
      },
    };

    const meta = routeMeta[currentPath];
    document.title = meta.title;

    const setMetaTag = (selector: string, content: string) => {
      const el = document.querySelector(selector);
      if (el) {
        el.setAttribute('content', content);
      }
    };

    setMetaTag(
      'meta[name="robots"]',
      currentPath === '/admin'
        ? 'noindex, nofollow'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    );
    setMetaTag('meta[name="description"]', meta.description);
    setMetaTag('meta[property="og:title"]', meta.title);
    setMetaTag('meta[property="og:description"]', meta.description);
    setMetaTag('meta[name="twitter:title"]', meta.title);
    setMetaTag('meta[name="twitter:description"]', meta.description);

    if (typeof window !== 'undefined') {
      const canonicalUrl = `${window.location.origin}${currentPath}`;
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.setAttribute('href', canonicalUrl);
      }
      setMetaTag('meta[property="og:url"]', canonicalUrl);
      setMetaTag(
        'meta[property="og:image"]',
        `${window.location.origin}/assets/weblance-logo.jpg`
      );
      setMetaTag(
        'meta[name="twitter:image"]',
        `${window.location.origin}/assets/weblance-logo.jpg`
      );
    }

    const gscToken = siteConfig.seo.googleSiteVerification;
    if (gscToken && !gscToken.startsWith('REPLACE_')) {
      let gscMeta = document.querySelector('meta[name="google-site-verification"]');
      if (!gscMeta) {
        gscMeta = document.createElement('meta');
        gscMeta.setAttribute('name', 'google-site-verification');
        document.head.appendChild(gscMeta);
      }
      gscMeta.setAttribute('content', gscToken);
    }
  }, [currentPath]);

  const navigate = useCallback((path: string, hash?: string) => {
    const targetPath = normalizePath(path);
    const targetUrl = hash ? `${targetPath}${hash}` : targetPath;
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', targetUrl);
    }
    setCurrentPath(targetPath);

    if (hash) {
      requestAnimationFrame(() => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'auto' });
        }
      });
    } else if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []);

  const scrollToContact = useCallback(() => {
    navigate('/', '#contact');
  }, [navigate]);

  const handleServiceQuote = useCallback(
    (serviceTitle: string) => {
      setSelectedService(serviceTitle);
      navigate('/', '#contact');
    },
    [navigate]
  );

  const handleIndustryPlan = useCallback(
    (businessType: string) => {
      setSelectedBusinessType(businessType);
      navigate('/', '#contact');
    },
    [navigate]
  );

  const handlePlanSelect = useCallback(
    (planName: string) => {
      setSelectedPlan(planName);
      navigate('/', '#contact');
    },
    [navigate]
  );

  const handleCitySelect = useCallback(
    (cityName: string) => {
      setSelectedCity(cityName);
      navigate('/', '#contact');
    },
    [navigate]
  );

  return (
    <div className="min-h-screen overflow-x-clip bg-[var(--color-bg)] text-[var(--color-ink)]">
      {/* Skip-to-content accessibility link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-[var(--radius-step8)] focus:bg-[var(--color-ink)] focus:px-5 focus:py-2.5 focus:text-[14px] focus:font-medium focus:text-[var(--color-inverse-ink)]"
      >
        Skip to main content
      </a>

      {/* Demo Key Quota Banner */}
      {quotaExceeded && (
        <div className="sticky top-0 z-50 border-b border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] px-4 py-2.5 text-center text-[13px] text-[var(--color-warning-text)]">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      <AnnouncementBar onSeePricing={() => navigate('/', '#pricing')} />
      <Header currentPath={currentPath} onNavigate={navigate} />

      <main id="main-content">
        {currentPath === '/careers' ? (
          <Suspense
            fallback={
              <div className="mx-auto max-w-3xl px-4 py-24 text-[15px] text-[var(--color-ink-secondary)]">
                Loading careers...
              </div>
            }
          >
            <CareersPage
              onBackHome={() => navigate('/')}
              onManageRoles={() => navigate('/admin')}
            />
          </Suspense>
        ) : currentPath === '/admin' ? (
          <Suspense
            fallback={
              <div className="mx-auto max-w-3xl px-4 py-24 text-[15px] text-[var(--color-ink-secondary)]">
                Loading founder workspace...
              </div>
            }
          >
            <FounderPortal
              onBackHome={() => navigate('/')}
              onOpenCareers={() => navigate('/careers')}
            />
          </Suspense>
        ) : currentPath === '/privacy' ? (
          <Suspense
            fallback={
              <div className="mx-auto max-w-3xl px-4 py-24 text-[15px] text-[var(--color-ink-secondary)]">
                Loading privacy policy...
              </div>
            }
          >
            <LegalPage type="privacy" onBackHome={() => navigate('/')} />
          </Suspense>
        ) : currentPath === '/terms' ? (
          <Suspense
            fallback={
              <div className="mx-auto max-w-3xl px-4 py-24 text-[15px] text-[var(--color-ink-secondary)]">
                Loading terms of service...
              </div>
            }
          >
            <LegalPage type="terms" onBackHome={() => navigate('/')} />
          </Suspense>
        ) : (
          <>
            <HeroSection onConsultationClick={scrollToContact} />
            <PromiseSection onConsultationClick={scrollToContact} />
            <FeaturePanel onSelectServiceQuote={handleServiceQuote} />
            <ReachSection onGrowInCity={handleCitySelect} />
            <PricingSection onSelectPlan={handlePlanSelect} />
            <IndustriesSection onSelectIndustry={handleIndustryPlan} />
            <ProcessSection />
            <FounderSection />
            <FeedbackSection />
            <FaqAccordion />
            <Suspense
              fallback={
                <div
                  id="contact"
                  className="bg-[var(--color-inverse-bg)] py-24 text-center text-[15px] text-[var(--color-inverse-muted)]"
                >
                  Loading contact form...
                </div>
              }
            >
              <ContactSection
                preselectedService={selectedService}
                preselectedBusinessType={selectedBusinessType}
                preselectedPlan={selectedPlan}
                preselectedCity={selectedCity}
                quotaExceeded={quotaExceeded}
              />
            </Suspense>
          </>
        )}
      </main>

      <Footer onNavigate={navigate} />
    </div>
  );
}
