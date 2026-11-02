# CONTINUE HERE - Echo-Chroniken Spielentwicklung

Stand 01.11.2026, Repo Graf-Git-Hub/Pok-mon_Klon, main.
**Letzte verifizierte signierte Android-APK: v0.19.0 / versionCode 20.**
Quellcommit 6019e1e0cf315a5840584f7efa07afaca73f5c60;
Android Actions Run 41328383208 erfolgreich, stabile App-ID de.echochroniken.game.stable.
APK 2.454.774 Bytes; heruntergeladen und auf Laptop-Desktop ersetzt.
SHA256 A1F4FA96CD74E3F682BBE42B978462BEE2340F1EBBD5FB3A1C918B5D70FF70E2.
Direktlink: https://github.com/Graf-Git-Hub/Pok-mon_Klon/releases/download/android-latest/Echo-Chroniken-Universal.apk
Aktuellen Git-HEAD vor weiteren Aenderungen pruefen.

## Neuste Aenderung 2026-11-02: Sprite-Neubau fuer Android 0.20.0

- Neuer Modul src/characters.js. Originale 16x20-Pixel-Menschen
  mit 16 Rollen, jeweils 4 Richtungen x 3 Schrittmuster. Keine externen Assets.
- Zentraler Renderer in src/game.js; genutzt von house.js, interiors.js,
  Wurzelheim, Chapter 3 und Chapter 4. Eigenstaendige Frisuren und Kleidung.
- tests/characters.cjs validiert alle 192 Framekombinationen.
- Reale Screenshots in docs/visual-audit/characters-contact-sheet.png,
  characters-home.png, characters-village.png und characters-world-*.png.
- Bestehende 20 Node-Tests plus neuer Sprite-Test bestanden; Browser ohne
  JavaScript-Fehler in Dorf, Haus, Bahnhof und Moorglas.
- Signierter Android 0.20.0 Release muss auf GitHub verifiziert werden,
  danach Direct-APK und Laptop-Kopie aktualisieren; stabile App-ID behalten.

## Abgeschlossene technische Voraussetzungen

- M01-04: Kartenabhängige EncounterRegistry, im alten Wurzelheim unverändert.
- M01-05: Sichere bidirektionale Kartenübergänge, Save-Migration und Rückwege.

## Jetzt spielbar im Quellcode

- Kapitel 1 und 2: Oma, Miora, Fluestern im Wald, Ruine und bestehende Nebenspiele.
- Kapitel 3 (seit 0.18.x): Nordufer, Nebelhafen mit Zeugen, Pumpwerk, Kontrollraum,
  Pumpenwaechter, zweite Vateraufnahme, gewichtete Wassergeist-Begegnungen.
- Kapitel 4 (0.19.0): Tunnel direkt aus Kapitel-3-Kontrollraum,
  unterirdischer Bahnhof Wurzelheim, Weichenhof, Bahnhof Moorglas, Moorglas-Senke.
  Edda und A-C-B-Weichenraetsel. Erste **echte** Echo-Bahn mit Zielmenue,
  D-Pad+A/B und Touch, kostenlos Wurzelheim <-> Moorglas, sicherer Rueckweg.
  Kontinuum-Kurier und Schattenwurzel als echte Trainerkaempfe, einmalige
  Belohnung nach Rueckfahrt; Heiler und Lore-Dialoge.
- Moorglas-Wildtabelle: IDs 29,40,67,79,84,101,106 mit 100% Gewichtssumme und
  moderater Gegner-Skalierung ab Level 7.
- Alte 150 IDs, Miora-Entwicklung 1/2/3 auf Level 8/15, originale
  Wurzelheim-Koordinaten, drei alte Arenaorden, saveSchemaVersion 2 und
  permanente Android-Paket-ID bleiben unveraendert.

## Teststand

- src/maps/chapter4.js und tests/chapter4.cjs: 5 Karten,
  bidirektionale Portale, Schalter A-C-B, Eisenbahn-Rueckfahrt,
  Boss-Flags, Save-Migration, einmalige Loot-Belohnung, erreichbare Interaktionen.
- Alle 20 Node-Testdateien erfolgreich.
- Echte Chrome-Renderings chapter4_0.png bis chapter4_4.png,
  chapter4_rail_menu.png, chapter4_boss.png in docs/visual-audit.
- Browser-Steuerung: echter Kapitel-3->4-Durchgang, Zugzielwahl via
  Controller und Touch, Boss-Dialog -> Kampf; keine JS-Ausnahmen.
- Android Build-Assets lokal erstellt und JavaScript-Syntaxpruefung erfolgt.
- **Keine reale Handy-/TV-Hardwarepruefung**, keine vollstaendige
  Balance-/Story-Durchspielung. Diese Grenzen nicht verschweigen.

## Genau naechste Aufgaben

1. GitHub Android Workflow fuer 0.19.0 bestaetigen, Direct APK pruefen,
   stabile Signatur und Paket-ID de.echochroniken.game.stable; auf
   Desktop Laura downloaden, vorheriges APK ersetzen, SHA256 protokollieren.
2. Echte Gameplay-Durchspielung Kapitel 3->4 auf Android und TV;
   Quest-Unterbrechung, Umdrehen, Speichern, Bossverluste, Controller-Touch.
3. Kapitel 4 ausbauen: Zuganimation, deutlicher Bahnhof-Look, Kael,
   neue Musik/Sound-Effekte, wichtige Dialoge im Journal lesbar.
4. Kapitel 5 (Stillwasser) als neue begehbare Region mit eigenem
   Questloop und sicherer Bahnweiterfuehrung starten.
5. Uebrige sechs Bahnverbindungen und Kapitel 6-14 + Postgame umsetzen.
6. 50 generische Monster noch benennen, 15 Ruecken-Bildvarianten auditieren.

**Nicht behaupten:** Kapitel 5-14, das vollstaendige acht Stationen
umfassende Eisenbahnnetz, 150/150 erreichbar, komplettes fertiges Spiel.

## Arbeitsregeln

Vor jeder Aufgabe 00_INDEX.md, STORY_BIBLE.md, PRODUCTION_TASKS.csv,
WORLD_GRAPH.json, CHAPTERS/CH04.md, CHAPTERS/CH05.md, src/maps/registry.js,
src/maps/chapter3.js, src/maps/chapter4.js und aktuellen Git-HEAD lesen.
Nach Code: Node-Tests, Chrome-Screenshots, Android-Build, Changelog,
PRODUCTION_TASKS und diese Fortsetzungsdatei synchron aktualisieren.
Keine neue Debug-Signierung, keine zweite App-ID, alte Spielstaende erhalten.
