import * as PIXI from "pixi.js";
import Victor from "victor";

export default class Shooting {
  constructor({ app, player }) {
    this.app = app;
    this.player = player;
    this.bulletSpeed = 4;
    this.bullets = [];
    this.bulletRadius = 8;
    this.maxBullets = 3; // Maybe for machine gun
    this.audio = new Audio("./assets/shoot.mp3");
  }

  fire() {
    this.audio.currentTime = 0; // set audio clip to 0 to play imediatly
    this.audio.play();

    // Tidy up bullets, remove oldest bullet
    if (this.bullets.length >= this.maxBullets) {
      let b = this.bullets.shift();
      this.app.stage.removeChild(b);
    }

    // remove bullets off stage from the stage
    this.bullets.forEach(b => this.app.stage.removeChild(b));

    // Remove bullets if they leave the screen
    this.bullets = this.bullets.filter(
      b =>
        Math.abs(b.position.x) < this.app.screen.width &&
        Math.abs(b.position.y) < this.app.screen.height
    );
    this.bullets.forEach(b => this.app.stage.addChild(b));

    const bullet = new PIXI.Sprite(
      PIXI.Loader.shared.resources["bullet"].texture
    );
    bullet.anchor.set(0.5);
    bullet.scale.set(0.2);
    bullet.position.set(this.player.position.x, this.player.position.y);
    bullet.rotation = this.player.rotation;



    const angle = this.player.rotation - Math.PI / 2;
    bullet.velocity = new Victor(
      Math.cos(angle), Math.sin(angle))
      .multiplyScalar(this.bulletSpeed);
    this.bullets.push(bullet);
    this.app.stage.addChild(bullet);
    console.log(this.bullets.length, this.app.stage.children.length);
  }

  set shoot(shooting) {
    if (shooting) {
      this.fire();
      this.interval = setInterval(
        () => this.fire(), 500);
    } else {
      clearInterval(this.interval);
    }
  }

  update(delta) {
    this.bullets.forEach((bullet) => {
      bullet.position.set(
        bullet.position.x + bullet.velocity.x * delta,
        bullet.position.y + bullet.velocity.y * delta
      )
    })
  }
}