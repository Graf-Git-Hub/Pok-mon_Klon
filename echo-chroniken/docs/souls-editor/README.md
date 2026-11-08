# Echo-Chroniken Kartenwerkstatt (SOULS 3.46)

**Das ist kein generiertes Beispielbild.** Diese Projektdateien enthalten die **60 echten Echo-Chroniken-Spielmaps** aus dem GitHub-Repository, inklusive Gelände, Objekt- und Türpunkten.

## Bearbeiten auf dem Handy oder am PC

Der eigens vorbereitete `EchoChroniken_Kartenwerkstatt.html` ist eine Kopie der **echten SOULS-Kartenwerkstatt 3.46** mit den 60 Echo-Karten als Startprojekt. Sie benutzt einen eigenen Speicherbereich (`echo_chroniken_souls_workshop_20261107`), verändert also keine bisherigen SOULS-Spielstände oder Editorprojekte.

Der Editor kann als HTML-Datei lokal geöffnet werden. Nach separater Veröffentlichung unter GitHub Pages direkt erreichbar über:

https://graf-git-hub.github.io/Souls/echo-chroniken-editor.html

Die Datei `EchoChroniken_SOULS_Alle_60_Maps.json` ist der originalgetreue bearbeitbare Grundbestand. In `EchoChroniken_SOULS_Pilot_Wurzelheim.json` findest du die erste bereits umgestaltete Pilotkarte.

**Zum Bearbeiten:** Karte aus der Kartenliste auswählen, mit den vorhandenen Boden-, Natur- und Haus-Werkzeugen ändern, dann in der Kartenwerkstatt **Projekt speichern** (JSON). Die Rückumwandlung läuft über das mitgelieferte Tool und ist zunächst bewusst nicht als ungeprüfter Direktupload in das laufende Spiel eingebaut.

## Wirklich im Spiel

Pilot `legacy_wurzeldorf` (Wurzelheim): mehrere sicher bearbeitete Feldkacheln (Weg und Begrünung) plus 2 neue Dekoelemente. Das kompakte Ergebnis ist in `project/data/echo-souls-edits.js` gespeichert; das Spiel lädt es tatsächlich und zeichnet die Dekoration. Hohes Gras hat eine Vordergrund-Ebene **über dem Spieler**.

Alle 60 Gebiete liegen im Editor. Andere Gebiete sind weiterhin unverändert spielbar, bis tatsächlich überarbeitete Karten von der Editor-Datei importiert werden. Die Übernahme wird bewusst auf Änderungen begrenzt, die keine Questpunkte, alten Gebäude, Eintrittspunkte, Türverbindungen oder Speicherstände zerstören.

## Projekt-Rückimport (für die Entwicklung)

```powershell
cd echo-chroniken/project
node tools/souls-bridge/convert.cjs import "Pfad/zur/SOULS_Gesamtprojekt.json"
```

Der Befehl vergleicht mit `tools/souls-bridge/original-maps.json`, übernimmt nur die tatsächlich bearbeiteten Kacheln und harmlose Dekorationen und verwirft gefährliche Änderungen. Grenzen: derzeit keine freie Verlegung von Quest-/Story-Türen oder Änderung der Mapabmessungen über den Editor. Dafür wäre eine eigene Storymigration mit neuen Gegenportalen erforderlich.

## Nachweise

- `node tests/souls-editor-bridge.cjs`: alle 60 Karten, Roundtrip, echte Kollisionswertänderungen, Quest-/Spawn-Schutz, Overlays, Negativtests.
- `python qa/souls-editor-bridge-browser.py`: echter Chrome-Desktop und Handy, Editor öffnet mit 60 Karten, Wurzelheim-Änderungen werden vom laufenden Spiel benutzt.
- Screenshots und Browser-Protokoll in `docs/visual-audit/souls-bridge/`.
- Unveränderte Save-Schema-Version v2, IDs aller 150 Wesen, Retro-START-Menü und Android-Paketname.

Die 60 importierten Karten sind eine **Editiergrundlage**, kein bereits von Hand gezeichnetes neues Pixelart-Weltbild. Die spielbaren Grundkarten aus dem vorangegangenen Weltumbau bleiben erhalten.

## Kartenwerkstatt V2 (08.11.2026): erstes sichtbares Wurzelheim-Redesign

Die alte Adresse bleibt für bestehende Nutzerprojekte verfügbar. Die neue additive V2 liegt unter:

https://graf-git-hub.github.io/Souls/echo-chroniken-editor-v2.html

- Alle 60 Maps bleiben bearbeitbar. Die fünf Wurzelheimer 5×3-Häuser nutzen jetzt **75 echte Dach-, Wand-, Fenster- und Türkacheln** statt 75 identischer brauner Wandkacheln.
- Keine Story-/Kollisionskoordinaten der Häuser geändert. Der Importer schützt nun auch Fenster und Türen der Baukastenhäuser als ursprüngliche Blockkacheln.
- Neuer isolierter Editor-Speicherschlüssel `echo_chroniken_souls_workshop_20261108`. Vorherige V1-Daten bleiben im älteren Browser-Speicher; sie sind in V2 **nicht automatisch übernommen**. Bei Bedarf Projekt-JSON exportieren/importieren.
- Im Spielcode: ruhigere Wege-, Erd- und Grastexturen in `project/src/village.js`.
- Noch offen: umfassender Umbau aller Wurzelheimer Wege, Stadtzentrum und Randbewuchs; danach die 59 anderen Maps. V2 ist **ein erster visueller Fortschritt, keine vollständige Premium-Karte**.

Prüfungen: `node tests/village.cjs`, `node tests/first-route.cjs`, `node tests/village-visual-style.cjs`, `node tests/souls-editor-bridge.cjs`, echter Desktop-/Telefon-Chromium-Test `python qa/souls-editor-bridge-browser.py`.
