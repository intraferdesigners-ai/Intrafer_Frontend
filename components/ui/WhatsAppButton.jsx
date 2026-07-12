'use client';

export default function WhatsAppButton() {
  return (
    <>
      <style>{`
        @keyframes whatsapp-pulse {
          0%   { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .wa-pulse {
          animation: whatsapp-pulse 2s infinite;
        }
        .wa-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 8px 24px rgba(37,211,102,.5) !important;
        }
      `}</style>
      <div style={{
        position: 'fixed',
        bottom: 'max(80px, calc(env(safe-area-inset-bottom) + 80px))',
        right: '16px',
        zIndex: 60,
      }}>
        <div
          className="wa-pulse"
          style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            background: '#25D366',
            pointerEvents: 'none',
          }}
        />
        <a
          href="https://wa.me/919876500000"
          target="_blank"
          rel="noopener noreferrer"
          className="wa-btn"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '56px', height: '56px',
            background: '#25D366',
            borderRadius: '50%',
            boxShadow: '0 4px 16px rgba(37,211,102,.4)',
            transition: 'transform 200ms ease, box-shadow 200ms ease',
            position: 'relative',
          }}
          aria-label="Chat on WhatsApp"
        >
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <path
              d="M16 2C8.268 2 2 8.268 2 16c0 2.444.63 4.74 1.73 6.74L2 30l7.46-1.7A13.93 13.93 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2z"
              fill="white"
            />
            <path
              d="M22.5 19.5c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.41-1.49-.89-.79-1.49-1.77-1.67-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51-.17 0-.37-.02-.57-.02-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.09 4.49.71.31 1.27.49 1.7.63.71.23 1.36.19 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z"
              fill="#25D366"
            />
          </svg>
        </a>
      </div>
    </>
  );
}
