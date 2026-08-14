import { Ray } from "../core/Ray";
import { HitRecord } from "../core/HitRecord";
import { ScatterResult } from "../core/ScatterResult";

export abstract class Material {
  // Ask the material how the incoming ray behaves at the hit point.
  abstract scatter(ray: Ray, hit: HitRecord): ScatterResult | null;
}