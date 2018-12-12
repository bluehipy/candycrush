import EventDispatcher from "./EventDispatcher.js";
import EvolutionMap from "./EvolutionMap.js";
import TopBar from "./TopBar.js";
import OverlayMsg from "./OverlayMsg.js";
export default class Game extends EventDispatcher {
  constructor(config) {
    super();
    Object.assign(this, config);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.init();
  }
  init() {
    this.levelIndex = 0;
    this.loadingTxt = new PIXI.Text("Loading ...", {
      font: "3em Gamja Flower",
      fill: "orange",
      align: "center"
    });
    this.app.stage.addChild(this.loadingTxt);
    this.loadingTxt.x = (this.width - this.loadingTxt.width) / 2;
    this.loadingTxt.y = (this.height - this.loadingTxt.height) / 2;
    PIXI.loader
      .add("map", "map.jpg")
      .add("candysheet", "./candies.json")
      .add("girlsheet", "./girl.json")
      .load(this.onAssetsLoaded.bind(this));
  }
  onAssetsLoaded(loader, resources) {
    let textures = [],
      fatures = [],
      i;

    this.loadingTxt.destroy();
    delete this.loadingTxt;
    this.mapTexture = resources.map.texture;

    for (i = 0; i < 6; i++) {
      var framekey = "candy " + i;
      var texture = PIXI.Texture.fromFrame(framekey);
      textures.push(texture);
    }
    for (i = 0; i < 3; i++) {
      var framekey = "girl " + i;
      var texture = PIXI.Texture.fromFrame(framekey);
      fatures.push(texture);
    }
    this.textures = textures;
    this.fatures = fatures;
    this.showMessage(
      "Let's crash some candies!",
      msg => {
        msg.destroy();
        this.run();
      },
      0
    );
  }
  run() {
    this.status && this.status.destroy();
    this.showMap();
  }
  initLevel() {
    let levelClass = this.levels[this.levelIndex];

    this.currentLevel = new levelClass({
      game: this,
      textures: this.textures
    });

    this.status = new TopBar({
      game: this,
      level: this.currentLevel,
      w: this.width,
      h: this.height
    });

    this.app.stage.addChild(this.status);

    this.currentLevel
      .then(level => {
        this.currentLevel.destroy();
        this.showMessage(
          "Well done!",
          msg => {
            msg.destroy();
            this.levelIndex++;
            this.run();
          },
          2
        );
      })
      .catch(level => {
        this.currentLevel.destroy();
        this.showMessage(
          "Sorry, you have failed!",
          msg => {
            msg.destroy();
            this.run();
          },
          1
        );
      });
    this.currentLevel.start();
  }
  showMessage(msg, cb = null, emotion = 0) {
    if (typeof msg === "string") {
      msg = this.tpl(msg);
    }
    let girl = new PIXI.Sprite(this.fatures[emotion]);
    girl.width = msg.width / 2;
    girl.scale.y = girl.scale.x;
    let girlMsg = new PIXI.Container();
    girlMsg.addChild(girl);
    girlMsg.addChild(msg);
    girl.x = (msg.width - girl.width) / 2;
    msg.y = girl.height + msg.height / 2;

    let container = new OverlayMsg(
      girlMsg,
      window.innerWidth,
      window.innerHeight
    );
    this.on("resize", (w, h) => container.redraw(w, h));

    if (cb) {
      container.interactive = true;
      container.on("mousedown", () => cb(container));
      container.on("tap", () => cb(container));
    }
    this.app.stage.addChild(container);
  }
  tpl(msg) {
    const re = /(#\d+?)/g;
    const separator = "##$$$";
    let out = [];
    let result = [];
    const replacer = (match, p, offset, s) => {
      out.push(match.substr(1));
      return separator;
    };

    let s = msg.replace(re, replacer);
    out = out.map(code => new PIXI.Sprite(this.textures[code]));
    s = s.split(separator);
    s = s.map(
      segment =>
        segment.length &&
        new PIXI.Text(segment, {
          font: "7em Gamja Flower",
          fill: "orange"
        })
    );
    let h = 0;
    s.forEach((segment, index) => {
      segment && result.push(segment);
      h = Math.max(h, segment.height);
      let img;
      if ((img = out[index])) {
        result.push(img);
        img.height = h;
        img.scale.x = img.scale.y;
        img.y = img.height / 5;
      }
    });
    let container = new PIXI.Container();
    let lastX = 0;
    result.map((r, index) => {
      if (r) {
        r.x = lastX;
        lastX += r.width;
      }
      r && container.addChild(r);
      return r;
    });
    return container;
  }
  showMap() {
    let map = new EvolutionMap({
      texture: this.mapTexture,
      w: this.width,
      h: this.height,
      currentLevel: this.levelIndex,
      levels: [[475, 1240], [725, 1115], [295, 710]]
    });
    this.app.stage.addChild(map);
    this.evolutionMap = map;
    map.then(index => {
      this.levelIndex = index;
      this.evolutionMap.destroy();
      delete this.evolutionMap;
      this.initLevel();
    });
  }
  resize(w, h) {
    this.width = w;
    this.height = h;
    if (this.evolutionMap) {
      this.evolutionMap.redraw(w, h);
    }
    this.emit("resize", w, h);
  }
}
