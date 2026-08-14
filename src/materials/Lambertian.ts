import { Material } from "../core/Material";
import { ScatterResult } from "../core/ScatterResult";
import { HitRecord } from "../core/HitRecord";
import { Vector3 } from "../core/Vector3";
import { Ray } from "../core/Ray";

export class Lambertian extends Material {
  // Create a diffuse material with the tint used for scattering.
  constructor(public color: number[]) {
    super();
  }

  // Scatter the ray in a random direction around the hit normal.
  scatter(ray: Ray, hit: HitRecord): ScatterResult {
    // Diffuse materials bounce rays in a random direction around the normal.
    const target = hit.p.add(hit.normal).add(randomUnit());
    return {
      scattered: new Ray(hit.p, target.sub(hit.p)),
      attenuation: this.color
    };
  }
}

// Generate a random direction and normalize it for diffuse jitter.
function randomUnit(): Vector3 {
  // Create a random unit vector to jitter the outgoing ray.
  return new Vector3(
    Math.random(),
    Math.random(),
    Math.random()
  ).normalize();
}