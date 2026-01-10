import React, { useEffect, useMemo, useState } from "react";
import { Instagram, Facebook } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTiktok } from "@fortawesome/free-brands-svg-icons";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function fmtCompact(n) {
  if (n == null) return "0";
  const num = Number(n);
  if (Number.isNaN(num)) return "0";
  return Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num);
}

function fmtPct(x) {
  const num = Number(x);
  if (Number.isNaN(num)) return "0.0%";
  return `${(num * 100).toFixed(1)}%`;
}

export default function SocialDashboard() {
  const API_BASE = import.meta.env.VITE_API_URL; // your worker base
  const [currentPlatform, setCurrentPlatform] = useState("Instagram");

  // Facebook state
  const [fbLoading, setFbLoading] = useState(false);
  const [fbError, setFbError] = useState("");
  const [fbStats, setFbStats] = useState(null);

  // Instagram state
  const [igLoading, setIgLoading] = useState(false);
  const [igError, setIgError] = useState("");
  const [igStats, setIgStats] = useState(null);

  const platforms = ["Instagram", "Facebook", "TikTok"];

  // ----------------------------
  // Load Facebook when selected
  // ----------------------------
  useEffect(() => {
    const loadFacebook = async () => {
      if (currentPlatform !== "Facebook") return;

      setFbLoading(true);
      setFbError("");

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const accessToken = session?.access_token;
        if (!accessToken) {
          setFbStats(null);
          setFbError("Not logged in.");
          return;
        }

        const res = await fetch(`${API_BASE}/api/social/facebook/overview`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json?.details || json?.error || "Failed to load Facebook stats");

        if (!json?.connected) {
          setFbStats(null);
          setFbError(json?.message || "No Facebook Page connected yet.");
        } else {
          setFbStats(json);
        }
      } catch (e) {
        setFbStats(null);
        setFbError(String(e?.message || e));
      } finally {
        setFbLoading(false);
      }
    };

    loadFacebook();
  }, [currentPlatform, API_BASE]);

  // ----------------------------
  // Load Instagram when selected
  // ----------------------------
  useEffect(() => {
    const loadInstagram = async () => {
      if (currentPlatform !== "Instagram") return;

      setIgLoading(true);
      setIgError("");

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const accessToken = session?.access_token;
        if (!accessToken) {
          setIgStats(null);
          setIgError("Not logged in.");
          return;
        }

        const res = await fetch(`${API_BASE}/api/social/instagram/overview`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json?.details || json?.error || "Failed to load Instagram stats");

        if (!json?.connected) {
          setIgStats(null);
          setIgError(json?.message || "No Instagram Business account connected yet.");
        } else {
          setIgStats(json);
        }
      } catch (e) {
        setIgStats(null);
        setIgError(String(e?.message || e));
      } finally {
        setIgLoading(false);
      }
    };

    loadInstagram();
  }, [currentPlatform, API_BASE]);

  // ----------------------------
  // Platform values displayed in the 3 cards
  // ----------------------------
  const platformData = useMemo(() => {
    const base = {
      Instagram: {
        followers: "—",
        engagement: "—",
        posts: "—",
        changes: { followers: "Same", engagement: "Same", posts: "Same" },
      },
      Facebook: {
        followers: "—",
        engagement: "—",
        posts: "—",
        changes: { followers: "Same", engagement: "Same", posts: "Same" },
      },
      TikTok: {
        // Still dummy until you wire it
        followers: "2.5M",
        engagement: "6.1%",
        posts: 20,
        changes: { followers: "Same", engagement: "Same", posts: "Same" },
      },
    };

    // Map Facebook live data
    if (fbStats?.success && fbStats?.connected) {
      const followers = fbStats?.stats?.followers ?? 0;
      const engagementRate = fbStats?.stats?.engagement_rate ?? 0;
      const postsThisWeek = fbStats?.stats?.posts_this_week ?? 0;

      base.Facebook = {
        followers: fmtCompact(followers),
        engagement: fmtPct(engagementRate),
        posts: postsThisWeek,
        changes: { followers: "Same", engagement: "Same", posts: "Same" },
      };
    }

    // Map Instagram live data
    if (igStats?.success && igStats?.connected) {
      const followers = igStats?.stats?.followers ?? 0;
      const engagementRate = igStats?.stats?.engagement_rate ?? 0;
      const postsThisWeek = igStats?.stats?.posts_this_week ?? 0;

      base.Instagram = {
        followers: fmtCompact(followers),
        engagement: fmtPct(engagementRate),
        posts: postsThisWeek,
        changes: { followers: "Same", engagement: "Same", posts: "Same" },
      };
    }

    return base;
  }, [fbStats, igStats]);

  const currentStats = platformData[currentPlatform];

  const nextPlatform = () => {
    const idx = platforms.indexOf(currentPlatform);
    setCurrentPlatform(platforms[(idx + 1) % platforms.length]);
  };

  const prevPlatform = () => {
    const idx = platforms.indexOf(currentPlatform);
    setCurrentPlatform(platforms[(idx - 1 + platforms.length) % platforms.length]);
  };

  const PlatformIcon = ({ platform }) => {
    switch (platform) {
      case "Instagram":
        return <Instagram size={36} color="#667eea" />;
      case "Facebook":
        return <Facebook size={36} color="#667eea" />;
      case "TikTok":
        return <FontAwesomeIcon icon={faTiktok} size="2x" color="#000" />;
      default:
        return null;
    }
  };

  const getChangeClass = (change) => {
    if (change === "Same") return "neutral";
    if (String(change).startsWith("+")) return "positive";
    if (String(change).startsWith("-")) return "negative";
    return "neutral";
  };

  return (
    <div className="tab-content active" id="social-dashboard">
      {/* Slider Card */}
      <div className="slider-card-container">
        <div className="slider-card">
          <button className="slider-arrow left" onClick={prevPlatform}>
            ←
          </button>
          <div className="platform-icon">
            <PlatformIcon platform={currentPlatform} />
          </div>
          <button className="slider-arrow right" onClick={nextPlatform}>
            →
          </button>
        </div>
      </div>

      {/* Status line */}
      {currentPlatform === "Facebook" && (
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          {fbLoading && <span>Loading Facebook metrics…</span>}
          {!fbLoading && fbError && <span style={{ color: "red" }}>{fbError}</span>}
          {!fbLoading && !fbError && fbStats?.page?.name && <span>Connected: {fbStats.page.name}</span>}
        </div>
      )}

      {currentPlatform === "Instagram" && (
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          {igLoading && <span>Loading Instagram metrics…</span>}
          {!igLoading && igError && <span style={{ color: "red" }}>{igError}</span>}
          {!igLoading && !igError && igStats?.instagram?.username && (
            <span>Connected: @{igStats.instagram.username}</span>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="dashboard-grid">
        <div className="stats-card">
          <h3>Total Followers</h3>
          <div className="stat-number">{currentStats.followers}</div>
          <div className={`stat-change ${getChangeClass(currentStats.changes.followers)}`}>
            {currentStats.changes.followers}
          </div>
        </div>

        <div className="stats-card">
          <h3>Engagement Rate</h3>
          <div className="stat-number">{currentStats.engagement}</div>
          <div className={`stat-change ${getChangeClass(currentStats.changes.engagement)}`}>
            {currentStats.changes.engagement}
          </div>
        </div>

        <div className="stats-card">
          <h3>Posts This Week</h3>
          <div className="stat-number">{currentStats.posts}</div>
          <div className={`stat-change ${getChangeClass(currentStats.changes.posts)}`}>
            {currentStats.changes.posts}
          </div>
        </div>
      </div>

      {/* Inline CSS */}
      <style jsx>{`
        .slider-card-container {
          display: flex;
          justify-content: center;
          margin-bottom: 25px;
        }
        .slider-card {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          padding: 15px 25px;
          border-radius: 14px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .slider-arrow {
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          padding: 0 12px;
          color: #333;
        }
        .slider-arrow:hover {
          color: #667eea;
        }
        .platform-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 12px;
        }
        .dashboard-grid {
          display: flex;
          justify-content: center;
          gap: 25px;
          flex-wrap: wrap;
        }
        .stats-card {
          background: #fff;
          padding: 25px 30px;
          border-radius: 14px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          text-align: center;
          min-width: 500px;
        }
        .stats-card h3 {
          font-size: 1.5rem;
          margin-bottom: 10px;
        }
        .stat-number {
          font-size: 2.25rem;
          font-weight: bold;
          margin: 8px 0;
        }
        .stat-change {
          font-size: 1.25rem;
        }
        .stat-change.positive {
          color: green;
        }
        .stat-change.negative {
          color: red;
        }
        .stat-change.neutral {
          color: gray;
        }
      `}</style>
    </div>
  );
}
