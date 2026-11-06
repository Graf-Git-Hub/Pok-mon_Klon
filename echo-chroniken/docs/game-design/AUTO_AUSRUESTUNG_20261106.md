# Automatische Gegenstaende und Ausruestungsplaetze

Stand: 06.11.2026. Entwicklungszweig `feature/echo-auto-equipment-20261106` auf dem integrierten EP-Teiler (#40).

## Spielerregel

- **1 / 2 / 3 Ausruestungsplaetze** pro Wesen je nach aktueller Entwicklungsstufe. Der bereits vorhandene passive EP-Teiler belegt einen dieser Plaetze; die vier Kampfattacken bleiben unabhaengig.
- **Rucksack** belegt einen normalen Platz und kann **2 Verbrauchsgegenstaende** aufnehmen. Keine Rucksaecke in Rucksaecken. Zum Ablegen werden darin liegende Items automatisch zurueck in das gemeinsame Inventar gelegt.
- **Seelen-Trank:** Ein zuvor angelegter oder im Rucksack verstauter Trank wird vom Wesen **automatisch bei maximal 30 % verbleibender KP** getrunken (und nur, solange es lebt). Heilmenge wie beim vorhandenen Kampftrank: mindestens 36 KP oder 30 % Max-KP, nie mehr als Max-KP.
- **Entstoerer** hebt den bestehenden `SCHOCK`-Status sofort auf und ist fuer spaetere `PARALYSE`-Zustaende vorbereitet. **Gegengift** heilt `GIFT` und **Brandbalsam** heilt `BRAND` sofort. Die Item-Wirkung ist nicht von der KP-Ampelfarbe abhaengig.
- Keine Rueckfrage, **kein Spielerzug verbraucht**. Ein automatischer Gegenstand kann waehrend der gegnerischen Aktion ausgelöst werden. Danach waehlt der Spieler seine regulaere Aktion, etwa Attacke, Trank oder Wechsel. Maximal ein automatisch eingesetzter Heiltrank pro Schadensereignis; Gegenmittel haben Vorrang.
- **KP-Farben**: gruen bei mehr als 60 %, gelb zwischen ueber 30 % und 60 %, rot ab 30 % (einschliesslich). Die Farbgrenzen decken sich mit der automatischen Heilung.
- Kein Gegenstand aus dem gemeinsamen Inventar wird spontan genutzt: **Nur mitgefuehrte Items** zaehlen. Das normale manuelle Trank-Menue besteht weiter und kostet weiter einen Zug.

## Bedienung

Im Reisetagebuch: **Runen & Ausruestung** -> in Runenlehre `R` bzw. am Handy `R >` -> **AUSRUESTUNG**. Mit `Links/Rechts` Wesen, `Hoch/Runter` Item, `A` an- oder ablegen, `B` zurueck. Die Touch-Kacheln sind direkt anwaehlbar.

Verfuegbar: vorhandene Seelen-Traenke aus dem gemeinsamen Bestand, dazu ein kleines Start-/Migrationsset aus 1 Rucksack, 1 Gegengift, 1 Entstoerer, 1 Brandbalsam. Fuer alte v2-Speicherstaende werden neue Felder beim Laden ergaenzt; die Art-IDs, Story-Flags, alten Traenke und die Android-App-ID werden nicht veraendert.

## Technische Umsetzung und Grenzen

- Im Wesen: `equipment: [{id:'rucksack',contents:['heiltrank',...]}]` oder einzelne Item-Objekte. EP-Teiler bleibt mit dem bestehenden `heldSupportRune` kompatibel. Pro Exemplar nur eine endliche Item-Menge, kein freier Zugriff auf geteilte Traenke waehrend der Autoheilung.
- Im Speicherstand: optionales `gearStock`-Objekt. Save-Schema bleibt **v2**; auch alte Wesen ohne `equipment` bleiben ladbar.
- Kampfbezogene Statusflags sind im Engine-Modell und im HUD vorhanden. Bestehende Attacken koennen **Brand und Schock** ausloesen. Die zusaetzlichen Flags fuer **GIFT/PARALYSE** sind vorbereitet, aber aktuell **keinen bestehenden Attacken zugewiesen**. Eine spaetere Angriffserweiterung und Item-Drops werden gesondert balanciert.
- Die Weiterentwicklung der Beute-, Laden-, Verkaufs- und Rucksack-Verteilungsmechanik bleibt offen; dieses Paket ist die benutzbare Grundausruestung.

## QA

- `node tests/auto-equipment.cjs`: Stufe 1/2/3, Rucksacklimit und Entleeren, EP-Runen-Slot, gemeinsamer Bestand, Gelb-/Rot-Schwelle, Sofort-Kur, kein verbrauchter Zug, Save-v2.
- `python qa/auto-equipment-browser.py`: echter Chrome Desktop und Touch; altes v2-Save, Reisetagebuch, Rucksack ausruesten, Potion einpacken, speichern und neu laden; Screenshots unter `docs/visual-audit/auto-equipment/`.
- Zusaetzlich das bestehende Node-Gesamtpaket und die bestehenden EP-/Runen-/Save-Kompatibilitaetschecks.
