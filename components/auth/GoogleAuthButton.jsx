'use client';

import { useEffect, useRef, useState } from 'react';
import api from '../../lib/api';

// Same on-demand <script> tag + Promise pattern as loadRazorpay() in
// app/vendor/dashboard/subscription/page.jsx, applied to Google Identity
// Services' client script instead.
function loadGoogleScript() {
  return new Promise((resolve) => {
    if (window.google?.accounts?.id) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const disabledButtonStyle = {
  width: '100%', padding: '10px 16px',
  background: 'var(--bg-parchment)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--r-md)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
  fontSize: '13px', fontWeight: 500, color: 'var(--text-sub)',
  cursor: 'not-allowed', opacity: 0.6,
};

const googleMarkStyle = {
  width: '18px', height: '18px', borderRadius: '50%',
  background: 'linear-gradient(135deg, #4285F4 25%, #34A853 50%, #FBBC05 75%, #EA4335 100%)',
  display: 'inline-block', flexShrink: 0,
};

// Renders Google's own "Continue with Google" button (Google Identity
// Services' ID-token flow) and posts the resulting signed credential to
// POST /api/auth/google. `intent` ('signup' | 'login') picks the branch
// server-side (auth.controller.js's googleAuth()) — it's a UX hint, not a
// security boundary, so this component stays identical between the login
// and register pages beyond that one prop.
//
// onSuccess({ accessToken, user, isNewUser }) — credential accepted.
// onNoAccount() — login-page case: no account exists for this email; the
// backend deliberately does not auto-create one (see the Google OAuth
// Enablement plan, §03), so the caller shows a "sign up instead" state.
// onError(message) — anything else (invalid/expired credential, admin
// lockdown, rate limit, etc).
export default function GoogleAuthButton({ intent, onSuccess, onNoAccount, onError }) {
  const buttonRef = useRef(null);
  const [ready, setReady] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;

    const handleCredential = async (response) => {
      try {
        const { data } = await api.post('/auth/google', { credential: response.credential, intent });
        onSuccess(data.data);
      } catch (err) {
        if (err.response?.status === 404 && err.response?.data?.errors?.code === 'NO_ACCOUNT') {
          onNoAccount?.();
        } else {
          onError?.(err.response?.data?.message || 'Google sign-in failed. Please try again.');
        }
      }
    };

    loadGoogleScript().then((loaded) => {
      if (!loaded || cancelled || !window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredential,
      });
      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          width: 320,
          text: intent === 'signup' ? 'signup_with' : 'signin_with',
        });
      }
      setReady(true);
    });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, intent]);

  // No client ID configured yet — same visibly-dead placeholder the login
  // page always had, rather than hiding the row or throwing at runtime.
  if (!clientId) {
    return (
      <button type="button" disabled style={disabledButtonStyle}>
        <span style={googleMarkStyle} />
        Continue with Google
      </button>
    );
  }

  return <div ref={buttonRef} style={{ display: 'flex', justifyContent: 'center', minHeight: 40, opacity: ready ? 1 : 0 }} />;
}
