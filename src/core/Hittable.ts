import { Ray } from "./Ray";
import { HitRecord } from "./HitRecord";

export interface Hittable {
  hit(ray: Ray): HitRecord | null;
}