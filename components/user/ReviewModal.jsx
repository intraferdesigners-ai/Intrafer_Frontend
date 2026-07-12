'use client';

import { useState } from 'react';
import { X, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';
import Button from '../ui/Button';

export default function ReviewModal({ leadId, vendorName, onClose, onSubmitted }) {
  const [rating,      setRating]      = useState(0);
  const [hovered,     setHovered]     = useState(0);
  const [comment,     setComment]     = useState('');
  const [submitting,  setSubmitting]  = useState(false);

  const handleSubmit = async () => {
    if (!rating) { toast.error('Please select a star rating.'); return; }
    setSubmitting(true);
    try {
      await api.post('/reviews', { leadId, rating, comment });
      toast.success('Review submitted!');
      onSubmitted?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review.');
    }
    setSubmitting(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: 'var(--color-bg)', borderRadius: 'var(--radius-xl)',
        padding: 32, maxWidth: 440, width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300,
            color: 'var(--color-text)', margin: 0,
          }}>
            Review {vendorName}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-hint)', padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Stars */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: 'var(--color-text-hint)', marginBottom: 10,
          }}>
            Overall rating
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(n)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
              >
                <Star
                  size={28}
                  fill={(hovered || rating) >= n ? '#F59E0B' : 'none'}
                  color={(hovered || rating) >= n ? '#F59E0B' : 'var(--color-border)'}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <div style={{ fontSize: 12, color: 'var(--color-text-hint)', marginTop: 6 }}>
              {['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'][rating]}
            </div>
          )}
        </div>

        {/* Comment */}
        <div style={{ marginBottom: 24 }}>
          <label style={{
            display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: 'var(--color-text-hint)', marginBottom: 8,
          }}>
            Your experience (optional)
          </label>
          <textarea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share what you liked or any feedback for the designer…"
            style={{
              width: '100%', padding: '10px 14px', fontSize: 13,
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)', color: 'var(--color-text)',
              resize: 'vertical', fontFamily: 'var(--font-ui)', boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '10px 16px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)', background: 'none',
              fontSize: 13, fontWeight: 500, cursor: 'pointer', color: 'var(--color-text-sub)',
            }}
          >
            Cancel
          </button>
          <Button variant="primary" size="md" loading={submitting} onClick={handleSubmit} style={{ flex: 1 }}>
            Submit review
          </Button>
        </div>
      </div>
    </div>
  );
}
