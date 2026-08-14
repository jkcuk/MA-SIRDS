// ---------------------------------------------
// Basic 3D vector
// ---------------------------------------------
export class Vec3 {
    constructor(
        public x: number,
        public y: number,
        public z: number
    ) {}

    add(v: Vec3): Vec3 {
        return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    sub(v: Vec3): Vec3 {
        return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    scale(s: number): Vec3 {
        return new Vec3(this.x * s, this.y * s, this.z * s);
    }

    dot(v: Vec3): number {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    cross(v: Vec3): Vec3 {
        return new Vec3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }

    norm(): number {
        return Math.sqrt(this.dot(this));
    }

    normalize(): Vec3 {
        const n = this.norm();
        if (n === 0) {
            throw new Error("Cannot normalize zero vector");
        }
        return this.scale(1 / n);
    }
}

// ---------------------------------------------
// Ray
// ---------------------------------------------
export interface Ray {
    origin: Vec3;
    direction: Vec3; // need not be normalized
}

// ---------------------------------------------
// Rectangle
// ---------------------------------------------
export class Rectangle3D {
    readonly normal: Vec3;

    /**
     * center   : rectangle center
     * uAxis    : horizontal unit vector in plane
     * vAxis    : vertical unit vector in plane
     * width    : physical width
     * height   : physical height
     * hPixels  : horizontal pixel extent
     * vPixels  : vertical pixel extent
     */
    constructor(
        public center: Vec3,
        public uAxis: Vec3,
        public vAxis: Vec3,
        public width: number,
        public height: number,
        public hPixels: number,
        public vPixels: number
    ) {
        this.uAxis = uAxis.normalize();
        this.vAxis = vAxis.normalize();

        // Verify orthogonality
        const d = Math.abs(this.uAxis.dot(this.vAxis));
        if (d > 1e-8) {
            throw new Error("uAxis and vAxis must be orthogonal");
        }

        this.normal = this.uAxis.cross(this.vAxis).normalize();
    }

    /**
     * Returns the forward intersection point of a ray
     * with the rectangle, or null if no hit.
     */
    intersectRay(ray: Ray): Vec3 | null {
        const denom = this.normal.dot(ray.direction);

        // Parallel to plane
        if (Math.abs(denom) < 1e-12) {
            return null;
        }

        const t =
            this.normal.dot(this.center.sub(ray.origin)) / denom;

        // Only forward intersections
        if (t <= 0) {
            return null;
        }

        const hit = ray.origin.add(ray.direction.scale(t));

        const rel = hit.sub(this.center);

        const u = rel.dot(this.uAxis);
        const v = rel.dot(this.vAxis);

        const halfW = this.width / 2;
        const halfH = this.height / 2;

        if (
            u < -halfW ||
            u > halfW ||
            v < -halfH ||
            v > halfH
        ) {
            return null;
        }

        return hit;
    }

    /**
     * Convert a point on the rectangle into
     * pixel coordinates (u,v).
     *
     * Returns:
     *   u in [0,hPixels]
     *   v in [0,vPixels]
     */
    worldToPixel(point: Vec3): { u: number; v: number } {
        const rel = point.sub(this.center);

        const localU = rel.dot(this.uAxis);
        const localV = rel.dot(this.vAxis);

        const u =
            ((localU + this.width / 2) / this.width) *
            this.hPixels;

        const v =
            ((localV + this.height / 2) / this.height) *
            this.vPixels;

        return { u, v };
    }

    /**
     * Convert pixel coordinates back into
     * a 3D point on the rectangle.
     *
     * u ∈ [0,hPixels]
     * v ∈ [0,vPixels]
     */
    pixelToWorld(u: number, v: number): Vec3 {
        const localU =
            (u / this.hPixels) * this.width -
            this.width / 2;

        const localV =
            (v / this.vPixels) * this.height -
            this.height / 2;

        return this.center
            .add(this.uAxis.scale(localU))
            .add(this.vAxis.scale(localV));
    }
}