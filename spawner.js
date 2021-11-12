import GameState from "./game-state";

export default class Spawner {
  constructor({ app, create }) {
    this.app = app;
    const spawnInterval = 1000; // in MS Windows
    this.maxSpawns = 10;
    this.create = create;
    this.spawns = [];
    setInterval(
      () => {
        this.spawn(), spawnInterval;
      });
  }

  spawn() {
    if (this.app.gameState !== GameState.RUNNING) return;
    if (this.spawns.length >= this.maxSpawns) return false;

    let newSpawn = this.create();
    this.spawns.push(newSpawn);
  }
}