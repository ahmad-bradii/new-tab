import { useState, useEffect, memo } from "react";

const OptimizedImage = ({
  src,
  alt,
  className,
  width,
  height,
  onLoad,
  onError,
  placeholder = null,
}) => {
  const [imageState, setImageState] = useState("loading");
  const [imageSrc, setImageSrc] = useState(placeholder);

  useEffect(() => {
    if (!src) return;

    const img = new Image();

    img.onload = () => {
      setImageSrc(src);
      setImageState("loaded");
      onLoad?.();
    };

    img.onerror = () => {
      setImageState("error");
      onError?.(img);
    };

    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, onLoad, onError]);

  return (
    <div className={`optimized-image-container ${className || ""}`}>
      {imageState === "loading" && (
        <div
          className="image-placeholder skeleton"
          style={{ width, height }}
          aria-label="Loading image..."
        />
      )}

      {imageState === "error" && (
        <div
          className="image-error"
          style={{
            width,
            height,
            backgroundColor: "#f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "8px",
            fontSize: "24px",
            fontWeight: "bold",
            color: "#666",
          }}
        >
          {alt?.charAt(0)?.toUpperCase() || "?"}
        </div>
      )}

      {imageSrc && imageState !== "error" && (
        <img
          src={imageSrc}
          alt={alt}
          className={`${className || ""} ${imageState === "loaded" ? "loaded" : ""}`}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          style={{
            opacity: imageState === "loaded" ? 1 : 0,
            transition: "opacity 0.3s ease-in-out",
          }}
        />
      )}
    </div>
  );
};

export default memo(OptimizedImage);
