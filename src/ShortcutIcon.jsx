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
    <>
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
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`shortcut_container ${isCurrentlyDragged ? "dragging" : ""} ${isDraggedOver ? "drag-over" : ""}`}
        onMouseEnter={() => setshowlable(false)}
        onMouseLeave={() => setshowlable(true)}
      >
        <button
          className={`delte-edit-tab ${showlabel ? "hidden" : "visible"}`}
          onClick={changingStatus}
          tabIndex={-1}
          type="button"
        >
          {showShortcutlabel ? "✎" : ""}
        </button>
        <a href={target} className="shortcut-icon" onClick={handleLinkClick}>
          <img
            src={icon}
            alt={label}
            className="icon"
            width="40"
            height="40"
            loading="lazy"
            onError={(e) => {
              // Fallback to a placeholder if image fails to load
              e.target.style.backgroundColor = "#f0f0f0";
              e.target.style.display = "flex";
              e.target.style.alignItems = "center";
              e.target.style.justifyContent = "center";
              e.target.textContent = label.charAt(0).toUpperCase();
            }}
          />
          <span>{label}</span>
        </a>
      </div>
    </>
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
    <div className="add-shortcut-container">
      <button
        onClick={targelShortcut}
        className="add-shortcut-button"
        aria-label="Add shortcut"
      >
        +
      </button>
      <span>Add shortcut</span>
    </div>
  );
}
