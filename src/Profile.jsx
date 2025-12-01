// src/components/Profile.jsx
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Instagram, Facebook, AlertCircle, LogOut, Loader2 } from "lucide-react";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function waitForSession(maxRetries = 6, interval = 300) {
  // poll supabase session until it exists or we exhaust retries
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await supabase.auth.getSession();
      const session = result?.data?.session;
      if (session) return session;
    } catch (e) {
      // ignore and retry
    }
    await sleep(interval);
  }
  return null;
}

function stripHashFromUrl() {
  // remove weird facebook hash "#_=_"
  if (window.location.hash && window.location.hash.includes('_=_')) {
    const newUrl = window.location.href.split('#')[0];
    window.history.replaceState({}, document.title, newUrl);
  }
}

function Profile() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const backendBase = import.meta.env.VITE_API_URL.replace(/\/+$/, '');

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAccounts([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('connected_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) {
        console.error('Supabase fetch connected_accounts error', error);
        setError('Failed to load connected accounts');
      } else {
        setAccounts(data || []);
      }
    } catch (err) {
      console.error('fetchAccounts unexpected error', err);
      setError('Failed to load connected accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // remove hash left by FB
    stripHashFromUrl();

    const handleFacebookCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const tempId = params.get('fb_connect');
      const urlError = params.get('error');

      if (urlError) {
        setError('Facebook login was cancelled or failed.');
        window.history.replaceState({}, '', '/profile');
        setLoading(false);
        return;
      }

      if (!tempId) {
        // no callback to finalize, just load accounts
        await fetchAccounts();
        return;
      }

      setConnecting(true);
      setError('');
      setSuccess('');

      try {
        // Wait (with retries) for supabase session to be available
        const session = await waitForSession(8, 300);
        if (!session) {
          setError('You must be logged in to connect accounts (no session).');
          setConnecting(false);
          // keep the fb_connect param in URL for debugging; after user relogs they can revisit
          return;
        }

        // Construct finalize URL and options
        const url = `${backendBase}/api/auth/facebook/finalize`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(url, {
          method: 'POST',
          mode: 'cors',               // explicit CORS mode
          // credentials: 'include',  // not required if you're using Authorization header, uncomment if you rely on cookies
          signal: controller.signal,
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ temp_id: tempId }),
        }).catch((err) => {
          // fetch threw (network, CORS preflight blocked, or aborted)
          clearTimeout(timeout);
          throw err;
        });

        clearTimeout(timeout);

        // helpful debug logs — inspect Network tab or console for status and body
        const text = await res.text().catch(() => null);
        try {
          // attempt to parse JSON, fallback to raw text
          const json = text ? JSON.parse(text) : null;
          console.debug('Finalize response', { status: res.status, json, raw: text });
          if (res.ok && json && json.success) {
            setSuccess('Facebook & Instagram accounts connected successfully!');
            // refresh accounts
            await fetchAccounts();
          } else {
            const serverError = (json && json.error) || text || `HTTP ${res.status}`;
            console.error('Finalize failed', serverError);
            setError(serverError || 'Failed to connect accounts.');
          }
        } catch (parseErr) {
          console.error('Failed to parse finalize response', parseErr, text);
          setError('Unexpected response from server when finalizing connection.');
        }
      } catch (err) {
        console.error('Finalize request error', err);
        if (err.name === 'AbortError') {
          setError('Finalize request timed out. Check network/CORS or try again.');
        } else if (err instanceof TypeError && err.message === 'Failed to fetch') {
          // often a CORS or network error
          setError('Network or CORS error while contacting backend. Check console & network tab.');
        } else {
          setError('Connection failed. Please try again.');
        }
      } finally {
        setConnecting(false);
        // navigate to cleaner URL (remove fb_connect param) but keep page
        window.history.replaceState({}, '', '/profile');
      }
    };

    handleFacebookCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // Open FB dialog using worker callback
  const handleFacebookLogin = () => {
    const state = crypto.randomUUID();
    sessionStorage.setItem('oauth_state', state);

    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_FB_APP_ID,
      redirect_uri: `${backendBase}/api/auth/facebook/callback`,
      scope: 'pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_engagement,instagram_basic,instagram_content_publish,instagram_manage_messages,email',
      response_type: 'code',
      state,
      auth_type: 'rerequest'
    });

    window.location.href = `https://www.facebook.com/v24.0/dialog/oauth?${params}`;
  };

  const disconnect = async (pageId) => {
    if (!confirm("Disconnect this account? All scheduled posts will stop.")) return;

    setError('');
    const session = (await supabase.auth.getSession())?.data?.session;
    if (!session) {
      setError('You must be logged in to disconnect accounts.');
      return;
    }

    try {
      const res = await fetch(
        `${backendBase}/api/auth/facebook/disconnect/${pageId}`,
        {
          method: 'DELETE',
          mode: 'cors',
          headers: { 'Authorization': `Bearer ${session.access_token}` },
        }
      );

      if (res.ok) {
        setSuccess('Account disconnected.');
        fetchAccounts();
      } else {
        const text = await res.text().catch(() => null);
        console.error('Disconnect failed', res.status, text);
        setError('Failed to disconnect account.');
      }
    } catch (err) {
      console.error('Disconnect error', err);
      setError('Network error. Try again.');
    }
  };

  return (
    <div className="tab-content active" id="profile">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar-large">S</div>
          <div className="profile-info">
            <h2>Scarlett Johnson</h2>
            <div className="profile-username">@scarlett_j</div>
            <p className="profile-bio">Social Media Manager • Growing brands with automation</p>
          </div>
        </div>

        <div className="profile-sections">
          <div className="profile-section">
            <h3>Connected Facebook & Instagram Accounts</h3>

            {success && (
              <div style={{
                padding: '1rem',
                background: '#d1fae5',
                color: '#065f46',
                borderRadius: '8px',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {success}
              </div>
            )}

            {error && (
              <div style={{
                padding: '1rem',
                background: '#fee2e2',
                color: '#991b1b',
                borderRadius: '8px',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <button
              onClick={handleFacebookLogin}
              disabled={connecting}
              className="btn btn-primary"
              style={{
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: connecting ? 0.7 : 1
              }}
            >
              {connecting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Facebook size={20} />
                  Connect Facebook / Instagram Business
                </>
              )}
            </button>

            {loading ? (
              <p><Loader2 size={18} className="animate-spin inline" /> Loading accounts...</p>
            ) : accounts.length === 0 ? (
              <p style={{ color: '#64748b', fontStyle: 'italic' }}>
                No accounts connected yet. Click the button above to connect your Facebook Pages and Instagram Business accounts.
              </p>
            ) : (
              <div className="social-accounts">
                {accounts.map(acc => (
                  <div
                    key={acc.id}
                    className="social-account"
                    style={{
                      padding: '1rem',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      marginBottom: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                      {acc.picture ? (
                        <img
                          src={acc.picture}
                          alt={acc.name}
                          width={48}
                          height={48}
                          style={{ borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : acc.instagram_username ? (
                        <Instagram size={48} color="#E4405F" />
                      ) : (
                        <Facebook size={48} color="#1877F2" />
                      )}
                      <div>
                        <strong>{acc.name}</strong><br />
                        <small style={{ color: '#64748b' }}>
                          {acc.instagram_username ? (
                            <>@{acc.instagram_username} (Instagram Business)</>
                          ) : (
                            <>Facebook Page • {acc.category || 'Uncategorized'}</>
                          )}
                        </small>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="status connected">Active</span>
                      <button
                        onClick={() => disconnect(acc.facebook_page_id)}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                      >
                        <LogOut size={14} /> Disconnect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="profile-actions">
          <button className="btn btn-primary">Save Profile</button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
