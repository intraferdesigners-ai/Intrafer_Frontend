'use client';

import { useEffect, useState } from 'react';
import { Mail, Phone } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../../lib/api';
import Button from '../../../../components/ui/Button';
import Spinner from '../../../../components/ui/Spinner';
import { formatDate, getInitials } from '../../../../lib/utils';

const HEADER_CELL = {
  fontSize: 11, fontWeight: 600, color: 'var(--color-text-hint)',
  letterSpacing: '0.06em', textTransform: 'uppercase',
};

export default function AdminUsersPage() {
  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [blockingId,  setBlockingId]  = useState(null);

  useEffect(() => {
    api.get('/admin/users')
      .then(({ data }) => setUsers(data.data?.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleBlock = async (userId, currentlyBlocked) => {
    if (!currentlyBlocked) {
      const ok = window.confirm('Block this user? They will not be able to submit new enquiries.');
      if (!ok) return;
    }
    setBlockingId(userId);
    try {
      await api.put(`/admin/users/${userId}/block`, { reason: 'Suspicious activity' });
      setUsers((prev) =>
        prev.map((u) => u._id === userId ? { ...u, isBlocked: !u.isBlocked } : u)
      );
      toast.success(currentlyBlocked ? 'User unblocked.' : 'User blocked.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    }
    setBlockingId(null);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, color: 'var(--color-text)', margin: 0 }}>
            Users
          </h1>
          {!loading && (
            <span style={{ fontSize: 13, color: 'var(--color-text-hint)', background: 'var(--color-surface-alt)', padding: '2px 10px', borderRadius: 20, fontWeight: 500 }}>
              {users.length}
            </span>
          )}
        </div>
        <p style={{ fontSize: 14, color: 'var(--color-text-hint)', margin: 0 }}>
          All registered homeowners on the platform.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '48px 0' }}><Spinner size="md" /></div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', fontSize: 13, color: 'var(--color-text-hint)' }}>
          No users registered yet.
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="admin-table-header" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)', padding: '10px 16px', marginBottom: 8,
          }}>
            <div style={{ ...HEADER_CELL, flex: 2 }}>Member</div>
            <div style={{ ...HEADER_CELL, flex: 2 }}>Contact</div>
            <div style={{ ...HEADER_CELL, flex: 1 }}>Joined</div>
            <div style={{ ...HEADER_CELL, flex: 1 }}>Enquiries</div>
            <div style={{ ...HEADER_CELL, flex: 1, textAlign: 'right' }}>Action</div>
          </div>

          {users.map((user) => (
            <div
              key={user._id}
              className="admin-table-row"
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: user.isBlocked ? 'var(--color-danger-bg, #fff5f5)' : 'var(--color-surface)',
                border: user.isBlocked ? '1px solid var(--color-danger)' : '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: 8,
              }}
            >
              {/* Member */}
              <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: user.isBlocked ? 'var(--color-danger-bg, #fee2e2)' : 'var(--color-info-bg)',
                  color: user.isBlocked ? 'var(--color-danger)' : 'var(--color-info)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600,
                }}>
                  {getInitials(user.name)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>
                      {user.name}
                    </div>
                    {user.isBlocked && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                        background: 'var(--color-danger)', color: '#fff', letterSpacing: '0.04em',
                      }}>
                        BLOCKED
                      </span>
                    )}
                  </div>
                  <span style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 20,
                    background: 'var(--color-surface-alt)', color: 'var(--color-text-hint)',
                    fontWeight: 500, letterSpacing: '0.04em',
                  }}>
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Contact */}
              <div style={{ flex: 2, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-sub)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <Mail size={11} color="var(--color-text-hint)" />{user.email}
                </div>
                {user.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-sub)' }}>
                    <Phone size={11} color="var(--color-text-hint)" />{user.phone}
                  </div>
                )}
              </div>

              {/* Joined */}
              <div style={{ flex: 1, fontSize: 13, color: 'var(--color-text-sub)' }}>
                {formatDate(user.createdAt)}
              </div>

              {/* Enquiries */}
              <div style={{ flex: 1, fontSize: 13, color: 'var(--color-text-hint)' }}>
                —
              </div>

              {/* Action */}
              <div className="admin-cell-actions" style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant={user.isBlocked ? 'success' : 'danger'}
                  size="sm"
                  loading={blockingId === user._id}
                  onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                >
                  {user.isBlocked ? 'Unblock' : 'Block'}
                </Button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
