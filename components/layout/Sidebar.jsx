'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, FileText, Building2, Crown,
  User, Users, BarChart3, LogOut, ChevronRight, UserCheck, Settings, Heart, Calendar, Newspaper, Tag, LifeBuoy, Mail, Shield, Star,
  MapPin, LayoutGrid, ScrollText, FileBarChart, ClipboardCheck,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { clearAuthTokens } from '../../lib/auth';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from '../notification/NotificationBell';

// Maps each permission-gated admin nav item to the permission key that
// unlocks it on the backend (see Intrafer_Backend/src/routes/admin.routes.js).
// Items with no entry here (Dashboard, Visitors, Profile) are always visible
// to any admin — "Team" is handled separately below since it's gated on
// isSuperAdmin rather than a permission key.
const ADMIN_NAV_PERMISSIONS = {
  '/admin/dashboard/vendors':         'manage_vendors',
  '/admin/dashboard/leads':           'manage_leads',
  '/admin/dashboard/users':           'manage_users',
  '/admin/dashboard/analytics':       'view_analytics',
  '/admin/dashboard/blog':            'manage_blog',
  '/admin/dashboard/coupons':         'manage_coupons',
  '/admin/dashboard/support':         'manage_support',
  '/admin/dashboard/email-templates': 'manage_email_templates',
  '/admin/dashboard/settings':        'manage_settings',
  '/admin/dashboard/cities':          'manage_taxonomy',
  '/admin/dashboard/categories':      'manage_taxonomy',
  '/admin/dashboard/reports':         'view_analytics',
  '/admin/dashboard/portfolio-approvals': 'manage_portfolio',
  '/admin/dashboard/projects':        'manage_portfolio',
  '/admin/dashboard/subscriptions':   'view_analytics',
};

const NAV = {
  user: [
    { label: 'Dashboard',       href: '/user/dashboard',                icon: LayoutDashboard },
    { label: 'My enquiries',    href: '/user/dashboard/enquiries',      icon: FileText        },
    { label: 'Appointments',    href: '/user/dashboard/appointments',   icon: Calendar        },
    { label: 'Saved Designers', href: '/user/dashboard/saved',          icon: Heart           },
    { label: 'Profile',         href: '/user/dashboard/profile',        icon: User            },
    { label: 'Settings',        href: '/user/dashboard/settings',       icon: Settings        },
  ],
  vendor: [
    { label: 'Dashboard',    href: '/vendor/dashboard',              icon: LayoutDashboard },
    { label: 'Leads',        href: '/vendor/dashboard/leads',        icon: FileText        },
    { label: 'Appointments', href: '/vendor/dashboard/appointments', icon: Calendar        },
    { label: 'Portfolio',    href: '/vendor/dashboard/projects',     icon: Building2       },
    { label: 'Reviews',      href: '/vendor/dashboard/reviews',      icon: Star            },
    { label: 'Subscription', href: '/vendor/dashboard/subscription', icon: Crown           },
    { label: 'Profile',      href: '/vendor/dashboard/profile',      icon: User            },
    { label: 'Settings',     href: '/vendor/dashboard/settings',     icon: Settings        },
  ],
  admin: [
    { label: 'Dashboard',    href: '/admin/dashboard',               icon: LayoutDashboard },
    { label: 'Vendors',      href: '/admin/dashboard/vendors',       icon: Building2       },
    { label: 'Leads',        href: '/admin/dashboard/leads',         icon: FileText        },
    { label: 'Users',        href: '/admin/dashboard/users',         icon: Users           },
    { label: 'Analytics',    href: '/admin/dashboard/analytics',     icon: BarChart3       },
    { label: 'Reports',      href: '/admin/dashboard/reports',       icon: FileBarChart    },
    { label: 'Subscriptions', href: '/admin/dashboard/subscriptions', icon: Crown          },
    { label: 'Blog',         href: '/admin/dashboard/blog',          icon: Newspaper       },
    { label: 'Coupons',      href: '/admin/dashboard/coupons',       icon: Tag             },
    { label: 'Portfolio Approvals', href: '/admin/dashboard/portfolio-approvals', icon: ClipboardCheck },
    { label: 'All Projects', href: '/admin/dashboard/projects',      icon: Building2       },
    { label: 'Cities',       href: '/admin/dashboard/cities',        icon: MapPin          },
    { label: 'Categories',   href: '/admin/dashboard/categories',    icon: LayoutGrid      },
    { label: 'Support',      href: '/admin/dashboard/support',       icon: LifeBuoy        },
    { label: 'Visitors',     href: '/admin/dashboard/visitors',      icon: UserCheck       },
    { label: 'Profile',      href: '/admin/dashboard/profile',       icon: User            },
    { label: 'Settings',     href: '/admin/dashboard/settings',      icon: Settings        },
    { label: 'Email Templates', href: '/admin/dashboard/email-templates', icon: Mail        },
    { label: 'Team',         href: '/admin/dashboard/team',          icon: Shield          },
    { label: 'Audit Logs',   href: '/admin/dashboard/audit-logs',    icon: ScrollText      },
  ],
};

const ROLE_LABELS = { user: 'Homeowner', vendor: 'Designer', admin: 'Admin' };

export default function Sidebar({ onClose }) {
  const pathname                  = usePathname();
  const router                    = useRouter();
  const { user, role, clearAuth } = useAuthStore();
  const { theme, toggleTheme }    = useTheme();

  const items = useMemo(() => {
    const base = NAV[role] || [];
    if (role !== 'admin') return base;

    return base.filter((item) => {
      if (item.href === '/admin/dashboard/team') return user?.isSuperAdmin === true;
      if (item.href === '/admin/dashboard/audit-logs') return user?.isSuperAdmin === true;
      const requiredPermission = ADMIN_NAV_PERMISSIONS[item.href];
      if (!requiredPermission) return true; // Dashboard, Visitors, Profile
      if (!user) return true; // still hydrating from /auth/me — avoid a flash of missing items
      if (user.isSuperAdmin) return true;
      return user.adminPermissions?.includes(requiredPermission);
    });
  }, [role, user]);

  const handleLogout = () => {
    clearAuthTokens();
    clearAuth();
    router.push('/auth/login');
  };

  return (
    <aside style={{
      width: '240px', minHeight: '100vh', flexShrink: 0,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      padding: '20px 0', position: 'sticky', top: 0,
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Logo + mobile close */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '0 18px 20px',
        borderBottom: '1px solid var(--border)', marginBottom: '16px',
      }}>
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          textDecoration: 'none', flex: 1, minWidth: 0,
        }}>
          <div style={{
            width: '34px', height: '34px',
            borderRadius: '8px',
            background: '#FFFFFF',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', overflow: 'hidden',
            flexShrink: 0,
            boxShadow: '0 2px 6px rgba(0,0,0,.12)',
          }}>
            <Image
              src="/images/logo/logo.png"
              alt="Intrafer"
              width={28} height={28}
              style={{ objectFit: 'contain' }}
            />
          </div>
          <span style={{
            fontFamily: 'var(--font-ui)',
            fontWeight: 800, fontSize: '16px',
            color: 'var(--text)',
            letterSpacing: '-0.03em',
          }}>Intrafer</span>
        </Link>
        <NotificationBell />
        {onClose && (
          <button
            onClick={onClose}
            className="mobile-menu-btn"
            aria-label="Close sidebar"
            style={{ marginLeft: 'auto' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <line x1="3" y1="3" x2="15" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="15" y1="3" x2="3" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '0 10px' }}>
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon   = item.icon;
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: 'var(--r-md)',
                marginBottom: '3px', cursor: 'pointer',
                background: active ? 'var(--primary-bg)' : 'transparent',
                color:      active ? 'var(--primary)'    : 'var(--text-mid)',
                fontWeight: active ? 500 : 400,
                fontSize: '13px', letterSpacing: '.01em',
                transition: 'all 150ms ease-out',
                boxShadow: active ? 'inset 0 0 0 1px var(--primary-light)' : 'none',
              }}>
                <Icon size={17} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {active && <ChevronRight size={14} />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
        <button
          onClick={toggleTheme}
          style={{
            display: 'flex', alignItems: 'center',
            gap: '10px', width: '100%',
            padding: '10px 12px',
            borderRadius: 'var(--r-md)',
            border: '1px solid var(--border)',
            background: 'var(--bg-parchment)',
            cursor: 'pointer',
            color: 'var(--text-mid)',
            fontSize: '13px', fontWeight: 500,
            marginBottom: '8px',
            transition: 'background 150ms',
            textAlign: 'left',
          }}
        >
          <span style={{ fontSize: '16px', flexShrink: 0 }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </span>
          <span>{theme === 'dark' ? 'Switch to light' : 'Switch to dark'}</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: 'var(--primary-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 600, color: 'var(--primary)',
            border: '1.5px solid var(--primary-light)', flexShrink: 0,
          }}>
            {user?.name
              ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
              : (role?.[0] || 'U').toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: '13px', fontWeight: 500, color: 'var(--text)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{user?.name || 'Account'}</div>
            <div style={{
              fontSize: '10px', color: 'var(--primary)',
              letterSpacing: '.06em', textTransform: 'uppercase',
            }}>{ROLE_LABELS[role] || role}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          width: '100%', padding: '8px 10px', borderRadius: 'var(--r-sm)',
          background: 'transparent', border: 'none',
          color: 'var(--text-hint)', fontSize: '13px', cursor: 'pointer',
          transition: 'color 150ms',
        }}>
          <LogOut size={15} />
          Log out
        </button>
      </div>
    </aside>
  );
}
