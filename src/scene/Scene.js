import { eps } from "../core/Constants.js"
export class Scene {
    objects = [];
    maxDepth = 10;
    // Add any hittable object to the list of objects the renderer can test.
    add(obj) {
        this.objects.push(obj);
    }
    // Find the closest intersection of a ray with any object in the scene, returning
    // the hit record for that intersection, or null if no object was hit.
    hit(ray) {
        let closest = Infinity;
        let hit = null;
        for (const obj of this.objects) {
            const h = obj.hit(ray);
            if (h && h.t > eps && h.t < closest) {
                closest = h.t;
                hit = h;
            }
        }
        return hit;
    }
    // Trace a ray through this scene recursively, returning the accumulated RGB
    // color after all visible bounces have been evaluated.
    trace(ray, depth) {
        // Stop after a fixed number of bounces so reflective or refractive paths
        // cannot recurse forever.
        if (depth > this.maxDepth)
            return [0, 0, 0];
        // Search every object in the scene and keep only the closest intersection.
        let hit = this.hit(ray);
        if (hit) {
            // Give the material control over what happens at the hit point. Some
            // materials absorb light, while others bounce the ray into a new path.
            const scatter = hit.material.scatter(ray, hit);
            if (!scatter)
                return [0, 0, 0];
            // If the material ends the path instead of scattering, use white as the
            // returned color so the material's attenuation can still show through.
            const col = scatter.scattered === null
                ? [1, 1, 1]
                : this.trace(scatter.scattered, depth + 1);
            // Combine the recursively traced color with the material's attenuation
            // so the surface tint and brightness survive through each bounce.
            return [
                col[0] * scatter.attenuation[0],
                col[1] * scatter.attenuation[1],
                col[2] * scatter.attenuation[2]
            ];
        }
        // Rays that miss every object sample the background sky color.
        return [0.5, 0.7, 1.0]; // sky
    }
}
