# Echo-Chroniken · Kapitel 2 · Grafische Sichtprüfung

Stand: 01.11.2026

## Geprüfte Szenen

Die Aufnahmen sind **echte Chrome-Spielbilder** der modularen Version im Querformat (1280 × 720). Sie stammen aus isolierten Testspielständen, nicht aus Bildgenerierung oder einem Mockup.

| Aufnahme | Aussage |
|---|---|
| [Waldruinen-Eingang](visual-audit/ch2-entrance.png) | Eingang am Waldpfad sichtbar; Spieler steht direkt davor; Hinweis A: WALDRUINE |
| [Innenraum](visual-audit/ch2-interior.png) | Original-Pixelarchitektur mit Wurzeln, gebrochenen Steinen, drei deutlich verschiedenen Siegeln |
| [Rätsel](visual-audit/ch2-puzzle.png) | Wurzelsiegel aktiviert, Spieler unmittelbar daneben |
| [Wächteraltar](visual-audit/ch2-altar.png) | Drei Siegel aktiviert, Altar ist freigegeben |
| [Erinnerungshüter-Kampf](visual-audit/ch2-boss.png) | Eigener Gegner mit Maske/Wurzelkrone im Game-Boy-Kampfmenü |

## Tatsächliche Sichtbefunde und Korrekturen

1. **Erster Innenraum war zu symmetrisch und monochrom.** Danach wurden Bruchkanten, Wurzelwerk, unregelmäßige Bodenrisse und differenzierte Grün-/Wasser-/Gold-Glyphen ergänzt.
2. **Erste Wächteransicht war oben abgeschnitten.** Bosssprite wurde tiefer gesetzt. Der Kampftext wurde gekürzt, weil er das Dialogfeld unnötig füllte.
3. **Unklare Interaktionszonen.** Fußzeile nennt nun das konkrete nahe Objekt oder die nötige Aktion; B verlässt die Ruine. Eingang ist auf der Entdeckerkarte markiert.
4. **Keine Doppelbelohnung.** Story-Wächter und Oma-Bericht haben gespeicherte Abschlussflags. Der Starter wird vor dem Wächter geheilt; Gegner ist Level 5 und verursacht verringerten Schaden.

## Regelprüfungen

- `node tests/ruins.cjs`: alle Siegel, Altar, Inschrift und Ausgang erreichbar; Rätselreihenfolge und Reward.
- `node tests/ruins-integration.cjs`: reale A/D-Pad-Kommandos, Tor, drei Siegel, Boss-Dialog, Rückweg, Omas Folgedialog, Speicherstand.
- Bisherige Spiel-, Balancing- und Android-Build-Tests bleiben aktiv.
- Bei diesen Aufnahmen **keine Browser-JavaScript-Fehler** beobachtet.

## Offene Qualitätsgrenzen

- Es ist ein bewusst kompakter **Story-Abschnitt**, noch kein riesiger Dungeon. Die Waldrouten der Vorgängerversion dienen als Zugang.
- Geräteprüfung auf einem **echten Android-TV mit Switch-Controller** steht weiterhin aus.
- Die feste Android-Release-Signierung ist weiterhin nicht aktiviert. Bis dahin keine neue öffentlich installierbare APK und kein weiteres App-Symbol.
- Später sinnvoll: Boss mit zusätzlichen Animationsphasen, mehr akustische Rückmeldung und unabhängiger Langzeit-Spieldurchlauf.

Die SOULS-Referenz diente als **Gestaltungsregel** (freier Weg, sichtbare Wandhöhe, Kachelübergänge, echte Spielbildkontrolle). Keine SOULS-RPG-Maker-Grafiken wurden kopiert.
