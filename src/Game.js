export default class Gmae extends PIXI.Application {
  constructor(config) {
    super(config);
    let cfg = Object.assign({}, config);
    Object.assign(this, cfg);
    this.gameInit();
  }
  gameInit() {
    this.heartBeats = [];
    this.levelIndex = 0;
    if (this.levels && this.levels.length) {
      this.gameRun();
    }
    this.ticker.add(() => this.heartBeat());
  }
  registerHeartBeat(fn) {
    this.heartBeats.push(fn);
    const unregister = index => (this.heartBeats[index] = null);

    return unregister.bind(this, this.heartBeats.length - 1);
  }
  heartBeat() {
    this.heartBeats.forEach(fn => fn && fn());
  }
  gameRun() {
    this.showMap().then(levelIndex => {
      this.levelIndex = levelIndex;
      this.initLevel();
    });
  }
  initLevel() {
    let levelClass = this.levels[this.levelIndex];

    this.currentLevel = new levelClass({
      x: 10,
      y: 10,
      width: this.view.width - 20,
      height: this.view.height - 20,
      cellAnchorX: 0.5,
      cellAnchorY: 0.5,
      addToStage: this.gameAddToStage.bind(this),
      moveOnTop: this.gameMoveOnTop.bind(this),
      registerHeartBeat: this.registerHeartBeat.bind(this),
      showMessage: this.showMessage.bind(this)
    });
    this.currentLevel
      .then(level => {
        this.showMessage("Well done!", () => {
          this.levelIndex++;
          this.gameRun();
        });
      })
      .catch(level => {
        this.showMessage("Sorry, you have failed!", () => {
          this.gameRun();
        });
      });
  }

  gameAddToStage(sprite) {
    this.stage.addChild(sprite);
  }
  gameMoveOnTop(child, index) {
    this.stage.setChildIndex(child, this.stage.children.length - 1);
  }
  showMessage(msg, cb = false) {
    let container = new PIXI.Container();
    container.interactive = true;

    let bg = new PIXI.Graphics(true);
    bg.beginFill(0x000000, 0.8);
    bg.drawRect(0, 0, this.view.width, this.view.height);
    bg.endFill();

    let text = new PIXI.Text(msg, {
      font: "3em Pacifico",
      fill: "white"
    });
    text.x = (this.view.width - text.width) / 2;
    text.y = (this.view.height - text.height) / 2;
    container.addChild(bg);
    container.addChild(text);

    this.stage.addChild(container);

    container.once("mousedown", () => {
      container.destroy();
      cb && cb();
    });
    container.once("tap", () => {
      container.destroy();
      cb && cb();
    });
  }
  showMap() {
    return new Promise((resolve, reject) => {
      const fn = i => {
          this.stage.removeChildren(0, this.stage.children.length - 1);
          resolve(i);
        },
        drawMap = () => {
          let mapSprite = new PIXI.Sprite(PIXI.loader.resources.map.texture);
          this.stage.addChild(mapSprite);

          if (mapSprite.width > this.view.width) {
            mapSprite.width = this.view.width;
            mapSprite.scale.y = mapSprite.scale.x;
          }
          if (mapSprite.height > this.view.height) {
            mapSprite.height = this.view.height;
            mapSprite.scale.x = mapSprite.scale.y;
          }
          mapSprite.x = (this.view.width - mapSprite.width) / 2;
          mapSprite.y = (this.view.height - mapSprite.height) / 2;
          const lvlWidth = mapSprite.width / 10;
          const lvls = [[523, 301], [480, 180]];

          lvls.forEach((lvl, index) => {
            let x = lvl[0] * mapSprite.scale.x,
              y = lvl[1] * mapSprite.scale.y;
            let circle = new PIXI.Graphics(true);
            if (index <= this.levelIndex) {
              circle.beginFill(0xff0000, 0.4);
              circle.on("mousedown", fn.bind(null, index));
              circle.on("tap", fn.bind(null, index));
              circle.interactive = true;
            } else {
              circle.beginFill(0x000000, 0.4);
            }
            circle.drawCircle(lvlWidth / 2, lvlWidth / 2, lvlWidth / 2);
            circle.endFill();

            circle.x = mapSprite.x + x;
            circle.y = mapSprite.y + y;
            this.stage.addChild(circle);
          });
        };

      if (!PIXI.loader.resources.map) {
        PIXI.loader.add("map", "map.png");
        PIXI.loader.load((loader, resources) => drawMap());
      } else {
        drawMap();
      }
    });
  }
}
