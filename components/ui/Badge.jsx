import { LEAD_STATUS } from '../../lib/utils';

const VARIANT_STYLES = {
  success: { background: 'var(--success-bg)',    color: 'var(--success)'  },
  danger:  { background: 'var(--danger-bg)',     color: 'var(--danger)'   },
  warning: { background: 'var(--warning-bg)',    color: 'var(--warning)'  },
  info:    { background: 'var(--info-bg)',        color: 'var(--info)'     },
  primary: { background: 'var(--primary-bg)',    color: 'var(--primary)'  },
  gold:    { background: 'var(--primary-bg)',    color: 'var(--primary)'  },
  neutral: { background: 'var(--bg-parchment)',  color: 'var(--text-mid)' },
};

export default function Badge({ status, variant, children, className }) {
  let style = {};

  if (status && LEAD_STATUS[status]) {
    const cfg = LEAD_STATUS[status];
    style = { background: cfg.bg, color: cfg.color };
  } else if (variant && VARIANT_STYLES[variant]) {
    style = VARIANT_STYLES[variant];
  } else {
    style = VARIANT_STYLES.neutral;
  }

  return (
    <span style={{
      ...style,
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: 500,
      letterSpacing: '.02em',
      whiteSpace: 'nowrap',
    }}>
      {status ? LEAD_STATUS[status]?.label : children}
    </span>
  );
}
