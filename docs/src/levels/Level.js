import EventDispatcher from "../EventDispatcher.js";
import TopBar from "../TopBar.js";
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
    let w = this.w;
    let h = this.h;

    this.status = new TopBar({
      level: this,
      w: w,
      h: h
    });

    Renderer.add(this.status);
    h -= this.status.height;
    let d = Math.min(w, h);
    let ss = Math.floor(d / Math.max(this.map.length, this.map[0].length));
    let th = this.map.length * ss;
    let tw = this.map[0].length * ss;

    this.table = new TableView({
      x: Math.floor((w - tw) / 2),
      y: this.status.height + Math.floor((h - th) / 2),
      cellWidth: ss,
      cellHeight: ss,
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
  }
  removeListeners() {
    this.table.off("begincheck");
    this.table.off("endcheck");
    this.table.off("validmove");
    this.table.off("collect");
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
  redraw(w, h) {
    this.w = w;
    this.h = h;
    if (this.status) {
      this.status.redraw(w, h);
      h -= this.status.height;
      let d = Math.min(w, h);
      let ss = Math.floor(d / Math.max(this.map.length, this.map[0].length));
      let th = this.map.length * ss;
      let tw = this.map[0].length * ss;

      if (this.table) {
        this.table.x = Math.floor((w - tw) / 2);
        this.table.y = this.status.height + Math.floor((h - th) / 2);
        this.table.redraw(ss, ss);
      }
    }
  }
  destroy() {
    this.removeListeners();
    this.status.destroy();
    delete this.status;
    this.table.destroy();
    delete this.table;
  }
}
