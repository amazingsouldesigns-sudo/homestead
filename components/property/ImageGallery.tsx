'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PhotoIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import type { PropertyImage } from '@/types';

interface ImageGalleryProps {
  images: PropertyImage[];
  title: string;
}

function dedupeImagesByUrl(images: PropertyImage[]): PropertyImage[] {
  const seen = new Set<string>();
  return images.filter((img) => {
    const u = img.url?.trim();
    if (!u) return false;
    if (seen.has(u)) return false;
    seen.add(u);
    return true;
  });
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const uniqueImages = dedupeImagesByUrl(images);

  if (!uniqueImages.length) {
    return (
      <div className="gallery-grid">
        <div className="bg-slate-100 flex items-center justify-center col-span-full aspect-[2/1]">
          <div className="text-center text-slate-400">
            <PhotoIcon className="mx-auto mb-2 h-12 w-12" />
            <p>No images available</p>
          </div>
        </div>
      </div>
    );
  }

  const displayImages = uniqueImages.slice(0, 5);

  const next = () => setCurrentIndex((i) => (i + 1) % uniqueImages.length);
  const prev = () => setCurrentIndex((i) => (i - 1 + uniqueImages.length) % uniqueImages.length);

  return (
    <>
      {/* Gallery Grid */}
      <div className="gallery-grid cursor-pointer" onClick={() => setLightboxOpen(true)}>
        {displayImages.map((img, i) => (
          <div key={img.id} className="relative overflow-hidden group">
            <Image
              src={img.url}
              alt={`${title} - Photo ${i + 1}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes={i === 0 ? '60vw' : '30vw'}
              priority={i === 0}
            />
            {i === displayImages.length - 1 && uniqueImages.length > 5 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">+{uniqueImages.length - 5} more</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* View all button */}
      <button
        onClick={() => setLightboxOpen(true)}
        className="mt-3 btn-secondary text-sm"
      >
        <PhotoIcon className="h-4 w-4" />
        View All {uniqueImages.length} Photos
      </button>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white z-10"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          <button
            onClick={prev}
            className="absolute left-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white z-10"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>

          <div className="relative w-full max-w-5xl aspect-[16/10] mx-16">
            <Image
              src={uniqueImages[currentIndex].url}
              alt={`${title} - Photo ${currentIndex + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>

          <button
            onClick={next}
            className="absolute right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white z-10"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>

          {/* Counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 rounded-full px-4 py-2 text-white text-sm font-medium">
            {currentIndex + 1} / {uniqueImages.length}
          </div>

          {/* Thumbnails */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-xl overflow-x-auto pb-2">
            {uniqueImages.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setCurrentIndex(i)}
                className={cn(
                  'w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all',
                  i === currentIndex ? 'border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-75'
                )}
              >
                <Image src={img.url} alt="" width={64} height={48} className="object-cover w-full h-full" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
