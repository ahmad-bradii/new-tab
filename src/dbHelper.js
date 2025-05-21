import { openDB } from "idb";

const dbPromise = openDB("myDatabase", 1, {
  upgrade(db) {
    db.createObjectStore("shortcuts", { keyPath: "id", autoIncrement: true });
  },
});

export const addShortcut = async (shortcut) => {
  const db = await dbPromise;
  await db.put("shortcuts", shortcut);
};

export const getShortcuts = async () => {
  const db = await dbPromise;
  return db.getAll("shortcuts");
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
