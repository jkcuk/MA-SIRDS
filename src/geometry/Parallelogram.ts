import { Vector3 } from "../core/Vector3";
import { Ray } from "../core/Ray";
import { Material } from "../core/Material";
import { HitRecord } from "../core/HitRecord";
import { TPHVHitRecord } from "../core/TPHVHitRecord";
import { eps } from "../core/Constants";

export class Parallelogram {
  readonly normal: Vector3;

  /**
   * center   : centre of parallelogram
   * hAxis    : spans one direction (half-extent)
   * vAxis    : spans another direction (half-extent)
   */
  constructor(
    public center: Vector3,
    public hAxis: Vector3,
    public vAxis: Vector3,
    public material: Material
  ) {
    if (hAxis.cross(vAxis).length() < eps) {
      throw new Error("hAxis and vAxis must not be collinear");
    }

    this.normal = hAxis.cross(vAxis).normalize();
  }

  // --------------------------------------------------
  // Ray intersection
  // --------------------------------------------------
  hit(ray: Ray): HitRecord | null {

    const denom = ray.direction.dot(this.normal);
    if (Math.abs(denom) < eps) return null;

    const t = this.center.sub(ray.origin).dot(this.normal) / denom;
    if (t < 0) return null;

    const p = ray.at(t);
    const rel = p.sub(this.center);

    // Solve rel = u*hAxis + v*vAxis
    const det = this.hAxis.cross(this.vAxis).dot(this.normal);

    const u = rel.cross(this.vAxis).dot(this.normal) / det;
    const v = this.hAxis.cross(rel).dot(this.normal) / det;

    // inside check
    if (Math.abs(u) > 0.5 || Math.abs(v) > 0.5) {
      return null;
    }

    const facingNormal = denom < 0 ? this.normal : this.normal.mul(-1);

    return {
      t,
      p,
      normal: facingNormal,
      material: this.material
    };
  }

  // --------------------------------------------------
  // Parametric hit (for texture-style coords)
  // --------------------------------------------------
  tphvHit(ray: Ray): TPHVHitRecord | null {

    const denom = ray.direction.dot(this.normal);
    if (Math.abs(denom) < 1e-6) return null;

    const t = this.center.sub(ray.origin).dot(this.normal) / denom;
    if (t < 0) return null;

    const p = ray.at(t);
    const rel = p.sub(this.center);

    const det = this.hAxis.cross(this.vAxis).dot(this.normal);

    const u = rel.cross(this.vAxis).dot(this.normal) / det;
    const v = this.hAxis.cross(rel).dot(this.normal) / det;

    if (Math.abs(u) > 0.5 || Math.abs(v) > 0.5) {
      return null;
    }

    return {
      t,
      p,
      h: 2 * u,
      v: 2 * v
    };
  }
}