module.exports = {
  // MQTT Broker Einstellungen
  mqtt: {
    broker: 'mqtt://broker.emqx.io:1883',
    topic: 'wetter/schweiz/gruppe1', // ⚠️ Anpassen für deine Gruppe!
    clientId: 'wetter_subscriber_gruppe1' // ⚠️ Anpassen für deine Gruppe!
  },

  // MongoDB Verbindung
  mongodb: {
    uri: 'mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/?retryWrites=true&w=majority', // ⚠️ Connection String aus MongoDB Atlas einfügen!
    database: 'wetter_datenbank',
    collection: 'wetter_messungen'
  }
};
