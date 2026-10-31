# Echo-Chroniken 🎮👻

## 📲 APK direkt herunterladen (Handy + Android-TV)

**[⬇️ Aktuelle Echo-Chroniken APK herunterladen](https://github.com/Graf-Git-Hub/Pok-mon_Klon/releases/download/android-latest/Echo-Chroniken-Universal.apk)**

- **Nur eine .apk, keine ZIP-Datei.** Auf dem Handy herunterladen und antippen, um zu installieren.
- **Immer derselbe Link:** Der GitHub-Workflow ersetzt die APK nach jedem erfolgreichen Build aus `main` automatisch.
- Die APK wird nur veröffentlicht, wenn die Tests und der Android-Build erfolgreich sind.
- Diese Ausgabe ist aktuell eine **Testversion mit Debug-Signierung**. Bis eine dauerhaft gleiche Signierung eingerichtet ist, kann für Updates eine Neuinstallation nötig sein.
- Alternativ: [GitHub Releases öffnen](https://github.com/Graf-Git-Hub/Pok-mon_Klon/releases/tag/android-latest).

---

GBA-inspiriertes Fantasy-RPG mit 150 Geisterwesen, klassischen Kämpfen, Touchsteuerung und Gamepad-Eingabe.

## 👵 Neu in V0.8: Spielbeginn bei Oma

- **Neue Spielstände starten in Omas begehbarem Haus**, nicht mehr auf der Wiese.
- Oma spricht mit dir über das Paket. Auf dem Tisch steht ein goldverschnürter Karton mit Glanzmarkierung.
- Erst Oma ansprechen, dann Paket öffnen: **Miora schließt sich deinem Team an**.
- Danach wieder mit Oma reden und das Haus verlassen; vor dem Paketfund hält Oma dich freundlich auf.
- Rückkehr ins Haus jederzeit möglich; Oma kann deine Monster heilen.
- **Alte Spielstände bleiben erhalten** und überspringen das Intro, falls Miora schon im Team ist.
- Für den gesamten Einstieg gibt es den automatischen Test `echo-chroniken/project/tests/house.cjs`.
- Derselbe Spielcode läuft auf Handy und Android-TV. APK wird bei jedem erfolgreichen Android-Build über den [direkten APK-Link](https://github.com/Graf-Git-Hub/Pok-mon_Klon/releases/download/android-latest/Echo-Chroniken-Universal.apk) bereitgestellt.

## V0.6: Wurzelheim & Attackenbuch

- Neues Pixel-Dorf mit Dachziegeln, Gartendekoration, Pflasterweg und Laternen.
- Wilde Wesen im Startgebiet: nur erste Entwicklungsstufe, Level 2–4.
- Neu ausbalancierter Kampfschaden und Schonfrist nach Begegnungen.
- Attacken mit Level lernen, niemals vergessen, sortierbar per L/R, auf Touch per Pfeilen; neue Attacken zuerst.
- Spielbare Handyversion mit virtueller Steuerung und Kampf-Testfeld.

### Downloads / Projekt

- **[Direkt spielbare Offline-HTML](echo-chroniken/index.html)**: Datei herunterladen und auf dem Handy im Browser öffnen.
- **[Modulares Spielprojekt](echo-chroniken/project/)**: `index.html`, Spiellogik, 150 Arten, Monsteratlas, 8 Rückansichten und CSS.
- **[Tests](echo-chroniken/project/tests/smoke.cjs)**: `node tests/smoke.cjs` im Projektordner; GitHub Actions prüft bei Änderungen.

Der Android-TV-APK-Build und ein Test mit einem realen Switch-Controller stehen noch aus. Für die übrigen 142 Monster fehlen richtige Rückenansichten.
