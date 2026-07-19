'use client';

import { useState, useEffect } from 'react';
import api from '../../lib/api';
import useNotificationStore from '../../store/notificationStore';
import useAuthStore from '../../store/authStore';
import { formatRelativeTime } from '../../lib/utils';
import { Bell, X, FileText, CheckCircle, Crown, AlertCircle, Calendar, MessageCircle } from 'lucide-react';
import Spinner from '../ui/Spinner';

const NOTIFICATION_CONFIG = {
  lead_assigned:         { icon: FileText,      color: 'var(--info)',    bg: 'var(--info-bg)'    },
  lead_accepted:         { icon: CheckCircle,   color: 'var(--success)', bg: 'var(--success-bg)' },
  payment_success:       { icon: Crown,         color: 'var(--primary)', bg: 'var(--primary-bg)' },
  subscription_expiring: { icon: AlertCircle,   color: 'var(--warning)', bg: 'var(--warning-bg)' },
  vendor_approved:       { icon: CheckCircle,   color: 'var(--success)', bg: 'var(--success-bg)' },
  enquiry_created:       { icon: FileText,      color: 'var(--info)',    bg: 'var(--info-bg)'    },
  appointment_confirmed: { icon: Calendar,      color: 'var(--info)',    bg: 'var(--info-bg)'    },
  new_message:           { icon: MessageCircle, color: 'var(--primary)', bg: 'var(--primary-bg)' },
};

const DEFAULT_CONFIG = { icon: Bell, color: 'var(--text-hint)', bg: 'var(--bg-parchment)' };

export default function NotificationPanel({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    api.get('/notifications?limit=15')
      .then(({ data }) => setNotifications(data.data?.notifications || []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, [isOpen]);

  function handleNotificationClick(notification) {
    if (!notification.isRead) {
      api.put(`/notifications/${notification._id}/read`).catch(() => {});
      setNotifications((prev) =>
        prev.map((n) => n._id === notification._id ? { ...n, isRead: true } : n)
      );
      useNotificationStore.getState().decrement();
    }

    const leadId = notification.metadata?.leadId;
    const role = useAuthStore.getState().role;
    const deepLinks = {
      lead_assigned:         `/vendor/dashboard/leads/${leadId}`,
      lead_accepted:         `/vendor/dashboard/leads/${leadId}`,
      payment_success:       '/vendor/dashboard/subscription',
      subscription_expiring: '/vendor/dashboard/subscription',
      vendor_approved:       '/vendor/dashboard/profile',
      enquiry_created:       `/user/dashboard/enquiries/${leadId}`,
      // appointment_confirmed is only ever dispatched to the homeowner (see
      // notification.service.js's APPOINTMENT_CONFIRMED handler), so the path
      // is fixed — unlike new_message, which goes to whichever party didn't
      // send it, so it has to follow the current viewer's role.
      appointment_confirmed: `/user/dashboard/enquiries/${leadId}`,
      new_message:           role === 'vendor' ? `/vendor/dashboard/leads/${leadId}` : `/user/dashboard/enquiries/${leadId}`,
    };
    const href = deepLinks[notification.type];
    if (href) window.location.href = href;
    onClose();
  }

  function handleMarkAllRead() {
    api.put('/notifications/read-all').catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    useNotificationStore.getState().reset();
  }

  const hasUnread = notifications.some((n) => !n.isRead);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '100%',
      right: 0,
      marginTop: '8px',
      width: 'min(360px, calc(100vw - 32px))',
      maxHeight: '480px',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-xl)',
      boxShadow: 'var(--shadow-lg)',
      overflow: 'hidden',
      zIndex: 100,
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 16px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
      }}>
        <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>
          Notifications
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {hasUnread && (
            <button onClick={handleMarkAllRead} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '12px', color: 'var(--primary)', padding: 0,
            }}>
              Mark all read
            </button>
          )}
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '2px', display: 'flex', alignItems: 'center',
            color: 'var(--text-hint)',
          }}>
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
        {loading ? (
          <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
            <Spinner size="sm" />
          </div>
        ) : notifications.length === 0 ? (
          <div style={{
            padding: '32px', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '8px',
          }}>
            <Bell size={32} style={{ color: 'var(--text-hint)' }} />
            <span style={{ fontSize: '13px', color: 'var(--text-hint)' }}>No notifications yet.</span>
          </div>
        ) : (
          notifications.map((n) => {
            const config   = NOTIFICATION_CONFIG[n.type] || DEFAULT_CONFIG;
            const IconComp = config.icon;
            return (
              <div
                key={n._id}
                className="notif-row"
                onClick={() => handleNotificationClick(n)}
                style={{
                  display: 'flex', gap: '12px', padding: '14px 16px',
                  borderBottom: '1px solid var(--border)',
                  background: !n.isRead ? 'var(--bg-parchment)' : 'transparent',
                }}
              >
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: config.bg, color: config.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <IconComp size={15} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {!n.isRead && (
                      <span style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: 'var(--primary)', flexShrink: 0, display: 'inline-block',
                      }} />
                    )}
                    <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>
                      {n.title}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '12px', color: 'var(--text-sub)', lineHeight: 1.5,
                    marginTop: '2px', overflow: 'hidden',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  }}>
                    {n.message}
                  </p>
                  <span style={{ fontSize: '11px', color: 'var(--text-hint)', marginTop: '4px', display: 'block' }}>
                    {formatRelativeTime(n.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
