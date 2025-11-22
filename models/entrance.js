const entrance = [
    { userId: "355177890045755395", audioFileId: 1, username: "LankyBastrd" },
    { userId: "464988700435021825", audioFileId: 2, username: "HodorsWit" },
    { userId: "110573324056162304", audioFileId: 3, username: "Mantooth" },
    { userId: "112363105090060288", audioFileId: 4, username: "prot" },
    { userId: "354848827850752000", audioFileId: 5, username: "phaef" },
    { userId: "168537084695543808", audioFileId: 6, username: "peli" },
    { userId: "268553395168608256", audioFileId: 7, username: "otherguy" },
    { userId: "233043650383183902", audioFileId: 8, username: "clutchy" },
    { userId: "689278881982971956", audioFileId: 9, username: "colbycheese" },
    { userId: "326184998334103573", audioFileId: 10, username: "eaper" }
];

function getAll() {
    return entrance;
}

function getById(userId) {
    return entrance.find(entry => entry.userId === userId);
}

const insert = (userId, audioFileId, username) => {
    const newEntry = { userId, audioFileId, username };
    entrance.push(newEntry);
    return newEntry;
};

const update = (userId, audioFileId) => {
    const index = entrance.findIndex(entry => entry.userId === userId);
    if (index !== -1) {
        entrance[index] = { ...entrance[index], audioFileId };
        return entrance[index];
    }
    return null;
};

const deleteById = (userId) => {
    const index = entrance.findIndex(entry => entry.userId === userId);
    if (index !== -1) {
        return entrance.splice(index, 1)[0];
    }
    return null;
};

module.exports = {
    getAll,
    getById,
    insert,
    update,
    deleteById
};