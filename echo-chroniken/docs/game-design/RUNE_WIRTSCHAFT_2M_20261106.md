# Echo-Chroniken: Runenwirtschaft, versteckte Fundorte und 2-Millionen-Kampftest

Stand 06.11.2026, Branch `feature/echo-rune-economy-2m-20261106`, auf dem gemergten Retro-START-Menue #42.

## Spielmechanik

| Ausruestungs-Rune | Wirkung im ECHTEN Kampf | Bezugsquelle |
|---|---|---|
| Kraft-Rune | 12 % mehr direkter Schaden | Dorfladen Wurzelheim, 120 Echo-Muenzen |
| Schutz-Rune | 12 % weniger direkter Schaden | Dorfladen Wurzelheim, 120 Echo-Muenzen |
| Nebel-Rune | 7 % mehr direkter Schaden, 7 % weniger direkter Schaden | Einmalig verborgen am alten Weg bei Wurzelheim, x=16, y=10 |
| Ahnen-Rune | Nach einem eigenen erfolgreichen Schadensangriff bis zu 3 % maximale HP heilen; kein Extrazug | Einmalige Belohnung des Erinnerungshueters in den Ruinen |
| EP-Teiler | Bestehende EP-Verteilung: 100 % statt 40 % Bonuspool fuer nicht beteiligte, gesunde Begleiter, sofern Rune-Traeger aktiv mitgekaempft hat | Wie bisher nach erstem Sieg, einmaliges passives Artefakt |

Der passive Bonus wirkt auf **beide Seiten** der normalen Kampf-Schadensberechnung (`skillDamage()`), zusammen mit Typenfaktoren und dem bestehenden Statussystem. Mehrfaches Anlegen der *gleichen* Rune an ein Wesen wird verweigert. Verschiedene passive Runen koennen kombiniert werden: Kampfboni werden multiplikativ statt additiv berechnet. Ein Wesen belegt pro Rune einen Ausruestungsplatz, maximal 1/2/3 je nach Evolutionsstufe. Rucksack, Trank und EP-Teiler teilen sich dieselben Slots. Die bis zu vier gleichzeitig vorbereiteten Attacken bleiben unveraendert; Runenattacken koennen weiterhin im Runenlernen-Menue gelernt werden.

## Runen finden und kaufen

Im Dorf Wurzelheim steht bereits der Dorfladen (Haus bei x=20,y=14). Vor die Tuer stellen (Spieler x=22,y=17, nach oben schauen) und **A** benutzen, dann oeffnet der jetzt echte `RUNE_SHOP`. Das Verkaufssystem nutzt die bisherigen Touch-, Tastatur- und Gamepad-Eingaben, mit einer Kaufbestaetigung und persistenter Lager-/Geldbuchung. Waren:
- Kraft-Rune 120; Schutz-Rune 120; Seelen-Trank 30; Gegengift 25; Entstoerer 25; Rucksack 180 Echo-Muenzen.
- Einmalige Kohlenregen-Angriffs-Rune fuer 210 Echo-Muenzen. Sie kann nur **einmal** im Laden gekauft werden; dadurch bleiben Story-Runen etwas Besonderes.
- Startbestand 75 Echo-Muenzen, Wildsieg +8 bis +18 je nach Level, Trainerende +40 bis +60 je nach Level (je ganzem Trainerkampf nur einmal); 9999er Sicherheitsgrenze. Bisherige Trainer-Boss-Runenbelohnungen bleiben erhalten.
- Die seltenen **Nebel- und Ahnen-Runen sind weder kaufbar noch wiederholt farmbar**. Die leuchtende Nebel-Rune bei x=16,y=10 kann mit Blick auf das Feld und A gefunden werden. Der Erinnerungshueter ermoeglicht die Questbelohnung nach dem Bosskampf in den Ruinen. Beide Funde werden in `runeFinds` dauerhaft einmalig gespeichert.

Die Ausruestung ist ueber `START → Team → A` und `START → Runen → R` erreichbar. Das alte Save-v2-Format bleibt unveraendert: optionale Felder `coins`, `shopBought`, `runeFinds`, `gearStock` werden bei alten Spielstaenden nachgetragen, ohne Storyfortschritt, Arten oder archivierte Monster zu loeschen.

## Simulation und Tests

`node tests/rune-shop-flow.cjs` prueft den realen Engine-Zustand: echte Dorfladen-Tuer, Kauf und Geld, Ausruestung und Slots, Schadenswirkung Kraft/Schutz, EP-Teiler mit 3 Slots, Quest- und Fundrune jeweils nur einmal, Heilung und v2-Save.

`python qa/rune-market-browser.py` steuert echten Chrome auf Desktop und Smartphone-Touch mit dem echten Dorfladen und verstecktem Weltfund. Gespeicherte Screenshots und Resultate unter `docs/visual-audit/rune-market/`.

`RUNE_FIGHTS=2000000 node tests/rune-two-million-battles.cjs` fuehrt **2.000.000 vollstaendige Kampfsimulationen** mit deterministischem Seed `20261106` durch. Sie rufen dieselben echten Spielregelfunktionen (`skillDamage`, `STATUS.adjustedDamage`, `STATUS.apply`, `STATUS.endAction`, `runeCombatModifiers`, `passiveHitHeal` und `runeReserveXp`) auf, aber ohne die visuelle Browserdarstellung oder die Dialog-Wartezeiten. Ergebnis jedes Duells steht erst nach Siegerermittlung oder 160 Runden fest. Die Simulation enthaelt **800.000 1v1, 200.000 2v3 und 1.000.000 3v3**, alle 150 Wesen, zufaellige Level, 0 bis 3 Ausruestungs-Runen, seltene Runen pro Team einmalig, zufaellige EP-Teiler-Träger auf beiden Seiten und echte Status- und Schadensregeln. Es werden Siege, Runden, Schwellenueberschreitungen, Lifesteal, EP-Pool-Vertraeglichkeit, HP-Gueltigkeit, Runenverteilung und Event-Counts erfasst. Vollreport: `docs/visual-audit/rune-million/rune-2000000-report.json`.

Im normalen Testlauf werden nur 2000 schnelle Duelle ausgefuehrt; die GitHub-Workflow `echo-rune-economy-2m.yml` wiederholt **alle 2 Millionen** gesondert. Der Resultatreport ist reproduzierbar und kann auf unterschiedlichen Rechnern auf dieselben Kernwerte/Seed geprueft werden.

## Grenzen

Die Simulation testet **vollstaendige Duellabfolgen mit echten Regelfunktionen**, nicht zwei Millionen Browser-Runden mit animierten Sequenzen, Storydialogen, Shopping oder einem komplett menschlichen Taktik-Algorithmus. Die konkreten UI-Pfade sind separat mit Playwright getestet. Der Gegner darf in der Simulation ebenfalls Runen tragen; im Hauptspiel sind die normalen Trainer derzeit nicht standardmaessig damit ausgeruestet, damit die alte Schwierigkeit erhalten bleibt. Das Feintuning mit echten Runen-Gegnern kann als eigener, spaeterer Story-Balance-Schritt erfolgen. Ein neuer Android-Release ist hiermit noch nicht automatisch veroeffentlicht.
