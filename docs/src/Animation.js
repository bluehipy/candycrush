const EasingFunctions = {
  // no easing, no acceleration
  linear: function(t) {
    return t;
  },
  // accelerating from zero velocity
  easeInQuad: function(t) {
    return t * t;
  },
  // decelerating to zero velocity
  easeOutQuad: function(t) {
    return t * (2 - t);
  },
  // acceleration until halfway, then deceleration
  easeInOutQuad: function(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },
  // accelerating from zero velocity
  easeInCubic: function(t) {
    return t * t * t;
  },
  // decelerating to zero velocity
  easeOutCubic: function(t) {
    return --t * t * t + 1;
  },
  // acceleration until halfway, then deceleration
  easeInOutCubic: function(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  },
  // accelerating from zero velocity
  easeInQuart: function(t) {
    return t * t * t * t;
  },
  // decelerating to zero velocity
  easeOutQuart: function(t) {
    return 1 - --t * t * t * t;
  },
  // acceleration until halfway, then deceleration
  easeInOutQuart: function(t) {
    return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
  },
  // accelerating from zero velocity
  easeInQuint: function(t) {
    return t * t * t * t * t;
  },
  // decelerating to zero velocity
  easeOutQuint: function(t) {
    return 1 + --t * t * t * t * t;
  },
  // acceleration until halfway, then deceleration
  easeInOutQuint: function(t) {
    return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
  }
};

export default class Animation {
  constructor(config) {
    this.elastic = false;
    this.elasticSteps = 0;
    Object.assign(this, config);
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
    this.ticker = new PIXI.ticker.Ticker();
    this.ticker.stop();
    this.init();
  }
  then(fn) {
    return this.promise.then(res => fn(res));
  }
  catch(fn) {
    return this.promise.catch(err => fn(err));
  }
  init() {
    let prop;
    let value;
    this.currentFrame = 0;
    if (!this.startState) {
      this.startState = this.getCurrentState();
    }
    this.ticker.add(() => this.onTick());
    if (this.autoStart !== false) {
      this.start();
    }
  }
  getCurrentState() {
    let state = {};
    for (let prop in this.endState) {
      state[prop] = this.actor[prop];
    }
    return state;
  }
  getElasticState() {
    let sgn = this.elasticSteps % 2 ? -1 : 1;
    if (sgn === 1) {
      return this.endState;
    }
    let state = Object.assign({}, this.endState);
    for (let prop in state) {
      state[prop] =
        this.startState[prop] + 0.9 * (state[prop] - this.startState[prop]);
    }
    return state;
  }
  start() {
    this.onStart && this.onStart();
    this.ticker.start();
  }
  pause() {
    this.ticker.stop();
  }
  stop() {
    this.onStop && this.onStop();
    this.ticker.stop();
    this.resolve(this.actor);
  }
  onTick() {
    this.currentFrame++;
    if (this.currentFrame > this.duration) {
      this.pause();
      if (this.elastic) {
        if (this.elasticSteps < 2) {
          this.elasticSteps++;
          new Animation({
            elastic: false,
            actor: this.actor,
            endState: this.getElasticState(),
            duration: this.duration / (this.elasticSteps * 2),
            ease: this.elasticSteps % 2 ? "easeOutQuad" : "easeInQuad"
          }).then(() => this.onTick());
        } else {
          this.currentFrame = this.duration;
          this.apply();
          this.stop();
        }
      } else {
        this.stop();
      }
    } else {
      this.apply();
    }
  }
  apply() {
    Object.assign(
      this.actor,
      this.transform(
        this.actor,
        this.currentFrame,
        this.duration,
        this.startState,
        this.endState
      )
    );
  }
  transform() {
    let prop,
      state = {};

    //some linear transform
    for (prop in this.startState) {
      if (!this.ease) {
        this.ease = "easeOutQuad";
      }
      let fn = EasingFunctions[this.ease] || EasingFunctions.linear;
      state[prop] =
        this.startState[prop] +
        fn(this.currentFrame / this.duration) *
          (this.endState[prop] - this.startState[prop]);
    }

    if (this.fn) {
      let clientState = this.fn.apply(this, arguments);
      Object.assign(state, clientState);
    }
    return state;
  }
  destroy() {
    if (!this.isDestroyed) {
      this.isDestroyed = 1;
      this.pause();
      this.reject();
      delete this.reject;
      delete this.resolve;
      this.promise = null;
      delete this.actor;
      delete this.startState;
      delete his.endState;
      delete this.fn;
    }
  }
}
