# Echo-Chroniken V0.6: modular

`index.html` über einen kleinen lokalen Webserver öffnen, z. B. `python -m http.server 8000`. Die sofort spielbare Offline-Version ist `../index.html`.

- `src/game.js`: Spielwelt, Kampfsystem und Eingaben
- `data/species.js`: 150 Monster und Entwicklungen
- `assets/atlas.js`: 150 originale Monstergrafiken
- `assets/backs.js`: 8 erste Rückansichten
- `styles/main.css`: Design und virtuelle Handy-Steuerung

Im Anfangsgebiet sind nur Grundformen auf Level 2 bis 4. Attacken werden nach Level gelernt, niemals vergessen und können mit L/R sortiert werden. Für die Android-TV-APK fehlen noch Build und Gerätetest.
