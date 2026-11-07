# Echo-Chroniken: Spielbare Map-Überarbeitung (erster Abschnitt)

Stand 06.11.2026, Feature-Zweig `feature/echo-world-layout-overhaul-20261106`.

## Ziel

Kein KI-Bild ohne Spielbezug: authentische Retro-RPG-Spielwelt mit längeren, logisch verbundenen Wegen, sinnvoll platzierten Häusern, Seen und Quests. Die vorhandenen Tile- und Kollisionsfunktionen bleiben der Kern. Bildgenerierung erfolgt erst nach dem Layout.

## Erste im Spielcode tatsächlich umgebaute Maps

| Map | Früher | Jetzt | Kürzester Weg durch die Region | Begehbare Felder |
|---|---:|---:|---:|---:|
| Nordufer (`lake_north_path`) | 24 × 17 | **48 × 28** | **47 Schritte** | **848** |
| Nebelhafen (`nebelhafen_town`) | 26 × 18 | **52 × 30** | **49 Schritte** | **1146** |

**Nordufer:** Ein längerer, gewundener Hauptweg zwischen Startdorf und Hafen, See im Norden mit sichtbarem Holzsteg, zusätzliche Südschleife, zwei erkundbare Nebenwege, klare Uferbegrenzung aus Bäumen und hohes Gras.

**Nebelhafen:** Längere Hauptstraße mit einer zentralen Marktplatzfläche, fünf sinnvoll verteilte Häuser mit Wegen bis zum Eingang, Hafenbecken im Nordosten mit Kai und Anleger, verschiedene abzweigende Viertel und klare Straßen zum Pumpwerk. Die fünf bestehenden Story-/Heil-NPCs wurden an zugängliche Positionen versetzt, ohne Dialoge, Quest-IDs oder Rätsel zu ändern.

**Kartenbilder:** `docs/map-redesign-preview/NORDUFER-NEU.png` und `NEBELHAFEN-NEU.png` wurden mit einem isolierten Playwright-Export der echten Game-Canvas erzeugt, ohne Spielfiguren, NPCs oder HUD. Das ist **kein** KI-Fantasiebild.

## Sicherheit

- `tests/map-walkability-redesign.cjs` prüft echte Kartengröße, kürzeste Strecke zwischen Portal-Spawn und nächstem Portal, alle Marker/NPCs, begehbare Fläche und den Rückweg.
- `tests/chapter3.cjs` prüft komplette Questreihe, reversible Teleporter, Rätsel, Bosskampf, Speicherstand und Erreichbarkeit.
- `tests/continuous-campaign.cjs` prüft den zusammenhängenden Fortschritt durch die späteren Kapitel.
- `qa/natural-opening.py --both --seeded` prüft mit echten Controller-/Touch-Eingaben die frühe Kampagne bis zum Hafen einschließlich vergrößerter Regionen.
- Karten und ihre Kollisionen werden gemeinsam geändert; die früheren Story-Gebiets-IDs und Portalkennungen bleiben gleich, sodass bestehende Saves kompatibel bleiben. Figurenpositionen innerhalb der beiden vergrößerten Gebiete bleiben numerisch gültig, können nach einem Upgrade aber in einer anders gestalteten Geländezelle stehen; dies muss bei alten Zwischenständen im Praxistest überprüft werden.

## Weiterer Arbeitsstand

**2 von insgesamt 60 registrierten Weltkarten wurden tatsächlich überarbeitet.** Die anderen 58 sind noch im Originalzustand. Der Export von 60 alten Karten ist kein Umbau. Die beiden überarbeiteten Karten dienen als belastbarer Standard für Wege, Ortsaufbau und Tests bei den nächsten Gebieten; weder die gesamte Welt noch eine neue APK sind mit diesem ersten Abschnitt abgeschlossen.
