import { useRef, useState, memo } from "react";
import { Pencil } from "lucide-react";
import { clampTile, PITCH_X, PITCH_Y } from "./shortcutLayout";

// Movement (px) before a press turns into a drag, so plain clicks still open
const DRAG_THRESHOLD = 5;

const ARROWS = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

const ShortcutIcon = ({ shortcut, position, bounds, onMove, onDrag, onEdit }) => {
  const { id, icon, label, target } = shortcut;
  const [dragPos, setDragPos] = useState(null);
  const [iconFailed, setIconFailed] = useState(false);
  const press = useRef(null);
  const latest = useRef(null);
  const didDrag = useRef(false);

  const handlePointerDown = (e) => {
    if (e.button !== 0 || e.target.closest(".tile__edit")) return;
    press.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: position.x,
      originY: position.y,
    };
    didDrag.current = false;
  };

  const handlePointerMove = (e) => {
    const p = press.current;
    if (!p || p.pointerId !== e.pointerId) return;
    const dx = e.clientX - p.startX;
    const dy = e.clientY - p.startY;
    if (!didDrag.current) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      didDrag.current = true;
      // Capture only once it is a drag; capturing on press would retarget
      // the click away from the link and break normal navigation.
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    latest.current = clampTile(p.originX + dx, p.originY + dy, bounds);
    setDragPos(latest.current);
    onDrag(latest.current);
  };

  const finishDrag = (e, commit) => {
    const p = press.current;
    if (!p || p.pointerId !== e.pointerId) return;
    press.current = null;
    if (didDrag.current && commit && latest.current) {
      onMove(id, latest.current);
    }
    if (didDrag.current) onDrag(null);
    setDragPos(null);
  };

  // A drag ends with a click on the tile; swallow it so the link doesn't open
  const handleClickCapture = (e) => {
    if (didDrag.current) {
      e.preventDefault();
      e.stopPropagation();
      didDrag.current = false;
    }
  };

  const handleKeyDown = (e) => {
    const dir = ARROWS[e.key];
    if (!dir || !e.altKey) return;
    e.preventDefault();
    // One grid cell per press; the page snaps and swaps as on drop
    onMove(id, {
      x: position.x + dir[0] * PITCH_X,
      y: position.y + dir[1] * PITCH_Y,
    });
  };

  const shown = dragPos || position;
  const isDragging = dragPos !== null;

  return (
    <div
      className={`tile ${isDragging ? "is-dragging" : "is-settling"}`}
      style={{ transform: `translate3d(${shown.x}px, ${shown.y}px, 0)` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(e) => finishDrag(e, true)}
      onPointerCancel={(e) => finishDrag(e, false)}
      onClickCapture={handleClickCapture}
    >
      <a
        href={target}
        className="tile__link"
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        onKeyDown={handleKeyDown}
        aria-describedby="tile-move-hint"
      >
        <span className="tile__icon glass">
          {iconFailed ? (
            <span className="tile__fallback" aria-hidden="true">
              {label?.charAt(0)?.toUpperCase() || "?"}
            </span>
          ) : (
            <img
              src={icon}
              alt=""
              width={36}
              height={36}
              draggable={false}
              decoding="async"
              onError={() => setIconFailed(true)}
            />
          )}
        </span>
        <span className="tile__label">{label}</span>
      </a>
      <button
        type="button"
        className="tile__edit glass glass--thick"
        onClick={() => onEdit(shortcut)}
        aria-label={`Edit ${label}`}
      >
        <Pencil aria-hidden="true" />
      </button>
    </div>
  );
};

export default memo(ShortcutIcon);
