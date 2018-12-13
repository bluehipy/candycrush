const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "docs")
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: "src/assets/",
        to: "./src/assets",
        toType: "dir"
      },
      {
        from: "favicon.ico",
        to: "./favicon.ico"
      }
    ])
  ]
};
