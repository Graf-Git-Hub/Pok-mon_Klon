# Echo-Chroniken: Android Universal (Handy + TV)

**Eine APK** für Android-Handy und Android-TV. Auto-Erkennung per `UiModeManager` / LEANBACK. Die Game-Engine kommt aus `../project/`, die App lädt ausschließlich lokal gepackte Dateien über `WebViewAssetLoader`.

## Bedienung

- START / MENU: plattformübergreifendes **Anzeige- und Steuerungsmenü**. Dort mit Steuerkreuz auswählen, A bestätigen, B schließen. Keine Touch-Eingabe erforderlich.
- `Automatisch`: Android-TV => TV-Ansicht, Android-Handy => Touch-Steuerung.
- `Handy-Modus` und `TV-Modus`: jederzeit manuell erzwingen. Eingabegeräte bleiben in beiden Ansichten unterstützt.
- `A/B-Belegung wechseln`: für Switch-Bluetooth-Geräte, falls A und B anders gemeldet werden.
- Das ursprüngliche Spielmenü ist ebenfalls aus dem Einstellungsmenü erreichbar.
- Smartphone: zusätzliche Touch-Schaltfläche `⚙ Modus` und ein kleiner Ansichtsbutton.

## Einzige App und dauerhafte Updates (ab v0.14)

**Unveränderliche App-ID:** `de.echochroniken.game.stable`.
**Name auf Handy und TV:** `Echo-Chroniken`.
**APK-Datei:** `Echo-Chroniken-Universal.apk` ohne ZIP.

Bisher entstanden ungewollt viele Icons, weil App-ID und Android-Debugsignatur bei neuen
Builds wechselten. Ab v0.14 wird ein **einziger privater Signierschlüssel** für alle Releases
verwendet. Die CI-Pipeline verweigert einen neuen Release, wenn der Signierschlüssel
nicht sicher als GitHub Actions Secret hinterlegt ist. Niemals in den öffentlichen
GitHub-Quellcode hochladen.

### Einmalige Einrichtung des Signierschlüssels

Auf einem eigenen autorisierten Windows-PC mit Java JDK und authentifiziertem
GitHub CLI (`gh auth login`) die Datei
`tools/setup-permanent-signing.ps1` ausführen:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\setup-permanent-signing.ps1
```

Das Skript legt den privaten Schlüssel im eigenen Benutzerprofil unter
`%APPDATA%\EchoChroniken\Signing` ab. Das Passwort ist lokal per Windows DPAPI
geschützt. Die drei benötigten Werte werden in GitHub als verschlüsselte
Actions Secrets gespeichert: `ECHO_KEYSTORE_B64`,
`ECHO_SIGNING_PASSWORD`, `ECHO_SIGNING_ALIAS`.
**Den privaten Schlüssel separat sicher sichern.** Wird er verloren, können
neue Versionen nicht mehr über die installierte App aktualisiert werden.

Erst danach den vorbereiteten Branch `fix/one-stable-android-app` nach
`main` übernehmen. Jede neue `versionCode`-Version kann dann die **gleiche
App** aktualisieren. Den `applicationId` und den Signierschlüssel niemals
für normale Versionen ändern.

### Alte Test-Apps

Frühere Testnamen wie Dorf, Fair, Neu, Paket, Pfad sind technisch **andere
Apps** mit getrennten privaten Spielständen. Android kann sie nicht allein
durch die neue App-ID zusammenführen. **Vor einer Deinstallation Daten
sichern**, falls darin Fortschritt liegt. Erst wenn Echo-Chroniken mit
dem festen Release-Schlüssel installiert und getestet ist, die nicht mehr
benötigten Test-Apps einzeln in Android-Einstellungen > Apps entfernen.

### Build lokal

JDK 17, Android SDK 35 und Gradle 8.11.1. Für einen unsignierten
Entwicklungstest kann `gradle :app:assembleDebug` verwendet werden.
**Nur** `assembleRelease` mit dem festen Schlüssel darf über GitHub
als normale APK veröffentlicht werden; diese Tests sind nicht updatekompatibel
mit den alten Debug-Installationen.

## Weitere Hinweise

- App und Website werden aus derselben `project`-Quelle gebaut, keine doppelte Spiellogik.
- Speicherstände werden lokal im Android-WebView-DOM-Storage hinterlegt. Handy und TV sind **separate Geräte**; die APK allein synchronisiert Spielstände nicht. Export/Import später ergänzen.
- Kontrolliere auf realer Hardware Switch-A/B, D-Pad, analoger Stick, TV-Startseite, Rendering und Neuinstallation vor einer endgültigen Freigabe.
- `android.hardware.touchscreen` ist optional, `LEANBACK_LAUNCHER` ist vorhanden, TV-Banner ist integriert, keine Internetberechtigung.
