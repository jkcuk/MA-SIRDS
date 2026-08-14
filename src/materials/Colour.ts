import { Material } from "../core/Material";
import { ScatterResult } from "../core/ScatterResult";
import { Vector3 } from "../core/Vector3";
import { Ray } from "../core/Ray";
import { HitRecord } from "../core/HitRecord";

export class Colour extends Material {
  // Create a flat color material that does not scatter rays onward.
  constructor(public color: number[]) {
    super();
  }

  // Absorb the ray and return only the material's stored color.
  scatter(ray: Ray, hit: HitRecord): ScatterResult {
    return {
      scattered: null,
      attenuation: this.color
    };
  }
}
