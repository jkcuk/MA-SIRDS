export class Ray {
    origin;
    direction;
    // Store the ray's origin and direction.
    constructor(origin, direction) {
        this.origin = origin;
        this.direction = direction;
    }
    // Compute the point reached after moving t units along the ray.
    at(t) {
        return this.origin.add(this.direction.mul(t));
    }
}
