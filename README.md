# IoT-Wetterdaten mit MQTT & MongoDB (Node.js)

<img width="666" height="340" alt="image" src="https://github.com/user-attachments/assets/30a76a5f-16fa-44f8-a7e7-c056dd2efaf1" />

## 📋 Lernziele
- MongoDB Atlas Cluster erstellen und verwalten
- MQTT-Protokoll verstehen und IoT-Daten simulieren
- Node.js-Anwendung zur Datenübertragung programmieren
- NoSQL-Datenstrukturen analysieren und abfragen

***

## ⏱ Zeitplan (90 Minuten)

- **Teil 1:** Installation & Setup (20 Min)
- **Teil 2:** MongoDB Atlas einrichten (15 Min)
- **Teil 3:** MQTT-Wetterdaten simulieren (15 Min)
- **Teil 4:** Node.js Bridge programmieren (25 Min)
- **Teil 5:** Daten speichern & analysieren (15 Min)

***

## 📦 TEIL 1: Installation & Setup (20 Min)

### Schritt 1.1: Node.js Version überprüfen

Öffne ein **Terminal** (Windows: CMD oder PowerShell, Mac/Linux: Terminal) und gib ein:

```bash
node --version
```

**Erwartete Ausgabe:** `v18.0.0` oder höher

Falls Node.js nicht installiert ist, lade es von https://nodejs.org herunter (LTS Version).

***

### Schritt 1.2: Projektordner erstellen

```bash
mkdir wetter-iot-projekt
cd wetter-iot-projekt
```

**Erklärung:**
- `mkdir` = make directory (Ordner erstellen)
- `cd` = change directory (in Ordner wechseln)

***

### Schritt 1.3: Node.js Projekt initialisieren

```bash
npm init -y
```

**Erwartete Ausgabe:** Eine Datei `package.json` wird erstellt.

**Was passiert hier?** Node.js erstellt eine Konfigurationsdatei für dein Projekt.

***

### Schritt 1.4: Notwendige Pakete installieren

```bash
npm install mqtt mongodb
```

**Erwartete Ausgabe:**
```
added 25 packages, and audited 26 packages in 3s
```

**Was wurde installiert?**
- `mqtt` = MQTT-Client für Node.js (um Sensordaten zu empfangen)
- `mongodb` = MongoDB-Treiber für Node.js (um Daten zu speichern)

***

### Schritt 1.5: MQTTX CLI installieren (für Simulation)

```bash
npm install -g mqttx-cli
```

**Verifizierung:**
```bash
mqttx --version
```

**Erwartete Ausgabe:** `1.9.10` oder höher

***

## 🌐 TEIL 2: MongoDB Atlas einrichten (15 Min)

### Schritt 2.1: MongoDB Atlas Account erstellen

1. Öffne Browser und gehe zu: https://www.mongodb.com/cloud/atlas/register
2. Registriere dich mit deiner **Schul-E-Mail**
3. Wähle "**FREE**" Plan (M0 Cluster)
4. Klicke auf "**Create Deployment**"

***

### Schritt 2.2: Cluster konfigurieren

**Einstellungen (exakt so auswählen):**
- **Cloud Provider:** AWS
- **Region:** Frankfurt (eu-central-1) oder Zürich (eu-west-6)
- **Cluster Tier:** M0 Sandbox (FREE)
- **Cluster Name:** `weather-cluster` (oder eigener Name)

Klicke auf "**Create Deployment**" und warte ~3 Minuten.

***

### Schritt 2.3: Datenbank-Benutzer erstellen

**Wichtig:** Notiere diese Daten in einem Textdokument!

1. Ein Popup erscheint: "**Security Quickstart**"
2. **Username:** `wetter_user` (frei wählbar)
3. **Password:** Klicke "**Autogenerate Secure Password**" und KOPIERE das Passwort!
4. Klicke "**Create Database User**"

**⚠️ WICHTIG:** Speichere das Passwort! Du siehst es nur einmal.

***

### Schritt 2.4: Netzwerkzugriff erlauben

1. Im selben Popup: "**Where would you like to connect from?**"
2. Wähle "**My Local Environment**"
3. Klicke "**Add My Current IP Address**"
4. **Zusätzlich:** Klicke "**Add a Different IP Address**"
   - **IP Address:** `0.0.0.0/0` (erlaubt Zugriff von überall - nur für Tests!)
   - **Description:** `Allow All (Test Only)`
5. Klicke "**Finish and Close**"

**Erklärung:** MongoDB erlaubt nur Verbindungen von freigegebenen IP-Adressen. `0.0.0.0/0` = alle IPs (unsicher für Produktion, OK für Übung).

***

### Schritt 2.5: Connection String kopieren

1. Klicke auf "**Connect**" bei deinem Cluster
2. Wähle "**Connect your application**"
3. **Driver:** Node.js
4. **Version:** 6.7 or later
5. **Kopiere** den Connection String (sieht so aus):

```
mongodb+srv://wetter_user:<password>@weather-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

6. **Ersetze `<password>`** mit dem Passwort aus Schritt 2.3

**Beispiel:**
```
mongodb+srv://wetter_user:aB3xT9pQ@weather-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

7. Speichere diesen String in deinem Textdokument!

***

## 🌦 TEIL 3: MQTT-Wetterdaten simulieren (15 Min)

### Schritt 3.1: MQTT Broker Verbindung testen

```bash
mqttx conn -h broker.emqx.io -p 1883
```

**Erwartete Ausgabe:**
```
✔  Connected to broker.emqx.io
```

**Was ist ein MQTT Broker?** Ein zentraler Server, der Nachrichten zwischen IoT-Geräten (Sensoren) und Anwendungen vermittelt. Wir nutzen `broker.emqx.io` (kostenloser, öffentlicher Broker) .

Drücke `Ctrl+C` zum Beenden.

***

### Schritt 3.2: Verfügbare Simulationsszenarien anzeigen

```bash
mqttx ls --scenarios
```

**Erwartete Ausgabe:**
```
tesla     | Simulation to generate Tesla car data
smart_home | Simulation to generate smart home data
weather   | Simulation to generate advanced weather station's data
IEM       | Simulation to generate Industrial Energy Monitoring data
```

**Wichtig:** Wir nutzen das `weather` Szenario!

***

### Schritt 3.3: Wetterdaten-Simulation starten

**Terminal 1 öffnen** und Simulation starten:

```bash
mqttx simulate -sc weather -c 5 -h broker.emqx.io -t wetter/schweiz/gruppe1
```

**Parameter-Erklärung:**
- `weather` = Wetter-Szenario
- `-c 5` = 5 parallele Wetterstationen
- `-h broker.emqx.io` = Broker-Adresse
- `-t wetter/schweiz/gruppe1` = MQTT Topic (wie ein Ordnerpfad für Nachrichten)

**⚠️ Wichtig:** Jede Gruppe nutzt ein eigenes Topic:
- Gruppe 1: `wetter/schweiz/gruppe1`
- Gruppe 2: `wetter/schweiz/gruppe2`
- Gruppe 3: `wetter/schweiz/gruppe3` 

**Erwartete Ausgabe:**
```
✔  Connected to broker.emqx.io
▶  Start simulating weather data
◉  Sending message to topic "wetter/schweiz/gruppe1"
```

**Lasse dieses Terminal geöffnet!** Die Simulation läuft kontinuierlich.

***

### Schritt 3.4: Simulierte Daten überprüfen (Optional)

**Terminal 2 öffnen** (lasse Terminal 1 laufen!):

```bash
mqttx sub -h broker.emqx.io -t wetter/schweiz/gruppe1
```

**Erwartete Ausgabe:** JSON-Nachrichten wie:
```json
{
  "temperature": 18.5,
  "humidity": 65,
  "pressure": 1013.25,
  "windSpeed": 12.3,
  "timestamp": "2025-11-22T08:00:00Z"
}
```

Drücke `Ctrl+C` zum Beenden.

***

## 💻 TEIL 4: Node.js Bridge programmieren (25 Min)

### Schritt 4.1: Konfigurationsdatei erstellen

**Kopiere die Vorlage und passe sie an:**

```bash
# Auf Mac/Linux:
cp config.sample.js config.js

# Auf Windows (PowerShell):
Copy-Item config.sample.js config.js

# Oder manuell: config.sample.js → config.js kopieren
```

**Öffne `config.js` und passe folgende Werte an:**

```javascript
module.exports = {
  // MQTT Broker Einstellungen
  mqtt: {
    broker: 'mqtt://broker.emqx.io:1883',
    topic: 'wetter/schweiz/gruppe1', // ⚠️ Anpassen für deine Gruppe!
    clientId: 'wetter_subscriber_gruppe1' // ⚠️ Anpassen für deine Gruppe!
  },

  // MongoDB Verbindung
  mongodb: {
    uri: 'mongodb+srv://wetter_user:DEIN_PASSWORT@weather-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority', // ⚠️ Connection String aus Schritt 2.5 einfügen!
    database: 'wetter_datenbank',
    collection: 'wetter_messungen'
  }
};
```

**⚠️ WICHTIG - Folgende Werte anpassen:**
1. `topic`: Deine Gruppennummer (z.B. `gruppe2`, `gruppe3`)
2. `clientId`: Deine Gruppennummer
3. `uri`: Dein Connection String aus Schritt 2.5 (Passwort einfügen!)

**⚠️ SICHERHEIT:** `config.js` enthält dein Passwort und wird **nicht** mit Git geteilt (bereits in `.gitignore` eingetragen).

**Datei speichern!** 

***

### Schritt 4.2: Hauptprogramm erstellen

Erstelle eine Datei `mqtt-to-mongodb.js`:

```javascript
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
```

**Datei speichern!** 

***

### ✅ Schritt 4.3: Konfiguration überprüfen

**Checkliste - Hast du folgendes angepasst?**

In `config.js`:
- [ ] MongoDB Connection String eingefügt
- [ ] `<password>` durch dein echtes Passwort ersetzt
- [ ] Gruppennummer in `topic` angepasst
- [ ] Gruppennummer in `clientId` angepasst

**Beispiel korrekte `config.js` für Gruppe 1:**
```javascript
module.exports = {
  mqtt: {
    broker: 'mqtt://broker.emqx.io:1883',
    topic: 'wetter/schweiz/gruppe1',
    clientId: 'wetter_subscriber_gruppe1'
  },
  mongodb: {
    uri: 'mongodb+srv://wetter_user:aB3xT9pQ@weather-cluster.ab12c.mongodb.net/?retryWrites=true&w=majority',
    database: 'wetter_datenbank',
    collection: 'wetter_messungen'
  }
};
```

***

## 🎯 TEIL 5: Daten speichern & analysieren (15 Min)

### Schritt 5.1: System starten

**Du brauchst jetzt 2 Terminals:**

**Terminal 1 - MQTT Simulation:**
```bash
mqttx simulate weather -c 5 -h broker.emqx.io -t wetter/schweiz/gruppe1
```

**Terminal 2 - Node.js Bridge:**
```bash
node mqtt-to-mongodb.js
```

***

### Schritt 5.2: Erfolgreiche Ausführung überprüfen

**Erwartete Ausgabe in Terminal 2:**

```
╔════════════════════════════════════════╗
║  🌦️  WETTER-IoT DATENSAMMLER        ║
║  MQTT → MongoDB Bridge               ║
╚════════════════════════════════════════╝

🔄 Verbinde zu MongoDB Atlas...
✅ MongoDB verbunden!
📁 Datenbank: wetter_datenbank
📊 Collection: wetter_messungen

🔄 Verbinde zu MQTT Broker...
📡 Broker: mqtt://broker.emqx.io:1883
✅ MQTT Broker verbunden!
📬 Abonniere Topic: wetter/schweiz/gruppe1

🚀 System bereit! Warte auf Wetterdaten...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Gespeichert | ID: 674092a8f1b2c3d4e5f6g7h8
📍 Topic: wetter/schweiz/gruppe1
🌡️  Daten: {"temperature":18.5,"humidity":65,"pressure":1013.25}...
─────────────────────────────────────────
```

**✅ Wenn du diese Ausgabe siehst, funktioniert alles!** 

***

### Schritt 5.3: Daten in MongoDB Atlas überprüfen

1. Gehe zurück zu https://cloud.mongodb.com
2. Klicke auf "**Browse Collections**"
3. Wähle Datenbank: `wetter_datenbank`
4. Wähle Collection: `wetter_messungen`
5. **Du siehst jetzt deine gespeicherten Wetterdaten!**

**Beispiel-Dokument:**
```json
{
  "_id": ObjectId("674092a8f1b2c3d4e5f6g7h8"),
  "temperature": 18.5,
  "humidity": 65,
  "pressure": 1013.25,
  "windSpeed": 12.3,
  "timestamp": "2025-11-22T08:00:00Z",
  "mqtt_topic": "wetter/schweiz/gruppe1",
  "empfangen_am": ISODate("2025-11-22T08:54:32.123Z"),
  "gruppe": "wetter_subscriber_gruppe1"
}
```


***

### Schritt 5.4: Erste MongoDB-Abfragen

**Im Atlas Dashboard (Browse Collections):**

**Filter 1: Nur Temperaturen über 20°C anzeigen**
```json
{ "current.temp_c": { "$gt": 20 } }
```

**Filter 2: Daten der letzten 5 Minuten**
```json
{ "empfangen_am": { "$gte": new Date(Date.now() - 5*60*1000) } }
```

**Filter 3: Hohe Luftfeuchtigkeit (über 80%)**
```json
{ "current.humidity": { "$gt": 80 } }
```

Klicke "**Apply**" nach jedem Filter .

***

### Schritt 5.5: Aggregation - Durchschnittswerte berechnen

1. Im Atlas Dashboard: Klicke auf "**Aggregation**" Tab
2. Klicke "**Add Stage**"
3. Wähle `$group`
4. Füge folgenden Code ein:

```json
{
  "_id": null,
  "durchschnitt_temperatur_celsius": { "$avg": "$current.temp_c" },
  "durchschnitt_luftfeuchtigkeit": { "$avg": "$current.humidity" },
  "durchschnitt_luftdruck_mb": { "$avg": "$current.pressure_mb" },
  "durchschnitt_windgeschwindigkeit_kph": { "$avg": "$current.wind_kph" },
  "max_temperatur": { "$max": "$current.temp_c" },
  "min_temperatur": { "$min": "$current.temp_c" },
  "anzahl_messungen": { "$sum": 1 }
}
```

5. Klicke "**Run**"

**Erwartete Ausgabe:**
```json
{
  "_id": null,
  "durchschnitt_temperatur_celsius": 14.3,
  "durchschnitt_luftfeuchtigkeit": 68.7,
  "durchschnitt_luftdruck_mb": 1008.2,
  "durchschnitt_windgeschwindigkeit_kph": 42.5,
  "max_temperatur": 29.1,
  "min_temperatur": -4.2,
  "anzahl_messungen": 156
}
```


***

## GRUPPENAUFGABEN & DISKUSSION

### Aufgabe 1: Datenvergleich zwischen Gruppen

**Fragestellung:** Welche Gruppe hat die höchste Durchschnittstemperatur?

**Anleitung:**
1. Jede Gruppe führt die Aggregation aus Schritt 5.5 aus
2. Notiert eure `durchschnitt_temperatur`
3. Vergleicht die Werte im Plenum

**Diskussion:**
- Warum sind die Werte unterschiedlich? (Hinweis: Zufällige Simulation)
- Wie würden echte Sensoren an verschiedenen Orten abweichen?

***

### Aufgabe 2: Extreme Werte finden

**Filter für Extremwetter erstellen:**

**Hitzetag (Temperatur > 30°C):**
```json
{ "temperature": { "$gt": 30 } }
```

**Sturm (Windgeschwindigkeit > 40 km/h):**
```json
{ "windSpeed": { "$gt": 40 } }
```

**Fragen:**
- Wie viele extreme Ereignisse habt ihr?
- Welche Extremwerte kamen am häufigsten vor?

***

### Aufgabe 3: Zeitreihenanalyse

**Sortiere Daten nach Zeitstempel:**

1. Filter leer lassen
2. Sort: `{ "empfangen_am": -1 }` (neueste zuerst)

**Beobachtung:**
- Wie schnell kommen neue Datenpunkte?
- Wie viele Messungen pro Minute?

***

## 🛠 TROUBLESHOOTING

### Problem: "Cannot find module 'mqtt'"

**Lösung:**
```bash
npm install mqtt mongodb
```

Stelle sicher, dass du im richtigen Ordner bist (`cd wetter-iot-projekt`).

***

### Problem: "MongoServerError: bad auth"

**Ursache:** Falsches Passwort im Connection String

**Lösung:**
1. Überprüfe `config.js`
2. Stelle sicher, dass `<password>` durch dein echtes Passwort ersetzt wurde
3. **Sonderzeichen** im Passwort? Verwende URL-Encoding:
   - `@` → `%40`
   - `#` → `%23`
   - `!` → `%21` 

***

### Problem: "ECONNREFUSED" bei MQTT

**Ursache:** Falscher Broker oder Offline

**Lösung:**
1. Teste Verbindung:
```bash
mqttx conn -h broker.emqx.io -p 1883
```

2. Falls Fehler: Verwende alternativen Broker:
```javascript
broker: 'mqtt://test.mosquitto.org:1883'
```


***

### Problem: Keine Nachrichten empfangen

**Checkliste:**
- [ ] Ist die MQTT-Simulation gestartet? (Terminal 1)
- [ ] Ist das Node.js-Programm gestartet? (Terminal 2)
- [ ] Stimmt das Topic überein? (`config.js` vs. Simulationsbefehl)
- [ ] Sind beide Terminals gleichzeitig aktiv?

***

### Problem: MongoDB Verbindung timeout

**Lösung:**
1. Überprüfe Network Access in Atlas:
   - Ist `0.0.0.0/0` hinzugefügt?
2. Firewall/Proxy im Schulnetzwerk? → Informiere Lehrperson

***

## 📝 ABSCHLUSS-CHECKLISTE

**Hast du folgende Lernziele erreicht?**

- [ ] MongoDB Atlas Cluster erstellt
- [ ] MQTT Broker-Verbindung verstanden
- [ ] IoT-Daten mit MQTTX simuliert
- [ ] Node.js-Programm geschrieben und ausgeführt
- [ ] Daten erfolgreich in MongoDB gespeichert
- [ ] MongoDB-Abfragen (Filter, Aggregation) durchgeführt
- [ ] Gruppenaufgaben absolviert

***

## 🚀 ERWEITERUNGSAUFGABEN (Optional)

### Challenge 1: Mehrere Topics abonnieren

Ändere in `config.js`:
```javascript
topic: 'wetter/schweiz/#'  // # = Wildcard für alle Unterordner
```

Jetzt empfängst du Daten von ALLEN Gruppen!

***

### Challenge 2: Daten-Visualisierung

Erstelle eine Datei `analyse.js`:

```javascript
const { MongoClient } = require('mongodb');
const config = require('./config');

async function analyseData() {
  const client = new MongoClient(config.mongodb.uri);
  await client.connect();
  
  const collection = client.db(config.mongodb.database)
                            .collection(config.mongodb.collection);
  
  // Finde höchste Temperatur
  const maxTemp = await collection.find().sort({ "current.temp_c": -1 }).limit(1).toArray();
  console.log('🔥 Höchste Temperatur:', maxTemp[0]);
  
  // Finde niedrigste Temperatur
  const minTemp = await collection.find().sort({ "current.temp_c": 1 }).limit(1).toArray();
  console.log('❄️  Niedrigste Temperatur:', minTemp[0]);
  
  await client.close();
}

analyseData();

```

Ausführen: `node analyse.js` 

***

### Challenge 3: Smart Home Sensoren simulieren

**🎯 Ziel:** Zusätzliche IoT-Sensoren mit MQTTX simulieren und speichern.

#### 3.1 Raumklima-Sensor (Temperatur & Luftfeuchtigkeit)

**Terminal-Befehl (Bash/PowerShell):**

```bash
while true; do
  TEMP=$(awk 'BEGIN{printf "%.1f", 18+8*rand()}')
  HUMIDITY=$(shuf -i 35-75 -n 1)
  TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  mqttx pub -t 'home/wohnzimmer/klima' -h broker.emqx.io \
    -m "{\"temp_c\": $TEMP, \"humidity_percent\": $HUMIDITY, \"timestamp\": \"$TIMESTAMP\", \"sensor\": \"dht22\"}"
  sleep 5
done
```

**Oder einzelner Test-Befehl:**
```bash
mqttx pub -t 'home/wohnzimmer/klima' -h broker.emqx.io \
  -m '{"temp_c": 22.5, "humidity_percent": 58, "sensor": "dht22"}'
```

**MongoDB Filter-Beispiele:**
```json
// Zu warme Räume (> 24°C)
{ "temp_c": { "$gt": 24 }, "mqtt_topic": "home/wohnzimmer/klima" }

// Zu trockene Luft (< 40%)
{ "humidity_percent": { "$lt": 40 } }
```

***

#### 3.2 Bodenfeuchte-Sensor (Pflanzenüberwachung)

**Einmalige Testdaten:**

```bash
# Gut bewässert
mqttx pub -t 'garten/pflanzen/bodenfeuchte' -h broker.emqx.io \
  -m '{"sensor_id": "pflanze_wohnzimmer", "feuchte_prozent": 65, "status": "optimal", "alarm": false}'

# Kritisch trocken
mqttx pub -t 'garten/pflanzen/bodenfeuchte' -h broker.emqx.io \
  -m '{"sensor_id": "pflanze_balkon", "feuchte_prozent": 18, "status": "kritisch", "alarm": true}'
```

**Kontinuierliche Simulation:**
```bash
while true; do
  FEUCHTE=$(shuf -i 15-80 -n 1)
  if [ $FEUCHTE -lt 30 ]; then STATUS="kritisch"; ALARM="true"; else STATUS="ok"; ALARM="false"; fi
  mqttx pub -t 'garten/pflanzen/bodenfeuchte' -h broker.emqx.io \
    -m "{\"feuchte_prozent\": $FEUCHTE, \"status\": \"$STATUS\", \"alarm\": $ALARM, \"zeit\": \"$(date -Iseconds)\"}"
  sleep 8
done
```

***

#### 3.3 Fenster-/Türkontakt (Sicherheit)

```bash
# Fenster schliessen
mqttx pub -t 'home/sicherheit/fenster/balkon' -h broker.emqx.io \
  -m '{"status": "geschlossen", "zeit": "2024-01-15T14:30:00Z", "battery_percent": 87, "device": "aqara_kontakt_01"}'

# Fenster öffnen
mqttx pub -t 'home/sicherheit/fenster/balkon' -h broker.emqx.io \
  -m '{"status": "geoeffnet", "zeit": "2024-01-15T14:35:00Z", "battery_percent": 86, "device": "aqara_kontakt_01"}'
```

**Filter für offene Fenster:**
```json
{ "status": "geoeffnet", "mqtt_topic": { "$regex": "sicherheit/fenster" } }
```

***

#### 3.4 Smart Meter (Energieverbrauch)

```bash
while true; do
  LEISTUNG=$(shuf -i 150-3200 -n 1)
  mqttx pub -t 'stromzaehler/wohnung/total' -h broker.emqx.io \
    -m "{\"leistung_watt\": $LEISTUNG, \"verbrauch_kwh_total\": 1247.3, \"preis_chf_pro_kwh\": 0.25, \"timestamp\": $(date +%s)}"
  sleep 10
done
```

**Aggregation - Durchschnittsverbrauch:**
```json
{
  "_id": null,
  "avg_verbrauch_watt": { "$avg": "$leistung_watt" },
  "max_leistung": { "$max": "$leistung_watt" },
  "messungen": { "$sum": 1 }
}
```

***

#### 3.5 Lautstärke-Sensor (Büro/Home Office)

```bash
# Laute Umgebung (Gespräch)
mqttx pub -t 'buero/lautstaerke/messung' -h broker.emqx.io \
  -m '{"dezibel": 62, "kategorie": "moderat", "empfehlung": "Kopfhoerer empfohlen", "timestamp": "'$(date -Iseconds)'"}'

# Leise Umgebung
mqttx pub -t 'buero/lautstaerke/messung' -h broker.emqx.io \
  -m '{"dezibel": 38, "kategorie": "leise", "empfehlung": "OK", "timestamp": "'$(date -Iseconds)'"}'
```

***

### Challenge 4: Multi-Sensor Bridge erweitern

**🎯 Ziel:** Die Node.js Bridge für mehrere Topics erweitern.

**Ändere in `config.js`:**
```javascript
mqtt: {
  broker: 'mqtt://broker.emqx.io:1883',
  topics: [
    'wetter/schweiz/gruppe1',
    'home/+/klima',      // + = Wildcard für einen Level
    'garten/pflanzen/bodenfeuchte',
    'home/sicherheit/fenster/#'  // # = Wildcard für alle Untertopics
  ],
  clientId: 'multi_sensor_subscriber_gruppe1'
}
```

**Ändere in `mqtt-to-mongodb.js`:**
```javascript
// Topics abonnieren
config.mqtt.topics.forEach(topic => {
  mqttClient.subscribe(topic, (err) => {
    if (err) console.error(`❌ Fehler bei ${topic}:`, err.message);
    else console.log(`📬 Abonniert: ${topic}`);
  });
});
```

***

### Challenge 5: Sensor-Typen automatisch erkennen

**🎯 Ziel:** Im `mqtt-to-mongodb.js` automatisch den Sensor-Typ aus dem Topic ableiten.

**Code-Erweiterung:**
```javascript
mqttClient.on('message', async (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());
    
    // Sensor-Typ aus Topic ableiten
    let sensorTyp = 'unbekannt';
    if (topic.includes('wetter')) sensorTyp = 'wetterstation';
    else if (topic.includes('klima')) sensorTyp = 'raumklima';
    else if (topic.includes('bodenfeuchte')) sensorTyp = 'pflanzensensor';
    else if (topic.includes('sicherheit')) sensorTyp = 'sicherheit';
    else if (topic.includes('stromzaehler')) sensorTyp = 'energiezaehler';
    
    const document = {
      ...payload,
      mqtt_topic: topic,
      sensor_typ: sensorTyp,  // ← Neues Feld!
      empfangen_am: new Date(),
      gruppe: config.mqtt.clientId
    };
    
    const result = await collection.insertOne(document);
    console.log(`✅ [${sensorTyp}] Gespeichert | ID: ${result.insertedId}`);
    
  } catch (error) {
    console.error('❌ Fehler:', error.message);
  }
});
```

**MongoDB-Abfrage pro Sensor-Typ:**
```json
// Nur Raumklima-Daten
{ "sensor_typ": "raumklima" }

// Alle Sicherheitsereignisse
{ "sensor_typ": "sicherheit", "status": "geoeffnet" }

// Aggregation nach Sensor-Typ
{ "$group": { "_id": "$sensor_typ", "anzahl": { "$sum": 1 } } }
```

***

## ZUSÄTZLICHE RESSOURCEN

- MQTT Tutorial: https://www.emqx.com/en/blog/how-to-use-mqtt-in-nodejs 
- MongoDB Node.js Driver Docs: https://www.mongodb.com/docs/drivers/node/ 
- MQTTX CLI Docs: https://mqttx.app/docs/cli 

***
