"use strict";
require("dotenv").config({ path: require("find-config")(".env") });
const fs = require("fs");
const path = require("path");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
const encode = require("./modules/encode.js");
const decode = require("./modules/decode.js");
const util = require("./modules/util.js");

// Config
const outPath = path.join(__dirname, "TMP");
let config = {
  dataFormat: process.env.DATA_FORMAT || "json",
  keepArtifacts: true,
  encodingMethod: process.env.ENCODING_TYPE || "BINARY",
  doB64: process.env.B64 === "false" ? false : true || true,
  size:
    process.env.WIDTH || process.env.HEIGHT
      ? {
          width: process.env.WIDTH || 128,
          height: process.env.HEIGHT || 128,
        }
      : "auto",
  applyCompression: process.env.APPLY_COMPRESSION === "true" ? true : false,
  outPath,
};
if (!fs.existsSync(config.outPath)) {
  fs.mkdir(config.outPath, (err) => {
    if (err) console.error(err);
  });
}

const doConversion = (config, data) => {
  const rt = "mp4";
  const df = null;
  if (df) config = { ...config, dataFormat: df };
  const et = null;
  if (et) {
    config = { ...config, encodingMethod: et };
  }

  if (!fs.existsSync(config.outPath)) {
    fs.mkdir(config.outPath, (err) => {
      if (err) console.error(err);
    });
  }

  ffmpeg.setFfmpegPath(ffmpegPath);

  const encodeDataFrom = (data, cb) => {
    const payload = data;
    switch (config.encodingMethod) {
      case "NAIVE_COLOR":
        encode.naiveColor(config, payload, cb);
        break;
      case "BINARY":
      default:
        encode.binary(config, payload, cb);
        break;
    }
  };

  const decodeBmp = (config, bmp) => {
    const payload = data;
    switch (config.encodingMethod) {
      case "NAIVE_COLOR":
        decode.naiveColor(config, bmp);
        break;
      case "BINARY":
      default:
        decode.binary(config, bmp);
        break;
    }
  };

  encodeDataFrom(data, (result) => {
    fs.writeFile(`${config.outPath}/data.json`, result.json, (err) => {
      if (err) return console.log(err);
    });
    fs.writeFile(`${config.outPath}/data.b64`, result.b64, (err) => {
      if (err) return console.log(err);
    });
    fs.writeFile(`${config.outPath}/data.xml`, result.xml, (err) => {
      if (err) return console.log(err);
    });
    util.grabFrame(config, (config, bmp) => decodeBmp(config, bmp));
  });
};

// Read the input file and get started.
const inputFile = process.argv[2];
fs.readFile(inputFile, "utf8", function (err, data) {
  if (err) throw err;
  //  if (path.extname(inputFile.toLowerCase()) === ".json")
  //  data = JSON.parse(data);
  console.log(
    `\n------------------------------\nConverting ${inputFile}\n------------------------------`
  );
  console.log(config);
  doConversion(config, data);
});
