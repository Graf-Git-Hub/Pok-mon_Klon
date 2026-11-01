# Story-Roadmap Änderungsverlauf

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
