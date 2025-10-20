import { createLazyFileRoute } from "@tanstack/react-router";
import Horloge from "../Horloge";
import DateComponent from "../DateComponent";
import { NumericalTimer } from "../NumericalTimer";
import WeatherWithPray from "../WeatherWithPray";
// import Weather from "../Weather";
import { analyzeImage } from "../utils/analyze";
import SearchBar from "../SearchBar";
import Header from "../Header";
import ShortcutIcon, { AddShortcutButton } from "../ShortcutIcon";
import {
  getShortcuts,
  deleteShortcut,
  updateShortcut,
  updateShortcutsOrder,
  initializeShortcutsOrder,
} from "../dbHelper";
import AddShortcut from "../AddShortcuts";
import { useState, useEffect, useMemo, useCallback } from "react";
import BarMenuSettings from "../BarMenuSettings";
import perfMonitor from "../utils/performanceMonitor";
//

async function getPrayerTimes(state) {
  try {
    const date = new Date();
    const response = await fetch(
      `https://api.aladhan.com/v1/timingsByAddress/${date.getDay}-${date.getMonth}-${date.getFullYear}?address=tunisia-${state}`
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (e) {
    console.log("failing fetching data", e);
  }
}

export const Route = createLazyFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [state, setState] = useState("sfax");
  const [shortcuts, setShortcuts] = useState([]);
  const [shortcutsLoading, setShortcutsLoading] = useState(true);
  const [horlogeType, sethorlogeType] = useState(0);
  const [showAddShortcut, setShowAddShortcut] = useState(false);
  const [showBarSettings, setShowBarSettings] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(() => {
    const saved = localStorage.getItem("backgroundImage");
    return saved || "./11.jpg";
  });
  const [backgroundTheme, setBackgroundTheme] = useState(() => {
    const saved = localStorage.getItem("backgroundTheme");
    return saved
      ? JSON.parse(saved)
      : {
          isDark: false,
          dominantColor: "#ffffff",
          accentColor: "#667eea",
          textColor: "#333333",
        };
  });

  // Function to analyze image and extract colors

  // Apply background image and analyze colors
  useEffect(() => {
    if (backgroundImage) {
      document.body.style.backgroundImage = `url(${backgroundImage})`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundRepeat = "no-repeat";
      document.body.style.backgroundAttachment = "fixed";
      document.body.style.backgroundPosition = "center";

      // Analyze image for color theming
      analyzeImage(backgroundImage).then((theme) => {
        setBackgroundTheme(theme);
        localStorage.setItem("backgroundTheme", JSON.stringify(theme));

        // Apply CSS custom properties for dynamic theming
        document.documentElement.style.setProperty(
          "--bg-dominant-color",
          theme.dominantColor
        );
        document.documentElement.style.setProperty(
          "--bg-accent-color",
          theme.accentColor
        );
        document.documentElement.style.setProperty(
          "--bg-text-color",
          theme.textColor
        );
        document.documentElement.style.setProperty(
          "--bg-is-dark",
          theme.isDark ? "1" : "0"
        );
        document.documentElement.style.setProperty(
          "--bg-brightness",
          theme.brightness
        );

        // Apply adaptive overlay
        const overlay = theme.isDark
          ? "rgba(0, 0, 0, 0.3)"
          : "rgba(255, 255, 255, 0.2)";
        document.documentElement.style.setProperty("--bg-overlay", overlay);
      });
    }
  }, [backgroundImage]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getPrayerTimes(state);
        setData(result.data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    //console.log("Fetching prayer times for state:", state);
  }, [state]);

  // Function to reload shortcuts from database
  const reloadShortcuts = useCallback(async () => {
    try {
      setShortcutsLoading(true);
      const updatedShortcuts = await getShortcuts();
      setShortcuts(updatedShortcuts);
    } catch (error) {
      console.error("Error reloading shortcuts:", error);
    } finally {
      setShortcutsLoading(false);
    }
  }, []);

  const changingStatus = useCallback(() => {
    setShowAddShortcut((e) => !e);
  }, []);

  const changingBarStatus = useCallback(() => {
    setShowBarSettings((e) => !e);
  }, []);

  const changeHorloge = useCallback(() => {
    sethorlogeType(horlogeType + 1);
    if (horlogeType > 1) {
      sethorlogeType(0);
    }
  }, [horlogeType]);

  useEffect(() => {
    const fetchShortcuts = async () => {
      try {
        perfMonitor.startTiming("shortcuts-load");
        setShortcutsLoading(true);
        // Initialize order for existing shortcuts that don't have it
        await initializeShortcutsOrder();

        // Load shortcuts using the reload function
        await reloadShortcuts();
        perfMonitor.endTiming("shortcuts-load");
      } catch (error) {
        console.error("Error fetching shortcuts:", error);
        setShortcutsLoading(false);
      }
    };

    fetchShortcuts();
  }, [reloadShortcuts]);

  const handleSaveShortcut = useCallback(async () => {
    // Wait a bit longer to ensure database write is complete
    await new Promise((resolve) => setTimeout(resolve, 100));
    await reloadShortcuts();
  }, [reloadShortcuts]);

  const handleDeleteShortcut = useCallback(
    async (idToDelete) => {
      try {
        await deleteShortcut(idToDelete);
        await reloadShortcuts();
      } catch (error) {
        console.error("Error deleting shortcut:", error);
        alert("Failed to delete shortcut. Please try again.");
      }
    },
    [reloadShortcuts]
  );

  const handleUpdateShortcut = useCallback(
    async (updatedShortcut) => {
      try {
        await updateShortcut(updatedShortcut.id, updatedShortcut);
        await reloadShortcuts();
      } catch (error) {
        console.error("Error updating shortcut:", error);
        alert("Failed to update shortcut. Please try again.");
      }
    },
    [reloadShortcuts]
  );

  // Drag and drop handlers
  const handleDragStart = useCallback((id) => {
    setDraggedItem(id);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
  }, []);

  const handleDrop = useCallback(
    async (targetId) => {
      if (draggedItem === null || draggedItem === targetId) return;

      const draggedIndex = shortcuts.findIndex((s) => s.id === draggedItem);
      const targetIndex = shortcuts.findIndex((s) => s.id === targetId);

      if (draggedIndex === -1 || targetIndex === -1) return;

      // Create new array with reordered items
      const newShortcuts = [...shortcuts];
      const [draggedShortcut] = newShortcuts.splice(draggedIndex, 1);
      newShortcuts.splice(targetIndex, 0, draggedShortcut);

      // Update state optimistically
      setShortcuts(newShortcuts);

      // Update database
      try {
        await updateShortcutsOrder(newShortcuts);
      } catch (error) {
        console.error("Failed to update shortcuts order:", error);
        // Revert state on error
        await reloadShortcuts();
      }
    },
    [draggedItem, shortcuts, reloadShortcuts]
  );

  //console.log("data :", data);
  //console.log("state :", state);

  return (
    <>
      <div className="routeContainer">
        <div
          className="AddShortcut_routeContainer"
          style={{
            width: showAddShortcut ? "100%" : "0px", // Reserve width
            height: "auto", // Fixed height
            overflow: "hidden",
            transition: "width 0.3s ease-in-out",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: "0",
            padding: "0",
          }}
        >
          {showAddShortcut && (
            <AddShortcut
              changingStatus={changingStatus}
              handleSaveShortcut={handleSaveShortcut}
              mode={true}
            />
          )}
        </div>
        <div className="headerContainer">
          <Header action={changingBarStatus} />
        </div>
        {showBarSettings && (
          <div className="bar-menu-container">
            <BarMenuSettings
              action={changingBarStatus}
              changeHorlogeStyle={changeHorloge}
              setState={setState}
              state={state}
              backgroundImage={backgroundImage}
              setBackgroundImage={setBackgroundImage}
              backgroundTheme={backgroundTheme}
            />
          </div>
        )}
        <div
          className="iconsContainer"
          style={{
            display: "flex",
            flexWrap: "wrap",
            padding: "20px",
            minHeight: "120px", // Reserve space for at least one row of shortcuts
            alignItems: "flex-start",
          }}
        >
          {/* Website shortcut */}
          {shortcutsLoading
            ? // Skeleton placeholders to prevent layout shift
              Array.from({ length: 3 }, (_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="shortcut_container skeleton"
                >
                  <div className="icon skeleton-icon"></div>
                  <span className="skeleton-text"></span>
                </div>
              ))
            : shortcuts.map((shortcut) => (
                <ShortcutIcon
                  key={shortcut.id}
                  id={shortcut.id}
                  icon={shortcut.icon}
                  label={shortcut.label}
                  target={shortcut.target}
                  onDelete={handleDeleteShortcut}
                  onUpdate={handleUpdateShortcut}
                  changingStatus={changingStatus}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDrop={handleDrop}
                  draggedItem={draggedItem}
                />
              ))}
          <AddShortcutButton targelShortcut={changingStatus} />
          {/* Reserve space for AddShortcut form to prevent layout shift */}
        </div>

        <div
          className="container"
          style={{ minHeight: "120px", margin: "10px" }}
        >
          <div
            className="weather-widget"
            style={{ minHeight: "110", maxHeight: "120" }}
          >
            <div className="card time-card" style={{ minHeight: "120px" }}>
              {horlogeType === 0 ? (
                <Horloge />
              ) : horlogeType === 1 ? (
                <NumericalTimer />
              ) : (
                <>
                  <Horloge />
                  <NumericalTimer />
                </>
              )}

              <button
                className="TimeSwitcher"
                type="button"
                onClick={changeHorloge}
              ></button>
            </div>
            <DateComponent />
          </div>
          <WeatherWithPray
            i_state={state}
            i_error={error}
            i_loading={loading}
            i_data={data}
          />
          {/* <Weather /> */}
        </div>

        <div className="inputContainer">
          <SearchBar />
        </div>
      </div>
    </>
  );
}
