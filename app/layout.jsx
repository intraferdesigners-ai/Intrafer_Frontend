import './globals.css';
import { Toaster } from 'react-hot-toast';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import ThemeProvider from '../context/ThemeContext';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import LeadCapturePopup from '../components/ui/LeadCapturePopup';

// V2 fonts — variable names are namespaced (v2-*) so they don't collide with
// the V1 --font-display/--font-ui custom properties already set in globals.css.
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--v2-font-display-raw',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--v2-font-ui-raw',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

export const metadata = {
  title: {
    default:  'Intrafer — Find. Compare. Design.',
    template: '%s | Intrafer',
  },
  description: "India's interior designer marketplace. Find verified designers, compare portfolios, and transform your space.",
  icons: { icon: '/images/logo/logo.png' },
};

export const viewport = {
  themeColor: '#0F172A',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${playfair.variable} ${jakarta.variable}`}>
      <head>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
