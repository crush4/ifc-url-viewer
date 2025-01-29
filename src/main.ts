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

  components.init();

  postproduction.enabled = true;
  postproduction.customEffects.excludedMeshes.push(worldGrid.three);
  postproduction.setPasses({ custom: true, ao: true, gamma: true });
  postproduction.customEffects.lineColor = 0x17191c;

  const appManager = components.get(AppManager);
  const viewportGrid = viewport.querySelector<BUI.Grid>("bim-grid[floating]")!;
  appManager.grids.set("viewport", viewportGrid);

  const fragments = components.get(OBC.FragmentsManager);
  const indexer = components.get(OBC.IfcRelationsIndexer);
  const classifier = components.get(OBC.Classifier);
  classifier.list.CustomSelections = {};

  const ifcLoader = components.get(OBC.IfcLoader);
  await ifcLoader.setup();

  const tilesLoader = components.get(OBF.IfcStreamer);
  tilesLoader.world = world;
  tilesLoader.culler.threshold = 10;
  tilesLoader.culler.maxHiddenTime = 1000;
  tilesLoader.culler.maxLostTime = 40000;

  const highlighter = components.get(OBF.Highlighter);
  highlighter.setup({ world });
  highlighter.zoomToSelection = true;

  const culler = components.get(OBC.Cullers).create(world);
  culler.threshold = 5;

  world.camera.controls.restThreshold = 0.25;
  world.camera.controls.addEventListener("rest", () => {
    culler.needsUpdate = true;
    tilesLoader.cancel = true;
    tilesLoader.culler.needsUpdate = true;
  });

  fragments.onFragmentsLoaded.add(async (model) => {
    if (model.hasProperties) {
      await indexer.process(model);
      classifier.byEntity(model);
    }

    if (!model.isStreamed) {
      for (const fragment of model.items) {
        world.meshes.add(fragment.mesh);
        culler.add(fragment.mesh);
      }
    }

    world.scene.three.add(model);

    if (!model.isStreamed) {
      setTimeout(async () => {
        world.camera.fit(world.meshes, 0.8);
      }, 50);
    }
  });

  fragments.onFragmentsDisposed.add(({ fragmentIDs }) => {
    for (const fragmentID of fragmentIDs) {
      const mesh = [...world.meshes].find((mesh) => mesh.uuid === fragmentID);
      if (mesh) {
        world.meshes.delete(mesh);
      }
    }
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

  app.layout = fragments.list.size > 0 ? "main" : "empty";

  fragments.onFragmentsLoaded.add(() => {
    app.layout = "main";
  });

  fragments.onFragmentsDisposed.add(() => {
    if (fragments.list.size === 0) {
      app.layout = "empty";
    }
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

  viewportGrid.layout = "main";
}

// Wrap the init function in a DOM ready check
document.addEventListener("DOMContentLoaded", () => {
  init().catch(console.error);
});
