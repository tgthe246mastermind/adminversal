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
  const [error, setError] = useState('');

  const fetchAccounts = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const res = await fetch(`${API_BASE}/api/auth/facebook/accounts`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setAccounts(json.accounts || []);
    } catch (err) {
      setError(`Load Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const tempId = params.get('fb_connect');

      if (tempId) {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setError("Session expired. Please log in.");
          return;
        }

        try {
          const res = await fetch(`${API_BASE}/api/auth/facebook/finalize`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ temp_id: tempId })
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || "Finalize failed");
          
          window.history.replaceState({}, '', '/profile');
          await fetchAccounts();
        } catch (err) {
          setError(`Finalize Failed: ${err.message}`);
          setLoading(false);
        }
        return;
      }
      await fetchAccounts();
    };
    run();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Facebook Connection</h2>
      {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: 12, borderRadius: 8, marginBottom: 15 }}>{error}</div>}
      <button onClick={() => {
        const params = new URLSearchParams({
          client_id: import.meta.env.VITE_FB_APP_ID,
          redirect_uri: `${API_BASE}/api/auth/facebook/callback`,
          scope: 'pages_show_list,instagram_basic,email',
          response_type: 'code'
        });
        window.location.href = `https://www.facebook.com/v24.0/dialog/oauth?${params.toString()}`;
      }}>Connect Facebook</button>

      <div style={{ marginTop: 20 }}>
        {loading ? <p>Processing...</p> : accounts.map(a => <div key={a.id}>{a.name}</div>)}
      </div>
    </div>
  );
}

export default Profile;
