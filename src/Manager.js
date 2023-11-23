import { Events } from "matter-js";

/**
 * The Manager class
 */
class Manager {
    /**
     * The constructor for the Manager class
     * @param {Object} engine - The engine object
     */
    constructor(engine) {
        this.objects = [];
        this.collisionCallbacks = new Map();
        this.partlyCollisionCallbacks = new Map();
        this.engine = engine;
        Events.on(engine, "collisionStart", (event) => this.handleCollisionsStart(event));
        Events.on(engine, "collisionEnd", (event) => this.handleCollisionsEnd(event));
    }

    /**
     * Register an object with the manager
     * @param {Object|Array<Object>} obj - The object to be registered
     */
    register(obj) {
        if (Array.isArray(obj)) {
            for (const o of obj) {
                this.objects.push(o);
            }
        } else {
            this.objects.push(obj);
        }
    }

    unregister(obj) {
        if (Array.isArray(obj)) {
            this.objects = this.objects.filter((o) => !obj.includes(o));
        } else {
            this.objects = this.objects.filter((o) => o !== obj);
        }
    }

    /**
     * Updates all registered objects. If an object is not alive, it is automatically unregistered.
     * @param {p5} renderer - The renderer object
     * @param {World} renderer - The renderer object
     */
    update(renderer) {
        for (let obj of this.objects) {
            if (typeof obj.alive === "boolean" && !obj.alive) {
                this.unregister(obj);
                continue;
            }

            if (typeof obj.update === "function") {
                obj.update(renderer);
            }
        }
    }

    /**
     * Draws all registered objects
     */
    draw(renderer, assetManager) {
        for (let obj of this.objects) {
            if (typeof obj.draw === "function") {
                obj.draw(renderer, assetManager);
            }
        }
    }

    /**
     * Registers a collision event between two objects
     * @param {string} pairKey - Unique identifier for the pair of objects
     * @param {Function} callback - The callback to be executed when a collision occurs
     */
    onCollision(pairKey, callback) {
        this.collisionCallbacks.set(pairKey, callback);
    }

    /**
     * Registers callbacks for partly collision events between this object and another object.
     *
     * @param {any} object - The other object involved in the collision.
     * @param {function} onStartCallback - The function to be called when the collision starts.
     * @param {function} onEndCallback - The function to be called when the collision ends.
     *
     * @return {void}
     */
    onPartlyCollision(object, onStartCallback, onEndCallback) {
        this.partlyCollisionCallbacks.set(object, [onStartCallback, onEndCallback]);
    }

    /**
     * Handles the collision event
     * @param {Object} event - The event object
     */
    handleCollisionsStart(event) {
        const { pairs } = event;
        for (const pair of pairs) {
            const pairKey = this.getPairKey(pair.bodyA, pair.bodyB);
            if (this.collisionCallbacks.has(pairKey)) {
                const callback = this.collisionCallbacks.get(pairKey);
                callback(pair);
            }

            for (let object of this.partlyCollisionCallbacks.keys()) {
                if ((pair.bodyA === object || pair.bodyB === object) && this.partlyCollisionCallbacks.get(object)[0]) {
                    const callback = this.partlyCollisionCallbacks.get(object)[0];
                    callback(pair);
                }
            }
        }
    }

    handleCollisionsEnd(event) {
        const { pairs } = event;
        for (const pair of pairs) {
            for (let object of this.partlyCollisionCallbacks.keys()) {
                if ((pair.bodyA === object || pair.bodyB === object) && this.partlyCollisionCallbacks.get(object)[1]) {
                    const callback = this.partlyCollisionCallbacks.get(object)[1];
                    callback(pair);
                }
            }
        }
    }

    /**
     * Generates a unique key for the body pair
     * @param {Object} bodyA - The first body object
     * @param {Object} bodyB - The second body object
     * @returns {string} The unique key for the two body objects
     */
    getPairKey(bodyA, bodyB) {
        const ids = [bodyA.id, bodyB.id].sort();
        return ids.join("_");
    }
}

export default Manager;
