const seedrandom = require("seedrandom");

export class SeededRandom {
    constructor(seed) {
        this.seedRandom = seedrandom(seed);
    }

    // Function to mimic Math.random()
    random() {
        return this.seedRandom();
    }

    // Add other methods that use the seeded random generator as needed
    // For example, a method to get a random integer within a range
    randomInt(min, max) {
        return Math.floor(this.random() * (max - min + 1)) + min;
    }

    // Method to get a random float within a range
    randomFloat(min, max) {
        return this.random() * (max - min) + min;
    }
}
