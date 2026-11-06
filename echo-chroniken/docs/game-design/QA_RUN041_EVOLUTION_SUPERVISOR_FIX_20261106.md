# Echo-Chroniken QA: RUN-041-Fehler und echte Entwicklungsverfolgung

**Datum:** 06.11.2026. Betroffene Testumgebung: `Echo_ParallelRuns_20261106`, nicht das normale Spiel.

## Ursache 1: Falscher Status „aktiv“ nach Thread-Absturz

Beim gleichzeitigen Schreiben mehrerer lokaler Test-Threads in dieselbe Datei `status.tmp` auf Windows entstanden `PermissionError`-Ausnahmen. Weil `run_one()` die erste `persist()`-Operation vor dem `try` ausführte, stürzte u. a. **RUN-041** vor dem Start des Browsers ab. Der Supervisor registrierte den Thread aber dauerhaft als aktiv, ohne zu prüfen, ob der Worker-Thread noch lebt.

**Korrektur:**
- Alle Status-Schreibvorgänge werden mit einem gemeinsamen reentranten Lock serialisiert.
- Temporäre Statusdateien besitzen einen pro Prozess/Thread eindeutigen Namen.
- Bei kurzzeitigem Windows-Dateilock wird bis zu 30 Mal mit kurzer Wartezeit wiederholt; Fehler bei der Statusspeicherung lassen nie einen Spieltest unbemerkt abstürzen.
- Der Scheduler erkennt tote Threads und plant unterbrochene Durchläufe automatisch neu ein. Nach wiederholtem Absturz wird ein Fehlerstatus statt „endlos aktiv“ gemeldet.
- Alle zuvor abgeschlossenen Ergebnisse werden beim Neustart aus `status.json` wiederhergestellt.

## Ursache 2: Unberechtigte Level-Sperre nach Entwicklung

Die ursprüngliche Testregel speicherte nur die **Art-ID** des Anfangswesens: `1: Miora`. Sobald Miora regulär zu **Seelara (Art-ID 2)** wurde, konnte die Bedingung `owned.get("1")>=ziel` nicht mehr erfüllt werden. **RUN-041** hatte nach regulärem Training Seelara Level 9 statt Miora Level 7 und das gefangene zweite Wesen auf dem geforderten Level 5. Die Testregel zeigte trotzdem „Levelregel nicht erfüllt“ an.

**Korrektur:**
- `qa/level_gate.py` verfolgt für jeden einzelnen, ursprünglichen Teamplatz die tatsächliche Evolutionskette anhand der unveränderten 150-Arten-Daten.
- Ein Wesen erfüllt seine ursprüngliche Levelpflicht auch nach einer oder mehreren Entwicklungen, aber nur, wenn es weiterhin zur korrekten Evolutionslinie gehört und selbst das geforderte Level erreicht.
- Gleichartige doppelte Teammitglieder werden **jeweils einzeln** kontrolliert. Keine generierten Levels, IDs, Kämpfe oder Spielstände werden verändert.
- Die ursprüngliche natürliche Teststeuerung wurde aus dem bestehenden Originalskript regeneriert und bleibt in `qa/parallel_natural_run.py` reproduzierbar.

## Verifizierte Wirkung und erneute Durchläufe

- **240** parallele Schreibvorgänge im ersten Isolations-Stresstest und weitere **300** im Regressionstest erfolgreich.
- Vier separate QA-Regressionen bestanden: originale RUN-041-Miora/Seelara-Begegnung, mehrere Entwicklungsstufen, doppelte Arten und gleichzeitige Statusschreiber.
- Beim ersten Supervisor-Neustart wurden **80** abgeschlossene Ergebnisse unverändert wiederhergestellt; RUN-041 startete wieder korrekt mit echten Eingaben.
- Bei der erneuten Analyse von `PARALLEL_GATE_BLOCKED`-Protokollen erwiesen sich **13 Varianten nachweislich als falsch blockiert**, weil die Originalart zur Folgestufe geworden war und die echten geforderten Levels bereits erfüllt waren. Nur diese wurden wieder eingeplant; die anderen blockierten und fehlgeschlagenen Tests bleiben als tatsächlich beobachtete Ergebnisse erhalten.
- Nach dem zweiten Neustart wurden **78** terminale Ergebnisse beibehalten und 13 zuvor blockierte Varianten für einen vollständigen Neustart mit korrekter Prüfung vorgemerkt.
- Die Durchläufe RUN-034 bis RUN-037 sind bereits vollständig und **erfolgreich** bis Ende Kapitel 4 wiederholt worden. RUN-041 wurde neu gestartet und folgt danach.

**Wichtig:** Die Anzahl „abgeschlossen“ kann wegen korrekt zurückgestellter falscher Ergebnisse vorübergehend sinken. Das ist keine Löschung, sondern eine Datenkorrektur. Die bisherigen lokalen Protokolle der 13 Varianten wurden vor dem Neutest als `run-before-evolution-fix.log` erhalten.

Alle Änderungen betreffen ausschließlich die QA-Infrastruktur. Die Spielengine, Wesenwerte, originale Spielstände und die APK bleiben unverändert.
