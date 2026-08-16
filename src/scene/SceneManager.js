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
}