import { Ray } from "../core/Ray";

export interface ScatterResult {
  scattered: Ray | null;
  attenuation: number[];
}