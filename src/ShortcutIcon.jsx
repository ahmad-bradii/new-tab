import PropTypes from "prop-types";
import AddShortcut from "./AddShortcuts";
import { useState } from "react";

const ShortcutIcon = ({
  icon,
  id,
  label,
  target,
  onDelete,
  onUpdate,
  onDragStart,
  onDragEnd,
  onDrop,
  draggedItem,
}) => {
  const [showShortcutlabel, setShortcutlabel] = useState(true);
  const [showlabel, setshowlable] = useState(true);
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const changingStatus = () => {
    setShortcutlabel((e) => !e);
  };

  const handleDragStart = (e) => {
    setIsDragging(true);
    onDragStart(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDraggedOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggedOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggedOver(false);
    onDrop(id);
  };

  const handleLinkClick = (e) => {
    // Prevent navigation if we just finished dragging
    if (isDragging) {
      e.preventDefault();
    }
  };

  const isCurrentlyDragged = draggedItem === id;

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`shortcut_container ${isCurrentlyDragged ? "dragging" : ""} ${isDraggedOver ? "drag-over" : ""}`}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "80px",
        height: "80px",
        margin: "10px",
        textAlign: "center",
        borderRadius: "14px",
        position: "relative", // <-- Needed for absolute button
      }}
      onMouseEnter={() => setshowlable(false)}
      onMouseLeave={() => setshowlable(true)}
    >
      <button
        className="delte-edit-tab"
        style={{
          position: "absolute",
          width: "22px",
          height: "22px",
          borderRadius: "50%",
          marginLeft: "60px",
          alignItems: "center",
          textAlign: "center",
          opacity: "30%",
          border: "0px",
          display: showlabel ? "none" : "block",
        }}
        onClick={changingStatus}
        tabIndex={-1} // Optional: prevent tab focus if not visible
        type="button"
      >
        {showShortcutlabel ? "✎" : ""}
      </button>
      <a
        href={target}
        className="shortcut-icon"
        onClick={handleLinkClick}
        style={{
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <img src={icon} alt={label} className="icon" />
        <span style={{ fontSize: "0.8rem" }}>{label}</span>
      </a>
      {!showShortcutlabel ? (
        <AddShortcut
          mode={false}
          changingStatus={changingStatus}
          onDelete={onDelete}
          id={id}
          onUpdate={onUpdate}
          target={target}
        />
      ) : null}
    </div>
  );
};

ShortcutIcon.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  target: PropTypes.string.isRequired,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onDelete: PropTypes.func,
  onUpdate: PropTypes.func,
  onDragStart: PropTypes.func,
  onDragEnd: PropTypes.func,
  onDrop: PropTypes.func,
  draggedItem: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default ShortcutIcon;

export function AddShortcutButton({ targelShortcut }) {
  return (
    <div
      className="shortcut-icon"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
        width: "80px",
        margin: "10px",
        textAlign: "center",
      }}
    >
      <button
        onClick={targelShortcut}
        className="shortcut-item add-shortcut-button"
        aria-label="Add shortcut"
        style={{
          fontSize: "1rem",
          marginBottom: "5px",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          cursor: "pointer",
        }}
      >
        +
      </button>
      <span style={{ fontSize: "0.8rem" }}>Add shortcut</span>
    </div>
  );
}
