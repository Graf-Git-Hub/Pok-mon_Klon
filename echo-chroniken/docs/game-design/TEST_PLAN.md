# Testplan – Gameplay, Story, Assets, Android, Savegames

## Bereits vorhandene Regressionen (14 Node-Skripte)

`back-art.cjs`, `encounters.cjs`, `exploration.cjs`, `first-route.cjs`, `house.cjs`, `interiors-integration.cjs`, `interiors.cjs`, `package.cjs`, `platformer-integration.cjs`, `platformer.cjs`, `ruins-integration.cjs`, `ruins.cjs`, `smoke.cjs`, `village.cjs`. Die tatsächlichen Namen vor Tests im Repository verifizieren. Sie waren im zuletzt geprüften Projektstand erfolgreich; kein Garant für kommende Änderungen.

## Pflichttests bei jeder neuen Map

1. Prüfe Spawn und Teleporter beim Erstbesuch und aus altem Save. 2. Interaktion von vier Anlaufseiten. 3. Kamera- und Kollisionstest. 4. Kleine bzw. größte Handydisplays und TV-Modus. 5. Alle optionalen Questaktionen ohne Pflichtblockade. 6. Speichern vor und nach Karte. 7. Rückweg vom tiefsten Dungeonpunkt. 8. Gewinn/Niederlage im Bosskampf. 9. Schrift, UI und Kontrast. 10. Keine JavaScript-/Android-Laufzeitfehler.

## Story- und Lokalisierungsprüfungen

Namens- und Entwicklungs-Varianten von Miora (1/2/3), Eltern-Enthüllung beim frühen Prototyp-Orden, Endkapitel ohne Maternalis als aktives Teammitglied, 150 IDs im Lexikon, ältere Save-Flags ohne Doppellooot. Alle Dialogzeilen mit klarer Herkunft und Storyzeitpunkt versehen.

## Automatisierte Welt-Graph-Checks

Jede Map und jedes Bahnziel muss existieren; jede Reise besitzt sicheren Spawn; alle Rückfahrten erreichbar; Flags dürfen nicht zirkulär abhängig sein; alle Kapitelanfänge ab Beginn erreichbare Wege haben. Simuliere Kapitelzustände 1–15 sowie zufällige Neustarts an jedem Ausgang.

## Visuelle Abnahme

Nicht auf KI-Illustrationen als angebliche Ingame-Screenshots verlassen. Echte Browser-/Android-Bilder mit Map-ID, Commit SHA und Szenenstatus erzeugen; bestehende Kapitel-2-Screenshots dienen als Auditvorbild. Für Bossansichten Front/Back-Wechsel, HP-Leisten, Textfeld und Lesbarkeit überprüfen.

## Build- und Release-Schutz

APK signiert mit bestehendem festen Key und unveränderter packageId `de.echochroniken.game.stable`. VersionCode bei nächster APK erhöhen; niemals erneut mit zufälligem Debug-Key veröffentlichen. Alte Test-Apps bleiben getrennt, Spielstandmigration separat behandeln. Release nur nach Signatur- und APK-Inhaltsprüfung.

## Chrome-Sichtprüfung der Karten-Registry (01.11.2026)

Beide Browserfassungen (modular und Offline-HTML) wurden mit einem echten lokalen Chrome-Aufruf gestartet. `EchoMaps.list()` lieferte jeweils `legacy_wurzeldorf`, Speicherschema 2, und es traten keine JavaScript-Seitenfehler auf. [Echter Chrome-Screenshot](../visual-audit/legacy-map-registry-v015.png). Eine zweite spielbare Map wurde bewusst noch nicht hinzugefuegt.
