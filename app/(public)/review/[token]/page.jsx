'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Star, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', lineHeight: 0 }}
        >
          <Star
            size={30}
            fill={n <= (hovered || value) ? '#F59E0B' : 'none'}
            color="#F59E0B"
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewInvitePage() {
  const { token } = useParams();

  const [state, setState] = useState('loading'); // loading | form | done | invalid
  const [invalidMessage, setInvalidMessage] = useState('');
  const [invite, setInvite] = useState(null);

  const [rating, setRating]   = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Leave a review | Intrafer';
  }, []);

  useEffect(() => {
    if (!token) return;
    api.get(`/reviews/invite/${token}`)
      .then(({ data }) => {
        setInvite(data.data);
        setState('form');
      })
      .catch((err) => {
        setInvalidMessage(err.response?.data?.message || 'This review link is invalid or has expired.');
        setState('invalid');
      });
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1) return setError('Please select a star rating.');

    setSubmitting(true);
    setError('');
    try {
      await api.post(`/reviews/invite/${token}`, { rating, comment: comment.trim() });
      setState('done');
      toast.success('Review submitted');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div style={{
      minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '48px 20px',
    }}>
      <div style={{
        width: '100%', maxWidth: 480, background: 'var(--surface)',
        border: '1px solid var(--border)', borderRadius: 'var(--r-xl)',
        padding: '40px 32px', textAlign: 'center',
      }}>
        {state === 'loading' && (
          <div style={{ padding: '24px 0', display: 'flex', justifyContent: 'center' }}>
            <Spinner size="md" />
          </div>
        )}

        {state === 'invalid' && (
          <>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'var(--danger-bg)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 20px',
            }}>
              <AlertCircle size={30} color="var(--danger)" strokeWidth={1.8} />
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 400,
              color: 'var(--text)', marginBottom: '10px',
            }}>
              Link unavailable
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: '24px' }}>
              {invalidMessage}
            </p>
            <Link href="/">
              <Button variant="secondary" size="md">Back to Intrafer</Button>
            </Link>
          </>
        )}

        {state === 'form' && invite && (
          <form onSubmit={handleSubmit}>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 400,
              color: 'var(--text)', marginBottom: '8px', letterSpacing: '-.01em',
            }}>
              How was your experience with {invite.vendorName}?
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-hint)', marginBottom: '28px' }}>
              {invite.projectType || 'Your project'} — enquiry {invite.enquiryId}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <StarPicker value={rating} onChange={(n) => { setRating(n); setError(''); }} />
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about your experience (optional)"
              rows={4}
              maxLength={2000}
              className="form-input-styled"
              style={{
                width: '100%', resize: 'vertical', padding: '12px 14px',
                fontSize: '14px', boxSizing: 'border-box', marginBottom: '8px',
              }}
            />

            {error && (
              <p style={{ fontSize: '13px', color: 'var(--danger)', marginBottom: '12px' }}>{error}</p>
            )}

            <Button type="submit" variant="primary" size="lg" loading={submitting} style={{ width: '100%', marginTop: '8px' }}>
              Submit review
            </Button>
          </form>
        )}

        {state === 'done' && (
          <>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'var(--primary-bg)', border: '2px solid var(--primary-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <CheckCircle2 size={30} color="var(--primary)" strokeWidth={1.8} />
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 400,
              color: 'var(--text)', marginBottom: '10px',
            }}>
              Thank you!
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: '24px' }}>
              Your review has been submitted and will help other homeowners choose the right designer.
            </p>
            <Link href="/">
              <Button variant="secondary" size="md">Back to Intrafer</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
