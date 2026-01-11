# SchwarzenTracker

Trainingsapp zum Tracken der Fortschritte in einem modernen Design, als Webapp (PWA) um breite Verfuegbarkeit zu gewaehrleisten.

---

## Uebungen

Der zentrale Baustein der App - ein umfangreicher Pool an Uebungen.

### Grundfunktionen
- [ ] Pool an Uebungen mit Name und detaillierter Beschreibung (Schritt-fuer-Schritt Anleitung)
- [ ] Kategorisierung nach Muskelgruppen (primaer/sekundaer)
- [ ] Equipment-Typ (Langhantel, Kurzhantel, Maschine, Kabelzug, Koerpergewicht, Kettlebell, Band)
- [ ] Uebungsart (Compound/Mehrgelenkig, Isolation/Eingelenkig, Cardio, Stretching)

### System- und User-Uebungen
- [ ] Grundstock an Basisuebungen wird mit der App ausgeliefert (Seed-Data)
- [ ] System-Uebungen sind schreibgeschuetzt
- [ ] User kann eigene Uebungen erstellen
- [ ] User kann System-Uebungen "forken" (kopieren und anpassen)

### Varianten-System
- [ ] Uebungen koennen Varianten haben (z.B. Schraegbank-Druecken als Variante von Bankdruecken)
- [ ] Tab-Panel UI zum Wechseln zwischen Varianten
- [ ] Varianten teilen die Basis-Statistiken aber haben eigene Ausfuehrungsdetails

### Personalisierung
- [ ] Favoriten-Funktion fuer schnellen Zugriff
- [ ] Persoenliche Notizen zu jeder Uebung
- [ ] Eigene Statistiken (PRs, letztes Training) pro Uebung

### Medien (spaetere Ausbaustufen)
- [ ] AI-generierte Bildstrecken zur Visualisierung der Ausfuehrung
- [ ] Video-Integration (extern oder generiert)

---

## Trainingsplan

Strukturierte Zusammenstellung von Uebungen fuer regelmaessiges Training.

### Grundfunktionen
- [ ] Trainingplan beinhaltet verschiedene Uebungen
- [ ] Anzahl der Saetze pro Uebung
- [ ] Ziel-Arbeitsgewicht und Wiederholungszahl
- [ ] Definition der Ausfuehrungsreihenfolge

### Intelligente Features
- [ ] Ueberblick welche Muskelgruppen der Plan in welcher Intensitaet beansprucht
- [ ] Empfehlungen bei zu hoher oder zu niedriger Intensitaet
- [ ] Pausenzeiten zwischen Saetzen definierbar

### Flexibilitaet
- [ ] "Geraet besetzt"-Button zum Ueberspringen/Verschieben einer Uebung
- [ ] Alternative Uebungen vorschlagen wenn Geraet nicht verfuegbar

---

## Workouts

Ausgefuehrte Trainingseinheiten - das Herzstuck des Trackings.

### Tracking
- [ ] Workouts sind ausgefuehrte Trainingsplaene
- [ ] Datum und Uhrzeit der Ausfuehrung
- [ ] Alle Saetze mit Arbeitsgewicht und Wiederholungszahl
- [ ] PR-Tracking (Personal Records) automatisch erkennen

### Live-Features
- [ ] Timer fuer Einhaltung der Pausenzeiten
- [ ] Audiosignale bei Timer-Ende
- [ ] Schnelles Logging waehrend des Trainings

### Motivation
- [ ] Meme-Integration je nachdem wie die Uebung lief

---

## Statistik

Visualisierung des Fortschritts und der Trainingshistorie.

### Uebungsbezogen
- [ ] Arbeitsgewichtsverlauf pro Uebung (Graph)
- [ ] PR-Historie

### Workoutbezogen
- [ ] Gesamtvolumen je Workout
- [ ] Dauer der Workouts

### Langzeit
- [ ] Einhaltung des Trainingsplans ueber Zeitraum
- [ ] Woechentliche/monatliche Zusammenfassungen

---

## Benutzer/Profil

Persoenliche Daten und Einstellungen.

### Koerperdaten
- [ ] Gewicht, Groesse, Alter
- [ ] Koerpergewicht-Verlauf tracken

### Trainingsprofil
- [ ] Trainingsziele (Muskelaufbau, Kraft, Ausdauer)
- [ ] Erfahrungslevel (Anfaenger, Fortgeschritten, Profi)

### Einstellungen
- [ ] Einheiten (kg/lbs)
- [ ] Sprache
- [ ] Benachrichtigungen

---

## Progression

Intelligente Trainingssteuerung.

### Automatische Steigerung
- [ ] Gewichtssteigerung bei erreichten Wiederholungszielen vorschlagen
- [ ] Anpassbare Steigerungslogik (z.B. +2.5kg bei 3x8 geschafft)

### Periodisierung
- [ ] Deload-Wochen einplanen
- [ ] Mesocycles unterstuetzen
- [ ] Empfehlungen basierend auf Trainingshistorie

---

## Offline-Faehigkeit (PWA)

Zuverlaessiges Tracking auch ohne stabiles WLAN im Gym.

- [ ] Progressive Web App
- [ ] Lokale Datenspeicherung
- [ ] Automatische Synchronisation bei Verbindung
- [ ] Installierbar auf Homescreen

---

## Datenexport

Kontrolle ueber die eigenen Daten.

- [ ] Backup-Funktion (JSON/CSV)
- [ ] Import von anderen Fitness-Apps
- [ ] Export fuer externe Analyse

---

## Gamification

Motivation durch spielerische Elemente.

- [ ] Streaks (Trainingstage in Folge)
- [ ] Achievements/Badges (erstes Workout, 100kg Bankdruecken, etc.)
- [ ] Level-System basierend auf Trainingsvolumen

---

## Soziale Features (spaeter)

Community und Wettbewerb.

- [ ] Trainingsplan teilen
- [ ] Challenges mit Freunden
- [ ] Leaderboards
