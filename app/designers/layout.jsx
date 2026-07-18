import DesignerNavbar from '@/components/v2/designers/layout/Navbar';
import DesignerFooter from '@/components/v2/designers/layout/Footer';

export default function DesignersLayout({ children }) {
  return (
    <div style={{ background: '#020617', minHeight: '100vh' }}>
      <DesignerNavbar />
      <main>{children}</main>
      <DesignerFooter />
    </div>
  );
}
