import Animation from "./Animation.js";
export default class OverlayMsg extends PIXI.Container {
  constructor(msg, w, h) {
    super();
    this.msg = msg;
    this.alpha = 0;
    this.redraw(w, h);
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
  redraw(w, h) {
    let container = this;
    let msg = this.msg;
    this.bg && this.bg.destroy();
    let bg = new PIXI.Graphics();
    this.bg = bg;
    bg.beginFill(0x000000, 0.8);
    bg.drawRect(0, 0, w, h);
    bg.endFill();
    msg.x = (bg.width - msg.width) / 2;
    msg.y = (bg.height - msg.height) / 2;
    container.addChild(bg);
    container.addChild(msg);
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
