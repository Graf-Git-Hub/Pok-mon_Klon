# Iststand des Spiels (Quellcode-Audit)

**Code-Baseline:** Repository Graf-Git-Hub/Pok-mon_Klon, vor dem Dokumentationscommit `edfeb6c` (01.11.2026), Android Release 0.14.0. Im zuletzt geprüften Projektstand 14 Node-Tests erfolgreich. Bei Wiederaufnahme neu prüfen.

## Implementiert

- Spielzustand und Kartencode in `project/src/game.js`, eine alte 36×28-Welt plus Innenraum-Szenen.

- Omas Haus, Paket, Miora (ID 1), Intro-Flags, spätere Elternhinweise; drei bestehende Arenen Kael, Lyra, Vex.

- Flüsterpfad, Liora, drei Lichter, Piko, Ruinenrätsel, Erinnerungshüter, Vater-Aufnahme.

- Kräuterhaus, Werkstatt, Fanglinsen-Upgrade, Sprungtor/Papierwelt, Karte, Vorräte.

- 150 Spezies (50 noch generische Namen), 150 Front-/Rückbilder, Teams/Fangen/Level/Attacken, lokale Saves.

- Stabil signierte Android-App mit unveränderlicher ID `de.echochroniken.game.stable`. Keine Cloud-Synchronisierung.

## Noch nicht implementiert

Kapitel 3 bis 14 und Postgame, Varek/Mira/Kontinuum-Handlungsstränge, neue Städte, Echo-Bahn, separierte MapRegistry, neue Story-/EncounterRegistry, neue Save-Felder. Alle in dieser Projektbibel sind **Design**, nicht Featurebeschreibung.

## Kontinuität beachten

- Miora → Seelara → Maternalis ist im Code schon bei Lv 8 und Lv 15 möglich; Mutterbezug kann schon früh genannt werden. Kap. 12 darf keine Identitäts-Enthüllung erzwingen.

- Im alten Code sind drei Arenen bei (16,9), (25,13), (31,22) platziert; die neue Weltzuordnung ist eine spätere Migration und darf ihre Orden nicht verlieren.

- Dokumentation enthält historische Warntexte zur APK. Aktuellste Signierung/Release beim nächsten Arbeitsbeginn direkt im Build-Workflow erneut prüfen.

## Source-of-Truth

Aktueller Code/Tests für Ist-Zustand; diese Dokumente als Zielplan; ausdrückliche Nutzerentscheidungen in DECISIONS; ältere Chat-Aussagen sind allein kein zuverlässiger Projektstand.


## Nachtrag 2026-11-01: Maps & Speicherstände v0.15

Eine neue Karten-Registry ist im Code, die bestehende 36×28-Oberwelt und deren Zimmer bleiben identisch. Noch keine neue Stadt freigeschaltet. Schema v2 ergänzt Kartenschlüssel und sicheren Spawn ohne Änderung der alten Quest-/Arenendaten; bei erstem Laden älterer gültiger Spielstände bleibt ein lokaler Backup-Rohtext erhalten. Die Sicherung bleibt auf demselben Android-/Browser-Gerät und wurde anhand synthetischer Fixtures geprüft. Echte Nutzerdaten und vollständige Gerätetests sind **nicht** damit abgedeckt.

## Nachtrag: StoryRegistry M01-03

Die Bibliothek project/src/quests/registry.js führt lesbare IDs für 10 bereits vorhandene Quests ein: Oma/Paket, Wurzelheim verlassen, Spieluhr, Lioras Lichter, Piko, Erinnerungshüter, Oma-Bericht, Kael, Lyra und Vex. Vier dieser Quests verwenden eine bereits bestehende Flagstelle für eine idempotente Belohnung. Neue Gebiete oder Kapitel sind dadurch noch nicht programmiert.

## Nachtrag v0.17: Begegnungsverwaltung

Nur die bestehende Dorfkarte legacy_wurzeldorf ist als aktive Begegnungskarte registriert. Frühere Wildbegegnungs-IDs, Levelobergrenzen und die Anfangs-Kampfschonung der modularen Android-Fassung bleiben unverändert. Für zukünftige Gebiete können eigene gewichtete, streng validierte Encounter-Tabellen registriert werden; weitere Orte sind damit noch nicht spielbar.
