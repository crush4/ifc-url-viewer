export const de = {
  translation: {
    common: {
      loading: "Laden...",
      noData: "Keine Daten",
      noUrl: "Keine URL",
      noDescription: "Keine Beschreibung",
      search: "Suchen...",
      error: "Fehler: {{message}}",
    },
    panels: {
      selection: {
        title: "Auswahlsinformationen",
        export: {
          button: "Daten exportieren",
          tooltip: "Exportiert die angezeigten Eigenschaften als TSV.",
        },
      },
      elementData: {
        title: "Elementdaten",
        description: "Beschreibung:",
        status: "Status:",
        objektgruppe: "Objektgruppe:",
        states: {
          loading: "Daten werden geladen...",
          noSelection: "Wählen Sie ein Element aus, um Details anzuzeigen",
          noData: "Keine Daten verfügbar",
          noDescription: "Keine Beschreibung verfügbar",
          error: "Daten konnten nicht geladen werden",
        },
      },
      project: {
        title: "Projekt",
        loadedModels: "Geladene Modelle",
        spatialStructures: "Räumliche Strukturen",
      },
      settings: {
        title: "Einstellungen",
        aspect: "Aspekt",
        worlds: "Welten",
        theme: {
          system: "System",
          dark: "Dunkel",
          light: "Hell",
        },
      },
      help: {
        title: "Hilfe",
      },
    },
    toolbar: {
      tabs: {
        import: "Importieren",
        selection: "Auswahl",
        measurement: "Messen",
      },
      measurement: {
        enabled: "Aktiviert",
        deleteAll: "Alles löschen",
        tools: {
          edge: "Kante",
          face: "Fläche",
          volume: "Volumen",
          length: "Länge",
          area: "Fläche",
        },
      },
    },
    emptyState: {
      title: "Open BIM Viewer",
      description:
        "Laden Sie Ihre IFC-Modelle, um Gebäudedaten in Echtzeit zu erkunden und zu analysieren.",
      loadButton: "IFC auswählen",
      dropzoneText:
        "Ziehen Sie Ihre .ifc-Datei hierher oder wählen Sie eine aus",
      sheetsTitle: "📊 Live-Datenverbindung",
      sheetsDescription:
        "Verbinden Sie Ihr Modell mit Live-Daten über Google Sheets. Fügen Sie URLs zu Elementeigenschaften hinzu, um Live-Verbindungen zu erstellen.",
      docsTitle: "Dokumentation",
      docsDescription:
        "Schauen Sie in unsere Dokumentation, um mehr über Funktionen und Integrationen zu erfahren.",
      docsLink: "Auf GitHub ansehen",
      sheetIdTip:
        "Die Sheet-ID ist die lange Zeichenfolge aus Ihrer Google Sheets URL",
      sheetIdHint:
        '💡 Tipp: Klicken Sie mit der rechten Maustaste auf eine Zelle in Google Sheets und wählen Sie "Link zur Zelle kopieren"',
      urlFormat: "Format:",
      urlExample: "spreadsheets/d/1A2B3C4D5E6F7G8H9I0/edit?range=A1",
      connection: "Verbindung",
      connectionTitle: "📊 Live-Datenverbindung",
      connectionDescription:
        "Verbinden Sie Ihr Modell mit Live-Daten über Google Sheets. Fügen Sie URLs zu Elementeigenschaften hinzu, um Live-Verbindungen zu erstellen.",
    },
  },
};
