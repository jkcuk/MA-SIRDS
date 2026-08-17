export function createGuiWindow({

    collapsed,

    onToggleCollapsed

}) {

    const panel =
        document.createElement("details"); // div

    panel.open = !collapsed;

    panel.id =
        "scene-gui";

    panel.style.position =
        "fixed";

    panel.style.top =
        "12px";

    panel.style.right =
        "12px";

    panel.style.left =
        "auto";

    panel.style.zIndex =
        "10";

    panel.style.width =
        "330px";

    panel.style.maxHeight =
        "calc(100vh - 24px)";

    panel.style.display =
        "flex";

    panel.style.flexDirection =
        "column";

    panel.style.borderRadius =
        "14px";

    panel.style.background =
        "rgba(12,16,24,0.86)";

    panel.style.backdropFilter =
        "blur(10px)";

    panel.style.boxShadow =
        "0 16px 48px rgba(0,0,0,0.35)";

    const header =
        document.createElement("summary");

    header.style.padding =
        "10px 14px";

    header.style.userSelect =
        "none";

    header.style.background =
        "rgba(0,0,0,0.3)";

    header.style.borderBottom =
        "1px solid rgba(255,255,255,0.1)";

    header.style.fontSize =
        "14px";

    header.style.fontWeight =
        "600";

    header.style.color =
        "#ffffff";

    header.style.display =
        "flex";

    header.style.alignItems =
        "center";

    header.style.justifyContent =
        "space-between";

    const title =
        document.createElement("span");

    title.textContent =
        "Controls";

    const dragHandle =
        document.createElement("span");

    dragHandle.textContent =
        "☰";

    dragHandle.title =
        "Drag window";

    dragHandle.style.cursor =
        "grab";

    dragHandle.style.fontSize =
        "18px";

    dragHandle.style.padding =
        "0 4px";

    dragHandle.style.touchAction =
        "none";

    header.append(
        title,
        dragHandle
    );

    panel.append(
        header
    );

    // const header =
    //     document.createElement("summary");  // was div

    // header.textContent = "Controls";

    // header.style.padding =
    //     "10px 14px";

    // header.style.cursor =
    //     "grab";

    // header.style.userSelect =
    //     "none";

    // header.style.background =
    //     "rgba(0,0,0,0.3)";

    // header.style.borderBottom =
    //     "1px solid rgba(255,255,255,0.1)";

    // header.style.borderRadius =
    //     "14px 14px 0 0";

    // header.style.fontSize =
    //     "14px";

    // header.style.fontWeight =
    //     "600";

    // header.style.color =
    //     "#ffffff";

    // header.style.flexShrink =
    //     "0";

    // header.style.display =
    //     "flex";

    // header.style.justifyContent =
    //     "space-between";

    // header.style.alignItems =
    //     "center";

    // const title =
    //     document.createElement("span");

    // title.textContent =
    //     "Controls";

    // header.append(
    //     title
    // );

    // panel.append(
    //     header
    // );

    const contentWrapper =
        document.createElement("div");

    contentWrapper.className =
        "gui-content";

    contentWrapper.style.overflow =
        "auto";

    contentWrapper.style.flex =
        "1";

    contentWrapper.style.minHeight =
        "0";

    // if (collapsed) {

    //     contentWrapper.style.display =
    //         "none";

    //     panel.style.maxHeight =
    //         "unset";
    // }

    panel.append(
        contentWrapper
    );

    const root =
        document.createElement("div");

    root.style.padding =
        "14px";

    root.style.display =
        "grid";

    root.style.gap =
        "12px";

    contentWrapper.append(
        root
    );

    let isDragging = false;
    let moved = false;

    let dragOffsetX =
        0;

    let dragOffsetY =
        0;

    // header.style.touchAction =
    //     "none";

    dragHandle.addEventListener(
        "pointerdown",
        e => {
            moved = false;

            isDragging =
                true;

            const rect =
                panel.getBoundingClientRect();

            panel.style.left =
                `${rect.left}px`;

            panel.style.top =
                `${rect.top}px`;

            panel.style.right =
                "auto";

            dragOffsetX =
                e.clientX -
                rect.left;

            dragOffsetY =
                e.clientY -
                rect.top;

            dragHandle.style.cursor =
                "grabbing";

            dragHandle.setPointerCapture(
                e.pointerId
            );
        }
    );

    dragHandle.addEventListener(
        "pointermove",
        e => {

            if (!isDragging)
                return;

            moved = true;

            panel.style.left =
                `${e.clientX - dragOffsetX}px`;

            panel.style.top =
                `${e.clientY - dragOffsetY}px`;
        }
    );

    function stopDragging(e) {

        if (!isDragging)
            return;

        isDragging =
            false;

        dragHandle.style.cursor =
            "grab";

        try {

            dragHandle.releasePointerCapture(
                e.pointerId
            );

        } catch (_) {}
    }

    dragHandle.addEventListener(
        "pointerup",
        stopDragging
    );

    dragHandle.addEventListener(
        "pointercancel",
        stopDragging
    );

    dragHandle.addEventListener(
        "click",
        e => {

            if (!moved)
                return;

            e.preventDefault();
            e.stopPropagation();
        }
    );

    // header.addEventListener(
    //     "dblclick",
    //     () => {

    //         const newState =
    //             !collapsed;

    //         onToggleCollapsed?.(
    //             newState
    //         );
    //     }
    // );

    return {

        panel,

        root,

        contentWrapper
    };
}