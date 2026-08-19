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

    // control orientation

    rotate(rotateVector, axis, angle) {
        this.setUVN(
            rotateVector(
                this.u,
                axis,
                angle
            ),
            rotateVector(
                this.v,
                axis,
                angle
            ),
            rotateVector(
                this.n,
                axis,
                angle
            )
        );
    }

    getEulerAngles() {

        //
        // Rotation matrix:
        //
        // [ ux vx wx ]
        // [ uy vy wy ]
        // [ uz vz wz ]
        //

        const ux = this.u.x;
        const uy = this.u.y;
        const uz = this.u.z;

        const vx = this.v.x;
        const vy = this.v.y;
        const vz = this.v.z;

        const wx = this.n.x;
        const wy = this.n.y;
        const wz = this.n.z;

        let yaw;
        let pitch;
        let roll;

        pitch =
            Math.asin(
                Math.max(
                    -1,
                    Math.min(
                        1,
                        -wy
                    )
                )
            );

        const cp =
            Math.cos(pitch);

        if (
            Math.abs(cp) > 1e-6
        ) {

            yaw =
                Math.atan2(
                    wx,
                    wz
                );

            roll =
                Math.atan2(
                    uy,
                    vy
                );

        } else {

            //
            // Gimbal lock
            //

            yaw =
                Math.atan2(
                    -uz,
                    ux
                );

            roll =
                0;
        }

        return {
            yaw: Math.round( yaw * 180 / Math.PI ),
            pitch: Math.round( pitch * 180 / Math.PI ),
            roll: Math.round( roll * 180 / Math.PI )
        };
    }

    setEulerAngles(
        yawDeg,
        pitchDeg,
        rollDeg
    ) {

        const yaw =
            yawDeg *
            Math.PI /
            180;

        const pitch =
            pitchDeg *
            Math.PI /
            180;

        const roll =
            rollDeg *
            Math.PI /
            180;

        const cy =
            Math.cos(yaw);

        const sy =
            Math.sin(yaw);

        const cp =
            Math.cos(pitch);

        const sp =
            Math.sin(pitch);

        const cr =
            Math.cos(roll);

        const sr =
            Math.sin(roll);

        //
        // Yaw-Pitch-Roll
        // R = Ry * Rx * Rz
        //

        const m00 =
            cy * cr +
            sy * sp * sr;

        const m01 =
            -cy * sr +
            sy * sp * cr;

        const m02 =
            sy * cp;

        const m10 =
            cp * sr;

        const m11 =
            cp * cr;

        const m12 =
            -sp;

        const m20 =
            -sy * cr +
            cy * sp * sr;

        const m21 =
            sy * sr +
            cy * sp * cr;

        const m22 =
            cy * cp;

        this.setUVN(
            new Vector3(
                m00,
                m10,
                m20
            ),
            new Vector3(
                m01,
                m11,
                m21
            ),
            new Vector3(
                m02,
                m12,
                m22
            )
        );
    }

    setUVN(u, v, n) {
        // re-orthonormalise
        this.u =
            u.normalize();

        this.v =
            v
                .sub(
                    this.u.mul(
                        this.u.dot(v)
                    )
                )
                .normalize();

        this.n =
            this.u.cross(this.v);
    }
}