'use client';

import { useEffect, useState } from 'react';
import { Crown, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../../lib/api';
import Button from '../../../../components/ui/Button';
import Spinner from '../../../../components/ui/Spinner';
import { formatDate, formatINR } from '../../../../lib/utils';

const HISTORY_STATUS = {
  pending:   { label: 'Pending',   bg: 'var(--color-warning-bg)',  color: 'var(--color-warning)'   },
  active:    { label: 'Active',    bg: 'var(--color-success-bg)',  color: 'var(--color-success)'   },
  expired:   { label: 'Expired',   bg: 'var(--color-surface-alt)', color: 'var(--color-text-hint)' },
  cancelled: { label: 'Cancelled', bg: 'var(--color-surface-alt)', color: 'var(--color-text-hint)' },
  failed:    { label: 'Failed',    bg: 'var(--color-danger-bg)',   color: 'var(--color-danger)'    },
};

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
  const [history,         setHistory]         = useState([]);
  const [historyLoading,  setHistoryLoading]  = useState(true);
  const [downloadingId,   setDownloadingId]   = useState(null);
  const [couponInput,     setCouponInput]     = useState('');
  const [appliedCoupon,   setAppliedCoupon]   = useState(null); // { code, results: { [planName]: {...} } }
  const [applyingCoupon,  setApplyingCoupon]  = useState(false);
  const [couponError,     setCouponError]     = useState('');

  useEffect(() => {
    api.get('/subscriptions/my-plan')
      .then(({ data }) => setCurrentPlan(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.get('/subscriptions/history')
      .then(({ data }) => setHistory(data.data?.subscriptions || []))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, []);

  const handleDownloadInvoice = async (sub) => {
    setDownloadingId(sub._id);
    try {
      const res = await api.get(`/subscriptions/${sub._id}/invoice`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${sub.invoiceNumber || 'invoice'}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Failed to download invoice.');
    }
    setDownloadingId(null);
  };

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    setApplyingCoupon(true);
    setCouponError('');
    try {
      const entries = await Promise.all(PLANS.map(async (plan) => {
        try {
          const { data } = await api.post('/subscriptions/check-coupon', { code, planName: plan.name });
          return [plan.name, { valid: true, ...data.data }];
        } catch (err) {
          return [plan.name, { valid: false, reason: err.response?.data?.message || 'Invalid coupon code.' }];
        }
      }));
      const results = Object.fromEntries(entries);
      const anyValid = Object.values(results).some((r) => r.valid);

      if (!anyValid) {
        setCouponError(Object.values(results)[0]?.reason || 'Invalid coupon code.');
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({ code, results });
        toast.success(`Coupon "${code}" applied.`);
      }
    } catch {
      setCouponError('Failed to validate coupon. Please try again.');
    }
    setApplyingCoupon(false);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  const handleSubscribe = async (planName) => {
    setCheckoutLoading(planName);
    try {
      const planCoupon = appliedCoupon?.results?.[planName];
      const couponCode = planCoupon?.valid ? appliedCoupon.code : undefined;

      const { data: orderRes } = await api.post('/subscriptions/create-order', { planName, couponCode });
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
        color: 'var(--color-text)', margin: '0 0 16px',
      }}>
        Choose a plan
      </h2>

      {/* Coupon code */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 8 }}>
        <div style={{ flex: '1 1 220px', maxWidth: 280 }}>
          <label style={{
            display: 'block', fontSize: 12, fontWeight: 500,
            color: 'var(--color-text-sub)', marginBottom: 6,
          }}>
            Have a coupon code?
          </label>
          <input
            type="text"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
            placeholder="e.g. WELCOME20"
            style={{
              width: '100%', padding: '10px 12px', fontSize: 13,
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface)', color: 'var(--color-text)',
              boxSizing: 'border-box', textTransform: 'uppercase',
            }}
          />
        </div>
        <Button variant="secondary" size="md" loading={applyingCoupon} onClick={handleApplyCoupon}>
          Apply
        </Button>
        {appliedCoupon && (
          <button
            type="button"
            onClick={handleRemoveCoupon}
            style={{
              background: 'none', border: 'none', color: 'var(--color-text-hint)',
              fontSize: 12, cursor: 'pointer', textDecoration: 'underline', padding: '10px 4px',
            }}
          >
            Remove
          </button>
        )}
      </div>
      {couponError && (
        <p style={{ fontSize: 12, color: 'var(--color-danger)', margin: '0 0 20px' }}>{couponError}</p>
      )}
      {appliedCoupon && !couponError && (
        <p style={{ fontSize: 12, color: 'var(--color-success)', margin: '0 0 20px' }}>
          Coupon &quot;{appliedCoupon.code}&quot; applied — discount shown below where valid.
        </p>
      )}
      {!appliedCoupon && !couponError && <div style={{ marginBottom: 20 }} />}

      {/* Plan cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 16,
      }}>
        {PLANS.map((plan) => {
          const isCurrentPlan = activePlanName === plan.name;
          const couponResult  = appliedCoupon?.results?.[plan.name];
          const hasDiscount   = couponResult?.valid;

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
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                {hasDiscount ? (
                  <>
                    <span style={{ fontSize: 15, color: 'var(--color-text-hint)', textDecoration: 'line-through' }}>
                      {formatINR(plan.price)}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300,
                      color: 'var(--color-success)',
                    }}>
                      {formatINR(couponResult.finalAmount)}
                    </span>
                  </>
                ) : (
                  <span style={{
                    fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300,
                    color: 'var(--color-text)',
                  }}>
                    {formatINR(plan.price)}
                  </span>
                )}
                <span style={{ fontSize: 13, color: 'var(--color-text-hint)' }}>for {plan.period}</span>
              </div>
              {appliedCoupon && !hasDiscount && (
                <p style={{ fontSize: 11, color: 'var(--color-text-hint)', margin: '0 0 8px' }}>
                  Coupon not valid for this plan.
                </p>
              )}

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

      {/* Billing history */}
      <h2 style={{
        fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300,
        color: 'var(--color-text)', margin: '40px 0 20px',
      }}>
        Billing history
      </h2>

      {historyLoading ? (
        <div style={{ padding: '32px 0' }}><Spinner size="md" /></div>
      ) : history.length === 0 ? (
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)', padding: '32px 24px', textAlign: 'center',
          fontSize: 13, color: 'var(--color-text-hint)',
        }}>
          No billing history yet.
        </div>
      ) : (
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)', overflow: 'hidden',
        }}>
          {history.map((sub, i) => {
            const statusInfo = HISTORY_STATUS[sub.status] || HISTORY_STATUS.pending;
            const canDownload = !!sub.invoiceNumber;

            return (
              <div
                key={sub._id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                  padding: '14px 20px',
                  borderTop: i === 0 ? 'none' : '1px solid var(--color-border)',
                }}
              >
                <div style={{ flex: 2, minWidth: 140 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>
                    {sub.planName} Plan
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-hint)' }}>
                    {formatDate(sub.startDate || sub.createdAt)}
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 90 }}>
                  <span style={{ fontSize: 13, color: 'var(--color-text-sub)' }}>
                    {formatINR(sub.planPrice)}
                  </span>
                </div>

                <div style={{ flex: 1, minWidth: 90 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 20,
                    background: statusInfo.bg, color: statusInfo.color,
                  }}>
                    {statusInfo.label}
                  </span>
                </div>

                <div style={{ flex: 1, minWidth: 140, display: 'flex', justifyContent: 'flex-end' }}>
                  {canDownload ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={downloadingId === sub._id}
                      onClick={() => handleDownloadInvoice(sub)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <Download size={13} /> Invoice
                    </Button>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--color-text-hint)' }}>—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
