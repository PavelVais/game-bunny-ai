// Import Matter.js komponent
import { Coordinations } from "./utils/Coordinations";

const { Body, Bodies } = require("matter-js");

export class Wall {
    constructor(x, y, width, height) {
        console.log(x, y, width, height);
        const centerPos = Coordinations.centerToCorner(x, y, { x: width, y: height });
        this.body = Bodies.rectangle(centerPos.x, centerPos.y, width, height, { isStatic: true });
        this.width = width;
        this.height = height;
    }

    draw(render) {
        const cornerPos = Coordinations.cornerToCenter(this.body, { x: this.width, y: this.height });
        render.rectMode(render.CORNER);
        render.fill(100, 220, 111);
        render.rect(cornerPos.x, cornerPos.y, this.width, this.height);
    }
}
