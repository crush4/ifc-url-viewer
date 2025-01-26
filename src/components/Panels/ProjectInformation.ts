import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as CUI from "@thatopen/ui-obc";
import * as OBF from "@thatopen/components-front";
import * as FRAGS from "@thatopen/fragments";
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

  const [loadBtn] = CUI.buttons.loadIfc({ components });
  loadBtn.label = i18n.t("panels.project.loadModel");
  loadBtn.style.width = "100%";
  loadBtn.style.marginBottom = "1rem";

  const search = (e: Event) => {
    const input = e.target as BUI.TextInput;
    relationsTree.queryString = input.value;
  };

  const fragments = components.get(OBC.FragmentsManager);
  const highlighter = components.get(OBF.Highlighter);

  const [propsTable, updatePropsTable] = CUI.tables.elementProperties({
    components,
    fragmentIdMap: {} as FRAGS.FragmentIdMap,
  });

  // Subscribe to selection changes
  highlighter.events.select.onHighlight.add((fragmentIdMap) => {
    updatePropsTable({ fragmentIdMap });
  });

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

        <bim-panel-section 
          name="selection" 
          label="Selection Info" 
          icon="ph:cursor-fill"
          expanded>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <div style="display: flex; flex-direction: column; gap: 0.25rem; background: var(--bim-ui_bg-contrast-5); padding: 0.5rem; border-radius: 0.25rem;">
              <div style="font-weight: 500; font-size: 0.875rem;">Selected Element</div>
              <div style="display: flex; gap: 0.5rem; align-items: center;">
                <div style="opacity: 0.7; font-size: 0.875rem;">Type:</div>
                <div style="font-size: 0.875rem; flex: 1;">${propsTable.data?.__proto__?.constructor?.name || "None"}</div>
              </div>
              <div style="display: flex; gap: 0.5rem; align-items: center;">
                <div style="opacity: 0.7; font-size: 0.875rem;">ID:</div>
                <div style="font-size: 0.875rem; flex: 1;">${propsTable.data?.expressID || "None"}</div>
              </div>
              <div style="display: flex; gap: 0.5rem; align-items: center;">
                <div style="opacity: 0.7; font-size: 0.875rem;">Name:</div>
                <div style="font-size: 0.875rem; flex: 1;">${propsTable.data?.Name?.value || "Unnamed"}</div>
              </div>
            </div>
          </div>
        </bim-panel-section>

        <bim-panel-section 
          name="properties" 
          label="Properties" 
          icon="ph:list-fill"
          expanded>
          ${propsTable}
        </bim-panel-section>

        <bim-panel-section 
          name="materials" 
          label="Materials" 
          icon="ph:paint-brush-fill">
          <div id="materials-list"></div>
        </bim-panel-section>

        <bim-panel-section 
          name="quantities" 
          label="Quantities" 
          icon="ph:ruler-fill">
          <div id="quantities-list"></div>
        </bim-panel-section>

        <bim-panel-section 
          name="relations" 
          label="Relations" 
          icon="ph:git-fork-fill">
          <div id="relations-list"></div>
        </bim-panel-section>
      </bim-panel> 
    `;
  });
};
