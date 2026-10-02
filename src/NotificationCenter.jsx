import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { timeAgo } from "./feeds";
import { formatEventTime } from "./UpcomingWidget";

const MESSAGING = [
  { label: "Gmail", url: "https://mail.google.com/mail/u/0/#inbox", domain: "mail.google.com" },
  { label: "Outlook", url: "https://outlook.live.com/mail/", domain: "outlook.live.com" },
  { label: "WhatsApp", url: "https://web.whatsapp.com/", domain: "web.whatsapp.com" },
  { label: "Telegram", url: "https://web.telegram.org/", domain: "web.telegram.org" },
  { label: "Messenger", url: "https://www.messenger.com/", domain: "messenger.com" },
];

const favicon = (domain) =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

function MailSection({ mail }) {
  const code = mail.error?.code;
  if (code === "needs-extension") {
    return (
      <p className="notice-empty">
        New Gmail messages show up here when this page runs as the Chrome
        extension.
      </p>
    );
  }
  if (code === "denied" && !mail.data) {
    return (
      <p className="notice-empty">
        Sign in to Gmail in this browser to see new mail here.
      </p>
    );
  }
  if (!mail.data) {
    return (
      <p className="notice-empty">
        {mail.loading ? "Checking mail…" : "Mail couldn't be checked. It'll retry in a few minutes."}
      </p>
    );
  }
  if (mail.data.entries.length === 0) {
    return <p className="notice-empty">You're all caught up.</p>;
  }
  return (
    <ul className="notice-list">
      {mail.data.entries.slice(0, 6).map((m) => (
        <li key={m.id}>
          <a className="notice" href={m.link} target="_blank" rel="noreferrer">
            <span className="notice__top">
              <strong>{m.from}</strong>
              <time dateTime={m.received}>{timeAgo(m.received)}</time>
            </span>
            <span className="notice__title">{m.subject}</span>
            {m.snippet && <span className="notice__body">{m.snippet}</span>}
          </a>
        </li>
      ))}
    </ul>
  );
}

function NotificationCenter({ mail, soonEvents }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const unread = mail.data?.unread ?? 0;
  const badge = unread + soonEvents.length;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="notice-center" ref={ref}>
      <button
        type="button"
        className="icon-button"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) mail.refresh();
        }}
        aria-label={badge ? `Notifications, ${badge} new` : "Notifications"}
        aria-expanded={open}
        title="Notifications"
      >
        <Bell aria-hidden="true" />
        {badge > 0 && (
          <span className="badge" aria-hidden="true">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </button>

      {open && (
        <div className="apps-popover notices glass glass--thick" role="dialog" aria-label="Notifications">
          {soonEvents.length > 0 && (
            <section>
              <h3>Coming up</h3>
              <ul className="notice-list">
                {soonEvents.map((e) => (
                  <li key={e.id} className="notice notice--event">
                    <span className="notice__top">
                      <strong>{e.title}</strong>
                      <time dateTime={e.start}>{formatEventTime(e)}</time>
                    </span>
                    {e.location && <span className="notice__body">{e.location}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h3>
              Mail
              {unread > 0 && <span className="notices__count">{unread} unread</span>}
            </h3>
            <MailSection mail={mail} />
          </section>

          <section>
            <h3>Messages</h3>
            <ul className="messaging">
              {MESSAGING.map((app) => (
                <li key={app.label}>
                  <a href={app.url} target="_blank" rel="noreferrer" className="app-item">
                    <img src={favicon(app.domain)} alt="" width={28} height={28} />
                    <span>{app.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;
