import { Agent } from "../Agent";
import { calculateDistance, isNearby } from "../utils/Vector";
import * as Matter from "matter-js";
import { Sensor } from "../entities/Sensor";
import { round } from "../utils/Numeric";

/**
 * This class should store everything about ai simulations.
 * agents, methods like "shouldIRestart" and "updateFitness" should be here
 *
 */
export class Environment {
    /**
     * Creates a new population with the given population size.
     *
     * @param {p5} render
     * @param {Infopanel} infoPanel
     */
    constructor(render, infoPanel) {
        this.populationSize = 0;
        this.sensors = new Sensor(render);
        /**
         *
         * @type {Agent[]}
         */
        this.agents = [];
        this.generation = 0;
        this.bestFitness = -Infinity;
        this.bestAgent = null;
        /**
         * @type {Infopanel}
         */
        this.infoPanel = infoPanel;
        this.infoPanel.register("Best Fitness", () => round(this.bestFitness, 2));
        this.infoPanel.register("Agents alive", () => this.agents.filter((agent) => agent.alive).length);
    }

    generateAgents = (populationSize) => {
        this.populationSize = populationSize;
        for (let i = 0; i < populationSize; i++) {
            this.agents.push(new Agent());
        }
    };

    simulate = (p, goal, platforms) => {
        for (let agent of this.agents) {
            if (!agent.alive) {
                continue;
            }

            const nearbyObjects = this.detectObjects(agent, platforms);
            const stateForAgent = this.getStateForAgent(agent, goal, nearbyObjects);
            const actions = agent.act(Object.values(stateForAgent));
            agent.updateFitness(stateForAgent.distance);
            agent.entity.movement(p, actions);
        }
    };

    draw = (agent, platforms) => {
        for (let agent of this.agents) {
            if (!agent.alive) {
                continue;
            }

            const nearbyObjects = this.detectObjects(agent, platforms);
            for (let obstacle of nearbyObjects) {
                this.sensors.draw(agent.entity.body, obstacle);
            }
        }
    };

    evolve = () => {
        if (this.agents.length === 0) {
            return;
        }

        this.cleanDeadAgents();
        this.evaluateFitness();
        this.selectAndReproduce();
        this.mutateAgents();
        this.generation++;
        // console.log(`Generation: ${this.generation}, Best fitness: ${this.bestFitness}`);
    };

    // Method to evaluate agents and find the best one
    evaluateFitness() {
        let bestAgent = this.agents.reduce((max, agent) => (agent.fitness > max.fitness ? agent : max), this.agents[0]);

        this.bestFitness = bestAgent.fitness;
        this.bestAgent = bestAgent.clone();
    }

    // Metoda pro výběr nejlepších agentů a jejich reprodukci
    selectAndReproduce() {
        // Třiďte agenty podle fitness
        this.agents.sort((a, b) => b.fitness - a.fitness);

        // Přímý přenos některých nejlepších agentů (elitismus)
        //let newAgents = this.agents.slice(0, this.populationSize * 0.1); // 10% elitism
        let newAgents = [];

        // Reprodukce zbytku
        while (newAgents.length < this.populationSize) {
            // Vyberte dva rodiče
            let parent1 = this.selectParent();
            let parent2 = this.selectParent();

            // Vytvoření potomka křížením
            let childAgent = parent1.crossover(parent2);

            newAgents.push(childAgent);
        }

        this.agents = newAgents;
    }

    // Metoda pro aplikaci mutací
    mutateAgents() {
        // Aplikujte mutace na každého agenta s určitou pravděpodobností
        for (let agent of this.agents) {
            if (Math.random() < 0.2) {
                agent.mutate();
            }
        }
    }

    /**
     *
     * "Ranked based selection" - see https://en.wikipedia.org/wiki/Fitness_proportionate_selection
     * Selects a parent agent based on their fitness ranking.
     * @returns {Agent} The selected parent agent.
     */
    selectParent() {
        // Nejprve seřaďte agenty podle jejich fitness
        let sortedAgents = this.agents.slice().sort((a, b) => a.fitness - b.fitness);
        let sumOfRanks = (sortedAgents.length * (sortedAgents.length + 1)) / 2;
        let threshold = Math.random() * sumOfRanks;
        let runningSum = 0;

        for (let i = 0; i < sortedAgents.length; i++) {
            runningSum += i + 1; // Přičítáme 1, protože rank začíná od 1
            if (runningSum > threshold) {
                return sortedAgents[i];
            }
        }
    }

    detectObjects = (agent, platforms) => {
        let nearbyObjects = [];
        platforms.forEach((platform) => {
            if (isNearby(agent.entity.body, platform, 200)) {
                nearbyObjects.push(platform);
            }
        });
        return nearbyObjects;
    };

    /**
     * Retrieves the state for the given agent.
     * // Získejte stav hry pro agenta, např.:
     *  // - Pozice boxu: [box.body.position.x, box.body.position.y]
     *  // - Rychlost boxu: [box.body.velocity.x, box.body.velocity.y]
     *  // - Vzdálenost od cíle: [goal.position.x - box.body.position.x, goal.position.y - box.body.position.y]
     *  // - nejblizsi platforma: [platforms[n].position.x - box.body.position.x, platforms[n].position.y - box.body.position.y]
     *  // - Je box ve vzduchu?: [box.isInAir ? 1 : 0]
     * @param {Agent} agent - The agent object.
     * @param {Matter.Body} goal
     * @param {Array<Matter.Body>} nearbyObjects
     * @returns {Object} - The state for the given agent.
     * @property {number} positionX - The x-position of the agent's entity.
     * @property {number} positionY - The y-position of the agent's entity.
     * @property {number} velocityX - The x-velocity of the agent's entity.
     * @property {number} velocityY - The y-velocity of the agent's entity.
     * @property {number} distance - The calculated distance of the agent's entity.
     * @property {number} isInAir - A flag indicating if the agent's entity is in the air (1 if true, 0 otherwise).
     */
    getStateForAgent = (agent, goal, nearbyObjects) => {
        const distance = calculateDistance(
            goal.position.x,
            goal.position.y,
            agent.entity.body.position.x,
            agent.entity.body.position.y,
        );

        return {
            positionX: agent.entity.body.position.x,
            positionY: agent.entity.body.position.y,
            velocityX: agent.entity.body.velocity.x,
            velocityY: agent.entity.body.velocity.y,
            distance: distance,
            isInAir: agent.entity.isInAir() ? 1 : 0,
            object1X: nearbyObjects[0] ? nearbyObjects[0].position.x : 0,
            object1Y: nearbyObjects[0] ? nearbyObjects[0].position.y : 0,
            object2X: nearbyObjects[1] ? nearbyObjects[1].position.x : 0,
            object2Y: nearbyObjects[1] ? nearbyObjects[1].position.y : 0,
            object3X: nearbyObjects[2] ? nearbyObjects[2].position.x : 0,
            object3Y: nearbyObjects[2] ? nearbyObjects[2].position.y : 0,
        };
    };

    cleanDeadAgents() {
        this.agents = this.agents.filter((agent) => agent.alive);
    }
}
