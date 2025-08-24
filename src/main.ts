import * as THREE from "three";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as BUI from "@thatopen/ui";
import projectInformation from "./components/Panels/ProjectInformation";
import elementData from "./components/Panels/Selection";
import settings from "./components/Panels/Settings";
import help from "./components/Panels/Help";
import camera from "./components/Toolbars/Sections/Camera";
import measurement from "./components/Toolbars/Sections/Measurement";
import selection from "./components/Toolbars/Sections/Selection";
import { AppManager } from "./bim-components";
import { i18n } from "./locales";
import { withLocalization } from "./locales/withLocalization";
import { initI18n } from "./locales/i18n";
import { CollapsiblePanel } from "./bim-components/CollapsiblePanel";
import { createEmptyState } from "./components/EmptyState";

async function init() {
  console.log("Starting i18n initialization");
  await initI18n();
  console.log("i18n initialized");

  BUI.Manager.init();

  // Set light theme as default
  const html = document.querySelector("html")!;
  html.className = "bim-ui-light";

  const wrapWithLocalization = (component: BUI.Component | BUI.Panel) => {
    return withLocalization(component, () => {
      component.requestUpdate();
    });
  };

  const components = new OBC.Components();
  const worlds = components.get(OBC.Worlds);

  const world = worlds.create<
    OBC.SimpleScene,
    OBC.OrthoPerspectiveCamera,
    OBF.PostproductionRenderer
  >();
  world.name = "Main";

  world.scene = new OBC.SimpleScene(components);
  world.scene.setup();
  world.scene.three.background = null;

  const viewport = BUI.Component.create<BUI.Viewport>(() => {
    return BUI.html`
      <bim-viewport>
        <bim-grid floating></bim-grid>
      </bim-viewport>
    `;
  });

  world.renderer = new OBF.PostproductionRenderer(components, viewport);
  const { postproduction } = world.renderer;

  world.camera = new OBC.OrthoPerspectiveCamera(components);

  const worldGrid = components.get(OBC.Grids).create(world);
  worldGrid.material.uniforms.uColor.value = new THREE.Color(0x424242);
  worldGrid.material.uniforms.uSize1.value = 2;
  worldGrid.material.uniforms.uSize2.value = 8;

  const resizeWorld = () => {
    world.renderer?.resize();
    world.camera.updateAspect();
  };

  viewport.addEventListener("resize", resizeWorld);

  // Initialize FragmentsManager worker FIRST before other components
  const fragments = components.get(OBC.FragmentsManager);
  const githubUrl = "https://thatopen.github.io/engine_fragment/resources/worker.mjs";
  const fetchedUrl = await fetch(githubUrl);
  const workerBlob = await fetchedUrl.blob();
  const workerFile = new File([workerBlob], "worker.mjs", {
    type: "text/javascript",
  });
  const workerUrl = URL.createObjectURL(workerFile);
  fragments.init(workerUrl);

  // Now initialize other components that depend on FragmentsManager
  components.init();

  // Configure postproduction with new API
  postproduction.enabled = true;
  postproduction.excludedObjectsPass.addExcludedMaterial(worldGrid.material);
  postproduction.outlinesEnabled = true;
  postproduction.excludedObjectsEnabled = true;

  const appManager = components.get(AppManager);
  const viewportGrid = viewport.querySelector<BUI.Grid>("bim-grid[floating]")!;
  appManager.grids.set("viewport", viewportGrid);

  const classifier = components.get(OBC.Classifier);

  const highlighter = components.get(OBF.Highlighter);
  highlighter.setup({ world });
  highlighter.zoomToSelection = true;

  // Update fragments when camera moves (required for LOD and culling)
  world.camera.controls.addEventListener("control", () => {
    fragments.core.update();
  });

  // Handle model loading
  fragments.list.onItemSet.add(async ({ value: model }) => {
    model.useCamera(world.camera.three);
    world.scene.three.add(model.object);
    await fragments.core.update(true);
  });

  const collapsiblePanel = components.get(CollapsiblePanel);
  if (!collapsiblePanel) {
    const panel = new CollapsiblePanel(components);
    components.add(CollapsiblePanel.uuid, panel);
  }

  const leftPanel = wrapWithLocalization(
    BUI.Component.create(() => {
      return BUI.html`
        <bim-tabs switchers-full>
          <bim-tab name="project" label="${i18n.t("panels.project.title")}" icon="ph:building-fill">
            ${wrapWithLocalization(projectInformation(components))}
          </bim-tab>
          <bim-tab name="settings" label="${i18n.t("panels.settings.title")}" icon="solar:settings-bold">
            ${wrapWithLocalization(settings(components))}
          </bim-tab>
          <bim-tab name="help" label="${i18n.t("panels.help.title")}" icon="material-symbols:help">
            ${help}
          </bim-tab>
        </bim-tabs> 
      `;
    }),
  );

  const toolbar = wrapWithLocalization(
    BUI.Component.create(() => {
      return BUI.html`
        <bim-tabs floating style="justify-self: center; border-radius: 0.5rem;">
          <bim-tab label="${i18n.t("toolbar.tabs.selection")}">
            <bim-toolbar>
              ${camera(world)}
              ${selection(components, world)}
            </bim-toolbar>
          </bim-tab>
          <bim-tab label="${i18n.t("toolbar.tabs.measurement")}">
            <bim-toolbar>
              ${measurement(world, components)}
            </bim-toolbar>      
          </bim-tab>
        </bim-tabs>
      `;
    }),
  );

  const elementDataPanel = wrapWithLocalization(elementData(components));

  const app = document.getElementById("app") as BUI.Grid;
  app.layouts = {
    main: {
      template: `
        "leftPanel viewport" 1fr
        /20rem 1fr
      `,
      elements: {
        leftPanel,
        viewport,
      },
    },
    empty: {
      template: `
        "leftPanel emptyState" 1fr
        /20rem 1fr
      `,
      elements: {
        leftPanel,
        emptyState: createEmptyState(components),
      },
    },
  };

  app.layout = (fragments.list.size > 0 ? "main" : "empty") as any;

  fragments.list.onItemSet.add(() => {
    app.layout = "main" as any;
  });

  viewportGrid.layouts = {
    main: {
      template: `
        "empty elementDataPanel" 1fr
        "toolbar elementDataPanel" auto
        /1fr auto
      `,
      elements: {
        toolbar,
        elementDataPanel,
      },
      resizers: {
        elementDataPanel: {
          direction: "horizontal",
          previous: true,
          size: { min: "18rem", max: "24rem" },
        },
      },
    },
    collapsed: {
      template: `
        "empty elementDataPanel" 1fr
        "toolbar elementDataPanel" auto
        /1fr 48px
      `,
      elements: {
        toolbar,
        elementDataPanel,
      },
    },
    second: {
      template: `
        "empty elementDataPanel referencePanel" 1fr
        "toolbar elementDataPanel referencePanel" auto
        /1fr auto auto
      `,
      elements: {
        toolbar,
        elementDataPanel,
        referencePanel: elementDataPanel,
      },
      resizers: {
        elementDataPanel: {
          direction: "horizontal",
          previous: true,
          size: { min: "18rem", max: "24rem" },
        },
      },
    },
  };

  viewportGrid.layout = "main" as any;
}

// Wrap the init function in a DOM ready check
document.addEventListener("DOMContentLoaded", () => {
  init().catch(console.error);
});
