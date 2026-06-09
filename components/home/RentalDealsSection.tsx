'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import HeroListingSlideshow from '@/components/home/HeroListingSlideshow';
import { formatPrice } from '@/lib/utils';

const RENTALS_HREF = '/rentals';
const PREVIEW_INTERVAL_MS = 5000;

/** Preview card — taller aspect for more vertical preview space */
const CARD_SHELL = 'relative w-full min-w-0 aspect-[4/3] lg:aspect-[5/4]';

const RED_GLOW =
  'shadow-[0_0_40px_-8px_rgba(239,68,68,0.45),0_0_72px_-18px_rgba(220,38,38,0.28)]';
const RED_GLOW_HOVER =
  'hover:shadow-[0_0_52px_-6px_rgba(239,68,68,0.55),0_0_88px_-14px_rgba(220,38,38,0.35)]';

export type RentalPreviewListing = {
  id: string;
  slug: string;
  title: string;
  price: number;
  city: string;
  imageUrl: string | null;
};

type RentalDealsSectionProps = {
  backgroundImages: string[];
  previewListings: RentalPreviewListing[];
};

export default function RentalDealsSection({
  backgroundImages,
  previewListings,
}: RentalDealsSectionProps) {
  const previews = previewListings;
  const [activeIndex, setActiveIndex] = useState(0);
  const activeListing = previews[activeIndex] ?? null;

  useEffect(() => {
    setActiveIndex(0);
  }, [previews.length]);

  useEffect(() => {
    if (previews.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % previews.length);
    }, PREVIEW_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [previews.length]);

  return (
    <section className="relative isolate py-12 md:py-16">
      <div className="page-container relative mb-5 md:mb-6">
        <h2 className="font-display text-2xl font-bold text-slate-100 drop-shadow-[0_0_24px_rgba(239,68,68,0.35)] md:text-3xl">
          Rental deals
        </h2>
      </div>

      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen max-w-[100vw] px-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-7xl">
          <div
            className="pointer-events-none absolute -inset-3 z-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.42)_0%,rgba(220,38,38,0.2)_48%,transparent_72%)] opacity-90 blur-2xl sm:-inset-4 sm:blur-3xl lg:-inset-6"
            aria-hidden
          />
          <Link
            href={RENTALS_HREF}
            className={`surface-cut group relative z-[1] block overflow-hidden border-[3px] border-red-500/40 bg-zinc-950/20 ring-2 ring-red-500/35 transition-all duration-300 hover:border-red-400/55 hover:ring-red-400/45 md:border-4 md:ring-4 ${RED_GLOW} ${RED_GLOW_HOVER}`}
            aria-label="View all rental properties"
          >
          <div className="relative min-h-[400px] md:min-h-[460px] lg:min-h-[520px]">
            {backgroundImages.length > 0 ? (
              <HeroListingSlideshow images={backgroundImages} />
            ) : (
              <div
                className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-brand-950"
                aria-hidden
              />
            )}

            <div
              className="absolute inset-0 z-[2] bg-gradient-to-r from-slate-950/88 via-slate-950/65 to-slate-950/40"
              aria-hidden
            />
            <div
              className="absolute inset-0 z-[2] bg-gradient-to-t from-slate-950/80 via-transparent to-transparent lg:hidden"
              aria-hidden
            />

            <div className="relative z-10 flex min-h-[400px] flex-col px-4 py-8 sm:px-6 sm:py-10 md:min-h-[460px] md:px-8 md:py-10 lg:min-h-[520px] lg:px-10 lg:py-12">
              <p className="label-future mb-4 shrink-0 text-red-400/90 drop-shadow-[0_0_12px_rgba(239,68,68,0.4)] sm:mb-5">
                For rent
              </p>

              <div className="relative min-h-0 flex-1 pt-[clamp(8.5rem,42vw,14rem)] lg:pt-0">
                <div
                  className="pointer-events-none absolute -left-6 top-0 z-[1] aspect-[2/1] w-[min(108%,36rem)] max-w-[92vw] origin-left -translate-y-2 scale-100 sm:top-1/2 sm:-left-12 sm:w-[min(115%,40rem)] sm:-translate-y-1/2 sm:scale-105 lg:-left-20 lg:w-[min(120%,50rem)] lg:max-w-none lg:scale-[1.22] xl:-left-24 xl:scale-[1.28] [filter:drop-shadow(0_0_28px_rgba(239,68,68,0.5))_drop-shadow(0_0_48px_rgba(220,38,38,0.25))]"
                >
                  <Image
                    src="/rental-deals-copy.png"
                    alt="Rental deals"
                    fill
                    className="object-contain object-left"
                    sizes="(max-width: 1024px) 90vw, 55vw"
                    priority={false}
                  />
                </div>

                <div className="relative z-10 flex w-full justify-end lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 lg:items-center lg:pl-6 xl:pl-8">
                <div
                  className={`${CARD_SHELL} surface-cut-sm group/card flex w-full flex-col overflow-hidden border border-red-500/25 bg-zinc-950/90 shadow-[0_0_32px_-6px_rgba(239,68,68,0.4),0_0_56px_-14px_rgba(220,38,38,0.22)] ring-1 ring-red-500/25 backdrop-blur-md transition-all duration-300 group-hover:border-red-400/45 group-hover:shadow-[0_0_40px_-4px_rgba(239,68,68,0.55),0_0_64px_-12px_rgba(220,38,38,0.3)] group-hover:ring-red-400/40`}
                >
                  <div className="relative min-h-0 flex-1 p-2.5 sm:p-3">
                    {activeListing ? (
                      <>
                        <div className="surface-cut-sm absolute inset-2.5 overflow-hidden bg-zinc-800 ring-1 ring-red-500/20 shadow-[0_0_16px_-4px_rgba(239,68,68,0.35)] sm:inset-3">
                          <div className="relative h-full min-h-[8rem] w-full sm:min-h-[9rem]">
                            {activeListing.imageUrl ? (
                              <Image
                                key={activeListing.id}
                                src={activeListing.imageUrl}
                                alt=""
                                fill
                                unoptimized
                                className="object-cover transition-transform duration-500 group-hover/card:scale-[1.02]"
                                sizes="(max-width: 1024px) 45vw, 22vw"
                              />
                            ) : (
                              <div className="absolute inset-0 bg-zinc-700" aria-hidden />
                            )}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/55 to-transparent px-3 pb-2.5 pt-10 sm:px-4 sm:pb-3 sm:pt-12">
                              <p className="line-clamp-2 text-sm font-semibold leading-snug text-white sm:text-base">
                                {activeListing.title}
                              </p>
                              <p className="mt-1 truncate text-sm font-semibold text-white sm:text-base">
                                {formatPrice(activeListing.price)}
                                <span className="font-normal text-white/75">/mo</span>
                              </p>
                              <p className="truncate text-xs text-slate-300 sm:text-sm">
                                {activeListing.city}
                              </p>
                            </div>
                          </div>
                        </div>
                        {previews.length > 1 &&
                          (previews.length <= 12 ? (
                            <div
                              className="absolute right-4 top-4 z-[2] flex gap-1.5 sm:right-5 sm:top-5"
                              aria-hidden
                            >
                              {previews.map((listing, i) => (
                                <span
                                  key={listing.id}
                                  className={`h-1.5 transition-all duration-300 ${
                                    i === activeIndex
                                      ? 'w-5 bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                                      : 'w-1.5 bg-white/35'
                                  }`}
                                />
                              ))}
                            </div>
                          ) : (
                            <span className="absolute right-4 top-4 z-[2] border border-white/10 bg-black/75 px-2.5 py-1 text-xs font-medium uppercase tracking-widecaps text-white tabular-nums sm:right-5 sm:top-5">
                              {activeIndex + 1} / {previews.length}
                            </span>
                          ))}
                      </>
                    ) : (
                      <div className="flex h-full min-h-[8rem] items-center justify-center border border-dashed border-red-500/25 bg-zinc-800/60 sm:min-h-[9rem]" />
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t border-red-500/20 bg-zinc-900/95 px-3 py-2.5 shadow-[0_-8px_24px_-8px_rgba(239,68,68,0.25)] sm:px-4 sm:py-3">
                    <span className="text-right text-sm font-semibold text-slate-100 drop-shadow-[0_0_10px_rgba(239,68,68,0.25)] sm:text-base">
                      Browse rental listings
                      {previews.length > 0 ? (
                        <span className="ml-1.5 font-normal text-slate-300">({previews.length})</span>
                      ) : null}
                    </span>
                    <ArrowRightIcon className="h-4 w-4 shrink-0 text-red-400 transition-transform group-hover:translate-x-0.5 sm:h-5 sm:w-5" />
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
        </div>
      </div>
    </section>
  );
}
