#!/bin/bash
cd /volume1/web/backend-kasse || exit 1
export $(cat .env | xargs)
nohup node dist/index.js > backend.log 2>&1 &
echo "Backend gestartet mit PID: $!"

# Alle PID anzeigen:
# ps aux | grep node
# oder
#ps -ef | grep backend-kasse

# Prozess beenden:
# kill -9 PID

# Hintergrundprozess für Backend ausführbar machen:
# chmod +x start.sh

# Hintergrundprozess für Backend starten:
# ./start.sh

# Hintergrundprozess für Backend stoppen:
# pkill -f "node dist/index.js"

# Hintergrundprozess für Backend überwachen:
# tail -f backend.log

# Falls du willst, dass das Backend nach einem Neustart der NAS automatisch startet, kannst du das Skript im Synology Task-Scheduler hinzufügen:
#	1.	Öffne DSM → Systemsteuerung → Aufgabenplaner
#	2.	Erstelle eine neue “Benutzerdefinierte Aufgabe”
#	3.	Setze Befehl ausführen:
# /bin/bash /volume1/web/backend-kasse/backend-start.sh

