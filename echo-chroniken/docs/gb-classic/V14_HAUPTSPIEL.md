# Echo-Chroniken · Hauptspiel im Game-Boy-Stil V14

[Hauptspiel öffnen](https://graf-git-hub.github.io/Souls/echo-chroniken-v14-hauptspiel.html)

Der normale Kampagnenstart führt in Omas Haus. Die 60 registrierten Gebiete
verwenden die V14-Kacheln und Gebietstypen, den V14-Spielersprite und
raschelndes Gras. Auf 17 beidseitigen Außenverbindungen entfällt nach
erfolgreichem Wechsel der Dialog mit dem Namen des Zielgebiets.
Zugangsvoraussetzungen und Autosave gelten auch für diese Wechsel.

Die Kampagnenkarten liefern weiterhin Grundrisse, Kollisionen,
Begegnungsfelder, Questpositionen und sichere Ankunftspunkte. Die
verschobenen Geometrien der V14-Erkundungsvorschau und die Vorschau der
Nachbarkarte am Rand sind im Hauptspiel noch nicht übernommen.
Dort öffnet sich auch kein V16-Wegweiser.

## Build und Prüfung

Im Verzeichnis `echo-chroniken/project`:

- `python tools/gb-world/build_campaign_art.py` erzeugt die Renderdaten aus V14.
- `python tools/gb-world/build_campaign_release.py AUSGABEVERZEICHNIS` erzeugt die HTML-Seite und ihre zwei Atlas-Dateien.
- `node tests/gb-campaign.cjs` lädt die reguläre Script-Reihenfolge und prüft 60 Renderaufrufe, 34 Außenrichtungen, eine verschlossene und eine offene Story-Passage, Autosave, Gras und einen Wildkampf.
- `node tests/all-60-world-layout.cjs`, `node tests/continuous-campaign.cjs` und `node tests/save-compat.cjs` prüfen den Weltgraphen, die Kampagnenlogik und bestehende Spielstände.
