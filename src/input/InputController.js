import { Vector3 } from "../core/Vector3.js";

export class InputController {

    constructor({
        canvas,
        camera,
        requestRender,
        requestViewportUiUpdate,
        rebuildGui,
        rotateVector
    }) {

        this.canvas = canvas;
        this.camera = camera;

        this.requestRender =
            requestRender;

        this.requestViewportUiUpdate =
            requestViewportUiUpdate;

        this.rebuildGui =
            rebuildGui;

        this.rotateVector =
            rotateVector;

        this.activePointers =
            new Map();

        this.dragStartCentre = null;
        this.dragStartPointerPos = null;
        this.dragCandidate = false;
        this.dragThreshold = 4; 
        this.pointerDownPos = null;

        this.arcballStart = null;

        this.isPanning = false;

        this.pinchStartDistance = 0;
        this.pinchStartWidth = 0;

        this.pinchStartCentre = null;
        this.pinchMidpointStart = null;

        this.install();
    }

    install() {

        this.canvas.style.touchAction =
            "none";

        this.canvas.addEventListener(
            "pointerdown",
            e => this.pointerDown(e)
        );

        this.canvas.addEventListener(
            "pointermove",
            e => this.pointerMove(e)
        );

        this.canvas.addEventListener(
            "pointerup",
            e => this.endPointer(e)
        );

        this.canvas.addEventListener(
            "pointercancel",
            e => this.endPointer(e)
        );

        this.canvas.addEventListener(
            "pointerleave",
            e => this.endPointer(e)
        );

        this.canvas.addEventListener(
            "wheel",
            e => this.wheel(e),
            { passive: false }
        );

        this.canvas.addEventListener(
            "contextmenu",
            () => {

                this.dragCandidate =
                    false;
            }
        );
    }

    getCanvasPos(e) {

        const rect =
            this.canvas.getBoundingClientRect();

        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    pointerDistance(a, b) {

        const dx = a.x - b.x;
        const dy = a.y - b.y;

        return Math.sqrt(
            dx * dx +
            dy * dy
        );
    }

    pointerMidpoint(a, b) {

        return {

            x:
                0.5 *
                (a.x + b.x),

            y:
                0.5 *
                (a.y + b.y)
        };
    }

    projectToArcball(x, y) {

        const nx =
            2 * x /
            this.canvas.width - 1;

        const ny =
            1 -
            2 * y /
            this.canvas.height;

        const r2 =
            nx * nx +
            ny * ny;

        if (r2 <= 1) {

            return new Vector3(
                nx,
                ny,
                Math.sqrt(1 - r2)
            );
        }

        const r =
            Math.sqrt(r2);

        return new Vector3(
            nx / r,
            ny / r,
            0
        );
    }

    pointerDown(e) {

        if (
            e.pointerType === "mouse" &&
            e.button !== 0
        ) {
            return;
        }

        if (e.ctrlKey) {
            return;
        }

        this.canvas.setPointerCapture(
            e.pointerId
        );

        const pos =
            this.getCanvasPos(e);

        this.dragCandidate = true;
        this.pointerDownPos = pos;

        this.activePointers.set(
            e.pointerId,
            pos
        );

        if (
            this.activePointers.size === 1
        ) {

            this.dragStartPointerPos =
                pos;

            this.dragStartCentre =
                new Vector3(
                    this.camera.centre.x,
                    this.camera.centre.y,
                    this.camera.centre.z
                );

            this.isPanning =
                e.shiftKey;

            if (!this.isPanning) {

                this.arcballStart =
                    this.projectToArcball(
                        pos.x,
                        pos.y
                    );
            }
        }

        else if (
            this.activePointers.size === 2
        ) {

            const pts =
                [...this.activePointers.values()];

            this.pinchStartDistance =
                this.pointerDistance(
                    pts[0],
                    pts[1]
                );

            this.pinchStartWidth =
                this.camera.width;

            this.pinchStartCentre =
                new Vector3(
                    this.camera.centre.x,
                    this.camera.centre.y,
                    this.camera.centre.z
                );

            this.pinchMidpointStart =
                this.pointerMidpoint(
                    pts[0],
                    pts[1]
                );
        }
    }

    pointerMove(e) {

        if (
            !this.activePointers.has(
                e.pointerId
            )
        ) {
            return;
        }

        const pos =
            this.getCanvasPos(e);

        const dx =
            pos.x -
            this.pointerDownPos.x;

        const dy =
            pos.y -
            this.pointerDownPos.y;

        if (this.dragCandidate) {

            const threshold =
                this.dragThreshold;

            if (
                dx * dx +
                dy * dy <
                threshold * threshold
            ) {
                return;
            }

            this.dragCandidate =
                false;
        }

        this.activePointers.set(
            e.pointerId,
            pos
        );

        if (
            this.activePointers.size === 1
        ) {

            if (this.isPanning) {

                const dx =
                    pos.x -
                    this.dragStartPointerPos.x;

                const dy =
                    pos.y -
                    this.dragStartPointerPos.y;

                const worldPerPixel =
                    this.camera.width /
                    this.canvas.width;

                this.camera.centre =
                    this.dragStartCentre
                        .sub(
                            this.camera.u.mul(
                                dx *
                                worldPerPixel
                            )
                        )
                        .add(
                            this.camera.v.mul(
                                dy *
                                worldPerPixel
                            )
                        );

                this.requestViewportUiUpdate();
                this.requestRender();
            }

            else {

                const current =
                    this.projectToArcball(
                        pos.x,
                        pos.y
                    );

                const axis =
                    this.arcballStart.cross(
                        current
                    );

                const len =
                    Math.sqrt(
                        axis.dot(axis)
                    );

                if (len > 1e-6) {

                    const normalisedAxis =
                        axis.mul(
                            1 / len
                        );

                    const angle =
                        Math.acos(
                            Math.max(
                                -1,
                                Math.min(
                                    1,
                                    this.arcballStart.dot(
                                        current
                                    )
                                )
                            )
                        );

                    this.camera.rotate(
                        this.rotateVector,
                        normalisedAxis,
                        angle
                    );

                    this.arcballStart =
                        current;

                    this.requestViewportUiUpdate();
                    this.requestRender();
                }
            }
        }

        else if (
            this.activePointers.size === 2
        ) {

            const pts =
                [...this.activePointers.values()];

            const distance =
                this.pointerDistance(
                    pts[0],
                    pts[1]
                );

            let width =
                this.pinchStartWidth *
                this.pinchStartDistance /
                distance;

            width =
                Math.max(
                    0.05,
                    Math.min(
                        20,
                        width
                    )
                );

            this.camera.width =
                width;

            this.requestViewportUiUpdate();
            this.requestRender();
        }
    }

    endPointer(e) {

        const wasPinching =
            this.activePointers.size === 2;

        this.activePointers.delete(
            e.pointerId
        );

        if (wasPinching) {
            this.rebuildGui();
        }

        if (
            this.activePointers.size === 0
        ) {

            this.dragStartPointerPos =
                null;

            this.dragStartCentre =
                null;

            this.isPanning =
                false;
        }

        this.dragCandidate =
            false;

        this.pointerDownPos =
            null;

    }

    wheel(e) {

        e.preventDefault();

        const factor =
            e.deltaY > 0
                ? 1.1
                : 1 / 1.1;

        this.camera.zoom(
            factor
        );

        this.camera.width =
            Math.max(
                0.01,
                Math.min(
                    10,
                    this.camera.width
                )
            );

        this.requestViewportUiUpdate();
        this.requestRender();
    }
}