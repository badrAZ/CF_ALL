#!/usr/bin/env node

// Node libs
const assert = require("assert");
// Node modules
const PNG = require("./PNG");

const COLOR_TYPES = {
  hex: "hex",
  rgb: "rgb",
};

function parseInputs() {
  let [imagePath, colorType, nColors, nPixelsSkip] = process.argv.slice(2);

  assert(typeof imagePath === "string");
  assert(colorType in COLOR_TYPES);

  return {
    imagePath,
    colorType,
    nColors: +nColors,
    nPixelsSkip: +nPixelsSkip,
  };
}

// Only PNG files without Alan W. Paeth filter are supported
(async () => {
  const { imagePath, colorType, nColors, nPixelsSkip } = parseInputs();
  const png = new PNG();
  try {
    await png.open(imagePath);
    await png.ensurePngSignature();
    const { imageWidth, imageHeight, isCompressed, isRgb } = await png.readHeader();
    const { dataOffset, dataSize } = await png.getDataOffset();
    const occurrenceByColor = await png.readData({
      dataOffset,
      dataSize,
      imageHeight,
      imageWidth,
      isCompressed,
      shouldConvertToRgb: colorType === COLOR_TYPES.rgb,
      isRgb
    });

    // Sort/split results
    let result = Object.entries(occurrenceByColor).sort(
      ([, a], [, b]) => b - a
    );
    if (nColors) {
      result = result.slice(0, nColors);
    }

    // Log results
    result.forEach(([color, occ]) => console.log(`💨 ${color} (${occ})`))
  } finally {
    await png.close();
  }
})().catch(console.error);
