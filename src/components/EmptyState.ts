import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as FRAGS from "@thatopen/fragments";
import { i18n } from "../locales/i18n";

const EmptyStateContent = (components: OBC.Components) => {
  const handleFileSelect = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ifc';
    input.multiple = false;
    
    input.onchange = async (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (file && file.name.toLowerCase().endsWith('.ifc')) {
        try {
          // Create IfcImporter instance as per ThatOpen documentation
          const serializer = new FRAGS.IfcImporter();
          
          // Let ThatOpen handle WASM loading automatically
          console.log("Using default WASM configuration");
          
          const arrayBuffer = await file.arrayBuffer();
          const ifcBytes = new Uint8Array(arrayBuffer);
          
          console.log("Converting IFC to Fragments...");
          const fragmentBytes = await serializer.process({
            bytes: ifcBytes,
            progressCallback: (progress, data) => console.log("Conversion progress:", progress, data),
          });
          
          console.log("IFC converted to Fragments successfully");
          
          // Load the converted fragments
          const fragments = components.get(OBC.FragmentsManager);
          await fragments.core.load(fragmentBytes, {
            modelId: "imported-model"
          });
          
          console.log("Fragments loaded successfully:", file.name);
        } catch (error) {
          console.error("Error processing IFC file:", error);
          alert(`Error processing IFC file: ${(error as Error).message || String(error)}`);
        }
      }
    };
    
    input.click();
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    const dropzone = e.currentTarget as HTMLElement;
    dropzone.style.borderColor = "var(--bim-ui_accent-base)";
    dropzone.style.backgroundColor = "var(--bim-ui_bg-contrast-20)";
  };

  const handleDragLeave = (e: DragEvent) => {
    const dropzone = e.currentTarget as HTMLElement;
    dropzone.style.borderColor = "var(--bim-ui_border-base)";
    dropzone.style.backgroundColor = "var(--bim-ui_bg-contrast-10)";
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    const dropzone = e.currentTarget as HTMLElement;
    dropzone.style.borderColor = "var(--bim-ui_border-base)";
    dropzone.style.backgroundColor = "var(--bim-ui_bg-contrast-10)";

    const files = Array.from(e.dataTransfer?.files || []);
    const ifcFile = files.find((file) =>
      file.name.toLowerCase().endsWith(".ifc"),
    );

    if (ifcFile) {
      try {
        // Create IfcImporter instance as per ThatOpen documentation
        const serializer = new FRAGS.IfcImporter();
        serializer.wasm = { absolute: true, path: "https://unpkg.com/web-ifc@0.0.46/" };
        
        const arrayBuffer = await ifcFile.arrayBuffer();
        const ifcBytes = new Uint8Array(arrayBuffer);
        
        console.log("Converting IFC to Fragments...");
        const fragmentBytes = await serializer.process({
          bytes: ifcBytes,
          progressCallback: (progress, data) => console.log("Conversion progress:", progress, data),
        });
        
        console.log("IFC converted to Fragments successfully");
        
        // Load the converted fragments
        const fragments = components.get(OBC.FragmentsManager);
        await fragments.core.load(fragmentBytes, {
          modelId: "imported-model"
        });
        
        console.log("Fragments loaded successfully:", ifcFile.name);
      } catch (error) {
        console.error("Error processing IFC file:", error);
        alert(`Error processing IFC file: ${(error as Error).message || String(error)}`);
      }
    }
  };

  return BUI.html`
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 2rem;
      color: var(--bim-ui_text);
      text-align: center;
      padding: 2rem;
      background: linear-gradient(180deg, 
        var(--bim-ui_bg-base) 0%, 
        var(--bim-ui_bg-contrast-10) 100%
      );
    ">
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
        max-width: 480px;
      ">
        <div style="
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: var(--bim-ui_bg-contrast-20);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          margin-bottom: 0.5rem;
        ">
          🏗️
        </div>
        <div>
          <h2 style="
            font-size: 1.75rem;
            margin: 0;
            font-weight: 600;
            color: var(--bim-ui_text);
          ">
            ${i18n.t("emptyState.title")}
          </h2>
          <p style="
            opacity: 0.7;
            margin: 0.5rem 0 0 0;
            line-height: 1.6;
            font-size: 0.95rem;
          ">
            ${i18n.t("emptyState.description")}
          </p>
        </div>

        <div 
          @dragover=${handleDragOver}
          @dragleave=${handleDragLeave}
          @drop=${handleDrop}
          style="
            width: 100%;
            padding: 2rem;
            border: 2px dashed var(--bim-ui_border-base);
            border-radius: 12px;
            background: var(--bim-ui_bg-contrast-10);
            transition: all 0.2s ease;
          "
        >
          <div style="opacity: 0.7;">
            ${i18n.t("emptyState.dropzoneText")}
          </div>
          <bim-button 
            @click=${handleFileSelect}
            label="${i18n.t("emptyState.loadButton")}"
            icon="ph:file-plus-bold"
            style="
              --bim-ui-button-bg: var(--bim-ui_accent-base);
              --bim-ui-button-text: var(--bim-ui_bg-base);
              border-radius: 8px;
              padding: 0.75rem 1.5rem;
              font-size: 0.95rem;
              font-weight: 500;
              transition: transform 0.2s ease, opacity 0.2s ease;
              margin-top: 1rem;
            ">
          </bim-button>
        </div>
      </div>

      <div style="
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
        max-width: 480px;
      ">
        <div style="
          padding: 1.25rem;
          background: var(--bim-ui_bg-contrast-10);
          border-radius: 12px;
          font-size: 0.9rem;
          text-align: left;
        ">
          <h3 style="
            margin: 0 0 0.75rem 0;
            font-size: 1rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          ">
            ${i18n.t("emptyState.sheetsTitle")}
          </h3>
          <div style="
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          ">
            <p style="
              margin: 0;
              opacity: 0.7;
              line-height: 1.5;
            ">
              ${i18n.t("emptyState.sheetsDescription")}
            </p>
            <div style="opacity: 0.7;">${i18n.t("emptyState.urlFormat")}</div>
            <div style="
              background: var(--bim-ui_bg-contrast-20);
              padding: 0.75rem;
              border-radius: 8px;
              font-family: monospace;
              font-size: 0.85rem;
              opacity: 0.8;
              white-space: nowrap;
              overflow-x: auto;
            ">
              ${i18n.t("emptyState.urlExample")}
            </div>
            <div style="
              font-size: 0.85rem;
              opacity: 0.6;
              font-style: italic;
              display: flex;
              flex-direction: column;
              gap: 0.5rem;
            ">
              <span>${i18n.t("emptyState.sheetIdTip")}</span>
              <span>${i18n.t("emptyState.sheetIdHint")}</span>
            </div>
          </div>
        </div>
        
        <div style="
          padding: 1rem;
          background: var(--bim-ui_bg-contrast-10);
          border-radius: 12px;
          font-size: 0.9rem;
          text-align: left;
        ">
          <h3 style="
            margin: 0 0 0.5rem 0;
            font-size: 1rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          ">
            <span style="color: var(--bim-ui_accent-base);">📚</span>
            ${i18n.t("emptyState.docsTitle")}
          </h3>
          <p style="
            margin: 0;
            opacity: 0.7;
            line-height: 1.5;
          ">
            ${i18n.t("emptyState.docsDescription")}
          </p>
          <a 
            href="https://github.com/louistrue/ifc-url-viewer"
            target="_blank"
            rel="noopener"
            style="
              display: inline-block;
              margin-top: 0.75rem;
              color: var(--bim-ui_accent-base);
              text-decoration: none;
              font-size: 0.9rem;
              font-weight: 500;
            "
          >
            ${i18n.t("emptyState.docsLink")} →
          </a>
        </div>
      </div>
    </div>
  `;
};

export const createEmptyState = (components: OBC.Components) => {
  return BUI.Component.create(() => EmptyStateContent(components));
};
