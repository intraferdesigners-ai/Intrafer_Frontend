'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Clock, Pencil, Trash2, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../../lib/api';
import Button from '../../../../components/ui/Button';
import Spinner from '../../../../components/ui/Spinner';
import { formatDate } from '../../../../lib/utils';

const COL = {
  title:    { flex: 3 },
  category: { flex: 1 },
  status:   { flex: 1 },
  date:     { flex: 1 },
  actions:  { flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 6 },
};

const HEADER_CELL = {
  fontSize: 11, fontWeight: 600, color: 'var(--color-text-hint)',
  letterSpacing: '0.06em', textTransform: 'uppercase',
};

export default function AdminBlogPage() {
  const [posts,      setPosts]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchPosts = () => {
    setLoading(true);
    api.get('/admin/blog')
      .then(({ data }) => setPosts(data.data?.posts || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleDelete = async (post) => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    setDeletingId(post._id);
    try {
      await api.delete(`/admin/blog/${post._id}`);
      setPosts((prev) => prev.filter((p) => p._id !== post._id));
      toast.success('Post deleted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete post.');
    }
    setDeletingId(null);
  };

  return (
    <div>
      {/* Heading */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, color: 'var(--color-text)', margin: 0 }}>
            Blog
          </h1>
          {!loading && (
            <span style={{ fontSize: 13, color: 'var(--color-text-hint)', background: 'var(--color-surface-alt)', padding: '2px 10px', borderRadius: 20, fontWeight: 500 }}>
              {posts.length} total
            </span>
          )}
        </div>
        <Link href="/admin/dashboard/blog/new">
          <Button variant="primary" size="sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} /> New post
          </Button>
        </Link>
      </div>

      {loading ? (
        <div style={{ padding: '48px 0' }}><Spinner size="md" /></div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '56px 24px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', fontSize: 13, color: 'var(--color-text-hint)' }}>
          No blog posts yet. Create your first one.
        </div>
      ) : (
        <>
          {/* Header row */}
          <div className="admin-table-header" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)', padding: '10px 16px', marginBottom: 8,
          }}>
            <div style={{ ...HEADER_CELL, flex: COL.title.flex }}>Title</div>
            <div style={{ ...HEADER_CELL, flex: COL.category.flex }}>Category</div>
            <div style={{ ...HEADER_CELL, flex: COL.status.flex }}>Status</div>
            <div style={{ ...HEADER_CELL, flex: COL.date.flex }}>Published</div>
            <div style={{ ...HEADER_CELL, flex: COL.actions.flex, textAlign: 'right' }}>Actions</div>
          </div>

          {/* Data rows */}
          {posts.map((post) => (
            <div
              key={post._id}
              className="admin-table-row"
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: 8,
              }}
            >
              {/* Title */}
              <div style={{ flex: COL.title.flex, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {post.title}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-hint)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  /blog/{post.slug}
                </div>
              </div>

              {/* Category */}
              <div style={{ flex: COL.category.flex }}>
                <span style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>{post.category}</span>
              </div>

              {/* Status */}
              <div style={{ flex: COL.status.flex, display: 'flex', alignItems: 'center', gap: 5 }}>
                {post.isPublished
                  ? <CheckCircle size={12} color="var(--color-success)" />
                  : <Clock size={12} color="var(--color-warning)" />
                }
                <span style={{
                  fontSize: 12, fontWeight: 500,
                  color: post.isPublished ? 'var(--color-success)' : 'var(--color-warning)',
                }}>
                  {post.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>

              {/* Date */}
              <div style={{ flex: COL.date.flex }}>
                <span style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>
                  {formatDate(post.publishedAt)}
                </span>
              </div>

              {/* Actions */}
              <div style={{ flex: COL.actions.flex, display: 'flex', justifyContent: 'flex-end', gap: 6, flexShrink: 0 }}>
                <Link href={`/admin/dashboard/blog/${post._id}/edit`}>
                  <button
                    type="button"
                    title="Edit"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                      background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)',
                      cursor: 'pointer',
                    }}
                  >
                    <Pencil size={13} color="var(--color-text-sub)" />
                  </button>
                </Link>
                <button
                  type="button"
                  title="Delete"
                  disabled={deletingId === post._id}
                  onClick={() => handleDelete(post)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-danger-bg)', border: '1px solid transparent',
                    cursor: 'pointer', opacity: deletingId === post._id ? 0.6 : 1,
                  }}
                >
                  <Trash2 size={13} color="var(--color-danger)" />
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
