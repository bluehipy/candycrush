export default class TopBar extends PIXI.Container {
  constructor(config) {
    super();
    this.goal = null;
    this.score = null;
    this.level = null;
    Object.assign(this, config);
    this.init();
  }
  init() {
    this.addListeners();
    this.redraw(this.w, this.h);
  }
  addListeners() {
    this.level.on("scorechange", this.redraw, this);
    this.level.on("moveschange", this.redraw, this);
    this.level.on("goalchange", this.redraw, this);
    this.game.on("resize", this.resize, this);
  }
  removeListeners() {
    this.level.off("scorechange", this.redraw, this);
    this.level.off("moveschange", this.redraw, this);
    this.level.off("goalchange", this.redraw, this);
    this.game.off("resize", this.resize, this);
  }
  redraw() {
    this.score && this.score.destroy();
    this.moves && this.moves.destroy();
    this.goal && this.goal.destroy();
    //score sprite
    this.score = new PIXI.Text("score \n" + this.level.getScore(), {
      font: "3em Gamja Flower",
      fill: "orange",
      align: "center"
    });
    this.score.x = this.w - this.score.width - 5;

    // remanining moves
    this.moves = new PIXI.Text("moves \n" + this.level.getRemainingMoves(), {
      font: "3em Gamja Flower",
      fill: "orange",
      align: "center"
    });
    this.moves.x = 5;

    //goal sprite
    this.goal = this.level.renderGoal();
    this.goal.x = (this.game.app.view.width - this.goal.width) / 2;
    this.addChild(this.moves);
    this.addChild(this.score);
    this.addChild(this.goal);
  }
  resize(w, h) {
    this.w = w;
    this.h = h;
    this.redraw();
  }
  destroy() {
    this.removeListeners();
    PIXI.Container.prototype.destroy.call(this);
  }
}
