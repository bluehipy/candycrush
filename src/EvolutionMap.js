import Animation from "./Animation.js";
export default class EvolutionMap extends PIXI.Container {
  constructor(config) {
    super();
    Object.assign(this, config);
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
    this.alpha = 0;
    this.redraw(this.w, this.h);
    this.show();
  }
  show() {
    new Animation({
      actor: this,
      startState: {
        y: -this.height,
        alpha: 0
      },
      endState: {
        y: 0,
        alpha: 1
      },
      duration: 20
    });
  }
  then(cb) {
    return this.promise.then(result => cb(result));
  }
  redraw(w, h) {
    if (this.children.length) {
      this.removeChildren(0, this.children.length).forEach(c => c.destroy());
    }
    let container = new PIXI.Container();
    let map = new PIXI.Sprite(this.texture);
    container.addChild(map);
    let levels = [];
    for (let i = 0; i < this.levels.length; i++) {
      let lvl = this.drawLevel(
        i + 1,
        i === this.currentLevel
          ? 0xff0000
          : i > this.currentLevel
            ? 0xcccccc
            : 0x00ff00
      );
      if (i <= this.currentLevel) {
        lvl.interactive = true;
        lvl.on("tap", this.selectLevel.bind(this, i));
        lvl.on("mousedown", this.selectLevel.bind(this, i));
      }
      container.addChild(lvl);
      lvl.x = this.levels[i][0];
      lvl.y = this.levels[i][1];
    }

    if (w < h || h > 600) {
      container.height = h;
      container.scale.x = container.scale.y;
      container.x = (w - container.width) / 2;
    } else {
      container.height = w;
      container.scale.x = container.scale.y;
      container.rotation = Math.PI / 2;
      container.y = (h - container.width) / 2;
      container.x = w;
    }
    this.addChild(container);
  }
  drawLevel(no, color) {
    let r = 40;
    let lvl = new PIXI.Graphics();
    lvl.lineStyle(10, color, 0.8);
    lvl.beginFill(color, 0.1);
    lvl.drawCircle(r, r, r);
    lvl.endFill();

    return lvl;
  }
  selectLevel(i) {
    this.resolve(i);
  }
  destroy() {
    new Animation({
      actor: this,
      endState: {
        y: -this.height,
        alpha: 0
      },
      startState: {
        y: 0,
        alpha: 1
      },
      duration: 20
    }).then(() => super.destroy());
  }
}
