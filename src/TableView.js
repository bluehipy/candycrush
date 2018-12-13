import TableModel from "./TableModel.js";
import TableCell from "./TableCell.js";
import TableController from "./TableController.js";
import Animation from "./CellAnimation.js";
import EventDispatcher from "./EventDispatcher.js";
export default class TableView extends EventDispatcher {
  constructor(config) {
    super();
    Object.assign(this, config);
    this.init();
  }
  init() {
    this.lockCount = 0;
    this.animations = [];
    this.model = new TableModel({
      rowsNo: this.map.length,
      colsNo: this.map[0].length
    });
    this.controller = new TableController(this);
    this.drawBg();
    this.map.forEach((row, rowIndex) =>
      row.forEach((cell, colIndex) =>
        this.model.set(
          rowIndex,
          colIndex,
          this.createCell(rowIndex, colIndex, cell)
        )
      )
    );
  }
  drawBg() {
    let d = this.cellWidth;
    let container = new PIXI.Container();
    this.map.forEach((row, rowIndex) =>
      row.forEach((cell, colIndex) => {
        if (cell !== null) {
          let sq = new PIXI.Graphics();
          sq.lineStyle(1, 0); //0x28c0db
          sq.beginFill(0x7dcddb, 1);
          sq.drawRoundedRect(-d / 2, -d / 2, d, d, 1);
          sq.endFill();
          sq.x = this.getX(colIndex);
          sq.y = this.getY(rowIndex);
          container.addChild(sq);
        }
      })
    );
    this.bg = container;
    Renderer.add(container);
  }
  getX(col) {
    return this.x + this.cellWidth * (0.5 + col);
  }
  getY(row) {
    return this.y + this.cellHeight * (0.5 + row);
  }
  createCell(row, col, cell) {
    if (cell === null) return null;
    let c = new TableCell(this.textures[cell], this.cellWidth, this.cellHeight);
    c.code = cell;
    c.x = this.getX(col);
    c.y = this.getY(row);
    c.lock = this.lock.bind(this);
    c.unlock = this.unlock.bind(this);
    this.controller.registerCell(c);
    Renderer.add(c);
    return c;
  }
  swap(objA, objB) {
    let zIndex = Renderer.maxZIndex();
    Renderer.setZIndex(objA, zIndex);
    return Promise.all([
      new Animation({
        actor: objA,
        endState: {
          y: objB.y,
          x: objB.x
        },
        duration: 15,
        fn: (actor, current, total, start, end) => {
          let mid = total / 2,
            scale = 1 + (current * (total - current)) / (mid * mid) / 2;
          return {
            scale: { x: scale, y: scale }
          };
        }
      }),
      new Animation({
        actor: objB,
        endState: {
          y: objA.y,
          x: objA.x
        },
        duration: 15
      })
    ]);
  }
  remove(cell) {
    return new Animation({
      actor: cell,
      endState: {
        alpha: 0,
        width: cell.width / 4,
        height: cell.height / 4
      },
      duration: 25
    }).then(cell => {
      cell.destroy();
      return cell;
    });
  }
  move(cell, x, y) {
    return new Animation({
      elastic: true,
      ease: "easeOutQuad",
      actor: cell,
      endState: {
        x: x,
        y: y
      },
      duration: this.dist(cell.x, cell.y, x, y)
    });
  }
  dist(a, b, c, d) {
    return Math.round(
      (3 * Math.sqrt((a - c) * (a - c) + (b - d) * (b - d))) / this.cellWidth
    );
  }
  lock() {
    this.lockCount++;
  }
  unlock() {
    this.lockCount--;
    if (!this.isLocked()) {
      this.onUnlock && this.onUnlock();
    }
  }
  isLocked() {
    return this.lockCount > 0;
  }
  redraw(w, h) {
    this.cellWidth = w;
    this.cellHeight = h;
    if (this.isLocked()) {
      this.onUnlock = this.redraw.bind(this, w, h);
    } else {
      // this is way too radical
      this.bg.destroy();
      this.drawBg();
      Renderer.setZIndex(this.bg, 0);
      this.model.each((row, col, cell) => {
        if (cell) {
          cell.x = this.getX(col);
          cell.y = this.getY(row);
          cell.redraw(w, h);
        }
        return true;
      });
    }
  }
  getAnimation(cfg) {
    let anim = new Animation(cfg);
    this.animations.push(anim);
    return anim;
  }
  destroy() {
    this.removeAllListeners();
    this.suspend();
    this.animations.map(anim => anim.destroy());
    this.animations.length = 0;
    this.controller.destroy();
    this.model.removeAllListeners();
    this.model.each((row, col, cell) => cell && cell.destroy());
    this.model.destroy();
    this.bg.destroy();
    delete this.model;
    delete this.controller;
    this.resume();
  }
}
