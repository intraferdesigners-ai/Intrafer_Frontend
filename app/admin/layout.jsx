'use client';

import DashboardLayout from '../../components/layout/DashboardLayout';
import MobileTabBar from '../../components/layout/MobileTabBar';

export default function AdminLayout({ children }) {
  return (
    <>
      <DashboardLayout>{children}</DashboardLayout>
      <MobileTabBar role="admin" />
    </>
  );
}
