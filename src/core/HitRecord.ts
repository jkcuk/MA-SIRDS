import { Vector3 } from "./Vector3";
import { Material } from "../core/Material";

export interface HitRecord {
  t: number;
  p: Vector3;
  normal: Vector3;
  material: Material;
}