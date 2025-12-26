import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function Profile() {
  const API_BASE = import.meta.env.VITE_API_URL;

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAccounts = async () => {
    setLoading(true);
    setError('');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      setAccounts([]);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/facebook/accounts`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        setError(json.error || `Failed to load accounts (HTTP ${res.status})`);
        setAccounts([]);
      } else {
        setAccounts(json.accounts || []);
      }
    } catch {
      setError('Failed to load accounts. Network error.');
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle FB redirect + finalize
  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const tempId = params.get('fb_connect');
      const returnedState = params.get('state');
      const urlError = params.get('error');

      // Handle error cases
      if (urlError) {
        setError(`Facebook connect failed: ${urlError}`);
        window.history.replaceState({}, '', '/profile');
        await fetchAccounts();
        return;
      }

      // Validate oauth state if present
      const expectedState = sessionStorage.getItem('oauth_state');
      if (returnedState && expectedState && returnedState !== expectedState) {
        setError('OAuth state mismatch. Please try connecting again.');
        sessionStorage.removeItem('oauth_state');
        window.history.replaceState({}, '', '/profile');
        await fetchAccounts();
        return;
      }

      // If coming back from Facebook, finalize via Worker
      if (tempId) {
        setConnecting(true);
        setError('');
        setSuccess('');

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError('You must be logged in to connect accounts.');
          setConnecting(false);
          return;
        }

        try {
          const res = await fetch(`${API_BASE}/api/auth/facebook/finalize`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ temp_id: tempId }),
          });

          const json = await res.json().catch(() => ({}));
          if (!res.ok || !json.success) {
            setError(json.error || `Finalize failed (HTTP ${res.status})`);
          } else {
            setSuccess('✅ Facebook / Instagram connected successfully!');
          }
        } catch {
          setError('Finalize failed. Network error.');
        } finally {
          setConnecting(false);
          sessionStorage.removeItem('oauth_state');
          window.history.replaceState({}, '', '/profile');
          await fetchAccounts();
        }
        return;
      }

      // Normal load
      await fetchAccounts();
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFacebookLogin = () => {
    setError('');
    setSuccess('');

    const state = crypto.randomUUID();
    sessionStorage.setItem('oauth_state', state);

    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_FB_APP_ID,
      redirect_uri: `${API_BASE}/api/auth/facebook/callback`,
      scope:
        'pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_engagement,instagram_basic,instagram_content_publish,instagram_manage_messages,email',
      response_type: 'code',
      state,
      auth_type: 'rerequest',
    });

    window.location.href = `https://www.facebook.com/v24.0/dialog/oauth?${params.toString()}`;
  };

  const disconnect = async (pageId) => {
    if (!confirm('Disconnect this account?')) return;

    setError('');
    setSuccess('');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError('You must be logged in.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/facebook/disconnect/${pageId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        setError(json.error || `Disconnect failed (HTTP ${res.status})`);
      } else {
        setSuccess('✅ Disconnected.');
        await fetchAccounts();
      }
    } catch {
      setError('Disconnect failed. Network error.');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Profile</h2>

      {success && (
        <div style={{ marginTop: 10, padding: 12, borderRadius: 8, background: '#d1fae5', color: '#065f46' }}>
          {success}
        </div>
      )}

      {error && (
        <div style={{ marginTop: 10, padding: 12, borderRadius: 8, background: '#fee2e2', color: '#991b1b' }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <button
          onClick={handleFacebookLogin}
          disabled={connecting}
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            border: 'none',
            cursor: connecting ? 'not-allowed' : 'pointer',
          }}
        >
          {connecting ? 'Connecting…' : 'Connect Facebook / Instagram Business'}
        </button>
      </div>

      <div style={{ marginTop: 18 }}>
        <h3>Connected Accounts</h3>

        {loading ? (
          <p>Loading…</p>
        ) : accounts.length === 0 ? (
          <p style={{ opacity: 0.7 }}>No accounts connected yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {accounts.map((acc) => (
              <div key={acc.id} style={{ padding: 12, borderRadius: 10, background: '#f8fafc' }}>
                <div style={{ fontWeight: 700 }}>{acc.name}</div>
                <div style={{ opacity: 0.7, fontSize: 13 }}>
                  {acc.instagram_username ? `@${acc.instagram_username} (Instagram Business)` : `Facebook Page • ${acc.category || '—'}`}
                </div>

                <div style={{ marginTop: 10 }}>
                  <button
                    onClick={() => disconnect(acc.facebook_page_id)}
                    style={{ padding: '8px 12px', borderRadius: 10, border: 'none', cursor: 'pointer' }}
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
