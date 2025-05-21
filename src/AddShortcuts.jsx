import { addShortcut, updateShortcut } from "./dbHelper";

const AddShortcut = ({
  changingStatus,
  handleSaveShortcut,
  onUpdate,
  id,
  mode,
  onDelete,
  target,
}) => {
  const fetchingData = (e) => {
    e.preventDefault();
    console.log("hello");
    console.log(target);
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) {
      console.error("Expected form element.");
      return null;
    }
    const formData = new FormData(form);
    const newName = formData.get("name");
    let newUrl = formData.get("url");
    if ((!newName || !newUrl) && mode) {
      alert("Please enter both Name and URL.");
      return null;
    }
    let domain;
    try {
      if (newUrl.length == 0) {
        newUrl = target;
      }
      domain = new URL(newUrl).hostname;
    } catch (err) {
      alert("Invalid URL");
      console.log(err);

      return null;
    }
    form.reset();
    return { name: newName, url: newUrl, domain };
  };

  const handleCreateShortcut = (e) => {
    const data = fetchingData(e);
    if (!data) return;
    const newShortcut = {
      id: Date.now(),
      label: data.name,
      icon: `https://www.google.com/s2/favicons?domain=${data.domain}&sz=128`,
      target: data.url,
    };
    addShortcut(newShortcut);
    if (handleSaveShortcut) handleSaveShortcut();
  };

  const handleUpdateShortcut = (e) => {
    const data = fetchingData(e);
    if (!data) return;
    const newShortcut = {
      label: data.name,
      icon: `https://www.google.com/s2/favicons?domain=${data.domain}&sz=128`,
      target: data.url,
    };
    updateShortcut(id, newShortcut);
    onUpdate({ ...newShortcut, id });
    console.log("Shortcut updated!");
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(id);
  };

  // Improved styles
  const modalStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(30, 34, 44, 0.45)",
    zIndex: 1001,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const cardStyle = {
    background: "#fff",
    borderRadius: 16,
    padding: "32px 28px",
    boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
    minWidth: 340,
    maxWidth: 400,
    width: "100%",
    border: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    gap: 18,
    animation: "fadeIn 0.3s",
  };

  const titleStyle = {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 2,
    color: "#22223b",
    letterSpacing: 0.2,
  };

  const descStyle = {
    fontSize: 15,
    color: "#4a4e69",
    marginBottom: 8,
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    marginBottom: 12,
    borderRadius: 6,
    border: "1px solid #c9c9c9",
    fontSize: 16,
    background: "#f8f9fa",
    transition: "border 0.2s",
    outline: "none",
  };

  const buttonRowStyle = {
    display: "flex",
    gap: "12px",
    marginTop: 8,
  };

  const primaryBtn = {
    padding: "10px 0",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 16,
    flex: 1,
    transition: "background 0.2s",
  };

  const dangerBtn = {
    ...primaryBtn,
    background: "rgba(224, 21, 21, 0.9)",
  };

  const doneBtn = {
    ...primaryBtn,
    background: "#64748b",
  };

  return (
    <div
      style={modalStyle}
      onClick={(e) => {
        if (e.target === e.currentTarget) changingStatus();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") changingStatus();
      }}
    >
      <div style={cardStyle}>
        <div style={titleStyle}>{mode ? "Add Shortcut" : "Edit Shortcut"}</div>
        <div style={descStyle}>
          {mode
            ? "Enter the details for your new shortcut."
            : "Update the shortcut details below."}
        </div>
        <form
          onSubmit={mode ? handleCreateShortcut : handleUpdateShortcut}
          autoComplete="off"
        >
          <input
            type="text"
            placeholder="Name"
            name="name"
            required
            style={inputStyle}
            autoFocus
          />
          <input
            type="text"
            placeholder="Url"
            name="url"
            required={!!mode}
            style={inputStyle}
          />
          <div style={buttonRowStyle}>
            <button type="submit" style={primaryBtn}>
              {mode ? "Add" : "Save"}
            </button>
            <button
              type="button"
              onClick={mode ? changingStatus : handleDeleteClick}
              style={mode ? doneBtn : dangerBtn}
            >
              {mode ? "Cancel" : "Delete"}
            </button>
          </div>
        </form>
      </div>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px);}
            to { opacity: 1; transform: translateY(0);}
          }
          input:focus {
            border: 1.5px solid rgba(114, 100, 100, 0.9) !important;
            background: #fff !important;
          }
          button:active {
            opacity: 0.85;
          }
        `}
      </style>
    </div>
  );
};

export default AddShortcut;
