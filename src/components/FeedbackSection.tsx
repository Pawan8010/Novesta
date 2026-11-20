import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Star } from 'lucide-react';
import { RollButton } from './RollButton';

interface FeedbackItem {
  id: string;
  name: string;
  business: string;
  rating: number;
  comment: string;
  createdAt: string;
  isSample?: boolean;
}

export function FeedbackSection() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [name, setName] = useState('');
  const [business, setBusiness] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/feedback')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Failed to load'))))
      .then((data) => {
        if (active && Array.isArray(data.items)) {
          setItems(data.items);
        }
      })
      .catch(() => {
        if (active) setItems([]);
      })
      .finally(() => {
        if (active) setLoadingList(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleRatingKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    starValue: number
  ) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      setRating(Math.min(5, starValue + 1));
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      setRating(Math.max(1, starValue - 1));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedComment = comment.trim();

    if (trimmedName.length < 2) {
      setStatus('error');
      setFeedbackMsg('Please enter your name (at least 2 characters).');
      return;
    }
    if (trimmedComment.length < 3) {
      setStatus('error');
      setFeedbackMsg('Please share a short feedback comment (at least 3 characters).');
      return;
    }

    setSubmitting(true);
    setStatus('idle');
    setFeedbackMsg('');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          business: business.trim(),
          rating,
          comment: trimmedComment,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || 'Could not submit feedback right now.');
      }

      if (payload.item) {
        setItems((prev) => [payload.item, ...prev]);
      }
      setStatus('success');
      setFeedbackMsg(payload.message || 'Thank you for sharing your feedback.');
      setName('');
      setBusiness('');
      setRating(5);
      setComment('');
    } catch (err) {
      setStatus('error');
      setFeedbackMsg(
        err instanceof Error ? err.message : 'Network error submitting feedback.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'mt-2 block w-full min-h-[44px] rounded-[var(--radius-xs)] border border-[var(--color-inverse-border)] bg-[var(--color-inverse-bg)] px-4 py-2.5 text-[15px] text-[var(--color-inverse-ink)] placeholder:text-[var(--color-inverse-muted)] transition-colors hover:border-[var(--color-inverse-ink)] disabled:cursor-not-allowed disabled:opacity-60';

  return (
    <section
      id="feedback"
      aria-labelledby="feedback-heading"
      className="border-b border-[var(--color-border)] bg-[var(--color-bg)] py-16 text-[var(--color-ink)] sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <p className="mono-eyebrow text-[var(--color-ink-secondary)]">
              FEEDBACK
            </p>
            <h2
              id="feedback-heading"
              className="heading-section mt-3 text-[var(--color-ink)]"
            >
              Share your experience with Weblance.
            </h2>
          </div>
          <p className="max-w-md text-[16px] leading-6 text-[var(--color-ink-secondary)]">
            Worked with us on a website, Google Maps profile, or automation? Leave direct
            feedback below—it publishes straight to our community wall.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left: High-Contrast Black Feedback Form */}
          <div className="inverse-surface rounded-[var(--radius-2xl)] border border-[var(--color-inverse-bg)] bg-[var(--color-inverse-bg)] p-6 text-[var(--color-inverse-ink)] shadow-[var(--shadow-2)] sm:p-8 lg:col-span-5">
            <h3 className="text-[20px] font-medium tracking-tight text-[var(--color-inverse-ink)]">
              Leave Feedback
            </h3>
            <p className="mt-1.5 text-[14px] text-[var(--color-inverse-muted)]">
              Takes less than a minute.
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-6">
              <div aria-live="polite" className="mb-4">
                {status === 'error' && feedbackMsg && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 rounded-[var(--radius-xs)] border border-[var(--color-error-inverse)] bg-[var(--color-error-bg-inverse)] p-3.5 text-[14px] text-[var(--color-error-inverse)]"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{feedbackMsg}</span>
                  </div>
                )}
                {status === 'success' && feedbackMsg && (
                  <div
                    role="status"
                    className="flex items-start gap-2.5 rounded-[var(--radius-xs)] border border-[var(--color-inverse-ink)] bg-[var(--color-inverse-bg)] p-3.5 text-[14px] text-[var(--color-inverse-ink)]"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{feedbackMsg}</span>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="feedback-name"
                  className="block text-[14px] font-medium text-[var(--color-inverse-ink)]"
                >
                  Your Name <span aria-hidden="true">*</span>
                </label>
                <input
                  id="feedback-name"
                  type="text"
                  required
                  disabled={submitting}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className={inputClass}
                />
              </div>

              <div className="mt-4">
                <label
                  htmlFor="feedback-business"
                  className="block text-[14px] font-medium text-[var(--color-inverse-ink)]"
                >
                  Business or Role
                </label>
                <input
                  id="feedback-business"
                  type="text"
                  disabled={submitting}
                  value={business}
                  onChange={(e) => setBusiness(e.target.value)}
                  placeholder="e.g., Hotel / Cafe / Clinic Owner"
                  className={inputClass}
                />
              </div>

              <div className="mt-4">
                <span
                  id="feedback-rating-label"
                  className="block text-[14px] font-medium text-[var(--color-inverse-ink)]"
                >
                  Rating ({rating} / 5)
                </span>
                <div
                  role="radiogroup"
                  aria-labelledby="feedback-rating-label"
                  className="mt-2 flex flex-wrap items-center gap-1.5"
                >
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = star <= rating;
                    return (
                      <button
                        key={star}
                        type="button"
                        role="radio"
                        aria-checked={rating === star}
                        aria-label={`${star} star${star > 1 ? 's' : ''}`}
                        disabled={submitting}
                        onClick={() => setRating(star)}
                        onKeyDown={(e) => handleRatingKeyDown(e, star)}
                        className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
                          active
                            ? 'border-[var(--color-inverse-ink)] bg-[var(--color-inverse-ink)] text-[var(--color-inverse-bg)]'
                            : 'border-[var(--color-inverse-border)] bg-[var(--color-inverse-bg)] text-[var(--color-inverse-muted)] hover:border-[var(--color-inverse-ink)]'
                        }`}
                      >
                        <Star
                          className="h-4 w-4"
                          fill={active ? 'currentColor' : 'none'}
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4">
                <label
                  htmlFor="feedback-comment"
                  className="block text-[14px] font-medium text-[var(--color-inverse-ink)]"
                >
                  Your Feedback <span aria-hidden="true">*</span>
                </label>
                <textarea
                  id="feedback-comment"
                  rows={4}
                  required
                  disabled={submitting}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what worked well or what we can improve..."
                  className={`${inputClass} min-h-[112px] resize-y`}
                />
              </div>

              <div className="mt-6">
                <RollButton
                  type="submit"
                  loading={submitting}
                  disabled={submitting}
                  label={submitting ? 'Submitting Feedback...' : 'Submit Feedback'}
                  variant="inverse"
                  className="w-full"
                />
              </div>
            </form>
          </div>

          {/* Right: Live Feedback Feed */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
              <h3 className="text-[18px] font-medium text-[var(--color-ink)]">
                Recent Feedback
              </h3>
              <span className="text-[13px] text-[var(--color-ink-secondary)] tabular-nums">
                {items.length} {items.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>

            {loadingList ? (
              <div className="mt-6 space-y-4">
                {[0, 1].map((skeleton) => (
                  <div
                    key={skeleton}
                    className="h-32 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)]"
                  />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="mt-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-8 text-center">
                <p className="text-[15px] text-[var(--color-ink-secondary)]">
                  No feedback entries yet. Be the first to share your thoughts.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-4">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="novesta-glass-subtle p-6 transition-colors hover:border-[var(--color-ink)]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1" aria-label={`Rated ${item.rating} out of 5`}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= item.rating
                                ? 'text-[var(--color-ink)]'
                                : 'text-[var(--color-border)]'
                            }`}
                            fill={star <= item.rating ? 'currentColor' : 'none'}
                            aria-hidden="true"
                          />
                        ))}
                        <span className="ml-2 text-[13px] font-medium text-[var(--color-ink-secondary)] tabular-nums">
                          {item.rating}.0
                        </span>
                      </div>

                      <span className="text-[12px] text-[var(--color-ink-secondary)]">
                        {new Date(item.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <p className="mt-3 text-[16px] leading-6 text-[var(--color-ink)]">
                      &ldquo;{item.comment}&rdquo;
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-x-2 text-[13px] text-[var(--color-ink-secondary)]">
                      <span className="font-medium text-[var(--color-ink)]">{item.name}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.business}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
