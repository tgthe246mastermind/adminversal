import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Navigate } from "react-router-dom";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function AuthCallback() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      // This reads the URL hash tokens and stores session in localStorage automatically
      const { data, error } = await supabase.auth.getSession();

      // If tokens exist in the hash, Supabase will persist them.
      // We just move the user to dashboard.
      setDone(true);
    })();
  }, []);

  if (!done) return <div style={{ padding: 20 }}>Signing you in...</div>;
  return <Navigate to="/dashboard" replace />;
}
