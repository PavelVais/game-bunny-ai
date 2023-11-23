// Import Matter.js komponent
const { Body, Bodies } = require("matter-js");
const { Coordinations } = require("./utils/Coordinations");

// Pomocná funkce pro lineární interpolaci
function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}

class Box {
    constructor(x, y, width, height, options) {
        options = Object.assign(options, {
            collisionFilter: {
                group: -1,
            },
        });

        const centerPos = Coordinations.centerToCorner(x, y, { x: width, y: height });
        this.groundSensor = Bodies.rectangle(centerPos.x, centerPos.y + height / 2 + 1, width, 2, {
            isSensor: true,
            label: "groundSensor",
            isColliding: false,
        });
        /**
         * @param {Matter.Body}
         */
        this.body = Body.create({
            parts: [Bodies.rectangle(centerPos.x, centerPos.y, width, height, options), this.groundSensor],
        });
        this.width = width;
        this.height = height;
        // Počáteční měřítko
        this.currentScale = { x: 1, y: 1 };
    }

    // Nastavení měřítka boxu a sledování změn
    scale(sx, sy) {
        Body.scale(this.body, sx / this.currentScale.x, sy / this.currentScale.y);
        this.currentScale.x = sx;
        this.currentScale.y = sy;
    }

    // Postupné resetování boxu do původního měřítka
    resetScale() {
        let targetScaleX = lerp(this.currentScale.x, 1, 0.1);
        let targetScaleY = lerp(this.currentScale.y, 1, 0.1);
        this.scale(targetScaleX, targetScaleY);
    }

    // Resetování náklonu boxu po kolizi
    resetAngle() {
        let angle = this.body.angle % (2 * Math.PI);
        if (angle !== 0) {
            Body.setAngularVelocity(this.body, -angle * 0.1);
        }
    }

    isInAir() {
        return !this.groundSensor.isColliding;
    }

    // Aktualizace logiky boxu, volána každý frame
    update(p) {
        this.resetScale();
        this.resetAngle();
        this.movement(p, {
            left: p.keyIsDown(p.LEFT_ARROW),
            right: p.keyIsDown(p.RIGHT_ARROW),
            up: p.keyIsDown(p.UP_ARROW),
        });
        if (this.body.label === "player") {
        }
    }

    // Vykreslení boxu
    /**
     * Draws an image of a box at the given position and with the given angle using the provided renderer and asset manager.
     *
     * @param {any} render - The renderer used to draw the image.
     * @param {AssetManager} assetManager - The asset manager used to get the box texture.
     */
    draw(render, assetManager) {
        // Zde byste použili vykreslovací funkce z knihovny, např. p5.js nebo nativní funkce Canvas API

        let boxTexture = assetManager.getTexture("box");
        render.push(); // Start a new drawing state
        render.imageMode(render.CORNER); // Center the image at the position
        render.image(
            boxTexture,
            this.body.position.x - this.width / 2,
            this.body.position.y - this.height / 2,
            this.width,
            this.height,
        ); // Draw the image at the transformed coordinates
        render.pop(); // Restore original state
    }

    movement = (p, controls) => {
        let horizontalForce = 0;
        let verticalForce = 0;
        const horizontalForceMagnitude = 0.01; // Síla pro horizontální pohyb
        const horizontalForceMagnitudeInJump = 0.006; // Síla pro horizontální pohyb
        const jumpForce = 0.08; // Síla pro skok

        if (controls.left || controls.right) {
            horizontalForce = this.isInAir() ? horizontalForceMagnitudeInJump : horizontalForceMagnitude;

            if (controls.left) {
                horizontalForce *= -1;
            }
        }

        // Skok
        if (controls.up && !this.isInAir()) {
            verticalForce = -jumpForce;
        }

        if (this.isInAir()) {
            horizontalForce *= horizontalForceMagnitudeInJump;
        }

        // Aplikace horizontální a vertikální síly
        if (horizontalForce !== 0 || verticalForce !== 0) {
            Body.applyForce(this.body, this.body.position, { x: horizontalForce, y: verticalForce });
        }
    };
}

module.exports = Box;
