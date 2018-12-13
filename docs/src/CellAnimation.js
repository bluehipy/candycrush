import Animation from "./Animation.js";
export default class CellAnimation extends Animation {
  constructor(config) {
    super(config);
  }
  onStart() {
    this.actor.lock();
  }
  onStop() {
    this.actor.unlock();
  }
}
