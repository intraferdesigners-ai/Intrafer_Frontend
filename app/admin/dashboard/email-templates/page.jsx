'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../../lib/api';
import Button from '../../../../components/ui/Button';
import Spinner from '../../../../components/ui/Spinner';

const SECTION_LABEL = {
  fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
  color: 'var(--color-text-hint)', textTransform: 'uppercase',
  display: 'block', marginBottom: 12,
};

const FIELD_LABEL = {
  display: 'block', fontSize: 12, fontWeight: 500,
  color: 'var(--color-text-sub)', marginBottom: 6, letterSpacing: '0.01em',
};

const INPUT_STYLE = {
  width: '100%', padding: '10px 12px', fontSize: 13,
  border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
  background: 'var(--color-surface)', color: 'var(--color-text)',
  boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none',
};

const TEXTAREA_STYLE = {
  ...INPUT_STYLE,
  resize: 'vertical', minHeight: 260, fontFamily: 'var(--font-mono)',
};

export default function AdminEmailTemplatesPage() {
  const [templates,  setTemplates]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [draft,       setDraft]     = useState({ subject: '', htmlBody: '', isActive: true });
  const [saving,       setSaving]   = useState(false);

  const fetchTemplates = () => {
    setLoading(true);
    api.get('/admin/email-templates')
      .then(({ data }) => setTemplates(data.data?.templates || []))
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTemplates(); }, []);

  const toggleExpand = (template) => {
    if (expandedId === template._id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(template._id);
    setDraft({
      subject: template.subject,
      htmlBody: template.htmlBody,
      isActive: template.isActive,
    });
  };

  const handleSave = async (template) => {
    setSaving(true);
    try {
      const { data } = await api.put(`/admin/email-templates/${template._id}`, draft);
      const updated = data.data?.template;
      setTemplates((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      toast.success('Template updated.');
      setExpandedId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update template.');
    }
    setSaving(false);
  };

  const pillStyle = (active) => ({
    padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500,
    cursor: 'pointer', transition: 'all 150ms ease-out',
    ...(active
      ? { background: 'var(--color-primary-bg)', color: 'var(--color-primary)', border: '1.5px solid var(--color-accent)' }
      : { background: 'var(--color-surface-alt)', color: 'var(--color-text-sub)', border: '1px solid var(--color-border)' }
    ),
  });

  return (
    <div>
      {/* Heading */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, color: 'var(--color-text)', margin: 0 }}>
          Email templates
        </h1>
        {!loading && (
          <span style={{ fontSize: 13, color: 'var(--color-text-hint)', background: 'var(--color-surface-alt)', padding: '2px 10px', borderRadius: 20, fontWeight: 500 }}>
            {templates.length} total
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ padding: '48px 0' }}><Spinner size="md" /></div>
      ) : templates.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '56px 24px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', fontSize: 13, color: 'var(--color-text-hint)' }}>
          No email templates found. Run the seed script to populate them.
        </div>
      ) : (
        templates.map((template) => {
          const isExpanded = expandedId === template._id;
          return (
            <div
              key={template._id}
              style={{
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)', marginBottom: 8, overflow: 'hidden',
              }}
            >
              {/* Row header */}
              <div
                onClick={() => toggleExpand(template)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                  padding: '14px 16px',
                }}
              >
                <div style={{ flex: 2, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>
                    {template.name}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-hint)' }}>
                    {template.key}
                  </div>
                </div>

                <div style={{ flex: 2, minWidth: 0 }}>
                  <span style={{ fontSize: 13, color: 'var(--color-text-sub)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                    {template.subject}
                  </span>
                </div>

                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 5 }}>
                  {template.isActive
                    ? <CheckCircle size={12} color="var(--color-success)" />
                    : <XCircle size={12} color="var(--color-text-hint)" />
                  }
                  <span style={{
                    fontSize: 12, fontWeight: 500,
                    color: template.isActive ? 'var(--color-success)' : 'var(--color-text-hint)',
                  }}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div style={{ flexShrink: 0, color: 'var(--color-text-hint)' }}>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {/* Expanded editor */}
              {isExpanded && (
                <div style={{
                  padding: '4px 16px 20px', borderTop: '1px solid var(--color-border)',
                  display: 'flex', flexDirection: 'column', gap: 16, marginTop: 4,
                }}>
                  <div>
                    <span style={SECTION_LABEL}>Available variables</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {template.availableVariables?.length > 0 ? (
                        template.availableVariables.map((v) => (
                          <span key={v} style={{
                            fontFamily: 'var(--font-mono)', fontSize: 11,
                            padding: '3px 8px', borderRadius: 6,
                            background: 'var(--color-surface-alt)', color: 'var(--color-text-sub)',
                            border: '1px solid var(--color-border)',
                          }}>
                            {`{{${v}}}`}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--color-text-hint)' }}>None</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label style={FIELD_LABEL}>Subject</label>
                    <input
                      type="text"
                      value={draft.subject}
                      onChange={(e) => setDraft((p) => ({ ...p, subject: e.target.value }))}
                      style={INPUT_STYLE}
                    />
                  </div>

                  <div>
                    <label style={FIELD_LABEL}>HTML body</label>
                    <textarea
                      rows={14}
                      value={draft.htmlBody}
                      onChange={(e) => setDraft((p) => ({ ...p, htmlBody: e.target.value }))}
                      style={TEXTAREA_STYLE}
                    />
                  </div>

                  <div>
                    <span style={SECTION_LABEL}>Status</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        style={pillStyle(draft.isActive)}
                        onClick={() => setDraft((p) => ({ ...p, isActive: true }))}
                      >
                        Active
                      </button>
                      <button
                        type="button"
                        style={pillStyle(!draft.isActive)}
                        onClick={() => setDraft((p) => ({ ...p, isActive: false }))}
                      >
                        Inactive
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <Button variant="secondary" size="sm" onClick={() => setExpandedId(null)}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" loading={saving} onClick={() => handleSave(template)}>
                      Save changes
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
