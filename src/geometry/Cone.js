import { eps } from "../core/Constants.js"
// A right circular cone defined by an apex, an arbitrary axis direction, and
// an opening angle in radians. If height is provided, the cone is clipped to a
// finite length and gains a flat base cap.
export class Cone {
    apex;
    axis;
    angle;
    material;
    height;
    // Store the apex, normalized axis direction, opening angle, material, and
    // optional height.
    constructor(apex, axis, angle, material, height) {
        // console.log("position:", this.apex, "axis:", this.axis, "angle:", this.angle, "material:", this.material, "height:", this .height);
        this.apex = apex;
        this.axis = axis;
        this.angle = angle;
        this.material = material;
        this.height = height;
        this.axis = this.axis.normalize();
    }
    // Intersect the ray with the cone side surface and, for finite cones, with
    // the base cap at the end of the axis.
    hit(ray) {
        const hits = [];
        const cos2 = Math.cos(this.angle) * Math.cos(this.angle);
        const axis = this.axis;
        const co = ray.origin.sub(this.apex);
        // Solve the quadratic formed by the cone's implicit equation.
        const dAxis = ray.direction.dot(axis);
        const coAxis = co.dot(axis);
        const dd = ray.direction.dot(ray.direction);
        const cod = co.dot(ray.direction);
        const coc = co.dot(co);
        const a = dAxis * dAxis - cos2 * dd;
        const b = 2 * (coAxis * dAxis - cos2 * cod);
        const c = coAxis * coAxis - cos2 * coc;
        const discriminant = b * b - 4 * a * c;
        if (discriminant >= 0 && Math.abs(a) > eps) {
            const sqrtDiscriminant = Math.sqrt(discriminant);
            const ts = [
                (-b - sqrtDiscriminant) / (2 * a),
                (-b + sqrtDiscriminant) / (2 * a)
            ];
            for (const t of ts) {
                if (t < 0)
                    continue;
                const p = ray.at(t);
                const axialOffset = p.sub(this.apex).dot(axis);
                // The cone extends only away from the apex along its axis.
                if (axialOffset < 0)
                    continue;
                if (this.height !== undefined && axialOffset > this.height)
                    continue;
                const v = p.sub(this.apex);
                const normal = axis.mul(v.dot(axis)).sub(v.mul(cos2)).normalize();
                hits.push({ t, p, normal, material: this.material });
            }
        }
        // Finite cones get a circular cap at the base.
        if (this.height !== undefined) {
            const baseCenter = this.apex.add(axis.mul(this.height));
            const baseRadius = this.height * Math.tan(this.angle);
            const denom = ray.direction.dot(axis);
            if (Math.abs(denom) >= eps) {
                const t = baseCenter.sub(ray.origin).dot(axis) / denom;
                if (t >= 0) {
                    const p = ray.at(t);
                    const radial = p.sub(baseCenter).sub(axis.mul(p.sub(baseCenter).dot(axis)));
                    if (radial.dot(radial) <= baseRadius * baseRadius) {
                        hits.push({
                            t,
                            p,
                            normal: axis,
                            material: this.material
                        });
                    }
                }
            }
        }
        if (hits.length === 0)
            return null;
        hits.sort((left, right) => left.t - right.t);
        return hits[0];
    }
}
