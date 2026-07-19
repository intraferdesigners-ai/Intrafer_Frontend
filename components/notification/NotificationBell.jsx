'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import api from '../../lib/api';
import useNotificationStore from '../../store/notificationStore';
import NotificationPanel from './NotificationPanel';

const POLL_INTERVAL_MS = 45000;

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);

  useEffect(() => {
    const fetchUnreadCount = () => {
      api.get('/notifications/unread-count')
        .then(({ data }) => setUnreadCount(data.data?.count ?? 0))
        .catch(() => {});
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [setUnreadCount]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'flex' }}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
        style={{
          position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '34px', height: '34px', borderRadius: 'var(--r-md)',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-mid)', flexShrink: 0,
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '2px', right: '2px',
            minWidth: '16px', height: '16px', padding: '0 4px',
            borderRadius: '9px', background: 'var(--danger)',
            color: '#fff', fontSize: '10px', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            lineHeight: 1,
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
