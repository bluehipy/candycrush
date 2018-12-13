export default class TableCell extends PIXI.Container {
  constructor(texture, w, h) {
    super();
    this.init(texture, w, h);
  }
  init(texture, w, h) {
    let sprite = new PIXI.Sprite(texture);

    this.addChild(sprite);
    this.interactive = true;
    this.on("touchstart", this.onCellDragStart.bind(this));
    this.on("mousedown", this.onCellDragStart.bind(this));
    this.redraw(w, h);
  }
  onCellDragStart(e) {
    this.startX = e.data.global.x;
    this.startY = e.data.global.y;
    this.on("touchmove", this.onCellDrag.bind(this));
    this.on("mousemove", this.onCellDrag.bind(this));
    this.once("touchend", () => {
      this.off("touchmove");
      this.off("mousemove");
    });
    this.once("mouseup", () => {
      this.off("touchmove");
      this.off("mousemove");
    });
  }
  onCellDrag(e) {
    let dx = e.data.global.x - this.startX;
    let dy = e.data.global.y - this.startY;
    let adx = Math.abs(dx);
    let ady = Math.abs(dy);

    if (adx > this.width / 4 || ady > this.height / 4) {
      this.off("touchmove");
      this.off("mousemove");
      if (adx > ady) {
        this.emit("drag", dx > 0 ? "right" : "left");
      } else {
        this.emit("drag", dy < 0 ? "up" : "down");
      }
    }
  }
  redraw(w, h) {
    let sprite = this.children[0];
    sprite.width = w;
    sprite.scale.y = sprite.scale.x;
    sprite.x = -sprite.width / 2;
    sprite.y = -sprite.height / 2;
  }
}
