import { Vector3 } from "../core/Vector3.js";

export class Camera {

    constructor(width = 0.16) {
        this.centre = new Vector3(0, 0, 0);
        this.width = width;
        this.u = new Vector3(1, 0, 0);
        this.v = new Vector3(0, 1, 0);
        this.n = new Vector3(0, 0, 1);
    }

    reset(width = this.width) {
        this.centre = new Vector3(0, 0, 0);
        this.width = width;
        this.u = new Vector3(1, 0, 0);
        this.v = new Vector3(0, 1, 0);
        this.n = new Vector3(0, 0, 1);
    }

    setCentre(x, y, z) {
        this.centre = new Vector3(x, y, z);
    }

    translate(offset) {
        this.centre = this.centre.add(offset);
    }

    setWidth(width) {
        this.width = width;
    }

    zoom(factor) {
        this.width *= factor;
    }

    rotate(rotateVector, axis, angle) {
        this.u =
            rotateVector(
                this.u,
                axis,
                angle
            );

        this.v =
            rotateVector(
                this.v,
                axis,
                angle
            );

        this.n =
            rotateVector(
                this.n,
                axis,
                angle
            );
    }
}