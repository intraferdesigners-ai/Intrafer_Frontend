import V2Navbar from '@/components/v2/layout/Navbar';
import V2Footer from '@/components/v2/layout/Footer';
import V2WhatsAppButton from '@/components/v2/ui/WhatsAppButton';
import V2StickyMobileCTA from '@/components/v2/ui/StickyMobileCTA';
import V2OfferBanner from '@/components/v2/ui/OfferBanner';

// LeadCapturePopup is already mounted once, globally, in the root app/layout.jsx
// (it self-excludes on /auth, /enquiry, and dashboard paths via EXCLUDED_PATHS).
// Do not re-mount it here — nesting under root layout would double-fire its
// timers/exit-intent listener and double-POST to /visitor/capture.

export default function PublicLayout({ children }) {
  return (
    <>
      <V2OfferBanner />
      <V2Navbar />
      <main>{children}</main>
      <V2Footer />
      <V2WhatsAppButton />
      <V2StickyMobileCTA />
    </>
  );
}
