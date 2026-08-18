'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { isAuthenticated } from '../../lib/auth';
import Sidebar from './Sidebar';
import MobileTabBar from './MobileTabBar';
import ErrorBoundary from '../ui/ErrorBoundary';
import NotificationBell from '../notification/NotificationBell';
import { useTheme } from '../../context/ThemeContext';
import CompareBar from '../vendor/CompareBar';
import PageTransition from '../ui/PageTransition';

// Idle timeout, not absolute session length — logs out after this long with
// zero user activity, regardless of how much of the 7-day refresh-token
// window is left. This sits alongside the silent access-token refresh in
// lib/api.js rather than replacing it: refresh keeps an ACTIVE session
// seamless across the 15-minute access-token expiry, while this timer is the
// thing that actually ends an abandoned one.
const IDLE_LIMIT_MS = 60 * 60 * 1000; // 1 hour
const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'wheel', 'touchstart'];

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { initFromCookies, role, clearAuth } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    initFromCookies();
    if (!isAuthenticated()) {
      router.push('/auth/login');
    }
  }, []);

  useEffect(() => {
    let idleTimer;

    const logoutForInactivity = () => {
      clearAuth();
      toast.error("You've been logged out due to inactivity.");
      router.push(role ? `/auth/login?role=${role}` : '/auth/login');
    };

    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(logoutForInactivity, IDLE_LIMIT_MS);
    };

    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, resetIdleTimer, { passive: true }));
    resetIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, resetIdleTimer));
    };
  }, [role, clearAuth, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  return (
    <div className="dashboard-layout">
      {/* Overlay — mobile only */}
      <div
        className={`dashboard-sidebar-overlay${sidebarOpen ? ' open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`dashboard-sidebar${sidebarOpen ? ' open' : ''}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main content */}
      <main className="dashboard-content">
        {/* Mobile top bar */}
        <div
          className="show-mobile-flex"
          style={{
            alignItems: 'center',
            padding: '10px 16px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface)',
            position: 'sticky',
            top: 0,
            zIndex: 40,
            gap: '12px',
          }}
        >
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <line x1="2" y1="5" x2="16" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="2" y1="9" x2="16" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="2" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', flex: 1 }}>Intrafer</span>
          <NotificationBell />
          <button
            onClick={toggleTheme}
            className="mobile-menu-btn"
            aria-label="Toggle theme"
            style={{ display: 'flex' }}
          >
            <span style={{ fontSize: '16px' }}>{theme === 'dark' ? '☀️' : '🌙'}</span>
          </button>
        </div>

        <ErrorBoundary fallback={
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-danger)' }}>Failed to load this page.</p>
            <a href="/auth/login" style={{ color: 'var(--color-primary)' }}>Return to login</a>
          </div>
        }>
          <PageTransition duration={0.15}>{children}</PageTransition>
        </ErrorBoundary>

        <CompareBar />
      </main>

      <MobileTabBar role={role} />
    </div>
  );
}
