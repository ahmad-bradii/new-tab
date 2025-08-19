const analyzeImage = (
  imageUrl: string
): Promise<{
  isDark: boolean;
  dominantColor: string;
  accentColor: string;
  textColor: string;
  brightness: number;
}> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;

      if (!ctx) {
        resolve({
          isDark: false,
          dominantColor: "#ffffff",
          accentColor: "#667eea",
          textColor: "#333333",
          brightness: 128,
        });
        return;
      }

      ctx.drawImage(img, 0, 0);

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let r = 0,
          g = 0,
          b = 0;
        let pixelCount = 0;

        // Sample every 10th pixel for performance
        for (let i = 0; i < data.length; i += 40) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          pixelCount++;
        }

        r = Math.floor(r / pixelCount);
        g = Math.floor(g / pixelCount);
        b = Math.floor(b / pixelCount);

        // Calculate brightness
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        const isDark = brightness < 128;

        // Generate complementary colors
        const dominantColor = `rgb(${r}, ${g}, ${b})`;
        const accentColor = isDark
          ? `rgb(${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)})`
          : `rgb(${Math.max(0, r - 50)}, ${Math.max(0, g - 50)}, ${Math.max(0, b - 50)})`;
        const textColor = isDark ? "#ffffff" : "#333333";

        const theme = {
          isDark,
          dominantColor,
          accentColor,
          textColor,
          brightness,
        };

        resolve(theme);
      } catch (error) {
        console.log("Error analyzing image:", error);
        resolve({
          isDark: false,
          dominantColor: "#ffffff",
          accentColor: "#667eea",
          textColor: "#333333",
          brightness: 128,
        });
      }
    };

    img.onerror = () => {
      resolve({
        isDark: false,
        dominantColor: "#ffffff",
        accentColor: "#667eea",
        textColor: "#333333",
        brightness: 128,
      });
    };

    img.src = imageUrl;
  });
};

export { analyzeImage };
