import VendorNavbar from '../../components/layout/VendorNavbar';
import VendorFooter from '../../components/layout/VendorFooter';
import PageTransition from '../../components/ui/PageTransition';

export default function VendorSiteLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <VendorNavbar />
      <main style={{ flex: 1 }}>
        <PageTransition>{children}</PageTransition>
      </main>
      <VendorFooter />
    </div>
  );
}
