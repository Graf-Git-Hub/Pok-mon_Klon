# Begegnungs-Registry: Istzustand und Produktionsvertrag

**Implementiert in v0.17.0:** Die bisherige Karte `legacy_wurzeldorf` nutzt die alte fortschrittsabhängige Begegnungsverteilung. Der Anfangspool mit null Orden umfasst 25 Grundformen aus ID 2–48. ID 1 Miora bleibt Starter. Für mehr Orden werden die bestehenden Grenzen benutzt. Das alte System zum Begrenzen von Wildlevel, HP und Stärke beim ersten Spielbeginn bleibt erhalten.

## Spielcode und API

`project/data/encounters.js` liefert die Kartendefinitionen. `project/src/encounters/registry.js` bietet `initialize(species,definitions)`, `register(definition)`, `choose(mapId,limits,rolledLevel,rng)`, `preview(mapId,limits,level)`, `has(mapId)`, `get(mapId)` und `list()`. Jede Karten-ID muss eine explizite Registrierung besitzen; eine unbekannte Map löst keinen Kampf mit dem falschen Gebiets-Pool aus.

## Künftige gewichtete Tabellen (Beispiel, NICHT im Spiel aktiv)

    window.EchoEncounters.register({
      mapId: 'future_test_map', mode: 'weighted',
      entries: [
        {id:5, weight:50, minLevel:3, maxLevel:7},
        {id:7, weight:30, minLevel:3, maxLevel:7},
        {id:23,weight:20, minLevel:5, maxLevel:10,minBadges:1}
      ]
    });

Gewichte müssen zusammen **100** ergeben. Sobald per Orden/Level gefiltert wird, werden die verbleibenden Gewichte relativ neu normiert. Arten müssen im tatsächlich eingebauten Spezieskatalog existieren. Miora ID 1, doppelte Arten, unpassende Entwicklungsformen, falsche Level und ungültige Gewichte werden abgewiesen. Die Auswahl ist mit einem übergebenen Zufallsgenerator reproduzierbar.

## Übergabe an neue Karten

Eine Region benötigt erst einen funktionierenden MapRegistry-Eintrag und sichere Rückreise. Erst danach ihre eigenen Arten aus MONSTER_DISTRIBUTION.csv als Vorschlag auswählen und testen. Die heutige `wildEncounterLimits`-Levelkurve orientiert sich noch an den alten Dorf-X/Y-Koordinaten und Orden. Sie muss bei wirklichen weiteren Karten separat ausgelegt werden, sonst könnten späte Gebiete zu niedrige oder hohe Level ergeben.

## Prüfungen

`tests/encounter-registry.cjs`: 20.000 Fundziehungen, 150 katalogisierte Arten, 25 frühe Wildformen, ungültige IDs, Evolutionsformen, Level-/Orden-Gates und Gewichtssummen. `tests/encounters.cjs`: 1.840 echte Kampfsimulationen bei aktiver Registry. Echte Browserstarts der modularen und der Offline-Version inklusive Screenshots. Noch kein echter vollständiger Handy-/TV-Spieldurchlauf.
