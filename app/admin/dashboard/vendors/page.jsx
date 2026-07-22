'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Clock, ChevronRight, Star, Download, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../../lib/api';
import Button from '../../../../components/ui/Button';
import Spinner from '../../../../components/ui/Spinner';
import { formatDate, getInitials } from '../../../../lib/utils';
import { downloadCSV } from '../../../../lib/csv';

const FILTERS = [
  { key: 'all',      label: 'All'             },
  { key: 'pending',  label: 'Pending approval' },
  { key: 'approved', label: 'Approved'         },
];

const REJECTION_REASONS = [
  'No portfolio photos uploaded',
  'Portfolio images are low quality or stock photos',
  'Business profile is incomplete',
  'Phone number not verified',
  'Specializations not selected',
  'Business description too short (min 100 chars)',
  'Other (specify below)',
];

const COL = {
  designer:     { flex: 2  },
  location:     { flex: 1  },
  status:       { flex: 1  },
  subscription: { flex: 1  },
  actions:      { flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 6 },
};

const HEADER_CELL = {
  fontSize: 11, fontWeight: 600, color: 'var(--color-text-hint)',
  letterSpacing: '0.06em', textTransform: 'uppercase',
};

const CAPS_LABEL = {
  fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: 'var(--color-text-hint)',
  display: 'block', marginBottom: 10,
};

function getCompletenessPct(vendor) {
  const criteria = [
    !!vendor.profilePhoto,
    (vendor.portfolioImages?.length || 0) > 0,
    (vendor.description?.length || 0) >= 100,
    (vendor.specializations?.length || 0) > 0,
    vendor.userId?.isPhoneVerified === true,
  ];
  const metCount = criteria.filter(Boolean).length;
  return metCount * 20;
}

function AdminVendorsPageContent() {
  const searchParams = useSearchParams();

  const [vendors,            setVendors]            = useState([]);
  const [loading,            setLoading]            = useState(true);
  const [filter,             setFilter]             = useState(searchParams.get('filter') || 'all');
  const [updatingId,         setUpdatingId]         = useState(null);

  // Rejection modal state
  const [showRejectModal,    setShowRejectModal]    = useState(false);
  const [rejectingVendorId,  setRejectingVendorId]  = useState(null);
  const [rejectionReason,    setRejectionReason]    = useState('');
  const [customReason,       setCustomReason]       = useState('');

  useEffect(() => {
    setLoading(true);
    let url = '/admin/vendors';
    if (filter === 'pending')  url += '?approved=false';
    if (filter === 'approved') url += '?approved=true';
    api.get(url)
      .then(({ data }) => setVendors(data.data?.vendors || []))
      .catch(() => setVendors([]))
      .finally(() => setLoading(false));
  }, [filter]);

  const handleApprove = async (vendorId, approve, reason = '') => {
    setUpdatingId(vendorId);
    try {
      await api.put(`/admin/vendors/${vendorId}/approve`, { approve, rejectionReason: reason });
      setVendors((prev) =>
        prev.map((v) => v._id === vendorId ? { ...v, isApproved: approve, rejectionReason: approve ? '' : reason } : v)
      );
      toast.success(approve ? 'Vendor approved.' : 'Vendor rejected.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    }
    setUpdatingId(null);
  };

  const openRejectModal = (vendor) => {
    setRejectingVendorId(vendor._id);
    setRejectionReason('');
    setCustomReason('');
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectingVendorId(null);
    setRejectionReason('');
    setCustomReason('');
  };

  const handleSendRejection = async () => {
    const reason = rejectionReason === 'Other (specify below)' ? customReason : rejectionReason;
    await handleApprove(rejectingVendorId, false, reason);
    closeRejectModal();
  };

  const handleToggleFeatured = async (vendorId) => {
    const vendor = vendors.find((v) => v._id === vendorId);
    try {
      await api.put(`/admin/vendors/${vendorId}/feature`);
      setVendors((prev) =>
        prev.map((v) => v._id === vendorId ? { ...v, isFeatured: !v.isFeatured } : v)
      );
      toast.success(vendor?.isFeatured ? 'Feature removed.' : 'Vendor featured!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    }
  };

  const handleExportCSV = () => {
    const csvData = vendors.map((v) => ({
      'Business Name': v.businessName,
      'Contact Name': v.userId?.name || '',
      'Email': v.userId?.email || '',
      'Phone': v.userId?.phone || '',
      'City': v.location?.city || '',
      'State': v.location?.state || '',
      'Specializations': (v.specializations || []).join(' | '),
      'Rating': v.rating,
      'Reviews': v.reviewCount,
      'Approved': v.isApproved ? 'Yes' : 'No',
      'Featured': v.isFeatured ? 'Yes' : 'No',
      'Listing Active': v.isListingEnabled ? 'Yes' : 'No',
      'Joined': new Date(v.createdAt || Date.now()).toLocaleDateString('en-IN'),
    }));
    downloadCSV(csvData, `intrafer-vendors-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const rejectingVendor = vendors.find((v) => v._id === rejectingVendorId);

  const tabStyle = (key) => key === filter
    ? { background: 'var(--color-primary-bg)', color: 'var(--color-primary)', border: '1px solid var(--color-accent)', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }
    : { background: 'var(--color-surface)', color: 'var(--color-text-sub)', border: '1px solid var(--color-border)', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' };

  return (
    <div>
      {/* Heading */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, color: 'var(--color-text)', margin: 0 }}>
            Vendors
          </h1>
          {!loading && (
            <span style={{ fontSize: 13, color: 'var(--color-text-hint)', background: 'var(--color-surface-alt)', padding: '2px 10px', borderRadius: 20, fontWeight: 500 }}>
              {vendors.length} total
            </span>
          )}
        </div>
        <Button variant="secondary" size="sm" onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Download size={14} /> Export CSV
        </Button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {FILTERS.map(({ key, label }) => (
          <button key={key} type="button" style={tabStyle(key)} onClick={() => setFilter(key)}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '48px 0' }}><Spinner size="md" /></div>
      ) : vendors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '56px 24px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', fontSize: 13, color: 'var(--color-text-hint)' }}>
          No vendors found for this filter.
        </div>
      ) : (
        <>
          {/* Header row */}
          <div className="admin-table-header" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)', padding: '10px 16px', marginBottom: 8,
          }}>
            <div style={{ ...HEADER_CELL, flex: COL.designer.flex }}>Designer</div>
            <div style={{ ...HEADER_CELL, flex: COL.location.flex }}>Location</div>
            <div style={{ ...HEADER_CELL, flex: COL.status.flex }}>Status</div>
            <div style={{ ...HEADER_CELL, flex: COL.subscription.flex }}>Subscription</div>
            <div style={{ ...HEADER_CELL, flex: COL.actions.flex, textAlign: 'right' }}>Actions</div>
          </div>

          {/* Data rows */}
          {vendors.map((vendor) => (
            <div
              key={vendor._id}
              className="admin-table-row"
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: 8,
              }}
            >
              {/* Designer */}
              <div style={{ flex: COL.designer.flex, display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--color-accent-bg)', color: 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600,
                }}>
                  {getInitials(vendor.userId?.name || vendor.businessName)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {vendor.userId?.name || '—'}
                    </div>
                    {vendor.isFeatured && (
                      <span style={{ fontSize: 9, fontWeight: 700, background: '#F59E0B', color: '#fff', padding: '2px 6px', borderRadius: 4, letterSpacing: '0.04em', flexShrink: 0 }}>
                        FEATURED
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-sub)', marginBottom: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {vendor.businessName}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-hint)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {vendor.userId?.email}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div style={{ flex: COL.location.flex }}>
                <span style={{ fontSize: 13, color: 'var(--color-text-sub)' }}>
                  {[vendor.location?.city, vendor.location?.state].filter(Boolean).join(', ') || '—'}
                </span>
              </div>

              {/* Status */}
              <div style={{ flex: COL.status.flex }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                  {vendor.isApproved
                    ? <CheckCircle size={12} color="var(--color-success)" />
                    : <Clock size={12} color="var(--color-warning)" />
                  }
                  <span style={{
                    fontSize: 12, fontWeight: 500,
                    color: vendor.isApproved ? 'var(--color-success)' : 'var(--color-warning)',
                  }}>
                    {vendor.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </div>
                <div style={{
                  fontSize: 11, marginBottom: 4,
                  color: vendor.isListingEnabled ? 'var(--color-success)' : 'var(--color-text-hint)',
                }}>
                  {vendor.isListingEnabled ? 'Listing active' : 'Listing off'}
                </div>
                <div style={{ background: 'var(--color-border)', borderRadius: 4, height: 5, marginBottom: 2 }}>
                  <div style={{
                    width: `${getCompletenessPct(vendor)}%`,
                    background: 'var(--color-primary)', borderRadius: 4, height: '100%',
                  }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-hint)' }}>
                  {getCompletenessPct(vendor)}% complete
                </div>
              </div>

              {/* Subscription */}
              <div style={{ flex: COL.subscription.flex }}>
                {vendor.subscriptionId?.planName ? (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text)' }}>
                      {vendor.subscriptionId.planName}
                    </div>
                    {vendor.subscriptionId.endDate && (
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-hint)' }}>
                        until {formatDate(vendor.subscriptionId.endDate)}
                      </div>
                    )}
                  </div>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--color-text-hint)' }}>No subscription</span>
                )}
              </div>

              {/* Actions */}
              <div className="admin-cell-actions" style={{ flex: COL.actions.flex, display: 'flex', justifyContent: 'flex-end', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
                {/* Featured star toggle */}
                <button
                  type="button"
                  title={vendor.isFeatured ? 'Remove featured' : 'Set as featured'}
                  onClick={() => handleToggleFeatured(vendor._id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)',
                    cursor: 'pointer',
                  }}
                >
                  <Star
                    size={14}
                    fill={vendor.isFeatured ? '#F59E0B' : 'none'}
                    color={vendor.isFeatured ? '#F59E0B' : 'var(--color-text-hint)'}
                  />
                </button>

                {!vendor.isApproved ? (
                  <>
                    <Button
                      variant="success"
                      size="sm"
                      loading={updatingId === vendor._id}
                      onClick={() => handleApprove(vendor._id, true)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      loading={updatingId === vendor._id}
                      onClick={() => openRejectModal(vendor)}
                    >
                      Reject
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={updatingId === vendor._id}
                    onClick={() => openRejectModal(vendor)}
                  >
                    Revoke
                  </Button>
                )}
                <button
                  type="button"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)',
                    cursor: 'pointer',
                  }}
                  title="View details"
                >
                  <ChevronRight size={14} color="var(--color-text-hint)" />
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div
          onClick={closeRejectModal}
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
              borderRadius: 'var(--radius-2xl)', padding: 28, maxWidth: 480, width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300, color: 'var(--color-text)', marginBottom: 4 }}>
                  Reject vendor application
                </div>
                {rejectingVendor && (
                  <div style={{ fontSize: 13, color: 'var(--color-text-hint)' }}>
                    {rejectingVendor.businessName} · {rejectingVendor.userId?.name}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={closeRejectModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--color-text-hint)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Reason pills */}
            <span style={CAPS_LABEL}>Reason for rejection</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {REJECTION_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setRejectionReason(reason)}
                  style={{
                    padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                    cursor: 'pointer', transition: 'all 0.15s',
                    background: rejectionReason === reason ? 'var(--color-primary-bg)' : 'var(--color-surface)',
                    color: rejectionReason === reason ? 'var(--color-primary)' : 'var(--color-text-mid, var(--color-text-sub))',
                    border: rejectionReason === reason ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                  }}
                >
                  {reason}
                </button>
              ))}
            </div>

            {/* Custom textarea (always shown when Other is selected, or when no pill selected as additional notes) */}
            {(rejectionReason === 'Other (specify below)' || !rejectionReason) && (
              <textarea
                rows={3}
                placeholder="Add details for the designer..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)',
                  fontSize: 13, color: 'var(--color-text)', resize: 'vertical',
                  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                  marginBottom: 20,
                }}
              />
            )}

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: rejectionReason && rejectionReason !== 'Other (specify below)' ? 20 : 0 }}>
              <Button variant="secondary" size="sm" onClick={closeRejectModal}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                loading={updatingId === rejectingVendorId}
                onClick={handleSendRejection}
              >
                Send rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminVendorsPage() {
  return (
    <Suspense fallback={null}>
      <AdminVendorsPageContent />
    </Suspense>
  );
}
