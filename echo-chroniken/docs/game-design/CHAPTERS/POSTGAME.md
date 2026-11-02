# Kapitel 15 – Postgame: Die freien Linien
> **Status 02.11.2026:** Spielbare Erstfassung v0.25.0: acht Karten (Echo-Garten, sechs Wiesen, Bahn-Museum), drei freiwillige Gartenkaempfe, sechs Erinnerungsplatten, Museumsraetsel, Feier und einmalige Belohnung. Alle 94 Nichtstarter-Grundarten auf sechs 100%-gewichteten Begegnungstabellen. Echte Android-Handy/TV-Tests und grafischer Feinschliff bleiben offen.
> **Planversion:** 2026-11-01. Kreative neue Grundsatzentscheidungen stehen zur Freigabe.

## Dramaturgie und Story

Nach dem Finale befahren die Züge ein offenes, friedliches Netz. Echos müssen nicht gefangen werden, um respektiert zu werden. Der Spieler kann alle 150 Einträge entdecken, seltene Grundformen aufspüren, die verbliebenen Archivaufnahmen finden und Bewohnern beim Neuanfang helfen. Ein Museumszug erklärt die Geschichte der alten Bahn ohne nostalgischen Zwang. Eine letzte optionale Quest versammelt Freunde im Hof von Oma Martha und schenkt dem Kind ein neues Notizbuch, das nicht mit dem Vater konkurriert, sondern eigene Erinnerungen sammelt.

**Ziel:** Der Spieler versteht nach dem Kapitel einen weiteren Teil der Geschichte um Erinnerung und die freiwillige Freiheit der Echos. Der Fokus wandert von der Familienfrage zur gesamtregionalen Gefahr.

## Schauplätze und Karten

- **Hub:** Die gesamte Region
- **Region:** Postgame (Mapregion-ID: `postgame`)
- **Einstieg:** `main_story_finished`
- **Abschluss:** `optional_postgame_completed`
- **Levelkorridor:** 58–65 (Vorschlag; Altprüfkämpfe nicht automatisch umsetzen)

| Geplante mapId | Produktionsauftrag |
|---|---|
| `all_existing_regions` | Ankunft, Orientierung, sicherer Rückweg; Spawn, Übergänge, Kollision, Journal-Markierung, Kamera |
| `optional_echo_garden_annex` | Eigenständiger begehbarer Bereich, Interaktion und Rückweg; Spawn, Übergänge, Kollision, Journal-Markierung, Kamera |
| `rail_heritage_museum` | Eigenständiger begehbarer Bereich, Interaktion und Rückweg; Spawn, Übergänge, Kollision, Journal-Markierung, Kamera |

**Map-Vertrag:** Alle Übergänge besitzen fromMapId, exitId, toMapId, safeSpawnId, requiredFlags, returnExitId. Jede Storykarte hat bei Erstaufbau bereits reservierte Türen/Stationszugänge, selbst wenn noch verschlossen.

## Szenen und Questablauf

1. **CH15.S01** – Spielwelt nach Credits mit main_story_finished öffnen, Teams/Inventar behalten.
   - Status: Pflicht, soweit nicht als optional gekennzeichnet; Zwischenschritt über `story.ch15.stage` sichern.
   - Test: Auslösen, abbrechen, neu laden, wiederholen, Rückweg und Touch/Controller testen.
2. **CH15.S02** – Nachkampffragen von Nalia, Edda, Liora, Lyra, Kael, Vex und Oma ohne Spoiler-Blockaden.
   - Status: Pflicht, soweit nicht als optional gekennzeichnet; Zwischenschritt über `story.ch15.stage` sichern.
   - Test: Auslösen, abbrechen, neu laden, wiederholen, Rückweg und Touch/Controller testen.
3. **CH15.S03** – Alle Basisarten aus den Regionen über Begegnungstabellen zugänglich machen; Stufen über Entwicklung und optionale Spezialzonen.
   - Status: Pflicht, soweit nicht als optional gekennzeichnet; Zwischenschritt über `story.ch15.stage` sichern.
   - Test: Auslösen, abbrechen, neu laden, wiederholen, Rückweg und Touch/Controller testen.
4. **CH15.S04** – Echo-Bahn-Museum nach Stations- und Storyabschluss freischalten.
   - Status: Pflicht, soweit nicht als optional gekennzeichnet; Zwischenschritt über `story.ch15.stage` sichern.
   - Test: Auslösen, abbrechen, neu laden, wiederholen, Rückweg und Touch/Controller testen.
5. **CH15.S05** – Drei optionale Gebietsprüfungen, keine Hauptstory-Items, keine Level-90-Pflichtgegner.
   - Status: Pflicht, soweit nicht als optional gekennzeichnet; Zwischenschritt über `story.ch15.stage` sichern.
   - Test: Auslösen, abbrechen, neu laden, wiederholen, Rückweg und Touch/Controller testen.
6. **CH15.S06** – Lexikon 150/150 als optionales Sammlerziel mit kosmetischer Belohnung statt Storyzwang.
   - Status: Pflicht, soweit nicht als optional gekennzeichnet; Zwischenschritt über `story.ch15.stage` sichern.
   - Test: Auslösen, abbrechen, neu laden, wiederholen, Rückweg und Touch/Controller testen.
7. **CH15.S07** – Letzte Erinnerungsfeier im Garten von Wurzelheim, frei wiederholbar.
   - Status: Pflicht, soweit nicht als optional gekennzeichnet; Zwischenschritt über `story.ch15.stage` sichern.
   - Test: Auslösen, abbrechen, neu laden, wiederholen, Rückweg und Touch/Controller testen.

## Hauptfiguren und Dialogentwürfe

Kurze Textboxen mit maximal 2–3 Zeilen. Dialoge sind neue *Entwürfe*, sofern nicht bereits im Code belegt. Wiedergabe und Nachlesen im Journal ermöglichen.
- Piko: „Der Wald flüstert wieder verschiedene Dinge. Das ist ein gutes Zeichen.“
- Edda: „Ich habe diesmal eine Tür gebaut, die jeder selbst öffnen kann.“
- Martha: „Du führst dein eigenes Buch. Das hätte Elena gefallen.“

## Rätsel und Lösungen

Museumszug: historische drei Strecken anhand Stationsnamen verknüpfen; keine Belohnungssperre für 150/150.

**Frustschutz:** Alle Hinweise bleiben zugänglich. Nach drei Fehlversuchen optional Tipp anbieten. Fehler setzen maximal den aktuellen Schalterversuch zurück, niemals Quests oder Inventar.

## Fangwesen und Begegnungstabelle

Keine regulären Story-Pflichtbegegnungen. Der Spieler behält freie Mannschaftswahl und kann alle Grundformen später regional nachholen.
Evolutionsformen erscheinen primär durch das bestehende Evolutionssystem. Alle 150 IDs mit Stammfamilie, Evolutionsziel und Erstgebiet siehe [Monsterverteilung](../MONSTER_DISTRIBUTION.csv). Die späte Insel-/Schachtbegegnung darf nicht die einzige Möglichkeit sein, eine Art zu erhalten.

## Boss, Gegenstände und Ökonomie

**Trainer/Boss:** Optionale Herausforderungen mit Teamdurchschnitt +0 bis +3, hartes Cap 65, fairer Ersatz für Zwangsgrind.

**Belohnung:** Kosmetische Zuglackierung, Erinnerungsrahmen im Haus, Endgame-Sammelbadge ohne Gameplay-Vorteil.

**Anti-Farm-Regel:** `rewardClaimed` atomar mit Questabschluss speichern. Bestehende Tränke/Seelen-Sphären wiederverwenden. Neue Münzökonomie, Preise oder Einkaufsregeln stehen bis zur Programmierung als offener Entwurf.

## Nebenquests, Backtracking und Geheimnisse

**Optional:** Alle freiwilligen abgeschlossenen Quests aus früheren Kapiteln nachholbar; Ereignisse dürfen nicht verschwinden.

**Rückkehr:** Vollständig freie Region; Fahrtkosten im Postgame null.

## Assetliste und Audio

Kleine Museumsfläche, neuer Bahn-Skin, Schlussfest-Dekoration, Gedenkbuch.

Pro Map: Tileset, Kollisionsmasken, Spawnpunkte, Portale, Minimap-/Entdeckerkarte-Marker, NPC-Grafiken, Witterungs-/Umgebungssound, Dialog-Icon und Boss-SFX. Vor neuen Grafiken zuerst Kartengrauform/Blockout testen; vorhandene Grafikvorlagen bevorzugen.

## Speicherung, technische Aufgaben und Abnahmekriterien

- Neue Flags (Vorschlag): `story.ch15.stage` (0–7), `story.ch15.completed`, `story.ch15.rewardClaimed`. Bestehende Flags niemals still löschen.
- Kapitelstart/Abschluss als Daten, nicht als versteckte feste X/Y-Prüfung. Jede verpflichtende Szene muss deterministisch nachladbar sein.
- Save-/Migrationstest: Intro-Save, Speicherstand vor Boss, nach Boss, nach Bahnreise und nach App-Update laden. Niemals ältere Spielstände überschreiben, bevor Migration validiert ist.
- Bedienung: Controller D-Pad, A/B, Start und Touch gleichwertig; 320×180-Layout auf TV lesbar; Aktionen nicht zeitkritisch als Pflicht.
- Visual QA: echte Screenshots bei Kartenstart, Rätsel, Trainerkampf, Sieg und Rückkehr. Keine unzugänglichen Interaktionszonen oder fehlende Kollision.
- Regression: 14 bestehende Node-Tests plus neuer kapiteleigener Test und dauerhaftes Gesamtrouten-Testskript.
- **Definition of Done:** `optional_postgame_completed` gesetzt, Rückweg sicher, Belohnungen genau einmal, Encounter-IDs existieren, kein Spielstandverlust und alle automatisierten/visuellen Checks bestanden.

**Risiko:** Lexikon vollständig erreichbar; keine Arten dauerhaft durch Storyphasen verpassbar.

**Entwicklungsstatus:** Planung – nicht implementiert.
