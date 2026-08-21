import { Vector3 } from "../core/Vector3.js"
import { Rectangle } from "../geometry/Rectangle.js"
import { Colour } from "../materials/Colour.js"
import { Screen } from "../renderer/Screen.js"
import { Ray } from "../core/Ray.js"
// Render the scene twice, once from a left-eye camera and once from a
// right-eye camera, then combine the two results into a red/cyan anaglyph.
export class RDASRenderer {
    cameraPosition; // Array of pairs of left/right camera positions for each interocular-axis direction.  Each pair is an array of two Vector3s, one for the left camera and one for the right camera.
    screen;
    // Keep one camera for each eye so the viewer gets a stereo baseline.
    screenRectangle;
    maxRecursionDepth = 20; // Maximum recursion depth for bairns
    maxDots = 200000; // Maximum number of dots
    dots = 0;
    maxClans = 20000; // Maximum number of clans (i.e. parent dots) to be drawn
    blobSigma = 1; // Gaussian width of Gaussian-shaped dots ("blobs")
    fadeFactor = 0.9;
    minBrightness = 0.2;
    alreadyThereThreshold = 250; // threshold for determining if a dot is already there (in the range [0, 1])
    
    // Create the stereo pair and let both cameras share the same screen plane.
    constructor(
        cameraPosition = [[new Vector3(-0.03, 0, 0), new Vector3(0.03, 0, 0)]], 
        screen
    ) {
        this.cameraPosition = cameraPosition;
        this.screen = screen;
        this.screenRectangle = new Rectangle(screen.center, screen.hHalfAxis, screen.vHalfAxis, screen.hHalfAxis.length() * 2, screen.vHalfAxis.length() * 2, new Colour([1, 0, 0]) // material is not needed for the screen rectangle
        );
    }
    
    addFamilyDots(pParentDot, // position of parent dot
        rgbComponentIndex, // red = 0, green = 1, blue = 2
        brightness, iIOD, // index of interocular-axis direction
        iCamera, // index of camera that corresponds to interocular-axis direction #iIOD; 0 or 1
        scene, // array of scenes; need at least one per interocular-axis direction
        recursionDepth // current recursion depth
    ) {
        if (recursionDepth > this.maxRecursionDepth || this.dots >= this.maxDots || brightness < this.minBrightness)
            return; // Stop recursion if maximum level reached or if maximum number of dots reached
        // Recursively add a family of bairn dots
        for (let iIOD2 = 0; iIOD2 < this.cameraPosition.length; iIOD2++)
            for (let iCamera2 = 0; iCamera2 < 2; iCamera2++)
                if ((iIOD2 !== iIOD) || (iCamera2 === iCamera)) {
                    this.addBairnDot(pParentDot, rgbComponentIndex, brightness, iIOD2, iCamera2, scene, recursionDepth);
                }
    }
    // calculate the position of a particular bairn dot, given the position of its parent dot, draw it, and
    // calculate repeat recursively
    addBairnDot(pParentDot, // position of parent dot
        rgbComponentIndex, // red = 0, green = 1, blue = 2
        brightness, 
        iIOD, // index of interocular-axis direction
        iCamera, // index of camera that corresponds to interocular-axis direction #iIOD; 0 or 1
        scene, // array of scenes; need at least one per interocular-axis direction
        recursionDepth // current recursion depth
    ) {
        if (this.dots >= this.maxDots)
            return; // Stop recursion if maximum number of dots reached
        // construct the position that corresponds to the bairn
        // first, cast a ray from camera #parentCameraIndex of 
        // interocular-axis-direction #iod to the parent dot position, ...
        const ray1 = new Ray(this.cameraPosition[iIOD][iCamera], pParentDot.sub(this.cameraPosition[iIOD][iCamera]));
        // ... find where it intersects scene #iod, ...
        const sceneHit1 = scene[iIOD].hit(ray1);
        if (!sceneHit1)
            return; // No intersection with scene
        // ... cast a ray from the scene-intersection position to the other camera
        // (#(1-iCamera)) of the interocular-axis direction
        const sceneHit12camera2 = this.cameraPosition[iIOD][1 - iCamera].sub(sceneHit1.p);
        const ray2 = new Ray(sceneHit1.p, sceneHit12camera2);
        // // ... cast a ray from the other camera (#1-parentCameraIndex) of 
        // // interocular-axis-direction #iod to the intersection position, ...
        // const ray2 = new Ray(
        //   this.cameraPosition[iIOD][1-iCamera], 
        //   hitRecord.p.sub(this.cameraPosition[iIOD][1-iCamera])
        // );
        // ... and find its intersection with the autostereogram screen plane.  Its position is the position of the bairn dot.
        const screenHit = this.screenRectangle.tphvHit(ray2);
        // Check that the bairn-dot position is on the screen plane and within the screen bounds
        if (!screenHit)
            return; // No intersection with screen plane
        // also check that there isn't some other intersection with the scene between the scene-intersection position
        // and the second eye
        const sceneHit2 = scene[iIOD].hit(ray2);
        if (sceneHit2 && sceneHit2.t < sceneHit12camera2.length()) {
            // console.log("Skipping bairn dot at ("+this.screen.h2i(screenHit.h)+", "+this.screen.v2j(screenHit.v)+") because of obstruction");
            return; // There is an intersection with the scene before reaching the eye
        }
        // check if there is already a blob there
        if (
            this.screen.getRGBComponent(screenHit.h, screenHit.v, rgbComponentIndex) 
            >=
            255*brightness*this.alreadyThereThreshold
            //this.alreadyThereThreshold // 255*this.minBrightness
        ) {
            // console.log("Skipping bairn dot at ("+this.screen.h2i(screenHit.h)+", "+this.screen.v2j(screenHit.v)+") because there is already a blob there (brightness "+this.screen.getRGBComponent(screenHit.h, screenHit.v, rgbComponentIndex)+" >= "+255*brightness*this.alreadyThereThreshold+")");
            return; // There is already a blob there (brightness > this.alreadyThereThreshold), so skip this bairn dot
        }
        // Draw the bairn dot at the calculated position
        // this.screen.placeDot(screenHit.h, screenHit.v, colour);
        this.screen.placeBlob(screenHit.h, screenHit.v, rgbComponentIndex, brightness, this.blobSigma);
        this.dots++;
        this.addFamilyDots(screenHit.p, // position of parent dot
        rgbComponentIndex, // red = 0, green = 1, blue = 2 
        brightness * this.fadeFactor, iIOD, // index of interocular-axis direction
        iCamera, // index of camera that corresponds to interocular-axis direction #iIOD; 0 or 1
        scene, // array of scenes; need at least one per interocular-axis direction
        recursionDepth + 1 // current recursion depth
        );
    }

    render(
        scene // array of scenes; need at least one per interocular-axis direction
    ) {
        if (scene.length < this.cameraPosition.length) {
            alert("Each interocular-axis direction requires its own scene.  Currently there are " + this.cameraPosition.length + " interocular-axis directions, but only " + scene.length + " scenes.");
            return;
        }
        this.dots = 0;
        // uncomment this to place first dot in centre of canvas
        // let h=0;
        // let v=0;
        for (let d = 0; d < this.maxClans && this.dots < this.maxDots; d++) {
            // comment this out to place first dot in centre of canvas
            // Randomly choose a position on the screen for the parent dot
            const h = Math.random() * 2 - 1; // horizontal position in normalized device coordinates [-1, 1]
            const v = Math.random() * 2 - 1; // vertical position in normalized device coordinates [-1, 1]

            // Randomly choose a color for the dot
            const rgbComponentIndex = Math.floor(Math.random() * 3); // 0 for red, 1 for green, 2 for blue
            // initial brightness of the dot
            const brightness = 1; // in the range [0, 1]
            // this.screen.placeBlob(h, v, color, this.blobSigma);
            this.screen.placeBlob(h, v, rgbComponentIndex, brightness, this.blobSigma);
            // this.screen.placeDot(h, v, color);
            const pDot = this.screen.hv2World(h, v);
            this.addFamilyDots(pDot, // position of parent dot
                rgbComponentIndex, // red = 0, green = 1, blue = 2 
                brightness * this.fadeFactor, // initial brightness
                -1, // -1 means no bairns excluded
                -1, // -1 means no bairns excluded
                scene, 1 // current recursion depth
            );
            // uncomment this to place first dot in centre of canvas
            // // Randomly choose a position on the screen for the parent dot
            // h = Math.random() * 2 - 1; // horizontal position in normalized device coordinates [-1, 1]
            // v = Math.random() * 2 - 1; // vertical position in normalized device coordinates [-1, 1]
        }
        this.screen.showImage();
        // ctx.putImageData(image, 0, 0);
    }
}
