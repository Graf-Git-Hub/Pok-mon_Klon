# Grafik V5 – Umsetzung und Prüfung

Eigener Entwicklungszweig auf `feature/echo-gb-rpg-layout-v4-20261109` (Basis f50df81).
Das ist die spielbare Grafikbibliothek mit sieben Referenzkarten, **nicht** die
Umstellung der 60 Storykarten oder der Android-App.

## Änderungen

- 39 logische Terrain-IDs erhalten; neue getrennte kleine Sheets für 12 Figurenposen,
  zwei NPC-Silhouetten und transparente Vordergrundbilder.
- Eigene Figuren mit vier Blickrichtungen, zwei wechselnden Schritten und Stand;
  gemeinsame Bewegung für Tastatur, Touch und Gamepad, 150ms-Schrittinterpolation.
- Schnelle Richtungswechsel werden als ein nächster Schritt gepuffert, nicht diagonal
  abgekürzt. Pause/Fokusverlust beenden gehaltene Eingaben.
- Neue Natur-, Fassaden-, Dach-, Zaun-, Wasser-, Boden- und Schmiedebauteile.
- Gras verdeckt Beine, Baumkronen und Möbel werden anhand des Fußpunkts sortiert.
- Vier identische Hauslinks und ausgerichtete Waldübergänge erhalten. Wurzelheim:
  kleine Türwege. Schmiede: drei unnötige Tresenfelder entfernt.
- Hauptspiel-Code, APK, Art-/Story-IDs und Speicherstände unverändert.

## Reproduzieren

Aus dem Repository-Stamm:

```sh
python echo-chroniken/project/tools/gb-kit/build_kit.py
python echo-chroniken/project/tools/gb-kit/build_preview.py
python echo-chroniken/project/qa/gb-art-assets.py
node echo-chroniken/project/tests/gb-classic-kit.cjs
node echo-chroniken/project/tests/gb-map-layout.cjs
python echo-chroniken/project/qa/gb-animation-browser.py
python echo-chroniken/project/qa/gb-rapid-turn-browser.py
python echo-chroniken/project/qa/gb-art-v5-browser.py
python echo-chroniken/project/qa/gb-classic-browser.py
python echo-chroniken/project/qa/gb-rpg-map-browser.py
```

Browser-QA benötigt Python Playwright, Pillow und installiertes Google Chrome.
Der bestehende Kartenwechseltest wartet nun bei animierten Doppel-Schritten auf
das tatsächliche Ende des Schritts. Das ist keine Lockerung der Tür-/Positionsprüfungen.

## Nachweise

`v5-proof/` enthält echte Chrome-Aufnahmen und ein GIF aus 32 Canvas-Screenshots
während tatsächlicher Eingaben. Die virtuelle Browseruhr sorgt für reproduzierbare
Frames; es werden keine isolierten Sprites in die Aufnahmen montiert.

- `dorf-handy.png`, `dorf-laufschritt.png`, `dorf-tv.png`
- `schmiede-handy.png`, `baum-vordergrund.png`, `gras-vordergrund.png`
- `laufen-im-spiel.gif`, `report.json`

Die Pixelprüfungen vergleichen Gras-/Baumüberdeckung direkt mit dem gerenderten
Canvas. Weitere Prüfungen: alle Richtungen und beide Füße, Idle, Blockaden,
gehaltenes Touch und Loslassen, Pause/Fokusverlust, Wasserwechsel, genau vier
Canvasfarben, 10×9/16×9, simulierte Controllerachsen, vier Türen mit exakter Rückkehr,
beide Waldübergänge und JavaScript-Fehler.

## Grenzen

Chrome 157 auf Windows, Handygröße und Touch emuliert; Gamepad API mit synthetischen
Steuerkreuz-/Stickwerten. Kein behaupteter Test auf physischem Android-Handy,
Android-TV oder Bluetooth-Controller. Kein APK-Build erforderlich oder verändert.
Statische alte Übersichtsbilder sind Atlas-Vorschauen; die Browseraufnahmen zeigen
die tatsächlichen Vordergrundebenen und Animationen.

## Veröffentlichung

Neue Testversion: https://graf-git-hub.github.io/Souls/echo-chroniken-gb-grafik-v5.html

Nur eine neue Datei im bestehenden Pages-Zweig ergänzt. Die V4-Adresse und ihre Datei bleiben unverändert.

## Prüfergebnis

PASS: beide vorgeschriebenen Node-Kit-/Kartenprüfungen, Save-Kompatibilitätsprüfung, PNG-/Palettenprüfung sowie alle fünf Chrome-Browserskripte. Die zusätzliche Codeprüfung fand vertauschte Seitenansichten und schnelle diagonale Richtungswechsel; beide wurden vor Veröffentlichung behoben und erneut geprüft.
