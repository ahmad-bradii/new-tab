// Vercel function: fetches a news or calendar feed for the website build,
// where browsers block these hosts. The extension build fetches directly.
// Only the hosts below are allowed, so this can't be used as an open proxy.

const ALLOWED_HOSTS = [
  "news.google.com",
  "trends.google.com",
  "calendar.google.com",
  "outlook.office365.com",
  "outlook.live.com",
];
const ALLOWED_SUFFIXES = [".icloud.com"];
const MAX_BYTES = 5 * 1024 * 1024;

const isAllowed = (url) =>
  url.protocol === "https:" &&
  (ALLOWED_HOSTS.includes(url.hostname) ||
    ALLOWED_SUFFIXES.some((s) => url.hostname.endsWith(s)));

export default async function handler(req, res) {
  const send = (status, body, type = "text/plain; charset=utf-8") => {
    res.statusCode = status;
    res.setHeader("Content-Type", type);
    res.end(body);
  };

  let target;
  try {
    const raw = new URL(req.url, "http://localhost").searchParams.get("url");
    target = new URL(raw.replace(/^webcal:/i, "https:"));
  } catch {
    return send(400, "Pass a feed address as ?url=");
  }
  if (!isAllowed(target)) {
    return send(403, "That feed host isn't allowed.");
  }

  try {
    // Follow redirects by hand so each hop is checked against the allowlist
    let upstream;
    for (let hop = 0; hop < 4; hop++) {
      upstream = await fetch(target, {
        headers: { "User-Agent": "Mozilla/5.0 (new-tab feed reader)" },
        redirect: "manual",
      });
      const location = upstream.headers.get("location");
      if (upstream.status < 300 || upstream.status >= 400 || !location) break;
      target = new URL(location, target);
      if (!isAllowed(target)) return send(403, "The feed redirected to a host that isn't allowed.");
    }
    const text = await upstream.text();
    if (text.length > MAX_BYTES) return send(413, "Feed is too large.");
    // Calendar addresses are private, so never let a shared cache keep them
    const isCalendar = !target.hostname.includes("news") && !target.hostname.includes("trends");
    res.setHeader(
      "Cache-Control",
      isCalendar ? "private, no-store" : "public, s-maxage=600, stale-while-revalidate=1800"
    );
    send(upstream.status, text, upstream.headers.get("content-type") || "text/xml");
  } catch {
    send(502, "The feed couldn't be reached.");
  }
}
