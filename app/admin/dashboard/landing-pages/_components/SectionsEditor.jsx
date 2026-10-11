'use client';

import { ArrowUp, ArrowDown, Trash2, Plus, FileText, HelpCircle, MapPin } from 'lucide-react';
import Button from '@/components/ui/Button';
import { TextField, TextArea } from './Fields';
import TagInput from './TagInput';
import { CARD, SECTION_LABEL, HINT, FIELD_ERROR, ICON_BUTTON, LIMITS } from './shared';

const TYPES = {
  text:       { label: 'Text',       icon: FileText },
  faq:        { label: 'FAQ',        icon: HelpCircle },
  localities: { label: 'Localities', icon: MapPin },
};

// Client-only key so React can track cards across reorders; stripped
// before saving (see toPayload in the editor page).
const newKey = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Math.random()));

export function newSection(type) {
  return { _key: newKey(), type, title: '', body: '', faqItems: type === 'faq' ? [{ question: '', answer: '' }] : [], localities: [], enabled: true };
}

export function withKeys(sections = []) {
  return sections.map((s) => ({ ...s, _key: s._id || newKey() }));
}

// Add / reorder / toggle / remove the page's sections. `errors` is the
// server's per-field map ('sections.2.faqItems.0.answer', ...).
// `localitiesTitle`: the live page's heading for an untitled localities
// section (it differs per page type).
export default function SectionsEditor({ sections, onChange, errors, localitiesTitle = 'Localities in {{city}}' }) {
  const atLimit = sections.length >= LIMITS.sections;

  const update = (i, patch) => onChange(sections.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= sections.length) return;
    const next = [...sections];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const remove = (i) => onChange(sections.filter((_, j) => j !== i));
  const add = (type) => { if (!atLimit) onChange([...sections, newSection(type)]); };

  return (
    <section style={CARD}>
      <span style={SECTION_LABEL}>Sections</span>
      <p style={{ ...HINT, margin: '-6px 0 14px' }}>
        Shown below the vendor list, in this order. Disabled sections are kept but not shown.
      </p>
      {errors.sections && <p style={{ ...FIELD_ERROR, marginBottom: 10 }}>{errors.sections}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sections.map((section, i) => {
          const Icon = TYPES[section.type]?.icon || FileText;
          const err = (path) => errors[`sections.${i}.${path}`];
          return (
            <div
              key={section._key}
              data-testid="section-card"
              style={{
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 16,
                background: 'var(--color-surface-alt)', opacity: section.enabled ? 1 : 0.65,
              }}
            >
              {/* Card header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <Icon size={14} color="var(--color-text-hint)" />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-sub)' }}>
                  {i + 1}. {TYPES[section.type]?.label || section.type}
                </span>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-text-sub)', marginLeft: 'auto', cursor: 'pointer' }}>
                  <input type="checkbox" checked={section.enabled} onChange={(e) => update(i, { enabled: e.target.checked })} />
                  Enabled
                </label>
                <button type="button" style={ICON_BUTTON} disabled={i === 0} onClick={() => move(i, -1)} title="Move up" aria-label="Move up">
                  <ArrowUp size={13} color={i === 0 ? 'var(--color-border)' : 'var(--color-text-sub)'} />
                </button>
                <button type="button" style={ICON_BUTTON} disabled={i === sections.length - 1} onClick={() => move(i, 1)} title="Move down" aria-label="Move down">
                  <ArrowDown size={13} color={i === sections.length - 1 ? 'var(--color-border)' : 'var(--color-text-sub)'} />
                </button>
                <button
                  type="button"
                  style={{ ...ICON_BUTTON, background: 'var(--color-danger-bg)', border: '1px solid transparent' }}
                  onClick={() => remove(i)}
                  title="Remove section"
                  aria-label="Remove section"
                >
                  <Trash2 size={13} color="var(--color-danger)" />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <TextField
                  label="Title"
                  value={section.title}
                  onChange={(v) => update(i, { title: v })}
                  max={LIMITS.sectionTitle}
                  counter
                  error={err('title')}
                  placeholder={section.type === 'faq' ? 'Frequently asked questions' : section.type === 'localities' ? localitiesTitle : ''}
                />

                {section.type === 'text' && (
                  <TextArea
                    label="Body (Markdown)"
                    value={section.body}
                    onChange={(v) => update(i, { body: v })}
                    max={LIMITS.sectionBody}
                    counter
                    rows={6}
                    error={err('body')}
                  />
                )}

                {section.type === 'faq' && (
                  <FaqItems
                    items={section.faqItems}
                    onChange={(faqItems) => update(i, { faqItems })}
                    err={err}
                  />
                )}

                {section.type === 'localities' && (
                  <div>
                    <TagInput
                      value={section.localities}
                      onChange={(localities) => update(i, { localities })}
                      max={LIMITS.localities}
                      maxLength={LIMITS.locality}
                      placeholder="Type a locality, press Enter"
                      ariaLabel="Add locality"
                    />
                    {err('localities') && <p style={FIELD_ERROR}>{err('localities')}</p>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: sections.length ? 14 : 0, alignItems: 'center' }}>
        {Object.entries(TYPES).map(([type, { label }]) => (
          <Button key={type} type="button" variant="secondary" size="sm" disabled={atLimit} onClick={() => add(type)}>
            <Plus size={13} /> {label}
          </Button>
        ))}
        <span style={{ fontSize: 11, color: 'var(--color-text-hint)' }}>
          {atLimit ? `Limit of ${LIMITS.sections} sections reached` : `${sections.length} / ${LIMITS.sections}`}
        </span>
      </div>
    </section>
  );
}

function FaqItems({ items, onChange, err }) {
  const update = (j, patch) => onChange(items.map((it, k) => (k === j ? { ...it, ...patch } : it)));
  const atLimit = items.length >= LIMITS.faqItems;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((item, j) => (
        <div key={j} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', paddingTop: j ? 10 : 0, borderTop: j ? '1px dashed var(--color-border)' : 'none' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
            <TextField
              label={`Question ${j + 1}`}
              value={item.question}
              onChange={(v) => update(j, { question: v })}
              max={LIMITS.question}
              error={err(`faqItems.${j}.question`)}
            />
            <TextArea
              label="Answer"
              value={item.answer}
              onChange={(v) => update(j, { answer: v })}
              max={LIMITS.answer}
              rows={3}
              error={err(`faqItems.${j}.answer`)}
              hint="Plain text"
            />
          </div>
          <button
            type="button"
            style={{ ...ICON_BUTTON, marginTop: 20 }}
            onClick={() => onChange(items.filter((_, k) => k !== j))}
            title="Remove question"
            aria-label={`Remove question ${j + 1}`}
          >
            <Trash2 size={13} color="var(--color-text-sub)" />
          </button>
        </div>
      ))}
      <div>
        <Button type="button" variant="ghost" size="sm" disabled={atLimit} onClick={() => onChange([...items, { question: '', answer: '' }])}>
          <Plus size={13} /> Add question
        </Button>
      </div>
    </div>
  );
}
