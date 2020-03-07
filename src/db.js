const Datastore = require("nedb");

class DB {
  constructor(filename = "./storage.db") {
    this._db = new Datastore({ filename, autoload: true });
  }

  async close() {
    this._db.persistence.compactDatafile();

    return new Promise((resolve, reject) => {
      this._db.on("compaction.done", () => {
        this._db.removeAllListeners("compaction.done");
        resolve();
      });

      setTimeout(() => {
        resolve();
      }, CompactionTimeout);
    });
  }

  async insert(data) {
    return new Promise((resolve, reject) => {
      this._db.update({ id: data.id }, data, { upsert: true }, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  async query(item) {
    const query = { };

    if (item) {
      query['$and'] = [{item}];
    }

    return new Promise((resolve, reject) => {
      this._db.find(query, (err, docs) => {
        if (err) reject();
        resolve(docs);
      });
    });
  }

  async update(id, data) {
    return new Promise((resolve, reject) => {
        this._db.update({ id }, data, { upsert: true }, (err, docs) => {
            if (err) reject();
            resolve('success');
        });
    });
  }

  async remove(id) {
    return new Promise((resolve, reject) => {
        this._db.remove({ id }, (err, docs) => {
            if (err) reject();
            resolve('success');
        });
    });
  }
}

exports.DB = DB;