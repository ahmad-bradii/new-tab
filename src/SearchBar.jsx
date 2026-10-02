import { useState, useEffect, useLayoutEffect, useCallback, useMemo, useRef } from "react";
import { Search, ArrowUp, CalendarDays, Newspaper, Globe } from "lucide-react";
import { LiquidLens } from "./liquidLens";
import { isExtension } from "./feeds";
import { toArabic, cachedArabic, wordBefore, looksLikeUrl } from "./arabizi";

// The extension has no /api of its own, so it calls the suggestions service directly
const SUGGEST_API = isExtension ? "https://search-api-r2w3.onrender.com" : "";

const GROUP_ORDER = ["Shortcuts", "Google apps", "Calendar", "News"];
const PER_GROUP = 3;

// Ranks local items (shortcuts, apps, events, headlines) against the query,
// the way Spotlight puts things you own above web results.
function matchLocal(items, query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored = [];
  for (const item of items) {
    const title = item.title.toLowerCase();
    let score = 0;
    if (title.startsWith(q)) score = 3;
    else if (title.split(/\s+/).some((w) => w.startsWith(q))) score = 2;
    else if (title.includes(q)) score = 1;
    else if (q.length > 2 && item.subtitle?.toLowerCase().includes(q)) score = 0.5;
    if (score > 0) scored.push({ ...item, score });
  }
  return scored.sort((a, b) => b.score - a.score);
}

const SearchBar = ({ handleFocus, handleBlur, localItems = [] }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFocused, setIsFocused] = useState(false);

  // Refs for cleanup and scroll management
  const abortControllerRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const suggestionRefs = useRef([]);
  const blurTimeoutRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const capsuleRef = useRef(null);
  const inputRef = useRef(null);

  // Arabic typing: Latin letters turn into Arabic script, Yamli style
  const [arabic, setArabic] = useState(() => {
    try {
      return localStorage.getItem("arabicTyping") === "1";
    } catch {
      return false;
    }
  });
  const [candidates, setCandidates] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem("arabicTyping", arabic ? "1" : "0");
    } catch {
      // Storage blocked; the choice lasts for this tab only
    }
  }, [arabic]);

  // Fetch Arabic spellings for the word at the caret while it is typed
  useEffect(() => {
    const input = inputRef.current;
    const target =
      arabic && input && !looksLikeUrl(query)
        ? wordBefore(query, input.selectionStart ?? query.length)
        : null;
    if (!target) {
      setCandidates(null);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      toArabic(target.word, controller.signal)
        .then((list) => setCandidates(list.length ? { ...target, list } : null))
        .catch(() => {});
    }, 120);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [arabic, query]);

  // Swaps the Latin word at target for its Arabic spelling, keeping the caret
  // where it was relative to the text after it. Returns the new text, or null
  // if the word has been edited since.
  const replaceWord = useCallback((target, replacement, suffix = "") => {
    const input = inputRef.current;
    const value = input?.value ?? "";
    if (value.slice(target.start, target.end) !== target.word) return null;
    const next =
      value.slice(0, target.start) + replacement + suffix + value.slice(target.end);
    const caret =
      (input.selectionStart ?? value.length) +
      next.length -
      value.length;
    caretRef.current = caret;
    setQuery(next);
    setCandidates(null);
    return next;
  }, []);

  // Put the caret back as soon as the new text is committed, before the next
  // keystroke can land at the wrong place
  const caretRef = useRef(null);
  useLayoutEffect(() => {
    if (caretRef.current === null) return;
    inputRef.current?.setSelectionRange(caretRef.current, caretRef.current);
    caretRef.current = null;
  }, [query]);

  // Initialize suggestion refs when suggestions change (optimized)
  useEffect(() => {
    const currentLength = suggestionRefs.current.length;
    const newLength = suggestions.length;
    
    if (newLength < currentLength) {
      // Trim excess refs
      suggestionRefs.current = suggestionRefs.current.slice(0, newLength);
    } else if (newLength > currentLength) {
      // Extend array only if needed
      suggestionRefs.current.length = newLength;
    }
  }, [suggestions.length]);

  // Scroll highlighted item into view (throttled)
  useEffect(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    if (highlightedIndex >= 0 && suggestionRefs.current[highlightedIndex]) {
      scrollTimeoutRef.current = setTimeout(() => {
        if (suggestionRefs.current[highlightedIndex]) {
          suggestionRefs.current[highlightedIndex].scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "nearest",
          });
        }
      }, 50);
    }
    
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [highlightedIndex]);

  // Multi-source fetch function - tries fastest sources first
  const fetchSuggestions = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      setIsLoading(true);
      setError(null);

      // Helper function to parse different response formats
      const parseSuggestions = (data) => {
        if (Array.isArray(data)) {
          if (Array.isArray(data[1])) {
            // Google format: [query, [suggestions]]
            return data[1];
          } else {
            // Direct array format
            return data;
          }
        }
        return [];
      };

      // Source 1: Bing Autosuggest (fast, reliable, no CORS issues)
      const fetchBingSuggest = async () => {
        try {
          const response = await fetch(
            `https://api.bing.com/osjson.aspx?query=${encodeURIComponent(searchTerm)}`,
            {
              signal,
              headers: {
                "Accept": "application/json",
              },
            }
          );
          if (!response.ok) throw new Error("Bing failed");
          const data = await response.json();
          if (Array.isArray(data) && data.length > 1 && Array.isArray(data[1])) {
            return data[1].filter((s) => s && s.trim()); // Filter out empty strings
          }
          return [];
        } catch {
          return null;
        }
      };

      // Source 2: Current API (reliable fallback)
      const fetchCurrentAPI = async () => {
        try {
          const response = await fetch(
            `${SUGGEST_API}/api/suggestions?q=${encodeURIComponent(searchTerm)}`,
            {
              signal,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (!response.ok) throw new Error("API failed");
          const data = await response.json();
          return parseSuggestions(data);
        } catch {
          return null;
        }
      };

      // Source 3: Alternative Google Suggest (via your API proxy)
      const fetchGoogleViaAPI = async () => {
        try {
          // Use your existing API but with a different endpoint if available
          // Or try Google's endpoint through your proxy
          const response = await fetch(
            `${SUGGEST_API}/api/suggestions?q=${encodeURIComponent(searchTerm)}&source=google`,
            {
              signal,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (!response.ok) throw new Error("Google API failed");
          const data = await response.json();
          return parseSuggestions(data);
        } catch {
          return null;
        }
      };

      // Race multiple sources - use the first successful response
      // Create promises that reject on error/null, so Promise.race works correctly
      const createRacePromise = (promise, sourceName) => {
        return promise
          .then((result) => {
            if (result && Array.isArray(result) && result.length > 0) {
              return result;
            }
            throw new Error(`${sourceName} returned empty`);
          })
          .catch(() => {
            throw new Error(`${sourceName} failed`);
          });
      };

      // Try Bing first (usually fastest and most reliable)
      // Then current API, then Google via API
      const sources = [
        createRacePromise(fetchBingSuggest(), "Bing"),
        createRacePromise(fetchCurrentAPI(), "Current API"),
        createRacePromise(fetchGoogleViaAPI(), "Google API"),
      ];

      // Add timeout - fail fast if nothing responds quickly
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 1200)
      );

      let suggestionsArray = [];
      try {
        // Race all sources - first one to succeed wins
        suggestionsArray = await Promise.race([...sources, timeoutPromise]);
      } catch {
        // If race fails, try sources sequentially as fallback
        const fallbackSources = [fetchBingSuggest(), fetchCurrentAPI()];
        for (const source of fallbackSources) {
          try {
            const result = await Promise.race([
              source,
              new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 800)),
            ]);
            if (result && Array.isArray(result) && result.length > 0) {
              suggestionsArray = result;
              break;
            }
          } catch {
            continue;
          }
        }
      }

      if (!signal.aborted) {
        setSuggestions(suggestionsArray.slice(0, 6));
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Error fetching suggestions:", err);
        setError("Failed to load suggestions");
        setSuggestions([]);
      }
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  // Debounced search with proper cleanup
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 150); // 150ms debounce - faster with multi-source approach

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, fetchSuggestions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Optimized search function
  const handleSearch = useCallback((searchTerm) => {
    const trimmedTerm = (searchTerm || query).trim();
    if (!trimmedTerm) return;

    setQuery(trimmedTerm);
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);

    // Navigate to search results
    if (trimmedTerm.startsWith("http") || trimmedTerm.startsWith("https")) {
      window.location.href = trimmedTerm;
    } else if (!trimmedTerm.includes(" ") && trimmedTerm.includes(".")) {
      window.location.href = `https://${trimmedTerm}`;
    } else {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(trimmedTerm)}`;
      window.location.href = searchUrl;
    }
  }, [query]);

  // Top hit first, then each local group, then web suggestions
  const results = useMemo(() => {
    // A shortcut and a Google app can point at the same site; show it once
    const seen = new Set();
    const sameSite = (href) => {
      try {
        const u = new URL(href);
        return u.hostname.replace(/^www\./, "") + u.pathname.replace(/\/$/, "");
      } catch {
        return href;
      }
    };
    const matches = matchLocal(localItems, query).filter((m) => {
      const id = sameSite(m.href);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    const out = [];
    if (matches.length && matches[0].score >= 2) {
      out.push({ ...matches[0], kind: "link", group: "Top hit" });
    }
    for (const group of GROUP_ORDER) {
      matches
        .filter((m) => m.group === group && m.key !== out[0]?.key)
        .slice(0, PER_GROUP)
        .forEach((m) => out.push({ ...m, kind: "link" }));
    }
    const typed = query.trim();
    if (typed) {
      const web = suggestions.filter((t) => t.toLowerCase() !== typed.toLowerCase());
      [typed, ...web].forEach((text, i) =>
        out.push({ key: `web-${i}-${text}`, kind: "web", group: "Search the web", title: text })
      );
    }
    return out;
  }, [localItems, query, suggestions]);

  const showResults = isFocused && isDropdownOpen && query.trim() && results.length > 0;

  const activate = useCallback(
    (result) => {
      if (result.kind === "web") handleSearch(result.title);
      else window.location.href = result.href;
    },
    [handleSearch]
  );

  // "/" or Ctrl/Cmd+K opens search from anywhere on the page
  useEffect(() => {
    const onKey = (e) => {
      const typing = e.target.closest?.("input, textarea, [contenteditable='true']");
      const isShortcut =
        (e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing);
      if (isShortcut) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // The Latin word just typed, if Arabic typing should convert it
  const pendingWord = useCallback(() => {
    const input = inputRef.current;
    if (!arabic || !input || looksLikeUrl(input.value)) return null;
    if (input.selectionStart !== input.selectionEnd) return null;
    return wordBefore(input.value, input.selectionStart);
  }, [arabic]);

  const handleKeyDown = useCallback(
    (e) => {
      // Space converts the word before it; Shift+Space keeps it in Latin
      if (e.key === " " && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = pendingWord();
        if (target) {
          e.preventDefault();
          const list = cachedArabic(target.word);
          if (list?.length) {
            replaceWord(target, list[0], " ");
          } else {
            // Not fetched yet: type the space now and swap the word when the
            // spelling arrives, unless it has been edited by then
            replaceWord(target, target.word, " ");
            toArabic(target.word)
              .then((found) => found.length && replaceWord(target, found[0]))
              .catch(() => {});
          }
          return;
        }
      }
      switch (e.key) {
        case "ArrowDown":
          if (showResults) {
            e.preventDefault();
            setHighlightedIndex((i) => (i < results.length - 1 ? i + 1 : 0));
          }
          break;
        case "ArrowUp":
          if (showResults) {
            e.preventDefault();
            setHighlightedIndex((i) => (i > 0 ? i - 1 : results.length - 1));
          }
          break;
        case "Enter":
          e.preventDefault();
          if (showResults && highlightedIndex >= 0 && results[highlightedIndex]) {
            activate(results[highlightedIndex]);
          } else if (showResults && results[0]?.group === "Top hit") {
            activate(results[0]);
          } else {
            // Convert the last word too, so "salam" searches for سلام
            const target = pendingWord();
            const list = target && cachedArabic(target.word);
            const converted = list?.length && replaceWord(target, list[0]);
            handleSearch(converted || undefined);
          }
          break;
        case "Escape":
          if (showResults) {
            setIsDropdownOpen(false);
            setHighlightedIndex(-1);
          } else {
            e.currentTarget.blur();
          }
          break;
        default:
          break;
      }
    },
    [showResults, results, highlightedIndex, activate, handleSearch, pendingWord, replaceWord]
  );

  const handleInputChange = useCallback(
    (e) => {
      setQuery(e.target.value);
      setIsDropdownOpen(true);
      setHighlightedIndex(-1);
      if (error) setError(null);
    },
    [error]
  );

  const onInputFocus = useCallback(() => {
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    setIsFocused(true);
    setIsDropdownOpen(true);
    if (handleFocus) handleFocus();
  }, [handleFocus]);

  // Delay so a click on a result lands before the panel closes
  const onInputBlur = useCallback(() => {
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    blurTimeoutRef.current = setTimeout(() => {
      setIsFocused(false);
      setIsDropdownOpen(false);
      setHighlightedIndex(-1);
      if (handleBlur) handleBlur();
    }, 200);
  }, [handleBlur]);

  const activeId =
    showResults && highlightedIndex >= 0 ? `result-${highlightedIndex}` : undefined;

  const resultIcon = (r) => {
    if (r.kind === "web") return r.title === query.trim() ? <Search aria-hidden="true" /> : <Globe aria-hidden="true" />;
    if (r.iconUrl) return <img src={r.iconUrl} alt="" width={20} height={20} />;
    if (r.glyph === "calendar") return <CalendarDays aria-hidden="true" />;
    return <Newspaper aria-hidden="true" />;
  };

  return (
    <div className={`search-box ${isFocused ? "is-focused" : ""}`}>
      <LiquidLens id="search-lens" target={capsuleRef} />
      <div ref={capsuleRef} className="search-capsule glass" role="search">
        <Search aria-hidden="true" />
        <input
          ref={inputRef}
          id="targetInput"
          className="search-input"
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={onInputFocus}
          onBlur={onInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={arabic ? "Type Arabic in Latin letters: 3aslema…" : "Search or type a URL"}
          dir="auto"
          aria-label="Search shortcuts, events, news and the web"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          data-form-type="other"
          data-lpignore="true"
          data-1p-ignore="true"
          data-bwignore="true"
          role="combobox"
          aria-expanded={Boolean(showResults)}
          aria-autocomplete="list"
          aria-controls="search-results"
          aria-activedescendant={activeId}
        />
        {!query && !arabic && (
          <kbd className="search-hint" aria-hidden="true">
            /
          </kbd>
        )}
        <button
          type="button"
          className="search-lang"
          aria-pressed={arabic}
          aria-label="Arabic typing"
          title={
            arabic
              ? "Arabic typing is on: Space converts, Shift+Space keeps Latin"
              : "Type Arabic in Latin letters (Arabizi)"
          }
          // Keep focus in the field so typing carries on
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setArabic((on) => !on);
            inputRef.current?.focus();
          }}
        >
          ع
        </button>
        <button
          type="button"
          className={`search-go ${query.trim() ? "is-ready" : ""}`}
          onClick={() => handleSearch()}
          aria-label="Search the web"
          tabIndex={query.trim() ? 0 : -1}
        >
          <ArrowUp aria-hidden="true" />
        </button>
      </div>

      {showResults && (
        <div
          id="search-results"
          className="suggestions glass glass--thick"
          role="listbox"
          aria-label="Results"
        >
          {arabic && candidates && (
            <div role="presentation">
              <div className="results-group" role="presentation">
                Arabic for “{candidates.word}”
              </div>
              <div className="ar-candidates" role="presentation">
                {candidates.list.map((word, i) => (
                  <button
                    key={word}
                    type="button"
                    tabIndex={-1}
                    lang="ar"
                    dir="rtl"
                    className={`ar-candidate ${i === 0 ? "is-default" : ""}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      replaceWord(candidates, word);
                    }}
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          )}
          {results.map((r, index) => {
            const isHighlighted = index === highlightedIndex;
            const startsGroup = index === 0 || results[index - 1].group !== r.group;
            return (
              <div key={r.key} role="presentation">
                {startsGroup && (
                  <div className="results-group" role="presentation">
                    {r.group}
                  </div>
                )}
                <div
                  id={`result-${index}`}
                  ref={(el) => (suggestionRefs.current[index] = el)}
                  // mousedown fires before the input blurs, so the pick lands
                  onMouseDown={(e) => {
                    e.preventDefault();
                    activate(r);
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`suggestion ${isHighlighted ? "is-active" : ""} ${r.group === "Top hit" ? "is-top" : ""}`}
                  role="option"
                  aria-selected={isHighlighted}
                >
                  <span className="suggestion__icon">{resultIcon(r)}</span>
                  <span className="suggestion__text">
                    <span>{r.title}</span>
                    {r.subtitle && <small>{r.subtitle}</small>}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
