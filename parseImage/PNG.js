// Node libs
const assert = require("assert");
const openFile = require("fs/promises").open;
const promisify = require("node:util").promisify;
const inflate = promisify(require("node:zlib").inflate);

// UTILS
const HEX_PNG_SIGNATURE = "89504e470d0a1a0a";
const TRANSFORMERS = {
  identity: (buf) => buf,
  utf8: (buf) => buf.toString("utf8"),
  hex: (buf) => buf.toString("hex"),
  int32: (buf) => buf.readUInt32BE(),
  int8: (buf) => buf.readUInt8(),
  rgbToHex: ([r, g, b]) => {
    const toHex = (v) => Number(v).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  },
};
const SIZES = {
  signature: 8,
  chunk: {
    size: 4,
    type: 4,
    crc: 4,
  },
  headerSize: 25,
  header: {
    width: 4,
    height: 4,
    bitDepth: 1,
    colorType: 1,
    compression: 1,
    filter: 1,
    interface: 1,
  },
  data: {
    filter: 1,
    rgbPixel: 3, // RGB
    rgbaPixel: 4, // RGBa
  },
};
const OFFSETS = {
  signature: 0,
  header: SIZES.signature,
};
const CODES = {
  compression: 0,
  filter: 0,
  colorType: {
    rgp: 2,
    alpha: [4, 6],
  },
};
const TYPES = {
  header: "IHDR",
  data: "IDAT",
};
const FILTERS = {
  none: 0,
  sub: 1,
  up: 2,
  average: 3,
  paeth: 4,
};

//          <- Pixel ->
// filter   R    G    B    R    G    B    R    G    B
//   O     255   0    0    0   255   0    0    0   255
//   1     255   0    0    0    0    0    0    0    0
const FILTER_HANDLERS = {
  [FILTERS.none]: ({ data, x }) => [data[x], data[x + 1], data[x + 2]],
  [FILTERS.sub]: (params) => {
    const currentRGB = FILTER_HANDLERS[FILTERS.none](params);
    const { x, start, data, nPixels } = params;
    if (x === start) {
      return currentRGB;
    }

    const leftRIndex = x - nPixels;
    return currentRGB.map((value, key) => value + data[leftRIndex + key]);
  },
  [FILTERS.up]: (params) => {
    const currentRGB = FILTER_HANDLERS[FILTERS.none](params);
    const { x, y, width, data, nPixels } = params;
    if (y === 0) {
      return currentRGB;
    }

    const upRIndex = x - width * nPixels - SIZES.data.filter;
    return currentRGB.map((value, key) => value + data[upRIndex + key]);
  },
  [FILTERS.average]: (params) => {
    const currentRGB = FILTER_HANDLERS[FILTERS.none](params);
    const rgbWithSubFilter = FILTER_HANDLERS[FILTERS.sub](params);
    const rgbWithUpFilter = FILTER_HANDLERS[FILTERS.up](params);
    return currentRGB.map(
      (value, key) =>
        value + Math.floor((rgbWithSubFilter[key] + rgbWithUpFilter[key]) / 2)
    );
  },
};

/*
  sources:
    - https://fr.wikipedia.org/wiki/Portable_Network_Graphics
    - https://www.w3.org/TR/PNG-Chunks.html

  -------------------- PNG structure ---------------------------
  .
  ┣ 📦 SIGNATURE                                           (8 B)
  ┣ 📦 HEADER                                              (25 B)
  ┃ ┣ 📜 size                                              (4 B)
  ┃ ┣ 📜 type (IHDR)                                       (4 B)
  ┃ ┣ 📜 width                                             (4 B)
  ┃ ┣ 📜 height                                            (4 B)
  ┃ ┣ 📜 bit depth                                         (1 B)
  ┃ ┣ 📜 color type                                        (1 B)
  ┃ ┣ 📜 compression method                                (1 B)
  ┃ ┣ 📜 filter method                                     (1 B)
  ┃ ┣ 📜 interface method                                  (1 B)
  ┃ ┗ 📜 CRC-32 (Validation hash)                          (4 B)
  ┣ 📦 Other chunks disordered
  ┣ 📦 DATA                                                (12B + DATA size)
  ┃ ┣ 📜 size                                              (4 B)
  ┃ ┣ 📜 type (IDAT)                                       (4 B)
  ┃ ┣ 📜 data                                              (DATA size)
  ┃ ┗ 📜 CRC-32                                            (4 B)
  ┣ 📦 Other chunks disordered
  ┗ 📦 END                                                 (12 B)
  ┃ ┣ 📜 size                                              (4 B)
  ┃ ┣ 📜 type (IEND)                                       (4 B)
  ┗ ┗ 📜 CRC-32                                            (4 B)
  --------------------------------------------------------------- 
*/
module.exports = class PNG {
  #fd = undefined;

  async open(path) {
    this.#fd = await openFile(path, "r");
  }

  close() {
    return this.#fd?.close();
  }

  async readBytes(bytes, offset = 0, transform = TRANSFORMERS.identity) {
    const { buffer } = await this.#fd.read(
      Buffer.alloc(bytes),
      0,
      bytes,
      offset
    );
    return transform(buffer);
  }

  async ensurePngSignature() {
    const signature = await this.readBytes(
      SIZES.signature,
      OFFSETS.signature,
      TRANSFORMERS.hex
    );
    assert(signature === HEX_PNG_SIGNATURE);
  }

  async readHeader() {
    const typeSize = SIZES.chunk.type;
    const typeOffset = OFFSETS.header + SIZES.chunk.size;
    const type = await this.readBytes(typeSize, typeOffset, TRANSFORMERS.utf8);
    assert(type === TYPES.header);

    const widthSize = SIZES.header.width;
    const widthOffset = typeOffset + typeSize;
    const imageWidth = await this.readBytes(
      widthSize,
      widthOffset,
      TRANSFORMERS.int32
    );

    const heightSize = SIZES.header.height;
    const heightOffset = widthOffset + widthSize;
    const imageHeight = await this.readBytes(
      heightSize,
      heightOffset,
      TRANSFORMERS.int32
    );

    const colorTypeSize = SIZES.header.colorType;
    const colorTypeOffset = heightOffset + heightSize + SIZES.header.bitDepth;
    const colorType = await this.readBytes(
      colorTypeSize,
      colorTypeOffset,
      TRANSFORMERS.int8
    );
    const isRgb = colorType === CODES.colorType.rgp;
    // only rgb and rgba are supported
    assert(isRgb || CODES.colorType.alpha.includes(colorType));

    const compressionSize = SIZES.header.compression;
    const compressionOffset = colorTypeOffset + colorTypeSize;
    const compressionCode = await this.readBytes(
      compressionSize,
      compressionOffset,
      TRANSFORMERS.int8
    );
    // only deflate/inflate with code is supported regarding specs
    assert(!compressionCode);
    const isCompressed = compressionCode === CODES.compression;

    const filterSize = SIZES.header.filter;
    const filterOffset = compressionOffset + compressionSize;
    const filterCode = await this.readBytes(
      filterSize,
      filterOffset,
      TRANSFORMERS.int8
    );
    // only filter with code 0 is supported regarding specs
    assert(filterCode === CODES.filter);

    return {
      imageWidth,
      imageHeight,
      isCompressed,
      isRgb,
    };
  }

  async getDataOffset(dataOffset) {
    dataOffset ??= OFFSETS.header + SIZES.headerSize;
    const chunkDataSize = SIZES.chunk.size;
    const dataSize = await this.readBytes(
      chunkDataSize,
      dataOffset,
      TRANSFORMERS.int32
    );

    const typeSize = SIZES.chunk.type;
    const typeOffset = dataOffset + chunkDataSize;
    const type = await this.readBytes(typeSize, typeOffset, TRANSFORMERS.utf8);

    return type === TYPES.data
      ? {
          dataOffset,
          dataSize,
        }
      : this.getDataOffset(typeOffset + typeSize + dataSize + SIZES.chunk.crc);
  }

  async readData({
    dataOffset,
    dataSize,
    imageHeight,
    imageWidth,
    isRgb,
    isCompressed,
    shouldConvertToRgb,
  }) {
    const contentOffset = dataOffset + SIZES.chunk.size + SIZES.chunk.type;
    const data = await this.readBytes(
      dataSize,
      contentOffset,
      isCompressed ? inflate : undefined
    );
    const nPixels = isRgb ? SIZES.data.rgbPixel : SIZES.data.rgbaPixel;

    const occurrenceByColor = {};
    for (let y = 0; y < imageHeight; y++) {
      const filterOffset = (imageWidth * nPixels + SIZES.data.filter) * y;
      const filter = data[filterOffset];

      const start = filterOffset + SIZES.data.filter;
      const end = start + imageWidth * nPixels;

      const handler = FILTER_HANDLERS[filter];
      assert(!!handler);

      for (let x = start; x < end; x += nPixels) {
        const rgb = handler({ x, y, start, width: imageWidth, data, nPixels });

        // mutate data for next loops, required by filters logic
        rgb.forEach((v, k) => {
          data[x + k] = v;
        });

        const key = shouldConvertToRgb
          ? rgb.join(",")
          : TRANSFORMERS.rgbToHex(rgb);
        occurrenceByColor[key] ??= 0;
        occurrenceByColor[key]++;
      }
    }

    return occurrenceByColor;
  }
};
