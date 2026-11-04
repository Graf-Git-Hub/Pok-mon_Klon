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
zufälligem Schaden abweichen. Keine JavaScript-Fehler. Acht neue
Szenenbilder plus JSON-Bericht wurden lokal kontrolliert.

Die Screenshots zeigten die Spielwelt, den Schmelzmeisterkampf,
das Steinrätsel und das freigeschaltete Kapitel 8. Die Pixelgrafik
und die großen ungenutzten Flächen in der Handy-Hochformatansicht
sind weiterhin Gestaltungsaufgaben.

## Grenzen

Der Spielstand beginnt nach Kapitel 5 und nutzt absichtlich ein
**Level-55-Testwesen mit 480 KP**. Das ist kein Test der normalen
Spielbalance, kein durchgehender Spielstart bei Kapitel 1 und kein
Test auf einem echten Android-Handy oder Fernseher. Es wird keine
neue APK erzeugt. App-ID, Signatur, Monster-IDs und Save-Schema
bleiben unverändert. Nach Integration ins GitHub-CI werden Bilder
und Berichte als Artefakt `echo-browser-checkpoints` bereitgestellt.
