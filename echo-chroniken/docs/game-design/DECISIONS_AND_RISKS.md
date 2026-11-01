# Entscheidungen, offene Punkte und Risikoregister

> **Kreative Festlegungen sind VORSCHLÄGE und vom Nutzer noch nicht ausdrücklich freigegeben.** Kein zukünftiger Chat darf neue Storyelemente als bereits im Code implementiert ausgeben.

| ID | Entscheidung | Status |
| --- | --- | --- |
| D-01 | 14 Hauptkapitel + Postgame; Kapitel 1/2 bewahren | VORSCHLAG |
| D-02 | Severin Varek, Tochter Mira und das Kontinuum | VORSCHLAG |
| D-03 | 150/150 nur freiwilliges Postgame-Ziel | VORSCHLAG |
| D-04 | Mehrkarten-Architektur mit bestehendem 36×28-Legacy-Adapter | TECHNIKPLAN |
| D-05 | Echo-Bahn ab Kapitel 4, kostenlose Rückfahrt | VORSCHLAG |
| D-06 | Mioras Elenabezug kann schon vor Kapitel 12 klar werden | KANON AUS CODE |
| D-07 | Kael/Lyra/Vex erst migrationssicher später regional umziehen | VORSCHLAG |
| D-08 | 50 generische Namen erst nach Artwork-Kontrolle neu benennen | OFFEN |
| D-09 | Keine technische Wiederbelebung nach beliebiger Wahl | VORSCHLAG |
| D-10 | GitHub-Dokumente sind zentrale Wahrheit für neue Chats | JETZT DOKUMENTIERT |


## Größte Risiken

| Risiko | Folge | Gegenmaßnahme |
| --- | --- | --- |
| Verlorene Spielstände | Team und Storyfortschritt weg | Golden Save Fixtures, additive Migration, Rollback |
| Unpassende neue Portale | Softlock | Graphprüfung, sicherer Spawn, garantierter Rückweg |
| 150 Rückansichten teilweise nicht 1:1 | Wesen sehen in Kämpfen anders aus | Per-ID-Front-/Rückseite und 15 Varianten prüfen |
| Schwieriger Anfang | Wiederholte Niederlagen | Bestehende 1.840 Simulationsbegegnungen + echter Spieltest |
| Elena als späte Überraschung | Widerspruch zu bestehenden Dialogen | Kapitel 12 ist freiwillige Beziehung, nicht Identität |
| Zu viele Karten gleichzeitig | Endlose Baustelle | In produktiven Milestones je ein kompletter Spielslice |
| Falsche APK-Signierung | Neue App statt Update | Unveränderte App-ID und privater Key |
| Verlorener Chatkontext | Unklarer nächster Task | CONTINUE_HERE, INDEX und CHANGELOG bei jeder Änderung |


## Noch zur Freigabe

Neue Varek-Figuren, endgültiges Vater-Schicksal, Zeitrahmen/Altersstufe, konkrete neue Städte, regionale Platzierung der Arenen und gewünschte Musik-/Grafikästhetik. Solange nicht entschieden, ist die Planung ein konsistenter Standardvorschlag. Keine davon blockiert den ersten technischen MapRegistry-Schritt.

## Änderungspflege

Änderungen mit Datum, Grund, betroffenem Kapitel, savegame-impact, Status und Commit-SHA in CHANGELOG dokumentieren. Programmierte Fakten stets zuerst am tatsächlichen Code verifizieren.
