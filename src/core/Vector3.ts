export class Vector3 {
  // Create a 3D vector with x, y, and z components.
  constructor(public x: number, public y: number, public z: number) {}

  // Add another vector component-wise and return the result.
  add(v: Vector3): Vector3 {
    return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  // Subtract another vector component-wise and return the result.
  sub(v: Vector3): Vector3 {
    return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  // Multiply all components by a scalar value.
  mul(t: number): Vector3 {
    return new Vector3(this.x * t, this.y * t, this.z * t);
  }

  // Compute the dot product to measure directional alignment.
  dot(v: Vector3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  // compute the cross product to find a vector perpendicular to both inputs.
  cross(v: Vector3): Vector3 {
    return new Vector3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }

  // Measure the vector length using the dot product with itself.
  length(): number {
    return Math.sqrt(this.dot(this));
  }

  // Convert the vector to unit length without changing its direction.
  normalize(): Vector3 {
    return this.mul(1 / this.length());
  }

  // Reflect the vector around a surface normal.
  reflect(n: Vector3): Vector3 {
    return this.sub(n.mul(2 * this.dot(n)));
  }

  // Refract the vector through a surface, or return null if refraction is impossible.
  refract(n: Vector3, eta: number): Vector3 | null {
    const cosi = -Math.max(-1, Math.min(1, this.dot(n)));
    const sint2 = eta * eta * (1 - cosi * cosi);
    if (sint2 > 1) return null;

    const cost = Math.sqrt(1 - sint2);
    return this.mul(eta).add(n.mul(eta * cosi - cost));
  }
}
