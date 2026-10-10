'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, History, RotateCcw, X } from 'lucide-react';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { formatDate } from '@/lib/utils';
import { diffContent, CONTENT_KEY_LABELS } from '@/lib/landingDiff';
import { HINT } from './shared';

// Version history drawer (Phase 4B). Lists the page's versions; picking
// one fetches its snapshot and diffs it against the CURRENT SAVED content
// (not unsaved form edits). "Restore" hands the version to the editor,
// which loads it as unsaved changes — nothing is written here.

export const KIND_LABELS = {
  create: 'Created', save: 'Saved', publish: 'Published', unpublish: 'Unpublished',
  restore: 'Restored', duplicate: 'Duplicated', bulk_create: 'Bulk created',
};
const KIND_TONES = {
  publish: { background: 'var(--success-bg)', color: 'var(--success)' },
  unpublish: { background: 'var(--warning-bg)', color: 'var(--warning)' },
  restore: { background: 'var(--info-bg)', color: 'var(--info)' },
};
const CLAMP = 240;

export function formatWhen(iso) {
  const d = new Date(iso);
  const time = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${formatDate(iso)}, ${time}`;
}

function relative(iso) {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const days = Math.round(h / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function KindChip({ kind }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: 'var(--color-surface-alt)', color: 'var(--color-text-sub)', ...KIND_TONES[kind],
    }}>
      {KIND_LABELS[kind] || kind}
    </span>
  );
}

// Long text clamped, with "Show more".
function Clamped({ text }) {
  const [open, setOpen] = useState(false);
  if (!text) return <span style={{ color: 'var(--color-text-hint)', fontStyle: 'italic' }}>(empty)</span>;
  const long = text.length > CLAMP;
  return (
    <>
      <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{long && !open ? `${text.slice(0, CLAMP)}…` : text}</span>
      {long && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          style={{ display: 'block', marginTop: 4, padding: 0, minHeight: 0, background: 'none', border: 'none', color: 'var(--color-accent)', fontSize: 12, cursor: 'pointer' }}
        >
          {open ? 'Show less' : 'Show more'}
        </button>
      )}
    </>
  );
}

const BLOCK = {
  fontSize: 12, lineHeight: 1.55, padding: '8px 10px', borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)', color: 'var(--color-text)',
};

function Change({ change }) {
  const showBlocks = change.kind === 'text';
  return (
    <li style={{ padding: '12px 0', borderTop: '1px solid var(--color-border)' }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', marginBottom: showBlocks ? 8 : 0 }}>{change.summary}</div>
      {showBlocks && (
        <div style={{ display: 'grid', gap: 6 }}>
          <div style={{ ...BLOCK, background: 'var(--color-surface-alt)' }}>
            <div style={{ ...HINT, marginTop: 0, marginBottom: 2 }}>Now</div>
            <Clamped text={change.before} />
          </div>
          <div style={{ ...BLOCK, background: 'var(--color-primary-bg)' }}>
            <div style={{ ...HINT, marginTop: 0, marginBottom: 2 }}>This version</div>
            <Clamped text={change.after} />
          </div>
        </div>
      )}
    </li>
  );
}

// `versions`: list from the editor (null while loading); `savedContent`:
// the page as last saved; onRestore(version) gets { id, createdAt, snapshot }.
export default function HistoryPanel({ open, onClose, pageId, versions, loadError, onRetry, savedContent, onRestore }) {
  const [selected, setSelected] = useState(null); // summary row
  const [detail, setDetail] = useState(null);     // { version, error }

  useEffect(() => {
    if (!open) { setSelected(null); setDetail(null); }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const pick = (v) => {
    setSelected(v);
    setDetail(null);
    api.get(`/admin/landing-pages/${pageId}/versions/${v.id}`)
      .then(({ data }) => setDetail({ version: data.data.version }))
      .catch((err) => setDetail({ error: err.response?.data?.message || 'Could not load this version.' }));
  };

  if (!open) return null;
  const changes = detail?.version ? diffContent(savedContent, detail.version.snapshot) : null;

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}
    >
      <aside
        role="dialog"
        aria-label="Version history"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(520px, 100vw)', height: '100%', overflowY: 'auto', background: 'var(--color-surface)',
          borderLeft: '1px solid var(--color-border)', padding: 24, boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          {selected ? (
            <button type="button" onClick={() => { setSelected(null); setDetail(null); }} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: 0, minHeight: 0, background: 'none', border: 'none', color: 'var(--color-text-hint)', fontSize: 13, cursor: 'pointer' }}>
              <ChevronLeft size={14} /> All versions
            </button>
          ) : (
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0, fontSize: 16, fontWeight: 500, color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
              <History size={16} /> Version history
            </h2>
          )}
          <button type="button" aria-label="Close" onClick={onClose} style={{ marginLeft: 'auto', padding: 4, minHeight: 0, background: 'none', border: 'none', color: 'var(--color-text-hint)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {!selected && (
          loadError ? (
            <div style={{ fontSize: 13, color: 'var(--danger)' }}>
              {loadError} <Button variant="secondary" size="sm" onClick={onRetry} style={{ marginLeft: 8 }}>Retry</Button>
            </div>
          ) : versions === null ? (
            <div style={{ padding: '32px 0' }}><Spinner size="md" /></div>
          ) : versions.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--color-text-hint)' }}>No versions yet — one is recorded each time the page is saved.</p>
          ) : (
            <>
              <p style={{ ...HINT, marginTop: 0, marginBottom: 12 }}>The latest 10 versions. Pick one to compare it with the saved page.</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {versions.map((v) => (
                  <li key={v.id}>
                    <button
                      type="button"
                      onClick={() => pick(v)}
                      style={{
                        width: '100%', textAlign: 'left', cursor: 'pointer', padding: '10px 12px', minHeight: 0,
                        background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                        color: 'var(--color-text)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <KindChip kind={v.kind} />
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{relative(v.createdAt)}</span>
                        <span style={{ fontSize: 12, color: 'var(--color-text-hint)' }}>{formatWhen(v.createdAt)}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-sub)', marginTop: 4 }}>
                        {v.savedBy?.name ? `by ${v.savedBy.name}` : 'by an unknown admin'}
                        {v.changedFields.length > 0 && ` · ${v.changedFields.map((k) => CONTENT_KEY_LABELS[k] || k).join(', ')}`}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )
        )}

        {selected && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
              <KindChip kind={selected.kind} />
              <span style={{ fontSize: 13, color: 'var(--color-text)' }}>{formatWhen(selected.createdAt)}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-sub)', marginBottom: 16 }}>
              {selected.savedBy?.name ? `by ${selected.savedBy.name}` : 'by an unknown admin'}
            </div>

            {!detail ? (
              <div style={{ padding: '32px 0' }}><Spinner size="md" /></div>
            ) : detail.error ? (
              <p style={{ fontSize: 13, color: 'var(--danger)' }}>{detail.error}</p>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Button variant="primary" size="sm" disabled={changes.length === 0} onClick={() => onRestore(detail.version)}>
                    <RotateCcw size={13} /> Restore this version
                  </Button>
                  <span style={{ ...HINT, marginTop: 0 }}>
                    {changes.length === 0 ? 'Same as the saved page — nothing to restore.' : 'Loads it into the editor as unsaved changes.'}
                  </span>
                </div>
                {changes.length > 0 && (
                  <>
                    <p style={{ ...HINT, marginBottom: 0 }}>
                      {changes.length} difference{changes.length === 1 ? '' : 's'} from the saved page. Location and status are never restored.
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0' }}>
                      {changes.map((c) => <Change key={c.key} change={c} />)}
                    </ul>
                  </>
                )}
              </>
            )}
          </>
        )}
      </aside>
    </div>
  );
}
