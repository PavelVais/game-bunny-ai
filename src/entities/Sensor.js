import { calculateDistance } from "../utils/Vector";

export class Sensor {
    /**
     * Constructor for creating a new instance of a MainEntity object.
     *
     * @param {p5} render - The main entity for the new object.
     */
    constructor(render) {
        /**
         *
         * @type {p5}
         */
        this.render = render;
    }

    draw(firstEntity, secondEntity) {
        // Calculate the direction to the other entity
        let dx = firstEntity.position.x - secondEntity.position.x;
        let dy = firstEntity.position.y - secondEntity.position.y;
        let distance = Math.sqrt(dx * dx + dy * dy) / 2;
        let angleToEntity = Math.atan2(dy, dx);

        let endX1 = secondEntity.position.x + Math.cos(angleToEntity);
        let endY1 = secondEntity.position.y + Math.sin(angleToEntity);

        // Calculate the color based on the distance
        let red = 255 - distance; // The larger the distance, the less red
        if (red < 0) red = 0;

        let green = distance; // The larger the distance, the more green
        if (green > 255) green = 255;

        this.render.stroke(red, green, 0);

        this.render.line(firstEntity.position.x, firstEntity.position.y, endX1, endY1);
        this.render.noStroke();
    }
}
