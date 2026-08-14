// ui.ts

import { Vector3 } from "../core/Vector3";

export type SliderDisplayTransform = {
    toDisplay: (value: number) => string;
    fromDisplay: (value: number) => number;
    displayStep?: number;
};

export function createSlider(
    parent: HTMLElement,
    label: string,
    min: number,
    max: number,
    step: number,
    value: number,
    onChange: (nextValue: number) => void,
    render: () => void,
    displayTransform?: SliderDisplayTransform
) {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.gap = "6px";
    wrapper.style.font = "12px sans-serif";
    wrapper.style.color = "#e8eef7";

    const title = document.createElement("span");
    title.textContent = label;
    title.style.minWidth = "40px";

    const range = document.createElement("input");
    range.type = "range";
    range.min = String(min);
    range.max = String(max);
    range.step = String(step);
    range.value = String(value);
    range.style.flex = "0 0 60px";

    const number = document.createElement("input");
    number.type = "number";
    number.style.flex = "0 0 60px";
    // width = "80px";

    const transform: SliderDisplayTransform = displayTransform ?? {
        toDisplay: value => String(value),
        fromDisplay: value => value
    };
    const displayStep = transform.displayStep ?? step;

    number.min = transform.toDisplay(min);
    number.max = transform.toDisplay(max);
    number.step = String(displayStep);
    number.value = transform.toDisplay(value);

    function update(v: number) {
        const nextValue = Math.min(max, Math.max(min, v));
        range.value = String(nextValue);
        number.value = transform.toDisplay(nextValue);
        onChange(nextValue);
        render();
    }

    function enforceRangeAndUpdate(v: number) {
        update(v);
    }

    range.addEventListener("input", () => enforceRangeAndUpdate(Number(range.value)));
    number.addEventListener("change", () => {
        const rawNumber = Number(number.value);
        if (Number.isFinite(rawNumber)) {
            update(transform.fromDisplay(rawNumber));
        }
    });

    wrapper.append(title, range, number);
    parent.appendChild(wrapper);
}

export function createButton(
    parent: HTMLElement,
    label: string,
    onClick: () => void
) {
    const button = document.createElement("button");
    button.textContent = label;
    button.style.padding = "0.45rem 0.65rem";
    button.style.borderRadius = "8px";
    button.style.border = "1px solid rgba(255,255,255,0.16)";
    button.style.background = "rgba(255,255,255,0.08)";
    button.style.color = "#fff";
    button.onclick = onClick;

    parent.appendChild(button);
}

export function createSmallButton(
    parent: HTMLElement,
    label: string,
    onClick: () => void
) {
    const button = document.createElement("button");
    button.textContent = label;
    button.style.padding = "0.1rem 0.1rem";
    button.style.borderRadius = "1px";
    button.style.border = "1px solid rgba(255,255,255,0.16)";
    button.style.background = "rgba(255,255,255,0.08)";
    button.style.color = "#fff";
    button.onclick = onClick;

    parent.appendChild(button);
}

export function createSelect(
    parent: HTMLElement,
    label: string,
    options: { label: string; value: string }[],
    value: string,
    onChange: (v: string) => void,
    render: () => void,
    rebuild: () => void
) {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.gap = "6px";
    wrapper.style.alignItems = "center";
    wrapper.style.color = "#e8eef7";
    wrapper.style.font = "12px sans-serif";

    const title = document.createElement("span");
    title.textContent = label;
    title.style.minWidth = "80px";

    const select = document.createElement("select");
    select.style.flex = "1";

    for (const opt of options) {
        const o = document.createElement("option");
        o.value = opt.value;
        o.textContent = opt.label;
        if (opt.value === value) o.selected = true;
        select.appendChild(o);
    }

    select.addEventListener("change", () => {
        onChange(select.value);
        render();
        rebuild();
    });

    wrapper.append(title, select);
    parent.appendChild(wrapper);
}

export function createNewObjectSelect(
    parent: HTMLElement,
    label: string,
    defaultText: string,
    options: { label: string; value: string }[],
    value: string | null,
    onChange: (v: string) => void,
    render: () => void,
    rebuild?: () => void
) {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.gap = "6px";
    wrapper.style.alignItems = "center";
    wrapper.style.color = "#e8eef7";
    wrapper.style.font = "12px sans-serif";

    const title = document.createElement("span");
    title.textContent = label;
    title.style.minWidth = "80px";

    const select = document.createElement("select");
    select.style.flex = "1";

    // Default option
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = defaultText;
    placeholder.selected = true;
    placeholder.disabled = false;
    select.appendChild(placeholder);

    // Real options
    for (const opt of options) {
        const o = document.createElement("option");
        o.value = opt.value;
        o.textContent = opt.label;

        // optional: preselect if needed
        if (value && opt.value === value) {
            o.selected = true;
        }

        select.appendChild(o);
    }

    select.addEventListener("change", () => {
        const selected = select.value;

        // ignore default
        if (!selected) return;

        onChange(selected);
        render();
        rebuild?.();

        // reset back to default
        select.value = "";
    });

    wrapper.append(title, select);
    parent.appendChild(wrapper);
}

export function createSwitch(
    parent: HTMLElement,
    label: string,
    value: boolean,
    onChange: (v: boolean) => void,
    render?: () => void,
    rebuild?: () => void
) {
    const wrapper = document.createElement("label");
    wrapper.style.display = "flex";
    wrapper.style.justifyContent = "space-between";
    wrapper.style.alignItems = "center";
    wrapper.style.font = "12px sans-serif";
    wrapper.style.color = "#e8eef7";

    const title = document.createElement("span");
    title.textContent = label;

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = value;

    input.addEventListener("change", () => {
        onChange(input.checked);
        render?.();
        rebuild?.();
    });

    wrapper.append(title, input);
    parent.appendChild(wrapper);
}

export function createSection(parent: HTMLElement, title: string, open = true): HTMLElement {
    const section = document.createElement("details");
    section.open = open;
    section.style.border = "1px solid rgba(255,255,255,0.12)";
    section.style.borderRadius = "10px";
    section.style.padding = "8px 10px";
    section.style.margin = "4px 0";
    section.style.background = "rgba(255,255,255,0.04)";

    const summary = document.createElement("summary");
    summary.textContent = title;
    summary.style.cursor = "pointer";
    summary.style.font = "600 12px/1.3 sans-serif";
    summary.style.color = "#ffffff";
    summary.style.listStyle = "none";

    const content = document.createElement("div");
    content.style.display = "grid";
    content.style.gap = "8px";
    content.style.marginTop = "10px";

    section.append(summary, content);
    parent.appendChild(section);

    return content;
}