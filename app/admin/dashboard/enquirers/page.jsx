'use client';

import { useEffect, useState } from 'react';
import { Mail, Phone } from 'lucide-react';
import api from '../../../../lib/api';
import Spinner from '../../../../components/ui/Spinner';
import { formatDate, getInitials } from '../../../../lib/utils';

const HEADER_CELL = {
  fontSize: 11, fontWeight: 600, color: 'var(--color-text-hint)',
  letterSpacing: '0.06em', textTransform: 'uppercase',
};

// Read-only directory of everyone who has ever submitted an enquiry —
// sourced from Lead's own contact fields, not a User account (homeowner
// accounts no longer exist, see the homeowner-removal plan, Phases 1-5).
// There's no account left to block, so unlike the old Users page this has
// no action column.
export default function AdminEnquirersPage() {
  const [enquirers, setEnquirers] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    api.get('/admin/enquirers')
      .then(({ data }) => setEnquirers(data.data?.enquirers || []))
      .catch(() => setEnquirers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, color: 'var(--color-text)', margin: 0 }}>
            Enquirers
          </h1>
          {!loading && (
            <span style={{ fontSize: 13, color: 'var(--color-text-hint)', background: 'var(--color-surface-alt)', padding: '2px 10px', borderRadius: 20, fontWeight: 500 }}>
              {enquirers.length}
            </span>
          )}
        </div>
        <p style={{ fontSize: 14, color: 'var(--color-text-hint)', margin: 0 }}>
          Everyone who has submitted an enquiry through the platform.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '48px 0' }}><Spinner size="md" /></div>
      ) : enquirers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', fontSize: 13, color: 'var(--color-text-hint)' }}>
          No enquiries submitted yet.
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="admin-table-header" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)', padding: '10px 16px', marginBottom: 8,
          }}>
            <div style={{ ...HEADER_CELL, flex: 2 }}>Enquirer</div>
            <div style={{ ...HEADER_CELL, flex: 2 }}>Contact</div>
            <div style={{ ...HEADER_CELL, flex: 1 }}>First enquiry</div>
            <div style={{ ...HEADER_CELL, flex: 1 }}>Last enquiry</div>
            <div style={{ ...HEADER_CELL, flex: 1, textAlign: 'right' }}>Enquiries</div>
          </div>

          {enquirers.map((enquirer) => (
            <div
              key={enquirer._id}
              className="admin-table-row"
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: 8,
              }}
            >
              {/* Enquirer */}
              <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--color-info-bg)', color: 'var(--color-info)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600,
                }}>
                  {getInitials(enquirer.name)}
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', minWidth: 0 }}>
                  {enquirer.name || 'Unknown'}
                </div>
              </div>

              {/* Contact */}
              <div style={{ flex: 2, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-sub)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <Mail size={11} color="var(--color-text-hint)" />{enquirer.email}
                </div>
                {enquirer.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-sub)' }}>
                    <Phone size={11} color="var(--color-text-hint)" />{enquirer.phone}
                  </div>
                )}
              </div>

              {/* First enquiry */}
              <div style={{ flex: 1, fontSize: 13, color: 'var(--color-text-sub)' }}>
                {formatDate(enquirer.firstEnquiryAt)}
              </div>

              {/* Last enquiry */}
              <div style={{ flex: 1, fontSize: 13, color: 'var(--color-text-sub)' }}>
                {formatDate(enquirer.lastEnquiryAt)}
              </div>

              {/* Enquiries count */}
              <div style={{ flex: 1, fontSize: 13, color: 'var(--color-text)', textAlign: 'right', fontWeight: 500 }}>
                {enquirer.leadCount}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
