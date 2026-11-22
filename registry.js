/* Modulverzeichnis: Alle 27 Module an einer Stelle. Neues Modul = neue Zeile.
   Zeile: [id, Name, Gruppe, Icon, Stufe (1 = zuerst), Beschreibung] */
export const GROUPS = ['Kreativität und Medien', 'KI und Technologie', 'Lernen und Wissen', 'Organisation und Alltag', 'Finanzen und Business', 'Gaming'];
const M = [
  ['creatorpilot', 'CreatorPilot', 0, 'spark', 1, 'Ideen, Titel, Beschreibungen, Hashtags, Content-Kalender und Übersetzungen für Creator.'],
  ['ideenstudio', 'Ideenstudio', 0, 'bulb', 2, 'Ideen sammeln, kategorisieren, bewerten und weiterentwickeln.'],
  ['videostudio', 'VideoStudio', 0, 'video', 3, 'Videoprojekte planen und den Produktionsstatus verfolgen.'],
  ['designstudio', 'Designstudio', 0, 'palette', 3, 'Design-, Logo- und Bildprojekte organisieren.'],
  ['ki-zentrale', 'KI-Zentrale', 1, 'chat', 4, 'KI-Chat mit Gesprächsbereichen und Verlauf, zunächst im Demo-Modus.'],
  ['ki-agenten', 'KI-Agenten', 1, 'bot', 4, 'Lern-, Business-, Programmier-, Creator- und Organisationsagent.'],
  ['entwicklerzentrum', 'Entwicklerzentrum', 1, 'code', 2, 'Code-Projekte, Editor, HTML-Vorschau und Fehleranalyse.'],
  ['web-zentrale', 'Web-Zentrale', 1, 'globe', 3, 'Websites und Webprojekte verwalten.'],
  ['technologie-labor', 'Technologie-Labor', 1, 'flask', 3, 'Technologieideen und Experimente dokumentieren.'],
  ['automatisierung', 'Automatisierungszentrum', 1, 'loop', 3, 'Regeln und wiederkehrende Aufgaben planen. Reine Planung, keine Ausführung im Hintergrund.'],
  ['lernzentrum', 'Lernzentrum', 2, 'cap', 1, 'Lernübersicht, Lernfortschritt und Lernmaterialien.'],
  ['wissen', 'Wissensdatenbank', 2, 'book', 2, 'Wissen speichern, kategorisieren, suchen und verknüpfen.'],
  ['schulplaner', 'Schulplaner', 2, 'grid', 2, 'Fächer, Stundenplan, Klassenarbeiten und Hausaufgaben.'],
  ['quiz', 'Quiz- und Testgenerator', 2, 'help', 1, 'Quiz erstellen, Antworten prüfen und Ergebnisse ansehen.'],
  ['vokabeln', 'Vokabeltrainer', 2, 'cards', 1, 'Eigene Vokabellisten, Karteikarten und Abfragemodus.'],
  ['kalender', 'Kalender und Termine', 3, 'cal', 1, 'Monats-, Wochen- und Tagesansicht mit Terminen und Erinnerungen.'],
  ['aufgaben', 'Aufgabenverwaltung', 3, 'check', 1, 'To-do-Listen mit Prioritäten, Fälligkeitsdaten und erledigten Aufgaben.'],
  ['notizen', 'Notizen und Dokumente', 3, 'note', 1, 'Notizen und Dokumente schreiben, kategorisieren und durchsuchen.'],
  ['dateien', 'Dateiverwaltung', 3, 'folder', 2, 'Dateien organisieren, importieren und exportieren, soweit der Browser es erlaubt.'],
  ['konten', 'Passwort- und Kontenübersicht', 3, 'key', 3, 'Kontenbezeichnungen, Benutzernamen und Login-Links. Es werden keine Passwörter gespeichert.'],
  ['email', 'E-Mail-Zentrale', 3, 'mail', 3, 'Entwürfe und Kategorien. Die Posteingangs-Ansicht ist eine Demo ohne echte Anbindung.'],
  ['finanzen', 'Finanzzentrum', 4, 'wallet', 1, 'Einnahmen und Ausgaben erfassen, Monatsübersicht und Diagramme.'],
  ['sparziele', 'Sparziele und Budgetplanung', 4, 'target', 2, 'Sparziele erstellen, Fortschritt anzeigen und Budgets festlegen.'],
  ['business', 'Business-Zentrale', 4, 'brief', 3, 'Geschäftsideen, Geschäftsprojekte, Planungen und Einnahmenübersichten.'],
  ['projekte', 'Projektverwaltung', 4, 'kanban', 1, 'Projekte mit zugeordneten Aufgaben, Status und Fortschritt.'],
  ['statistiken', 'Statistiken und Auswertungen', 4, 'bars', 2, 'Diagramme und Auswertungen deiner gespeicherten Daten.'],
  ['gaming', 'Gaming-Zentrale', 5, 'pad', 3, 'Spielesammlung, Gaming-Projekte und persönliche Statistiken.']
];
/* live: Modul ist in NOVA fertig. href: Verweis auf eine bisherige eigenständige Seite. */
export const MODULES = M.map(([id, name, group, icon, stufe, desc]) =>
  ({ id, name, group, icon, stufe, desc, live: false, href: id === 'creatorpilot' ? 'creatorpilot.html' : null }));
export const byId = id => MODULES.find(m => m.id === id);
