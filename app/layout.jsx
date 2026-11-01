import './globals.css';
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import ThemeProvider from '../context/ThemeContext';
import CompareProvider from '../context/CompareContext';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import LeadCapturePopup from '../components/ui/LeadCapturePopupLazy';
import HydrationMarker from '../components/ui/HydrationMarker';
import { SITE_URL } from '../lib/siteUrl';
import { GOOGLE_SITE_VERIFICATION } from '../lib/siteConfig';
import { organizationJsonLd, websiteJsonLd } from '../lib/structuredData';
import JsonLd from '../components/seo/JsonLd';

// Self-hosted via next/font — no render-blocking request to
// fonts.googleapis.com, no FOUC. Weights match what the old @import loaded.
// Cormorant Garamond needs one loader call (not two) so italic text keeps
// switching automatically via font-style, without every downstream
// font-family reference needing to change.
//
// Not preloaded: only Inter — the font of every text LCP element on the
// audited pages — is. Measured 2026-11-01 (Lighthouse mobile, median of 3):
// without this preload LCP was lower on all 8 audited pages; first paint
// was ~0.15–0.6 s later where the hero heading is set in Cormorant (it
// waits briefly for the font, then swaps; next/font's size-adjusted
// fallback keeps that shift-free). Its italic file is now fetched only on
// pages that set italic text instead of everywhere.
const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant-garamond',
  display: 'swap',
  preload: false,
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

// Not preloaded: monospace is never first-screen text, and every preload
// competes with the page's LCP image for early bandwidth.
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  preload: false,
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:  'Intrafer — Find. Compare. Design.',
    template: '%s | Intrafer',
  },
  description: "India's interior designer marketplace. Find verified designers, compare portfolios, and transform your space.",
  icons: { icon: '/images/logo/logo.png' },
  // Search Console ownership; every page inherits it (none sets its own).
  verification: { google: GOOGLE_SITE_VERIFICATION },
};

// Sitewide Organization + WebSite entities, defined once here with their
// @ids (lib/structuredData.js); page-level blocks reference them by @id.
// Contact details and social profiles come from lib/siteConfig.js — the
// same module the footer and the contact page render.
const ORGANIZATION_JSON_LD = organizationJsonLd();
const WEBSITE_JSON_LD = websiteJsonLd();

export const viewport = {
  themeColor: '#0F172A',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${cormorantGaramond.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <JsonLd data={ORGANIZATION_JSON_LD} />
        <JsonLd data={WEBSITE_JSON_LD} />
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var t = localStorage.getItem('intrafer-theme') || 'light';
              if (t === 'dark') document.documentElement.classList.add('dark');
            } catch(e) {}
          })();
        `}} />
      </head>
      <body>
        <ThemeProvider>
          <CompareProvider>
            <ErrorBoundary>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background:   'var(--surface)',
                    color:        'var(--text)',
                    border:       '1px solid var(--border)',
                    fontFamily:   'Inter, sans-serif',
                    fontSize:     '13px',
                    boxShadow:    'var(--shadow-md)',
                    borderRadius: 'var(--r-md)',
                  },
                }}
              />
              {children}
              <LeadCapturePopup />
              <HydrationMarker />
            </ErrorBoundary>
          </CompareProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
