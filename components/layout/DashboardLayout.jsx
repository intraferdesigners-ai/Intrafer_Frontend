'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useAuthStore from '../../store/authStore';
import { isAuthenticated } from '../../lib/auth';
import Sidebar from './Sidebar';
import ErrorBoundary from '../ui/ErrorBoundary';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { initFromCookies } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    initFromCookies();
    if (!isAuthenticated()) {
      router.push('/auth/login');
    }
  }, []);

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
          <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>Dashboard</span>
        </div>

        <ErrorBoundary fallback={
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-danger)' }}>Failed to load this page.</p>
            <a href="/auth/login" style={{ color: 'var(--color-primary)' }}>Return to login</a>
          </div>
        }>
          {children}
        </ErrorBoundary>
      </main>
    </div>
  );
}
