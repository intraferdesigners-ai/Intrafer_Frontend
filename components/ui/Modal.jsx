'use client';

const WIDTHS = { sm: '400px', md: '540px', lg: '680px' };

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-container"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="modal-box"
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          position: 'relative',
          width: `min(${WIDTHS[size] || WIDTHS.md}, calc(100vw - 32px))`,
          maxWidth: '100%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 500, color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-hint)', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 150ms ease-out' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-hint)'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />

        <div style={{ paddingTop: '16px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
