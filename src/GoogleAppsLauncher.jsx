import { useEffect, useRef, useState } from "react";
import { Grip } from "lucide-react";
import GoogleAppsMenu from "./GoogleAppsMenu";

function GoogleAppsLauncher() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onPointerDown = (e) => {
      if (!wrapperRef.current?.contains(e.target)) setIsMenuOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [isMenuOpen]);

  return (
    <div className="apps-launcher" ref={wrapperRef}>
      <button
        type="button"
        className="icon-button"
        onClick={() => setIsMenuOpen((open) => !open)}
        aria-label="Google apps"
        aria-haspopup="true"
        aria-expanded={isMenuOpen}
        title="Google apps"
      >
        <Grip aria-hidden="true" />
      </button>
      {isMenuOpen && (
        <div className="apps-popover glass glass--thick">
          <GoogleAppsMenu />
        </div>
      )}
    </div>
  );
}

export default GoogleAppsLauncher;
