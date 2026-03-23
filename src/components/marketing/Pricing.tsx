'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X } from 'lucide-react';

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-20 px-6 bg-[#F8F9FA]">
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-10">
          <h2 className="font-[family-name:var(--font-manrope)] font-extrabold text-[2.25rem] leading-tight tracking-[-0.02em] text-[#191C1D]">
            Simple, transparent pricing.
          </h2>
          <p className="mt-3 font-[family-name:var(--font-inter)] text-base text-[#3D4A42]">
            Choose the plan that fits your visa journey.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <span
            id="monthly-label"
            className={`text-sm font-medium font-[family-name:var(--font-inter)] ${!annual ? 'text-[#191C1D]' : 'text-[#3D4A42]'}`}
          >
            Monthly
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative inline-flex h-7 w-[3.25rem] items-center rounded-full transition-colors duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${annual ? 'bg-[#006948]' : 'bg-[#e2e5e3] hover:bg-[#d0d5d2]'}`}
            role="switch"
            aria-checked={annual}
            aria-labelledby="monthly-label annual-label"
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${annual ? 'translate-x-[1.6rem]' : 'translate-x-1'}`}
            />
          </button>
          <span
            id="annual-label"
            className={`text-sm font-medium font-[family-name:var(--font-inter)] ${annual ? 'text-[#191C1D]' : 'text-[#3D4A42]'}`}
          >
            Annual
          </span>
          {annual && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#92400E]">
              Save 30%
            </span>
          )}
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
          {/* Free card */}
          <div role="region" aria-labelledby="free-plan-title" className="bg-[#F3F4F5] rounded-[2rem] p-8 md:p-10 flex flex-col gap-6 ring-1 ring-[#191C1D]/5">
            <div>
              <h3 id="free-plan-title" className="font-[family-name:var(--font-manrope)] font-bold text-2xl text-[#191C1D]">
                Free
              </h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-[family-name:var(--font-manrope)] font-extrabold text-5xl md:text-[3.5rem] tracking-[-0.03em] text-[#191C1D]">
                  £0
                </span>
                <span className="font-[family-name:var(--font-inter)] text-sm font-semibold tracking-wide text-[#3D4A42]">
                  / forever
                </span>
              </div>
            </div>

            <ul className="flex flex-col gap-2.5 flex-1">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#006948] mt-0.5 shrink-0" />
                <span className="text-sm text-[#3D4A42] font-[family-name:var(--font-inter)]">
                  Up to 3 trips logged
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#006948] mt-0.5 shrink-0" />
                <span className="text-sm text-[#3D4A42] font-[family-name:var(--font-inter)]">
                  Basic rolling window tracker
                </span>
              </li>
              <li className="flex items-start gap-2 opacity-40">
                <X className="w-4 h-4 text-[#191C1D] mt-0.5 shrink-0" />
                <span className="text-sm text-[#3D4A42] font-[family-name:var(--font-inter)]">
                  Risk alerts
                </span>
              </li>
            </ul>

            <Link
              href="/signup"
              className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-[#006948] border border-[#006948]/15 hover:bg-[#006948]/5 transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Pro card */}
          <div role="region" aria-labelledby="pro-plan-title" className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0px_24px_64px_rgba(0,33,20,0.08)] ring-2 ring-[#006948] flex flex-col gap-6 relative">
            {/* Most Popular badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase text-white bg-gradient-to-r from-[#006948] to-[#00855D] shadow-sm">
                Most Popular
              </span>
            </div>

            <div>
              <h3 id="pro-plan-title" className="font-[family-name:var(--font-manrope)] font-bold text-2xl text-[#191C1D]">
                Pro
              </h3>
              <div className="mt-4 flex items-baseline gap-1 transition-all duration-300">
                <span className="font-[family-name:var(--font-manrope)] font-extrabold text-5xl md:text-[3.5rem] tracking-[-0.03em] text-[#191C1D]">
                  {annual ? '£24.99' : '£2.99'}
                </span>
                <span className="font-[family-name:var(--font-inter)] text-sm font-semibold tracking-wide text-[#3D4A42]">
                  {annual ? '/ year' : '/ month'}
                </span>
              </div>
            </div>

            <ul className="flex flex-col gap-2.5 flex-1">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#006948] mt-0.5 shrink-0" />
                <span className="text-sm text-[#3D4A42] font-[family-name:var(--font-inter)]">
                  Unlimited trip logging
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#006948] mt-0.5 shrink-0" />
                <span className="text-sm text-[#3D4A42] font-[family-name:var(--font-inter)]">
                  What-if planning simulator
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#006948] mt-0.5 shrink-0" />
                <span className="text-sm text-[#3D4A42] font-[family-name:var(--font-inter)]">
                  Smart risk &amp; breach alerts
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#006948] mt-0.5 shrink-0" />
                <span className="text-sm text-[#3D4A42] font-[family-name:var(--font-inter)]">
                  Audit-ready PDF exports
                </span>
              </li>
            </ul>

            <Link
              href="/signup"
              className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-br from-[#006948] to-[#00855D] hover:opacity-90 transition-opacity shadow-[0px_4px_16px_rgba(0,105,72,0.24)]"
            >
              Start Free Tracker
            </Link>
          </div>
        </div>

        {/* Lifetime note */}
        <p className="text-center mt-5 font-[family-name:var(--font-inter)] text-sm text-[#3D4A42]">
          Prefer to pay once?{' '}
          <Link
            href="/signup?plan=lifetime"
            className="text-[#006948] font-medium hover:underline"
          >
            Get lifetime Pro access for £49.99 →
          </Link>
        </p>

        {/* Reassurance */}
        <p className="text-center mt-4 font-[family-name:var(--font-inter)] text-xs text-[#3D4A42]/70">
          Cancel anytime. No hidden fees. Prices in GBP.
        </p>
      </div>
    </section>
  );
}
