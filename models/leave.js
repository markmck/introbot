// data/leave.js
const fs = require("fs").promises;
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data", "leave.json");

let leave = null;

async function load() {
  if (leave !== null) return leave;

  try {
    const data = await fs.readFile(DATA_FILE, "utf8");
    leave = JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      leave = {};
      await save();
    } else {
      throw error;
    }
  }
  return leave;
}

// Save data to JSON file
async function save() {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(leave, null, 2));
}

module.exports = {
  getAll: async function () {
    await load();
    return Object.entries(leave).map(([userId, data]) => ({
      userId,
      ...data,
    }));
  },

  getById: async function (userId) {
    await load();
    const data = leave[userId];
    return data ? { userId, ...data } : null;
  },

  insert: async function (userId, audioFileId, username) {
    await load();
    const newEntry = { audioFileId, username };
    leave[userId] = newEntry;
    await save();
    return { userId, ...newEntry };
  },

  update: async function (userId, audioFileId) {
    await load();
    if (leave[userId]) {
      leave[userId].audioFileId = audioFileId;
      await save();
      return { userId, ...leave[userId] };
    }
    return null;
  },

  deleteById: async function (userId) {
    await load();
    if (leave[userId]) {
      const deleted = { userId, ...leave[userId] };
      delete leave[userId];
      await save();
      return deleted;
    }
    return null;
  },
};
