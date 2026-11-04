# Echo-Chroniken: Intensiv- und Belastungstests (04.11.2026)

**Basis:** Hauptzweig nach dem erfolgreichen Merge von PR #25 (`895ad35`). Die gesamte natürliche Kampagne 1–14 inkl. Postgame ist dort bereits automatisiert geprüft; der folgende Test erweitert bewusst auf bislang schlecht abgedeckte Risiken. Es wurden **keine** Originaldateien des Nutzers in dessen ursprünglichem Worktree verändert.

## 1. Vorhandene Regressionen auf Laura

- **41/41 Node-Tests bestanden**, darunter Spielregeln, Story, Balancing, Archiv und Speicherstandmigration.
- **Karten/Portale:** 60 vom Map-Test registrierte Karten, 123 Startpunkte, 310 Startpunkt-zu-Ausgang-Routen, 117 reversible Portal-Wege; 0 Fehler. Der Story-Dokumentvalidator führt 62 Karten inklusive Legacy auf, daher sind diese Zählungen **verschiedene Testmengen**, keine widersprüchlichen Ergebnisse.
- **Archiv/Speichern:** 8 ältere Save-Dateitypen plus bewusst beschädigte Datei, 144 tatsächlich ausgeführte Archiv-Fänge bei vollem Team, Reload, Maus-/Touch-Swap und abgebrochenes Kampflabor getestet.
- **Vorhandener Mobile-Layout-Test:** 360×640, 390×844, 412×915, 440×956 erfolgreich.

## 2. Neues echtes Touch-Layout-Stresstesting

- Erweiterter Playwright-Test: `project/qa/responsive-stress.py`. **11 Bildschirmgrößen**: 320×480, 320×568, 360×640, 375×667, 390×844, 412×915, 480×320, 640×360, 800×360, 854×480, 1024×600.
- Prüft echte A-/Start-/B-Taps, Spielfeldbreite, außerhalb des Bildschirms liegende Tasten und Überschneidungen zwischen Spielfeld, Werkzeugleiste, Steuerkreuz und A/B-Aktionsfeldern. Zusätzlich Live-Rotation 412×915 → 915×412 → 412×915 ohne Verlust der Storyphase.
- **Gefundene echte UX-Fehler vor Fix:** 320×480: obere Werkzeugleiste verdeckte Spielfeld; 480×320, 640×360, 800×360, 854×480 und 1024×600: virtuelle Steuerung verdeckte Spielfeld. Die vorherigen vier Standard-Handygrößen hatten diese Fälle nicht entdeckt.
- **Behoben in `project/styles/main.css`:** kompakte Portrait-Höhe für den Canvas, Querformat mit ausreichend Seitenabstand für A/B und D-Pad. Nach Korrektur **11/11 Auflösungen erfolgreich, keine Überschneidungen**, Live-Rotation erfolgreich. Screenshots werden in GitHub als CI-Artefakte hochgeladen, nicht in den Spielcode eingecheckt.

## 3. Neuer Kampf-Belastungstest mit Anfänger-Taktiken

- `project/tests/human-battle-stress.cjs` ruft die tatsächliche Engine auf und führt **4.800** deterministische, voneinander unabhängige Kämpfe aus: Varek Kap.11, Schachtwache Kap.13, Varek Kap.14 und ein optionaler Postgame-Boss; 1 oder 2 Teammitglieder, 0/2/6 Heiltränke, 40 Zufallsseeds und fünf Attackenstrategien.
- Die Teams haben realistisch beobachtete Level **16/18/19/22** der natürlichen Kampagne, mit einem möglichen Begleiter im niedrigeren Level. Dieses Modell ist **keine** erneute vollständige Kampagne; frühere Schädigungen und Laufwege werden pro Kampf zurückgesetzt.
- Gewinnquoten über alle Schwierigkeitskombinationen: stärkste Attacke **100 %**, zuerst verfügbare Offensive **100 %**, schwächste Offensive **87,5 %**, zufällige Offensive **99 %**, dauerhaft erster Moveslot **100 %**. Kein Kampf überschritt 100 Züge.
- Insbesondere wurden **alle getesteten zweiköpfigen Teams auch ohne Heiltränke erfolgreich** durch diese späten Bossduelle geführt. Einzelwesen mit ausschließlich schwächsten Attacken scheiterten in den Szenarien Kapitel 11, 13 und 14 jeweils 40/40-mal ohne Tränke. Das zeigt: Im Zweierteam sind die Pflichtbosse bei diesen getesteten Leveln wahrscheinlich **zu leicht**, solo mit schwachen Attacken können sie aber frustrierend sein.
- **Empfehlung:** Nicht einfach global die KP aller Gegner erhöhen. Stattdessen optional unterschiedliche Schwierigkeitsprofile, mehr gezielte Bossmechaniken/telegraphierte Angriffsmuster und Tests mit mehreren Erstspieler-Taktiken. Die jetzige Fassung bleibt in diesem PR unverändert, bis neue Regeln gegen den kompletten natürlichen Spieldurchlauf geprüft sind.

## 4. Nicht abgedeckt

- Keine verlässlich gemessene menschliche Mehrstunden-Spielzeit, keine physische Android-/TV-APK-Installation. ADB ist auf Laura nicht im PATH. Ein Xbox Wireless Controller erscheint in Windows als Gerät, aber es ist kein echter Controller-Tastentest durchgeführt worden.
- Die geprüften Bildschirmgrößen verwenden Chrome-Touch-Emulation, nicht elf echte Handymodelle. Automatisierte Zielpfade ersetzen weder Erkundung noch alle möglichen Entscheidungen.

## 5. Reproduktion / Schutz

- Lokal: `node echo-chroniken/project/tests/human-battle-stress.cjs`; `python echo-chroniken/project/qa/responsive-stress.py`.
- GitHub-Workflow `.github/workflows/echo-stress-tests.yml` wiederholt beide Tests auf Ubuntu/Google Chrome und archiviert Berichte sowie Screenshots als CI-Artefakte.
- Die Berichte sind unter `echo-chroniken/docs/visual-audit/stress-testing/human-battle-report.json` und `responsive-report.json` abgelegt. Keine reale Spielsicherung wird angefasst; die Tests verwenden isolierte Browserkontexte bzw. In-Memory-Spielzustände.
