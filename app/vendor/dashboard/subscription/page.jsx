'use client';

import { useEffect, useState } from 'react';
import { Crown, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../../lib/api';
import Button from '../../../../components/ui/Button';
import Spinner from '../../../../components/ui/Spinner';
import { formatDate, formatINR } from '../../../../lib/utils';

// name is also what's sent to /subscriptions/create-order and stored as
// Subscription.planName — must match the backend PLANS array exactly.
const PLANS = [
  {
    name: '3 Month',
    displayName: '3 Months',
    price: 799900,
    period: '3 months',
    leadsPerMonth: 10,
    durationDays: 90,
    badge: null,
    features: [
      'Upto 10 leads per month',
      'Profile listing',
      'Portfolio showcase',
      'WhatsApp alerts',
      'Analytics dashboard',
      'Email support',
    ],
  },
  {
    name: '6 Month',
    displayName: '6 Months',
    price: 1499900,
    period: '6 months',
    leadsPerMonth: 10,
    durationDays: 180,
    badge: 'MOST POPULAR',
    features: [
      'Upto 10 leads per month',
      'Profile listing',
      'Portfolio showcase',
      'WhatsApp alerts',
      'Analytics dashboard',
      'Priority listing',
      'Email + Phone support',
    ],
  },
  {
    name: '12 Month',
    displayName: '12 Months',
    price: 1999900,
    period: '12 months',
    leadsPerMonth: 10,
    durationDays: 365,
    badge: 'BEST VALUE',
    features: [
      'Upto 10 leads per month',
      'Profile listing',
      'Portfolio showcase',
      'WhatsApp alerts',
      'Analytics dashboard',
      'Priority listing',
      'Featured badge',
      'Dedicated support',
    ],
  },
];

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function SubscriptionPage() {
  const [currentPlan,     setCurrentPlan]     = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(null);

  useEffect(() => {
    api.get('/subscriptions/my-plan')
      .then(({ data }) => setCurrentPlan(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (planName) => {
    setCheckoutLoading(planName);
    try {
      const { data: orderRes } = await api.post('/subscriptions/create-order', { planName });
      const orderData = orderRes.data;

      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error('Razorpay failed to load. Check your connection.');
        setCheckoutLoading(null);
        return;
      }

      const options = {
        key:         orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount:      orderData.amount,
        currency:    'INR',
        name:        'Intrafer',
        description: planName + ' Plan Subscription',
        order_id:    orderData.orderId,
        handler: async (response) => {
          try {
            await api.post('/subscriptions/verify-payment', {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });
            toast.success('Subscription activated! Your listing is now live.');
            window.location.reload();
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: {},
        theme: { color: '#3B82F6' },
        modal: { ondismiss: () => setCheckoutLoading(null) },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment.');
    }
    setCheckoutLoading(null);
  };

  const activePlanName = currentPlan?.subscription?.planName;

  if (loading) {
    return <div style={{ padding: '48px 0' }}><Spinner size="md" /></div>;
  }

  return (
    <div>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300,
        color: 'var(--color-text)', margin: '0 0 24px',
      }}>
        Subscription
      </h1>

      {/* Current plan status */}
      {currentPlan?.isActive ? (
        <div style={{
          background: 'var(--color-success-bg)', border: '1px solid rgba(45,106,79,0.3)',
          borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: 32,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <CheckCircle size={18} color="var(--color-success)" />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>
              {currentPlan.subscription?.planName} Plan — Active
            </span>
          </div>
          {currentPlan.subscription?.endDate && (
            <p style={{ fontSize: 13, color: 'var(--color-text-sub)', margin: '0 0 4px' }}>
              Renews on {formatDate(currentPlan.subscription.endDate)}
            </p>
          )}
          <p style={{ fontSize: 13, color: 'var(--color-success)', margin: 0, fontWeight: 500 }}>
            Your listing is live and accepting leads.
          </p>
        </div>
      ) : (
        <div style={{
          background: 'var(--color-warning-bg)', border: '1px solid var(--color-accent-bg)',
          borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: 32,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <AlertCircle size={18} color="var(--color-warning)" />
          <p style={{ fontSize: 13, color: 'var(--color-warning)', margin: 0 }}>
            No active subscription. Subscribe to start receiving leads.
          </p>
        </div>
      )}

      {/* Plans heading */}
      <h2 style={{
        fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300,
        color: 'var(--color-text)', margin: '0 0 20px',
      }}>
        Choose a plan
      </h2>

      {/* Plan cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 16,
      }}>
        {PLANS.map((plan) => {
          const isCurrentPlan = activePlanName === plan.name;

          return (
            <div
              key={plan.name}
              style={{
                background: 'var(--color-surface)',
                border: plan.badge ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)', padding: 24,
                position: 'relative',
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <div style={{
                  position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--color-primary)', color: '#fff',
                  fontSize: 10, padding: '3px 14px', borderRadius: 20,
                  letterSpacing: '0.06em', fontWeight: 600, whiteSpace: 'nowrap',
                }}>
                  {plan.badge}
                </div>
              )}

              {/* Plan name */}
              <p style={{
                fontSize: 13, fontWeight: 600, color: 'var(--color-primary)',
                letterSpacing: '0.04em', margin: '0 0 8px',
              }}>
                {plan.displayName.toUpperCase()}
              </p>

              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300,
                  color: 'var(--color-text)',
                }}>
                  {formatINR(plan.price)}
                </span>
                <span style={{ fontSize: 13, color: 'var(--color-text-hint)' }}>for {plan.period}</span>
              </div>

              {/* Leads badge */}
              <span style={{
                display: 'inline-block', marginBottom: 12,
                fontSize: 11, padding: '3px 10px', borderRadius: 20,
                background: 'var(--color-accent-bg)', color: 'var(--color-primary)',
                fontWeight: 600,
              }}>
                Upto {plan.leadsPerMonth} leads / month
              </span>

              {/* Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle size={12} color="var(--color-success)" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>{f}</span>
                  </div>
                ))}
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '0 0 14px' }} />

              {/* Subscribe button */}
              {isCurrentPlan ? (
                <button
                  disabled
                  style={{
                    width: '100%', padding: '10px 16px', fontSize: 13, fontWeight: 500,
                    background: 'var(--color-surface-alt)', color: 'var(--color-text-hint)',
                    border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                    cursor: 'not-allowed',
                  }}
                >
                  Current plan
                </button>
              ) : (
                <Button
                  variant="gold"
                  size="md"
                  loading={checkoutLoading === plan.name}
                  onClick={() => handleSubscribe(plan.name)}
                  style={{ width: '100%' }}
                >
                  Subscribe →
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
