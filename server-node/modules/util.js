const ffmpeg = require("fluent-ffmpeg");
const { decode } = require("./decode.js");
module.exports = {
  calculateSize: (size, pixelEstimate) => {
    if (size === "auto") {
      const nearestPow2 = (aSize) => {
        return Math.pow(2, Math.round(Math.log(aSize) / Math.log(2)));
      };
      let dim = nearestPow2(Math.ceil(Math.sqrt(pixelEstimate)));
      dim =
        dim <= 32
          ? dim * 2
          : dim < Math.ceil(Math.sqrt(pixelEstimate))
          ? dim * 2
          : dim;
      return {
        width: dim,
        height: dim,
      };
    } else {
      return size;
    }
  },
  grabFrame: (config, cb) => {
    ffmpeg(`${config.outPath}/data.mp4`)
      .outputOptions([
        "-frames:v 1",
        `-s ${config.size.width}x${config.size.height}`,
        "-f image2",
        "-pix_fmt bgr8",
      ])
      .output(`${config.outPath}/decode-framegrab.bmp`)
      .on("error", (err, stdout, stderr) =>
        console.log(err.message + stdout + stderr)
      )
      .on("end", () => cb(config, `${config.outPath}/decode-framegrab.bmp`))
      .run();
  },
};
