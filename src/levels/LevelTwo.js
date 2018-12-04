import Level from "./Level.js";

export default class LevelTwo extends Level {
  init() {
    return new Promise((resolve, reject) => {
      const fn = () => {
        this.codes = "abcdef".split("");
        this.map = {};
        this.codes = "abcdef".split("");
        this.map = {};
        let dx = 18;
        for (let i = 0; i < 6; i++) {
          let texture = PIXI.loader.resources.candies.texture;
          let rectangle = new PIXI.Rectangle(
            i * 94 + dx,
            191 + dx,
            94 - dx,
            94 - dx
          );
          this.map[this.codes[i]] = new PIXI.Texture(texture, rectangle);
        }

        this.data = [
          "--------------------",
          "--------------------",
          "--------------------",
          "--------------------",
          "--------------------",
          "--------------------",
          "**----------------**",
          "****------------****",
          "******--------******",
          "********----********"
        ];
        resolve();
      };
      if (!PIXI.loader.resources.candies) {
        PIXI.loader.add("candies", "candies.png");
        PIXI.loader.load(() => fn());
      } else {
        fn();
      }
    });
  }
  onStart() {
    this.score = 0;
    this.moves = 0;
    this.startMessage = "Collect 20 red or orange ones in less than 20 moves";
  }
  onSwap() {
    this.moves++;
  }
  onEnd() {}
  onHeartBeat() {}
  successCriteria() {
    return this.score > 20;
  }
  failureCriteria() {
    return this.moves > 20;
  }
  onCollect(cells) {
    cells.forEach(
      cell => (cell.code === "b" || cell.code === "a") && this.score++
    );
  }
}
