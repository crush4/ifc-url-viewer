import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as CUI from "@thatopen/ui-obc";
import { i18n } from "../../locales/i18n";
import groupings from "./Sections/Groupings";

export default (components: OBC.Components) => {
  const [modelsList] = CUI.tables.modelsList({ components });

  const [loadBtn] = CUI.buttons.loadIfc({ components });
  loadBtn.label = i18n.t("panels.project.loadModel");
  loadBtn.style.width = "100%";
  loadBtn.style.marginBottom = "1rem";

  return BUI.Component.create<BUI.Panel>(() => {
    return BUI.html`
      <bim-panel>
        <bim-panel-section label="${i18n.t("panels.project.loadedModels")}" icon="mage:box-3d-fill">
          ${loadBtn}
          ${modelsList}
        </bim-panel-section>
        <bim-panel-section label="Spatial Structures" icon="ph:tree-structure-fill">
          <div style="padding: 1rem; text-align: center; opacity: 0.7;">
            <p>Spatial structure view will be available in future updates</p>
          </div>
        </bim-panel-section>
        
        ${groupings(components)}
      </bim-panel> 
    `;
  });
};
