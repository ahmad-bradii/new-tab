import { useEffect, useRef, useState } from "react";
import { RotateCw } from "lucide-react";
import { NEWS_TOPICS, timeAgo } from "./feeds";

const PAGE = 10;

function NewsWidget({ news, topics, topic, onTopicChange }) {
  const [count, setCount] = useState(PAGE);
  const listRef = useRef(null);
  const sentinelRef = useRef(null);
  const all = news.data ?? [];
  const items = all.slice(0, count);
  const hasMore = count < all.length;
  const shown = NEWS_TOPICS.filter((t) => topics.includes(t.id));
  const current = NEWS_TOPICS.find((t) => t.id === topic);

  // A new topic starts again from the top
  useEffect(() => {
    setCount(PAGE);
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [topic]);

  // Reveal the next page as the end of the list scrolls into view
  useEffect(() => {
    const root = listRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel || !hasMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setCount((c) => c + PAGE);
      },
      { root, rootMargin: "0px 0px 160px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, items.length]);

  const moreLink = current?.query
    ? `https://news.google.com/search?q=${encodeURIComponent(current.query)}`
    : "https://news.google.com/";

  return (
    <section className="widget widget--news glass" aria-labelledby="news-title">
      <div className="widget-head">
        <h2 id="news-title" className="widget-title">
          News
        </h2>
        <button
          type="button"
          className="icon-button icon-button--small"
          onClick={news.refresh}
          aria-label="Refresh news"
          title="Refresh"
        >
          <RotateCw
            aria-hidden="true"
            className={news.loading ? "is-spinning" : ""}
          />
        </button>
      </div>

      {shown.length > 1 && (
        <div className="chips" role="tablist" aria-label="News topic">
          {shown.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={topic === t.id}
              className={`chip ${topic === t.id ? "is-selected" : ""}`}
              onClick={() => onTopicChange(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <p className="widget-status">
          {news.loading ? "Loading…" : "No stories right now. Try refreshing."}
        </p>
      ) : (
        <div
          className="headlines-scroll"
          ref={listRef}
          role="tabpanel"
          tabIndex={0}
          aria-label={`${current?.label ?? "News"} stories`}
        >
          <ol className="headlines">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="headline"
                >
                  <span className="headline__title">{item.title}</span>
                  <span className="headline__meta">
                    {topic === "trending"
                      ? [
                          item.traffic && `${item.traffic} searches`,
                          item.context,
                        ]
                          .filter(Boolean)
                          .join(", ")
                      : [item.source, timeAgo(item.published)]
                          .filter(Boolean)
                          .join(", ")}
                  </span>
                </a>
              </li>
            ))}
          </ol>
          {hasMore ? (
            <div
              ref={sentinelRef}
              className="headlines-more"
              aria-hidden="true"
            >
              Loading more…
            </div>
          ) : (
            <p className="headlines-end">
              That's all from the last few days.{" "}
              <a href={moreLink} target="_blank" rel="noreferrer">
                More on Google News
              </a>
            </p>
          )}
        </div>
      )}
    </section>
  );
}

export default NewsWidget;
