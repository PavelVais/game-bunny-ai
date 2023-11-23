import * as Neataptic from "neataptic";
import * as Box from "./Box";
import { isNearby } from "./utils/Vector";
import { FitnessManager } from "./Ai/FitnessManager";

export class Agent {
    /**
     * Network or null
     * @param {(Network|undefined)} brain
     */
    constructor(brain) {
        if (brain && !(brain instanceof Neataptic.Network)) {
            throw new Error("Provided brain is not an instance of Network.");
        }

        // Vytvoření nové neuronové sítě pro každého agenta
        /**
         * @type {Network}
         */
        this.brain = brain || this.createBrain();
        this.entity = new Box(50, 300, 50, 50, {
            restitution: 0.5,
        });

        this.bestDistance = Infinity;
        this.timeSinceLastProgress = 0;

        this.fitness = 10;
        this.alive = true;
        this.act(this.initializeInputs());
        this.fitnessManager = new FitnessManager();
    }

    createBrain() {
        // Vytvoření sítě
        const myNetwork = new Neataptic.architect.Perceptron(12, 8, 2);

        // Nastavení aktivační funkce pro každou vrstvu
        myNetwork.nodes.forEach((node) => {
            if (node.type === "hidden" || node.type === "output") {
                node.squash = Neataptic.methods.activation.TANH;
            }
        });
        return myNetwork;
    }
    // Výpočet akce agenta na základě aktuálního stavu
    act(state) {
        // Stav je pole hodnot vstupů pro neuronovou síť
        const output = this.brain.activate(state);
        console.log("🧠", ...output);
        return this.interpretOutputs(output);
    }

    initializeInputs() {
        const inputs = [];
        for (let i = 0; i < 12; i++) {
            // Předpokládejme, že vstupy mají hodnoty v rozsahu -1 až 1
            inputs[i] = Math.random() * 2 - 1;
        }
        return inputs;
    }

    // Upravení fitness skóre agenta na základě jeho výkonu
    updateFitness(currentDistance) {
        //this.fitness += this.fitnessManager.reward(this, currentDistance);
        // Pokud se agent přiblížil k cíli víc než kdykoliv předtím, aktualizujte nejlepší vzdálenost
        if (currentDistance < this.bestDistance) {
            this.bestDistance = currentDistance;
            this.timeSinceLastProgress = 0; // Resetovat čas, protože došlo ke zlepšení
            this.fitness += 0.2; // Increase fitness since it's making
        } else {
            // Zvýšit čas od posledního pokroku
            this.timeSinceLastProgress++;
        }

        // Snížit fitness, pokud nedošlo k pokroku po určitou dobu
        const timeThreshold = 10;
        if (this.timeSinceLastProgress > timeThreshold) {
            this.fitness -= 0.4; // penalty je hodnota, kterou snížíte fitness
            this.timeSinceLastProgress = 0; // Resetovat čas po penalizaci
        }

        //console.log(this.fitness);
    }

    // Klonování agenta pomocí jeho neuronové sítě
    clone() {
        // Serializace mozku do JSON formátu
        const brainJson = this.brain.toJSON();

        // Deserializace JSON zpět do nové instance Network
        const clonedBrain = Neataptic.Network.fromJSON(brainJson);

        // Vytvoření nového agenta s naklonovaným mozkem
        return new Agent(clonedBrain);
    }

    // Mutace agentovy neuronové sítě
    mutate() {
        this.brain.mutate(Neataptic.methods.mutation.FFW); // Nahraďte FFW vaší vybranou mutační metodou
    }

    crossover(other) {
        return new Agent(Neataptic.Network.crossOver(this.brain, other.brain));
    }

    interpretOutputs = (outputs) => {
        // Zde byste měli definovat, jak převést výstupy neuronové sítě na skutečné akce ve vaší hře
        // Příklad: Pokud je první výstup vyšší než určitá prahová hodnota, rozhodneme se skočit
        const threshold = 0.02;
        return {
            up: outputs[0] > threshold,
            left: outputs[1] < -threshold,
            right: outputs[1] > threshold,
        };
    };
}
