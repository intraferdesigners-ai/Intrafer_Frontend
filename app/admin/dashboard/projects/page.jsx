'use client';

import { useEffect, useState } from 'react';
import { Building2, Clock, CheckCircle2, XCircle, Search, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../../lib/api';
import Button from '../../../../components/ui/Button';
import Spinner from '../../../../components/ui/Spinner';
import { formatDate } from '../../../../lib/utils';

const MODERATION_BADGE = {
  pending:  { label: 'Pending review', icon: Clock,        color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
  approved: { label: 'Approved',       icon: CheckCircle2, color: 'var(--color-success)', bg: 'var(--color-success-bg)' },
  rejected: { label: 'Rejected',       icon: XCircle,       color: 'var(--color-danger)',  bg: 'var(--color-danger-bg)'  },
};

const STATUS_OPTIONS = [
  { value: '',         label: 'All' },
  { value: 'pending',  label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const HEADER_CELL = {
  fontSize: 11, fontWeight: 600, color: 'var(--color-text-hint)',
  letterSpacing: '0.06em', textTransform: 'uppercase',
};

const SELECT_STYLE = {
  padding: '9px 12px', fontSize: 13,
  background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)', color: 'var(--color-text)',
  fontFamily: 'var(--font-ui)', cursor: 'pointer',
};

export default function AdminProjectsPage() {
  const [projects,   setProjects]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);

  const [status,       setStatus]       = useState('');
  const [searchInput,  setSearchInput]  = useState('');
  const [search,       setSearch]       = useState('');
  const [togglingId,   setTogglingId]   = useState(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '15', page: String(page) });
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    api.get(`/admin/projects?${params}`)
      .then(({ data }) => {
        const d = data.data;
        setProjects(d.projects || []);
        setTotalPages(d.totalPages || 1);
        setTotal(d.total || 0);
      })
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, [status, search, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  const handleToggleFeatured = async (project) => {
    setTogglingId(project._id);
    try {
      const { data } = await api.put(`/admin/projects/${project._id}/feature`);
      const isFeatured = data.data?.isFeatured;
      setProjects((prev) => prev.map((p) => (p._id === project._id ? { ...p, isFeatured } : p)));
      toast.success(isFeatured ? 'Project featured.' : 'Feature removed.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update featured status.');
    }
    setTogglingId(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, color: 'var(--color-text)', margin: 0 }}>
          All projects
        </h1>
        {!loading && (
          <span style={{ fontSize: 13, color: 'var(--color-text-hint)', background: 'var(--color-surface-alt)', padding: '2px 10px', borderRadius: 20, fontWeight: 500 }}>
            {total} total
          </span>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={status} onChange={handleStatusChange} style={SELECT_STYLE}>
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title…"
            style={{ ...SELECT_STYLE, cursor: 'text', width: 220 }}
          />
          <Button type="submit" variant="secondary" size="sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Search size={14} /> Search
          </Button>
        </form>
      </div>

      {loading ? (
        <div style={{ padding: '48px 0' }}><Spinner size="md" /></div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', fontSize: 13, color: 'var(--color-text-hint)' }}>
          No projects found.
        </div>
      ) : (
        <>
          {/* Header row */}
          <div className="admin-table-header" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)', padding: '10px 16px', marginBottom: 8,
          }}>
            <div style={{ ...HEADER_CELL, flex: '0 0 56px' }} />
            <div style={{ ...HEADER_CELL, flex: 2 }}>Title</div>
            <div style={{ ...HEADER_CELL, flex: 1.6 }}>Vendor</div>
            <div style={{ ...HEADER_CELL, flex: 1.4 }}>Status</div>
            <div style={{ ...HEADER_CELL, flex: 1 }}>Submitted</div>
            <div style={{ ...HEADER_CELL, flex: '0 0 40px', textAlign: 'right' }} />
          </div>

          {projects.map((project) => {
            const badge = MODERATION_BADGE[project.moderationStatus] || MODERATION_BADGE.pending;
            const BadgeIcon = badge.icon;
            return (
              <div
                key={project._id}
                className="admin-table-row"
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)', padding: '12px 16px', marginBottom: 8,
                  flexWrap: 'wrap',
                }}
              >
                {/* Thumbnail */}
                <div style={{
                  flex: '0 0 56px',
                  width: 56, height: 56, borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface-alt)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                }}>
                  {project.images?.[0] ? (
                    <img
                      src={project.images[0]}
                      alt={project.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Building2 size={20} color="var(--color-text-hint)" />
                  )}
                </div>

                {/* Title */}
                <div style={{ flex: 2, minWidth: 160, fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>
                  {project.title}
                </div>

                {/* Vendor */}
                <div style={{ flex: 1.6, minWidth: 140, fontSize: 13, color: 'var(--color-text-sub)' }}>
                  {project.vendorId?.businessName || 'Unknown vendor'}
                </div>

                {/* Status */}
                <div style={{ flex: 1.4 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontSize: 11, fontWeight: 500, padding: '3px 8px',
                    borderRadius: 20, color: badge.color, background: badge.bg,
                  }}>
                    <BadgeIcon size={11} />
                    {badge.label}
                  </span>
                </div>

                {/* Submitted date */}
                <div style={{ flex: 1, fontSize: 12, color: 'var(--color-text-hint)' }}>
                  {formatDate(project.createdAt)}
                </div>

                {/* Featured toggle */}
                <div style={{ flex: '0 0 40px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    title={project.isFeatured ? 'Remove from featured' : 'Feature on homepage'}
                    disabled={togglingId === project._id}
                    onClick={() => handleToggleFeatured(project)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      opacity: togglingId === project._id ? 0.5 : 1,
                    }}
                  >
                    <Star
                      size={16}
                      fill={project.isFeatured ? '#F59E0B' : 'none'}
                      color={project.isFeatured ? '#F59E0B' : 'var(--color-text-hint)'}
                    />
                  </button>
                </div>
              </div>
            );
          })}

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
    </div>
  );
}
