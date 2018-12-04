/***
actor
startState {prop1: v1, prop2: v2}
endState {prop1: v1, prop2: v2}
currentFrame
totalFrames
transform : (currentFrame, totalFrames, startStat, endState) => currentState
onTick() {currentFrame++; Object.assign(actor, transform())}
*/
export default class Animation {
  constructor(config) {
    Object.assign(this, config || {});
    if (!this.startState) {
      this.startState = {};
      for (let prop in this.endState) {
        if (this.endState.hasOwnProperty(prop)) {
          this.startState[prop] = this.actor[prop];
        }
      }
    }
  }
  run() {
    if (!this.hasOwnProperty("currentFrame")) {
      this.currentFrame = 0;
    }
    this.currentFrame++;
    if (this.currentFrame === this.totalFrames) {
      Object.assign(this.actor, this.endState);
      this.end();
    } else {
      Object.assign(
        this.actor,
        this.transform(
          this.currentFrame,
          this.totalFrames,
          this.startState,
          this.endState
        )
      );
    }
  }
}
