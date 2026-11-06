# Retro-Startmenue und HP-Bezeichnung (06.11.2026)

## Auftrag und sichtbares Spielerlebnis

Vorlage des Nutzers: klassisches, schmales Pause-Menue rechts ueber der weiterhin sichtbaren 2D-Spielwelt. Eigene Echo-Chroniken-Farb- und Pixelgestaltung, keine uebernommenen fremden Grafiken.

- **START** (Switch-Controller, Tastatur M/Escape oder Smartphone-Touch-Start) oeffnet/ schliesst das Menue in der Oberwelt; **B** schliesst ebenfalls.
- Rechtsseitiger, heller Pixelrahmen ueber der Welt statt zentriertem grossen Tagebuch. Auswahl mit Hoch/Runter + A, direkte Zeilenanwahl per Touch.
- Acht aktive Punkte: **Seelenbuch**, **Team**, **Rucksack**, **Runen**, **Archiv**, **Speichern**, **Optionen**, **Zurueck**.
- **Seelenbuch:** vorhandenes 150er-Bestiarium, B kehrt ins Startmenue zurueck; direkter Shortcut R aus der Oberwelt bleibt erhalten.
- **Team:** alle bis zu sechs mitgeführten Wesen mit Level und farbcodiertem HP-Balken. A oeffnet die Ausruestung des gewaehlten Wesens und B kehrt zur Teamansicht zurueck.
- **Rucksack:** zeigt Inventarbestände einschliesslich Tränken, Sphaeren, Rucksack, Gegenmitteln und Runen. A auf Trank startet die alte Team-Vollheilung mit einem Trank (keine Verschwendung bei voller HP), A auf Spezialitem oeffnet die Ausruestung, A auf Runen die Runenverwaltung. Keine neue unbegrenzte Item-Vergabe.
- **Runen & Archiv:** bestehende echten Systeme ohne Kopien, alte Save-v2-Werte erhalten.
- **Speichern:** alte Save-Funktion; danach zurück ins Pause-Menue.
- **Optionen:** Ton ein/aus, bestehende 3 Farbpaletten, Steuerungshinweis und Zurueck; Einstellungen in separatem `echo_chroniken_tv_preferences` localStorage-Schluessel. Verändert nicht die Spielstand-Version. Bestehender Sound-Button und Palette-Button bleiben synchron.
- **Zurueck:** Oberwelt fortsetzen; die Welt ist pausiert, Menue-Navigation bewegt den Spieler nicht.

## HP statt KP

Deutschsprachiges Pokémon verwendet KP = Kraftpunkte (kein Fehler); der Nutzer bevorzugt fuer Echo-Chroniken die internationale Anzeige `HP` (Hit Points). Deshalb wurde sichtbarer Text in `game.js` und `data/skills.js` (Schaden, Heilung, Status, Kampf-/Team-/Lexikon-HUD) auf HP umgestellt. Interne Feldnamen `hp` und `maxHp` bleiben identisch. Die bekannten Lebensbalken-Schwellen und Autoheilung werden nicht veraendert.

## QA / Nachweise

- `python qa/retro-start-menu-browser.py` simuliert alle acht START-Menue-Eintraege, Touch und Controller-Tastatur, Team→Ausruestung→Zurueck, Inventar, Archiv, Runen, Speichern, Optionenton, Farbpalette, Reload und alte v2-Spielstaende. Screenshots und Report: `docs/visual-audit/retro-start-menu/`.
- Bestehende `tests/save-compat.cjs` und `tests/battle-potions.cjs` wurden auf die neue Menueposition bzw. den echten Rucksackpfad umgestellt; Kampflogik bleibt unveraendert.
- Bestehende Browser-QA fuer Runen und Auto-Equipment auf Menuepunkt 3 aktualisiert.
- Die neue GitHub-Action `echo-start-menu.yml` prueft die neue UI und die wichtigsten vorhandenen Invarianten.

## Noch offen

Keine neue APK-Version und keine physischen Handy-/Switch-Controller-Tests. Auslieferung erst nach gruenen GitHub-Checks, ohne andere laufende Feature-Branches zu ueberschreiben. Eine komplexere Inventarwirtschaft (Item-Kauf/Beute) bleibt gesonderter Roadmap-Task.
