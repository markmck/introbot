const leave = [
    { userId: "355177890045755395", audioFileId: 1, username: "LankyBastrd" },
];

function getAll() {
    return leave;
}

function getById(userId) {
    return leave.find(entry => entry.userId === userId);
}

const insert = (userId, audioFileId, username) => {
    const newEntry = { userId, audioFileId, username };
    leave.push(newEntry);
    return newEntry;
};

const update = (userId, audioFileId) => {
    const index = leave.findIndex(entry => entry.userId === userId);
    if (index !== -1) {
        leave[index] = { ...leave[index], audioFileId };
        return leave[index];
    }
    return null;
};

const deleteById = (userId) => {
    const index = leave.findIndex(entry => entry.userId === userId);
    if (index !== -1) {
        return leave.splice(index, 1)[0];
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