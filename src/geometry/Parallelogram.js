import { eps } from "../core/Constants.js"
export class Parallelogram {
    center;
    hAxis;
    vAxis;
    material;
    normal;
    /**
     * center   : centre of parallelogram
     * hAxis    : spans one direction (half-extent)
     * vAxis    : spans another direction (half-extent)
     */
    constructor(center, hAxis, vAxis, material) {
        this.center = center;
        this.hAxis = hAxis;
        this.vAxis = vAxis;
        this.material = material;
        if (hAxis.cross(vAxis).length() < eps) {
            throw new Error("hAxis and vAxis must not be collinear");
        }
        this.normal = hAxis.cross(vAxis).normalize();
    }
    // --------------------------------------------------
    // Ray intersection
    // --------------------------------------------------
    hit(ray) {
        const denom = ray.direction.dot(this.normal);
        if (Math.abs(denom) < eps)
            return null;
        const t = this.center.sub(ray.origin).dot(this.normal) / denom;
        if (t < 0)
            return null;
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
    tphvHit(ray) {
        const denom = ray.direction.dot(this.normal);
        if (Math.abs(denom) < 1e-6)
            return null;
        const t = this.center.sub(ray.origin).dot(this.normal) / denom;
        if (t < 0)
            return null;
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
