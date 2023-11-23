/**
 * Třída pro měření a zobrazení snímků za sekundu (FPS).
 */
export class FpsMeter {
    /**
     * Vytvoří instanci FPSMeter.
     */
    constructor() {
        this.frameCount = 0;
        this.startTime = Date.now();
        this.currentTime = this.startTime;
        this.previousTime = this.startTime;
        this.fps = 0;
    }

    /**
     * Aktualizuje počítadlo snímků a vypočítává FPS.
     */
    update() {
        // Zvýšení počtu snímků
        this.frameCount++;

        // Aktualizace aktuálního času
        this.currentTime = Date.now();

        // Vypočet FPS každou sekundu
        if (this.currentTime - this.previousTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.previousTime = this.currentTime;
        }
    }

    /**
     * @returns {Number}
     */
    getFps() {
        return this.fps;
    }
}
