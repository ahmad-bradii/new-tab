import { Plus, Settings } from "lucide-react";
import GoogleAppsLauncher from "./GoogleAppsLauncher";
import NotificationCenter from "./NotificationCenter";

function Header({ onAddShortcut, onToggleSettings, settingsOpen, mail, soonEvents }) {
  return (
    <header className="top-bar">
      <button
        type="button"
        className="icon-button"
        onClick={onAddShortcut}
        aria-label="Add shortcut"
        title="Add shortcut"
      >
        <Plus aria-hidden="true" />
      </button>
      <NotificationCenter mail={mail} soonEvents={soonEvents} />
      <GoogleAppsLauncher />
      <button
        type="button"
        className="icon-button"
        onClick={onToggleSettings}
        aria-label="Settings"
        aria-expanded={settingsOpen}
        title="Settings"
      >
        <Settings aria-hidden="true" />
      </button>
    </header>
  );
}

export default Header;
