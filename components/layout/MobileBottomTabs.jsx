'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useAuthStore from '../../store/authStore';

const USER_TABS = [
  { href: '/user/dashboard',           icon: '🏠', label: 'Home'      },
  { href: '/user/dashboard/enquiries', icon: '📋', label: 'Enquiries' },
  { href: '/user/dashboard/profile',   icon: '👤', label: 'Profile'   },
];

const VENDOR_TABS = [
  { href: '/vendor/dashboard',                icon: '🏠', label: 'Home'      },
  { href: '/vendor/dashboard/leads',          icon: '📋', label: 'Leads'     },
  { href: '/vendor/dashboard/projects',       icon: '🖼',  label: 'Portfolio' },
  { href: '/vendor/dashboard/subscription',   icon: '💳', label: 'Plans'     },
  { href: '/vendor/dashboard/profile',        icon: '👤', label: 'Profile'   },
];

const ADMIN_TABS = [
  { href: '/admin/dashboard',           icon: '🏠', label: 'Home'      },
  { href: '/admin/dashboard/vendors',   icon: '🏢', label: 'Vendors'   },
  { href: '/admin/dashboard/leads',     icon: '📋', label: 'Leads'     },
  { href: '/admin/dashboard/users',     icon: '👥', label: 'Users'     },
  { href: '/admin/dashboard/analytics', icon: '📊', label: 'Analytics' },
];

export default function MobileBottomTabs() {
  const { role } = useAuthStore();
  const pathname = usePathname();

  const tabs =
    role === 'vendor' ? VENDOR_TABS :
    role === 'admin'  ? ADMIN_TABS  :
    USER_TABS;

  return (
    <nav className="bottom-tab-bar" role="navigation" aria-label="Mobile navigation">
      {tabs.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(tab.href + '/');
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`bottom-tab-item${active ? ' active' : ''}`}
          >
            <span className="bottom-tab-icon" role="img" aria-label={tab.label}>
              {tab.icon}
            </span>
            <span className="bottom-tab-label">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
