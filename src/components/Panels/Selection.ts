import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import { i18n } from "../../locales";

export default (components: OBC.Components) => {
  const highlighter = components.get(OBF.Highlighter);

  return BUI.Component.create<BUI.Panel>(() => {
    return BUI.html`
      <bim-panel>
        <bim-panel-section label="Selection" icon="ph:selection">
          <div style="padding: 1rem; text-align: center; opacity: 0.7;">
            <p>Selection panel will be available in future updates</p>
          </div>
        </bim-panel-section>
      </bim-panel>
    `;
  });
};
