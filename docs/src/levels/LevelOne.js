import Level from "./Level.js";
export default class LevelOne extends Level {
  beforeInit() {
    this.map = [];

    for (let i = 0; i < 8; i++) {
      this.map[i] = [];
      for (let j = 0; j < 8; j++) {
        this.map[i].push(Math.floor(Math.random() * this.textures.length));
      }
    }

    this.redCandies = 0;
    this.blueCandies = 0;
    this.allowedMoves = 50;
  }
  init() {
    Level.prototype.init.call(this);
    Renderer.showMessage("Collect 10 x #0 and 10 x #1", msg => msg.destroy());
  }
  renderGoal() {
    let reds = Math.max(0, 10 - this.redCandies);
    let blues = Math.max(0, 10 - this.blueCandies);
    let msg = `${reds} #0 ${blues} #1`;

    return Renderer.tpl(msg);
  }
  onValidMove() {
    this.setMoves(this.getMoves() + 1);
  }
  onCollect(arr) {
    this.setScore(this.getScore() + arr.length);
    arr.forEach(pos => {
      let cell = this.table.model.get(...pos);
      if (!cell) return;
      if (cell.code === 0) {
        this.redCandies++;
      } else if (cell.code === 1) {
        this.blueCandies++;
      }
    });
    this.updateGoal();
  }
  successCriteria() {
    return this.redCandies >= 10 && this.blueCandies >= 10;
  }
  failureCriteria() {
    return this.getMoves() > this.allowedMoves;
  }
}
