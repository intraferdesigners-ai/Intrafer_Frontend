'use client';

import { useEffect, useState } from 'react';
import api from '../../../../lib/api';
import Button from '../../../../components/ui/Button';
import Spinner from '../../../../components/ui/Spinner';
import { formatDate } from '../../../../lib/utils';

const HEADER_CELL = {
  fontSize: 11, fontWeight: 600, color: 'var(--color-text-hint)',
  letterSpacing: '0.06em', textTransform: 'uppercase',
};

function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString('en-IN', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

export default function AdminAuditLogsPage() {
  const [logs,       setLogs]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/audit-logs?limit=20&page=${page}`)
      .then(({ data }) => {
        const d = data.data;
        setLogs(d.logs || []);
        setTotalPages(d.totalPages || 1);
      })
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, color: 'var(--color-text)', margin: '0 0 6px' }}>
          Audit logs
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-hint)', margin: 0 }}>
          A record of every state-changing action taken by admins.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '48px 0' }}><Spinner size="md" /></div>
      ) : logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', fontSize: 13, color: 'var(--color-text-hint)' }}>
          No audit log entries yet.
        </div>
      ) : (
        <>
          {/* Header row */}
          <div className="admin-table-header" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)', padding: '10px 16px', marginBottom: 8,
          }}>
            <div style={{ ...HEADER_CELL, flex: 1.4 }}>Timestamp</div>
            <div style={{ ...HEADER_CELL, flex: 2   }}>Admin</div>
            <div style={{ ...HEADER_CELL, flex: 1.8 }}>Action</div>
            <div style={{ ...HEADER_CELL, flex: 0.8 }}>Method</div>
            <div style={{ ...HEADER_CELL, flex: 1.4 }}>Target ID</div>
          </div>

          {logs.map((log) => (
            <div
              key={log._id}
              className="admin-table-row"
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: 8,
              }}
            >
              {/* Timestamp */}
              <div style={{ flex: 1.4, fontSize: 12, color: 'var(--color-text-sub)' }}>
                {formatDate(log.createdAt)} · {formatTime(log.createdAt)}
              </div>

              {/* Admin */}
              <div style={{ flex: 2, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>
                  {log.adminName}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-hint)' }}>
                  {log.adminEmail}
                </div>
              </div>

              {/* Action */}
              <div style={{ flex: 1.8, fontSize: 13, color: 'var(--color-text)' }}>
                {log.action}
              </div>

              {/* Method */}
              <div style={{ flex: 0.8 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
                  color: 'var(--color-primary)', background: 'var(--color-primary-bg)',
                  padding: '2px 8px', borderRadius: 4,
                }}>
                  {log.method}
                </span>
              </div>

              {/* Target ID */}
              <div style={{ flex: 1.4, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-hint)' }}>
                {log.targetId || '—'}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 24 }}>
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Prev
              </Button>
              <span style={{ fontSize: 13, color: 'var(--color-text-sub)' }}>
                Page {page} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
