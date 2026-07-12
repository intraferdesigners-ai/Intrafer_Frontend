const _clsxMod = require('clsx');
const _clsx = _clsxMod.default || _clsxMod;

function cn(...inputs) {
  return _clsx(...inputs);
}

function formatINR(amountInPaisa) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amountInPaisa / 100);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatRelativeTime(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffHours < 48) return 'yesterday';
  return formatDate(dateString);
}

function getInitials(name) {
  if (!name || !name.trim()) return '?';
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const LEAD_STATUS = {
  new:            { label: 'New',            bg: 'var(--color-primary-bg)',  color: 'var(--color-primary)'  },
  accepted:       { label: 'Accepted',       bg: 'var(--color-info-bg)',     color: 'var(--color-info)'     },
  contacted:      { label: 'Contacted',      bg: '#EDE9FE',                  color: '#5B21B6'               },
  quotation_sent: { label: 'Quotation sent', bg: 'var(--color-warning-bg)',  color: 'var(--color-warning)'  },
  won:            { label: 'Won',            bg: 'var(--color-success-bg)',  color: 'var(--color-success)'  },
  lost:           { label: 'Lost',           bg: 'var(--color-danger-bg)',   color: 'var(--color-danger)'   },
  cancelled:      { label: 'Cancelled',      bg: 'var(--color-surface-alt)', color: 'var(--color-text-hint)' },
};

function getPriceRange(specializations = []) {
  if (!specializations || specializations.length === 0) return null;
  const specs = specializations.map(s => s.toLowerCase());
  if (specs.some(s => ['luxury', 'premium', 'villa'].includes(s))) return '₹₹₹';
  if (specs.some(s => ['residential', 'full home interior', 'modular kitchen'].includes(s))) return '₹₹';
  return '₹';
}

module.exports = { cn, formatINR, formatDate, formatRelativeTime, getInitials, LEAD_STATUS, getPriceRange };
