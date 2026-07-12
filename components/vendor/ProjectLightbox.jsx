'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function ProjectLightbox({ project, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!project) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,.82)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: '20px', right: '20px',
          background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)',
          borderRadius: '50%', width: '40px', height: '40px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#fff',
          backdropFilter: 'blur(8px)',
        }}
      >
        <X size={18} />
      </button>

      {/* Image + info */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '900px', width: '100%' }}
      >
        {project.images?.[0] && (
          <img
            src={project.images[0]}
            alt={project.title}
            style={{
              width: '100%', maxHeight: '70vh',
              objectFit: 'contain', borderRadius: '12px',
              display: 'block',
            }}
          />
        )}

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
            {project.projectType && (
              <span style={{
                fontSize: '11px', fontWeight: 600, letterSpacing: '.06em',
                background: 'rgba(181,84,30,.2)', color: '#f4a66a',
                padding: '4px 12px', borderRadius: '20px',
              }}>
                {project.projectType.toUpperCase()}
              </span>
            )}
            {project.completedYear && (
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,.5)' }}>
                {project.completedYear}
              </span>
            )}
            {project.location && (
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,.5)' }}>
                · {project.location}
              </span>
            )}
          </div>
          <h2 style={{
            fontSize: '20px', fontWeight: 400, color: '#fff',
            letterSpacing: '-.01em', marginBottom: '10px',
          }}>
            {project.title}
          </h2>
          {project.description && (
            <p style={{
              fontSize: '14px', color: 'rgba(255,255,255,.65)',
              lineHeight: 1.7, maxWidth: '680px', margin: '0 auto',
            }}>
              {project.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
