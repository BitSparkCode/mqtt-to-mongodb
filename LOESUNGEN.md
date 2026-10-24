# Lösungen – IoT-Wetterdaten mit MQTT & MongoDB

> **Wichtig:** Die echten Feldnamen in den MQTT-Nachrichten sind `current.temp_c`, `current.humidity`, `current.pressure_mb` und `current.wind_kph` (verschachtelt unter `current`). Die Platzhalter `temperature` / `windSpeed` aus dem README existieren in den Daten **nicht**.

***

## TEIL 5: Daten speichern & analysieren

### 5.1 System starten

**Terminal 1 – MQTT Simulation:**
```bash
mqttx simulate -sc weather -c 5 -h broker.emqx.io -t wetter/schweiz/gruppe1
```

**Terminal 2 – Node.js Bridge:**
```bash
node mqtt-to-mongodb.js
```

### 5.3 Daten in MongoDB Atlas überprüfen

- Atlas Dashboard → **Browse Collections** → `wetter_datenbank` → `wetter_messungen`

**Alternativ im Terminal (mongosh):**
```bash
mongosh "mongodb+srv://<USER>:<PASSWORT>@<CLUSTER>.mongodb.net/"
```
```javascript
use wetter_datenbank
db.wetter_messungen.find().limit(5)
```

### 5.4 Erste MongoDB-Abfragen

**Im Atlas Filter-Feld:**

```json
{ "current.temp_c": { "$gt": 20 } }
{ "empfangen_am": { "$gte": { "$date": "2025-11-22T08:00:00Z" } } }
{ "current.humidity": { "$gt": 80 } }
```

**Als mongosh-Befehle:**

```javascript
// Temperaturen über 20°C
db.wetter_messungen.find({ "current.temp_c": { $gt: 20 } })

// Daten der letzten 5 Minuten
db.wetter_messungen.find({ empfangen_am: { $gte: new Date(Date.now() - 5*60*1000) } })

// Hohe Luftfeuchtigkeit (über 80%)
db.wetter_messungen.find({ "current.humidity": { $gt: 80 } })
```

### 5.5 Aggregation – Durchschnittswerte

**Atlas → Aggregation Tab → `$group` Stage:**

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

**Als mongosh-Befehl:**

```javascript
db.wetter_messungen.aggregate([
  {
    $group: {
      _id: null,
      durchschnitt_temperatur_celsius: { $avg: "$current.temp_c" },
      durchschnitt_luftfeuchtigkeit: { $avg: "$current.humidity" },
      durchschnitt_luftdruck_mb: { $avg: "$current.pressure_mb" },
      durchschnitt_windgeschwindigkeit_kph: { $avg: "$current.wind_kph" },
      max_temperatur: { $max: "$current.temp_c" },
      min_temperatur: { $min: "$current.temp_c" },
      anzahl_messungen: { $sum: 1 }
    }
  }
])
```

***

## GRUPPENAUFGABEN

### Aufgabe 1: Datenvergleich zwischen Gruppen

Jede Gruppe führt die Aggregation aus 5.5 aus und vergleicht `durchschnitt_temperatur_celsius`.

**Bonus – Durchschnitt pro Wetterstation in einer Collection:**

```javascript
db.wetter_messungen.aggregate([
  { $group: {
      _id: "$city",
      avg_temp: { $avg: "$current.temp_c" },
      messungen: { $sum: 1 }
  }},
  { $sort: { avg_temp: -1 } }
])
```

### Aufgabe 2: Extreme Werte finden

**Atlas Filter:**

```json
// Hitzetag (Temperatur > 30°C)
{ "current.temp_c": { "$gt": 30 } }

// Sturm (Windgeschwindigkeit > 40 km/h)
{ "current.wind_kph": { "$gt": 40 } }
```

**mongosh – Anzahl Extremereignisse:**

```javascript
db.wetter_messungen.countDocuments({ "current.temp_c": { $gt: 30 } })
db.wetter_messungen.countDocuments({ "current.wind_kph": { $gt: 40 } })
```

### Aufgabe 3: Zeitreihenanalyse

**Atlas:** Filter leer, **Sort:** `{ "empfangen_am": -1 }`

**mongosh:**

```javascript
db.wetter_messungen.find().sort({ empfangen_am: -1 }).limit(10)
```

Beobachtung: Das `weather`-Szenario mit `-c 5` liefert ca. 5 Messungen pro Sekunde.

***

## ERWEITERUNGSAUFGABEN (Challenges)

### Challenge 1: Mehrere Topics abonnieren

In `config.js`:

```javascript
topic: 'wetter/schweiz/#'  // # = Wildcard für alle Untertopics
```

Damit empfängt die Bridge die Daten **aller** Gruppen.

### Challenge 2: Daten-Visualisierung

`analyse.js` liegt im Repo. **Achtung:** Die Feldnamen müssen `current.temp_c` heissen (nicht `temperature`).

```bash
node analyse.js
```

### Challenge 3: Smart-Home-Sensoren simulieren

#### 3.1 Raumklima-Sensor

```bash
mqttx pub -t 'home/wohnzimmer/klima' -h broker.emqx.io \
  -m '{"temp_c": 22.5, "humidity_percent": 58, "sensor": "dht22"}'
```

**Queries:**

```javascript
db.wetter_messungen.find({ mqtt_topic: "home/wohnzimmer/klima", temp_c: { $gt: 24 } })
db.wetter_messungen.find({ humidity_percent: { $lt: 40 } })
```

#### 3.2 Bodenfeuchte-Sensor

```bash
mqttx pub -t 'garten/pflanzen/bodenfeuchte' -h broker.emqx.io \
  -m '{"sensor_id": "pflanze_balkon", "feuchte_prozent": 18, "status": "kritisch", "alarm": true}'
```

**Queries:**

```javascript
db.wetter_messungen.find({ alarm: true })
db.wetter_messungen.find({ feuchte_prozent: { $lt: 30 } })
```

#### 3.3 Fenster-/Türkontakt

```bash
mqttx pub -t 'home/sicherheit/fenster/balkon' -h broker.emqx.io \
  -m '{"status": "geoeffnet", "battery_percent": 86, "device": "aqara_kontakt_01"}'
```

**Query:**

```javascript
db.wetter_messungen.find({
  status: "geoeffnet",
  mqtt_topic: { $regex: "sicherheit/fenster" }
})
```

#### 3.4 Smart Meter

```javascript
db.wetter_messungen.aggregate([
  { $match: { mqtt_topic: "stromzaehler/wohnung/total" } },
  { $group: {
      _id: null,
      avg_verbrauch_watt: { $avg: "$leistung_watt" },
      max_leistung: { $max: "$leistung_watt" },
      messungen: { $sum: 1 }
  }}
])
```

#### 3.5 Lautstärke-Sensor

```javascript
db.wetter_messungen.find({ dezibel: { $gt: 60 } })
```

### Challenge 4: Multi-Sensor Bridge

**`config.js`:**

```javascript
mqtt: {
  broker: 'mqtt://broker.emqx.io:1883',
  topics: [
    'wetter/schweiz/gruppe1',
    'home/+/klima',
    'garten/pflanzen/bodenfeuchte',
    'home/sicherheit/fenster/#'
  ],
  clientId: 'multi_sensor_subscriber_gruppe1'
}
```

**`mqtt-to-mongodb.js` – in `connectMQTT()` die `subscribe`-Zeile ersetzen:**

```javascript
config.mqtt.topics.forEach(topic => {
  mqttClient.subscribe(topic, (err) => {
    if (err) console.error(`❌ Fehler bei ${topic}:`, err.message);
    else console.log(`📬 Abonniert: ${topic}`);
  });
});
```

### Challenge 5: Sensor-Typen automatisch erkennen

**`mqtt-to-mongodb.js` – im `message`-Handler:**

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
      sensor_typ: sensorTyp,
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

**Queries:**

```javascript
// Nur Raumklima-Daten
db.wetter_messungen.find({ sensor_typ: "raumklima" })

// Alle Sicherheitsereignisse
db.wetter_messungen.find({ sensor_typ: "sicherheit", status: "geoeffnet" })

// Aggregation: Messungen pro Sensor-Typ
db.wetter_messungen.aggregate([
  { $group: { _id: "$sensor_typ", anzahl: { $sum: 1 } } },
  { $sort: { anzahl: -1 } }
])
```

***

## Häufige Stolpersteine

| Problem | Ursache | Lösung |
|---|---|---|
| `Not authorized` / ständige Reconnects | Gleicher `clientId` bei mehreren Clients – der Broker kickt sie gegenseitig | Eindeutige `clientId` in `config.js` verwenden (z.B. `wetter_subscriber_<name>`) |
| Queries liefern 0 Ergebnisse | Falsche Feldnamen (`temperature` statt `current.temp_c`) | Feldnamen aus dem Beispiel-Dokument prüfen |
| `bad auth` bei MongoDB | Sonderzeichen im Passwort nicht URL-encoded | `@`→`%40`, `#`→`%23`, `!`→`%21` |
| Keine Nachrichten | Topic-Mismatch zwischen Simulation und `config.js` | Topics exakt gleich schreiben (inkl. Gross-/Kleinschreibung) |
