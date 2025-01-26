import * as THREE from "three";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as BUI from "@thatopen/ui";
import * as BUIC from "@thatopen/ui-obc";
import Stats from "stats.js";
import projectInformation from "./components/Panels/ProjectInformation";
import elementData from "./components/Panels/Selection";
import settings from "./components/Panels/Settings";
import load from "./components/Toolbars/Sections/Import";
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
  BUIC.Manager.init();

  const components = new OBC.Components();
  const worlds = components.get(OBC.Worlds);

  // Create UI layout
  const app = document.getElementById("app") as BUI.Grid;

  // Create viewports
  const viewport3D = BUI.Component.create<BUI.Viewport>(() => {
    return BUI.html`
      <bim-viewport>
        <bim-grid floating></bim-grid>
      </bim-viewport>
    `;
  });

  const viewportPlan = BUI.Component.create<BUIC.World2D>(() => {
    return BUI.html`<bim-world-2d id="scene-2d-left"></bim-world-2d>`;
  });

  const viewportSection = BUI.Component.create<BUIC.World2D>(() => {
    return BUI.html`<bim-world-2d id="scene-2d-right"></bim-world-2d>`;
  });

  // Initialize components first
  components.init();

  // Create main 3D world
  const world = worlds.create<
    OBC.SimpleScene,
    OBC.OrthoPerspectiveCamera,
    OBF.RendererWith2D
  >();
  world.name = "Main";

  world.renderer = new OBF.RendererWith2D(components, viewport3D);
  world.scene = new OBC.SimpleScene(components);
  world.scene.setup();
  world.scene.three.background = null;

  world.camera = new OBC.OrthoPerspectiveCamera(components);

  // Set up highlighter and its events before setup
  const highlighter = components.get(OBF.Highlighter);
  highlighter.events = {
    select: {
      onBeforeHighlight: new OBC.Event(),
      onHighlight: new OBC.Event(),
      onClear: new OBC.Event(),
    },
    hover: {
      onHighlight: new OBC.Event(),
      onClear: new OBC.Event(),
    },
    exclusion: {
      onHighlight: new OBC.Event(),
      onClear: new OBC.Event(),
    },
  };
  highlighter.setup({ world });

  // Initialize fragments and related components
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

  // Create panels before layout setup
  const projectInformationPanel = projectInformation(components);
  const elementDataPanel = elementData(components);

  // Create left panel
  const leftPanelComponent = BUI.Component.create<BUI.Panel>(() => {
    return BUI.html`
      <bim-tabs switchers-full>
        <bim-tab name="project" label="${i18n.t("panels.project.title")}" icon="ph:building-fill">
          ${projectInformationPanel}
        </bim-tab>
        <bim-tab name="settings" label="${i18n.t("panels.settings.title")}" icon="solar:settings-bold">
          ${settings(components)}
        </bim-tab>
        <bim-tab name="help" label="${i18n.t("panels.help.title")}" icon="material-symbols:help">
          ${help}
        </bim-tab>
      </bim-tabs> 
    `;
  });

  const leftPanel = withLocalization(
    leftPanelComponent as unknown as { requestUpdate: () => void },
    () => {
      (
        leftPanelComponent as unknown as { requestUpdate: () => void }
      ).requestUpdate();
    }
  );

  // Now set up the layout with the created panels
  app.layouts = {
    main: {
      template: `
        "leftPanel selectionInfo selectionInfo" 5rem
        "leftPanel viewport3D viewportPlan" 1fr
        "leftPanel viewport3D viewportSection" 1fr
        / 20rem 2fr 1fr
      `,
      elements: {
        leftPanel,
        selectionInfo: elementDataPanel,
        viewport3D,
        viewportPlan,
        viewportSection,
      },
      resizers: {
        selectionInfo: {
          direction: "vertical",
          next: true,
          size: { min: "4rem", max: "8rem" },
        },
      },
    },
    empty: {
      template: `
        "leftPanel emptyState" 1fr
        / 20rem 1fr
      `,
      elements: {
        leftPanel,
        emptyState: createEmptyState(components),
      },
    },
  };

  app.layout = "main";

  const worldGrid = components.get(OBC.Grids).create(world);
  worldGrid.material.uniforms.uColor.value = new THREE.Color(0x424242);
  worldGrid.material.uniforms.uSize1.value = 2;
  worldGrid.material.uniforms.uSize2.value = 8;

  const resizeWorld = () => {
    world.renderer?.resize();
    world.camera.updateAspect();
  };

  viewport3D.addEventListener("resize", resizeWorld);

  world.camera.controls.setLookAt(5, 5, 5, 0, 0, 0);

  // Set up culler
  const culler = components.get(OBC.Cullers).create(world);
  culler.threshold = 5;

  world.camera.controls.restThreshold = 0.25;
  world.camera.controls.addEventListener("rest", () => {
    const renderer = world.renderer as OBF.RendererWith2D;

    if (culler && !culler.dispose) {
      culler.needsUpdate = true;
    }

    if (renderer) {
      renderer.needsUpdate = true;
    }
  });

  // Load model
  const file = await fetch(
    "https://thatopen.github.io/engine_components/resources/road.frag"
  );
  const data = await file.arrayBuffer();
  const buffer = new Uint8Array(data);
  const model = fragments.load(buffer);
  world.scene.three.add(model);

  const properties = await fetch(
    "https://thatopen.github.io/engine_components/resources/road.json"
  );
  model.setLocalProperties(await properties.json());

  // Set up navigators
  const world2DLeft = document.getElementById("scene-2d-left") as BUIC.World2D;
  world2DLeft.components = components;

  const world2DRight = document.getElementById(
    "scene-2d-right"
  ) as BUIC.World2D;
  world2DRight.components = components;

  if (!world2DLeft.world || !world2DRight.world) {
    throw new Error("World not found!");
  }

  // Plan navigator
  const planNavigator = components.get(OBF.CivilPlanNavigator);
  planNavigator.world = world2DLeft.world;
  await planNavigator.draw(model);

  // 3D navigator
  const navigator3D = components.get(OBF.Civil3DNavigator);
  navigator3D.world = world;
  navigator3D.draw(model);

  const crossNavigator = components.get(OBF.CivilCrossSectionNavigator);
  crossNavigator.world = world2DRight.world;
  crossNavigator.world3D = world;

  planNavigator.onMarkerChange.add(({ alignment, percentage, type, curve }) => {
    navigator3D.setMarker(alignment, percentage, type);
    if (type === "select") {
      const mesh = curve.alignment.absolute[curve.index].mesh;
      const point = alignment.getPointAt(percentage, "absolute");
      crossNavigator.set(mesh, point);
    }
  });

  planNavigator.onHighlight.add(({ mesh }) => {
    navigator3D.highlighter.select(mesh);
    const index = mesh.curve.index;
    const curve3d = mesh.curve.alignment.absolute[index];
    curve3d.mesh.geometry.computeBoundingSphere();
    const sphere = curve3d.mesh.geometry.boundingSphere;
    if (sphere) {
      world.camera.controls.fitToSphere(sphere, true);
    }
  });

  planNavigator.onMarkerHidden.add(({ type }) => {
    navigator3D.hideMarker(type);
  });

  classifier.byEntity(model);
  const classifications = classifier.list;

  const clipper = components.get(OBF.ClipEdges);
  const styles = clipper.styles.list;

  for (const category in classifications.entities) {
    const found = classifier.find({ entities: [category] });

    const color = new THREE.Color(Math.random(), Math.random(), Math.random());
    const lineMaterial = new THREE.LineBasicMaterial({ color });
    clipper.styles.create(
      category,
      new Set(),
      world2DRight.world,
      lineMaterial
    );

    for (const fragID in found) {
      const foundFrag = fragments.list.get(fragID);
      if (!foundFrag) {
        continue;
      }
      styles[category].fragments[fragID] = new Set(found[fragID]);
      styles[category].meshes.add(foundFrag.mesh);
    }
  }

  clipper.update(true);

  const stats = new Stats();
  stats.showPanel(2);
  document.body.append(stats.dom);
  stats.dom.style.left = "0px";
  stats.dom.style.zIndex = "unset";
  world.renderer.onBeforeUpdate.add(() => stats.begin());
  world.renderer.onAfterUpdate.add(() => stats.end());

  fragments.onFragmentsLoaded.add(async (model) => {
    if (model.hasProperties) {
      await indexer.process(model);
      classifier.byEntity(model);
    }

    if (!model.isStreamed) {
      for (const fragment of model.items) {
        world.meshes.add(fragment.mesh);
        if (culler && !culler.dispose) {
          culler.add(fragment.mesh);
        }
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
        if (culler && !culler.dispose) {
          culler.remove(mesh);
        }
      }
    }
  });

  // Initialize collapsible panel
  const collapsiblePanel = components.get(CollapsiblePanel);
  if (!collapsiblePanel) {
    const panel = new CollapsiblePanel(components);
    components.add(CollapsiblePanel.uuid, panel);
  }

  // Create toolbar
  const toolbar = BUI.Component.create(() => {
    return BUI.html`
      <bim-tabs floating style="justify-self: center; border-radius: 0.5rem;">
        <bim-tab label="Import">
          <bim-toolbar>
            ${load(components)}
          </bim-toolbar>
        </bim-tab>
        <bim-tab label="Selection">
          <bim-toolbar>
            ${camera(world)}
            ${selection(components, world)}
          </bim-toolbar>
        </bim-tab>
        <bim-tab label="Measurement">
          <bim-toolbar>
              ${measurement(world, components)}
          </bim-toolbar>      
        </bim-tab>
      </bim-tabs>
    `;
  });

  // Set up viewport grid
  setTimeout(() => {
    const appManager = components.get(AppManager);
    const viewportGrid =
      viewport3D.querySelector<BUI.Grid>("bim-grid[floating]")!;
    appManager.grids.set("viewport", viewportGrid);

    viewportGrid.layouts = {
      main: {
        template: `
          "empty" 1fr
          "toolbar" auto
          / 1fr
        `,
        elements: {
          toolbar,
        },
      },
    };

    viewportGrid.layout = "main";
  }, 0);
}

// Wrap the init function in a DOM ready check
document.addEventListener("DOMContentLoaded", () => {
  init().catch(console.error);
});
