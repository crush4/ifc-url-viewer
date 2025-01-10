export const en = {
  translation: {
    common: {
      loading: "Loading...",
      noData: "No data",
      noUrl: "No URL",
      noDescription: "No description",
      search: "Search...",
      error: "Error: {{message}}",
    },
    panels: {
      selection: {
        title: "Selection Information",
        export: {
          button: "Export Data",
          tooltip: "Export the shown properties to TSV.",
        },
      },
      elementData: {
        title: "Element Data",
        description: "Description:",
        status: "Status:",
        objektgruppe: "Objektgruppe:",
      },
      project: {
        title: "Project",
        loadedModels: "Loaded Models",
        spatialStructures: "Spatial Structures",
        loadModel: "Load IFC Model",
      },
      settings: {
        title: "Settings",
        aspect: "Aspect",
        worlds: "Worlds",
        theme: {
          system: "System",
          dark: "Dark",
          light: "Light",
        },
      },
      help: {
        title: "Help",
      },
    },
    toolbar: {
      tabs: {
        import: "Import",
        selection: "Selection",
        measurement: "Measurement",
      },
      measurement: {
        enabled: "Enabled",
        deleteAll: "Delete all",
        tools: {
          edge: "Edge",
          face: "Face",
          volume: "Volume",
          length: "Length",
          area: "Area",
        },
      },
    },
    emptyState: {
      title: "Open BIM Viewer",
      description:
        "Load your IFC models to explore and analyze building data in real-time.",
      loadButton: "Select IFC",
      dropzoneText: "Drop your .ifc file here or select one",
      sheetsTitle: "📊 Live Data Connection",
      sheetsDescription:
        "Connect your model to live data using Google Sheets. Add URLs to element properties to create live connections.",
      docsTitle: "Documentation",
      docsDescription:
        "Check out our documentation to learn more about features and integrations.",
      docsLink: "View on GitHub",
      sheetIdTip: "The Sheet ID is the long string from your Google Sheets URL",
      sheetIdHint:
        '💡 Tip: Right-click any cell in Google Sheets and select "Get cell link" to copy the URL',
      urlFormat: "Format:",
      urlExample: "spreadsheets/d/1A2B3C4D5E6F7G8H9I0/edit?range=A1",
      connection: "Connection",
      connectionTitle: "📊 Live Data Connection",
      connectionDescription:
        "Connect your model to live data using Google Sheets. Add URLs to element properties to create live connections.",
    },
  },
};
