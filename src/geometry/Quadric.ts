import { Vector3 } from "../core/Vector3";
import { Ray } from "../core/Ray";
import { Material } from "../core/Material";
import { HitRecord } from "../core/HitRecord";
import { TPHVHitRecord } from "../core/TPHVHitRecord";
import { eps } from "../core/Constants";

// A general quadric surface defined by a quadratic equation in three variables. 
// The surface is defined by the coefficients of the equation, a center point, and a material. 
// The equation is of the form:
//    A x^2 + B y^2 + C z^2 + D x y + E x z + F y z + G x + H y + I z + J = 0
// where A, B, C, D, E, F, G, H, I, J are the coefficients that define the shape of the surface. 
// The material defines how the surface interacts with light. 
export class Quadric {

  constructor(
    public center: Vector3,

    // quadratic coefficients
    public A: number,
    public B: number,
    public C: number,
    public D: number,
    public E: number,
    public F: number,

    // linear coefficients
    public G: number,
    public H: number,
    public I: number,

    // constant
    public J: number,

    public material: Material
  ) {}

  private evaluate(p: Vector3): number {
    const x = p.x - this.center.x;
    const y = p.y - this.center.y;
    const z = p.z - this.center.z;

    return (
      this.A*x*x +
      this.B*y*y +
      this.C*z*z +
      this.D*x*y +
      this.E*x*z +
      this.F*y*z +
      this.G*x +
      this.H*y +
      this.I*z +
      this.J
    );
  }

  private gradient(p: Vector3): Vector3 {
    const x = p.x - this.center.x;
    const y = p.y - this.center.y;
    const z = p.z - this.center.z;

    return new Vector3(
      2*this.A*x + this.D*y + this.E*z + this.G,
      2*this.B*y + this.D*x + this.F*z + this.H,
      2*this.C*z + this.E*x + this.F*y + this.I
    );
  }

  hit(ray: Ray): HitRecord | null {

    const ox = ray.origin.x - this.center.x;
    const oy = ray.origin.y - this.center.y;
    const oz = ray.origin.z - this.center.z;

    const dx = ray.direction.x;
    const dy = ray.direction.y;
    const dz = ray.direction.z;

    const a =
      this.A*dx*dx +
      this.B*dy*dy +
      this.C*dz*dz +
      this.D*dx*dy +
      this.E*dx*dz +
      this.F*dy*dz;

    const b =
      2*this.A*ox*dx +
      2*this.B*oy*dy +
      2*this.C*oz*dz +
      this.D*(ox*dy + oy*dx) +
      this.E*(ox*dz + oz*dx) +
      this.F*(oy*dz + oz*dy) +
      this.G*dx +
      this.H*dy +
      this.I*dz;

    const c =
      this.evaluate(ray.origin);

    const disc = b*b - 4*a*c;

    if (disc < 0) return null;

    const sqrtDisc = Math.sqrt(disc);

    const t1 = (-b - sqrtDisc)/(2*a);
    const t2 = (-b + sqrtDisc)/(2*a);

    let t = Number.POSITIVE_INFINITY;

    if (t1 > eps) t = t1;
    if (t2 > eps && t2 < t) t = t2;

    if (!isFinite(t)) return null;

    const p = ray.at(t);

    let normal = this.gradient(p).normalize();

    if (normal.dot(ray.direction) > 0) {
      normal = normal.mul(-1);
    }

    return {
      t,
      p,
      normal,
      material: this.material
    };
  }

  tphvHit(ray: Ray): TPHVHitRecord | null {

    const hit = this.hit(ray);

    if (!hit) return null;

    const rel = hit.p.sub(this.center);

    //
    // Example parameterisation:
    // spherical parameters.
    // Works naturally for ellipsoids and spheres.
    //

    const r = rel.length();

    if (r < eps) {
      return null;
    }

    const h = Math.atan2(rel.y, rel.x) / Math.PI;
    const v = 2*Math.asin(rel.z / r) / Math.PI;

    return {
      t: hit.t,
      p: hit.p,
      h,
      v
    };
  }
}
