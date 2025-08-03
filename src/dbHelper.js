import { openDB } from "idb";

const dbPromise = openDB("myDatabase", 1, {
  upgrade(db) {
    db.createObjectStore("shortcuts", { keyPath: "id", autoIncrement: true });
  },
});

export const addShortcut = async (shortcut) => {
  const db = await dbPromise;

  // Get current shortcuts to determine the next order
  const existingShortcuts = await db.getAll("shortcuts");
  const maxOrder = existingShortcuts.reduce((max, s) => {
    return Math.max(max, s.order !== undefined ? s.order : 0);
  }, -1);

  // Add the shortcut with the next order
  const shortcutWithOrder = {
    ...shortcut,
    order: maxOrder + 1,
  };

  await db.put("shortcuts", shortcutWithOrder);
};

export const getShortcuts = async () => {
  const db = await dbPromise;
  const shortcuts = await db.getAll("shortcuts");

  // Sort by order field, fallback to id if order doesn't exist
  return shortcuts.sort((a, b) => {
    const orderA = a.order !== undefined ? a.order : a.id;
    const orderB = b.order !== undefined ? b.order : b.id;
    return orderA - orderB;
  });
};

export const updateShortcut = async (id, updatedShortcut) => {
  const db = await dbPromise;

  const currentShortcut = await db.get("shortcuts", id);
  if (!currentShortcut) {
    console.log("shortcut not found!!");
    return null;
  }

  const newShortcut = { ...updatedShortcut, id };
  await db.put("shortcuts", newShortcut);
};

export const deleteShortcut = async (id) => {
  const db = await dbPromise;
  await db.delete("shortcuts", id);
};

export const updateShortcutsOrder = async (shortcuts) => {
  const db = await dbPromise;
  const tx = db.transaction("shortcuts", "readwrite");

  // Update each shortcut with its new order/position
  for (let i = 0; i < shortcuts.length; i++) {
    const shortcut = { ...shortcuts[i], order: i };
    await tx.store.put(shortcut);
  }

  await tx.done;
};

export const initializeShortcutsOrder = async () => {
  const db = await dbPromise;
  const shortcuts = await db.getAll("shortcuts");

  // Check if any shortcuts are missing the order field
  const needsOrder = shortcuts.some((shortcut) => shortcut.order === undefined);

  if (needsOrder) {
    const tx = db.transaction("shortcuts", "readwrite");

    // Add order field to shortcuts that don't have it
    for (let i = 0; i < shortcuts.length; i++) {
      const shortcut = shortcuts[i];
      if (shortcut.order === undefined) {
        shortcut.order = i;
        await tx.store.put(shortcut);
      }
    }

    await tx.done;
  }
};
