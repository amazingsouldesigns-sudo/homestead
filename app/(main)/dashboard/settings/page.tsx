'use client';

import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/components/layout/ThemeProvider';

export default function DashboardSettingsPage() {
  const { theme, setTheme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">Settings</h1>
        <p className="mt-2 text-sm text-slate-400">
          Personalize your dashboard and site appearance.
        </p>
      </div>

      <section className="card p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Appearance</h2>
            <p className="mt-1 text-sm text-slate-400">
              Switch between dark and light mode across the entire website.
            </p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="btn-secondary w-full md:w-auto"
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
              theme === 'dark'
                ? 'border-brand-500/40 bg-brand-500/15 text-brand-300'
                : 'border-white/10 bg-zinc-900/60 text-slate-300 hover:bg-zinc-800/70'
            }`}
          >
            Dark
          </button>
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
              theme === 'light'
                ? 'border-brand-500/40 bg-brand-500/15 text-brand-300'
                : 'border-white/10 bg-zinc-900/60 text-slate-300 hover:bg-zinc-800/70'
            }`}
          >
            Light
          </button>
        </div>
      </section>
    </div>
  );
}
