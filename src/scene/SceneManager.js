import { Vector3 } from "../core/Vector3.js";

export class SceneManager {

    constructor({
        scenes
    }) {

        this.scenes = scenes;

        this.currentSceneIndex = 0;

        this.selectedObjectId = null;

        this.selectedObjectId =
            this.getCurrentScene()
                .objects[0]?.id ?? null;
    }

    getCurrentScene() {

        return this.scenes[
            this.currentSceneIndex
        ];
    }

    getSelectedObject() {

        return this
            .getCurrentScene()
            .objects
            .find(
                o =>
                o.id ===
                this.selectedObjectId
            );
    }

    selectObject(id) {

        this.selectedObjectId =
            id;
    }

    selectScene(index) {

        this.currentSceneIndex =
            index;

        this.selectedObjectId =
            this.getCurrentScene()
                .objects[0]?.id ?? null;
    }

    moveObjectUp(id) {

        const objects =
            this.getCurrentScene()
                .objects;

        const idx =
            objects.findIndex(
                o => o.id === id
            );

        if (idx <= 0)
            return;

        [
            objects[idx - 1],
            objects[idx]
        ] =
        [
            objects[idx],
            objects[idx - 1]
        ];

        this.selectedObjectId =
            id;
    }

    moveObjectDown(id) {

        const objects =
            this.getCurrentScene()
                .objects;

        const idx =
            objects.findIndex(
                o => o.id === id
            );

        if (
            idx < 0 ||
            idx >= objects.length - 1
        ) {
            return;
        }

        [
            objects[idx],
            objects[idx + 1]
        ] =
        [
            objects[idx + 1],
            objects[idx]
        ];

        this.selectedObjectId =
            id;
    }

    addObject(object) {

        this.getCurrentScene()
            .objects
            .push(object);

        this.selectedObjectId =
            object.id;
    }

    removeObject(id) {

        const objects =
            this.getCurrentScene()
                .objects;

        const index =
            objects.findIndex(
                o => o.id === id
            );

        if (index < 0)
            return;

        objects.splice(
            index,
            1
        );

        if (
            this.selectedObjectId
            === id
        ) {

            this.selectedObjectId =
                objects[0]?.id ?? null;
        }
    }

    duplicateObject(id, newId) {
        const original =
            this.getCurrentScene()
                .objects
                .find(
                    o => o.id === id
                );

        if (!original)
            return null;

        const copy = {

            ...original,

            id: newId,

            name:
                original.name +
                " copy",

            position:
                original.position
                    ? new Vector3(
                        original.position.x,
                        original.position.y,
                        original.position.z
                    )
                    : undefined,

            axis:
                original.axis
                    ? new Vector3(
                        original.axis.x,
                        original.axis.y,
                        original.axis.z
                    )
                    : undefined,

            normal:
                original.normal
                    ? new Vector3(
                        original.normal.x,
                        original.normal.y,
                        original.normal.z
                    )
                    : undefined,

            hAxis:
                original.hAxis
                    ? new Vector3(
                        original.hAxis.x,
                        original.hAxis.y,
                        original.hAxis.z
                    )
                    : undefined,

            vAxis:
                original.vAxis
                    ? new Vector3(
                        original.vAxis.x,
                        original.vAxis.y,
                        original.vAxis.z
                    )
                    : undefined
        };

        this.getCurrentScene()
            .objects
            .push(copy);

        this.selectedObjectId =
            copy.id;

        return copy;
    }
}