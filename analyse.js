const { MongoClient } = require('mongodb');
const config = require('./config');

async function analyseData() {
  const client = new MongoClient(config.mongodb.uri);
  await client.connect();
  
  const collection = client.db(config.mongodb.database)
                            .collection(config.mongodb.collection);
  
  // Finde höchste Temperatur
  const maxTemp = await collection.find().sort({ temperature: -1 }).limit(1).toArray();
  console.log('🔥 Höchste Temperatur:', maxTemp[0]);
  
  // Finde niedrigste Temperatur
  const minTemp = await collection.find().sort({ temperature: 1 }).limit(1).toArray();
  console.log('❄️  Niedrigste Temperatur:', minTemp[0]);
  
  await client.close();
}

analyseData();
