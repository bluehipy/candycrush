export default class EventDispatcher extends PIXI.utils.EventEmitter {
  suspend() {
    if (this.suspendCount === undefined) {
      this.suspendCount = 0;
    }
    this.suspendCount++;
  }
  resume() {
    this.suspendCount--;
    this.suspendCount = Math.max(0, this.suspendCount);
  }
  isSuspended() {
    return this.suspendCount && this.suspendCount > 0;
  }
  emit() {
    if (!this.isSuspended()) {
      PIXI.utils.EventEmitter.prototype.emit.apply(this, arguments);
    }
  }
}
