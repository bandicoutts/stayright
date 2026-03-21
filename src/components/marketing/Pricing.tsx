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
            className={`text-sm font-medium font-[family-name:var(--font-inter)] ${!annual ? 'text-[#191C1D]' : 'text-[#3D4A42]'}`}
          >
            Monthly
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${annual ? 'bg-[#006948]' : 'bg-[#D1D5DB]'}`}
            role="switch"
            aria-checked={annual}
            aria-label="Toggle annual billing"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${annual ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
          <span
            className={`text-sm font-medium font-[family-name:var(--font-inter)] ${annual ? 'text-[#191C1D]' : 'text-[#3D4A42]'}`}
          >
            Annual
          </span>
          {annual && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#D97706]">
              Save 30%
            </span>
          )}
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
          {/* Free card */}
          <div className="bg-white rounded-xl p-6 shadow-[0px_2px_12px_rgba(25,28,29,0.04)] flex flex-col gap-5">
            <div>
              <h3 className="font-[family-name:var(--font-manrope)] font-bold text-xl text-[#191C1D]">
                Free
              </h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-[family-name:var(--font-manrope)] font-extrabold text-4xl text-[#191C1D]">
                  £0
                </span>
                <span className="font-[family-name:var(--font-inter)] text-sm text-[#3D4A42]">
                  /forever
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
          <div className="bg-white rounded-xl p-6 shadow-[0px_8px_32px_rgba(0,105,72,0.16)] ring-2 ring-[#006948] flex flex-col gap-5 relative">
            {/* Most Popular badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white bg-[#006948]">
                Most Popular
              </span>
            </div>

            <div>
              <h3 className="font-[family-name:var(--font-manrope)] font-bold text-xl text-[#191C1D]">
                Pro
              </h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-[family-name:var(--font-manrope)] font-extrabold text-4xl text-[#191C1D]">
                  {annual ? '£24.99' : '£2.99'}
                </span>
                <span className="font-[family-name:var(--font-inter)] text-sm text-[#3D4A42]">
                  {annual ? '/year' : '/month'}
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
