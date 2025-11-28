const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, "..", "data", 'clips.json');

let clips = null;

async function load() {
    if (clips !== null) return clips;
    
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        clips = JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            clips = {};
            await save();
        } else {
            throw error;
        }
    }
    return clips;
}

// Save data to JSON file
async function save() {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(clips, null, 2));
}

module.exports = {
    getAllClips: async function() {
        await load();
        return Object.entries(clips).map(([id, data]) => ({
            id: parseInt(id),
            ...data
        }));
    },

    getClip: async function(id) {
        await load();
        const data = clips[id];
        return data ? { id: parseInt(id), ...data } : null;
    },

    insertClip: async function(audioFile, volume = 0.8) {
        await load();
        const ids = Object.keys(clips).map(id => parseInt(id));
        const newId = ids.length > 0 ? Math.max(...ids) + 1 : 1;
        
        const newClip = { audioFile, volume };
        clips[newId] = newClip;
        await save();
        return { id: newId, ...newClip };
    },

    setClipVolume: async function(id, volume) {
        await load();
        if (clips[id]) {
            clips[id].volume = volume;
            await save();
            return 1;
        }
        return 0;
    }
};