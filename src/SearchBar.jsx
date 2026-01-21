import styled from "styled-components";
import { useState, useEffect, useCallback, useRef } from "react";
import { FaSearch } from "react-icons/fa";

const SearchBar = ({ handleFocus, handleBlur }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFocused, setIsFocused] = useState(false);

  // Refs for cleanup and scroll management
  const abortControllerRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const suggestionRefs = useRef([]);
  const blurTimeoutRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

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
            `/api/suggestions?q=${encodeURIComponent(searchTerm)}`,
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
            `/api/suggestions?q=${encodeURIComponent(searchTerm)}&source=google`,
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
        setSuggestions(suggestionsArray.slice(0, 8)); // Limit to 8 suggestions
        setIsDropdownOpen(suggestionsArray.length > 0);
        setHighlightedIndex(-1);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Error fetching suggestions:", err);
        setError("Failed to load suggestions");
        setSuggestions([]);
        setIsDropdownOpen(false);
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

  // Optimized keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case "ArrowDown":
          if (isDropdownOpen && suggestions.length > 0) {
            e.preventDefault();
            setHighlightedIndex((prevIndex) =>
              prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0
            );
          }
          break;
        case "ArrowUp":
          if (isDropdownOpen && suggestions.length > 0) {
            e.preventDefault();
            setHighlightedIndex((prevIndex) =>
              prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1
            );
          }
          break;
        case "Enter":
          e.preventDefault();
          if (isDropdownOpen && highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
            handleSearch(suggestions[highlightedIndex]);
          } else {
            handleSearch();
          }
          break;
        case "Escape":
          if (isDropdownOpen) {
            setIsDropdownOpen(false);
            setHighlightedIndex(-1);
          }
          break;
        default:
          break;
      }
    },
    [isDropdownOpen, suggestions, highlightedIndex, handleSearch]
  );

  // Handle input changes with optimizations
  const handleInputChange = useCallback(
    (e) => {
      const value = e.target.value;
      setQuery(value);
      setHighlightedIndex(-1);

      // Clear error when user starts typing
      if (error) {
        setError(null);
      }
    },
    [error]
  );

  // Handle suggestion click
  const handleSuggestionClick = useCallback(
    (suggestion) => {
      handleSearch(suggestion);
    },
    [handleSearch]
  );

  // Handle focus with optimization
  const onInputFocus = useCallback(() => {
    setIsFocused(true);
    if (query.trim() && suggestions.length > 0) {
      setIsDropdownOpen(true);
    }
    // Call parent's handleFocus if provided
    if (handleFocus) {
      handleFocus();
    }
  }, [query, suggestions.length, handleFocus]);

  // Handle blur with delay to allow clicks
  const onInputBlur = useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    blurTimeoutRef.current = setTimeout(() => {
      setIsFocused(false);
      setIsDropdownOpen(false);
      setHighlightedIndex(-1);
      // Call parent's handleBlur if provided
      if (handleBlur) {
        handleBlur();
      }
    }, 200);
  }, [handleBlur]);

  // Handle backdrop click to close modal
  const handleBackdropClick = useCallback(() => {
    setIsFocused(false);
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
    if (handleBlur) {
      handleBlur();
    }
  }, [handleBlur]);

  return (
    <StyledWrapper className={isFocused ? "focused" : ""}>
      {isFocused && (
        <div className="dark-overlay" onClick={handleBackdropClick} />
      )}
      <div className="search-container">
        <div className="input">
          <svg
            className="svgClass"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M11.5 6C11.3949 6.00006 11.2925 5.96705 11.2073 5.90565C11.1221 5.84425 11.0583 5.75758 11.0251 5.65792L10.7623 4.86908C10.6623 4.57101 10.4288 4.33629 10.13 4.23693L9.34102 3.97354C9.24166 3.94019 9.1553 3.87649 9.09411 3.79142C9.03292 3.70635 9 3.60421 9 3.49943C9 3.39465 9.03292 3.29252 9.09411 3.20745C9.1553 3.12238 9.24166 3.05867 9.34102 3.02532L10.13 2.76193C10.4282 2.66191 10.663 2.42852 10.7623 2.12979L11.0258 1.34094C11.0591 1.24161 11.1229 1.15526 11.2079 1.09409C11.293 1.03291 11.3952 1 11.5 1C11.6048 1 11.707 1.03291 11.7921 1.09409C11.8771 1.15526 11.9409 1.24161 11.9742 1.34094L12.2377 2.12979C12.2868 2.27697 12.3695 2.4107 12.4792 2.52041C12.589 2.63013 12.7227 2.71281 12.87 2.76193L13.659 3.02532C13.7583 3.05867 13.8447 3.12238 13.9059 3.20745C13.9671 3.29252 14 3.39465 14 3.49943C14 3.60421 13.9671 3.70635 13.9059 3.79142C13.8447 3.87649 13.7583 3.94019 13.659 3.97354L12.87 4.23693C12.5718 4.33696 12.337 4.57034 12.2377 4.86908L11.9742 5.65792C11.9411 5.75747 11.8774 5.84406 11.7923 5.90545C11.7072 5.96684 11.6049 5.99992 11.5 6Z"
              fill="currentColor"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6 13C5.85133 13.0001 5.7069 12.9504 5.58969 12.859C5.47247 12.7675 5.38921 12.6395 5.35313 12.4952L5.12388 11.5745C4.91418 10.7391 4.26198 10.0868 3.42674 9.87703L2.50619 9.64774C2.36169 9.61194 2.23333 9.52878 2.14159 9.41151C2.04985 9.29425 2 9.14964 2 9.00075C2 8.85185 2.04985 8.70724 2.14159 8.58998C2.23333 8.47272 2.36169 8.38955 2.50619 8.35376L3.42674 8.12446C4.26198 7.91473 4.91418 7.2624 5.12388 6.427L5.35313 5.50629C5.38892 5.36176 5.47207 5.23338 5.58931 5.14162C5.70655 5.04986 5.85113 5 6 5C6.14887 5 6.29345 5.04986 6.41069 5.14162C6.52793 5.23338 6.61108 5.36176 6.64687 5.50629L6.87612 6.427C6.97865 6.83721 7.19071 7.21184 7.48965 7.51082C7.78858 7.80981 8.16313 8.02192 8.57326 8.12446L9.49381 8.35376C9.63831 8.38955 9.76667 8.47272 9.85841 8.58998C9.95015 8.70724 10 8.85185 10 9.00075C10 9.14964 9.95015 9.29425 9.85841 9.41151C9.76667 9.52878 9.63831 9.61194 9.49381 9.64774L8.57326 9.87703C8.16313 9.97957 7.78858 10.1917 7.48965 10.4907C7.19071 10.7897 6.97865 11.1643 6.87612 11.5745L6.64687 12.4952C6.61079 12.6395 6.52753 12.7675 6.41031 12.859C6.2931 12.9504 6.14867 13.0001 6 13Z"
              fill="currentColor"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M13.5005 23C13.3376 23 13.1791 22.9469 13.049 22.8487C12.9189 22.7505 12.8243 22.6127 12.7795 22.456L11.9665 19.61C11.7915 18.9971 11.4631 18.4389 11.0124 17.9882C10.5616 17.5374 10.0035 17.209 9.39054 17.034L6.54454 16.221C6.38795 16.1761 6.25021 16.0815 6.15216 15.9514C6.05411 15.8214 6.00108 15.6629 6.00108 15.5C6.00108 15.3371 6.05411 15.1786 6.15216 15.0486C6.25021 14.9185 6.38795 14.8239 6.54454 14.779L9.39054 13.966C10.0035 13.791 10.5616 13.4626 11.0124 13.0118C11.4631 12.5611 11.7915 12.0029 11.9665 11.39L12.7795 8.544C12.8244 8.38741 12.919 8.24967 13.0491 8.15162C13.1792 8.05357 13.3376 8.00054 13.5005 8.00054C13.6634 8.00054 13.8219 8.05357 13.952 8.15162C14.0821 8.24967 14.1767 8.38741 14.2215 8.544L15.0345 11.39C15.2096 12.0029 15.538 12.5611 15.9887 13.0118C16.4394 13.4626 16.9976 13.791 17.6105 13.966L20.4565 14.779C20.6131 14.8239 20.7509 14.9185 20.8489 15.0486C20.947 15.1786 21 15.3371 21 15.5C21 15.6629 20.947 15.8214 20.8489 15.9514C20.7509 16.0815 20.6131 16.1761 20.4565 16.221L17.6105 17.034C16.9976 17.209 16.4394 17.5374 15.9887 17.9882C15.538 18.4389 15.2096 18.9971 15.0345 19.61L14.2215 22.456C14.1768 22.6127 14.0822 22.7505 13.9521 22.8487C13.822 22.9469 13.6635 23 13.5005 23Z"
              fill="currentColor"
            />
          </svg>
          <input
            id="targetInput"
            className="search"
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={onInputFocus}
            onBlur={onInputBlur}
            onKeyDown={handleKeyDown}
            placeholder="Search..."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            data-form-type="other"
            data-lpignore="true"
            data-1p-ignore="true"
            data-bwignore="true"
            role="combobox"
            aria-expanded={isDropdownOpen}
            aria-autocomplete="list"
            aria-haspopup="listbox"
          />
          <button
            type="button"
            className="search-button"
            onClick={() => handleSearch()}
            aria-label="Search"
          >
            <FaSearch className="text-gray-500" color="grey" size={16} />
          </button>
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="loading-indicator">
            <span>Loading...</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="error-message">
            <span>{error}</span>
          </div>
        )}

        <div className="suggestionsContainer">
          {isDropdownOpen && suggestions.length > 0 && (
            <ul
              className="suggestions-dropdown"
              role="listbox"
              aria-label="Search suggestions"
            >
              {suggestions.map((item, index) => {
                const isHighlighted = index === highlightedIndex;
                return (
                  <li
                    key={`${item}-${index}`}
                    ref={(el) => (suggestionRefs.current[index] = el)}
                    onClick={() => handleSuggestionClick(item)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`suggestion-item ${isHighlighted ? "highlighted" : ""}`}
                    style={{
                      animationDelay: `${index * 0.02}s`,
                    }}
                    role="option"
                    aria-selected={isHighlighted}
                  >
                    <span className="suggestion-icon">
                      <FaSearch size={14} />
                    </span>
                    <span className="suggestion-text">{item}</span>
                    {isHighlighted && (
                      <span className="suggestion-shortcut">↵</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .dark-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: -1;
    cursor: pointer;
  }

  .search-container {
    position: relative;
    box-shadow:
      0 20px 25px -5px rgb(0 0 0 / 0.15),
      0 8px 10px -6px rgb(0 0 0 / 0.25);

    background:
      linear-gradient(canvas, canvas) padding-box,
      linear-gradient(
          120deg,
          hsla(140, 93.4%, 12%, 0.69),
          hsla(0, 0%, 25.5%, 0.06)
        )
        border-box;
    border: 2px solid transparent;
    border-radius: 18px;
    transition: all 0.3s ease;
  }

  .search-container:focus-within {
    box-shadow:
      0 25px 35px -5px rgb(0 0 0 / 0.2),
      0 10px 15px -6px rgb(0 0 0 / 0.3);
    transform: translateY(-2px);
  }

  .input {
    --icon-size: 28px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .input .svgClass {
    position: absolute;
    width: var(--icon-size);
    top: 50%;
    left: 1rem;
    transform: translateY(-50%);
    overflow: visible;
    color: color-mix(in lch, canvas, canvasText 30%);
    transition: color 0.2s ease;
  }

  .input .svgClass path {
    transform-box: fill-box;
    transform-origin: center;
    transition: all 0.3s ease;
  }

  .input:is(:hover, :focus-within) .svgClass {
    color: color-mix(in lch, canvas, canvasText 50%);
  }

  .input:is(:hover, :focus-within) .svgClass path {
    animation: pop 0.5s var(--d);
  }

  .input .svgClass path:nth-of-type(1) {
    --d: 0.24s;
    --r: 20deg;
    --s: 1.5;
  }
  .input .svgClass path:nth-of-type(2) {
    --d: 0.12s;
    --r: 10deg;
    --s: 1.4;
  }
  .input .svgClass path:nth-of-type(3) {
    --d: 0s;
    --r: 0deg;
    --s: 1.25;
  }

  .search-button {
    border: none;
    background: transparent;
    width: 50px;
    cursor: pointer;
    padding: 8px;
  }

  @keyframes pop {
    50% {
      scale: var(--s, 1);
      rotate: var(--r, 0deg);
    }
  }

  .search {
    max-width: 800px;
    padding: 1rem 3.5rem 1rem calc(1rem + var(--icon-size) + 0.5rem);
    font-size: 1.025rem;
    field-sizing: content;
    border: 4px solid transparent;
    border-radius: 18px;
    outline: none;
    width: auto;
    min-width: 400px;
    background: transparent;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .search::placeholder {
    color: color-mix(in lch, canvas, canvasText 30%);
    transition: color 0.2s ease;
  }

  .search:focus::placeholder {
    color: color-mix(in lch, canvas, canvasText 20%);
  }

  .search:focus {
    background: rgba(255, 255, 255, 0.05);
  }

  .suggestionsContainer {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 1000;
  }

  .suggestions-dropdown {
    margin: 8px 0 0 0;
    min-width: 400px;
    max-width: 800px;
    max-height: 400px;
    overflow-y: auto;
    overflow-x: hidden;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(226, 232, 240, 0.8);
    border-radius: 16px;
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.12),
      0 10px 10px -5px rgba(0, 0, 0, 0.06),
      0 0 0 1px rgba(255, 255, 255, 0.5) inset;
    font-size: 1rem;
    list-style: none;
    padding: 8px;
    animation: slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    scroll-behavior: smooth;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-12px) scale(0.98);
      filter: blur(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
      filter: blur(0);
    }
  }

  .suggestions-dropdown .suggestion-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    margin: 2px 0;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    font-weight: 400;
    color: #1f2937;
    position: relative;
    border-radius: 10px;
    background: transparent;
    border: 1px solid transparent;
    animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .suggestions-dropdown .suggestion-item:hover {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(147, 51, 234, 0.05) 100%);
    border-color: rgba(59, 130, 246, 0.2);
    transform: translateX(4px);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
  }

  .suggestions-dropdown .suggestion-item.highlighted,
  .suggestions-dropdown .suggestion-item[aria-selected="true"] {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(147, 51, 234, 0.08) 100%);
    border-color: rgba(59, 130, 246, 0.3);
    color: #1e40af;
    transform: translateX(6px);
    box-shadow: 
      0 4px 12px rgba(59, 130, 246, 0.15),
      0 0 0 2px rgba(59, 130, 246, 0.1) inset;
    font-weight: 500;
  }

  .suggestions-dropdown .suggestion-item.highlighted::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 60%;
    background: linear-gradient(180deg, #3b82f6 0%, #9333ea 100%);
    border-radius: 0 4px 4px 0;
    box-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
  }

  .suggestion-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
    flex-shrink: 0;
    transition: all 0.2s ease;
  }

  .suggestion-item.highlighted .suggestion-icon,
  .suggestion-item[aria-selected="true"] .suggestion-icon {
    background: linear-gradient(135deg, #3b82f6 0%, #9333ea 100%);
    color: white;
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  }

  .suggestion-text {
    flex: 1;
    font-size: 0.95rem;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .suggestion-shortcut {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    padding: 0 8px;
    border-radius: 6px;
    background: rgba(59, 130, 246, 0.15);
    color: #3b82f6;
    font-size: 0.75rem;
    font-weight: 600;
    border: 1px solid rgba(59, 130, 246, 0.2);
  }

  .suggestions-dropdown .suggestion-item:first-child {
    margin-top: 0;
  }

  .suggestions-dropdown .suggestion-item:last-child {
    margin-bottom: 0;
  }

  .loading-indicator,
  .error-message {
    margin: 8px 0 0 0;
    padding: 16px;
    border-radius: 12px;
    font-size: 0.9rem;
    animation: fadeIn 0.25s ease-out;
    text-align: center;
    backdrop-filter: blur(10px);
  }

  .loading-indicator {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(147, 51, 234, 0.05) 100%);
    border: 1px solid rgba(59, 130, 246, 0.2);
  }

  .loading-indicator span {
    font-size: 0.9rem;
    color: #3b82f6;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .loading-indicator span::before {
    content: "";
    width: 16px;
    height: 16px;
    border: 2px solid rgba(59, 130, 246, 0.3);
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    display: inline-block;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .error-message {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.08) 100%);
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  .error-message span {
    font-size: 0.9rem;
    color: #dc2626;
    font-weight: 500;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* Scrollbar styling for suggestions */
  .suggestions-dropdown::-webkit-scrollbar {
    width: 8px;
  }

  .suggestions-dropdown::-webkit-scrollbar-track {
    background: rgba(241, 245, 249, 0.5);
    border-radius: 10px;
    margin: 8px 0;
  }

  .suggestions-dropdown::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, rgba(59, 130, 246, 0.4) 0%, rgba(147, 51, 234, 0.4) 100%);
    border-radius: 10px;
    border: 2px solid transparent;
    background-clip: padding-box;
  }

  .suggestions-dropdown::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, rgba(59, 130, 246, 0.6) 0%, rgba(147, 51, 234, 0.6) 100%);
    background-clip: padding-box;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .search {
      min-width: 280px;
      font-size: 1rem;
    }

    .suggestions-dropdown {
      min-width: 280px;
    }
  }
`;

export default SearchBar;
