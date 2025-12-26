import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Navigate } from "react-router-dom";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function AuthCallback() {
  const [done, setDone] = useState(false);
  const [targetPath, setTargetPath] = useState("/dashboard");

  useEffect(() => {
    (async () => {
      // 1. Process the Supabase session
      await supabase.auth.getSession();

      // 2. Check if we need to preserve Facebook connection parameters
      const params = new URLSearchParams(window.location.search);
      if (params.has('fb_connect')) {
        setTargetPath(`/profile${window.location.search}`);
      } else {
        setTargetPath("/dashboard");
      }

      setDone(true);
    })();
  }, []);

  if (!done) return <div style={{ padding: 20 }}>Signing you in...</div>;
  
  // Navigate to the smart target path instead of always /dashboard
  return <Navigate to={targetPath} replace />;
}
