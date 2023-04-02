const fs = require("fs");
const bitmapManipulation = require("bitmap-manipulation");

module.exports = {
  naiveColor: (config, inputFile) => {
    if (!inputFile) return;
    let input = bitmapManipulation.BMPBitmap.fromFile(inputFile);
    let data64 = [];

    input._canvas._data.forEach((pixel) => {
      if (pixel !== 255) data64.push(String.fromCharCode(pixel));
    });

    data64 = data64.join("");
    const buff = Buffer.from(data64, "base64");
    fs.writeFile(`${config.outPath}/decode-test.b64`, data64, (err) => {
      if (err) return console.log(err);
    });
    const str = buff.toString("utf-8");
    fs.writeFile(`${config.outPath}/decode-test.json`, str, (err) => {
      if (err) return console.log(err);
    });
  },
  binary: (config, inputFile) => {
    if (!inputFile) return;
    let input = bitmapManipulation.BMPBitmap.fromFile(inputFile);
    let data64 = [];

    let bitCount = 1;
    let byte = "";
    input._canvas._data.forEach((pixel) => {
      byte += pixel === 255 ? "1" : "0";
      if (bitCount === 8) {
        const char = String.fromCharCode(parseInt(byte, 2).toString(10));
        data64.push(char);
        byte = "";
        bitCount = 0;
      }
      bitCount++;
    });

    data64 = data64.join("");
    const buff = Buffer.from(data64, "base64");
    fs.writeFile(`${config.outPath}/decode-test.b64`, data64, (err) => {
      if (err) return console.log(err);
    });
    const str = buff.toString("utf-8");
    fs.writeFile(`${config.outPath}/decode-test.txt`, str, (err) => {
      if (err) return console.log(err);
    });
  },
};
