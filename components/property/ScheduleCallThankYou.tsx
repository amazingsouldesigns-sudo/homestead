'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ScheduleCallThankYouProps {
  open: boolean;
  onClose: () => void;
  propertyTitle: string;
  city: string;
}

export default function ScheduleCallThankYou({
  open,
  onClose,
  propertyTitle,
  city,
}: ScheduleCallThankYouProps) {
  const brand = (process.env.NEXT_PUBLIC_APP_NAME || 'Homestead').trim() || 'Homestead';
  const agentFirst = (process.env.NEXT_PUBLIC_CONTACT_AGENT_FIRST_NAME || '').trim();
  const titleShort =
    propertyTitle.length > 56 ? `${propertyTitle.slice(0, 54)}…` : propertyTitle;

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(onClose, 7000);
    return () => window.clearTimeout(t);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="schedule-call-thank-you"
          role="status"
          aria-live="polite"
          initial={{ x: 120, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 120, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320, mass: 0.8 }}
          className="pointer-events-auto fixed bottom-5 right-4 z-[200] w-[min(100vw-2rem,22rem)] sm:bottom-8 sm:right-8"
        >
          <div className="relative overflow-hidden rounded-2xl border border-emerald-200/90 bg-white/95 p-4 shadow-2xl shadow-slate-900/15 backdrop-blur-sm">
            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-400/15 blur-2xl" />
            <div className="flex gap-3">
              <div className="relative mt-1 flex h-3 w-3 shrink-0 items-center justify-center">
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70"
                  aria-hidden
                />
                <span
                  className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_14px_4px_rgba(16,185,129,0.65),0_0_28px_6px_rgba(16,185,129,0.35)]"
                  aria-hidden
                />
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-[13px] font-semibold uppercase tracking-wide text-emerald-700">
                  Live agent
                </p>
                <p className="mt-1 text-[15px] font-semibold leading-snug text-slate-900">
                  {agentFirst
                    ? `${agentFirst} from ${brand} thanks you — we’ve received your request.`
                    : `${brand} thanks you — we’ve received your request.`}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  We’ll call you about{' '}
                  <span className="font-medium text-slate-800">{titleShort}</span>
                  {city ? (
                    <>
                      {' '}
                      in <span className="font-medium text-slate-800">{city}</span>
                    </>
                  ) : null}
                  .
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
