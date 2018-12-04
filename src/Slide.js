import Animation from "./Animation.js";

export default class Slide extends Animation {
  transform(current, total, start, end) {
    let deltas = {};
    for (let prop in start) {
      if (start.hasOwnProperty(prop)) {
        deltas[prop] = this.actor[prop] + (end[prop] - start[prop]) / total;
      }
    }
    return deltas;
  }
}
