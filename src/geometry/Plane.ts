import { Vector3 } from "../core/Vector3";
import { Ray } from "../core/Ray";
import { Material } from "../core/Material";
import { HitRecord } from "../core/HitRecord";
import { eps } from "../core/Constants";

// An infinite plane defined by a point on the plane and a surface normal.
export class Plane {
  // Store a reference point on the plane, its normal, and the material.
  constructor(
    public point: Vector3,
    public normal: Vector3,
    public material: Material
  ) {}

  // Test whether a ray intersects the plane and return the closest forward hit.
  hit(ray: Ray): HitRecord | null {
    const denom = ray.direction.dot(this.normal);
    if (Math.abs(denom) < eps) return null;

    const t = this.point.sub(ray.origin).dot(this.normal) / denom;
    if (t < 0) return null;

    const p = ray.at(t);
    const facingNormal = denom < 0 ? this.normal : this.normal.mul(-1);

    return {
      t,
      p,
      normal: facingNormal.normalize(),
      material: this.material
    };
  }
}