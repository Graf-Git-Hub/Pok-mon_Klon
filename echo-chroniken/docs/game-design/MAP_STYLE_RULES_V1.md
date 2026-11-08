# Echo-Chroniken · Kartenstil und Weltbau V1

Stand: 08.11.2026. **Referenzkarte: Wurzelheim (legacy_wurzeldorf, 36×28).**

## Ziel und Vorbilder
Ein eigenständiges 16px-Retro-RPG mit der Klarheit von Game-Boy-Ära-Abenteuern. Vorbilder für die Lesbarkeit sind frühe Pokémon-Städte und -Routen (Rot/Blau/Gelb sowie Gold/Silber), aber keine kopierten Sprites oder Kartenlayouts. Atmosphärisch ruhig, freundlich, gut begehbar und mit klarer Geschichte.

## Grafische Regeln
1. Einheitliche 16px-Weltkacheln, kantenscharfe Pixel, keine Weichzeichnung.
2. Eine begrenzte, wiederkehrende Farbpalette: Grundton, Schatten, Licht pro Material.
3. Grasflächen ruhig und zusammenhängend; keine zufällige Pixel-Konfetti-Textur.
4. Wege als erkennbare Bänder aus Erd- und wenigen Steinformen, nicht als Zickzack-Labyrinth.
5. Bewusst gruppierte Bäume, Büsche, Blumen und Steine; künstliche Reihen nur bei Gärten und Zäunen.
6. Jede Region bekommt eine eigene Silhouette und einen visuellen Fixpunkt.
7. Wasser hat erkennbare Ufer und bleibt vom Laufweg unterscheidbar.
8. Häuser brauchen Dach, Wände, Fenster, sichtbare Tür, Sockel und zur Funktion passende Details.
9. Kein braunes 5×3-Rechteck als fertiges Haus akzeptieren. Die Editor-Grundkacheln sind nur Arbeitsmaterial.
10. Dorfplätze sind erkennbare, nicht überfüllte Treffpunkte.
11. Keine reine Hintergrundillustration als Ersatz für die funktionale Tilemap.

## Spiellogik und Weltübergänge
12. Alle ursprünglichen Story-, NPC-, Boss-, Quest- und Save-Koordinaten bleiben erreichbar.
13. Bestehende Portale, Gegenportale und Spawn-IDs bleiben exakt erhalten, außer bei gesonderter Migration.
14. Häuser erhalten erreichbare Eingänge, echte Innenräume wo vorgesehen, und passende Kollision.
15. Gelände blockiert, was optisch undurchquerbar aussieht; keine unsichtbaren Überraschungswände.
16. Hohe Gras-/Baum-/Dach-Vordergründe überlagern Figuren räumlich korrekt.
17. Benachbarte offene Außenkarten werden an derselben Querschnittsposition betreten: oben/unten, links/rechts.
18. Übergänge dürfen weder Wege noch Landschaftstypen abrupt trennen.
19. Kampf-Gras bleibt nur in dafür vorgesehenen Zonen; Wurzelheim (13,23) und (14,23) sind geschützt.
20. Der Editor-Import darf Mapgrößen oder geschützte Felder nicht unbemerkt verändern.

## Freigabe und Prüfung
21. Jede Karte erhält eine Sichtprüfung in Desktop- und Handyansicht.
22. Jede Karte erhält Kollision-, Tür-, Marker-, NPC- und Save-/Reload-Prüfung.
23. Eine Karte gilt erst als fertig, wenn alle funktionalen Tests bestehen und die Grafik im Gesamtbild überzeugt.

## Wurzelheim: visueller Aufbau
- Nordwesten: Omas Haus als klar lesbarer Anfangsort, nicht verstellen.
- Norden: Kräuterhaus und Haus am See mit erkennbaren Türen und Vorgärten.
- Mitte: einfacher Dorfplatz mit Brunnen, Wegweiser und zwei Bänken.
- Westen/Südwesten: Werkstatt und ergänzende natürliche Waldgruppen.
- Osten/Südosten: Dorfladen, Seeufer, Laternenweg und allmählicher Übergang zu den Geisterwiesen.
- Südroute: Liora, drei Seelenlichter und Piko bleiben auf ihren angestammten Feldern.
- Vorhandene Story- und Gebäudekoordinaten sind wichtiger als symmetrische Architektur.

## Abnahme-Kriterien
- **Technisch:** alle vorhandenen Node-Tests, inklusive `village.cjs`, `first-route.cjs`, `souls-editor-bridge.cjs`.
- **Optisch:** keine Häuser als bloße Platzhalter im endgültigen Spielbild; ruhige Böden; klare Haustüren; nicht zufällige Wegführung.
- **Geltungsbereich dieses ersten Arbeitsschritts:** ausschließlich Bodenoberflächen/Pixeltexturen in `src/village.js` und schriftliche Kriterien. **Nicht abgeschlossen:** editorseitige Haus-Spritebibliothek, kompletter Dorfneubau und die übrigen 59 Karten.

Die funktionale SOULS-Grundkarte bleibt für den Editor-Import bis zu einer geprüften neuen Exportfassung unangetastet.
