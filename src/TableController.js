export default class TableController {
  constructor(view) {
    this.view = view;
    this.model = view.model;
    this.init();
  }
  init() {
    this.addListeners();
  }
  registerCell(cell) {
    cell.on("drag", this.onDrag.bind(this, cell));
  }
  unregisterCell(cell) {
    cell.off("drag");
  }
  addListeners() {
    this.model.on("swap", this.onSwap.bind(this));
    this.model.on("remove", this.onRemove.bind(this));
  }
  removeListeners() {
    this.model.off("swap");
    this.model.off("remove");
  }
  onDrag(cell, direction) {
    if (this.view.isLocked()) {
      return;
    }
    let res = this.model.find(cell),
      pos;

    if (res) {
      pos = this.model[direction](...res);
      if (pos) {
        this.model.swap(...res, ...pos);
      }
    }
  }
  onSwap(rowA, colA, cellA, rowB, colB, cellB) {
    let noCheck = this.noCheck;
    this.view
      .swap(cellA, cellB)
      .then(() => !noCheck && this.check([[rowA, colA], [rowB, colB]]));
  }
  onRemove(row, col, cell) {
    this.unregisterCell(cell);
    this.view.remove(cell);
  }
  check(arr, swap = true) {
    let rows = [],
      cols = [];
    this.view.emit("begincheck");
    arr.forEach(pos => {
      let row = this.checkRow(...pos);
      let col = this.checkColumn(...pos);
      if (row.length >= 3) {
        rows.push(row);
      }
      if (col.length >= 3) {
        cols.push(col);
      }
    });
    rows.map(row => row.forEach(cell => cols.push([cell])));
    if (!cols.length && swap) {
      this.noCheck = true;
      this.model.swap(...arr[0], ...arr[1]);
      delete this.noCheck;
      this.view.emit("endcheck");
      return;
    }
    if (cols.length && swap) {
      this.view.emit("validmove");
    }
    if (!cols.length) {
      this.view.emit("endcheck");
    }
    Promise.all(cols.map(col => this.collect(col)))
      .then(response => Promise.all(response.map(arr => this.fill(arr))))
      .then(response => {
        if (response.length) {
          this.check(
            response.reduce((acc, crt) => {
              if (crt) {
                acc = [].concat(acc, crt);
              }
              return acc;
            }, []),
            false
          );
        }
      });
  }
  fill(arr) {
    let tasks = [];
    // get column above
    if (this.model.get(...arr[0])) {
      return new Promise(r => r(false));
    }
    let above = this.model.getAbove(arr);
    let l = arr.length;

    // translate above l rows down
    above.map((p, index) => {
      let cell = this.model.get(...p);
      let target = p.slice();
      target[0] += l;
      this.model.set(...p, null);
      this.model.set(...target, cell);
      tasks.push(
        this.view
          .move(cell, this.view.getX(target[1]), this.view.getY(target[0]))
          .then(() => target)
      );
    });
    //create as many new cells as were removed
    arr.map((a, index) => {
      let target = arr[l - index - 1];
      target[0] -= above.length;
      let cell = this.view.createCell(
        target[0] - l,
        target[1],
        Math.floor(Math.random() * this.view.textures.length)
      );
      this.model.set(...target, cell);

      tasks.push(
        this.view
          .move(cell, this.view.getX(target[1]), this.view.getY(target[0]))
          .then(() => target)
      );
    });
    return Promise.all(tasks);
  }
  checkRow(row, col) {
    let cell = this.model.get(row, col),
      code = cell.code,
      pos,
      collects = [[row, col]],
      r = row,
      c = col;
    while (
      (pos = this.model.right(r, c++)) &&
      this.model.get(...pos).code === code
    ) {
      collects.push(pos);
    }
    r = row;
    c = col;
    while (
      (pos = this.model.left(r, c--)) &&
      this.model.get(...pos).code === code
    ) {
      collects.push(pos);
    }
    return collects.sort(
      (posA, posB) => (posA[0] - posB[0]) * 1000 + posB[1] - posA[1]
    );
  }
  checkColumn(row, col) {
    let cell = this.model.get(row, col),
      code = cell.code,
      pos,
      collects = [[row, col]],
      r = row,
      c = col;
    while (
      (pos = this.model.up(r--, c)) &&
      this.model.get(...pos).code === code
    ) {
      collects.push(pos);
    }

    r = row;
    c = col;
    while (
      (pos = this.model.down(r++, c)) &&
      this.model.get(...pos).code === code
    ) {
      collects.push(pos);
    }
    return collects.sort(
      (posA, posB) => (posA[0] - posB[0]) * 1000 + posB[1] - posA[1]
    );
  }
  collect(arr) {
    this.view.emit("collect", arr);
    return Promise.all(
      arr.map(pos => {
        let cell = this.model.get(...pos);
        if (cell) {
          this.model.remove(...pos);
          return this.view.remove(cell).then(() => pos);
        }
        return pos;
      })
    );
  }
  destroy() {
    this.removeListeners();
    this.model.each((row, col, cell) => cell && this.unregisterCell(cell));
  }
}
