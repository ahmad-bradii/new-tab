export const TILE_W = 88;
export const TILE_H = 96;
export const PITCH_X = 104;
export const PITCH_Y = 112;
const EDGE = 8;
const MAX_COLUMNS = 8;

export const clampTile = (x, y, bounds) => ({
  x: Math.min(Math.max(x, EDGE), bounds.width - TILE_W - EDGE),
  y: Math.min(Math.max(y, EDGE), bounds.height - TILE_H - EDGE),
});

const key = (cell) => `${cell.col},${cell.row}`;

// The grid cell nearest to a point in page pixels, kept inside the grid
export const cellAt = (px, grid) => ({
  col: Math.min(
    grid.columns - 1,
    Math.max(0, Math.round((px.x - grid.startX) / PITCH_X)),
  ),
  row: Math.max(0, Math.round((px.y - grid.startY) / PITCH_Y)),
});

export const cellToPx = (cell, grid) => ({
  x: grid.startX + cell.col * PITCH_X,
  y: grid.startY + cell.row * PITCH_Y,
});

// Places every shortcut on a grid centred under the search bar. Shortcuts the
// user has dragged keep their saved cell ({ col, row }); the rest fill the
// first free cells in order. Free-form positions saved by older versions are
// dropped, so those tiles flow back into the grid. Returns pixel positions, the
// cell of each shortcut, the grid geometry, the page bounds and where the
// grid ends.
export function layoutShortcuts(shortcuts, viewport, anchor) {
  const columns = Math.max(
    1,
    Math.min(
      MAX_COLUMNS,
      // +1 absorbs sub-pixel widths, so a 400px bar still fits four cells
      Math.floor((anchor.width + PITCH_X - TILE_W + 1) / PITCH_X),
    ),
  );
  const gridWidth = columns * PITCH_X - (PITCH_X - TILE_W);
  const grid = {
    columns,
    startX: anchor.left + anchor.width / 2 - gridWidth / 2,
    startY: anchor.bottom + 36,
  };

  const cells = new Map();
  const taken = new Set();
  const free = [];
  for (const shortcut of shortcuts) {
    const pos = shortcut.pos;
    const cell =
      Number.isInteger(pos?.col) && Number.isInteger(pos?.row) && pos.col < columns
        ? { col: pos.col, row: pos.row }
        : null;
    if (cell && !taken.has(key(cell))) {
      cells.set(shortcut.id, cell);
      taken.add(key(cell));
    } else {
      free.push(shortcut);
    }
  }

  let index = 0;
  const nextFreeCell = () => {
    for (;;) {
      const cell = { col: index % columns, row: Math.floor(index / columns) };
      index++;
      if (!taken.has(key(cell))) return cell;
    }
  };
  for (const shortcut of free) {
    const cell = nextFreeCell();
    cells.set(shortcut.id, cell);
    taken.add(key(cell));
  }

  const positions = new Map();
  let lastRow = -1;
  for (const [id, cell] of cells) {
    positions.set(id, cellToPx(cell, grid));
    lastRow = Math.max(lastRow, cell.row);
  }

  const gridBottom =
    lastRow >= 0 ? grid.startY + lastRow * PITCH_Y + TILE_H : grid.startY + 56;
  const height = Math.max(viewport.height, gridBottom + 32);

  return {
    positions,
    cells,
    grid,
    bounds: { width: viewport.width, height },
    gridBottom,
  };
}
