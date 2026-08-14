import { Material } from "../core/Material.js"
import { Ray } from "../core/Ray.js"
export class Dielectric extends Material {
    refIdx;
    // Create a transparent material with the given index of refraction.
    constructor(refIdx) {
        super();
        this.refIdx = refIdx;
    }
    // Refract the ray through the surface, or reflect it if refraction fails.
    scatter(ray, hit) {
        // Use Snell's law to refract the ray through the surface when possible.
        const eta = 1 / this.refIdx;
        const refracted = ray.direction.refract(hit.normal, eta);
        const dir = refracted || ray.direction.reflect(hit.normal);
        return {
            scattered: new Ray(hit.p, dir),
            attenuation: [1, 1, 1]
        };
    }
}
