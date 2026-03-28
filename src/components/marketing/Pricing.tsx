'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X } from '@/components/ui/Icons';

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section
      id="pricing"
      className="px-6 md:px-14"
      style={{ background: 'var(--color-bg)', borderTop: '1px solid var(--color-border)' }}
    >
      <div className="max-w-[1320px] mx-auto py-[90px]">

        {/* Section header */}
        <div className="mb-12">
          <div
            className="flex items-center gap-[10px] mb-[14px]"
            style={{ color: 'var(--color-green)' }}
          >
            <span
              className="block shrink-0"
              style={{ width: 20, height: 1, background: 'var(--color-green)' }}
              aria-hidden="true"
            />
            <span
              className="font-[family-name:var(--font-inter)] font-semibold tracking-[0.16em] uppercase"
              style={{ fontSize: '0.625rem' }}
            >
              Pricing
            </span>
          </div>
          <h2
            className="font-[family-name:var(--font-manrope)] font-extrabold leading-[1.06] tracking-[-0.04em]"
            style={{ fontSize: 'clamp(2rem, 3.2vw, 3.25rem)', color: 'var(--color-text-primary)' }}
          >
            Simple, transparent pricing.
          </h2>
          <p
            className="font-[family-name:var(--font-inter)] leading-[1.6] mt-4 max-w-[400px]"
            style={{ fontSize: '1.0625rem', color: 'var(--color-text-muted)' }}
          >
            Choose the plan that fits your visa journey.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center gap-3 mb-12">
          <span
            id="monthly-label"
            className="font-[family-name:var(--font-inter)] font-medium"
            style={{ fontSize: '0.875rem', color: !annual ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}
          >
            Monthly
          </span>

          <button
            onClick={() => setAnnual(!annual)}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300"
            style={{
              background: annual ? 'var(--color-green-pale)' : 'var(--color-bg-tinted)',
              border: annual ? '1px solid var(--color-green)' : '1px solid var(--color-border)',
            }}
            role="switch"
            aria-checked={annual}
            aria-labelledby="monthly-label annual-label"
          >
            <span
              className="inline-block h-[18px] w-[18px] rounded-full transition-all duration-300"
              style={{
                background: annual ? 'var(--color-green)' : 'var(--color-text-faint)',
                transform: annual ? 'translateX(22px)' : 'translateX(2px)',
              }}
            />
          </button>

          <span
            id="annual-label"
            className="font-[family-name:var(--font-inter)] font-medium"
            style={{ fontSize: '0.875rem', color: annual ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}
          >
            Annual
          </span>

          {annual && (
            <span
              className="font-[family-name:var(--font-manrope)] font-semibold px-[10px] py-[3px] rounded-full"
              style={{
                fontSize: '0.6875rem',
                color: 'var(--color-green)',
                background: 'var(--color-green-pale)',
                border: '1px solid var(--color-border-strong)',
              }}
            >
              Save 30%
            </span>
          )}
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">

          {/* Free card */}
          <div
            role="region"
            aria-labelledby="free-plan-title"
            className="flex flex-col p-8 md:p-10"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div
              className="font-[family-name:var(--font-inter)] font-semibold tracking-[0.10em] uppercase mb-3"
              style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}
            >
              Free
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span
                id="free-plan-title"
                className="font-[family-name:var(--font-manrope)] font-extrabold leading-none tracking-[-0.04em]"
                style={{ fontSize: '2.75rem', color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}
              >
                £0
              </span>
            </div>
            <div
              className="font-[family-name:var(--font-inter)] mb-7"
              style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}
            >
              Forever free
            </div>

            <div
              className="mb-6"
              style={{ height: 1, background: 'var(--color-border)' }}
            />

            <ul className="flex flex-col gap-[10px] flex-1 mb-7">
              {[
                { text: 'Up to 10 trips logged', included: true },
                { text: 'Basic rolling window tracker', included: true },
                { text: 'Risk alerts', included: false },
              ].map(({ text, included }) => (
                <li key={text} className="flex items-start gap-[10px]" style={{ opacity: included ? 1 : 0.4 }}>
                  {included
                    ? <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-green)' }} weight="bold" />
                    : <X className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-text-primary)' }} weight="bold" />
                  }
                  <span
                    className="font-[family-name:var(--font-inter)] leading-[1.4]"
                    style={{ fontSize: '0.875rem', color: 'var(--color-text-2)' }}
                  >
                    {text}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className="flex items-center justify-center w-full py-3 rounded-[6px] font-[family-name:var(--font-inter)] font-semibold no-underline transition-all duration-200"
              style={{
                fontSize: '0.875rem',
                color: 'var(--color-text-primary)',
                background: 'transparent',
                border: '1px solid var(--color-border-strong)',
              }}
            >
              Get Started
            </Link>
          </div>

          {/* Pro card — featured */}
          <div
            role="region"
            aria-labelledby="pro-plan-title"
            className="flex flex-col p-8 md:p-10 relative"
            style={{
              background: 'linear-gradient(135deg, #006948 0%, #00A874 100%)',
              borderRadius: 12,
              boxShadow: '0 16px 48px rgba(0, 105, 72, 0.25), 0 1px 0 rgba(255,255,255,0.15) inset',
              border: '1px solid transparent',
            }}
          >
            {/* Most Popular badge */}
            <div className="absolute -top-[12px] left-1/2 -translate-x-1/2">
              <span
                className="inline-flex items-center px-[14px] py-[5px] rounded-full font-[family-name:var(--font-manrope)] font-bold tracking-[0.08em] uppercase whitespace-nowrap"
                style={{
                  fontSize: '0.625rem',
                  color: '#00A874',
                  background: 'var(--color-surface-dark)',
                  border: '1px solid rgba(0, 105, 72, 0.20)',
                }}
              >
                Most Popular
              </span>
            </div>

            <div
              className="font-[family-name:var(--font-inter)] font-semibold tracking-[0.10em] uppercase mb-3"
              style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.70)' }}
            >
              Pro
            </div>

            <div className="flex items-baseline gap-1 mb-1 transition-all duration-300">
              <span
                id="pro-plan-title"
                className="font-[family-name:var(--font-manrope)] font-extrabold leading-none tracking-[-0.04em]"
                style={{ fontSize: '2.75rem', color: 'white', fontVariantNumeric: 'tabular-nums' }}
              >
                {annual ? '£24.99' : '£2.99'}
              </span>
            </div>
            <div
              className="font-[family-name:var(--font-inter)] mb-7"
              style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.70)' }}
            >
              {annual ? 'per year' : 'per month'}
            </div>

            <div
              className="mb-6"
              style={{ height: 1, background: 'rgba(255,255,255,0.15)' }}
            />

            <ul className="flex flex-col gap-[10px] flex-1 mb-7">
              {[
                'Unlimited trip logging',
                'What-if planning simulator',
                'Smart risk & breach alerts',
                'Audit-ready PDF exports',
              ].map((text) => (
                <li key={text} className="flex items-start gap-[10px]">
                <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'white' }} weight="bold" />
                  <span
                    className="font-[family-name:var(--font-inter)] leading-[1.4]"
                    style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.90)' }}
                  >
                    {text}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className="flex items-center justify-center w-full py-3 rounded-[6px] font-[family-name:var(--font-inter)] font-semibold no-underline transition-opacity duration-200 hover:opacity-90"
              style={{
                fontSize: '0.875rem',
                color: 'white',
                background: 'var(--color-surface-dark)',
                border: 'none',
              }}
            >
              Start Free Tracker
            </Link>
          </div>
        </div>

        {/* Lifetime note */}
        <p
          className="font-[family-name:var(--font-inter)] mt-6"
          style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}
        >
          Prefer to pay once?{' '}
          <Link
            href="/signup?plan=lifetime"
            className="font-medium no-underline hover:underline transition-colors"
            style={{ color: 'var(--color-green)' }}
          >
            Get lifetime Pro access for £49.99 →
          </Link>
        </p>

        {/* Reassurance */}
        <p
          className="font-[family-name:var(--font-inter)] mt-3"
          style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)' }}
        >
          Cancel anytime. No hidden fees. Prices in GBP.
        </p>
      </div>
    </section>
  );
}
