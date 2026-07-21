'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Trash2, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../../lib/api';
import Button from '../../../../components/ui/Button';
import Spinner from '../../../../components/ui/Spinner';

export default function AdminCitiesPage() {
  const [cities,     setCities]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [newName,    setNewName]    = useState('');
  const [adding,     setAdding]     = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchCities = () => {
    setLoading(true);
    api.get('/admin/cities')
      .then(({ data }) => setCities(data.data?.cities || []))
      .catch(() => setCities([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCities(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;

    setAdding(true);
    try {
      const { data } = await api.post('/admin/cities', { name });
      const created = data.data?.city;
      setCities((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName('');
      toast.success('City added.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add city.');
    }
    setAdding(false);
  };

  const handleToggleActive = async (city) => {
    setTogglingId(city._id);
    try {
      const { data } = await api.put(`/admin/cities/${city._id}`, { isActive: !city.isActive });
      const updated = data.data?.city;
      setCities((prev) => prev.map((c) => (c._id === city._id ? updated : c)));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update city.');
    }
    setTogglingId(null);
  };

  const handleDelete = async (city) => {
    if (!window.confirm(`Delete city "${city.name}"? This cannot be undone.`)) return;
    setDeletingId(city._id);
    try {
      await api.delete(`/admin/cities/${city._id}`);
      setCities((prev) => prev.filter((c) => c._id !== city._id));
      toast.success('City deleted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete city.');
    }
    setDeletingId(null);
  };

  return (
    <div>
      {/* Heading */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, color: 'var(--color-text)', margin: 0 }}>
            Cities
          </h1>
          {!loading && (
            <span style={{ fontSize: 13, color: 'var(--color-text-hint)', background: 'var(--color-surface-alt)', padding: '2px 10px', borderRadius: 20, fontWeight: 500 }}>
              {cities.length} total
            </span>
          )}
        </div>
      </div>

      {/* Add city form */}
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
          placeholder="City name"
          style={{
            flex: 1, padding: '9px 12px', fontSize: 13,
            background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)', color: 'var(--color-text)',
            fontFamily: 'var(--font-ui)',
          }}
        />
        <Button type="submit" variant="primary" size="sm" loading={adding} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} /> Add city
        </Button>
      </form>

      {loading ? (
        <div style={{ padding: '48px 0' }}><Spinner size="md" /></div>
      ) : cities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '56px 24px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', fontSize: 13, color: 'var(--color-text-hint)' }}>
          No cities yet. Add your first one above.
        </div>
      ) : (
        cities.map((city) => (
          <div
            key={city._id}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: 8,
            }}
          >
            <div style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>
              {city.name}
            </div>

            <button
              type="button"
              disabled={togglingId === city._id}
              onClick={() => handleToggleActive(city)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                opacity: togglingId === city._id ? 0.6 : 1,
              }}
            >
              {city.isActive
                ? <CheckCircle size={12} color="var(--color-success)" />
                : <XCircle size={12} color="var(--color-text-hint)" />
              }
              <span style={{
                fontSize: 12, fontWeight: 500,
                color: city.isActive ? 'var(--color-success)' : 'var(--color-text-hint)',
              }}>
                {city.isActive ? 'Active' : 'Inactive'}
              </span>
            </button>

            <button
              type="button"
              title="Delete"
              disabled={deletingId === city._id}
              onClick={() => handleDelete(city)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                background: 'var(--color-danger-bg)', border: '1px solid transparent',
                cursor: 'pointer', opacity: deletingId === city._id ? 0.6 : 1, flexShrink: 0,
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
