import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as CUI from "@thatopen/ui-obc";
import { i18n } from "../../locales/i18n";
import groupings from "./Sections/Groupings";

export default (components: OBC.Components) => {
  const [modelsList] = CUI.tables.modelsList({ components });
  const [relationsTree] = CUI.tables.relationsTree({
    components,
    models: [],
    hoverHighlighterName: "hover",
    selectHighlighterName: "select",
  });
  relationsTree.preserveStructureOnFilter = true;
  relationsTree.expanded = true;

  const [loadBtn] = CUI.buttons.loadIfc({ components });
  loadBtn.label = i18n.t("panels.project.loadModel");
  loadBtn.style.width = "100%";
  loadBtn.style.marginBottom = "1rem";

  const search = (e: Event) => {
    const input = e.target as BUI.TextInput;
    relationsTree.queryString = input.value;
  };

  return BUI.Component.create<BUI.Panel>(() => {
    return BUI.html`
      <bim-panel>
        <bim-panel-section label="${i18n.t("panels.project.loadedModels")}" icon="mage:box-3d-fill">
          ${loadBtn}
          ${modelsList}
        </bim-panel-section>
        <bim-panel-section label="Spatial Structures" icon="ph:tree-structure-fill">
          <div style="display: flex; gap: 0.375rem;">
            <bim-text-input @input=${search} vertical placeholder="Search..." debounce="200"></bim-text-input>
            <bim-button style="flex: 0;" @click=${() => (relationsTree.expanded = !relationsTree.expanded)} icon="eva:expand-fill"></bim-button>
          </div>
          ${relationsTree}
        </bim-panel-section>
        
        ${groupings(components)}
      </bim-panel> 
    `;
  });
};
