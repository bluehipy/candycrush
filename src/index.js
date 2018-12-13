import Game from "./Game.js";
import LevelOne from "./levels/LevelOne.js";
import LevelTwo from "./levels/LevelTwo.js";
import LevelThree from "./levels/LevelThree.js";

if (!Math.sgn) {
  Math.sgn = v => {
    if (v === 0) {
      return 0;
    }
    return v / Math.abs(v);
  };
}

const app = new PIXI.Application({
  autoResize: true,
  width: window.innerWidth,
  height: window.innerHeight,
  antialias: true, // default: false
  transparent: false, // default: false
  resolution: 1, // default: 1
  backgroundColor: 0x000000
});
window.Renderer = {
  add: child => app.stage.addChild(child),
  setZIndex: (child, zIndex) => app.stage.setChildIndex(child, zIndex),
  maxZIndex: () => app.stage.children.length - 1
};
WebFont.load({
  google: {
    families: ["Gamja Flower"]
  },
  active: function() {
    document.body.appendChild(app.view);
    let game = new Game({
      app: app,
      levels: [LevelOne, LevelTwo, LevelThree]
    });
    window.addEventListener("resize", () => {
      let w, h;
      if (window) {
        w = window.innerWidth;
        h = window.innerHeight;
      } else {
        w = app.view.parentNode.offsetWidth;
        h = app.view.parentNode.offsetHeight;
      }
      app.renderer.resize(w, h);
      game.resize(w, h);
    });
  }
});
