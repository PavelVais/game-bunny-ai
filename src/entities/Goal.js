// Import Matter.js komponent
const { Body, Bodies } = require("matter-js");

export class Goal {
    constructor(x, y, options) {
        /**
         * @param {Matter.Body}
         */
        this.size = { x: 40, y: 40 };
        this.body = Bodies.rectangle(x, y, ...Object.values(this.size), options);
    }

    /**
     * Draws an image of a box at the given position and with the given angle using the provided renderer and asset manager.
     *
     * @param {any} render - The renderer used to draw the image.
     * @param {AssetManager} assetManager - The asset manager used to get the box texture.
     */
    draw(render, assetManager) {
        // Zde byste použili vykreslovací funkce z knihovny, např. p5.js nebo nativní funkce Canvas API

        render.push(); // Start a new drawing state
        render.translate(this.body.position.x, this.body.position.y); // Move to the position of the box
        render.rotate(this.body.angle); // Rotate by the box's angle
        render.imageMode(render.CENTER); // Center the image at the position
        render.image(assetManager.getTexture("goal"), 0, 0, ...Object.values(this.size)); // Draw the image at the transformed coordinates
        render.pop(); // Restore original state
    }
}
