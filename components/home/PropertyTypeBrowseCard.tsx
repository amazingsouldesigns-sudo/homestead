'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRightIcon,
  BuildingOffice2Icon,
  BuildingOfficeIcon,
  HomeIcon,
  Square3Stack3DIcon,
} from '@heroicons/react/24/outline';
import type { ComponentType } from 'react';
import { cn } from '@/lib/utils';
import styles from './PropertyTypeBrowseCard.module.css';

export type BrowseCardFallback = 'house' | 'apartment' | 'condo' | 'townhouse';

const FALLBACK_ICONS: Record<
  BrowseCardFallback,
  { Icon: ComponentType<{ className?: string }>; className: string }
> = {
  house: { Icon: HomeIcon, className: 'h-14 w-14 text-slate-500' },
  apartment: { Icon: BuildingOffice2Icon, className: 'h-14 w-14 text-slate-500' },
  condo: { Icon: BuildingOfficeIcon, className: 'h-14 w-14 text-slate-500' },
  townhouse: { Icon: Square3Stack3DIcon, className: 'h-14 w-14 text-slate-500' },
};

export default function PropertyTypeBrowseCard({
  href,
  title,
  browseLabel,
  imageFront,
  imageBack,
  fallbackVariant,
}: {
  href: string;
  title: string;
  browseLabel: string;
  imageFront: string | null;
  imageBack: string | null;
  fallbackVariant: BrowseCardFallback;
}) {
  const { Icon: FallbackIcon, className: fallbackIconClass } = FALLBACK_ICONS[fallbackVariant];
  const hasDual = Boolean(imageFront && imageBack);

  return (
    <Link
      href={href}
      className={cn(
        hasDual && styles.cardFlip,
        'group relative block overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/80 shadow-lg shadow-black/30 transition-[transform,box-shadow,border-color] duration-200 hover:scale-[1.01] hover:border-white/20 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20'
      )}
    >
      <div className={styles.aspect}>
        <div className={styles.firstContent}>
          <div className="relative h-full w-full min-h-[1px]">
            {imageFront ? (
              <Image
                src={imageFront}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
                priority={false}
              />
            ) : (
              <div className="flex h-full min-h-[200px] w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                <FallbackIcon className={fallbackIconClass} />
              </div>
            )}
          </div>
        </div>

        {hasDual && (
          <div className={styles.secondContent}>
            <div className="relative h-full w-full min-h-[1px]">
              <Image
                src={imageBack!}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
                loading="lazy"
              />
            </div>
          </div>
        )}

        <div className={styles.overlay} aria-hidden />
        <div className={styles.copy}>
          <h3 className="font-display text-lg font-semibold text-white md:text-xl">{title}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-200/95">
            {browseLabel}
            <ArrowRightIcon className="h-3.5 w-3.5 shrink-0 text-brand-300 transition-transform duration-300 group-hover:translate-x-0.5" />
          </p>
        </div>
      </div>
    </Link>
  );
}
