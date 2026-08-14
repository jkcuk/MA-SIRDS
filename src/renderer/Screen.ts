import { Vector3 } from "../core/Vector3";

// A planar screen described by its center point and two half-axes that define
// its size and orientation in world space.
export class Screen {
  public image: ImageData;
  // public dots: number[][] | null = null;

  // Store the screen center and the horizontal and vertical half-axes.
  constructor(
    public center: Vector3,
    public hHalfAxis: Vector3,
    public vHalfAxis: Vector3,
    public hPixels: number,
    public vPixels: number,
    public ctx: CanvasRenderingContext2D
  ) {
    this.image = ctx.createImageData(this.hPixels, this.vPixels);

    // RGB defaults to 0 already, so just set alpha
    for (let i = 3; i < this.image.data.length; i += 4) {
      this.image.data[i] = 255;
    }

  }

  // for i in the range [0, hPixels], return the corresponding h in the range [-1, 1]
  i2h(i: number): number {
    return (i / this.hPixels) * 2 - 1;
  }

  // for j in the range [0, vPixels], return the corresponding v in the range [-1, 1]
  j2v(j: number): number {
    return (j / this.vPixels) * 2 - 1;
  }

  h2iUnrounded(h: number): number {
    return ((h + 1) / 2) * this.hPixels;
  }

  h2i(h: number): number {
    return Math.round(((h + 1) / 2) * this.hPixels);
  }

  v2jUnrounded(v: number): number {
    return ((-v + 1) / 2) * this.vPixels;
  }

  v2j(v: number): number {
    return Math.round(((-v + 1) / 2) * this.vPixels);
  }

  // for i in the range [0, hPixels] and j in the range [0, vPixels], return the corresponding world-space point on the screen plane

  // Map normalized screen coordinates in the range [-1, 1] to a world-space
  // point on the screen plane.
  hv2World(h: number, v: number): Vector3 {
    return this.center
      .add(this.hHalfAxis.mul(h))
      .add(this.vHalfAxis.mul(v));
  }

  placeDot(h: number, v: number, color: [number, number, number]) {
    const index = (this.v2j(v) * this.hPixels + this.h2i(h)) * 4;
    this.image.data[index] = Math.round(Math.max(0, Math.min(1, color[0])) * 255);
    this.image.data[index + 1] = Math.round(Math.max(0, Math.min(1, color[1])) * 255);
    this.image.data[index + 2] = Math.round(Math.max(0, Math.min(1, color[2])) * 255);
    this.image.data[index + 3] = 255; // alpha channel
  }

  placeBlob(
    h: number,
    v: number,
    rgbComponentIndex: number, // 0 for red, 1 for green, 2 for blue
    brightness: number, // in the range [0, 1]
    sigma: number // in pixel units
  ) {
    const cxUnrounded = this.h2iUnrounded(h);
    const cyUnrounded = this.v2jUnrounded(v);

    const cx = Math.round(cxUnrounded);
    const cy = Math.round(cyUnrounded);

    const radius = Math.max(1, Math.floor(3 * sigma)); // ~99% of Gaussian

    const inv2Sigma2 = 1 / (2 * sigma * sigma);

    for (let dy = -radius; dy <= radius; dy++) {
      const y = cy + dy;
      if (y < 0 || y >= this.vPixels) continue;
      const dyUnrounded = y - cyUnrounded;

      for (let dx = -radius; dx <= radius; dx++) {
        const x = cx + dx;
        if (x < 0 || x >= this.hPixels) continue;
        const dxUnrounded = x - cxUnrounded;

        // const r2 = dx * dx + dy * dy;
        const r2 = dxUnrounded * dxUnrounded + dyUnrounded * dyUnrounded;

        // Gaussian weight
        const w = Math.exp(-r2 * inv2Sigma2);

        const index = (y * this.hPixels + x) * 4;

        // Additive blending (better for dots)
        this.image.data[index + rgbComponentIndex] = Math.min(
          255,
          this.image.data[index + rgbComponentIndex] + Math.round(brightness * w * 255)
        );
        this.image.data[index + 3] = 255;

        // if(this.dots) this.dots.push([h,v]);
      }
    }
  }

  // Get the red channel value at the given normalized screen coordinates (h, v)
  getR(h: number, v: number): number {
    const index = (this.v2j(v) * this.hPixels + this.h2i(h)) * 4;
    return this.image.data[index];
  }

  // Get the value of a specific RGB component (0 for red, 1 for green, 2 for blue) at the given normalized screen coordinates (h, v)
  getRGBComponent(h: number, v: number, rgbComponentIndex: number): number {
    const index = (this.v2j(v) * this.hPixels + this.h2i(h)) * 4;
    return this.image.data[index + rgbComponentIndex];
  }

  showImage() {
    this.ctx.putImageData(this.image, 0, 0);
  }
}