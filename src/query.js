const { DB } = require('./db');

const db = new DB('./node.db');
const countDB = new DB('./count.db');

(async () => {
    const allNode = await db.query();
    const names = allNode.map(item => item.name);
    console.log(`current nodes: ${names.length}, ${JSON.stringify(names)}`);
    const count = await countDB.query();
    let points = {};
    count.forEach(item => {
        item.node.forEach(item => {
            if (item.name && item.name.startsWith('5')) {
                const before = points[item.name] || 0;
                points[item.name] = before + 1
            }
       })
    })
    Object.keys(points).forEach(key => {
        console.log(`${key}: ${points[key]}`)
    })
})();