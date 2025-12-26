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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/facebook/accounts`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) setAccounts(json.accounts || []);
    } catch (e) {
      setError('Failed to load accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const tempId = params.get('fb_connect');
      const returnedState = params.get('state');

      // Finalize Connection Logic
      if (tempId) {
        setConnecting(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setError('Authentication lost. Please log in again.');
          setConnecting(false);
          return;
        }

        try {
          const res = await fetch(`${API_BASE}/api/auth/facebook/finalize`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ temp_id: tempId }),
          });

          const json = await res.json().catch(() => ({}));
          if (res.ok && json.success) {
            setSuccess('✅ Connected successfully!');
          } else {
            setError(json.error || 'Connection failed.');
          }
        } catch (e) {
          setError('Finalize failed due to network error.');
        } finally {
          setConnecting(false);
          window.history.replaceState({}, '', '/profile');
          await fetchAccounts();
        }
        return;
      }
      await fetchAccounts();
    };
    run();
  }, []);

  const handleFacebookLogin = () => {
    const state = crypto.randomUUID();
    sessionStorage.setItem('oauth_state', state);
    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_FB_APP_ID,
      redirect_uri: `${API_BASE}/api/auth/facebook/callback`,
      scope: 'pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,email',
      response_type: 'code',
      state,
    });
    window.location.href = `https://www.facebook.com/v24.0/dialog/oauth?${params.toString()}`;
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Profile</h2>
      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: 10 }}>{success}</div>}
      <button onClick={handleFacebookLogin} disabled={connecting}>
        {connecting ? 'Connecting...' : 'Connect Facebook / Instagram'}
      </button>

      <div style={{ marginTop: 20 }}>
        <h3>Connected Accounts</h3>
        {loading ? <p>Loading...</p> : accounts.map(acc => (
          <div key={acc.id} style={{ border: '1px solid #ccc', padding: 10, margin: '5px 0' }}>
            <strong>{acc.name}</strong> {acc.instagram_username && `(@${acc.instagram_username})`}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Profile;
