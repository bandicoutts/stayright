'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X } from 'lucide-react';

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section
      id="pricing"
      className="px-6 md:px-14"
      style={{ background: '#FAF8F2', borderTop: '1px solid rgba(201,168,76,0.15)' }}
    >
      <div className="max-w-[1320px] mx-auto py-[90px]">

        {/* Section header */}
        <div className="mb-12">
          <div
            className="flex items-center gap-[10px] mb-[14px]"
            style={{ color: '#A88730' }}
          >
            <span
              className="block shrink-0"
              style={{ width: 20, height: 1, background: '#C9A84C' }}
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
            style={{ fontSize: 'clamp(2rem, 3.2vw, 3.25rem)', color: '#1A1B19' }}
          >
            Simple, transparent pricing.
          </h2>
          <p
            className="font-[family-name:var(--font-inter)] leading-[1.6] mt-4 max-w-[400px]"
            style={{ fontSize: '1.0625rem', color: '#6B6D66' }}
          >
            Choose the plan that fits your visa journey.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center gap-3 mb-12">
          <span
            id="monthly-label"
            className="font-[family-name:var(--font-inter)] font-medium"
            style={{ fontSize: '0.875rem', color: !annual ? '#1A1B19' : '#6B6D66' }}
          >
            Monthly
          </span>

          <button
            onClick={() => setAnnual(!annual)}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300"
            style={{
              background: annual ? 'rgba(201,168,76,0.20)' : 'rgba(26,27,25,0.10)',
              border: annual ? '1px solid #C9A84C' : '1px solid rgba(201,168,76,0.20)',
            }}
            role="switch"
            aria-checked={annual}
            aria-labelledby="monthly-label annual-label"
          >
            <span
              className="inline-block h-[18px] w-[18px] rounded-full transition-all duration-300"
              style={{
                background: annual ? '#C9A84C' : '#A0A298',
                transform: annual ? 'translateX(22px)' : 'translateX(2px)',
              }}
            />
          </button>

          <span
            id="annual-label"
            className="font-[family-name:var(--font-inter)] font-medium"
            style={{ fontSize: '0.875rem', color: annual ? '#1A1B19' : '#6B6D66' }}
          >
            Annual
          </span>

          {annual && (
            <span
              className="font-[family-name:var(--font-manrope)] font-semibold px-[10px] py-[3px] rounded-full"
              style={{
                fontSize: '0.6875rem',
                color: '#A88730',
                background: '#FEF3CC',
                border: '1px solid rgba(201,168,76,0.25)',
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
              background: '#FFFFFF',
              border: '1px solid rgba(201,168,76,0.20)',
              borderRadius: 12,
              boxShadow: '0 1px 4px rgba(26,27,25,0.04)',
            }}
          >
            <div
              className="font-[family-name:var(--font-inter)] font-semibold tracking-[0.10em] uppercase mb-3"
              style={{ fontSize: '0.6875rem', color: '#6B6D66' }}
            >
              Free
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span
                id="free-plan-title"
                className="font-[family-name:var(--font-manrope)] font-extrabold leading-none tracking-[-0.04em]"
                style={{ fontSize: '2.75rem', color: '#1A1B19', fontVariantNumeric: 'tabular-nums' }}
              >
                £0
              </span>
            </div>
            <div
              className="font-[family-name:var(--font-inter)] mb-7"
              style={{ fontSize: '0.8125rem', color: '#6B6D66' }}
            >
              Forever free
            </div>

            <div
              className="mb-6"
              style={{ height: 1, background: 'rgba(201,168,76,0.15)' }}
            />

            <ul className="flex flex-col gap-[10px] flex-1 mb-7">
              {[
                { text: 'Up to 3 trips logged', included: true },
                { text: 'Basic rolling window tracker', included: true },
                { text: 'Risk alerts', included: false },
              ].map(({ text, included }) => (
                <li key={text} className="flex items-start gap-[10px]" style={{ opacity: included ? 1 : 0.4 }}>
                  {included
                    ? <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ stroke: '#A88730' }} strokeWidth={2} />
                    : <X className="w-4 h-4 mt-0.5 shrink-0" style={{ stroke: '#1A1B19' }} strokeWidth={2} />
                  }
                  <span
                    className="font-[family-name:var(--font-inter)] leading-[1.4]"
                    style={{ fontSize: '0.875rem', color: '#2C2E2A' }}
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
                color: '#1A1B19',
                background: 'transparent',
                border: '1px solid rgba(201,168,76,0.35)',
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
              background: 'linear-gradient(135deg, #E8C87A 0%, #C9A84C 100%)',
              borderRadius: 12,
              boxShadow: '0 16px 48px rgba(201,168,76,0.25), 0 1px 0 rgba(255,255,255,0.60) inset',
              border: '1px solid transparent',
            }}
          >
            {/* Most Popular badge */}
            <div className="absolute -top-[12px] left-1/2 -translate-x-1/2">
              <span
                className="inline-flex items-center px-[14px] py-[5px] rounded-full font-[family-name:var(--font-manrope)] font-bold tracking-[0.08em] uppercase whitespace-nowrap"
                style={{
                  fontSize: '0.625rem',
                  color: '#E8C87A',
                  background: '#1A1B19',
                  border: '1px solid rgba(201,168,76,0.20)',
                }}
              >
                Most Popular
              </span>
            </div>

            <div
              className="font-[family-name:var(--font-inter)] font-semibold tracking-[0.10em] uppercase mb-3"
              style={{ fontSize: '0.6875rem', color: 'rgba(26,27,25,0.60)' }}
            >
              Pro
            </div>

            <div className="flex items-baseline gap-1 mb-1 transition-all duration-300">
              <span
                id="pro-plan-title"
                className="font-[family-name:var(--font-manrope)] font-extrabold leading-none tracking-[-0.04em]"
                style={{ fontSize: '2.75rem', color: '#1A1B19', fontVariantNumeric: 'tabular-nums' }}
              >
                {annual ? '£24.99' : '£2.99'}
              </span>
            </div>
            <div
              className="font-[family-name:var(--font-inter)] mb-7"
              style={{ fontSize: '0.8125rem', color: 'rgba(26,27,25,0.60)' }}
            >
              {annual ? 'per year' : 'per month'}
            </div>

            <div
              className="mb-6"
              style={{ height: 1, background: 'rgba(26,27,25,0.15)' }}
            />

            <ul className="flex flex-col gap-[10px] flex-1 mb-7">
              {[
                'Unlimited trip logging',
                'What-if planning simulator',
                'Smart risk & breach alerts',
                'Audit-ready PDF exports',
              ].map((text) => (
                <li key={text} className="flex items-start gap-[10px]">
                  <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ stroke: '#1A1B19' }} strokeWidth={2} />
                  <span
                    className="font-[family-name:var(--font-inter)] leading-[1.4]"
                    style={{ fontSize: '0.875rem', color: 'rgba(26,27,25,0.80)' }}
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
                color: '#FEF3CC',
                background: '#1A1B19',
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
          style={{ fontSize: '0.875rem', color: '#6B6D66' }}
        >
          Prefer to pay once?{' '}
          <Link
            href="/signup?plan=lifetime"
            className="font-medium no-underline hover:underline transition-colors"
            style={{ color: '#A88730' }}
          >
            Get lifetime Pro access for £49.99 →
          </Link>
        </p>

        {/* Reassurance */}
        <p
          className="font-[family-name:var(--font-inter)] mt-3"
          style={{ fontSize: '0.75rem', color: '#A0A298' }}
        >
          Cancel anytime. No hidden fees. Prices in GBP.
        </p>
      </div>
    </section>
  );
}
