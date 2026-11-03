# Cloud-Browserprüfung ohne eingeschalteten PC

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
