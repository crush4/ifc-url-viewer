import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as CUI from "@thatopen/ui-obc";
import { AppManager } from "../../bim-components";
import Papa from "papaparse";

export default (components: OBC.Components) => {
  const fragments = components.get(OBC.FragmentsManager);
  const highlighter = components.get(OBF.Highlighter);
  const appManager = components.get(AppManager);
  const viewportGrid = appManager.grids.get("viewport");

  const [propsTable, updatePropsTable] = CUI.tables.elementProperties({
    components,
    fragmentIdMap: {},
  });

  // Create a link element and cell reference display
  const descriptionLink = new BUI.Button();
  descriptionLink.label = "No description";
  descriptionLink.icon = "mdi:link-variant";
  descriptionLink.style.width = "100%";
  descriptionLink.style.justifyContent = "flex-start";
  descriptionLink.style.textAlign = "left";
  descriptionLink.style.wordBreak = "break-all";
  descriptionLink.style.whiteSpace = "normal";
  descriptionLink.style.height = "auto";
  descriptionLink.style.padding = "0.5rem";

  const cellReference = new BUI.Label();
  cellReference.style.padding = "0.5rem";
  cellReference.style.color = "var(--bim-ui_accent-base)";
  cellReference.style.fontWeight = "bold";
  cellReference.style.display = "block";
  cellReference.style.fontSize = "0.9rem";
  cellReference.style.opacity = "0.7";

  const cellValue = new BUI.Label();
  cellValue.style.padding = "1rem";
  cellValue.style.display = "block";
  cellValue.style.fontSize = "1.2rem";
  cellValue.style.fontWeight = "bold";
  cellValue.style.textAlign = "center";
  cellValue.style.background = "var(--bim-ui_bg-contrast-10)";
  cellValue.style.borderRadius = "0.5rem";
  cellValue.style.margin = "0.5rem 0";
  cellValue.textContent = "Loading...";

  const extractCellReference = (url: string) => {
    const match = url.match(/range=([A-Z])(\d+)/);
    return match ? `${match[1]}${match[2]}` : "";
  };

  const parseGoogleSheetUrl = (url: string) => {
    const sheetIdMatch = url.match(/\/d\/(.*?)(\/|$)/);
    const sheetId = sheetIdMatch ? sheetIdMatch[1] : null;
    const rangeMatch = url.match(/[?&]range=([A-Z]+\d+)/);
    const cellReference = rangeMatch ? rangeMatch[1] : null;
    return { sheetId, cellReference };
  };

  const convertToRowCol = (cellReference: string) => {
    const colMatch = cellReference.match(/[A-Z]+/)?.[0];
    const rowMatch = parseInt(cellReference.match(/\d+/)?.[0] || "0") - 1;

    if (!colMatch) return null;

    const col = colMatch
      .split("")
      .reduce(
        (acc, char) => acc * 26 + (char.charCodeAt(0) - "A".charCodeAt(0)),
        0
      );

    return { row: rowMatch, col };
  };

  const fetchSheetData = async (url: string) => {
    try {
      const { sheetId, cellReference } = parseGoogleSheetUrl(url);

      if (!sheetId || !cellReference) {
        throw new Error("Invalid Google Sheets URL format");
      }

      const coords = convertToRowCol(cellReference);
      if (!coords) throw new Error("Invalid cell reference");

      const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      const response = await fetch(exportUrl);

      if (!response.ok) {
        throw new Error("Failed to fetch sheet data");
      }

      const text = await response.text();

      return new Promise((resolve, reject) => {
        Papa.parse(text, {
          complete: (results) => {
            const { row, col } = coords;
            if (results.data[row] && results.data[row][col] !== undefined) {
              resolve(results.data[row][col]);
            } else {
              reject("Cell not found");
            }
          },
          error: reject,
        });
      });
    } catch (error) {
      throw error;
    }
  };

  const updateReferenceTable = ({ fragmentIdMap = {} } = {}) => {
    const properties = [];
    console.log("FragmentIdMap:", fragmentIdMap);

    // Get properties for each fragment
    for (const fragmentID in fragmentIdMap) {
      const fragment = fragments.list.get(fragmentID);
      console.log("Fragment:", fragment);
      if (!fragment || !fragment.group) continue;

      const ids = fragmentIdMap[fragmentID];
      console.log("IDs:", ids);
      for (const id of ids) {
        const props = fragment.group.getProperties(id);
        console.log("Properties for ID", id, ":", props);
        if (props) properties.push(props);
      }
    }

    // Wait for all promises to resolve
    Promise.all(properties).then(async (resolvedProps) => {
      console.log("Resolved Properties:", resolvedProps);

      // Find the first property with a Description
      const propertyWithDescription = resolvedProps.find(
        (props) => props?.Description?.value
      );

      console.log("Property with Description:", propertyWithDescription);

      const value = propertyWithDescription?.Description?.value || "";
      console.log("Final Value:", value);

      // Update the link and cell reference
      if (value) {
        descriptionLink.label = value;
        descriptionLink.onclick = () => window.open(value, "_blank");
        cellReference.textContent = extractCellReference(value);

        // Fetch and update cell value
        cellValue.textContent = "Loading...";
        try {
          const fetchedValue = await fetchSheetData(value);
          cellValue.textContent = `${fetchedValue}`;
        } catch (error) {
          cellValue.textContent = `Error: ${error}`;
          cellValue.style.color = "var(--bim-ui_error)";
        }
      } else {
        descriptionLink.label = "No description";
        descriptionLink.onclick = null;
        cellReference.textContent = "";
        cellValue.textContent = "No data";
      }

      descriptionLink.requestUpdate();
      cellReference.requestUpdate();
      cellValue.requestUpdate();
    });
  };

  propsTable.preserveStructureOnFilter = true;
  fragments.onFragmentsDisposed.add(() => {
    updatePropsTable();
    updateReferenceTable();
  });

  highlighter.events.select.onHighlight.add((fragmentIdMap) => {
    if (!viewportGrid) return;
    viewportGrid.layout = "second";
    propsTable.expanded = false;
    updatePropsTable({ fragmentIdMap });
    updateReferenceTable({ fragmentIdMap });
  });

  highlighter.events.select.onClear.add(() => {
    updatePropsTable({ fragmentIdMap: {} });
    updateReferenceTable();
    if (!viewportGrid) return;
    viewportGrid.layout = "main";
  });

  const search = (e: Event) => {
    const input = e.target as BUI.TextInput;
    propsTable.queryString = input.value;
  };

  const toggleExpanded = () => {
    propsTable.expanded = !propsTable.expanded;
  };

  return BUI.Component.create<BUI.Panel>(() => {
    return BUI.html`
      <bim-panel>
        <bim-panel-section name="selection" label="Selection Information" icon="solar:document-bold" fixed>
          <div style="display: flex; gap: 0.375rem;">
            <bim-text-input @input=${search} vertical placeholder="Search..." debounce="200"></bim-text-input>
            <bim-button style="flex: 0;" @click=${toggleExpanded} icon="eva:expand-fill"></bim-button>
            <bim-button style="flex: 0;" @click=${() => propsTable.downloadData("ElementData", "tsv")} icon="ph:export-fill" tooltip-title="Export Data" tooltip-text="Export the shown properties to TSV."></bim-button>
          </div>
          ${propsTable}
        </bim-panel-section>

        <bim-panel-section name="description" label="Element Data" icon="mdi:database" fixed>
          <div style="display: flex; flex-direction: column; gap: 0.25rem;">
            <div style="opacity: 0.7; font-size: 0.9rem; padding: 0 0.5rem;">Source URL:</div>
            ${descriptionLink}
            <div style="opacity: 0.7; font-size: 0.9rem; padding: 0 0.5rem;">Cell Reference:</div>
            ${cellReference}
            <div style="opacity: 0.7; font-size: 0.9rem; padding: 0 0.5rem;">Value:</div>
            ${cellValue}
          </div>
        </bim-panel-section>
      </bim-panel> 
    `;
  });
};
