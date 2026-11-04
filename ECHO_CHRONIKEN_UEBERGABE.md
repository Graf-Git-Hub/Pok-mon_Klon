# ECHO-CHRONIKEN — Verbindliches Projektprotokoll und Übergabe

**Stand: 04.11.2026, nach intensivem Stress- und UI-Test (Europe/Berlin)**
**Repository:** `Graf-Git-Hub/Pok-mon_Klon`  
**Spielordner:** `echo-chroniken/`  
**Hauptzweig nach PR #25:** `895ad351d50aeb7cfd776e424b90352d7fefeaf7`
**Wichtig für jeden neuen Chat:** **NICHT bei Kapitel 7 neu anfangen!** **PR #25 wurde mit grüner GitHub-CI in `main` gemergt:** Ein durchgehend natürlich erspielter Save wurde vom ersten Gespräch bei Oma bis Kapitel 14, Abspann und vollständigem Postgame auf Desktop und Touch getestet (3.602/3.642 Schritte, jeweils 19 echte Trainer-/Boss-Siege, 33 Reload-Checks und 0 JavaScript-Fehler). Neuer isolierter Branch `feature/echo-stress-20261104`: **4.800 zusätzliche reale Engine-Duelle** mit Anfänger-/Expertenstrategien sowie **11 Touch-Auflösungen einschließlich Live-Rotation**. Die Tests fanden sechs Layout-Konflikte vor CSS-Korrektur; danach 11/11 Bildgrößen fehlerfrei. **Das CSS-Fix und die zusätzlichen QA-Skripte liegen noch nur in diesem Entwicklungszweig** und brauchen GitHub-CI vor dem Merge. Die menschliche Gesamtspielzeit und echte Android-/TV-Hardware sind weiterhin nicht überprüft.

## Neuester Nachtrag: 04.11.2026, intensiver Stress-Test auf Laura

- **Basis:** `main` bei `895ad35`, PR #25 mit vollständiger natürlicher 1–14/Postgame-Kampagne erfolgreich integriert.
- **41/41 Node-Regressionen**, 60 Karten, 123 Spawnpunkte, 310 Routen, 117 reversible Portale, 144 tatsächliche Archiv-Fänge, 8 alte Saves plus defekter Save vollständig auf Laura geprüft. Bestehende vier Mobilbildgrößen ebenfalls erfolgreich.
- **Neuer Touch-Stress:** `project/qa/responsive-stress.py` prüft 11 Portrait-/Landscape-Auflösungen, A-/Menü-/B-Taps, sichtbare Bedientasten und Live-Drehung ohne Verlust des Spielzustands. **Ursprünglich 6 Größen mit Überlappungen**, behoben durch gezielte Media-Queries in `project/styles/main.css`; danach **11/11 erfolgreich**. Keine Änderung an Grafiken/Spielgeschichte.
- **Neuer Kampf-Stress:** `project/tests/human-battle-stress.cjs` führt **4.800** deterministische echte Engine-Duelle bei natürlich beobachteten Leveln 16/18/19/22 aus: 1/2 Wesen, 0/2/6 Tränke, 5 Strategien und 40 Seeds. Gewinnquoten: stärkste Attacke 100 %, erste Offensive 100 %, schwächste Offensive 87,5 %, zufällige Offensive 99 %, erster Moveslot 100 %. **Zweierteams ohne Tränke gewinnen unter diesen isolierten Bedingungen alle vier späten Szenarien:** Verdacht, dass späte Bosse zu leicht sind. Einzelwesen mit schwächster Attacke verlieren die drei Pflichtbosse ohne Tränke. Deshalb **keine pauschale Bossverstärkung ohne weitere menschliche/mehrfache Balancetests**.
- **Dokumentation:** `echo-chroniken/docs/game-design/INTENSIVE_QA_20261104.md`. CI-Workflow `.github/workflows/echo-stress-tests.yml` soll 4.800 Duelle und elf Bildschirmtests unabhängig auf GitHub wiederholen; die alte vollständige Story-CI bleibt. Original-Worktree und fremde Runner unangetastet.
- **Nicht belegt:** physische Android-/TV-Installation, echte Switch-Controller-Eingaben, reale menschliche Spielzeit und alle Alternativpfade. Die Änderung ist vorerst ein CSS-Fix plus Regressionstests.

## Historischer Nachtrag: 04.11.2026, natürlicher Gesamtdurchlauf bis Postgame

- **PR #24 in `main` integriert:** `5864d79`. Der bisherige natürliche Verlauf bis Kapitel 5 bleibt die unveränderte Eingangsgrundlage für alle weiteren Tests.
- **Vollständiger natürlicher Test auf Laura:** neuer Worktree/Branch `feature/echo-full-natural-campaign-20261104`; zusätzliche echte Eingabetests `project/qa/natural-chapter6-7.py`, `natural-chapter8-10.py`, `natural-chapter11-14.py`. Der nächste Browser übernimmt jeweils exakt den Save, den das Spiel im vorherigen Kapiteltest geschrieben hat. **Keine künstlich hochgestuften Wesen, Quests, Gegner oder Auswertungs-Callbacks**; Fang, XP, echte Siege, Tränke, Zugfahrt und Storyabschluss kommen aus der Spiel-Engine.
- **Bestanden in Chrome 157, Desktop und Touch:** alle **14 Kapitel, Abspann, sechs Postgame-Wiesen, drei optionale echte Kämpfe, Museum und Gartenfest**. Desktop 3.602 Schritte, Touch 3.642 Schritte, je **19 echte Trainer-/Boss-Siege**, je **33 Save-/Reload-Prüfungen** und **0 JavaScript-Ausnahmen**. Im späten Spiel wurden auch die drei zweiphasigen Pflichtbosse tatsächlich besiegt. Die frühere reine Level-55-Segmenttest-Lücke ist damit für diesen einen erfolgreichen Storypfad geschlossen.
- **Natur-Balancekurve:** Starter Miora beginnt Level 5, erreicht Level 11 nach Kapitel 5, Level 14 nach Kapitel 7, Level 16 nach Kapitel 10, Level 20 am Abspann und Level **22 nach Postgame** (beide Ansichten). Start zu Kapitel 6 nur fünf Tränke; dennoch Kapitel 6 und 7 abgeschlossen, Kapitel 10 mit elf Tränken und das Postgame mit **26 Tränken und 79/77 Sphären (Desktop/Touch)**. Verdacht auf großzügige Endspiel-Belohnungen bzw. einfache Kämpfe bei optimaler Attackenauswahl; **nicht** ohne weitere Anfängertests pauschal Bosse verstärken.
- **Neu:** GitHub-Workflow `echo-natural-campaign.yml` erweitert auf **alle fünf** aufeinanderfolgenden Browserabschnitte; Reports unter `echo-chroniken/docs/visual-audit/natural-*/report.json`, vollständige Methodik/Limitierungen in `echo-chroniken/docs/game-design/NATURAL_FULL_CAMPAIGN_QA.md`. **Dieser Teststand wurde in PR #25 bereits mit grüner GitHub-CI nach `main` gemergt.** Original-Worktree mit 25 nicht committeten Nutzeränderungen und andere Projekte bleiben unangetastet.
- **Nicht belegt:** menschliche Spielzeit über mehrere Stunden, alle Alternativwege und 150-Wesen-Sammlung, echte Android-/TV-/Switch-Controller-Bedienung, APK-Upgrade-Signatur oder neue grafische Qualität. Deshalb nicht als finale vollständig abgenommene Endnutzer-Version bezeichnen. Der aktuelle Branch ändert keine APK und keine Grafiken.

## Historischer Nachtrag: 04.11.2026, natürlicher Kampagnenbeginn bis Kapitel 4

- **PR #23 erfolgreich gemergt:** `6da8783`. Die zweistufigen Bosse in Kapitel 11, 13 und 14 sind nun im Hauptzweig; das bestehende Gameplay und die Storytests wurden zuvor auf Laura und GitHub geprüft. APK-/Signaturstand dieses Merges separat vom erfolgreichen Debug-Build behandeln.
- **Neue echte Kampagnenprüfung:** `echo-chroniken/project/qa/natural-opening.py` im isolierten Branch `feature/echo-natural-playthrough-20261104`. Start **ohne** eingebrachten Save oder künstlich gesetzte Fortschritts-Flags: Oma, Paket, Lv5 Miora, Lioras Lichtquest, echte Wildbegegnungen plus Fang mit Sphäre, Pikos freiwilliger Kampf, Ruine mit drei Siegeln und realem Wächter, Rückkehr zu Oma, Nebelhafen-Pumpwerk, Kapitel-3-Boss, Bahnweichen, Kurier und Schattenwurzel, beide realen Zugfahrten, Kapitel 4 beendet.
- **Reproduzierbarer Desktop-/Touch-Test (Chrome 157, echte Bedieneingaben):** Desktop **553 Schritte, 2 Wildbegegnungen, 1 Wildfang, 5 Trainer-/Boss-Siege, 9 Reloads, 0 Niederlagen**; Touch **593 Schritte, 3 Wildbegegnungen, 1 Wildfang, 5 Siege, 9 Reloads, 0 Niederlagen**. Natürlich erspielte Teams zum Ende jeweils Miora Level 9 plus zweites Wesen Level 6, unterschiedliche Sphären- und Heiltrank-Bilanzen. Separater unseeded-Desktoplauf ebenfalls bis Kapitel 4 erfolgreich; die optional feste Zufallsfolge verändert keine Fang- oder Kampfregeln.
- **Gesicherte natürliche Spielstände** lassen sich als Testartefakte am Kapitel-4-Ende wieder aufnehmen. Dokumentation und Grenzen: `echo-chroniken/docs/game-design/NATURAL_CAMPAIGN_QA.md`; Bericht: `echo-chroniken/docs/visual-audit/natural-opening/report.json`. Neuer GitHub-Workflow `echo-natural-campaign.yml` testet denselben Pfad auf GitHub, Laura kann parallel testen. Kein Eingriff in den Originalordner mit fremden Änderungen.
- **Kapitel 5 aus demselben echten Spielstand ebenfalls erfolgreich (Desktop und Touch):** Im neuen `project/qa/natural-chapter5.py` wird der tatsächlich erspielte Kapitel-4-Save **unverändert geladen**. Der Spieler fährt per realem Zug nach Moorglas, löst Stillwasser-Archiv, Turm, Spiegel und Lyra über echte Eingaben und erreicht den Bahnhof Stillwasser mit abgeschlossenem Kapitel 5. Je Ansicht 310 Schritte, 27 Interaktionen, 16 echte Attacken, 4 Speicher-Reloads. Miora **Level 11**, zweites Wesen Level **7/8**. **8 Heiltränke verbraucht**, noch **5 vorhanden**, weshalb Kapitel 6 die nächste Belastungsprobe ist. Report unter `echo-chroniken/docs/visual-audit/natural-chapter5/report.json`, natürliche Kapitel-5-Saves als Testartefakte.
- **Noch offen:** Kapitel **6–14** und Postgame mit normalem XP-/Teamlevel, Heiltränken, Fangwahrscheinlichkeiten und echten Niederlagen-/Erholungswegen. Die Gesamtspielzeit ist nicht gemessen. Grafik bleibt zurückgestellt.

## Nachtrag: Prüfungen bestanden, neue Balance-Verbesserung in separatem Zweig

- **PR #22 wurde in `main` übernommen** (Merge `7424301`). GitHub-CI (Node, Dokumentation, Android-Debug und Browser) war vor dem Merge vollständig grün; Lauras unabhängiger Desktop-/Touch-Volltest ebenfalls: **44/44 lokale Prüfungen erfolgreich**.
- Neuer isolierter Arbeitszweig `feature/echo-natural-balance-20261104` arbeitet nach `main` an den drei großen Pflichtbossen: Kapitel 11 **Varek**, Kapitel 13 **Schachtwache** und Kapitel 14 **Varek-Finale** erhalten je ein schwächeres Einstiegs-Echo vor dem Hauptgegner. Das ist **keine** kosmetische Änderung. Die bisherigen Boss- und Quest-IDs sowie der Speicherstand bleiben kompatibel. Ein Sieg wird erst vergeben, wenn beide Kampfphasen gewonnen sind.
- **960 echte Engine-Duelle** mit festen Zufallsseeds vergleichen eine gegen zwei Kampfphasen, Teams mit einem oder drei Wesen sowie Normallevel / acht Level darunter. In dieser definierten Konfiguration (sechs Heiltränke) gab es keine verlorenen Duelle; durchschnittliche Kampfzeit stieg von etwa 7–8 auf 10–13 Runden und benötigte ca. 1–2 Heiltränke. Noch **kein natürlicher Vollspieldurchlauf**. Regressionscode: `project/tests/late-boss-phases.cjs`, `project/tests/late-roster-balance.cjs`; Report: `docs/visual-audit/battle-balance/late-roster-balance-report.json`.
- Die erneute reale Chrome-157-Gegenprobe mit **neuen zwei-Phasen-Bossen** bestand vollständig: Desktop plus Touch, 2.946 Schritte, 176 Dialogaktionen, **121 Angriffe**, zwölf Boss-Begegnungen (davon drei pro Ansicht mit zwei Phasen), 20 Reloads und **null JavaScript-Fehler**. Außerdem wurde eine **Niederlage im zweiten Kampfabschnitt mit Neustart** als Regression getestet: kein vorzeitiger Storyabschluss oder Belohnungs-Callback. Report aktualisiert: `docs/visual-audit/real-chapter11-14/report.json`.
- Die bisherige Balancemessung für **Einzelbosse** bleibt als historischer Vergleich erhalten. Release-Build und Android-Signatur bitte erst nach Tests des neuen PR und Build-Prüfung als aktuell bezeichnen. Die Runner anderer Projekte werden nicht verändert.

## Nachtrag 04.11.2026: Kapitel 11–14 und Postgame real gespielt (Entwicklungszweig)

**Isolierter Branch:** `feature/echo-ch11-14-balance-20261104`. **Basis:** `main` bei `4f5a5d3`. Der Originalordner mit 25 fremden, nicht committeten Änderungen wurde nicht verändert.

- Neuer echter Chrome-157-Browser-Test `echo-chroniken/project/qa/real-chapter11-14.py` vollständig erfolgreich: **Desktop und Handy-Touch**, jeweils **1473 tatsächliche Schritte, 88 Dialogaktionen, sechs echte Boss-Siege, zehn Save-/Reload-Checks**. Zusammen **2946 Schritte, 176 Dialogaktionen, 12 echte Boss-Siege, 97 Attacken, 20 Reloads, null JavaScript-Fehler**. Der durchgehende Testabschnitt beginnt **nach abgeschlossenem Kapitel 10** mit Lv.55/480-KP-QA-Team, führt über Kapitel 11–14, Finale, Abspann, alle sechs Postgame-Wiesen, drei optionale echte Garten-Bosskämpfe, Museum und Gartenfest. Er beweist **nicht** normales Startspiel-Balancing oder mehrstündige natürliche Spielbarkeit. Details: `echo-chroniken/docs/game-design/CHAPTER11_14_REAL_QA.md`; Report unter `echo-chroniken/docs/visual-audit/real-chapter11-14/report.json`.
- **Getesteter Trank-Fix:** Der WIP-Commit `a2ce09c` wurde im isolierten Branch übernommen: Kampftränke heilen mindestens 36 KP oder 30 % Max-KP, keine Verschwendung bei vollen KP, geheilte Team-/Trankstände im Reisemenü werden gespeichert. Neuer Engine-Test `project/tests/battle-potions.cjs` erfolgreich.
- **400** echte, deterministische Frühgebiets-Einzelduelle (Lv.3/5) und **600** späte Dreierteam-Duelle über Kapitel 11/13/14 und Postgame durchgespielt. In den späten Szenarien: 600/600 Siege und 0 Tränke, deutlicher Hinweis auf **sehr leichte späte Einzelbosse bei gut besetztem Team**; natürliche Teamstärke/XP-Kurve noch nicht erwiesen. Siehe `echo-chroniken/docs/game-design/BALANCE_PASS_20261104.md`.
- Vor vollständiger Freigabe: **Einen** natürlichen Spielstand ab Oma/Paket über Kapitel 14/Postgame ohne synthetische Kapitel-Startflags, natürliche Ressourcen/EP/Ermüdung/Begegnungen/Spielstunden und reale Android-Geräte prüfen. Die bestehende Quest-Testroute und die neuen Segmenttests können dafür verbunden werden. Grafik bleibt zurückgestellt.
- **Release-Abfrage:** GitHub `android-latest` führt inzwischen ein am 04.11.2026, 17:01 UTC hochgeladenes APK-Asset (SHA256 `8fed4055d161fc5176db62a85a9c5cf52317b29ef76a5833b2dc97666eba77c4`), Release-Text nennt Build-Commit `45c3921`. Aus dieser API-Metadatenprüfung allein folgt **keine unabhängig verifizierte 0.29.0-Update-Installation oder Signaturprüfung**. Release-Tags, App-ID, Signatur und Hardware vor Installationsfreigabe nochmals prüfen.
- Für diese Gameplay-Korrektur ist im Entwicklungszweig die **Android-Releasekandidaten-Version 0.30.0 / versionCode 31** vorbereitet (Paket-ID bleibt `de.echochroniken.game.stable`). Noch keine 0.30.0-APK auf GitHub veröffentlicht und kein Handy-/TV-Update bestätigt; signierte Veröffentlichung nur nach erfolgreicher PR-CI und Merge über die bestehenden privaten Schlüssel.
- Stündlicher Entwicklungswächter bleibt **deaktiviert**. Neue Arbeit nur über eigene Branches/PRs, keine privaten Signaturschlüssel veröffentlichen.

**Die folgende Tabelle dokumentiert den damaligen Hauptstand bei Projektübergabe; der Nachtrag oben enthält die neuere QA.**

## 1. Tatsächlicher Story- und Teststand

| Abschnitt | Im Spiel vorhanden? | Nachgewiesene Testtiefe | Wichtigste Einschränkung |
| --- | --- | --- | --- |
| Kapitel 1–2, Oma/Paket/Anfangsweg/Ruine | Ja | Bestehende Intro-, Startweg- und Ruinen-Tests | Noch **kein neuer vollständiger menschlicher Durchlauf ab Spielstart**; Frühspiel-Balance gezielt nachholen |
| Kapitel 3, Nebelhafen und Pumpwerk | Ja | Echter Desktop-/Touch-Tastenlauf, Zeugen, Rätsel, realer Boss, Reload und Kapitel-4-Zugang; PR #16 | Vorbereiteter Save und bewusst starkes Testteam |
| Kapitel 4, Bahn und Moorglas | Ja | Echter Desktop-/Touch-Tastenlauf mit A–C–B-Weichen, Zugfahrten, Kurier/Schattenwurzel-Kämpfen; PR #17 | Vorbereiteter Save, bewusst starkes Testteam |
| Kapitel 5, Stillwasser | Ja | Echter Desktop-/Touch-Tastenlauf, Gedächtnisarchiv, Spiegel- und Lyra-Kampf, Bahnrückfahrt; PR #18 | Vorbereiteter Save, bewusst starkes Testteam |
| Kapitel 6 und 7, Schmiede bis Kronenstadt | Ja | **Ein** durchgehender Spielstand, echte Schritte, vier Bosse je Viewport; PR #19 | Start nach Kapitel 5 mit Lv.55-QA-Team |
| Kapitel 8–10, Kronenstadt/Frostgrat/Unterstadt | Ja, **in main** | **Ein** durchgehender Spielstand, echte Schritte, Archivwächter/Vex und friedlicher Ringhüter-Abschluss; PR #21 | Start nach Kapitel 7 mit Lv.55-QA-Team |
| Kapitel 11–14, Finale und Postgame | Ja | **Neuer real gesteuerter Browser-Durchlauf** mit Desktop und Touch, einschließlich sechs echten Bosskämpfen pro Ansicht, Credits und vollständig gelöstem Postgame; zusätzlich Quest-/Save-Regressionskette ab Kapitel 3 | Beginn nach Kapitel 10 mit **starkem Lv.55-QA-Team**; noch kein natürlicher Gesamtdurchlauf ab Spielstart |

**Keine falschen Behauptungen:** Die Story reicht weiter als Kapitel 7; das Spiel ist deshalb aber **nicht** als vollständig ausbalanciertes, mehrere Stunden zuverlässig spielbares Endprodukt bestätigt. Die realen Kapiteltests starten mit vorbereiteten Spielständen. Die Gesamtspielzeit wurde noch nicht durch einen Spieler von Anfang bis Ende gemessen.

## 2. Abgeschlossene und integrierte Arbeiten

- PR #14: `project/tests/continuous-campaign.cjs` verbindet Kapitel 3–14 und Postgame in einer persistenten Questsequenz; prüft Speicherstände, Zustände und einmalige Belohnungen. Bosskämpfe der Langstrecke werden teilweise über echte Sieg-Callbacks **simuliert**, nicht per Kampfmenü gespielt.
- PRs **#16, #17, #18, #19**: Echte Desktop-/Touch-Eingabetests für Kapitel 3–7, einschließlich Kämpfen, Portalen und Reloads.
- PR **#21**, Merge `45c3921` am 04.11.: Echte Tastatur-/Touch-Eingaben für Kapitel 8–10 bis Kapitel-11-Zugang. Lokale Chrome-157-Gegenprobe: 1.350 Schritte, 90 Dialogaktionen, vier Boss-Siege, zwölf Reloads über zwei Viewports. Friedlicher Ringhüter-Abschluss ohne simulierten Sieg. Vier relevante GitHub-CI-Workflows auf letztem PR-Head `ca80984` erfolgreich (Node, Docs, Browser, Android-Debug-Build).
- PR #21: Mobile Toolbar in 360–450 px breiten Hochformatansichten zweizeilig, Layout-Checks für 360×640, 390×844, 412×915 und 440×956. **Das ist eine funktionale Bedienkorrektur, kein Auftrag zur grafischen Neugestaltung.**
- PR #15: Android-Builds bei bloßen QA-Dateiänderungen nicht unnötig ausführen.
- **Stündlicher Echo-Entwicklungswächter bleibt deaktiviert.** Keine automatische Wiederaufnahme oder laufende Hintergrundarbeit annehmen.

### Browser-/Testdateien

- `echo-chroniken/project/qa/real-chapter3.py`
- `echo-chroniken/project/qa/real-chapter4.py`
- `echo-chroniken/project/qa/real-chapter5.py`
- `echo-chroniken/project/qa/real-chapter6-7.py`
- `echo-chroniken/project/qa/real-chapter8-10.py`
- `echo-chroniken/project/qa/mobile-layout-check.py`
- `echo-chroniken/project/tests/continuous-campaign.cjs`
- Cloud-Workflow: `.github/workflows/echo-browser-qa.yml`
- Weiterer Einstiegspunkt: `echo-chroniken/docs/game-design/CONTINUE_HERE.md`.

**Nachweise:** [PR #21](https://github.com/Graf-Git-Hub/Pok-mon_Klon/pull/21), [Cloud-CI für PR #21](https://github.com/Graf-Git-Hub/Pok-mon_Klon/actions/runs/41861194698), [Kapitel-6/7-CI](https://github.com/Graf-Git-Hub/Pok-mon_Klon/actions/runs/41849768150), [ältere PRs](https://github.com/Graf-Git-Hub/Pok-mon_Klon/pulls?q=is%3Apr).

## 3. Offene, aber **auf GitHub gesicherte** Balance-Arbeit

**Branch:** `feature/echo-potion-balance-20261104`  
**Commit:** `a2ce09c474aebf98efb2204ad7f0606989879e5b`  
**Datei:** `echo-chroniken/project/src/game.js`.

Dieser Branch enthält eine **begonnene, noch nicht freigegebene** Heiltrankkorrektur:
1. Trank im Trainer-/Bosskampf heilt mindestens 36 KP oder 30 % der maximalen KP, je nachdem, welcher Wert größer ist.
2. Bei vollen KP wird im Kampf kein Trank verbraucht.
3. Das Heilen des ganzen Teams im Reisemenü verbraucht keinen Trank, wenn das ganze Team bereits vollständig gesund ist; eine bezahlte Heilung wird gespeichert.

Dieser Stand ist als **WIP** gesichert und **NICHT** in `main`. Vor einem Merge spezifische Trank-/Kampf-/Save-Regressionstests ergänzen und reguläre/unterlevelte Teams simulieren. `node --check src/game.js` war vor dem Commit erfolgreich; das ist **keine** vollständige Balance-Abnahme.

## 4. Android-Version und Veröffentlichung ehrlich auseinanderhalten

- In `main` nach PR #21 steht `android/app/build.gradle` auf **`versionName 0.29.0` und `versionCode 30`**.
- **Package-ID MUSS bleiben:** `de.echochroniken.game.stable`.
- **Vorheriger privater Signaturschlüssel MUSS wiederverwendet werden**, sonst kann die APK nicht als Update installiert werden.
- Die letzte abgefragte GitHub-Release-Seite war [`android-latest`](https://github.com/Graf-Git-Hub/Pok-mon_Klon/releases/tag/android-latest), mit Veröffentlichungszeitstempel **31.10.2026** und Asset `Echo-Chroniken-Universal.apk`. **Das belegt nicht, dass eine neue signierte 0.29.0-APK schon veröffentlicht wurde!** Release-Workflow, signierte APK, App-ID und Signaturfingerabdruck erneut prüfen und erst dann den Download als aktualisiert bezeichnen.
- Nur Debug-Build-Erfolg ist noch keine reale Android-Installation oder signierte Release-Bestätigung.

## 5. Die nächsten wirklich wichtigen Entwicklungsaufgaben

**Priorität 1: Das Spiel muss über Stunden verlässlich spielbar werden.**
1. Echten Ende-zu-Ende-Durchlauf **ab Oma/Paket/Kapitel 1** bis Kapitel 14 und Postgame mit normalem Team, normalen Ressourcen und tatsächlichem Kampfmenü planen und abschnittsweise automatisieren. Dafür die bereits vorhandenen Tests verbinden, nicht bei Kapitel 7 beginnen.
2. Kapitel 11–14 **real** mit Laufen, Dialogen, Kämpfen und echten Zwischen-Speicherungen prüfen; finale Bosskämpfe, Credits und Postgame mit normalen Spielfiguren absichern.
3. **Balancing**: Erstgebiet mit Lv.3–5, Evolutions- und XP-Kurve über alle Kapitel, Wildbegegnungsdichte, Pflichtboss-Level, Heiltrankökonomie, Niederlagen und sichere Rücksetzpunkte mit festen Zufallsseeds simulieren. Explizit Siege/Verluste, Grindbedarf, Trankverbrauch und Über-/Unterlevelung berichten. Das bisherige Lv.55-QA-Team misst **nur Questfunktion**, nicht Spielschwierigkeit.
4. Realistische Spieldauer durch tatsächliche Laufwege, Dialogtempo, Zufallsbegegnungen, Grinding und Boss-Wiederholungen erfassen. Ziel des Nutzers: mehrere Stunden unterhaltsames Spielen, nicht künstlich verzögerte Questflags.
5. Gefundene Softlocks, Sackgassen und unklare Quest-Hinweise im **echten Spielcode** beheben und mit Regressionstests absichern.

**Priorität 2: Fertige Android-Version** inklusive stabilem Update, echter Controller-/TV- und Touch-Prüfung.

**Bewusst zurückgestellt:** Karten-/Umgebungsgrafik, neue generierte Illustrationen, Sprite-/Pixelart-Politur und großer optischer Umbau. Nutzer möchte das **später separat mit Codex oder generierten Bildern** lösen; jetzt nicht viel Zeit daran verlieren.

## 6. Lokale Arbeitsordner sicher behandeln

Laptop `Laura` ist bei Bedarf autorisiert. Der ursprüngliche Worktree
`C:\Users\graf8\Documents\GitHub\Pok-mon_Klon`
hatte beim letzten Check **25 nicht committete Dateiveränderungen** und war lokal auf älterem Stand `28867fd`. **Diesen Ordner NICHT resetten, cleanen, pullen, committen oder überschreiben!**

Getrennte Worktrees:
- `C:\Users\graf8\Documents\GitHub\Echo_Chapter8_10_20261104`: PR #21, jetzt in main integriert, lokale Screenshot-Outputs liegen teils untracked.
- `C:\Users\graf8\Documents\GitHub\Echo_GameBalance_20261104`: eigener WIP-Heiltrank-Branch, auf GitHub gepusht.

Für neue Entwicklung **neues isoliertes Git-Worktree vom aktuellen `origin/main`** anlegen, dann eigene Branches/PRs und CI. Screenshot-Ausgaben im Worktree nicht mit unfertigen Codeänderungen vermischen. Keine privaten Signaturschlüssel auf GitHub hochladen.

## 7. Handlungsanweisung für neuen Chat

> Bitte lies zuerst `ECHO_CHRONIKEN_UEBERGABE.md` im Repository `Graf-Git-Hub/Pok-mon_Klon`, dann `echo-chroniken/docs/game-design/CONTINUE_HERE.md`. Arbeite **nicht** wieder bei Kapitel 7 los. Hauptstand ist bereits **bis Kapitel 10 real getestet**, Kapitel 11–14 und Postgame sind im Spiel und haben Story-/Speichertests. Wichtigstes Ziel ist jetzt **normales Balancing und ein wirklich mehrstündig durchspielbares Spiel**, nicht Grafik. Prüf den separaten WIP-Heiltrank-Branch `feature/echo-potion-balance-20261104`; teste, repariere und merge ihn nur bei grüner CI. Prüfe außerdem, ob eine **signierte 0.29.0-APK** wirklich veröffentlicht wurde. Schütze den ursprünglichen lokalen Git-Worktree mit uncommitteten Änderungen. Keine stündliche Automation reaktivieren.

---

**Dieses Dokument ist das zentrale Übergabeprotokoll.** Nach weiteren Merges/Release-Checks bitte den bestätigten Hauptstand, die Release-Version, echten Spieltestfortschritt und offene Fehler **hier** aktualisieren, statt nur flüchtige Chat-Zusammenfassungen zu schreiben.
