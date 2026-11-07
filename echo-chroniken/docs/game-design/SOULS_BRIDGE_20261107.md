# Echo-Chroniken x SOULS: Kartenwerkstatt 3.46

## Ergebnis

Die originale SOULS-Kartenwerkstatt 3.46 wurde als **eigenständige Echo-Ausgabe** unter `echo-chroniken-editor.html` im GitHub-Pages-Zweig von `Graf-Git-Hub/Souls` veröffentlicht. Sie nutzt den separaten lokalen Speicher `echo_chroniken_souls_workshop_20261107`, daher bleiben bestehende SOULS-Spielwelten unangetastet.

Der tatsächliche, aktuelle 60-Karten-Bestand aus `Graf-Git-Hub/Pok-mon_Klon` wurde mit `project/qa/souls-export-echo.py` als vollständige, SOULS-V7/8-kompatible JSON-Datei exportiert. Karten sind nicht erfunden, sondern enthalten tatsächlich im Spiel registrierte Gelände-Kacheln, Objekte und markierte Übergänge.

### Links

- Browser-Kartenwerkstatt: https://graf-git-hub.github.io/Souls/echo-chroniken-editor.html
- Original-Basis mit 60 Maps: `docs/souls-editor/EchoChroniken_SOULS_Alle_60_Maps.json`
- Bearbeitete Pilotdatei: `docs/souls-editor/EchoChroniken_SOULS_Pilot_Wurzelheim.json`
- Enthaltene Offline-Version: `docs/souls-editor/EchoChroniken_Kartenwerkstatt.html`

## Tatsächlicher Import ins Spiel

- `project/tools/souls-bridge/original-maps.json`: ausschließlich der nicht bearbeitete Ausgangszustand aller 60 Spielkarten; der Exportprozess deaktiviert vorherige SOULS-Edits ausdrücklich.
- `project/tools/souls-bridge/convert.cjs`: prüft das SOULS-Projekt gegen diese Originaldaten. Nur sichere Terrain-Änderungen und erlaubte Dekorationen werden in `project/data/echo-souls-edits.js` geschrieben.
- `project/src/maps/souls-bridge.js`: überträgt die Änderungen im echten Map-Array und zeichnet Dekoration, ohne Kollision, Spielstände und Questlogik abzutrennen.
- `project/src/game.js`: bindet die validierten Differenzen nach dem regulären Weltaufbau ein. Bei hohem Gras wird der Vordergrund **nach** der Spielfigur gezeichnet.
- `project/index.html`: lädt Daten/Importer vor dem Game.
- Pilot Wurzelheim: ein kurzer ergänzter Weg, Begrünung und zwei Dekorationen. **Der übrige Kartenbestand ist editierbar, aber noch nicht als neue künstlerische Gestaltung ins Spiel übernommen.**

### Story-/Quest-Sicherheit

Import verweigert:
- Veränderte Mapabmessungen oder verlegte/gelöschte Storytüren.
- Änderungen an Questobjekten, Hausgrundrissen, frühen festen Kampf-Wiesen, sicheren Spawns und markierten Interaktionspunkten.
- Gelände, das die Wege zwischen den vorhandenen Storymarkern und Portalen abschneidet.
- Ungültige Koordinaten oder unzulässige Kacheltypen.

**Wichtige Korrektur:** In der bestehenden Wurzelheim-Codekarte waren die Kampf-Grasfelder (13,23) und (14,23) von einem alten Route-Polishing in Wege verwandelt worden. Die Felder sind in `src/village.js` wieder als hohe Grasfläche hergestellt und künftig vor Importen geschützt. Das natürliche Kapitel-1-Szenario prüft genau diese Stellen.

## Verwendung ohne Programmieren

1. Die neue SOULS-Kartenwerkstatt auf dem Handy/PC öffnen. Wurzelheim ist die Startkarte. Alle 60 Gebiete liegen im Kartenmenü.
2. Wege, Gelände, Häuser und Details bearbeiten. Der Editor kann die gesamte Welt als JSON speichern.
3. Für die tatsächliche Integration in Echo-Chroniken die JSON-Datei dem Projekt geben. `node tools/souls-bridge/convert.cjs import Pfad/zur/Datei.json` importiert sie dann, sicher gegen Quest-/Save-Fehler.
4. Nach Import die echten Kapitel- und Browserprüfungen erneut laufen lassen.

Die getrennte Logik-/Bild-Ebene ist eine Grundlage für späteres img2img-Redesign, ohne dass die Spielfigur über statt *im* Gras läuft.

## Getestet

- `node tests/souls-editor-bridge.cjs`: 60 Originalkarten, gültiger und absichtlich ungültiger Import, Differenz-Übernahme, Szenenschutz und Vordergrund-Grafik.
- `python qa/souls-editor-bridge-browser.py`: echter Chrome auf Desktop und Handy, 60 Karten im Editor geladen und geänderte Wurzelheim-Kacheln im Spiel verifiziert.
- Sämtliche bestehenden Node-Karten-, Save-, Kampf- und Storytests bleiben erhalten.
- Die Verknüpfung ist eine eigenständige Weblösung, **keine Änderung an alten Save-Daten** und noch kein neuer Android-Release.
