import { eps } from "../core/Constants.js"
// An infinite plane defined by a point on the plane and a surface normal.
export class Plane {
    point;
    normal;
    material;
    // Store a reference point on the plane, its normal, and the material.
    constructor(point, normal, material) {
        this.point = point;
        this.normal = normal;
        this.material = material;
    }
    // Test whether a ray intersects the plane and return the closest forward hit.
    hit(ray) {
        const denom = ray.direction.dot(this.normal);
        if (Math.abs(denom) < eps)
            return null;
        const t = this.point.sub(ray.origin).dot(this.normal) / denom;
        if (t < 0)
            return null;
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
