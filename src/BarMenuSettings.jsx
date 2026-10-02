import { useEffect, useState, memo } from "react";
import { X } from "lucide-react";
import { NEWS_REGIONS, NEWS_TOPICS } from "./feeds";

export const DEFAULT_BACKGROUND = "./11.jpg";

const CLOCK_STYLES = [
  { value: 0, label: "Analog" },
  { value: 1, label: "Digital" },
  { value: 2, label: "Both" },
];

const APPEARANCES = [
  { value: "auto", label: "Auto" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

function Segmented({ name, options, value, onChange, legend }) {
  return (
    <div className="segmented" role="radiogroup" aria-label={legend}>
      {options.map((option) => (
        <label key={option.value}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}

function BarMenuSettings({
  onClose,
  clockStyle,
  setClockStyle,
  city,
  setCity,
  appearance,
  setAppearance,
  backgroundImage,
  setBackgroundImage,
  onTidyShortcuts,
  notify,
  calendarUrl,
  setCalendarUrl,
  newsRegion,
  setNewsRegion,
  newsTopics,
  setNewsTopics,
  visibleWidgets,
  setVisibleWidgets,
  focusSection,
  isExtension,
}) {
  const [cityDraft, setCityDraft] = useState(city);
  const [calendarDraft, setCalendarDraft] = useState(calendarUrl);

  const handleCalendar = (e) => {
    e.preventDefault();
    const next = calendarDraft.trim();
    if (next && !/^(https|webcal):\/\/\S+$/i.test(next)) {
      notify("Paste the full address, starting with https:// or webcal://.", "error");
      return;
    }
    setCalendarUrl(next);
    notify(next ? "Calendar connected" : "Calendar removed");
  };

  // Keeps the chosen topics in the order NEWS_TOPICS lists them
  const toggleTopic = (id) =>
    setNewsTopics((current) =>
      NEWS_TOPICS.map((t) => t.id).filter((t) =>
        t === id ? !current.includes(id) : current.includes(t)
      )
    );

  const toggleWidget = (key) =>
    setVisibleWidgets((w) => ({ ...w, [key]: !w[key] }));

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleCity = (e) => {
    e.preventDefault();
    const next = cityDraft.trim();
    if (!next || next === city) return;
    setCity(next);
    notify(`Showing prayer times for ${next}`);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      notify("Choose an image under 5 MB.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setBackgroundImage(event.target.result);
      notify("Wallpaper changed");
    };
    reader.readAsDataURL(file);
  };

  const isCustomWallpaper = backgroundImage !== DEFAULT_BACKGROUND;

  return (
    <aside className="settings glass glass--thick" aria-labelledby="settings-title">
      <div className="settings__head">
        <h2 id="settings-title">Settings</h2>
        <button
          type="button"
          className="icon-button"
          onClick={onClose}
          aria-label="Close settings"
        >
          <X aria-hidden="true" />
        </button>
      </div>

      <div className="settings__body">
        <section className="settings__section">
          <h3>Appearance</h3>
          <Segmented
            name="appearance"
            legend="Appearance"
            options={APPEARANCES}
            value={appearance}
            onChange={setAppearance}
          />
          <p className="settings__hint">
            Auto picks light or dark glass to suit your wallpaper.
          </p>
        </section>

        <section className="settings__section">
          <h3>Clock</h3>
          <Segmented
            name="clock"
            legend="Clock style"
            options={CLOCK_STYLES}
            value={clockStyle}
            onChange={setClockStyle}
          />
        </section>

        <section className="settings__section">
          <h3>Prayer times</h3>
          <form className="settings__group" onSubmit={handleCity}>
            <div className="settings__row">
              <label className="visually-hidden" htmlFor="settings-city">
                City
              </label>
              <input
                id="settings-city"
                type="text"
                value={cityDraft}
                onChange={(e) => setCityDraft(e.target.value)}
                placeholder="City"
                autoComplete="address-level2"
              />
              <button
                type="submit"
                className="button button--primary button--small"
                disabled={!cityDraft.trim() || cityDraft.trim() === city}
              >
                Update
              </button>
            </div>
          </form>
        </section>

        <section className="settings__section">
          <h3>Calendar</h3>
          <form className="settings__group" onSubmit={handleCalendar}>
            <div className="settings__row">
              <label className="visually-hidden" htmlFor="settings-calendar">
                Calendar iCal address
              </label>
              <input
                id="settings-calendar"
                type="text"
                value={calendarDraft}
                onChange={(e) => setCalendarDraft(e.target.value)}
                placeholder="Secret iCal address"
                spellCheck="false"
                autoFocus={focusSection === "calendar"}
              />
              <button
                type="submit"
                className="button button--primary button--small"
                disabled={calendarDraft.trim() === calendarUrl}
              >
                {calendarDraft.trim() === calendarUrl && calendarUrl
                  ? "Connected"
                  : calendarDraft.trim() || !calendarUrl
                    ? "Connect"
                    : "Remove"}
              </button>
            </div>
          </form>
          <p className="settings__hint">
            In Google Calendar, open Settings, pick your calendar, and copy
            “Secret address in iCal format”. Outlook and iCloud calendars work
            too. The address stays in this browser
            {isExtension ? "." : " and is read through this site's own server."}
          </p>
        </section>

        <section className="settings__section">
          <h3>News</h3>
          <div className="settings__group">
            <div className="settings__row">
              <label htmlFor="settings-region">Region</label>
              <select
                id="settings-region"
                value={newsRegion}
                onChange={(e) => setNewsRegion(e.target.value)}
              >
                {NEWS_REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="settings__group settings__topics">
            {NEWS_TOPICS.map((t) => (
              <label key={t.id} className="settings__row">
                {t.label}
                <input
                  type="checkbox"
                  className="switch"
                  role="switch"
                  checked={newsTopics.includes(t.id)}
                  disabled={newsTopics.length === 1 && newsTopics.includes(t.id)}
                  onChange={() => toggleTopic(t.id)}
                />
              </label>
            ))}
          </div>
          <p className="settings__hint">
            Topics are searched in the region's language. Pick United Kingdom
            or United States for English stories.
          </p>
        </section>

        <section className="settings__section">
          <h3>Widgets</h3>
          <div className="settings__group">
            {[
              ["agenda", "Upcoming events"],
              ["news", "News and trending"],
            ].map(([key, label]) => (
              <label key={key} className="settings__row">
                {label}
                <input
                  type="checkbox"
                  className="switch"
                  role="switch"
                  checked={Boolean(visibleWidgets[key])}
                  onChange={() => toggleWidget(key)}
                />
              </label>
            ))}
          </div>
        </section>

        <section className="settings__section">
          <h3>Wallpaper</h3>
          <span
            className="wallpaper-preview"
            style={{ backgroundImage: `url(${backgroundImage})` }}
            role="img"
            aria-label="Current wallpaper"
          />
          <div className="wallpaper-actions">
            <label className="button button--plain button--small file-button">
              Choose image
              <input type="file" accept="image/*" onChange={handleImageUpload} />
            </label>
            {isCustomWallpaper && (
              <button
                type="button"
                className="button button--plain button--small"
                onClick={() => {
                  setBackgroundImage(DEFAULT_BACKGROUND);
                  notify("Wallpaper reset");
                }}
              >
                Use default
              </button>
            )}
          </div>
        </section>

        <section className="settings__section">
          <h3>Shortcuts</h3>
          <button
            type="button"
            className="button button--plain button--small"
            onClick={onTidyShortcuts}
          >
            Arrange in a grid
          </button>
          <p className="settings__hint">
            Drag shortcuts anywhere on the page. With the keyboard, focus one
            and press Alt with the arrow keys.
          </p>
        </section>
      </div>
    </aside>
  );
}

export default memo(BarMenuSettings);
