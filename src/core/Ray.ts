import { Vector3 } from "./Vector3";

export class Ray {
  // Store the ray's origin and direction.
  constructor(public origin: Vector3, public direction: Vector3) {}

  // Compute the point reached after moving t units along the ray.
  at(t: number): Vector3 {
    return this.origin.add(this.direction.mul(t));
  }
}