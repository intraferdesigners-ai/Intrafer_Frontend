'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

// Delete confirmation, shared by the list and the editor. `page` is the
// landing page to delete (null = closed); needs _id, city, state and,
// for the URL line, category.slug + stateSlug/citySlug.
export default function DeleteLandingPageModal({ page, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/admin/landing-pages/${page._id}`);
      toast.success('Landing page deleted.');
      onDeleted();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete landing page.');
    }
    setDeleting(false);
  };

  const path = page?.category?.slug ? `/${page.category.slug}/${page.stateSlug}/${page.citySlug}/` : null;

  return (
    <Modal isOpen={Boolean(page)} onClose={deleting ? () => {} : onClose} title="Delete landing page?" size="sm">
      {page && (
        <>
          <p style={{ fontSize: 13, color: 'var(--color-text-sub)', lineHeight: 1.7, margin: '0 0 8px' }}>
            This permanently deletes the landing page for <strong>{page.city}, {page.state}</strong>.
          </p>
          <p style={{ fontSize: 13, color: 'var(--color-text-sub)', lineHeight: 1.7, margin: '0 0 20px' }}>
            {path ? <code style={{ fontSize: 12 }}>{path}</code> : 'Its URL'} will fall back to the automatic
            page (or a 404 if the city isn&apos;t in place data).
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button variant="secondary" size="sm" onClick={onClose} disabled={deleting}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleDelete} loading={deleting}>Delete</Button>
          </div>
        </>
      )}
    </Modal>
  );
}
