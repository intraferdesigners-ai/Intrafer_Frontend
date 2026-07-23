import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import WhatsAppButton from '../../components/ui/WhatsAppButton';
import OfferBanner from '../../components/ui/OfferBanner';
import StickyMobileCTA from '../../components/ui/StickyMobileCTA';
import PageTransition from '../../components/ui/PageTransition';

export default function PublicLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <OfferBanner />
      <Navbar />
      <main style={{ flex: 1 }}>
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <WhatsAppButton />
      <StickyMobileCTA />
    </div>
  );
}
