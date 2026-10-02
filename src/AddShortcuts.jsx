import { useEffect, useState, memo } from "react";
import { createPortal } from "react-dom";

export const faviconFor = (url) =>
  `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(url)}&size=128`;

// Accepts "youtube.com" as well as full URLs
const normalizeUrl = (value) => {
  const trimmed = value.trim();
  const withScheme = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  const url = new URL(withScheme);
  if (!url.hostname.includes(".") && url.hostname !== "localhost") {
    throw new Error("no domain");
  }
  return url.href;
};

// Add and edit share one sheet; `shortcut` is set when editing
const AddShortcut = ({ shortcut, onClose, onSave, onDelete }) => {
  const isEdit = Boolean(shortcut);
  const [name, setName] = useState(shortcut?.label ?? "");
  const [url, setUrl] = useState(shortcut?.target ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Enter a name for this shortcut.");
      return;
    }
    let href;
    try {
      href = normalizeUrl(url);
    } catch {
      setError("Enter a web address, like youtube.com.");
      return;
    }

    setSaving(true);
    try {
      await onSave({ label: name.trim(), target: href, icon: faviconFor(href) });
      onClose();
    } catch (err) {
      console.error("Error saving shortcut:", err);
      setError("The shortcut couldn't be saved. Try again.");
      setSaving(false);
    }
  };

  return createPortal(
    <div
      className="sheet-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        className="sheet glass glass--thick"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        onSubmit={handleSubmit}
        autoComplete="off"
        noValidate
      >
        <h2 id="sheet-title">{isEdit ? "Edit shortcut" : "New shortcut"}</h2>
        <p className="sheet-intro">
          {isEdit
            ? "Change the name or address. Its spot on the page stays the same."
            : "It appears under the search bar. Drag it anywhere afterwards."}
        </p>

        <div className="field-group">
          <div className="field">
            <label htmlFor="shortcut-name">Name</label>
            <input
              id="shortcut-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="YouTube"
              autoFocus
            />
          </div>
          <div className="field">
            <label htmlFor="shortcut-url">URL</label>
            <input
              id="shortcut-url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError("");
              }}
              placeholder="youtube.com"
              inputMode="url"
              spellCheck="false"
              autoCapitalize="off"
            />
          </div>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <div className="sheet-actions">
          <button type="button" className="button button--plain" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button button--primary" disabled={saving}>
            {isEdit ? "Save" : "Add shortcut"}
          </button>
        </div>
        {isEdit && (
          <button
            type="button"
            className="button button--danger sheet-delete"
            onClick={() => onDelete(shortcut.id)}
          >
            Delete shortcut
          </button>
        )}
      </form>
    </div>,
    document.getElementById("modal") || document.body
  );
};

export default memo(AddShortcut);
