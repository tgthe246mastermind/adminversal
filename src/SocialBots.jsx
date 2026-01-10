import React, { useMemo, useRef, useState } from "react";
import { Instagram, Facebook, Upload } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTiktok } from "@fortawesome/free-brands-svg-icons";
import { supabase } from "./supabaseClient";

/* ============================================================
   UI Icons
============================================================ */
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

/* ============================================================
   Helpers
============================================================ */
const BARBADOS_TZ = "America/Barbados";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// ✅ 12:00 AM -> 11:45 PM at 15-min intervals (96 slots)
const availableTimes = Array.from({ length: 96 }, (_, i) => {
  const h24 = Math.floor(i / 4);
  const m = (i % 4) * 15;
  const ampm = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
});

function dayIndex(dayName) {
  const map = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
  return map[dayName];
}

function parseTimeLabel(label) {
  const m = String(label).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return { hours: 9, minutes: 0 };
  let h = parseInt(m[1], 10);
  const minutes = parseInt(m[2], 10);
  const ampm = m[3].toUpperCase();
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return { hours: h, minutes };
}

/**
 * Pull "calendar parts" for a Date as seen in a specific IANA timezone
 */
function tzParts(date, timeZone) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    weekday: "short",
  });

  const parts = Object.fromEntries(dtf.formatToParts(date).map((p) => [p.type, p.value]));
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
    weekday: parts.weekday, // "Mon", "Tue", ...
  };
}

function weekdayIndexShort(w) {
  // JS-style: 0=Sun..6=Sat
  const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[w] ?? 0;
}

/**
 * Convert a Barbados "wall clock" time (YYYY-MM-DD HH:mm in America/Barbados)
 * into an actual UTC Date instant, using Intl (no Luxon).
 */
function dateFromBarbadosLocal(y, m, d, hh, mm) {
  // naive initial guess: treat given local fields as UTC fields
  let guess = new Date(Date.UTC(y, m - 1, d, hh, mm, 0));

  // refine (handles offset)
  for (let i = 0; i < 3; i++) {
    const p = tzParts(guess, BARBADOS_TZ);

    const desired = Date.UTC(y, m - 1, d, hh, mm, 0);
    const shown = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, 0);

    const diffMs = desired - shown;
    if (diffMs === 0) break;
    guess = new Date(guess.getTime() + diffMs);
  }

  return guess;
}

/**
 * ✅ Next occurrence in Barbados time, returns UTC ISO string.
 */
function nextOccurrenceISO_Barbados(dayName, timeLabel) {
  const targetDow = dayIndex(dayName); // 0..6 (Sun..Sat)
  const { hours, minutes } = parseTimeLabel(timeLabel);

  const now = new Date();
  const nowBB = tzParts(now, BARBADOS_TZ);
  const todayDowBB = weekdayIndexShort(nowBB.weekday);

  let delta = targetDow - todayDowBB;
  if (delta < 0) delta += 7;

  // Use a "midday UTC anchor" to safely hop days, then read the Barbados calendar date
  const baseUtcMidday = new Date(Date.UTC(nowBB.year, nowBB.month - 1, nowBB.day, 12, 0, 0));
  baseUtcMidday.setUTCDate(baseUtcMidday.getUTCDate() + delta);
  const baseBB = tzParts(baseUtcMidday, BARBADOS_TZ);

  let candidate = dateFromBarbadosLocal(baseBB.year, baseBB.month, baseBB.day, hours, minutes);

  // If the slot is "today" in Barbados and already passed, push to next week
  if (delta === 0 && candidate.getTime() <= now.getTime()) {
    const plus7Midday = new Date(Date.UTC(baseBB.year, baseBB.month - 1, baseBB.day, 12, 0, 0));
    plus7Midday.setUTCDate(plus7Midday.getUTCDate() + 7);
    const plus7BB = tzParts(plus7Midday, BARBADOS_TZ);
    candidate = dateFromBarbadosLocal(plus7BB.year, plus7BB.month, plus7BB.day, hours, minutes);
  }

  return candidate.toISOString(); // UTC ISO for backend
}

function sanitizeFileName(name) {
  return String(name || "upload")
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function extFromFile(file) {
  const n = file?.name || "";
  const dot = n.lastIndexOf(".");
  if (dot >= 0) return n.slice(dot + 1).toLowerCase();
  return "jpg";
}

export default function SocialBots() {
  const API_BASE = import.meta.env.VITE_API_URL;

  const platforms = ["Instagram", "Facebook", "TikTok"];
  const [currentPlatform, setCurrentPlatform] = useState(platforms[0]);

  const [approvals, setApprovals] = useState(
    days.reduce((acc, day) => ({ ...acc, [day]: Array(5).fill("pending") }), {})
  );

  const [captions, setCaptions] = useState(
    days.reduce((acc, day) => ({ ...acc, [day]: Array(5).fill("") }), {})
  );

  const [times, setTimes] = useState(
    days.reduce((acc, day) => ({ ...acc, [day]: Array(5).fill(availableTimes[0]) }), {})
  );

  const [files, setFiles] = useState(days.reduce((acc, day) => ({ ...acc, [day]: Array(5).fill(null) }), {}));
  const [busy, setBusy] = useState(days.reduce((acc, day) => ({ ...acc, [day]: Array(5).fill(false) }), {}));
  const [slotErrors, setSlotErrors] = useState(days.reduce((acc, day) => ({ ...acc, [day]: Array(5).fill("") }), {}));

  const fileInputs = useRef(
    days.reduce((acc, day) => {
      acc[day] = Array.from({ length: 5 }, () => React.createRef());
      return acc;
    }, {})
  );

  const nextPlatform = () => {
    const idx = platforms.indexOf(currentPlatform);
    setCurrentPlatform(platforms[(idx + 1) % platforms.length]);
  };

  const prevPlatform = () => {
    const idx = platforms.indexOf(currentPlatform);
    setCurrentPlatform(platforms[(idx - 1 + platforms.length) % platforms.length]);
  };

  const setSlotBusy = (day, index, val) => {
    setBusy((prev) => ({ ...prev, [day]: prev[day].map((b, i) => (i === index ? val : b)) }));
  };

  const setError = (day, index, msg) => {
    setSlotErrors((prev) => ({ ...prev, [day]: prev[day].map((e, i) => (i === index ? msg : e)) }));
  };

  const updateCaption = (day, index, val) => {
    setCaptions((prev) => ({ ...prev, [day]: prev[day].map((c, i) => (i === index ? val : c)) }));
  };

  const updateTime = (day, index, val) => {
    setTimes((prev) => ({ ...prev, [day]: prev[day].map((t, i) => (i === index ? val : t)) }));
  };

  const updateFile = (day, index, file) => {
    setFiles((prev) => ({ ...prev, [day]: prev[day].map((f, i) => (i === index ? file : f)) }));
  };

  const markApproved = (day, index) => {
    setApprovals((prev) => ({ ...prev, [day]: prev[day].map((status, i) => (i === index ? "approved" : status)) }));
  };

  async function requireAuth() {
    const { data } = await supabase.auth.getSession();
    const accessToken = data?.session?.access_token || null;
    const userId = data?.session?.user?.id || null;
    if (!accessToken || !userId) throw new Error("You must be logged in.");
    return { accessToken, userId };
  }

  async function uploadToPoststore(userId, file) {
    const safe = sanitizeFileName(file.name);
    const ext = extFromFile(file);
    const stamp = Date.now();
    const path = `${userId}/scheduled/${stamp}-${safe}.${ext}`;

    const { error } = await supabase.storage.from("poststore").upload(path, file, {
      upsert: true,
      contentType: file.type || "application/octet-stream",
    });

    if (error) throw new Error(`Upload failed: ${error.message}`);
    return path;
  }

  // ✅ Safe JSON parser (prevents "Unexpected non-whitespace character after JSON...")
  async function safeJson(res) {
    const text = await res.text();
    try {
      return { json: JSON.parse(text), text };
    } catch {
      return { json: null, text };
    }
  }

  async function schedulePost({ accessToken, platform, scheduled_at, message, media_path }) {
    const res = await fetch(`${API_BASE}/api/social/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ platform, scheduled_at, message, media_path }),
    });

    const { json, text } = await safeJson(res);

    if (!res.ok) {
      throw new Error(json?.details || json?.error || `HTTP ${res.status}: ${text.slice(0, 180)}`);
    }
    if (!json) {
      throw new Error(`Expected JSON but got: ${text.slice(0, 180)}`);
    }
    return json;
  }

  const handlePickFile = (day, index) => {
    const ref = fileInputs.current?.[day]?.[index];
    if (ref?.current) ref.current.click();
  };

  const handleFileChange = (day, index, e) => {
    const file = e.target.files?.[0] || null;
    updateFile(day, index, file);
    setError(day, index, "");
  };

  const handleApprove = async (day, index) => {
    if (approvals[day][index] === "approved") return;

    if (currentPlatform === "TikTok") {
      setError(day, index, "TikTok scheduling is coming soon.");
      return;
    }

    setError(day, index, "");
    setSlotBusy(day, index, true);

    try {
      const { accessToken, userId } = await requireAuth();

      const caption = captions[day][index] || "";
      const timeLabel = times[day][index] || availableTimes[0];

      // ✅ Barbados-anchored scheduling
      const scheduled_at = nextOccurrenceISO_Barbados(day, timeLabel);

      const platformApi = currentPlatform.toLowerCase();

      let media_path = null;
      if (platformApi === "instagram") {
        const file = files[day][index];
        if (!file) throw new Error("Instagram requires an image. Click the upload icon and choose a file.");
        media_path = await uploadToPoststore(userId, file);
      }

      if (platformApi === "facebook" && !caption.trim()) throw new Error("Facebook post needs a caption/message.");

      await schedulePost({ accessToken, platform: platformApi, scheduled_at, message: caption, media_path });
      markApproved(day, index);
    } catch (e) {
      setError(day, index, e?.message || "Something went wrong.");
    } finally {
      setSlotBusy(day, index, false);
    }
  };

  const platformHint = useMemo(() => {
    if (currentPlatform === "Instagram") return "Instagram posts require an image upload.";
    if (currentPlatform === "Facebook") return "Facebook posts are caption-based (image support can be added later).";
    return "TikTok is coming soon.";
  }, [currentPlatform]);

  return (
    <div className="tab-content active" id="social-bots">
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

      <div className="bot-schedule">
        <h3>Automated Posting Schedule for {currentPlatform}</h3>
        <div className="hint">{platformHint}</div>

        {days.map((day) => (
          <div key={day} className="day-section">
            <h4 className="day-header">{day}</h4>

            <div className="slots-container">
              {[...Array(5)].map((_, index) => {
                const approved = approvals[day][index] === "approved";
                const isBusy = busy[day][index];
                const err = slotErrors[day][index];
                const file = files[day][index];

                return (
                  <div key={`${day}-${index}`} className="slot-wrap">
                    <div className="slot-card">
                      <div className="slot-upload clickable" onClick={() => handlePickFile(day, index)}>
                        <Upload size={24} color="#667eea" />
                      </div>

                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputs.current[day][index]}
                        style={{ display: "none" }}
                        onChange={(e) => handleFileChange(day, index, e)}
                      />

                      <input
                        type="text"
                        className="slot-caption"
                        placeholder="Enter post caption."
                        value={captions[day][index]}
                        onChange={(e) => updateCaption(day, index, e.target.value)}
                      />

                      <select
                        className="slot-time"
                        value={times[day][index]}
                        onChange={(e) => updateTime(day, index, e.target.value)}
                      >
                        {availableTimes.map((t, idx) => (
                          <option key={idx} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>

                      <button
                        className={`btn approve-btn ${approved ? "approved" : ""}`}
                        onClick={() => handleApprove(day, index)}
                        disabled={approved || isBusy}
                      >
                        {approved ? "Approved" : isBusy ? "Scheduling..." : "Approve"}
                      </button>
                    </div>

                    {file ? <div className="slot-meta">Selected: {file.name}</div> : null}
                    {err ? <div className="slot-error">{err}</div> : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .slider-card-container { display:flex; justify-content:center; margin-bottom:25px; }
        .slider-card { display:flex; align-items:center; justify-content:center; background:#f3f4f6; padding:15px 25px; border-radius:14px; box-shadow:0 4px 12px rgba(0,0,0,0.1); }
        .slider-arrow { background:none; border:none; font-size:28px; cursor:pointer; padding:0 12px; color:#333; }
        .slider-arrow:hover { color:#667eea; }
        .platform-icon { display:flex; align-items:center; justify-content:center; margin:0 12px; }
        .bot-schedule { max-height:calc(100vh - 200px); overflow-y:auto; padding-bottom:20px; }
        .hint { text-align:center; color:#64748b; margin-top:6px; margin-bottom:18px; font-size:0.95rem; }
        .day-section { margin-bottom:30px; }
        .day-header { font-size:1.5rem; font-weight:600; text-align:center; margin:15px 0; color:#333; }
        .slots-container { display:flex; flex-direction:column; gap:15px; margin-top:10px; }
        .slot-wrap { width:700px; margin:0 auto; }
        .slot-card { display:flex; align-items:center; background:#fff; padding:10px 15px; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.05); height:50px; }
        .slot-upload { margin-right:15px; display:flex; align-items:center; }
        .slot-upload.clickable { cursor:pointer; }
        .slot-caption { flex:1; padding:8px; border:1px solid #e2e8f0; border-radius:4px; font-size:14px; margin-right:15px; }
        .slot-time { padding:8px; border:1px solid #e2e8f0; border-radius:4px; font-size:14px; width:140px; margin-right:15px; }
        .approve-btn { padding:8px 16px; border:none; border-radius:4px; font-size:14px; font-weight:500; cursor:pointer; transition:all 0.3s ease; background:#667eea; color:white; }
        .approve-btn:hover:not(:disabled) { background:#5a6bd6; transform:translateY(-1px); }
        .approve-btn.approved { background:#10b981; cursor:default; }
        .approve-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .slot-meta { margin-top:6px; font-size:0.85rem; color:#64748b; }
        .slot-error { margin-top:6px; font-size:0.9rem; color:#ef4444; }
      `}</style>
    </div>
  );
}
