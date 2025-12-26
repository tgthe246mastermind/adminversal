import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

import Dashboard from './Dashboard.jsx';
import Login from './Login.jsx';
import Signup from './Signup.jsx';
import Profile from './Profile.jsx';
import AuthCallback from './AuthCallback.jsx';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function App() {
  const [session, setSession] = useState(null);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription;
  }, []);

  return (
    <Routes>
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      {/* AUTH PROTECTED ROUTES */}
      <Route path="/signup" element={!session ? <Signup /> : <Navigate to="/dashboard" />} />
      <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/profile" element={session ? <Profile /> : <Navigate to="/login" />} />

      {/* ⚠️ THE FIX: Smart Redirect for Root Path ⚠️ */}
      <Route
        path="/"
        element={
          session ? (
            // If the URL has fb_connect, preserve the search params and go to profile
            window.location.search.includes('fb_connect') 
              ? <Navigate to={`/profile${window.location.search}`} replace /> 
              : <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Catch-all: Ensure we don't drop params on invalid routes */}
      <Route 
        path="*" 
        element={
          session ? (
            window.location.search.includes('fb_connect') 
              ? <Navigate to={`/profile${window.location.search}`} replace /> 
              : <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
    </Routes>
  );
}

export default App;
