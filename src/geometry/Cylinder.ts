import { Vector3 } from "../core/Vector3";
import { Ray } from "../core/Ray";
import { Material } from "../core/Material";
import { HitRecord } from "../core/HitRecord";
import { eps } from "../core/Constants";

// A cylinder defined by a center point and an arbitrary axis direction. If
// height is omitted, the cylinder is infinite. If height is provided, the
// cylinder is clipped to that total height and gains flat end caps.
export class Cylinder {
  // Store the center, normalized axis direction, radius, material, and height.
  constructor(
    public center: Vector3,
    public axis: Vector3,
    public radius: number,
    public material: Material,
    public height?: number
  ) {
    this.axis = axis.normalize();
  }

  // Intersect the ray with the curved side surface and, for finite cylinders,
  // also with the two end caps.
  hit(ray: Ray): HitRecord | null {
    const hits: HitRecord[] = [];
    const halfHeight = this.height !== undefined ? this.height / 2 : undefined;

    // Side surface: remove the components parallel to the cylinder axis, then
    // solve the quadratic in the remaining perpendicular space.
    const oc = ray.origin.sub(this.center);
    const directionAxis = ray.direction.dot(this.axis);
    const originAxis = oc.dot(this.axis);
    const dPerp = ray.direction.sub(this.axis.mul(directionAxis));
    const ocPerp = oc.sub(this.axis.mul(originAxis));

    const a = dPerp.dot(dPerp);
    const b = ocPerp.dot(dPerp);
    const c = ocPerp.dot(ocPerp) - this.radius * this.radius;

    const discriminant = b * b - a * c;
    if (discriminant >= 0 && a !== 0) {
      const sqrtDiscriminant = Math.sqrt(discriminant);
      const ts = [(-b - sqrtDiscriminant) / a, (-b + sqrtDiscriminant) / a];

      for (const t of ts) {
        if (t < 0) continue;

        const p = ray.at(t);
        if (halfHeight !== undefined) {
          const axialOffset = p.sub(this.center).dot(this.axis);
          if (Math.abs(axialOffset) > halfHeight) continue;
        }

        const axisProjection = this.axis.mul(p.sub(this.center).dot(this.axis));
        const normal = p.sub(this.center).sub(axisProjection).normalize();

        hits.push({ t, p, normal, material: this.material });
      }
    }

    // End caps only exist for a finite cylinder.
    if (halfHeight !== undefined) {
      const capCenters = [
        this.center.sub(this.axis.mul(halfHeight)),
        this.center.add(this.axis.mul(halfHeight))
      ];

      for (let i = 0; i < capCenters.length; i++) {
        const capCenter = capCenters[i];
        const capNormal = i === 0 ? this.axis.mul(-1) : this.axis;
        const denom = ray.direction.dot(capNormal);
        if (Math.abs(denom) < eps) continue;

        const t = capCenter.sub(ray.origin).dot(capNormal) / denom;
        if (t < 0) continue;

        const p = ray.at(t);
        const radial = p.sub(capCenter).sub(this.axis.mul(p.sub(capCenter).dot(this.axis)));
        if (radial.dot(radial) > this.radius * this.radius) continue;

        hits.push({ t, p, normal: capNormal, material: this.material });
      }
    }

    if (hits.length === 0) return null;

    hits.sort((left, right) => left.t - right.t);
    return hits[0];
  }
}