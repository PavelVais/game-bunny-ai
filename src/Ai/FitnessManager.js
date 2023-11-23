import { calculateDistance } from "../utils/Vector";

export class FitnessManager {
    constructor() {
        this.bestDistance = Infinity;
        this.timeSinceLastProgress = 0;
    }

    /**
     * Odmeny:
     * Cim blize je cili, tim vice odmeny dostane
     * Cim dele je na stejnem miste, tim vice punishmentu dostane
     *
     * @param {Agent} agent
     * @param goal
     */
    reward(agent, goal) {
        let reward = 0;
        let punishment = 0;

        const distance = calculateDistance(agent.entity.body.x, agent.entity.body.y, goal.x, goal.y);
        if (distance < this.bestDistance) {
            this.bestDistance = distance;
            this.timeSinceLastProgress = 0;
            reward += 2;
        } else {
            this.timeSinceLastProgress++;
            punishment += 1;
        }

        // Snížit fitness, pokud nedošlo k pokroku po určitou dobu
        const timeThreshold = 10;
        if (this.timeSinceLastProgress > timeThreshold) {
            this.fitness -= 0.4; // penalty je hodnota, kterou snížíte fitness
            this.timeSinceLastProgress = 0; // Resetovat čas po penalizaci
        }

        return reward - punishment;
    }
}
