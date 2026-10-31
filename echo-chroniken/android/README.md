# Echo-Chroniken: Android Universal (Handy + TV)

**Eine APK** für Android-Handy und Android-TV. Auto-Erkennung per `UiModeManager` / LEANBACK. Die Game-Engine kommt aus `../project/`, die App lädt ausschließlich lokal gepackte Dateien über `WebViewAssetLoader`.

## Bedienung

- START / MENU: plattformübergreifendes **Anzeige- und Steuerungsmenü**. Dort mit Steuerkreuz auswählen, A bestätigen, B schließen. Keine Touch-Eingabe erforderlich.
- `Automatisch`: Android-TV => TV-Ansicht, Android-Handy => Touch-Steuerung.
- `Handy-Modus` und `TV-Modus`: jederzeit manuell erzwingen. Eingabegeräte bleiben in beiden Ansichten unterstützt.
- `A/B-Belegung wechseln`: für Switch-Bluetooth-Geräte, falls A und B anders gemeldet werden.
- Das ursprüngliche Spielmenü ist ebenfalls aus dem Einstellungsmenü erreichbar.
- Smartphone: zusätzliche Touch-Schaltfläche `⚙ Modus` und ein kleiner Ansichtsbutton.

## Build lokal

JDK 17, Android SDK 35, Gradle 8.11.1. Im Ordner `echo-chroniken/android`:

```sh
python3 build_assets.py
# Danach Gradle 8.11.1 ausführen:
gradle :app:assembleDebug
```

GitHub Actions führt diesen Build bei jedem Commit automatisch aus und lädt eine `Echo-Chroniken-Universal-debug.apk` hoch.

**Wichtig:** GitHub-Actions-Debug-APKs werden ohne dauerhaft eingerichteten Signaturschlüssel pro Runner anders signiert. Ein Update über eine bereits installierte Version funktioniert dann *nicht* sicher. Für dauerhafte Updates muss eine feste private Test-/Release-Signatur sicher hinterlegt werden. Nie einen produktiven Signaturschlüssel öffentlich ins Repository committen. Für die ersten Tests kann die App nach Datensicherung neu installiert werden.

## Weitere Hinweise

- App und Website werden aus derselben `project`-Quelle gebaut, keine doppelte Spiellogik.
- Speicherstände werden lokal im Android-WebView-DOM-Storage hinterlegt. Handy und TV sind **separate Geräte**; die APK allein synchronisiert Spielstände nicht. Export/Import später ergänzen.
- Kontrolliere auf realer Hardware Switch-A/B, D-Pad, analoger Stick, TV-Startseite, Rendering und Neuinstallation vor einer endgültigen Freigabe.
- `android.hardware.touchscreen` ist optional, `LEANBACK_LAUNCHER` ist vorhanden, TV-Banner ist integriert, keine Internetberechtigung.
