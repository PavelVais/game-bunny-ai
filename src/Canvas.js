export class Canvas {
    constructor(color, width, height) {
        this.color = color;
        this.width = width;
        this.height = height;
    }

    // Method to display canvas information
    display() {
        console.log(`Canvas Color: ${this.color}, Width: ${this.width}, Height: ${this.height}`);
    }

    // Additional methods to manipulate the canvas can be added here
}
