import * as Matter from "matter-js";

let Bodies = Matter.Bodies;

// Abstract properties of FireParticle
const RADIUS = 5;
const PARTICLE_COLOR = [255, 100, 0, 200];
const FORCE_APPLIED = { x: 1, y: -0.05 };

export class FireParticle {
    constructor(x, y, vx, vy) {
        this.body = Bodies.circle(x, y, RADIUS, { frictionAir: 0.01 });
        this.body.velocity.x = vx;
        this.body.velocity.y = vy;
        this.life = 255;
    }

    // This method updates the properties for simulation
    update() {
        // Apply upward force
        Matter.Body.applyForce(this.body, this.body.position, FORCE_APPLIED);
        // Decrease life
        if (this.life > 0) {
            this.life -= 1;
        }
    }

    // This method draws the Particle
    show(p) {
        if (this.life <= 0) {
            return;
        }
        p.fill(...PARTICLE_COLOR); // Apply color fill to the Particle
        p.noStroke(); // No border for the Particle
        p.ellipse(this.body.position.x, this.body.position.y, RADIUS * 2);
    }

    // This method checks is the Particle is within the drawable canvas
    isOffScreen(p) {
        let pos = this.body.position;
        return pos.y < 0 || pos.y > p.height;
    }
}
