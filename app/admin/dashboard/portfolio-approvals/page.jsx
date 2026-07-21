'use client';

import { useEffect, useState } from 'react';
import { Building2, Check, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../../lib/api';
import Button from '../../../../components/ui/Button';
import Spinner from '../../../../components/ui/Spinner';
import { formatDate } from '../../../../lib/utils';

export default function AdminPortfolioApprovalsPage() {
  const [projects,   setProjects]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actingId,   setActingId]   = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/projects/pending?limit=10&page=${page}`)
      .then(({ data }) => {
        const d = data.data;
        setProjects(d.projects || []);
        setTotalPages(d.totalPages || 1);
      })
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, [page]);

  const handleApprove = async (project) => {
    setActingId(project._id);
    try {
      await api.put(`/admin/projects/${project._id}/moderate`, { approve: true });
      setProjects((prev) => prev.filter((p) => p._id !== project._id));
      toast.success('Project approved.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve project.');
    }
    setActingId(null);
  };

  const handleReject = async (project) => {
    const rejectionReason = window.prompt(`Reason for rejecting "${project.title}"?`);
    if (rejectionReason === null) return;
    if (!rejectionReason.trim()) { toast.error('A rejection reason is required.'); return; }

    setActingId(project._id);
    try {
      await api.put(`/admin/projects/${project._id}/moderate`, { approve: false, rejectionReason: rejectionReason.trim() });
      setProjects((prev) => prev.filter((p) => p._id !== project._id));
      toast.success('Project rejected.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject project.');
    }
    setActingId(null);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, color: 'var(--color-text)', margin: '0 0 6px' }}>
          Portfolio approvals
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-hint)', margin: 0 }}>
          Review vendor portfolio projects before they go public.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '48px 0' }}><Spinner size="md" /></div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', fontSize: 13, color: 'var(--color-text-hint)' }}>
          No projects awaiting review.
        </div>
      ) : (
        <>
          {projects.map((project) => (
            <div
              key={project._id}
              className="admin-table-row"
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 8,
                flexWrap: 'wrap',
              }}
            >
              {/* Thumbnail */}
              <div style={{
                width: 72, height: 72, borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface-alt)', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
              }}>
                {project.images?.[0] ? (
                  <img
                    src={project.images[0]}
                    alt={project.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Building2 size={24} color="var(--color-text-hint)" />
                )}
              </div>

              {/* Details */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', marginBottom: 4 }}>
                  {project.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-sub)', marginBottom: 2 }}>
                  {project.vendorId?.businessName || 'Unknown vendor'}
                  {project.vendorId?.location?.city ? ` · ${project.vendorId.location.city}` : ''}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-hint)' }}>
                  Submitted {formatDate(project.createdAt)}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <Button
                  variant="success"
                  size="sm"
                  disabled={actingId === project._id}
                  onClick={() => handleApprove(project)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Check size={14} /> Approve
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  disabled={actingId === project._id}
                  onClick={() => handleReject(project)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <X size={14} /> Reject
                </Button>
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
    </div>
  );
}
