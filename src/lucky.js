const { DB } = require('./db');
const Moment = require('moment');
const seedrandom = require('seedrandom');

const countDB = new DB('./count.db');

const args = process.argv[2];

if (!args) {
    console.warn('please enter an seed');
}

(async () => {
    let count = await countDB.query();
    let points = {};

    // filter yesterday records
    count = count.filter(item => {
        const yesterdayStart = Moment().utcOffset(0).subtract(1, 'd').startOf('d').valueOf();
        const yesterdayEnd = Moment().utcOffset(0).subtract(1, 'd').endOf('d').valueOf();
        return item.timestamp < yesterdayEnd && item.timestamp > yesterdayStart;
    });

    console.log(count.map(item => Moment(item.timestamp).toString()));

    // count user node points
    count.forEach(item => {
        const counted = []
        item.node.forEach(item => {
            if (item.name && item.name.startsWith('5')) {
                if (counted.indexOf(item.name) !== -1) {
                    return false;
                }
                counted.push(item.name);
                const before = points[item.name] || 0;
                points[item.name] = before + 1
            }
       })
    });

    Object.keys(points).forEach(key => {
        console.log(`${key}: ${points[key]}`)
    })

    // random select node
    const seed = parseInt(args.slice(10));
    const winner = [];
    for (let i = 0; i < 3; i++) {
        const rng = seedrandom(seed + 86400/4 * i);
        const weightArray = Object.keys(points).reduce((acc, name) => {
            acc = acc.concat(new Array(points[name]).fill(name));
            return acc;
        }, []);
        const randomPosition = Math.floor(rng() * weightArray.length);
        winner.push(weightArray[randomPosition]);
        // remove current winner in points array
        delete points[weightArray[randomPosition]];
    }

    console.log(winner);

})();
