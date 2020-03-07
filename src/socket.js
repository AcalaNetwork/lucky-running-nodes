var WebSocket = require('websocket').client;

const Actions = {
  FeedVersion: 0x00,
  BestBlock: 0x01,
  BestFinalized: 0x02,
  AddedNode: 0x03,
  RemovedNode: 0x04,
  LocatedNode: 0x05,
  ImportedBlock: 0x06,
  FinalizedBlock: 0x07,
  NodeStats: 0x08,
  NodeHardware: 0x09,
  TimeSync: 0x0a,
  AddedChain: 0x0b,
  RemovedChain: 0x0c,
  SubscribedTo: 0x0d,
  UnsubscribedFrom: 0x0e,
  Pong: 0x0f,
  AfgFinalized: 0x10,
  AfgReceivedPrevote: 0x11,
  AfgReceivedPrecommit: 0x12,
  AfgAuthoritySet: 0x13,
  StaleNode: 0x14,
  NodeIO: 0x15
};

function deserialize(data) {
  const json = JSON.parse(data);

  if (!Array.isArray(json) || json.length === 0 || json.length % 2 !== 0) {
    throw new Error("Invalid FeedMessage.Data");
  }

  const messages = new Array(json.length / 2);

  for (const index of messages.keys()) {
    const [action, payload] = json.slice(index * 2);

    messages[index] = { action, payload };
  }

  return messages;
}

class Telemetry {
  constructor(url, db) {
    this.db = db;
    this.socket = new WebSocket();
    this.socket.connect(url);

    this.handleFeedData = this.handleFeedData.bind(this);
  }

  subscribe(chain) {
    this.socket.on('connect', (connect) => {
      connect.send(`subscribe:${chain}`);
      connect.on('message', this.handleFeedData);
    })
  }

  handleFeedData (event) {
    const data = event.binaryData.toString();
    this.handleMessages(deserialize(data));
  }

  handleMessages(messages) {
    for (const message of messages) {
      switch (message.action) {
        case Actions.AddedNode: {
          const [ id, nodeDetails, nodeStats, nodeIO, nodeHardware, blockDetails, location, connectedAt ] = message.payload;

          this.db.insert({
            id,
            name: nodeDetails[0],
            networkId: nodeDetails[4],
            timestamp: connectedAt
          })
          break;
        }
        case Actions.RemovedNode: {
          const id = message.payload;
          this.db.remove(id);
          console.error(`remove node ${id}`);
          break;
        }

        case Actions.StaleNode: {
          const id = message.payload;
          this.db.remove(id);
          console.error(`remove node ${id}`);
          break;
        }
      }
    }
  }
}

exports.Telemetry = Telemetry;