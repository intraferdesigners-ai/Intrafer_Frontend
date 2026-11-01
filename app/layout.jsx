import './globals.css';
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import ThemeProvider from '../context/ThemeContext';
import CompareProvider from '../context/CompareContext';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import LeadCapturePopup from '../components/ui/LeadCapturePopup';
import { SITE_URL } from '../lib/siteUrl';
import { organizationJsonLd, websiteJsonLd } from '../lib/structuredData';
import JsonLd from '../components/seo/JsonLd';

// Self-hosted via next/font — no render-blocking request to
// fonts.googleapis.com, no FOUC. Weights match what the old @import loaded.
// Cormorant Garamond needs one loader call (not two) so italic text keeps
// switching automatically via font-style, without every downstream
// font-family reference needing to change.
const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant-garamond',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:  'Intrafer — Find. Compare. Design.',
    template: '%s | Intrafer',
  },
  description: "India's interior designer marketplace. Find verified designers, compare portfolios, and transform your space.",
  icons: { icon: '/images/logo/logo.png' },
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
            </ErrorBoundary>
          </CompareProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
