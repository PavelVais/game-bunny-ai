// Import Matter.js komponent
import { Coordinations } from "../utils/Coordinations";

const { Bodies } = require("matter-js");

export class Platform {
    constructor(x, y, options = {}) {
        this.size = { x: 100, y: 20 };
        const centerPos = Coordinations.centerToCorner(x, y, this.size);
        /**
         * @param {Matter.Body}
         */
        this.body = Bodies.rectangle(
            centerPos.x,
            centerPos.y,
            ...Object.values(this.size),
            Object.assign(
                {
                    isStatic: true,
                },
                options,
            ),
        );
    }

    /**
     *
     * @param {p5} render - The renderer used to draw the image.
     * @param {AssetManager} assetManager - The asset manager used to get the box texture.
     */
    draw(render, assetManager) {
        const cornerPos = Coordinations.cornerToCenter(this.body, this.size);
        render.rectMode(render.CORNER);
        render.fill(139, 49, 19);
        render.rect(cornerPos.x, cornerPos.y, this.size.x, this.size.y);
    }
}
