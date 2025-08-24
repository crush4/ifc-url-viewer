/* eslint-disable no-alert */
import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";
import * as FRAGS from "@thatopen/fragments";
import Zip from "jszip";

const input = document.createElement("input");
const askForFile = (extension: string) => {
  return new Promise<File | null>((resolve) => {
    input.type = "file";
    input.accept = extension;
    input.multiple = false;
    input.onchange = () => {
      const filesList = input.files;
      if (!(filesList && filesList[0])) {
        resolve(null);
        return;
      }
      const file = filesList[0];
      resolve(file);
    };
    input.click();
  });
};

export default (components: OBC.Components) => {
  const handleLoadIfc = async () => {
    const ifcFile = await askForFile(".ifc");
    if (!ifcFile) return;
    
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
  };

  const fragments = components.get(OBC.FragmentsManager);

  const loadFragments = async () => {
    const fragmentsZip = await askForFile(".zip");
    if (!fragmentsZip) return;
    const zipBuffer = await fragmentsZip.arrayBuffer();
    const zip = new Zip();
    await zip.loadAsync(zipBuffer);
    const geometryBuffer = zip.file("geometry.frag");
    if (!geometryBuffer) {
      alert("No geometry found in the file!");
      return;
    }

    const geometry = await geometryBuffer.async("uint8array");

    // Load fragments using the new API
    await fragments.core.load(geometry, { 
      modelId: "imported-model"
    });
  };

  return BUI.Component.create<BUI.PanelSection>(() => {
    return BUI.html`
      <bim-toolbar-section label="Import" icon="solar:import-bold">
        <bim-button 
          @click=${handleLoadIfc}
          label="IFC"
          icon="ph:file-plus-bold"
          tooltip-title="Load IFC"
          tooltip-text="Loads an IFC file into the scene. The IFC gets automatically converted to Fragments.">
        </bim-button>
        <bim-button 
          @click=${loadFragments} 
          label="Fragments" 
          icon="fluent:puzzle-cube-piece-20-filled" 
          tooltip-title="Load Fragments"
          tooltip-text="Loads a pre-converted IFC from a Fragments file. Use this option if you want to avoid the conversion from IFC to Fragments.">
        </bim-button>
      </bim-toolbar-section>
    `;
  });
};
