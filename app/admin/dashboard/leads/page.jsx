'use client';

import { useEffect, useState } from 'react';
import { MapPin, Banknote, Phone, Mail, Download, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../../lib/api';
import Badge from '../../../../components/ui/Badge';
import Button from '../../../../components/ui/Button';
import Spinner from '../../../../components/ui/Spinner';
import { formatDate } from '../../../../lib/utils';
import { downloadCSV } from '../../../../lib/csv';

const FILTER_TABS = [
  { key: 'all',            label: 'All'            },
  { key: 'new',            label: 'New'            },
  { key: 'accepted',       label: 'Accepted'       },
  { key: 'contacted',      label: 'Contacted'      },
  { key: 'quotation_sent', label: 'Quotation sent' },
  { key: 'won',            label: 'Won'            },
  { key: 'lost',           label: 'Lost'           },
];

const HEADER_CELL = {
  fontSize: 11, fontWeight: 600, color: 'var(--color-text-hint)',
  letterSpacing: '0.06em', textTransform: 'uppercase',
};

const CAPS_LABEL = {
  fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: 'var(--color-text-hint)',
  display: 'block', marginBottom: 10,
};

export default function AdminLeadsPage() {
  const [leads,            setLeads]            = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [filter,           setFilter]           = useState('all');
  const [page,             setPage]             = useState(1);
  const [totalPages,       setTotalPages]       = useState(1);

  // Reassign modal state
  const [showReassign,     setShowReassign]     = useState(false);
  const [reassigningLead,  setReassigningLead]  = useState(null);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [availableVendors, setAvailableVendors] = useState([]);
  const [vendorsLoading,   setVendorsLoading]   = useState(false);
  const [reassigning,      setReassigning]      = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '15', page: String(page) });
    if (filter !== 'all') params.set('status', filter);
    api.get(`/admin/leads?${params}`)
      .then(({ data }) => {
        const d = data.data;
        setLeads(d.leads || []);
        setTotalPages(d.totalPages || 1);
      })
      .catch(() => setLeads([]))
      .finally(() => setLoading(false));
  }, [filter, page]);

  const handleFilterChange = (key) => {
    setFilter(key);
    setPage(1);
  };

  const handleExportCSV = () => {
    const csvData = leads.map((l) => ({
      'ENQ ID': l.enquiryId || l._id,
      'Project Type': l.projectType,
      'City': l.city,
      'Budget': l.budget,
      'Client Name': l.userId?.name || '',
      'Client Phone': l.userId?.phone || '',
      'Client Email': l.userId?.email || '',
      'Designer': l.vendorId?.businessName || '',
      'Status': l.status,
      'Date': new Date(l.createdAt).toLocaleDateString('en-IN'),
      'Requirements': (l.requirements || '').substring(0, 100),
    }));
    downloadCSV(csvData, `intrafer-leads-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const openReassignModal = async (lead) => {
    setReassigningLead(lead);
    setSelectedVendorId('');
    setShowReassign(true);
    setVendorsLoading(true);
    try {
      const { data } = await api.get('/admin/vendors?approved=true&limit=100');
      setAvailableVendors(data.data?.vendors || []);
    } catch {
      toast.error('Failed to load vendors.');
    }
    setVendorsLoading(false);
  };

  const closeReassignModal = () => {
    setShowReassign(false);
    setReassigningLead(null);
    setSelectedVendorId('');
  };

  const handleReassign = async () => {
    if (!selectedVendorId) { toast.error('Select a designer first.'); return; }
    setReassigning(true);
    try {
      await api.put(`/admin/leads/${reassigningLead._id}/reassign`, { newVendorId: selectedVendorId });
      toast.success('Lead reassigned.');
      setLeads((prev) => prev.map((l) =>
        l._id === reassigningLead._id
          ? { ...l, vendorId: availableVendors.find((v) => v._id === selectedVendorId) || l.vendorId }
          : l
      ));
      closeReassignModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reassignment failed.');
    }
    setReassigning(false);
  };

  const tabStyle = (key) => key === filter
    ? { background: 'var(--color-primary-bg)', color: 'var(--color-primary)', border: '1px solid var(--color-accent)', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }
    : { background: 'var(--color-surface)', color: 'var(--color-text-sub)', border: '1px solid var(--color-border)', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, color: 'var(--color-text)', margin: '0 0 6px' }}>
            All leads
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-hint)', margin: 0 }}>
            Complete visibility across all enquiries and assignments.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Download size={14} /> Export CSV
        </Button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, overflowX: 'auto', paddingBottom: 4, flexWrap: 'wrap' }}>
        {FILTER_TABS.map(({ key, label }) => (
          <button key={key} type="button" style={tabStyle(key)} onClick={() => handleFilterChange(key)}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '48px 0' }}><Spinner size="md" /></div>
      ) : leads.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', fontSize: 13, color: 'var(--color-text-hint)' }}>
          No leads found.
        </div>
      ) : (
        <>
          {/* Header row */}
          <div className="admin-table-header" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)', padding: '10px 16px', marginBottom: 8,
          }}>
            <div style={{ ...HEADER_CELL, flex: 2   }}>Enquiry</div>
            <div style={{ ...HEADER_CELL, flex: 1.5 }}>Client</div>
            <div style={{ ...HEADER_CELL, flex: 1.5 }}>Designer</div>
            <div style={{ ...HEADER_CELL, flex: 1   }}>Status</div>
            <div style={{ ...HEADER_CELL, flex: 1   }}>Date</div>
            <div style={{ ...HEADER_CELL, flex: 0.8, textAlign: 'right' }}>Action</div>
          </div>

          {leads.map((lead) => (
            <div
              key={lead._id}
              className="admin-table-row"
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 8,
              }}
            >
              {/* Enquiry */}
              <div style={{ flex: 2, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-hint)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 3 }}>
                  {lead.enquiryId || `ENQ-${lead._id?.slice(-8).toUpperCase()}`}
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', marginBottom: 3 }}>
                  {lead.projectType}
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {lead.city && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: 'var(--color-text-sub)' }}>
                      <MapPin size={11} />{lead.city}
                    </span>
                  )}
                  {lead.budget && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: 'var(--color-text-sub)' }}>
                      <Banknote size={11} />{lead.budget}
                    </span>
                  )}
                </div>
                {lead.requirements && (
                  <div style={{ fontSize: 12, color: 'var(--color-text-hint)', marginTop: 4 }}>
                    {lead.requirements.length > 60 ? lead.requirements.slice(0, 60) + '…' : lead.requirements}
                  </div>
                )}
              </div>

              {/* Client */}
              <div style={{ flex: 1.5, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', marginBottom: 3 }}>
                  {lead.userId?.name || '—'}
                </div>
                {lead.userId?.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-hint)', marginBottom: 2 }}>
                    <Phone size={11} />{lead.userId.phone}
                  </div>
                )}
                {lead.userId?.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-hint)' }}>
                    <Mail size={11} />{lead.userId.email}
                  </div>
                )}
              </div>

              {/* Designer */}
              <div style={{ flex: 1.5, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', marginBottom: 2 }}>
                  {lead.vendorId?.businessName || '—'}
                </div>
                {lead.vendorId?.location?.city && (
                  <div style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>
                    {lead.vendorId.location.city}
                  </div>
                )}
              </div>

              {/* Status */}
              <div style={{ flex: 1 }}>
                <Badge status={lead.status} />
              </div>

              {/* Date */}
              <div style={{ flex: 1, fontSize: 12, color: 'var(--color-text-hint)' }}>
                {formatDate(lead.createdAt)}
              </div>

              {/* Reassign */}
              <div className="admin-cell-actions" style={{ flex: 0.8, display: 'flex', justifyContent: 'flex-end' }}>
                {lead.status === 'new' && (
                  <Button variant="ghost" size="sm" onClick={() => openReassignModal(lead)}>
                    Reassign
                  </Button>
                )}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 24 }}>
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Prev
              </Button>
              <span style={{ fontSize: 13, color: 'var(--color-text-sub)' }}>
                Page {page} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </Button>
            </div>
          )}
        </>
      )}

      {/* Reassign Modal */}
      {showReassign && (
        <div
          onClick={closeReassignModal}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-2xl)', padding: 28, maxWidth: 440, width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300, color: 'var(--color-text)', marginBottom: 4 }}>
                  Reassign lead
                </div>
                {reassigningLead && (
                  <div style={{ fontSize: 13, color: 'var(--color-text-hint)' }}>
                    {reassigningLead.projectType} · {reassigningLead.city}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={closeReassignModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--color-text-hint)' }}
              >
                <X size={18} />
              </button>
            </div>

            <span style={CAPS_LABEL}>Select new designer</span>
            {vendorsLoading ? (
              <div style={{ padding: '24px 0', textAlign: 'center' }}><Spinner size="sm" /></div>
            ) : (
              <select
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)',
                  fontSize: 13, color: 'var(--color-text)', outline: 'none',
                  marginBottom: 20, boxSizing: 'border-box',
                }}
              >
                <option value="">— Choose a designer —</option>
                {availableVendors.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.businessName}{v.location?.city ? ` · ${v.location.city}` : ''}
                  </option>
                ))}
              </select>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button variant="secondary" size="sm" onClick={closeReassignModal}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={reassigning}
                onClick={handleReassign}
              >
                Reassign lead
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
