import { SceneManager } from "./scene/SceneManager.js";
import { buildScene } from "./scene/SceneBuilder.js";
import { Vector3 } from "./core/Vector3.js"
import { RendererManager } from "./renderer/RendererManager.js";
import { Camera } from "./camera/Camera.js";
import { InputController } from "./input/InputController.js";
import { createCameraPanel } from "./ui/CameraPanel.js";
import { createViewportPanel } from "./ui/ViewportPanel.js";
import { createScenePanel } from "./ui/ScenePanel.js";
import { createObjectPanel } from "./ui/ObjectPanel.js";
import { createGuiWindow } from "./ui/GuiWindow.js";
import { createSlider, createButton, createSmallButton, createSelect, createSwitch, createSection } from "./ui/elements.js"
const canvas = document.getElementById("canvas");
canvas.style.touchAction = "none";

function rotateVector(v, axis, angle) {

    const c = Math.cos(angle);
    const s = Math.sin(angle);

    return v.mul(c)
        .add(axis.cross(v).mul(s))
        .add(axis.mul(axis.dot(v) * (1 - c)));
}

let ctx = canvas.getContext("2d");

let nextStereoId = 1;
const nextStereoIdRef = {
    get value() {
        return nextStereoId;
    },
    set value(v) {

        nextStereoId = v;
    }
};
const meanIPD = 0.063; // mean interpupillar distance
const angle1Deg = 45; // °
const controls = {
    screenDistance: 0.5,
    screenWidth: 0.16, // 16cm wide screen
    renderer: "standard",
    stereoPairs: [
        {
            id: nextStereoId++,
            name: "Interocular axis @0°",
            eyeSeparation: meanIPD,
            angle: 0 // horizontal
        },
        {
            id: nextStereoId++,
            name: "Interocular axis @" + angle1Deg + "°",
            eyeSeparation: meanIPD,
            angle: angle1Deg * Math.PI / 180 // angle w.r.t. horizontal
        }
    ],
    selectedStereoPairId: 1,
    useAllStereoPairs: false,
    rdasBlobSigma: 1.5, // in pixel units
    rdasMaxBlobs: 1000000,
    rdasMaxClans: 500,
    rdasMaxRecursionDepth: 200,
    rdasFadeFactor: 0.95,
    rdasMinBrightness: 0.2,
    rdasAlreadyThereThreshold: 50
};
let guiCollapsed = false;
const camera =
    new Camera(
        controls.screenWidth
    );
const rendererManager = new RendererManager();
function getSelectedStereo() {
    return controls.stereoPairs.find(p => p.id === controls.selectedStereoPairId);
}
let nextObjectId = 1;
const nextObjectIdRef = {
    get value() {
        return nextObjectId;
    },
    set value(v) {
        nextObjectId = v;
    }
};

let nextSceneId = 1;
const nextSceneIdRef = {
    get value() {
        return nextSceneId;
    },
    set value(v) {
        nextSceneId = v;
    }
};

const scenes = [
    {
        id: nextSceneId++,
        name: "Scene 1",
        objects: [
            // {
            //     id: nextObjectId++,
            //     kind: "sphere",
            //     name: "Sphere",
            //     open: true,
            //     position: new Vector3(0, 0, -0.1),
            //     radius: 0.01,
            //     color: "#d9d9d9",
            //     material: "phong"
            // },
            {
                id: nextObjectId++,
                kind: "cylinder",
                name: "Cylinder 1 @" + angle1Deg + "°",
                open: true,
                position: new Vector3(-0.04, 0, -0.1),
                axis: new Vector3(Math.cos(angle1Deg * Math.PI / 180), Math.sin(angle1Deg * Math.PI / 180), 0),
                radius: 0.01,
                length: 1,
                color: "#ff0000",
                material: "phong"
            },
            {
                id: nextObjectId++,
                kind: "cylinder",
                name: "Cylinder 2 @" + angle1Deg + "°",
                open: true,
                position: new Vector3(0.04, 0, -0.1),
                axis: new Vector3(Math.cos(angle1Deg * Math.PI / 180), Math.sin(angle1Deg * Math.PI / 180), 0),
                radius: 0.03,
                length: 1,
                color: "#4dff00",
                material: "phong"
            },
            {
                id: nextObjectId++,
                kind: "plane",
                name: "Invisible plane",
                open: true,
                position: new Vector3(0, 0, -0.12),
                normal: new Vector3(0, 0, 1),
                color: "#d9d9d9",
                material: "dielectric",
                ior: 1
            },
        ]
    },
    {
        id: nextSceneId++,
        name: "Scene 2",
        objects: [
            // {
            //     id: nextObjectId++,
            //     kind: "cylinder",
            //     name: "Cylinder 1",
            //     open: true,
            //     position: new Vector3(0, 0.03, -0.1),
            //     axis: new Vector3(1, 0, 0),
            //     radius: 0.01,
            //     length: 1,
            //     color: "#d9d9d9",
            //     material: "phong"
            // },
            {
                id: nextObjectId++,
                kind: "cylinder",
                name: "Cylinder",   // "Cylinder 2",
                open: true,
                position: new Vector3(0, 0, -0.1),   // new Vector3(0, 0, -0.09),
                axis: new Vector3(1, 0, 0),
                radius: 0.02,
                length: 1,
                color: "#d9d9d9",
                material: "phong"
            },
            // {
            //     id: nextObjectId++,
            //     kind: "cylinder",
            //     name: "Cylinder 3",
            //     open: true,
            //     position: new Vector3(0, -0.03, -0.08),
            //     axis: new Vector3(1, 0, 0),
            //     radius: 0.01,
            //     length: 1,
            //     color: "#d9d9d9",
            //     material: "phong"
            // },
            {
                id: nextObjectId++,
                kind: "plane",
                name: "Invisible plane",
                open: true,
                position: new Vector3(0, 0, -0.12),
                normal: new Vector3(0, 0, 1),
                color: "#d9d9d9",
                material: "dielectric",
                ior: 1
            },
        ]
    }
];
const sceneManager = new SceneManager({scenes});

function renderScene() {

    rendererManager.render({
        camera,
        controls,
        canvas,
        ctx,
        scene:
            buildScene(
                sceneManager
                    .getCurrentScene()
            ),
        allScenes:
            controls
                .useAllStereoPairs
                ? scenes.map(
                    scene =>
                    buildScene(scene)
                )
                : [
                    buildScene(
                        sceneManager
                            .getCurrentScene()
                    )
                ],
        getSelectedStereo,
        meanIPD
    });
}

let renderPending = false;

function requestRender() {

    if (renderPending)
        return;

    renderPending = true;

    requestAnimationFrame(() => {

        renderPending = false;

        renderScene();
    });
}

function createColorPicker(parent, label, value, onChange) {
    const wrapper = document.createElement("label");
    wrapper.style.display = "flex";
    wrapper.style.gap = "0.35rem";
    wrapper.style.alignItems = "center";
    wrapper.style.font = "12px/1.3 sans-serif";
    wrapper.style.color = "#e8eef7";
    const title = document.createElement("span");
    title.textContent = label;
    title.style.minWidth = "80px";
    const input = document.createElement("input");
    input.type = "color";
    input.value = value;
    input.style.flex = "1";
    input.addEventListener("change", () => {
        onChange(input.value);
        renderScene();
    });
    wrapper.append(title, input);
    parent.appendChild(wrapper);
}
function createTextInput(parent, label, value, onChange) {
    const wrapper = document.createElement("label");
    wrapper.style.display = "grid";
    wrapper.style.gap = "0.35rem";
    wrapper.style.font = "12px/1.3 sans-serif";
    wrapper.style.color = "#e8eef7";
    const title = document.createElement("span");
    title.textContent = label;
    const input = document.createElement("input");
    input.type = "text";
    input.value = value;
    input.addEventListener("change", () => {
        onChange(input.value);
        rebuildGui();
    });
    wrapper.append(title, input);
    parent.appendChild(wrapper);
}
function cloneScene(source) {
    return {
        id: nextSceneId++,
        name: source.name + " Copy",
        objects: source.objects.map(obj => ({
            ...obj,
            id: nextObjectId++, // new object IDs
            position: new Vector3(obj.position.x, obj.position.y, obj.position.z),
            axis: obj.axis
                ? new Vector3(obj.axis.x, obj.axis.y, obj.axis.z)
                : undefined,
            normal: obj.normal
                ? new Vector3(obj.normal.x, obj.normal.y, obj.normal.z)
                : undefined,
            hAxis: obj.hAxis
                ? new Vector3(obj.hAxis.x, obj.hAxis.y, obj.hAxis.z)
                : undefined,
            vAxis: obj.vAxis
                ? new Vector3(obj.vAxis.x, obj.vAxis.y, obj.vAxis.z)
                : undefined,
        }))
    };
}
function duplicateCurrentScene() {
    const current = sceneManager.getCurrentScene();
    const copy = cloneScene(current);
    scenes.push(copy);
    sceneManager.selectScene(scenes.length - 1);
    renderScene();
    rebuildGui();
}
function deleteCurrentScene() {
    //    if (!confirm("Delete scene \"" + sceneManager.getCurrentScene().name + "\"?")) return;    
    if (scenes.length <= 1) {
        // keep at least one scene
        alert("Scene \"" + sceneManager.getCurrentScene().name + "\" is the only scene.  Can't delete it.");
        return;
    }
    scenes.splice(sceneManager.currentSceneIndex, 1);
    sceneManager.selectScene(Math.max(0,sceneManager.currentSceneIndex - 1));
    renderScene();
    rebuildGui();
}
function createObjectDefaults(kind) {
    const defaults = {
        cone: {
            id: nextObjectId++,
            kind: "cone",
            name: "Cone",
            open: true,
            position: new Vector3(0, 0, -0.1),
            axis: new Vector3(0, 1, 0),
            angle: 30 * Math.PI / 180,
            coneHeight: 0.1,
            material: "phong",
            color: "#2600ff"
        },
        cylinder: {
            id: nextObjectId++,
            kind: "cylinder",
            name: "Cylinder",
            open: true,
            position: new Vector3(0, 0, -0.1),
            axis: new Vector3(1, 1, 0),
            radius: 0.01,
            length: 0.1,
            material: "phong",
            ior: 1.5
        },
        parallelogram: {
            id: nextObjectId++,
            kind: "parallelogram",
            name: "Parallelogram",
            open: true,
            position: new Vector3(0, 0, -0.1),
            hAxis: new Vector3(0.05, 0, 0),
            vAxis: new Vector3(0, 0.05, 0),
            material: "phong",
            color: "#d9d9d9",
            ior: 1.5
        },
        plane: {
            id: nextObjectId++,
            kind: "plane",
            name: "Plane",
            open: true,
            position: new Vector3(0, 0, -0.1),
            normal: new Vector3(0, 0, 1),
            material: "phong",
            ior: 1.5
        },
        sphere: {
            id: nextObjectId++,
            kind: "sphere",
            name: "Sphere",
            open: true,
            position: new Vector3(0, 0, -0.1),
            radius: 0.01,
            color: "#d9d9d9",
            material: "phong",
            ior: 1.5
        },
        text: {
            id: nextObjectId++,
            kind: "text",
            name: "Text",
            open: true,
            position: new Vector3(0, 0, -0.1),
            hAxis: new Vector3(0.05, 0, 0),
            vAxis: new Vector3(0, 0.05, 0),
            rectWidth: 0.1,
            rectHeight: 0.05,
            text: "Hello",
            font: "bold 64px sans-serif",
            material: "phong",
            color: "#ffffff"
        }
    };
    // console.log("Creating object of kind:", kind, "with defaults:", defaults[kind]);
    // console.log("Defaults for kind:", kind, "are:", structuredClone(defaults[kind]));
    // return structuredClone(defaults[kind]);
    const def = defaults[kind];
    return {
        ...def,
        position: new Vector3(def.position.x, def.position.y, def.position.z),
        axis: def.axis
            ? new Vector3(def.axis.x, def.axis.y, def.axis.z)
            : undefined,
        normal: def.normal
            ? new Vector3(def.normal.x, def.normal.y, def.normal.z)
            : undefined
    };
}
function addSceneObject(kind) {

    const object = createObjectDefaults(kind);

    sceneManager.addObject( object );

    renderScene();
    rebuildGui();
}
function removeSceneObject(id) {

    sceneManager.removeObject( id );

    renderScene();
    rebuildGui();
}
function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx = canvas.getContext("2d");

    renderScene();
}

async function toggleFullscreen() {

    if (!document.fullscreenElement) {

        await document.documentElement.requestFullscreen();

    } else {

        await document.exitFullscreen();
    }

    resizeCanvas();
}


window.addEventListener(
    "resize",
    resizeCanvas
);

document.addEventListener(
    "fullscreenchange",
    resizeCanvas
);

resizeCanvas();

// function rebuildGui() {
//     const existing = document.getElementById("scene-gui");
//     if (existing) {
//         existing.remove();
//     }
//     createGui();
// }
function rebuildGui() {
    const existing =
        document.getElementById("scene-gui");

    const existingContent =
        existing?.querySelector(".gui-content");

    const scrollTop =
        existingContent?.scrollTop ?? 0;

    const panelTop =
        existing?.style.top;

    const panelLeft =
        existing?.style.left;

    if (existing) {
        existing.remove();
    }

    createGui();

    const newPanel =
        document.getElementById("scene-gui");

    const newContent =
        newPanel?.querySelector(".gui-content");

    if (newPanel) {

        if (panelTop)
            newPanel.style.top = panelTop;

        if (panelLeft)
            newPanel.style.left = panelLeft;
    }

    if (newContent) {

        requestAnimationFrame(() => {
            newContent.scrollTop = scrollTop;
        });
    }
}

let uiPending = false;

function requestViewportUiUpdate() {

    if (uiPending)
        return;

    uiPending = true;

    requestAnimationFrame(() => {

        uiPending = false;

        viewportUI?.widthSlider?.setValue( camera.width );
        viewportUI?.centreXSlider?.setValue( camera.centre.x );
        viewportUI?.centreYSlider?.setValue( camera.centre.y );
    });
}

new InputController({
    canvas,
    camera,
    requestRender,
    requestViewportUiUpdate,
    rebuildGui,
    rotateVector
});

let viewportUI;

function createGui() {
    const {
        panel,
        root,
        contentWrapper
    } =
    createGuiWindow({

        collapsed:
            guiCollapsed,

        onToggleCollapsed:
            newState => {

                guiCollapsed =
                    newState;

                rebuildGui();
            }
    });
    
    root.style.padding = "14px";
    root.style.display = "grid";
    root.style.gap = "12px";
    
    createCameraPanel({
        root,
        controls,
        renderScene,
        rebuildGui,
        getSelectedStereo,
        meanIPD,
        nextStereoIdRef,
        createTextInput
    });

    viewportUI =
    createViewportPanel({
        root,
        camera,
        controls,
        requestRender,
        requestViewportUiUpdate,
        toggleFullscreen
    });

    createScenePanel({
        root,
        scenes,
        sceneManager,
        renderScene,
        rebuildGui,
        duplicateCurrentScene,
        deleteCurrentScene,
        addSceneObject,
        removeSceneObject,
        nextObjectIdRef,
        nextSceneIdRef,
        Vector3
    });

    createObjectPanel({
        root,
        sceneManager,
        renderScene,
        rebuildGui,
        Vector3,
        createTextInput,
        createColorPicker
    });
    
    document.body.appendChild(panel);
}
createGui();
renderScene();
