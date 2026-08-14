import { Material } from "../core/Material";
import { ScatterResult } from "../core/ScatterResult";
import { HitRecord } from "../core/HitRecord";
import { Vector3 } from "../core/Vector3";
import { Ray } from "../core/Ray";

export class Phong extends Material {
  // Create a Phong material with a base color, a light direction, and the
  // ambient/diffuse/specular terms used by the lighting model.
  constructor(
    public color: number[],
    public lightDirection: Vector3 = new Vector3(-1, -1, -1),
    public ambient = 0.12,
    public diffuse = 0.75,
    public specular = 0.35,
    public shininess = 24
  ) {
    super();
    this.lightDirection = lightDirection.normalize();
  }

  // Shade the hit point locally and stop the ray path, because Phong lighting
  // is computed from the surface normal, view direction, and a fixed light.
  scatter(ray: Ray, hit: HitRecord): ScatterResult {
    const normal = hit.normal.normalize();
    const lightDir = this.lightDirection.mul(-1).normalize();
    const viewDir = ray.direction.mul(-1).normalize();

    const diffuseAmount = Math.max(normal.dot(lightDir), 0);
    const reflectedLight = lightDir.mul(-1).reflect(normal).normalize();
    const specularAmount = Math.pow(Math.max(reflectedLight.dot(viewDir), 0), this.shininess);

    const lighting = this.ambient + (this.diffuse * diffuseAmount);
    const intensity = lighting + (this.specular * specularAmount);

    return {
      scattered: null,
      attenuation: [
        Math.min(1, this.color[0] * intensity),
        Math.min(1, this.color[1] * intensity),
        Math.min(1, this.color[2] * intensity)
      ]
    };
  }
}