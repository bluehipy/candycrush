import Level from "./Level.js";
export default class LevelTwo extends Level {
  beforeInit() {
    this.map = [
      [0, 1, 2, 3, 4, 5, 0, 1],
      [0, 0, 1, 1, 0, 0, 2, 2],
      [1, 1, 2, 2, 1, 1, 3, 3],
      [1, 1, 2, null, null, 1, 3, 3],
      [1, 1, 2, null, null, 1, 3, 3],
      [1, 1, 2, 2, 1, 1, 3, 3],
      [0, 0, 1, 1, 0, 0, 2, 2],
      [0, 1, 2, 3, 4, 5, 0, 1]
    ];

    this.redCandies = 0;
    this.blueCandies = 0;
    this.allowedMoves = 100;
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
      }
      this.blueCandies++;
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
