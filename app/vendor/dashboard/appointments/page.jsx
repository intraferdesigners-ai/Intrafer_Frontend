'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, User, Wrench } from 'lucide-react';
import api from '../../../../lib/api';
import Spinner from '../../../../components/ui/Spinner';

const CONTACT_REVEALED_STATUSES = ['accepted', 'contacted', 'quotation_sent', 'won', 'lost'];

function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

export default function VendorAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading,       setLoading]     = useState(true);

  useEffect(() => {
    api.get('/leads/vendor')
      .then(({ data }) => {
        const d = data.data;
        const leads = Array.isArray(d) ? d : d.leads || [];
        const now = Date.now();
        const upcoming = leads
          .filter((lead) =>
            lead.isConsultation &&
            lead.confirmedDateTime &&
            new Date(lead.confirmedDateTime).getTime() >= now
          )
          .sort((a, b) => new Date(a.confirmedDateTime) - new Date(b.confirmedDateTime));
        setAppointments(upcoming);
      })
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300,
        color: 'var(--color-text)', margin: '0 0 28px',
      }}>
        Upcoming appointments
      </h1>

      {loading ? (
        <div style={{ padding: '48px 0' }}><Spinner size="md" /></div>
      ) : appointments.length === 0 ? (
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)', padding: '48px 24px', textAlign: 'center',
          fontSize: 13, color: 'var(--color-text-hint)',
        }}>
          No upcoming appointments.
        </div>
      ) : (
        appointments.map((lead) => {
          const contactRevealed = CONTACT_REVEALED_STATUSES.includes(lead.status);
          return (
            <Link key={lead._id} href={`/vendor/dashboard/leads/${lead._id}`} style={{ textDecoration: 'none' }}>
              <div
                className="lead-row"
                style={{
                  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)', padding: 20, marginBottom: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 16, flexWrap: 'wrap',
                  transition: 'border-color 150ms ease-out',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 'var(--radius-md)',
                    background: 'var(--color-primary-bg)', color: 'var(--color-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Calendar size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>
                      {formatDateTime(lead.confirmedDateTime)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-text-sub)' }}>
                        <User size={12} /> {contactRevealed ? (lead.userId?.name || 'Unknown') : 'Client'}
                      </span>
                      {lead.projectType && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-text-sub)' }}>
                          <Wrench size={12} /> {lead.projectType}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-primary)' }}>
                  View details →
                </span>
              </div>
            </Link>
          );
        })
      )}
    </div>
  );
}
