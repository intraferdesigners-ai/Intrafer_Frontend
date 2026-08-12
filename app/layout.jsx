import './globals.css';
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import ThemeProvider from '../context/ThemeContext';
import CompareProvider from '../context/CompareContext';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import LeadCapturePopup from '../components/ui/LeadCapturePopup';

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
  metadataBase: new URL('https://intrafer.in'),
  title: {
    default:  'Intrafer — Find. Compare. Design.',
    template: '%s | Intrafer',
  },
  description: "India's interior designer marketplace. Find verified designers, compare portfolios, and transform your space.",
  icons: { icon: '/images/logo/logo.png' },
};

// Sitewide Organization + WebSite entity data — tells Google the brand's
// canonical entity page is the homepage, independent of which page is
// currently being crawled. Values sourced from what's actually live
// elsewhere in the app (Footer.jsx social links) rather than invented.
const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Intrafer',
  url: 'https://intrafer.in',
  logo: 'https://intrafer.in/images/logo/logo.png',
  sameAs: [
    'https://instagram.com/intrafer',
    'https://linkedin.com/company/intrafer',
  ],
};

const WEBSITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Intrafer',
  url: 'https://intrafer.in',
};

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSON_LD) }}
        />
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
