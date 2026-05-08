'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import type { Stay } from '@core/stay';
import { useReducedMotion } from '@/features/shared/motion/reduced-motion';

export function StayList({ hero, alternatives }: { hero: Stay; alternatives: Stay[] }) {
  return (
    <div className="grid h-full grid-cols-2 grid-rows-[1.4fr_0.7fr_0.6fr] gap-3 px-6 py-6">
      <HeroCard className="col-span-2" stay={hero} />
      {alternatives.slice(0, 2).map((s, i) => (
        <AltCard key={s.id} stay={s} index={i + 1} />
      ))}
    </div>
  );
}

function HeroCard({ stay, className }: { stay: Stay; className?: string }) {
  const reduced = useReducedMotion();
  const photo = stay.photos[0];
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: reduced ? 0.2 : 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`relative overflow-hidden rounded-[22px] border ${className ?? ''}`}
      style={{ borderColor: 'var(--border-subtle)', boxShadow: 'var(--elev-hero)' }}
    >
      {photo ? (
        <Image
          src={photo.url}
          alt={photo.alt}
          fill
          sizes="60vw"
          className="object-cover"
          priority
        />
      ) : null}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.62) 100%)' }}
      />
      <span
        className="absolute top-3 left-3 rounded-full px-2 py-0.5"
        style={{
          background: 'var(--accent-primary)',
          color: '#14171C',
          fontFamily: 'var(--font-inter)',
          fontSize: '0.6875rem',
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        Top pick
      </span>
      <div className="absolute right-4 bottom-4 left-4 flex items-end justify-between gap-3">
        <div>
          <p
            style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: 'var(--text-display-sm)',
              fontWeight: 400,
              color: '#EDE6DB',
              lineHeight: 1.1,
            }}
          >
            {stay.name}
          </p>
          <p
            className="mt-1"
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: 'var(--text-body-sm)',
              color: 'rgba(237,230,219,0.7)',
            }}
          >
            {stay.location.region ?? stay.location.country}
            {stay.location.neighborhood ? ` · ${stay.location.neighborhood}` : ''}
          </p>
        </div>
        <p
          style={{
            fontFamily: 'var(--font-fraunces)',
            fontSize: 'var(--text-display-sm)',
            color: 'var(--accent-primary)',
          }}
        >
          {stay.pricing.pricePerNight.amount}{' '}
          <span style={{ fontSize: 'var(--text-body-sm)' }}>
            {stay.pricing.pricePerNight.currency}
          </span>
        </p>
      </div>
    </motion.div>
  );
}

function AltCard({ stay, index }: { stay: Stay; index: number }) {
  const reduced = useReducedMotion();
  const photo = stay.photos[0];
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{
        duration: reduced ? 0.2 : 0.6,
        delay: reduced ? 0 : index * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="relative overflow-hidden rounded-[18px] border"
      style={{ borderColor: 'var(--border-subtle)', boxShadow: 'var(--elev-card)' }}
    >
      {photo ? (
        <Image src={photo.url} alt={photo.alt} fill sizes="30vw" className="object-cover" />
      ) : null}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.6) 100%)' }}
      />
      <div className="absolute right-3 bottom-3 left-3 flex items-end justify-between gap-2">
        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: 'var(--text-body-sm)',
            color: '#EDE6DB',
            fontWeight: 500,
          }}
        >
          {stay.name}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-fraunces)',
            fontSize: 'var(--text-body)',
            color: 'var(--accent-primary)',
          }}
        >
          {stay.pricing.pricePerNight.amount}
        </p>
      </div>
    </motion.div>
  );
}
