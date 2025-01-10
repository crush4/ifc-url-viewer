import { i18n } from "./i18n";

export function withLocalization<
  T extends { requestUpdate: () => void; disconnectedCallback?: () => void },
>(component: T, updateCallback: () => void): T {
  const handleLanguageChange = () => {
    updateCallback();

    // Force re-render of all BIM components
    document
      .querySelectorAll(
        [
          "bim-panel",
          "bim-toolbar",
          "bim-toolbar-section",
          "bim-panel-section",
          "bim-button",
          "bim-text-input",
          "bim-tabs",
          "bim-tab",
        ].join(","),
      )
      .forEach((element) => {
        (element as any).requestUpdate?.();
      });

    if ("template" in component && typeof component.template === "function") {
      const currentTemplate = component.template;
      component.template = () => currentTemplate();
    }
    component.requestUpdate();
  };

  i18n.on("languageChanged", handleLanguageChange);

  const originalDisconnectedCallback = component.disconnectedCallback;
  component.disconnectedCallback = function disconnectedCallback() {
    i18n.off("languageChanged", handleLanguageChange);
    if (originalDisconnectedCallback) {
      originalDisconnectedCallback.call(component);
    }
  };

  return component;
}
