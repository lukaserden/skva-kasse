
# Datenbankschema für die Kassen-App

## Tabelle: Mitglieder
Speichert die Informationen der Vereinsmitglieder.

| Spalte         | Typ        | Beschreibung                                  |
|----------------|------------|-----------------------------------------------|
| `id`           | INTEGER    | Primärschlüssel, eindeutige ID.               |
| `name`         | TEXT       | Name des Mitglieds.                           |
| `rolle`        | TEXT       | Rolle des Mitglieds (z. B. Admin, Kassierer). |

```sql
CREATE TABLE mitglieder (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    rolle TEXT NOT NULL
);
```

---

## Tabelle: Artikel
Speichert die Informationen Artikeln und deren Bestand.

| Spalte          | Typ        | Beschreibung                             |
|-----------------|------------|------------------------------------------|
| `id`            | INTEGER    | Primärschlüssel, eindeutige ID.          |
| `name`          | TEXT       | Name des Artikels (z. B. Cola).          |
| `kategorie`     | TEXT       | Getränke, Essen oder Diverses.           |
| `sub_kategorie` | TEXT       | z. B. Alk., Non-Alk., Spirit, etc.       |
| `preis`         | DECIMAL    | Preis pro Einheit.                       |
| `einheit`       | DECIMAL    | Einheit Bspw. 4cl.                       |
| `bestand`       | INTEGER    | Aktueller Bestand des Artikels.          |

```sql
CREATE TABLE artikel (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    kategorie TEXT,
    sub_kategorie TEXT,
    preis DECIMAL(10, 2) NOT NULL,
    bestand INTEGER NOT NULL
);
```

---

## Tabelle: Transaktionen
Speichert alle getätigten Buchungen (Konsumationen).

| Spalte         | Typ        | Beschreibung                                                                                              |
|----------------|------------|-----------------------------------------------------------------------------------------------------------|
| `id`           | INTEGER    | Primärschlüssel, eindeutige ID.                                                                           |
| `mitglied_id`  | INTEGER    | Verweis auf die `id` in der Tabelle Mitglieder (für wen die Konsumation ist).                             |
| `datum`        | DATETIME   | Zeitpunkt der Buchung.                                                                                    |
| `tisch`        | BOOLEAN    | Ist das eine Tisch trx?                                                                                   |
| `preis`        | DECIMAL    | Gesamtpreis der Buchung.                                                                                  |
| `storno`       | BOOLEAN    | Ist Storno (ja/nein)?                                                                                     |
| `erfasser_id`  | INTEGER    | Verweis auf die `id` in der Tabelle Mitglieder (welches Mitglied im Service die Transaktion erfasst hat). |

```sql
CREATE TABLE transaktionen (
    id INTEGER PRIMARY KEY,
    mitglied_id INTEGER,
    datum DATETIME DEFAULT CURRENT_TIMESTAMP,
    preis DECIMAL(10, 2) NOT NULL,
    storno BOOLEAN DEFAULT FALSE,
    erfasser_id INTEGER,
    FOREIGN KEY (mitglied_id) REFERENCES mitglieder (id),
    FOREIGN KEY (erfasser_id) REFERENCES mitglieder (id)
);
```

---

## Tabelle: Transaktion_Artikel
Speichert die Artikel und deren Mengen, die zu einer Transaktion gehören.

| Spalte           | Typ        | Beschreibung                                                              |
|------------------|------------|---------------------------------------------------------------------------|
| `id`             | INTEGER    | Primärschlüssel.                                                          |
| `transaktion_id` | INTEGER    | Verweis auf die `id` der Tabelle Transaktionen.                           |
| `artikel_id`     | INTEGER    | Verweis auf die `id` in der Tabelle Artikel.                              |
| `menge`          | INTEGER    | Anzahl der gebuchten Artikel für diese Transaktion.                       |

```sql
CREATE TABLE transaktion_artikel (
    id INTEGER PRIMARY KEY,
    transaktion_id INTEGER NOT NULL,
    artikel_id INTEGER NOT NULL,
    menge INTEGER NOT NULL,
    FOREIGN KEY (transaktion_id) REFERENCES transaktionen (id),
    FOREIGN KEY (artikel_id) REFERENCES artikel (id)
);
```

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

```sql
CREATE TABLE bestandsaenderungen (
    id INTEGER PRIMARY KEY,
    artikel_id INTEGER,
    aenderung INTEGER NOT NULL,
    grund TEXT,
    datum DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (artikel_id) REFERENCES artikel (id)
);
```

---

## Beziehungen im Schema
1. **Mitglieder und Transaktionen**:
   - Ein Mitglied kann mehrere Transaktionen haben.
   - `mitglied_id` in der Tabelle `Transaktionen` ist ein Fremdschlüssel, der auf `id` in der Tabelle `Mitglieder` verweist.

2. **Transaktionen und Artikel**:
   - Eine Transaktion kann mehrere Artikel enthalten.
   - Diese Beziehung wird über die Tabelle `Transaktion_Artikel` abgebildet.
   - `transaktion_id` in der Tabelle `Transaktion_Artikel` ist ein Fremdschlüssel, der auf `id` in der Tabelle `Transaktionen` verweist.
   - `artikel_id` in der Tabelle `Transaktion_Artikel` ist ein Fremdschlüssel, der auf `id` in der Tabelle `Artikel` verweist.

3. **Artikel und Bestandsänderungen**:
   - Bestandsänderungen sind mit den Artikeln verknüpft.
   - `artikel_id` in der Tabelle `Bestandsänderungen` verweist auf `id` in der Tabelle `Artikel`.

---
