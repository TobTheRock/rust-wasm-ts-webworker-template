const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const AfterBuildWebpackPlugin = require('@fiverr/afterbuild-webpack-plugin');
const fs = require("fs");

const outputLibraryName = "WasmLibrary";
const workerFile = "./Worker.js";
const b64WorkerFile = "./Base64Worker.js";
const clientFile = "./Client.js";
const packedWorkerFileName = "webpack.Worker.js";

const context = path.resolve(__dirname, "./ts/dist");
const dist = path.resolve(__dirname, "dist")
const distLoose = path.resolve(__dirname, "dist_loose")
const mode = "production";

function inlineBase64Content(inputFile, outputFile) {
  console.info(`Inlining ${inputFile} and writing to ${outputFile}`);
  const inputFileContent = fs.readFileSync(inputFile).toString();
  const inlineContent = Buffer.from(inputFileContent).toString('base64');

  const newContent = `export default '${inlineContent}';\n`;

  fs.writeFileSync(outputFile, newContent);
}


const workerConfig = {
  name: "worker",
  mode,
  context,
  target: "webworker",
  entry: {
    WasmWorker: {
      import: workerFile,
      filename: packedWorkerFileName,
    }
  },
  output: {
    path: distLoose,
    library: "WasmWorker",
  },
  module: {
    rules: [
      {
        test: /\.wasm$/,
        type: "asset/inline",
      },
    ],
  },
  experiments: {
    asyncWebAssembly: true,
  },
  plugins: [
    new CopyWebpackPlugin({ patterns: [{ from: "**/*", to: distLoose, context, globOptions: { ignore: [workerFile, b64WorkerFile] } }] }),
    new AfterBuildWebpackPlugin(() => inlineBase64Content(path.resolve(distLoose, packedWorkerFileName), path.resolve(distLoose, b64WorkerFile)))
  ]
};

const clientConfig = {
  name: "client",
  mode,
  context: distLoose,
  entry: clientFile,
  output: {
    library: outputLibraryName,
    filename: clientFile,
    libraryTarget: "umd",
    path: dist
  },
  dependencies: ["worker"],
  plugins: [
    new CopyWebpackPlugin({patterns: [ { from: `${path.basename(clientFile, ".js")}.d.ts`, to: dist, context: distLoose}]})
  ]
}

module.exports = [workerConfig, clientConfig]