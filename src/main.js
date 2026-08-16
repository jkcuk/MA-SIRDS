import { SceneManager } from "./scene/SceneManager.js";
import { buildScene } from "./scene/SceneBuilder.js";
import { Vector3 } from "./core/Vector3.js"
import { RendererManager } from "./renderer/RendererManager.js";
import { Camera } from "./camera/Camera.js";
import { InputController } from "./input/InputController.js";
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
    rdasMaxClans: 100,
    rdasMaxRecursionDepth: 200,
    rdasFadeFactor: 1,
    rdasMinBrightness: 0.2,
    rdasAlreadyThereThreshold: 250
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
let nextSceneId = 1;
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
            {
                id: nextObjectId++,
                kind: "cylinder",
                name: "Cylinder 1",
                open: true,
                position: new Vector3(0, 0.03, -0.1),
                axis: new Vector3(1, 0, 0),
                radius: 0.01,
                length: 1,
                color: "#d9d9d9",
                material: "phong"
            },
            {
                id: nextObjectId++,
                kind: "cylinder",
                name: "Cylinder 2",
                open: true,
                position: new Vector3(0, 0, -0.09),
                axis: new Vector3(1, 0, 0),
                radius: 0.01,
                length: 1,
                color: "#d9d9d9",
                material: "phong"
            },
            {
                id: nextObjectId++,
                kind: "cylinder",
                name: "Cylinder 3",
                open: true,
                position: new Vector3(0, -0.03, -0.08),
                axis: new Vector3(1, 0, 0),
                radius: 0.01,
                length: 1,
                color: "#d9d9d9",
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
    sceneManager.getCurrentScene().objects.push(object);
    sceneManager.selectObject(object.id);
    renderScene();
    rebuildGui();
}
function removeSceneObject(id) {
    const index = sceneManager.getCurrentScene().objects.findIndex(object => object.id === id);
    if (index < 0)
        return;
    sceneManager.getCurrentScene().objects.splice(index, 1);
    if (sceneManager.selectedObjectId === id) {
        sceneManager.selectObject(
            sceneManager.getCurrentScene().objects.length > 0
                ? sceneManager.getCurrentScene().objects[0].id
                : null);
    }
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

        viewportWidthSlider?.setValue(camera.width);
        viewportCentreXSlider?.setValue(camera.centre.x);
        viewportCentreYSlider?.setValue(camera.centre.y);
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

let viewportWidthSlider;
let viewportCentreXSlider;
let viewportCentreYSlider;

function createGui() {
    const panel = document.createElement("div");
    panel.id = "scene-gui";
    panel.style.position = "fixed";
    panel.style.top = "12px";
    panel.style.right = "12px";
    panel.style.left = "auto";    
    panel.style.zIndex = "10";
    panel.style.width = "330px";
    panel.style.maxHeight = "calc(100vh - 24px)";
    panel.style.display = "flex";
    panel.style.flexDirection = "column";
    panel.style.borderRadius = "14px";
    panel.style.background = "rgba(12,16,24,0.86)";
    panel.style.backdropFilter = "blur(10px)";
    panel.style.boxShadow = "0 16px 48px rgba(0,0,0,0.35)";
    
    // Create a draggable header
    const header = document.createElement("div");
    header.style.padding = "10px 14px";
    header.style.cursor = "grab";
    header.style.userSelect = "none";
    header.style.background = "rgba(0,0,0,0.3)";
    header.style.borderBottom = "1px solid rgba(255,255,255,0.1)";
    header.style.borderRadius = "14px 14px 0 0";
    header.style.fontSize = "14px";
    header.style.fontWeight = "600";
    header.style.color = "#ffffff";
    header.style.flexShrink = "0";
    // header.textContent = "Scene Controls";
    header.style.display = "flex";
    header.style.justifyContent = "space-between";
    header.style.alignItems = "center";

    const title = document.createElement("span");
    title.textContent = "Controls";
    header.append(title);

    // const collapseBtn = document.createElement("button");
    // collapseBtn.textContent = guiCollapsed ? "▶" : "▼";
    // collapseBtn.style.background = "transparent";
    // collapseBtn.style.border = "none";
    // collapseBtn.style.color = "#fff";
    // collapseBtn.style.cursor = "pointer";
    // collapseBtn.style.fontSize = "14px";
    // collapseBtn.style.padding = "0";
    // collapseBtn.addEventListener("click", (e) => {
    //     e.stopPropagation();

    //     guiCollapsed = !guiCollapsed;

    //     contentWrapper.style.display =
    //         guiCollapsed ? "none" : "block";

    //     collapseBtn.textContent =
    //         guiCollapsed ? "▶" : "▼";
    // });
    // header.append(collapseBtn);
    
    // let isDragging = false;
    // let dragOffsetX = 0;
    // let dragOffsetY = 0;
    // let dragMoveHandler = null;
    // let dragUpHandler = null;
    
    // header.addEventListener("mousedown", (e) => {
    //     console.log("mousedown on header");
    //     isDragging = true;
    //     const rect = panel.getBoundingClientRect();
    //     dragOffsetX = e.clientX - rect.left;
    //     dragOffsetY = e.clientY - rect.top;
    //     header.style.cursor = "grabbing";
        
    //     dragMoveHandler = (moveEvent) => {
    //         if (!isDragging) return;
    //         panel.style.left = (moveEvent.clientX - dragOffsetX) + "px";
    //         panel.style.top = (moveEvent.clientY - dragOffsetY) + "px";
    //     };
        
    //     dragUpHandler = () => {
    //         console.log("mouseup");
    //         isDragging = false;
    //         header.style.cursor = "grab";
    //         document.removeEventListener("mousemove", dragMoveHandler);
    //         document.removeEventListener("mouseup", dragUpHandler);
    //         dragMoveHandler = null;
    //         dragUpHandler = null;
    //     };
        
    //     document.addEventListener("mousemove", dragMoveHandler);
    //     document.addEventListener("mouseup", dragUpHandler);
    // });
    
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    // Prevent browser touch scrolling while dragging header
    header.style.touchAction = "none";

    header.addEventListener("pointerdown", (e) => {
        // if (e.target === collapseBtn) return;

        isDragging = true;

        const rect = panel.getBoundingClientRect();

        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;

        header.style.cursor = "grabbing";
        // panel.style.right = "auto";

        // Keep receiving move events even if pointer leaves header
        header.setPointerCapture(e.pointerId);
    });

    header.addEventListener("pointermove", (e) => {
        if (!isDragging) return;

        panel.style.left = `${e.clientX - dragOffsetX}px`;
        panel.style.top  = `${e.clientY - dragOffsetY}px`;
    });
    
    header.addEventListener("dblclick", () => {
        guiCollapsed = !guiCollapsed;

        contentWrapper.style.display =
            guiCollapsed ? "none" : "block";

        // collapseBtn.textContent = guiCollapsed ? "▶" : "▼";
    });

    function stopDragging(e) {
        if (!isDragging) return;

        isDragging = false;
        header.style.cursor = "grab";

        try {
            header.releasePointerCapture(e.pointerId);
        } catch (_) {}
    }

    header.addEventListener("pointerup", stopDragging);
    header.addEventListener("pointercancel", stopDragging);


    panel.appendChild(header);
    
    // Create a scrollable content wrapper
    const contentWrapper = document.createElement("div");
    contentWrapper.className = "gui-content";
    contentWrapper.style.overflow = "auto";
    contentWrapper.style.flex = "1";
    contentWrapper.style.minHeight = "0";
    if (guiCollapsed) {
       contentWrapper.style.display = "none";
        panel.style.maxHeight = "unset";
    }
    
    const root = document.createElement("div");
    root.style.padding = "14px";
    root.style.display = "grid";
    root.style.gap = "12px";
    // --------------------------------------------------
    // Camera
    // --------------------------------------------------
    const stereoGroup = createSection(root, "Camera", true);
    createSelect(stereoGroup, "Renderer", [
        { label: "Standard", value: "standard" },
        { label: "Anaglyph", value: "anaglyph" },
        { label: "Autostereogram", value: "rds" }
    ], controls.renderer, value => {
        controls.renderer = value;
    }, renderScene, rebuildGui);
    const isStereo = controls.renderer === "anaglyph" ||
        controls.renderer === "rds";
    if (isStereo) {
        const options = controls.stereoPairs.map((p, i) => ({
            label: p.name,
            value: String(i)
        }));
        createSelect(stereoGroup, "Stereo preset", options, String(controls.stereoPairs.findIndex(p => p.id === controls.selectedStereoPairId)), value => {
            controls.selectedStereoPairId =
                controls.stereoPairs[Number(value)].id;
        }, renderScene, rebuildGui);
        const stereo = getSelectedStereo();
        if (stereo) {
            const presetGroup = createSection(stereoGroup, "Stereo preset", true);
            createTextInput(presetGroup, "Preset name", stereo.name, value => {
                stereo.name = value;
            });
            createSlider(presetGroup, "Eye separation", 0, 0.5, 0.005, stereo.eyeSeparation, value => {
                stereo.eyeSeparation = value;
            }, renderScene);
            createSlider(presetGroup, "Axis angle", -180, 180, 1, stereo.angle * 180 / Math.PI, value => {
                stereo.angle = value * Math.PI / 180;
            }, renderScene);
            createButton(presetGroup, "Delete preset", () => {
                const idx = controls.stereoPairs.findIndex(p => p.id === stereo.id);
                if (idx >= 0) {
                    controls.stereoPairs.splice(idx, 1);
                    controls.selectedStereoPairId =
                        controls.stereoPairs[0]?.id ?? null;
                    rebuildGui();
                    renderScene();
                }
            });
        }
        createButton(stereoGroup, "Add preset", () => {
            const newPreset = {
                id: nextStereoId++,
                name: `Preset ${controls.stereoPairs.length + 1}`,
                eyeSeparation: meanIPD,
                angle: 0
            };
            controls.stereoPairs.push(newPreset);
            controls.selectedStereoPairId = newPreset.id;
            rebuildGui();
            renderScene();
        });
    }
    createSlider(stereoGroup, "Screen distance", 0.1, 1, 0.05, controls.screenDistance, value => {
        controls.screenDistance = value;
    }, renderScene);
    // createSlider(stereoGroup, "Screen width", 0.02, 1, 0.01, controls.screenWidth, value => {
    //     controls.screenWidth = value;
    // }, renderScene);
    if (controls.renderer === "rds") {
        createSlider(stereoGroup, "Blob sigma", 0.1, 5, 0.1, controls.rdasBlobSigma, value => {
            controls.rdasBlobSigma = value;
        }, renderScene);
        createSlider(stereoGroup, "Max blobs", 0, 6, .1, Math.log10(controls.rdasMaxBlobs), value => {
            controls.rdasMaxBlobs = Math.pow(10, value);
        }, renderScene, {
            toDisplay: value => String(Math.round(Math.pow(10, value))),
            fromDisplay: value => Math.log10(value),
            displayStep: 1
        });
        createSlider(stereoGroup, "Max clans", 0, 6, .1, Math.log10(controls.rdasMaxClans), value => {
            controls.rdasMaxClans = Math.pow(10, value);
        }, renderScene, {
            toDisplay: value => String(Math.round(Math.pow(10, value))),
            fromDisplay: value => Math.log10(value),
            displayStep: 1
        });
        createSlider(stereoGroup, "Max recursion depth", 0, 200, 1, controls.rdasMaxRecursionDepth, value => {
            controls.rdasMaxRecursionDepth = value;
        }, renderScene);
        createSlider(stereoGroup, "Fade factor", 0, 1, 0.01, controls.rdasFadeFactor, value => {
            controls.rdasFadeFactor = value;
        }, renderScene);
        createSlider(stereoGroup, "Min brightness", 0, 1, 0.01, controls.rdasMinBrightness, value => {
            controls.rdasMinBrightness = value;
        }, renderScene);
        createSlider(stereoGroup, "Already there threshold", 0, 255, 1, controls.rdasAlreadyThereThreshold, value => {
            controls.rdasAlreadyThereThreshold = value;
        }, renderScene);
        createSwitch(stereoGroup, "Use all stereo pairs", controls.useAllStereoPairs, value => {
            controls.useAllStereoPairs = value;
        }, renderScene, rebuildGui);
    }

    // --------------------------------------------------
    // Viewport
    // --------------------------------------------------

    const viewportGroup =
        createSection(root, "Viewport", true);

    viewportCentreXSlider = createSlider(
        viewportGroup,
        "Centre X",
        -1,
        1,
        0.001,
        camera.centre.x,
        value => {
            camera.setCentre(
                value,
                camera.centre.y,
                camera.centre.z
            );
        },
        requestRender
    );

    viewportCentreYSlider = createSlider(
        viewportGroup,
        "Centre Y",
        -1,
        1,
        0.001,
        camera.centre.y,
        value => {
            camera.setCentre(
                camera.centre.x,
                value,
                camera.centre.z
            );
        },
        requestRender
    );

    // createSlider(
    //     viewportGroup,
    //     "Centre Z",
    //     -1,
    //     1,
    //     0.001,
    //     camera.centre.z,
    //     value => {
    //         camera.centre =
    //             new Vector3(
    //                 camera.centre.x,
    //                 camera.centre.y,
    //                 value
    //             );
    //     },
    //     renderScene
    // );

    viewportWidthSlider =
        createSlider(
            viewportGroup,
            "Width",
            0.01,
            2,
            0.001,
            camera.width,
            value => {
                camera.width = value;
            },
            requestRender
        );

    createButton(
        viewportGroup,
        "Reset View",
        () => {
            camera.reset(controls.screenWidth);

            requestViewportUiUpdate();
            requestRender();
        }
    );

    createButton(
        viewportGroup,
        "Toggle Full Screen",
        toggleFullscreen
    );


    // --------------------------------------------------
    // Scene
    // --------------------------------------------------
    const sceneGroup = createSection(root, "Scene", true);
    const sceneSelectOptions = scenes.map((scene, index) => ({
        label: scene.name,
        value: String(index)
    }));
    createSelect(sceneGroup, "Scene", sceneSelectOptions, String(sceneManager.currentSceneIndex), value => {
        sceneManager.selectScene(Number(value));
    }, renderScene, rebuildGui);
    const sceneControls = document.createElement("div");
    sceneControls.style.display = "flex";
    sceneControls.style.gap = "6px";
    createButton(sceneControls, "New", () => {
        scenes.push({
            id: nextSceneId++,
            name: `Scene ${scenes.length + 1}`,
            objects: []
        });
        sceneManager.selectScene(scenes.length - 1);
        renderScene();
        rebuildGui();
    });
    createButton(sceneControls, "Duplicate", duplicateCurrentScene);
    createButton(sceneControls, "Delete", deleteCurrentScene);
    sceneGroup.appendChild(sceneControls);
    // --------------------------------------------------
    // Scene Object List
    // --------------------------------------------------
    const sceneObjectsGroup = createSection(root, "Scene Objects", true);
    for (const object of sceneManager.getCurrentScene().objects) {
        // container row
        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.gap = "6px";
        row.style.alignItems = "center";
        // main object button
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = `${object.name} (${object.kind})`;
        button.style.flex = "1"; // fill remaining space
        button.style.textAlign = "left";
        button.style.padding = "0.5rem";
        button.style.borderRadius = "8px";
        button.style.cursor = "pointer";
        button.style.color = "#fff";
        button.style.border =
            object.id === sceneManager.selectedObjectId
                ? "2px solid #66ccff"
                : "1px solid rgba(255,255,255,0.15)";
        button.style.background =
            object.id === sceneManager.selectedObjectId
                ? "rgba(102,204,255,0.15)"
                : "rgba(255,255,255,0.05)";
        button.addEventListener("click", () => {
            sceneManager.selectObject(object.id);
            rebuildGui();
        });
        // move up button ("^")
        const upBtn = document.createElement("button");
        upBtn.textContent = "↑";
        upBtn.title = "Move up";
        upBtn.style.width = "20px";
        upBtn.style.height = "20px";
        upBtn.style.borderRadius = "1px";
        upBtn.style.border = "1px solid rgba(255,255,255,0.2)";
        upBtn.style.background = "rgba(200,200,255,0.15)";
        upBtn.style.color = "#fff";
        upBtn.style.cursor = "pointer";
        upBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            sceneManager.moveObjectUp(object.id);
            renderScene();
            rebuildGui();
        });
        // move down button ("v")
        const downBtn = document.createElement("button");
        downBtn.textContent = "↓";
        downBtn.title = "Move down";
        downBtn.style.width = "20px";
        downBtn.style.height = "20px";
        downBtn.style.borderRadius = "1px";
        downBtn.style.border = "1px solid rgba(255,255,255,0.2)";
        downBtn.style.background = "rgba(200,200,255,0.15)";
        downBtn.style.color = "#fff";
        downBtn.style.cursor = "pointer";
        downBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            sceneManager.moveObjectDown(object.id);
            renderScene();
            rebuildGui();
        });
        // duplicate button ("x2")
        const duplicateBtn = document.createElement("button");
        duplicateBtn.textContent = "x2";
        duplicateBtn.title = "Duplicate object";
        duplicateBtn.style.width = "26px";
        duplicateBtn.style.height = "20px";
        duplicateBtn.style.borderRadius = "1px";
        duplicateBtn.style.border = "1px solid rgba(255,255,255,0.2)";
        duplicateBtn.style.background = "rgba(80,180,255,0.15)";
        duplicateBtn.style.color = "#fff";
        duplicateBtn.style.cursor = "pointer";
        duplicateBtn.style.fontSize = "12px";
        duplicateBtn.style.lineHeight = "1";
        duplicateBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            // find object
            const original = sceneManager.getCurrentScene().objects.find(o => o.id === object.id);
            if (!original)
                return;
            // deep-ish copy
            const copy = {
                ...original,
                id: nextObjectId++,
                name: original.name + " copy",
                position: new Vector3(original.position.x, original.position.y, original.position.z),
                axis: original.axis
                    ? new Vector3(original.axis.x, original.axis.y, original.axis.z)
                    : undefined,
                normal: original.normal
                    ? new Vector3(original.normal.x, original.normal.y, original.normal.z)
                    : undefined,
                hAxis: original.hAxis
                    ? new Vector3(
                        original.hAxis.x,
                        original.hAxis.y,
                        original.hAxis.z
                    )
                    : undefined,
                vAxis: original.vAxis
                    ? new Vector3(
                        original.vAxis.x,
                        original.vAxis.y,
                        original.vAxis.z
                    )
                    : undefined          
            };
            sceneManager.getCurrentScene().objects.push(copy);
            sceneManager.selectObject(copy.id);
            renderScene();
            rebuildGui();
        });
        // delete button ("-")
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "−"; // nicer minus symbol
        deleteBtn.title = "Delete object";
        deleteBtn.style.width = "20px";
        deleteBtn.style.height = "20px";
        deleteBtn.style.borderRadius = "1px";
        deleteBtn.style.border = "1px solid rgba(255,255,255,0.2)";
        deleteBtn.style.background = "rgba(255,80,80,0.15)";
        deleteBtn.style.color = "#fff";
        deleteBtn.style.cursor = "pointer";
        deleteBtn.style.fontSize = "16px";
        deleteBtn.style.lineHeight = "1";
        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // ✅ prevents selecting the object
            // const confirmed = confirm(
            //     `Delete object "${object.name}"?`
            // );
            // if (!confirmed) return;
            removeSceneObject(object.id);
        });
        // assemble row
        // row.append(button, deleteBtn);
        // sceneObjectsGroup.appendChild(row);
        // assemble row
        // row.append(button, duplicateBtn, deleteBtn);
        row.append(button, upBtn, downBtn, duplicateBtn, deleteBtn);
        sceneObjectsGroup.appendChild(row);
    }
    // for (const object of sceneManager.getCurrentScene().objects) {
    //     const button =
    //         document.createElement("button");
    //     button.type = "button";
    //     button.textContent =
    //         `${object.name} (${object.kind})`;
    //     button.style.textAlign = "left";
    //     button.style.padding = "0.5rem";
    //     button.style.borderRadius = "8px";
    //     button.style.cursor = "pointer";
    //     button.style.color = "#fff";
    //     button.style.border =
    //         object.id === sceneManager.selectedObjectId
    //             ? "2px solid #66ccff"
    //             : "1px solid rgba(255,255,255,0.15)";
    //     button.style.background =
    //         object.id === sceneManager.selectedObjectId
    //             ? "rgba(102,204,255,0.15)"
    //             : "rgba(255,255,255,0.05)";
    //     button.addEventListener("click", () => {
    //         sceneManager.selectObject(object.id);
    //         rebuildGui();
    //     });
    //     sceneObjectsGroup.appendChild(button);
    // }
    // the add scene object row
    // container row
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.gap = "6px";
    row.style.alignItems = "center";
    // dropdown
    const select = document.createElement("select");
    select.style.flex = "1";
    const options = [
        { label: "Cone", value: "cone" },
        { label: "Cylinder", value: "cylinder" },
        { label: "Parallelogram", value: "parallelogram" },
        { label: "Plane", value: "plane" },
        { label: "Sphere", value: "sphere" },
        { label: "Text", value: "text" }
    ];
    for (const opt of options) {
        const option = document.createElement("option");
        option.value = opt.value;
        option.textContent = opt.label;
        select.appendChild(option);
    }
    // add button
    // const addBtn = document.createElement("button");
    // addBtn.textContent = "Add a";
    // addBtn.title = "Add object";
    // addBtn.style.width = "28px";
    // addBtn.style.height = "28px";
    // addBtn.style.borderRadius = "6px";
    // addBtn.style.border = "1px solid rgba(255,255,255,0.2)";
    // addBtn.style.background = "rgba(255,255,255,0.1)";
    // addBtn.style.color = "#fff";
    // addBtn.style.cursor = "pointer";
    // addBtn.style.fontSize = "16px";
    // addBtn.style.lineHeight = "1";
    // // click behaviour
    // addBtn.addEventListener("click", () => {
    //     const kind = select.value as Exclude<SceneObjectKind, "ground">;
    //     addSceneObject(kind);
    // });
    // assemble
    row.append(select);
    createSmallButton(row, "+", () => {
        const kind = select.value;
        addSceneObject(kind);
    });
    sceneObjectsGroup.appendChild(row);
    // --------------------------------------------------
    // Selected Object Editor
    // --------------------------------------------------
    const object = sceneManager.getSelectedObject();
    if (object) {
        const editor = createSection(root, `Edit: ${object.name}`, true);
        createTextInput(editor, "Name", object.name, value => {
            object.name = value;
        });
        createSlider(editor, "x", -0.2, 0.2, 0.001, object.position.x, value => {
            object.position =
                new Vector3(value, object.position.y, object.position.z);
        }, renderScene);
        createSlider(editor, "y", -0.2, 0.2, 0.001, object.position.y, value => {
            object.position =
                new Vector3(object.position.x, value, object.position.z);
        }, renderScene);
        createSlider(editor, "z", -1, -0.01, 0.001, object.position.z, value => {
            object.position =
                new Vector3(object.position.x, object.position.y, value);
        }, renderScene);
        if (object.kind === "sphere") {
            createSlider(editor, "Radius", 0.01, 0.1, 0.001, object.radius ?? 0.01, value => {
                object.radius = value;
            }, renderScene);
        }
        if (object.kind === "cylinder" ||
            object.kind === "cone") {
            createSlider(editor, "Axis x", -1, 1, 0.01, object.axis?.x ?? 0, value => {
                object.axis =
                    new Vector3(value, object.axis?.y ?? 1, object.axis?.z ?? 0);
            }, renderScene);
            createSlider(editor, "Axis y", -1, 1, 0.01, object.axis?.y ?? 1, value => {
                object.axis =
                    new Vector3(object.axis?.x ?? 0, value, object.axis?.z ?? 0);
            }, renderScene);
            createSlider(editor, "Axis z", -1, 1, 0.01, object.axis?.z ?? 0, value => {
                object.axis =
                    new Vector3(object.axis?.x ?? 0, object.axis?.y ?? 1, value);
            }, renderScene);
        }
        if (object.kind === "cylinder") {
            createSlider(editor, "Radius", 0.01, 0.1, 0.001, object.radius ?? 0.1, value => {
                object.radius = value;
            }, renderScene);
            createSlider(editor, "Length", 0, 0.5, 0.001, object.length ?? 0.1, value => {
                object.length = value;
            }, renderScene);
        }
        if (object.kind === "cone") {
            createSlider(editor, "Angle [°]", 0, 90, 1, (object.angle ?? 0.45) * 180 / Math.PI, value => {
                object.angle = value * Math.PI / 180;
            }, renderScene);
            createSlider(editor, "Height", 0.0, 1, 0.01, object.coneHeight ?? 0.1, value => {
                object.coneHeight = value;
            }, renderScene);
        }
        if (object.kind === "plane") {
            createSlider(editor, "Normal X", -1, 1, 0.01, object.normal?.x ?? 0, value => {
                object.normal =
                    new Vector3(value, object.normal?.y ?? 1, object.normal?.z ?? 0);
            }, renderScene);
            createSlider(editor, "Normal Y", -1, 1, 0.01, object.normal?.y ?? 1, value => {
                object.normal =
                    new Vector3(object.normal?.x ?? 0, value, object.normal?.z ?? 0);
            }, renderScene);
            createSlider(editor, "Normal Z", -1, 1, 0.01, object.normal?.z ?? 0, value => {
                object.normal =
                    new Vector3(object.normal?.x ?? 0, object.normal?.y ?? 1, value);
            }, renderScene);
        }
        if (object.kind === "parallelogram") {
            createSlider(editor, "hAxis x", -1, 1, 0.01, object.hAxis?.x ?? 1, value => {
                object.hAxis = new Vector3(value, object.hAxis?.y ?? 0, object.hAxis?.z ?? 0);
            }, renderScene);
            createSlider(editor, "hAxis y", -1, 1, 0.01, object.hAxis?.y ?? 0, value => {
                object.hAxis = new Vector3(object.hAxis?.x ?? 0.05, value, object.hAxis?.z ?? 0);
            }, renderScene);
            createSlider(editor, "hAxis z", -1, 1, 0.01, object.hAxis?.z ?? 0, value => {
                object.hAxis = new Vector3(object.hAxis?.x ?? 0.05, object.hAxis?.y ?? 0, value);
            }, renderScene);
            createSlider(editor, "vAxis x", -1, 1, 0.01, object.vAxis?.x ?? 0, value => {
                object.vAxis = new Vector3(value, object.vAxis?.y ?? 0.05, object.vAxis?.z ?? 0);
            }, renderScene);
            createSlider(editor, "vAxis y", -1, 1, 0.01, object.vAxis?.y ?? 0.05, value => {
                object.vAxis = new Vector3(object.vAxis?.x ?? 0, value, object.vAxis?.z ?? 0);
            }, renderScene);
            createSlider(editor, "vAxis z", -1, 1, 0.01, object.vAxis?.z ?? 0, value => {
                object.vAxis = new Vector3(object.vAxis?.x ?? 0, object.vAxis?.y ?? 0, value);
            }, renderScene);
        }
        if (object.kind === "text") {
            createTextInput(editor, "Text", object.text ?? "Hello", value => {
                object.text = value;
                renderScene();
            });
            createTextInput(editor, "Font", object.font ?? "bold 64px sans-serif", value => {
                object.font = value;
                renderScene();
            });
            createSlider(editor, "Width", 0.01, 0.5, 0.001, object.rectWidth ?? 0.1, value => {
                object.rectWidth = value;
            }, renderScene);
            createSlider(editor, "Height", 0.01, 0.5, 0.001, object.rectHeight ?? 0.05, value => {
                object.rectHeight = value;
            }, renderScene);
        }
        // material
        createSelect(editor, "Material", [
            { label: "Colour", value: "colour" },
            { label: "Metal", value: "metal" },
            { label: "Phong", value: "phong" },
            { label: "Dielectric", value: "dielectric" }
        ], object.material, value => {
            object.material = value;
        }, renderScene, rebuildGui);
        if (object.material === "dielectric") {
            createSlider(editor, "Refractive Index", 1.0, 2.5, 0.01, object.ior ?? 1.5, value => {
                object.ior = value;
            }, renderScene);
        }
        if (object.material !== "dielectric") {
            createColorPicker(editor, "Color", object.color ?? "#ffffff", value => {
                object.color = value;
            });
        }
    }
    contentWrapper.appendChild(root);
    panel.appendChild(contentWrapper);
    document.body.appendChild(panel);
}
createGui();
renderScene();
