'use client';

import Link from 'next/link';
import { Building2, MapPin, Calendar } from 'lucide-react';

export default function ProjectsSection({ projects }) {
  if (projects.length === 0) {
    return (
      <p style={{ fontSize: 14, color: 'var(--color-text-hint)', fontStyle: 'italic', margin: 0 }}>
        No portfolio projects yet.
      </p>
    );
  }

  return (
    <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
      {projects.map((project) => (
        <Link
          key={project._id || project.id}
          href={`/projects/${project._id}`}
          style={{ display: 'block', textDecoration: 'none' }}
        >
          <div
            style={{
              aspectRatio: '4/3', overflow: 'hidden',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--color-surface-alt)',
              position: 'relative',
              transition: 'transform 150ms ease-out',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {project.images?.[0] ? (
              <img
                src={project.images[0]}
                alt={project.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={24} color="var(--color-text-hint)" />
              </div>
            )}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,.45) 0%, transparent 55%)',
            }} />
            {/* Hover overlay */}
            <div
              style={{
                position: 'absolute', inset: 0,
                background: 'rgba(15,23,42,.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0, transition: 'opacity 200ms',
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
            >
              <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>View project →</span>
            </div>
          </div>

          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', margin: '8px 0 4px' }}>
            {project.title}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {project.projectType && (
              <span style={{
                fontSize: 10, padding: '2px 8px', borderRadius: 20,
                background: 'var(--color-surface-alt)', color: 'var(--color-text-sub)',
                letterSpacing: '0.02em', fontWeight: 500,
              }}>
                {project.projectType}
              </span>
            )}
            {project.location && (
              <span style={{ fontSize: 11, color: 'var(--color-text-hint)', display: 'flex', alignItems: 'center', gap: 2 }}>
                <MapPin size={9} /> {project.location}
              </span>
            )}
            {project.completedYear && (
              <span style={{ fontSize: 11, color: 'var(--color-text-hint)', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Calendar size={9} /> {project.completedYear}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
