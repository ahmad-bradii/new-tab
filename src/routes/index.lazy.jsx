import { createLazyFileRoute } from "@tanstack/react-router";
import Horloge from "../Horloge";
import DateComponent from "../DateComponent";
import { NumericalTimer } from "../NumericalTimer";
import WeatherWithPray from "../WeatherWithPray";
// import Weather from "../Weather";
import SearchBar from "../SearchBar";
import Header from "../Header";
import ShortcutIcon, { AddShortcutButton } from "../ShortcutIcon";
import { getShortcuts, deleteShortcut } from "../dbHelper";
import AddShortcut from "../AddShortcuts";
import { useState, useEffect } from "react"; // Removed
import BarMenuSettings from "../BarMenuSettings";
//

export const Route = createLazyFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  // Removed 'async'
  const [countryName, setCountryName] = useState("sfax");
  const [shortcuts, setShortcuts] = useState([]);
  const [horlogeType, sethorlogeType] = useState(0);
  const [showAddShortcut, setShowAddShortcut] = useState(false);
  const [showBarSettings, setShowBarSettings] = useState(false);
  // Removed unused horlogeType state

  const changingStatus = () => {
    setShowAddShortcut((e) => !e);
  };
  const changingBarStatus = () => {
    setShowBarSettings((e) => !e);
    console.log(showBarSettings, "good?");
  };

  const changeHorloge = () => {
    console.log(horlogeType);
    sethorlogeType(horlogeType + 1);
    if (horlogeType > 1) {
      sethorlogeType(0);
    }
    // Function kept for future use if needed
  };

  useEffect(() => {
    const fetchShortcuts = async () => {
      const shortcuts = await getShortcuts();
      setShortcuts(shortcuts);
    };

    fetchShortcuts();
  }, []);

  const handleSaveShortcut = async () => {
    await new Promise((resolve) => setTimeout(resolve, 5)); // Wait for 10 seconds
    const shortcuts = await getShortcuts();
    console.log(shortcuts); // Check if the shortcuts have changed
    setShortcuts(shortcuts);
  };

  const handleDeleteShortcut = (idToDelete) => {
    setShortcuts((prev) =>
      prev.filter((shortcut) => shortcut.id != idToDelete)
    );
    deleteShortcut(idToDelete);
    console.log("Shortcut deleted!");
  };

  const handleUpdateShortcut = (updatedShortcut) => {
    setShortcuts((prevShortcuts) =>
      prevShortcuts.map((sc) =>
        sc.id === updatedShortcut.id ? { ...sc, ...updatedShortcut } : sc
      )
    );
    console.log("updated here");
  };

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
          <WeatherWithPray />
          {/* <Weather /> */}
        </div>

        <div className="inputContainer">
          <SearchBar />
        </div>
      </div>
    </>
  );
}
