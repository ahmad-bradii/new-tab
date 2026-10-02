import { useState, useEffect, useMemo } from "react";

const PRAYERS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
// Sunrise is listed but isn't a prayer, so it's never "next"
const COUNTED = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

const toMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

const formatRemaining = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
};

function WeatherWithPray({ i_state, i_error, i_loading, i_data }) {
  const [now, setNow] = useState(() => new Date());
  const [notifiedPrayer, setNotifiedPrayer] = useState(null);
  const timings = i_data?.timings;

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const next = useMemo(() => {
    if (!timings) return null;
    const nowMin = now.getHours() * 60 + now.getMinutes();
    for (const name of COUNTED) {
      const at = toMinutes(timings[name]);
      if (nowMin < at) return { name, remaining: at - nowMin };
    }
    // After Isha, the next prayer is tomorrow's Fajr
    return {
      name: "Fajr",
      remaining: toMinutes(timings.Fajr) + 1440 - nowMin,
    };
  }, [now, timings]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Notify once when a prayer is under five minutes away
  useEffect(() => {
    if (!next) return;
    if (next.remaining >= 5 && notifiedPrayer === next.name) {
      setNotifiedPrayer(null);
      return;
    }
    if (
      next.remaining < 5 &&
      next.remaining > 0 &&
      notifiedPrayer !== next.name &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      const notification = new Notification(`${next.name} is soon`, {
        body: `${next.name} starts in ${formatRemaining(next.remaining)}.`,
        icon: "/favicon.png",
        tag: next.name,
      });
      setNotifiedPrayer(next.name);
      setTimeout(() => notification.close(), 10000);
    }
  }, [next, notifiedPrayer]);

  return (
    <section className="widget widget--prayer glass" aria-label="Prayer times">
      <div className="prayer-head">
        <h2 className="prayer-city">{i_state}</h2>
        {next && (
          <p className="prayer-next">
            <strong>{next.name}</strong> in {formatRemaining(next.remaining)}
          </p>
        )}
      </div>

      {i_loading && !timings ? (
        <p className="prayer-status">Loading prayer times…</p>
      ) : i_error || !timings ? (
        <p className="prayer-status">
          Prayer times for {i_state} aren't available. Check the city name in
          Settings.
        </p>
      ) : (
        <ol className="prayer-list">
          {PRAYERS.map((name) => (
            <li key={name} className={next?.name === name ? "is-next" : ""}>
              {name}
              <time>{timings[name]}</time>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default WeatherWithPray;
