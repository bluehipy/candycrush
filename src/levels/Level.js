import Table from "../Table.js";
export default class Level {
  constructor(cfg) {
    Object.assign(this, cfg);
    this.init().then(() => this.start());
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
  init() {}
  start() {
    let data = this.data.map(line =>
      line
        .split("")
        .map(
          c =>
            c == "-"
              ? this.codes[Math.floor(Math.random() * this.codes.length)]
              : c
        )
    );
    this.table = new Table({
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      data: data,
      map: this.map,
      cellAnchorX: this.cellAnchorX,
      cellAnchorY: this.cellAnchorY,
      disabledCell: "*",
      onSwap: cells => this.checkTable(cells),
      addToStage: this.addToStage.bind(this),
      moveOnTop: this.moveOnTop.bind(this)
    });
    this.started = true;
    this.unregister = this.registerHeartBeat(this.heartBeat.bind(this));
    this.onStart();
    this.startMessage && this.showMessage(this.startMessage);
  }
  end() {
    this.unregister();
    this.table.destroy();
    this.ended = true;
    this.started = false;
    this.onEnd();
  }
  onStart() {}
  onEnd() {}
  onCollect(cells) {}
  onSwap(cells) {}
  onHeartBeat() {}
  successCriteria() {}
  failureCriteria() {}
  heartBeat() {
    if (this.started) {
      this.table.render();
      this.onHeartBeat();
      if (this.successCriteria()) {
        this.end();
        this.resolve(true);
      } else if (this.failureCriteria()) {
        this.end();
        this.reject();
      }
    }
  }
  checkTable(cells, swap = true) {
    let table = this.table;
    let toCollect = [];
    cells.forEach(cell => {
      let collects = this.checkColumn(cell);
      if (collects.length >= 3) {
        toCollect = toCollect.concat(
          collects.filter(c => toCollect.indexOf(c) === -1)
        );
      }

      collects = this.checkRow(cell);

      if (collects.length >= 3) {
        toCollect = toCollect.concat(
          collects.filter(c => toCollect.indexOf(c) === -1)
        );
      }
    });
    if (toCollect.length) {
      if (swap) {
        this.onSwap(cells);
      }
      table.collect(toCollect).then(() => {
        this.onCollect(toCollect);
        this.fillGaps(toCollect).then(arr =>
          this.checkTable(arr.map(o => table.cells[o.row][o.col]), false)
        );
      });
    } else {
      swap && table.swap(...cells);
    }
  }

  fillGaps(toCollect) {
    let table = this.table;

    return new Promise((resolve, reject) => {
      let cells = toCollect.map(cell => table.cells[cell.row][cell.col]);
      let changed = false;
      cells.every((cell, index) => {
        let ghost = toCollect[index],
          neighnour = table.up(ghost);
        if (
          !cell &&
          (ghost.row === 0 || table.data[ghost.row - 1][ghost.col] === "*")
        ) {
          neighnour = table.createCell(
            this.codes[Math.floor(Math.random() * this.codes.length)],
            ghost.row,
            ghost.col
          );
        }
        if (!cell && neighnour) {
          let row = neighnour.row,
            col = neighnour.col,
            code = neighnour.code;
          table
            .moveCellTo(neighnour, ghost.row, ghost.col, 2)
            .then(neighnour => {
              table.set(row, col, null, false);
              table.set(ghost.row, ghost.col, neighnour, false);

              let newToCollect = toCollect.slice();
              newToCollect.push({ row: row, col: col, code: code });
              //newToCollect.splice(index, 1);
              resolve(this.fillGaps(newToCollect));
            });
          changed = true;
          return false;
        }
        return true;
      });
      if (!changed) {
        resolve(toCollect);
      }
    });
  }
  checkColumn(cell) {
    let code = cell.code,
      tmp = cell,
      collects = [cell];
    while ((tmp = this.table.up(tmp)) && tmp.code === code) {
      collects.push(tmp);
    }
    tmp = cell;
    while ((tmp = this.table.down(tmp)) && tmp.code === code) {
      collects.push(tmp);
    }
    return collects;
  }
  checkRow(cell) {
    let code = cell.code,
      tmp = cell,
      collects = [cell];
    while ((tmp = this.table.right(tmp)) && tmp.code === code) {
      collects.push(tmp);
    }
    tmp = cell;
    while ((tmp = this.table.left(tmp)) && tmp.code === code) {
      collects.push(tmp);
    }
    return collects;
  }
}
