# CONTINUE HERE - Echo-Chroniken Spielentwicklung

> Nordufer-Teststrecke: 10×9-Kachel-Kamera und acht Pixelphasen pro Schritt. Der östliche Waldsaum Wurzelheims schließt direkt an das Nordufer an. Zwei Wege führen um beziehungsweise durch das erste Grasfeld zum alten Steg. Der Test ist separat spielbar unter https://graf-git-hub.github.io/Souls/echo-chroniken-nordufer-test.html.

> V14-Hauptspiel: Die reguläre Kampagne nutzt V14-Grafik für alle 60 Gebiete. 17 Außenverbindungen wechseln in beide Richtungen ohne Namensdialog. Storysperren und Autosave bleiben aktiv. Die Grundrisse und Questkoordinaten stammen aus der Kampagne. Siehe ../gb-classic/V14_HAUPTSPIEL.md.

> GB-Welt V14: Größere Außenkarten mit 17 beidseitig verbundenen Außenwegen und sichtbarer Nachbarkarte. Siehe ../gb-classic/WORLD_60_README.md. Nächster Integrationsschritt bleibt die Übertragung in die Hauptspiel-Engine mit Storybedingungen, Kämpfen und Saves.

> GB-Welt V13: Alle 60 Gebiets-IDs als kompakte Erkundungswelt unter ../gb-classic/welt-60-karten.html. 118 Graph-Verbindungen und 238 Landmarken aus dem Originalmanifest übertragen. Grundrisse und Landmarkenpositionen neu angeordnet. Storybedingungen sind in der Vorschau geöffnet. Die Kampf-/Quest-Engine und die Save-Dateien sind dort nicht aktiv. Generatoren unter project/tools/gb-world. Hauptspielintegration und menschliche Einzelabnahme bleiben eigene Schritte.

> **Grafik V5, 10.11.2026:** Isolierter Branch `feature/echo-gb-art-animation-v5-20261110` verbessert nur die GB-Stilvorschau: eigene 12 Richtungs-/Laufposen, zwei NPCs, überarbeitete gemeinsame Tiles, Gras-/Objektvordergrund und behutsame Dorf-/Schmiedeänderungen. Siehe `../gb-classic/GRAFIK_V5_TESTBERICHT.md` und `GRAFIK_V5_RECHERCHE.md`. Kein Merge, keine APK-/Save-/60-Karten-Umstellung. Physische Android-/TV-Geräte weiterhin offen.

> **SOULS-/Echo-Kartenwerkstatt (07.11.2026):** Eigenständiger Editor auf GitHub Pages /Souls/echo-chroniken-editor.html mit allen 60 echten Echo-Maps. Projekt-JSON unter docs/souls-editor/, Basis-/Schutzmanifest unter project/tools/souls-bridge/original-maps.json, sicherer Rückimport per convert.cjs, Spielintegration per src/maps/souls-bridge.js und data/echo-souls-edits.js. Wurzelheim-Pilot importiert. Naturstory-Grasfelder (13,23)/(14,23) zurückgesetzt und explizit geschützt. Browser QA Desktop/Handy. Details in SOULS_BRIDGE_20261107.md. Der Editor kann alle 60 Maps bearbeiten, aber aktuell ist nur der Pilot im Spiel grafisch neu gestaltet. Alle weiteren Änderungen müssen noch importiert und getestet werden.

> **Stand 07.11.2026, alle Weltkarten:** Das Upgrade nach Nordufer/Nebelhafen (#45) liegt in feature/echo-map-all58-20261107. 57 weitere Karten wurden im echten MapRegistry-Renderer mit erweiterten Straßen/Plätzen/Nischen und verschobenen Fortschrittsausgängen versehen; Wurzelheim erhielt zusätzlich einen Rundweg. Insgesamt 60 Karten. tests/all-60-world-layout.cjs prüft 118 Ausgänge, 125 Spawns und 238 Storymarker, Mindestlänge der West-Ost-Pfade 39 Felder. Vollbild-/Einzelkarten in docs/exportierte-spielkarten/, Dokumentation MAP_ALL_60_20261107.md, Workflow .github/workflows/echo-all60-world-layout.yml. GitHub-Checks abwarten vor Merge; Save-v2 bleibt unverändert. Weitere img2img-Pixelart-Aufwertung erst später, nicht die Kollisionsdaten ersetzen.

> **MAPS, aktueller Zwischenstand:** Branch feature/echo-world-layout-overhaul-20261106: 2 von 60 Weltkarten wirklich vergrößert und lesbarer angeordnet (Nordufer 48x28, Nebelhafen 52x30); echte Map-Vorschauen, Tile-/Portalkollisionen und Wegtests dokumentiert unter MAP_REDESIGN_20261106.md. Andere Karten noch nicht umgebaut. Sicherstellen, dass GitHub-PR/CI geprüft und der natürliche Spieltest desktop + touch erfolgreich ist, bevor Merge. Ausgangsdaten und Exporter liegen gesondert im Branch assets/echo-real-maps-20261106.

> **NEU 06.11.2026, Runen-Shop und Stressaudit:** Gemergtes PR #42 (Retro-START) als Grundlage. Branch feature/echo-rune-economy-2m-20261106 implementiert Kraft-/Schutz-/Nebel-/Ahnen-Runen mit echten Schadens- und Heilungsboni, Coin-Wirtschaft und offenem Dorfladen, sichtbaren Weltfund und einmalige Ruinenboss-Belohnung. Der bestehende EP-Teiler belegt einen Slot, Kombinationen sind moeglich. 2.000.000 echte regelbasierte, zufaellige Vollkaempfe mit 44.286.407 Treffern durchlaufen, darunter 1.000.000 3v3; keine Timelimits, ungueltigen HP oder Slotverstosse. Test-, UI- und Persistenzdetails siehe RUNE_WIRTSCHAFT_2M_20261106.md, visual-audit/rune-market/ und visual-audit/rune-million/. Cloud-CI, PR und Merge pruefen, keine neue APK-Verteilung behaupten. Offen bleiben weitere seltene Rune-Quests, Shop-Auswahl in spaeteren Gebieten sowie menschliche Balance-Tests gegen Runen tragende Trainer.

> **NEU 06.11.2026, START-Pausemenue im klassischen Retro-Stil:** Auf dem nach 15/15 gruenen Cloud-Tests integrierten PR #41 aufbauender Feature-Zweig mit rechtsseitigem, transparent ueber der Oberwelt liegendem 8-Punkte-START-Menue, Teamansicht, wirklichem Rucksack, Runen/Archiv/Speichern/Optionen. Anzeige textuell von KP (dt. Kraftpunkte) auf HP (Hit Points) umgestellt, ohne Werte zu aendern. Ton/Palette als separate Preferences persistiert; Controller/Tastatur/Touch-Tests und alte v2-Saves sind Bestandteil von RETRO_START_MENU_20261106.md. Erneut CI abwarten vor Merge. Kein neuer APK-Release beansprucht.

> **NEU 06.11.2026, Automatische Ausruestung:** Ein separater, auf dem gruen getesteten und integrierten PR #40 aufbauender Branch fuehrt 1/2/3 Ausruestungs-Slots, Rucksack mit 2 Items, automatische rote KP-Heilung (<=30 %), sofortige passende Gegenmittel ohne Zugverlust sowie ein Ausruestungsmenue mit Desktop-/Touchsteuerung ein. Gemeinsam mit dem EP-Teiler bleibt der Save-v2-Aufbau kompatibel. Details, Tests und Screenshots: AUTO_AUSRUESTUNG_20261106.md. Bestehende Attacken koennen Brand/Schock ausloesen; Gift/Paralyse sind vorbereitet, brauchen aber spaeter einen gezielten Attacken-/Balancing-Schritt. Cloud-CI und PR erst pruefen, dann in main integrieren. Kein neuer APK-/TV-Hardware-Nachweis. Weiterhin offen: Erwerb/Verkauf von Items und mehrere Rucksacktypen.

> **NEU 06.11.2026, EP-Teiler:** Isolierter Branch feature/echo-ep-divider-20261106 aktualisiert project/src/game.js: aktive Kampfteilnehmer teilen die regulaeren EP, Bankwesen behalten den bisherigen 40-%-Bonuspool. Eine passive Rune erhoeht den Bonuspool auf 100 %, nur wenn der Traeger in diesen Kampf eingestiegen und nicht K. o. ist. Retroaktive Freischaltung bei alten Siegen, ueber Runenlehre umlegbar, Save-Schema v2 unveraendert. Die neue Node-/Browser-QA, Beweisbilder und Beschreibung stehen in EP_TEILER_20261106.md. **Cloud-CI und PR vor Merge pruefen; keinen Android-Build behaupten.** Naechster Erweiterungsschritt: echte 1/2/3 Ausruestungsslots und Rucksack-Item-System separat integrieren.

> **NEUE TAKTIKPRÜFUNG 06.11.2026:** PR #33 und #34 sind bereits gemergt. Separater Branch `feature/echo-tactical-audit-20261105` untersucht Element- und Statuswirkung. 144 Typenpaare, 1.800 Wesen-Typ-Kombinationen, 12 Statusregeln geprüft. Identische 15.000 Kampf-Konstellationen mit 5 Strategien ergeben **75.000 echten Engine-Kämpfe**, alle ohne Timeout: reine Kraft 58,13 %, beste Elementwahl 62,00 %, Heilung+Element 62,05 %, Statusbonus+Element 62,00 %, alle 62,05 %. Befund: Gegenüber Elementwahl liefern die simplen Zusatzheuristiken kaum Gewinne, daher Fokus auf bessere taktische KI statt 100 Mio. generischen Duellen. Siehe `TACTICAL_AUDIT_20261106.md`. Die neuen Tests/Dokumente dürfen erst nach grüner CI als integriert gelten.

> **AKTUELL 05.11.2026:** Baseline nach gemergten PRs #33–#35; neuer Branch `feature/echo-smart-enemy-ai-20261105` implementiert intelligente Gegnerentscheidungen zu Heilung, K.-o.-Priorisierung, Elementen und Status. Anfängergegner Level <=8 bleiben absichtlich einfach. Gegen alte KI 12.000 identische Startpaarungen pro Variante, Spieler-Siegquote 61,48 → 58,29 %, früh 62,50 → 60,47 %. 52/52 Node, Desktop/Touch-Story Kapitel 1–4 und Browser-Kampf-UI PASS. 100k neue Zufallskämpfe null Timeouts; CI-Golden-Wert aktualisiert. **Nächster Schritt** separaten PR/Cloud-CI inklusive Kapitel 14/Postgame, 150×150-Matrix, Android/Save prüfen, erst dann integrieren. Details `SMART_ENEMY_AI_20261105.md`. Originalworktree nicht überschreiben.


> **AKTUELLE Taktikprüfung, 05.11.2026:** Eigenständiger gezielter QA-Branch `feature/echo-tactical-audit-20261105`, auf Basis der 20×100k-Balancerunde PR #34. 144 Element-Matchups, 1.800 Art/Angriffstyp-Zellen, 96.000 echte Auslöseversuche von Statusattacken und 45.000 Kämpfe mit identischen Startpaarungen unter drei Politikvarianten. Elementwahl 62,00 % vs. rohe Angriffskraft 58,13 %, zusätzliche Heil-/Statuspolitik nur 62,05 % und damit kaum besser. Regel- und Ergebnisprotokoll `TACTICAL_AUDIT_20261105.md`. Nicht voreilig Statuswerte nachstellen. Original-Arbeitskopie unangetastet lassen. PR #34 erst nach vollständig grüner Cloud-CI freigeben, Audit-PR danach.


> **AKTUELL 05.11.2026: Adaptive 20x100k auf Laura ERFOLGREICH** im separaten Worktree `Echo_20x100k_Adaptive_20261105` (Basis PR #33). 2.000.000 zufällige Engine-Duelle, 20/20 abgeschlossene Kalibrierrunden, 0 Timeouts, 141 begrenzte Stat-Änderungen, 42 Arten final geändert. Vorher/Nachher mit neuer gleicher 100k-Stichprobe: mittlere absolute Abweichung vom Stufenmedian **6,953 → 6,346 Prozentpunkte** (4 → 3 große Ausreißer). Details und Einschränkungen in `ADAPTIVE_20X100K_20261105.md`. Wichtig: noch nicht als Hauptversion/APK freigeben; weitere Browser-/Story-/Android-Checks und GitHub-PR erforderlich. Keine 100 Millionen Kämpfe auf Verdacht starten.


> **NEUE BALANCING-RUNDE & 100K ZUFALLSKÄMPFE (05.11.2026):** Branch `feature/echo-balanced-random100k-20261105` auf Basis der gemergten PR #32. 10 schwächere Wesen durch kleine HP/ATK/DEF-Änderungen verbessert, Robbengeist II leicht reduziert. 135.000-Kämpfe-Kalibrierung: 0 Timeouts, Hasengeist II jetzt 42,80 %, Katzengeist II 40,53 % gegen gleiche Stufe, Robbengeist II 73,86 %. Danach 100.000 zufällige Doppelwesen-Kämpfe auf Laura: 50.191 Siege, 49.809 Niederlagen, 0 Timeouts; Gegenprobe auf GitHub folgt. Detailliert in `BALANCE_RANDOM100K_20261105.md`. Originalarbeitskopie nicht ändern; PR erst nach vollständiger CI mergen. Weitere Balanceausreißer kontrolliert und separat prüfen.


> **NEU 05.11.2026: Taktische Zusatzeffekte als eigener PR-Zweig** `feature/echo-status-effects-20261105` auf Basis `a3d2886` (PR #28 inklusive gemergter Browser-Korrektur PR #30). 12 ausgewählte Attacken können Brand, Frost/Schock/Verwirrung (Schaden -20 %), einmaligen Schutz (-35 %) oder kurze Regeneration auslösen. Neuer statusisolierter Mechaniktest (46/46 lokales Node-Paket bestanden), tatsächliche Canvas-Attackenwahl im Desktop/Touch-Browser getestet; Battle Lab unterstützt nun alle 150 Wesen. Eigene GitHub-CI und natürliche Gesamtkampagne nach PR-Erstellung kontrollieren, bis dahin nicht in `main` mergen. Details in `COMBAT_STATUS_EFFECTS_20261105.md`. Alte Nutzerdateien im ursprünglichen Worktree nicht anfassen.


> **AKTUELL 05.11.2026, neues Elementsystem:** Die Änderungen in `feature/echo-dual-type-system-20261105` führen 12 Elemente, 150 Typzuweisungen, 40 weitere Attacken, 12 einmalig erspielbare Runen, vier ausrüstbare Angriffe, dauerhaftes Attackenbuch, Element-Effektivitäten und Teamwechsel ein. PR #27 wurde bereits am 05.11. in `main` gemergt; alte Hinweise unten zu einem noch offenen PR #27 sind historisch. Lokal nach Level-Up-Meldungsfix: 45/45 Node-Tests, Desktop/Touch-Typ- und Runen-Browser-QA erfolgreich. **Nächstes:** Feature-PR und vollständige natürliche Kampagne ab leerem Save in GitHub-CI kontrollieren. Nicht in der uncommitteten Original-Arbeitskopie ändern. Noch keine neue APK, keine behaupteten Geräte- oder menschlichen Spieldauertests.

**Verbindlicher Projektstand:** [ECHO_CHRONIKEN_UEBERGABE.md](../../../ECHO_CHRONIKEN_UEBERGABE.md) (05.11.2026). **PR #25 (natürliche Vollkampagne) und PR #26 (Touch-Fix + Stress) sind mit grüner GitHub-CI in `main`**, aktuell `9bb1d94`. **Neu:** Der isolierte Branch `feature/echo-combat-balance-20261105` korrigiert vier frühe Wesen, macht späte Bosse nur bei zwei gesunden Begleitern stärker und testet zwei vollständige 150-gegen-150-Kampfmatrizen mit insgesamt **270.000 Engine-Kämpfen** plus zwölf Kalibrierungen und den kompletten natürlichen Storylauf. Details in `BALANCE_MATRIX_20261105.md`. **Noch nicht gemergt!** Erst nach grünem Cloud-Test und natürlichem Desktop-/Touch-Abschluss integrieren. Menschliche Spielzeit und echte Android-/TV-Geräte bleiben offen. Grafik später.

## 05.11.2026: VOLLSTÄNDIGE KAMPFMATRIX UND BALANCE-RUNDE

- `feature/echo-combat-balance-20261105` auf `main` nach PR #26; ursprüngliche Nutzerdateien nicht verändert.
- 150 Arten × 150 Arten × 3 Level × 2 RNG-Folgen **zweimal** mit anderen Leveln und Seeds durchgespielt: 135.000 + 135.000 echte Kampf-Engine-Ausgänge, keine Hänger. Miora gegen Gleichstufige von 49,29 % auf 82,98 % (Standard) / 71,10 % (zweite Matrix), Seelara von 57,2 % auf 82,2 % / 85,23 %. Flammenfuchs I und Flammenhase I vorsichtig verstärkt. Alle Werte in `BALANCE_MATRIX_20261105.md`.
- Späte Zweierteam-Bosse gezielt auf HP 1,26 und Angriff 1,33 angepasst, **nur mit zwei ausreichend gesunden Wesen**, frühe Bosse und Solo-Teams bleiben unverändert. 12 × 4.800 Parameter-Sweep-Duelle: mit guter Taktik ohne Tränke 87/160 Siege nach Balance statt 160/160 zuvor; mit zwei Heiltränken 160/160. Neuer Guardrail-Test `boss-adaptive-balance.cjs`.
- Neuer Cloud-Workflow `echo-balance-matrix.yml` wiederholt beide 150-gegen-150-Matrizen. Zusätzlich muss `echo-natural-campaign.yml` die komplette Story einschließlich Postgame erneut bestehen. Gameplay-Fix erst nach grüner CI mergen.

## Historisch: 04.11.2026, INTENSIVTEST NACH PR #25

- Grundlage: vollständige natürliche Spielkampagne bis Postgame in `main` (`895ad35`); keine Rücksetzung auf frühere Kapitel.
- 41/41 Node-Regressionsprüfungen, 60 Karten mit 123 sicheren Spawns, 310 Wegen, 117 Rückreisen, 144 echten Archiv-Fängen, 11 Smartphone- und Querformatgrößen erfolgreich.
- **Gefundener und behobener Bug:** virtuelle Touch-Buttons überlappten das Spielfeld bei 320×480 und mehreren Querformatgrößen. CSS-Media-Queries sichern nun Seitenabstand und oberen Portrait-Abstand. Testskript `project/qa/responsive-stress.py` prüft auch Orientierung während des Spiels. Kein grafischer Stilwechsel.
- **Kampfdiagnose:** `project/tests/human-battle-stress.cjs` absolvierte 4.800 echte Engine-Duelle mit Anfänger-/Experten-Eingaben. Alle geprüften Zweier-Teams gewannen die späten Bosse sogar ohne Heiltränke; schwache Soloteams scheiterten teils. Noch **keine pauschale Boss-Verstärkung**, erst diverse menschliche Spielertypen vergleichen.
- Zusätzlich testet `project/qa/gamepad-mapping-stress.py` den Chrome-Gamepad-Eingabepfad mit simuliertem Switch-Layout (A, B, Plus, D-Pad): **6/6 bestanden**, keine reale Hardwareprüfung. Neuer GitHub-Workflow `echo-stress-tests.yml` führt die Tests zusätzlich in der Cloud aus; Ergebnisse und Limits stehen in `INTENSIVE_QA_20261104.md`. Echte Android-/TV-/Controller-Geräte und menschliche Spielzeit bleiben ungeprüft.

## Historisch: 04.11.2026, durchgehender natürlicher Kampagnentest

- **Neuer Zweig:** `feature/echo-full-natural-campaign-20261104` auf Basis von PR #24 in `main` (`5864d79`). Keine Änderungen am ursprünglichen Benutzer-Worktree.
- **Neue Playwright-Tests:** `project/qa/natural-chapter6-7.py`, `natural-chapter8-10.py`, `natural-chapter11-14.py` erweitern die tatsächlich erspielten Saves der bereits in `main` liegenden Kapitel-1–5-Testkette. Die realen Level, EP, Fangwesen, Tränke und Questflags werden ohne Änderungen an den nächsten Browser übergeben.
- **Lokal Chrome 157 vollständig durchgespielt, Desktop und Touch:** Kapitel 6–7 (4 echte Pflichtbosse je Ansicht), Kapitel 8–10 (2 Bosse und friedlicher Ringhüter), Kapitel 11–14 (3 zweistufige Pflichtbosse), Abspann, alle sechs Postgame-Gebiete, drei optionale Bosse, Museum, Gartenfest. Zusammen mit dem in `main` liegenden Anfangstest ergibt das je einen vollständig **natürlich erspielten** Save von Oma bis zum Postgame (Desktop **3.602**, Touch **3.642** Schritte; jeweils 19 echte Trainer-/Boss-Siege, 33 Reloads, null JS-Ausnahmen). Die Tests verwenden gelernte starke **offensive** Attacken statt den ab Level 11 in Slot 0 liegenden Heilzauber dauerhaft auszulösen; Heiltränke werden über normale Menüs verbraucht.
- **Dokumentation:** `NATURAL_FULL_CAMPAIGN_QA.md` mit vollständiger Methodik, Ergebnisbericht, Balancingkurve und Restarbeiten. Browser-Screenshots und tatsächliche Save-Dateien bleiben QA-Artefakte; GitHub-Workflow `.github/workflows/echo-natural-campaign.yml` führt jetzt **alle fünf** Teiltests hintereinander aus.
- **Offen:** GitHub-CI/PR-Abnahme, physische Android-/TV-/Switch-Controller-Tests sowie Messung der menschlichen Spielzeit und Schwierigkeitskurve. Keine Grafikarbeit, keine neue APK in diesem Zweig.

## 04.11.2026: NATÜRLICHER SPIELSTART BIS KAPITEL 4

- PR #23 mit den zweistufigen Kapitel-11/13/14-Bossen ist in `main` integriert (Merge `6da8783`). **Jetzt keine weitere unbegründete Bosserhöhung**.
- Neuer echter, durchgehender Browser-Test von **leerem Speicherstand**: Oma, Paket/Miora Level 5, Liora, 3 Lichter, echte Wildkämpfe und Wildfang mit Sphäre, Piko, Ruine, Kapitel 3 mit Pumpwerk/Boss und Kapitel 4 mit A-C-B-Weichen, Zug, Kurier, Schattenwurzel. Keine Test-Flags, keine geschenkten Monster, keine simulierten Siege.
- Seeded Desktop/Touch mit unveränderten Fang-/Schadensregeln: 553 / 593 Schritte, je 5 reale Trainer-/Bosskämpfe, je 1 Wildfang, 9 Save-Reloads, 0 Niederlagen. Beide Spielstände erreichen Kapitel 4 abgeschlossen mit Miora auf Level 9 und einem zweiten Wesen auf Level 6.
- `project/qa/natural-opening.py` liefert `docs/visual-audit/natural-opening/report.json` und natürliche Kapitel-4-Saves als Testartefakte. Neuer Cloud-Workflow `.github/workflows/echo-natural-campaign.yml`. Siehe `NATURAL_CAMPAIGN_QA.md`.
- **Auch Kapitel 5 mit natürlich erspielten, unveränderten Kapitel-4-Saves geschafft:** `project/qa/natural-chapter5.py` fährt per Zug von Wurzelheim über Moorglas nach Stillwasser, löst Archiv, Turm, Spiegel- und Lyra-Boss. Desktop und Touch jeweils 310 Schritte, 27 Interaktionen, 16 Attacken, 4 Reloads; Kapitel 5 abgeschlossen, Miora Level 11, je 5 Heiltränke übrig nach Verbrauch von 8 Tränken. Bericht `../visual-audit/natural-chapter5/report.json`; natürliche Kapitel-5-Saves zur weiteren Fortsetzung.
- **Noch nicht geschafft:** Echter natürlicher Spielstand von Kapitel **6 bis 14/Postgame**, reale Gesamtspielzeit und Gerätetests. Priorität: diesen gespeicherten Fortschritt weiterverwenden und wirkliche Level-/Heilökonomie und mögliche Softlocks untersuchen. Keine Grafikarbeit.

## 04.11.2026: ECHTE BOSS-PHASEN IM BALANCE-ZWEIG
- PR #22 ist in `main` integriert. Neuer isolierter Zweig `feature/echo-natural-balance-20261104`: die Bosskämpfe Varek (Kapitel 11), Schachtwache (Kapitel 13) und Varek-Finale (Kapitel 14) enthalten einen abgeschwächten Vorboten, bevor der eigentliche Hauptboss erscheint. Sieg-/Story-/Save-Flags bleiben bis zum letzten Gegner gesperrt. Bestehende Einphasen-Bosse unverändert.
- 960 deterministische Vergleiche mit echter Kampf-Engine für ein/drei Teammitglieder und Normallevel/acht Level tiefer, dokumentiert in `../visual-audit/battle-balance/late-roster-balance-report.json`. Keine Behauptung über den natürlichen Fortschritt vom Spielstart.
- Neuer Regressionstest `project/tests/late-boss-phases.cjs` validiert korrekte Gegnerreihenfolge, Skalierung, einmalige Finalbelohnung **sowie Niederlage und erneuten Versuch im zweiten Kampfabschnitt**. Erneuter realer Desktop-/Touch-Browserlauf mit den neuen Phasen: 2.946 Schritte, 121 Attacken, 20 Reloads, kein JS-Fehler. Auf Laura wurden 41/41 Node-Tests und die Story-Dokumentation grün geprüft.

## 04.11.2026: KAPITEL 11–14, FINALE, POSTGAME UND BALANCE
- **Neuer Entwicklungszweig:** `feature/echo-ch11-14-balance-20261104`, isolierter Worktree. Kapitel 11–14, Abspann und volles Postgame wurden in Chrome 157 mit echten Tastatur-/Touch-Eingaben erfolgreich gespielt: **2946 Schritte, 176 Dialoge, zwölf Boss-Siege, 20 Reloads, keine JavaScript-Ausnahme**. Bericht: `CHAPTER11_14_REAL_QA.md`, Test: `project/qa/real-chapter11-14.py`.
- Übernommene, durch `battle-potions.cjs` abgesicherte Trankkorrektur: 36 KP oder 30 % Max-KP, keine Verschwendung bei vollen KP, Reisemenüheilung wird gespeichert.
- Reale Kampf-Engine geprüft: 400 frühe Wildduelle und 600 späte 3er-Team-Duelle, letztere sämtlich gewonnen ohne Trank, daher möglicherweise zu leicht. Diagnose: `BALANCE_PASS_20261104.md`.
- **Grenze:** Vorbereiteter Kapitel-10-Spielstand und Lv.55-Quest-QA-Team statt natürlichem Spiel ab Oma. Original-Worktree mit Nutzeränderungen und signierte APK bleiben unangetastet; keine Grafikarbeit, kein stündlicher Wächter.

## 04.11.2026: KAPITEL 8-10 UND MOBILES UI
- Ein fortlaufender Testspielstand ab Kapitel 7 wurde mit echten
  Desktop- und Touch-Eingaben durch Kronenstadt, Frostgrat und die
  Unterstadt bis zum Sternenpfad (Kapitel 11) gespielt.
- Unabhaengige lokale Chrome-157-Abnahme: 675 Schritte,
  45 Dialoge, 2 echte Bosssiege und 6 Speicher-Reloads pro Ansicht;
  zusammen 1350/90/4/12, ohne JavaScript-Fehler.
- Die friedliche Ringhueter-Loesung in Kapitel 10 wurde ohne
  simulierten Sieg durch tatsächliche Dialogentscheidungen erreicht.
- Sichtbarer mobiler UI-Fix: Buttons auf 360-450px schmalen
  Handybildschirmen werden nicht mehr abgeschnitten, sondern
  zweizeilig dargestellt. Spielbild harmonischer positioniert.
  Drei Viewporttests (360x640, 390x844, 412x915) erfolgreich.
- Neuer GitHub-CI-Test real-chapter8-10.py sowie mobile-layout-check.py.
  Details, Grenzen und Screenshots: CHAPTER8_10_REAL_QA.md.
- Neue Android-Buildnummer 0.29.0/versionCode 30 fuer die
  sichtbare UI-Korrektur vorbereitet. APK erst nach erfolgreichem
  Main-CI und Signaturpruefung als veroeffentlicht melden.
- Keine Aenderung an App-ID, Save-Schema oder Monster-IDs.
  Entwicklungswaechter bleibt deaktiviert.

## KAPITEL 6 UND 7: ECHTE SPIELEINGABEN (04.11.2026)
- Der neue Test `project/qa/real-chapter6-7.py` steuert einen einzigen
  Spielstand ab abgeschlossenem Kapitel 5 mit Tastatur und Touch
  durch beide Kapitel bis Kronenstadt (Kapitel 8).
- Unabhaengig lokal in isoliertem Worktree mit Chrome 157 geprueft:
  582 Schritte, 38 Dialoge, 4 Bosssiege je Viewport, zusammen
  1164 Schritte und 8 Bosssiege ohne JavaScript-Fehler.
- Arbeiterrettung, Reihenfolge der Druckregler, Edda, Schmelzmeister,
  Ofenkern, drei Namensrituale, Archiv, Jaeger, Steinraetsel,
  Namensschatten, Belohnungsschutz und Save-Reload erfolgreich.
- Details und Testgrenzen in `CHAPTER6_7_REAL_QA.md`. QA-Level 55,
  daher kein Test fuer normales Anfaenger-Balancing, keine Android-
  Hardware und kein vollstaendiger Spielstart ab Kapitel 1.
- PR #19 erfolgreich in main (Commit cf78d1e). GitHub-Cloud-Run
  41849768150 auf Chrome 156 SUCCESS, zusaetzlich alle Node- und
  Doku-CI-Checks SUCCESS. 18 Bilder und JSON-Bericht im Cloud-Artefakt.
- GitHub-CI-Ausloeser im Browser-Workflow erweitert. Android 0.28.0,
  App-ID, Signatur, SaveSchema und 150 Wesen unveraendert.

## ECHTER KAPITEL-5-DURCHLAUF IN CLOUD UND AUF LAURA - 04.11.2026
- PR #18: project/qa/real-chapter5.py fuehrt das komplette Kapitel 5
  ab einem erledigten Kapitel-4-Spielstand ueber echte
  Tastatur- und Touch-Eingaben aus. Kartenkollisionen dienen
  nur der Wegplanung, nicht der direkten Teleportation.
- GitHub-Run 41846368280: Browser-Cloud-Workflow SUCCESS auf Chrome 156.
  Zweiter unabhängiger Lauf im isolierten Laura-Worktree:
  Chrome 157 PASS, Python-Syntaxpruefung ebenfalls erfolgreich.
  Urspruenglicher, dirty Git-Arbeitsordner nicht angefasst.
- Pro Viewport 280 echte Laufschritte, 26 Interaktionen, zwei
  tatsaechlich besiegte Bosse (Gedaechtnisspiegel, Lyra),
  sieben Attacken, zwei Zugfahrten und vier Save-/Reload-Checks.
  Desktop+Touch: 560 Schritte, 52 Dialogaktionen, vier Boss-Siege,
  14 Attacken, vier Zugfahrten, 8 Save-/Reload-Checks.
- Geprueft: Moorglas -> Nebelpfad -> Stillwasser; versiegelter Turm;
  drei Dorfbewohner jeweils zweimal befragen; Bibliotheksgang vor
  Lyra gesperrt; drei Archivbelege, Reload mitten im Archivraetsel,
  Lyra-Einwilligung, Turm, Spiegel erst nach Stromtrennung besiegbar,
  freiwilliges Duell mit Lyra, Antenne deaktivieren, Kapitelabschluss,
  einmalige Auszahlung 5 Sphaeren/3 Traenke, Bahn nach Moorglas und
  zurueck. Kein JS-Fehler. 16 neue Screenshots mit JSON-Bericht.
- Visuelle Sichtung auf Laura: Welt und Kampf darstellen korrekt,
  aber grobe Pixelart und grosse freie Flaechen im Touchlayout
  gehoeren zum spaeteren Artwork-/UX-Feinschliff.
- Grenzen: Test beginnt nach Kapitel 4 mit bewusst starkem
  Level-55-Team. KEIN Balance-Test fuer Neulinge und kein
  lueckenloser Gesamtdurchlauf ab Kapitel 1. Echte Android-Hardware
  nicht getestet; Browser-Pruefung ist keine APK-Verifikation.
- Nur Test und Dokumentation, kein geaenderter Spielcode.
  Android v0.28.0/versionCode 29, App-ID, Signatur und SaveSchema
  bleiben unveraendert. Stunden-Waechter bleibt ausgeschaltet.

## ECHTER KAPITEL-4-DURCHLAUF MIT CLOUD-BROWSER - 04.11.2026
- PR #17: project/qa/real-chapter4.py bedient Desktop-Tastatur und
  Handy-Touch direkt im realen Spiel, ohne Laura oder Codex.
  GitHub Browser-Lauf 41743136449 SUCCESS; Node-Tests SUCCESS.
- Pro Viewport: 188 echte Lauf-Schritte, 17 Dialogaktionen, zwei echte
  Bosskaempfe (Kontinuum-Kurier und Schattenwurzel) und vier Bahnfahrten.
  Gesamt Desktop + Touch: 376 Schritte, 34 Dialoge, vier Boss-Siege,
  acht Bahnfahrten; keine JavaScript-Ausnahmen. Die Anzahl der
  notwendigen Attacken schwankt durch zufaelligen Kampfschaden:
  im ersten CI-Lauf 6/6, im zweiten 5/6 pro Viewport.
- Geprueft: Zugang aus Wurzeltunnel in Bahnhof Wurzelheim,
  Zug vor Weichenraetsel gesperrt, falsche Weiche B abgewiesen,
  Weichen A-C-B via echten Spieltasten aktiviert, zweimalige C-Wahl
  fuehrt nicht zu doppeltem Fortschritt, Speichern/Neuladen mitten
  im Raetsel, Zugfahrt nach Moorglas per echtem Bahnmenue,
  Schattenwurzel vor Kurier gesperrt, beide Bosse real besiegt,
  Zugrueckfahrt, korrekt abgeschlossene Quest, 6 Kugeln und
  3 Traenke genau einmal als Belohnung, zweiter Zug-Rundtrip ohne
  Belohnungsduplikation. Save/Reload an drei Checkpoints.
- Browserbericht und 18 Bildschirmbilder als GitHub-Artefakt
  echo-browser-checkpoints verfuegbar (7 Tage).
- Startzustand: Kapitel 3 ist bewusst schon abgeschlossen, Team ist
  fuer reproduzierbare Quest-Tests auf Level 55. Keine Aussage
  zur normalen Kampf-Schwierigkeit; kein lueckenloser Gesamtspiel-
  durchlauf und keine echte Android-Hardwareabnahme.
- Nur QA und Dokumentation; Android bleibt 0.28.0/versionCode 29,
  keine Aenderung von App-ID, IDs, SaveSchema oder Signaturschluessel.
  Naechste Stufe: Kapitel 5 mit echtem Laufen, Dialograetsel und Boss.

## ECHTER KAPITEL-3-DURCHLAUF OHNE LOKALEN PC - 03.11.2026
- PR #16: project/qa/real-chapter3.py nutzt im echten Chrome-Browser
  Desktop-Tastatur und Handy-Touch. Alle Spielaktionen laufen ueber
  die offiziellen Eingabebefehle. Die Map-Tiles dienen ausschliesslich
  zur pfadfindenden Wegplanung, NICHT zum Teleportieren.
- GitHub-Run 41725799619: SUCCESS. In jedem Viewport 142 tatsaechliche
  Schritte, 14 Dialoginteraktionen, 2 echte Kampfattacken;
  zusammen 284 Schritte, 28 Dialoge und 4 Angriffe.
- Gepruefter Ablauf: verschlossenes Pumpwerk, Lotsin Sera und drei
  Zeugen, Pumpwerk freischalten, Kontrollraum vor dem Raetsel gesperrt,
  Strom/2 Ventile/Rotor aktivieren, Kontrollraum betreten, Archiv vor
  dem Boss gesperrt, Pumpenwaechter in echtem Kampf besiegen, Aufnahme
  lesen, einmalige Belohnung, speichern/neuladen und den Zugang zum
  Kapitel-4-Wurzeltunnel tatsaechlich durchqueren.
- Zusatzauswertung: Chrome 156, keine page errors, 8 neue
  Kapitel-3-Bilder (Hafen, Pumpwerk, Kampf, Kapitel-4-Einstieg
  je Desktop und Touch), Artefakt echo-browser-checkpoints.
- Grenzen: Start aus einem synthetischen **freigeschalteten Hafen-Save**,
  NICHT aus dem Spielstart (Kapitel 1-2). Fuer reproduzierbare Quest-QA
  ist das Test-Team absichtlich stark (Level 55): keine Aussage ueber
  die Schwierigkeit des Bosskampfs mit einem normalen Level-9-Team.
  Restliche Story Kapitel 4-14 noch nicht Schritt fuer Schritt gespielt.
- Nur Cloud-Test/Workflow/Dokumentation; keine Aenderungen am
  Spielcode, Android versionCode 29, Save-Schema, IDs oder Signatur.
  Laura aus, kein Codex, keine stündlichen Jobs.

## DURCHGAENGIGER QUEST-REGRESSIONSTEST 03.11.2026
- GitHub-only, isolierter PR #14, ohne Laptop Laura, Codex oder Hintergrundwaechter.
- Neuer project/tests/continuous-campaign.cjs verwendet EINEN Spielstand von
  Kapitel 3 ueber Kapitel 14, Abspann und das vollendete Postgame.
  CI nach erstem gefundenem fehlenden Dialogschritt (Kapitel 10:
  Zeugnis vorzeigen UND den Waechter nochmals ansprechen) erfolgreich.
- Gemessene Abdeckung: 91 echte Registry-Portalreisen, 189 Quest-/Dialog-
  Interaktionen, 17 simulierte Boss-Siegereignisse, 12 Kapitel-Save-
  Roundtrips, 9 Zwischenquest-Save-Migrationen und 12 Pruefungen
  gegen mehrfach vergebene Quest-Belohnungen mit stabilen Party-, Archiv- und Fang-IDs, alle 12
  Kapitelabzuege und Postgame-Abschluss. Der Test nutzt bestehende
  Kapitelmodule, Gates und Quest-Callbacks, keine direkt gesetzten
  Kapitelabschluss-Flags.
- GRENZEN: Kapitel 1-2/Intro/Ruine sind als bereits erledigte
  Startvoraussetzung gesetzt, werden separat durch bisherige Tests
  prueft. Wege werden ueber MapRegistry.travel statt echte Schritte
  durchlaufen; Boss-Siege ueber victory-Callbacks statt echter
  Kampfauswahl. Daher KEIN vollstaendiger menschlicher Spieldurchlauf
  und keine Android-Hardwareabnahme.
- Naechste Etappen: diese Luecken gezielt als Browser-End-to-End-Szenarien
  schliessen; Aufmerksamkeits-Prioritaet fruehes Spiel und Verstaendlichkeit
  der Quest-Hinweise. Release v0.28.0 unveraendert.

## VERIFIZIERTER RELEASE 02.11.2026 - Echo-Chroniken 0.28.0
- Gameplay-PR #10 gemergt in main mit Commit
  9b3258860dc4262090e8bcb60f4b57ca9b672110.
- Erfolgreiche Main-GitHub-Actions: Spieltests 41532799344 SUCCESS,
  Dokumentvalidator 41532799280 SUCCESS, signierte Android-APK
  41532799303 SUCCESS.
- Android 0.28.0, versionCode 29; stabile App-ID
  de.echochroniken.game.stable und gleicher Signaturzertifikat-SHA256
  84be81f8472b62b59527e4fcf67b19fa7d2e3ef4c0b05069c60139a45ec8ec87
  wie bei 0.27.0. GitHub-CI hat apksigner verify und aapt bestanden.
- APK 2.508.038 Bytes; SHA256:
  c7596f8049309cd229613e2e2574b456b677d68d74551306124d09a8963db34e.
  Release-URL: https://github.com/Graf-Git-Hub/Pok-mon_Klon/releases/download/android-latest/Echo-Chroniken-Universal.apk
  Der GitHub-Asset-Digest, Direktdownload auf Laura und Hash der
  aktualisierten Desktop-APK stimmen exakt ueberein.
  Vorversion 0.27.0 als Backup im TEMP-Ordner gesichert.
- 35/35 lokale Node-Tests, 2700 deterministische Einzelduelle,
  elf Chrome-156-Screenshots (Story und Kampf, Desktop/Touch),
  Android-Plattformtest, Dokumentvalidator und git diff --check
  erfolgreich; kein echter kompletter Gameplay-Durchlauf.
- Originaler Nutzer-Worktree mit uncommitteten Dateien blieb
  unberuehrt; keine Installation auf Android-Handy oder TV.
- Naechstes: Spielfluss/Bosskampf mit Items und Teamwechsel,
  echter Voll-Durchlauf, Android-Hardware, Animationen, Audio,
  Barrierefreiheit. Entwicklungswaechter bleibt ausgeschaltet.

## BALANCE-FORTSETZUNG 02.11.2026 - Reserveteam und Bossprofile
- Branch feature/echo-balance-pass-20261102, isolierter Worktree auf Laura.
  Vorherige Heil- und Niederlagen-Reparaturen aus eb6104a beibehalten.
- EP nach besiegtem Gegner: aktives Wesen bekommt weiterhin 100% der
  urspruenglichen Belohnung, andere kampffaehige Teammitglieder teilen
  einen zusaetzlichen Pool von 40%; bewusst keine EP fuer besiegte
  Begleiter oder Wesen im Archiv. Kein neues Save-Feld, keine ID-Aenderung.
  Levelaufstiege, permanente Attacken und Entwicklungen funktionieren
  nun auch bei passiven Teammitgliedern.
- Spaete Schluesselbosse (Endgame Kapitel 11, Finale, Postgame) haben
  jetzt 90% der normalen Monster-KP und 95% Angriffsskalierung;
  fruehe Bosse behalten 78% KP und 80% Angriffsskalierung.
- Real-Engine-Boss-Audit: 27 Team-/Level-Szenarien mal je 100 deterministische
  Einzelduelle = 2700. Drei Teamtypen fuer Kapitel 14, bis zu 10 Level
  Rueckstand. Alle neun Szenarien auf Zielniveau gewinnbar im Audit.
  Simulation ist KEIN vollstaendiger Spieldurchlauf, nutzt stets die
  staerkste verfuegbare Attacke, keine Item-/Tausch-Strategien.
- Neue Tests: project/tests/reserve-experience.cjs und
  project/tests/boss-balance.cjs. Reproduzierbarer Report:
  docs/visual-audit/battle-balance/boss-balance-report.json.
- Echte Chrome-156-Browser-QA: project/qa/battle-browser.py startet einen
  Arenakampf auf Desktop (Tastatur) und Mobilansicht (Touch), prueft
  Angriff, Gegenangriff und nimmt vier Screenshots auf.
  Kein JavaScript-Fehler bei beiden Laeufen.
- Abschluss dieser lokalen Runde: 35/35 Node-Tests, Android-Plattformtest,
  Dokumentvalidator und git diff --check bestanden. Chrome 156 hat vier
  Kampfaufnahmen und sieben Story-/Touch-Aufnahmen ohne JS-Fehler geprueft;
  die Bilder wurden visuell kontrolliert.
- Vollstaendiger manueller Storydurchlauf, Boss-Taktik mit Gegenstaenden,
  Android-Geraete und individuelles Kunst-/Audiopolishing weiterhin offen.
  Android v0.28.0/versionCode 29 noch nicht als signierter Release bestaetigt.

## BALANCE-QA 02.11.2026 - Heilzauber und sichere Niederlage
- Getrennter Worktree Echo_Balance_Pass_20261102 auf origin/main 06bccc2;
  Original-Hauptarbeitsbaum und geschuetzte Dateien nicht bearbeitet.
- Kampf-Fehler in project/src/game.js behoben: Heilzauber des Gegners
  verursachen keinen Phantomschaden mehr. Feinde heilen unter 35% KP
  nur mit 30% Chance und hoechstens einmal pro Gegner, danach
  nutzen sie wieder echte Schadensattacken.
- Nach einer Team-Niederlage in spaeten Karten: Heilung und Rueckkehr
  zum sicheren Gebietseinstieg statt Zwangsrueckreise zu Oma.
  Anfangsgebiet behaelt die bekannte Oma-Rettung; 16 Schritte
  Begegnungsschutz, Questflags und Spielstand bleiben erhalten.
- Neue Engine-Regressionen: project/tests/battle-healing.cjs und
  project/tests/battle-defeat.cjs mit Heilung, Folgerunde,
  Local-Respawn und Legacy-Rettung.
- 33/33 lokale Node-Tests, Android-Plattformtest, Story-Dokumentvalidator,
  git diff --check erfolgreich; Chrome 156 QA: 7 Screenshots mit
  Desktop/412px Touch und Reload, keine JS-Ausnahmen, Bilder betrachtet.
- Stand dieser frueheren Runde: Gruppen-EP und Bossvergleich waren
  noch offen. Spaeter im Abschnitt BALANCE-FORTSETZUNG nachgeruestet;
  kompletter Storydurchlauf und echtes Handy/TV weiterhin offen.
  M07-03 bleibt IN_PROGRESS, nicht DONE.
- Fuer diese Gameplay-Aenderungen Android 0.28.0, versionCode 29
  vorbereitet. Release nur nach frischer GitHub-CI, apksigner,
  Paket-/Signaturvergleich und SHA256-Direktdownload.

## VERIFIZIERT 02.11.2026 - v0.27.0 signiert veroeffentlicht
- PR #8 merged, main-Commit ad3293ffb8ce11bcb3a8812af9820be359bd8b0e.
  GitHub-Actions auf diesem Merge: Tests 41490437926 SUCCESS,
  Docs 41490438433 SUCCESS, Android Release 41490437649 SUCCESS.
- Android versionName 0.27.0 / versionCode 28, stabile App-ID
  de.echochroniken.game.stable. apksigner verifiziert und Zertifikats-
  SHA256 84be81f8472b62b59527e4fcf67b19fa7d2e3ef4c0b05069c60139a45ec8ec87
  identisch zu v0.26.0.
- Direkt installierbares Release-Asset 2.507.202 Bytes, SHA256
  9b09cf4ab8f2ebf2ce46831abd3ecc2c23a03c68ba2172524cea9e7344204a83.
  GitHub Release-Digest und direkt heruntergeladene APK auf Laura
  exakt verglichen; Desktop-APK ersetzt und Hash nach Kopie geprueft.
  Vorgaenger v0.26.0 im TEMP-Ordner gesichert.
  URL: https://github.com/Graf-Git-Hub/Pok-mon_Klon/releases/download/android-latest/Echo-Chroniken-Universal.apk
- 50 visuell gepruefte Wesen-Namen und zwei neu gestaltete Finale-Szenen
  enthalten. 31/31 lokale Node-Tests, 10 Chrome-Screenshots ohne JS-Fehler,
  Android-Plattformtest und Dokumentvalidator bestanden.
- Originales Benutzer-Worktree bleibt auf HEAD 28867fd mit uncommitteten
  Benutzerbildern/Assets und wurde weder ueberschrieben noch geaendert.
  KEINE reale Installation auf Android-Handy/TV durchgefuehrt.
- Weiter offen: manueller Story-/Postgame-Durchlauf, Balance, Audio,
  restliche 100 Wesen-/Rueckansichten, Mobil/TV-Hardware, Accessibility
  und Lokalisierung. Entwicklungswaechter bleibt auf Benutzerwunsch AUS.

## QUALITAETSPAKET 02.11.2026 - 50 Monster-Namen und Finale-Pixelkulissen
- Isolierter Worktree C:/Users/graf8/Documents/GitHub/Echo_Quality_Pass_20261102,
  Zweig feature/echo-gameplay-quality-pass-20261102; Basis main 3cc1a7b8.
  Originaler Hauptarbeitsbaum mit uncommitteten Nutzerdateien unangetastet.
- Zwei vorher karge Szenen in src/maps/story-finale.js visuell ausgebaut:
  memory_room mit Familienbilder-Galerie, Musterteppich, Spiegel und
  Verschluss-Status; resonance_core mit gestuftem Maschinenring, Leitungen,
  animierten Lichtfarben und Gruenstatus fuer freiwillig befreite Anker.
  Alle Elemente zeichnen nur Pixel, keine Kollisionen, Portale, IDs oder
  Story-Flags wurden veraendert; Fortschritt ist visuell erkennbar.
- 50 zuvor generische Einzelwesen nach VISUELLEM Atlas-Review mit einzigartigen
  Namen und passenden Familienbezeichnungen versehen. IDs 1..150, Stats,
  Typen, Entwicklungsregeln und Save-Schema v2 unveraendert.
  Zwei Kontaktblaetter (je 25 Wesen) und das 50er Mapping stehen unter
  docs/visual-audit/monster-naming sowie MONSTER_NAME_REVIEW.json.
  MONSTER_DISTRIBUTION.csv und Validator synchronisiert (50 geprueft,
  null offene Platzhalternamen); Namen im echten Bestiarium ueberprueft.
- Neue Regressionen: tests/finale-landmarks.cjs und
  tests/monster-name-review.cjs. Browser-QA mit Chrome 156,
  Desktop + 412px Touch, 7 Quest-Checkpoint-Bilder,
  3 Bestiarium-Bilder, Save/Reload und JS-Fehlerpruefung.
  Weitere 100 Wesen-Grafiken und Hardware bleiben offen.
- Android-Releasekandidat 0.27.0 / versionCode 28; Paket-ID und
  private Signatur bleiben unveraendert. Kein Release ohne frische
  GitHub-CI-SUCCESS-, apksigner- und SHA256-Pruefung.
- Offen: kompletter manueller Storydurchlauf, reales Handy/Android-TV,
  Gameplay-Balancing, Audio/Animationen, Lokalisierung und Barrierefreiheit.

## QA 02.11.2026 - Story-/Postgame-Checkpoint-Regression (isolierter Zweig)
- Branch test/echo-story-postgame-softlock-20261102 auf origin/main 8a35ebe; Original-Worktree mit fremden Aenderungen unangetastet.
- Neuer Test project/tests/quest-save-checkpoints.cjs: 100 JSON-Save-/Migrations-Roundtrips, 58 Interaktionen, 3 atomar gesperrte Portale, verkehrte Reihenfolgen von Erinnerungen/Wiesentafeln, Kapitel 12-14 und Postgame, alle Boss-Siegflags und einmalige Belohnungen, archivierte Maternalis.
- Lokal 29/29 Node-Tests, Android-Plattformtest und Dokumentvalidator bestanden. Dies sind gezielte Regressionen, KEIN vollstaendiger manueller Spieldurchlauf.
- Browser-QA project/qa/quest-checkpoint-browser.py: Chrome 156, 5 echte Karten-Screenshots (4 Desktop, 1 Touch), Neustart/Reload, keine JavaScript-Fehler. Bilder und report.json in docs/visual-audit/quest-checkpoints.
- Visuelles Review: Karten funktionieren, aber insbesondere Erinnerungszimmer und Resonanzkern wirken noch sehr karg; Pixelgrafik/Lesbarkeit bleiben fuer spaetere Politur offen.
- Android-Version 0.26.0 / versionCode 27 und App-ID unveraendert; kein neues APK-Release fuer reine Tests.


## VERIFIZIERT 02.11.2026 - Android-Wiederholungsbuild nach PR #2
- PR #2 wurde als Commit 82663252c0ddd105e27dc703556fe1871983e4e8 in main integriert; der alte Android-Workflow startete auch bei einem reinen Test-Merge.
- Android-Run 41475017489 SUCCESS, aber unerwuenschte Wiederveroeffentlichung mit unveraendertem versionCode 27 / versionName 0.26.0.
- Neu gebautes APK-Asset: 2.505.606 Bytes, SHA256 92f1e61004385d5706458c46b37621e943be5b67fe25797945b2725578c40808.
- GitHub-Runner: apksigner v2 gueltig, Zertifikat-SHA256 84be81f8472b62b59527e4fcf67b19fa7d2e3ef4c0b05069c60139a45ec8ec87; Paket de.echochroniken.game.stable.
- Direktdownload und SHA256 auf Laura verifiziert, Desktop-APK auf den neuen Release-Hash aktualisiert; vorherige Datei im TEMP gesichert.
- Neue Release-Gate-Absicherung verhindert zukuenftige Neuveroeffentlichung ohne Erhoehung des Android versionCode. Echter Handy-/TV-Hardwaretest weiter offen.

## VERIFIZIERT 02.11.2026 - Android-Release-Schutz PR #5 in main
- Android-Workflow wird bei Pushes mit project/tests-Dateien ebenfalls gestartet; ohne Gate wuerde auch ein reiner Test-Merge die bestehende v0.26.0-APK neu publizieren.
- Neuer Gate-Schritt vergleicht versionCode zwischen github.event.before und aktuellem Commit; signieren/veroeffentlichen nur bei echtem Versionsanstieg.
- Pull Requests bauen weiterhin nur die Debug-APK; Tests/Dokumentpruefungen bleiben aktiv. Workflow-Dispatch publiziert nicht blind.
- Release v0.26.0 / versionCode 27 und App-ID/Signer unveraendert. Lokaler Git-Bash-Gate-Test bestanden: 27->27 ergibt release=false; simuliertes 27->28 ergibt release=true. PR #5 (Commit f4e5b5d) in main 940ebf479764e3dbbfb5abf7a16c28b022d2c5b6 gemergt.
- PR-CI Tests 41475643458, Docs 41475643602, Android-Debug 41475643433: SUCCESS.
- Main-CI Tests 41475844201, Docs 41475844379, Android 41475844213: SUCCESS. Android-Gate erfolgreich, Signieren/Release/Upload ausdruecklich SKIPPED.
- GitHub-Release-Digest und Desktop-APK bleiben 92f1e61004385d5706458c46b37621e943be5b67fe25797945b2725578c40808.

## QA 02.11.2026 - PR #2: Spawn-/Portal-Regression, Integration
- Neuer Regressionstest project/tests/map-spawn-reachability.cjs aus PR #2.
- Urspruenglich im isolierten Zweig auf 28867fd: 60 Karten, 123 sichere Spawns, 310 Wege zu Ausgaengen und 117 Portal-Rueckreisen.
- PR #2 wurde auf main f13ae6c2 konfliktfrei integriert und als Commit 82663252c0ddd105e27dc703556fe1871983e4e8 gemergt; Archiv v0.26.0 bleibt erhalten.
- Integrations-QA auf aktuellem main-Stand: 28/28 Node-Tests, Android-Plattformtest, Story-Dokumentvalidator und git diff --check bestanden.
- Echte Chrome-156-Screenshots (Desktop und 412px Touch) visuell geprueft; Archiv-Tausch, Autosave/Reload und Alt-Save-Migration ohne JavaScript-Fehler.
- PR-CI: Tests 41474802965, Docs 41474802856, Android-Debug 41474802861 alle SUCCESS.
- Der damals ungeschuetzte Android-Main-Workflow publizierte leider dieselbe v0.26.0 / versionCode 27 erneut; siehe verifizierten Wiederholungsbuild oben.
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
- PR #2 inzwischen integriert; naechste Prioritaet: Story-/Postgame-Quest-Softlocks und Save-Zustandskombinationen, danach 94 Nichtstarter-Grundarten, visuell gepruefte Pixelgrafik, Balance und echte Hardwaretests.

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
