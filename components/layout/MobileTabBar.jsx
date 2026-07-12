'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = {
  user: [
    { href: '/user/dashboard',            label: 'Home',      icon: 'home'    },
    { href: '/user/dashboard/enquiries',  label: 'Enquiries', icon: 'list'    },
    { href: '/user/dashboard/profile',    label: 'Profile',   icon: 'user'    },
  ],
  vendor: [
    { href: '/vendor/dashboard',              label: 'Home',      icon: 'home'        },
    { href: '/vendor/dashboard/leads',        label: 'Leads',     icon: 'inbox'       },
    { href: '/vendor/dashboard/projects',     label: 'Portfolio', icon: 'photo'       },
    { href: '/vendor/dashboard/subscription', label: 'Plans',     icon: 'credit-card' },
    { href: '/vendor/dashboard/profile',      label: 'Profile',   icon: 'user'        },
  ],
  admin: [
    { href: '/admin/dashboard',           label: 'Home',      icon: 'home'      },
    { href: '/admin/dashboard/vendors',   label: 'Vendors',   icon: 'building'  },
    { href: '/admin/dashboard/leads',     label: 'Leads',     icon: 'list'      },
    { href: '/admin/dashboard/users',     label: 'Users',     icon: 'users'     },
    { href: '/admin/dashboard/analytics', label: 'Analytics', icon: 'chart-bar' },
    { href: '/admin/dashboard/profile',   label: 'Profile',   icon: 'user'      },
    { href: '/admin/dashboard/settings',  label: 'Settings',  icon: 'settings'  },
  ],
};

const ICONS = {
  home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  list: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  inbox: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>,
  photo: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  'credit-card': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  building: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22V12h6v10"/><path d="M8 7h.01M16 7h.01M8 11h.01M16 11h.01"/></svg>,
  users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  'chart-bar': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
};

export default function MobileTabBar({ role = 'user' }) {
  const pathname = usePathname();
  const tabs = TABS[role] || TABS.user;
  const dashRoot = `/${role}/dashboard`;

  return (
    <nav className="mobile-tab-bar" role="navigation" aria-label="Dashboard navigation">
      {tabs.map((tab) => {
        const active = tab.href === dashRoot
          ? pathname === dashRoot
          : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`mobile-tab-item${active ? ' active' : ''}`}
          >
            {ICONS[tab.icon]}
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
