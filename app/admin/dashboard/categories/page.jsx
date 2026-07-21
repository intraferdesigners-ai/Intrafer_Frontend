'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Trash2, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../../lib/api';
import Button from '../../../../components/ui/Button';
import Spinner from '../../../../components/ui/Spinner';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [newName,    setNewName]    = useState('');
  const [adding,     setAdding]     = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchCategories = () => {
    setLoading(true);
    api.get('/admin/categories')
      .then(({ data }) => setCategories(data.data?.categories || []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;

    setAdding(true);
    try {
      const { data } = await api.post('/admin/categories', { name });
      const created = data.data?.category;
      setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName('');
      toast.success('Category added.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add category.');
    }
    setAdding(false);
  };

  const handleToggleActive = async (category) => {
    setTogglingId(category._id);
    try {
      const { data } = await api.put(`/admin/categories/${category._id}`, { isActive: !category.isActive });
      const updated = data.data?.category;
      setCategories((prev) => prev.map((c) => (c._id === category._id ? updated : c)));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update category.');
    }
    setTogglingId(null);
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Delete category "${category.name}"? This cannot be undone.`)) return;
    setDeletingId(category._id);
    try {
      await api.delete(`/admin/categories/${category._id}`);
      setCategories((prev) => prev.filter((c) => c._id !== category._id));
      toast.success('Category deleted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category.');
    }
    setDeletingId(null);
  };

  return (
    <div>
      {/* Heading */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, color: 'var(--color-text)', margin: 0 }}>
            Categories
          </h1>
          {!loading && (
            <span style={{ fontSize: 13, color: 'var(--color-text-hint)', background: 'var(--color-surface-alt)', padding: '2px 10px', borderRadius: 20, fontWeight: 500 }}>
              {categories.length} total
            </span>
          )}
        </div>
      </div>

      {/* Add category form */}
      <form
        onSubmit={handleAdd}
        style={{
          display: 'flex', gap: 8, marginBottom: 24,
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)', padding: 12,
        }}
      >
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Category name"
          style={{
            flex: 1, padding: '9px 12px', fontSize: 13,
            background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)', color: 'var(--color-text)',
            fontFamily: 'var(--font-ui)',
          }}
        />
        <Button type="submit" variant="primary" size="sm" loading={adding} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} /> Add category
        </Button>
      </form>

      {loading ? (
        <div style={{ padding: '48px 0' }}><Spinner size="md" /></div>
      ) : categories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '56px 24px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', fontSize: 13, color: 'var(--color-text-hint)' }}>
          No categories yet. Add your first one above.
        </div>
      ) : (
        categories.map((category) => (
          <div
            key={category._id}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: 8,
            }}
          >
            <div style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>
              {category.name}
            </div>

            <button
              type="button"
              disabled={togglingId === category._id}
              onClick={() => handleToggleActive(category)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                opacity: togglingId === category._id ? 0.6 : 1,
              }}
            >
              {category.isActive
                ? <CheckCircle size={12} color="var(--color-success)" />
                : <XCircle size={12} color="var(--color-text-hint)" />
              }
              <span style={{
                fontSize: 12, fontWeight: 500,
                color: category.isActive ? 'var(--color-success)' : 'var(--color-text-hint)',
              }}>
                {category.isActive ? 'Active' : 'Inactive'}
              </span>
            </button>

            <button
              type="button"
              title="Delete"
              disabled={deletingId === category._id}
              onClick={() => handleDelete(category)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                background: 'var(--color-danger-bg)', border: '1px solid transparent',
                cursor: 'pointer', opacity: deletingId === category._id ? 0.6 : 1, flexShrink: 0,
              }}
            >
              <Trash2 size={13} color="var(--color-danger)" />
            </button>
          </div>
        ))
      )}
    </div>
  );
}
