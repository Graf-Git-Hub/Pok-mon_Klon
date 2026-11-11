# 11.11.2026 – GB-Erkundungswelt V16

Wegweiser mit auswählbaren Nachbarzielen und einem Pfeil für die nächste Laufrichtung. Standardroute von Wurzelheim über das Nordufer nach Nebelhafen.

# 11.11.2026 – GB-Erkundungswelt V15

Wurzelheim und Nordufer individuell gestaltet. Dorfplatz, verzweigte Wege, versetzte Häuser, Seeufer und Waldlichtungen.

# 11.11.2026 – GB-Erkundungswelt V14

Außenkarten auf ursprüngliche Abmessungen erweitert. 17 Paare von Außenwegen zeigen die Nachbarkarte und führen ohne Unterbrechung der Laufanimation über den Kartenrand.

# 10.11.2026 – GB-Erkundungswelt V13

GB-Welt V13: Alle 60 Gebiets-IDs als kompakte Erkundungswelt unter ../gb-classic/welt-60-karten.html. 118 Graph-Verbindungen und 238 Landmarken aus dem Originalmanifest übertragen. Grundrisse und Landmarkenpositionen neu angeordnet. Storybedingungen sind in der Vorschau geöffnet. Die Kampf-/Quest-Engine und die Save-Dateien sind dort nicht aktiv. Generatoren unter project/tools/gb-world. Hauptspielintegration und menschliche Einzelabnahme bleiben eigene Schritte.

# 10.11.2026 – GB-Grafikprototyp V5

Eigene Richtungs-/Laufanimation, transparente Figuren und Vordergründe, lesbarere gemeinsame 16px-Grafik. Kamera, Türlinks und vier Graustufen erhalten. Nur separater Prototyp; keine Änderung an Hauptspiel/APK/Saves. Siehe ../gb-classic/GRAFIK_V5_TESTBERICHT.md.

# Story-Roadmap Änderungsverlauf

## 2026-11-07 - SOULS 3.46 Kartenwerkstatt mit 60 echten Echo-Karten und sicherem Import
- Separater, mobil nutzbarer SOULS-Karteneditor mit eigenem Speicher und echtem 60-Karten-Projekt.
- Validierter Import als diffs in den wirklichen Spiel- und Kollisionsdaten, keine Bildattrappen oder Save-Schema-Änderung.
- Wurzelheim-Pilot: verbundener Weg, Begrünung, Leuchte und Blumen sowie korrekte Gras-Überlagerung.
- Versehentlich bepflasterte, storyrelevante Wildgrasfelder (13/14,23) im Startdorf korrigiert und als Schutzfelder fixiert.
- Echte Browserprüfungen auf Desktop/Handy, negative Story-/Kollisionstests, neue eigene CI.
- Details: SOULS_BRIDGE_20261107.md.

## 2026-11-07 - Alle 60 Weltkarten: 58 letzte Gebiete begehbar erweitert
- 57 bisher winzige Regionen um jeweils mindestens 22 Spalten und 13 Zeilen größer gemacht, verbunden durch neue Straßen/Rundwege und thematische Landschaftsbereiche, im echten Karten-/Kollisionscode.
- Startdorf Wurzelheim mit zusätzlichen Rundwegen im bestehenden 36x28-Raster statt riskanter Verschiebung seiner Quest-/Häuser-Koordinaten. Nordufer/Nebelhafen sind bereits zuvor individuell umgebaut.
- In der Kartenregistry bleiben Portal-, Storyflag-, Quest- und Spawneinträge kompatibel, östliche/südliche/ausgewählte nördliche Ausgänge werden an die neuen Ränder verlegt.
- Einfache zusätzliche Dorfhäuser mit passenden soliden Kollisionsflächen; im Spielrenderer ebenso sichtbar wie im Export.
- Neue 60er-BFS-Validierung: 118 Ausgänge, 125 Spawns, 238 Quest-/NPC-Punkte erreichbar, kürzeste West-Ost-Portaldistanz 39 Felder; 59 lokale Node-Tests + 64 Browser-Kartenaufrufe grün.
- 60 echte PNG-Einzelkarten (2x) plus XXL-Übersicht und ZIP aus dem echten Renderer, ohne Spielfiguren/NPCs/HUD. Details: MAP_ALL_60_20261107.md.

## 2026-11-06 - Weltkarten-Umbau, Teil 1 von 60
- Nordufer statt 24x17 nun 48x28 Felder: markierter, verschlungener Hauptweg, See/Steg, Nebenweg und klare Baumgrenzen.
- Nebelhafen statt 26x18 nun 52x30 Felder: Markt, fünf Hausstandorte mit Zugangswegen, Hafenanlage, vernetzte Hauptstraße.
- Im echten Tile-/Kollisionssystem umgesetzt, keine KI-Ersatzbilder. NPC- und Portalkennungen sind unverändert.
- Kürzeste Eingang-zum-Ausgang-Route 47/49 Felder, begehbare Felder 848/1146. Belege unter docs/map-redesign-preview/ und MAP_REDESIGN_20261106.md.
- Die übrigen 58 Karten bleiben vorerst unverändert; weitere Welt-Abschnitte sind noch offen.

## 2026-11-06 - Echte Runen-Wirtschaft, seltene Funde und 2.000.000 Kampfduelle
- Drei Wege fuer echte Runen: Wurzelheimer Dorfladen mit Echo-Muenzen, eine einmalige sichtbare versteckte Nebel-Rune und einmalige Ahnen-Runen-Questbelohnung nach dem Ruinenboss.
- Kraft-Rune +12 % Schaden, Schutz-Rune -12 % erhaltenen Schaden, Nebel-Rune +7 % Kraft/-7 % Schaden, Ahnen-Rune +3 % Heilung je eigenen Schadenangriff. Alle wirken auch in Teamkaempfen, auf beiden Seiten, mit den weiterhin 1/2/3 evolutionsabhaengigen Ausruestungsslots und der bisherigen EP-Rune. Keine Mehrfachanlage derselben Rune pro Wesen.
- Bestehender Dorfladen wurde zum echten Kaufmenue; Preise, 75 Startmuenzen, Wild- und Trainerbelohnungen, limitierte Angriffsrunen, absichernde Inventar-, Shop- und Fundspeicherung ohne v2-Schemaerhoehung.
- Zwei Millionen vollstaendige seed-basierte Kampfsimulationen mit **44.286.407 Attacken**, 1.000.000 3v3, 800.000 1v1, 200.000 2v3, **keinen** Timeouts, ungueltigen HP-Werten oder Slot-Verstoessen. Bericht und Quelltest unter visual-audit/rune-million und tests/rune-two-million-battles.cjs.
- Neue Desktop/Touch-Chrome-QA von Shop und verstecktem Fund, Node-Regressions- und Shop-Quest-Pruefung, GitHub-Workflow mit 2-Millionen-Test. Details: RUNE_WIRTSCHAFT_2M_20261106.md.

## 2026-11-06 - Klassisches START-Seitenmenue und HP-Anzeigen
- START oeffnet ein schmales, rechtsseitiges Pixel-Menue ueber der Spielwelt (Seelenbuch, Team, Rucksack, Runen, Archiv, Speichern, Optionen, Zurueck); Navigation per Controller, Tastatur und Touch.
- Neue Teamuebersicht mit HP-Balken sowie ein echtes Rucksack-Register mit Ausruestungs-Anbindung und bisheriger Teamheilung. Alte Runen-/Archiv- und Speichervorgaenge weiter nutzbar.
- Optionen fuer Ton, Palette und Steuerung, separate dauerhafte Benutzereinstellungen (kein Save-Schema-Bump).
- Sichtbare Kampf-, Lexikon- und Statusanzeigen nutzen nun HP statt der deutschen Bezeichnung KP, ohne Lebenswerte zu aendern.
- Neue Browser-QA mit acht Menueeintraegen auf Desktop/Touch, Screenshots unter visual-audit/retro-start-menu, Dokumentation RETRO_START_MENU_20261106.md.

## 2026-11-06 - Automatische Kampfitems und Ausruestungsplaetze
- Entwicklungsstufen 1/2/3 geben 1/2/3 Ausruestungsplaetze; EP-Teiler zaehlt als passiver Gegenstand, nicht als Attacke.
- Rucksack belegt einen Slot und bietet 2 separate Verbrauchsitem-Plätze; keine Rucksack-Verschachtelung. Alte Save-v2-Daten bleiben lesbar.
- Ein ausgeruesteter Seelen-Trank wird bei maximal 30 % KP automatisch ohne Zugverlust getrunken. Schock, Brand und spaetere Gift-/Paralyse-Zustaende haben passende sofortige Gegenmittel; der Spieler kann anschliessend normal handeln.
- KP-Ampel einheitlich: gruen ueber 60 %, gelb bis 60 %, rot ab 30 %. Neue Desktop/Touch-Menues, Node-/Browser-QA und Screenshots in AUTO_AUSRUESTUNG_20261106.md. Kein automatischer Android-Release.

## 2026-11-06 - EP-Teiler, Teamwechsel und passive Rune
- Eingesetzte Wesen teilen die regulaeren Kampf-EP. Nicht eingesetzte gesunde Wesen erhalten weiterhin zusammen 40 % Bonus-EP; mit tatsaechlich eingesetztem EP-Runen-Traeger steigt der Bonuspool auf 100 %. K.-o.-Wesen bekommen nichts.
- Passive EP-Rune ist ab dem ersten Sieg verfuegbar, auf alte Sieg-/Arena-Spielstaende rueckwirkend freigeschaltet und ueber Runenlehre anlegbar. Keine der vier Kampfattacken oder Lernrunen wird blockiert.
- Eigene Node- und echte Desktop-/Touch-Chrome-Tests, Screenshots und Dokumentation: EP_TEILER_20261106.md. Separate GitHub-CI; vollstaendiger Gegenstandsbaukasten bleibt spaeterer Task.

## 2026-11-06 - Gezielte Kampfentscheidungen statt blindes Massentesten
- 12×12=144 Element-Kombinationen und 150×12=1.800 Art-/Element-Kombinationen mit Original-Typenlogik geprüft; 12 Statusregeln samt Grenzwerten, Dauer und Zielisolation kontrolliert.
- 15.000 fixierte Kampfbegegnungen mit jeweils fünf Strategien, insgesamt 75.000 Kampfdurchläufe ohne Timeouts. Paarweise Siegquoten: Kraft 58,13 %, Element 62,00 %, Element+Heilung 62,05 %, Element+Status 62,00 %, Kombination 62,05 %.
- Dokumentiert, dass Zusatzheuristiken aktuell kaum Vorteile liefern. In diesem Zweig bewusst **keine neuen HP/ATK/DEF-, KI- oder Save-Änderungen**, bis bessere Entscheidungen gezielt begründet und getestet sind. Rohbericht `docs/visual-audit/tactical-audit/paired-decisions.json`.

## 2026-11-05 - Intelligente KI im echten Kampfsystem
- Gegner entscheiden anhand des zu erwartenden Nutzens zwischen K.-o.-Treffer, Typvorteil, nicht erneut gestapelten Statuseffekten, Schutz und einmaliger sinnvoller Heilung; Gegner bis einschließlich Level 8 bleiben einsteigerfreundlich.
- Neue testbare Entscheidungslogik mit konkreten Unit-Tests und unabhängigem gepaartem Engine-A/B-Test auf 12.000 identischen Ausgangspaarungen: 24.000 Kämpfe, null Timeouts; Spieler-Siegquote 61,48 → 58,29 %, bei frühen Leveln 62,50 → 60,47 %.
- 52/52 Node-Tests, realistischer Desktop-/Touch-Storylauf bis Kapitel 4, Browser-Kampf-UI und 100.000 neue Zufallskämpfe ohne Hänger bestanden. Der 100k-PC-Fingerprint wurde im Cloud-Workflow aktualisiert.
- Noch keine Freigabe für `main` oder neue APK, bis vollständige Cloud-CI inklusive Geschichte bis Postgame grün ist. Details `SMART_ENEMY_AI_20261105.md`.


## 2026-11-05 - Gezielte Kampfentscheidungs- und Statusprüfung
- Alle 144 Elementpaare, 1.800 Art-Angriffstypkombinationen und 12 Statusregeln kontrolliert; 96.000 tatsächliche Effekt-Auslöseversuche mit erwarteten Wahrscheinlichkeiten.
- 15.000 gleiche Startpaarungen dreimal als echte Engine-Kämpfe wiederholt: 45.000 Kämpfe, 0 Timeouts, rohe Kraft 58,13 %, Elementwahl 62,00 %, taktische Heil-/Statusheuristik 62,05 %.
- Elementwahl gewinnt 585 gepaarte Situationen allein (Rohkraft nur fünf), Heil-/Statusentscheidung gewinnt gegenüber reiner Elementwahl nur sieben zusätzliche netto. Neue Tests und GitHub-CI im isolierten QA-Branch. Bericht `TACTICAL_AUDIT_20261105.md`.


## 2026-11-05 - PC-Training mit 20 x 100.000 echten Engine-Duellen
- Alle 20 Runden abgeschlossen, unabhängig zufällig gewählte Arten an beiden Seiten, 2.000.000 Kämpfe, 0 Timeouts. Nach jeder Runde gezielte bounded HP/ATK/DEF-Anpassungen, 141 Anpassungsaktionen, 42 Arten am Ende geändert; kein Eingriff in Save/ID/Story-Elemente und Starter-Familie #1–3 geschützt.
- Unabhängige neue 100.000 Vorher- und 100.000 Nachher-Duelle mit identischen Paarungen: Abweichung zum Stufenmedian 6,953 → 6,346 Prozentpunkte, große Ausreißer 4 → 3. 0 Hänger.
- Rohberichte und schneller struktureller Regressionstest archiviert, gesamtes Ergebnis und Grenzen in `ADAPTIVE_20X100K_20261105.md`. Weiteres Feinbalancing braucht gezielte kontrollierte Experimente statt bloß höherer Kampfzahlen.


## 2026-11-05 - Zweite Balancerunde mit 100.000 Zufallskämpfen
- Nach PR #32 elf Arten gezielt durch sehr begrenzte HP-/ATK-/DEF-Anpassungen nachjustiert, darunter Hasengeist II, Katzengeist I/II, Skelett-Hund III und Robbengeist II; alle 150 IDs, Namen, Moves, Story und Save-Felder bleiben unverändert.
- Drei vollständige Kalibriermatrizen zu jeweils 135.000 Kämpfen, alle ohne Timeout; die bislang sehr schwachen Zweitentwicklungen gewinnen nun über 40 % gegen Gleichstufige, Robbengeist II liegt statt 84,85 % bei 73,86 %.
- Im finalen Stand 100.000 echte Engine-Kämpfe mit unabhängig zufällig gewählten Wesen beider Seiten ausgeführt: 50.191 Siege, 49.809 Niederlagen, 0 Timeouts. Unabhängige, identische GitHub-Kontrolle und ein fester Guardrail-Test ergänzt; mehr Details in `BALANCE_RANDOM100K_20261105.md`.


## 2026-11-05 - Taktische Zusatzeffekte für Elementattacken (separater Branch)
- 12 ausgewählte Feuer-, Eis-, Blitz-, Psycho-, Natur- und Runenattacken mit Brand, Schwächung, Schutz oder Regeneration.
- Effekte gelten pro Kampf und individuellem Wesen, Dauer begrenzt; keine Save-Schema-Migration oder Änderungen an Arten-IDs.
- Neue Statushinweise im Kampf und Attackenbuch; im Kampf-Testlabor jetzt alle 150 Wesen wählbar.
- 46/46 Node-Tests sowie Desktop-/Touch-Status-Browserchecks lokal grün; vollständige CI/Android-Freigabe bleibt ausstehend.


## 2026-11-05 - Zwölf Elemente, Doppeltypen, permanentes Attackenbuch und Runen
- 150 feste Arten-Typzuweisungen aus Atlas/Artenmotiv, inklusive Doppeltypen, typisierte Stärken/Schwächen, Retro-Typenbadges neben KP.
- 40 zusätzliche Elementattacken, 12 begrenzt erspielbare Runen, max. zwei Runenattacken pro Wesen; nur vier vorbereitete Kampfattacken, alle gelernten bleiben im Buch.
- Teamwechsel im Kampf und Attacken-/Runenwahl per Tastatur und Touch, bestehende Saves bleiben kompatibel.
- Fehler behoben: Beim Level-Up wurden neue Angriffe zwar gelernt, aber durch eine zu frühe Synchronisierung nicht als neu gemeldet. Regressionstest ergänzt.
- Lokal: alle 45 Node-Tests bestanden, Typ-/Runen-Browserchecks auf Desktop und Touch bestanden. Vollständige Cloud-CI/Android-Hardwareprüfung und neues signiertes Release bleiben getrennte Freigabeschritte.

## 2026-11-04 - Kapitel 8-10 und mobiles Portraitlayout
- Echter Tastatur-/Touch-Durchlauf ab Kapitel 7 bis Kapitel 11:
  Kronenstadt, Archivindex und Waechter; Frostgrat mit montierter
  Phasenlaterne, Bruecke und Vex; Unterstadt mit drei Ankern
  und friedlicher Ringhueter-Loesung.
- Lokal Chrome 157 PASS: 1.350 Bewegungsschritte, 90 Dialoge,
  4 reale Bosssiege, 12 Save-Reload-Tests, 0 JS-Ausnahmen.
- Mobile Toolbar bei 360-450px wird in zwei Zeilen aufgeteilt,
  Canvas im Hochformat besser vertikal ausgerichtet. Drei
  Handy-Groessen mit echten Layout- und Screenshottests bestanden.
- Neue Browser-Tests real-chapter8-10.py und mobile-layout-check.py
  laufen auch im GitHub-Cloud-Workflow.
- Android 0.29.0/versionCode 30 fuer den UI-Fix vorbereitet.
  Alte App-ID, Signatur und Spielstandschema bleiben erhalten.
  Freigabe nur nach gruener GitHub- und Android-Abnahme.

## 2026-11-04 - Kapitel 6+7: echter Tastatur-/Touch-Durchlauf
- Ein zusammenhaengender Chrome-Test ab dem Kapitel-5-Endstand
  absolviert Schmiede, Arbeitersuche, Ventile, Schmelzmeister,
  Ofenkern, Namensrituale, Bibliothek, Jaeger, vier Namenssteine,
  Namensschatten und den Zugang nach Kapitel 8.
- Lokale Gegenprobe Chrome 157 bestanden: 1164 echte Schritte,
  76 Dialogaktionen, 8 Boss-Siege auf Desktop+Touch, vier
  Speicher-Reloads je Viewport ohne JavaScript-Fehler.
- Neuer CI-Browser-Test `project/qa/real-chapter6-7.py`, separate
  QA-Dokumentation `CHAPTER6_7_REAL_QA.md`.
- Level-55-Testteam, daher keine Aussage ueber reguläre Schwierigkeit;
  reine QA-/Doku-Aenderung, keine neue APK oder Save-Migration.

## 2026-11-04 - Kapitel 5: reale Steuerung und Bosskaempfe geprueft
- Neuer Cloud-/Laptop-Browsertest: project/qa/real-chapter5.py,
  mit echten Tastatur-/Touch-Schritten durch Stillwasser,
  die Widerspruchszeugen, das Archiv, die Spiegelsicherung und
  zwei echte Kaempfe bis zur Bahnhofsrueckfahrt.
- GitHub-Actions 41846368280 SUCCESS (Chrome 156); unabhaengige
  Gegenprobe in isoliertem Worktree auf Laura mit Chrome 157 PASS.
  Pro Ansicht 280 Laufbewegungen, 26 Interaktionen, zwei Bosssiege,
  sieben Angriffe und zwei Zugfahrten. Vier Save-Checks je Ansicht.
- Archiv-Zwischenspeicherung, Lyra-Freigabe, einmalige Belohnung,
  Rueckreise und ohne JS-Ausnahmen kontrolliert. 16 neue Bilder;
  Pixelgrafik und Touch-Leerraum bleiben als Polishing-Aufgaben.
- Reines QA-/Dokumentationspaket: keine neue signierte APK,
  kein Gameplay-Code, App-ID, Monster-IDs oder Save-Schema geaendert.

## 2026-11-04 - Cloud-QA: Kapitel 4 real durchgespielt
- Neuer Test project/qa/real-chapter4.py: Tastatur/Touch bedient
  beide Bahnhofskarten, Weichen A-C-B, Moorglas, echte Zugmenues
  und die Kaempfe gegen Kurier und Schattenwurzel.
- GitHub-Lauf 41743136449 und Wiederholung 41743525794 SUCCESS:
  pro Ansicht 188 Bewegungsschritte, 17 Interaktionen und
  vier Bahnfahrten. 376 Schritte, 34 Dialoge, vier Boss-Siege
  und acht Fahrten gesamt. Benutzte Angriffe variieren wegen
  zufaelligem Schaden (erste Runde 6/6, Wiederholung 5/6).
  Keine JavaScript-Fehler. Drei Save-Checkpoints und
  erneute Bahnreise ohne doppelte Questbelohnung bestanden.
- Screenshots und JSON-Bericht als GitHub-Artefakt, 18 Kapitelbilder
  fuer diesen Test. Testteam Level 55, Kapitel 3 als erledigt gesetzt.
  Kein vollstaendiger echter Spieldurchlauf, keine Balance-Aussage.
- Reine Test-/Doku-Aenderung; keine neue APK und keine Spielstand-
  oder App-ID-Migration.

## 2026-11-03 - Durchgespielte Kapitel-3-Steuerung in der Cloud
- Neu: project/qa/real-chapter3.py, echte Tastatur-/Touch-Steuerung
  vom gesperrten Pumpwerk ueber drei Zeugen, Pumpwerksraetsel und
  den real gespielten Bosskampf bis zum Kapitel-4-Wurzeltunnel.
- GitHub-Run 41725799619 SUCCESS: 142 Schritte, 14 Dialoge und
  2 Boss-Attacken pro Viewport (Desktop + Handy), insgesamt
  284/28/4, ohne JavaScript-Fehler. Save/Reload und einmalige
  Belohnung bestaetigt; 8 Kapitelbilder im Workflow-Artefakt.
- Die Testfigur ist absichtlich ueberlevelt (Lv55); normaler
  Levelverlauf und Kapitel 1-2 nicht durch diesen Test bewertet.
  Reine QA-/Doku-Erweiterung: keine neue APK und keine ID-Aenderung.

## 2026-11-03 - Cloud-QA: Durchgehender Story-Spielstand
- Neuer integrierter Test `project/tests/continuous-campaign.cjs` verbindet
  die bestehenden Kapitel 3-14 und das Postgame mit EINEM persistenten
  Spielstand statt getrennten Kapitel-Fixtures.
- 91 Kartenuebergaenge, 189 Quest-Interaktionen, 17 ueber echte
  Victory-Callbacks simulierte Boss-Siege, 12 Kapitel-Reloads,
  9 Zwischenquest-Reloads und 12 Wiederholungspruefungen auf
  doppelte Quest-Belohnungen mit
  erhaltenen Archiv-/Lexikon-Daten; Hauptgeschichte und Postgame
  schliessen ab. GitHub Node-CI erfolgreich.
- Kapitel 1-2 und echte Laufwege/Kampfsteuerung sind separat zu pruefen;
  dies ist kein kompletter Mensch-Spiel-Durchlauf. Der Test lieferte
  einen konkreten Hinweis auf die friedliche Waechterloesung (Kap. 10:
  nach dem Zeugnis erneut ansprechen), der im Ablauf beruecksichtigt wird.
- Nur Test/Dokumentation; keine APK-, VersionCode-, ID- oder Save-Aenderung.

## 2026-11-02 - v0.28.0 veroeffentlicht: Reserveteam-EP und spaete Bosse
- PR #10 in main 9b3258860dc4262090e8bcb60f4b57ca9b672110.
  GitHub-Actions Tests 41532799344, Docs 41532799280 und
  Android 41532799303 jeweils SUCCESS.
- Signierte APK v0.28.0/versionCode 29, 2.508.038 Bytes,
  SHA256 c7596f8049309cd229613e2e2574b456b677d68d74551306124d09a8963db34e.
  Paket-ID de.echochroniken.game.stable unveraendert; Signer-SHA256
  84be81f8472b62b59527e4fcf67b19fa7d2e3ef4c0b05069c60139a45ec8ec87
  wie v0.27.0; apksigner/AAPT in CI erfolgreich. GitHub-Asset-Digest,
  Direktdownload und Desktop-Datei auf Laura stimmen ueberein.
  Desktop-Backup der vorigen Version im TEMP-Ordner vorhanden.
- Nach jedem gegnerischen Sieg bleibt die originale volle EP-Belohnung
  fuer das aktive Wesen erhalten. Alle gesunden Reservemonster teilen
  einen zusaetzlichen 40%-Pool; KO-Monster und Archiv nehmen nicht teil.
- Levelaufstieg, Entwicklung, Attacken und Lexikon werden auch bei
  Reserve-EP korrekt aktualisiert, ohne IDs oder SaveSchema zu aendern.
- Spaete Schluesselbosse (Kapitel 11, Kapitel 13/14 und Postgame)
  von .78/.80 auf .90 KP- und .95 Schadensfaktor angehoben.
  Fruehe/normalere Bosse unveraendert. 2700 deterministische
  Einzelduelle mit drei Kampf-Archetypen und bis 10 Level Abstand
  untersucht; Zielniveau fair gewinnbar. Kein echter Voll-Durchlauf.
- Zwei neue Regressionstests und echte Desktop-/Touch-Kampf-QA in
  Chrome 156 mit vier Screenshots und Bericht. Insgesamt 35/35 Node-Tests,
  elf Browser-Screenshots inklusive Story-Reload, Android-Plattformtest,
  Dokumentvalidator und git diff --check lokal erfolgreich.
- Signierte v0.28.0 erst nach CI-SUCCESS, Signatur-/Paketpruefung
  und SHA256-Direktdownload veroeffentlicht. Echter Handy-/TV-Test offen.

## 2026-11-02 - v0.28.0 Balancing: Heilung und sichere Niederlage
- Gegnerische Heilfaehigkeiten verursachen keinen Schaden mehr; 30% Chance zur einmaligen Heilung unter 35% KP.
- Spaete Niederlagen fuehren zum sicheren lokalen Karten-Einstieg, im Startgebiet weiterhin zu Oma.
- Zwei neue Spielcode-Tests; 33/33 Node-Tests und sieben Chrome-156-QA-Screenshots erfolgreich.
- Android v0.28.0 mit versionCode 29 vorbereitet; Freigabe erst nach CI, Signatur und SHA256.

## 2026-11-02 - v0.27.0 veroeffentlicht: Figurenlexikon und finale Schauplaetze
- PR #8 in main integriert (ad3293ffb8ce11bcb3a8812af9820be359bd8b0e).
  Actions Tests 41490437926, Docs 41490438433, Android 41490437649
  alle SUCCESS; Releaseversion 0.27.0 / versionCode 28.
- Direkte APK 2.507.202 Bytes, SHA256
  9b09cf4ab8f2ebf2ce46831abd3ecc2c23a03c68ba2172524cea9e7344204a83.
  Paket-ID de.echochroniken.game.stable unveraendert; cert SHA256
  84be81f8472b62b59527e4fcf67b19fa7d2e3ef4c0b05069c60139a45ec8ec87
  identisch zu Vorgangerversion laut apksigner. Github-Asset-Digest und
  SHA256 auf Laura nach Direktdownload sowie Desktop-Kopie verifiziert.
  Vorgaenger-APK im TEMP-Ordner gesichert. Echte Android-Hardware offen.
- Nach echtem visuellen Audit des 150er-Atlas alle 50 generischen
  Spukwesen-Namen individuell ersetzt und Familienlabels harmonisiert.
  Original-IDs, Typen, Stats, Evolutionsketten und Save-Schema unveraendert;
  150 eindeutige Namen, 50 gepruefte Kunst-Zuordnungen.
  Kontaktblaetter, Review-JSON und wiederholbare Browser-Bestiarium-QA.
- Erinnerungszimmer und Resonanzkern mit eigenen gepixelten Umgebungen,
  erkennbaren Spiegel-/Verschlussobjekten und auf Fortschritt reagierenden
  Maschinenleuchten statt gleicher Standard-Kulisse ausgestattet.
  Reine Renderaenderungen: keine Questlogik, Kollisionen oder Speicherwerte.
- Zwei neue automatisierte Tests fuer Farben/Queststatus/Renderaufwand
  sowie das 50-Namen-/Atlas-Mapping. Chrome 156 prueft 7 Story-/Touch-
  Checkpoints und 3 Bestiarium-Eintraege ohne JS-Fehler.
- MONSTER_DISTRIBUTION.csv und Dokumentvalidator aktualisiert;
  Roadmap M07-02 auf DONE, 150er-Gesamtaudit noch IN_PROGRESS.
- Android 0.27.0/versionCode 28 erst nach erfolgreichen CI-Pruefungen,
  Signaturkontrolle und SHA256-Direktdownload veroeffentlicht.

## 2026-11-02 - Story-/Postgame-Checkpoint-QA
- Regression fuer 100 Save/Reload-Checkpoints, 58 Story-/Postgame-Interaktionen, 3 gesperrte Portale ohne Seiteneffekte, umgekehrte Reihenfolgen und einmalige Belohnungen.
- Archivierte Maternalis bleibt bei Storydialogen erhalten; 29/29 Node-Tests sowie Android-Plattform- und Dokumenttest lokal bestanden.
- Wiederholbares Chrome-156-QA-Skript mit 5 echten Desktop-/Touch-Kartenscreenshots, Reload und JavaScript-Fehlerkontrolle hinzugefuegt.
- Kein neuer Release; unveraenderte SaveSchemaVersion, Wesen-IDs, Android-Paket-ID, Signatur und versionCode 27.


## 2026-11-02 - PR #2 integriert, ungewollter Android-Wiederholungsbuild
- PR #2 / main 82663252: 60 Maps, 123 Spawns, 310 Wege, 117 Portal-Rueckreisen durch neuen Regressionstest.
- Android-CI 41475017489 SUCCESS, publizierte v0.26.0 jedoch trotz unveraendertem versionCode 27 erneut.
- Neues Asset SHA256 92f1e61004385d5706458c46b37621e943be5b67fe25797945b2725578c40808, 2.505.606 Bytes, identisches Signer-Zertifikat und Paket.
- Direktdownload geprueft, Desktop-APK aktualisiert, altes Asset lokal gesichert. Workflow-Gate ueber PR #5 in main nachgeruestet.

## 2026-11-02 - Android-Release-Gate PR #5 verifiziert in main
- GitHub Actions prueft bei Pushes den Android-versionCode gegen den vorherigen main-Stand.
- Ohne Erhoehung keine neue signierte APK und keine Ueberschreibung des android-latest-Assets; Tests laufen weiterhin.
- Lokaler Git-Bash-Test: 27->27 unterdrueckt Release, 27->28 erlaubt es; PR #5 main 940ebf479764e3dbbfb5abf7a16c28b022d2c5b6, PR-CI 3/3 SUCCESS, Main-CI 3/3 SUCCESS. Android-Run 41475844213 hat Signieren und Upload SKIPPED, Release-Digest 92f1e61004385d5706458c46b37621e943be5b67fe25797945b2725578c40808 blieb erhalten. Signatur, Paket-ID, SaveSchema und Spielcode unveraendert.

## 2026-11-02 - PR #2: Routen-/Spawn-Regression
- Neuer automatischer Test map-spawn-reachability.cjs fuer alle Nichtlegacy-Spawns, begehbare Ausgaenge und reversible Portal-Rundreisen.
- Integration auf dem aktuellen v0.26.0-Archivstand statt dem urspruenglichen Basiscommit 28867fd.
- Lokal 28/28 Node-Tests, Android-Plattformtest, Dokumentvalidator, git diff --check und echte Chrome-156-Archiv-QA auf Desktop/Touch bestanden; Screenshots geprueft. PR-CI 41474802965/41474802856/41474802861 alle SUCCESS.
- Keine Aenderung an IDs, SaveSchema, App-ID, Android-Version oder Signatur; keine neue APK.

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
