import { Material } from "../core/Material";
import { ScatterResult } from "../core/ScatterResult";
import { HitRecord } from "../core/HitRecord";
import { Vector3 } from "../core/Vector3";
import { Ray } from "../core/Ray";

export class Metal extends Material {
  // Create a reflective material with a tint and fuzz amount.
  constructor(public color: number[], public fuzz: number) {
    super();
  }

  // Reflect the ray off the surface and keep the material's tint.
  scatter(ray: Ray, hit: HitRecord): ScatterResult | null {
    // Perfectly reflect the incoming ray around the surface normal.
    const reflected = ray.direction.reflect(hit.normal);
    return {
      scattered: new Ray(hit.p, reflected),
      attenuation: this.color
    };
  }
}