import * as BUI from "@thatopen/ui";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as CUI from "@thatopen/ui-obc";
import * as FRAGS from "@thatopen/fragments";
import Papa from "papaparse";
import { AppManager } from "../../bim-components";
import { i18n } from "../../locales";
import { CollapsiblePanel } from "../../bim-components/CollapsiblePanel";

interface PapaParseResult {
  data: string[][];
  errors: any[];
  meta: any;
}

export default (components: OBC.Components) => {
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
    const rowMatch = parseInt(cellReference.match(/\d+/)?.[0] || "0", 10) - 1;
    if (!colMatch) return null;
    const col = colMatch
      .split("")
      .reduce(
        (acc, char) => acc * 26 + (char.charCodeAt(0) - "A".charCodeAt(0)),
        0,
      );
    return { row: rowMatch, col };
  };

  const fetchSheetData = async (url: string) => {
    const { sheetId, cellReference } = parseGoogleSheetUrl(url);
    if (!sheetId || !cellReference) {
      throw new Error("Invalid URL");
    }
    const coords = convertToRowCol(cellReference);
    if (!coords) throw new Error("Invalid cell");
    const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    const response = await fetch(exportUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    const text = await response.text();
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        complete: (results: PapaParseResult) => {
          const { row, col } = coords;
          if (results.data[row] && results.data[row][col] !== undefined) {
            resolve(results.data[row][col]);
          } else {
            reject(new Error("Cell not found"));
          }
        },
        error: (error: Error) => reject(error),
      });
    });
  };

  const fragments = components.get(OBC.FragmentsManager);
  const highlighter = components.get(OBF.Highlighter);
  const appManager = components.get(AppManager);
  const viewportGrid = appManager.grids.get("viewport");
  const collapsiblePanel = components.get(CollapsiblePanel);

  const [propsTable, updatePropsTable] = CUI.tables.elementProperties({
    components,
    fragmentIdMap: {} as FRAGS.FragmentIdMap,
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

  // Create a filtered properties table for the PropertySet
  const [propertySetValues, updatePropertySetValues] =
    CUI.tables.elementProperties({
      components,
      fragmentIdMap: {} as FRAGS.FragmentIdMap,
    });

  // Hide the property tree
  propertySetValues.style.display = "none";

  propertySetValues.style.margin = "0.5rem 0";
  propertySetValues.preserveStructureOnFilter = true;

  // Create UI elements first
  const statusUrl = new BUI.Button();
  statusUrl.label = "No URL";
  statusUrl.icon = "mdi:link-variant";
  statusUrl.style.width = "100%";
  statusUrl.style.justifyContent = "flex-start";
  statusUrl.style.textAlign = "left";
  statusUrl.style.wordBreak = "break-all";
  statusUrl.style.whiteSpace = "normal";
  statusUrl.style.height = "auto";
  statusUrl.style.padding = "0.5rem";

  const statusRef = new BUI.Label();
  statusRef.style.padding = "0.5rem";
  statusRef.style.color = "var(--bim-ui_accent-base)";
  statusRef.style.fontWeight = "bold";
  statusRef.style.display = "block";
  statusRef.style.fontSize = "0.9rem";
  statusRef.style.opacity = "0.7";

  const statusValue = new BUI.Label();
  statusValue.style.padding = "1rem";
  statusValue.style.display = "block";
  statusValue.style.fontSize = "1.2rem";
  statusValue.style.fontWeight = "bold";
  statusValue.style.textAlign = "center";
  statusValue.style.background = "var(--bim-ui_bg-contrast-10)";
  statusValue.style.borderRadius = "0.5rem";
  statusValue.style.margin = "0.5rem 0";
  statusValue.textContent = "Loading...";

  const objektgruppeUrl = new BUI.Button();
  objektgruppeUrl.label = "No URL";
  objektgruppeUrl.icon = "mdi:link-variant";
  objektgruppeUrl.style.width = "100%";
  objektgruppeUrl.style.justifyContent = "flex-start";
  objektgruppeUrl.style.textAlign = "left";
  objektgruppeUrl.style.wordBreak = "break-all";
  objektgruppeUrl.style.whiteSpace = "normal";
  objektgruppeUrl.style.height = "auto";
  objektgruppeUrl.style.padding = "0.5rem";

  const objektgruppeRef = new BUI.Label();
  objektgruppeRef.style.padding = "0.5rem";
  objektgruppeRef.style.color = "var(--bim-ui_accent-base)";
  objektgruppeRef.style.fontWeight = "bold";
  objektgruppeRef.style.display = "block";
  objektgruppeRef.style.fontSize = "0.9rem";
  objektgruppeRef.style.opacity = "0.7";

  const objektgruppeValue = new BUI.Label();
  objektgruppeValue.style.padding = "1rem";
  objektgruppeValue.style.display = "block";
  objektgruppeValue.style.fontSize = "1.2rem";
  objektgruppeValue.style.fontWeight = "bold";
  objektgruppeValue.style.textAlign = "center";
  objektgruppeValue.style.background = "var(--bim-ui_bg-contrast-10)";
  objektgruppeValue.style.borderRadius = "0.5rem";
  objektgruppeValue.style.margin = "0.5rem 0";
  objektgruppeValue.textContent = "Loading...";

  // Then define findInTree function
  const findInTree = (node: any) => {
    // Check if this is a PropertySets node
    if (node?.data?.Name === "PropertySets") {
      // Look through all PropertySets for Status and Objektgruppe properties
      node.children?.forEach((pset: any) => {
        pset.children?.forEach((prop: any) => {
          const propName = prop?.data?.Name;
          const propValue = prop?.data?.Value;
          console.log("Property:", propName, propValue);

          if (propName === "Status") {
            statusUrl.label = propValue || "No URL";
            statusUrl.onclick = propValue
              ? () => window.open(propValue, "_blank")
              : null;
            statusRef.textContent = extractCellReference(propValue);

            if (propValue) {
              statusValue.textContent = "Loading...";
              fetchSheetData(propValue)
                .then((value) => {
                  statusValue.textContent = value as string;
                })
                .catch((error) => {
                  statusValue.textContent = `Error: ${error}`;
                  statusValue.style.color = "var(--bim-ui_error)";
                });
            } else {
              statusValue.textContent = "No data";
            }
          }

          if (propName === "Objektgruppe") {
            objektgruppeUrl.label = propValue || "No URL";
            objektgruppeUrl.onclick = propValue
              ? () => window.open(propValue, "_blank")
              : null;
            objektgruppeRef.textContent = extractCellReference(propValue);

            if (propValue) {
              objektgruppeValue.textContent = "Loading...";
              fetchSheetData(propValue)
                .then((value) => {
                  objektgruppeValue.textContent = value as string;
                })
                .catch((error) => {
                  objektgruppeValue.textContent = `Error: ${error}`;
                  objektgruppeValue.style.color = "var(--bim-ui_error)";
                });
            } else {
              objektgruppeValue.textContent = "No data";
            }
          }
        });
      });
    }

    // Continue searching through children
    node.children?.forEach((child: any) => findInTree(child));
  };

  // Subscribe to collapse events
  collapsiblePanel.onCollapsed.add((isCollapsed: boolean) => {
    if (!viewportGrid) return;
    console.log("Collapse event received:", isCollapsed);

    let newLayout = "main";
    if (isCollapsed) {
      newLayout = "collapsed";
    } else if (Object.keys(highlighter.selection.select).length > 0) {
      newLayout = "second";
    }

    console.log("Setting new layout from event:", newLayout);
    viewportGrid.layout = newLayout;
  });

  // Modify the highlighter event
  highlighter.events.select.onHighlight.add((fragmentIdMap) => {
    if (!viewportGrid || !collapsiblePanel) return;

    // If panel is collapsed, expand it and force icon update
    if (collapsiblePanel.isCollapsed) {
      collapsiblePanel.toggle();
    }

    // Force layout update
    viewportGrid.layout = "second";
    viewportGrid.requestUpdate();

    propsTable.expanded = false;
    updatePropsTable({ fragmentIdMap });
    updatePropertySetValues({ fragmentIdMap });

    // Get properties for Description
    const properties: Promise<any>[] = [];
    for (const fragmentID in fragmentIdMap) {
      const fragment = fragments.list.get(fragmentID);
      if (!fragment || !fragment.group) continue;

      const ids = fragmentIdMap[fragmentID];
      for (const id of ids) {
        const props = fragment.group.getProperties(id);
        if (props) properties.push(props);
      }
    }

    // Handle Description properties
    Promise.all(properties).then(async (resolvedProps) => {
      const propertyWithDescription = resolvedProps.find(
        (props) => props?.Description?.value,
      );

      const value = propertyWithDescription?.Description?.value || "";
      console.log("Description Value:", value);

      if (value) {
        descriptionLink.label = value;
        descriptionLink.onclick = () => window.open(value, "_blank");
        cellReference.textContent = extractCellReference(value);

        try {
          cellValue.textContent = "Loading...";
          const fetchedValue = await fetchSheetData(value);
          cellValue.textContent = fetchedValue as string;
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

    // Handle PropertySet data
    setTimeout(() => {
      if (propertySetValues.data) {
        propertySetValues.data.forEach(findInTree);
      }
    }, 100);
  });

  // Modify the clear event to respect visibility preference
  highlighter.events.select.onClear.add(() => {
    updatePropsTable({ fragmentIdMap: {} });
    updatePropertySetValues({ fragmentIdMap: {} });
    statusUrl.label = "No URL";
    statusRef.textContent = "";
    statusValue.textContent = "Loading...";
    objektgruppeUrl.label = "No URL";
    objektgruppeRef.textContent = "";
    objektgruppeValue.textContent = "Loading...";
    if (!viewportGrid) return;
    if (viewportGrid.layout === "collapsed") return;
    viewportGrid.layout = "main";
  });

  const updateReferenceTable = ({
    fragmentIdMap = {} as FRAGS.FragmentIdMap,
  } = {}) => {
    const properties: Promise<any>[] = [];
    console.log("FragmentIdMap:", fragmentIdMap);

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
      const propertyWithDescription = resolvedProps.find(
        (props) => props?.Description?.value,
      );

      const value = propertyWithDescription?.Description?.value || "";
      console.log("Description Value:", value);

      if (value) {
        descriptionLink.label = value;
        descriptionLink.onclick = () => window.open(value, "_blank");
        cellReference.textContent = extractCellReference(value);

        try {
          cellValue.textContent = "Loading...";
          const fetchedValue = await fetchSheetData(value);
          cellValue.textContent = fetchedValue as string;
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

  const search = (e: Event) => {
    const input = e.target as BUI.TextInput;
    propsTable.queryString = input.value;
  };

  const toggleExpanded = () => {
    propsTable.expanded = !propsTable.expanded;
  };

  // Update template without any dev mode references
  return BUI.Component.create<BUI.Panel>(() => {
    const isCollapsed = viewportGrid?.layout === "collapsed";

    return BUI.html`
      <bim-panel style="
        position: relative; 
        overflow: visible; 
        transition: width 0.3s ease;
        background-color: rgba(var(--bim-ui_bg-base-rgb), 0.9);
      ">
        ${collapsiblePanel.createHandle()}
        <bim-panel-section 
          name="selection" 
          label="${i18n.t("panels.selection.title")}" 
          icon="solar:document-bold" 
          fixed
          style="transition: opacity 0.3s ease; opacity: ${isCollapsed ? "0" : "1"}">
          <div style="display: flex; gap: 0.375rem;">
            <bim-text-input 
              @input=${search} 
              vertical 
              placeholder="${i18n.t("common.search")}" 
              debounce="200"
              ?disabled=${isCollapsed}>
            </bim-text-input>
            <bim-button 
              style="flex: 0;" 
              @click=${toggleExpanded} 
              icon="eva:expand-fill"
              ?disabled=${isCollapsed}>
            </bim-button>
            <bim-button 
              style="flex: 0;" 
              @click=${() => propsTable.downloadData("ElementData", "tsv")} 
              icon="ph:export-fill" 
              tooltip-title="${i18n.t("panels.selection.export.button")}" 
              tooltip-text="${i18n.t("panels.selection.export.tooltip")}"
              ?disabled=${isCollapsed}>
            </bim-button>
          </div>
          ${propsTable}
        </bim-panel-section>
        
        <bim-panel-section 
          name="description" 
          label="${i18n.t("panels.elementData.title")}" 
          icon="mdi:database" 
          fixed
          style="transition: opacity 0.3s ease; opacity: ${isCollapsed ? "0" : "1"}">
          <div style="display: flex; flex-direction: column; gap: 0.25rem;">
            <div style="opacity: 0.7; font-size: 0.9rem; padding: 0 0.5rem;">${i18n.t("panels.elementData.description")}</div>
            ${cellValue}

            <div style="margin-top: 1.5rem; opacity: 0.7; font-size: 0.9rem; padding: 0 0.5rem;">${i18n.t("panels.elementData.status")}</div>
            ${statusValue}

            <div style="margin-top: 1.5rem; opacity: 0.7; font-size: 0.9rem; padding: 0 0.5rem;">${i18n.t("panels.elementData.objektgruppe")}</div>
            ${objektgruppeValue}
          </div>
          ${propertySetValues}
        </bim-panel-section>
      </bim-panel>
    `;
  });
};
