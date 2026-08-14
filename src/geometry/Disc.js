import { eps } from "../core/Constants.js"
// A circular disc defined by a center point, a surface normal, and a radius.
export class Disc {
    center;
    normal;
    radius;
    material;
    // Store the center, normalized normal, radius, and material.
    constructor(center, normal, radius, material) {
        this.center = center;
        this.normal = normal;
        this.radius = radius;
        this.material = material;
        this.normal = normal.normalize();
    }
    // Intersect the ray with the plane containing the disc, then reject hits
    // outside the circular boundary.
    hit(ray) {
        const denom = ray.direction.dot(this.normal);
        if (Math.abs(denom) < eps)
            return null;
        const t = this.center.sub(ray.origin).dot(this.normal) / denom;
        if (t < 0)
            return null;
        const p = ray.at(t);
        const offset = p.sub(this.center);
        if (offset.dot(offset) > this.radius * this.radius)
            return null;
        const facingNormal = denom < 0 ? this.normal : this.normal.mul(-1);
        return {
            t,
            p,
            normal: facingNormal,
            material: this.material
        };
    }
}
