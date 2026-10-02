import { useCallback, useEffect, useRef, useState } from "react";
import { parseCalendar } from "./ics";

/* global chrome */
export const isExtension =
  typeof chrome !== "undefined" && Boolean(chrome.runtime?.id);

export class FeedError extends Error {
  constructor(code, message) {
    super(message || code);
    this.code = code;
  }
}

// The extension has host permissions and can fetch feeds directly. The
// website goes through its own /api/feed function instead.
async function getText(url, init) {
  const res = await fetch(
    isExtension ? url : `/api/feed?url=${encodeURIComponent(url)}`,
    init
  );
  if (res.status === 401 || res.status === 403) throw new FeedError("denied");
  if (!res.ok) throw new FeedError("failed", `Request failed (${res.status})`);
  return res.text();
}

const parseXml = (text) => {
  const doc = new DOMParser().parseFromString(text, "text/xml");
  if (doc.querySelector("parsererror")) throw new FeedError("failed", "Unreadable feed");
  return doc;
};

const textOf = (node, selector) =>
  node.getElementsByTagName(selector)[0]?.textContent?.trim() ?? "";

const textOfNS = (node, localName) =>
  node.getElementsByTagNameNS("*", localName)[0]?.textContent?.trim() ?? "";

export const NEWS_REGIONS = [
  { id: "US", label: "United States", hl: "en-US", ceid: "US:en" },
  { id: "GB", label: "United Kingdom", hl: "en-GB", ceid: "GB:en" },
  { id: "FR", label: "France", hl: "fr", ceid: "FR:fr" },
  { id: "TN", label: "Tunisia", hl: "fr", ceid: "TN:fr" },
  { id: "DE", label: "Germany", hl: "de", ceid: "DE:de" },
  { id: "EG", label: "Egypt (Arabic)", hl: "ar", ceid: "EG:ar" },
];

const regionFor = (id) => NEWS_REGIONS.find((r) => r.id === id) ?? NEWS_REGIONS[0];

// Each topic is a Google News section or a search. Searches are limited to
// the last few days (when:3d) so the card stays current.
export const NEWS_TOPICS = [
  { id: "finance", label: "Finance", section: "BUSINESS" },
  { id: "crypto", label: "Crypto", query: 'bitcoin OR ethereum OR cryptocurrency OR "crypto market"' },
  { id: "world", label: "World", section: "WORLD" },
  { id: "tunisia", label: "Tunisia", query: "Tunisia OR Tunisie OR Tunis" },
  { id: "football", label: "Football", query: '"Premier League" OR "Champions League" OR "La Liga" OR "Serie A" OR "Ligue 1" OR FIFA OR soccer' },
  { id: "drilling", label: "Drilling", query: '"rig count" OR drillship OR jackup OR "drilling contract" OR "drilling rig" OR "offshore drilling" OR "geothermal drilling"' },
  { id: "top", label: "Top stories" },
  { id: "trending", label: "Trending" },
];

export const DEFAULT_TOPICS = ["finance", "crypto", "world", "tunisia", "football", "drilling"];

export async function fetchNewsTopic(regionId, topicId) {
  if (topicId === "trending") return fetchTrending(regionId);
  const r = regionFor(regionId);
  const topic = NEWS_TOPICS.find((t) => t.id === topicId) ?? NEWS_TOPICS[0];
  const edition = `hl=${r.hl}&gl=${r.id}&ceid=${r.ceid}`;
  const url = topic.section
    ? `https://news.google.com/rss/headlines/section/topic/${topic.section}?${edition}`
    : topic.query
      ? `https://news.google.com/rss/search?q=${encodeURIComponent(`${topic.query} when:3d`)}&${edition}`
      : `https://news.google.com/rss?${edition}`;
  return fetchNews(url);
}

async function fetchNews(url) {
  const doc = parseXml(await getText(url));
  return [...doc.getElementsByTagName("item")].slice(0, 100).map((item) => {
    const source = textOf(item, "source");
    let title = textOf(item, "title");
    // Google News appends " - Source" to every headline
    if (source && title.endsWith(` - ${source}`)) {
      title = title.slice(0, -(source.length + 3));
    }
    return {
      id: textOf(item, "guid") || textOf(item, "link"),
      title,
      source,
      link: textOf(item, "link"),
      published: textOf(item, "pubDate"),
    };
  });
}

export async function fetchTrending(regionId) {
  const doc = parseXml(
    await getText(`https://trends.google.com/trending/rss?geo=${regionFor(regionId).id}`)
  );
  return [...doc.getElementsByTagName("item")].slice(0, 100).map((item) => {
    const title = textOf(item, "title");
    return {
      id: title,
      title,
      traffic: textOfNS(item, "approx_traffic"),
      context: textOfNS(item, "news_item_title"),
      link: `https://www.google.com/search?q=${encodeURIComponent(title)}`,
    };
  });
}

// Gmail's unread feed uses the signed-in browser session, which only the
// extension can send. It returns up to 20 unread messages from the inbox.
export async function fetchGmail() {
  if (!isExtension) throw new FeedError("needs-extension");
  const text = await getText("https://mail.google.com/mail/u/0/feed/atom", {
    credentials: "include",
  });
  if (/<html/i.test(text.slice(0, 200))) throw new FeedError("denied");
  const doc = parseXml(text);
  const entries = [...doc.getElementsByTagName("entry")].map((entry) => {
    const author = entry.getElementsByTagName("author")[0];
    return {
      id: textOf(entry, "id"),
      subject: textOf(entry, "title") || "(no subject)",
      snippet: textOf(entry, "summary"),
      from: (author && textOf(author, "name")) || (author && textOf(author, "email")) || "Unknown sender",
      link:
        entry.getElementsByTagName("link")[0]?.getAttribute("href") ||
        "https://mail.google.com/mail/u/0/#inbox",
      received: textOf(entry, "issued") || textOf(entry, "modified"),
    };
  });
  return {
    unread: Number(textOf(doc.documentElement, "fullcount")) || entries.length,
    entries,
  };
}

export async function fetchCalendar(icsUrl) {
  const url = icsUrl.trim().replace(/^webcal:/i, "https:");
  const now = Date.now();
  const events = parseCalendar(await getText(url), {
    from: new Date(now - 3600000),
    to: new Date(now + 14 * 86400000),
  });
  return events.slice(0, 40).map((e) => ({
    ...e,
    start: e.start.toISOString(),
    end: e.end.toISOString(),
  }));
}

const readCache = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
};

// Loads a feed, shows the last copy instantly from cache, and refreshes on an
// interval and whenever the tab becomes visible again.
export function useFeed(cacheKey, fetcher, { interval, enabled = true }) {
  const [state, setState] = useState(() => ({
    data: enabled ? readCache(cacheKey)?.data ?? null : null,
    error: null,
    loading: enabled,
  }));
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setState((s) => ({ ...s, loading: true }));
    try {
      const data = await fetcherRef.current();
      setState({ data, error: null, loading: false });
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ data, at: Date.now() }));
      } catch {
        // Cache is a convenience only
      }
    } catch (error) {
      setState((s) => ({ ...s, error, loading: false }));
    }
  }, [cacheKey, enabled]);

  useEffect(() => {
    if (!enabled) {
      setState({ data: null, error: null, loading: false });
      return;
    }
    setState({ data: readCache(cacheKey)?.data ?? null, error: null, loading: true });
    refresh();
    const id = setInterval(refresh, interval);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh, interval, cacheKey, enabled]);

  return { ...state, refresh };
}

export function timeAgo(value) {
  const t = new Date(value).getTime();
  if (!t) return "";
  const mins = Math.round((Date.now() - t) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}
