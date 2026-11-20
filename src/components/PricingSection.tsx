import { Suspense, lazy, useState } from 'react';
import { ArrowRight, Check, CreditCard, MessageCircle } from 'lucide-react';
import {
  buildPlanWhatsappUrl,
  formatCurrencyValue,
  siteConfig,
  type PricingPlan,
} from '../config/site';
import { DrawingHairline } from './DrawingHairline';

const PaymentModal = lazy(() =>
  import('./PaymentModal').then((m) => ({ default: m.PaymentModal }))
);

interface PricingSectionProps {
  onSelectPlan: (planName: string) => void;
}

interface PlanCardProps {
  plan: PricingPlan;
  onPayNow: (plan: PricingPlan) => void;
  onSelectPlan: (planName: string) => void;
}

function PlanCard({ plan, onPayNow, onSelectPlan }: PlanCardProps) {
  const savings = Math.max(0, plan.originalPrice - plan.price);
  const savingsPct =
    plan.originalPrice > 0 ? Math.round((savings / plan.originalPrice) * 100) : 0;
  const formattedOriginal = formatCurrencyValue(plan.originalPrice);
  const formattedFinal = formatCurrencyValue(plan.price);
  const formattedSavings = formatCurrencyValue(savings);
  const whatsappUrl = buildPlanWhatsappUrl(plan);
  const isFeatured = plan.featured;
  const contactPlanOption = `${plan.name} (${formattedFinal})`;

  return (
    <article
      className={`relative flex flex-col justify-between overflow-hidden rounded-[var(--radius-sm)] p-6 sm:p-8 ${
        isFeatured
          ? 'inverse-surface novesta-glow-surface border border-[var(--color-inverse-border)] text-[var(--color-inverse-ink)]'
          : 'border border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-[var(--color-ink)]'
      }`}
    >
      {isFeatured && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 top-6 h-56 w-56 rounded-full border-2 border-[var(--color-glow-ring)] opacity-50 blur-sm"
          style={{
            boxShadow: '0 0 64px var(--color-glow-ring-soft)',
          }}
        />
      )}

      <div className="relative">
        <div
          className={`flex flex-wrap items-center gap-2 text-[12px] font-medium ${
            isFeatured ? 'text-[var(--color-confetti-sky)]' : 'text-[var(--color-ink-secondary)]'
          }`}
        >
          <span>{plan.tier}</span>
          {plan.badge && (
            <>
              <span aria-hidden="true">·</span>
              <span>{plan.badge}</span>
            </>
          )}
        </div>

        <h3
          className={`mt-2 text-[21px] font-medium tracking-tight ${
            isFeatured ? 'text-[var(--color-inverse-ink)]' : 'text-[var(--color-ink)]'
          }`}
        >
          {plan.name}
        </h3>

        <div className="mt-5">
          {savings > 0 && (
            <div className="mb-1 flex flex-wrap items-center gap-2 text-[14px] tabular-nums">
              <span
                className={`line-through ${
                  isFeatured
                    ? 'text-[var(--color-surface-strong)]'
                    : 'text-[var(--color-ink-secondary)]'
                }`}
              >
                <span className="sr-only">Original price: </span>
                {formattedOriginal}
              </span>
              <span
                className={`font-medium ${
                  isFeatured
                    ? 'text-[var(--color-confetti-tint-ink-inverse)]'
                    : 'text-[var(--color-confetti-tint-ink)]'
                }`}
              >
                · Save {formattedSavings} ({savingsPct}%)
              </span>
            </div>
          )}

          <div className="flex items-baseline gap-2.5">
            <span
              className={`text-[40px] font-medium leading-none tracking-[-0.03em] tabular-nums sm:text-[46px] ${
                isFeatured ? 'text-[var(--color-inverse-ink)]' : 'text-[var(--color-ink)]'
              }`}
            >
              {formattedFinal}
            </span>
            <span
              className={`text-[14px] ${
                isFeatured
                  ? 'text-[var(--color-surface-strong)]'
                  : 'text-[var(--color-ink-secondary)]'
              }`}
            >
              {plan.billing}
            </span>
          </div>
        </div>

        <p
          className={`mt-4 text-[15px] leading-6 ${
            isFeatured
              ? 'text-[var(--color-surface-strong)]'
              : 'text-[var(--color-ink-secondary)]'
          }`}
        >
          {plan.tagline}
        </p>

        <ul className="mt-6 space-y-2.5 border-t border-current/15 pt-5">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-[14px] leading-6">
              <Check
                className={`mt-1 h-4 w-4 shrink-0 ${
                  isFeatured ? 'text-[var(--color-confetti-sky)]' : 'text-[var(--color-ink)]'
                }`}
                aria-hidden="true"
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mt-7 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={() => onPayNow(plan)}
          className={`inline-flex min-h-[48px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 py-3 text-[15px] font-medium transition-opacity hover:opacity-90 ${
            isFeatured
              ? 'bg-[var(--color-accent-signal)] text-[var(--color-surface-inverse)]'
              : 'bg-[var(--color-inverse-bg)] text-[var(--color-inverse-ink)]'
          }`}
        >
          <CreditCard className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{plan.cta}</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onSelectPlan(contactPlanOption)}
            className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-2 text-[13px] font-medium transition-colors ${
              isFeatured
                ? 'border-[var(--color-inverse-border)] text-[var(--color-inverse-ink)] hover:border-[var(--color-inverse-ink)]'
                : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-ink)] hover:border-[var(--color-ink)]'
            }`}
          >
            <span>Book Call</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-2 text-[13px] font-medium transition-colors ${
              isFeatured
                ? 'border-[var(--color-inverse-border)] text-[var(--color-inverse-ink)] hover:border-[var(--color-inverse-ink)]'
                : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-ink)] hover:border-[var(--color-ink)]'
            }`}
          >
            <MessageCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </article>
  );
}

export function PricingSection({ onSelectPlan }: PricingSectionProps) {
  const [filter, setFilter] = useState<'all' | 'full-service' | 'website-only'>('all');
  const [checkoutPlan, setCheckoutPlan] = useState<PricingPlan | null>(null);

  const allPlans = siteConfig.pricing.plans;
  const fullServicePlans = allPlans.filter((p) => p.category === 'full-service');
  const websiteOnlyPlans = allPlans.filter((p) => p.category === 'website-only');

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="scroll-mt-20 bg-[var(--color-bg)] py-16 text-[var(--color-ink)] sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="mono-eyebrow text-[var(--color-ink-secondary)]">
              PRICING & ONLINE PAYMENT
            </p>
            <h2 id="pricing-heading" className="heading-section mt-2 text-[var(--color-ink)]">
              Simple pricing for every business size
            </h2>
            <p className="mt-3 text-[16px] leading-6 text-[var(--color-ink-secondary)] sm:text-[18px]">
              Choose a Small, Medium, or Large Business package. Pay securely online with Razorpay
              or book a free consultation first.
            </p>
          </div>

          <div
            role="group"
            aria-label="Filter pricing plans"
            className="inline-flex w-full flex-wrap gap-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-1 sm:w-auto"
          >
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`min-h-[40px] flex-1 whitespace-nowrap rounded-[var(--radius-xs)] px-4 py-2 text-[13px] font-medium transition-colors sm:flex-none ${
                filter === 'all'
                  ? 'bg-[var(--color-bg)] text-[var(--color-ink)] shadow-sm'
                  : 'text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)]'
              }`}
            >
              All Plans (5)
            </button>
            <button
              type="button"
              onClick={() => setFilter('full-service')}
              className={`min-h-[40px] flex-1 whitespace-nowrap rounded-[var(--radius-xs)] px-4 py-2 text-[13px] font-medium transition-colors sm:flex-none ${
                filter === 'full-service'
                  ? 'bg-[var(--color-bg)] text-[var(--color-ink)] shadow-sm'
                  : 'text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)]'
              }`}
            >
              2-Year Services (3)
            </button>
            <button
              type="button"
              onClick={() => setFilter('website-only')}
              className={`min-h-[40px] flex-1 whitespace-nowrap rounded-[var(--radius-xs)] px-4 py-2 text-[13px] font-medium transition-colors sm:flex-none ${
                filter === 'website-only'
                  ? 'bg-[var(--color-bg)] text-[var(--color-ink)] shadow-sm'
                  : 'text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)]'
              }`}
            >
              Website Only (2)
            </button>
          </div>
        </div>

        {(filter === 'all' || filter === 'full-service') && (
          <div className="mt-10 md:mt-12">
            <div className="mb-5 flex items-baseline justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="text-[18px] font-medium text-[var(--color-ink)]">
                Complete Growth & 2-Year Support Plans
              </h3>
              <span className="text-[13px] text-[var(--color-ink-secondary)]">
                Small ₹7k · Medium ₹17k · Large ₹30k
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
              {fullServicePlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onPayNow={setCheckoutPlan}
                  onSelectPlan={onSelectPlan}
                />
              ))}
            </div>
          </div>
        )}

        {(filter === 'all' || filter === 'website-only') && (
          <div className="mt-10 md:mt-12">
            <div className="mb-5 flex items-baseline justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="text-[18px] font-medium text-[var(--color-ink)]">
                Website-Only Packages
              </h3>
              <span className="text-[13px] text-[var(--color-ink-secondary)]">
                Small ₹5k · Medium ₹10k
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-7">
              {websiteOnlyPlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onPayNow={setCheckoutPlan}
                  onSelectPlan={onSelectPlan}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-7 flex flex-col gap-1 text-[13px] text-[var(--color-ink-secondary)] sm:flex-row sm:items-center sm:justify-between">
          <p>{siteConfig.pricing.note}</p>
          {siteConfig.pricing.offerEndsOn && (
            <p className="tabular-nums">
              Offer valid through{' '}
              {new Date(siteConfig.pricing.offerEndsOn).toLocaleDateString(
                siteConfig.pricing.locale,
                { year: 'numeric', month: 'short', day: 'numeric' }
              )}
            </p>
          )}
        </div>
      </div>

      <DrawingHairline className="mt-16 sm:mt-24" />

      {checkoutPlan && (
        <Suspense fallback={null}>
          <PaymentModal plan={checkoutPlan} onClose={() => setCheckoutPlan(null)} />
        </Suspense>
      )}
    </section>
  );
}
