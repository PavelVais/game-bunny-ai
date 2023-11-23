import { Platform } from "./Platform"; // Předpokládám, že třída Platform je uložena v souboru 'Platform.js'
import { Coordinations } from "../utils/Coordinations";

const { Body } = require("matter-js");

export class MovablePlatform extends Platform {
    /**
     * Creates a new instance of the constructor.
     *
     * @param {number} x - The x-coordinate of the object.
     * @param {number} y - The y-coordinate of the object.
     * @param {Array<Waypoint>} waypoints - An array of waypoints.
     */
    constructor(x, y, waypoints) {
        super(x, y, { isStatic: true });
        this.waypoints = waypoints;
        this.currentWaypointIndex = 0;
    }

    update() {
        const currentWaypoint = this.waypoints[this.currentWaypointIndex];
        const nextWaypointIndex = (this.currentWaypointIndex + 1) % this.waypoints.length;
        const nextWaypoint = this.waypoints[nextWaypointIndex];

        const direction = Coordinations.directionTo(this.body.position, nextWaypoint);
        const distanceToNextWaypoint = Coordinations.distanceBetween(this.body.position, nextWaypoint);

        if (distanceToNextWaypoint > currentWaypoint.speed) {
            Body.translate(this.body, {
                x: direction.x * currentWaypoint.speed,
                y: direction.y * currentWaypoint.speed,
            });
        } else {
            this.currentWaypointIndex = nextWaypointIndex;
        }
    }

    draw(render, assetManager) {
        super.draw(render, assetManager);
        // Přidejte zde další grafické prvky, pokud je to potřeba
    }
}
