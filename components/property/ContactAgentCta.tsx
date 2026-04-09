'use client';

import { useCallback, useState } from 'react';
import {
  CalendarClock,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Loader2,
  Mail,
  Phone,
} from 'lucide-react';
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
  // TODO: set back to false after previewing — shows thank-you slide-out on load
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
      ? 'lg:hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-md'
      : 'rounded-2xl border border-slate-200 bg-white p-4 shadow-md';

  const toggleClass =
    variant === 'inline'
      ? 'flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-[15px] font-semibold text-slate-900 transition hover:bg-slate-100'
      : 'flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left text-[15px] font-semibold text-slate-900 transition hover:bg-slate-100 sm:py-4 sm:text-base';

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
          <Mail className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />
          Contact agent
        </span>
        {open ? (
          <ChevronUp className="h-5 w-5 shrink-0 text-slate-500" aria-hidden />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-slate-500" aria-hidden />
        )}
      </button>

      {open ? (
        <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
          {email ? (
            <>
              <div
                tabIndex={0}
                className="rounded-xl border-2 border-brand-400/80 bg-gradient-to-b from-amber-50 to-brand-50/90 px-3 py-3 shadow-sm ring-2 ring-brand-200/40 outline-none focus-visible:ring-brand-500"
              >
                <p className="mb-1 text-center text-[11px] font-semibold uppercase tracking-wide text-brand-800">
                  Agent email
                </p>
                <p className="select-all break-all text-center text-[15px] font-semibold leading-snug text-slate-900">
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
                    <Check className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 shrink-0" aria-hidden />
                    Copy email
                  </>
                )}
              </button>
            </>
          ) : (
            <p className="text-center text-sm text-amber-800">
              Set <code className="font-mono text-xs">NEXT_PUBLIC_CONTACT_AGENT_EMAIL</code> in{' '}
              <code className="font-mono text-xs">.env.local</code>.
            </p>
          )}

          {!showScheduleForm ? (
            <button
              type="button"
              onClick={() => setShowScheduleForm(true)}
              className="btn-primary flex w-full items-center justify-center gap-2 py-3 text-[15px]"
            >
              <CalendarClock className="h-4 w-4 shrink-0" aria-hidden />
              Schedule a call
            </button>
          ) : (
            <div className="space-y-2">
              <label htmlFor={`schedule-phone-${property.id}`} className="block text-xs font-semibold text-slate-700">
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
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : null}
                  Request call
                </button>
              </div>
            </div>
          )}

          {phone ? (
            <a
              href={`tel:${phone.replace(/\s/g, '')}`}
              className="flex w-full items-center justify-center gap-2 py-2 text-sm font-medium text-slate-600 hover:text-brand-600"
            >
              <Phone className="h-4 w-4 shrink-0" aria-hidden />
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
