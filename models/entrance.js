const fs = require("fs").promises;
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data", "entrance.json");

let entrance = null;

async function load() {
  if (entrance !== null) return entrance;

  try {
    const data = await fs.readFile(DATA_FILE, "utf8");
    entrance = JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      entrance = {};
      await save();
    } else {
      throw error;
    }
  }
  return entrance;
}

async function save() {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(entrance, null, 2));
}

module.exports = {
  getAll: async function () {
    await load();
    return Object.entries(entrance).map(([userId, data]) => ({
      userId,
      ...data,
    }));
  },

  getById: async function (userId) {
    await load();
    const data = entrance[userId.toString()];
    return data ? { userId, ...data } : null;
  },

  insert: async function (userId, audioFileId, username) {
    await load();
    const newEntry = { audioFileId, username };
    entrance[userId] = newEntry;
    await save();
    return { userId, ...newEntry };
  },

  update: async function (userId, audioFileId) {
    await load();
    if (entrance[userId]) {
      entrance[userId].audioFileId = audioFileId;
      await save();
      return { userId, ...entrance[userId] };
    }
    return null;
  },

  deleteById: async function (userId) {
    await load();
    if (entrance[userId]) {
      const deleted = { userId, ...entrance[userId] };
      delete entrance[userId];
      await save();
      return deleted;
    }
    return null;
  },
};
