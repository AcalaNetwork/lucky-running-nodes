const schedule = require('node-schedule');
const { Telemetry } = require('./socket.js');
const { DB } = require('./db');
const { count } = require('./count');

const db = new DB('./node.db');
const countDB = new DB('./count.db');
const telemetry = new Telemetry('wss://telemetry.polkadot.io/feed/', db);

schedule.scheduleJob("1 * * * *", () => count(db, countDB) );

telemetry.subscribe('Acala Mandala TC2');