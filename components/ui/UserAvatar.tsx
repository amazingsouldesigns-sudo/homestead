import Image from 'next/image';
import { HomesteadMark } from '@/components/ui/HomesteadMark';
import { cn } from '@/lib/utils';

const SIZES = {
  sm: { box: 'w-8 h-8', icon: 'w-4 h-4', img: 32 },
  md: { box: 'w-9 h-9', icon: 'w-5 h-5', img: 36 },
  lg: { box: 'w-10 h-10', icon: 'w-5 h-5', img: 40 },
  xl: { box: 'w-12 h-12', icon: 'w-6 h-6', img: 48 },
} as const;

export type UserAvatarSize = keyof typeof SIZES;

export function UserAvatar({
  avatarUrl,
  size = 'sm',
  className,
}: {
  avatarUrl?: string | null;
  size?: UserAvatarSize;
  className?: string;
}) {
  const s = SIZES[size];
  if (avatarUrl) {
    return (
      <div className={cn('surface-cut-sm relative shrink-0 overflow-hidden border border-white/10', s.box, className)}>
        <Image
          src={avatarUrl}
          alt=""
          fill
          className="object-cover"
          sizes={`${s.img}px`}
        />
      </div>
    );
  }
  return <HomesteadMark className={cn(s.box, className)} iconClassName={s.icon} />;
}
