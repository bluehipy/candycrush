export default class BaseTable {
  static get VERTICAL() {
    return 1;
  }
  static get HORIZONTAL() {
    return 2;
  }
  constructor(cfg) {
    this.defaults = {
      disabledCell: "*",
      cellWidth: 25,
      cellHeight: 25,
      cellAnchorX: 0,
      cellAnchorY: 0
    };
    this.init(cfg);
    this.createCells();
  }
  init(cfg) {
    let config = Object.assign({}, this.defaults);
    config = Object.assign(config, cfg || {});
    this.config = config;
    Object.assign(this, config);
    this.cells = this.data.map((row, rowIndex) =>
      row.map((cell, colIndex) => null)
    );
  }
  createCells() {
    this.cells = this.data.map((row, rowIndex) =>
      row.map((cell, colIndex) => this.createCell(cell, rowIndex, colIndex))
    );
  }
  createCell(data, row, col) {}
  up(cell) {
    let row = cell.row,
      col = cell.col,
      cells = this.cells[row - 1];

    return cells && cells[col];
  }
  get(row, col) {
    let cells = this.cells[row];
    return cells && cells[col];
  }
  set(row, col, cell = null, autoDestroy = true) {
    let cells = this.cells[row];
    let oldCell = this.get(row, col);

    if (oldCell && autoDestroy) {
      oldCell.destroy();
    }
    if (cells) {
      cells[col] = cell;
      if (cell) {
        cell.row = row;
        cell.col = col;
      }
    }
  }
  down(cell) {
    let row = cell.row,
      col = cell.col,
      cells = this.cells[row + 1];

    return cells && cells[col];
  }
  right(cell) {
    let row = cell.row,
      col = cell.col,
      cells = this.cells[row];

    return cells && cells[col + 1];
  }
  left(cell) {
    let row = cell.row,
      col = cell.col,
      cells = this.cells[row];

    return cells && cells[col - 1];
  }
  getData() {
    return this.cells.map(row =>
      row.map(cell => {
        if (cell === null) {
          return this.disabledCell;
        } else {
          return cell.code;
        }
      })
    );
  }
  getColumn(index) {
    return this.cells.map(row => row[index]);
  }
  getRow(index) {
    return this.cells[index].slice();
  }

  cartesianToDecimal(col, row) {
    let cellWidth = this.width / this.data[0].length;
    let cellHeight = this.height / this.data.length;
    let newPoint = [col + this.cellAnchorX, row + this.cellAnchorY];

    newPoint[0] *= cellWidth;
    newPoint[1] *= cellHeight;
    newPoint[0] += this.x;
    newPoint[1] += this.y;
    return newPoint;
  }
  setCellPosition(cell, col, row) {
    let pos = this.cartesianToDecimal(col, row);
    cell.x = pos[0];
    cell.y = pos[1];
  }
  render() {
    this.cells.forEach((row, rowIndex) =>
      row.forEach((cell, colIndex) => {
        if (cell) {
          if (cell.animation) {
            cell.animation.run();
          } else {
            this.setCellPosition(cell, colIndex, rowIndex);
          }
        }
      })
    );
  }
}
