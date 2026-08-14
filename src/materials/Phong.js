import { Material } from "../core/Material.js"
import { Vector3 } from "../core/Vector3.js"
export class Phong extends Material {
    color;
    lightDirection;
    ambient;
    diffuse;
    specular;
    shininess;
    // Create a Phong material with a base color, a light direction, and the
    // ambient/diffuse/specular terms used by the lighting model.
    constructor(color, lightDirection = new Vector3(-1, -1, -1), ambient = 0.12, diffuse = 0.75, specular = 0.35, shininess = 24) {
        super();
        this.color = color;
        this.lightDirection = lightDirection;
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
        this.shininess = shininess;
        this.lightDirection = lightDirection.normalize();
    }
    // Shade the hit point locally and stop the ray path, because Phong lighting
    // is computed from the surface normal, view direction, and a fixed light.
    scatter(ray, hit) {
        const normal = hit.normal.normalize();
        const lightDir = this.lightDirection.mul(-1).normalize();
        const viewDir = ray.direction.mul(-1).normalize();
        const diffuseAmount = Math.max(normal.dot(lightDir), 0);
        const reflectedLight = lightDir.mul(-1).reflect(normal).normalize();
        const specularAmount = Math.pow(Math.max(reflectedLight.dot(viewDir), 0), this.shininess);
        const lighting = this.ambient + (this.diffuse * diffuseAmount);
        const intensity = lighting + (this.specular * specularAmount);
        return {
            scattered: null,
            attenuation: [
                Math.min(1, this.color[0] * intensity),
                Math.min(1, this.color[1] * intensity),
                Math.min(1, this.color[2] * intensity)
            ]
        };
    }
}
