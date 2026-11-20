interface GlowCardProps {
  title: string;
}

export function GlowCard({ title }: GlowCardProps) {
  return (
    <div className="novesta-glow-surface relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-inverse-border)] p-8 sm:aspect-[16/10] lg:aspect-square">
      <div
        aria-hidden="true"
        className="pointer-events-none flex h-[72%] w-[72%] max-w-[340px] items-center justify-center sm:aspect-square sm:h-[74%] sm:w-auto sm:max-w-none"
      >
        <div
          className="aspect-square h-full w-full rounded-full border-2 border-[var(--color-glow-ring)]"
          style={{
            boxShadow:
              '0 0 42px var(--color-glow-ring-soft), inset 0 0 36px var(--color-glow-ring-soft)',
          }}
        />
      </div>

      {/* Centered white title with soft blue glow */}
      <span className="novesta-glow-text pointer-events-none absolute px-6 text-center text-[22px] font-medium tracking-tight text-[var(--color-inverse-ink)] sm:text-[28px]">
        {title}
      </span>
    </div>
  );
}
