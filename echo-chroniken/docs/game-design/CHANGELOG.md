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
