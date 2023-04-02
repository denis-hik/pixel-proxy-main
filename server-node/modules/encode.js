const bitmapManipulation = require("bitmap-manipulation");
const { calculateSize } = require("./util.js");
const ffmpeg = require("fluent-ffmpeg");
const js2xmlparser = require("js2xmlparser");
const zlib = require("zlib");

const _generateVideo = (config, src, cb, result) => {
  ffmpeg(src)
    .inputOption("-loop 1")
    .videoCodec("libx264")
    .format("mp4")
    .outputOptions([
      "-r 30",
      `-s ${config.size.width}x${config.size.height}`,
      "-preset veryslow",
      "-movflags +faststart",
      "-frames:v 4",
      "-vf format=yuv420p",
      "-profile:v high",
      "-crf 1",
      "-tune stillimage",
    ])
    .output(`${config.outPath}/data.mp4`)
    .on("error", (err, stdout, stderr) =>
      console.log(err.message + stdout + stderr)
    )
    .on("end", () => {
      console.log(
        `RES: ${config.encodingMethod} - ${config.size.width}x${
          config.size.height
        } (${result.pixelCount} pixels)${
          config.keepArtifacts ? `\n${config.outPath}` : ""
        }\n`
      );
      if (typeof cb === "function") cb(result);
    })
    .run();
};

module.exports = {
  binary: (config, payload, cb) => {
    console.log(config);
    let xml;
    try {
      xml = js2xmlparser.parse("data", JSON.parse(payload));
    } catch {
      xml = js2xmlparser.parse("data", payload);
    }
    const str = config.dataFormat === "xml" ? xml : JSON.stringify(payload);
    const buff = Buffer.from(str, "utf-8");
    const data64 = buff.toString("base64");
    const zipped = zlib.deflateSync(str).toString("base64");

    let f_overrunErrorDisplayed = false;
    let pixelCount = 0;
    config.size = calculateSize(config.size, data64.split("").length * 8);
    const bitmap = new bitmapManipulation.BMPBitmap(
      config.size.width,
      config.size.height
    );
    bitmap.drawFilledRect(
      0,
      0,
      config.size.width,
      config.size.height,
      null,
      0x00,
      null
    );
    let x = -1;
    const dataAsString = config.applyCompression
      ? zipped
      : config.b64
      ? data64
      : str;
    dataAsString.split("").forEach((char, idx) => {
      const byte = char.charCodeAt(0).toString(2).padStart(8, "0").split("");
      byte.forEach((bit, idx2) => {
        bit = parseInt(bit, 2);
        x = x ? x + 1 : 1;
        x = x >= config.size.width ? 0 : x;
        let y = Math.floor((idx * 8 + idx2) / config.size.width);
        bitmap.drawFilledRect(
          x,
          y,
          1,
          1,
          null,
          Number(`${bit === 1 ? "0xFF" : "0x00"}`, 16),
          null
        );
        pixelCount++;
        if (y > config.size.height && !f_overrunErrorDisplayed) {
          f_overrunErrorDisplayed = true;
          console.error(
            `OVERRUN!: Image dimensions ${JSON.stringify(
              config.size
            )} too small to store that much data`
          );
        }
      });
    });

    const outputImage = `${config.outPath}/data.bmp`;
    bitmap.save(outputImage);
    _generateVideo(config, outputImage, cb, {
      pixelCount,
      json: payload,
      xml,
      b64: buff.toString("base64"),
      mp4: `${config.outPath}/data.mp4`,
      bmp: `${config.outPath}/data.bmp`,
    });
  },

  naiveColor: (config, payload, cb) => {
    const xml = js2xmlparser.parse("data", JSON.parse(payload));
    const str = JSON.stringify(payload);
    const buff = Buffer.from(str, "utf-8");
    const data64 = buff.toString("base64");
    const zipped = zlib.deflateSync(str).toString("base64");

    let f_overrunErrorDisplayed = false;
    let pixelCount = 0;
    config.size = calculateSize(config.size, data64.split("").length);
    const bitmap = new bitmapManipulation.BMPBitmap(
      config.size.width,
      config.size.height
    );
    bitmap.drawFilledRect(
      0,
      0,
      config.size.width,
      config.size.height,
      null,
      0x00,
      null
    );

    let x = -1;
    const dataAsString = config.applyCompression
      ? zipped
      : config.b64
      ? data64
      : str;
    dataAsString.split("").forEach((char, idx) => {
      x = x ? x + 1 : 1;
      x = x >= config.size.width ? 0 : x;
      let y = Math.floor(idx / config.size.width);
      bitmap.drawFilledRect(
        x,
        y,
        1,
        1,
        null,
        Number(`0x${char.charCodeAt(0).toString(16)}`),
        null
      );
      pixelCount++;
      if (y > config.size.height && !f_overrunErrorDisplayed) {
        f_overrunErrorDisplayed = true;
        console.error(
          `OVERRUN!: Image dimensions ${JSON.stringify(
            config.size
          )} too small to store that much data`
        );
      }
    });
    const outputImage = `${config.outPath}/data.bmp`;
    bitmap.save(outputImage);
    _generateVideo(config, outputImage, cb, {
      pixelCount,
      json: payload,
      xml,
      b64: buff.toString("base64"),
      mp4: `${config.outPath}/data.mp4`,
      bmp: `${config.outPath}/data.bmp`,
    });
    return { pixelCount };
  },
};
