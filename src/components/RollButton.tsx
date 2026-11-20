import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface BaseRollButtonProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'inverse';
  icon?: ReactNode;
  className?: string;
  loading?: boolean;
  disabled?: boolean;
}

type ButtonRollProps = BaseRollButtonProps & {
  href?: undefined;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  ariaLabel?: string;
};

type AnchorRollProps = BaseRollButtonProps & {
  href: string;
  target?: string;
  rel?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  ariaLabel?: string;
};

export type RollButtonProps = ButtonRollProps | AnchorRollProps;

export function RollButton(props: RollButtonProps) {
  const {
    label,
    variant = 'primary',
    icon,
    className = '',
    loading = false,
    disabled = false,
    ariaLabel,
  } = props;

  const isPrimary = variant === 'primary';
  const isInverse = variant === 'inverse';

  const variantClasses = isPrimary
    ? 'bg-[var(--color-ink)] text-[var(--color-inverse-ink)] border border-[var(--color-ink)] hover:opacity-90'
    : isInverse
      ? 'bg-[var(--color-inverse-ink)] text-[var(--color-inverse-bg)] border border-[var(--color-inverse-ink)] hover:opacity-90'
      : 'bg-[var(--color-bg)] text-[var(--color-ink)] border border-[var(--color-border)] hover:border-[var(--color-ink)] hover:bg-[var(--color-bg-subtle)]';

  const baseClasses = `inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap shrink-0 rounded-[var(--radius-step8)] px-6 py-2.5 text-[14px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${variantClasses} ${className}`;

  const content = (
    <>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
      ) : null}
      <span>{label}</span>
      {!loading && icon ? <span className="inline-flex shrink-0">{icon}</span> : null}
    </>
  );

  if (typeof props.href === 'string') {
    return (
      <a
        href={props.href}
        target={props.target}
        rel={props.rel}
        onClick={props.onClick}
        aria-label={ariaLabel}
        className={baseClasses}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={props.type || 'button'}
      onClick={props.onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      className={baseClasses}
    >
      {content}
    </button>
  );
}
