import { useState, useEffect } from "react";
import styled from "styled-components";
import { HiMiniArrowLongRight } from "react-icons/hi2";
import { GrClearOption } from "react-icons/gr";
// Styled Components
const SettingsContainer = styled.div`
  background: ${(props) =>
    props.darkMode
      ? "linear-gradient(135deg, #232526 0%, #414345 100%)"
      : "rgba(255, 255, 255, 1)"};
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
  align-items: left;
  justify-content: left;
  font-size: 22px;
  background: rgba(19, 63, 25, 1);
  gap: 12px;
  margin-bottom: 25px;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;
const TitleHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 27px;
  background: rgba(8, 122, 24, 1);
  gap: 12px;
  margin-bottom: 25px;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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
  background: transparent;
  color: ${(props) => (props.darkMode ? "#fff" : "#333")};
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
  background: transparent;

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

function BarMenuSettings({
  action,
  changeHorlogeStyle,
  setState,
  state,
  backgroundImage,
  setBackgroundImage,
  backgroundTheme,
}) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  const [compactMode, setCompactMode] = useState(() => {
    const saved = localStorage.getItem("compactMode");
    return saved ? JSON.parse(saved) : false;
  });

  const [notification, setNotification] = useState("");
  const [newState, setNewState] = useState(state);

  // Save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("compactMode", JSON.stringify(compactMode));
  }, [compactMode]);

  useEffect(() => {
    localStorage.setItem("selectedCountry", state);
  }, [state]);

  useEffect(() => {
    localStorage.setItem("backgroundImage", backgroundImage);
  }, [backgroundImage]);

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
        setBackgroundImage(event.target.result);
        showNotification("Background image updated!", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setBackgroundImage("./11.jpg"); // Reset to default background
    showNotification("Background reset to default", "success");
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(""), 3000);
  };

  const handleSaveSettings = () => {
    if (newState) setState(newState);
    showNotification("All settings saved successfully!", "success");
  };

  return (
    <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
      <SettingsContainer
        darkMode={darkMode}
        style={{ width: "400px", minWidth: "320px", position: "relative" }}
      >
        {/* Top-right ActionButton */}
        <div style={{ position: "absolute", top: 16, right: 16, zIndex: 2 }}>
          <ActionButton
            compact={compactMode}
            onClick={action}
            style={{
              background: "transparent",
              marginBottom: 0,
              width: "40px",
              height: "40px",
              color: darkMode ? "#fff" : "#333",
              fontSize: "22px",
              padding: 7,
              minWidth: 0,
              justifyContent: "center",
            }}
          >
            <HiMiniArrowLongRight />
          </ActionButton>
        </div>
        <TitleHeader>Settings Panel</TitleHeader>

        {notification && (
          <div
            style={{
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "16px",
              background:
                notification.type === "success" ? "#d4edda" : "#f8d7da",
              color: notification.type === "success" ? "#155724" : "#721c24",
              border: `1px solid ${notification.type === "success" ? "#c3e6cb" : "#f5c6cb"}`,
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            {notification.message}
          </div>
        )}

        <ActionButton compact={compactMode} onClick={changeHorlogeStyle}>
          <SelectLabel darkMode={darkMode}>🕐 Change Horloge Style</SelectLabel>
        </ActionButton>
        <ActionButton compact={compactMode} onClick={handleSaveSettings}>
          <SelectLabel darkMode={darkMode}>💾 Save All Settings</SelectLabel>
        </ActionButton>

        <SettingsHeader>Appearance</SettingsHeader>

        <ToggleContainer>
          <ToggleLabel>🌙 Dark Mode</ToggleLabel>
          <Toggle
            checked={darkMode}
            darkMode={darkMode}
            onClick={() => setDarkMode(!darkMode)}
          />
        </ToggleContainer>

        {/* <ToggleContainer>
          <ToggleLabel>📱 Compact Mode</ToggleLabel>
          <Toggle
            checked={compactMode}
            darkMode={darkMode}
            onClick={() => setCompactMode(!compactMode)}
          />
        </ToggleContainer> */}

        <SettingsHeader>Location</SettingsHeader>

        <SelectContainer>
          <SelectLabel darkMode={darkMode}>Select Your City</SelectLabel>
          <input
            type="text"
            placeholder="Enter your city"
            onChange={(e) => setNewState(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
        </SelectContainer>
        <SettingsHeader>Background & Theme</SettingsHeader>

        {backgroundTheme && (
          <div
            style={{
              padding: "12px",
              marginBottom: "16px",
              borderRadius: "8px",
              background: `linear-gradient(135deg, ${backgroundTheme.dominantColor}20, ${backgroundTheme.accentColor}10)`,
              border: `1px solid ${backgroundTheme.dominantColor}30`,
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "8px",
                color: darkMode ? "#fff" : "#333",
              }}
            >
              🎨 Current Theme Analysis
            </div>
            <div
              style={{
                fontSize: "12px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "4px",
                color: darkMode ? "#e8e8e8" : "#666",
              }}
            >
              <span>
                Brightness:{" "}
                {backgroundTheme.brightness > 128 ? "☀️ Light" : "🌙 Dark"}
              </span>
              <span>
                Dominant:{" "}
                <span
                  style={{
                    display: "inline-block",
                    width: "12px",
                    height: "12px",
                    backgroundColor: backgroundTheme.dominantColor,
                    borderRadius: "2px",
                    marginLeft: "4px",
                    border: "1px solid #ccc",
                  }}
                ></span>
              </span>
            </div>
          </div>
        )}

        <ImageSection>
          <ImagePreview darkMode={darkMode} image={backgroundImage}>
            <ImagePlaceholder
              darkMode={darkMode}
              hasImage={backgroundImage && backgroundImage !== "./11.jpg"}
            >
              📸 Click to upload background image
            </ImagePlaceholder>
          </ImagePreview>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <FileInputLabel htmlFor="imageUpload">
              <ToggleLabel style={{ color: darkMode ? "#fff" : "#333" }}>
                📁 Upload Image
              </ToggleLabel>
            </FileInputLabel>
            <FileInput
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />

            {backgroundImage && backgroundImage !== "./11.jpg" && (
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
                <GrClearOption /> Reset
              </ActionButton>
            )}
          </div>
        </ImageSection>
      </SettingsContainer>
    </div>
  );
}

export default BarMenuSettings;
