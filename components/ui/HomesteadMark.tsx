import { HomeIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

/** Green + white house mark — matches the header logo. */
export function HomesteadMark({
  className,
  iconClassName,
  withShadow = true,
}: {
  className?: string;
  iconClassName?: string;
  /** Logo in header uses shadow; tiny inline marks can disable */
  withShadow?: boolean;
}) {
  return (
    <div
      className={cn(
        'bg-brand-600 rounded-xl flex items-center justify-center shrink-0',
        withShadow && 'shadow-lg shadow-brand-600/25',
        className
      )}
    >
      <HomeIcon className={cn('text-white', iconClassName)} aria-hidden />
    </div>
  );
}
