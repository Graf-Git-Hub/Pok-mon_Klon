# Echo-Chroniken: 100 parallelisierte Spielvarianten mit mobiler Live-Übersicht

**Stand: 06.11.2026.** Isolierter PC-Worktree auf `origin/main` nach erfolgreichem Merge der intelligenten Gegner-KI (#37).

## Öffentlicher mobiler Status

**GitHub Pages:** https://graf-git-hub.github.io/Pok-mon_Klon/

Die mobile, responsive Seite ist öffentlich über HTTPS verfügbar und funktioniert im Mobilfunknetz unabhängig vom heimischen WLAN. Sie zeigt einen Gesamtring, die Anzahl aktiver, bestandener, fehlgeschlagener und wartender Tests, individuelle Fortschrittsbalken, Such- und Filterfunktionen und pro Test ein reduziertes Protokoll. Die Seite selbst befindet sich im separaten `gh-pages`-Zweig des öffentlichen Repositories. Die Daten werden ungefähr alle 80 Sekunden vom PC als neues `gh-pages/status.json` veröffentlicht. Die GitHub-Pages-Bereitstellung kann zusätzliche Verzögerung haben.

**Datenschutz:** In der öffentlichen JSON-Datei landen nur IDs, Spielregelbeschreibung, Status, Fortschrittsposition und kurze gefilterte Spielevents. Keine echten lokalen Save-Dateien, persönlichen Dokumente, Nutzerdateipfade, Passwörter, Screenshots oder Zugriffsdaten. Die Statusseite hat **keine Fernsteuerungsfunktion**. Jeder mit dem Link kann diese öffentlichen Testmetriken sehen.

## 100 einzigartige Spielregeln

Eine reproduzierbare Kombination aus 5 Levelpflichten × 4 Fangregeln × 5 Heilstrategien:

| Dimension | Varianten |
| --- | --- |
| Mindestlevel vor Verlassen des Startgebiets | Ohne Zusatzpflicht; +1; +2; +5; +10 Level für **jedes zu diesem Zeitpunkt besessene Wesen** |
| Erstes Einfangen | Sofort; nach 1; nach 2; nach 3 gewonnenen Wildkämpfen |
| Heilung bei KP unter Schwelle | Nie; 25 %; 45 %; 65 %; 85 % |
| Bedienung | Abwechselnd Desktop und Touch, mit echtem Playwright-Browser und echten Eingaben |

Es werden **genau 100 unterschiedliche Regelkombinationen** erzeugt, bei maximal zwei gleichzeitig laufenden echten Browsern, um Laura nicht unnötig zu belasten. Jeder Versuch besitzt einen eigenständigen Browser-Kontext, eigenen deterministischen Start-Seed, lokales Testprotokoll und eigenen Testspielstand.

Der Test führt mit echten Eingaben die vorhandene natürliche Kampagnenroute aus: Omas Haus, Paket, Dorf, Waldlichter, wilde Begegnungen und Fangversuch, Levelpflicht, Trainer Piko, Ruinen, Kapitel 3 und Kapitel 4 inklusive Zugfahrt bis zum nächsten Gebiet. **Keine direkten Kapitel-Flags, künstlichen Siege oder XP-Änderungen.** Die +10-Level-Variante darf durch natürliches Training länger brauchen. Wird die Pflicht vor der Sicherheitsgrenze nicht erreicht, wird sie als "Regel blockiert" angezeigt statt künstlich weitergespielt. Verluste und Browserfehler werden als Fehlschlag protokolliert und nicht als erfolgreich ausgegeben.

## Implementierung

- `project/qa/build_parallel_runner.py` leitet den Regeltester aus dem bereits geprüften `natural-opening.py` ab.
- `project/qa/parallel_natural_run.py` enthält die echte angepasste Eingabeautomatisierung.
- `project/qa/parallel_lab_service.py` hält die Testwarteschlange, steuert zwei lokale Worker und liefert lesbare Statusdaten.
- `project/qa/publish_parallel_status.py` filtert die Statusdaten und überträgt sie über die bereits vorhandene lokale GitHub-Anmeldung auf den `gh-pages`-Zweig.
- `project/qa/parallel_dashboard.html` ist die responsive Einzeldatei der öffentlichen und lokalen Anzeige.
- `project/qa/check_public_dashboard.py` kontrolliert die echte öffentliche Seite in Chrome bei **412 × 915 Pixeln**, inklusive 100 sichtbarer Karten und echtem Statusfeed.

Die Testprozesse und der Publisher wurden auf Laura gestartet. Ein bestehender anderer Dienst auf Port 8765 blieb unangetastet; für den lokalen Testservice wird Port **8897** verwendet. Die Website benötigt diesen lokalen Port nicht, da sie direkt den GitHub-Pages-Feed abruft.

## Grenzen und Betrieb

Die Ausführung findet ausschließlich auf Laura statt. Der öffentliche GitHub-Pages-Link funktioniert auch, wenn Laura temporär nicht erreichbar ist, allerdings **frieren die zuletzt synchronisierten Daten dann ein**. Die Seite warnt vor veralteten Daten. PC-Suspend, Neustart, Netzunterbrechung oder nicht angemeldetes GitHub stoppen oder unterbrechen die Tests bzw. Statusübertragung. Bei einem Neustart muss die Supervisor-Instanz gegebenenfalls wieder gestartet werden; ein automatisches Wiederaufnehmen ab exakt derselben Spielfigurposition ist nicht implementiert.

Die 100 Variationen testen unterschiedliche **Spielstrategien im selben unveränderten Spiel**, nicht 100 unterschiedliche veröffentlichte Spielversionen. Sie verändern keine echten Nutzerspielstände, Wesenstatistiken oder die veröffentlichte APK. Diese QA-Variante ist als eigenständiger PR zu behandeln und darf bestehende Arbeitskopien auf dem Nutzer-PC nicht überschreiben.
