// ===== PAKETE IMPORTIEREN =====
const mqtt = require('mqtt');
const { MongoClient } = require('mongodb');
const config = require('./config');

// ===== GLOBALE VARIABLEN =====
let mongoClient;
let collection;
let mqttClient;

// ===== MONGODB VERBINDUNG =====
async function connectMongoDB() {
  try {
    console.log('🔄 Verbinde zu MongoDB Atlas...');
    
    mongoClient = new MongoClient(config.mongodb.uri);
    await mongoClient.connect();
    
    const database = mongoClient.db(config.mongodb.database);
    collection = database.collection(config.mongodb.collection);
    
    console.log('✅ MongoDB verbunden!');
    console.log(`📁 Datenbank: ${config.mongodb.database}`);
    console.log(`📊 Collection: ${config.mongodb.collection}\n`);
    
  } catch (error) {
    console.error('❌ MongoDB Verbindungsfehler:', error.message);
    process.exit(1);
  }
}

// ===== MQTT VERBINDUNG =====
function connectMQTT() {
  console.log('🔄 Verbinde zu MQTT Broker...');
  console.log(`📡 Broker: ${config.mqtt.broker}`);
  
  mqttClient = mqtt.connect(config.mqtt.broker, {
    clientId: config.mqtt.clientId,
    clean: true,
    reconnectPeriod: 1000
  });

  // Event: Verbindung erfolgreich
  mqttClient.on('connect', () => {
    console.log('✅ MQTT Broker verbunden!');
    console.log(`📬 Abonniere Topic: ${config.mqtt.topic}\n`);
    
    mqttClient.subscribe(config.mqtt.topic, (err) => {
      if (err) {
        console.error('❌ Fehler beim Abonnieren:', err.message);
      } else {
        console.log('🚀 System bereit! Warte auf Wetterdaten...\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      }
    });
  });

  // Event: Neue Nachricht empfangen
  mqttClient.on('message', async (topic, message) => {
    try {
      // JSON parsen
      const payload = JSON.parse(message.toString());
      
      // Metadata hinzufügen
      const document = {
        ...payload,
        mqtt_topic: topic,
        empfangen_am: new Date(),
        gruppe: config.mqtt.clientId
      };
      
      // In MongoDB speichern
      const result = await collection.insertOne(document);
      
      console.log(`✅ Gespeichert | ID: ${result.insertedId}`);
      console.log(`📍 Topic: ${topic}`);
      console.log(`🌡️  Daten: ${JSON.stringify(payload).substring(0, 80)}...`);
      console.log('─────────────────────────────────────────\n');
      
    } catch (error) {
      console.error('❌ Fehler beim Speichern:', error.message);
    }
  });

  // Event: Verbindung verloren
  mqttClient.on('error', (error) => {
    console.error('❌ MQTT Fehler:', error.message);
  });

  // Event: Verbindung getrennt
  mqttClient.on('close', () => {
    console.log('⚠️  MQTT Verbindung geschlossen');
  });
}

// ===== SAUBERES BEENDEN =====
async function cleanup() {
  console.log('\n🛑 Beende Anwendung...');
  
  if (mqttClient) {
    mqttClient.end();
    console.log('✅ MQTT Verbindung geschlossen');
  }
  
  if (mongoClient) {
    await mongoClient.close();
    console.log('✅ MongoDB Verbindung geschlossen');
  }
  
  console.log('👋 Auf Wiedersehen!\n');
  process.exit(0);
}

// Ctrl+C abfangen
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// ===== HAUPTPROGRAMM STARTEN =====
async function main() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  🌦️  WETTER-IoT DATENSAMMLER        ║');
  console.log('║  MQTT → MongoDB Bridge               ║');
  console.log('╚════════════════════════════════════════╝\n');
  
  await connectMongoDB();
  connectMQTT();
}

// Programm starten
main().catch(console.error);
