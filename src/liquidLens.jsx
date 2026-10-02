import { useEffect, useState } from "react";

// Chromium is the only engine that accepts an SVG filter in backdrop-filter.
// Elsewhere the capsule falls back to plain frosted glass.
export const supportsLens = () =>
  typeof navigator !== "undefined" &&
  !!navigator.userAgentData?.brands?.some((b) => b.brand === "Chromium");

// Builds a displacement map for a rounded rectangle. Inside a bezel along the
// edge, each pixel points inward along the edge normal, so the backdrop is
// sampled from further in: the edge bends light like a thick convex lens.
// Red encodes x, green encodes y; 128 means "no shift".
function buildMap(width, height, radius, bezel) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const image = ctx.createImageData(width, height);
  const { data } = image;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const px = x + 0.5;
      const py = y + 0.5;
      // Vector from the nearest point of the inner (radius-shrunk) rect
      const qx = px - Math.min(Math.max(px, radius), width - radius);
      const qy = py - Math.min(Math.max(py, radius), height - radius);
      const len = Math.hypot(qx, qy);
      const depth = radius - len; // distance in from the outer edge

      let dx = 0;
      let dy = 0;
      if (len > 0 && depth < bezel) {
        const t = 1 - Math.max(depth, 0) / bezel;
        const strength = t * t;
        dx = (-qx / len) * strength;
        dy = (-qy / len) * strength;
      }

      const i = (y * width + x) * 4;
      data[i] = 128 + dx * 127;
      data[i + 1] = 128 + dy * 127;
      data[i + 2] = 128;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL();
}

export function LiquidLens({ id, target, scale = 70 }) {
  const [map, setMap] = useState(null);

  useEffect(() => {
    const el = target.current;
    if (!el || !supportsLens()) return;

    let frame;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const width = Math.round(el.offsetWidth);
        const height = Math.round(el.offsetHeight);
        if (!width || !height) return;
        const radius = Math.min(height / 2, width / 2);
        setMap({
          width,
          height,
          href: buildMap(width, height, radius, Math.min(radius, 22)),
        });
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [target]);

  if (!map) return null;

  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
      <filter
        id={id}
        x="0"
        y="0"
        width={map.width}
        height={map.height}
        filterUnits="userSpaceOnUse"
        primitiveUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feImage
          href={map.href}
          x="0"
          y="0"
          width={map.width}
          height={map.height}
          preserveAspectRatio="none"
          result="map"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="map"
          scale={scale}
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}
