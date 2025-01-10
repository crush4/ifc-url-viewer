import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";

export class CollapsiblePanel extends OBC.Component implements OBC.Disposable {
  static readonly uuid = "939bb2bc-7d31-4a44-811d-68e4dd286c36" as const;

  readonly onDisposed = new OBC.Event();
  readonly onCollapsed = new OBC.Event<boolean>();

  enabled = true;
  private _isCollapsed = false;
  private handle: BUI.Button;

  constructor(components: OBC.Components) {
    super(components);
    components.add(CollapsiblePanel.uuid, this);

    this.handle = new BUI.Button();
    this.handle.icon = "ph:caret-right-bold";
    this.handle.style.position = "absolute";
    this.handle.style.left = "-20px";
    this.handle.style.top = "50%";
    this.handle.style.transform = "translateY(-50%)";
    this.handle.style.width = "20px";
    this.handle.style.minWidth = "20px";
    this.handle.style.height = "40px";
    this.handle.style.padding = "0";
    this.handle.style.borderRadius = "4px 0 0 4px";
    this.handle.style.background = "var(--bim-ui_button-bg)";
    this.handle.style.color = "var(--bim-ui_button-fg)";
    this.handle.style.border = "none";
    this.handle.style.boxShadow = "-1px 0 3px rgba(0,0,0,0.1)";
    this.handle.style.zIndex = "1000";
    this.handle.style.cursor = "pointer";
    this.handle.style.display = "flex";
    this.handle.style.alignItems = "center";
    this.handle.style.justifyContent = "center";
    this.handle.style.fontSize = "14px";
    this.handle.style.transition = "background-color 0.2s ease";
    this.handle.addEventListener("mouseenter", () => {
      this.handle.style.background = "var(--bim-ui_button-bg-hover)";
    });
    this.handle.addEventListener("mouseleave", () => {
      this.handle.style.background = "var(--bim-ui_button-bg)";
    });
    this.handle.onclick = () => {
      console.log("Handle clicked, current state:", this._isCollapsed);
      this.toggle();
    };
  }

  get isCollapsed() {
    return this._isCollapsed;
  }

  private updateIcon() {
    this.handle.icon = this._isCollapsed
      ? "ph:caret-left-bold"
      : "ph:caret-right-bold";
    this.handle.requestUpdate();
  }

  toggle() {
    this._isCollapsed = !this._isCollapsed;
    console.log("Toggle called, new state:", this._isCollapsed);
    this.updateIcon();
    this.onCollapsed.trigger(this._isCollapsed);
  }

  forceIconUpdate() {
    this.updateIcon();
  }

  setCollapsed(collapsed: boolean) {
    if (this._isCollapsed !== collapsed) {
      this._isCollapsed = collapsed;
      this.updateIcon();
    }
  }

  dispose() {
    this.enabled = false;
    this.onCollapsed.reset();
    this.onDisposed.trigger();
    this.onDisposed.reset();
  }

  createHandle() {
    return this.handle;
  }
}
