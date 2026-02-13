import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";

function Profile() {
  const API_BASE = import.meta.env.VITE_API_URL;
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function safeJson(res) {
    const text = await res.text();
    try {
      return { json: JSON.parse(text), text };
    } catch {
      return { json: null, text };
    }
  }

  const getSession = async () => {
    const { data } = await supabase.auth.getSession();
    return data?.session || null;
  };

  const fetchAccounts = async () => {
    setLoading(true);
    setError("");
    setInfo("");

    const session = await getSession();
    if (!session) {
      setAccounts([]);
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

      // finalize if redirected back from FB
      if (tempId) {
        setLoading(true);
        setError("");
        setInfo("");

        const session = await getSession();
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
          setInfo("Facebook connected ✅");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = () => {
    setError("");
    setInfo("");
    window.location.href = `${API_BASE}/api/auth/facebook/login`;
  };

  const handleDisconnectFacebook = async () => {
    setBusy(true);
    setError("");
    setInfo("");

    const session = await getSession();
    if (!session) {
      setError("Auth Error: Not logged in.");
      setBusy(false);
      return;
    }

    try {
      // disconnect ALL pages for this user by default
      const res = await fetch(`${API_BASE}/api/auth/facebook/disconnect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ revoke: true }),
      });

      const { json, text } = await safeJson(res);

      if (!res.ok) {
        throw new Error(json?.details || json?.error || `HTTP ${res.status}: ${text.slice(0, 140)}`);
      }

      setInfo(`Disconnected ✅ Removed ${json?.removed ?? 0} connection(s).`);
      setAccounts([]);
      await fetchAccounts();
    } catch (err) {
      setError(`Disconnect Error: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    setBusy(true);
    setError("");
    setInfo("");

    try {
      await supabase.auth.signOut();
      setAccounts([]);
      setInfo("Signed out ✅");
      // optional redirect:
      // window.location.href = "/login";
    } catch (err) {
      setError(`Sign out error: ${err.message}`);
    } finally {
      setBusy(false);
      setLoading(false);
    }
  };

  const getPictureUrl = (a) => {
    if (!a) return "";
    if (typeof a.picture === "string") return a.picture;
    return a.picture?.data?.url || "";
  };

  const primary = useMemo(() => accounts?.[0] || null, [accounts]);
  const name = primary?.name || "User";
  const picture = getPictureUrl(primary);
  const initial = (name || "S").trim().charAt(0).toUpperCase() || "S";

  const hasFacebook = accounts && accounts.length > 0;

  return (
    <div style={{ padding: 20 }}>
      <h2>Facebook Profile</h2>

      {error && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: 10, marginBottom: 10 }}>
          {error}
        </div>
      )}

      {info && (
        <div style={{ background: "#dcfce7", color: "#14532d", padding: 10, marginBottom: 10 }}>
          {info}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={handleLogin} disabled={loading || busy}>
          {busy ? "Working..." : hasFacebook ? "Reconnect Facebook" : "Connect Facebook"}
        </button>

        <button
          onClick={handleDisconnectFacebook}
          disabled={loading || busy || !hasFacebook}
          style={{
            background: hasFacebook ? "#ef4444" : "#e5e7eb",
            color: hasFacebook ? "white" : "#6b7280",
            border: "none",
            padding: "8px 12px",
            borderRadius: 6,
            cursor: hasFacebook ? "pointer" : "not-allowed",
          }}
        >
          Disconnect Facebook
        </button>

        <button onClick={handleSignOut} disabled={loading || busy}>
          Sign Out (App)
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        {loading ? (
          <p>Processing...</p>
        ) : (
          <div className="user-profile" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              className="avatar"
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: "#e5e7eb",
                display: "grid",
                placeItems: "center",
                overflow: "hidden",
                fontWeight: 700,
              }}
            >
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

            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontWeight: 700 }}>{name}</span>
              <span style={{ fontSize: 12, color: "#6b7280" }}>
                {hasFacebook ? `Connected pages: ${accounts.length}` : "No Facebook pages connected"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
