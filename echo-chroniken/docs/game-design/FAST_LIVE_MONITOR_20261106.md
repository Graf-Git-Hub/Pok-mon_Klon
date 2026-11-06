# Echo-Chroniken: geschützter schneller Handy-Spielmonitor

**Stand: 06.11.2026.** Testplattform: Laura (Windows). Kein Eingriff in das reguläre Spielerprofil oder die Spielstände.

## Betrieb ohne lokale Bedienung

Auf Laura laufen die vier parallelen Playwright-Spieltests weiterhin im isolierten Entwicklungs-Worktree. Die Spielbrowser erzeugen verkleinerte JPEG-Screenshots direkt von ihrer **Spielseite**, niemals vom gesamten Desktop, von anderen Browserfenstern oder privaten Dateien. Für neu gestartete Testläufe ist der Bildabstand auf rund **6 Sekunden** begrenzt, solange Spielfortschritt oder Eingaben stattfinden. Das Dashboard fragt den aktuellen Status alle **3 Sekunden** ab.

Der getrennte Python-Dienst `project/qa/remote_live_server.py` lauscht ausschließlich an `127.0.0.1:8898`. Der selbstständig installierte und gestartete offizielle `cloudflared`-Client baut eine ausgehende HTTPS-Verbindung zu einem **temporären Cloudflare Quick Tunnel**. Keine Portfreigabe oder Router-Konfiguration ist nötig.

## Schutzmaßnahmen

- Nur freigegebene Spielstatusdaten, bereinigte Spielereignisse und Bilder `RUN-001.jpg` bis `RUN-100.jpg` werden ausgeliefert.
- Kein Zugriff auf das Dateisystem, Test-Saves, Fehlerspuren mit lokalen Pfaden, Fernsteuerung, Shell, Aktionen zum Stoppen/Starten oder Ausführen von Programmen.
- Die öffentliche Route verweigert Zugriffe ohne korrektes, zufällig erzeugtes Zugangstoken (HTTP 403). Ein einmaliger Link mit `?key=...` erzeugt ein sicheres HTTPS-Cookie (HttpOnly, Secure, SameSite=Lax). Der Browser wird anschließend auf die tokenfreie Startseite weitergeleitet. **Zugangslink nicht in GitHub oder im öffentlichen Dashboard speichern.**
- Der zufällige Token liegt nur auf Laura unter `docs/visual-audit/parallel-lab/remote_live_access.key`, außerhalb der versionierten Quelldateien.
- Das weiterhin bestehende öffentliche GitHub-Pages-Dashboard ist ein Rückfallweg und verwendet seinen bisherigen langsameren Statuspublisher.

## Testprotokoll

- Installation von `Cloudflare.cloudflared` (Windows-Paket 2026.10.7) per Winget auf Laura erfolgreich.
- Lokaler Zugriff ohne Token: **403**, korrekte Spielsitzung: 100 Varianten, 4 aktive Monitore, echte JPEG-Dateien (HTTP 200).
- Cloudflare-HTTPS-Verbindung von außerhalb des lokalen Dienstes durchgängig getestet: Startseite (200), bereinigte Status-API (200), Spielbild (200).
- Mobile-Chromium-Test mit 412 × 915 Pixeln: alle 100 Karten, vier Monitorbereiche und mindestens drei echte Bilder sichtbar; JavaScript ohne Laufzeitfehler.
- Vier parallele Tests liefen auf Laura. Gemessene CPU-Auslastung bei vier gleichzeitigen Spielern ungefähr 69 %, freier Arbeitsspeicher ungefähr 28 GB. Deshalb zunächst auf vier beschränkt.

**Wichtige Grenze:** Quick Tunnels sind temporäre Testzugänge. Sie haben laut Cloudflare keine Verfügbarkeitsgarantie und erhalten bei einem Neustart eine neue URL. Ohne Tunnelprozess oder bei ausgeschaltetem Laura-Rechner funktioniert der private Fast-Live-Link nicht. Eine dauerhafte eigene Adresse würde eine separat konfigurierte benannte Tunnel-Instanz und normalerweise eine Domain voraussetzen. Hierfür wurden keine Nutzerzugangsdaten angefordert oder verändert.
