export class Infopanel {
    /**
     * Creates a new instance of the Constructor class.
     *
     * @param {Array[int]} boundaries - The boundaries object.
     */
    constructor(boundaries) {
        this.boundaries = boundaries;
        this.messages = [];
    }

    register(label, value) {
        this.messages.push({
            label,
            value,
        });
    }

    /**
     * Draws the infopanel.
     *
     */
    draw(p5) {
        p5.push();
        p5.fill(20);
        p5.stroke(0);
        p5.rectMode(p5.CORNER);
        p5.rect(this.boundaries[0], this.boundaries[1], this.boundaries[2], this.boundaries[3]);
        p5.pop();

        // draw columns by 3 rows of texts
        for (let i = 0; i < this.messages.length; i++) {
            const column = i % 3;
            const message = this.messages[i];
            const value = message.value instanceof Function ? message.value() : message.value;
            p5.push();
            p5.fill(255);
            p5.textSize(14);

            p5.text(
                `${message.label}: ${value}`,
                this.boundaries[0] + 10 + column * (this.boundaries[2] / 3),
                this.boundaries[1] + 20 + Math.floor(i / 3) * 20,
            );
            p5.pop();
        }
    }
}
