'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Building2, Eye, EyeOff, Pencil, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../../lib/api';
import Button from '../../../../components/ui/Button';
import Spinner from '../../../../components/ui/Spinner';

export default function VendorProjectsPage() {
  const [projects,      setProjects]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [deletingId,    setDeletingId]    = useState(null);
  const [dragIndex,     setDragIndex]     = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [deleteModal,   setDeleteModal]   = useState(null);

  useEffect(() => {
    api.get('/vendor/projects')
      .then(({ data }) => {
        const d = data.data;
        setProjects(Array.isArray(d) ? d : d.projects || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleTogglePublish = async (project) => {
    if (project.isPublished) {
      const confirmed = window.confirm(
        `Unpublish "${project.title}"?\n\nThis will hide it from your public profile. You can republish anytime.`
      );
      if (!confirmed) return;
    }

    const next = !project.isPublished;
    setProjects((prev) => prev.map((p) => p._id === project._id ? { ...p, isPublished: next } : p));
    try {
      await api.put(`/vendor/projects/${project._id}`, { isPublished: next });
      toast.success(next ? 'Project published!' : 'Project unpublished.');
    } catch {
      setProjects((prev) => prev.map((p) => p._id === project._id ? { ...p, isPublished: project.isPublished } : p));
      toast.error('Failed to update project.');
    }
  };

  const handleDelete = async (projectId) => {
    setDeletingId(projectId);
    try {
      await api.delete(`/vendor/projects/${projectId}`);
      setProjects((prev) => prev.filter((p) => p._id !== projectId));
      toast.success('Project deleted.');
    } catch {
      toast.error('Failed to delete project.');
    }
    setDeletingId(null);
  };

  const handleDrop = (dropIndex) => {
    if (dragIndex === null || dragIndex === dropIndex) return;
    const reordered = [...projects];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    setProjects(reordered);
    setDragIndex(null);
    setDragOverIndex(null);

    api.put('/vendor/projects/reorder', { projectIds: reordered.map((p) => p._id) })
      .then(() => toast.success('Order saved.'))
      .catch(() => toast.error('Failed to save order.'));
  };

  return (
    <div>
      {/* Heading + add button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300,
          color: 'var(--color-text)', margin: 0,
        }}>
          Portfolio
        </h1>
        <Link href="/vendor/dashboard/projects/new">
          <Button variant="primary" size="sm">
            <Plus size={16} />
            Add project
          </Button>
        </Link>
      </div>

      {loading ? (
        <div style={{ padding: '48px 0' }}><Spinner size="md" /></div>
      ) : projects.length === 0 ? (
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)', padding: '56px 24px', textAlign: 'center',
        }}>
          <Building2 size={40} color="var(--color-text-hint)" style={{ marginBottom: 12 }} />
          <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text)', margin: '0 0 6px' }}>
            No projects yet
          </p>
          <p style={{ fontSize: 13, color: 'var(--color-text-sub)', margin: '0 0 24px' }}>
            Add your first project to showcase your work.
          </p>
          <Link href="/vendor/dashboard/projects/new">
            <Button variant="primary" size="sm">
              <Plus size={15} /> Add project
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
          }}>
            {projects.map((project, i) => (
              <div
                key={project._id}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => { e.preventDefault(); setDragOverIndex(i); }}
                onDrop={() => handleDrop(i)}
                onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                style={{
                  background: 'var(--color-surface)',
                  border: dragOverIndex === i && dragIndex !== i
                    ? '2px solid var(--color-primary)'
                    : '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)', overflow: 'hidden',
                  opacity: dragIndex === i ? 0.4 : 1,
                  cursor: 'grab',
                  transition: 'opacity 150ms, border-color 150ms',
                }}
              >
                {/* Image area */}
                <div style={{ height: 160, background: 'var(--color-surface-alt)', position: 'relative' }}>
                  {project.images?.[0] ? (
                    <img
                      src={project.images[0]}
                      alt={project.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Building2 size={36} color="var(--color-text-hint)" />
                    </div>
                  )}

                  {/* Drag handle */}
                  <div style={{
                    position: 'absolute', top: 8, left: 8,
                    background: 'rgba(0,0,0,0.5)', borderRadius: 4,
                    padding: '3px 4px', display: 'flex', alignItems: 'center',
                    cursor: 'grab',
                  }}>
                    <GripVertical size={14} color="#fff" />
                  </div>

                  {!project.isPublished && (
                    <div style={{
                      position: 'absolute', top: 8, right: 8,
                      background: 'rgba(0,0,0,0.6)', color: '#fff',
                      fontSize: 10, padding: '3px 8px', borderRadius: 4,
                      letterSpacing: '0.04em',
                    }}>
                      DRAFT
                    </div>
                  )}
                </div>

                {/* Body */}
                <div style={{ padding: 14 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', margin: '0 0 4px' }}>
                    {project.title}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {project.projectType && (
                      <span style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 20,
                        background: 'var(--color-accent-bg)', color: 'var(--color-primary)',
                      }}>
                        {project.projectType}
                      </span>
                    )}
                    {project.completedYear && (
                      <span style={{ fontSize: 11, color: 'var(--color-text-hint)' }}>
                        {project.completedYear}
                      </span>
                    )}
                  </div>
                  {project.location && (
                    <p style={{ fontSize: 11, color: 'var(--color-text-hint)', margin: '6px 0 0' }}>
                      📍 {project.location}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div style={{
                  borderTop: '1px solid var(--color-border)',
                  padding: '10px 14px',
                  display: 'flex', gap: 8,
                }}>
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(project)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 12, fontWeight: 500, padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      color: project.isPublished ? 'var(--color-success)' : 'var(--color-text-hint)',
                    }}
                  >
                    {project.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
                    {project.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                  <Link
                    href={`/vendor/dashboard/projects/${project._id}/edit`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      textDecoration: 'none',
                      fontSize: 12, fontWeight: 500, padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-text-hint)',
                    }}
                  >
                    <Pencil size={14} />
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDeleteModal({ id: project._id, title: project.title })}
                    disabled={deletingId === project._id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 12, fontWeight: 500, padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)', marginLeft: 'auto',
                      color: 'var(--color-danger)',
                      opacity: deletingId === project._id ? 0.5 : 1,
                    }}
                  >
                    <Trash2 size={14} />
                    {deletingId === project._id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'var(--color-text-hint)', textAlign: 'center', marginTop: 12 }}>
            Drag to reorder · Changes saved automatically
          </p>
        </>
      )}

      {deleteModal && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setDeleteModal(null)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(15,23,42,.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 200,
            }}
          />
          {/* Modal */}
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 201,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px',
            width: 'min(400px, calc(100vw - 32px))',
            boxShadow: 'var(--shadow-lg)',
            textAlign: 'center',
          }}>
            {/* Warning icon */}
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'var(--color-danger-bg)',
              border: '1px solid var(--color-danger)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="var(--color-danger)" strokeWidth="2" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
            </div>

            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '20px', fontWeight: 400,
              color: 'var(--color-text)', marginBottom: '8px',
            }}>
              Delete project?
            </div>
            <div style={{
              fontSize: '14px', color: 'var(--color-text-sub)',
              marginBottom: '24px', lineHeight: 1.6,
            }}>
              &quot;<strong>{deleteModal.title}</strong>&quot; will be permanently deleted
              from your portfolio. This cannot be undone.
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setDeleteModal(null)}
                style={{
                  flex: 1, height: '44px',
                  background: 'var(--color-surface-alt)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px', fontWeight: 500,
                  color: 'var(--color-text)', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handleDelete(deleteModal.id);
                  setDeleteModal(null);
                }}
                style={{
                  flex: 1, height: '44px',
                  background: 'var(--color-danger)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px', fontWeight: 600,
                  color: '#fff', cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(220,38,38,.3)',
                }}
              >
                Delete project
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
