# 150-Geisterwesen: Arten, Lebensräume und vollständige Abdeckung

> **Quelle:** `echo-chroniken/project/data/species.js`, Stand vom 1. November 2026. Die Regionen und Erstfundorte in der CSV sind **Vorschläge**, nicht bereits implementierte Spawnregeln. Die Art-ID ist die dauerhafte technische Identität.

**Inventar:** 150 Einträge, 95 Familien, 95 Grundformen, 45 Zweitformen, 10 Drittformen, 50 unbenannte Platzhalter.

## Regionen und Grundformen für spätere Spawntabellen

| Gebiet | Kapitel | Grundformen-IDs | Evolutionsfamilien |
| --- | --- | --- | --- |
| Wurzelheim | 1 | keine regulären Wildbegegnungen | 0 |
| Flüsterwald | 2 | keine regulären Wildbegegnungen | 0 |
| Nebelhafen | 3 | 65, 95, 109, 112 | 4 |
| Moorglas | 4 | 29, 40, 67, 79, 84, 101, 106 | 7 |
| Stillwasser | 5 | keine regulären Wildbegegnungen | 0 |
| Glutklamm/Aschenruh | 6 | 18, 23, 51, 121, 124 | 5 |
| Lichterhain | 7 | 57 | 1 |
| Kronenstadt | 8 | 45 | 1 |
| Frostgrat | 9 | 4, 5, 10, 11, 13, 15, 16, 20, 21, 26, 27, 32, 33, 35, 37, 38, 42, 43, 48, 49, 54, 55, 59, 60, 64, 70, 71, 73, 76, 77, 81, 86, 87, 92, 93, 98, 99, 103, 104, 108, 111, 114, 117, 120, 123, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150 | 70 |
| Unterstadt | 10 | 7, 82, 89, 115, 118 | 5 |
| Sternenobservatorium | 11 | 62 | 1 |
| Resonanzschacht | 13 | keine regulären Wildbegegnungen | 0 |
| Resonanzkern | 14 | keine regulären Wildbegegnungen | 0 |
| Postgame | 15 | keine regulären Wildbegegnungen | 0 |


## Beispiele der verbindlichen ID-Ketten

| Familie | ID und Originalname | Level aus Code |
| --- | --- | --- |
| Eishase | 1 Miora → 2 Seelara → 3 Maternalis | 8, 15 |
| Geistertier 01 | 4 Spukwesen 01 | Einzelform |
| Hasengeist | 5 Hasengeist I → 6 Hasengeist II | 10 |
| Schattenkatze | 7 Schattenkatze I → 8 Schattenkatze II → 9 Schattenkatze III | 12, 19 |
| Geistertier 02 | 10 Spukwesen 02 | Einzelform |
| Katzengeist | 11 Katzengeist I → 12 Katzengeist II | 12 |
| Engelsgeist | 13 Engelsgeist I → 14 Engelsgeist II | 10 |
| Geistertier 03 | 15 Spukwesen 03 | Einzelform |
| Fuchsgeist | 16 Fuchsgeist I → 17 Fuchsgeist II | 13 |
| Kürbisgeist | 18 Kürbisgeist I → 19 Kürbisgeist II | 11 |
| Geistertier 04 | 20 Spukwesen 04 | Einzelform |
| Wolfsgeist | 21 Wolfsgeist I → 22 Wolfsgeist II | 10 |
| Feuerfuchs | 23 Feuerfuchs I → 24 Feuerfuchs II → 25 Feuerfuchs III | 12, 19 |
| Geistertier 05 | 26 Spukwesen 05 | Einzelform |
| Hirschgeist | 27 Hirschgeist I → 28 Hirschgeist II | 12 |
| Skelett-Hund | 29 Skelett-Hund I → 30 Skelett-Hund II → 31 Skelett-Hund III | 10, 17 |
| Geistertier 06 | 32 Spukwesen 06 | Einzelform |
| Eulengeist | 33 Eulengeist I → 34 Eulengeist II | 10 |


## Designregeln

- Art-IDs 1–150 NIE neu nummerieren. Namen darf man später in einer getrennten redaktionellen Entscheidung ändern, die ID bleibt stabil.

- Die 50 Platzhalternamen sind eine offene **Benennungsaufgabe**. Sie stehen in der CSV ausdrücklich als offen, bis Bild-Sprite, Silhouette, Typ und Entwicklung geprüft sind.

- Jede Grundform außer Miora muss spätestens im Postgame nachholbar sein. Miora ist Story-Geschenk, nicht Wildfund. Alle höheren Formen lassen sich aus Grundformen über Evolutionslevel erhalten.

- In frühen Gebieten ausschließlich Grundformen und Level 2–4 (bestehendes Balancing als Basis), keine Spätbosse im hohen Gras.

- Typen im Code sind aktuell auffällig einseitig verteilt: viele FLUT-Typen. Eine spätere Element-/Typenüberarbeitung ist gesondertes Balancing-Projekt, kein stiller Lore-Fix.

- Ein Wildpool enthält 4–7 Grundformen mit transparenten Gewichten. Pro Kapitel mindestens eine sichere Heilstelle und einen Rückzug.

- Tages-/Nachtzeit kann später als optionaler Encounter-Filter ergänzt werden, niemals als einziges Zeitfenster einer verpassbaren Art.

- Spätere Bosse dürfen höhere Entwicklungsformen einsetzen, ohne diese zwangsläufig als wilde Fangform freizuschalten.

- Der vollständige CSV-Master enthält für **jede** der 150 IDs: Originalname, echten Typ, echte Familie, Entwicklungsstufe, Ziel-ID, Evolutionslevel, geplante Erstregion und Beschaffungsweg.

## Nächste Redaktionsaufgabe

Art-Tabelle mit 150 Front- und Rückgrafiken visuell gegentesten. Insbesondere die 15 ergänzten Rückansichten sind keine automatisch verifizierten individuellen Designs. Danach für die 50 Namen Alternativen vorschlagen und einzeln auf Art-ID referenzieren.

## Aktive Fangorte gegenüber Plan (v0.17)

Die 150 Zeilen der CSV sind ein Verteilungs**plan**. In der jetzigen APK gibt es nur eine aktive Begegnungs-Region: legacy_wurzeldorf. Bei 0 Orden enthält sie 25 Grundformen der bisherigen IDs 2–48. Spätere Orden vergrößern den Pool. Keine der anderen geplanten Städte hat heute eine aktive Tabelle.
