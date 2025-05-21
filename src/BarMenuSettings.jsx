import { useState } from "react";

function BarMenuSettings({ action, changeHorlogeStyle }) {
  const [darkMode, setDarkMode] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [country, setCountry] = useState("1");
  const [image, setImage] = useState("./44.jpg");

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  return (
    <div
      style={{
        background: darkMode
          ? "linear-gradient(135deg, #232526 0%, #414345 100%)"
          : "rgb(255, 255, 255)",
        color: darkMode ? "#fff" : "#222",
        padding: "32px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <button
        style={{
          width: "100%",
          background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          padding: "2px 0",
          fontWeight: "bold",
          fontSize: "16px",
          letterSpacing: "1px",
          cursor: "pointer",
          boxShadow: "0 2px 12px rgba(67,206,162,0.12)",
          transition: "background 0.2s",
        }}
        onClick={action}
      >
        Close
      </button>
      <h2
        style={{
          textAlign: "center",
          marginBottom: "24px",
          letterSpacing: "1px",
        }}
      >
        <span role="img" aria-label="settings">
          ⚙️
        </span>{" "}
        Bar Menu Settings
      </h2>

      <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
        <label style={{ flex: 1, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode((v) => !v)}
            style={{ marginRight: "8px" }}
          />
          Dark Mode
        </label>
        <label style={{ flex: 1, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={compactMode}
            onChange={() => setCompactMode((v) => !v)}
            style={{ marginRight: "8px" }}
          />
          Compact Mode
        </label>
      </div>

      <fieldset
        style={{
          border: "1px solid #bbb",
          borderRadius: "10px",
          padding: "16px",
          marginBottom: "18px",
          background: darkMode ? "#333" : "#fff",
        }}
      >
        <legend style={{ fontWeight: "bold" }}>🌍 Change Country</legend>
        <label
          htmlFor="country-name"
          style={{ display: "block", marginTop: "8px" }}
        >
          <span style={{ fontSize: "15px" }}>Select Country</span>
          <select
            id="country-name"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            style={{
              marginLeft: "12px",
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid #aaa",
              background: darkMode ? "#222" : "#f9f9f9",
              color: darkMode ? "#fff" : "#222",
            }}
          >
            <option value="1">Tunis</option>
            <option value="2">Sfax</option>
          </select>
        </label>
      </fieldset>

      <fieldset
        style={{
          border: "1px solid #bbb",
          borderRadius: "10px",
          padding: "16px",
          background: darkMode ? "#333" : "#fff",
        }}
      >
        <legend style={{ fontWeight: "bold" }}>🖼️ Custom Page</legend>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <button
            style={{
              background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "8px 18px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(102,126,234,0.12)",
              transition: "background 0.2s",
            }}
            onClick={changeHorlogeStyle}
          >
            Change Horloge Style
          </button>
          <div>
            <p style={{ margin: "0 0 6px 0" }}>Choose image</p>
            <img
              src={image}
              alt="preview"
              style={{
                width: "120px",
                height: "120px",
                objectFit: "cover",
                borderRadius: "10px",
                border: "2px solid #eee",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            />
          </div>
          <div>
            <p style={{ margin: "0 0 6px 0" }}>Upload image</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{
                background: "none",
                color: darkMode ? "#fff" : "#222",
                border: "none",
              }}
            />
          </div>
        </div>
      </fieldset>

      <button
        style={{
          marginTop: "28px",
          width: "100%",
          background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          padding: "12px 0",
          fontWeight: "bold",
          fontSize: "16px",
          letterSpacing: "1px",
          cursor: "pointer",
          boxShadow: "0 2px 12px rgba(67,206,162,0.12)",
          transition: "background 0.2s",
        }}
      >
        💾 Save Settings
      </button>
    </div>
  );
}

export default BarMenuSettings;
