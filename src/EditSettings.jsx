import { HiOutlineCog8Tooth } from "react-icons/hi2";

function EditSettings({ action }) {
  return (
    <div className="setting_button" style={{ textAlign: "center" }}>
      <button
        onClick={action}
        style={{
          backgroundColor: "transparent",
          color: "#6f6d6dff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "20px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <HiOutlineCog8Tooth />
      </button>
    </div>
  );
}

export default EditSettings;
