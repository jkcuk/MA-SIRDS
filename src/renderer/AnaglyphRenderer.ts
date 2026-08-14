import { Scene } from "../scene/Scene";
import { Vector3 } from "../core/Vector3";
import { Ray } from "../core/Ray";
import { Screen } from "./Screen";

// Render the scene twice, once from a left-eye camera and once from a
// right-eye camera, then combine the two results into a red/cyan anaglyph.
export class AnaglyphRenderer {
  // Keep one camera for each eye so the viewer gets a stereo baseline.

  // Create the stereo pair and let both cameras share the same screen plane.
  constructor(
    public cameraPosition: Vector3[] = [new Vector3(-0.03, 0, 0), new Vector3(0.03, 0, 0)],
    public screen: Screen
  ) {}

  // Render both eye views, then keep the red channel from the left eye and the
  // green/blue channels from the right eye to create the anaglyph effect.
  render(ctx: CanvasRenderingContext2D, width: number, height: number, scene: Scene) {
    const image = ctx.createImageData(width, height);

    for (let j = 0; j < height; j++) {
      const v = (j / height) * 2 - 1;
      for (let i = 0; i < width; i++) {
        const u = (i / width) * 2 - 1;
        const screenPoint = this.screen.hv2World(u, -v);

        const leftColor = scene.trace(new Ray(this.cameraPosition[0], screenPoint.sub(this.cameraPosition[0])), 0);
        const rightColor = scene.trace(new Ray(this.cameraPosition[1], screenPoint.sub(this.cameraPosition[1])), 0);

        const index = (j * width + i) * 4;
        image.data[index] = Math.round(Math.max(0, Math.min(1, leftColor[0])) * 255);
        image.data[index + 1] = Math.round(Math.max(0, Math.min(1, rightColor[1])) * 255);
        image.data[index + 2] = Math.round(Math.max(0, Math.min(1, rightColor[2])) * 255);
        image.data[index + 3] = 255;
      }
    }

    ctx.putImageData(image, 0, 0);
  }
}