# Story-Roadmap Änderungsverlauf

## 2026-11-02 - v0.26.0: Echo-Archiv und Regressionen
- v0.26.0 / versionCode 27 signiert veroeffentlicht. GitHub Merge
  063d8d28ad99e01b2d9705352f963739e6c9d68f, Android Run 41472119030
  SUCCESS, Tests 41472119169 SUCCESS, Docs 41472119062 SUCCESS.
  Gleichbleibende Paket-ID de.echochroniken.game.stable; Zertifikat-SHA256
  84be81f8472b62b59527e4fcf67b19fa7d2e3ef4c0b05069c60139a45ec8ec87
  identisch zu 0.25.0 laut apksigner-Logs beider erfolgreichen CI-Runs.
  APK: 2.505.606 Bytes, SHA256
  dfa29f84abb9efcc61040cfbbf94facd8dca8c06d7cb594362784d349fb6c875.
  Direktdownload auf Laura mit Hashvergleich bestaetigt, Desktop-APK ersetzt.
- Review-Fund behoben: Kampf-Labor verwendet eine tiefe Archivkopie.
  Labor-Tausch, HP-/Attackenaenderungen und Laborende veraendern die echte
  Sammlung nicht; Regression mit anschliessendem Save/Reload bestanden.
- Vorhandene Archiv-Reparatur uebernommen: zusaetzliche Faenge werden als
  individuelle Wesen gespeichert und koennen mit dem Sechserteam tauschen.
- Touch-Hitbox der letzten sichtbaren Archivzeile korrigiert.
- Familien-/Finaldialoge erkennen archivierte Miora, Seelara und Maternalis;
  keine automatische Teamverschiebung, kein Verlust der Begleiterin.
- Reale Spielcode-Tests fuer 144 Fang-Autosaves, Reload, Controller und Touch;
  Archiv-Stresstest mit 3000 Wesen, 10000 Tauschen und 100 JSON-Roundtrips.
- Beide GitHub-Workflows testen alle CJS-Tests statt unvollstaendiger Listen.
- Im isolierten Integrations-Worktree erneut 27/27 Spieltests,
  Android-Plattformtest und Dokumentvalidator bestanden.
- Chrome-156-Integration mit Desktop-Keyboard und echtem Touch-Viewport,
  144 archivierten Wesen, Seitenwechsel, Autosave/Reload sowie Migration
  ohne Archiv erfolgreich, ohne Browser-JavaScript-Fehler.
  Sieben visuell gepruefte Screenshots plus report.json unter
  docs/visual-audit/archive-qa/, reproduzierbar mit
  project/qa/archive-browser.py (Python Playwright).
- Originaler uncommitteter Nutzerstand und Bilder auf Laura geschuetzt;
  Integration ueber isolierten Zweig fix/echo-archive-safe-20261102,
  PR #3 erfolgreich in main gemergt. Neuer Release erst nach drei gruenen
  Checks, erfolgreichem apksigner/AAPT und SHA256-Abgleich veroeffentlicht.

## 2026-11-02 - v0.25.0: Postgame „Die freien Linien“
- Acht neue Karten: Echo-Garten, sechs Fangwiesen, begehbares Bahn-Museum.
- Nach Kapitel 14 aus dem Epilog erreichbar, jederzeit sicherer Rueckweg.
- Sechs 100%-gewichtete Wildbegegnungstabellen: alle 94 Nichtstarter-
  Grundarten sind nach der Hauptgeschichte erneut auffindbar.
- Sechs Erinnerungsplatten, drei freiwillige Trainerkaempfe, Museumsraetsel
  Wurzelheim-Moorglas-Stillwasser, Hinweise nach Fehlern, kosmetische
  Zuglackierung, wiederholbare Erinnerungsfeier, einmaliger Abschlussloot.
- SaveSchema 2, bestehende Monster-IDs, App-ID und Signatur unveraendert.
- Verbesserte Garten-/Wiesen-Tiles und historischer Museumszug.
- tests/postgame.cjs: 60 Karten, 94 Arten, Puzzle, Bossflags, Rueckwege,
  150er-Katalog und sichere Speicherung. Chrome: acht Maps, Portal,
  echter Bosskampf, Museum und Pixel-7-Touch-Dialog ohne JS-Fehler;
  zehn neue Screenshots.
- Android 0.25.0 / versionCode 26 signiert und veroeffentlicht.
  Actions Run 41402037515 SUCCESS, Commit 938b7e03f1e40f75b4b1a39971f6eadba062b6fa,
  APK 2.504.107 Bytes, SHA256
  C927D79203280060556D07278D3D7314E84B798F0B3AEB81E42A7CC0CD26FD25.
  APK auf Lauras Desktop nach Download und Hashvergleich aktualisiert.
  Automatischer Entwicklungswaechter wieder auf normale stündliche
  Prioritaet gesetzt (Story/Postgame-Fehler, danach Grafik und Langzeittests).
- Offen: reale Android-Handy/TV-Abnahme, kompletter manueller Durchlauf,
  Audio, 50 generische Wesen-Namen, Grafik- und Balancing-Feinschliff.


## 2026-11-02 - v0.24.0: Kapitel 12-14 als spielbare Erstfassung
- 12 neue begehbare Karten in src/maps/story-finale.js: Marthas Erinnerung,
  Familienzimmer und Garten; fuenf Resonanzschacht-Ebenen; Kernzugang,
  drei Erinnerungen, Resonanzkern und freies Epilog-Wurzelheim.
- Kapitel 12: Marthas Erinnerung an Elena, 3 Bilder, freiwilliger Begleiter
  mit korrekten Miora/Seelara/Maternalis-Dialogen, freier Kapselverschluss,
  Schachtschluessel und optionale Spieluhr/Abendszene.
- Kapitel 13: drei getrennte Zwangsanker, optionaler Phasenlaternenpfad,
  Schachtwache als echter Kampf, freie Fluchtschleuse, Vaterbegegnung,
  Schutzcode und sichere finale Vorbereitung.
- Kapitel 14: Bindungsmaschine ohne Reflexzwang, 3 Erinnerungen, echter
  Varek-Finalkampf, 3 freiwillige Freigaben, Abschied des Vaters,
  main_story_finished, Epilog, Abspann und offene Rueckreise.
- Kein alter Monster-/Orden-/Signatur-/Paket-ID-Wert geaendert. Separate
  chapter12/13/14-Saves und genau einmalige Belohnungen; SaveSchema 2.
- Qualitaetspaket: Kamera an Weltgrenzen geklemmt; keine grossen leeren
  gruengrauen Randflaechen in Storykarten, Spielerposition korrekt.
- tests/story-finale.cjs: 52 Karten im MapRegistry, 12 neue Karten,
  alle Portal-/Interaktionspositionen BFS-erreichbar, 3 Storyketten,
  2 Boss-Siegflags, 3 Begleiterformen, Save/Reload und einmaliger Loot.
- Echter Chrome-Test: 12 Karten-Screenshots, Portal 11->12, zwei
  echte Bosskaempfe und keine JavaScript-Ausnahmen. Screenshots
  docs/visual-audit/finale_00.png bis finale_11.png und finale_boss_*.png.
- Android 0.24.0 / versionCode 25 signiert veroeffentlicht.
  GitHub Actions 41395532582 SUCCESS, Commit b6439cd2a5103e5c1af434e3cc2728acc385bcdb,
  APK 2.497.114 Bytes, SHA256 0BB520C562FB1240FDA1936216668B898E996DC710D86F6653130C2D82444164.
  APK auf Lauras Desktop aktualisiert; echter Touch-Dialogtest im Handy-Viewport bestanden.
- Noch offen: Postgame, 150 Basisarten systematisch erreichbar machen,
  echte Android-Handy/TV-Hardwaretests, komplette Langzeit-Durchspielung,
  Story-/Dialog-Politur, Musik und Animationen. Erstfassung ist kein
  fertig poliertes Vollspiel.


## 2026-11-02 - v0.23.0: Kapitel 9-11 spielbarer Erstaufbau
- 12 begehbare neue Karten mit 24 bidirektionalen lokalen Portalen
  und sicheren Spawns; alte Kapitel bleiben unveraendert.
- Frostgrat: 3 Expeditionsteile, Phasenlaterne, sichere Lichtbruecke,
  Vex als Storyboss, Vaterlogbuch, Signal und freier Bahnhof.
- Unterstadt: zwei Gruppen, Miras Zeichnung, 3 Ringanker, Notstrom,
  Ringhueter friedlich per Beweis oder Kampf, Evakuierung, Zentralring AUS.
- Sternenobservatorium: 3 Projektionen, WURZEL-WASSER-STERN-Raetsel,
  Varek-Kampf, 3 freiwillig geoeffnete Echo-Kapseln, Vaterbrief, Sender.
- 5 neue Begegnungstabellen mit existierenden Basisarten und 100% Gewicht,
  2 weitere Echo-Bahn-Verbindungen mit kostenloser Rueckfahrt.
- Bahnmenue jetzt dynamisch fuer 5 sichtbare Ziele ohne abgeschnittene
  Eintraege; Touch-Hitboxen folgen exakt derselben Zeilenhoehe.
- Browserbilder auch fuer Phasenbruecke vor/nach Aktivierung und Bahnmenue.
- SaveSchema v2 bleibt kompatibel; 3 neue Kapitelobjekte mit einmaligem
  Loot, keine Aenderung an alten Orden, IDs oder App-Paketkennung.
- Node-Tests inkl. tests/story-endgame.cjs; 12 Chrome-Screenshots,
  3 echte Bosskaempfe, Kapitelportal und Touch-Bahnfahrt erfolgreich.
- Android 0.23.0 / versionCode 24 signiert und veroeffentlicht.
  Commit 05b23618de5f66697b0221656ee05260a07ae02b,
  GitHub Actions Run 41390071606 SUCCESS, APK 2.487.781 Bytes,
  SHA256 6A11CBE4476405E17E97E90E37780765D8A8E98E1A89BBEAE7126B124BB89B77.
  Direktdownload und Desktop Laura aktualisiert.
- Offen: reale Android-Hardware, Storydurchspielung, Sound/Portraits,
  Langzeit-Balance und Kapitel 12-14/Postgame.

## 2026-11-02 - v0.22.0: Kapitel 6, 7 und 8 als spielbarer Erstaufbau
- 13 neue begehbare Storykarten in src/maps/story-regions.js mit
  bidirektionalen, gated Portalen und sicheren Spawns.
- Kapitel 6: Eddas Werkstatt, drei Seriennummern, drei Arbeiter, vierteilige
  Ofen-Sicherheitssequenz, zwei echte Bosskaempfe, Resonanzwerkzeug und
  einmalige Belohnung.
- Kapitel 7: Nalias drei Rituale, drei Namensgeschichten, Jaeger, vier
  Namenssteine, Namensschatten, Vaterkarte, Echo-Spuren und gezielter
  Waldhirsch-Fund in leuchtenden Grasfeldern.
- Kapitel 8: Zentralarchiv, drei Akten, Archivindex 14/30/21, Varek,
  Archivarin, vollstaendige Vater-Tonspur, Archivwaechter, Marktgespraeche,
  Frostgrat-Pass und Bahnhof Kronenstadt.
- Dritte kostenlose Bahnverbindung Stillwasser-Kronenstadt mit vollstaendiger
  Rueckfahrt ueber alle freigeschalteten Bahnhoefe.
- 6 neue gewichtete Begegnungstabellen; alte Monster-IDs, alte drei Orden,
  saveSchemaVersion 2 und Android-App-ID unveraendert.
- tests/story-regions.cjs: 28 MapRegistry-Maps, 13 neue Storykarten,
  5 Boss-Flags, 3 Raetsel, Save/Reload, einmalige Loot-Belohnungen,
  alle Ausgaenge und Interaktionspunkte erreichbar.
- Echter Chrome-Test: 13 Karten, 3 echte Story-Bosskaempfe,
  Controller-Portal und Touch-Bahnreise, keine JS-Fehler.
- Android v0.22.0 / versionCode 23 erfolgreich signiert und veroeffentlicht.
  Commit 88f12891689f85288ed9102a8ddb709bf0a38acb,
  GitHub Actions 41385068540 SUCCESS, 2.476.555 Bytes,
  SHA256 6DAB7CCB25C1D386B428FC6DFF9F6F40D4977FFE1E00AB159EEEC51BF41656A4.
  Desktop Laura aktualisiert.
- Weiter offen: reale Handy/TV-Abnahme, komplette Story-Durchspielung,
  Animation/Audio/Portraits, grafischer Feinschliff, Kapitel 9-14 und Postgame.


## 2026-11-02 - v0.21.0: Kapitel 5 „Das Dorf, das niemand verlaesst“
- Fuenf neue vollstaendig begehbare Karten: moor_to_stillwater, stillwasser_town,
  stillwater_archive, stillwater_tower und station_stillwasser.
- Sicherer, storygesperrter Uebergang aus Moorglas und Rueckwege ueber MapRegistry.
- Drei wiederholbare Dorfbewohner-Dialoge und drei einzigartige Archivbeweise.
- Lyra-Abhaengigkeiten, hint-basierter Bibliotheks-Umweg, Antennenkabel, Erinnerungs-
  spiegel als echter Kampf und optionale Lyra-Pruefung, ohne zweite Orden-Flags umzuschreiben.
- Nach Senderabschaltung einmaliger Loot, eigener gespeicherter Storyzustand
  und freigeschaltete zweite, kostenlose Echo-Bahn-Strecke Moorglas-Stillwasser.
- Fuenf echte Chrome-Screenshots, Boss-Screenshot, echte Controllersteuerung
  und eigener Kapitel-5-Test fuer Kollision, Aufloesung, Save/Reload und Rail.
- Android Version 0.21.0 / versionCode 22 verifiziert und signiert publiziert.
  Commit 72967b541cbed280dcbd3af52e8659fc0b46d760,
  CI Run 41379112904 SUCCESS, APK 2.464.065 Bytes,
  SHA256 611C0B7D24D733FEC5665C78B40EB10EE3BC4F134101F0D2AAFECC88C865AF05.
  APK auf Lauras Desktop aktualisiert.
- Offen: reale Handy/TV-Abnahme, Kapitel 6-14 und Postgame, Audio, weitere
  story-spezifische Animationen und Spielbalance.


## 2026-11-02 - v0.20.0: Menschenfiguren komplett neu gezeichnet
- Neue lokale Sprite-Engine src/characters.js: 16 unterschiedliche Figurenrollen,
  alle mit 4 Richtungen und 3 Phasen, insgesamt 192 mögliche Sprite-Frames.
- Kleidung, Frisuren, Gesicht, Oma-Dutt, Mädchen-Zopf, Bahnmuetzen und
  Figurenfarben sind eigenstaendig im Raster 16x20px entworfen und gecacht.
- Player, Oma, alle Dorfbewohner, Kapitel-3-Zeugen, Edda, Kurier,
  Stationshueterin, Innenraeume und alte Arenaleiter in Engine integriert.
- Weitere Rollen ueber eindeutige ID-Aliase zugeordnet, alte Farbgebung
  fuer sonstige NPCs weiterhin als abweichende Kleidung moeglich.
- Neuer Test tests/characters.cjs fuer 16 Figuren x 12 Posen, Animation,
  Caching und transparente Pixel-Sprites; Regression der Spieltests bestanden.
- Echte Chrome-Bilder der Sprite-Uebersicht, Omas Haus, Wurzelheim,
  Moorglas und Bahnhoefe in docs/visual-audit gespeichert.
- Android 0.20.0 / versionCode 21 verifiziert und signiert veroeffentlicht:
  Quellcommit 2adaa9ea, CI Run 41377128195 SUCCESS, 2456984 Bytes,
  SHA256 65EC72DF69FAAA0A9AD6CB87B0E414D95523E094AC32D58AD68CC3A9538E4D95.
  Datei auf Desktop Laura aktualisiert; reale Handy/TV-Tests stehen noch aus.


## 2026-11-01 - v0.19.0: Unter den Wurzeln / Echo-Bahn
- Fuenf neue begehbare Karten: root_tunnel, station_wurzelheim, rail_switchyard,
  station_moorglas, moorglas_bog. Kontrolle aus Kapitel 3 bleibt bestehen.
- Sicherer bidirektionaler Tunnel-Portalanschluss aus pumpworks_controlroom.
- Zwei Bahnhofsziele mit echter Verbindung, D-Pad/A/B-/Touch-Zielwahl,
  kostenloser Fahrt und Rueckfahrt ohne Abhaengigkeit von ungebauten Karten.
- Eddas Weichen A-C-B, Kontinuum-Kurier, Schattenwurzel, Moorbrunnen,
  Save-Flags und einmalige Abschluss-Belohnung nach Rueckreise.
- Gewichtet validierte Wildtabelle mit sieben neuen Moor-Grundformen,
  konservative Levelkurve und Schonregeln; historische Startregion unveraendert.
- Eigener Industrie-/Stationsboden, nebeliger Moorkachel-Look,
  sieben echte Chrome-Screenshots in docs/visual-audit.
- Node-Tests aller 20 Dateien bestanden; chapter4.cjs testet u.a. alle Rueckwege,
  Schalter, Bosse, Reise und Save-Roundtrip; Browsersteuerung und Boss getestet.
- Android 0.19.0 / versionCode 20 **erfolgreich signiert und veroeffentlicht**:
  Commit 6019e1e0cf315a5840584f7efa07afaca73f5c60;
  GitHub Run 41328383208 erfolgreich, APK 2.454.774 Bytes;
  SHA256 A1F4FA96CD74E3F682BBE42B978462BEE2340F1EBBD5FB3A1C918B5D70FF70E2.
  APK auf Desktop von Laura ersetzt.
- **Offen:** Kapitel 5-14, 6 weitere Bahnverbindungen, reale Android-TV-/Handy-
  Bedienung, Audio/Szenenpolitur und vollstaendige Spiel-Durchlaeufe.

## 2026-11-01 – Android 0.18.1 (visuelle Nachkontrolle)
- Bei der Sichtpruefung fielen in Pumpwerksraeumen unpassende Aussenwelt-Baeume auf. Diese Tile-Darstellung ist durch metallene Industriewaende, Bodenplatten und animiertes Wasser ersetzt.
- Echte Chrome-Steuerbefehle zum Betreten/Verlassen des Nordufers sowie zum Ausloesen des Bosskampfs bestanden.
- Screenshots fuer Pumpwerk und Kontrollraum neu erstellt; Android versionCode 19 / versionName 0.18.1.
- **Signierter GitHub-Release verifiziert:** Commit bc5734ec, Android-Actions-Run 41320548450 erfolgreich, APK 2.448.329 Bytes, SHA256 506799cefd0880bda218667eae909bb4c625483d0f94077e07e14f4cfb4d40c1; auf Laptop-Desktop ersetzt.


## 2026-11-01 – Kapitel-3-Ausbau: 0.18.0 lokal getestet
- M01-05: Alle echten Kartenportale bidirektional, Sperrflags und abgesicherte Spawnpunkte.
- Vier separate neue Maps: Nordufer, Nebelhafen, Pumpwerk und Kontrollraum; Omas Dorf und alte Arena-Koordinaten unveraendert.
- Sera, drei Zeugen, Strompult, zwei Ventile, Pumpenrotor, Pumpenwaechter, Tonarchiv, Wartungsmarke.
- Kapitel-3-Zustand im alten Save-Schema additiv gespeichert. Einmalige Questbelohnungen und Speicherrueckkehr geprueft.
- Gewichtet validierte Wildtabellen fuer zwei neue Gebiete; historische Wurzelheim-Pools beibehalten.
- Zusaetzliche Hafen- und Pumpwerksgrafiken; fuenf echte Headless-Chrome-Screenshots im visual-audit-Verzeichnis.
- Kapitel-3-Unit-/Pfade-/Save-Tests grün, bestehende 18 Tests grün, Chrome ohne JS-Fehler.
- Android versionCode 18 / 0.18.0 gesetzt; **GitHub Actions und signierten Release separat bestaetigen**.
- Noch offen: ausgebaute Szenen, reale TV-/Handy-Hardwarepruefung, Kael-Migration, Kapitel 4–14.


## 2026-11-01: Masterplanung V1

- 14 Hauptkapitel + Postgame als Szene-, Quest-, Gebiet- und Produktionskarten erstellt.
- Existierende Intro-, Wald-, Ruinen-, Arena- und Familiengeschichte aufgenommen.
- Echo-Bahn, 8 Stationen, 7 Verbindungen, sichere Rückfahrten und Mapgraph geplant.
- Alle 150 echten Spezies mit unveränderten IDs und Entwicklungswerten in CSV erfasst.
- Aufgaben M0–M7, Architektur, Speicherung, Testregeln und Fortsetzungsdatei dokumentiert.
- **Nur Dokumentation, kein neues APK-Spielkapitel veröffentlicht.**


## 2026-11-01 – M00-02, M01-01 und M01-02

- Acht **synthetische** Golden-Save-Fixtures und einen beschädigten JSON-Fall hinzugefügt, keine realen Nutzer-Spielstände.
- Karten-Registry als Legacy-Adapter implementiert, 36×28 Originalkarte bleibt unverändert.
- Save-Schema 2 additiv integriert. Einmaliges Rohbackup älterer gültiger Saves lokal im gleichen Speicher. Alte Teams, Inventar, Arena- und Questflags bleiben erhalten.
- Neue Tests `map-registry.cjs` und `save-compat.cjs`. Mobile und Offline-HTML-Kompatibilität berücksichtigt.
- Android-Version auf 0.15.0 / VersionCode 15 angehoben, signierter Release nach CI zu verifizieren.
- Nächster Auftrag: M01-03 StoryRegistry. Kreative Storyplanung bis Kapitel 14 bleibt unverändert.

## 2026-11-01 – APK v0.15.0 erfolgreich veröffentlicht

- GitHub Actions: 16 Spieltests, Story-Dokumentenprüfung, Android-Release-Build und Signaturkontrolle erfolgreich.
- APK SHA256: 1dacfb677c4d950e434436c17b537cbd6f657fc1dfa1e8f93f9a79d2869d70e6.
- Android-APK hat den neuen Karten-Registry-Code und den 150er-Geisteratlas; erneuter Download auf dem Laptop-Desktop geprüft.
- Build aus Commit ae50b36583a9d4c47a50f3822983498df55de7f9.

## 2026-11-01 – M01-03 StoryRegistry / Android v0.16.0

- StoryRegistry mit zehn vorhandenen Quests und unveränderten Save-Flags eingeführt.
- Einmalige Belohnung für Liora (+2 Tränke/+5 Sphären), Piko (+1/+3), Erinnerungshüter (+2/+3) und Omas Spieluhr (+3/+0).
- Bewusst keine neue Story-Flag-Datenstruktur; altes Speichern und das reguläre erste Kapitel funktionieren weiter.
- Neuer story-registry.cjs-Test; Integration mit Legacy-Code. Realer Chrome-Lauf mit 10 aktiven Questdefinitionen in modularer und Offline-Fassung, echte Screenshots.
- Neue Android-Releaseversion 0.16.0 (VersionCode 16); erfolgreiche Signierung und Veröffentlichung nach GitHub-Workflow bestätigen.
- Nächster Task M01-04: EncounterRegistry.

### Verifizierter Android-Release v0.16.0

GitHub-Actions-Build einschließlich signierter Veröffentlichung erfolgreich, Quellcommit 4272e942c8512c0c15a33a5ad15f7b6b937fdd7c. APK 2.438.406 Bytes; SHA256 955c987d0b556dc572d0a6f552f03f6b5c1eb01c3fccd7fb8f45f2d8a4c8e426. Das APK wurde auf den Desktop geladen, Prüfsumme, QuestRegistry und 150er-Rückatlas wurden bestätigt.

## 2026-11-01: M01-04 / EncounterRegistry und Android v0.17.0

- Alle echten 150 Art-IDs in einer neuen kartenabhängigen EncounterRegistry validiert.
- Nur legacy_wurzeldorf aktiv, mit identischem 25-Grundformen-Anfängerpool und alten Level-/Schonregeln. Neue Regionen sind Design.
- Zukünftige gewichtete Tabellen müssen 100 Prozent ergeben und eigene gültige IDs, Level und Badge-Gates verwenden. Unbekannte Maps verwenden keine alte Dorftabelle.
- Modulare Engine integriert, Offline-Einzeldatei gesondert mit ihrer historischen Levelkurve eingebunden.
- Neue Tests mit 20.000 Zufallsziehungen und 1.840 echten simulierten Wildkämpfen; Chrome-Tests beider Fassungen, Screenshots, keine JS-Fehler.
- Android-Projektversion auf 0.17.0 / VersionCode 17 gesetzt. Signierten Release bei GitHub erst verifizieren.
- Nächster Auftrag M01-05: sichere, reale bidirektionale Kartenportale.


### Verifizierter Android-Release v0.17.0

GitHub-Actions-Release mit bestehender Android-App-ID und stabiler Signatur erfolgreich, Build aus Commit 2c8140f1f480ba6a2f5f563bac0895e3a7822414. APK 2.440.828 Bytes, SHA256 fc34298f2841a3a528a0ea3f164f1f0ff6c13e5ea041c74eb1f1ed5e6cda1fa2. Direkt-APK auf den Laptop-Desktop geladen und mit identischer Prüfsumme verifiziert; EncounterRegistry, Encounter-Daten und 150er-Rückatlas sind enthalten.
