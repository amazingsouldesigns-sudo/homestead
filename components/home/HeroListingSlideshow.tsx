'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const INTERVAL_MS = 5500;

export default function HeroListingSlideshow({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);
  const valid = images.filter((u) => typeof u === 'string' && u.length > 0);

  useEffect(() => {
    if (valid.length <= 1) return;
    const t = window.setInterval(() => {
      setActive((i) => (i + 1) % valid.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(t);
  }, [valid.length]);

  if (valid.length === 0) return null;

  return (
    <div className="absolute inset-0 z-0" aria-hidden>
      {valid.map((src, i) => (
        <Image
          key={`${src}-${i}`}
          src={src}
          alt=""
          fill
          className={`object-cover transition-opacity duration-[1200ms] ease-in-out ${
            i === active ? 'opacity-100 z-[1]' : 'opacity-0 z-0'
          }`}
          priority={i === 0}
          sizes="100vw"
        />
      ))}
    </div>
  );
}
