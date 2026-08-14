import { Material } from "../core/Material.js"
export class Colour extends Material {
    color;
    // Create a flat color material that does not scatter rays onward.
    constructor(color) {
        super();
        this.color = color;
    }
    // Absorb the ray and return only the material's stored color.
    scatter(ray, hit) {
        return {
            scattered: null,
            attenuation: this.color
        };
    }
}
