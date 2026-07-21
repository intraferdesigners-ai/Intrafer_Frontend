'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQ_ITEMS = [
  {
    q: 'Is Intrafer actually free to use?',
    a: 'Yes. Browsing designers, viewing portfolios, and submitting enquiries all cost nothing. Designers pay Intrafer a subscription to be listed — homeowners never do.',
  },
  {
    q: "How are designers verified before they're listed?",
    a: 'Every designer submits their business details and portfolio for review before approval, and each new portfolio project is individually checked before it goes live — so what you see is real, completed work.',
  },
  {
    q: 'What happens after I submit an enquiry?',
    a: "You'll verify your number with a one-time code, then the designer has 48 hours to respond. If they don't, your enquiry is automatically reassigned to someone who will.",
  },
  {
    q: 'Can I get proposals from more than one designer?',
    a: "Yes — enquire with as many designers as you'd like, and use Compare to view a few side by side before deciding.",
  },
  {
    q: "What if I don't like any of the proposals?",
    a: "There's no obligation to proceed with any designer you contact. Keep browsing and enquiring at no cost until you find the right fit.",
  },
  {
    q: 'Does Intrafer handle payments or contracts?',
    a: 'No. Intrafer connects you with the designer — pricing, contracts, and the work itself are agreed directly between you and them.',
  },
];

export default function HomepageFAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '760px' }}>
      {FAQ_ITEMS.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={item.q}
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-xl)', overflow: 'hidden',
            }}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: '16px', padding: '18px 22px', background: 'none', border: 'none',
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text)' }}>{item.q}</span>
              <ChevronDown
                size={18}
                color="var(--text-hint)"
                style={{
                  flexShrink: 0,
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 200ms ease-out',
                }}
              />
            </button>
            {isOpen && (
              <div style={{ padding: '0 22px 20px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-mid)', lineHeight: 1.7, margin: 0 }}>
                  {item.a}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
