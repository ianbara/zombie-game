import * as PIXI from "pixi.js";
import Victor from "victor";
import { zombies } from "./globals";

export default class Zombie {
  constructor({ app, player }) {
    this.app = app;
    this.player = player;
    this.speed = 1;
    let randomSpawnPointResult = this.randomSpawnPoint();

    // Pick random zombie name;
    let zombieName = zombies[Math.floor(Math.random() * zombies.length)];
    this.speed = zombieName === "quickzee" ? 1 : 0.25;

    let sheet = PIXI.Loader.shared.resources[`assets/${zombieName}.json`].spritesheet;

    this.die = new PIXI.AnimatedSprite(sheet.animations["die"]);
    this.attack = new PIXI.AnimatedSprite(sheet.animations["attack"]);
    this.zombie = new PIXI.AnimatedSprite(sheet.animations["walk"]);
    this.zombie.animationSpeed = zombieName === "quickzee" ? 0.2 : 0.1;
    this.zombie.play();
    this.zombie.anchor.set(0.5);
    this.zombie.position.set(randomSpawnPointResult.x, randomSpawnPointResult.y);
    this.audio = new Audio("./assets/squelch.mp3");

    app.stage.addChild(this.zombie);
  }

  update(delta) {
    let zombieVictor = new Victor(this.zombie.position.x, this.zombie.position.y);
    let playerVictor = new Victor(this.player.position.x, this.player.position.y);

    // Attack player
    if (zombieVictor.distance(playerVictor) < this.player.width / 2) {
      this.attackPlayer();
      return;
    }

    let direction = playerVictor.subtract(zombieVictor);
    let velocity = direction.normalize().multiplyScalar(this.speed * delta); // convert direction vector to unit vector (always have magnitude of 1)

    this.zombie.scale.x = velocity.x < 0 ? 1 : -1;

    // console.log(`set zombie ${this.zombie.position.x} / ${this.zombie.position.y}`)
    this.zombie.position.set(
      this.zombie.position.x + velocity.x,
      this.zombie.position.y + velocity.y
    );
  }

  attackPlayer() {
    if (this.attacking) return;

    this.attacking = true;
    this.attackInterval = setInterval(() => this.player.attack(), 500);
    this.zombie.textures = this.attack.textures;
    this.zombie.animationSpeed = 0.1;
    this.zombie.play();
  }

  kill() {
    this.audio.currentTime = 0; // set audio clip to 0 to play imediatly
    this.audio.play();

    // Play fancy animations
    this.zombie.textures = this.die.textures;
    this.zombie.loop = false;
    this.zombie.onComplete = () => {
      setTimeout(() => this.app.stage.removeChild(this.zombie), 30000)
    }
    this.zombie.play();
    this.zombie.zIndex = -1;

    clearInterval(this.attackInterval);
  }

  get position() {
    return this.zombie.position;
  }

  randomSpawnPoint() {
    // Random int between 0 and 3 inclusive
    const edge = Math.floor(Math.random() * 4);
    let spawnPoint = new Victor(0, 0);
    let canvasSize = this.app.screen.width;

    switch (edge) {
      case 0:
        // Top
        spawnPoint.x = canvasSize * Math.random();
        break;
      case 1:
        // Right
        spawnPoint.x = canvasSize;
        spawnPoint.y = canvasSize * Math.random();
        break;
      case 2:
        // Bottom
        spawnPoint.x = canvasSize * Math.random();
        spawnPoint.y = canvasSize;
        break;
      default:
        // Left
        spawnPoint.x = 0;
        spawnPoint.y = canvasSize * Math.random();
        break;
    }

    return spawnPoint;
  }
}