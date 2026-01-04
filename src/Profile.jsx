import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function Profile() {
  const API_BASE = import.meta.env.VITE_API_URL;
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAccounts = async () => {
    setLoading(true);
    setError("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      console.error("Profile: No session found during fetchAccounts");
      setLoading(false);
      return;
    }

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
    const init = async () => {
      const params = new URLSearchParams(window.location.search);
      const tempId = params.get("fb_connect");
      const urlError = params.get("error");

      console.log("Profile URL Check:", { tempId, urlError });

      if (urlError) {
        setError(`Worker Error: ${urlError}`);
        setLoading(false);
        return;
      }

      if (tempId) {
        setLoading(true);
        console.log("Finalizing connection for ID:", tempId);

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setError("Auth Error: You were logged out during redirect.");
          setLoading(false);
          return;
        }

        try {
          const res = await fetch(`${API_BASE}/api/auth/facebook/finalize`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ temp_id: tempId }),
          });

          const json = await res.json();
          if (!res.ok) throw new Error(json.error || "Finalize failed");

          console.log("Finalize Success!");
          window.history.replaceState({}, "", "/profile");
          await fetchAccounts();
        } catch (err) {
          setError(`Finalize Error: ${err.message}`);
          setLoading(false);
        }
        return;
      }

      await fetchAccounts();
    };

    init();
  }, []);

  const handleLogin = () => {
    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_FB_APP_ID,
      redirect_uri: `${API_BASE}/api/auth/facebook/callback`,
      // Added 'business_management' to fix the (#100) permission error in logs
      scope: "pages_show_list,instagram_basic,email,business_management",
      response_type: "code",
    });

    window.location.href = `https://www.facebook.com/v24.0/dialog/oauth?${params.toString()}`;
  };

  // Helper to support either:
  // a.picture = "https://..."
  // or Facebook-style: a.picture.data.url = "https://..."
  const getPictureUrl = (a) => {
    if (!a) return "";
    if (typeof a.picture === "string") return a.picture;
    return a.picture?.data?.url || "";
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Facebook Profile</h2>

      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: 10,
            marginBottom: 10,
            borderRadius: 10,
          }}
        >
          {error}
        </div>
      )}

      <button onClick={handleLogin}>Connect Facebook</button>

      <div style={{ marginTop: 20 }}>
        {loading && <p>Processing...</p>}

        {!loading && accounts.length === 0 && !error && (
          <p style={{ opacity: 0.75 }}>No connected accounts yet.</p>
        )}

        {!loading &&
          accounts.map((a) => (
            <div
              key={a.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 12,
                borderRadius: 12,
                background: "#f5f3ff",
                marginBottom: 10,
              }}
            >
              {/* 2. Place connect_accounts.picture where the purple profile picture is */}
              <img
                src={getPictureUrl(a)}
                alt={a.name || "Connected Account"}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  objectFit: "cover",
                  background: "#7c3aed", // purple fallback
                }}
                onError={(e) => {
                  // if image fails, keep purple background and hide broken image icon
                  e.currentTarget.src = "";
                }}
              />

              {/* 1. Place connect_accounts.name where Scarlett is */}
              <div style={{ fontWeight: 600 }}>{a.name || "Unnamed"}</div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Profile;
