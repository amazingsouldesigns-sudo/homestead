'use client';

import { useCallback, useState } from 'react';
import {
  ArrowPathIcon,
  CalendarDaysIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardDocumentIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import type { Property } from '@/types';
import ScheduleCallThankYou from '@/components/property/ScheduleCallThankYou';

function normalizeContactEmail(raw: string): string {
  return raw
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/^mailto:/i, '');
}

interface ContactAgentCtaProps {
  property: Property;
  variant?: 'sidebar' | 'inline';
}

function phoneLooksValid(input: string): boolean {
  const digits = input.replace(/\D/g, '');
  return digits.length === 10 || (digits.length === 11 && digits.startsWith('1'));
}

export default function ContactAgentCta({ property, variant = 'sidebar' }: ContactAgentCtaProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [schedulePhone, setSchedulePhone] = useState('');
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);
  const [thankYouOpen, setThankYouOpen] = useState(false);
  const closeThankYou = useCallback(() => setThankYouOpen(false), []);
  const emailRaw = process.env.NEXT_PUBLIC_CONTACT_AGENT_EMAIL ?? '';
  const email = normalizeContactEmail(emailRaw);
  const phone = process.env.NEXT_PUBLIC_CONTACT_AGENT_PHONE ?? '';

  async function copyEmail() {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      toast.success('Email copied');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy — try selecting the email manually');
    }
  }

  function toggleOpen() {
    setOpen((v) => {
      if (v) {
        setShowScheduleForm(false);
        setSchedulePhone('');
      }
      return !v;
    });
  }

  async function submitScheduleCall() {
    if (!phoneLooksValid(schedulePhone)) {
      toast.error('Enter a valid 10-digit U.S. phone number');
      return;
    }
    setScheduleSubmitting(true);
    try {
      const res = await fetch('/api/schedule-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: property.id,
          phone: schedulePhone,
          listing_url: typeof window !== 'undefined' ? window.location.href : '',
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(typeof data.error === 'string' ? data.error : 'Something went wrong');
        return;
      }
      setThankYouOpen(true);
      setSchedulePhone('');
      setShowScheduleForm(false);
    } finally {
      setScheduleSubmitting(false);
    }
  }

  const wrapClass =
    variant === 'inline'
      ? 'lg:hidden rounded-2xl border border-white/10 bg-zinc-900/95 p-4 shadow-glass-elevate shadow-glow-tight ring-1 ring-brand-500/25 backdrop-blur-xl'
      : 'rounded-2xl border border-white/10 bg-zinc-900/95 p-4 shadow-glass-elevate shadow-glow-tight ring-1 ring-brand-500/25 backdrop-blur-xl';

  const toggleClass =
    variant === 'inline'
      ? 'flex w-full items-center justify-between gap-2 rounded-xl border border-cyan-400/20 bg-white/40 px-4 py-3 text-left text-[15px] font-semibold text-slate-900 shadow-inner ring-1 ring-white/30 backdrop-blur-md transition hover:border-cyan-300/35 hover:bg-white/60'
      : 'flex w-full items-center justify-between gap-2 rounded-xl border border-cyan-400/20 bg-white/40 px-4 py-3.5 text-left text-[15px] font-semibold text-slate-900 shadow-inner ring-1 ring-white/30 backdrop-blur-md transition hover:border-cyan-300/35 hover:bg-white/60 sm:py-4 sm:text-base';

  return (
    <>
    <div className={wrapClass}>
      <button
        type="button"
        onClick={toggleOpen}
        className={toggleClass}
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <EnvelopeIcon className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />
          Contact agent
        </span>
        {open ? (
          <ChevronUpIcon className="h-5 w-5 shrink-0 text-slate-500" aria-hidden />
        ) : (
          <ChevronDownIcon className="h-5 w-5 shrink-0 text-slate-500" aria-hidden />
        )}
      </button>

      {open ? (
        <div className="mt-3 space-y-3 border-t border-white/10 pt-3">
          <p className="text-center text-xs leading-relaxed text-slate-400">
            Prefer we reach out first? <strong>Schedule a call</strong> below, then use the agent email if you still need it.
          </p>

          {!showScheduleForm ? (
            <button
              type="button"
              onClick={() => setShowScheduleForm(true)}
              className="btn-primary flex w-full items-center justify-center gap-2 py-3 text-[15px]"
            >
              <CalendarDaysIcon className="h-4 w-4 shrink-0" aria-hidden />
              Schedule a call
            </button>
          ) : (
            <div className="space-y-2">
              <label htmlFor={`schedule-phone-${property.id}`} className="block text-xs font-semibold text-slate-300">
                Your phone number
              </label>
              <input
                id={`schedule-phone-${property.id}`}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="(555) 123-4567"
                value={schedulePhone}
                onChange={(e) => setSchedulePhone(e.target.value)}
                className="input-field text-[15px]"
              />
              <p className="text-[11px] text-slate-500">
                We&apos;ll use this to reach you about this listing. Sign in optional.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowScheduleForm(false);
                    setSchedulePhone('');
                  }}
                  className="btn-secondary flex-1 py-2.5 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={scheduleSubmitting}
                  onClick={() => void submitScheduleCall()}
                  className="btn-primary flex flex-1 items-center justify-center gap-2 py-2.5 text-sm disabled:opacity-60"
                >
                  {scheduleSubmitting ? (
                    <ArrowPathIcon className="h-4 w-4 animate-spin" aria-hidden />
                  ) : null}
                  Request call
                </button>
              </div>
            </div>
          )}

          {email ? (
            <>
              <div
                tabIndex={0}
                className="rounded-xl border border-brand-500/40 bg-zinc-950/80 px-3 py-3 shadow-glow-tight ring-1 ring-brand-400/30 outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <p className="mb-1 text-center text-[11px] font-semibold uppercase tracking-wide text-brand-400">
                  Agent email
                </p>
                <p className="select-all break-all text-center text-[15px] font-semibold leading-snug text-slate-100">
                  {email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void copyEmail()}
                className="btn-secondary flex w-full items-center justify-center gap-2 py-3 text-[15px]"
              >
                {copied ? (
                  <>
                    <CheckIcon className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                    Copied
                  </>
                ) : (
                  <>
                    <ClipboardDocumentIcon className="h-4 w-4 shrink-0" aria-hidden />
                    Copy email
                  </>
                )}
              </button>
            </>
          ) : (
            <p className="text-center text-sm text-amber-400/90">
              Set <code className="font-mono text-xs">NEXT_PUBLIC_CONTACT_AGENT_EMAIL</code> in{' '}
              <code className="font-mono text-xs">.env.local</code>.
            </p>
          )}

          {phone ? (
            <a
              href={`tel:${phone.replace(/\s/g, '')}`}
              className="flex w-full items-center justify-center gap-2 py-2 text-sm font-medium text-slate-400 hover:text-brand-400"
            >
              <PhoneIcon className="h-4 w-4 shrink-0" aria-hidden />
              {phone}
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
    <ScheduleCallThankYou
      open={thankYouOpen}
      onClose={closeThankYou}
      propertyTitle={property.title}
      city={property.city}
    />
    </>
  );
}
