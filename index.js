import * as PIXI from "pixi.js";

import Player from "./player";
import Spawner from "./spawner";
import Zombie from "./zombie";
import { textStyle, subTextStyle, zombies } from "./globals";
import Weather from "./src/weather";
import GameState from "./game-state";

const canvasSize = 400;
const canvas = document.getElementById("mycanvas");
const app = new PIXI.Application({
  view: canvas,
  width: canvasSize,
  height: canvasSize,
  backgroundColor: 0x312a2b,
  resolution: 2,
});

// Set Scalling
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST

// Music
const music = new Audio("./assets/HordeZee.mp3");
music.addEventListener("timeupdate", function () {
  // Tweaks the loop start
  if (this.currentTime > this.duration - 0.2) {
    this.currentTime = 0;
  }
});

// Zombie sounds
const zombieHorde = new Audio("./assets/horde.mp3");
zombieHorde.volume = 0.7; // value between 0 and 1
zombieHorde.addEventListener("timeupdate", function () {
  // Tweaks the loop start
  if (this.currentTime > this.duration - 0.2) {
    this.currentTime = 0;
  }
});

initGame();

async function initGame() {
  app.gameState = GameState.PREINTRO;
  try {
    console.log('loading...');
    await loadAssets();
    console.log('loaded');

    app.weather = new Weather({ app });
    let player = new Player({ app });
    let zombieSpawner = new Spawner({ app, create: () => new Zombie({ app, player }) });

    let gamePreIntroScene = createScene("HordeZee", "Click to Continue");
    let gameStartScene = createScene("HordeZee", "Click to Start");
    let gameOverScene = createScene("HordeZee", "Game Over");

    // delta - No MS since function was last called. Variable.
    app.ticker.add((delta) => {

      if (player.isDead) app.gameState = GameState.GAMEOVER;

      gamePreIntroScene.visible = app.gameState === GameState.PREINTRO;
      gameStartScene.visible = app.gameState === GameState.START;
      gameOverScene.visible = app.gameState === GameState.GAMEOVER;

      switch (app.gameState) {
        case GameState.PREINTRO:
          player.scale = 4;
          break;
        case GameState.INTRO:
          player.scale -= 0.01;
          if (player.scale <= 1) app.gameState = GameState.START;
          break;
        case GameState.RUNNING:
          player.update(delta);
          zombieSpawner.spawns.forEach(zombie => zombie.update(delta));

          bulletHitTest({
            bullets: player.shooting.bullets,
            zombies: zombieSpawner.spawns,
            bulletRadius: 8,
            zombieRadius: 16,
          })
          break;
        default:
          break;
      }
    })
  } catch (error) {
    console.log(error);
    console.log('Load failed');
  }
}

function bulletHitTest({ bullets, zombies, bulletRadius, zombieRadius }) {
  bullets.forEach(bullet => {
    zombies.forEach((zombie, index) => {
      let dx = zombie.position.x - bullet.position.x;
      let dy = zombie.position.y - bullet.position.y;

      // Distance between the 2
      let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < bulletRadius + zombieRadius) {
        zombies.splice(index, 1);
        zombie.kill();
        console.log('bullet collided');
      }
    })
  })
}

function createScene(sceneText, sceneSubText) {
  const sceneContainer = new PIXI.Container();

  const text = new PIXI.Text(sceneText, new PIXI.TextStyle(textStyle));
  text.x = app.screen.width / 2;
  text.y = 0;
  text.anchor.set(0.5, 0);

  const subText = new PIXI.Text(sceneSubText, new PIXI.TextStyle(subTextStyle));
  subText.x = app.screen.width / 2;
  subText.y = 50;
  subText.anchor.set(0.5, 0);

  sceneContainer.zIndex = 1;
  sceneContainer.addChild(text);
  sceneContainer.addChild(subText);
  app.stage.addChild(sceneContainer);
  return sceneContainer;
}

// function startGame() {
//   app.gameStarted = true;
//   app.weather.enableSound();
// }

async function loadAssets() {
  // convert PIXI callback pattern to async/await using promises
  return new Promise((resolve, reject) => {
    zombies.forEach(z => PIXI.Loader.shared.add(`assets/${z}.json`));
    PIXI.Loader.shared.add("assets/hero_male.json");
    PIXI.Loader.shared.add("bullet", "assets/bullet.png");
    PIXI.Loader.shared.add("rain", "assets/rain.png");
    PIXI.Loader.shared.onComplete.add(resolve);
    PIXI.Loader.shared.onError.add(reject);
    PIXI.Loader.shared.load();
  })
}

function clickHandler() {
  switch (app.gameState) {
    case GameState.PREINTRO:
      app.gameState = GameState.INTRO;
      music.play();
      app.weather.enableSound();
      break;
    case GameState.START:
      app.gameState = GameState.RUNNING;
      zombieHorde.play();
      break;
    default:
      break;
  }
}

document.addEventListener("click", clickHandler);