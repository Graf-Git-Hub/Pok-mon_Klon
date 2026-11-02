# CONTINUE HERE - Echo-Chroniken Spielentwicklung

Stand 02.11.2026, Repo Graf-Git-Hub/Pok-mon_Klon, main.
**Letzte verifizierte signierte Android-APK: v0.21.0 / versionCode 22.**
Quellcommit 72967b541cbed280dcbd3af52e8659fc0b46d760;
Android Actions Run 41379112904 erfolgreich, stabile App-ID de.echochroniken.game.stable.
APK 2.464.065 Bytes; heruntergeladen und auf Laptop-Desktop ersetzt.
SHA256 611C0B7D24D733FEC5665C78B40EB10EE3BC4F134101F0D2AAFECC88C865AF05.
Direktlink: https://github.com/Graf-Git-Hub/Pok-mon_Klon/releases/download/android-latest/Echo-Chroniken-Universal.apk
Aktuellen Git-HEAD vor weiteren Aenderungen pruefen.

## Entwicklungsstand 02.11.2026: Kapitel 6, 7 und 8 spielbarer Erstaufbau
- **Quellcode v0.22.0 / versionCode 23:** 13 neue begehbare Karten in
  src/maps/story-regions.js. Kap. 6: Ascheweg, Aschenruh, Schmiede, Glutschacht.
  Kap. 7: Lichterpfad, Lichterhain, Namensarchiv, Echo-Garten.
  Kap. 8: Stadttor, Kronenstadt, Zentralarchiv, Bahnhof, Forschungshof.
- Kapitel 6: Eddas Lieferbuecher, drei Arbeiter, Hitze-Regler 1/3, Druckablass,
  Regler 2, Kapselgehaeuse, Eddas Gestandnis, Schmelzmeister, Ofenkern,
  Resonanzwerkzeug, einmalige Belohnung.
- Kapitel 7: Nalias drei Rituale, drei Namensgeschichten, Kontinuum-Jaeger,
  vier Namenssteine, Namensschatten, Vaterkarte, Echo-Spuren. Seltene
  Waldhirsch-Grundform gezielt in leuchtenden Grasfeldern suchbar.
- Kapitel 8: drei Akten, Archivindex 14/30/21, Varek-Dialog, Archivarin,
  fehlende Tonspur, Archivwaechter, zwei Marktstimmen, Frostgrat-Pass,
  Bahnverbindung Stillwasser-Kronenstadt (hin und zurueck).
- Story-Fortschritt in chapter6, chapter7, chapter8 mit SaveSchema v2 und
  stabiler App-ID, alte Kapitel und Monster-IDs unveraendert.
- tests/story-regions.cjs: 13 Karten, 5 Boss-Flags, 3 Raetsel, Portal- und
  Bahn-Rueckwege, Save/Reload, Loot-einmalig, BFS fuer alle Storyobjekte.
- Echter Chrome-Test: 13 Kartenscreenshots, 3 echte Bosskaempfe,
  Uebergang 5->6 und Touch-Zugfahrt, keine JS-Fehler.
  Dateien: docs/visual-audit/story678_00.png bis story678_12.png,
  story678_boss_0.png bis _2.png und story678_rail.png.
- **Freigabe-Status:** Diese Version ist ein spielbarer Erstaufbau, keine
  abschliessend polierte Inszenierung. Echter Android-Handy/TV-Test, komplette
  Langzeit-Durchspielung, Sound, Portraits, Kapitel 9-14 und Postgame fehlen.
- **Naechster Schritt:** Kapitel 9 Frostgrat mit Phasenlaterne und
  reversiblen Bruecken umsetzen, dann Kapitel 10 Unterstadt und Kapitel 11
  Observatorium. Davor aktuelle GitHub Actions, APK und Screenshots pruefen.
- **Release v0.22.0:** erst nach signiertem GitHub-Actions-SUCCESS,
  Pruefsumme und APK-Download als verifiziert bezeichnen.

## Stand 02.11.2026 - Kapitel 5 als spielbarer Ausbau
- Android 0.21.0 / versionCode 22 erfolgreich signiert und veroeffentlicht:
  CI 41379112904 SUCCESS, commit 72967b5, Desktop-APK aktualisiert.
- src/maps/chapter5.js: Moorglas-Nebelpfad, Dorf Stillwasser, Archiv,
  Resonanzturm, Bahnhof Stillwasser, 5 Storykarten mit sicheren Rueckwegen.
- Dorf: drei Bewohner je zweimal befragen, 3 Widersprueche; Archiv:
  3 Hinweise, Lyra-Gespraech, Bibliotheksgang; Turm: Stromkabel, Spiegel-Boss,
  optionale Lyra-Pruefung, Sender abschalten, einmalige Belohnung.
- EchoRail verbindet nach Abschluss Kapitel 5 Moorglas und Stillwasser in beiden
  Richtungen; bestehende Wurzelheim-Moorglas-Rueckfahrt erhalten.
- tests/chapter5.cjs bestaetigt 15 Maps im Netz, alle Interaktionspunkte,
  Portal-Sperren, Stories, optionale Kaempfe, Save/Reload und Bahn.
- Echt Chrome: docs/visual-audit/chapter5_0.png bis chapter5_4.png und
  chapter5_boss.png; 5 Maps, Uebergang, NPC-Dialog und Boss ohne JS-Fehler.
- ECHTE Hardware auf Handy/TV nicht getestet. Kapitel 6-14 bleiben offen.
- **Naechster Auftrag:** Kapitel 6 Aschenruh und Glutklamm (CH06.md)
  mit neuen Karten, Schmiede und Arbeiter-Rettung umsetzen, dann Kapitel 7 und 8.
  Nutzerwunsch: Entwicklung stündlich automatisch, Ziel >=3 Kapitel je
  Durchlauf, aber nur abgeschlossene getestete Kapitel als fertig melden.

## Release bestaetigt: Android 0.20.0 / versionCode 21
- Commit 2adaa9ea10c8c541a1b2ca8aab66780dbc6f5115, GitHub Actions Run 41377128195: SUCCESS.
- Gleichbleibende App-ID de.echochroniken.game.stable und Signaturschluessel.
- APK 2456984 Bytes, SHA256 65EC72DF69FAAA0A9AD6CB87B0E414D95523E094AC32D58AD68CC3A9538E4D95.
- APK auf Desktop Laura unter Echo-Chroniken-Universal.apk ersetzt.
- Link: https://github.com/Graf-Git-Hub/Pok-mon_Klon/releases/download/android-latest/Echo-Chroniken-Universal.apk
- Realer Test auf Android-Handy/TV steht aus. Browser- und Node-Tests erfolgreich.

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
- Signierter Android 0.20.0 Release auf GitHub erfolgreich, direkte APK
  lokal aktualisiert. Echtes Handy und TV bleiben fuer Hardware-QA offen.

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
