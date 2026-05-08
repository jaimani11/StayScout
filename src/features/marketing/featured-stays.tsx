import Image from 'next/image';
import { ALL_STAYS } from '@/providers/mock-italy/data';

/**
 * Light-mode break section. Uses fixed --featured-* tokens (cream + olive
 * + clay) regardless of global theme. Pulls the first 6 curated stays in
 * ALL_STAYS order — deterministic, no client logic.
 */
export function FeaturedStays() {
  const featured = ALL_STAYS.slice(0, 6);

  return (
    <section
      className="relative w-full"
      style={{
        background:
          'linear-gradient(180deg, var(--surface-raised) 0%, var(--featured-bg) 22%, var(--featured-bg) 100%)',
      }}
    >
      <div className="mx-auto max-w-6xl px-6 pt-32 pb-32">
        <div className="mb-12 max-w-2xl">
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: 'var(--text-label)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--featured-ink-secondary)',
            }}
          >
            A taste of the catalog
          </p>
          <h2
            className="mt-3"
            style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: 'var(--text-display-lg)',
              fontWeight: 300,
              lineHeight: 1.05,
              letterSpacing: '-0.035em',
              color: 'var(--featured-ink-primary)',
            }}
          >
            Hand-selected
            <br />
            <em style={{ fontStyle: 'italic', color: 'var(--featured-accent)' }}>
              by the concierge.
            </em>
          </h2>
        </div>

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((s) => (
            <li
              key={s.id}
              className="flex flex-col overflow-hidden rounded-[18px] border"
              style={{
                background: 'var(--featured-bg-raised)',
                borderColor: 'var(--featured-border)',
              }}
            >
              {s.photos[0] ? (
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/10' }}>
                  <Image
                    src={s.photos[0].url}
                    alt={s.photos[0].alt}
                    fill
                    sizes="(max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ) : null}
              <div className="flex flex-1 flex-col p-4">
                <p
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: '0.6875rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--featured-ink-secondary)',
                  }}
                >
                  {s.location.region ?? s.location.country}
                </p>
                <p
                  className="mt-1"
                  style={{
                    fontFamily: 'var(--font-fraunces)',
                    fontSize: 'var(--text-body-lg)',
                    fontWeight: 400,
                    color: 'var(--featured-ink-primary)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {s.name}
                </p>
                <p
                  className="mt-2 line-clamp-2"
                  style={{
                    fontFamily: 'var(--font-fraunces)',
                    fontSize: 'var(--text-body-sm)',
                    fontStyle: 'italic',
                    fontWeight: 300,
                    lineHeight: 1.5,
                    color: 'var(--featured-ink-secondary)',
                  }}
                >
                  {s.description}
                </p>
                <div className="mt-auto flex items-baseline justify-between pt-3">
                  <span
                    style={{
                      fontFamily: 'var(--font-fraunces)',
                      fontSize: 'var(--text-body-lg)',
                      color: 'var(--featured-accent)',
                    }}
                  >
                    {s.pricing.pricePerNight.amount.toLocaleString()}{' '}
                    <span
                      style={{
                        fontFamily: 'var(--font-inter)',
                        fontSize: 'var(--text-body-sm)',
                        color: 'var(--featured-ink-secondary)',
                      }}
                    >
                      {s.pricing.pricePerNight.currency} / night
                    </span>
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-inter)',
                      fontSize: '0.6875rem',
                      color: 'var(--featured-accent-clay)',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Curated
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
