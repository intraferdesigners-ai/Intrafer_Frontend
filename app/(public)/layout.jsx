import { Suspense } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import WhatsAppButton from '../../components/ui/WhatsAppButton';
import StickyMobileCTA from '../../components/ui/StickyMobileCTA';
import PageTransition from '../../components/ui/PageTransition';
import RouteProgressBar from '../../components/ui/RouteProgressBar';

export default function PublicLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Suspense fallback={null}>
        <RouteProgressBar />
      </Suspense>
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
