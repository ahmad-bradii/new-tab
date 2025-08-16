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

  const handleCreateShortcut = async (e) => {
    const data = fetchingData(e);
    if (!data) return;
    const newShortcut = {
      id: Date.now(),
      label: data.name,
      icon: `https://www.google.com/s2/favicons?domain=${data.domain}&sz=128`,
      target: data.url,
    };

    try {
      await addShortcut(newShortcut);
      console.log("Shortcut added successfully!");
      if (handleSaveShortcut) await handleSaveShortcut();
      changingStatus(); // Close the add shortcut form
    } catch (error) {
      console.error("Error adding shortcut:", error);
      alert("Failed to add shortcut. Please try again.");
    }
  };

  const handleUpdateShortcut = async (e) => {
    const data = fetchingData(e);
    if (!data) return;
    const newShortcut = {
      label: data.name,
      icon: `https://www.google.com/s2/favicons?domain=${data.domain}&sz=128`,
      target: data.url,
    };

    try {
      await updateShortcut(id, newShortcut);
      onUpdate({ ...newShortcut, id });
      console.log("Shortcut updated!");
      changingStatus(); // Close the edit form
    } catch (error) {
      console.error("Error updating shortcut:", error);
      alert("Failed to update shortcut. Please try again.");
    }
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
    background: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(4px)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    boxSizing: "border-box",
  };

  const cardStyle = {
    background: "#ffffff",
    borderRadius: 20,
    padding: "32px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3), 0 8px 25px rgba(0, 0, 0, 0.2)",
    minWidth: "320px",
    maxWidth: "450px",
    width: "100%",
    maxHeight: "90vh",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    display: "flex",
    flexDirection: "column",
    gap: 20,
    animation: "modalSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden",
  };

  const titleStyle = {
    fontSize: "28px",
    fontWeight: 700,
    marginBottom: "8px",
    color: "#1a202c",
    letterSpacing: "-0.5px",
    textAlign: "center",
  };

  const descStyle = {
    fontSize: "16px",
    color: "#718096",
    marginBottom: "24px",
    textAlign: "center",
    lineHeight: 1.5,
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    marginBottom: "16px",
    borderRadius: "12px",
    border: "2px solid #e2e8f0",
    fontSize: "16px",
    background: "#f7fafc",
    transition: "all 0.2s ease",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  const buttonRowStyle = {
    display: "flex",
    gap: "12px",
    marginTop: "8px",
  };

  const primaryBtn = {
    padding: "14px 0",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "16px",
    flex: 1,
    transition: "all 0.2s ease",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
  };

  const dangerBtn = {
    ...primaryBtn,
    background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
    boxShadow: "0 4px 15px rgba(255, 107, 107, 0.4)",
  };

  const doneBtn = {
    ...primaryBtn,
    background: "linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)",
    boxShadow: "0 4px 15px rgba(116, 185, 255, 0.4)",
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
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
        <div id="modal-title" style={titleStyle}>
          {mode ? "Add Shortcut" : "Edit Shortcut"}
        </div>
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
          @keyframes modalSlideIn {
            from { 
              opacity: 0; 
              transform: translateY(30px) scale(0.95);
            }
            to { 
              opacity: 1; 
              transform: translateY(0) scale(1);
            }
          }
          
          input:focus {
            border: 2px solid #667eea !important;
            background: #ffffff !important;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
          }
          
          button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          }
          
          button:active {
            transform: translateY(0);
            opacity: 0.9;
          }
          
          input::placeholder {
            color: #a0aec0;
            font-weight: 400;
          }
        `}
      </style>
    </div>
  );
};

export default AddShortcut;
