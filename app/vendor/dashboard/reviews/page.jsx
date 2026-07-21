'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import api from '../../../../lib/api';
import Spinner from '../../../../components/ui/Spinner';
import { formatDate } from '../../../../lib/utils';

export default function VendorReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading,  setLoading] = useState(true);

  useEffect(() => {
    api.get('/vendor/profile')
      .then(({ data }) => {
        const vendorId = data.data?.vendor?._id;
        if (!vendorId) return Promise.reject();
        return api.get(`/reviews/vendor/${vendorId}`);
      })
      .then(({ data }) => {
        setReviews(data.data?.reviews || []);
      })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300,
        color: 'var(--color-text)', margin: '0 0 28px',
      }}>
        Reviews
      </h1>

      {loading ? (
        <div style={{ padding: '48px 0' }}><Spinner size="md" /></div>
      ) : reviews.length === 0 ? (
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)', padding: '48px 24px', textAlign: 'center',
          fontSize: 13, color: 'var(--color-text-hint)',
        }}>
          No reviews yet.
        </div>
      ) : (
        reviews.map((review) => (
          <div
            key={review._id}
            style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)', padding: 20, marginBottom: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={15}
                    fill={n <= review.rating ? '#F59E0B' : 'none'}
                    color="#F59E0B"
                  />
                ))}
              </div>
              <span style={{ fontSize: 12, color: 'var(--color-text-hint)' }}>
                {formatDate(review.createdAt)}
              </span>
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', margin: '8px 0 0' }}>
              {review.userId?.name || 'Anonymous'}
            </p>
            {review.comment && (
              <p style={{ fontSize: 13, color: 'var(--color-text-sub)', lineHeight: 1.6, margin: '6px 0 0' }}>
                {review.comment}
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
