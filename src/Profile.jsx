import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
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

  // 1. Fetch Connected Accounts with explicit session check
  const fetchAccounts = async () => {
    setLoading(true);
    setError('');

    // Ensure session is fresh to avoid 401s
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.warn("fetchAccounts: No active session found.");
      setLoading(false);
      setAccounts([]);
      return;
        console.error("Profile: No session found during fetchAccounts");
        setLoading(false);
        return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/facebook/accounts`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      const json = await res.json().catch(() => ({}));
      
      if (res.status === 401) {
        setError('Unauthorized (401): Please log out and back in to refresh your session.');
        setAccounts([]);
      } else if (!res.ok || !json.success) {
        setError(json.error || `Failed to load accounts (HTTP ${res.status})`);
        setAccounts([]);
      } else {
        setAccounts(json.accounts || []);
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setAccounts(json.accounts || []);
    } catch (err) {
      console.error("fetchAccounts Error:", err);
      setError('Failed to load accounts. Network error.');
      setAccounts([]);
      setError(`Load Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle FB redirect + finalize
  useEffect(() => {
    const run = async () => {
    const init = async () => {
      const params = new URLSearchParams(window.location.search);
      const tempId = params.get('fb_connect');
      const returnedState = params.get('state');
      const urlError = params.get('error');

      // --- DIAGNOSTIC LOGS ---
      console.log("Profile.jsx: URL Parameters detected:", {
        fb_connect: tempId,
        state: returnedState,
        error: urlError
      });
      console.log("Profile URL Check:", { tempId, urlError });

      // Handle explicit error cases from the Worker
      if (urlError) {
        setError(`Facebook connect failed: ${urlError}`);
        window.history.replaceState({}, '', '/profile');
        await fetchAccounts();
        return;
      }

      // Validate oauth state if present
      const expectedState = sessionStorage.getItem('oauth_state');
      if (returnedState && expectedState && returnedState !== expectedState) {
        console.error("State Mismatch!", { expected: expectedState, received: returnedState });
        setError('Security check failed: OAuth state mismatch. Please try connecting again.');
        sessionStorage.removeItem('oauth_state');
        window.history.replaceState({}, '', '/profile');
        await fetchAccounts();
        setError(`Worker Error: ${urlError}`);
        return;
      }

      // If coming back from Facebook successfully, finalize via Worker
      if (tempId) {
        console.log("Starting Finalize process for temp_id:", tempId);
        setConnecting(true);
        setError('');
        setSuccess('');

        // Crucial: Wait for Supabase to confirm the session after the redirect
        setLoading(true);
        console.log("Finalizing connection for ID:", tempId);
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          setError('Authentication lost during redirect. Please log in again.');
          setConnecting(false);
          setError("Auth Error: You were logged out during redirect.");
          setLoading(false);
          return;
        }

        try {
          const res = await fetch(`${API_BASE}/api/auth/facebook/finalize`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ temp_id: tempId }),
            body: JSON.stringify({ temp_id: tempId })
          });

          const json = await res.json().catch(() => ({}));
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || "Finalize failed");

          if (!res.ok || !json.success) {
            setError(json.error || `Finalize failed (HTTP ${res.status})`);
          } else {
            setSuccess('✅ Facebook / Instagram connected successfully!');
          }
        } catch (err) {
          console.error("Finalize Fetch Error:", err);
          setError('Finalize failed. Connection error.');
        } finally {
          setConnecting(false);
          sessionStorage.removeItem('oauth_state');
          // Clean the URL
          console.log("Finalize Success!");
          window.history.replaceState({}, '', '/profile');
          await fetchAccounts();
        } catch (err) {
          setError(`Finalize Error: ${err.message}`);
          setLoading(false);
        }
        return;
      }

      // Normal load if not coming back from a connect redirect
      await fetchAccounts();
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    init();
  }, []);

  const handleFacebookLogin = () => {
    setError('');
    setSuccess('');

    const state = crypto.randomUUID();
    sessionStorage.setItem('oauth_state', state);

  const handleLogin = () => {
    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_FB_APP_ID,
      redirect_uri: `${API_BASE}/api/auth/facebook/callback`,
      scope: 'pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_engagement,instagram_basic,instagram_content_publish,instagram_manage_messages,email',
      response_type: 'code',
      state,
      auth_type: 'rerequest',
      scope: 'pages_show_list,instagram_basic,email',
      response_type: 'code'
    });

    window.location.href = `https://www.facebook.com/v24.0/dialog/oauth?${params.toString()}`;
  };

  const disconnect = async (pageId) => {
    if (!confirm('Disconnect this account?')) return;

    setError('');
    setSuccess('');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError('Session expired. Please log in.');
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
            backgroundColor: connecting ? '#cbd5e1' : '#667eea',
            color: 'white',
            fontWeight: '600'
          }}
        >
          {connecting ? 'Processing Connection…' : 'Connect Facebook / Instagram Business'}
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
              <div key={acc.id} style={{ padding: 12, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700 }}>{acc.name}</div>
                <div style={{ opacity: 0.7, fontSize: 13 }}>
                  {acc.instagram_username ? `@${acc.instagram_username} (Instagram Business)` : `Facebook Page • ${acc.category || '—'}`}
                </div>

                <div style={{ marginTop: 10 }}>
                  <button
                    onClick={() => disconnect(acc.facebook_page_id)}
                    style={{ padding: '8px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', backgroundColor: '#ef4444', color: 'white' }}
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      <h2>Facebook Profile</h2>
      {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: 10, marginBottom: 10 }}>{error}</div>}
      <button onClick={handleLogin}>Connect Facebook</button>
      <div style={{ marginTop: 20 }}>
        {loading ? <p>Processing...</p> : accounts.map(a => <div key={a.id}>{a.name}</div>)}
      </div>
    </div>
  );
