import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

import Dashboard from './Dashboard.jsx';
import Login from './Login.jsx';
import Profile from './Profile.jsx';

// Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function App() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  // Load existing session on startup
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for login / logout changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription;
  }, []);

  return (
    <Routes>
      {/* LOGIN */}
      <Route
        path="/login"
        element={!session ? <Login /> : <Navigate to="/dashboard" />}
      />

      {/* DASHBOARD */}
      <Route
        path="/dashboard"
        element={session ? <Dashboard /> : <Navigate to="/login" />}
      />

      {/* PROFILE (Facebook OAuth returns here) */}
      <Route
        path="/profile"
        element={session ? <Profile /> : <Navigate to="/login" />}
      />

      {/* DEFAULT ROOT */}
      <Route
        path="/"
        element={<Navigate to={session ? "/dashboard" : "/login"} />}
      />
    </Routes>
  );
}

export default App;
