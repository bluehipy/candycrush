/**

data:
****aa****
***aaaa***
**aaaaaa**
*aaaaaaaa*
aaaaaaaaaa
aaaaaaaaaa
aaaaaaaaaa
*aaaaaaaa*
**aaaaaa**
***aaaa***

*/
import AnimatedTable from "./AnimatedTable.js";
import Slide from "./Slide.js";

export default class Table extends AnimatedTable {
  createCell(code, row, col) {
    let cell = null;
    if (code !== this.disabledCell) {
      cell = new PIXI.Sprite(this.map[code]); //
      cell.anchor.x = this.cellAnchorX;
      cell.anchor.y = this.cellAnchorY;
      cell.row = row;
      cell.col = col;
      cell.code = code;

      cell.interactive = true;
      cell.on("touchstart", e => this.onCellDragStart(cell, e));
      cell.on("mousedown", e => this.onCellDragStart(cell, e));
      this.cells[row][col] = cell;
      this.setCellPosition(cell, col, row);
      if (this.debug) {
        var graphics = new PIXI.Graphics();
        graphics.lineStyle(1, 0x00ff00);
        graphics.drawRect(0, 0, cell.width - 1, cell.height - 1);
        cell.addChild(graphics);
      }
      cell.width = this.width / this.data[0].length;
      cell.height = this.height / this.data.length;
      this.addToStage(cell);
    }
    return cell;
  }
  onCellDragStart(cell, e) {
    if (this.isLocked()) return;
    this.startX = e.data.global.x;
    this.startY = e.data.global.y;
    cell.on("touchmove", e => this.onCellDrag(cell, e));
    cell.on("mousemove", e => this.onCellDrag(cell, e));
    cell.once("touchend", () => {
      cell.off("touchmove");
      cell.off("mousemove");
    });
    cell.once("mouseup", () => {
      cell.off("touchmove");
      cell.off("mousemove");
    });

    this.moveOnTop(cell);
  }
  onCellDrag(cell, e) {
    if (this.isLocked()) return;
    let dx = e.data.global.x - this.startX;
    let dy = e.data.global.y - this.startY;
    let adx = Math.abs(dx);
    let ady = Math.abs(dy);
    if (adx > cell.width / 4 || ady > cell.height / 4) {
      cell.off("touchmove");
      cell.off("mousemove");
      if (adx > ady) {
        this.moveCell(cell, Math.sgn(dx), Table.HORIZONTAL);
      } else {
        this.moveCell(cell, Math.sgn(dy), Table.VERTICAL);
      }
    }
  }
  moveCell(cell, delta, direction) {
    let target;

    if (direction === Table.HORIZONTAL) {
      target = delta > 0 ? this.right(cell) : this.left(cell);
    } else {
      target = delta > 0 ? this.down(cell) : this.up(cell);
    }

    if (!target) {
      return;
    }
    this.swap(cell, target).then(cells => this.onSwap(cells));
  }

  collect(cells) {
    let collects = [],
      fn = (cell, index) =>
        new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(this.collectCell(cell));
          }, index * 50);
        });
    cells.forEach((cell, index) => collects.push(fn.bind(null, cell, index)()));
    return Promise.all(collects).then(cells =>
      cells.map(c => this.set(c.row, c.col, null))
    );
  }
  destroy() {
    this.cells = this.cells.map((row, rowIndex) => {
      row.map((cell, colIndex) => {
        if (!cell) return null;
        cell.off("mousedown");
        cell.off("touchstart");
        cell.off("touchmove");
        cell.off("mousemove");
        cell.off("touchend");
        cell.off("mouseup");
        cell.destroy();
        return null;
      });
      row.length = 0;
      return null;
    });
    this.cells.length = 0;
    this.cells = null;
  }
}
