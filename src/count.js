async function count (db, countDB) {
    const allNodes = await db.query();
    const currentTime = new Date()
    countDB.insert({ timestamp: currentTime.getTime(), node: allNodes});
}

exports.count = count;