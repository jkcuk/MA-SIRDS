import { Vector3 } from "../core/Vector3";
import { Ray } from "../core/Ray";
import { Material } from "../core/Material";
import { HitRecord } from "../core/HitRecord";
import { eps } from "../core/Constants";

// An axis-aligned cuboid defined by opposite corner points.
export class Cuboid {
  // Store the minimum and maximum corners plus the surface material.
  constructor(
    public min: Vector3,
    public max: Vector3,
    public material: Material
  ) {}

  // Intersect the ray with the cuboid using the slab method and return the
  // nearest valid surface hit.
  hit(ray: Ray): HitRecord | null {
    let tMin = -Infinity;
    let tMax = Infinity;
    let entryNormal: Vector3 | null = null;
    let exitNormal: Vector3 | null = null;

    const updateSlab = (
      originComponent: number,
      directionComponent: number,
      minComponent: number,
      maxComponent: number,
      negativeNormal: Vector3,
      positiveNormal: Vector3
    ) => {
      if (Math.abs(directionComponent) < eps) {
        return originComponent >= minComponent && originComponent <= maxComponent;
      }

      let t0 = (minComponent - originComponent) / directionComponent;
      let t1 = (maxComponent - originComponent) / directionComponent;
      let normal0 = negativeNormal;
      let normal1 = positiveNormal;

      if (t0 > t1) {
        [t0, t1] = [t1, t0];
        [normal0, normal1] = [normal1, normal0];
      }

      if (t0 > tMin) {
        tMin = t0;
        entryNormal = normal0;
      }

      if (t1 < tMax) {
        tMax = t1;
        exitNormal = normal1;
      }

      return tMin <= tMax;
    };

    if (!updateSlab(ray.origin.x, ray.direction.x, this.min.x, this.max.x, new Vector3(-1, 0, 0), new Vector3(1, 0, 0))) {
      return null;
    }
    if (!updateSlab(ray.origin.y, ray.direction.y, this.min.y, this.max.y, new Vector3(0, -1, 0), new Vector3(0, 1, 0))) {
      return null;
    }
    if (!updateSlab(ray.origin.z, ray.direction.z, this.min.z, this.max.z, new Vector3(0, 0, -1), new Vector3(0, 0, 1))) {
      return null;
    }

    if (tMax < 0) return null;

    const t = tMin >= 0 ? tMin : tMax;
    const p = ray.at(t);
    const normal = tMin >= 0 ? entryNormal : exitNormal;

    if (!normal) return null;

    return {
      t,
      p,
      normal,
      material: this.material
    };
  }
}