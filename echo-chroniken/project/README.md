# Echo-Chroniken V0.6: modular

`index.html` über einen kleinen lokalen Webserver öffnen, z. B. `python -m http.server 8000`. Die sofort spielbare Offline-Version ist `../index.html`.

- `src/game.js`: Spielwelt, Kampfsystem und Eingaben
- `data/species.js`: 150 Monster und Entwicklungen
- `assets/atlas.js`: 150 originale Monstergrafiken
- `assets/backs.js`: 8 erste Rückansichten
- `styles/main.css`: Design und virtuelle Handy-Steuerung

Im Anfangsgebiet sind nur Grundformen auf Level 2 bis 4. Attacken werden nach Level gelernt, niemals vergessen und können mit L/R sortiert werden. Für die Android-TV-APK fehlen noch Build und Gerätetest.

## Historisch: optionaler Bilderimport

Im Kampf-Test kann ein PNG/JPG/WebP mit den drei Rückansichts-Blättern (jeweils 5×9 Wesen) über den Knopf **Rückansichten importieren** einmalig lokal eingebunden werden. Der Import bleibt auf diesem Gerät gespeichert und verändert keine Spielstände. Alternativ kann ein bereits freigestellter Atlas als \`assets/monster-backs-135.webp\` (10×14 Felder, 135 belegt) in die App gepackt werden. In der aktuellen APK wird der vollständige 150er-Atlas automatisch geladen.

## 150 Rückansichten fest eingebaut (v0.15)

Alle 150 Kreaturen besitzen automatisch ladende Rückansichten im mitgelieferten
`assets/monster-backs-150.webp` (10 Spalten × 15 Reihen).
135 Motive stammen aus den gelieferten Rückansichts-Bildbögen; 15 sind ergänzte Varianten.
Die Android-APK benötigt keinen Import und keine Internetverbindung.
Spielstände bleiben vom Grafikupdate unverändert. Der optionale Import-Knopf erlaubt eigene Bildbögen.
