'use client';

import { useEffect, useState } from 'react';
import { X, Shield, Plus, Mail, Phone } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../../lib/api';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import Spinner from '../../../../components/ui/Spinner';
import useAuthStore from '../../../../store/authStore';
import { formatDate } from '../../../../lib/utils';

const PERMISSIONS = [
  { key: 'manage_vendors',         label: 'Manage Vendors'         },
  { key: 'manage_leads',           label: 'Manage Leads'           },
  { key: 'manage_users',           label: 'Manage Users'           },
  { key: 'view_analytics',         label: 'View Analytics'         },
  { key: 'manage_blog',            label: 'Manage Blog'            },
  { key: 'manage_coupons',         label: 'Manage Coupons'         },
  { key: 'manage_support',         label: 'Manage Support'         },
  { key: 'manage_email_templates', label: 'Manage Email Templates' },
  { key: 'manage_settings',        label: 'Manage Settings'        },
  { key: 'manage_taxonomy',        label: 'Manage Cities & Categories' },
  { key: 'manage_portfolio',       label: 'Portfolio Approvals'    },
];

const CAPS_LABEL = {
  fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: 'var(--color-text-hint)',
  display: 'block', marginBottom: 10,
};

const COL = {
  name:        { flex: 2 },
  permissions: { flex: 2 },
  joined:      { flex: 1 },
  actions:     { flex: 1, display: 'flex', justifyContent: 'flex-end' },
};

const HEADER_CELL = {
  fontSize: 11, fontWeight: 600, color: 'var(--color-text-hint)',
  letterSpacing: '0.06em', textTransform: 'uppercase',
};

const EMPTY_CREATE_FORM = { name: '', email: '', phone: '', password: '', adminPermissions: [] };

function PermissionCheckboxes({ selected, onToggle }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {PERMISSIONS.map(({ key, label }) => {
        const active = selected.includes(key);
        return (
          <button
            key={key}
            type="button"
            onClick={() => onToggle(key)}
            style={{
              padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.15s',
              background: active ? 'var(--color-primary-bg)' : 'var(--color-surface)',
              color: active ? 'var(--color-primary)' : 'var(--color-text-sub)',
              border: active ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export default function AdminTeamPage() {
  const { role, user } = useAuthStore();

  const [admins,  setAdmins]  = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [creating,   setCreating]   = useState(false);

  const [editing,     setEditing]     = useState(null); // the admin being edited
  const [editDraft,   setEditDraft]   = useState({ adminPermissions: [], isSuperAdmin: false });
  const [saving,       setSaving]     = useState(false);

  const isSuperAdmin = user?.isSuperAdmin === true;

  const fetchAdmins = () => {
    setLoading(true);
    api.get('/admin/admin-users')
      .then(({ data }) => setAdmins(data.data?.admins || []))
      .catch(() => setAdmins([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isSuperAdmin) fetchAdmins();
  }, [isSuperAdmin]);

  const toggleCreatePermission = (key) => {
    setCreateForm((p) => ({
      ...p,
      adminPermissions: p.adminPermissions.includes(key)
        ? p.adminPermissions.filter((k) => k !== key)
        : [...p.adminPermissions, key],
    }));
  };

  const handleCreate = async () => {
    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.phone.trim() || !createForm.password) {
      toast.error('Name, email, phone, and password are required.');
      return;
    }
    setCreating(true);
    try {
      await api.post('/admin/admin-users', createForm);
      toast.success('Admin user created.');
      setShowCreate(false);
      setCreateForm(EMPTY_CREATE_FORM);
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create admin user.');
    }
    setCreating(false);
  };

  const openEdit = (admin) => {
    setEditing(admin);
    setEditDraft({
      adminPermissions: admin.adminPermissions || [],
      isSuperAdmin: !!admin.isSuperAdmin,
    });
  };

  const toggleEditPermission = (key) => {
    setEditDraft((p) => ({
      ...p,
      adminPermissions: p.adminPermissions.includes(key)
        ? p.adminPermissions.filter((k) => k !== key)
        : [...p.adminPermissions, key],
    }));
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const { data } = await api.put(`/admin/admin-users/${editing._id}/permissions`, editDraft);
      const updated = data.data?.admin;
      setAdmins((prev) => prev.map((a) => (a._id === editing._id ? { ...a, ...updated, _id: editing._id } : a)));
      toast.success('Permissions updated.');
      setEditing(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update permissions.');
    }
    setSaving(false);
  };

  if (role !== 'admin') {
    return null;
  }

  if (!user) {
    return <div style={{ padding: '48px 0' }}><Spinner size="md" /></div>;
  }

  if (!isSuperAdmin) {
    return (
      <div style={{
        textAlign: 'center', padding: '56px 24px',
        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
      }}>
        <Shield size={32} color="var(--color-text-hint)" style={{ marginBottom: 12 }} />
        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', margin: '0 0 4px' }}>
          Super admin access required
        </p>
        <p style={{ fontSize: 13, color: 'var(--color-text-hint)', margin: 0 }}>
          Only super admins can manage admin staff and permissions.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Heading */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, color: 'var(--color-text)', margin: 0 }}>
            Team
          </h1>
          {!loading && (
            <span style={{ fontSize: 13, color: 'var(--color-text-hint)', background: 'var(--color-surface-alt)', padding: '2px 10px', borderRadius: 20, fontWeight: 500 }}>
              {admins.length} total
            </span>
          )}
        </div>
        <Button variant="primary" size="sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setShowCreate(true)}>
          <Plus size={14} /> New admin
        </Button>
      </div>

      {loading ? (
        <div style={{ padding: '48px 0' }}><Spinner size="md" /></div>
      ) : admins.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '56px 24px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', fontSize: 13, color: 'var(--color-text-hint)' }}>
          No admin users yet.
        </div>
      ) : (
        <>
          {/* Header row */}
          <div className="admin-table-header" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)', padding: '10px 16px', marginBottom: 8,
          }}>
            <div style={{ ...HEADER_CELL, flex: COL.name.flex }}>Admin</div>
            <div style={{ ...HEADER_CELL, flex: COL.permissions.flex }}>Permissions</div>
            <div style={{ ...HEADER_CELL, flex: COL.joined.flex }}>Joined</div>
            <div style={{ ...HEADER_CELL, flex: COL.actions.flex, textAlign: 'right' }}>Actions</div>
          </div>

          {/* Data rows */}
          {admins.map((admin) => (
            <div
              key={admin._id}
              className="admin-table-row"
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: 8,
              }}
            >
              {/* Name */}
              <div style={{ flex: COL.name.flex, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {admin.name}
                  </div>
                  {admin.isSuperAdmin && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 3,
                      fontSize: 9, fontWeight: 700, letterSpacing: '0.04em',
                      background: 'var(--color-primary)', color: '#fff',
                      padding: '2px 7px', borderRadius: 4, flexShrink: 0,
                    }}>
                      <Shield size={9} /> SUPER ADMIN
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-hint)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {admin.email}
                </div>
              </div>

              {/* Permissions */}
              <div style={{ flex: COL.permissions.flex, minWidth: 0 }}>
                {admin.isSuperAdmin ? (
                  <span style={{ fontSize: 12, color: 'var(--color-text-hint)' }}>All sections</span>
                ) : admin.adminPermissions?.length > 0 ? (
                  <span style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>
                    {admin.adminPermissions.length} section{admin.adminPermissions.length !== 1 ? 's' : ''}
                  </span>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--color-text-hint)' }}>No access granted</span>
                )}
              </div>

              {/* Joined */}
              <div style={{ flex: COL.joined.flex }}>
                <span style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>{formatDate(admin.createdAt)}</span>
              </div>

              {/* Actions */}
              <div style={{ flex: COL.actions.flex, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="secondary" size="sm" onClick={() => openEdit(admin)}>
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Create admin modal */}
      {showCreate && (
        <div
          onClick={() => setShowCreate(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-2xl)', padding: 28, maxWidth: 520, width: '100%',
              maxHeight: '85vh', overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300, color: 'var(--color-text)' }}>
                New admin
              </div>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--color-text-hint)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              <Input
                label="Full name"
                value={createForm.name}
                onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Admin name"
              />
              <Input
                label="Email"
                icon={Mail}
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="admin@intrafer.com"
              />
              <Input
                label="Phone"
                icon={Phone}
                value={createForm.phone}
                onChange={(e) => setCreateForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="10-digit number"
              />
              <Input
                label="Password"
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="Minimum 8 characters"
              />
            </div>

            <span style={CAPS_LABEL}>Permissions</span>
            <div style={{ marginBottom: 20 }}>
              <PermissionCheckboxes selected={createForm.adminPermissions} onToggle={toggleCreatePermission} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button variant="secondary" size="sm" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" loading={creating} onClick={handleCreate}>
                Create admin
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit permissions modal */}
      {editing && (
        <div
          onClick={() => setEditing(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-2xl)', padding: 28, maxWidth: 520, width: '100%',
              maxHeight: '85vh', overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300, color: 'var(--color-text)', marginBottom: 4 }}>
                  {editing.name}
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-hint)' }}>{editing.email}</div>
              </div>
              <button
                type="button"
                onClick={() => setEditing(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--color-text-hint)' }}
              >
                <X size={18} />
              </button>
            </div>

            <span style={CAPS_LABEL}>Super admin</span>
            <p style={{ fontSize: 12, color: 'var(--color-text-hint)', margin: '-6px 0 10px' }}>
              Super admins bypass individual permissions and have unrestricted access.
            </p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <button
                type="button"
                onClick={() => setEditDraft((p) => ({ ...p, isSuperAdmin: true }))}
                style={{
                  padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  background: editDraft.isSuperAdmin ? 'var(--color-primary-bg)' : 'var(--color-surface-alt)',
                  color: editDraft.isSuperAdmin ? 'var(--color-primary)' : 'var(--color-text-sub)',
                  border: editDraft.isSuperAdmin ? '1.5px solid var(--color-accent)' : '1px solid var(--color-border)',
                }}
              >
                Super admin
              </button>
              <button
                type="button"
                onClick={() => setEditDraft((p) => ({ ...p, isSuperAdmin: false }))}
                style={{
                  padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  background: !editDraft.isSuperAdmin ? 'var(--color-primary-bg)' : 'var(--color-surface-alt)',
                  color: !editDraft.isSuperAdmin ? 'var(--color-primary)' : 'var(--color-text-sub)',
                  border: !editDraft.isSuperAdmin ? '1.5px solid var(--color-accent)' : '1px solid var(--color-border)',
                }}
              >
                Standard admin
              </button>
            </div>

            {!editDraft.isSuperAdmin && (
              <>
                <span style={CAPS_LABEL}>Permissions</span>
                <div style={{ marginBottom: 20 }}>
                  <PermissionCheckboxes selected={editDraft.adminPermissions} onToggle={toggleEditPermission} />
                </div>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button variant="secondary" size="sm" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" loading={saving} onClick={handleSaveEdit}>
                Save changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
