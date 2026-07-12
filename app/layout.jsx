import './globals.css';
import { Toaster } from 'react-hot-toast';
import ThemeProvider from '../context/ThemeContext';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import LeadCapturePopup from '../components/ui/LeadCapturePopup';

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
    <html lang="en" suppressHydrationWarning>
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
