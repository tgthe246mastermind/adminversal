import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Navigate, useLocation } from "react-router-dom";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function AuthCallback() {
  const [done, setDone] = useState(false);
  const [target, setTarget] = useState("/dashboard");
  const location = useLocation();

  useEffect(() => {
    (async () => {
      // Allow Supabase to finish its session handling
      await supabase.auth.getSession();

      // Check if we are in the middle of a Facebook connection
      const params = new URLSearchParams(location.search);
      if (params.has('fb_connect')) {
        // Redirect to Profile with the parameters intact
        setTarget(`/profile${location.search}`);
      } else {
        setTarget("/dashboard");
      }
      
      setDone(true);
    })();
  }, [location]);

  if (!done) return <div style={{ padding: 20 }}>Syncing session...</div>;

  return <Navigate to={target} replace />;
}
