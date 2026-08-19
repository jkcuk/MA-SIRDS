import {
    createSlider,
    createButton,
    createSelect,
    createSwitch,
    createSection
}
from "./elements.js";

export function createCameraPanel({
    root,
    controls,
    scenes,
    renderScene,
    rebuildGui,
    getSelectedStereo,
    nextStereoIdRef,
    createTextInput
}) {

    const stereoGroup =
        createSection(
            root,
            "Camera",
            true
        );

    createSelect(
        stereoGroup,
        "Renderer",
        [
            {
                label: "Standard",
                value: "standard"
            },
            {
                label: "Anaglyph",
                value: "anaglyph"
            },
            {
                label: "Autostereogram",
                value: "rds"
            }
        ],
        controls.renderer,
        value => {

            controls.renderer =
                value;
        },
        renderScene,
        rebuildGui
    );

    const isStereo =
        controls.renderer === "anaglyph"
        ||
        controls.renderer === "rds";

    if (isStereo) {

        const options =
            controls.stereoPairs.map(
                (p, i) => ({

                    label: p.name,

                    value:
                        String(i)
                })
            );

        createSlider(
            stereoGroup,
            "Eye separation",
            0,
            0.5,
            0.005,
            controls.ipd,    // stereo.eyeSeparation,
            value => {

                controls.ipd = // stereo.eyeSeparation =
                    value;
            },
            renderScene
        );

        createSelect(
            stereoGroup,
            "Stereo preset",
            options,
            String(
                controls.stereoPairs
                    .findIndex(
                        p =>
                            p.id ===
                            controls.selectedStereoPairId
                    )
            ),
            value => {

                controls.selectedStereoPairId =
                    controls.stereoPairs[
                        Number(value)
                    ].id;
            },
            renderScene,
            rebuildGui
        );

        const stereo =
            getSelectedStereo();

        if (stereo) {

            const presetGroup =
                createSection(
                    stereoGroup,
                    "Stereo preset",
                    true
                );

            // createTextInput(
            //     presetGroup,
            //     "Preset name",
            //     stereo.name,
            //     value => {

            //         stereo.name =
            //             value;
            //     }
            // );

            createSlider(
                presetGroup,
                "Axis angle",
                -180,
                180,
                1,
                stereo.angle *
                180 /
                Math.PI,
                value => {

                    stereo.angle =
                        value *
                        Math.PI /
                        180;
                    
                    stereo.name =
                        `Interocular axis @ ${Math.round(value)}°`; 
                },
                renderScene,
                undefined,
                () => {

                    requestAnimationFrame(
                        () => rebuildGui()
                    );
                }
            );

            createSelect(
                presetGroup,
                "Scene",
                scenes.map(
                    scene => ({

                        label: scene.name,

                        value: String(scene.id)
                    })
                ),
                String(
                    stereo.sceneId ??
                    scenes[0]?.id ??
                    ""
                ),
                value => {

                    stereo.sceneId =
                        Number(value);
                },
                renderScene,
                rebuildGui
            );

            createButton(
                presetGroup,
                "Delete preset",
                () => {

                    const idx =
                        controls.stereoPairs
                            .findIndex(
                                p =>
                                    p.id ===
                                    stereo.id
                            );

                    if (idx >= 0) {

                        controls.stereoPairs
                            .splice(idx, 1);

                        controls.selectedStereoPairId =
                            controls.stereoPairs[0]?.id
                            ?? null;

                        rebuildGui();
                        renderScene();
                    }
                }
            );
        }

        createButton(
            stereoGroup,
            "Add preset",
            () => {

                const newPreset = {

                    id:
                        nextStereoIdRef.value++,

                    name:
                        `Preset ${
                            controls.stereoPairs.length + 1
                        }`,

                    // eyeSeparation:
                    //     meanIPD,

                    angle: 0
                };

                controls.stereoPairs
                    .push(newPreset);

                controls.selectedStereoPairId =
                    newPreset.id;

                rebuildGui();
                renderScene();
            }
        );
    }

    createSlider(
        stereoGroup,
        "Screen distance",
        0.1,
        1,
        0.05,
        controls.screenDistance,
        value => {

            controls.screenDistance =
                value;
        },
        renderScene
    );

    // createSlider(
    //     stereoGroup,
    //     "Screen width",
    //     0.02,
    //     1,
    //     0.01,
    //     controls.screenWidth,
    //     value => {

    //         controls.screenWidth =
    //             value;
    //     },
    //     renderScene
    // );

    if (controls.renderer === "rds") {

        createSlider(
            stereoGroup,
            "Blob sigma",
            0.1,
            5,
            0.1,
            controls.rdasBlobSigma,
            value => {

                controls.rdasBlobSigma =
                    value;
            },
            renderScene
        );

        createSlider(
            stereoGroup,
            "Max blobs",
            0,
            6,
            0.1,
            Math.log10(
                controls.rdasMaxBlobs
            ),
            value => {

                controls.rdasMaxBlobs =
                    Math.pow(
                        10,
                        value
                    );
            },
            renderScene,
            {
                toDisplay:
                    value =>
                        String(
                            Math.round(
                                Math.pow(
                                    10,
                                    value
                                )
                            )
                        ),

                fromDisplay:
                    value =>
                        Math.log10(
                            value
                        ),

                displayStep: 1
            }
        );

        createSlider(
            stereoGroup,
            "Max blob families",
            0,
            6,
            0.1,
            Math.log10(
                controls.rdasMaxClans
            ),
            value => {

                controls.rdasMaxClans =
                    Math.pow(
                        10,
                        value
                    );
            },
            renderScene,
            {
                toDisplay:
                    value =>
                        String(
                            Math.round(
                                Math.pow(
                                    10,
                                    value
                                )
                            )
                        ),

                fromDisplay:
                    value =>
                        Math.log10(
                            value
                        ),

                displayStep: 1
            }
        );

        createSlider(
            stereoGroup,
            "Max family size",
            0,
            200,
            1,
            controls.rdasMaxRecursionDepth,
            value => {

                controls.rdasMaxRecursionDepth =
                    value;
            },
            renderScene
        );

        createSlider(
            stereoGroup,
            "Generation fade factor",
            0,
            1,
            0.01,
            controls.rdasFadeFactor,
            value => {

                controls.rdasFadeFactor =
                    value;
            },
            renderScene
        );

        createSlider(
            stereoGroup,
            "Min brightness",
            0,
            1,
            0.01,
            controls.rdasMinBrightness,
            value => {

                controls.rdasMinBrightness =
                    value;
            },
            renderScene
        );

        createSlider(
            stereoGroup,
            "Existing blob threshold",
            0,
            255,
            1,
            controls.rdasAlreadyThereThreshold,
            value => {

                controls.rdasAlreadyThereThreshold =
                    value;
            },
            renderScene
        );

        createSwitch(
            stereoGroup,
            "Multi-angle SIRDS",
            controls.useAllStereoPairs,
            value => {

                controls.useAllStereoPairs =
                    value;
            },
            renderScene,
            rebuildGui
        );
    }
}