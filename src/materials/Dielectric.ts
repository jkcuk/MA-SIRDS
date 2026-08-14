import { Material } from "../core/Material";
import { ScatterResult } from "../core/ScatterResult";
import { HitRecord } from "../core/HitRecord";
import { Vector3 } from "../core/Vector3";
import { Ray } from "../core/Ray";

export class Dielectric extends Material {
  // Create a transparent material with the given index of refraction.
  constructor(public refIdx: number) {
    super();
  }

  // Refract the ray through the surface, or reflect it if refraction fails.
  scatter(ray: Ray, hit: HitRecord): ScatterResult {
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