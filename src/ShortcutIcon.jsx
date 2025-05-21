import PropTypes from "prop-types";
import AddShortcut from "./AddShortcuts";
import { useState } from "react";

const ShortcutIcon = ({ icon, id, label, target, onDelete, onUpdate }) => {
  const [showShortcutlabel, setShortcutlabel] = useState(true);
  const [showlabel, setshowlable] = useState(true);
  const changingStatus = () => {
    setShortcutlabel((e) => !e);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
        width: "80px",
        height: "80px",
        margin: "10px",
        textAlign: "center",
        borderRadius: "14px",
        position: "relative", // <-- Needed for absolute button
      }}
      onMouseEnter={() => setshowlable(false)}
      onMouseLeave={() => setshowlable(true)}
      className="shortcut_container"
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
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          cursor: "pointer",
          margin: "10px",
          width: "80px",
          height: "80px",
          textAlign: "center",
          borderRadius: "14px",
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
  onClick: PropTypes.func,
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
