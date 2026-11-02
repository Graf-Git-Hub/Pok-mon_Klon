# CONTINUE HERE - Echo-Chroniken Spielentwicklung

## VERIFIZIERT 02.11.2026 - Android-Wiederholungsbuild nach PR #2
- PR #2 wurde als Commit 82663252c0ddd105e27dc703556fe1871983e4e8 in main integriert; der alte Android-Workflow startete auch bei einem reinen Test-Merge.
- Android-Run 41475017489 SUCCESS, aber unerwuenschte Wiederveroeffentlichung mit unveraendertem versionCode 27 / versionName 0.26.0.
- Neu gebautes APK-Asset: 2.505.606 Bytes, SHA256 92f1e61004385d5706458c46b37621e943be5b67fe25797945b2725578c40808.
- GitHub-Runner: apksigner v2 gueltig, Zertifikat-SHA256 84be81f8472b62b59527e4fcf67b19fa7d2e3ef4c0b05069c60139a45ec8ec87; Paket de.echochroniken.game.stable.
- Direktdownload und SHA256 auf Laura verifiziert, Desktop-APK auf den neuen Release-Hash aktualisiert; vorherige Datei im TEMP gesichert.
- Neue Release-Gate-Absicherung verhindert zukuenftige Neuveroeffentlichung ohne Erhoehung des Android versionCode. Echter Handy-/TV-Hardwaretest weiter offen.

## QA 02.11.2026 - Android-Release-Schutz fuer Test-Merges (PR-Kandidat)
- Android-Workflow wird bei Pushes mit project/tests-Dateien ebenfalls gestartet; ohne Gate wuerde auch ein reiner Test-Merge die bestehende v0.26.0-APK neu publizieren.
- Neuer Gate-Schritt vergleicht versionCode zwischen github.event.before und aktuellem Commit; signieren/veroeffentlichen nur bei echtem Versionsanstieg.
- Pull Requests bauen weiterhin nur die Debug-APK; Tests/Dokumentpruefungen bleiben aktiv. Workflow-Dispatch publiziert nicht blind.
- Release v0.26.0 / versionCode 27 und App-ID/Signer unveraendert. Lokaler Git-Bash-Gate-Test bestanden: 27->27 ergibt release=false; simuliertes 27->28 ergibt release=true. CI fuer den neuen PR noch ausstehend.

## QA 02.11.2026 - PR #2: Spawn-/Portal-Regression, Integration
- Neuer Regressionstest project/tests/map-spawn-reachability.cjs aus PR #2.
- Urspruenglich im isolierten Zweig auf 28867fd: 60 Karten, 123 sichere Spawns, 310 Wege zu Ausgaengen und 117 Portal-Rueckreisen.
- PR #2 wird auf aktuellen main-Stand f13ae6c2 integriert; Archiv v0.26.0 bleibt unveraendert.
- Integrations-QA auf aktuellem main-Stand: 28/28 Node-Tests, Android-Plattformtest, Story-Dokumentvalidator und git diff --check bestanden.
- Echte Chrome-156-Screenshots (Desktop und 412px Touch) visuell geprueft; Archiv-Tausch, Autosave/Reload und Alt-Save-Migration ohne JavaScript-Fehler.
- GitHub-CI fuer den aktualisierten PR-Zweig nach Push gesondert pruefen.
- Kein neues Android-Release fuer reine Test-/Dokumentationsaenderungen; APK v0.26.0 / versionCode 27 bleibt aktuell.
- Originaler Hauptarbeitsbaum auf Laura und geschuetzte Assets bleiben unangetastet.

## VERIFIZIERT 02.11.2026 - Echo-Archiv v0.26.0 signiert veroeffentlicht
- Merge in main: 063d8d28ad99e01b2d9705352f963739e6c9d68f (PR #3).
  Github Actions auf diesem Commit: Tests 41472119169 SUCCESS,
  Dokumentation 41472119062 SUCCESS, Android 41472119030 SUCCESS.
- Direkt installierbare APK v0.26.0 / versionCode 27, 2.505.606 Bytes,
  SHA256 dfa29f84abb9efcc61040cfbbf94facd8dca8c06d7cb594362784d349fb6c875.
  Android-Paket de.echochroniken.game.stable unveraendert.
  Release: https://github.com/Graf-Git-Hub/Pok-mon_Klon/releases/download/android-latest/Echo-Chroniken-Universal.apk
- GitHub CI hat apksigner verify und aapt dump badging bestanden.
  Signer-1-Zertifikat-SHA256 identisch zu v0.25.0:
  84be81f8472b62b59527e4fcf67b19fa7d2e3ef4c0b05069c60139a45ec8ec87.
- Neue APK direkt auf Laptop Laura heruntergeladen, Groesse/Hash mit GitHub
  Release-Digest verglichen und Desktop-Datei sicher ersetzt;
  Backup von v0.25.0 im lokalen TEMP-Ordner. Kein Android-Handy/TV installiert.
- Gameplay-QA: 27/27 Node-Tests, Android-Plattformtest,
  Story-Dokumentvalidator, Chrome-156-Desktop-/Touch-Screenshots und
  Archiv-Save-Migration bestanden. Kein vollstaendiger manueller Spieldurchlauf.
- Ausgangs-Worktree auf Laura enthaelt weiterhin fremde uncommittete Dateien
  und geschuetzte Nutzerbilder. Er wurde bei Integration nicht veraendert.
- Als naechstes: PR #2 mit Routen-/Softlock-Regression konfliktfrei
  einarbeiten, danach optische Qualitaet, Hardwaretest und Spielbalance.

## Historischer QA-Stand vor der v0.26.0-Veroeffentlichung (02.11.2026)
- Releasekandidat Android 0.26.0 / versionCode 27; stabile App-ID
  de.echochroniken.game.stable und Signaturschluessel unveraendert.
  PR #3: https://github.com/Graf-Git-Hub/Pok-mon_Klon/pull/3.
  Der erste CI-Test fuer Commit 45c0a5a war 3/3 SUCCESS;
  Versionsanhebung wird gesondert erneut geprueft.
- Review-Fund behoben: Kampf-Labor verwendet eine tiefe Archivkopie.
  Labor-Tausch, HP-/Attackenaenderungen und Laborende veraendern die echte
  Sammlung nicht; Regression mit anschliessendem Save/Reload bestanden.
- Ausgangs-HEAD 28867fde70eca1c88d1ff03cd3d008d67bcc6f57. Vorhandene
  uncommittete Archiv-Reparatur geprueft und weiterverwendet, nicht ersetzt.
- Fang bei vollem Sechserteam speichert individuelle Wesen im additiven
  archive-Feld; Tausch per Controller und Canvas-Touch, Autosave/Reload.
  SaveSchema 2, Arten-IDs, Miora-Entwicklung und Android-App-ID unveraendert.
- Weitere reproduzierte Fehler korrigiert: unterster Touch-Pixel der fuenften
  Archivzeile; Familien-/Finaldialoge erkennen die Mutterform auch im Archiv.
  Story verschiebt oder dupliziert dabei keine Wesen.
- Lokal 27/27 project/tests/*.cjs erfolgreich (aus project ausfuehren),
  dazu android/tests/check-platform.cjs (aus android), VALIDATE_DOCS.py,
  Syntaxpruefungen und git diff --check. Neue Verhaltenspruefungen:
  144 volle-Team-Faenge durch echten Spielcode mit Autosave und Reload,
  Controller-Wrap und Touch-Tausch; 3000 individuelle Wesen, 10000 Tausche,
  100 JSON-Roundtrips ohne Verlust/Duplikation. Acht alte Save-Fixtures
  und beschaedigte Datei weiterhin geprueft.
- Beide Test-/Android-Workflows fuehren jetzt alle tests/*.cjs aus, damit
  Archiv und kuenftige Tests automatisch enthalten sind. Android prueft
  zudem die Syntax des gebuendelten archive.js. Noch kein neuer CI-Lauf.
- Bestehende Kapitel-/Postgame-Tests bestaetigen ihre Quest-, Bossflag-,
  Rueckweg- und BFS-Pruefungen sowie 150 Arten und 94 Nichtstarter-Grundarten.
  Dies ist KEIN vollstaendiger manueller Durchlauf und kein Beweis fuer
  Softlockfreiheit in allen Spielzustandskombinationen.
- GitHub live geprueft: Tests 41402240370 und Docs 41402240465 SUCCESS
  auf Ausgangs-HEAD; Android 41402037515 SUCCESS auf 938b7e03.
  Bestehendes Release-Asset: 2504107 Bytes, SHA256 laut GitHub
  c927d79203280060556d07278d3d7314e84b798f0b3aeb81e42a7cc0cd26fd25.
  Keine neue APK erstellt oder veroeffentlicht; Signatur nicht neu geprueft.
- Nachtraegliche Browserabnahme am 02.11.2026 in isoliertem Git-Worktree:
  ECHTER Chrome 156 mit 1280x800 Desktop und 412x915 Touch-Viewport,
  Teamtausch via Tastatur und Canvas-Touch, Seitenumbruch, Autosave/Reload,
  Migration eines alten Saves ohne Archiv; keine JavaScript-Ausnahmen.
  Sieben Screenshots und report.json unter docs/visual-audit/archive-qa/.
  Wiederholbarer Playwright-Test: project/qa/archive-browser.py.
- Isolierter Zweig fix/echo-archive-safe-20261102 kopiert ausschliesslich
  Archiv-/Test-/Workflow-/Story-/Doku-Aenderungen aus dem uncommitteten
  Stand. Original-Worktree auf Laura und geschuetzte Nutzerbilder sowie
  Android-Assets/__pycache__/characters-world-*.png blieben unangetastet.
- Vollstaendige lokale Neupruefung in diesem Zweig: 27/27 Node-Tests,
  Android-Plattformtest, VALIDATE_DOCS.py und git diff --check bestanden.
- Naechste Schritte: CI des Archivzweigs pruefen, anschliessend sauber
  integrieren; Signatur und SHA256 vor einer neuen APK kontrollieren.
  Echter Android-Handy-/TV-Hardwaretest und vollstaendiger Storydurchlauf
  bleiben offen.

## NEUER STAND 02.11.2026 - Postgame v0.25.0 (signiert veroeffentlicht)
- Zweiter und letzter erweiterter Durchlauf: Postgame als spielbare Erstfassung.
- 8 Karten in project/src/maps/postgame.js: optional_echo_garden_annex,
  rail_heritage_museum und postgame_meadow_01 bis postgame_meadow_06.
  Einstieg aus epilogue_wurzelheim nach main_story_finished, alle Rueckwege
  reversibel, keine alten IDs, App-ID oder saveSchemaVersion geaendert.
- 6 Wiesen mit sechs 100%-gewichteten Begegnungstabellen: alle 94
  Nichtstarter-Grundarten (stage=1) je genau einmal in einer Wiese.
  Starter ID 1 bleibt ausschliesslich beim Spieler, Entwicklungen unveraendert.
- 6 Erinnerungstafeln, 3 optionale freundschaftliche Garten-Bosskaempfe,
  Bahn-Museum mit Stationsreihenfolge Wurzelheim-Moorglas-Stillwasser,
  Hinweise nach Fehlversuchen, kosmetische Zuglackierung, Erinnerungsfeier
  und Belohnung nur einmal. optional_postgame_completed speicherbar.
- tests/postgame.cjs prueft 60 MapRegistry-Karten, 94 Arten, Puzzle,
  Siege, Questfortschritt, Speicherstand und BFS-Rueckwege.
- Chrome: docs/visual-audit/postgame_00.png bis postgame_07.png,
  postgame_trial_boss.png und postgame_mobile_touch.png; 8 Karten,
  Portal, Boss, Museum und Pixel-7-Touch-Dialog ohne JS-Fehler.
  Garten, Wiesen und Museum erhielten neue Pixelgrafik und Zugausstellung.
- **v0.25.0 / versionCode 26 erfolgreich signiert veroeffentlicht.**
  Actions Run 41402037515 SUCCESS, Quellcommit 938b7e03f1e40f75b4b1a39971f6eadba062b6fa.
  APK 2.504.107 Bytes, SHA256 C927D79203280060556D07278D3D7314E84B798F0B3AEB81E42A7CC0CD26FD25.
  Download und SHA256 lokal auf Laura verifiziert, Desktop-APK aktualisiert.
  Stündlicher Entwicklungswaechter nach zwei erweiterten Durchlaeufen
  wieder auf NORMALPRIORITAET gestellt und aktiviert.
- Offen: echter Handy/TV-Test, kompletter manueller Durchlauf, Audio,
  50 generische Spukwesen-Namen, weitere Grafikpolitur, Endgame-Balancing.
- **Naechster NORMALER stündlicher Auftrag:** erst offene Story/Postgame-
  Fehler beheben, danach Grafik, Dialoge, Balance, Controller, Touch,
  Performance und Langzeittests. Keine weitere Zwei-Durchlaeufe-Anweisung.


## NEUER STAND 02.11.2026 - Kapitel 12-14 (v0.24.0 Kandidat)
- Mehrfach-Arbeitspaket Durchlauf 1 von 2: (A) Story 12-14 spielbarer
  Erstaufbau, (B) Kamera-Grenz-Clamping gegen leere Kartenraender,
  (C) Tests, Browser-Screenshots und Android-Build.
- 12 Karten, 3 Kapitelketten, zwei echte Trainerkaempfe und
  saveSchemaVersion 2. Kapitel 14 setzt main_story_finished und
  laesst freien Rueckweg aus dem Epilog; keine alten Flags/IDs geaendert.
- tests/story-finale.cjs prueft 52 Maps, Tore, Dialoge, Bosse, Save,
  Belohnungen und BFS-Erreichbarkeit. Chrome-Screenshots finale_00-11,
  finale_boss_guard und finale_boss_varek, Portal 11->12 erfolgreich.
- **v0.24.0/versionCode 25 erfolgreich signiert veroeffentlicht.**
  Actions 41395532582 SUCCESS, Quellcommit b6439cd2, 2.497.114 Bytes,
  SHA256 0BB520C562FB1240FDA1936216668B898E996DC710D86F6653130C2D82444164.
  Desktop-APK auf Laura aktualisiert; Touch-Dialog auf Handy-Viewport getestet.
- **Naechster Durchlauf:** Postgame mit Echo-Garten, Bahn-Museum,
  Basisarten-Zugaenglichkeit (94 Nichtstarter), optionale Gebietspruefungen;
  parallel Grafiken, Dialoge, Touch/Controller und Balance optimieren.
- Offen: reale Android-Handy/TV-Abnahme, vollständiger Storydurchlauf,
  Feinschliff der Erstfassungen und 150er-Lexikon-Pruefung.


Stand 02.11.2026, Repo Graf-Git-Hub/Pok-mon_Klon, main.
**Letzte verifizierte signierte Android-APK: v0.25.0 / versionCode 26.**
Quellcommit 938b7e03f1e40f75b4b1a39971f6eadba062b6fa;
Android Actions Run 41402037515 SUCCESS, stabile App-ID de.echochroniken.game.stable.
APK 2.504.107 Bytes; heruntergeladen und auf Laptop-Desktop ersetzt.
SHA256 C927D79203280060556D07278D3D7314E84B798F0B3AEB81E42A7CC0CD26FD25.
Direktlink: https://github.com/Graf-Git-Hub/Pok-mon_Klon/releases/download/android-latest/Echo-Chroniken-Universal.apk
Aktuellen Git-HEAD vor weiteren Aenderungen pruefen.

## Entwicklungsstand 02.11.2026: Kapitel 9, 10 und 11 als spielbarer Erstaufbau (v0.23.0)
- 12 neue begehbare Karten in project/src/maps/story-endgame.js:
  Frostgrat-Pass, Forschungsstation, Eishoehlen, Bahnhof Frostgrat;
  Bahnhof Unterstadt, alte Wohnstadt, Zentralring, Kontinuum-Archiv;
  Sternenpfad, Sternenhalle, Fernrohr-Kuppel, Sternendach.
- Kapitel 9: 3 Expeditionsteile, Phasenlaterne, sichere dauerhaft
  reversible Lichtbruecke, Vex als separater Storykampf (kein Orden),
  Vaters Streitaufnahme, Unterstadt-Signal und einmalige Belohnung.
- Kapitel 10: beide Kontinuum-Positionen, Miras Schmetterlingszeichnung,
  3 unabhaengige Ringanker, gesicherter Notstrom, Ringhueter wahlweise
  durch Beweise friedlich oder im Kampf, 3 Notausgaenge, Zentralring
  abgeschaltet und Observatorium-Koordinaten.
- Kapitel 11: 3 historische Projektionen, WURZEL-WASSER-STERN-Fernrohr,
  erster Varek-Kampf, 3 freiwillig geoeffnete Echo-Kapseln,
  Vaters Nachricht an Oma Martha, Resonanzschacht-Signal.
- Zwei neue kostenlose Bahnverbindungen Kronenstadt-Frostgrat und
  Frostgrat-Unterstadt. 5 neue gewichtete Wildbegegnungstabellen.
- Alte drei Arenaorden, Monster-IDs, saveSchemaVersion 2, Android-App-ID
  und vorhandene Story-Flags unveraendert. Kapitel 9-11 in separaten
  chapter9/10/11-Saveobjekten; Belohnungen atomar nur einmal.
- tests/story-endgame.cjs: 40 registrierte Maps, 12 neue Storykarten,
  3 Questablaeufe, 3 Story-Bosse inkl. friedlichem Weg, Phasenbruecke,
  Save/Reload, 2 Bahnstrecken, alle Interaktionen und Ausgaenge BFS-geprueft.
- Echter Chrome-Test: 12 Map-Screenshots, 3 echte Bosskaempfe,
  Kapitel-8->9-Portal und Touch-Bahnreise ohne JavaScript-Fehler.
  Bilder docs/visual-audit/endgame_00.png bis endgame_11.png sowie
  endgame_boss_vex.png, endgame_boss_ring.png, endgame_boss_varek.png.
- **APK v0.23.0 / versionCode 24 verifiziert und signiert publiziert.**
  GitHub Actions 41390071606 SUCCESS, Quellcommit 05b2361,
  2.487.781 Bytes, SHA256
  6A11CBE4476405E17E97E90E37780765D8A8E98E1A89BBEAE7126B124BB89B77.
  Direktdownload und Desktop Laura aktualisiert.
- **Naechster Auftrag:** Kapitel 12 Elena/Maternalis und Familiengespraeche,
  danach Kapitel 13 Resonanzschacht, Kapitel 14 Finale und Postgame.
  Prioritaet: spielbare Story, stabile Saves, echte Tests und Screenshots.
- **Offen:** echte Handy/TV-Abnahme, vollständiger manueller Storydurchlauf,
  Audio/Portraits/Feinanimation, tiefes Bossbalancing, Kapitel 12-14
  und Postgame. Erstaufbau ist nicht gleich fertig poliertes Spiel.

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
- **Release v0.22.0 verifiziert:** Android CI 41385068540 SUCCESS;
  signierte stabile APK direkt auf GitHub veroeffentlicht, Groesse 2.476.555
  Bytes, SHA256 6DAB7CCB25C1D386B428FC6DFF9F6F40D4977FFE1E00AB159EEEC51BF41656A4;
  Desktop Laura aktualisiert. Echte Android-Handy/TV-Hardware weiterhin offen.

## Historischer Stand v0.21.0 - Kapitel 5 als spielbarer Ausbau
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

## Historische Aufgabenliste aus v0.19.0 (durch neuen Abschnitt oben ueberholt)

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

**Nicht behaupten:** Kapitel 9-14 oder Postgame, das vollstaendige acht Stationen
umfassende Eisenbahnnetz, 150/150 erreichbar oder das komplett fertige Spiel.

## Arbeitsregeln

Vor jeder Aufgabe 00_INDEX.md, STORY_BIBLE.md, PRODUCTION_TASKS.csv,
WORLD_GRAPH.json, CHAPTERS/CH04.md, CHAPTERS/CH05.md, src/maps/registry.js,
src/maps/chapter3.js, src/maps/chapter4.js und aktuellen Git-HEAD lesen.
Nach Code: Node-Tests, Chrome-Screenshots, Android-Build, Changelog,
PRODUCTION_TASKS und diese Fortsetzungsdatei synchron aktualisieren.
Keine neue Debug-Signierung, keine zweite App-ID, alte Spielstaende erhalten.
