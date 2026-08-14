import { Material } from "../core/Material.js"
import { Vector3 } from "../core/Vector3.js"
import { Ray } from "../core/Ray.js"
export class Lambertian extends Material {
    color;
    // Create a diffuse material with the tint used for scattering.
    constructor(color) {
        super();
        this.color = color;
    }
    // Scatter the ray in a random direction around the hit normal.
    scatter(ray, hit) {
        // Diffuse materials bounce rays in a random direction around the normal.
        const target = hit.p.add(hit.normal).add(randomUnit());
        return {
            scattered: new Ray(hit.p, target.sub(hit.p)),
            attenuation: this.color
        };
    }
}
// Generate a random direction and normalize it for diffuse jitter.
function randomUnit() {
    // Create a random unit vector to jitter the outgoing ray.
    return new Vector3(Math.random(), Math.random(), Math.random()).normalize();
}
