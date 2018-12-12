import EventDispatcher from "./EventDispatcher.js";
export default class TableModel extends EventDispatcher {
  constructor(config) {
    super();
    Object.assign(this, config);
    this.init();
  }
  init() {
    this.data = [];
    for (let i = 0; i < this.rowsNo; i++) {
      this.data.push(new Array(this.colsNo));
    }
  }

  set(row, col, obj) {
    if (row < 0 || row >= this.rowNo || col < 0 || col >= this.colNo) {
      throw new Exception("Out of bounds");
    }
    this.data[row][col] = obj;
  }
  get(row, col) {
    if (row < 0 || row >= this.rowsNo || col < 0 || col >= this.colsNo) {
      return null;
    }
    return this.data[row][col];
  }
  getAbove(arr) {
    let row = arr[0][0];
    let col = arr[0][1];
    let pos = [];
    let p;
    while ((p = this.up(row--, col))) {
      pos.push(p);
    }
    return pos;
  }
  remove(row, col) {
    let obj = this.get(row, col);

    this.set(row, col, null);
    this.emit("remove", row, col, obj);
    return obj;
  }
  up(row, col) {
    let pos;
    if (this.get(row - 1, col)) {
      pos = [row - 1, col];
    }
    return pos;
  }
  down(row, col) {
    let pos;
    if (this.get(row + 1, col)) {
      pos = [row + 1, col];
    }
    return pos;
  }
  left(row, col) {
    let pos;
    if (this.get(row, col - 1)) {
      pos = [row, col - 1];
    }
    return pos;
  }
  right(row, col) {
    let pos;
    if (this.get(row, col + 1)) {
      pos = [row, col + 1];
    }
    return pos;
  }
  swap(rowA, colA, rowB, colB) {
    let objA = this.get(rowA, colA);
    let objB = this.get(rowB, colB);

    this.set(rowA, colA, objB);
    this.set(rowB, colB, objA);
    this.emit("swap", rowA, colA, objA, rowB, colB, objB);
  }
  moveTo(rowA, colA, rowB, colB) {
    this.set(rowB, colB, this.get(rowA, colA));
    this.suspend();
    this.remove(rowA, colA);
    this.resume();
    this.emit("move", rowA, colA, rowB, colB, this.get(rowB, colB));
  }
  moveBy(row, col, deltaR, deltaC) {
    this.moveTo(row, col, row + deltaR, col + deltaC);
  }
  each(fn) {
    let tmp = true;
    this.data.every((row, rowIndex) => {
      row.every((cell, colIndex) => {
        tmp = tmp && false !== fn(rowIndex, colIndex, cell);
        return tmp;
      });
      return tmp;
    });
  }
  find(obj) {
    let pos;
    this.each((row, col, o) => {
      if (o === obj) {
        pos = [row, col];
        return false;
      }
      return true;
    });
    return pos;
  }
  destroy() {
    this.removeAllListeners();
    this.suspend();
    this.data.map((row, index) => (row.length = 0));
    this.data.length = 0;
    delete this.data;
    this.resume();
  }
}
