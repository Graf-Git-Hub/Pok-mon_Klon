# Echo-Chroniken 🎮👻

> **APK-Updates vorübergehend angehalten:** Der bisherige GitHub-Build erzeugte immer eine andere Debug-Signatur und wechselnde App-IDs. Dadurch sind Dorf, Fair, Neu, Paket und Pfad als getrennte Apps entstanden. Neue, inkompatible APKs werden nicht mehr automatisch veröffentlicht. Der feste App-Name und das dauerhaft signierte Release sind in [Pull Request #1](https://github.com/Graf-Git-Hub/Pok-mon_Klon/pull/1) vorbereitet. Zum Abschluss fehlen noch die privat hinterlegten Signier-Secrets. Der alte APK-Link kann bis dahin noch die bisherige Testversion enthalten. Alte Apps bitte nicht vor einer Sicherung der Spielstände deinstallieren.

## 🏡 Neue Innenräume: Kräuterhaus und Werkstatt

Die ehemals verschlossenen Gebäude in Wurzelheim sind jetzt **wirklich betretbar**:

- **Kräuterhaus (bei Kartenfeld 14,5):** Fenja erklärt ein kleines Drei-Farben-Rätsel. Leuchte die Töpfe in der Reihenfolge Blau → Gold → Rosa an. Einmalige Belohnung: **2 Tränke und 3 Seelen-Sphären**.
- **Werkstatt (bei Kartenfeld 6,17):** Mechanikerin Edda kalibriert deine Fang-Linse am Arbeitstisch. Danach erhöht sich die Fangchance dauerhaft um **8 Prozentpunkte**. Zusätzlich gibt es **2 Seelen-Sphären**.
- Beide Räume haben eigenständige Pixel-Einrichtung und sind mit dem Steuerkreuz begehbar. **A** zum Untersuchen, unten durch die Tür zurück ins Dorf. Die Belohnungen sind nur einmal erhältlich.
- Fortschritt und Rückkehrposition werden dauerhaft im lokalen Spielstand gespeichert, einschließlich Migration vorhandener Speicherstände.
- **Kampfverbesserung:** Pixel-Angriffe fliegen vom Angreifer zum Ziel und die getroffene Seite wackelt. Gegnerangriffe sind jetzt auch sichtbar auf deinen Geist gerichtet.
- **Tests:** `tests/interiors.cjs` für Rätsel/Belohnungen/Animationen und `tests/interiors-integration.cjs` für den tatsächlichen Controller-Ablauf durch beide Räume.

**Hinweis zur APK:** Der Android-Quellcode wurde aktualisiert. Eine neue Installationsdatei wird noch nicht veröffentlicht, solange die dauerhafte Signierung fehlt. Keine weitere separate Test-App und kein zusätzliches Icon.

## 🗺️ Spielverbesserung: Entdeckerkarte und versteckte Vorräte

- **Gebietskarte**: Auf Android-Handy über **🗺 Karte**, mit Controller über **SELECT / Minus** öffnen. **A, B oder START** schließen sie wieder. Der Spieler, Wege, Dorfhäuser, Questpunkte und ungeöffnete Vorräte werden angezeigt.
- **Drei sichtbare Pixel-Vorratskisten** im Dorf und auf dem Waldpfad, die mit **A** aus der Nähe geöffnet werden. Die gefundenen Seelen-Tränke und Seelen-Sphären werden nur einmal vergeben.
- **Verlässlicher Spielstand**: automatisches Speichern bei wichtigen Interaktionen, Beute, gewonnener/geflohener Begegnung, verändertem Attackenbuch und regelmäßig während der Erkundung. Alte Spielstände bekommen eine leere Vorratsliste statt zu scheitern.
- **Fairere Erkundung**: Wildbegegnungschance pro hohem Grasfeld von 12 % auf **8 %** reduziert und längere Schonfrist nach Kämpfen. Gegnerlevel bleiben nach den bisherigen Balancingregeln.
- **Nach einer Niederlage** wacht man tatsächlich in Omas Haus auf, nicht unpassend draußen auf dem Weg.
- **Tests**: `tests/exploration.cjs` prüft Kartenanzeige, einmalige Vorräte, Datenerhalt und die Erreichbarkeit aller Verstecke auf der tatsächlichen Dorfkarte.

**Android-Stand:** Die funktionierende App-Erweiterung liegt im Quellcode. Die öffentliche APK-Veröffentlichung bleibt wegen des Signaturproblems pausiert, bis [die dauerhafte App-Signierung](https://github.com/Graf-Git-Hub/Pok-mon_Klon/pull/1) fertig eingerichtet ist. Keine zusätzliche App-ID und kein weiteres störendes Icon.

## 🌲 V0.13: Der Flüsterpfad

Eine neue spielbare frühe Nebenquest, ohne die bisherigen drei Arenen oder Omas Story zu verändern.

- Nach Verlassen von Omas Haus: **Liora am südlichen Waldpfad** ansprechen (Kartenfeld 17,18).
- Die drei gut sichtbaren Seelenlichter entlang des Waldwegs einsammeln: westlich (14,20), mittig (21,22), östlich (27,24). Mit **A**, auch wenn du direkt auf dem Licht stehst.
- Bei Liora abgeben: **2 Seelen-Tränke + 5 Seelen-Sphären**.
- Optionaler Prüfkampf bei **Waldhüter Piko** am Wegende (30,23): Ein Grundwesen auf **Level 4**, absichtlich leicht für Einsteiger. Sieg: **1 Trank + 3 Sphären**.
- Neuer gewundener Waldpfad mit Blumen, Hinweisschild, pulsierenden Lichtern und Quest-Fortschritt in der Spielansicht.
- Fortschritt wird bei Sammeln, Abgabe und gewonnenem Prüfkampf automatisch gespeichert; Belohnungen gibt es nur einmal.
- Alle bisherigen Wege, Tagebuchseiten und Arenen bleiben erreichbar; bestehende Speicherstände erhalten ihre anderen Fortschritte.
- Test: `echo-chroniken/project/tests/first-route.cjs` überprüft Pfade, Fundorte, Quest, Speicherstand und einmalige Belohnung.

**APK:** [Direkte installierbare APK, ohne ZIP](https://github.com/Graf-Git-Hub/Pok-mon_Klon/releases/download/android-latest/Echo-Chroniken-Universal.apk). Wegen der noch nicht dauerhaft verwalteten Android-Debug-Signatur ist v0.13 eine **separate Test-App** namens „Echo-Chroniken Pfad“. Alte Apps und Speicherstände werden nicht gelöscht, aber auch nicht automatisch übertragen.



## ⚔️ V0.12: Faire wilde Begegnungen

- **Fehler behoben:** Früher wechselte das Gebiet abrupt bei X=13/Y=16 zu Gegnerlevel 13–14. Das Startgebiet ist jetzt auch über diese Grenze hinaus geschützt.
- **Ohne Orden:** wilde Gegner Level **2–4** in der ersten Route, höchstens Level **5** in der entfernten Wildnis, ausschließlich Grundformen.
- **Mit Orden:** der Gegner wird nie mehr als ein Level über dem stärksten Teammitglied angesetzt; spätere Gebiete steigen nur kontrolliert an.
- Die ersten **drei gewonnenen Kämpfe** sind zusätzlich erleichtert, damit der Einstieg gelingt.
- **Regressionstest:** `echo-chroniken/project/tests/encounters.cjs` prüft 1.840 Begegnungen an zehn Positionen und mit unterschiedlichen Leveln/Orden.
- **Android-Test-App-ID:** `de.echochroniken.game.balance`, Anzeigename **„Echo-Chroniken Fair“**. Wegen der noch wechselnden Debug-Signatur separat installierbar. Spielstände bestehender Test-Apps werden nicht automatisch übertragen.


## 📦 V0.11: Paket auf Omas Tisch lässt sich zuverlässig öffnen

- Paket kann von vorne und den Seiten mit **A** geöffnet werden, **unabhängig von der Blickrichtung**.
- Neue klare Einblendung „A: PAKET ÖFFNEN“, wenn man nah genug steht.
- Auf dem Handy: Paket auf dem Tisch auch direkt antippbar, sobald man daneben steht.
- Automatischer Regressionstest: `echo-chroniken/project/tests/package.cjs` prüft sechs Positionen einschließlich der gemeldeten Screenshot-Position.
- **App-Name: Echo-Chroniken Paket**, App-ID `de.echochroniken.game.paket`. Installiert sich als eigener Test neben „Echo-Chroniken Dorf“, um die bisher noch wechselnden Debug-Signaturen nicht mit bestehenden Installationen kollidieren zu lassen.
- Die beiden Test-Apps teilen ihre Speicherstände **nicht**. Die alte App bitte nicht löschen, wenn deren Spielstand wichtig ist.

## 📲 APK direkt herunterladen (Handy + Android-TV)

**[⬇️ Aktuelle Echo-Chroniken APK herunterladen](https://github.com/Graf-Git-Hub/Pok-mon_Klon/releases/download/android-latest/Echo-Chroniken-Universal.apk)**

- **Nur eine .apk, keine ZIP-Datei.** Auf dem Handy herunterladen und antippen, um zu installieren.
- **Immer derselbe Link:** Der GitHub-Workflow ersetzt die APK nach jedem erfolgreichen Build aus `main` automatisch.
- Die APK wird nur veröffentlicht, wenn die Tests und der Android-Build erfolgreich sind.
- Diese Ausgabe ist aktuell eine **Testversion mit Debug-Signierung**. Bis eine dauerhaft gleiche Signierung eingerichtet ist, kann für Updates eine Neuinstallation nötig sein.
- Alternativ: [GitHub Releases öffnen](https://github.com/Graf-Git-Hub/Pok-mon_Klon/releases/tag/android-latest).

---

GBA-inspiriertes Fantasy-RPG mit 150 Geisterwesen, klassischen Kämpfen, Touchsteuerung und Gamepad-Eingabe.

## 🌳 V0.10: Wurzelheim 2.0

- Fünf unterschiedliche Häuser: Omas Haus, Kräuterhaus, Haus am See, Werkstatt und Dorfladen.
- Gewundene Erd- und Pflasterwege statt der alten rechtwinkligen Hauptachsen.
- Dorfplatz mit Brunnen, Sitzbänken, Weglaternen, Gärten und blühenden Dekorationen.
- Kleine, organisch angeordnete **sichere** hohe Grasflächen im Dorf; wilde Geister nur außerhalb.
- Drei neue ansprechbare Dorfbewohner: Tilda, Jaro und Mina.
- Alte Questobjekte, Arenaleiter, See, Omas Eingang und Durchgänge erhalten.
- Neue Navigationstests: `echo-chroniken/project/tests/village.cjs`.
- Kommt als direkte APK mit Android-App-ID `de.echochroniken.game.dorf`: kann **neben V0.9** installiert werden, damit wegen der noch ausstehenden stabilen Signierung keine bestehende App oder Spielstand gelöscht werden muss. Spielstände werden dadurch **nicht** automatisch zwischen beiden Apps geteilt.

## 👵 Neu in V0.8: Spielbeginn bei Oma

- **Neue Spielstände starten in Omas begehbarem Haus**, nicht mehr auf der Wiese.
- Oma spricht mit dir über das Paket. Auf dem Tisch steht ein goldverschnürter Karton mit Glanzmarkierung.
- Erst Oma ansprechen, dann Paket öffnen: **Miora schließt sich deinem Team an**.
- Danach wieder mit Oma reden und das Haus verlassen; vor dem Paketfund hält Oma dich freundlich auf.
- Rückkehr ins Haus jederzeit möglich; Oma kann deine Monster heilen.
- **Alte Spielstände bleiben erhalten** und überspringen das Intro, falls Miora schon im Team ist.
- Für den gesamten Einstieg gibt es den automatischen Test `echo-chroniken/project/tests/house.cjs`.
- Derselbe Spielcode läuft auf Handy und Android-TV. APK wird bei jedem erfolgreichen Android-Build über den [direkten APK-Link](https://github.com/Graf-Git-Hub/Pok-mon_Klon/releases/download/android-latest/Echo-Chroniken-Universal.apk) bereitgestellt.

## V0.6: Wurzelheim & Attackenbuch

- Neues Pixel-Dorf mit Dachziegeln, Gartendekoration, Pflasterweg und Laternen.
- Wilde Wesen im Startgebiet: nur erste Entwicklungsstufe, Level 2–4.
- Neu ausbalancierter Kampfschaden und Schonfrist nach Begegnungen.
- Attacken mit Level lernen, niemals vergessen, sortierbar per L/R, auf Touch per Pfeilen; neue Attacken zuerst.
- Spielbare Handyversion mit virtueller Steuerung und Kampf-Testfeld.

### Downloads / Projekt

- **[Direkt spielbare Offline-HTML](echo-chroniken/index.html)**: Datei herunterladen und auf dem Handy im Browser öffnen.
- **[Modulares Spielprojekt](echo-chroniken/project/)**: `index.html`, Spiellogik, 150 Arten, Monsteratlas, 8 Rückansichten und CSS.
- **[Tests](echo-chroniken/project/tests/smoke.cjs)**: `node tests/smoke.cjs` im Projektordner; GitHub Actions prüft bei Änderungen.

Der Android-TV-APK-Build und ein Test mit einem realen Switch-Controller stehen noch aus. Für die übrigen 142 Monster fehlen richtige Rückenansichten.
