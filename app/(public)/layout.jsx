import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import WhatsAppButton from '../../components/ui/WhatsAppButton';
import OfferBanner from '../../components/ui/OfferBanner';
import StickyMobileCTA from '../../components/ui/StickyMobileCTA';

export default function PublicLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <OfferBanner />
      <Navbar />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
      <StickyMobileCTA />
    </div>
  );
}
