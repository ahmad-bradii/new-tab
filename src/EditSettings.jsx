function EditSettings({ action }) {
  return (
    <div className="setting_button" style={{ textAlign: "center" }}>
      <button
        onClick={action}
        style={{
          backgroundColor: "#184113",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "16px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        setting
      </button>
    </div>
  );
}

export default EditSettings;
