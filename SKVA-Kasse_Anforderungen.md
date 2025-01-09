# Anforderungen für die Kassen-App

## 1. Ziel der Web-App

Die Web-App ist ein Kassensystem für den Verein (SKVA), das Konsumationen auf Mitgliedsnamen erfasst.
Sie wird lokal auf einem iPad im Vereinsnetzwerk betrieben und benötigt keine Online-Verbindung.  
Die App ist für Touchscreen-Geräte optimiert und soll eine benutzerfreundliche Oberfläche bieten.

Die App wird in mit 2 verschiedenen GUIs geführt: /Kasse und /Admin.

---

## 2. Hauptfunktionen

/Kasse:

- Login
- Konsumationen erfassen (z. B. Cola auf einen Mitgliedsnamen buchen).
- Konsumation von Tischen erfassen und im Bezahlvorgang unterstützen.
- (Belege drucken)

/Admin:

- Login
- Mitgliederübersicht mit einfachen Rollen (Admin, Kassierer).
- Mitglieder verwalten (erfassen, mutieren, löschen)
- Artikel verwalten (z. B. neue Getränke hinzufügen oder Preise ändern).
- Reports (Abrechnung, Logs, etc.) einer Serviceeinheit erstellen.

---

## 3. Benutzergruppen und Rechte

### Benutzerrollen:

- _Admin (Vereinskassierer)_: Kann Mitglieder, Artikel und Rollen verwalten, Abrechnung erstellen.
- _Kassierer (Service)_: Kann nur Konsumationen erfassen und Berichte einsehen.

### Rechte pro Rolle:

- Admins haben vollständigen Zugriff auf alle Funktionen.
- Kassierer können nur Transaktionen erfassen und Berichte einsehen.
- Optional: Eine zukünftige Rolle "Supervisor" könnte hinzugefügt werden, um nur Berichte einzusehen.
- Admins können keine Transaktionen für Kassierer erfassen bzw. mutieren, die sie in der Serviceeinheit vornehmen. (Integrität)

---

## 4. Technische Anforderungen

- **Plattform**: iPad-Browser (lokales Netzwerk, kein Online-Hosting).
- **Technologie**:
  - React für das Frontend.
  - Node.js für das Backend (lokal).
  - SQLite für die Datenbank.
- **Touchscreen-Optimierung**: Grosse Buttons und minimalistische Benutzeroberfläche.
- **DNS-Einstellung**:
  - Beispiele: Die App sollte erreichbar sein unter `goto/kasse` oder `goto/admin`.
  - Anleitung: Lokale DNS-Einträge könnten durch Bearbeitung der Hosts-Datei oder Einrichtung eines Reverse Proxy (z. B. NGINX) erfolgen.

---

## 5. Benutzeroberfläche (UI)

### Erforderliche Ansichten:

- Dashboard mit Überblick über Konsumationen.
- Buchungsseite mit Artikelliste und Mitgliedsauswahl.
- Admin-Bereich zur Verwaltung von Artikeln und Rollen.
- **Zusätzliche Ansicht**: Report-Generator für Tagesabschlüsse oder Serviceeinheiten-Abrechnungen.

---

## 6. Nicht-Funktionale Anforderungen

- **Performance**: Die App soll auch bei 100+ Mitgliedern flüssig laufen.
- **Sicherheit**:
  - Passwortgeschützter Zugang für Admins und Kassierer.
  - ? Sitzung-Timeout: Automatisches Abmelden nach 15 Minuten Inaktivität. ?
- **Einfache Installation**: App soll nur lokal im Vereinsnetzwerk laufen.
- **Offline-Synchronisierung**: Auch im Standby-Modus sollen eingegebene Daten lokal gespeichert und später synchronisiert werden.
- **Lokales Hosten mit NAS ist vorgesehen**:
  - Die App sollte lokal auf einer NAS gehostet sein.
  - Im Browser erreichbar mit entsprechenden DNS-Einstellungen wie `skva.kasse` bzw. `skva.admin` oder ähnlich.

---

## 7. Einschränkungen und Annahmen

- App wird initial nicht übers Internet gehostet, sondern nur im lokalen Netzwerk verwendet.
- Kein Zugriff auf die App ausserhalb des Netzwerks.
- **Zukunftsoption**: Remote-Zugriff könnte später durch VPN oder Cloud-Funktionen ermöglicht werden. Beispielsweise für Turniere die ausserhalb der Vereinslokalität durchgeführt werden.
