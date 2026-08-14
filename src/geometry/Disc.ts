import { Vector3 } from "../core/Vector3";
import { Ray } from "../core/Ray";
import { Material } from "../core/Material";
import { HitRecord } from "../core/HitRecord";
import { eps } from "../core/Constants";

// A circular disc defined by a center point, a surface normal, and a radius.
export class Disc {
  // Store the center, normalized normal, radius, and material.
  constructor(
    public center: Vector3,
    public normal: Vector3,
    public radius: number,
    public material: Material
  ) {
    this.normal = normal.normalize();
  }

  // Intersect the ray with the plane containing the disc, then reject hits
  // outside the circular boundary.
  hit(ray: Ray): HitRecord | null {
    const denom = ray.direction.dot(this.normal);
    if (Math.abs(denom) < eps) return null;

    const t = this.center.sub(ray.origin).dot(this.normal) / denom;
    if (t < 0) return null;

    const p = ray.at(t);
    const offset = p.sub(this.center);
    if (offset.dot(offset) > this.radius * this.radius) return null;

    const facingNormal = denom < 0 ? this.normal : this.normal.mul(-1);
    return {
      t,
      p,
      normal: facingNormal,
      material: this.material
    };
  }
}