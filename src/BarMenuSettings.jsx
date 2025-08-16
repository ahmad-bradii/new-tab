import React, { useState, useEffect } from "react";
import styled from "styled-components";

// Styled Components
const SettingsContainer = styled.div`
  background: ${(props) =>
    props.darkMode
      ? "linear-gradient(135deg, #232526 0%, #414345 100%)"
      : "rgb(255, 255, 255)"};
  color: ${(props) => (props.darkMode ? "#fff" : "#222")};
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  font-family: "Segoe UI", sans-serif;
  margin-top: 10px;
  border-radius: 20px;
  transition: all 0.3s ease;
`;

const SettingsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 25px;
  font-size: 20px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const SettingsSection = styled.fieldset`
  border: 2px solid
    ${(props) => (props.darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)")};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  background: ${(props) =>
    props.darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"};
  transition: all 0.3s ease;

  &:hover {
    border-color: ${(props) =>
      props.darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"};
    transform: translateY(-2px);
  }
`;

const SectionTitle = styled.legend`
  font-weight: 600;
  font-size: 16px;
  padding: 0 12px;
  color: ${(props) => (props.darkMode ? "#fff" : "#333")};
  background: ${(props) => (props.darkMode ? "#232526" : "#fff")};
  border-radius: 6px;
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const ToggleLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

const Toggle = styled.div`
  position: relative;
  width: 50px;
  height: 25px;
  background: ${(props) =>
    props.checked ? "#4CAF50" : props.darkMode ? "#555" : "#ccc"};
  border-radius: 25px;
  cursor: pointer;
  transition: background 0.3s ease;

  &::after {
    content: "";
    position: absolute;
    top: 2px;
    left: ${(props) => (props.checked ? "27px" : "2px")};
    width: 21px;
    height: 21px;
    background: white;
    border-radius: 50%;
    transition: left 0.3s ease;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }
`;

const SelectContainer = styled.div`
  margin-bottom: 16px;
`;

const SelectLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: ${(props) => (props.darkMode ? "#e8e8e8" : "#333")};
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 12px 15px;
  border: 2px solid ${(props) => (props.darkMode ? "#555" : "#ddd")};
  border-radius: 8px;
  background: ${(props) => (props.darkMode ? "#333" : "#fff")};
  color: ${(props) => (props.darkMode ? "#fff" : "#333")};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:hover {
    border-color: ${(props) => (props.darkMode ? "#666" : "#bbb")};
  }
`;

const ImageSection = styled.div`
  margin-bottom: 16px;
`;

const ImagePreview = styled.div`
  width: 100%;
  height: 120px;
  border: 2px dashed ${(props) => (props.darkMode ? "#555" : "#ddd")};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  background: ${(props) =>
    props.image ? `url(${props.image})` : props.darkMode ? "#333" : "#f8f8f8"};
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
  }
`;

const ImagePlaceholder = styled.div`
  text-align: center;
  color: ${(props) => (props.darkMode ? "#777" : "#999")};
  font-size: 14px;
  display: ${(props) => (props.hasImage ? "none" : "block")};
`;

const FileInput = styled.input`
  display: none;
`;

const FileInputLabel = styled.label`
  display: inline-block;
  padding: 10px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  margin-right: 10px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
  }
`;

const ActionButton = styled.button`
  width: 100%;
  background: linear-gradient(90deg, #43cea2 0%, #185a9d 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: ${(props) => (props.compact ? "8px 0" : "14px 0")};
  font-weight: bold;
  font-size: 16px;
  letter-spacing: 1px;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(67, 206, 162, 0.12);
  transition: all 0.3s ease;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(67, 206, 162, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

function BarMenuSettings({ action, changeHorlogeStyle, setState }) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  const [compactMode, setCompactMode] = useState(() => {
    const saved = localStorage.getItem("compactMode");
    return saved ? JSON.parse(saved) : false;
  });

  const [image, setImage] = useState(() => {
    const saved = localStorage.getItem("backgroundImage");
    return saved || "./44.jpg";
  });

  const [notification, setNotification] = useState("");

  // Save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("compactMode", JSON.stringify(compactMode));
  }, [compactMode]);

  useEffect(() => {
    localStorage.setItem("selectedCountry", country);
  }, [country]);

  useEffect(() => {
    localStorage.setItem("backgroundImage", image);
  }, [image]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        showNotification("Please select an image smaller than 5MB", "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
        showNotification("Background image updated!", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage("./44.jpg"); // Reset to default
    showNotification("Background reset to default", "success");
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(""), 3000);
  };

  const handleSaveSettings = () => {
    showNotification("All settings saved successfully!", "success");
  };

  return (
    <SettingsContainer darkMode={darkMode}>
      <SettingsHeader>⚙️ Settings Panel</SettingsHeader>

      {notification && (
        <div
          style={{
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "16px",
            background: notification.type === "success" ? "#d4edda" : "#f8d7da",
            color: notification.type === "success" ? "#155724" : "#721c24",
            border: `1px solid ${notification.type === "success" ? "#c3e6cb" : "#f5c6cb"}`,
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          {notification.message}
        </div>
      )}

      <SettingsSection darkMode={darkMode}>
        <SectionTitle darkMode={darkMode}>🎨 Appearance</SectionTitle>

        <ToggleContainer>
          <ToggleLabel>🌙 Dark Mode</ToggleLabel>
          <Toggle
            checked={darkMode}
            darkMode={darkMode}
            onClick={() => setDarkMode(!darkMode)}
          />
        </ToggleContainer>

        <ToggleContainer>
          <ToggleLabel>📱 Compact Mode</ToggleLabel>
          <Toggle
            checked={compactMode}
            darkMode={darkMode}
            onClick={() => setCompactMode(!compactMode)}
          />
        </ToggleContainer>
      </SettingsSection>

      <SettingsSection darkMode={darkMode}>
        <SectionTitle darkMode={darkMode}>🌍 Location</SectionTitle>

        <SelectContainer>
          <SelectLabel darkMode={darkMode}>Select Your City</SelectLabel>
          <StyledSelect
            darkMode={darkMode}
            value={country}
            onChange={(e) => setState(e.target.value)}
          >
            <option value="Tunis">Tunis</option>
            <option value="Sfax">Sfax</option>
            <option value="Sousse">Sousse</option>
            <option value="Monastir">Monastir</option>
          </StyledSelect>
        </SelectContainer>
      </SettingsSection>

      <SettingsSection darkMode={darkMode}>
        <SectionTitle darkMode={darkMode}>🖼️ Background</SectionTitle>

        <ImageSection>
          <ImagePreview darkMode={darkMode} image={image}>
            <ImagePlaceholder
              darkMode={darkMode}
              hasImage={image && image !== "./44.jpg"}
            >
              📸 Click to upload background image
            </ImagePlaceholder>
          </ImagePreview>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <FileInputLabel htmlFor="imageUpload">
              📁 Upload Image
            </FileInputLabel>
            <FileInput
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />

            {image && image !== "./44.jpg" && (
              <ActionButton
                compact
                onClick={removeImage}
                style={{
                  width: "auto",
                  padding: "10px 16px",
                  background:
                    "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
                  margin: 0,
                }}
              >
                🗑️ Reset
              </ActionButton>
            )}
          </div>
        </ImageSection>
      </SettingsSection>

      <ActionButton compact={compactMode} onClick={action}>
        🕐 Change Horloge Style
      </ActionButton>

      <ActionButton compact={compactMode} onClick={handleSaveSettings}>
        💾 Save All Settings
      </ActionButton>

      <ActionButton
        compact={compactMode}
        onClick={action}
        style={{
          background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
          marginBottom: 0,
        }}
      >
        ❌ Close Settings
      </ActionButton>
    </SettingsContainer>
  );
}

export default BarMenuSettings;
