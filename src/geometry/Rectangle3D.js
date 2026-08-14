// ---------------------------------------------
// Basic 3D vector
// ---------------------------------------------
export class Vec3 {
    x;
    y;
    z;
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    add(v) {
        return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
    }
    sub(v) {
        return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
    }
    scale(s) {
        return new Vec3(this.x * s, this.y * s, this.z * s);
    }
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }
    cross(v) {
        return new Vec3(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x);
    }
    norm() {
        return Math.sqrt(this.dot(this));
    }
    normalize() {
        const n = this.norm();
        if (n === 0) {
            throw new Error("Cannot normalize zero vector");
        }
        return this.scale(1 / n);
    }
}
// ---------------------------------------------
// Rectangle
// ---------------------------------------------
export class Rectangle3D {
    center;
    uAxis;
    vAxis;
    width;
    height;
    hPixels;
    vPixels;
    normal;
    /**
     * center   : rectangle center
     * uAxis    : horizontal unit vector in plane
     * vAxis    : vertical unit vector in plane
     * width    : physical width
     * height   : physical height
     * hPixels  : horizontal pixel extent
     * vPixels  : vertical pixel extent
     */
    constructor(center, uAxis, vAxis, width, height, hPixels, vPixels) {
        this.center = center;
        this.uAxis = uAxis;
        this.vAxis = vAxis;
        this.width = width;
        this.height = height;
        this.hPixels = hPixels;
        this.vPixels = vPixels;
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
    intersectRay(ray) {
        const denom = this.normal.dot(ray.direction);
        // Parallel to plane
        if (Math.abs(denom) < 1e-12) {
            return null;
        }
        const t = this.normal.dot(this.center.sub(ray.origin)) / denom;
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
        if (u < -halfW ||
            u > halfW ||
            v < -halfH ||
            v > halfH) {
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
    worldToPixel(point) {
        const rel = point.sub(this.center);
        const localU = rel.dot(this.uAxis);
        const localV = rel.dot(this.vAxis);
        const u = ((localU + this.width / 2) / this.width) *
            this.hPixels;
        const v = ((localV + this.height / 2) / this.height) *
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
    pixelToWorld(u, v) {
        const localU = (u / this.hPixels) * this.width -
            this.width / 2;
        const localV = (v / this.vPixels) * this.height -
            this.height / 2;
        return this.center
            .add(this.uAxis.scale(localU))
            .add(this.vAxis.scale(localV));
    }
}
