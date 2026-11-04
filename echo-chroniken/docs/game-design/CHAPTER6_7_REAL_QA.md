# Kapitel 6 und 7: echte Browser-Steuerung (04.11.2026)

## Verifizierter Durchlauf

`project/qa/real-chapter6-7.py` beginnt mit einem bereits
abgeschlossenen Kapitel 5 am Bahnhof Stillwasser. **Ein einziger
Spielstand** wird anschließend mit tatsächlicher Tastatur- und
Touchsteuerung durch Kapitel 6 und 7 bis zum Tor von Kronenstadt
geführt. Der Test liest die Weltkollisionen nur, um begehbare Wege zu
planen. Die Bewegung, Dialoge und Kämpfe laufen über die echten
Spieleingaben, nicht über direkte Quest- oder Sieg-Callbacks.

### Kapitel 6
- Zugang nach Aschenruh, Schmiede und Glutschacht
- Sicherheitsbuchseiten und die drei eingeschlossenen Arbeiter
- Blockiertes Stadttor des nächsten Kapitels vor Abschluss
- Bewusst falsch betätigter Regler 2, dann Regler 1 und 3,
  Druckablass und Regler 2
- Resonanzgehäuse sichern und Edda damit konfrontieren
- Schmelzmeister und Ofenkern in echten Kämpfen besiegen
- Resonanzwerkzeug erhalten, Belohnung nur einmal, Save/Reload
- Portal nach Kapitel 7 freigeschaltet

### Kapitel 7
- Drei Rituale und Nalias Zustimmung
- Drei Geschichten im Namensarchiv
- Stadttor vorzeitig gesperrt
- Kontinuum-Jäger besiegen, falschen Namensstein abweisen
- Steine WASSER, WURZEL, FLAMME, LICHT aktivieren
- Namensschatten in echtem Kampf besiegen
- Vaters Namenskarte, Echo-Spuren und einmalige Belohnung
- Save/Reload und Zugang nach Kronenstadt (Kapitel 8)

## Lokale Prüfung

Chrome 157 auf Laura, **isolierter** Git-Worktree
`Echo_Chapter5_Debug_20261104`, erfolgreich mit Exitcode 0.
Je Desktop und Touch: 582 echte Bewegungen, 38 Dialogaktionen,
18 Attacken, vier Siege, 18 Kartenübergänge und vier Save-Reload-
Prüfungen. Insgesamt **1.164 Schritte, 76 Dialoge und acht
Boss-Siege**. Die exakte Zahl der benötigten Attacken kann wegen
zufälligem Schaden abweichen. Keine JavaScript-Fehler. Insgesamt
18 neue Szenenbilder (neun pro Ansicht) plus JSON-Bericht wurden
lokal kontrolliert.

Die Screenshots zeigten die Spielwelt, den Schmelzmeisterkampf,
das Steinrätsel und das freigeschaltete Kapitel 8. Die Pixelgrafik
und die großen ungenutzten Flächen in der Handy-Hochformatansicht
sind weiterhin Gestaltungsaufgaben.

## Unabhängig bestätigter GitHub-Cloud-Lauf

[GitHub Actions 41849768150](https://github.com/Graf-Git-Hub/Pok-mon_Klon/actions/runs/41849768150)
wurde am 04.11.2026 mit Chrome 156 erfolgreich abgeschlossen.
Für Kapitel 6 und 7 zusammen wurden erneut 582 reale Schritte,
38 Interaktionen und vier echte Boss-Siege pro Ansicht bestätigt.
Die zufallsabhängige Angriffszahl betrug 17 auf Desktop und 18
auf Touch. Die übrigen bisherigen Kapitel-, Archiv- und Kampftests
waren ebenfalls grün. Keine JavaScript-Ausnahmen. Das Artefakt
`echo-browser-checkpoints` enthält die 18 neuen Bilder und
den JSON-Bericht (`real-chapter6-7/`).

## Grenzen

Der Spielstand beginnt nach Kapitel 5 und nutzt absichtlich ein
**Level-55-Testwesen mit 480 KP**. Das ist kein Test der normalen
Spielbalance, kein durchgehender Spielstart bei Kapitel 1 und kein
Test auf einem echten Android-Handy oder Fernseher. Es wird keine
neue APK erzeugt. App-ID, Signatur, Monster-IDs und Save-Schema
bleiben unverändert. PR #19 wurde nach den drei erfolgreichen
GitHub-Workflows in `main` integriert (Commit `cf78d1e`).
