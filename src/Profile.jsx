import React, { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";

function Profile() {
  const API_BASE = import.meta.env.VITE_API_URL;
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function safeJson(res) {
    const text = await res.text();
    try {
      return { json: JSON.parse(text), text };
    } catch {
      return { json: null, text };
    }
  }

  const fetchAccounts = async () => {
    setLoading(true);
    setError("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/facebook/accounts`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      const { json, text } = await safeJson(res);

      if (!res.ok) {
        throw new Error(json?.details || json?.error || `HTTP ${res.status}: ${text.slice(0, 140)}`);
      }

      setAccounts(json?.accounts || []);
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

      if (urlError) {
        setError(`Worker Error: ${urlError}`);
        setLoading(false);
        return;
      }

      if (tempId) {
        setLoading(true);

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

          const { json, text } = await safeJson(res);

          if (!res.ok) {
            throw new Error(json?.details || json?.error || `HTTP ${res.status}: ${text.slice(0, 140)}`);
          }

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
    // Prefer the Worker login endpoint (keeps scopes centralized)
    window.location.href = `${API_BASE}/api/auth/facebook/login`;
  };

  const getPictureUrl = (a) => {
    if (!a) return "";
    if (typeof a.picture === "string") return a.picture;
    return a.picture?.data?.url || "";
  };

  const primary = accounts?.[0] || null;
  const name = primary?.name || "Scarlett";
  const picture = getPictureUrl(primary);
  const initial = (name || "S").trim().charAt(0).toUpperCase() || "S";

  return (
    <div style={{ padding: 20 }}>
      <h2>Facebook Profile</h2>

      {error && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: 10, marginBottom: 10 }}>
          {error}
        </div>
      )}

      <button onClick={handleLogin}>Connect Facebook</button>

      <div style={{ marginTop: 20 }}>
        {loading ? (
          <p>Processing...</p>
        ) : (
          <div className="user-profile">
            <div className="avatar">
              {picture ? (
                <img
                  src={picture}
                  alt={name}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                    display: "block",
                  }}
                  onError={(e) => e.currentTarget.remove()}
                />
              ) : (
                initial
              )}
            </div>
            <span>{name}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
