import { useState } from "react";
import GoogleAppsMenu from "./GoogleAppsMenu"; // Your existing menu component

// A simple representation of the waffle icon (you could use an SVG)
const WaffleIcon = () => (
  <svg focusable="false" viewBox="0 0 24 24" width="24px" height="24px">
    <path d="M6,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM6,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM6,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM18,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM18,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM18,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2z"></path>
  </svg>
);

function GoogleAppsLauncher() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Function to close the menu
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Attach the ref from the hook to the menu's container div
  window.onclick = (e) => {
    if (isMenuOpen && e.target.closest(".apps-launcher-wrapper") === null) {
      closeMenu(); // Close the menu if clicked outside
    }
  };

  // Toggle function for the button
  const toggleMenu = () => {
    // Prevent click from immediately triggering outside click
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <div className="apps-launcher-wrapper">
      {/* Relative positioning context */}
      <button
        className="apps-launcher-button"
        onClick={toggleMenu}
        aria-label="Google apps"
        aria-haspopup="true"
        aria-expanded={isMenuOpen}
      >
        <WaffleIcon /> {/* Waffle icon */}
      </button>
      {/* Conditionally render the menu and attach the ref */}
      {isMenuOpen ? (
        // IMPORTANT: Pass the ref from useClickOutside to the element you want to detect clicks outside of
        // We apply it to the container *around* GoogleAppsMenu defined in GoogleAppsMenu.css
        <div className="apps-menu-popover">
          <GoogleAppsMenu />
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}

export default GoogleAppsLauncher;
