import { createLazyFileRoute } from "@tanstack/react-router";
import Horloge from "../Horloge";
import DateComponent from "../DateComponent";
import { NumericalTimer } from "../NumericalTimer";
import WeatherWithPray from "../WeatherWithPray";
// import Weather from "../Weather";
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
import { useState, useEffect } from "react"; // Removed
import BarMenuSettings from "../BarMenuSettings";
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
  const analyzeImage = (imageUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          let r = 0,
            g = 0,
            b = 0;
          let pixelCount = 0;

          // Sample every 10th pixel for performance
          for (let i = 0; i < data.length; i += 40) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            pixelCount++;
          }

          r = Math.floor(r / pixelCount);
          g = Math.floor(g / pixelCount);
          b = Math.floor(b / pixelCount);

          // Calculate brightness
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          const isDark = brightness < 128;

          // Generate complementary colors
          const dominantColor = `rgb(${r}, ${g}, ${b})`;
          const accentColor = isDark
            ? `rgb(${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)})`
            : `rgb(${Math.max(0, r - 50)}, ${Math.max(0, g - 50)}, ${Math.max(0, b - 50)})`;
          const textColor = isDark ? "#ffffff" : "#333333";

          const theme = {
            isDark,
            dominantColor,
            accentColor,
            textColor,
            brightness,
          };

          resolve(theme);
        } catch (error) {
          console.log("Error analyzing image:", error);
          resolve({
            isDark: false,
            dominantColor: "#ffffff",
            accentColor: "#667eea",
            textColor: "#333333",
            brightness: 128,
          });
        }
      };

      img.onerror = () => {
        resolve({
          isDark: false,
          dominantColor: "#ffffff",
          accentColor: "#667eea",
          textColor: "#333333",
          brightness: 128,
        });
      };

      img.src = imageUrl;
    });
  };

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
    console.log("Fetching prayer times for state:", state);
  }, [state]);

  // Function to reload shortcuts from database
  const reloadShortcuts = async () => {
    try {
      const updatedShortcuts = await getShortcuts();
      console.log(
        "Reloaded shortcuts:",
        updatedShortcuts.map((s) => ({
          id: s.id,
          label: s.label,
          order: s.order,
        }))
      );
      setShortcuts(updatedShortcuts);
    } catch (error) {
      console.error("Error reloading shortcuts:", error);
    }
  };
  // Removed unused horlogeType state

  const changingStatus = () => {
    setShowAddShortcut((e) => !e);
  };
  const changingBarStatus = () => {
    setShowBarSettings((e) => !e);
    // console.log(showBarSettings, "good?");
  };

  const changeHorloge = () => {
    // console.log(horlogeType);
    sethorlogeType(horlogeType + 1);
    if (horlogeType > 1) {
      sethorlogeType(0);
    }
    // Function kept for future use if needed
  };

  useEffect(() => {
    const fetchShortcuts = async () => {
      // Initialize order for existing shortcuts that don't have it
      await initializeShortcutsOrder();

      // Load shortcuts using the reload function
      await reloadShortcuts();
    };

    fetchShortcuts();
  }, []);

  const handleSaveShortcut = async () => {
    // Wait a bit longer to ensure database write is complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Use the reload function
    await reloadShortcuts();
  };

  const handleDeleteShortcut = async (idToDelete) => {
    try {
      await deleteShortcut(idToDelete);
      console.log("Shortcut deleted!");

      // Reload shortcuts after deletion
      await reloadShortcuts();
    } catch (error) {
      console.error("Error deleting shortcut:", error);
      alert("Failed to delete shortcut. Please try again.");
    }
  };

  const handleUpdateShortcut = async (updatedShortcut) => {
    try {
      // Update the shortcut in the database
      await updateShortcut(updatedShortcut.id, updatedShortcut);
      console.log("Shortcut updated in database");

      // Reload shortcuts to ensure consistency
      await reloadShortcuts();
    } catch (error) {
      console.error("Error updating shortcut:", error);
      alert("Failed to update shortcut. Please try again.");
    }
  };

  // Drag and drop handlers
  const handleDragStart = (id) => {
    setDraggedItem(id);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDrop = async (targetId) => {
    if (draggedItem === null || draggedItem === targetId) return;

    const draggedIndex = shortcuts.findIndex((s) => s.id === draggedItem);
    const targetIndex = shortcuts.findIndex((s) => s.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Create new array with reordered items
    const newShortcuts = [...shortcuts];
    const [draggedShortcut] = newShortcuts.splice(draggedIndex, 1);
    newShortcuts.splice(targetIndex, 0, draggedShortcut);

    console.log(
      "New order after drop:",
      newShortcuts.map((s) => ({ id: s.id, label: s.label }))
    );

    // Update state
    setShortcuts(newShortcuts);

    // Update database
    try {
      await updateShortcutsOrder(newShortcuts);
      console.log("Successfully updated order in database");
    } catch (error) {
      console.error("Failed to update shortcuts order:", error);
      // Revert state on error
      setShortcuts(shortcuts);
    }
  };

  console.log("data :", data);
  console.log("state :", state);

  return (
    <>
      <div className="routeContainer">
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
          style={{ display: "flex", flexWrap: "wrap", padding: "20px" }}
        >
          {/* Website shortcut */}
          {shortcuts.map((shortcut) => (
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
          <AddShortcutButton targelShortcut={changingStatus} />{" "}
          {/* Fixed prop */}
          {showAddShortcut && (
            <div
              className="AddShortcut_routeContainer"
              style={{
                padding: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "50px",
                marginLeft: "10px",
              }}
            >
              <AddShortcut
                changingStatus={changingStatus}
                handleSaveShortcut={handleSaveShortcut}
                mode={true}
              />
            </div>
          )}
        </div>

        <div className="container">
          <div className="weather-widget">
            <div className="card time-card">
              {horlogeType === 0 ? (
                <>
                  <Horloge />
                  <NumericalTimer />
                </>
              ) : horlogeType === 1 ? (
                <NumericalTimer />
              ) : (
                <Horloge />
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
