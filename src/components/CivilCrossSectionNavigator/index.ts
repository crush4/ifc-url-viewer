import * as THREE from "three";
import * as OBC from "@thatopen/components";
import * as FRAGS from "@thatopen/fragments";
import { ClipEdges } from "../ClipEdges";

export class CivilCrossSectionNavigator extends OBC.Component {
  static uuid = "e4c2c7c0-d2a7-4b9f-8b9a-d1c7f2b1c9a1" as const;

  enabled = true;
  private _world?: OBC.World;
  private _world3D?: OBC.World;
  private _clipper?: ClipEdges;

  constructor(components: OBC.Components) {
    super(components);
    this._clipper = components.get(ClipEdges);
  }

  get world() {
    return this._world;
  }

  set world(world: OBC.World | undefined) {
    this._world = world;
  }

  get world3D() {
    return this._world3D;
  }

  set world3D(world: OBC.World | undefined) {
    this._world3D = world;
  }

  /**
   * Sets up the cross section at the specified point on the given mesh
   */
  set(mesh: THREE.Mesh, point: THREE.Vector3) {
    if (!this._world || !this._clipper) return;

    // Get the direction perpendicular to the curve at this point
    const direction = this.getCrossSectionDirection(mesh, point);
    if (!direction) return;

    // Create a plane at the point perpendicular to the curve
    const plane = new THREE.Plane();
    plane.setFromNormalAndCoplanarPoint(direction, point);

    // Update clipper with new plane
    this._clipper.plane = plane;
    this._clipper.update(true);

    // Update camera to look at cross section
    if (this._world.camera.hasCameraControls()) {
      const camera = this._world.camera.controls.camera;
      const controls = this._world.camera.controls;

      // Position camera to look at cross section
      const cameraPos = point.clone().add(direction.multiplyScalar(20));
      camera.position.copy(cameraPos);
      camera.lookAt(point);

      // Update controls target
      controls.setTarget(point.x, point.y, point.z, true);
    }
  }

  /**
   * Gets the direction perpendicular to the curve at the given point
   */
  private getCrossSectionDirection(mesh: THREE.Mesh, point: THREE.Vector3) {
    if (!mesh.geometry.attributes.position) return null;

    // Get curve direction at point
    const positions = mesh.geometry.attributes.position;
    const curveDirection = new THREE.Vector3();

    // Find closest point on curve
    let minDist = Infinity;
    let closestIndex = 0;

    for (let i = 0; i < positions.count; i++) {
      const pos = new THREE.Vector3();
      pos.fromBufferAttribute(positions, i);
      pos.applyMatrix4(mesh.matrixWorld);

      const dist = pos.distanceTo(point);
      if (dist < minDist) {
        minDist = dist;
        closestIndex = i;
      }
    }

    // Get direction at closest point
    if (closestIndex > 0 && closestIndex < positions.count - 1) {
      const prev = new THREE.Vector3();
      const next = new THREE.Vector3();

      prev.fromBufferAttribute(positions, closestIndex - 1);
      next.fromBufferAttribute(positions, closestIndex + 1);

      curveDirection.subVectors(next, prev).normalize();

      // Get perpendicular direction
      const up = new THREE.Vector3(0, 1, 0);
      return new THREE.Vector3().crossVectors(curveDirection, up).normalize();
    }

    return null;
  }

  /**
   * Clears the current cross section view
   */
  clear() {
    if (!this._clipper) return;
    this._clipper.enabled = false;
    this._clipper.update(true);
  }
}
