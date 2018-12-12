import EventDispatcher from "../EventDispatcher.js";
import TableView from "../TableView.js";
export default class Level extends EventDispatcher {
  constructor(config) {
    super();
    Object.assign(this, config);
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
    this.setScore(0);
    this.setMoves(0);
    this.beforeInit();
    this.init();
  }
  then(fn) {
    return this.promise.then(res => fn(res));
  }
  catch(fn) {
    return this.promise.catch(err => fn(err));
  }
  init() {
    let w = Math.min(window.innerWidth, window.innerHeight);
    let ss = Math.floor(w / 10);
    let x = Math.floor((window.innerWidth - 8 * ss) / 2);
    let y = Math.floor((window.innerHeight - 8 * ss) / 2);

    this.table = new TableView({
      x: x,
      y: y,
      cellWidth: ss,
      cellHeight: ss,
      game: this.game,
      textures: this.textures,
      map: this.map
    });
    this.addListeners();
  }

  addListeners() {
    this.table.on("begincheck", this.onBeginCheck.bind(this));
    this.table.on("endcheck", this.onEndCheck.bind(this));
    this.table.on("validmove", this.onValidMove.bind(this));
    this.table.on("collect", this.onCollect.bind(this));
    this.game.on("resize", this.resize, this);
  }
  removeListeners() {
    this.table.off("begincheck");
    this.table.off("endcheck");
    this.table.off("validmove");
    this.table.off("collect");
    this.game.off("resize", this.resize, this);
  }
  beforeInit() {}
  setScore(v) {
    this.score = v;
    this.emit("scorechange", v);
  }
  getScore() {
    return this.score;
  }
  setMoves(v) {
    this.moves = v;
    this.emit("movechange", this.allowedMoves - v);
  }
  getMoves() {
    return this.moves;
  }
  getRemainingMoves() {
    return this.allowedMoves - this.getMoves();
  }
  updateGoal() {
    this.emit("goalchange");
  }
  renderGoal() {}
  onBeginCheck() {}
  onEndCheck() {
    this.checkCriterias();
  }
  onValidMove() {}
  onCollect() {}
  successCriteria() {}
  failureCriteria() {}
  checkCriterias() {
    if (this.started) {
      if (this.successCriteria()) {
        this.end();
        this.resolve(true);
      } else if (this.failureCriteria()) {
        this.end();
        this.reject();
      }
    }
  }
  start() {
    this.started = true;
  }
  end() {
    this.started = false;
  }
  resize(w, h) {
    console.log(`${w} x ${h}`);
    let d = Math.min(w, h);
    let ss = Math.floor(d / 10);
    let th = this.map.length * ss;
    let tw = this.map[0].length * ss;

    if (this.table) {
      this.table.x = Math.floor((w - tw) / 2);
      this.table.y = Math.floor((h - th) / 2);
      this.table.resize(ss, ss);
    }
  }
  destroy() {
    this.removeListeners();
    this.table.destroy();
    delete this.table;
  }
}
