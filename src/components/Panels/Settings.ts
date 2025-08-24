import * as BUI from "@thatopen/ui";
import * as CUI from "@thatopen/ui-obc";
import * as OBC from "@thatopen/components";
import { i18n } from "../../locales/i18n";
import { withLocalization } from "../../locales/withLocalization";

export default (components: OBC.Components) => {
  const html = document.querySelector("html")!;

  const onThemeChange = (event: Event) => {
    const selector = event.target as BUI.Selector;
    if (selector.value === 0) {
      html.classList.remove("bim-ui-dark", "bim-ui-light");
    } else if (selector.value === 1) {
      html.className = "bim-ui-dark";
    } else if (selector.value === 2) {
      html.className = "bim-ui-light";
    }
  };

  const onLanguageChange = (event: Event) => {
    const selector = event.target as BUI.Selector;
    const lang = selector.value as string;
    localStorage.setItem("preferred-language", lang);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("lang", lang);
    window.location.href = newUrl.toString();
  };

  return withLocalization(
    BUI.Component.create<BUI.Panel>(() => {
      return BUI.html`
        <bim-panel>
          <bim-panel-section label="${i18n.t("panels.settings.aspect")}" icon="mage:box-3d-fill">
            <bim-selector vertical @change=${onThemeChange}>
              <bim-option
                value="0"
                label="${i18n.t("panels.settings.theme.system")}"
                icon="majesticons:laptop"
                .checked=${!html.classList.contains("bim-ui-dark") && !html.classList.contains("bim-ui-light")}>
              </bim-option>
              <bim-option value="1" label="${i18n.t("panels.settings.theme.dark")}" icon="solar:moon-bold" .checked=${html.classList.contains("bim-ui-dark")}></bim-option>
              <bim-option value="2" label="${i18n.t("panels.settings.theme.light")}" icon="solar:sun-bold" .checked=${html.classList.contains("bim-ui-light")}></bim-option>
            </bim-selector>
          </bim-panel-section>

          <bim-panel-section label="Language" icon="mdi:translate">
            <bim-selector vertical @change=${onLanguageChange}>
              <bim-option value="en" label="English" .checked=${i18n.language === "en"}></bim-option>
              <bim-option value="de" label="Deutsch" .checked=${i18n.language === "de"}></bim-option>
              <bim-option value="fr" label="Français" .checked=${i18n.language === "fr"}></bim-option>
              <bim-option value="it" label="Italiano" .checked=${i18n.language === "it"}></bim-option>
            </bim-selector>
          </bim-panel-section>

          <bim-panel-section label="${i18n.t("panels.settings.worlds")}" icon="tabler:world">
            <div style="padding: 1rem; text-align: center; opacity: 0.7;">
              <p>Worlds configuration will be available in future updates</p>
            </div>
          </bim-panel-section>
        </bim-panel> 
      `;
    }),
    () => {
      console.log("Settings panel updating due to language change");
    },
  );
};
