
# Anforderungen für die Kassen-App

## 1. Ziel der Web-App
Die Web-App ist ein Kassensystem für den Verein (SKVA), das Konsumationen auf Mitgliedsnamen erfasst. 
Sie wird lokal auf einem iPad im Vereinsnetzwerk betrieben und benötigt keine Online-Verbindung.  
Die App ist für Touchscreen-Geräte optimiert und soll eine benutzerfreundliche Oberfläche bieten.

---

## 2. Hauptfunktionen
- Konsumationen erfassen (z. B. Cola auf einen Mitgliedsnamen buchen).
- Konsumation von Tischen erfassen.
- Artikel verwalten (z. B. neue Getränke hinzufügen oder Preise ändern).
- Mitgliederübersicht mit einfachen Rollen (Admin, Kassierer).
- Abrechnung einer Serviceeinheit erstellen:
  - Eine Serviceeinheit umfasst eine "Servicewoche".
  - Die Abrechnung erfolgt entweder global (alle Rechnungen einer Person) oder pro Benutzer/Tisch.

---

## 3. Benutzergruppen und Rechte
### Benutzerrollen:
- **Admin (Vereinskassierer)**: Kann Mitglieder, Artikel und Rollen verwalten, Abrechnung erstellen.
- **Kassierer (Service)**: Kann nur Konsumationen erfassen und Berichte einsehen.

### Rechte pro Rolle:
- Admins haben vollständigen Zugriff auf alle Funktionen.
- Kassierer können nur Transaktionen erfassen und Berichte einsehen.
- Optional: Eine zukünftige Rolle "Supervisor" könnte hinzugefügt werden, um nur Berichte einzusehen.

---

## 4. Technische Anforderungen
- **Plattform**: iPad-Browser (lokales Netzwerk, kein Online-Hosting).
- **Technologie**: 
  - React für das Frontend.
  - Node.js für das Backend (lokal).
  - SQLite für die Datenbank.
- **Touchscreen-Optimierung**: Große Buttons und minimalistische Benutzeroberfläche.
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
  - Sitzung-Timeout: Automatisches Abmelden nach 15 Minuten Inaktivität.
- **Einfache Installation**: App soll nur lokal im Vereinsnetzwerk laufen.
- **Offline-Synchronisierung**: Auch im Standby-Modus sollen eingegebene Daten lokal gespeichert und später synchronisiert werden.
- **Lokales Hosten mit Raspberry PI oder NAS**: 
  - Die App sollte lokal auf einer NAS oder Raspberry PI gehostet sein.
  - Im Browser erreichbar via localhost oder DNS-Einstellungen wie `goto/kasse`.

---

## 7. Einschränkungen und Annahmen
- App wird nicht gehostet, sondern nur im lokalen Netzwerk verwendet.
- Kein Zugriff auf die App außerhalb des Netzwerks.
- **Zukunftsoption**: Remote-Zugriff könnte später durch VPN oder Cloud-Funktionen ermöglicht werden. Beispielsweise für Turniere die ausserhalb der Vereinslokalität durchgeführt werden.

Inspiration: https://www.youtube.com/watch?v=GAHfy3Rj4f4

