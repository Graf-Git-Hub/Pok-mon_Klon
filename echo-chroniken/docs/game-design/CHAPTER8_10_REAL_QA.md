# Kapitel 8 bis 10: echter Steuerungsdurchlauf, 04.11.2026

## Was geprüft wurde

`project/qa/real-chapter8-10.py` beginnt mit **einem** vorbereiteten
Spielstand nach abgeschlossenem Kapitel 7 am Stadttor von Kronenstadt
und führt ihn mit echten Tastatur- und Handy-Touch-Eingaben bis zum
Beginn von Kapitel 11. Die Tiles werden nur für die Wegplanung gelesen.
Es werden **keine** direkten Sieg-, Teleport- oder Questabschluss-
Callbacks aufgerufen.

### Kapitel 8: Kronenstadt
- Frostgrat-Zugang bleibt vor dem Pass gesperrt.
- Beide Marktstimmen, Stadtarchiv mit drei Akten, Reihenfolge 14-30-21
  und gesperrte Tonspur, bis Archivarin und Varek angesprochen sind.
- Wirklicher Kampf gegen den Archivwächter im Spiel-Kampfmenü.
- Frostgrat-Pass und Belohnung werden nur einmal vergeben.
- Speichern/Neuladen mit erst zwei gesammelten Akten und nach Abschluss.

### Kapitel 9: Frostgrat
- Laternenbau bleibt gesperrt, solange Teile fehlen.
- Karte, Linse, Energiezelle; Save/Reload vor der Montage.
- Der reale Eishöhlenweg über die aktivierte Phasenbrücke.
- Echter Kampf gegen Vex, Logbuch, Signal, einmalige Belohnung.
- Save/Reload und Portal in die Unterstadt.

### Kapitel 10: Unterstadt
- Stadtführerin, zwei Familienperspektiven und Miras Zeichnung.
- Drei reale Anker, Notstrom, Archivzeugnis und die **friedliche**
  Lösung mit dem Ringhüter ohne künstlich gewonnenen Bosskampf.
- Notausgänge, einmalige Belohnung, Save/Reload.
- Übergang zum Sternenpfad und Prüfung, dass Kapitel 8 bis 10
  im selben Save abgeschlossen bleiben.

## Bestätigter Teststand

Chrome 157 auf Laura im eigenen Git-Worktree, Exitcode 0.
Je Desktop/Touch 675 tatsächlich ausgeführte Schritte,
45 Dialoginteraktionen, zwei echte Boss-Siege und sechs Reloads.
Zusammen **1.350 Schritte, 90 Dialoge, vier Boss-Siege und zwölf
Speicherprüfungen**. Keine JavaScript-Ausnahmen. Zwei zufallsabhängige
Boss-Kampfserien verbrauchten lokal 10/11 Attacken. Die friedliche
Ringhüter-Lösung ist eine echte Questentscheidung, kein Sieg-Callback.

Im automatisierten Kapiteltest sind ungeplante Wildbegegnungen
während der Laufwege deaktiviert, damit sie die Questabnahme
nicht zufällig unterbrechen. Echte Bosskämpfe behalten ihren
zufälligen Schaden. **Das Spiel selbst bleibt unverändert**:
Wildbegegnungen funktionieren dort weiterhin ganz normal.

Die noch separat laufende GitHub-CI muss diese Prüfung erneut
bestätigen, bevor die Änderung in den Hauptzweig übernommen wird.

## Handy-Oberfläche: tatsächliche Korrektur

`project/styles/main.css` positioniert die 16:9-Spielansicht
im Portrait-Modus mittiger zwischen Toolbar und Steuerkreuz.
Bei 360 bis 450 Pixel Breite wird die zuvor seitlich abgeschnittene
Leiste in **zwei gut bedienbare Zeilen** aufgeteilt.

`project/qa/mobile-layout-check.py` prüft echte Chrome-Mobile-
Viewports 360 × 640, 390 × 844, 412 × 915 und 440 × 956 sowie die
ausgeblendeten Touchbuttons auf Desktop. Die Prüfungen
kontrollieren alle Toolbar-Buttons, Canvas-Grenzen und Abstände
zu Hinweis und D-Pad. Lokaler Test mit Chrome 157 PASS.

## Grenzen und Release

Es ist kein vollständiger Spieldurchlauf ab Kapitel 1.
Das Team ist bewusst Level 55 mit 480 KP, daher ist der Test
**kein** Anfänger-Balancetest. Echte Android-Hardware und das
vollständige Spiel auf dem Fernseher wurden nicht geprüft.
Grafik und weitere Kapitel müssen noch überarbeitet werden.

Die Browser-Tests sind bei GitHub Actions angebunden.
Android `versionCode` wird für die neue sichtbare Handy-UI
von 29 auf 30 (0.29.0) erhöht. Ein signierter APK-Release
darf nur nach grünem CI und Verifikation der unveränderten
App-ID `de.echochroniken.game.stable` und des bisherigen
Signaturschlüssels erfolgen. Save-Schema und Monster-IDs
werden nicht verändert. Keine Automatisierung reaktiviert.
