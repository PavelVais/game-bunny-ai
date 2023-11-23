export class AssetManager {
    constructor(p) {
        this.assets = {};
        this.p5 = p;
    }

    // Load a single image asynchronously
    loadTexture(key, path) {
        return new Promise((resolve, reject) => {
            this.assets[key] = this.p5.loadImage(
                path,
                () => {
                    console.log(`${key} loaded successfully.`);
                    resolve(this.assets[key]);
                },
                () => {
                    console.log(`Failed to load ${key}.`);
                    reject(`Failed to load ${key}.`);
                },
            );
        });
    }

    // Get an image
    getTexture(key) {
        return this.assets[key];
    }

    // Load multiple images asynchronously
    async loadTextures(textures) {
        const promises = [];
        for (const key in textures) {
            promises.push(this.loadTexture(key, textures[key]));
        }
        await Promise.all(promises);
    }
}
