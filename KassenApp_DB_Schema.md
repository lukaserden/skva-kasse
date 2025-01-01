
# Datenbankschema für die Kassen-App

## Tabelle: Mitglieder
Speichert die Informationen der Vereinsmitglieder.

| Spalte         | Typ        | Beschreibung                                  |
|----------------|------------|-----------------------------------------------|
| `id`           | INTEGER    | Primärschlüssel, eindeutige ID.               |
| `name`         | TEXT       | Name des Mitglieds.                           |
| `rolle`        | TEXT       | Rolle des Mitglieds (z. B. Admin, Kassierer). |

CREATE TABLE mitglieder (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    rolle TEXT NOT NULL
);

---

## Tabelle: Artikel
Speichert die Informationen zu den verkauften Artikeln und deren Bestand.

| Spalte         | Typ        | Beschreibung                             |
|----------------|------------|------------------------------------------|
| `id`           | INTEGER    | Primärschlüssel, eindeutige ID.          |
| `name`         | TEXT       | Name des Artikels (z. B. Cola).          |
| `preis`        | DECIMAL    | Preis pro Einheit.                       |
| `bestand`      | INTEGER    | Aktueller Bestand des Artikels.          |

CREATE TABLE artikel (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    preis DECIMAL(10, 2) NOT NULL,
    bestand INTEGER NOT NULL
);

---

## Tabelle: Transaktionen
Speichert alle getätigten Buchungen (Konsumationen).

| Spalte         | Typ        | Beschreibung                                                                                              |
|----------------|------------|-----------------------------------------------------------------------------------------------------------|
| `id`           | INTEGER    | Primärschlüssel, eindeutige ID.                                                                           |
| `mitglied_id`  | INTEGER    | Verweis auf die `id` in der Tabelle Mitglieder (für wen die Konsumation ist).                             |
| `artikel_id`   | INTEGER    | Verweis auf die `id` in der Tabelle Artikel (welcher Artikel gebucht wurde).                              |
| `menge`        | INTEGER    | Anzahl der gebuchten Artikel.                                                                             |
| `datum`        | DATETIME   | Zeitpunkt der Buchung.                                                                                    |
| `preis`        | DECIMAL    | Gesamtpreis der Buchung.                                                                                  |
| `storno`       | BOOLEAN    | Ist Storno (ja/nein)?                                                                                     |
| `erfasser_id`  | INTEGER    | Verweis auf die `id` in der Tabelle Mitglieder (welches Mitglied im Service die Transaktion erfasst hat). |

CREATE TABLE transaktionen (
    id INTEGER PRIMARY KEY,
    mitglied_id INTEGER,
    artikel_id INTEGER,
    menge INTEGER NOT NULL,
    datum DATETIME DEFAULT CURRENT_TIMESTAMP,
    preis DECIMAL(10, 2) NOT NULL,
    erfasser_id INTEGER,
    FOREIGN KEY (mitglied_id) REFERENCES mitglieder (id),
    FOREIGN KEY (artikel_id) REFERENCES artikel (id),
    FOREIGN KEY (erfasser_id) REFERENCES mitglieder (id)
);

---

## Tabelle: Bestandsänderungen
Protokolliert alle Änderungen am Bestand (z. B. Lieferungen, manuelle Anpassungen).

| Spalte         | Typ        | Beschreibung                                 |
|----------------|------------|----------------------------------------------|
| `id`           | INTEGER    | Primärschlüssel, eindeutige ID.              |
| `artikel_id`   | INTEGER    | Verweis auf die `id` in der Tabelle Artikel. |
| `aenderung`    | INTEGER    | Positiver oder negativer Wert.               |
| `grund`        | TEXT       | Grund der Änderung (z. B. "Lieferung").      |
| `datum`        | DATETIME   | Zeitpunkt der Änderung.                      |

CREATE TABLE bestandsaenderungen (
    id INTEGER PRIMARY KEY,
    artikel_id INTEGER,
    aenderung INTEGER NOT NULL,
    grund TEXT,
    datum DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (artikel_id) REFERENCES artikel (id)
);

---

## Beziehungen im Schema
1. **Mitglieder und Transaktionen**:
   - Ein Mitglied kann mehrere Transaktionen haben.
   - `mitglied_id` in der Tabelle `Transaktionen` ist ein Fremdschlüssel, der auf `id` in der Tabelle `Mitglieder` verweist.

2. **Artikel und Transaktionen**:
   - Ein Artikel kann in mehreren Transaktionen vorkommen.
   - `artikel_id` in der Tabelle `Transaktionen` ist ein Fremdschlüssel, der auf `id` in der Tabelle `Artikel` verweist.

3. **Artikel und Bestandsänderungen**:
   - Bestandsänderungen sind mit den Artikeln verknüpft.
   - `artikel_id` in der Tabelle `Bestandsänderungen` verweist auf `id` in der Tabelle `Artikel`.

---
