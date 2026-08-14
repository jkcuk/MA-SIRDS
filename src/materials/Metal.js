import { Material } from "../core/Material.js"
import { Ray } from "../core/Ray.js"
export class Metal extends Material {
    color;
    fuzz;
    // Create a reflective material with a tint and fuzz amount.
    constructor(color, fuzz) {
        super();
        this.color = color;
        this.fuzz = fuzz;
    }
    // Reflect the ray off the surface and keep the material's tint.
    scatter(ray, hit) {
        // Perfectly reflect the incoming ray around the surface normal.
        const reflected = ray.direction.reflect(hit.normal);
        return {
            scattered: new Ray(hit.p, reflected),
            attenuation: this.color
        };
    }
}
