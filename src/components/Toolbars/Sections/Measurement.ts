import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as BUI from "@thatopen/ui";
import { i18n } from "../../../locales/i18n";

export default (world: OBC.World, components: OBC.Components) => {
  const highlighter = components.get(OBF.Highlighter);

  const onClearMeasurements = () => {
    // Clear all measurements
    highlighter.clear();
  };

  return BUI.Component.create<BUI.ToolbarSection>(() => {
    return BUI.html`
      <bim-toolbar-section label="Measurement" icon="ph:ruler">
        <bim-button 
          @click=${onClearMeasurements}
          label="Clear Measurements"
          icon="ph:x-circle"
          tooltip-title="Clear Measurements"
          tooltip-text="Clears all measurements">
        </bim-button>
        <div style="padding: 0.5rem; text-align: center; opacity: 0.7; font-size: 0.9rem;">
          <p>Advanced measurement tools will be available in future updates</p>
        </div>
      </bim-toolbar-section>
    `;
  });
};
