'use client';

import Link from 'next/link';
import { CheckCircle, Circle, ChevronRight } from 'lucide-react';

export default function OnboardingChecklist({ vendor, projects, subscription }) {
  const steps = [
    {
      id: 'profile',
      label: 'Complete your business profile',
      desc: 'Add business name, description, city, and specializations.',
      done: !!(
        vendor?.businessName &&
        vendor?.description &&
        vendor?.location?.city &&
        vendor?.specializations?.length > 0
      ),
      href: '/vendor/dashboard/profile',
      cta: 'Complete profile',
    },
    {
      id: 'portfolio',
      label: 'Add 3 portfolio projects',
      desc: 'Upload your best work with photos and descriptions.',
      done: (projects?.length || 0) >= 3,
      href: '/vendor/dashboard/projects',
      cta: 'Add projects',
    },
    {
      id: 'photos',
      label: 'Upload project photos',
      desc: 'Projects with photos get 5× more enquiries.',
      done: projects?.some((p) => p.images?.length > 0) || false,
      href: '/vendor/dashboard/projects',
      cta: 'Add photos',
    },
    {
      id: 'approval',
      label: 'Awaiting admin approval',
      desc: 'Our team reviews profiles within 24–48 business hours.',
      done: vendor?.isApproved || false,
      href: null,
      cta: null,
      pending: true,
    },
    {
      id: 'subscription',
      label: 'Subscribe to start receiving leads',
      desc: 'Choose a plan to activate your listing and get matched with homeowners.',
      done: subscription?.isActive || false,
      href: '/vendor/dashboard/subscription',
      cta: 'View plans',
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const percentage = Math.round((completedCount / steps.length) * 100);

  if (percentage === 100) return null;

  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1.5px solid var(--color-accent)',
      borderRadius: 'var(--radius-xl)',
      padding: 24,
      marginBottom: 24,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'var(--color-primary)',
        }}>
          Getting started
        </span>
        <span style={{ fontSize: 13, color: 'var(--color-text-hint)' }}>
          {completedCount}/{steps.length} complete
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ background: 'var(--color-border)', borderRadius: 4, height: 6, margin: '0 0 20px' }}>
        <div style={{
          background: 'var(--color-primary)', width: `${percentage}%`,
          borderRadius: 4, height: '100%', transition: 'width 600ms ease-out',
        }} />
      </div>

      {/* Steps */}
      {steps.map((step, i) => (
        <div
          key={step.id}
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '10px 0',
            borderBottom: i < steps.length - 1 ? '1px solid var(--color-border)' : 'none',
          }}
        >
          {/* Icon */}
          <div style={{ flexShrink: 0, marginTop: 1 }}>
            {step.done ? (
              <CheckCircle size={18} color="var(--color-success)" fill="var(--color-success)" />
            ) : step.pending ? (
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                border: '2px solid var(--color-text-hint)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  border: '1.5px solid transparent',
                  borderTopColor: 'var(--color-text-hint)',
                  animation: 'spin 1s linear infinite',
                }} />
              </div>
            ) : (
              <Circle size={18} color="var(--color-text-hint)" />
            )}
          </div>

          {/* Content */}
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 13, fontWeight: 500,
              color: 'var(--color-text)',
              opacity: step.done ? 0.5 : 1,
              textDecoration: step.done ? 'line-through' : 'none',
            }}>
              {step.label}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-hint)', marginTop: 2 }}>
              {step.desc}
            </div>
          </div>

          {/* CTA */}
          {!step.done && step.href && (
            <Link
              href={step.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 3,
                fontSize: 12, fontWeight: 500, color: 'var(--color-primary)',
                textDecoration: 'none', flexShrink: 0,
              }}
            >
              {step.cta} <ChevronRight size={13} />
            </Link>
          )}
        </div>
      ))}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
