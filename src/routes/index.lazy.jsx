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
  updateShortcutsOrder,
  initializeShortcutsOrder,
} from "../dbHelper";
import AddShortcut from "../AddShortcuts";
import { useState, useEffect } from "react"; // Removed
import BarMenuSettings from "../BarMenuSettings";
//

export const Route = createLazyFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  // Removed 'async'
  const [shortcuts, setShortcuts] = useState([]);
  const [horlogeType, sethorlogeType] = useState(0);
  const [showAddShortcut, setShowAddShortcut] = useState(false);
  const [showBarSettings, setShowBarSettings] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
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

      // Get shortcuts (now sorted by order)
      const shortcuts = await getShortcuts();
      console.log(
        "Loaded shortcuts with order:",
        shortcuts.map((s) => ({ id: s.id, label: s.label, order: s.order }))
      );
      setShortcuts(shortcuts);
    };

    fetchShortcuts();
  }, []);

  const handleSaveShortcut = async () => {
    await new Promise((resolve) => setTimeout(resolve, 5)); // Wait for 5ms
    const shortcuts = await getShortcuts(); // This will now return sorted shortcuts
    console.log(
      "Reloaded shortcuts after save:",
      shortcuts.map((s) => ({ id: s.id, label: s.label, order: s.order }))
    );
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
    // console.log("updated here");
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
