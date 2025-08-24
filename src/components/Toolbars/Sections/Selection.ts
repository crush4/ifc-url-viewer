import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";

export default (components: OBC.Components, world?: OBC.World) => {
  const highlighter = components.get(OBF.Highlighter);

  const onClearSelection = () => {
    highlighter.clear();
  };

  return BUI.Component.create<BUI.ToolbarSection>(() => {
    return BUI.html`
      <bim-toolbar-section label="Selection" icon="ph:selection">
        <bim-button 
          @click=${onClearSelection}
          label="Clear Selection"
          icon="ph:x-circle"
          tooltip-title="Clear Selection"
          tooltip-text="Clears the current selection">
        </bim-button>
      </bim-toolbar-section>
    `;
  });
};
