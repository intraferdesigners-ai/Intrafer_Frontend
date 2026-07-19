'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';
import Spinner from '@/components/ui/Spinner';

const POLL_INTERVAL_MS = 5000;

function formatMessageTime(dateString) {
  return new Date(dateString).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

export default function MessageThread({ leadId }) {
  const { role } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [text,     setText]     = useState('');
  const [sending,  setSending]  = useState(false);

  const bottomRef  = useRef(null);
  const firstLoad  = useRef(true);

  const fetchMessages = useCallback(() => {
    api.get(`/leads/${leadId}/messages`)
      .then(({ data }) => setMessages(data.data?.messages || []))
      .catch(() => {})
      .finally(() => {
        if (firstLoad.current) {
          firstLoad.current = false;
          setLoading(false);
        }
      });
  }, [leadId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      const { data } = await api.post(`/leads/${leadId}/messages`, { text: trimmed });
      const message = data.data?.message;
      if (message) setMessages((prev) => [...prev, message]);
      setText('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message.');
    }
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        flex: 1, minHeight: 220, maxHeight: 420, overflowY: 'auto',
        padding: 16, display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {loading ? (
          <div style={{ padding: '24px 0', display: 'flex', justifyContent: 'center' }}>
            <Spinner size="sm" />
          </div>
        ) : messages.length === 0 ? (
          <p style={{
            fontSize: 13, color: 'var(--color-text-hint)', textAlign: 'center',
            margin: 'auto',
          }}>
            No messages yet. Say hello!
          </p>
        ) : (
          messages.map((m) => {
            const isOwn = m.senderRole === role;
            return (
              <div key={m._id} style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '75%', padding: '8px 12px', borderRadius: 'var(--radius-md)',
                  background: isOwn ? 'var(--color-primary)' : 'var(--color-surface-alt)',
                  color: isOwn ? '#fff' : 'var(--color-text)',
                  fontSize: 13, lineHeight: 1.5,
                }}>
                  <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{m.text}</div>
                  <div style={{
                    fontSize: 10, marginTop: 4, textAlign: 'right',
                    color: isOwn ? 'rgba(255,255,255,0.7)' : 'var(--color-text-hint)',
                  }}>
                    {formatMessageTime(m.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{
        display: 'flex', gap: 8, padding: 12,
        borderTop: '1px solid var(--color-border)',
      }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          style={{
            flex: 1, padding: '10px 12px', fontSize: 13,
            border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface-alt)', color: 'var(--color-text)',
            outline: 'none', boxSizing: 'border-box',
          }}
        />
        <button
          onClick={handleSend}
          disabled={sending || !text.trim()}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 40, height: 40, borderRadius: 'var(--radius-md)', flexShrink: 0,
            background: 'var(--color-primary)', color: '#fff', border: 'none',
            cursor: sending || !text.trim() ? 'not-allowed' : 'pointer',
            opacity: sending || !text.trim() ? 0.6 : 1,
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
