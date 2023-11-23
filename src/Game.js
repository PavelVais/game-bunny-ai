import * as p5 from "p5";
import * as Matter from "matter-js";
import Box from "./Box";
import Manager from "./Manager";
import { AssetManager } from "./Assetmanager";
import { SeededRandom } from "./utils/SeedRandom";
import { Canvas } from "./Canvas";
import { Wall } from "./Wall";
import { Environment as AiEnvironment } from "./Ai/Environment";
import { Sensor } from "./entities/Sensor";
import { Infopanel } from "./utils/Infopanel";
import { Goal } from "./entities/Goal";
import { FpsMeter } from "./engine/FpsMeter";
import { Platform } from "./entities/Platform";
import { isOverlappingSome } from "./utils/CollisionUtils";
import { MovablePlatform } from "./entities/MovablePlatform";
import { Waypoint } from "./entities/Wapoint";

const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Events = Matter.Events;
const Constraint = Matter.Constraint;

const aiAgents = 10;
let engine;
let bunny, ground;
let goal;
const platforms = [];
let movablePlatforms = [];
let won = false;
const fps = new FpsMeter();
let assetManager;
const canvas = new Canvas([20, 20, 20], 1200, 600);
let drawCount = 0;
const infoPanel = new Infopanel([30, 30, 1200, 60]);
let aiEnvironment;
let loaded = false;
/**
 * @var {SeededRandom} seedRandom
 */
let seedRandom;
/**
 * @var {Manager} manager
 */
let manager;

export function init(seed) {
    new p5(application);
    seedRandom = new SeededRandom(seed);
}

const application = (p) => {
    p.setup = () => setup(p);
    p.draw = () => {
        drawCount++;
        update(p, drawCount, manager, aiEnvironment, engine);
        return draw(p, drawCount);
    };
};

async function preload(p) {
    // Load all textures
    assetManager = new AssetManager(p);
    return assetManager.loadTextures({
        box: "assets/sprites/bunny.png",
        goal: "assets/sprites/carrots.png",
        background: "assets/sprites/bg.png",
    });
}

/**
 * Sets up the game environment and initializes the objects.
 *
 * @param {p5} p - The p5.js instance.
 */
async function setup(p) {
    await preload(p);
    aiEnvironment = new AiEnvironment(p, infoPanel);
    engine = Engine.create();
    manager = new Manager(engine);
    manager.register(infoPanel);
    aiEnvironment.generateAgents(aiAgents);
    p.createCanvas(canvas.width, canvas.height);

    bunny = new Box(50, 300, 50, 50, {
        isStatic: false,
        restitution: 0.5,
        label: "player",
    });
    const walls = [
        new Wall(0, 0, 20, canvas.height), // Left
        new Wall(0, 0, canvas.width, 20), // Top
        new Wall(canvas.width - 20, 0, 20, canvas.height),
        new Wall(0, canvas.height - 20, canvas.width, 20),
    ];
    goal = new Goal(1050, 450, { isStatic: true });
    movablePlatforms = [
        new MovablePlatform(100, 550, [
            new Waypoint(100, 550, 1),
            new Waypoint(900, 550, 1),
            new Waypoint(800, 300, 1),
        ]),
        // new MovablePlatform(200, 200, [new Waypoint(400, 400, 0.1), new Waypoint(500, 300, 0.1)]),
    ];

    World.add(engine.world, [
        bunny.body,
        goal.body,
        ...walls.map((w) => w.body),
        ...aiEnvironment.agents.map((a) => a.entity.body),
        ...movablePlatforms.map((p) => p.body),
    ]);

    // Generate n random platforms to jump on. Make sure they dont overlap - make inner function
    while (platforms.length < 0) {
        generatePlatforms();
    }

    function generatePlatforms() {
        const x = seedRandom.randomInt(30, canvas.width - 140);
        const y = seedRandom.randomInt(100, canvas.height - 40);

        const platform = new Platform(x, y);

        if (
            !isOverlappingSome(
                platform.body,
                platforms.map((p) => p.body),
            )
        ) {
            platforms.push(platform);
            World.add(engine.world, platform.body);
        }
    }

    // Přidání posluchače událostí pro kolizní události
    Matter.Events.on(engine, "collisionStart", function (event) {
        const pairs = event.pairs;

        // Procházení všech párů, které mají kolizi
        for (let i = 0, j = pairs.length; i !== j; ++i) {
            const pair = pairs[i];

            // Pokud jeden z těles je senzor 'groundSensor' a druhý je 'ground', pak 'box' není ve vzduchu
            if (
                (pair.bodyA.label === "groundSensor" && pair.bodyB.label === "ground") ||
                (pair.bodyA.label === "ground" && pair.bodyB.label === "groundSensor")
            ) {
                bunny.isInAir = false;
                break;
            }
        }
    });

    // Posluchač pro události, kdy kolize stále trvá
    Matter.Events.on(engine, "collisionEnd", function (event) {
        const pairs = event.pairs;

        // Kontrola, zda 'box' už není v kolizi s 'ground'
        for (let i = 0, j = pairs.length; j !== i; ++i) {
            const pair = pairs[i];

            if (
                (pair.bodyA.label === "groundSensor" && pair.bodyB.label === "ground") ||
                (pair.bodyA.label === "ground" && pair.bodyB.label === "groundSensor")
            ) {
                bunny.isInAir = true;
                break;
            }
        }
    });

    // Collision detection
    const boxTargetCollision = manager.getPairKey(bunny.body, goal.body);

    manager.onCollision(boxTargetCollision, () => {
        won = true;
    });

    manager.onPartlyCollision(
        bunny.body,
        () => {
            Body.scale(bunny.body, 1.2, 0.8);
        },
        () => {
            Body.scale(bunny.body, 1 / 1.2, 1 / 0.8);
        },
    );

    manager.onPartlyCollision(
        bunny.groundSensor,
        () => {
            bunny.groundSensor.isColliding = true;
        },
        () => {
            bunny.groundSensor.isColliding = false;
        },
    );

    infoPanel.register("Generation", () => aiEnvironment.generation);
    infoPanel.register("FPS", () => fps.getFps());
    manager.register(walls);
    manager.register(goal);
    manager.register(platforms);
    manager.register(movablePlatforms);
    manager.register(bunny);
    manager.register(aiEnvironment.agents.map((a) => a.entity));
    loaded = true;
}

/**
 * Update the game state.
 */
function update(p, drawCount, manager, aiEnvironment, engine) {
    if (!loaded) {
        return;
    }
    manager.update(p, engine.world);
    fps.update();
    conditionallyEvolve(drawCount, manager, aiEnvironment, engine);
}

/**
 * Draws the game environment.
 *
 * @typedef {p5} p - The p5.js library instance.
 * @typedef {number} drawCount - The number of frames that have been drawn since the start of the game
 */
export function draw(p, drawCount) {
    if (!loaded) {
        return;
    }
    Engine.update(engine);
    const platformEntities = platforms.map((a) => a.body);

    if (drawCount % 50 === 0) {
        aiEnvironment.simulate(p, goal.body, platformEntities);
    }

    p.background(0);

    aiEnvironment.draw(goal.body, platformEntities);

    p.fill(255);

    p.rectMode(p.CORNER);
    p.image(assetManager.getTexture("background"), 20, 100, canvas.width, canvas.height - 20); // Draw the image at the transformed coordinates

    const sensor = new Sensor(p);
    for (const platform of platforms) {
        // sensor.draw(bunny.body, platform);
    }

    manager.draw(p, assetManager);

    if (won) {
        p.fill("red");
        p.textSize(32);
        p.text("You Won!", 350, 200);

        // Draw "confetti"
        for (let i = 0; i < 50; i++) {
            const x = p.random(p.width);
            const y = p.random(p.height);
            p.fill(p.random(255), p.random(255), p.random(255));
            p.ellipse(x, y, 10, 10);
        }
    }
}

/**
 * Evolves the AI environment by updating the agent entities
 *
 * @param {Manager} manager - The manager object responsible for managing the AI environment
 * @param {Environment} aiEnvironment - The AI environment object containing the agents
 *
 * @return {undefined}
 */
function evolveAIEnvironment(manager, aiEnvironment) {
    manager.unregister(aiEnvironment.agents.map((a) => a.entity));
    World.remove(
        engine.world,
        aiEnvironment.agents.map((a) => a.entity.body),
    );
    aiEnvironment.evolve();
    manager.register(aiEnvironment.agents.map((a) => a.entity));
    World.add(
        engine.world,
        aiEnvironment.agents.map((a) => a.entity.body),
    );
}

function conditionallyEvolve(drawCount, manager, aiEnvironment, engine) {
    // every 5 seconds, evolve the population
    if (drawCount % 300 === 0) {
        evolveAIEnvironment(manager, aiEnvironment);
    }
}
