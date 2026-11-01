# Asset-Pipeline für 2D-Maps und 150 Wesen

## Quellenlage

Im Code gibt es einen Front-Atlas für 150 Arten, einen eingebauten 150er-Rückatlas und acht ältere Rückeinzelbilder. Von den neuen Rückansichten sind 135 Motive aus den gelieferten Tafeln abgeleitet, 15 sind Varianten; die optische Eins-zu-eins-Zuordnung muss geprüft werden. Die vorhandenen Original-Sprites werden nicht neu nummeriert.

## Produktionsregel

Für jede neue Map zuerst ein maßstäblicher Blockout mit Walkable/Blocked-Layer, dann Kollisions- und Sichtprüfung, erst danach dekorierte Tiles, NPCs und Hintergrundsounds. Tilegröße und Canvas-Skalierung bleiben im Einklang mit 320×180 Basisansicht. Jede Station bekommt die gleiche Portalanordnung auf verschiedenen Karten, aber angepasste Umgebungsdetails.

## Asset-Manifest

| Gruppe | Pro Region / Szene | Prüfung |
| --- | --- | --- |
| Terrain | Boden, Wände, Abgründe, Treppen, Kanten | Keine schwebenden Portale; Walkable/Blocker getrennt |
| Orte | Haus, Bahnhof, Ruine, Schacht, Fährsteg | Ein- und Ausgang sichtbar und beidseitig testbar |
| Interaktion | Hebel, Ventil, Buch, Audioabspieler, Namensstein | Erkennbares Interaktionssymbol, klare Hitbox |
| Wesen | Front- & Rückansicht ID 1–150, optional Animation | Gleiche Art-ID und Entwicklungsstufe in allen Ansichten |
| NPC | Standbild, 4-Richtungen-Bewegung, Portrait | Keine ungewollte Überdeckung von Türen |
| Audio | Gebietsloop, Interaktionssignal, Boss, Zug | Nur eigenes oder lizenziertes Material, Lautstärke-Option |
| UI | Auftragslog, Karte, Lexikon, Bahnhofsliste, Menüs | D-Pad/Touch, Kontrast, Textumbruch |


## Aufbau für Medien im Repository (Vorschlag)

`project/assets/world/<regionId>/tiles.webp`, `npc.webp`, `props.webp`, `sound/*.ogg`; `project/data/encounters/<mapId>.json`; `project/data/dialogue/<chapterId>.json`. Nicht vor der ersten MapRegistry-Abnahme massenweise Dateien anlegen.

## Grafische Qualitätssicherung

Gegen originale Bildtafel prüfen: Hase, Panda/Skelett, Qualle, Hirsch, Pilz, Hexenkürbis, Drachen, Fledermaus. Besonders bei 15 Ersatzrückansichten prüfen, ob Frontform und Rückform dieselbe Spezies zeigen; Abweichung als offenen Issue markieren, nicht per Fremdbild verdecken.

## Wiederverwendung

V0.14 liefert Dorf, Waldfarbpalette, Ruinen, Papierwelt und Bossmaske bereits. Kapitel 14 nutzt diese bewusst als Remix. Kein Kopieren geschützter Pokémon-/Nintendo-Sprites oder Musik in die finale Distribution.
