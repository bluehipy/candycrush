import Game from "./src/Game.js";
import LevelOne from "./src/levels/LevelOne.js";
import LevelTwo from "./src/levels/LevelTwo.js";

if (!Math.sgn) {
  Math.sgn = v => {
    if (v === 0) {
      return 0;
    }
    return v / Math.abs(v);
  };
}

const app = new Game({
  autoResize: true,
  width: window.innerWidth - 2,
  height: window.innerHeight - 2,
  antialias: true, // default: false
  transparent: false, // default: false
  resolution: 1, // default: 1
  backgroundColor: 0x000000,
  levels: [LevelOne, LevelTwo]
});
window.app = app;
// The application will create a canvas element for you that you
// can then insert into the DOM

document.body.appendChild(app.view);
const parent = app.view.parentNode;
app.renderer.resize(parent.clientWidth, parent.clientHeight);

function resize() {
  app.renderer.resize(window.innerWidth - 2, window.innerHeight - 2);
}
window.addEventListener("resize", resize);

resize();
