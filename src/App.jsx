import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

import Dashboard from './Dashboard.jsx';
import Login from './Login.jsx';
import Signup from './Signup.jsx';
import Profile from './Profile.jsx';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function App() {
  const [session, setSession] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitializing(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription;
  }, []);

  if (initializing) return <div style={{ padding: 20 }}>Initializing App...</div>;

  return (
    <Routes>
      {/* NO REDIRECTS: This forces the app to render whatever the URL says.
        If the Worker sends you to /profile?fb_connect=..., you WILL land there.
      */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      
      {/* Basic Root */}
      <Route path="/" element={session ? <Dashboard /> : <Login />} />
    </Routes>
  );
}

export default App;
