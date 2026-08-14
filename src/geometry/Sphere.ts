import { Vector3 } from "../core/Vector3";
import { Ray } from "../core/Ray";
import { Material } from "../core/Material";
import { HitRecord } from "../core/HitRecord";

export class Sphere {
  // Create a sphere with a center, radius, and surface material.
  constructor(
    public center: Vector3,
    public radius: number,
    public material: Material
  ) {}

  // Test whether a ray intersects the sphere and return the nearest hit.
  hit(ray: Ray): HitRecord | null {
    // Solve the ray-sphere intersection equation in quadratic form.
    const oc = ray.origin.sub(this.center);

    const a = ray.direction.dot(ray.direction);
    const b = oc.dot(ray.direction);
    const c = oc.dot(oc) - this.radius * this.radius;

    const discriminant = b * b - a * c;
    if (discriminant < 0) return null;

    // Use the nearest valid intersection in front of the ray origin.
    const t = (-b - Math.sqrt(discriminant)) / a;
    if (t < 0) return null;

    // Return the hit point, surface normal, and the material attached to the sphere.
    const p = ray.at(t);
    const normal = p.sub(this.center).normalize();

    return { t, p, normal, material: this.material };
  }
}