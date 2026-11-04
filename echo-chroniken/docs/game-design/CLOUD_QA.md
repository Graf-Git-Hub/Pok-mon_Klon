# Cloud-Browserprüfung ohne eingeschalteten PC

## Praxisdurchlauf Kapitel 5: Stillwasser (PR #18)
`project/qa/real-chapter5.py` steuert im echten Chrome-Browser
auf Desktop und Handy die gesamte Stillwasser-Questkette ab einem
erledigten Kapitel-4-Save: Bewohner zweimal befragen, Archivhinweise,
Lyra-Berechtigung, Turm freischalten, Stromkabel trennen, Spiegel-
und Lyra-Kampf, Antenne abschalten, Bahnfahrt und Rueckfahrt.
Echte Eingaben statt direkter Travel-/Victory-Callbacks; Tiles
werden ausschliesslich zur Wegplanung gelesen.

GitHub-Cloud-Lauf 41846368280: PASS (Chrome 156).
Unabhaengige lokale Gegenprobe auf Laura: PASS (Chrome 157).
Zusammen ueber beide Ansichten 560 Schritte, 52 Dialogaktionen,
vier echte Boss-Siege, 14 Attacken, vier Bahnfahrten und acht
Speicherpruefungen. Im Cloud-Artefakt liegen 16 Screenshots
und ein JSON-Bericht im Ordner `real-chapter5/`.

Nicht verifiziert: Level-Balance (absichtlich Lv55), Einstieg
ab Kapitel 1, Bewegung ueber alle 14 Kapitel am Stueck,
APK-Ausfuehrung auf einem echten Handy oder TV. Optische
Qualitaet und mobiler freier Leerraum brauchen Feinschliff.

## Praxisdurchlauf Kapitel 4 (PR #17)
`project/qa/real-chapter4.py` kontrolliert den echten Ablauf mit
Tastatur und Touch. Es gibt KEINEN direkten `travel()`- oder
`victory()`-Aufruf durch den Test. Stattdessen werden nur Karten-
kollisionen zur Wegplanung gelesen und alle Aktionen ueber die
echte Spielsteuerung durchgefuehrt. Nach Weichenloesung, zwei
Kaempfen und der Bahn-Rueckfahrt prueft er Save/Reload und das
Ausbleiben doppelter Belohnungen. Je Ansicht entstehen neun
Screenshots (18 insgesamt), hochgeladen im Ordner `real-chapter4/`.
GitHub-Run 41743136449 war SUCCESS.

**Grenzen:** Start nach bestandenem Kapitel 3 mit absichtlich
starkem Test-Team (Level 55). Es ist ein funktionaler Kapiteltest,
keine Pruefung der Anfaengerbalance, der Spielhandlung ab Kapitel 1
oder eines echten Android-Geraets.

## Praxisdurchlauf im Kapitel 3 (GitHub PR #16)
`project/qa/real-chapter3.py` bedient das echte Spiel mit
Tastatur- und Touch-Kommandos. Die Skript-Pfadplanung liest nur
Weltkollision und Marker; Spielbewegungen und Dialoge selbst
laufen per A-Taste und Richtungstasten. Der Ablauf testet
drei Zeugen, zwei verschlossene Tore, Pumpwerksraetsel, den
realen Pumpenwaechter-Kampf, Questbelohnung, Reload und den
Wurzeltunnel als naechsten Kapiteleinstieg. Es werden je
Viewport vier Screenshots in `real-chapter3/` erzeugt.

**Nicht abgedeckt:** Spielstart, normaler Schwierigkeitgrad
(Testteam bewusst Lv55), restliche Kapitel 4-14 mit echtem Laufen
und Android-Hardware. Der Test ist ein Nachweis fuer die Route,
kein Beleg fuer ein vollstaendig fehlerfreies Spiel.

GitHub Actions kann die vorhandenen Playwright-Browserprüfungen auf einem Linux-Runner starten. Laura, Codex und der stündliche Entwicklungswächter sind dafür nicht nötig.

## Auslöser
- Automatisch bei Pull Requests mit Änderungen an `echo-chroniken/project/**` oder dem Workflow `.github/workflows/echo-browser-qa.yml`.
- Manuell über **GitHub → Actions → Echo-Chroniken Browser Screenshots (Cloud) → Run workflow**.
- Keine stündlichen oder sonstigen zeitgesteuerten Durchläufe.

Der Workflow startet echte Chrome-Browserprüfungen der Story-/Postgame-Checkpoints, des Archivs inklusive Save-Migration und eines Tastatur-/Touch-Kampfes. Er prüft JavaScript-Fehler und erzeugt Screenshots. Die Bilder und JSON-Berichte sind als GitHub-Artefakt `echo-browser-checkpoints` sieben Tage verfügbar.

## Grenzen
Diese Prüfungen starten vorbereitete Spielstände. Sie beweisen **nicht**, dass sich Kapitel 1 bis 14 ohne Unterbrechung durchspielen lassen, und ersetzen keine Tests auf einem echten Android-Handy oder Fernseher. Die Prüfung führt keinen App-Release aus und verändert keine gespeicherten Spielstände der Nutzer.

## Kosten und Bedienung
Der separate Workflow wird nur bei einschlägigen Pull Requests oder auf ausdrücklichen manuellen Start ausgeführt. Bei einer neueren Version desselben Pull Requests wird ein veralteter Browserlauf abgebrochen. GitHub Actions kann je nach Konto und Kontingent Kosten verursachen.

**Nächste Entwicklungsaufgabe:** echte, zusammenhängende Story-Interaktionen von Kapitel 1 bis 14 testbar machen, Softlocks erfassen und gefundene Bugs im Spielcode korrigieren. Bestehende Kapitel-Tests in `project/tests/` bleiben die Grundlage.

## Android-Builds und Kosten

Die Android-Actions werden nur bei Änderungen an tatsächlich gebündelten Web-Spielquellen (`project/src`, `styles`, `data`, `assets`, `index.html`), den nativen Android-Dateien oder der Android-Workflowdatei gestartet. Reine Änderungen an `project/tests` und `project/qa` lösen weiterhin Node- und Browserprüfungen aus, aber **keinen Android-Debug-Build**. Das entspricht der Auswahllogik von `android/build_assets.py`. Bei einer tatsächlichen Gameplay-/Android-Änderung bleibt die vollständige Android-Build- und Signaturprüfung bestehen.
