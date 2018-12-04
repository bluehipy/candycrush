import BaseTable from "./BaseTable.js";
import Slide from "./Slide.js";
export default class AnimatedTable extends BaseTable {
  moveCellTo(cell, row, col, totalFrames = 10) {
    this.lock();
    return new Promise((resolve, reject) => {
      if (cell.row === row && cell.col === col) {
        this.unlock();
        return resolve(cell);
      }
      let destination = this.cartesianToDecimal(col, row);

      cell.animation = new Slide({
        actor: cell,
        endState: {
          x: destination[0],
          y: destination[1]
        },
        totalFrames: totalFrames,
        end: () => {
          delete cell.animation;
          this.unlock();
          resolve(cell);
        }
      });
    });
  }
  swap(cellA, cellB) {
    let xa = cellA.row,
      ya = cellA.col,
      xb = cellB.row,
      yb = cellB.col,
      moveA = this.moveCellTo(cellA, xb, yb),
      moveB = this.moveCellTo(cellB, xa, ya);

    return Promise.all([moveA, moveB]).then(cells => {
      let cellA = cells[0],
        cellB = cells[1],
        rowA = cellA.row,
        colA = cellA.col,
        rowB = cellB.row,
        colB = cellB.col;

      this.set(rowB, colB, cellA, false);
      this.set(rowA, colA, cellB, false);
      return cells;
    });
  }
  collectCell(cell) {
    this.lock();
    return new Promise((resolve, reject) => {
      cell.animation = new Slide({
        actor: cell,
        endState: {
          alpha: 0,
          width: 0.5 * cell.width,
          height: 0.5 * cell.height
        },
        totalFrames: 10,
        end: () => {
          delete cell.animation;
          this.unlock();
          resolve(cell);
        }
      });
    });
  }
  lock() {
    this.lockIndex = this.lockIndex || 0;
    this.lockIndex++;
  }
  unlock() {
    this.lockIndex = this.lockIndex || 0;
    this.lockIndex--;
    this.lockIndex = Math.max(0, this.lockIndex);
  }
  isLocked() {
    this.lockIndex = this.lockIndex || 0;
    return this.lockIndex > 0;
  }
}
