import { createLazyFileRoute } from "@tanstack/react-router";
import {
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useWindowSize } from "react-use";
import { CircleCheck, CircleAlert } from "lucide-react";
import Horloge from "../Horloge";
import DateComponent from "../DateComponent";
import { NumericalTimer } from "../NumericalTimer";
import WeatherWithPray from "../WeatherWithPray";
import { analyzeImage } from "../utils/analyze";
import SearchBar from "../SearchBar";
import Header from "../Header";
import ShortcutIcon from "../ShortcutIcon";
import AddShortcut from "../AddShortcuts";
import BarMenuSettings, { DEFAULT_BACKGROUND } from "../BarMenuSettings";
import { supportsLens } from "../liquidLens";
import NewsWidget from "../NewsWidget";
import UpcomingWidget, { dayLabel, formatEventTime } from "../UpcomingWidget";
import { appsData } from "../GoogleAppsMenu";
import {
  useFeed,
  fetchGmail,
  fetchNewsTopic,
  DEFAULT_TOPICS,
  fetchCalendar,
  isExtension,
} from "../feeds";
import { layoutShortcuts, cellAt, cellToPx } from "../shortcutLayout";
import {
  addShortcut,
  getShortcuts,
  deleteShortcut,
  updateShortcut,
  updateShortcutPosition,
  clearShortcutPositions,
  initializeShortcutsOrder,
} from "../dbHelper";

const readJSON = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
};

const readString = (key, fallback) => {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
};

const notifyDesktop = (title, options, href) => {
  if (!("Notification" in window) || Notification.permission !== "granted")
    return;
  const n = new Notification(title, { icon: "./favicon.png", ...options });
  if (href) {
    n.onclick = () => {
      window.open(href, "_blank");
      n.close();
    };
  }
};

const store = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage can be full or blocked; settings then last for this tab only
  }
};

async function getPrayerTimes(city) {
  const date = new Date();
  const day = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  const response = await fetch(
    `https://api.aladhan.com/v1/timingsByAddress/${day}?address=${encodeURIComponent(city)}`,
  );
  if (!response.ok) throw new Error("Prayer times request failed");
  return response.json();
}

export const Route = createLazyFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [city, setCity] = useState(() => readString("selectedCountry", "sfax"));
  const [shortcuts, setShortcuts] = useState([]);
  const [shortcutsLoading, setShortcutsLoading] = useState(true);
  const [clockStyle, setClockStyle] = useState(() => readJSON("clockStyle", 0));
  const [sheet, setSheet] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [searchingFocus, setSearchingFocus] = useState(false);
  const [toast, setToast] = useState(null);
  const [appearance, setAppearance] = useState(() =>
    readJSON("appearance", "auto"),
  );
  const [wallpaperIsDark, setWallpaperIsDark] = useState(
    () => readJSON("backgroundTheme", { isDark: false }).isDark,
  );
  const [backgroundImage, setBackgroundImage] = useState(() =>
    readString("backgroundImage", DEFAULT_BACKGROUND),
  );

  const [calendarUrl, setCalendarUrl] = useState(() =>
    readString("calendarUrl", ""),
  );
  const [newsRegion, setNewsRegion] = useState(() =>
    readString("newsRegion", "US"),
  );
  const [visibleWidgets, setVisibleWidgets] = useState(() =>
    readJSON("widgets", { agenda: true, news: true }),
  );
  const [settingsFocus, setSettingsFocus] = useState(null);

  const mail = useFeed("cache:mail", fetchGmail, { interval: 2 * 60000 });
  const [newsTopics, setNewsTopics] = useState(() =>
    readJSON("newsTopics", DEFAULT_TOPICS),
  );
  const [newsTopic, setNewsTopic] = useState(() =>
    readString("newsTopic", DEFAULT_TOPICS[0]),
  );
  // Fall back to the first chosen topic if the saved one was switched off
  const activeTopic = newsTopics.includes(newsTopic)
    ? newsTopic
    : (newsTopics[0] ?? "top");
  const news = useFeed(
    `cache:news:${newsRegion}:${activeTopic}`,
    () => fetchNewsTopic(newsRegion, activeTopic),
    { interval: 30 * 60000, enabled: visibleWidgets.news },
  );
  const calendar = useFeed("cache:calendar", () => fetchCalendar(calendarUrl), {
    interval: 10 * 60000,
    enabled: Boolean(calendarUrl),
  });

  const { width: vw, height: vh } = useWindowSize();
  const searchRef = useRef(null);
  const widgetsRef = useRef(null);
  const sideRef = useRef(null);
  const [anchor, setAnchor] = useState(null);

  const notify = useCallback((message, type = "success") => {
    setToast({ message, type, key: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    document.documentElement.classList.toggle("has-lens", supportsLens());
  }, []);

  // Glass follows the wallpaper unless the user picked light or dark
  useEffect(() => {
    const glass =
      appearance === "auto" ? (wallpaperIsDark ? "dark" : "light") : appearance;
    document.documentElement.dataset.glass = glass;
    store("appearance", JSON.stringify(appearance));
  }, [appearance, wallpaperIsDark]);

  useEffect(() => {
    store("clockStyle", JSON.stringify(clockStyle));
  }, [clockStyle]);

  useEffect(() => {
    store("newsRegion", newsRegion);
    store("newsTopic", newsTopic);
    store("newsTopics", JSON.stringify(newsTopics));
    store("widgets", JSON.stringify(visibleWidgets));
  }, [newsRegion, newsTopic, newsTopics, visibleWidgets]);

  const saveCalendarUrl = useCallback((url) => {
    try {
      localStorage.removeItem("cache:calendar");
    } catch {
      // ignore
    }
    store("calendarUrl", url);
    setCalendarUrl(url);
  }, []);

  // Desktop alert for mail that arrives while the page is open. The first
  // load only records what's already there, so old mail doesn't alert.
  const seenMail = useRef(null);
  useEffect(() => {
    const entries = mail.data?.entries;
    if (!entries) return;
    if (seenMail.current === null) {
      seenMail.current = new Set(readJSON("seenMail", []));
      if (seenMail.current.size === 0) {
        entries.forEach((m) => seenMail.current.add(m.id));
      }
    }
    for (const m of entries) {
      if (seenMail.current.has(m.id)) continue;
      seenMail.current.add(m.id);
      notifyDesktop(m.from, { body: m.subject, tag: m.id }, m.link);
    }
    store("seenMail", JSON.stringify([...seenMail.current].slice(-200)));
  }, [mail.data]);

  // Reminder ten minutes before each timed event
  const [clockTick, setClockTick] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setClockTick(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const events = calendar.data;
  useEffect(() => {
    if (!events) return;
    const reminded = new Set(readJSON("remindedEvents", []));
    let changed = false;
    for (const e of events) {
      const until = new Date(e.start).getTime() - clockTick;
      if (
        e.allDay ||
        until > 10 * 60000 ||
        until < -60000 ||
        reminded.has(e.id)
      )
        continue;
      reminded.add(e.id);
      changed = true;
      notifyDesktop(
        `${e.title} ${until > 60000 ? formatEventTime(e) : "is starting"}`,
        {
          body: e.location || "Upcoming event",
          tag: e.id,
        },
      );
    }
    if (changed)
      store("remindedEvents", JSON.stringify([...reminded].slice(-200)));
  }, [events, clockTick]);

  const soonEvents = useMemo(
    () =>
      (events ?? []).filter((e) => {
        const start = new Date(e.start).getTime();
        const end = new Date(e.end).getTime();
        return !e.allDay && end > clockTick && start - clockTick < 3 * 3600000;
      }),
    [events, clockTick],
  );

  useEffect(() => {
    if (!backgroundImage) return;
    store("backgroundImage", backgroundImage);
    const body = document.body.style;
    body.backgroundImage = `url(${backgroundImage})`;
    body.backgroundSize = "cover";
    body.backgroundRepeat = "no-repeat";
    body.backgroundAttachment = "fixed";
    body.backgroundPosition = "center";

    let cancelled = false;
    analyzeImage(backgroundImage).then((theme) => {
      if (cancelled) return;
      setWallpaperIsDark(theme.isDark);
      store("backgroundTheme", JSON.stringify(theme));
    });
    return () => {
      cancelled = true;
    };
  }, [backgroundImage]);

  useEffect(() => {
    store("selectedCountry", city);
    let cancelled = false;
    setLoading(true);
    getPrayerTimes(city)
      .then((result) => {
        if (cancelled) return;
        setData(result.data);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to fetch prayer times", err);
        setData(null);
        setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [city]);

  const reloadShortcuts = useCallback(async () => {
    try {
      setShortcuts(await getShortcuts());
    } catch (err) {
      console.error("Error loading shortcuts:", err);
    } finally {
      setShortcutsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeShortcutsOrder()
      .catch((err) => console.error("Error ordering shortcuts:", err))
      .finally(reloadShortcuts);
  }, [reloadShortcuts]);

  // The default grid hangs off the search bar, so track where it sits
  useLayoutEffect(() => {
    if (searchingFocus) return;
    const measure = () => {
      const slot = searchRef.current;
      if (!slot) return;
      // The entrance animation scales the bar about its centre, so take the
      // centre from the box but the size from layout, which ignores it
      const rect = slot.getBoundingClientRect();
      const cx = rect.left + rect.width / 2 + window.scrollX;
      const cy = rect.top + rect.height / 2 + window.scrollY;
      setAnchor({
        left: cx - slot.offsetWidth / 2,
        width: slot.offsetWidth,
        bottom: cy + slot.offsetHeight / 2,
      });
    };
    measure();
    // Crossing a layout breakpoint moves the bar after this first read
    const frame = requestAnimationFrame(measure);
    const late = setTimeout(measure, 450);
    const observer = new ResizeObserver(measure);
    const slot = searchRef.current;
    if (slot) observer.observe(slot);
    if (widgetsRef.current) observer.observe(widgetsRef.current);
    if (sideRef.current) observer.observe(sideRef.current);
    // The bar slides back after a search; measure again once it lands
    slot?.addEventListener("transitionend", measure);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      clearTimeout(late);
      slot?.removeEventListener("transitionend", measure);
    };
  }, [vw, vh, searchingFocus]);

  const layout = useMemo(
    () =>
      anchor
        ? layoutShortcuts(shortcuts, { width: vw, height: vh }, anchor)
        : null,
    [shortcuts, vw, vh, anchor],
  );

  // Where a dragged tile will land, shown as an empty slot
  const [dropCell, setDropCell] = useState(null);
  const handleDrag = useCallback(
    (px) => {
      const cell = px && layout ? cellAt(px, layout.grid) : null;
      setDropCell((prev) =>
        prev?.col === cell?.col && prev?.row === cell?.row ? prev : cell,
      );
    },
    [layout],
  );

  // A dropped tile snaps to the nearest cell and swaps with whatever was
  // there. Every tile is pinned to its current cell so nothing else reflows.
  const handleMove = useCallback(
    (id, px) => {
      setDropCell(null);
      if (!layout) return;
      const from = layout.cells.get(id);
      const to = cellAt(px, layout.grid);
      if (!from || (from.col === to.col && from.row === to.row)) return;
      const next = new Map(layout.cells);
      for (const [other, cell] of layout.cells) {
        if (cell.col === to.col && cell.row === to.row) next.set(other, from);
      }
      next.set(id, to);
      setShortcuts((prev) =>
        prev.map((s) => (next.has(s.id) ? { ...s, pos: next.get(s.id) } : s)),
      );
      Promise.all(
        [...next].map(([sid, pos]) => updateShortcutPosition(sid, pos)),
      ).catch((err) => {
        console.error("Failed to save shortcut position:", err);
        notify("The new position couldn't be saved.", "error");
        reloadShortcuts();
      });
    },
    [layout, notify, reloadShortcuts],
  );

  const handleTidy = useCallback(async () => {
    try {
      await clearShortcutPositions();
      // eslint-disable-next-line no-unused-vars
      setShortcuts((prev) => prev.map(({ pos, ...rest }) => rest));
      notify("Shortcuts arranged");
    } catch (err) {
      console.error("Failed to arrange shortcuts:", err);
      notify("Shortcuts couldn't be arranged. Try again.", "error");
    }
  }, [notify]);

  const handleSave = useCallback(
    async (details) => {
      if (sheet?.shortcut) {
        await updateShortcut(sheet.shortcut.id, details);
        notify("Shortcut saved");
      } else {
        await addShortcut({ id: Date.now(), ...details });
        notify("Shortcut added");
      }
      await reloadShortcuts();
    },
    [sheet, notify, reloadShortcuts],
  );

  const handleDelete = useCallback(
    async (id) => {
      try {
        await deleteShortcut(id);
        setSheet(null);
        notify("Shortcut deleted");
        await reloadShortcuts();
      } catch (err) {
        console.error("Error deleting shortcut:", err);
        notify("The shortcut couldn't be deleted. Try again.", "error");
      }
    },
    [notify, reloadShortcuts],
  );

  const openAdd = useCallback(() => setSheet({}), []);
  const openEdit = useCallback((shortcut) => setSheet({ shortcut }), []);
  const closeSheet = useCallback(() => setSheet(null), []);
  const toggleSettings = useCallback(
    () => setShowSettings((open) => !open),
    [],
  );
  const closeSettings = useCallback(() => {
    setShowSettings(false);
    setSettingsFocus(null);
  }, []);
  const openCalendarSettings = useCallback(() => {
    setSettingsFocus("calendar");
    setShowSettings(true);
  }, []);

  // Everything Spotlight can find besides the web
  const localItems = useMemo(() => {
    const items = [];
    for (const s of shortcuts) {
      let host = "";
      try {
        host = new URL(s.target).hostname.replace(/^www\./, "");
      } catch {
        // keep empty
      }
      items.push({
        key: `s-${s.id}`,
        group: "Shortcuts",
        title: s.label,
        subtitle: host,
        href: s.target,
        iconUrl: s.icon,
      });
    }
    for (const a of appsData) {
      items.push({
        key: `a-${a.id}`,
        group: "Google apps",
        title: a.label,
        subtitle: "Google",
        href: a.url,
        iconUrl: a.iconSrc,
      });
    }
    for (const e of events ?? []) {
      items.push({
        key: `e-${e.id}`,
        group: "Calendar",
        title: e.title,
        subtitle: `${dayLabel(new Date(e.start))}${e.allDay ? "" : `, ${formatEventTime(e)}`}`,
        href: "https://calendar.google.com/calendar/r",
        glyph: "calendar",
      });
    }
    for (const n of news.data ?? []) {
      items.push({
        key: `n-${n.id}`,
        group: "News",
        title: n.title,
        subtitle: n.source || "Trending",
        href: n.link,
        glyph: "news",
      });
    }
    return items;
  }, [shortcuts, events, news.data]);
  const handleFocus = useCallback(() => setSearchingFocus(true), []);
  const handleBlur = useCallback(() => setSearchingFocus(false), []);
  const cycleClock = useCallback(() => setClockStyle((s) => (s + 1) % 3), []);

  return (
    <div
      className={`page ${searchingFocus ? "is-searching" : ""}`}
      style={
        layout
          ? {
              minHeight: layout.bounds.height,
              "--tiles-space": `${Math.max(0, layout.gridBottom - anchor.bottom)}px`,
            }
          : undefined
      }
    >
      <Header
        onAddShortcut={openAdd}
        onToggleSettings={toggleSettings}
        settingsOpen={showSettings}
        mail={mail}
        soonEvents={soonEvents}
      />

      {searchingFocus && (
        <div
          className="search-scrim"
          aria-hidden="true"
          onPointerDown={() => document.activeElement?.blur()}
        />
      )}
      <div className="search-slot" ref={searchRef}>
        <SearchBar
          handleFocus={handleFocus}
          handleBlur={handleBlur}
          localItems={localItems}
        />
      </div>

      <div className="columns">
        <div className="widgets" ref={widgetsRef}>
          <div
            className={`widget widget--clock glass ${clockStyle === 2 ? "shows-both" : ""}`}
          >
            {clockStyle !== 1 && <Horloge />}
            {clockStyle !== 0 && <NumericalTimer />}
            <button
              type="button"
              className="widget-switch"
              onClick={cycleClock}
              aria-label="Change clock style"
            />
          </div>
          <DateComponent />
          <WeatherWithPray
            i_state={city}
            i_error={error}
            i_loading={loading}
            i_data={data}
          />
        </div>

        {(visibleWidgets.agenda || visibleWidgets.news) && (
          <div className="side-widgets" ref={sideRef}>
            {visibleWidgets.agenda && (
              <UpcomingWidget
                calendar={calendar}
                hasCalendar={Boolean(calendarUrl)}
                onOpenSettings={openCalendarSettings}
              />
            )}
            {visibleWidgets.news && (
              <NewsWidget
                news={news}
                topics={newsTopics}
                topic={activeTopic}
                onTopicChange={setNewsTopic}
              />
            )}
          </div>
        )}
      </div>

      <div className="desktop">
        <p id="tile-move-hint" className="visually-hidden">
          Press Alt and an arrow key to move this shortcut.
        </p>
        {layout && dropCell && (
          <div
            className="tile-slot"
            aria-hidden="true"
            style={{
              transform: `translate3d(${cellToPx(dropCell, layout.grid).x}px, ${cellToPx(dropCell, layout.grid).y}px, 0)`,
            }}
          />
        )}
        {layout &&
          shortcuts.map((shortcut) => (
            <ShortcutIcon
              key={shortcut.id}
              shortcut={shortcut}
              position={layout.positions.get(shortcut.id)}
              bounds={layout.bounds}
              onMove={handleMove}
              onDrag={handleDrag}
              onEdit={openEdit}
            />
          ))}
        {layout && !shortcutsLoading && shortcuts.length === 0 && (
          <div
            className="empty-hint glass glass--thick"
            style={{
              left: anchor.left + anchor.width / 2,
              top: anchor.bottom + 36,
            }}
          >
            Keep your favourite sites here.
            <button
              type="button"
              className="button button--primary button--small"
              onClick={openAdd}
            >
              Add shortcut
            </button>
          </div>
        )}
      </div>

      {showSettings && (
        <BarMenuSettings
          onClose={closeSettings}
          clockStyle={clockStyle}
          setClockStyle={setClockStyle}
          city={city}
          setCity={setCity}
          appearance={appearance}
          setAppearance={setAppearance}
          backgroundImage={backgroundImage}
          setBackgroundImage={setBackgroundImage}
          onTidyShortcuts={handleTidy}
          notify={notify}
          calendarUrl={calendarUrl}
          setCalendarUrl={saveCalendarUrl}
          newsRegion={newsRegion}
          setNewsRegion={setNewsRegion}
          newsTopics={newsTopics}
          setNewsTopics={setNewsTopics}
          visibleWidgets={visibleWidgets}
          setVisibleWidgets={setVisibleWidgets}
          focusSection={settingsFocus}
          isExtension={isExtension}
        />
      )}

      {sheet && (
        <AddShortcut
          key={sheet.shortcut?.id ?? "new"}
          shortcut={sheet.shortcut}
          onClose={closeSheet}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}

      {toast && (
        <div
          key={toast.key}
          className={`toast toast--${toast.type} glass glass--thick`}
          role="status"
        >
          {toast.type === "error" ? (
            <CircleAlert aria-hidden="true" />
          ) : (
            <CircleCheck aria-hidden="true" />
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}
