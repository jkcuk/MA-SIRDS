import {
    createSlider,
    createButton,
    createSection
}
from "./elements.js";

export function createViewportPanel({
    root,
    camera,
    controls,
    requestRender,
    requestViewportUiUpdate,
    toggleFullscreen
}) {

    const viewportGroup =
        createSection(
            root,
            "Viewport",
            true
        );

    const centreXSlider =
        createSlider(
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

    const centreYSlider =
        createSlider(
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

    const widthSlider =
        createSlider(
            viewportGroup,
            "Width",
            0.01,
            2,
            0.001,
            camera.width,
            value => {

                camera.width =
                    value;
            },
            requestRender
        );

    createButton(
        viewportGroup,
        "Reset View",
        () => {

            camera.reset(
                controls.screenWidth
            );

            requestViewportUiUpdate();
            requestRender();
        }
    );

    createButton(
        viewportGroup,
        "Toggle Full Screen",
        toggleFullscreen
    );

    return {
        centreXSlider,
        centreYSlider,
        widthSlider
    };
}