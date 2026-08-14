import { Scene } from "../scene/Scene";
import { Ray } from "../core/Ray";
import { Vector3 } from "../core/Vector3";
import { Screen } from "./Screen";

// Renderer turns the scene into pixels by tracing one ray per pixel,
// following ray bounces through the scene, and writing the resulting color
// into the canvas one pixel at a time.
export class Renderer {
  maxDepth = 10;

  // Create the stereo pair and let both cameras share the same screen plane.
    constructor(
      public cameraPosition: Vector3 = new Vector3(0, 0, 0),
      public screen: Screen
    ) {
    }

  // Render the full scene into a canvas by constructing a camera ray for each
  // pixel, tracing that ray through the scene, and painting the returned color.
  render(ctx: CanvasRenderingContext2D, width: number, height: number, scene: Scene) {
    // Scan the image from top to bottom and left to right so every canvas pixel
    // gets its own ray and its own computed color.

    for (let j = 0; j < height; j++) {
      const v = (j / height) * 2 - 1;
      for (let i = 0; i < width; i++) {
        const u = (i / width) * 2 - 1;
        const screenPoint = this.screen.hv2World(u, -v);

        const color = scene.trace(
          new Ray(this.cameraPosition, screenPoint.sub(this.cameraPosition)), 
          0
        );

        ctx.fillStyle = `rgb(${color[0]*255},${color[1]*255},${color[2]*255})`;
        ctx.fillRect(i, j, 1, 1);
      }
    }
  }
}