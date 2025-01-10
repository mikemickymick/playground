var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// helpers/utf8.js
var require_utf8 = __commonJS({
  "helpers/utf8.js"(exports) {
    (function(root) {
      var stringFromCharCode = String.fromCharCode;
      function ucs2decode(string) {
        var output = [];
        var counter = 0;
        var length = string.length;
        var value;
        var extra;
        while (counter < length) {
          value = string.charCodeAt(counter++);
          if (value >= 55296 && value <= 56319 && counter < length) {
            extra = string.charCodeAt(counter++);
            if ((extra & 64512) == 56320) {
              output.push(((value & 1023) << 10) + (extra & 1023) + 65536);
            } else {
              output.push(value);
              counter--;
            }
          } else {
            output.push(value);
          }
        }
        return output;
      }
      function ucs2encode(array) {
        var length = array.length;
        var index = -1;
        var value;
        var output = "";
        while (++index < length) {
          value = array[index];
          if (value > 65535) {
            value -= 65536;
            output += stringFromCharCode(value >>> 10 & 1023 | 55296);
            value = 56320 | value & 1023;
          }
          output += stringFromCharCode(value);
        }
        return output;
      }
      function checkScalarValue(codePoint) {
        if (codePoint >= 55296 && codePoint <= 57343) {
          throw Error(
            "Lone surrogate U+" + codePoint.toString(16).toUpperCase() + " is not a scalar value"
          );
        }
      }
      function createByte(codePoint, shift) {
        return stringFromCharCode(codePoint >> shift & 63 | 128);
      }
      function encodeCodePoint(codePoint) {
        if ((codePoint & 4294967168) == 0) {
          return stringFromCharCode(codePoint);
        }
        var symbol = "";
        if ((codePoint & 4294965248) == 0) {
          symbol = stringFromCharCode(codePoint >> 6 & 31 | 192);
        } else if ((codePoint & 4294901760) == 0) {
          checkScalarValue(codePoint);
          symbol = stringFromCharCode(codePoint >> 12 & 15 | 224);
          symbol += createByte(codePoint, 6);
        } else if ((codePoint & 4292870144) == 0) {
          symbol = stringFromCharCode(codePoint >> 18 & 7 | 240);
          symbol += createByte(codePoint, 12);
          symbol += createByte(codePoint, 6);
        }
        symbol += stringFromCharCode(codePoint & 63 | 128);
        return symbol;
      }
      function utf8encode(string) {
        var codePoints = ucs2decode(string);
        var length = codePoints.length;
        var index = -1;
        var codePoint;
        var byteString = "";
        while (++index < length) {
          codePoint = codePoints[index];
          byteString += encodeCodePoint(codePoint);
        }
        return byteString;
      }
      function readContinuationByte() {
        if (byteIndex >= byteCount) {
          throw Error("Invalid byte index");
        }
        var continuationByte = byteArray[byteIndex] & 255;
        byteIndex++;
        if ((continuationByte & 192) == 128) {
          return continuationByte & 63;
        }
        throw Error("Invalid continuation byte");
      }
      function decodeSymbol() {
        var byte1;
        var byte2;
        var byte3;
        var byte4;
        var codePoint;
        if (byteIndex > byteCount) {
          throw Error("Invalid byte index");
        }
        if (byteIndex == byteCount) {
          return false;
        }
        byte1 = byteArray[byteIndex] & 255;
        byteIndex++;
        if ((byte1 & 128) == 0) {
          return byte1;
        }
        if ((byte1 & 224) == 192) {
          byte2 = readContinuationByte();
          codePoint = (byte1 & 31) << 6 | byte2;
          if (codePoint >= 128) {
            return codePoint;
          } else {
            throw Error("Invalid continuation byte");
          }
        }
        if ((byte1 & 240) == 224) {
          byte2 = readContinuationByte();
          byte3 = readContinuationByte();
          codePoint = (byte1 & 15) << 12 | byte2 << 6 | byte3;
          if (codePoint >= 2048) {
            checkScalarValue(codePoint);
            return codePoint;
          } else {
            throw Error("Invalid continuation byte");
          }
        }
        if ((byte1 & 248) == 240) {
          byte2 = readContinuationByte();
          byte3 = readContinuationByte();
          byte4 = readContinuationByte();
          codePoint = (byte1 & 7) << 18 | byte2 << 12 | byte3 << 6 | byte4;
          if (codePoint >= 65536 && codePoint <= 1114111) {
            return codePoint;
          }
        }
        throw Error("Invalid UTF-8 detected");
      }
      var byteArray;
      var byteCount;
      var byteIndex;
      function utf8decode(byteString) {
        byteArray = ucs2decode(byteString);
        byteCount = byteArray.length;
        byteIndex = 0;
        var codePoints = [];
        var tmp;
        while ((tmp = decodeSymbol()) !== false) {
          codePoints.push(tmp);
        }
        return ucs2encode(codePoints);
      }
      root.version = "3.0.0";
      root.encode = utf8encode;
      root.decode = utf8decode;
    })(typeof exports === "undefined" ? exports.utf8 = {} : exports);
  }
});

// models/metricmodules.js
var MetricModule = class {
  constructor(name, required, width, height) {
    this.Name = name;
    this.Required = required;
    this.Width = width;
    this.Height = height;
    this.Area = width * height;
  }
};
var ChatComposition = class extends MetricModule {
  constructor(chatters) {
    super("Chat Composition", true, 1, 2);
    this.Chatters = chatters;
  }
};
var FirstEncounter = class extends MetricModule {
  constructor(firstMessageDate, firstMessageTime, firstChatterName, firstMessage, replyMessageDate, replyMessageTime, replyingChatterName, replyMessage) {
    super("First Encounter", true, 2, 2);
    this.FirstMessageDate = firstMessageDate;
    this.FirstMessageTime = firstMessageTime;
    this.FirstChatterName = firstChatterName;
    this.FirstMessageBody = firstMessage;
    this.ReplyMessageDate = replyMessageDate;
    this.ReplyMessageTime = replyMessageTime;
    this.ReplyingChatterName = replyingChatterName;
    this.ReplyMessage = replyMessage;
  }
};
var MessageDays = class extends MetricModule {
  constructor(messageDaysTable) {
    super("Message Days", false, 2, 2);
    this.MessageDaysTable = messageDaysTable;
  }
};
var MessageTimes = class extends MetricModule {
  constructor(messageTimesTable) {
    super("Message Times", false, 2, 2);
    this.MessageTimesTable = messageTimesTable;
  }
};
var TopWords = class extends MetricModule {
  constructor(topWordsTable) {
    super("Top Words", false, 1, 2);
    this.TopWordsTable = topWordsTable;
  }
};

// models/products.js
var Product = class {
  constructor(productName, productCode, sendRequestToPoD) {
    this.ProductName = productName;
    this.ProductCode = productCode;
    this.SendRequestToPoD = sendRequestToPoD;
  }
};
var ChatChart = class extends Product {
  constructor(productCode, chatters, startDate, endDate) {
    super("Chat Chart", productCode, false);
    this.Chatters = chatters;
    this.StartDate = startDate;
    this.EndDate = endDate;
    this.MetricModules = /* @__PURE__ */ new Map();
    this.ProgressPercent = 0;
  }
  AddMetricModule(metricModule) {
    let areaSum = 0;
    for (const value of this.MetricModules.values()) {
      areaSum += value.Area;
    }
    if (areaSum > 24) {
      alert("Sorry, we can't fit any more graphics on your Chat Chart! Try removing something.");
    } else {
      this.MetricModules.set(metricModule, true);
      this.ProgressPercent += Math.round(metricModule.Area * 100 / 24);
    }
  }
  RemoveMetricModule(metricModule) {
    if (!this.MetricModules.has(metricModule)) {
      return;
    }
    const moduleArea = metricModule.Area;
    this.ProgressPercent -= Math.round(moduleArea * 100 / 24);
    this.MetricModules.delete(metricModule);
  }
};

// models/chatter.js
var Chatter = class {
  constructor(authorNumber, name, messageCount, messagePercent, wordCount, minutesSpentMessaging, timesSpentMessagingString, emojiCount, swearCount, averageMessageLength) {
    this.AuthorNumber = authorNumber;
    this.Name = name;
    this.MessageCount = messageCount;
    this.MessagePercent = messagePercent;
    this.WordCount = wordCount;
    this.MinutesSpentMessaging = minutesSpentMessaging;
    this.TimeSpentMessagingString = timesSpentMessagingString;
    this.EmojiCount = emojiCount;
    this.SwearCount = swearCount;
    this.AverageMessageLength = averageMessageLength;
  }
};

// zip.bundle.js
var MAX_BITS = 15;
var D_CODES = 30;
var BL_CODES = 19;
var LITERALS = 256;
var L_CODES = 256 + 1 + 29;
var HEAP_SIZE = 2 * L_CODES + 1;
var END_BLOCK = 256;
var MAX_BL_BITS = 7;
var Buf_size = 8 * 2;
var Z_DEFAULT_COMPRESSION = -1;
var Z_HUFFMAN_ONLY = 2;
var Z_DEFAULT_STRATEGY = 0;
var Z_NO_FLUSH = 0;
var Z_PARTIAL_FLUSH = 1;
var Z_FULL_FLUSH = 3;
var Z_FINISH = 4;
var Z_OK = 0;
var Z_STREAM_END = 1;
var Z_NEED_DICT = 2;
var Z_STREAM_ERROR = -2;
var Z_DATA_ERROR = -3;
var Z_BUF_ERROR = -5;
function extractArray(array) {
  return flatArray(array.map(([length, value]) => new Array(length).fill(value, 0, length)));
}
function flatArray(array) {
  return array.reduce((a, b) => a.concat(Array.isArray(b) ? flatArray(b) : b), []);
}
var _dist_code = [
  0,
  1,
  2,
  3
].concat(...extractArray([
  [
    2,
    4
  ],
  [
    2,
    5
  ],
  [
    4,
    6
  ],
  [
    4,
    7
  ],
  [
    8,
    8
  ],
  [
    8,
    9
  ],
  [
    16,
    10
  ],
  [
    16,
    11
  ],
  [
    32,
    12
  ],
  [
    32,
    13
  ],
  [
    64,
    14
  ],
  [
    64,
    15
  ],
  [
    2,
    0
  ],
  [
    1,
    16
  ],
  [
    1,
    17
  ],
  [
    2,
    18
  ],
  [
    2,
    19
  ],
  [
    4,
    20
  ],
  [
    4,
    21
  ],
  [
    8,
    22
  ],
  [
    8,
    23
  ],
  [
    16,
    24
  ],
  [
    16,
    25
  ],
  [
    32,
    26
  ],
  [
    32,
    27
  ],
  [
    64,
    28
  ],
  [
    64,
    29
  ]
]));
function Tree() {
  const that = this;
  function gen_bitlen(s) {
    const tree = that.dyn_tree;
    const stree = that.stat_desc.static_tree;
    const extra = that.stat_desc.extra_bits;
    const base = that.stat_desc.extra_base;
    const max_length = that.stat_desc.max_length;
    let h;
    let n, m;
    let bits;
    let xbits;
    let f;
    let overflow = 0;
    for (bits = 0; bits <= 15; bits++)
      s.bl_count[bits] = 0;
    tree[s.heap[s.heap_max] * 2 + 1] = 0;
    for (h = s.heap_max + 1; h < HEAP_SIZE; h++) {
      n = s.heap[h];
      bits = tree[tree[n * 2 + 1] * 2 + 1] + 1;
      if (bits > max_length) {
        bits = max_length;
        overflow++;
      }
      tree[n * 2 + 1] = bits;
      if (n > that.max_code)
        continue;
      s.bl_count[bits]++;
      xbits = 0;
      if (n >= base)
        xbits = extra[n - base];
      f = tree[n * 2];
      s.opt_len += f * (bits + xbits);
      if (stree)
        s.static_len += f * (stree[n * 2 + 1] + xbits);
    }
    if (overflow === 0)
      return;
    do {
      bits = max_length - 1;
      while (s.bl_count[bits] === 0)
        bits--;
      s.bl_count[bits]--;
      s.bl_count[bits + 1] += 2;
      s.bl_count[max_length]--;
      overflow -= 2;
    } while (overflow > 0);
    for (bits = max_length; bits !== 0; bits--) {
      n = s.bl_count[bits];
      while (n !== 0) {
        m = s.heap[--h];
        if (m > that.max_code)
          continue;
        if (tree[m * 2 + 1] != bits) {
          s.opt_len += (bits - tree[m * 2 + 1]) * tree[m * 2];
          tree[m * 2 + 1] = bits;
        }
        n--;
      }
    }
  }
  function bi_reverse(code, len) {
    let res = 0;
    do {
      res |= code & 1;
      code >>>= 1;
      res <<= 1;
    } while (--len > 0);
    return res >>> 1;
  }
  function gen_codes(tree, max_code, bl_count) {
    const next_code = [];
    let code = 0;
    let bits;
    let n;
    let len;
    for (bits = 1; bits <= 15; bits++) {
      next_code[bits] = code = code + bl_count[bits - 1] << 1;
    }
    for (n = 0; n <= max_code; n++) {
      len = tree[n * 2 + 1];
      if (len === 0)
        continue;
      tree[n * 2] = bi_reverse(next_code[len]++, len);
    }
  }
  that.build_tree = function(s) {
    const tree = that.dyn_tree;
    const stree = that.stat_desc.static_tree;
    const elems = that.stat_desc.elems;
    let n, m;
    let max_code = -1;
    let node;
    s.heap_len = 0;
    s.heap_max = HEAP_SIZE;
    for (n = 0; n < elems; n++) {
      if (tree[n * 2] !== 0) {
        s.heap[++s.heap_len] = max_code = n;
        s.depth[n] = 0;
      } else {
        tree[n * 2 + 1] = 0;
      }
    }
    while (s.heap_len < 2) {
      node = s.heap[++s.heap_len] = max_code < 2 ? ++max_code : 0;
      tree[node * 2] = 1;
      s.depth[node] = 0;
      s.opt_len--;
      if (stree)
        s.static_len -= stree[node * 2 + 1];
    }
    that.max_code = max_code;
    for (n = Math.floor(s.heap_len / 2); n >= 1; n--)
      s.pqdownheap(tree, n);
    node = elems;
    do {
      n = s.heap[1];
      s.heap[1] = s.heap[s.heap_len--];
      s.pqdownheap(tree, 1);
      m = s.heap[1];
      s.heap[--s.heap_max] = n;
      s.heap[--s.heap_max] = m;
      tree[node * 2] = tree[n * 2] + tree[m * 2];
      s.depth[node] = Math.max(s.depth[n], s.depth[m]) + 1;
      tree[n * 2 + 1] = tree[m * 2 + 1] = node;
      s.heap[1] = node++;
      s.pqdownheap(tree, 1);
    } while (s.heap_len >= 2);
    s.heap[--s.heap_max] = s.heap[1];
    gen_bitlen(s);
    gen_codes(tree, that.max_code, s.bl_count);
  };
}
Tree._length_code = [
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7
].concat(...extractArray([
  [
    2,
    8
  ],
  [
    2,
    9
  ],
  [
    2,
    10
  ],
  [
    2,
    11
  ],
  [
    4,
    12
  ],
  [
    4,
    13
  ],
  [
    4,
    14
  ],
  [
    4,
    15
  ],
  [
    8,
    16
  ],
  [
    8,
    17
  ],
  [
    8,
    18
  ],
  [
    8,
    19
  ],
  [
    16,
    20
  ],
  [
    16,
    21
  ],
  [
    16,
    22
  ],
  [
    16,
    23
  ],
  [
    32,
    24
  ],
  [
    32,
    25
  ],
  [
    32,
    26
  ],
  [
    31,
    27
  ],
  [
    1,
    28
  ]
]));
Tree.base_length = [
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  10,
  12,
  14,
  16,
  20,
  24,
  28,
  32,
  40,
  48,
  56,
  64,
  80,
  96,
  112,
  128,
  160,
  192,
  224,
  0
];
Tree.base_dist = [
  0,
  1,
  2,
  3,
  4,
  6,
  8,
  12,
  16,
  24,
  32,
  48,
  64,
  96,
  128,
  192,
  256,
  384,
  512,
  768,
  1024,
  1536,
  2048,
  3072,
  4096,
  6144,
  8192,
  12288,
  16384,
  24576
];
Tree.d_code = function(dist) {
  return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
};
Tree.extra_lbits = [
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0
];
Tree.extra_dbits = [
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13
];
Tree.extra_blbits = [
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  2,
  3,
  7
];
Tree.bl_order = [
  16,
  17,
  18,
  0,
  8,
  7,
  9,
  6,
  10,
  5,
  11,
  4,
  12,
  3,
  13,
  2,
  14,
  1,
  15
];
function StaticTree(static_tree, extra_bits, extra_base, elems, max_length) {
  const that = this;
  that.static_tree = static_tree;
  that.extra_bits = extra_bits;
  that.extra_base = extra_base;
  that.elems = elems;
  that.max_length = max_length;
}
var static_ltree2_first_part = [
  12,
  140,
  76,
  204,
  44,
  172,
  108,
  236,
  28,
  156,
  92,
  220,
  60,
  188,
  124,
  252,
  2,
  130,
  66,
  194,
  34,
  162,
  98,
  226,
  18,
  146,
  82,
  210,
  50,
  178,
  114,
  242,
  10,
  138,
  74,
  202,
  42,
  170,
  106,
  234,
  26,
  154,
  90,
  218,
  58,
  186,
  122,
  250,
  6,
  134,
  70,
  198,
  38,
  166,
  102,
  230,
  22,
  150,
  86,
  214,
  54,
  182,
  118,
  246,
  14,
  142,
  78,
  206,
  46,
  174,
  110,
  238,
  30,
  158,
  94,
  222,
  62,
  190,
  126,
  254,
  1,
  129,
  65,
  193,
  33,
  161,
  97,
  225,
  17,
  145,
  81,
  209,
  49,
  177,
  113,
  241,
  9,
  137,
  73,
  201,
  41,
  169,
  105,
  233,
  25,
  153,
  89,
  217,
  57,
  185,
  121,
  249,
  5,
  133,
  69,
  197,
  37,
  165,
  101,
  229,
  21,
  149,
  85,
  213,
  53,
  181,
  117,
  245,
  13,
  141,
  77,
  205,
  45,
  173,
  109,
  237,
  29,
  157,
  93,
  221,
  61,
  189,
  125,
  253,
  19,
  275,
  147,
  403,
  83,
  339,
  211,
  467,
  51,
  307,
  179,
  435,
  115,
  371,
  243,
  499,
  11,
  267,
  139,
  395,
  75,
  331,
  203,
  459,
  43,
  299,
  171,
  427,
  107,
  363,
  235,
  491,
  27,
  283,
  155,
  411,
  91,
  347,
  219,
  475,
  59,
  315,
  187,
  443,
  123,
  379,
  251,
  507,
  7,
  263,
  135,
  391,
  71,
  327,
  199,
  455,
  39,
  295,
  167,
  423,
  103,
  359,
  231,
  487,
  23,
  279,
  151,
  407,
  87,
  343,
  215,
  471,
  55,
  311,
  183,
  439,
  119,
  375,
  247,
  503,
  15,
  271,
  143,
  399,
  79,
  335,
  207,
  463,
  47,
  303,
  175,
  431,
  111,
  367,
  239,
  495,
  31,
  287,
  159,
  415,
  95,
  351,
  223,
  479,
  63,
  319,
  191,
  447,
  127,
  383,
  255,
  511,
  0,
  64,
  32,
  96,
  16,
  80,
  48,
  112,
  8,
  72,
  40,
  104,
  24,
  88,
  56,
  120,
  4,
  68,
  36,
  100,
  20,
  84,
  52,
  116,
  3,
  131,
  67,
  195,
  35,
  163,
  99,
  227
];
var static_ltree2_second_part = extractArray([
  [
    144,
    8
  ],
  [
    112,
    9
  ],
  [
    24,
    7
  ],
  [
    8,
    8
  ]
]);
StaticTree.static_ltree = flatArray(static_ltree2_first_part.map((value, index) => [
  value,
  static_ltree2_second_part[index]
]));
var static_dtree_first_part = [
  0,
  16,
  8,
  24,
  4,
  20,
  12,
  28,
  2,
  18,
  10,
  26,
  6,
  22,
  14,
  30,
  1,
  17,
  9,
  25,
  5,
  21,
  13,
  29,
  3,
  19,
  11,
  27,
  7,
  23
];
var static_dtree_second_part = extractArray([
  [
    30,
    5
  ]
]);
StaticTree.static_dtree = flatArray(static_dtree_first_part.map((value, index) => [
  value,
  static_dtree_second_part[index]
]));
StaticTree.static_l_desc = new StaticTree(StaticTree.static_ltree, Tree.extra_lbits, LITERALS + 1, L_CODES, MAX_BITS);
StaticTree.static_d_desc = new StaticTree(StaticTree.static_dtree, Tree.extra_dbits, 0, D_CODES, MAX_BITS);
StaticTree.static_bl_desc = new StaticTree(null, Tree.extra_blbits, 0, BL_CODES, MAX_BL_BITS);
var MAX_MEM_LEVEL = 9;
var DEF_MEM_LEVEL = 8;
function Config(good_length, max_lazy, nice_length, max_chain, func) {
  const that = this;
  that.good_length = good_length;
  that.max_lazy = max_lazy;
  that.nice_length = nice_length;
  that.max_chain = max_chain;
  that.func = func;
}
var STORED = 0;
var FAST = 1;
var SLOW = 2;
var config_table = [
  new Config(0, 0, 0, 0, 0),
  new Config(4, 4, 8, 4, 1),
  new Config(4, 5, 16, 8, 1),
  new Config(4, 6, 32, 32, 1),
  new Config(4, 4, 16, 16, 2),
  new Config(8, 16, 32, 32, 2),
  new Config(8, 16, 128, 128, 2),
  new Config(8, 32, 128, 256, 2),
  new Config(32, 128, 258, 1024, 2),
  new Config(32, 258, 258, 4096, 2)
];
var z_errmsg = [
  "need dictionary",
  "stream end",
  "",
  "",
  "stream error",
  "data error",
  "",
  "buffer error",
  "",
  ""
];
var NeedMore = 0;
var BlockDone = 1;
var FinishStarted = 2;
var FinishDone = 3;
var PRESET_DICT = 32;
var INIT_STATE = 42;
var BUSY_STATE = 113;
var FINISH_STATE = 666;
var Z_DEFLATED = 8;
var MIN_MATCH = 3;
var MAX_MATCH = 258;
var MIN_LOOKAHEAD = 258 + 3 + 1;
function smaller(tree, n, m, depth) {
  const tn2 = tree[n * 2];
  const tm2 = tree[m * 2];
  return tn2 < tm2 || tn2 == tm2 && depth[n] <= depth[m];
}
function Deflate() {
  const that = this;
  let strm;
  let status;
  let pending_buf_size;
  let last_flush;
  let w_size;
  let w_bits;
  let w_mask;
  let win;
  let window_size;
  let prev;
  let head;
  let ins_h;
  let hash_size;
  let hash_bits;
  let hash_mask;
  let hash_shift;
  let block_start;
  let match_length;
  let prev_match;
  let match_available;
  let strstart;
  let match_start;
  let lookahead;
  let prev_length;
  let max_chain_length;
  let max_lazy_match;
  let level;
  let strategy;
  let good_match;
  let nice_match;
  let dyn_ltree;
  let dyn_dtree;
  let bl_tree;
  const l_desc = new Tree();
  const d_desc = new Tree();
  const bl_desc = new Tree();
  that.depth = [];
  let lit_bufsize;
  let last_lit;
  let matches;
  let last_eob_len;
  let bi_buf;
  let bi_valid;
  that.bl_count = [];
  that.heap = [];
  dyn_ltree = [];
  dyn_dtree = [];
  bl_tree = [];
  function lm_init() {
    window_size = 2 * w_size;
    head[hash_size - 1] = 0;
    for (let i = 0; i < hash_size - 1; i++) {
      head[i] = 0;
    }
    max_lazy_match = config_table[level].max_lazy;
    good_match = config_table[level].good_length;
    nice_match = config_table[level].nice_length;
    max_chain_length = config_table[level].max_chain;
    strstart = 0;
    block_start = 0;
    lookahead = 0;
    match_length = prev_length = MIN_MATCH - 1;
    match_available = 0;
    ins_h = 0;
  }
  function init_block() {
    let i;
    for (i = 0; i < L_CODES; i++)
      dyn_ltree[i * 2] = 0;
    for (i = 0; i < 30; i++)
      dyn_dtree[i * 2] = 0;
    for (i = 0; i < 19; i++)
      bl_tree[i * 2] = 0;
    dyn_ltree[END_BLOCK * 2] = 1;
    that.opt_len = that.static_len = 0;
    last_lit = matches = 0;
  }
  function tr_init() {
    l_desc.dyn_tree = dyn_ltree;
    l_desc.stat_desc = StaticTree.static_l_desc;
    d_desc.dyn_tree = dyn_dtree;
    d_desc.stat_desc = StaticTree.static_d_desc;
    bl_desc.dyn_tree = bl_tree;
    bl_desc.stat_desc = StaticTree.static_bl_desc;
    bi_buf = 0;
    bi_valid = 0;
    last_eob_len = 8;
    init_block();
  }
  that.pqdownheap = function(tree, k) {
    const heap = that.heap;
    const v = heap[k];
    let j = k << 1;
    while (j <= that.heap_len) {
      if (j < that.heap_len && smaller(tree, heap[j + 1], heap[j], that.depth)) {
        j++;
      }
      if (smaller(tree, v, heap[j], that.depth))
        break;
      heap[k] = heap[j];
      k = j;
      j <<= 1;
    }
    heap[k] = v;
  };
  function scan_tree(tree, max_code) {
    let prevlen = -1;
    let curlen;
    let nextlen = tree[0 * 2 + 1];
    let count = 0;
    let max_count = 7;
    let min_count = 4;
    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;
    }
    tree[(max_code + 1) * 2 + 1] = 65535;
    for (let n = 0; n <= max_code; n++) {
      curlen = nextlen;
      nextlen = tree[(n + 1) * 2 + 1];
      if (++count < max_count && curlen == nextlen) {
        continue;
      } else if (count < min_count) {
        bl_tree[curlen * 2] += count;
      } else if (curlen !== 0) {
        if (curlen != prevlen)
          bl_tree[curlen * 2]++;
        bl_tree[16 * 2]++;
      } else if (count <= 10) {
        bl_tree[17 * 2]++;
      } else {
        bl_tree[18 * 2]++;
      }
      count = 0;
      prevlen = curlen;
      if (nextlen === 0) {
        max_count = 138;
        min_count = 3;
      } else if (curlen == nextlen) {
        max_count = 6;
        min_count = 3;
      } else {
        max_count = 7;
        min_count = 4;
      }
    }
  }
  function build_bl_tree() {
    let max_blindex;
    scan_tree(dyn_ltree, l_desc.max_code);
    scan_tree(dyn_dtree, d_desc.max_code);
    bl_desc.build_tree(that);
    for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) {
      if (bl_tree[Tree.bl_order[max_blindex] * 2 + 1] !== 0)
        break;
    }
    that.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
    return max_blindex;
  }
  function put_byte(p) {
    that.pending_buf[that.pending++] = p;
  }
  function put_short(w) {
    put_byte(w & 255);
    put_byte(w >>> 8 & 255);
  }
  function putShortMSB(b) {
    put_byte(b >> 8 & 255);
    put_byte(b & 255 & 255);
  }
  function send_bits(value, length) {
    let val;
    const len = length;
    if (bi_valid > Buf_size - len) {
      val = value;
      bi_buf |= val << bi_valid & 65535;
      put_short(bi_buf);
      bi_buf = val >>> Buf_size - bi_valid;
      bi_valid += len - Buf_size;
    } else {
      bi_buf |= value << bi_valid & 65535;
      bi_valid += len;
    }
  }
  function send_code(c, tree) {
    const c2 = c * 2;
    send_bits(tree[c2] & 65535, tree[c2 + 1] & 65535);
  }
  function send_tree(tree, max_code) {
    let n;
    let prevlen = -1;
    let curlen;
    let nextlen = tree[0 * 2 + 1];
    let count = 0;
    let max_count = 7;
    let min_count = 4;
    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;
    }
    for (n = 0; n <= max_code; n++) {
      curlen = nextlen;
      nextlen = tree[(n + 1) * 2 + 1];
      if (++count < max_count && curlen == nextlen) {
        continue;
      } else if (count < min_count) {
        do {
          send_code(curlen, bl_tree);
        } while (--count !== 0);
      } else if (curlen !== 0) {
        if (curlen != prevlen) {
          send_code(curlen, bl_tree);
          count--;
        }
        send_code(16, bl_tree);
        send_bits(count - 3, 2);
      } else if (count <= 10) {
        send_code(17, bl_tree);
        send_bits(count - 3, 3);
      } else {
        send_code(18, bl_tree);
        send_bits(count - 11, 7);
      }
      count = 0;
      prevlen = curlen;
      if (nextlen === 0) {
        max_count = 138;
        min_count = 3;
      } else if (curlen == nextlen) {
        max_count = 6;
        min_count = 3;
      } else {
        max_count = 7;
        min_count = 4;
      }
    }
  }
  function send_all_trees(lcodes, dcodes, blcodes) {
    let rank;
    send_bits(lcodes - 257, 5);
    send_bits(dcodes - 1, 5);
    send_bits(blcodes - 4, 4);
    for (rank = 0; rank < blcodes; rank++) {
      send_bits(bl_tree[Tree.bl_order[rank] * 2 + 1], 3);
    }
    send_tree(dyn_ltree, lcodes - 1);
    send_tree(dyn_dtree, dcodes - 1);
  }
  function bi_flush() {
    if (bi_valid == 16) {
      put_short(bi_buf);
      bi_buf = 0;
      bi_valid = 0;
    } else if (bi_valid >= 8) {
      put_byte(bi_buf & 255);
      bi_buf >>>= 8;
      bi_valid -= 8;
    }
  }
  function _tr_align() {
    send_bits(1 << 1, 3);
    send_code(256, StaticTree.static_ltree);
    bi_flush();
    if (1 + last_eob_len + 10 - bi_valid < 9) {
      send_bits(1 << 1, 3);
      send_code(256, StaticTree.static_ltree);
      bi_flush();
    }
    last_eob_len = 7;
  }
  function _tr_tally(dist, lc) {
    let out_length, in_length, dcode;
    that.dist_buf[last_lit] = dist;
    that.lc_buf[last_lit] = lc & 255;
    last_lit++;
    if (dist === 0) {
      dyn_ltree[lc * 2]++;
    } else {
      matches++;
      dist--;
      dyn_ltree[(Tree._length_code[lc] + 256 + 1) * 2]++;
      dyn_dtree[Tree.d_code(dist) * 2]++;
    }
    if ((last_lit & 8191) === 0 && level > 2) {
      out_length = last_lit * 8;
      in_length = strstart - block_start;
      for (dcode = 0; dcode < 30; dcode++) {
        out_length += dyn_dtree[dcode * 2] * (5 + Tree.extra_dbits[dcode]);
      }
      out_length >>>= 3;
      if (matches < Math.floor(last_lit / 2) && out_length < Math.floor(in_length / 2))
        return true;
    }
    return last_lit == lit_bufsize - 1;
  }
  function compress_block(ltree, dtree) {
    let dist;
    let lc;
    let lx = 0;
    let code;
    let extra;
    if (last_lit !== 0) {
      do {
        dist = that.dist_buf[lx];
        lc = that.lc_buf[lx];
        lx++;
        if (dist === 0) {
          send_code(lc, ltree);
        } else {
          code = Tree._length_code[lc];
          send_code(code + 256 + 1, ltree);
          extra = Tree.extra_lbits[code];
          if (extra !== 0) {
            lc -= Tree.base_length[code];
            send_bits(lc, extra);
          }
          dist--;
          code = Tree.d_code(dist);
          send_code(code, dtree);
          extra = Tree.extra_dbits[code];
          if (extra !== 0) {
            dist -= Tree.base_dist[code];
            send_bits(dist, extra);
          }
        }
      } while (lx < last_lit);
    }
    send_code(256, ltree);
    last_eob_len = ltree[END_BLOCK * 2 + 1];
  }
  function bi_windup() {
    if (bi_valid > 8) {
      put_short(bi_buf);
    } else if (bi_valid > 0) {
      put_byte(bi_buf & 255);
    }
    bi_buf = 0;
    bi_valid = 0;
  }
  function copy_block(buf, len, header) {
    bi_windup();
    last_eob_len = 8;
    if (header) {
      put_short(len);
      put_short(~len);
    }
    that.pending_buf.set(win.subarray(buf, buf + len), that.pending);
    that.pending += len;
  }
  function _tr_stored_block(buf, stored_len, eof) {
    send_bits((0 << 1) + (eof ? 1 : 0), 3);
    copy_block(buf, stored_len, true);
  }
  function _tr_flush_block(buf, stored_len, eof) {
    let opt_lenb, static_lenb;
    let max_blindex = 0;
    if (level > 0) {
      l_desc.build_tree(that);
      d_desc.build_tree(that);
      max_blindex = build_bl_tree();
      opt_lenb = that.opt_len + 3 + 7 >>> 3;
      static_lenb = that.static_len + 3 + 7 >>> 3;
      if (static_lenb <= opt_lenb)
        opt_lenb = static_lenb;
    } else {
      opt_lenb = static_lenb = stored_len + 5;
    }
    if (stored_len + 4 <= opt_lenb && buf != -1) {
      _tr_stored_block(buf, stored_len, eof);
    } else if (static_lenb == opt_lenb) {
      send_bits((1 << 1) + (eof ? 1 : 0), 3);
      compress_block(StaticTree.static_ltree, StaticTree.static_dtree);
    } else {
      send_bits((2 << 1) + (eof ? 1 : 0), 3);
      send_all_trees(l_desc.max_code + 1, d_desc.max_code + 1, max_blindex + 1);
      compress_block(dyn_ltree, dyn_dtree);
    }
    init_block();
    if (eof) {
      bi_windup();
    }
  }
  function flush_block_only(eof) {
    _tr_flush_block(block_start >= 0 ? block_start : -1, strstart - block_start, eof);
    block_start = strstart;
    strm.flush_pending();
  }
  function fill_window() {
    let n, m;
    let p;
    let more;
    do {
      more = window_size - lookahead - strstart;
      if (more === 0 && strstart === 0 && lookahead === 0) {
        more = w_size;
      } else if (more == -1) {
        more--;
      } else if (strstart >= w_size + w_size - MIN_LOOKAHEAD) {
        win.set(win.subarray(w_size, w_size + w_size), 0);
        match_start -= w_size;
        strstart -= w_size;
        block_start -= w_size;
        n = hash_size;
        p = n;
        do {
          m = head[--p] & 65535;
          head[p] = m >= w_size ? m - w_size : 0;
        } while (--n !== 0);
        n = w_size;
        p = n;
        do {
          m = prev[--p] & 65535;
          prev[p] = m >= w_size ? m - w_size : 0;
        } while (--n !== 0);
        more += w_size;
      }
      if (strm.avail_in === 0)
        return;
      n = strm.read_buf(win, strstart + lookahead, more);
      lookahead += n;
      if (lookahead >= 3) {
        ins_h = win[strstart] & 255;
        ins_h = (ins_h << hash_shift ^ win[strstart + 1] & 255) & hash_mask;
      }
    } while (lookahead < MIN_LOOKAHEAD && strm.avail_in !== 0);
  }
  function deflate_stored(flush) {
    let max_block_size = 65535;
    let max_start;
    if (max_block_size > pending_buf_size - 5) {
      max_block_size = pending_buf_size - 5;
    }
    while (true) {
      if (lookahead <= 1) {
        fill_window();
        if (lookahead === 0 && flush == 0)
          return 0;
        if (lookahead === 0)
          break;
      }
      strstart += lookahead;
      lookahead = 0;
      max_start = block_start + max_block_size;
      if (strstart === 0 || strstart >= max_start) {
        lookahead = strstart - max_start;
        strstart = max_start;
        flush_block_only(false);
        if (strm.avail_out === 0)
          return 0;
      }
      if (strstart - block_start >= w_size - MIN_LOOKAHEAD) {
        flush_block_only(false);
        if (strm.avail_out === 0)
          return 0;
      }
    }
    flush_block_only(flush == 4);
    if (strm.avail_out === 0)
      return flush == 4 ? 2 : 0;
    return flush == 4 ? 3 : 1;
  }
  function longest_match(cur_match) {
    let chain_length = max_chain_length;
    let scan = strstart;
    let match;
    let len;
    let best_len = prev_length;
    const limit = strstart > w_size - MIN_LOOKAHEAD ? strstart - (w_size - MIN_LOOKAHEAD) : 0;
    let _nice_match = nice_match;
    const wmask = w_mask;
    const strend = strstart + 258;
    let scan_end1 = win[scan + best_len - 1];
    let scan_end = win[scan + best_len];
    if (prev_length >= good_match) {
      chain_length >>= 2;
    }
    if (_nice_match > lookahead)
      _nice_match = lookahead;
    do {
      match = cur_match;
      if (win[match + best_len] != scan_end || win[match + best_len - 1] != scan_end1 || win[match] != win[scan] || win[++match] != win[scan + 1])
        continue;
      scan += 2;
      match++;
      do {
      } while (win[++scan] == win[++match] && win[++scan] == win[++match] && win[++scan] == win[++match] && win[++scan] == win[++match] && win[++scan] == win[++match] && win[++scan] == win[++match] && win[++scan] == win[++match] && win[++scan] == win[++match] && scan < strend);
      len = MAX_MATCH - (strend - scan);
      scan = strend - MAX_MATCH;
      if (len > best_len) {
        match_start = cur_match;
        best_len = len;
        if (len >= _nice_match)
          break;
        scan_end1 = win[scan + best_len - 1];
        scan_end = win[scan + best_len];
      }
    } while ((cur_match = prev[cur_match & wmask] & 65535) > limit && --chain_length !== 0);
    if (best_len <= lookahead)
      return best_len;
    return lookahead;
  }
  function deflate_fast(flush) {
    let hash_head = 0;
    let bflush;
    while (true) {
      if (lookahead < MIN_LOOKAHEAD) {
        fill_window();
        if (lookahead < MIN_LOOKAHEAD && flush == 0) {
          return 0;
        }
        if (lookahead === 0)
          break;
      }
      if (lookahead >= 3) {
        ins_h = (ins_h << hash_shift ^ win[strstart + (MIN_MATCH - 1)] & 255) & hash_mask;
        hash_head = head[ins_h] & 65535;
        prev[strstart & w_mask] = head[ins_h];
        head[ins_h] = strstart;
      }
      if (hash_head !== 0 && (strstart - hash_head & 65535) <= w_size - MIN_LOOKAHEAD) {
        if (strategy != 2) {
          match_length = longest_match(hash_head);
        }
      }
      if (match_length >= 3) {
        bflush = _tr_tally(strstart - match_start, match_length - MIN_MATCH);
        lookahead -= match_length;
        if (match_length <= max_lazy_match && lookahead >= 3) {
          match_length--;
          do {
            strstart++;
            ins_h = (ins_h << hash_shift ^ win[strstart + (MIN_MATCH - 1)] & 255) & hash_mask;
            hash_head = head[ins_h] & 65535;
            prev[strstart & w_mask] = head[ins_h];
            head[ins_h] = strstart;
          } while (--match_length !== 0);
          strstart++;
        } else {
          strstart += match_length;
          match_length = 0;
          ins_h = win[strstart] & 255;
          ins_h = (ins_h << hash_shift ^ win[strstart + 1] & 255) & hash_mask;
        }
      } else {
        bflush = _tr_tally(0, win[strstart] & 255);
        lookahead--;
        strstart++;
      }
      if (bflush) {
        flush_block_only(false);
        if (strm.avail_out === 0)
          return 0;
      }
    }
    flush_block_only(flush == 4);
    if (strm.avail_out === 0) {
      if (flush == 4)
        return 2;
      else
        return 0;
    }
    return flush == 4 ? 3 : 1;
  }
  function deflate_slow(flush) {
    let hash_head = 0;
    let bflush;
    let max_insert;
    while (true) {
      if (lookahead < MIN_LOOKAHEAD) {
        fill_window();
        if (lookahead < MIN_LOOKAHEAD && flush == 0) {
          return 0;
        }
        if (lookahead === 0)
          break;
      }
      if (lookahead >= 3) {
        ins_h = (ins_h << hash_shift ^ win[strstart + (MIN_MATCH - 1)] & 255) & hash_mask;
        hash_head = head[ins_h] & 65535;
        prev[strstart & w_mask] = head[ins_h];
        head[ins_h] = strstart;
      }
      prev_length = match_length;
      prev_match = match_start;
      match_length = MIN_MATCH - 1;
      if (hash_head !== 0 && prev_length < max_lazy_match && (strstart - hash_head & 65535) <= w_size - MIN_LOOKAHEAD) {
        if (strategy != 2) {
          match_length = longest_match(hash_head);
        }
        if (match_length <= 5 && (strategy == 1 || match_length == 3 && strstart - match_start > 4096)) {
          match_length = MIN_MATCH - 1;
        }
      }
      if (prev_length >= 3 && match_length <= prev_length) {
        max_insert = strstart + lookahead - MIN_MATCH;
        bflush = _tr_tally(strstart - 1 - prev_match, prev_length - MIN_MATCH);
        lookahead -= prev_length - 1;
        prev_length -= 2;
        do {
          if (++strstart <= max_insert) {
            ins_h = (ins_h << hash_shift ^ win[strstart + (MIN_MATCH - 1)] & 255) & hash_mask;
            hash_head = head[ins_h] & 65535;
            prev[strstart & w_mask] = head[ins_h];
            head[ins_h] = strstart;
          }
        } while (--prev_length !== 0);
        match_available = 0;
        match_length = MIN_MATCH - 1;
        strstart++;
        if (bflush) {
          flush_block_only(false);
          if (strm.avail_out === 0)
            return 0;
        }
      } else if (match_available !== 0) {
        bflush = _tr_tally(0, win[strstart - 1] & 255);
        if (bflush) {
          flush_block_only(false);
        }
        strstart++;
        lookahead--;
        if (strm.avail_out === 0)
          return 0;
      } else {
        match_available = 1;
        strstart++;
        lookahead--;
      }
    }
    if (match_available !== 0) {
      bflush = _tr_tally(0, win[strstart - 1] & 255);
      match_available = 0;
    }
    flush_block_only(flush == 4);
    if (strm.avail_out === 0) {
      if (flush == 4)
        return 2;
      else
        return 0;
    }
    return flush == 4 ? 3 : 1;
  }
  function deflateReset(strm2) {
    strm2.total_in = strm2.total_out = 0;
    strm2.msg = null;
    that.pending = 0;
    that.pending_out = 0;
    status = BUSY_STATE;
    last_flush = Z_NO_FLUSH;
    tr_init();
    lm_init();
    return 0;
  }
  that.deflateInit = function(strm2, _level, bits, _method, memLevel, _strategy) {
    if (!_method)
      _method = Z_DEFLATED;
    if (!memLevel)
      memLevel = DEF_MEM_LEVEL;
    if (!_strategy)
      _strategy = Z_DEFAULT_STRATEGY;
    strm2.msg = null;
    if (_level == Z_DEFAULT_COMPRESSION)
      _level = 6;
    if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || _method != Z_DEFLATED || bits < 9 || bits > 15 || _level < 0 || _level > 9 || _strategy < 0 || _strategy > Z_HUFFMAN_ONLY) {
      return Z_STREAM_ERROR;
    }
    strm2.dstate = that;
    w_bits = bits;
    w_size = 1 << w_bits;
    w_mask = w_size - 1;
    hash_bits = memLevel + 7;
    hash_size = 1 << hash_bits;
    hash_mask = hash_size - 1;
    hash_shift = Math.floor((hash_bits + MIN_MATCH - 1) / MIN_MATCH);
    win = new Uint8Array(w_size * 2);
    prev = [];
    head = [];
    lit_bufsize = 1 << memLevel + 6;
    that.pending_buf = new Uint8Array(lit_bufsize * 4);
    pending_buf_size = lit_bufsize * 4;
    that.dist_buf = new Uint16Array(lit_bufsize);
    that.lc_buf = new Uint8Array(lit_bufsize);
    level = _level;
    strategy = _strategy;
    return deflateReset(strm2);
  };
  that.deflateEnd = function() {
    if (status != INIT_STATE && status != BUSY_STATE && status != FINISH_STATE) {
      return Z_STREAM_ERROR;
    }
    that.lc_buf = null;
    that.dist_buf = null;
    that.pending_buf = null;
    head = null;
    prev = null;
    win = null;
    that.dstate = null;
    return status == BUSY_STATE ? Z_DATA_ERROR : Z_OK;
  };
  that.deflateParams = function(strm2, _level, _strategy) {
    let err = Z_OK;
    if (_level == Z_DEFAULT_COMPRESSION) {
      _level = 6;
    }
    if (_level < 0 || _level > 9 || _strategy < 0 || _strategy > Z_HUFFMAN_ONLY) {
      return Z_STREAM_ERROR;
    }
    if (config_table[level].func != config_table[_level].func && strm2.total_in !== 0) {
      err = strm2.deflate(Z_PARTIAL_FLUSH);
    }
    if (level != _level) {
      level = _level;
      max_lazy_match = config_table[level].max_lazy;
      good_match = config_table[level].good_length;
      nice_match = config_table[level].nice_length;
      max_chain_length = config_table[level].max_chain;
    }
    strategy = _strategy;
    return err;
  };
  that.deflateSetDictionary = function(_strm, dictionary, dictLength) {
    let length = dictLength;
    let n, index = 0;
    if (!dictionary || status != INIT_STATE)
      return Z_STREAM_ERROR;
    if (length < MIN_MATCH)
      return Z_OK;
    if (length > w_size - MIN_LOOKAHEAD) {
      length = w_size - MIN_LOOKAHEAD;
      index = dictLength - length;
    }
    win.set(dictionary.subarray(index, index + length), 0);
    strstart = length;
    block_start = length;
    ins_h = win[0] & 255;
    ins_h = (ins_h << hash_shift ^ win[1] & 255) & hash_mask;
    for (n = 0; n <= length - MIN_MATCH; n++) {
      ins_h = (ins_h << hash_shift ^ win[n + (MIN_MATCH - 1)] & 255) & hash_mask;
      prev[n & w_mask] = head[ins_h];
      head[ins_h] = n;
    }
    return Z_OK;
  };
  that.deflate = function(_strm, flush) {
    let i, header, level_flags, old_flush, bstate;
    if (flush > Z_FINISH || flush < 0) {
      return Z_STREAM_ERROR;
    }
    if (!_strm.next_out || !_strm.next_in && _strm.avail_in !== 0 || status == FINISH_STATE && flush != Z_FINISH) {
      _strm.msg = z_errmsg[Z_NEED_DICT - Z_STREAM_ERROR];
      return Z_STREAM_ERROR;
    }
    if (_strm.avail_out === 0) {
      _strm.msg = z_errmsg[Z_NEED_DICT - Z_BUF_ERROR];
      return Z_BUF_ERROR;
    }
    strm = _strm;
    old_flush = last_flush;
    last_flush = flush;
    if (status == INIT_STATE) {
      header = Z_DEFLATED + (w_bits - 8 << 4) << 8;
      level_flags = (level - 1 & 255) >> 1;
      if (level_flags > 3)
        level_flags = 3;
      header |= level_flags << 6;
      if (strstart !== 0)
        header |= PRESET_DICT;
      header += 31 - header % 31;
      status = BUSY_STATE;
      putShortMSB(header);
    }
    if (that.pending !== 0) {
      strm.flush_pending();
      if (strm.avail_out === 0) {
        last_flush = -1;
        return Z_OK;
      }
    } else if (strm.avail_in === 0 && flush <= old_flush && flush != Z_FINISH) {
      strm.msg = z_errmsg[Z_NEED_DICT - Z_BUF_ERROR];
      return Z_BUF_ERROR;
    }
    if (status == FINISH_STATE && strm.avail_in !== 0) {
      _strm.msg = z_errmsg[Z_NEED_DICT - Z_BUF_ERROR];
      return Z_BUF_ERROR;
    }
    if (strm.avail_in !== 0 || lookahead !== 0 || flush != Z_NO_FLUSH && status != FINISH_STATE) {
      bstate = -1;
      switch (config_table[level].func) {
        case STORED:
          bstate = deflate_stored(flush);
          break;
        case FAST:
          bstate = deflate_fast(flush);
          break;
        case SLOW:
          bstate = deflate_slow(flush);
          break;
        default:
      }
      if (bstate == FinishStarted || bstate == FinishDone) {
        status = FINISH_STATE;
      }
      if (bstate == NeedMore || bstate == FinishStarted) {
        if (strm.avail_out === 0) {
          last_flush = -1;
        }
        return Z_OK;
      }
      if (bstate == BlockDone) {
        if (flush == Z_PARTIAL_FLUSH) {
          _tr_align();
        } else {
          _tr_stored_block(0, 0, false);
          if (flush == Z_FULL_FLUSH) {
            for (i = 0; i < hash_size; i++)
              head[i] = 0;
          }
        }
        strm.flush_pending();
        if (strm.avail_out === 0) {
          last_flush = -1;
          return Z_OK;
        }
      }
    }
    if (flush != Z_FINISH)
      return Z_OK;
    return Z_STREAM_END;
  };
}
function ZStream() {
  const that = this;
  that.next_in_index = 0;
  that.next_out_index = 0;
  that.avail_in = 0;
  that.total_in = 0;
  that.avail_out = 0;
  that.total_out = 0;
}
ZStream.prototype = {
  deflateInit(level, bits) {
    const that = this;
    that.dstate = new Deflate();
    if (!bits)
      bits = MAX_BITS;
    return that.dstate.deflateInit(that, level, bits);
  },
  deflate(flush) {
    const that = this;
    if (!that.dstate) {
      return Z_STREAM_ERROR;
    }
    return that.dstate.deflate(that, flush);
  },
  deflateEnd() {
    const that = this;
    if (!that.dstate)
      return Z_STREAM_ERROR;
    const ret = that.dstate.deflateEnd();
    that.dstate = null;
    return ret;
  },
  deflateParams(level, strategy) {
    const that = this;
    if (!that.dstate)
      return Z_STREAM_ERROR;
    return that.dstate.deflateParams(that, level, strategy);
  },
  deflateSetDictionary(dictionary, dictLength) {
    const that = this;
    if (!that.dstate)
      return Z_STREAM_ERROR;
    return that.dstate.deflateSetDictionary(that, dictionary, dictLength);
  },
  read_buf(buf, start, size) {
    const that = this;
    let len = that.avail_in;
    if (len > size)
      len = size;
    if (len === 0)
      return 0;
    that.avail_in -= len;
    buf.set(that.next_in.subarray(that.next_in_index, that.next_in_index + len), start);
    that.next_in_index += len;
    that.total_in += len;
    return len;
  },
  flush_pending() {
    const that = this;
    let len = that.dstate.pending;
    if (len > that.avail_out)
      len = that.avail_out;
    if (len === 0)
      return;
    that.next_out.set(that.dstate.pending_buf.subarray(that.dstate.pending_out, that.dstate.pending_out + len), that.next_out_index);
    that.next_out_index += len;
    that.dstate.pending_out += len;
    that.total_out += len;
    that.avail_out -= len;
    that.dstate.pending -= len;
    if (that.dstate.pending === 0) {
      that.dstate.pending_out = 0;
    }
  }
};
function ZipDeflate(options) {
  const that = this;
  const z = new ZStream();
  const bufsize = getMaximumCompressedSize(options && options.chunkSize ? options.chunkSize : 64 * 1024);
  const flush = 0;
  const buf = new Uint8Array(bufsize);
  let level = options ? options.level : Z_DEFAULT_COMPRESSION;
  if (typeof level == "undefined")
    level = Z_DEFAULT_COMPRESSION;
  z.deflateInit(level);
  z.next_out = buf;
  that.append = function(data, onprogress) {
    let err, array, lastIndex = 0, bufferIndex = 0, bufferSize = 0;
    const buffers = [];
    if (!data.length)
      return;
    z.next_in_index = 0;
    z.next_in = data;
    z.avail_in = data.length;
    do {
      z.next_out_index = 0;
      z.avail_out = bufsize;
      err = z.deflate(flush);
      if (err != Z_OK)
        throw new Error("deflating: " + z.msg);
      if (z.next_out_index)
        if (z.next_out_index == bufsize)
          buffers.push(new Uint8Array(buf));
        else
          buffers.push(buf.subarray(0, z.next_out_index));
      bufferSize += z.next_out_index;
      if (onprogress && z.next_in_index > 0 && z.next_in_index != lastIndex) {
        onprogress(z.next_in_index);
        lastIndex = z.next_in_index;
      }
    } while (z.avail_in > 0 || z.avail_out === 0);
    if (buffers.length > 1) {
      array = new Uint8Array(bufferSize);
      buffers.forEach(function(chunk) {
        array.set(chunk, bufferIndex);
        bufferIndex += chunk.length;
      });
    } else {
      array = buffers[0] ? new Uint8Array(buffers[0]) : new Uint8Array();
    }
    return array;
  };
  that.flush = function() {
    let err, array, bufferIndex = 0, bufferSize = 0;
    const buffers = [];
    do {
      z.next_out_index = 0;
      z.avail_out = bufsize;
      err = z.deflate(Z_FINISH);
      if (err != Z_STREAM_END && err != Z_OK)
        throw new Error("deflating: " + z.msg);
      if (bufsize - z.avail_out > 0)
        buffers.push(buf.slice(0, z.next_out_index));
      bufferSize += z.next_out_index;
    } while (z.avail_in > 0 || z.avail_out === 0);
    z.deflateEnd();
    array = new Uint8Array(bufferSize);
    buffers.forEach(function(chunk) {
      array.set(chunk, bufferIndex);
      bufferIndex += chunk.length;
    });
    return array;
  };
}
function getMaximumCompressedSize(uncompressedSize) {
  return uncompressedSize + 5 * (Math.floor(uncompressedSize / 16383) + 1);
}
var MAX_BITS1 = 15;
var Z_OK1 = 0;
var Z_STREAM_END1 = 1;
var Z_NEED_DICT1 = 2;
var Z_STREAM_ERROR1 = -2;
var Z_DATA_ERROR1 = -3;
var Z_MEM_ERROR = -4;
var Z_BUF_ERROR1 = -5;
var inflate_mask = [
  0,
  1,
  3,
  7,
  15,
  31,
  63,
  127,
  255,
  511,
  1023,
  2047,
  4095,
  8191,
  16383,
  32767,
  65535
];
var Z_FINISH1 = 4;
var fixed_bl = 9;
var fixed_bd = 5;
var fixed_tl = [
  96,
  7,
  256,
  0,
  8,
  80,
  0,
  8,
  16,
  84,
  8,
  115,
  82,
  7,
  31,
  0,
  8,
  112,
  0,
  8,
  48,
  0,
  9,
  192,
  80,
  7,
  10,
  0,
  8,
  96,
  0,
  8,
  32,
  0,
  9,
  160,
  0,
  8,
  0,
  0,
  8,
  128,
  0,
  8,
  64,
  0,
  9,
  224,
  80,
  7,
  6,
  0,
  8,
  88,
  0,
  8,
  24,
  0,
  9,
  144,
  83,
  7,
  59,
  0,
  8,
  120,
  0,
  8,
  56,
  0,
  9,
  208,
  81,
  7,
  17,
  0,
  8,
  104,
  0,
  8,
  40,
  0,
  9,
  176,
  0,
  8,
  8,
  0,
  8,
  136,
  0,
  8,
  72,
  0,
  9,
  240,
  80,
  7,
  4,
  0,
  8,
  84,
  0,
  8,
  20,
  85,
  8,
  227,
  83,
  7,
  43,
  0,
  8,
  116,
  0,
  8,
  52,
  0,
  9,
  200,
  81,
  7,
  13,
  0,
  8,
  100,
  0,
  8,
  36,
  0,
  9,
  168,
  0,
  8,
  4,
  0,
  8,
  132,
  0,
  8,
  68,
  0,
  9,
  232,
  80,
  7,
  8,
  0,
  8,
  92,
  0,
  8,
  28,
  0,
  9,
  152,
  84,
  7,
  83,
  0,
  8,
  124,
  0,
  8,
  60,
  0,
  9,
  216,
  82,
  7,
  23,
  0,
  8,
  108,
  0,
  8,
  44,
  0,
  9,
  184,
  0,
  8,
  12,
  0,
  8,
  140,
  0,
  8,
  76,
  0,
  9,
  248,
  80,
  7,
  3,
  0,
  8,
  82,
  0,
  8,
  18,
  85,
  8,
  163,
  83,
  7,
  35,
  0,
  8,
  114,
  0,
  8,
  50,
  0,
  9,
  196,
  81,
  7,
  11,
  0,
  8,
  98,
  0,
  8,
  34,
  0,
  9,
  164,
  0,
  8,
  2,
  0,
  8,
  130,
  0,
  8,
  66,
  0,
  9,
  228,
  80,
  7,
  7,
  0,
  8,
  90,
  0,
  8,
  26,
  0,
  9,
  148,
  84,
  7,
  67,
  0,
  8,
  122,
  0,
  8,
  58,
  0,
  9,
  212,
  82,
  7,
  19,
  0,
  8,
  106,
  0,
  8,
  42,
  0,
  9,
  180,
  0,
  8,
  10,
  0,
  8,
  138,
  0,
  8,
  74,
  0,
  9,
  244,
  80,
  7,
  5,
  0,
  8,
  86,
  0,
  8,
  22,
  192,
  8,
  0,
  83,
  7,
  51,
  0,
  8,
  118,
  0,
  8,
  54,
  0,
  9,
  204,
  81,
  7,
  15,
  0,
  8,
  102,
  0,
  8,
  38,
  0,
  9,
  172,
  0,
  8,
  6,
  0,
  8,
  134,
  0,
  8,
  70,
  0,
  9,
  236,
  80,
  7,
  9,
  0,
  8,
  94,
  0,
  8,
  30,
  0,
  9,
  156,
  84,
  7,
  99,
  0,
  8,
  126,
  0,
  8,
  62,
  0,
  9,
  220,
  82,
  7,
  27,
  0,
  8,
  110,
  0,
  8,
  46,
  0,
  9,
  188,
  0,
  8,
  14,
  0,
  8,
  142,
  0,
  8,
  78,
  0,
  9,
  252,
  96,
  7,
  256,
  0,
  8,
  81,
  0,
  8,
  17,
  85,
  8,
  131,
  82,
  7,
  31,
  0,
  8,
  113,
  0,
  8,
  49,
  0,
  9,
  194,
  80,
  7,
  10,
  0,
  8,
  97,
  0,
  8,
  33,
  0,
  9,
  162,
  0,
  8,
  1,
  0,
  8,
  129,
  0,
  8,
  65,
  0,
  9,
  226,
  80,
  7,
  6,
  0,
  8,
  89,
  0,
  8,
  25,
  0,
  9,
  146,
  83,
  7,
  59,
  0,
  8,
  121,
  0,
  8,
  57,
  0,
  9,
  210,
  81,
  7,
  17,
  0,
  8,
  105,
  0,
  8,
  41,
  0,
  9,
  178,
  0,
  8,
  9,
  0,
  8,
  137,
  0,
  8,
  73,
  0,
  9,
  242,
  80,
  7,
  4,
  0,
  8,
  85,
  0,
  8,
  21,
  80,
  8,
  258,
  83,
  7,
  43,
  0,
  8,
  117,
  0,
  8,
  53,
  0,
  9,
  202,
  81,
  7,
  13,
  0,
  8,
  101,
  0,
  8,
  37,
  0,
  9,
  170,
  0,
  8,
  5,
  0,
  8,
  133,
  0,
  8,
  69,
  0,
  9,
  234,
  80,
  7,
  8,
  0,
  8,
  93,
  0,
  8,
  29,
  0,
  9,
  154,
  84,
  7,
  83,
  0,
  8,
  125,
  0,
  8,
  61,
  0,
  9,
  218,
  82,
  7,
  23,
  0,
  8,
  109,
  0,
  8,
  45,
  0,
  9,
  186,
  0,
  8,
  13,
  0,
  8,
  141,
  0,
  8,
  77,
  0,
  9,
  250,
  80,
  7,
  3,
  0,
  8,
  83,
  0,
  8,
  19,
  85,
  8,
  195,
  83,
  7,
  35,
  0,
  8,
  115,
  0,
  8,
  51,
  0,
  9,
  198,
  81,
  7,
  11,
  0,
  8,
  99,
  0,
  8,
  35,
  0,
  9,
  166,
  0,
  8,
  3,
  0,
  8,
  131,
  0,
  8,
  67,
  0,
  9,
  230,
  80,
  7,
  7,
  0,
  8,
  91,
  0,
  8,
  27,
  0,
  9,
  150,
  84,
  7,
  67,
  0,
  8,
  123,
  0,
  8,
  59,
  0,
  9,
  214,
  82,
  7,
  19,
  0,
  8,
  107,
  0,
  8,
  43,
  0,
  9,
  182,
  0,
  8,
  11,
  0,
  8,
  139,
  0,
  8,
  75,
  0,
  9,
  246,
  80,
  7,
  5,
  0,
  8,
  87,
  0,
  8,
  23,
  192,
  8,
  0,
  83,
  7,
  51,
  0,
  8,
  119,
  0,
  8,
  55,
  0,
  9,
  206,
  81,
  7,
  15,
  0,
  8,
  103,
  0,
  8,
  39,
  0,
  9,
  174,
  0,
  8,
  7,
  0,
  8,
  135,
  0,
  8,
  71,
  0,
  9,
  238,
  80,
  7,
  9,
  0,
  8,
  95,
  0,
  8,
  31,
  0,
  9,
  158,
  84,
  7,
  99,
  0,
  8,
  127,
  0,
  8,
  63,
  0,
  9,
  222,
  82,
  7,
  27,
  0,
  8,
  111,
  0,
  8,
  47,
  0,
  9,
  190,
  0,
  8,
  15,
  0,
  8,
  143,
  0,
  8,
  79,
  0,
  9,
  254,
  96,
  7,
  256,
  0,
  8,
  80,
  0,
  8,
  16,
  84,
  8,
  115,
  82,
  7,
  31,
  0,
  8,
  112,
  0,
  8,
  48,
  0,
  9,
  193,
  80,
  7,
  10,
  0,
  8,
  96,
  0,
  8,
  32,
  0,
  9,
  161,
  0,
  8,
  0,
  0,
  8,
  128,
  0,
  8,
  64,
  0,
  9,
  225,
  80,
  7,
  6,
  0,
  8,
  88,
  0,
  8,
  24,
  0,
  9,
  145,
  83,
  7,
  59,
  0,
  8,
  120,
  0,
  8,
  56,
  0,
  9,
  209,
  81,
  7,
  17,
  0,
  8,
  104,
  0,
  8,
  40,
  0,
  9,
  177,
  0,
  8,
  8,
  0,
  8,
  136,
  0,
  8,
  72,
  0,
  9,
  241,
  80,
  7,
  4,
  0,
  8,
  84,
  0,
  8,
  20,
  85,
  8,
  227,
  83,
  7,
  43,
  0,
  8,
  116,
  0,
  8,
  52,
  0,
  9,
  201,
  81,
  7,
  13,
  0,
  8,
  100,
  0,
  8,
  36,
  0,
  9,
  169,
  0,
  8,
  4,
  0,
  8,
  132,
  0,
  8,
  68,
  0,
  9,
  233,
  80,
  7,
  8,
  0,
  8,
  92,
  0,
  8,
  28,
  0,
  9,
  153,
  84,
  7,
  83,
  0,
  8,
  124,
  0,
  8,
  60,
  0,
  9,
  217,
  82,
  7,
  23,
  0,
  8,
  108,
  0,
  8,
  44,
  0,
  9,
  185,
  0,
  8,
  12,
  0,
  8,
  140,
  0,
  8,
  76,
  0,
  9,
  249,
  80,
  7,
  3,
  0,
  8,
  82,
  0,
  8,
  18,
  85,
  8,
  163,
  83,
  7,
  35,
  0,
  8,
  114,
  0,
  8,
  50,
  0,
  9,
  197,
  81,
  7,
  11,
  0,
  8,
  98,
  0,
  8,
  34,
  0,
  9,
  165,
  0,
  8,
  2,
  0,
  8,
  130,
  0,
  8,
  66,
  0,
  9,
  229,
  80,
  7,
  7,
  0,
  8,
  90,
  0,
  8,
  26,
  0,
  9,
  149,
  84,
  7,
  67,
  0,
  8,
  122,
  0,
  8,
  58,
  0,
  9,
  213,
  82,
  7,
  19,
  0,
  8,
  106,
  0,
  8,
  42,
  0,
  9,
  181,
  0,
  8,
  10,
  0,
  8,
  138,
  0,
  8,
  74,
  0,
  9,
  245,
  80,
  7,
  5,
  0,
  8,
  86,
  0,
  8,
  22,
  192,
  8,
  0,
  83,
  7,
  51,
  0,
  8,
  118,
  0,
  8,
  54,
  0,
  9,
  205,
  81,
  7,
  15,
  0,
  8,
  102,
  0,
  8,
  38,
  0,
  9,
  173,
  0,
  8,
  6,
  0,
  8,
  134,
  0,
  8,
  70,
  0,
  9,
  237,
  80,
  7,
  9,
  0,
  8,
  94,
  0,
  8,
  30,
  0,
  9,
  157,
  84,
  7,
  99,
  0,
  8,
  126,
  0,
  8,
  62,
  0,
  9,
  221,
  82,
  7,
  27,
  0,
  8,
  110,
  0,
  8,
  46,
  0,
  9,
  189,
  0,
  8,
  14,
  0,
  8,
  142,
  0,
  8,
  78,
  0,
  9,
  253,
  96,
  7,
  256,
  0,
  8,
  81,
  0,
  8,
  17,
  85,
  8,
  131,
  82,
  7,
  31,
  0,
  8,
  113,
  0,
  8,
  49,
  0,
  9,
  195,
  80,
  7,
  10,
  0,
  8,
  97,
  0,
  8,
  33,
  0,
  9,
  163,
  0,
  8,
  1,
  0,
  8,
  129,
  0,
  8,
  65,
  0,
  9,
  227,
  80,
  7,
  6,
  0,
  8,
  89,
  0,
  8,
  25,
  0,
  9,
  147,
  83,
  7,
  59,
  0,
  8,
  121,
  0,
  8,
  57,
  0,
  9,
  211,
  81,
  7,
  17,
  0,
  8,
  105,
  0,
  8,
  41,
  0,
  9,
  179,
  0,
  8,
  9,
  0,
  8,
  137,
  0,
  8,
  73,
  0,
  9,
  243,
  80,
  7,
  4,
  0,
  8,
  85,
  0,
  8,
  21,
  80,
  8,
  258,
  83,
  7,
  43,
  0,
  8,
  117,
  0,
  8,
  53,
  0,
  9,
  203,
  81,
  7,
  13,
  0,
  8,
  101,
  0,
  8,
  37,
  0,
  9,
  171,
  0,
  8,
  5,
  0,
  8,
  133,
  0,
  8,
  69,
  0,
  9,
  235,
  80,
  7,
  8,
  0,
  8,
  93,
  0,
  8,
  29,
  0,
  9,
  155,
  84,
  7,
  83,
  0,
  8,
  125,
  0,
  8,
  61,
  0,
  9,
  219,
  82,
  7,
  23,
  0,
  8,
  109,
  0,
  8,
  45,
  0,
  9,
  187,
  0,
  8,
  13,
  0,
  8,
  141,
  0,
  8,
  77,
  0,
  9,
  251,
  80,
  7,
  3,
  0,
  8,
  83,
  0,
  8,
  19,
  85,
  8,
  195,
  83,
  7,
  35,
  0,
  8,
  115,
  0,
  8,
  51,
  0,
  9,
  199,
  81,
  7,
  11,
  0,
  8,
  99,
  0,
  8,
  35,
  0,
  9,
  167,
  0,
  8,
  3,
  0,
  8,
  131,
  0,
  8,
  67,
  0,
  9,
  231,
  80,
  7,
  7,
  0,
  8,
  91,
  0,
  8,
  27,
  0,
  9,
  151,
  84,
  7,
  67,
  0,
  8,
  123,
  0,
  8,
  59,
  0,
  9,
  215,
  82,
  7,
  19,
  0,
  8,
  107,
  0,
  8,
  43,
  0,
  9,
  183,
  0,
  8,
  11,
  0,
  8,
  139,
  0,
  8,
  75,
  0,
  9,
  247,
  80,
  7,
  5,
  0,
  8,
  87,
  0,
  8,
  23,
  192,
  8,
  0,
  83,
  7,
  51,
  0,
  8,
  119,
  0,
  8,
  55,
  0,
  9,
  207,
  81,
  7,
  15,
  0,
  8,
  103,
  0,
  8,
  39,
  0,
  9,
  175,
  0,
  8,
  7,
  0,
  8,
  135,
  0,
  8,
  71,
  0,
  9,
  239,
  80,
  7,
  9,
  0,
  8,
  95,
  0,
  8,
  31,
  0,
  9,
  159,
  84,
  7,
  99,
  0,
  8,
  127,
  0,
  8,
  63,
  0,
  9,
  223,
  82,
  7,
  27,
  0,
  8,
  111,
  0,
  8,
  47,
  0,
  9,
  191,
  0,
  8,
  15,
  0,
  8,
  143,
  0,
  8,
  79,
  0,
  9,
  255
];
var fixed_td = [
  80,
  5,
  1,
  87,
  5,
  257,
  83,
  5,
  17,
  91,
  5,
  4097,
  81,
  5,
  5,
  89,
  5,
  1025,
  85,
  5,
  65,
  93,
  5,
  16385,
  80,
  5,
  3,
  88,
  5,
  513,
  84,
  5,
  33,
  92,
  5,
  8193,
  82,
  5,
  9,
  90,
  5,
  2049,
  86,
  5,
  129,
  192,
  5,
  24577,
  80,
  5,
  2,
  87,
  5,
  385,
  83,
  5,
  25,
  91,
  5,
  6145,
  81,
  5,
  7,
  89,
  5,
  1537,
  85,
  5,
  97,
  93,
  5,
  24577,
  80,
  5,
  4,
  88,
  5,
  769,
  84,
  5,
  49,
  92,
  5,
  12289,
  82,
  5,
  13,
  90,
  5,
  3073,
  86,
  5,
  193,
  192,
  5,
  24577
];
var cplens = [
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  13,
  15,
  17,
  19,
  23,
  27,
  31,
  35,
  43,
  51,
  59,
  67,
  83,
  99,
  115,
  131,
  163,
  195,
  227,
  258,
  0,
  0
];
var cplext = [
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
  112,
  112
];
var cpdist = [
  1,
  2,
  3,
  4,
  5,
  7,
  9,
  13,
  17,
  25,
  33,
  49,
  65,
  97,
  129,
  193,
  257,
  385,
  513,
  769,
  1025,
  1537,
  2049,
  3073,
  4097,
  6145,
  8193,
  12289,
  16385,
  24577
];
var cpdext = [
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13
];
var BMAX = 15;
function InfTree() {
  const that = this;
  let hn;
  let v;
  let c;
  let r;
  let u;
  let x;
  function huft_build(b, bindex, n, s, d, e2, t, m, hp, hn2, v2) {
    let a;
    let f;
    let g;
    let h;
    let i;
    let j;
    let k;
    let l;
    let mask;
    let p;
    let q;
    let w;
    let xp;
    let y;
    let z;
    p = 0;
    i = n;
    do {
      c[b[bindex + p]]++;
      p++;
      i--;
    } while (i !== 0);
    if (c[0] == n) {
      t[0] = -1;
      m[0] = 0;
      return 0;
    }
    l = m[0];
    for (j = 1; j <= 15; j++)
      if (c[j] !== 0)
        break;
    k = j;
    if (l < j) {
      l = j;
    }
    for (i = BMAX; i !== 0; i--) {
      if (c[i] !== 0)
        break;
    }
    g = i;
    if (l > i) {
      l = i;
    }
    m[0] = l;
    for (y = 1 << j; j < i; j++, y <<= 1) {
      if ((y -= c[j]) < 0) {
        return Z_DATA_ERROR1;
      }
    }
    if ((y -= c[i]) < 0) {
      return Z_DATA_ERROR1;
    }
    c[i] += y;
    x[1] = j = 0;
    p = 1;
    xp = 2;
    while (--i !== 0) {
      x[xp] = j += c[p];
      xp++;
      p++;
    }
    i = 0;
    p = 0;
    do {
      if ((j = b[bindex + p]) !== 0) {
        v2[x[j]++] = i;
      }
      p++;
    } while (++i < n);
    n = x[g];
    x[0] = i = 0;
    p = 0;
    h = -1;
    w = -l;
    u[0] = 0;
    q = 0;
    z = 0;
    for (; k <= g; k++) {
      a = c[k];
      while (a-- !== 0) {
        while (k > w + l) {
          h++;
          w += l;
          z = g - w;
          z = z > l ? l : z;
          if ((f = 1 << (j = k - w)) > a + 1) {
            f -= a + 1;
            xp = k;
            if (j < z) {
              while (++j < z) {
                if ((f <<= 1) <= c[++xp])
                  break;
                f -= c[xp];
              }
            }
          }
          z = 1 << j;
          if (hn2[0] + z > 1440) {
            return Z_DATA_ERROR1;
          }
          u[h] = q = hn2[0];
          hn2[0] += z;
          if (h !== 0) {
            x[h] = i;
            r[0] = j;
            r[1] = l;
            j = i >>> w - l;
            r[2] = q - u[h - 1] - j;
            hp.set(r, (u[h - 1] + j) * 3);
          } else {
            t[0] = q;
          }
        }
        r[1] = k - w;
        if (p >= n) {
          r[0] = 128 + 64;
        } else if (v2[p] < s) {
          r[0] = v2[p] < 256 ? 0 : 32 + 64;
          r[2] = v2[p++];
        } else {
          r[0] = e2[v2[p] - s] + 16 + 64;
          r[2] = d[v2[p++] - s];
        }
        f = 1 << k - w;
        for (j = i >>> w; j < z; j += f) {
          hp.set(r, (q + j) * 3);
        }
        for (j = 1 << k - 1; (i & j) !== 0; j >>>= 1) {
          i ^= j;
        }
        i ^= j;
        mask = (1 << w) - 1;
        while ((i & mask) != x[h]) {
          h--;
          w -= l;
          mask = (1 << w) - 1;
        }
      }
    }
    return y !== 0 && g != 1 ? Z_BUF_ERROR1 : 0;
  }
  function initWorkArea(vsize) {
    let i;
    if (!hn) {
      hn = [];
      v = [];
      c = new Int32Array(BMAX + 1);
      r = [];
      u = new Int32Array(BMAX);
      x = new Int32Array(BMAX + 1);
    }
    if (v.length < vsize) {
      v = [];
    }
    for (i = 0; i < vsize; i++) {
      v[i] = 0;
    }
    for (i = 0; i < 15 + 1; i++) {
      c[i] = 0;
    }
    for (i = 0; i < 3; i++) {
      r[i] = 0;
    }
    u.set(c.subarray(0, 15), 0);
    x.set(c.subarray(0, 15 + 1), 0);
  }
  that.inflate_trees_bits = function(c2, bb, tb, hp, z) {
    let result;
    initWorkArea(19);
    hn[0] = 0;
    result = huft_build(c2, 0, 19, 19, null, null, tb, bb, hp, hn, v);
    if (result == Z_DATA_ERROR1) {
      z.msg = "oversubscribed dynamic bit lengths tree";
    } else if (result == Z_BUF_ERROR1 || bb[0] === 0) {
      z.msg = "incomplete dynamic bit lengths tree";
      result = Z_DATA_ERROR1;
    }
    return result;
  };
  that.inflate_trees_dynamic = function(nl, nd, c2, bl, bd, tl, td, hp, z) {
    let result;
    initWorkArea(288);
    hn[0] = 0;
    result = huft_build(c2, 0, nl, 257, cplens, cplext, tl, bl, hp, hn, v);
    if (result != Z_OK1 || bl[0] === 0) {
      if (result == Z_DATA_ERROR1) {
        z.msg = "oversubscribed literal/length tree";
      } else if (result != Z_MEM_ERROR) {
        z.msg = "incomplete literal/length tree";
        result = Z_DATA_ERROR1;
      }
      return result;
    }
    initWorkArea(288);
    result = huft_build(c2, nl, nd, 0, cpdist, cpdext, td, bd, hp, hn, v);
    if (result != Z_OK1 || bd[0] === 0 && nl > 257) {
      if (result == Z_DATA_ERROR1) {
        z.msg = "oversubscribed distance tree";
      } else if (result == Z_BUF_ERROR1) {
        z.msg = "incomplete distance tree";
        result = Z_DATA_ERROR1;
      } else if (result != Z_MEM_ERROR) {
        z.msg = "empty distance tree with lengths";
        result = Z_DATA_ERROR1;
      }
      return result;
    }
    return Z_OK1;
  };
}
InfTree.inflate_trees_fixed = function(bl, bd, tl, td) {
  bl[0] = fixed_bl;
  bd[0] = fixed_bd;
  tl[0] = fixed_tl;
  td[0] = fixed_td;
  return Z_OK1;
};
var START = 0;
var LEN = 1;
var LENEXT = 2;
var DIST = 3;
var DISTEXT = 4;
var COPY = 5;
var LIT = 6;
var WASH = 7;
var END = 8;
var BADCODE = 9;
function InfCodes() {
  const that = this;
  let mode2;
  let len = 0;
  let tree;
  let tree_index = 0;
  let need = 0;
  let lit = 0;
  let get = 0;
  let dist = 0;
  let lbits = 0;
  let dbits = 0;
  let ltree;
  let ltree_index = 0;
  let dtree;
  let dtree_index = 0;
  function inflate_fast(bl, bd, tl, tl_index, td, td_index, s, z) {
    let t;
    let tp;
    let tp_index;
    let e2;
    let b;
    let k;
    let p;
    let n;
    let q;
    let m;
    let ml;
    let md;
    let c;
    let d;
    let r;
    let tp_index_t_3;
    p = z.next_in_index;
    n = z.avail_in;
    b = s.bitb;
    k = s.bitk;
    q = s.write;
    m = q < s.read ? s.read - q - 1 : s.end - q;
    ml = inflate_mask[bl];
    md = inflate_mask[bd];
    do {
      while (k < 20) {
        n--;
        b |= (z.read_byte(p++) & 255) << k;
        k += 8;
      }
      t = b & ml;
      tp = tl;
      tp_index = tl_index;
      tp_index_t_3 = (tp_index + t) * 3;
      if ((e2 = tp[tp_index_t_3]) === 0) {
        b >>= tp[tp_index_t_3 + 1];
        k -= tp[tp_index_t_3 + 1];
        s.win[q++] = tp[tp_index_t_3 + 2];
        m--;
        continue;
      }
      do {
        b >>= tp[tp_index_t_3 + 1];
        k -= tp[tp_index_t_3 + 1];
        if ((e2 & 16) !== 0) {
          e2 &= 15;
          c = tp[tp_index_t_3 + 2] + (b & inflate_mask[e2]);
          b >>= e2;
          k -= e2;
          while (k < 15) {
            n--;
            b |= (z.read_byte(p++) & 255) << k;
            k += 8;
          }
          t = b & md;
          tp = td;
          tp_index = td_index;
          tp_index_t_3 = (tp_index + t) * 3;
          e2 = tp[tp_index_t_3];
          do {
            b >>= tp[tp_index_t_3 + 1];
            k -= tp[tp_index_t_3 + 1];
            if ((e2 & 16) !== 0) {
              e2 &= 15;
              while (k < e2) {
                n--;
                b |= (z.read_byte(p++) & 255) << k;
                k += 8;
              }
              d = tp[tp_index_t_3 + 2] + (b & inflate_mask[e2]);
              b >>= e2;
              k -= e2;
              m -= c;
              if (q >= d) {
                r = q - d;
                if (q - r > 0 && 2 > q - r) {
                  s.win[q++] = s.win[r++];
                  s.win[q++] = s.win[r++];
                  c -= 2;
                } else {
                  s.win.set(s.win.subarray(r, r + 2), q);
                  q += 2;
                  r += 2;
                  c -= 2;
                }
              } else {
                r = q - d;
                do {
                  r += s.end;
                } while (r < 0);
                e2 = s.end - r;
                if (c > e2) {
                  c -= e2;
                  if (q - r > 0 && e2 > q - r) {
                    do {
                      s.win[q++] = s.win[r++];
                    } while (--e2 !== 0);
                  } else {
                    s.win.set(s.win.subarray(r, r + e2), q);
                    q += e2;
                    r += e2;
                    e2 = 0;
                  }
                  r = 0;
                }
              }
              if (q - r > 0 && c > q - r) {
                do {
                  s.win[q++] = s.win[r++];
                } while (--c !== 0);
              } else {
                s.win.set(s.win.subarray(r, r + c), q);
                q += c;
                r += c;
                c = 0;
              }
              break;
            } else if ((e2 & 64) === 0) {
              t += tp[tp_index_t_3 + 2];
              t += b & inflate_mask[e2];
              tp_index_t_3 = (tp_index + t) * 3;
              e2 = tp[tp_index_t_3];
            } else {
              z.msg = "invalid distance code";
              c = z.avail_in - n;
              c = k >> 3 < c ? k >> 3 : c;
              n += c;
              p -= c;
              k -= c << 3;
              s.bitb = b;
              s.bitk = k;
              z.avail_in = n;
              z.total_in += p - z.next_in_index;
              z.next_in_index = p;
              s.write = q;
              return Z_DATA_ERROR1;
            }
          } while (true);
          break;
        }
        if ((e2 & 64) === 0) {
          t += tp[tp_index_t_3 + 2];
          t += b & inflate_mask[e2];
          tp_index_t_3 = (tp_index + t) * 3;
          if ((e2 = tp[tp_index_t_3]) === 0) {
            b >>= tp[tp_index_t_3 + 1];
            k -= tp[tp_index_t_3 + 1];
            s.win[q++] = tp[tp_index_t_3 + 2];
            m--;
            break;
          }
        } else if ((e2 & 32) !== 0) {
          c = z.avail_in - n;
          c = k >> 3 < c ? k >> 3 : c;
          n += c;
          p -= c;
          k -= c << 3;
          s.bitb = b;
          s.bitk = k;
          z.avail_in = n;
          z.total_in += p - z.next_in_index;
          z.next_in_index = p;
          s.write = q;
          return 1;
        } else {
          z.msg = "invalid literal/length code";
          c = z.avail_in - n;
          c = k >> 3 < c ? k >> 3 : c;
          n += c;
          p -= c;
          k -= c << 3;
          s.bitb = b;
          s.bitk = k;
          z.avail_in = n;
          z.total_in += p - z.next_in_index;
          z.next_in_index = p;
          s.write = q;
          return Z_DATA_ERROR1;
        }
      } while (true);
    } while (m >= 258 && n >= 10);
    c = z.avail_in - n;
    c = k >> 3 < c ? k >> 3 : c;
    n += c;
    p -= c;
    k -= c << 3;
    s.bitb = b;
    s.bitk = k;
    z.avail_in = n;
    z.total_in += p - z.next_in_index;
    z.next_in_index = p;
    s.write = q;
    return 0;
  }
  that.init = function(bl, bd, tl, tl_index, td, td_index) {
    mode2 = START;
    lbits = bl;
    dbits = bd;
    ltree = tl;
    ltree_index = tl_index;
    dtree = td;
    dtree_index = td_index;
    tree = null;
  };
  that.proc = function(s, z, r) {
    let j;
    let tindex;
    let e2;
    let b = 0;
    let k = 0;
    let p = 0;
    let n;
    let q;
    let m;
    let f;
    p = z.next_in_index;
    n = z.avail_in;
    b = s.bitb;
    k = s.bitk;
    q = s.write;
    m = q < s.read ? s.read - q - 1 : s.end - q;
    while (true) {
      switch (mode2) {
        case START:
          if (m >= 258 && n >= 10) {
            s.bitb = b;
            s.bitk = k;
            z.avail_in = n;
            z.total_in += p - z.next_in_index;
            z.next_in_index = p;
            s.write = q;
            r = inflate_fast(lbits, dbits, ltree, ltree_index, dtree, dtree_index, s, z);
            p = z.next_in_index;
            n = z.avail_in;
            b = s.bitb;
            k = s.bitk;
            q = s.write;
            m = q < s.read ? s.read - q - 1 : s.end - q;
            if (r != Z_OK1) {
              mode2 = r == Z_STREAM_END1 ? WASH : BADCODE;
              break;
            }
          }
          need = lbits;
          tree = ltree;
          tree_index = ltree_index;
          mode2 = LEN;
        case LEN:
          j = need;
          while (k < j) {
            if (n !== 0)
              r = Z_OK1;
            else {
              s.bitb = b;
              s.bitk = k;
              z.avail_in = n;
              z.total_in += p - z.next_in_index;
              z.next_in_index = p;
              s.write = q;
              return s.inflate_flush(z, r);
            }
            n--;
            b |= (z.read_byte(p++) & 255) << k;
            k += 8;
          }
          tindex = (tree_index + (b & inflate_mask[j])) * 3;
          b >>>= tree[tindex + 1];
          k -= tree[tindex + 1];
          e2 = tree[tindex];
          if (e2 === 0) {
            lit = tree[tindex + 2];
            mode2 = LIT;
            break;
          }
          if ((e2 & 16) !== 0) {
            get = e2 & 15;
            len = tree[tindex + 2];
            mode2 = LENEXT;
            break;
          }
          if ((e2 & 64) === 0) {
            need = e2;
            tree_index = tindex / 3 + tree[tindex + 2];
            break;
          }
          if ((e2 & 32) !== 0) {
            mode2 = WASH;
            break;
          }
          mode2 = BADCODE;
          z.msg = "invalid literal/length code";
          r = Z_DATA_ERROR1;
          s.bitb = b;
          s.bitk = k;
          z.avail_in = n;
          z.total_in += p - z.next_in_index;
          z.next_in_index = p;
          s.write = q;
          return s.inflate_flush(z, r);
        case LENEXT:
          j = get;
          while (k < j) {
            if (n !== 0)
              r = Z_OK1;
            else {
              s.bitb = b;
              s.bitk = k;
              z.avail_in = n;
              z.total_in += p - z.next_in_index;
              z.next_in_index = p;
              s.write = q;
              return s.inflate_flush(z, r);
            }
            n--;
            b |= (z.read_byte(p++) & 255) << k;
            k += 8;
          }
          len += b & inflate_mask[j];
          b >>= j;
          k -= j;
          need = dbits;
          tree = dtree;
          tree_index = dtree_index;
          mode2 = DIST;
        case DIST:
          j = need;
          while (k < j) {
            if (n !== 0)
              r = Z_OK1;
            else {
              s.bitb = b;
              s.bitk = k;
              z.avail_in = n;
              z.total_in += p - z.next_in_index;
              z.next_in_index = p;
              s.write = q;
              return s.inflate_flush(z, r);
            }
            n--;
            b |= (z.read_byte(p++) & 255) << k;
            k += 8;
          }
          tindex = (tree_index + (b & inflate_mask[j])) * 3;
          b >>= tree[tindex + 1];
          k -= tree[tindex + 1];
          e2 = tree[tindex];
          if ((e2 & 16) !== 0) {
            get = e2 & 15;
            dist = tree[tindex + 2];
            mode2 = DISTEXT;
            break;
          }
          if ((e2 & 64) === 0) {
            need = e2;
            tree_index = tindex / 3 + tree[tindex + 2];
            break;
          }
          mode2 = BADCODE;
          z.msg = "invalid distance code";
          r = Z_DATA_ERROR1;
          s.bitb = b;
          s.bitk = k;
          z.avail_in = n;
          z.total_in += p - z.next_in_index;
          z.next_in_index = p;
          s.write = q;
          return s.inflate_flush(z, r);
        case DISTEXT:
          j = get;
          while (k < j) {
            if (n !== 0)
              r = Z_OK1;
            else {
              s.bitb = b;
              s.bitk = k;
              z.avail_in = n;
              z.total_in += p - z.next_in_index;
              z.next_in_index = p;
              s.write = q;
              return s.inflate_flush(z, r);
            }
            n--;
            b |= (z.read_byte(p++) & 255) << k;
            k += 8;
          }
          dist += b & inflate_mask[j];
          b >>= j;
          k -= j;
          mode2 = COPY;
        case COPY:
          f = q - dist;
          while (f < 0) {
            f += s.end;
          }
          while (len !== 0) {
            if (m === 0) {
              if (q == s.end && s.read !== 0) {
                q = 0;
                m = q < s.read ? s.read - q - 1 : s.end - q;
              }
              if (m === 0) {
                s.write = q;
                r = s.inflate_flush(z, r);
                q = s.write;
                m = q < s.read ? s.read - q - 1 : s.end - q;
                if (q == s.end && s.read !== 0) {
                  q = 0;
                  m = q < s.read ? s.read - q - 1 : s.end - q;
                }
                if (m === 0) {
                  s.bitb = b;
                  s.bitk = k;
                  z.avail_in = n;
                  z.total_in += p - z.next_in_index;
                  z.next_in_index = p;
                  s.write = q;
                  return s.inflate_flush(z, r);
                }
              }
            }
            s.win[q++] = s.win[f++];
            m--;
            if (f == s.end)
              f = 0;
            len--;
          }
          mode2 = START;
          break;
        case LIT:
          if (m === 0) {
            if (q == s.end && s.read !== 0) {
              q = 0;
              m = q < s.read ? s.read - q - 1 : s.end - q;
            }
            if (m === 0) {
              s.write = q;
              r = s.inflate_flush(z, r);
              q = s.write;
              m = q < s.read ? s.read - q - 1 : s.end - q;
              if (q == s.end && s.read !== 0) {
                q = 0;
                m = q < s.read ? s.read - q - 1 : s.end - q;
              }
              if (m === 0) {
                s.bitb = b;
                s.bitk = k;
                z.avail_in = n;
                z.total_in += p - z.next_in_index;
                z.next_in_index = p;
                s.write = q;
                return s.inflate_flush(z, r);
              }
            }
          }
          r = Z_OK1;
          s.win[q++] = lit;
          m--;
          mode2 = START;
          break;
        case WASH:
          if (k > 7) {
            k -= 8;
            n++;
            p--;
          }
          s.write = q;
          r = s.inflate_flush(z, r);
          q = s.write;
          m = q < s.read ? s.read - q - 1 : s.end - q;
          if (s.read != s.write) {
            s.bitb = b;
            s.bitk = k;
            z.avail_in = n;
            z.total_in += p - z.next_in_index;
            z.next_in_index = p;
            s.write = q;
            return s.inflate_flush(z, r);
          }
          mode2 = END;
        case END:
          r = Z_STREAM_END1;
          s.bitb = b;
          s.bitk = k;
          z.avail_in = n;
          z.total_in += p - z.next_in_index;
          z.next_in_index = p;
          s.write = q;
          return s.inflate_flush(z, r);
        case BADCODE:
          r = Z_DATA_ERROR1;
          s.bitb = b;
          s.bitk = k;
          z.avail_in = n;
          z.total_in += p - z.next_in_index;
          z.next_in_index = p;
          s.write = q;
          return s.inflate_flush(z, r);
        default:
          r = Z_STREAM_ERROR1;
          s.bitb = b;
          s.bitk = k;
          z.avail_in = n;
          z.total_in += p - z.next_in_index;
          z.next_in_index = p;
          s.write = q;
          return s.inflate_flush(z, r);
      }
    }
  };
  that.free = function() {
  };
}
var border = [
  16,
  17,
  18,
  0,
  8,
  7,
  9,
  6,
  10,
  5,
  11,
  4,
  12,
  3,
  13,
  2,
  14,
  1,
  15
];
var TYPE = 0;
var LENS = 1;
var STORED1 = 2;
var TABLE = 3;
var BTREE = 4;
var DTREE = 5;
var CODES = 6;
var DRY = 7;
var DONELOCKS = 8;
var BADBLOCKS = 9;
function InfBlocks(z, w) {
  const that = this;
  let mode2 = 0;
  let left = 0;
  let table2 = 0;
  let index = 0;
  let blens;
  const bb = [
    0
  ];
  const tb = [
    0
  ];
  const codes = new InfCodes();
  let last = 0;
  let hufts = new Int32Array(1440 * 3);
  const check = 0;
  const inftree = new InfTree();
  that.bitk = 0;
  that.bitb = 0;
  that.win = new Uint8Array(w);
  that.end = w;
  that.read = 0;
  that.write = 0;
  that.reset = function(z2, c) {
    if (c)
      c[0] = check;
    if (mode2 == CODES) {
      codes.free(z2);
    }
    mode2 = TYPE;
    that.bitk = 0;
    that.bitb = 0;
    that.read = that.write = 0;
  };
  that.reset(z, null);
  that.inflate_flush = function(z2, r) {
    let n;
    let p;
    let q;
    p = z2.next_out_index;
    q = that.read;
    n = (q <= that.write ? that.write : that.end) - q;
    if (n > z2.avail_out)
      n = z2.avail_out;
    if (n !== 0 && r == Z_BUF_ERROR1)
      r = Z_OK1;
    z2.avail_out -= n;
    z2.total_out += n;
    z2.next_out.set(that.win.subarray(q, q + n), p);
    p += n;
    q += n;
    if (q == that.end) {
      q = 0;
      if (that.write == that.end)
        that.write = 0;
      n = that.write - q;
      if (n > z2.avail_out)
        n = z2.avail_out;
      if (n !== 0 && r == Z_BUF_ERROR1)
        r = Z_OK1;
      z2.avail_out -= n;
      z2.total_out += n;
      z2.next_out.set(that.win.subarray(q, q + n), p);
      p += n;
      q += n;
    }
    z2.next_out_index = p;
    that.read = q;
    return r;
  };
  that.proc = function(z2, r) {
    let t;
    let b;
    let k;
    let p;
    let n;
    let q;
    let m;
    let i;
    p = z2.next_in_index;
    n = z2.avail_in;
    b = that.bitb;
    k = that.bitk;
    q = that.write;
    m = q < that.read ? that.read - q - 1 : that.end - q;
    while (true) {
      let bl, bd, tl, td, bl_, bd_, tl_, td_;
      switch (mode2) {
        case TYPE:
          while (k < 3) {
            if (n !== 0) {
              r = Z_OK1;
            } else {
              that.bitb = b;
              that.bitk = k;
              z2.avail_in = n;
              z2.total_in += p - z2.next_in_index;
              z2.next_in_index = p;
              that.write = q;
              return that.inflate_flush(z2, r);
            }
            n--;
            b |= (z2.read_byte(p++) & 255) << k;
            k += 8;
          }
          t = b & 7;
          last = t & 1;
          switch (t >>> 1) {
            case 0:
              b >>>= 3;
              k -= 3;
              t = k & 7;
              b >>>= t;
              k -= t;
              mode2 = LENS;
              break;
            case 1:
              bl = [];
              bd = [];
              tl = [
                []
              ];
              td = [
                []
              ];
              InfTree.inflate_trees_fixed(bl, bd, tl, td);
              codes.init(bl[0], bd[0], tl[0], 0, td[0], 0);
              b >>>= 3;
              k -= 3;
              mode2 = CODES;
              break;
            case 2:
              b >>>= 3;
              k -= 3;
              mode2 = TABLE;
              break;
            case 3:
              b >>>= 3;
              k -= 3;
              mode2 = BADBLOCKS;
              z2.msg = "invalid block type";
              r = Z_DATA_ERROR1;
              that.bitb = b;
              that.bitk = k;
              z2.avail_in = n;
              z2.total_in += p - z2.next_in_index;
              z2.next_in_index = p;
              that.write = q;
              return that.inflate_flush(z2, r);
          }
          break;
        case LENS:
          while (k < 32) {
            if (n !== 0) {
              r = Z_OK1;
            } else {
              that.bitb = b;
              that.bitk = k;
              z2.avail_in = n;
              z2.total_in += p - z2.next_in_index;
              z2.next_in_index = p;
              that.write = q;
              return that.inflate_flush(z2, r);
            }
            n--;
            b |= (z2.read_byte(p++) & 255) << k;
            k += 8;
          }
          if ((~b >>> 16 & 65535) != (b & 65535)) {
            mode2 = BADBLOCKS;
            z2.msg = "invalid stored block lengths";
            r = Z_DATA_ERROR1;
            that.bitb = b;
            that.bitk = k;
            z2.avail_in = n;
            z2.total_in += p - z2.next_in_index;
            z2.next_in_index = p;
            that.write = q;
            return that.inflate_flush(z2, r);
          }
          left = b & 65535;
          b = k = 0;
          mode2 = left !== 0 ? STORED1 : last !== 0 ? DRY : TYPE;
          break;
        case STORED1:
          if (n === 0) {
            that.bitb = b;
            that.bitk = k;
            z2.avail_in = n;
            z2.total_in += p - z2.next_in_index;
            z2.next_in_index = p;
            that.write = q;
            return that.inflate_flush(z2, r);
          }
          if (m === 0) {
            if (q == that.end && that.read !== 0) {
              q = 0;
              m = q < that.read ? that.read - q - 1 : that.end - q;
            }
            if (m === 0) {
              that.write = q;
              r = that.inflate_flush(z2, r);
              q = that.write;
              m = q < that.read ? that.read - q - 1 : that.end - q;
              if (q == that.end && that.read !== 0) {
                q = 0;
                m = q < that.read ? that.read - q - 1 : that.end - q;
              }
              if (m === 0) {
                that.bitb = b;
                that.bitk = k;
                z2.avail_in = n;
                z2.total_in += p - z2.next_in_index;
                z2.next_in_index = p;
                that.write = q;
                return that.inflate_flush(z2, r);
              }
            }
          }
          r = Z_OK1;
          t = left;
          if (t > n)
            t = n;
          if (t > m)
            t = m;
          that.win.set(z2.read_buf(p, t), q);
          p += t;
          n -= t;
          q += t;
          m -= t;
          if ((left -= t) !== 0)
            break;
          mode2 = last !== 0 ? DRY : TYPE;
          break;
        case TABLE:
          while (k < 14) {
            if (n !== 0) {
              r = Z_OK1;
            } else {
              that.bitb = b;
              that.bitk = k;
              z2.avail_in = n;
              z2.total_in += p - z2.next_in_index;
              z2.next_in_index = p;
              that.write = q;
              return that.inflate_flush(z2, r);
            }
            n--;
            b |= (z2.read_byte(p++) & 255) << k;
            k += 8;
          }
          table2 = t = b & 16383;
          if ((t & 31) > 29 || (t >> 5 & 31) > 29) {
            mode2 = BADBLOCKS;
            z2.msg = "too many length or distance symbols";
            r = Z_DATA_ERROR1;
            that.bitb = b;
            that.bitk = k;
            z2.avail_in = n;
            z2.total_in += p - z2.next_in_index;
            z2.next_in_index = p;
            that.write = q;
            return that.inflate_flush(z2, r);
          }
          t = 258 + (t & 31) + (t >> 5 & 31);
          if (!blens || blens.length < t) {
            blens = [];
          } else {
            for (i = 0; i < t; i++) {
              blens[i] = 0;
            }
          }
          b >>>= 14;
          k -= 14;
          index = 0;
          mode2 = BTREE;
        case BTREE:
          while (index < 4 + (table2 >>> 10)) {
            while (k < 3) {
              if (n !== 0) {
                r = Z_OK1;
              } else {
                that.bitb = b;
                that.bitk = k;
                z2.avail_in = n;
                z2.total_in += p - z2.next_in_index;
                z2.next_in_index = p;
                that.write = q;
                return that.inflate_flush(z2, r);
              }
              n--;
              b |= (z2.read_byte(p++) & 255) << k;
              k += 8;
            }
            blens[border[index++]] = b & 7;
            b >>>= 3;
            k -= 3;
          }
          while (index < 19) {
            blens[border[index++]] = 0;
          }
          bb[0] = 7;
          t = inftree.inflate_trees_bits(blens, bb, tb, hufts, z2);
          if (t != Z_OK1) {
            r = t;
            if (r == Z_DATA_ERROR1) {
              blens = null;
              mode2 = BADBLOCKS;
            }
            that.bitb = b;
            that.bitk = k;
            z2.avail_in = n;
            z2.total_in += p - z2.next_in_index;
            z2.next_in_index = p;
            that.write = q;
            return that.inflate_flush(z2, r);
          }
          index = 0;
          mode2 = DTREE;
        case DTREE:
          while (true) {
            t = table2;
            if (index >= 258 + (t & 31) + (t >> 5 & 31)) {
              break;
            }
            let j, c;
            t = bb[0];
            while (k < t) {
              if (n !== 0) {
                r = Z_OK1;
              } else {
                that.bitb = b;
                that.bitk = k;
                z2.avail_in = n;
                z2.total_in += p - z2.next_in_index;
                z2.next_in_index = p;
                that.write = q;
                return that.inflate_flush(z2, r);
              }
              n--;
              b |= (z2.read_byte(p++) & 255) << k;
              k += 8;
            }
            t = hufts[(tb[0] + (b & inflate_mask[t])) * 3 + 1];
            c = hufts[(tb[0] + (b & inflate_mask[t])) * 3 + 2];
            if (c < 16) {
              b >>>= t;
              k -= t;
              blens[index++] = c;
            } else {
              i = c == 18 ? 7 : c - 14;
              j = c == 18 ? 11 : 3;
              while (k < t + i) {
                if (n !== 0) {
                  r = Z_OK1;
                } else {
                  that.bitb = b;
                  that.bitk = k;
                  z2.avail_in = n;
                  z2.total_in += p - z2.next_in_index;
                  z2.next_in_index = p;
                  that.write = q;
                  return that.inflate_flush(z2, r);
                }
                n--;
                b |= (z2.read_byte(p++) & 255) << k;
                k += 8;
              }
              b >>>= t;
              k -= t;
              j += b & inflate_mask[i];
              b >>>= i;
              k -= i;
              i = index;
              t = table2;
              if (i + j > 258 + (t & 31) + (t >> 5 & 31) || c == 16 && i < 1) {
                blens = null;
                mode2 = BADBLOCKS;
                z2.msg = "invalid bit length repeat";
                r = Z_DATA_ERROR1;
                that.bitb = b;
                that.bitk = k;
                z2.avail_in = n;
                z2.total_in += p - z2.next_in_index;
                z2.next_in_index = p;
                that.write = q;
                return that.inflate_flush(z2, r);
              }
              c = c == 16 ? blens[i - 1] : 0;
              do {
                blens[i++] = c;
              } while (--j !== 0);
              index = i;
            }
          }
          tb[0] = -1;
          bl_ = [];
          bd_ = [];
          tl_ = [];
          td_ = [];
          bl_[0] = 9;
          bd_[0] = 6;
          t = table2;
          t = inftree.inflate_trees_dynamic(257 + (t & 31), 1 + (t >> 5 & 31), blens, bl_, bd_, tl_, td_, hufts, z2);
          if (t != Z_OK1) {
            if (t == Z_DATA_ERROR1) {
              blens = null;
              mode2 = BADBLOCKS;
            }
            r = t;
            that.bitb = b;
            that.bitk = k;
            z2.avail_in = n;
            z2.total_in += p - z2.next_in_index;
            z2.next_in_index = p;
            that.write = q;
            return that.inflate_flush(z2, r);
          }
          codes.init(bl_[0], bd_[0], hufts, tl_[0], hufts, td_[0]);
          mode2 = CODES;
        case CODES:
          that.bitb = b;
          that.bitk = k;
          z2.avail_in = n;
          z2.total_in += p - z2.next_in_index;
          z2.next_in_index = p;
          that.write = q;
          if ((r = codes.proc(that, z2, r)) != Z_STREAM_END1) {
            return that.inflate_flush(z2, r);
          }
          r = Z_OK1;
          codes.free(z2);
          p = z2.next_in_index;
          n = z2.avail_in;
          b = that.bitb;
          k = that.bitk;
          q = that.write;
          m = q < that.read ? that.read - q - 1 : that.end - q;
          if (last === 0) {
            mode2 = TYPE;
            break;
          }
          mode2 = DRY;
        case DRY:
          that.write = q;
          r = that.inflate_flush(z2, r);
          q = that.write;
          m = q < that.read ? that.read - q - 1 : that.end - q;
          if (that.read != that.write) {
            that.bitb = b;
            that.bitk = k;
            z2.avail_in = n;
            z2.total_in += p - z2.next_in_index;
            z2.next_in_index = p;
            that.write = q;
            return that.inflate_flush(z2, r);
          }
          mode2 = DONELOCKS;
        case DONELOCKS:
          r = Z_STREAM_END1;
          that.bitb = b;
          that.bitk = k;
          z2.avail_in = n;
          z2.total_in += p - z2.next_in_index;
          z2.next_in_index = p;
          that.write = q;
          return that.inflate_flush(z2, r);
        case BADBLOCKS:
          r = Z_DATA_ERROR1;
          that.bitb = b;
          that.bitk = k;
          z2.avail_in = n;
          z2.total_in += p - z2.next_in_index;
          z2.next_in_index = p;
          that.write = q;
          return that.inflate_flush(z2, r);
        default:
          r = Z_STREAM_ERROR1;
          that.bitb = b;
          that.bitk = k;
          z2.avail_in = n;
          z2.total_in += p - z2.next_in_index;
          z2.next_in_index = p;
          that.write = q;
          return that.inflate_flush(z2, r);
      }
    }
  };
  that.free = function(z2) {
    that.reset(z2, null);
    that.win = null;
    hufts = null;
  };
  that.set_dictionary = function(d, start, n) {
    that.win.set(d.subarray(start, start + n), 0);
    that.read = that.write = n;
  };
  that.sync_point = function() {
    return mode2 == LENS ? 1 : 0;
  };
}
var PRESET_DICT1 = 32;
var Z_DEFLATED1 = 8;
var METHOD = 0;
var FLAG = 1;
var DICT4 = 2;
var DICT3 = 3;
var DICT2 = 4;
var DICT1 = 5;
var DICT0 = 6;
var BLOCKS = 7;
var DONE = 12;
var BAD = 13;
var mark = [
  0,
  0,
  255,
  255
];
function Inflate() {
  const that = this;
  that.mode = 0;
  that.method = 0;
  that.was = [
    0
  ];
  that.need = 0;
  that.marker = 0;
  that.wbits = 0;
  function inflateReset(z) {
    if (!z || !z.istate)
      return Z_STREAM_ERROR1;
    z.total_in = z.total_out = 0;
    z.msg = null;
    z.istate.mode = BLOCKS;
    z.istate.blocks.reset(z, null);
    return 0;
  }
  that.inflateEnd = function(z) {
    if (that.blocks)
      that.blocks.free(z);
    that.blocks = null;
    return Z_OK1;
  };
  that.inflateInit = function(z, w) {
    z.msg = null;
    that.blocks = null;
    if (w < 8 || w > 15) {
      that.inflateEnd(z);
      return Z_STREAM_ERROR1;
    }
    that.wbits = w;
    z.istate.blocks = new InfBlocks(z, 1 << w);
    inflateReset(z);
    return Z_OK1;
  };
  that.inflate = function(z, f) {
    let r;
    let b;
    if (!z || !z.istate || !z.next_in)
      return Z_STREAM_ERROR1;
    const istate = z.istate;
    f = f == Z_FINISH1 ? Z_BUF_ERROR1 : Z_OK1;
    r = Z_BUF_ERROR1;
    while (true) {
      switch (istate.mode) {
        case METHOD:
          if (z.avail_in === 0)
            return r;
          r = f;
          z.avail_in--;
          z.total_in++;
          if (((istate.method = z.read_byte(z.next_in_index++)) & 15) != Z_DEFLATED1) {
            istate.mode = BAD;
            z.msg = "unknown compression method";
            istate.marker = 5;
            break;
          }
          if ((istate.method >> 4) + 8 > istate.wbits) {
            istate.mode = BAD;
            z.msg = "invalid win size";
            istate.marker = 5;
            break;
          }
          istate.mode = FLAG;
        case FLAG:
          if (z.avail_in === 0)
            return r;
          r = f;
          z.avail_in--;
          z.total_in++;
          b = z.read_byte(z.next_in_index++) & 255;
          if (((istate.method << 8) + b) % 31 !== 0) {
            istate.mode = BAD;
            z.msg = "incorrect header check";
            istate.marker = 5;
            break;
          }
          if ((b & PRESET_DICT1) === 0) {
            istate.mode = BLOCKS;
            break;
          }
          istate.mode = DICT4;
        case DICT4:
          if (z.avail_in === 0)
            return r;
          r = f;
          z.avail_in--;
          z.total_in++;
          istate.need = (z.read_byte(z.next_in_index++) & 255) << 24 & 4278190080;
          istate.mode = DICT3;
        case DICT3:
          if (z.avail_in === 0)
            return r;
          r = f;
          z.avail_in--;
          z.total_in++;
          istate.need += (z.read_byte(z.next_in_index++) & 255) << 16 & 16711680;
          istate.mode = DICT2;
        case DICT2:
          if (z.avail_in === 0)
            return r;
          r = f;
          z.avail_in--;
          z.total_in++;
          istate.need += (z.read_byte(z.next_in_index++) & 255) << 8 & 65280;
          istate.mode = DICT1;
        case DICT1:
          if (z.avail_in === 0)
            return r;
          r = f;
          z.avail_in--;
          z.total_in++;
          istate.need += z.read_byte(z.next_in_index++) & 255;
          istate.mode = DICT0;
          return Z_NEED_DICT1;
        case DICT0:
          istate.mode = BAD;
          z.msg = "need dictionary";
          istate.marker = 0;
          return Z_STREAM_ERROR1;
        case BLOCKS:
          r = istate.blocks.proc(z, r);
          if (r == Z_DATA_ERROR1) {
            istate.mode = BAD;
            istate.marker = 0;
            break;
          }
          if (r == Z_OK1) {
            r = f;
          }
          if (r != Z_STREAM_END1) {
            return r;
          }
          r = f;
          istate.blocks.reset(z, istate.was);
          istate.mode = DONE;
        case DONE:
          z.avail_in = 0;
          return Z_STREAM_END1;
        case BAD:
          return Z_DATA_ERROR1;
        default:
          return Z_STREAM_ERROR1;
      }
    }
  };
  that.inflateSetDictionary = function(z, dictionary, dictLength) {
    let index = 0, length = dictLength;
    if (!z || !z.istate || z.istate.mode != DICT0)
      return Z_STREAM_ERROR1;
    const istate = z.istate;
    if (length >= 1 << istate.wbits) {
      length = (1 << istate.wbits) - 1;
      index = dictLength - length;
    }
    istate.blocks.set_dictionary(dictionary, index, length);
    istate.mode = BLOCKS;
    return Z_OK1;
  };
  that.inflateSync = function(z) {
    let n;
    let p;
    let m;
    let r, w;
    if (!z || !z.istate)
      return Z_STREAM_ERROR1;
    const istate = z.istate;
    if (istate.mode != BAD) {
      istate.mode = BAD;
      istate.marker = 0;
    }
    if ((n = z.avail_in) === 0)
      return Z_BUF_ERROR1;
    p = z.next_in_index;
    m = istate.marker;
    while (n !== 0 && m < 4) {
      if (z.read_byte(p) == mark[m]) {
        m++;
      } else if (z.read_byte(p) !== 0) {
        m = 0;
      } else {
        m = 4 - m;
      }
      p++;
      n--;
    }
    z.total_in += p - z.next_in_index;
    z.next_in_index = p;
    z.avail_in = n;
    istate.marker = m;
    if (m != 4) {
      return Z_DATA_ERROR1;
    }
    r = z.total_in;
    w = z.total_out;
    inflateReset(z);
    z.total_in = r;
    z.total_out = w;
    istate.mode = BLOCKS;
    return Z_OK1;
  };
  that.inflateSyncPoint = function(z) {
    if (!z || !z.istate || !z.istate.blocks)
      return Z_STREAM_ERROR1;
    return z.istate.blocks.sync_point();
  };
}
function ZStream1() {
}
ZStream1.prototype = {
  inflateInit(bits) {
    const that = this;
    that.istate = new Inflate();
    if (!bits)
      bits = MAX_BITS1;
    return that.istate.inflateInit(that, bits);
  },
  inflate(f) {
    const that = this;
    if (!that.istate)
      return Z_STREAM_ERROR1;
    return that.istate.inflate(that, f);
  },
  inflateEnd() {
    const that = this;
    if (!that.istate)
      return Z_STREAM_ERROR1;
    const ret = that.istate.inflateEnd(that);
    that.istate = null;
    return ret;
  },
  inflateSync() {
    const that = this;
    if (!that.istate)
      return Z_STREAM_ERROR1;
    return that.istate.inflateSync(that);
  },
  inflateSetDictionary(dictionary, dictLength) {
    const that = this;
    if (!that.istate)
      return Z_STREAM_ERROR1;
    return that.istate.inflateSetDictionary(that, dictionary, dictLength);
  },
  read_byte(start) {
    const that = this;
    return that.next_in[start];
  },
  read_buf(start, size) {
    const that = this;
    return that.next_in.subarray(start, start + size);
  }
};
function ZipInflate(options) {
  const that = this;
  const z = new ZStream1();
  const bufsize = options && options.chunkSize ? Math.floor(options.chunkSize * 2) : 128 * 1024;
  const flush = 0;
  const buf = new Uint8Array(bufsize);
  let nomoreinput = false;
  z.inflateInit();
  z.next_out = buf;
  that.append = function(data, onprogress) {
    const buffers = [];
    let err, array, lastIndex = 0, bufferIndex = 0, bufferSize = 0;
    if (data.length === 0)
      return;
    z.next_in_index = 0;
    z.next_in = data;
    z.avail_in = data.length;
    do {
      z.next_out_index = 0;
      z.avail_out = bufsize;
      if (z.avail_in === 0 && !nomoreinput) {
        z.next_in_index = 0;
        nomoreinput = true;
      }
      err = z.inflate(flush);
      if (nomoreinput && err === Z_BUF_ERROR1) {
        if (z.avail_in !== 0)
          throw new Error("inflating: bad input");
      } else if (err !== Z_OK1 && err !== Z_STREAM_END1)
        throw new Error("inflating: " + z.msg);
      if ((nomoreinput || err === Z_STREAM_END1) && z.avail_in === data.length)
        throw new Error("inflating: bad input");
      if (z.next_out_index)
        if (z.next_out_index === bufsize)
          buffers.push(new Uint8Array(buf));
        else
          buffers.push(buf.subarray(0, z.next_out_index));
      bufferSize += z.next_out_index;
      if (onprogress && z.next_in_index > 0 && z.next_in_index != lastIndex) {
        onprogress(z.next_in_index);
        lastIndex = z.next_in_index;
      }
    } while (z.avail_in > 0 || z.avail_out === 0);
    if (buffers.length > 1) {
      array = new Uint8Array(bufferSize);
      buffers.forEach(function(chunk) {
        array.set(chunk, bufferIndex);
        bufferIndex += chunk.length;
      });
    } else {
      array = buffers[0] ? new Uint8Array(buffers[0]) : new Uint8Array();
    }
    return array;
  };
  that.flush = function() {
    z.inflateEnd();
  };
}
var MAX_32_BITS = 4294967295;
var MAX_16_BITS = 65535;
var COMPRESSION_METHOD_DEFLATE = 8;
var COMPRESSION_METHOD_AES = 99;
var END_OF_CENTRAL_DIR_LENGTH = 22;
var ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH = 20;
var ZIP64_END_OF_CENTRAL_DIR_LENGTH = 56;
var ZIP64_END_OF_CENTRAL_DIR_TOTAL_LENGTH = 22 + 20 + 56;
var BITFLAG_ENCRYPTED = 1;
var BITFLAG_DATA_DESCRIPTOR = 8;
var VERSION_ZIP64 = 45;
var VERSION_AES = 51;
var DIRECTORY_SIGNATURE = "/";
var MAX_DATE = new Date(2107, 11, 31);
var MIN_DATE = new Date(1980, 0, 1);
var UNDEFINED_VALUE = void 0;
var UNDEFINED_TYPE = "undefined";
var FUNCTION_TYPE = "function";
var StreamAdapter = class {
  constructor(Codec) {
    return class extends TransformStream {
      constructor(_format, options) {
        const codec2 = new Codec(options);
        super({
          transform(chunk, controller) {
            controller.enqueue(codec2.append(chunk));
          },
          flush(controller) {
            const chunk = codec2.flush();
            if (chunk) {
              controller.enqueue(chunk);
            }
          }
        });
      }
    };
  }
};
var maxWorkers = 2;
try {
  if (typeof navigator != UNDEFINED_TYPE && navigator.hardwareConcurrency) {
    maxWorkers = navigator.hardwareConcurrency;
  }
} catch (_error) {
}
var DEFAULT_CONFIGURATION = {
  chunkSize: 512 * 1024,
  maxWorkers,
  terminateWorkerTimeout: 5e3,
  useWebWorkers: true,
  useCompressionStream: true,
  workerScripts: UNDEFINED_VALUE,
  CompressionStreamNative: typeof CompressionStream != UNDEFINED_TYPE && CompressionStream,
  DecompressionStreamNative: typeof DecompressionStream != UNDEFINED_TYPE && DecompressionStream
};
var config = Object.assign({}, DEFAULT_CONFIGURATION);
function getConfiguration() {
  return config;
}
function getChunkSize(config2) {
  return Math.max(config2.chunkSize, 64);
}
function configure(configuration) {
  const { baseURL: baseURL2, chunkSize, maxWorkers: maxWorkers2, terminateWorkerTimeout, useCompressionStream, useWebWorkers, Deflate: Deflate2, Inflate: Inflate2, CompressionStream: CompressionStream1, DecompressionStream: DecompressionStream1, workerScripts } = configuration;
  setIfDefined("baseURL", baseURL2);
  setIfDefined("chunkSize", chunkSize);
  setIfDefined("maxWorkers", maxWorkers2);
  setIfDefined("terminateWorkerTimeout", terminateWorkerTimeout);
  setIfDefined("useCompressionStream", useCompressionStream);
  setIfDefined("useWebWorkers", useWebWorkers);
  if (Deflate2) {
    config.CompressionStream = new StreamAdapter(Deflate2);
  }
  if (Inflate2) {
    config.DecompressionStream = new StreamAdapter(Inflate2);
  }
  setIfDefined("CompressionStream", CompressionStream1);
  setIfDefined("DecompressionStream", DecompressionStream1);
  if (workerScripts !== UNDEFINED_VALUE) {
    const { deflate, inflate } = workerScripts;
    if (deflate || inflate) {
      if (!config.workerScripts) {
        config.workerScripts = {};
      }
    }
    if (deflate) {
      if (!Array.isArray(deflate)) {
        throw new Error("workerScripts.deflate must be an array");
      }
      config.workerScripts.deflate = deflate;
    }
    if (inflate) {
      if (!Array.isArray(inflate)) {
        throw new Error("workerScripts.inflate must be an array");
      }
      config.workerScripts.inflate = inflate;
    }
  }
}
function setIfDefined(propertyName, propertyValue) {
  if (propertyValue !== UNDEFINED_VALUE) {
    config[propertyName] = propertyValue;
  }
}
var table = {
  "application": {
    "andrew-inset": "ez",
    "annodex": "anx",
    "atom+xml": "atom",
    "atomcat+xml": "atomcat",
    "atomserv+xml": "atomsrv",
    "bbolin": "lin",
    "cu-seeme": "cu",
    "davmount+xml": "davmount",
    "dsptype": "tsp",
    "ecmascript": [
      "es",
      "ecma"
    ],
    "futuresplash": "spl",
    "hta": "hta",
    "java-archive": "jar",
    "java-serialized-object": "ser",
    "java-vm": "class",
    "m3g": "m3g",
    "mac-binhex40": "hqx",
    "mathematica": [
      "nb",
      "ma",
      "mb"
    ],
    "msaccess": "mdb",
    "msword": [
      "doc",
      "dot",
      "wiz"
    ],
    "mxf": "mxf",
    "oda": "oda",
    "ogg": "ogx",
    "pdf": "pdf",
    "pgp-keys": "key",
    "pgp-signature": [
      "asc",
      "sig"
    ],
    "pics-rules": "prf",
    "postscript": [
      "ps",
      "ai",
      "eps",
      "epsi",
      "epsf",
      "eps2",
      "eps3"
    ],
    "rar": "rar",
    "rdf+xml": "rdf",
    "rss+xml": "rss",
    "rtf": "rtf",
    "xhtml+xml": [
      "xhtml",
      "xht"
    ],
    "xml": [
      "xml",
      "xsl",
      "xsd",
      "xpdl"
    ],
    "xspf+xml": "xspf",
    "zip": "zip",
    "vnd.android.package-archive": "apk",
    "vnd.cinderella": "cdy",
    "vnd.google-earth.kml+xml": "kml",
    "vnd.google-earth.kmz": "kmz",
    "vnd.mozilla.xul+xml": "xul",
    "vnd.ms-excel": [
      "xls",
      "xlb",
      "xlt",
      "xlm",
      "xla",
      "xlc",
      "xlw"
    ],
    "vnd.ms-pki.seccat": "cat",
    "vnd.ms-pki.stl": "stl",
    "vnd.ms-powerpoint": [
      "ppt",
      "pps",
      "pot",
      "ppa",
      "pwz"
    ],
    "vnd.oasis.opendocument.chart": "odc",
    "vnd.oasis.opendocument.database": "odb",
    "vnd.oasis.opendocument.formula": "odf",
    "vnd.oasis.opendocument.graphics": "odg",
    "vnd.oasis.opendocument.graphics-template": "otg",
    "vnd.oasis.opendocument.image": "odi",
    "vnd.oasis.opendocument.presentation": "odp",
    "vnd.oasis.opendocument.presentation-template": "otp",
    "vnd.oasis.opendocument.spreadsheet": "ods",
    "vnd.oasis.opendocument.spreadsheet-template": "ots",
    "vnd.oasis.opendocument.text": "odt",
    "vnd.oasis.opendocument.text-master": [
      "odm",
      "otm"
    ],
    "vnd.oasis.opendocument.text-template": "ott",
    "vnd.oasis.opendocument.text-web": "oth",
    "vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "vnd.openxmlformats-officedocument.spreadsheetml.template": "xltx",
    "vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
    "vnd.openxmlformats-officedocument.presentationml.slideshow": "ppsx",
    "vnd.openxmlformats-officedocument.presentationml.template": "potx",
    "vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "vnd.openxmlformats-officedocument.wordprocessingml.template": "dotx",
    "vnd.smaf": "mmf",
    "vnd.stardivision.calc": "sdc",
    "vnd.stardivision.chart": "sds",
    "vnd.stardivision.draw": "sda",
    "vnd.stardivision.impress": "sdd",
    "vnd.stardivision.math": [
      "sdf",
      "smf"
    ],
    "vnd.stardivision.writer": [
      "sdw",
      "vor"
    ],
    "vnd.stardivision.writer-global": "sgl",
    "vnd.sun.xml.calc": "sxc",
    "vnd.sun.xml.calc.template": "stc",
    "vnd.sun.xml.draw": "sxd",
    "vnd.sun.xml.draw.template": "std",
    "vnd.sun.xml.impress": "sxi",
    "vnd.sun.xml.impress.template": "sti",
    "vnd.sun.xml.math": "sxm",
    "vnd.sun.xml.writer": "sxw",
    "vnd.sun.xml.writer.global": "sxg",
    "vnd.sun.xml.writer.template": "stw",
    "vnd.symbian.install": [
      "sis",
      "sisx"
    ],
    "vnd.visio": [
      "vsd",
      "vst",
      "vss",
      "vsw",
      "vsdx",
      "vssx",
      "vstx",
      "vssm",
      "vstm"
    ],
    "vnd.wap.wbxml": "wbxml",
    "vnd.wap.wmlc": "wmlc",
    "vnd.wap.wmlscriptc": "wmlsc",
    "vnd.wordperfect": "wpd",
    "vnd.wordperfect5.1": "wp5",
    "x-123": "wk",
    "x-7z-compressed": "7z",
    "x-abiword": "abw",
    "x-apple-diskimage": "dmg",
    "x-bcpio": "bcpio",
    "x-bittorrent": "torrent",
    "x-cbr": [
      "cbr",
      "cba",
      "cbt",
      "cb7"
    ],
    "x-cbz": "cbz",
    "x-cdf": [
      "cdf",
      "cda"
    ],
    "x-cdlink": "vcd",
    "x-chess-pgn": "pgn",
    "x-cpio": "cpio",
    "x-csh": "csh",
    "x-director": [
      "dir",
      "dxr",
      "cst",
      "cct",
      "cxt",
      "w3d",
      "fgd",
      "swa"
    ],
    "x-dms": "dms",
    "x-doom": "wad",
    "x-dvi": "dvi",
    "x-httpd-eruby": "rhtml",
    "x-font": "pcf.Z",
    "x-freemind": "mm",
    "x-gnumeric": "gnumeric",
    "x-go-sgf": "sgf",
    "x-graphing-calculator": "gcf",
    "x-gtar": [
      "gtar",
      "taz"
    ],
    "x-hdf": "hdf",
    "x-httpd-php": [
      "phtml",
      "pht",
      "php"
    ],
    "x-httpd-php-source": "phps",
    "x-httpd-php3": "php3",
    "x-httpd-php3-preprocessed": "php3p",
    "x-httpd-php4": "php4",
    "x-httpd-php5": "php5",
    "x-ica": "ica",
    "x-info": "info",
    "x-internet-signup": [
      "ins",
      "isp"
    ],
    "x-iphone": "iii",
    "x-iso9660-image": "iso",
    "x-java-jnlp-file": "jnlp",
    "x-jmol": "jmz",
    "x-killustrator": "kil",
    "x-latex": "latex",
    "x-lyx": "lyx",
    "x-lzx": "lzx",
    "x-maker": [
      "frm",
      "fb",
      "fbdoc"
    ],
    "x-ms-wmd": "wmd",
    "x-msdos-program": [
      "com",
      "exe",
      "bat",
      "dll"
    ],
    "x-netcdf": [
      "nc"
    ],
    "x-ns-proxy-autoconfig": [
      "pac",
      "dat"
    ],
    "x-nwc": "nwc",
    "x-object": "o",
    "x-oz-application": "oza",
    "x-pkcs7-certreqresp": "p7r",
    "x-python-code": [
      "pyc",
      "pyo"
    ],
    "x-qgis": [
      "qgs",
      "shp",
      "shx"
    ],
    "x-quicktimeplayer": "qtl",
    "x-redhat-package-manager": [
      "rpm",
      "rpa"
    ],
    "x-ruby": "rb",
    "x-sh": "sh",
    "x-shar": "shar",
    "x-shockwave-flash": [
      "swf",
      "swfl"
    ],
    "x-silverlight": "scr",
    "x-stuffit": "sit",
    "x-sv4cpio": "sv4cpio",
    "x-sv4crc": "sv4crc",
    "x-tar": "tar",
    "x-tex-gf": "gf",
    "x-tex-pk": "pk",
    "x-texinfo": [
      "texinfo",
      "texi"
    ],
    "x-trash": [
      "~",
      "%",
      "bak",
      "old",
      "sik"
    ],
    "x-ustar": "ustar",
    "x-wais-source": "src",
    "x-wingz": "wz",
    "x-x509-ca-cert": [
      "crt",
      "der",
      "cer"
    ],
    "x-xcf": "xcf",
    "x-xfig": "fig",
    "x-xpinstall": "xpi",
    "applixware": "aw",
    "atomsvc+xml": "atomsvc",
    "ccxml+xml": "ccxml",
    "cdmi-capability": "cdmia",
    "cdmi-container": "cdmic",
    "cdmi-domain": "cdmid",
    "cdmi-object": "cdmio",
    "cdmi-queue": "cdmiq",
    "docbook+xml": "dbk",
    "dssc+der": "dssc",
    "dssc+xml": "xdssc",
    "emma+xml": "emma",
    "epub+zip": "epub",
    "exi": "exi",
    "font-tdpfr": "pfr",
    "gml+xml": "gml",
    "gpx+xml": "gpx",
    "gxf": "gxf",
    "hyperstudio": "stk",
    "inkml+xml": [
      "ink",
      "inkml"
    ],
    "ipfix": "ipfix",
    "jsonml+json": "jsonml",
    "lost+xml": "lostxml",
    "mads+xml": "mads",
    "marc": "mrc",
    "marcxml+xml": "mrcx",
    "mathml+xml": [
      "mathml",
      "mml"
    ],
    "mbox": "mbox",
    "mediaservercontrol+xml": "mscml",
    "metalink+xml": "metalink",
    "metalink4+xml": "meta4",
    "mets+xml": "mets",
    "mods+xml": "mods",
    "mp21": [
      "m21",
      "mp21"
    ],
    "mp4": "mp4s",
    "oebps-package+xml": "opf",
    "omdoc+xml": "omdoc",
    "onenote": [
      "onetoc",
      "onetoc2",
      "onetmp",
      "onepkg"
    ],
    "oxps": "oxps",
    "patch-ops-error+xml": "xer",
    "pgp-encrypted": "pgp",
    "pkcs10": "p10",
    "pkcs7-mime": [
      "p7m",
      "p7c"
    ],
    "pkcs7-signature": "p7s",
    "pkcs8": "p8",
    "pkix-attr-cert": "ac",
    "pkix-crl": "crl",
    "pkix-pkipath": "pkipath",
    "pkixcmp": "pki",
    "pls+xml": "pls",
    "prs.cww": "cww",
    "pskc+xml": "pskcxml",
    "reginfo+xml": "rif",
    "relax-ng-compact-syntax": "rnc",
    "resource-lists+xml": "rl",
    "resource-lists-diff+xml": "rld",
    "rls-services+xml": "rs",
    "rpki-ghostbusters": "gbr",
    "rpki-manifest": "mft",
    "rpki-roa": "roa",
    "rsd+xml": "rsd",
    "sbml+xml": "sbml",
    "scvp-cv-request": "scq",
    "scvp-cv-response": "scs",
    "scvp-vp-request": "spq",
    "scvp-vp-response": "spp",
    "sdp": "sdp",
    "set-payment-initiation": "setpay",
    "set-registration-initiation": "setreg",
    "shf+xml": "shf",
    "sparql-query": "rq",
    "sparql-results+xml": "srx",
    "srgs": "gram",
    "srgs+xml": "grxml",
    "sru+xml": "sru",
    "ssdl+xml": "ssdl",
    "ssml+xml": "ssml",
    "tei+xml": [
      "tei",
      "teicorpus"
    ],
    "thraud+xml": "tfi",
    "timestamped-data": "tsd",
    "vnd.3gpp.pic-bw-large": "plb",
    "vnd.3gpp.pic-bw-small": "psb",
    "vnd.3gpp.pic-bw-var": "pvb",
    "vnd.3gpp2.tcap": "tcap",
    "vnd.3m.post-it-notes": "pwn",
    "vnd.accpac.simply.aso": "aso",
    "vnd.accpac.simply.imp": "imp",
    "vnd.acucobol": "acu",
    "vnd.acucorp": [
      "atc",
      "acutc"
    ],
    "vnd.adobe.air-application-installer-package+zip": "air",
    "vnd.adobe.formscentral.fcdt": "fcdt",
    "vnd.adobe.fxp": [
      "fxp",
      "fxpl"
    ],
    "vnd.adobe.xdp+xml": "xdp",
    "vnd.adobe.xfdf": "xfdf",
    "vnd.ahead.space": "ahead",
    "vnd.airzip.filesecure.azf": "azf",
    "vnd.airzip.filesecure.azs": "azs",
    "vnd.amazon.ebook": "azw",
    "vnd.americandynamics.acc": "acc",
    "vnd.amiga.ami": "ami",
    "vnd.anser-web-certificate-issue-initiation": "cii",
    "vnd.anser-web-funds-transfer-initiation": "fti",
    "vnd.antix.game-component": "atx",
    "vnd.apple.installer+xml": "mpkg",
    "vnd.apple.mpegurl": "m3u8",
    "vnd.aristanetworks.swi": "swi",
    "vnd.astraea-software.iota": "iota",
    "vnd.audiograph": "aep",
    "vnd.blueice.multipass": "mpm",
    "vnd.bmi": "bmi",
    "vnd.businessobjects": "rep",
    "vnd.chemdraw+xml": "cdxml",
    "vnd.chipnuts.karaoke-mmd": "mmd",
    "vnd.claymore": "cla",
    "vnd.cloanto.rp9": "rp9",
    "vnd.clonk.c4group": [
      "c4g",
      "c4d",
      "c4f",
      "c4p",
      "c4u"
    ],
    "vnd.cluetrust.cartomobile-config": "c11amc",
    "vnd.cluetrust.cartomobile-config-pkg": "c11amz",
    "vnd.commonspace": "csp",
    "vnd.contact.cmsg": "cdbcmsg",
    "vnd.cosmocaller": "cmc",
    "vnd.crick.clicker": "clkx",
    "vnd.crick.clicker.keyboard": "clkk",
    "vnd.crick.clicker.palette": "clkp",
    "vnd.crick.clicker.template": "clkt",
    "vnd.crick.clicker.wordbank": "clkw",
    "vnd.criticaltools.wbs+xml": "wbs",
    "vnd.ctc-posml": "pml",
    "vnd.cups-ppd": "ppd",
    "vnd.curl.car": "car",
    "vnd.curl.pcurl": "pcurl",
    "vnd.dart": "dart",
    "vnd.data-vision.rdz": "rdz",
    "vnd.dece.data": [
      "uvf",
      "uvvf",
      "uvd",
      "uvvd"
    ],
    "vnd.dece.ttml+xml": [
      "uvt",
      "uvvt"
    ],
    "vnd.dece.unspecified": [
      "uvx",
      "uvvx"
    ],
    "vnd.dece.zip": [
      "uvz",
      "uvvz"
    ],
    "vnd.denovo.fcselayout-link": "fe_launch",
    "vnd.dna": "dna",
    "vnd.dolby.mlp": "mlp",
    "vnd.dpgraph": "dpg",
    "vnd.dreamfactory": "dfac",
    "vnd.ds-keypoint": "kpxx",
    "vnd.dvb.ait": "ait",
    "vnd.dvb.service": "svc",
    "vnd.dynageo": "geo",
    "vnd.ecowin.chart": "mag",
    "vnd.enliven": "nml",
    "vnd.epson.esf": "esf",
    "vnd.epson.msf": "msf",
    "vnd.epson.quickanime": "qam",
    "vnd.epson.salt": "slt",
    "vnd.epson.ssf": "ssf",
    "vnd.eszigno3+xml": [
      "es3",
      "et3"
    ],
    "vnd.ezpix-album": "ez2",
    "vnd.ezpix-package": "ez3",
    "vnd.fdf": "fdf",
    "vnd.fdsn.mseed": "mseed",
    "vnd.fdsn.seed": [
      "seed",
      "dataless"
    ],
    "vnd.flographit": "gph",
    "vnd.fluxtime.clip": "ftc",
    "vnd.framemaker": [
      "fm",
      "frame",
      "maker",
      "book"
    ],
    "vnd.frogans.fnc": "fnc",
    "vnd.frogans.ltf": "ltf",
    "vnd.fsc.weblaunch": "fsc",
    "vnd.fujitsu.oasys": "oas",
    "vnd.fujitsu.oasys2": "oa2",
    "vnd.fujitsu.oasys3": "oa3",
    "vnd.fujitsu.oasysgp": "fg5",
    "vnd.fujitsu.oasysprs": "bh2",
    "vnd.fujixerox.ddd": "ddd",
    "vnd.fujixerox.docuworks": "xdw",
    "vnd.fujixerox.docuworks.binder": "xbd",
    "vnd.fuzzysheet": "fzs",
    "vnd.genomatix.tuxedo": "txd",
    "vnd.geogebra.file": "ggb",
    "vnd.geogebra.tool": "ggt",
    "vnd.geometry-explorer": [
      "gex",
      "gre"
    ],
    "vnd.geonext": "gxt",
    "vnd.geoplan": "g2w",
    "vnd.geospace": "g3w",
    "vnd.gmx": "gmx",
    "vnd.grafeq": [
      "gqf",
      "gqs"
    ],
    "vnd.groove-account": "gac",
    "vnd.groove-help": "ghf",
    "vnd.groove-identity-message": "gim",
    "vnd.groove-injector": "grv",
    "vnd.groove-tool-message": "gtm",
    "vnd.groove-tool-template": "tpl",
    "vnd.groove-vcard": "vcg",
    "vnd.hal+xml": "hal",
    "vnd.handheld-entertainment+xml": "zmm",
    "vnd.hbci": "hbci",
    "vnd.hhe.lesson-player": "les",
    "vnd.hp-hpgl": "hpgl",
    "vnd.hp-hpid": "hpid",
    "vnd.hp-hps": "hps",
    "vnd.hp-jlyt": "jlt",
    "vnd.hp-pcl": "pcl",
    "vnd.hp-pclxl": "pclxl",
    "vnd.hydrostatix.sof-data": "sfd-hdstx",
    "vnd.ibm.minipay": "mpy",
    "vnd.ibm.modcap": [
      "afp",
      "listafp",
      "list3820"
    ],
    "vnd.ibm.rights-management": "irm",
    "vnd.ibm.secure-container": "sc",
    "vnd.iccprofile": [
      "icc",
      "icm"
    ],
    "vnd.igloader": "igl",
    "vnd.immervision-ivp": "ivp",
    "vnd.immervision-ivu": "ivu",
    "vnd.insors.igm": "igm",
    "vnd.intercon.formnet": [
      "xpw",
      "xpx"
    ],
    "vnd.intergeo": "i2g",
    "vnd.intu.qbo": "qbo",
    "vnd.intu.qfx": "qfx",
    "vnd.ipunplugged.rcprofile": "rcprofile",
    "vnd.irepository.package+xml": "irp",
    "vnd.is-xpr": "xpr",
    "vnd.isac.fcs": "fcs",
    "vnd.jam": "jam",
    "vnd.jcp.javame.midlet-rms": "rms",
    "vnd.jisp": "jisp",
    "vnd.joost.joda-archive": "joda",
    "vnd.kahootz": [
      "ktz",
      "ktr"
    ],
    "vnd.kde.karbon": "karbon",
    "vnd.kde.kchart": "chrt",
    "vnd.kde.kformula": "kfo",
    "vnd.kde.kivio": "flw",
    "vnd.kde.kontour": "kon",
    "vnd.kde.kpresenter": [
      "kpr",
      "kpt"
    ],
    "vnd.kde.kspread": "ksp",
    "vnd.kde.kword": [
      "kwd",
      "kwt"
    ],
    "vnd.kenameaapp": "htke",
    "vnd.kidspiration": "kia",
    "vnd.kinar": [
      "kne",
      "knp"
    ],
    "vnd.koan": [
      "skp",
      "skd",
      "skt",
      "skm"
    ],
    "vnd.kodak-descriptor": "sse",
    "vnd.las.las+xml": "lasxml",
    "vnd.llamagraphics.life-balance.desktop": "lbd",
    "vnd.llamagraphics.life-balance.exchange+xml": "lbe",
    "vnd.lotus-1-2-3": "123",
    "vnd.lotus-approach": "apr",
    "vnd.lotus-freelance": "pre",
    "vnd.lotus-notes": "nsf",
    "vnd.lotus-organizer": "org",
    "vnd.lotus-screencam": "scm",
    "vnd.lotus-wordpro": "lwp",
    "vnd.macports.portpkg": "portpkg",
    "vnd.mcd": "mcd",
    "vnd.medcalcdata": "mc1",
    "vnd.mediastation.cdkey": "cdkey",
    "vnd.mfer": "mwf",
    "vnd.mfmp": "mfm",
    "vnd.micrografx.flo": "flo",
    "vnd.micrografx.igx": "igx",
    "vnd.mif": "mif",
    "vnd.mobius.daf": "daf",
    "vnd.mobius.dis": "dis",
    "vnd.mobius.mbk": "mbk",
    "vnd.mobius.mqy": "mqy",
    "vnd.mobius.msl": "msl",
    "vnd.mobius.plc": "plc",
    "vnd.mobius.txf": "txf",
    "vnd.mophun.application": "mpn",
    "vnd.mophun.certificate": "mpc",
    "vnd.ms-artgalry": "cil",
    "vnd.ms-cab-compressed": "cab",
    "vnd.ms-excel.addin.macroenabled.12": "xlam",
    "vnd.ms-excel.sheet.binary.macroenabled.12": "xlsb",
    "vnd.ms-excel.sheet.macroenabled.12": "xlsm",
    "vnd.ms-excel.template.macroenabled.12": "xltm",
    "vnd.ms-fontobject": "eot",
    "vnd.ms-htmlhelp": "chm",
    "vnd.ms-ims": "ims",
    "vnd.ms-lrm": "lrm",
    "vnd.ms-officetheme": "thmx",
    "vnd.ms-powerpoint.addin.macroenabled.12": "ppam",
    "vnd.ms-powerpoint.presentation.macroenabled.12": "pptm",
    "vnd.ms-powerpoint.slide.macroenabled.12": "sldm",
    "vnd.ms-powerpoint.slideshow.macroenabled.12": "ppsm",
    "vnd.ms-powerpoint.template.macroenabled.12": "potm",
    "vnd.ms-project": [
      "mpp",
      "mpt"
    ],
    "vnd.ms-word.document.macroenabled.12": "docm",
    "vnd.ms-word.template.macroenabled.12": "dotm",
    "vnd.ms-works": [
      "wps",
      "wks",
      "wcm",
      "wdb"
    ],
    "vnd.ms-wpl": "wpl",
    "vnd.ms-xpsdocument": "xps",
    "vnd.mseq": "mseq",
    "vnd.musician": "mus",
    "vnd.muvee.style": "msty",
    "vnd.mynfc": "taglet",
    "vnd.neurolanguage.nlu": "nlu",
    "vnd.nitf": [
      "ntf",
      "nitf"
    ],
    "vnd.noblenet-directory": "nnd",
    "vnd.noblenet-sealer": "nns",
    "vnd.noblenet-web": "nnw",
    "vnd.nokia.n-gage.data": "ngdat",
    "vnd.nokia.n-gage.symbian.install": "n-gage",
    "vnd.nokia.radio-preset": "rpst",
    "vnd.nokia.radio-presets": "rpss",
    "vnd.novadigm.edm": "edm",
    "vnd.novadigm.edx": "edx",
    "vnd.novadigm.ext": "ext",
    "vnd.oasis.opendocument.chart-template": "otc",
    "vnd.oasis.opendocument.formula-template": "odft",
    "vnd.oasis.opendocument.image-template": "oti",
    "vnd.olpc-sugar": "xo",
    "vnd.oma.dd2+xml": "dd2",
    "vnd.openofficeorg.extension": "oxt",
    "vnd.openxmlformats-officedocument.presentationml.slide": "sldx",
    "vnd.osgeo.mapguide.package": "mgp",
    "vnd.osgi.dp": "dp",
    "vnd.osgi.subsystem": "esa",
    "vnd.palm": [
      "pdb",
      "pqa",
      "oprc"
    ],
    "vnd.pawaafile": "paw",
    "vnd.pg.format": "str",
    "vnd.pg.osasli": "ei6",
    "vnd.picsel": "efif",
    "vnd.pmi.widget": "wg",
    "vnd.pocketlearn": "plf",
    "vnd.powerbuilder6": "pbd",
    "vnd.previewsystems.box": "box",
    "vnd.proteus.magazine": "mgz",
    "vnd.publishare-delta-tree": "qps",
    "vnd.pvi.ptid1": "ptid",
    "vnd.quark.quarkxpress": [
      "qxd",
      "qxt",
      "qwd",
      "qwt",
      "qxl",
      "qxb"
    ],
    "vnd.realvnc.bed": "bed",
    "vnd.recordare.musicxml": "mxl",
    "vnd.recordare.musicxml+xml": "musicxml",
    "vnd.rig.cryptonote": "cryptonote",
    "vnd.rn-realmedia": "rm",
    "vnd.rn-realmedia-vbr": "rmvb",
    "vnd.route66.link66+xml": "link66",
    "vnd.sailingtracker.track": "st",
    "vnd.seemail": "see",
    "vnd.sema": "sema",
    "vnd.semd": "semd",
    "vnd.semf": "semf",
    "vnd.shana.informed.formdata": "ifm",
    "vnd.shana.informed.formtemplate": "itp",
    "vnd.shana.informed.interchange": "iif",
    "vnd.shana.informed.package": "ipk",
    "vnd.simtech-mindmapper": [
      "twd",
      "twds"
    ],
    "vnd.smart.teacher": "teacher",
    "vnd.solent.sdkm+xml": [
      "sdkm",
      "sdkd"
    ],
    "vnd.spotfire.dxp": "dxp",
    "vnd.spotfire.sfs": "sfs",
    "vnd.stepmania.package": "smzip",
    "vnd.stepmania.stepchart": "sm",
    "vnd.sus-calendar": [
      "sus",
      "susp"
    ],
    "vnd.svd": "svd",
    "vnd.syncml+xml": "xsm",
    "vnd.syncml.dm+wbxml": "bdm",
    "vnd.syncml.dm+xml": "xdm",
    "vnd.tao.intent-module-archive": "tao",
    "vnd.tcpdump.pcap": [
      "pcap",
      "cap",
      "dmp"
    ],
    "vnd.tmobile-livetv": "tmo",
    "vnd.trid.tpt": "tpt",
    "vnd.triscape.mxs": "mxs",
    "vnd.trueapp": "tra",
    "vnd.ufdl": [
      "ufd",
      "ufdl"
    ],
    "vnd.uiq.theme": "utz",
    "vnd.umajin": "umj",
    "vnd.unity": "unityweb",
    "vnd.uoml+xml": "uoml",
    "vnd.vcx": "vcx",
    "vnd.visionary": "vis",
    "vnd.vsf": "vsf",
    "vnd.webturbo": "wtb",
    "vnd.wolfram.player": "nbp",
    "vnd.wqd": "wqd",
    "vnd.wt.stf": "stf",
    "vnd.xara": "xar",
    "vnd.xfdl": "xfdl",
    "vnd.yamaha.hv-dic": "hvd",
    "vnd.yamaha.hv-script": "hvs",
    "vnd.yamaha.hv-voice": "hvp",
    "vnd.yamaha.openscoreformat": "osf",
    "vnd.yamaha.openscoreformat.osfpvg+xml": "osfpvg",
    "vnd.yamaha.smaf-audio": "saf",
    "vnd.yamaha.smaf-phrase": "spf",
    "vnd.yellowriver-custom-menu": "cmp",
    "vnd.zul": [
      "zir",
      "zirz"
    ],
    "vnd.zzazz.deck+xml": "zaz",
    "voicexml+xml": "vxml",
    "widget": "wgt",
    "winhlp": "hlp",
    "wsdl+xml": "wsdl",
    "wspolicy+xml": "wspolicy",
    "x-ace-compressed": "ace",
    "x-authorware-bin": [
      "aab",
      "x32",
      "u32",
      "vox"
    ],
    "x-authorware-map": "aam",
    "x-authorware-seg": "aas",
    "x-blorb": [
      "blb",
      "blorb"
    ],
    "x-bzip": "bz",
    "x-bzip2": [
      "bz2",
      "boz"
    ],
    "x-cfs-compressed": "cfs",
    "x-chat": "chat",
    "x-conference": "nsc",
    "x-dgc-compressed": "dgc",
    "x-dtbncx+xml": "ncx",
    "x-dtbook+xml": "dtb",
    "x-dtbresource+xml": "res",
    "x-eva": "eva",
    "x-font-bdf": "bdf",
    "x-font-ghostscript": "gsf",
    "x-font-linux-psf": "psf",
    "x-font-pcf": "pcf",
    "x-font-snf": "snf",
    "x-font-ttf": [
      "ttf",
      "ttc"
    ],
    "x-font-type1": [
      "pfa",
      "pfb",
      "pfm",
      "afm"
    ],
    "x-freearc": "arc",
    "x-gca-compressed": "gca",
    "x-glulx": "ulx",
    "x-gramps-xml": "gramps",
    "x-install-instructions": "install",
    "x-lzh-compressed": [
      "lzh",
      "lha"
    ],
    "x-mie": "mie",
    "x-mobipocket-ebook": [
      "prc",
      "mobi"
    ],
    "x-ms-application": "application",
    "x-ms-shortcut": "lnk",
    "x-ms-xbap": "xbap",
    "x-msbinder": "obd",
    "x-mscardfile": "crd",
    "x-msclip": "clp",
    "application/x-ms-installer": "msi",
    "x-msmediaview": [
      "mvb",
      "m13",
      "m14"
    ],
    "x-msmetafile": [
      "wmf",
      "wmz",
      "emf",
      "emz"
    ],
    "x-msmoney": "mny",
    "x-mspublisher": "pub",
    "x-msschedule": "scd",
    "x-msterminal": "trm",
    "x-mswrite": "wri",
    "x-nzb": "nzb",
    "x-pkcs12": [
      "p12",
      "pfx"
    ],
    "x-pkcs7-certificates": [
      "p7b",
      "spc"
    ],
    "x-research-info-systems": "ris",
    "x-silverlight-app": "xap",
    "x-sql": "sql",
    "x-stuffitx": "sitx",
    "x-subrip": "srt",
    "x-t3vm-image": "t3",
    "x-tex-tfm": "tfm",
    "x-tgif": "obj",
    "x-xliff+xml": "xlf",
    "x-xz": "xz",
    "x-zmachine": [
      "z1",
      "z2",
      "z3",
      "z4",
      "z5",
      "z6",
      "z7",
      "z8"
    ],
    "xaml+xml": "xaml",
    "xcap-diff+xml": "xdf",
    "xenc+xml": "xenc",
    "xml-dtd": "dtd",
    "xop+xml": "xop",
    "xproc+xml": "xpl",
    "xslt+xml": "xslt",
    "xv+xml": [
      "mxml",
      "xhvml",
      "xvml",
      "xvm"
    ],
    "yang": "yang",
    "yin+xml": "yin",
    "envoy": "evy",
    "fractals": "fif",
    "internet-property-stream": "acx",
    "olescript": "axs",
    "vnd.ms-outlook": "msg",
    "vnd.ms-pkicertstore": "sst",
    "x-compress": "z",
    "x-perfmon": [
      "pma",
      "pmc",
      "pmr",
      "pmw"
    ],
    "ynd.ms-pkipko": "pko",
    "gzip": [
      "gz",
      "tgz"
    ],
    "smil+xml": [
      "smi",
      "smil"
    ],
    "vnd.debian.binary-package": [
      "deb",
      "udeb"
    ],
    "vnd.hzn-3d-crossword": "x3d",
    "vnd.sqlite3": [
      "db",
      "sqlite",
      "sqlite3",
      "db-wal",
      "sqlite-wal",
      "db-shm",
      "sqlite-shm"
    ],
    "vnd.wap.sic": "sic",
    "vnd.wap.slc": "slc",
    "x-krita": [
      "kra",
      "krz"
    ],
    "x-perl": [
      "pm",
      "pl"
    ],
    "yaml": [
      "yaml",
      "yml"
    ]
  },
  "audio": {
    "amr": "amr",
    "amr-wb": "awb",
    "annodex": "axa",
    "basic": [
      "au",
      "snd"
    ],
    "flac": "flac",
    "midi": [
      "mid",
      "midi",
      "kar",
      "rmi"
    ],
    "mpeg": [
      "mpga",
      "mpega",
      "mp3",
      "m4a",
      "mp2a",
      "m2a",
      "m3a"
    ],
    "mpegurl": "m3u",
    "ogg": [
      "oga",
      "ogg",
      "spx"
    ],
    "prs.sid": "sid",
    "x-aiff": "aifc",
    "x-gsm": "gsm",
    "x-ms-wma": "wma",
    "x-ms-wax": "wax",
    "x-pn-realaudio": "ram",
    "x-realaudio": "ra",
    "x-sd2": "sd2",
    "adpcm": "adp",
    "mp4": "mp4a",
    "s3m": "s3m",
    "silk": "sil",
    "vnd.dece.audio": [
      "uva",
      "uvva"
    ],
    "vnd.digital-winds": "eol",
    "vnd.dra": "dra",
    "vnd.dts": "dts",
    "vnd.dts.hd": "dtshd",
    "vnd.lucent.voice": "lvp",
    "vnd.ms-playready.media.pya": "pya",
    "vnd.nuera.ecelp4800": "ecelp4800",
    "vnd.nuera.ecelp7470": "ecelp7470",
    "vnd.nuera.ecelp9600": "ecelp9600",
    "vnd.rip": "rip",
    "webm": "weba",
    "x-caf": "caf",
    "x-matroska": "mka",
    "x-pn-realaudio-plugin": "rmp",
    "xm": "xm",
    "aac": "aac",
    "aiff": [
      "aiff",
      "aif",
      "aff"
    ],
    "opus": "opus",
    "wav": "wav"
  },
  "chemical": {
    "x-alchemy": "alc",
    "x-cache": [
      "cac",
      "cache"
    ],
    "x-cache-csf": "csf",
    "x-cactvs-binary": [
      "cbin",
      "cascii",
      "ctab"
    ],
    "x-cdx": "cdx",
    "x-chem3d": "c3d",
    "x-cif": "cif",
    "x-cmdf": "cmdf",
    "x-cml": "cml",
    "x-compass": "cpa",
    "x-crossfire": "bsd",
    "x-csml": [
      "csml",
      "csm"
    ],
    "x-ctx": "ctx",
    "x-cxf": [
      "cxf",
      "cef"
    ],
    "x-embl-dl-nucleotide": [
      "emb",
      "embl"
    ],
    "x-gamess-input": [
      "inp",
      "gam",
      "gamin"
    ],
    "x-gaussian-checkpoint": [
      "fch",
      "fchk"
    ],
    "x-gaussian-cube": "cub",
    "x-gaussian-input": [
      "gau",
      "gjc",
      "gjf"
    ],
    "x-gaussian-log": "gal",
    "x-gcg8-sequence": "gcg",
    "x-genbank": "gen",
    "x-hin": "hin",
    "x-isostar": [
      "istr",
      "ist"
    ],
    "x-jcamp-dx": [
      "jdx",
      "dx"
    ],
    "x-kinemage": "kin",
    "x-macmolecule": "mcm",
    "x-macromodel-input": "mmod",
    "x-mdl-molfile": "mol",
    "x-mdl-rdfile": "rd",
    "x-mdl-rxnfile": "rxn",
    "x-mdl-sdfile": "sd",
    "x-mdl-tgf": "tgf",
    "x-mmcif": "mcif",
    "x-mol2": "mol2",
    "x-molconn-Z": "b",
    "x-mopac-graph": "gpt",
    "x-mopac-input": [
      "mop",
      "mopcrt",
      "zmt"
    ],
    "x-mopac-out": "moo",
    "x-ncbi-asn1": "asn",
    "x-ncbi-asn1-ascii": [
      "prt",
      "ent"
    ],
    "x-ncbi-asn1-binary": "val",
    "x-rosdal": "ros",
    "x-swissprot": "sw",
    "x-vamas-iso14976": "vms",
    "x-vmd": "vmd",
    "x-xtel": "xtel",
    "x-xyz": "xyz"
  },
  "font": {
    "otf": "otf",
    "woff": "woff",
    "woff2": "woff2"
  },
  "image": {
    "gif": "gif",
    "ief": "ief",
    "jpeg": [
      "jpeg",
      "jpg",
      "jpe",
      "jfif",
      "jfif-tbnl",
      "jif"
    ],
    "pcx": "pcx",
    "png": "png",
    "svg+xml": [
      "svg",
      "svgz"
    ],
    "tiff": [
      "tiff",
      "tif"
    ],
    "vnd.djvu": [
      "djvu",
      "djv"
    ],
    "vnd.wap.wbmp": "wbmp",
    "x-canon-cr2": "cr2",
    "x-canon-crw": "crw",
    "x-cmu-raster": "ras",
    "x-coreldraw": "cdr",
    "x-coreldrawpattern": "pat",
    "x-coreldrawtemplate": "cdt",
    "x-corelphotopaint": "cpt",
    "x-epson-erf": "erf",
    "x-icon": "ico",
    "x-jg": "art",
    "x-jng": "jng",
    "x-nikon-nef": "nef",
    "x-olympus-orf": "orf",
    "x-portable-anymap": "pnm",
    "x-portable-bitmap": "pbm",
    "x-portable-graymap": "pgm",
    "x-portable-pixmap": "ppm",
    "x-rgb": "rgb",
    "x-xbitmap": "xbm",
    "x-xpixmap": "xpm",
    "x-xwindowdump": "xwd",
    "bmp": "bmp",
    "cgm": "cgm",
    "g3fax": "g3",
    "ktx": "ktx",
    "prs.btif": "btif",
    "sgi": "sgi",
    "vnd.dece.graphic": [
      "uvi",
      "uvvi",
      "uvg",
      "uvvg"
    ],
    "vnd.dwg": "dwg",
    "vnd.dxf": "dxf",
    "vnd.fastbidsheet": "fbs",
    "vnd.fpx": "fpx",
    "vnd.fst": "fst",
    "vnd.fujixerox.edmics-mmr": "mmr",
    "vnd.fujixerox.edmics-rlc": "rlc",
    "vnd.ms-modi": "mdi",
    "vnd.ms-photo": "wdp",
    "vnd.net-fpx": "npx",
    "vnd.xiff": "xif",
    "webp": "webp",
    "x-3ds": "3ds",
    "x-cmx": "cmx",
    "x-freehand": [
      "fh",
      "fhc",
      "fh4",
      "fh5",
      "fh7"
    ],
    "x-pict": [
      "pic",
      "pct"
    ],
    "x-tga": "tga",
    "cis-cod": "cod",
    "avif": "avifs",
    "heic": [
      "heif",
      "heic"
    ],
    "pjpeg": [
      "pjpg"
    ],
    "vnd.adobe.photoshop": "psd",
    "x-adobe-dng": "dng",
    "x-fuji-raf": "raf",
    "x-icns": "icns",
    "x-kodak-dcr": "dcr",
    "x-kodak-k25": "k25",
    "x-kodak-kdc": "kdc",
    "x-minolta-mrw": "mrw",
    "x-panasonic-raw": [
      "raw",
      "rw2",
      "rwl"
    ],
    "x-pentax-pef": [
      "pef",
      "ptx"
    ],
    "x-sigma-x3f": "x3f",
    "x-sony-arw": "arw",
    "x-sony-sr2": "sr2",
    "x-sony-srf": "srf"
  },
  "message": {
    "rfc822": [
      "eml",
      "mime",
      "mht",
      "mhtml",
      "nws"
    ]
  },
  "model": {
    "iges": [
      "igs",
      "iges"
    ],
    "mesh": [
      "msh",
      "mesh",
      "silo"
    ],
    "vrml": [
      "wrl",
      "vrml"
    ],
    "x3d+vrml": [
      "x3dv",
      "x3dvz"
    ],
    "x3d+xml": "x3dz",
    "x3d+binary": [
      "x3db",
      "x3dbz"
    ],
    "vnd.collada+xml": "dae",
    "vnd.dwf": "dwf",
    "vnd.gdl": "gdl",
    "vnd.gtw": "gtw",
    "vnd.mts": "mts",
    "vnd.usdz+zip": "usdz",
    "vnd.vtu": "vtu"
  },
  "text": {
    "cache-manifest": [
      "manifest",
      "appcache"
    ],
    "calendar": [
      "ics",
      "icz",
      "ifb"
    ],
    "css": "css",
    "csv": "csv",
    "h323": "323",
    "html": [
      "html",
      "htm",
      "shtml",
      "stm"
    ],
    "iuls": "uls",
    "plain": [
      "txt",
      "text",
      "brf",
      "conf",
      "def",
      "list",
      "log",
      "in",
      "bas",
      "diff",
      "ksh"
    ],
    "richtext": "rtx",
    "scriptlet": [
      "sct",
      "wsc"
    ],
    "texmacs": "tm",
    "tab-separated-values": "tsv",
    "vnd.sun.j2me.app-descriptor": "jad",
    "vnd.wap.wml": "wml",
    "vnd.wap.wmlscript": "wmls",
    "x-bibtex": "bib",
    "x-boo": "boo",
    "x-c++hdr": [
      "h++",
      "hpp",
      "hxx",
      "hh"
    ],
    "x-c++src": [
      "c++",
      "cpp",
      "cxx",
      "cc"
    ],
    "x-component": "htc",
    "x-dsrc": "d",
    "x-diff": "patch",
    "x-haskell": "hs",
    "x-java": "java",
    "x-literate-haskell": "lhs",
    "x-moc": "moc",
    "x-pascal": [
      "p",
      "pas",
      "pp",
      "inc"
    ],
    "x-pcs-gcd": "gcd",
    "x-python": "py",
    "x-scala": "scala",
    "x-setext": "etx",
    "x-tcl": [
      "tcl",
      "tk"
    ],
    "x-tex": [
      "tex",
      "ltx",
      "sty",
      "cls"
    ],
    "x-vcalendar": "vcs",
    "x-vcard": "vcf",
    "n3": "n3",
    "prs.lines.tag": "dsc",
    "sgml": [
      "sgml",
      "sgm"
    ],
    "troff": [
      "t",
      "tr",
      "roff",
      "man",
      "me",
      "ms"
    ],
    "turtle": "ttl",
    "uri-list": [
      "uri",
      "uris",
      "urls"
    ],
    "vcard": "vcard",
    "vnd.curl": "curl",
    "vnd.curl.dcurl": "dcurl",
    "vnd.curl.scurl": "scurl",
    "vnd.curl.mcurl": "mcurl",
    "vnd.dvb.subtitle": "sub",
    "vnd.fly": "fly",
    "vnd.fmi.flexstor": "flx",
    "vnd.graphviz": "gv",
    "vnd.in3d.3dml": "3dml",
    "vnd.in3d.spot": "spot",
    "x-asm": [
      "s",
      "asm"
    ],
    "x-c": [
      "c",
      "h",
      "dic"
    ],
    "x-fortran": [
      "f",
      "for",
      "f77",
      "f90"
    ],
    "x-opml": "opml",
    "x-nfo": "nfo",
    "x-sfv": "sfv",
    "x-uuencode": "uu",
    "webviewhtml": "htt",
    "javascript": "js",
    "json": "json",
    "markdown": [
      "md",
      "markdown",
      "mdown",
      "markdn"
    ],
    "vnd.wap.si": "si",
    "vnd.wap.sl": "sl"
  },
  "video": {
    "avif": "avif",
    "3gpp": "3gp",
    "annodex": "axv",
    "dl": "dl",
    "dv": [
      "dif",
      "dv"
    ],
    "fli": "fli",
    "gl": "gl",
    "mpeg": [
      "mpeg",
      "mpg",
      "mpe",
      "m1v",
      "m2v",
      "mp2",
      "mpa",
      "mpv2"
    ],
    "mp4": [
      "mp4",
      "mp4v",
      "mpg4"
    ],
    "quicktime": [
      "qt",
      "mov"
    ],
    "ogg": "ogv",
    "vnd.mpegurl": [
      "mxu",
      "m4u"
    ],
    "x-flv": "flv",
    "x-la-asf": [
      "lsf",
      "lsx"
    ],
    "x-mng": "mng",
    "x-ms-asf": [
      "asf",
      "asx",
      "asr"
    ],
    "x-ms-wm": "wm",
    "x-ms-wmv": "wmv",
    "x-ms-wmx": "wmx",
    "x-ms-wvx": "wvx",
    "x-msvideo": "avi",
    "x-sgi-movie": "movie",
    "x-matroska": [
      "mpv",
      "mkv",
      "mk3d",
      "mks"
    ],
    "3gpp2": "3g2",
    "h261": "h261",
    "h263": "h263",
    "h264": "h264",
    "jpeg": "jpgv",
    "jpm": [
      "jpm",
      "jpgm"
    ],
    "mj2": [
      "mj2",
      "mjp2"
    ],
    "vnd.dece.hd": [
      "uvh",
      "uvvh"
    ],
    "vnd.dece.mobile": [
      "uvm",
      "uvvm"
    ],
    "vnd.dece.pd": [
      "uvp",
      "uvvp"
    ],
    "vnd.dece.sd": [
      "uvs",
      "uvvs"
    ],
    "vnd.dece.video": [
      "uvv",
      "uvvv"
    ],
    "vnd.dvb.file": "dvb",
    "vnd.fvt": "fvt",
    "vnd.ms-playready.media.pyv": "pyv",
    "vnd.uvvu.mp4": [
      "uvu",
      "uvvu"
    ],
    "vnd.vivo": "viv",
    "webm": "webm",
    "x-f4v": "f4v",
    "x-m4v": "m4v",
    "x-ms-vob": "vob",
    "x-smv": "smv",
    "mp2t": "ts"
  },
  "x-conference": {
    "x-cooltalk": "ice"
  },
  "x-world": {
    "x-vrml": [
      "vrm",
      "flr",
      "wrz",
      "xaf",
      "xof"
    ]
  }
};
var mimeTypes = (() => {
  const mimeTypes2 = {};
  for (const type of Object.keys(table)) {
    for (const subtype of Object.keys(table[type])) {
      const value = table[type][subtype];
      if (typeof value == "string") {
        mimeTypes2[value] = type + "/" + subtype;
      } else {
        for (let indexMimeType = 0; indexMimeType < value.length; indexMimeType++) {
          mimeTypes2[value[indexMimeType]] = type + "/" + subtype;
        }
      }
    }
  }
  return mimeTypes2;
})();
var table1 = [];
for (let i = 0; i < 256; i++) {
  let t = i;
  for (let j = 0; j < 8; j++) {
    if (t & 1) {
      t = t >>> 1 ^ 3988292384;
    } else {
      t = t >>> 1;
    }
  }
  table1[i] = t;
}
var Crc32 = class {
  constructor(crc) {
    this.crc = crc || -1;
  }
  append(data) {
    let crc = this.crc | 0;
    for (let offset = 0, length = data.length | 0; offset < length; offset++) {
      crc = crc >>> 8 ^ table1[(crc ^ data[offset]) & 255];
    }
    this.crc = crc;
  }
  get() {
    return ~this.crc;
  }
};
var Crc32Stream = class extends TransformStream {
  constructor() {
    let stream;
    const crc32 = new Crc32();
    super({
      transform(chunk, controller) {
        crc32.append(chunk);
        controller.enqueue(chunk);
      },
      flush() {
        const value = new Uint8Array(4);
        const dataView = new DataView(value.buffer);
        dataView.setUint32(0, crc32.get());
        stream.value = value;
      }
    });
    stream = this;
  }
};
function encodeText(value) {
  if (typeof TextEncoder == "undefined") {
    value = unescape(encodeURIComponent(value));
    const result = new Uint8Array(value.length);
    for (let i = 0; i < result.length; i++) {
      result[i] = value.charCodeAt(i);
    }
    return result;
  } else {
    return new TextEncoder().encode(value);
  }
}
var bitArray = {
  concat(a1, a2) {
    if (a1.length === 0 || a2.length === 0) {
      return a1.concat(a2);
    }
    const last = a1[a1.length - 1], shift = bitArray.getPartial(last);
    if (shift === 32) {
      return a1.concat(a2);
    } else {
      return bitArray._shiftRight(a2, shift, last | 0, a1.slice(0, a1.length - 1));
    }
  },
  bitLength(a) {
    const l = a.length;
    if (l === 0) {
      return 0;
    }
    const x = a[l - 1];
    return (l - 1) * 32 + bitArray.getPartial(x);
  },
  clamp(a, len) {
    if (a.length * 32 < len) {
      return a;
    }
    a = a.slice(0, Math.ceil(len / 32));
    const l = a.length;
    len = len & 31;
    if (l > 0 && len) {
      a[l - 1] = bitArray.partial(len, a[l - 1] & 2147483648 >> len - 1, 1);
    }
    return a;
  },
  partial(len, x, _end) {
    if (len === 32) {
      return x;
    }
    return (_end ? x | 0 : x << 32 - len) + len * 1099511627776;
  },
  getPartial(x) {
    return Math.round(x / 1099511627776) || 32;
  },
  _shiftRight(a, shift, carry, out) {
    if (out === void 0) {
      out = [];
    }
    for (; shift >= 32; shift -= 32) {
      out.push(carry);
      carry = 0;
    }
    if (shift === 0) {
      return out.concat(a);
    }
    for (let i = 0; i < a.length; i++) {
      out.push(carry | a[i] >>> shift);
      carry = a[i] << 32 - shift;
    }
    const last2 = a.length ? a[a.length - 1] : 0;
    const shift2 = bitArray.getPartial(last2);
    out.push(bitArray.partial(shift + shift2 & 31, shift + shift2 > 32 ? carry : out.pop(), 1));
    return out;
  }
};
var codec = {
  bytes: {
    fromBits(arr) {
      const bl = bitArray.bitLength(arr);
      const byteLength = bl / 8;
      const out = new Uint8Array(byteLength);
      let tmp;
      for (let i = 0; i < byteLength; i++) {
        if ((i & 3) === 0) {
          tmp = arr[i / 4];
        }
        out[i] = tmp >>> 24;
        tmp <<= 8;
      }
      return out;
    },
    toBits(bytes) {
      const out = [];
      let i;
      let tmp = 0;
      for (i = 0; i < bytes.length; i++) {
        tmp = tmp << 8 | bytes[i];
        if ((i & 3) === 3) {
          out.push(tmp);
          tmp = 0;
        }
      }
      if (i & 3) {
        out.push(bitArray.partial(8 * (i & 3), tmp));
      }
      return out;
    }
  }
};
var hash = {};
hash.sha1 = class {
  constructor(hash2) {
    const sha1 = this;
    sha1.blockSize = 512;
    sha1._init = [
      1732584193,
      4023233417,
      2562383102,
      271733878,
      3285377520
    ];
    sha1._key = [
      1518500249,
      1859775393,
      2400959708,
      3395469782
    ];
    if (hash2) {
      sha1._h = hash2._h.slice(0);
      sha1._buffer = hash2._buffer.slice(0);
      sha1._length = hash2._length;
    } else {
      sha1.reset();
    }
  }
  reset() {
    const sha1 = this;
    sha1._h = sha1._init.slice(0);
    sha1._buffer = [];
    sha1._length = 0;
    return sha1;
  }
  update(data) {
    const sha1 = this;
    if (typeof data === "string") {
      data = codec.utf8String.toBits(data);
    }
    const b = sha1._buffer = bitArray.concat(sha1._buffer, data);
    const ol = sha1._length;
    const nl = sha1._length = ol + bitArray.bitLength(data);
    if (nl > 9007199254740991) {
      throw new Error("Cannot hash more than 2^53 - 1 bits");
    }
    const c = new Uint32Array(b);
    let j = 0;
    for (let i = sha1.blockSize + ol - (sha1.blockSize + ol & sha1.blockSize - 1); i <= nl; i += sha1.blockSize) {
      sha1._block(c.subarray(16 * j, 16 * (j + 1)));
      j += 1;
    }
    b.splice(0, 16 * j);
    return sha1;
  }
  finalize() {
    const sha1 = this;
    let b = sha1._buffer;
    const h = sha1._h;
    b = bitArray.concat(b, [
      bitArray.partial(1, 1)
    ]);
    for (let i = b.length + 2; i & 15; i++) {
      b.push(0);
    }
    b.push(Math.floor(sha1._length / 4294967296));
    b.push(sha1._length | 0);
    while (b.length) {
      sha1._block(b.splice(0, 16));
    }
    sha1.reset();
    return h;
  }
  _f(t, b, c, d) {
    if (t <= 19) {
      return b & c | ~b & d;
    } else if (t <= 39) {
      return b ^ c ^ d;
    } else if (t <= 59) {
      return b & c | b & d | c & d;
    } else if (t <= 79) {
      return b ^ c ^ d;
    }
  }
  _S(n, x) {
    return x << n | x >>> 32 - n;
  }
  _block(words) {
    const sha1 = this;
    const h = sha1._h;
    const w = Array(80);
    for (let j = 0; j < 16; j++) {
      w[j] = words[j];
    }
    let a = h[0];
    let b = h[1];
    let c = h[2];
    let d = h[3];
    let e2 = h[4];
    for (let t = 0; t <= 79; t++) {
      if (t >= 16) {
        w[t] = sha1._S(1, w[t - 3] ^ w[t - 8] ^ w[t - 14] ^ w[t - 16]);
      }
      const tmp = sha1._S(5, a) + sha1._f(t, b, c, d) + e2 + w[t] + sha1._key[Math.floor(t / 20)] | 0;
      e2 = d;
      d = c;
      c = sha1._S(30, b);
      b = a;
      a = tmp;
    }
    h[0] = h[0] + a | 0;
    h[1] = h[1] + b | 0;
    h[2] = h[2] + c | 0;
    h[3] = h[3] + d | 0;
    h[4] = h[4] + e2 | 0;
  }
};
var cipher = {};
cipher.aes = class {
  constructor(key) {
    const aes = this;
    aes._tables = [
      [
        [],
        [],
        [],
        [],
        []
      ],
      [
        [],
        [],
        [],
        [],
        []
      ]
    ];
    if (!aes._tables[0][0][0]) {
      aes._precompute();
    }
    const sbox = aes._tables[0][4];
    const decTable = aes._tables[1];
    const keyLen = key.length;
    let i, encKey, decKey, rcon = 1;
    if (keyLen !== 4 && keyLen !== 6 && keyLen !== 8) {
      throw new Error("invalid aes key size");
    }
    aes._key = [
      encKey = key.slice(0),
      decKey = []
    ];
    for (i = keyLen; i < 4 * keyLen + 28; i++) {
      let tmp = encKey[i - 1];
      if (i % keyLen === 0 || keyLen === 8 && i % keyLen === 4) {
        tmp = sbox[tmp >>> 24] << 24 ^ sbox[tmp >> 16 & 255] << 16 ^ sbox[tmp >> 8 & 255] << 8 ^ sbox[tmp & 255];
        if (i % keyLen === 0) {
          tmp = tmp << 8 ^ tmp >>> 24 ^ rcon << 24;
          rcon = rcon << 1 ^ (rcon >> 7) * 283;
        }
      }
      encKey[i] = encKey[i - keyLen] ^ tmp;
    }
    for (let j = 0; i; j++, i--) {
      const tmp = encKey[j & 3 ? i : i - 4];
      if (i <= 4 || j < 4) {
        decKey[j] = tmp;
      } else {
        decKey[j] = decTable[0][sbox[tmp >>> 24]] ^ decTable[1][sbox[tmp >> 16 & 255]] ^ decTable[2][sbox[tmp >> 8 & 255]] ^ decTable[3][sbox[tmp & 255]];
      }
    }
  }
  encrypt(data) {
    return this._crypt(data, 0);
  }
  decrypt(data) {
    return this._crypt(data, 1);
  }
  _precompute() {
    const encTable = this._tables[0];
    const decTable = this._tables[1];
    const sbox = encTable[4];
    const sboxInv = decTable[4];
    const d = [];
    const th = [];
    let xInv, x2, x4, x8;
    for (let i = 0; i < 256; i++) {
      th[(d[i] = i << 1 ^ (i >> 7) * 283) ^ i] = i;
    }
    for (let x = xInv = 0; !sbox[x]; x ^= x2 || 1, xInv = th[xInv] || 1) {
      let s = xInv ^ xInv << 1 ^ xInv << 2 ^ xInv << 3 ^ xInv << 4;
      s = s >> 8 ^ s & 255 ^ 99;
      sbox[x] = s;
      sboxInv[s] = x;
      x8 = d[x4 = d[x2 = d[x]]];
      let tDec = x8 * 16843009 ^ x4 * 65537 ^ x2 * 257 ^ x * 16843008;
      let tEnc = d[s] * 257 ^ s * 16843008;
      for (let i = 0; i < 4; i++) {
        encTable[i][x] = tEnc = tEnc << 24 ^ tEnc >>> 8;
        decTable[i][s] = tDec = tDec << 24 ^ tDec >>> 8;
      }
    }
    for (let i = 0; i < 5; i++) {
      encTable[i] = encTable[i].slice(0);
      decTable[i] = decTable[i].slice(0);
    }
  }
  _crypt(input, dir) {
    if (input.length !== 4) {
      throw new Error("invalid aes block size");
    }
    const key = this._key[dir];
    const nInnerRounds = key.length / 4 - 2;
    const out = [
      0,
      0,
      0,
      0
    ];
    const table2 = this._tables[dir];
    const t0 = table2[0];
    const t1 = table2[1];
    const t2 = table2[2];
    const t3 = table2[3];
    const sbox = table2[4];
    let a = input[0] ^ key[0];
    let b = input[dir ? 3 : 1] ^ key[1];
    let c = input[2] ^ key[2];
    let d = input[dir ? 1 : 3] ^ key[3];
    let kIndex = 4;
    let a2, b2, c2;
    for (let i = 0; i < nInnerRounds; i++) {
      a2 = t0[a >>> 24] ^ t1[b >> 16 & 255] ^ t2[c >> 8 & 255] ^ t3[d & 255] ^ key[kIndex];
      b2 = t0[b >>> 24] ^ t1[c >> 16 & 255] ^ t2[d >> 8 & 255] ^ t3[a & 255] ^ key[kIndex + 1];
      c2 = t0[c >>> 24] ^ t1[d >> 16 & 255] ^ t2[a >> 8 & 255] ^ t3[b & 255] ^ key[kIndex + 2];
      d = t0[d >>> 24] ^ t1[a >> 16 & 255] ^ t2[b >> 8 & 255] ^ t3[c & 255] ^ key[kIndex + 3];
      kIndex += 4;
      a = a2;
      b = b2;
      c = c2;
    }
    for (let i = 0; i < 4; i++) {
      out[dir ? 3 & -i : i] = sbox[a >>> 24] << 24 ^ sbox[b >> 16 & 255] << 16 ^ sbox[c >> 8 & 255] << 8 ^ sbox[d & 255] ^ key[kIndex++];
      a2 = a;
      a = b;
      b = c;
      c = d;
      d = a2;
    }
    return out;
  }
};
var random = {
  getRandomValues(typedArray) {
    const words = new Uint32Array(typedArray.buffer);
    const r = (m_w) => {
      let m_z = 987654321;
      const mask = 4294967295;
      return function() {
        m_z = 36969 * (m_z & 65535) + (m_z >> 16) & mask;
        m_w = 18e3 * (m_w & 65535) + (m_w >> 16) & mask;
        const result = ((m_z << 16) + m_w & 4294967295) / 4294967296 + 0.5;
        return result * (Math.random() > 0.5 ? 1 : -1);
      };
    };
    for (let i = 0, rcache; i < typedArray.length; i += 4) {
      const _r = r((rcache || Math.random()) * 4294967296);
      rcache = _r() * 987654071;
      words[i / 4] = _r() * 4294967296 | 0;
    }
    return typedArray;
  }
};
var mode = {};
mode.ctrGladman = class {
  constructor(prf, iv) {
    this._prf = prf;
    this._initIv = iv;
    this._iv = iv;
  }
  reset() {
    this._iv = this._initIv;
  }
  update(data) {
    return this.calculate(this._prf, data, this._iv);
  }
  incWord(word) {
    if ((word >> 24 & 255) === 255) {
      let b1 = word >> 16 & 255;
      let b2 = word >> 8 & 255;
      let b3 = word & 255;
      if (b1 === 255) {
        b1 = 0;
        if (b2 === 255) {
          b2 = 0;
          if (b3 === 255) {
            b3 = 0;
          } else {
            ++b3;
          }
        } else {
          ++b2;
        }
      } else {
        ++b1;
      }
      word = 0;
      word += b1 << 16;
      word += b2 << 8;
      word += b3;
    } else {
      word += 1 << 24;
    }
    return word;
  }
  incCounter(counter) {
    if ((counter[0] = this.incWord(counter[0])) === 0) {
      counter[1] = this.incWord(counter[1]);
    }
  }
  calculate(prf, data, iv) {
    let l;
    if (!(l = data.length)) {
      return [];
    }
    const bl = bitArray.bitLength(data);
    for (let i = 0; i < l; i += 4) {
      this.incCounter(iv);
      const e2 = prf.encrypt(iv);
      data[i] ^= e2[0];
      data[i + 1] ^= e2[1];
      data[i + 2] ^= e2[2];
      data[i + 3] ^= e2[3];
    }
    return bitArray.clamp(data, bl);
  }
};
var misc = {
  importKey(password) {
    return new misc.hmacSha1(codec.bytes.toBits(password));
  },
  pbkdf2(prf, salt, count, length) {
    count = count || 1e4;
    if (length < 0 || count < 0) {
      throw new Error("invalid params to pbkdf2");
    }
    const byteLength = (length >> 5) + 1 << 2;
    let u, ui, i, j, k;
    const arrayBuffer = new ArrayBuffer(byteLength);
    const out = new DataView(arrayBuffer);
    let outLength = 0;
    const b = bitArray;
    salt = codec.bytes.toBits(salt);
    for (k = 1; outLength < (byteLength || 1); k++) {
      u = ui = prf.encrypt(b.concat(salt, [
        k
      ]));
      for (i = 1; i < count; i++) {
        ui = prf.encrypt(ui);
        for (j = 0; j < ui.length; j++) {
          u[j] ^= ui[j];
        }
      }
      for (i = 0; outLength < (byteLength || 1) && i < u.length; i++) {
        out.setInt32(outLength, u[i]);
        outLength += 4;
      }
    }
    return arrayBuffer.slice(0, length / 8);
  }
};
misc.hmacSha1 = class {
  constructor(key) {
    const hmac = this;
    const Hash = hmac._hash = hash.sha1;
    const exKey = [
      [],
      []
    ];
    hmac._baseHash = [
      new Hash(),
      new Hash()
    ];
    const bs = hmac._baseHash[0].blockSize / 32;
    if (key.length > bs) {
      key = new Hash().update(key).finalize();
    }
    for (let i = 0; i < bs; i++) {
      exKey[0][i] = key[i] ^ 909522486;
      exKey[1][i] = key[i] ^ 1549556828;
    }
    hmac._baseHash[0].update(exKey[0]);
    hmac._baseHash[1].update(exKey[1]);
    hmac._resultHash = new Hash(hmac._baseHash[0]);
  }
  reset() {
    const hmac = this;
    hmac._resultHash = new hmac._hash(hmac._baseHash[0]);
    hmac._updated = false;
  }
  update(data) {
    const hmac = this;
    hmac._updated = true;
    hmac._resultHash.update(data);
  }
  digest() {
    const hmac = this;
    const w = hmac._resultHash.finalize();
    const result = new hmac._hash(hmac._baseHash[1]).update(w).finalize();
    hmac.reset();
    return result;
  }
  encrypt(data) {
    if (!this._updated) {
      this.update(data);
      return this.digest(data);
    } else {
      throw new Error("encrypt on already updated hmac called!");
    }
  }
};
var GET_RANDOM_VALUES_SUPPORTED = typeof crypto != "undefined" && typeof crypto.getRandomValues == "function";
var ERR_INVALID_PASSWORD = "Invalid password";
var ERR_INVALID_SIGNATURE = "Invalid signature";
var ERR_ABORT_CHECK_PASSWORD = "zipjs-abort-check-password";
function getRandomValues(array) {
  if (GET_RANDOM_VALUES_SUPPORTED) {
    return crypto.getRandomValues(array);
  } else {
    return random.getRandomValues(array);
  }
}
var BLOCK_LENGTH = 16;
var RAW_FORMAT = "raw";
var PBKDF2_ALGORITHM = {
  name: "PBKDF2"
};
var HASH_ALGORITHM = {
  name: "HMAC"
};
var HASH_FUNCTION = "SHA-1";
var BASE_KEY_ALGORITHM = Object.assign({
  hash: HASH_ALGORITHM
}, PBKDF2_ALGORITHM);
var DERIVED_BITS_ALGORITHM = Object.assign({
  iterations: 1e3,
  hash: {
    name: HASH_FUNCTION
  }
}, PBKDF2_ALGORITHM);
var DERIVED_BITS_USAGE = [
  "deriveBits"
];
var SALT_LENGTH = [
  8,
  12,
  16
];
var KEY_LENGTH = [
  16,
  24,
  32
];
var SIGNATURE_LENGTH = 10;
var COUNTER_DEFAULT_VALUE = [
  0,
  0,
  0,
  0
];
var UNDEFINED_TYPE1 = "undefined";
var FUNCTION_TYPE1 = "function";
var CRYPTO_API_SUPPORTED = typeof crypto != UNDEFINED_TYPE1;
var subtle = CRYPTO_API_SUPPORTED && crypto.subtle;
var SUBTLE_API_SUPPORTED = CRYPTO_API_SUPPORTED && typeof subtle != UNDEFINED_TYPE1;
var codecBytes = codec.bytes;
var Aes = cipher.aes;
var CtrGladman = mode.ctrGladman;
var HmacSha1 = misc.hmacSha1;
var IMPORT_KEY_SUPPORTED = CRYPTO_API_SUPPORTED && SUBTLE_API_SUPPORTED && typeof subtle.importKey == FUNCTION_TYPE1;
var DERIVE_BITS_SUPPORTED = CRYPTO_API_SUPPORTED && SUBTLE_API_SUPPORTED && typeof subtle.deriveBits == FUNCTION_TYPE1;
var AESDecryptionStream = class extends TransformStream {
  constructor({ password, signed, encryptionStrength, checkPasswordOnly }) {
    super({
      start() {
        Object.assign(this, {
          ready: new Promise((resolve) => this.resolveReady = resolve),
          password,
          signed,
          strength: encryptionStrength - 1,
          pending: new Uint8Array()
        });
      },
      async transform(chunk, controller) {
        const aesCrypto = this;
        const { password: password2, strength, resolveReady, ready } = aesCrypto;
        if (password2) {
          await createDecryptionKeys(aesCrypto, strength, password2, subarray(chunk, 0, SALT_LENGTH[strength] + 2));
          chunk = subarray(chunk, SALT_LENGTH[strength] + 2);
          if (checkPasswordOnly) {
            controller.error(new Error(ERR_ABORT_CHECK_PASSWORD));
          } else {
            resolveReady();
          }
        } else {
          await ready;
        }
        const output = new Uint8Array(chunk.length - 10 - (chunk.length - 10) % 16);
        controller.enqueue(append(aesCrypto, chunk, output, 0, 10, true));
      },
      async flush(controller) {
        const { signed: signed2, ctr, hmac, pending, ready } = this;
        await ready;
        const chunkToDecrypt = subarray(pending, 0, pending.length - 10);
        const originalSignature = subarray(pending, pending.length - 10);
        let decryptedChunkArray = new Uint8Array();
        if (chunkToDecrypt.length) {
          const encryptedChunk = toBits(codecBytes, chunkToDecrypt);
          hmac.update(encryptedChunk);
          const decryptedChunk = ctr.update(encryptedChunk);
          decryptedChunkArray = fromBits(codecBytes, decryptedChunk);
        }
        if (signed2) {
          const signature = subarray(fromBits(codecBytes, hmac.digest()), 0, 10);
          for (let indexSignature = 0; indexSignature < 10; indexSignature++) {
            if (signature[indexSignature] != originalSignature[indexSignature]) {
              throw new Error(ERR_INVALID_SIGNATURE);
            }
          }
        }
        controller.enqueue(decryptedChunkArray);
      }
    });
  }
};
var AESEncryptionStream = class extends TransformStream {
  constructor({ password, encryptionStrength }) {
    let stream;
    super({
      start() {
        Object.assign(this, {
          ready: new Promise((resolve) => this.resolveReady = resolve),
          password,
          strength: encryptionStrength - 1,
          pending: new Uint8Array()
        });
      },
      async transform(chunk, controller) {
        const aesCrypto = this;
        const { password: password2, strength, resolveReady, ready } = aesCrypto;
        let preamble = new Uint8Array();
        if (password2) {
          preamble = await createEncryptionKeys(aesCrypto, strength, password2);
          resolveReady();
        } else {
          await ready;
        }
        const output = new Uint8Array(preamble.length + chunk.length - chunk.length % 16);
        output.set(preamble, 0);
        controller.enqueue(append(aesCrypto, chunk, output, preamble.length, 0));
      },
      async flush(controller) {
        const { ctr, hmac, pending, ready } = this;
        await ready;
        let encryptedChunkArray = new Uint8Array();
        if (pending.length) {
          const encryptedChunk = ctr.update(toBits(codecBytes, pending));
          hmac.update(encryptedChunk);
          encryptedChunkArray = fromBits(codecBytes, encryptedChunk);
        }
        stream.signature = fromBits(codecBytes, hmac.digest()).slice(0, SIGNATURE_LENGTH);
        controller.enqueue(concat(encryptedChunkArray, stream.signature));
      }
    });
    stream = this;
  }
};
function append(aesCrypto, input, output, paddingStart, paddingEnd, verifySignature) {
  const { ctr, hmac, pending } = aesCrypto;
  const inputLength = input.length - paddingEnd;
  if (pending.length) {
    input = concat(pending, input);
    output = expand(output, inputLength - inputLength % BLOCK_LENGTH);
  }
  let offset;
  for (offset = 0; offset <= inputLength - 16; offset += BLOCK_LENGTH) {
    const inputChunk = toBits(codecBytes, subarray(input, offset, offset + 16));
    if (verifySignature) {
      hmac.update(inputChunk);
    }
    const outputChunk = ctr.update(inputChunk);
    if (!verifySignature) {
      hmac.update(outputChunk);
    }
    output.set(fromBits(codecBytes, outputChunk), offset + paddingStart);
  }
  aesCrypto.pending = subarray(input, offset);
  return output;
}
async function createDecryptionKeys(decrypt2, strength, password, preamble) {
  const passwordVerificationKey = await createKeys(decrypt2, strength, password, subarray(preamble, 0, SALT_LENGTH[strength]));
  const passwordVerification = subarray(preamble, SALT_LENGTH[strength]);
  if (passwordVerificationKey[0] != passwordVerification[0] || passwordVerificationKey[1] != passwordVerification[1]) {
    throw new Error(ERR_INVALID_PASSWORD);
  }
}
async function createEncryptionKeys(encrypt2, strength, password) {
  const salt = getRandomValues(new Uint8Array(SALT_LENGTH[strength]));
  const passwordVerification = await createKeys(encrypt2, strength, password, salt);
  return concat(salt, passwordVerification);
}
async function createKeys(aesCrypto, strength, password, salt) {
  aesCrypto.password = null;
  const encodedPassword = encodeText(password);
  const baseKey = await importKey(RAW_FORMAT, encodedPassword, BASE_KEY_ALGORITHM, false, DERIVED_BITS_USAGE);
  const derivedBits = await deriveBits(Object.assign({
    salt
  }, DERIVED_BITS_ALGORITHM), baseKey, 8 * (KEY_LENGTH[strength] * 2 + 2));
  const compositeKey = new Uint8Array(derivedBits);
  const key = toBits(codecBytes, subarray(compositeKey, 0, KEY_LENGTH[strength]));
  const authentication = toBits(codecBytes, subarray(compositeKey, KEY_LENGTH[strength], KEY_LENGTH[strength] * 2));
  const passwordVerification = subarray(compositeKey, KEY_LENGTH[strength] * 2);
  Object.assign(aesCrypto, {
    keys: {
      key,
      authentication,
      passwordVerification
    },
    ctr: new CtrGladman(new Aes(key), Array.from(COUNTER_DEFAULT_VALUE)),
    hmac: new HmacSha1(authentication)
  });
  return passwordVerification;
}
async function importKey(format, password, algorithm, extractable, keyUsages) {
  if (IMPORT_KEY_SUPPORTED) {
    try {
      return await subtle.importKey(format, password, algorithm, extractable, keyUsages);
    } catch (_error) {
      IMPORT_KEY_SUPPORTED = false;
      return misc.importKey(password);
    }
  } else {
    return misc.importKey(password);
  }
}
async function deriveBits(algorithm, baseKey, length) {
  if (DERIVE_BITS_SUPPORTED) {
    try {
      return await subtle.deriveBits(algorithm, baseKey, length);
    } catch (_error) {
      DERIVE_BITS_SUPPORTED = false;
      return misc.pbkdf2(baseKey, algorithm.salt, DERIVED_BITS_ALGORITHM.iterations, length);
    }
  } else {
    return misc.pbkdf2(baseKey, algorithm.salt, DERIVED_BITS_ALGORITHM.iterations, length);
  }
}
function concat(leftArray, rightArray) {
  let array = leftArray;
  if (leftArray.length + rightArray.length) {
    array = new Uint8Array(leftArray.length + rightArray.length);
    array.set(leftArray, 0);
    array.set(rightArray, leftArray.length);
  }
  return array;
}
function expand(inputArray, length) {
  if (length && length > inputArray.length) {
    const array = inputArray;
    inputArray = new Uint8Array(length);
    inputArray.set(array, 0);
  }
  return inputArray;
}
function subarray(array, begin, end) {
  return array.subarray(begin, end);
}
function fromBits(codecBytes2, chunk) {
  return codecBytes2.fromBits(chunk);
}
function toBits(codecBytes2, chunk) {
  return codecBytes2.toBits(chunk);
}
var HEADER_LENGTH = 12;
var ZipCryptoDecryptionStream = class extends TransformStream {
  constructor({ password, passwordVerification, checkPasswordOnly }) {
    super({
      start() {
        Object.assign(this, {
          password,
          passwordVerification
        });
        createKeys1(this, password);
      },
      transform(chunk, controller) {
        const zipCrypto = this;
        if (zipCrypto.password) {
          const decryptedHeader = decrypt(zipCrypto, chunk.subarray(0, 12));
          zipCrypto.password = null;
          if (decryptedHeader[12 - 1] != zipCrypto.passwordVerification) {
            throw new Error(ERR_INVALID_PASSWORD);
          }
          chunk = chunk.subarray(HEADER_LENGTH);
        }
        if (checkPasswordOnly) {
          controller.error(new Error(ERR_ABORT_CHECK_PASSWORD));
        } else {
          controller.enqueue(decrypt(zipCrypto, chunk));
        }
      }
    });
  }
};
var ZipCryptoEncryptionStream = class extends TransformStream {
  constructor({ password, passwordVerification }) {
    super({
      start() {
        Object.assign(this, {
          password,
          passwordVerification
        });
        createKeys1(this, password);
      },
      transform(chunk, controller) {
        const zipCrypto = this;
        let output;
        let offset;
        if (zipCrypto.password) {
          zipCrypto.password = null;
          const header = getRandomValues(new Uint8Array(12));
          header[HEADER_LENGTH - 1] = zipCrypto.passwordVerification;
          output = new Uint8Array(chunk.length + header.length);
          output.set(encrypt(zipCrypto, header), 0);
          offset = HEADER_LENGTH;
        } else {
          output = new Uint8Array(chunk.length);
          offset = 0;
        }
        output.set(encrypt(zipCrypto, chunk), offset);
        controller.enqueue(output);
      }
    });
  }
};
function decrypt(target, input) {
  const output = new Uint8Array(input.length);
  for (let index = 0; index < input.length; index++) {
    output[index] = getByte(target) ^ input[index];
    updateKeys(target, output[index]);
  }
  return output;
}
function encrypt(target, input) {
  const output = new Uint8Array(input.length);
  for (let index = 0; index < input.length; index++) {
    output[index] = getByte(target) ^ input[index];
    updateKeys(target, input[index]);
  }
  return output;
}
function createKeys1(target, password) {
  const keys = [
    305419896,
    591751049,
    878082192
  ];
  Object.assign(target, {
    keys,
    crcKey0: new Crc32(keys[0]),
    crcKey2: new Crc32(keys[2])
  });
  for (let index = 0; index < password.length; index++) {
    updateKeys(target, password.charCodeAt(index));
  }
}
function updateKeys(target, __byte) {
  let [key0, key1, key2] = target.keys;
  target.crcKey0.append([
    __byte
  ]);
  key0 = ~target.crcKey0.get();
  key1 = getInt32(Math.imul(getInt32(key1 + getInt8(key0)), 134775813) + 1);
  target.crcKey2.append([
    key1 >>> 24
  ]);
  key2 = ~target.crcKey2.get();
  target.keys = [
    key0,
    key1,
    key2
  ];
}
function getByte(target) {
  const temp = target.keys[2] | 2;
  return getInt8(Math.imul(temp, temp ^ 1) >>> 8);
}
function getInt8(number) {
  return number & 255;
}
function getInt32(number) {
  return number & 4294967295;
}
var COMPRESSION_FORMAT = "deflate-raw";
var DeflateStream = class extends TransformStream {
  constructor(options, { chunkSize, CompressionStream: CompressionStream1, CompressionStreamNative }) {
    super({});
    const { compressed, encrypted, useCompressionStream, zipCrypto, signed, level } = options;
    const stream = this;
    let crc32Stream, encryptionStream;
    let readable = filterEmptyChunks(super.readable);
    if ((!encrypted || zipCrypto) && signed) {
      crc32Stream = new Crc32Stream();
      readable = pipeThrough(readable, crc32Stream);
    }
    if (compressed) {
      readable = pipeThroughCommpressionStream(readable, useCompressionStream, {
        level,
        chunkSize
      }, CompressionStreamNative, CompressionStream1);
    }
    if (encrypted) {
      if (zipCrypto) {
        readable = pipeThrough(readable, new ZipCryptoEncryptionStream(options));
      } else {
        encryptionStream = new AESEncryptionStream(options);
        readable = pipeThrough(readable, encryptionStream);
      }
    }
    setReadable(stream, readable, () => {
      let signature;
      if (encrypted && !zipCrypto) {
        signature = encryptionStream.signature;
      }
      if ((!encrypted || zipCrypto) && signed) {
        signature = new DataView(crc32Stream.value.buffer).getUint32(0);
      }
      stream.signature = signature;
    });
  }
};
var InflateStream = class extends TransformStream {
  constructor(options, { chunkSize, DecompressionStream: DecompressionStream1, DecompressionStreamNative }) {
    super({});
    const { zipCrypto, encrypted, signed, signature, compressed, useCompressionStream } = options;
    let crc32Stream, decryptionStream;
    let readable = filterEmptyChunks(super.readable);
    if (encrypted) {
      if (zipCrypto) {
        readable = pipeThrough(readable, new ZipCryptoDecryptionStream(options));
      } else {
        decryptionStream = new AESDecryptionStream(options);
        readable = pipeThrough(readable, decryptionStream);
      }
    }
    if (compressed) {
      readable = pipeThroughCommpressionStream(readable, useCompressionStream, {
        chunkSize
      }, DecompressionStreamNative, DecompressionStream1);
    }
    if ((!encrypted || zipCrypto) && signed) {
      crc32Stream = new Crc32Stream();
      readable = pipeThrough(readable, crc32Stream);
    }
    setReadable(this, readable, () => {
      if ((!encrypted || zipCrypto) && signed) {
        const dataViewSignature = new DataView(crc32Stream.value.buffer);
        if (signature != dataViewSignature.getUint32(0, false)) {
          throw new Error(ERR_INVALID_SIGNATURE);
        }
      }
    });
  }
};
function filterEmptyChunks(readable) {
  return pipeThrough(readable, new TransformStream({
    transform(chunk, controller) {
      if (chunk && chunk.length) {
        controller.enqueue(chunk);
      }
    }
  }));
}
function setReadable(stream, readable, flush) {
  readable = pipeThrough(readable, new TransformStream({
    flush
  }));
  Object.defineProperty(stream, "readable", {
    get() {
      return readable;
    }
  });
}
function pipeThroughCommpressionStream(readable, useCompressionStream, options, CodecStreamNative, CodecStream2) {
  try {
    const CompressionStream1 = useCompressionStream && CodecStreamNative ? CodecStreamNative : CodecStream2;
    readable = pipeThrough(readable, new CompressionStream1(COMPRESSION_FORMAT, options));
  } catch (error) {
    if (useCompressionStream) {
      readable = pipeThrough(readable, new CodecStream2(COMPRESSION_FORMAT, options));
    } else {
      throw error;
    }
  }
  return readable;
}
function pipeThrough(readable, transformStream) {
  return readable.pipeThrough(transformStream);
}
var MESSAGE_EVENT_TYPE = "message";
var MESSAGE_START = "start";
var MESSAGE_PULL = "pull";
var MESSAGE_DATA = "data";
var MESSAGE_ACK_DATA = "ack";
var MESSAGE_CLOSE = "close";
var CODEC_DEFLATE = "deflate";
var CODEC_INFLATE = "inflate";
var CodecStream = class extends TransformStream {
  constructor(options, config2) {
    super({});
    const codec2 = this;
    const { codecType } = options;
    let Stream2;
    if (codecType.startsWith(CODEC_DEFLATE)) {
      Stream2 = DeflateStream;
    } else if (codecType.startsWith(CODEC_INFLATE)) {
      Stream2 = InflateStream;
    }
    let size = 0;
    const stream = new Stream2(options, config2);
    const readable = super.readable;
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        if (chunk && chunk.length) {
          size += chunk.length;
          controller.enqueue(chunk);
        }
      },
      flush() {
        const { signature } = stream;
        Object.assign(codec2, {
          signature,
          size
        });
      }
    });
    Object.defineProperty(codec2, "readable", {
      get() {
        return readable.pipeThrough(stream).pipeThrough(transformStream);
      }
    });
  }
};
var WEB_WORKERS_SUPPORTED = typeof Worker != UNDEFINED_TYPE;
var CodecWorker = class {
  constructor(workerData, { readable, writable }, { options, config: config2, streamOptions, useWebWorkers, transferStreams, scripts }, onTaskFinished) {
    const { signal } = streamOptions;
    Object.assign(workerData, {
      busy: true,
      readable: readable.pipeThrough(new ProgressWatcherStream(readable, streamOptions, config2), {
        signal
      }),
      writable,
      options: Object.assign({}, options),
      scripts,
      transferStreams,
      terminate() {
        const { worker, busy } = workerData;
        if (worker && !busy) {
          worker.terminate();
          workerData.interface = null;
        }
      },
      onTaskFinished() {
        workerData.busy = false;
        onTaskFinished(workerData);
      }
    });
    return (useWebWorkers && WEB_WORKERS_SUPPORTED ? createWebWorkerInterface : createWorkerInterface)(workerData, config2);
  }
};
var ProgressWatcherStream = class extends TransformStream {
  constructor(readableSource, { onstart, onprogress, size, onend }, { chunkSize }) {
    let chunkOffset = 0;
    super({
      start() {
        if (onstart) {
          callHandler(onstart, size);
        }
      },
      async transform(chunk, controller) {
        chunkOffset += chunk.length;
        if (onprogress) {
          await callHandler(onprogress, chunkOffset, size);
        }
        controller.enqueue(chunk);
      },
      flush() {
        readableSource.size = chunkOffset;
        if (onend) {
          callHandler(onend, chunkOffset);
        }
      }
    }, {
      highWaterMark: 1,
      size: () => chunkSize
    });
  }
};
async function callHandler(handler, ...parameters) {
  try {
    await handler(...parameters);
  } catch (_error) {
  }
}
function createWorkerInterface(workerData, config2) {
  return {
    run: () => runWorker(workerData, config2)
  };
}
function createWebWorkerInterface(workerData, { baseURL: baseURL2, chunkSize }) {
  if (!workerData.interface) {
    Object.assign(workerData, {
      worker: getWebWorker(workerData.scripts[0], baseURL2, workerData),
      interface: {
        run: () => runWebWorker(workerData, {
          chunkSize
        })
      }
    });
  }
  return workerData.interface;
}
async function runWorker({ options, readable, writable, onTaskFinished }, config2) {
  const codecStream = new CodecStream(options, config2);
  try {
    await readable.pipeThrough(codecStream).pipeTo(writable, {
      preventClose: true,
      preventAbort: true
    });
    const { signature, size } = codecStream;
    return {
      signature,
      size
    };
  } finally {
    onTaskFinished();
  }
}
async function runWebWorker(workerData, config2) {
  let resolveResult, rejectResult;
  const result = new Promise((resolve, reject) => {
    resolveResult = resolve;
    rejectResult = reject;
  });
  Object.assign(workerData, {
    reader: null,
    writer: null,
    resolveResult,
    rejectResult,
    result
  });
  const { readable, options, scripts } = workerData;
  const { writable, closed } = watchClosedStream(workerData.writable);
  const streamsTransferred = sendMessage({
    type: MESSAGE_START,
    scripts: scripts.slice(1),
    options,
    config: config2,
    readable,
    writable
  }, workerData);
  if (!streamsTransferred) {
    Object.assign(workerData, {
      reader: readable.getReader(),
      writer: writable.getWriter()
    });
  }
  const resultValue = await result;
  try {
    await writable.getWriter().close();
  } catch (_error) {
  }
  await closed;
  return resultValue;
}
function watchClosedStream(writableSource) {
  const writer = writableSource.getWriter();
  let resolveStreamClosed;
  const closed = new Promise((resolve) => resolveStreamClosed = resolve);
  const writable = new WritableStream({
    async write(chunk) {
      await writer.ready;
      await writer.write(chunk);
    },
    close() {
      writer.releaseLock();
      resolveStreamClosed();
    },
    abort(reason) {
      return writer.abort(reason);
    }
  });
  return {
    writable,
    closed
  };
}
var classicWorkersSupported = true;
var transferStreamsSupported = true;
function getWebWorker(url, baseURL2, workerData) {
  const workerOptions = {
    type: "module"
  };
  let scriptUrl, worker;
  if (typeof url == FUNCTION_TYPE) {
    url = url();
  }
  try {
    scriptUrl = new URL(url, baseURL2);
  } catch (_error) {
    scriptUrl = url;
  }
  if (classicWorkersSupported) {
    try {
      worker = new Worker(scriptUrl);
    } catch (_error) {
      classicWorkersSupported = false;
      worker = new Worker(scriptUrl, workerOptions);
    }
  } else {
    worker = new Worker(scriptUrl, workerOptions);
  }
  worker.addEventListener(MESSAGE_EVENT_TYPE, (event) => onMessage(event, workerData));
  return worker;
}
function sendMessage(message, { worker, writer, onTaskFinished, transferStreams }) {
  try {
    let { value, readable, writable } = message;
    const transferables = [];
    if (value) {
      message.value = value.buffer;
      transferables.push(message.value);
    }
    if (transferStreams && transferStreamsSupported) {
      if (readable) {
        transferables.push(readable);
      }
      if (writable) {
        transferables.push(writable);
      }
    } else {
      message.readable = message.writable = null;
    }
    if (transferables.length) {
      try {
        worker.postMessage(message, transferables);
        return true;
      } catch (_error) {
        transferStreamsSupported = false;
        message.readable = message.writable = null;
        worker.postMessage(message);
      }
    } else {
      worker.postMessage(message);
    }
  } catch (error) {
    if (writer) {
      writer.releaseLock();
    }
    onTaskFinished();
    throw error;
  }
}
async function onMessage({ data }, workerData) {
  const { type, value, messageId, result, error } = data;
  const { reader, writer, resolveResult, rejectResult, onTaskFinished } = workerData;
  try {
    if (error) {
      const { message, stack, code, name } = error;
      const responseError = new Error(message);
      Object.assign(responseError, {
        stack,
        code,
        name
      });
      close(responseError);
    } else {
      if (type == MESSAGE_PULL) {
        const { value: value2, done } = await reader.read();
        sendMessage({
          type: MESSAGE_DATA,
          value: value2,
          done,
          messageId
        }, workerData);
      }
      if (type == MESSAGE_DATA) {
        await writer.ready;
        await writer.write(new Uint8Array(value));
        sendMessage({
          type: MESSAGE_ACK_DATA,
          messageId
        }, workerData);
      }
      if (type == MESSAGE_CLOSE) {
        close(null, result);
      }
    }
  } catch (error2) {
    close(error2);
  }
  function close(error2, result2) {
    if (error2) {
      rejectResult(error2);
    } else {
      resolveResult(result2);
    }
    if (writer) {
      writer.releaseLock();
    }
    onTaskFinished();
  }
}
var pool = [];
var pendingRequests = [];
var indexWorker = 0;
async function runWorker1(stream, workerOptions) {
  const { options, config: config2 } = workerOptions;
  const { transferStreams, useWebWorkers, useCompressionStream, codecType, compressed, signed, encrypted } = options;
  const { workerScripts, maxWorkers: maxWorkers2, terminateWorkerTimeout } = config2;
  workerOptions.transferStreams = transferStreams || transferStreams === UNDEFINED_VALUE;
  const streamCopy = !compressed && !signed && !encrypted && !workerOptions.transferStreams;
  workerOptions.useWebWorkers = !streamCopy && (useWebWorkers || useWebWorkers === UNDEFINED_VALUE && config2.useWebWorkers);
  workerOptions.scripts = workerOptions.useWebWorkers && workerScripts ? workerScripts[codecType] : [];
  options.useCompressionStream = useCompressionStream || useCompressionStream === UNDEFINED_VALUE && config2.useCompressionStream;
  let worker;
  const workerData = pool.find((workerData2) => !workerData2.busy);
  if (workerData) {
    clearTerminateTimeout(workerData);
    worker = new CodecWorker(workerData, stream, workerOptions, onTaskFinished);
  } else if (pool.length < maxWorkers2) {
    const workerData2 = {
      indexWorker
    };
    indexWorker++;
    pool.push(workerData2);
    worker = new CodecWorker(workerData2, stream, workerOptions, onTaskFinished);
  } else {
    worker = await new Promise((resolve) => pendingRequests.push({
      resolve,
      stream,
      workerOptions
    }));
  }
  return worker.run();
  function onTaskFinished(workerData2) {
    if (pendingRequests.length) {
      const [{ resolve, stream: stream2, workerOptions: workerOptions2 }] = pendingRequests.splice(0, 1);
      resolve(new CodecWorker(workerData2, stream2, workerOptions2, onTaskFinished));
    } else if (workerData2.worker) {
      clearTerminateTimeout(workerData2);
      if (Number.isFinite(terminateWorkerTimeout) && terminateWorkerTimeout >= 0) {
        workerData2.terminateTimeout = setTimeout(() => {
          pool = pool.filter((data) => data != workerData2);
          workerData2.terminate();
        }, terminateWorkerTimeout);
      }
    } else {
      pool = pool.filter((data) => data != workerData2);
    }
  }
}
function clearTerminateTimeout(workerData) {
  const { terminateTimeout } = workerData;
  if (terminateTimeout) {
    clearTimeout(terminateTimeout);
    workerData.terminateTimeout = null;
  }
}
function e(e2) {
  const t = () => URL.createObjectURL(new Blob([
    'const{Array:e,Object:t,Number:n,Math:r,Error:s,Uint8Array:i,Uint16Array:o,Uint32Array:c,Int32Array:f,Map:a,DataView:l,Promise:u,TextEncoder:w,crypto:h,postMessage:d,TransformStream:p,ReadableStream:y,WritableStream:m,CompressionStream:b,DecompressionStream:g}=self;class k{constructor(e){return class extends p{constructor(t,n){const r=new e(n);super({transform(e,t){t.enqueue(r.append(e))},flush(e){const t=r.flush();t&&e.enqueue(t)}})}}}}const v=[];for(let e=0;256>e;e++){let t=e;for(let e=0;8>e;e++)1&t?t=t>>>1^3988292384:t>>>=1;v[e]=t}class S{constructor(e){this.t=e||-1}append(e){let t=0|this.t;for(let n=0,r=0|e.length;r>n;n++)t=t>>>8^v[255&(t^e[n])];this.t=t}get(){return~this.t}}class z extends p{constructor(){let e;const t=new S;super({transform(e,n){t.append(e),n.enqueue(e)},flush(){const n=new i(4);new l(n.buffer).setUint32(0,t.get()),e.value=n}}),e=this}}const C={concat(e,t){if(0===e.length||0===t.length)return e.concat(t);const n=e[e.length-1],r=C.i(n);return 32===r?e.concat(t):C.o(t,r,0|n,e.slice(0,e.length-1))},l(e){const t=e.length;if(0===t)return 0;const n=e[t-1];return 32*(t-1)+C.i(n)},u(e,t){if(32*e.length<t)return e;const n=(e=e.slice(0,r.ceil(t/32))).length;return t&=31,n>0&&t&&(e[n-1]=C.h(t,e[n-1]&2147483648>>t-1,1)),e},h:(e,t,n)=>32===e?t:(n?0|t:t<<32-e)+1099511627776*e,i:e=>r.round(e/1099511627776)||32,o(e,t,n,r){for(void 0===r&&(r=[]);t>=32;t-=32)r.push(n),n=0;if(0===t)return r.concat(e);for(let s=0;s<e.length;s++)r.push(n|e[s]>>>t),n=e[s]<<32-t;const s=e.length?e[e.length-1]:0,i=C.i(s);return r.push(C.h(t+i&31,t+i>32?n:r.pop(),1)),r}},x={p:{m(e){const t=C.l(e)/8,n=new i(t);let r;for(let s=0;t>s;s++)0==(3&s)&&(r=e[s/4]),n[s]=r>>>24,r<<=8;return n},g(e){const t=[];let n,r=0;for(n=0;n<e.length;n++)r=r<<8|e[n],3==(3&n)&&(t.push(r),r=0);return 3&n&&t.push(C.h(8*(3&n),r)),t}}},_=class{constructor(e){const t=this;t.blockSize=512,t.k=[1732584193,4023233417,2562383102,271733878,3285377520],t.v=[1518500249,1859775393,2400959708,3395469782],e?(t.S=e.S.slice(0),t.C=e.C.slice(0),t._=e._):t.reset()}reset(){const e=this;return e.S=e.k.slice(0),e.C=[],e._=0,e}update(e){const t=this;"string"==typeof e&&(e=x.A.g(e));const n=t.C=C.concat(t.C,e),r=t._,i=t._=r+C.l(e);if(i>9007199254740991)throw new s("Cannot hash more than 2^53 - 1 bits");const o=new c(n);let f=0;for(let e=t.blockSize+r-(t.blockSize+r&t.blockSize-1);i>=e;e+=t.blockSize)t.I(o.subarray(16*f,16*(f+1))),f+=1;return n.splice(0,16*f),t}D(){const e=this;let t=e.C;const n=e.S;t=C.concat(t,[C.h(1,1)]);for(let e=t.length+2;15&e;e++)t.push(0);for(t.push(r.floor(e._/4294967296)),t.push(0|e._);t.length;)e.I(t.splice(0,16));return e.reset(),n}V(e,t,n,r){return e>19?e>39?e>59?e>79?void 0:t^n^r:t&n|t&r|n&r:t^n^r:t&n|~t&r}P(e,t){return t<<e|t>>>32-e}I(t){const n=this,s=n.S,i=e(80);for(let e=0;16>e;e++)i[e]=t[e];let o=s[0],c=s[1],f=s[2],a=s[3],l=s[4];for(let e=0;79>=e;e++){16>e||(i[e]=n.P(1,i[e-3]^i[e-8]^i[e-14]^i[e-16]));const t=n.P(5,o)+n.V(e,c,f,a)+l+i[e]+n.v[r.floor(e/20)]|0;l=a,a=f,f=n.P(30,c),c=o,o=t}s[0]=s[0]+o|0,s[1]=s[1]+c|0,s[2]=s[2]+f|0,s[3]=s[3]+a|0,s[4]=s[4]+l|0}},A={getRandomValues(e){const t=new c(e.buffer),n=e=>{let t=987654321;const n=4294967295;return()=>(t=36969*(65535&t)+(t>>16)&n,(((t<<16)+(e=18e3*(65535&e)+(e>>16)&n)&n)/4294967296+.5)*(r.random()>.5?1:-1))};for(let s,i=0;i<e.length;i+=4){const e=n(4294967296*(s||r.random()));s=987654071*e(),t[i/4]=4294967296*e()|0}return e}},I={importKey:e=>new I.R(x.p.g(e)),B(e,t,n,r){if(n=n||1e4,0>r||0>n)throw new s("invalid params to pbkdf2");const i=1+(r>>5)<<2;let o,c,f,a,u;const w=new ArrayBuffer(i),h=new l(w);let d=0;const p=C;for(t=x.p.g(t),u=1;(i||1)>d;u++){for(o=c=e.encrypt(p.concat(t,[u])),f=1;n>f;f++)for(c=e.encrypt(c),a=0;a<c.length;a++)o[a]^=c[a];for(f=0;(i||1)>d&&f<o.length;f++)h.setInt32(d,o[f]),d+=4}return w.slice(0,r/8)},R:class{constructor(e){const t=this,n=t.M=_,r=[[],[]];t.U=[new n,new n];const s=t.U[0].blockSize/32;e.length>s&&(e=(new n).update(e).D());for(let t=0;s>t;t++)r[0][t]=909522486^e[t],r[1][t]=1549556828^e[t];t.U[0].update(r[0]),t.U[1].update(r[1]),t.K=new n(t.U[0])}reset(){const e=this;e.K=new e.M(e.U[0]),e.N=!1}update(e){this.N=!0,this.K.update(e)}digest(){const e=this,t=e.K.D(),n=new e.M(e.U[1]).update(t).D();return e.reset(),n}encrypt(e){if(this.N)throw new s("encrypt on already updated hmac called!");return this.update(e),this.digest(e)}}},D=void 0!==h&&"function"==typeof h.getRandomValues,V="Invalid password",P="Invalid signature",R="zipjs-abort-check-password";function B(e){return D?h.getRandomValues(e):A.getRandomValues(e)}const E=16,M={name:"PBKDF2"},U=t.assign({hash:{name:"HMAC"}},M),K=t.assign({iterations:1e3,hash:{name:"SHA-1"}},M),N=["deriveBits"],O=[8,12,16],T=[16,24,32],W=10,j=[0,0,0,0],H="undefined",L="function",F=typeof h!=H,q=F&&h.subtle,G=F&&typeof q!=H,J=x.p,Q=class{constructor(e){const t=this;t.O=[[[],[],[],[],[]],[[],[],[],[],[]]],t.O[0][0][0]||t.T();const n=t.O[0][4],r=t.O[1],i=e.length;let o,c,f,a=1;if(4!==i&&6!==i&&8!==i)throw new s("invalid aes key size");for(t.v=[c=e.slice(0),f=[]],o=i;4*i+28>o;o++){let e=c[o-1];(o%i==0||8===i&&o%i==4)&&(e=n[e>>>24]<<24^n[e>>16&255]<<16^n[e>>8&255]<<8^n[255&e],o%i==0&&(e=e<<8^e>>>24^a<<24,a=a<<1^283*(a>>7))),c[o]=c[o-i]^e}for(let e=0;o;e++,o--){const t=c[3&e?o:o-4];f[e]=4>=o||4>e?t:r[0][n[t>>>24]]^r[1][n[t>>16&255]]^r[2][n[t>>8&255]]^r[3][n[255&t]]}}encrypt(e){return this.W(e,0)}decrypt(e){return this.W(e,1)}T(){const e=this.O[0],t=this.O[1],n=e[4],r=t[4],s=[],i=[];let o,c,f,a;for(let e=0;256>e;e++)i[(s[e]=e<<1^283*(e>>7))^e]=e;for(let l=o=0;!n[l];l^=c||1,o=i[o]||1){let i=o^o<<1^o<<2^o<<3^o<<4;i=i>>8^255&i^99,n[l]=i,r[i]=l,a=s[f=s[c=s[l]]];let u=16843009*a^65537*f^257*c^16843008*l,w=257*s[i]^16843008*i;for(let n=0;4>n;n++)e[n][l]=w=w<<24^w>>>8,t[n][i]=u=u<<24^u>>>8}for(let n=0;5>n;n++)e[n]=e[n].slice(0),t[n]=t[n].slice(0)}W(e,t){if(4!==e.length)throw new s("invalid aes block size");const n=this.v[t],r=n.length/4-2,i=[0,0,0,0],o=this.O[t],c=o[0],f=o[1],a=o[2],l=o[3],u=o[4];let w,h,d,p=e[0]^n[0],y=e[t?3:1]^n[1],m=e[2]^n[2],b=e[t?1:3]^n[3],g=4;for(let e=0;r>e;e++)w=c[p>>>24]^f[y>>16&255]^a[m>>8&255]^l[255&b]^n[g],h=c[y>>>24]^f[m>>16&255]^a[b>>8&255]^l[255&p]^n[g+1],d=c[m>>>24]^f[b>>16&255]^a[p>>8&255]^l[255&y]^n[g+2],b=c[b>>>24]^f[p>>16&255]^a[y>>8&255]^l[255&m]^n[g+3],g+=4,p=w,y=h,m=d;for(let e=0;4>e;e++)i[t?3&-e:e]=u[p>>>24]<<24^u[y>>16&255]<<16^u[m>>8&255]<<8^u[255&b]^n[g++],w=p,p=y,y=m,m=b,b=w;return i}},X=class{constructor(e,t){this.j=e,this.H=t,this.L=t}reset(){this.L=this.H}update(e){return this.F(this.j,e,this.L)}q(e){if(255==(e>>24&255)){let t=e>>16&255,n=e>>8&255,r=255&e;255===t?(t=0,255===n?(n=0,255===r?r=0:++r):++n):++t,e=0,e+=t<<16,e+=n<<8,e+=r}else e+=1<<24;return e}G(e){0===(e[0]=this.q(e[0]))&&(e[1]=this.q(e[1]))}F(e,t,n){let r;if(!(r=t.length))return[];const s=C.l(t);for(let s=0;r>s;s+=4){this.G(n);const r=e.encrypt(n);t[s]^=r[0],t[s+1]^=r[1],t[s+2]^=r[2],t[s+3]^=r[3]}return C.u(t,s)}},Y=I.R;let Z=F&&G&&typeof q.importKey==L,$=F&&G&&typeof q.deriveBits==L;class ee extends p{constructor({password:e,signed:n,encryptionStrength:r,checkPasswordOnly:o}){super({start(){t.assign(this,{ready:new u((e=>this.J=e)),password:e,signed:n,X:r-1,pending:new i})},async transform(e,t){const n=this,{password:r,X:c,J:f,ready:a}=n;r?(await(async(e,t,n,r)=>{const i=await re(e,t,n,ie(r,0,O[t])),o=ie(r,O[t]);if(i[0]!=o[0]||i[1]!=o[1])throw new s(V)})(n,c,r,ie(e,0,O[c]+2)),e=ie(e,O[c]+2),o?t.error(new s(R)):f()):await a;const l=new i(e.length-W-(e.length-W)%E);t.enqueue(ne(n,e,l,0,W,!0))},async flush(e){const{signed:t,Y:n,Z:r,pending:o,ready:c}=this;await c;const f=ie(o,0,o.length-W),a=ie(o,o.length-W);let l=new i;if(f.length){const e=ce(J,f);r.update(e);const t=n.update(e);l=oe(J,t)}if(t){const e=ie(oe(J,r.digest()),0,W);for(let t=0;W>t;t++)if(e[t]!=a[t])throw new s(P)}e.enqueue(l)}})}}class te extends p{constructor({password:e,encryptionStrength:n}){let r;super({start(){t.assign(this,{ready:new u((e=>this.J=e)),password:e,X:n-1,pending:new i})},async transform(e,t){const n=this,{password:r,X:s,J:o,ready:c}=n;let f=new i;r?(f=await(async(e,t,n)=>{const r=B(new i(O[t]));return se(r,await re(e,t,n,r))})(n,s,r),o()):await c;const a=new i(f.length+e.length-e.length%E);a.set(f,0),t.enqueue(ne(n,e,a,f.length,0))},async flush(e){const{Y:t,Z:n,pending:s,ready:o}=this;await o;let c=new i;if(s.length){const e=t.update(ce(J,s));n.update(e),c=oe(J,e)}r.signature=oe(J,n.digest()).slice(0,W),e.enqueue(se(c,r.signature))}}),r=this}}function ne(e,t,n,r,s,o){const{Y:c,Z:f,pending:a}=e,l=t.length-s;let u;for(a.length&&(t=se(a,t),n=((e,t)=>{if(t&&t>e.length){const n=e;(e=new i(t)).set(n,0)}return e})(n,l-l%E)),u=0;l-E>=u;u+=E){const e=ce(J,ie(t,u,u+E));o&&f.update(e);const s=c.update(e);o||f.update(s),n.set(oe(J,s),u+r)}return e.pending=ie(t,u),n}async function re(n,r,s,o){n.password=null;const c=(e=>{if(void 0===w){const t=new i((e=unescape(encodeURIComponent(e))).length);for(let n=0;n<t.length;n++)t[n]=e.charCodeAt(n);return t}return(new w).encode(e)})(s),f=await(async(e,t,n,r,s)=>{if(!Z)return I.importKey(t);try{return await q.importKey("raw",t,n,!1,s)}catch(e){return Z=!1,I.importKey(t)}})(0,c,U,0,N),a=await(async(e,t,n)=>{if(!$)return I.B(t,e.salt,K.iterations,n);try{return await q.deriveBits(e,t,n)}catch(r){return $=!1,I.B(t,e.salt,K.iterations,n)}})(t.assign({salt:o},K),f,8*(2*T[r]+2)),l=new i(a),u=ce(J,ie(l,0,T[r])),h=ce(J,ie(l,T[r],2*T[r])),d=ie(l,2*T[r]);return t.assign(n,{keys:{key:u,$:h,passwordVerification:d},Y:new X(new Q(u),e.from(j)),Z:new Y(h)}),d}function se(e,t){let n=e;return e.length+t.length&&(n=new i(e.length+t.length),n.set(e,0),n.set(t,e.length)),n}function ie(e,t,n){return e.subarray(t,n)}function oe(e,t){return e.m(t)}function ce(e,t){return e.g(t)}class fe extends p{constructor({password:e,passwordVerification:n,checkPasswordOnly:r}){super({start(){t.assign(this,{password:e,passwordVerification:n}),we(this,e)},transform(e,t){const n=this;if(n.password){const t=le(n,e.subarray(0,12));if(n.password=null,t[11]!=n.passwordVerification)throw new s(V);e=e.subarray(12)}r?t.error(new s(R)):t.enqueue(le(n,e))}})}}class ae extends p{constructor({password:e,passwordVerification:n}){super({start(){t.assign(this,{password:e,passwordVerification:n}),we(this,e)},transform(e,t){const n=this;let r,s;if(n.password){n.password=null;const t=B(new i(12));t[11]=n.passwordVerification,r=new i(e.length+t.length),r.set(ue(n,t),0),s=12}else r=new i(e.length),s=0;r.set(ue(n,e),s),t.enqueue(r)}})}}function le(e,t){const n=new i(t.length);for(let r=0;r<t.length;r++)n[r]=de(e)^t[r],he(e,n[r]);return n}function ue(e,t){const n=new i(t.length);for(let r=0;r<t.length;r++)n[r]=de(e)^t[r],he(e,t[r]);return n}function we(e,n){const r=[305419896,591751049,878082192];t.assign(e,{keys:r,ee:new S(r[0]),te:new S(r[2])});for(let t=0;t<n.length;t++)he(e,n.charCodeAt(t))}function he(e,t){let[n,s,i]=e.keys;e.ee.append([t]),n=~e.ee.get(),s=ye(r.imul(ye(s+pe(n)),134775813)+1),e.te.append([s>>>24]),i=~e.te.get(),e.keys=[n,s,i]}function de(e){const t=2|e.keys[2];return pe(r.imul(t,1^t)>>>8)}function pe(e){return 255&e}function ye(e){return 4294967295&e}const me="deflate-raw";class be extends p{constructor(e,{chunkSize:t,CompressionStream:n,CompressionStreamNative:r}){super({});const{compressed:s,encrypted:i,useCompressionStream:o,zipCrypto:c,signed:f,level:a}=e,u=this;let w,h,d=ke(super.readable);i&&!c||!f||(w=new z,d=ze(d,w)),s&&(d=Se(d,o,{level:a,chunkSize:t},r,n)),i&&(c?d=ze(d,new ae(e)):(h=new te(e),d=ze(d,h))),ve(u,d,(()=>{let e;i&&!c&&(e=h.signature),i&&!c||!f||(e=new l(w.value.buffer).getUint32(0)),u.signature=e}))}}class ge extends p{constructor(e,{chunkSize:t,DecompressionStream:n,DecompressionStreamNative:r}){super({});const{zipCrypto:i,encrypted:o,signed:c,signature:f,compressed:a,useCompressionStream:u}=e;let w,h,d=ke(super.readable);o&&(i?d=ze(d,new fe(e)):(h=new ee(e),d=ze(d,h))),a&&(d=Se(d,u,{chunkSize:t},r,n)),o&&!i||!c||(w=new z,d=ze(d,w)),ve(this,d,(()=>{if((!o||i)&&c){const e=new l(w.value.buffer);if(f!=e.getUint32(0,!1))throw new s(P)}}))}}function ke(e){return ze(e,new p({transform(e,t){e&&e.length&&t.enqueue(e)}}))}function ve(e,n,r){n=ze(n,new p({flush:r})),t.defineProperty(e,"readable",{get:()=>n})}function Se(e,t,n,r,s){try{e=ze(e,new(t&&r?r:s)(me,n))}catch(r){if(!t)throw r;e=ze(e,new s(me,n))}return e}function ze(e,t){return e.pipeThrough(t)}const Ce="data";class xe extends p{constructor(e,n){super({});const r=this,{codecType:s}=e;let i;s.startsWith("deflate")?i=be:s.startsWith("inflate")&&(i=ge);let o=0;const c=new i(e,n),f=super.readable,a=new p({transform(e,t){e&&e.length&&(o+=e.length,t.enqueue(e))},flush(){const{signature:e}=c;t.assign(r,{signature:e,size:o})}});t.defineProperty(r,"readable",{get:()=>f.pipeThrough(c).pipeThrough(a)})}}const _e=new a,Ae=new a;let Ie=0;async function De(e){try{const{options:t,scripts:r,config:s}=e;r&&r.length&&importScripts.apply(void 0,r),self.initCodec&&self.initCodec(),s.CompressionStreamNative=self.CompressionStream,s.DecompressionStreamNative=self.DecompressionStream,self.Deflate&&(s.CompressionStream=new k(self.Deflate)),self.Inflate&&(s.DecompressionStream=new k(self.Inflate));const i={highWaterMark:1,size:()=>s.chunkSize},o=e.readable||new y({async pull(e){const t=new u((e=>_e.set(Ie,e)));Ve({type:"pull",messageId:Ie}),Ie=(Ie+1)%n.MAX_SAFE_INTEGER;const{value:r,done:s}=await t;e.enqueue(r),s&&e.close()}},i),c=e.writable||new m({async write(e){let t;const r=new u((e=>t=e));Ae.set(Ie,t),Ve({type:Ce,value:e,messageId:Ie}),Ie=(Ie+1)%n.MAX_SAFE_INTEGER,await r}},i),f=new xe(t,s);await o.pipeThrough(f).pipeTo(c,{preventClose:!0,preventAbort:!0});try{await c.getWriter().close()}catch(e){}const{signature:a,size:l}=f;Ve({type:"close",result:{signature:a,size:l}})}catch(e){Pe(e)}}function Ve(e){let{value:t}=e;if(t)if(t.length)try{t=new i(t),e.value=t.buffer,d(e,[e.value])}catch(t){d(e)}else d(e);else d(e)}function Pe(e=new s("Unknown error")){const{message:t,stack:n,code:r,name:i}=e;d({error:{message:t,stack:n,code:r,name:i}})}addEventListener("message",(({data:e})=>{const{type:t,messageId:n,value:r,done:s}=e;try{if("start"==t&&De(e),t==Ce){const e=_e.get(n);_e.delete(n),e({value:new i(r),done:s})}if("ack"==t){const e=Ae.get(n);Ae.delete(n),e()}}catch(e){Pe(e)}}));const Re=-2;function Be(t){return Ee(t.map((([t,n])=>new e(t).fill(n,0,t))))}function Ee(t){return t.reduce(((t,n)=>t.concat(e.isArray(n)?Ee(n):n)),[])}const Me=[0,1,2,3].concat(...Be([[2,4],[2,5],[4,6],[4,7],[8,8],[8,9],[16,10],[16,11],[32,12],[32,13],[64,14],[64,15],[2,0],[1,16],[1,17],[2,18],[2,19],[4,20],[4,21],[8,22],[8,23],[16,24],[16,25],[32,26],[32,27],[64,28],[64,29]]));function Ue(){const e=this;function t(e,t){let n=0;do{n|=1&e,e>>>=1,n<<=1}while(--t>0);return n>>>1}e.ne=n=>{const s=e.re,i=e.ie.se,o=e.ie.oe;let c,f,a,l=-1;for(n.ce=0,n.fe=573,c=0;o>c;c++)0!==s[2*c]?(n.ae[++n.ce]=l=c,n.le[c]=0):s[2*c+1]=0;for(;2>n.ce;)a=n.ae[++n.ce]=2>l?++l:0,s[2*a]=1,n.le[a]=0,n.ue--,i&&(n.we-=i[2*a+1]);for(e.he=l,c=r.floor(n.ce/2);c>=1;c--)n.de(s,c);a=o;do{c=n.ae[1],n.ae[1]=n.ae[n.ce--],n.de(s,1),f=n.ae[1],n.ae[--n.fe]=c,n.ae[--n.fe]=f,s[2*a]=s[2*c]+s[2*f],n.le[a]=r.max(n.le[c],n.le[f])+1,s[2*c+1]=s[2*f+1]=a,n.ae[1]=a++,n.de(s,1)}while(n.ce>=2);n.ae[--n.fe]=n.ae[1],(t=>{const n=e.re,r=e.ie.se,s=e.ie.pe,i=e.ie.ye,o=e.ie.me;let c,f,a,l,u,w,h=0;for(l=0;15>=l;l++)t.be[l]=0;for(n[2*t.ae[t.fe]+1]=0,c=t.fe+1;573>c;c++)f=t.ae[c],l=n[2*n[2*f+1]+1]+1,l>o&&(l=o,h++),n[2*f+1]=l,f>e.he||(t.be[l]++,u=0,i>f||(u=s[f-i]),w=n[2*f],t.ue+=w*(l+u),r&&(t.we+=w*(r[2*f+1]+u)));if(0!==h){do{for(l=o-1;0===t.be[l];)l--;t.be[l]--,t.be[l+1]+=2,t.be[o]--,h-=2}while(h>0);for(l=o;0!==l;l--)for(f=t.be[l];0!==f;)a=t.ae[--c],a>e.he||(n[2*a+1]!=l&&(t.ue+=(l-n[2*a+1])*n[2*a],n[2*a+1]=l),f--)}})(n),((e,n,r)=>{const s=[];let i,o,c,f=0;for(i=1;15>=i;i++)s[i]=f=f+r[i-1]<<1;for(o=0;n>=o;o++)c=e[2*o+1],0!==c&&(e[2*o]=t(s[c]++,c))})(s,e.he,n.be)}}function Ke(e,t,n,r,s){const i=this;i.se=e,i.pe=t,i.ye=n,i.oe=r,i.me=s}Ue.ge=[0,1,2,3,4,5,6,7].concat(...Be([[2,8],[2,9],[2,10],[2,11],[4,12],[4,13],[4,14],[4,15],[8,16],[8,17],[8,18],[8,19],[16,20],[16,21],[16,22],[16,23],[32,24],[32,25],[32,26],[31,27],[1,28]])),Ue.ke=[0,1,2,3,4,5,6,7,8,10,12,14,16,20,24,28,32,40,48,56,64,80,96,112,128,160,192,224,0],Ue.ve=[0,1,2,3,4,6,8,12,16,24,32,48,64,96,128,192,256,384,512,768,1024,1536,2048,3072,4096,6144,8192,12288,16384,24576],Ue.Se=e=>256>e?Me[e]:Me[256+(e>>>7)],Ue.ze=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],Ue.Ce=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],Ue.xe=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],Ue._e=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];const Ne=Be([[144,8],[112,9],[24,7],[8,8]]);Ke.Ae=Ee([12,140,76,204,44,172,108,236,28,156,92,220,60,188,124,252,2,130,66,194,34,162,98,226,18,146,82,210,50,178,114,242,10,138,74,202,42,170,106,234,26,154,90,218,58,186,122,250,6,134,70,198,38,166,102,230,22,150,86,214,54,182,118,246,14,142,78,206,46,174,110,238,30,158,94,222,62,190,126,254,1,129,65,193,33,161,97,225,17,145,81,209,49,177,113,241,9,137,73,201,41,169,105,233,25,153,89,217,57,185,121,249,5,133,69,197,37,165,101,229,21,149,85,213,53,181,117,245,13,141,77,205,45,173,109,237,29,157,93,221,61,189,125,253,19,275,147,403,83,339,211,467,51,307,179,435,115,371,243,499,11,267,139,395,75,331,203,459,43,299,171,427,107,363,235,491,27,283,155,411,91,347,219,475,59,315,187,443,123,379,251,507,7,263,135,391,71,327,199,455,39,295,167,423,103,359,231,487,23,279,151,407,87,343,215,471,55,311,183,439,119,375,247,503,15,271,143,399,79,335,207,463,47,303,175,431,111,367,239,495,31,287,159,415,95,351,223,479,63,319,191,447,127,383,255,511,0,64,32,96,16,80,48,112,8,72,40,104,24,88,56,120,4,68,36,100,20,84,52,116,3,131,67,195,35,163,99,227].map(((e,t)=>[e,Ne[t]])));const Oe=Be([[30,5]]);function Te(e,t,n,r,s){const i=this;i.Ie=e,i.De=t,i.Ve=n,i.Pe=r,i.Re=s}Ke.Be=Ee([0,16,8,24,4,20,12,28,2,18,10,26,6,22,14,30,1,17,9,25,5,21,13,29,3,19,11,27,7,23].map(((e,t)=>[e,Oe[t]]))),Ke.Ee=new Ke(Ke.Ae,Ue.ze,257,286,15),Ke.Me=new Ke(Ke.Be,Ue.Ce,0,30,15),Ke.Ue=new Ke(null,Ue.xe,0,19,7);const We=[new Te(0,0,0,0,0),new Te(4,4,8,4,1),new Te(4,5,16,8,1),new Te(4,6,32,32,1),new Te(4,4,16,16,2),new Te(8,16,32,32,2),new Te(8,16,128,128,2),new Te(8,32,128,256,2),new Te(32,128,258,1024,2),new Te(32,258,258,4096,2)],je=["need dictionary","stream end","","","stream error","data error","","buffer error","",""],He=113,Le=666,Fe=262;function qe(e,t,n,r){const s=e[2*t],i=e[2*n];return i>s||s==i&&r[t]<=r[n]}function Ge(){const e=this;let t,n,s,c,f,a,l,u,w,h,d,p,y,m,b,g,k,v,S,z,C,x,_,A,I,D,V,P,R,B,E,M,U;const K=new Ue,N=new Ue,O=new Ue;let T,W,j,H,L,F;function q(){let t;for(t=0;286>t;t++)E[2*t]=0;for(t=0;30>t;t++)M[2*t]=0;for(t=0;19>t;t++)U[2*t]=0;E[512]=1,e.ue=e.we=0,W=j=0}function G(e,t){let n,r=-1,s=e[1],i=0,o=7,c=4;0===s&&(o=138,c=3),e[2*(t+1)+1]=65535;for(let f=0;t>=f;f++)n=s,s=e[2*(f+1)+1],++i<o&&n==s||(c>i?U[2*n]+=i:0!==n?(n!=r&&U[2*n]++,U[32]++):i>10?U[36]++:U[34]++,i=0,r=n,0===s?(o=138,c=3):n==s?(o=6,c=3):(o=7,c=4))}function J(t){e.Ke[e.pending++]=t}function Q(e){J(255&e),J(e>>>8&255)}function X(e,t){let n;const r=t;F>16-r?(n=e,L|=n<<F&65535,Q(L),L=n>>>16-F,F+=r-16):(L|=e<<F&65535,F+=r)}function Y(e,t){const n=2*e;X(65535&t[n],65535&t[n+1])}function Z(e,t){let n,r,s=-1,i=e[1],o=0,c=7,f=4;for(0===i&&(c=138,f=3),n=0;t>=n;n++)if(r=i,i=e[2*(n+1)+1],++o>=c||r!=i){if(f>o)do{Y(r,U)}while(0!=--o);else 0!==r?(r!=s&&(Y(r,U),o--),Y(16,U),X(o-3,2)):o>10?(Y(18,U),X(o-11,7)):(Y(17,U),X(o-3,3));o=0,s=r,0===i?(c=138,f=3):r==i?(c=6,f=3):(c=7,f=4)}}function $(){16==F?(Q(L),L=0,F=0):8>F||(J(255&L),L>>>=8,F-=8)}function ee(t,n){let s,i,o;if(e.Ne[W]=t,e.Oe[W]=255&n,W++,0===t?E[2*n]++:(j++,t--,E[2*(Ue.ge[n]+256+1)]++,M[2*Ue.Se(t)]++),0==(8191&W)&&V>2){for(s=8*W,i=C-k,o=0;30>o;o++)s+=M[2*o]*(5+Ue.Ce[o]);if(s>>>=3,j<r.floor(W/2)&&s<r.floor(i/2))return!0}return W==T-1}function te(t,n){let r,s,i,o,c=0;if(0!==W)do{r=e.Ne[c],s=e.Oe[c],c++,0===r?Y(s,t):(i=Ue.ge[s],Y(i+256+1,t),o=Ue.ze[i],0!==o&&(s-=Ue.ke[i],X(s,o)),r--,i=Ue.Se(r),Y(i,n),o=Ue.Ce[i],0!==o&&(r-=Ue.ve[i],X(r,o)))}while(W>c);Y(256,t),H=t[513]}function ne(){F>8?Q(L):F>0&&J(255&L),L=0,F=0}function re(t,n,r){X(0+(r?1:0),3),((t,n)=>{ne(),H=8,Q(n),Q(~n),e.Ke.set(u.subarray(t,t+n),e.pending),e.pending+=n})(t,n)}function se(n){((t,n,r)=>{let s,i,o=0;V>0?(K.ne(e),N.ne(e),o=(()=>{let t;for(G(E,K.he),G(M,N.he),O.ne(e),t=18;t>=3&&0===U[2*Ue._e[t]+1];t--);return e.ue+=14+3*(t+1),t})(),s=e.ue+3+7>>>3,i=e.we+3+7>>>3,i>s||(s=i)):s=i=n+5,n+4>s||-1==t?i==s?(X(2+(r?1:0),3),te(Ke.Ae,Ke.Be)):(X(4+(r?1:0),3),((e,t,n)=>{let r;for(X(e-257,5),X(t-1,5),X(n-4,4),r=0;n>r;r++)X(U[2*Ue._e[r]+1],3);Z(E,e-1),Z(M,t-1)})(K.he+1,N.he+1,o+1),te(E,M)):re(t,n,r),q(),r&&ne()})(0>k?-1:k,C-k,n),k=C,t.Te()}function ie(){let e,n,r,s;do{if(s=w-_-C,0===s&&0===C&&0===_)s=f;else if(-1==s)s--;else if(C>=f+f-Fe){u.set(u.subarray(f,f+f),0),x-=f,C-=f,k-=f,e=y,r=e;do{n=65535&d[--r],d[r]=f>n?0:n-f}while(0!=--e);e=f,r=e;do{n=65535&h[--r],h[r]=f>n?0:n-f}while(0!=--e);s+=f}if(0===t.We)return;e=t.je(u,C+_,s),_+=e,3>_||(p=255&u[C],p=(p<<g^255&u[C+1])&b)}while(Fe>_&&0!==t.We)}function oe(e){let t,n,r=I,s=C,i=A;const o=C>f-Fe?C-(f-Fe):0;let c=B;const a=l,w=C+258;let d=u[s+i-1],p=u[s+i];R>A||(r>>=2),c>_&&(c=_);do{if(t=e,u[t+i]==p&&u[t+i-1]==d&&u[t]==u[s]&&u[++t]==u[s+1]){s+=2,t++;do{}while(u[++s]==u[++t]&&u[++s]==u[++t]&&u[++s]==u[++t]&&u[++s]==u[++t]&&u[++s]==u[++t]&&u[++s]==u[++t]&&u[++s]==u[++t]&&u[++s]==u[++t]&&w>s);if(n=258-(w-s),s=w-258,n>i){if(x=e,i=n,n>=c)break;d=u[s+i-1],p=u[s+i]}}}while((e=65535&h[e&a])>o&&0!=--r);return i>_?_:i}e.le=[],e.be=[],e.ae=[],E=[],M=[],U=[],e.de=(t,n)=>{const r=e.ae,s=r[n];let i=n<<1;for(;i<=e.ce&&(i<e.ce&&qe(t,r[i+1],r[i],e.le)&&i++,!qe(t,s,r[i],e.le));)r[n]=r[i],n=i,i<<=1;r[n]=s},e.He=(t,S,x,W,j,G)=>(W||(W=8),j||(j=8),G||(G=0),t.Le=null,-1==S&&(S=6),1>j||j>9||8!=W||9>x||x>15||0>S||S>9||0>G||G>2?Re:(t.Fe=e,a=x,f=1<<a,l=f-1,m=j+7,y=1<<m,b=y-1,g=r.floor((m+3-1)/3),u=new i(2*f),h=[],d=[],T=1<<j+6,e.Ke=new i(4*T),s=4*T,e.Ne=new o(T),e.Oe=new i(T),V=S,P=G,(t=>(t.qe=t.Ge=0,t.Le=null,e.pending=0,e.Je=0,n=He,c=0,K.re=E,K.ie=Ke.Ee,N.re=M,N.ie=Ke.Me,O.re=U,O.ie=Ke.Ue,L=0,F=0,H=8,q(),(()=>{w=2*f,d[y-1]=0;for(let e=0;y-1>e;e++)d[e]=0;D=We[V].De,R=We[V].Ie,B=We[V].Ve,I=We[V].Pe,C=0,k=0,_=0,v=A=2,z=0,p=0})(),0))(t))),e.Qe=()=>42!=n&&n!=He&&n!=Le?Re:(e.Oe=null,e.Ne=null,e.Ke=null,d=null,h=null,u=null,e.Fe=null,n==He?-3:0),e.Xe=(e,t,n)=>{let r=0;return-1==t&&(t=6),0>t||t>9||0>n||n>2?Re:(We[V].Re!=We[t].Re&&0!==e.qe&&(r=e.Ye(1)),V!=t&&(V=t,D=We[V].De,R=We[V].Ie,B=We[V].Ve,I=We[V].Pe),P=n,r)},e.Ze=(e,t,r)=>{let s,i=r,o=0;if(!t||42!=n)return Re;if(3>i)return 0;for(i>f-Fe&&(i=f-Fe,o=r-i),u.set(t.subarray(o,o+i),0),C=i,k=i,p=255&u[0],p=(p<<g^255&u[1])&b,s=0;i-3>=s;s++)p=(p<<g^255&u[s+2])&b,h[s&l]=d[p],d[p]=s;return 0},e.Ye=(r,i)=>{let o,w,m,I,R;if(i>4||0>i)return Re;if(!r.$e||!r.et&&0!==r.We||n==Le&&4!=i)return r.Le=je[4],Re;if(0===r.tt)return r.Le=je[7],-5;var B;if(t=r,I=c,c=i,42==n&&(w=8+(a-8<<4)<<8,m=(V-1&255)>>1,m>3&&(m=3),w|=m<<6,0!==C&&(w|=32),w+=31-w%31,n=He,J((B=w)>>8&255),J(255&B)),0!==e.pending){if(t.Te(),0===t.tt)return c=-1,0}else if(0===t.We&&I>=i&&4!=i)return t.Le=je[7],-5;if(n==Le&&0!==t.We)return r.Le=je[7],-5;if(0!==t.We||0!==_||0!=i&&n!=Le){switch(R=-1,We[V].Re){case 0:R=(e=>{let n,r=65535;for(r>s-5&&(r=s-5);;){if(1>=_){if(ie(),0===_&&0==e)return 0;if(0===_)break}if(C+=_,_=0,n=k+r,(0===C||C>=n)&&(_=C-n,C=n,se(!1),0===t.tt))return 0;if(C-k>=f-Fe&&(se(!1),0===t.tt))return 0}return se(4==e),0===t.tt?4==e?2:0:4==e?3:1})(i);break;case 1:R=(e=>{let n,r=0;for(;;){if(Fe>_){if(ie(),Fe>_&&0==e)return 0;if(0===_)break}if(3>_||(p=(p<<g^255&u[C+2])&b,r=65535&d[p],h[C&l]=d[p],d[p]=C),0===r||(C-r&65535)>f-Fe||2!=P&&(v=oe(r)),3>v)n=ee(0,255&u[C]),_--,C++;else if(n=ee(C-x,v-3),_-=v,v>D||3>_)C+=v,v=0,p=255&u[C],p=(p<<g^255&u[C+1])&b;else{v--;do{C++,p=(p<<g^255&u[C+2])&b,r=65535&d[p],h[C&l]=d[p],d[p]=C}while(0!=--v);C++}if(n&&(se(!1),0===t.tt))return 0}return se(4==e),0===t.tt?4==e?2:0:4==e?3:1})(i);break;case 2:R=(e=>{let n,r,s=0;for(;;){if(Fe>_){if(ie(),Fe>_&&0==e)return 0;if(0===_)break}if(3>_||(p=(p<<g^255&u[C+2])&b,s=65535&d[p],h[C&l]=d[p],d[p]=C),A=v,S=x,v=2,0!==s&&D>A&&f-Fe>=(C-s&65535)&&(2!=P&&(v=oe(s)),5>=v&&(1==P||3==v&&C-x>4096)&&(v=2)),3>A||v>A)if(0!==z){if(n=ee(0,255&u[C-1]),n&&se(!1),C++,_--,0===t.tt)return 0}else z=1,C++,_--;else{r=C+_-3,n=ee(C-1-S,A-3),_-=A-1,A-=2;do{++C>r||(p=(p<<g^255&u[C+2])&b,s=65535&d[p],h[C&l]=d[p],d[p]=C)}while(0!=--A);if(z=0,v=2,C++,n&&(se(!1),0===t.tt))return 0}}return 0!==z&&(n=ee(0,255&u[C-1]),z=0),se(4==e),0===t.tt?4==e?2:0:4==e?3:1})(i)}if(2!=R&&3!=R||(n=Le),0==R||2==R)return 0===t.tt&&(c=-1),0;if(1==R){if(1==i)X(2,3),Y(256,Ke.Ae),$(),9>1+H+10-F&&(X(2,3),Y(256,Ke.Ae),$()),H=7;else if(re(0,0,!1),3==i)for(o=0;y>o;o++)d[o]=0;if(t.Te(),0===t.tt)return c=-1,0}}return 4!=i?0:1}}function Je(){const e=this;e.nt=0,e.rt=0,e.We=0,e.qe=0,e.tt=0,e.Ge=0}function Qe(e){const t=new Je,n=(o=e&&e.chunkSize?e.chunkSize:65536)+5*(r.floor(o/16383)+1);var o;const c=new i(n);let f=e?e.level:-1;void 0===f&&(f=-1),t.He(f),t.$e=c,this.append=(e,r)=>{let o,f,a=0,l=0,u=0;const w=[];if(e.length){t.nt=0,t.et=e,t.We=e.length;do{if(t.rt=0,t.tt=n,o=t.Ye(0),0!=o)throw new s("deflating: "+t.Le);t.rt&&(t.rt==n?w.push(new i(c)):w.push(c.subarray(0,t.rt))),u+=t.rt,r&&t.nt>0&&t.nt!=a&&(r(t.nt),a=t.nt)}while(t.We>0||0===t.tt);return w.length>1?(f=new i(u),w.forEach((e=>{f.set(e,l),l+=e.length}))):f=w[0]?new i(w[0]):new i,f}},this.flush=()=>{let e,r,o=0,f=0;const a=[];do{if(t.rt=0,t.tt=n,e=t.Ye(4),1!=e&&0!=e)throw new s("deflating: "+t.Le);n-t.tt>0&&a.push(c.slice(0,t.rt)),f+=t.rt}while(t.We>0||0===t.tt);return t.Qe(),r=new i(f),a.forEach((e=>{r.set(e,o),o+=e.length})),r}}Je.prototype={He(e,t){const n=this;return n.Fe=new Ge,t||(t=15),n.Fe.He(n,e,t)},Ye(e){const t=this;return t.Fe?t.Fe.Ye(t,e):Re},Qe(){const e=this;if(!e.Fe)return Re;const t=e.Fe.Qe();return e.Fe=null,t},Xe(e,t){const n=this;return n.Fe?n.Fe.Xe(n,e,t):Re},Ze(e,t){const n=this;return n.Fe?n.Fe.Ze(n,e,t):Re},je(e,t,n){const r=this;let s=r.We;return s>n&&(s=n),0===s?0:(r.We-=s,e.set(r.et.subarray(r.nt,r.nt+s),t),r.nt+=s,r.qe+=s,s)},Te(){const e=this;let t=e.Fe.pending;t>e.tt&&(t=e.tt),0!==t&&(e.$e.set(e.Fe.Ke.subarray(e.Fe.Je,e.Fe.Je+t),e.rt),e.rt+=t,e.Fe.Je+=t,e.Ge+=t,e.tt-=t,e.Fe.pending-=t,0===e.Fe.pending&&(e.Fe.Je=0))}};const Xe=-2,Ye=-3,Ze=-5,$e=[0,1,3,7,15,31,63,127,255,511,1023,2047,4095,8191,16383,32767,65535],et=[96,7,256,0,8,80,0,8,16,84,8,115,82,7,31,0,8,112,0,8,48,0,9,192,80,7,10,0,8,96,0,8,32,0,9,160,0,8,0,0,8,128,0,8,64,0,9,224,80,7,6,0,8,88,0,8,24,0,9,144,83,7,59,0,8,120,0,8,56,0,9,208,81,7,17,0,8,104,0,8,40,0,9,176,0,8,8,0,8,136,0,8,72,0,9,240,80,7,4,0,8,84,0,8,20,85,8,227,83,7,43,0,8,116,0,8,52,0,9,200,81,7,13,0,8,100,0,8,36,0,9,168,0,8,4,0,8,132,0,8,68,0,9,232,80,7,8,0,8,92,0,8,28,0,9,152,84,7,83,0,8,124,0,8,60,0,9,216,82,7,23,0,8,108,0,8,44,0,9,184,0,8,12,0,8,140,0,8,76,0,9,248,80,7,3,0,8,82,0,8,18,85,8,163,83,7,35,0,8,114,0,8,50,0,9,196,81,7,11,0,8,98,0,8,34,0,9,164,0,8,2,0,8,130,0,8,66,0,9,228,80,7,7,0,8,90,0,8,26,0,9,148,84,7,67,0,8,122,0,8,58,0,9,212,82,7,19,0,8,106,0,8,42,0,9,180,0,8,10,0,8,138,0,8,74,0,9,244,80,7,5,0,8,86,0,8,22,192,8,0,83,7,51,0,8,118,0,8,54,0,9,204,81,7,15,0,8,102,0,8,38,0,9,172,0,8,6,0,8,134,0,8,70,0,9,236,80,7,9,0,8,94,0,8,30,0,9,156,84,7,99,0,8,126,0,8,62,0,9,220,82,7,27,0,8,110,0,8,46,0,9,188,0,8,14,0,8,142,0,8,78,0,9,252,96,7,256,0,8,81,0,8,17,85,8,131,82,7,31,0,8,113,0,8,49,0,9,194,80,7,10,0,8,97,0,8,33,0,9,162,0,8,1,0,8,129,0,8,65,0,9,226,80,7,6,0,8,89,0,8,25,0,9,146,83,7,59,0,8,121,0,8,57,0,9,210,81,7,17,0,8,105,0,8,41,0,9,178,0,8,9,0,8,137,0,8,73,0,9,242,80,7,4,0,8,85,0,8,21,80,8,258,83,7,43,0,8,117,0,8,53,0,9,202,81,7,13,0,8,101,0,8,37,0,9,170,0,8,5,0,8,133,0,8,69,0,9,234,80,7,8,0,8,93,0,8,29,0,9,154,84,7,83,0,8,125,0,8,61,0,9,218,82,7,23,0,8,109,0,8,45,0,9,186,0,8,13,0,8,141,0,8,77,0,9,250,80,7,3,0,8,83,0,8,19,85,8,195,83,7,35,0,8,115,0,8,51,0,9,198,81,7,11,0,8,99,0,8,35,0,9,166,0,8,3,0,8,131,0,8,67,0,9,230,80,7,7,0,8,91,0,8,27,0,9,150,84,7,67,0,8,123,0,8,59,0,9,214,82,7,19,0,8,107,0,8,43,0,9,182,0,8,11,0,8,139,0,8,75,0,9,246,80,7,5,0,8,87,0,8,23,192,8,0,83,7,51,0,8,119,0,8,55,0,9,206,81,7,15,0,8,103,0,8,39,0,9,174,0,8,7,0,8,135,0,8,71,0,9,238,80,7,9,0,8,95,0,8,31,0,9,158,84,7,99,0,8,127,0,8,63,0,9,222,82,7,27,0,8,111,0,8,47,0,9,190,0,8,15,0,8,143,0,8,79,0,9,254,96,7,256,0,8,80,0,8,16,84,8,115,82,7,31,0,8,112,0,8,48,0,9,193,80,7,10,0,8,96,0,8,32,0,9,161,0,8,0,0,8,128,0,8,64,0,9,225,80,7,6,0,8,88,0,8,24,0,9,145,83,7,59,0,8,120,0,8,56,0,9,209,81,7,17,0,8,104,0,8,40,0,9,177,0,8,8,0,8,136,0,8,72,0,9,241,80,7,4,0,8,84,0,8,20,85,8,227,83,7,43,0,8,116,0,8,52,0,9,201,81,7,13,0,8,100,0,8,36,0,9,169,0,8,4,0,8,132,0,8,68,0,9,233,80,7,8,0,8,92,0,8,28,0,9,153,84,7,83,0,8,124,0,8,60,0,9,217,82,7,23,0,8,108,0,8,44,0,9,185,0,8,12,0,8,140,0,8,76,0,9,249,80,7,3,0,8,82,0,8,18,85,8,163,83,7,35,0,8,114,0,8,50,0,9,197,81,7,11,0,8,98,0,8,34,0,9,165,0,8,2,0,8,130,0,8,66,0,9,229,80,7,7,0,8,90,0,8,26,0,9,149,84,7,67,0,8,122,0,8,58,0,9,213,82,7,19,0,8,106,0,8,42,0,9,181,0,8,10,0,8,138,0,8,74,0,9,245,80,7,5,0,8,86,0,8,22,192,8,0,83,7,51,0,8,118,0,8,54,0,9,205,81,7,15,0,8,102,0,8,38,0,9,173,0,8,6,0,8,134,0,8,70,0,9,237,80,7,9,0,8,94,0,8,30,0,9,157,84,7,99,0,8,126,0,8,62,0,9,221,82,7,27,0,8,110,0,8,46,0,9,189,0,8,14,0,8,142,0,8,78,0,9,253,96,7,256,0,8,81,0,8,17,85,8,131,82,7,31,0,8,113,0,8,49,0,9,195,80,7,10,0,8,97,0,8,33,0,9,163,0,8,1,0,8,129,0,8,65,0,9,227,80,7,6,0,8,89,0,8,25,0,9,147,83,7,59,0,8,121,0,8,57,0,9,211,81,7,17,0,8,105,0,8,41,0,9,179,0,8,9,0,8,137,0,8,73,0,9,243,80,7,4,0,8,85,0,8,21,80,8,258,83,7,43,0,8,117,0,8,53,0,9,203,81,7,13,0,8,101,0,8,37,0,9,171,0,8,5,0,8,133,0,8,69,0,9,235,80,7,8,0,8,93,0,8,29,0,9,155,84,7,83,0,8,125,0,8,61,0,9,219,82,7,23,0,8,109,0,8,45,0,9,187,0,8,13,0,8,141,0,8,77,0,9,251,80,7,3,0,8,83,0,8,19,85,8,195,83,7,35,0,8,115,0,8,51,0,9,199,81,7,11,0,8,99,0,8,35,0,9,167,0,8,3,0,8,131,0,8,67,0,9,231,80,7,7,0,8,91,0,8,27,0,9,151,84,7,67,0,8,123,0,8,59,0,9,215,82,7,19,0,8,107,0,8,43,0,9,183,0,8,11,0,8,139,0,8,75,0,9,247,80,7,5,0,8,87,0,8,23,192,8,0,83,7,51,0,8,119,0,8,55,0,9,207,81,7,15,0,8,103,0,8,39,0,9,175,0,8,7,0,8,135,0,8,71,0,9,239,80,7,9,0,8,95,0,8,31,0,9,159,84,7,99,0,8,127,0,8,63,0,9,223,82,7,27,0,8,111,0,8,47,0,9,191,0,8,15,0,8,143,0,8,79,0,9,255],tt=[80,5,1,87,5,257,83,5,17,91,5,4097,81,5,5,89,5,1025,85,5,65,93,5,16385,80,5,3,88,5,513,84,5,33,92,5,8193,82,5,9,90,5,2049,86,5,129,192,5,24577,80,5,2,87,5,385,83,5,25,91,5,6145,81,5,7,89,5,1537,85,5,97,93,5,24577,80,5,4,88,5,769,84,5,49,92,5,12289,82,5,13,90,5,3073,86,5,193,192,5,24577],nt=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],rt=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,112,112],st=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],it=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];function ot(){let e,t,n,r,s,i;function o(e,t,o,c,f,a,l,u,w,h,d){let p,y,m,b,g,k,v,S,z,C,x,_,A,I,D;C=0,g=o;do{n[e[t+C]]++,C++,g--}while(0!==g);if(n[0]==o)return l[0]=-1,u[0]=0,0;for(S=u[0],k=1;15>=k&&0===n[k];k++);for(v=k,k>S&&(S=k),g=15;0!==g&&0===n[g];g--);for(m=g,S>g&&(S=g),u[0]=S,I=1<<k;g>k;k++,I<<=1)if(0>(I-=n[k]))return Ye;if(0>(I-=n[g]))return Ye;for(n[g]+=I,i[1]=k=0,C=1,A=2;0!=--g;)i[A]=k+=n[C],A++,C++;g=0,C=0;do{0!==(k=e[t+C])&&(d[i[k]++]=g),C++}while(++g<o);for(o=i[m],i[0]=g=0,C=0,b=-1,_=-S,s[0]=0,x=0,D=0;m>=v;v++)for(p=n[v];0!=p--;){for(;v>_+S;){if(b++,_+=S,D=m-_,D=D>S?S:D,(y=1<<(k=v-_))>p+1&&(y-=p+1,A=v,D>k))for(;++k<D&&(y<<=1)>n[++A];)y-=n[A];if(D=1<<k,h[0]+D>1440)return Ye;s[b]=x=h[0],h[0]+=D,0!==b?(i[b]=g,r[0]=k,r[1]=S,k=g>>>_-S,r[2]=x-s[b-1]-k,w.set(r,3*(s[b-1]+k))):l[0]=x}for(r[1]=v-_,o>C?d[C]<c?(r[0]=256>d[C]?0:96,r[2]=d[C++]):(r[0]=a[d[C]-c]+16+64,r[2]=f[d[C++]-c]):r[0]=192,y=1<<v-_,k=g>>>_;D>k;k+=y)w.set(r,3*(x+k));for(k=1<<v-1;0!=(g&k);k>>>=1)g^=k;for(g^=k,z=(1<<_)-1;(g&z)!=i[b];)b--,_-=S,z=(1<<_)-1}return 0!==I&&1!=m?Ze:0}function c(o){let c;for(e||(e=[],t=[],n=new f(16),r=[],s=new f(15),i=new f(16)),t.length<o&&(t=[]),c=0;o>c;c++)t[c]=0;for(c=0;16>c;c++)n[c]=0;for(c=0;3>c;c++)r[c]=0;s.set(n.subarray(0,15),0),i.set(n.subarray(0,16),0)}this.st=(n,r,s,i,f)=>{let a;return c(19),e[0]=0,a=o(n,0,19,19,null,null,s,r,i,e,t),a==Ye?f.Le="oversubscribed dynamic bit lengths tree":a!=Ze&&0!==r[0]||(f.Le="incomplete dynamic bit lengths tree",a=Ye),a},this.it=(n,r,s,i,f,a,l,u,w)=>{let h;return c(288),e[0]=0,h=o(s,0,n,257,nt,rt,a,i,u,e,t),0!=h||0===i[0]?(h==Ye?w.Le="oversubscribed literal/length tree":-4!=h&&(w.Le="incomplete literal/length tree",h=Ye),h):(c(288),h=o(s,n,r,0,st,it,l,f,u,e,t),0!=h||0===f[0]&&n>257?(h==Ye?w.Le="oversubscribed distance tree":h==Ze?(w.Le="incomplete distance tree",h=Ye):-4!=h&&(w.Le="empty distance tree with lengths",h=Ye),h):0)}}function ct(){const e=this;let t,n,r,s,i=0,o=0,c=0,f=0,a=0,l=0,u=0,w=0,h=0,d=0;function p(e,t,n,r,s,i,o,c){let f,a,l,u,w,h,d,p,y,m,b,g,k,v,S,z;d=c.nt,p=c.We,w=o.ot,h=o.ct,y=o.write,m=y<o.read?o.read-y-1:o.end-y,b=$e[e],g=$e[t];do{for(;20>h;)p--,w|=(255&c.ft(d++))<<h,h+=8;if(f=w&b,a=n,l=r,z=3*(l+f),0!==(u=a[z]))for(;;){if(w>>=a[z+1],h-=a[z+1],0!=(16&u)){for(u&=15,k=a[z+2]+(w&$e[u]),w>>=u,h-=u;15>h;)p--,w|=(255&c.ft(d++))<<h,h+=8;for(f=w&g,a=s,l=i,z=3*(l+f),u=a[z];;){if(w>>=a[z+1],h-=a[z+1],0!=(16&u)){for(u&=15;u>h;)p--,w|=(255&c.ft(d++))<<h,h+=8;if(v=a[z+2]+(w&$e[u]),w>>=u,h-=u,m-=k,v>y){S=y-v;do{S+=o.end}while(0>S);if(u=o.end-S,k>u){if(k-=u,y-S>0&&u>y-S)do{o.lt[y++]=o.lt[S++]}while(0!=--u);else o.lt.set(o.lt.subarray(S,S+u),y),y+=u,S+=u,u=0;S=0}}else S=y-v,y-S>0&&2>y-S?(o.lt[y++]=o.lt[S++],o.lt[y++]=o.lt[S++],k-=2):(o.lt.set(o.lt.subarray(S,S+2),y),y+=2,S+=2,k-=2);if(y-S>0&&k>y-S)do{o.lt[y++]=o.lt[S++]}while(0!=--k);else o.lt.set(o.lt.subarray(S,S+k),y),y+=k,S+=k,k=0;break}if(0!=(64&u))return c.Le="invalid distance code",k=c.We-p,k=k>h>>3?h>>3:k,p+=k,d-=k,h-=k<<3,o.ot=w,o.ct=h,c.We=p,c.qe+=d-c.nt,c.nt=d,o.write=y,Ye;f+=a[z+2],f+=w&$e[u],z=3*(l+f),u=a[z]}break}if(0!=(64&u))return 0!=(32&u)?(k=c.We-p,k=k>h>>3?h>>3:k,p+=k,d-=k,h-=k<<3,o.ot=w,o.ct=h,c.We=p,c.qe+=d-c.nt,c.nt=d,o.write=y,1):(c.Le="invalid literal/length code",k=c.We-p,k=k>h>>3?h>>3:k,p+=k,d-=k,h-=k<<3,o.ot=w,o.ct=h,c.We=p,c.qe+=d-c.nt,c.nt=d,o.write=y,Ye);if(f+=a[z+2],f+=w&$e[u],z=3*(l+f),0===(u=a[z])){w>>=a[z+1],h-=a[z+1],o.lt[y++]=a[z+2],m--;break}}else w>>=a[z+1],h-=a[z+1],o.lt[y++]=a[z+2],m--}while(m>=258&&p>=10);return k=c.We-p,k=k>h>>3?h>>3:k,p+=k,d-=k,h-=k<<3,o.ot=w,o.ct=h,c.We=p,c.qe+=d-c.nt,c.nt=d,o.write=y,0}e.init=(e,i,o,c,f,a)=>{t=0,u=e,w=i,r=o,h=c,s=f,d=a,n=null},e.ut=(e,y,m)=>{let b,g,k,v,S,z,C,x=0,_=0,A=0;for(A=y.nt,v=y.We,x=e.ot,_=e.ct,S=e.write,z=S<e.read?e.read-S-1:e.end-S;;)switch(t){case 0:if(z>=258&&v>=10&&(e.ot=x,e.ct=_,y.We=v,y.qe+=A-y.nt,y.nt=A,e.write=S,m=p(u,w,r,h,s,d,e,y),A=y.nt,v=y.We,x=e.ot,_=e.ct,S=e.write,z=S<e.read?e.read-S-1:e.end-S,0!=m)){t=1==m?7:9;break}c=u,n=r,o=h,t=1;case 1:for(b=c;b>_;){if(0===v)return e.ot=x,e.ct=_,y.We=v,y.qe+=A-y.nt,y.nt=A,e.write=S,e.wt(y,m);m=0,v--,x|=(255&y.ft(A++))<<_,_+=8}if(g=3*(o+(x&$e[b])),x>>>=n[g+1],_-=n[g+1],k=n[g],0===k){f=n[g+2],t=6;break}if(0!=(16&k)){a=15&k,i=n[g+2],t=2;break}if(0==(64&k)){c=k,o=g/3+n[g+2];break}if(0!=(32&k)){t=7;break}return t=9,y.Le="invalid literal/length code",m=Ye,e.ot=x,e.ct=_,y.We=v,y.qe+=A-y.nt,y.nt=A,e.write=S,e.wt(y,m);case 2:for(b=a;b>_;){if(0===v)return e.ot=x,e.ct=_,y.We=v,y.qe+=A-y.nt,y.nt=A,e.write=S,e.wt(y,m);m=0,v--,x|=(255&y.ft(A++))<<_,_+=8}i+=x&$e[b],x>>=b,_-=b,c=w,n=s,o=d,t=3;case 3:for(b=c;b>_;){if(0===v)return e.ot=x,e.ct=_,y.We=v,y.qe+=A-y.nt,y.nt=A,e.write=S,e.wt(y,m);m=0,v--,x|=(255&y.ft(A++))<<_,_+=8}if(g=3*(o+(x&$e[b])),x>>=n[g+1],_-=n[g+1],k=n[g],0!=(16&k)){a=15&k,l=n[g+2],t=4;break}if(0==(64&k)){c=k,o=g/3+n[g+2];break}return t=9,y.Le="invalid distance code",m=Ye,e.ot=x,e.ct=_,y.We=v,y.qe+=A-y.nt,y.nt=A,e.write=S,e.wt(y,m);case 4:for(b=a;b>_;){if(0===v)return e.ot=x,e.ct=_,y.We=v,y.qe+=A-y.nt,y.nt=A,e.write=S,e.wt(y,m);m=0,v--,x|=(255&y.ft(A++))<<_,_+=8}l+=x&$e[b],x>>=b,_-=b,t=5;case 5:for(C=S-l;0>C;)C+=e.end;for(;0!==i;){if(0===z&&(S==e.end&&0!==e.read&&(S=0,z=S<e.read?e.read-S-1:e.end-S),0===z&&(e.write=S,m=e.wt(y,m),S=e.write,z=S<e.read?e.read-S-1:e.end-S,S==e.end&&0!==e.read&&(S=0,z=S<e.read?e.read-S-1:e.end-S),0===z)))return e.ot=x,e.ct=_,y.We=v,y.qe+=A-y.nt,y.nt=A,e.write=S,e.wt(y,m);e.lt[S++]=e.lt[C++],z--,C==e.end&&(C=0),i--}t=0;break;case 6:if(0===z&&(S==e.end&&0!==e.read&&(S=0,z=S<e.read?e.read-S-1:e.end-S),0===z&&(e.write=S,m=e.wt(y,m),S=e.write,z=S<e.read?e.read-S-1:e.end-S,S==e.end&&0!==e.read&&(S=0,z=S<e.read?e.read-S-1:e.end-S),0===z)))return e.ot=x,e.ct=_,y.We=v,y.qe+=A-y.nt,y.nt=A,e.write=S,e.wt(y,m);m=0,e.lt[S++]=f,z--,t=0;break;case 7:if(_>7&&(_-=8,v++,A--),e.write=S,m=e.wt(y,m),S=e.write,z=S<e.read?e.read-S-1:e.end-S,e.read!=e.write)return e.ot=x,e.ct=_,y.We=v,y.qe+=A-y.nt,y.nt=A,e.write=S,e.wt(y,m);t=8;case 8:return m=1,e.ot=x,e.ct=_,y.We=v,y.qe+=A-y.nt,y.nt=A,e.write=S,e.wt(y,m);case 9:return m=Ye,e.ot=x,e.ct=_,y.We=v,y.qe+=A-y.nt,y.nt=A,e.write=S,e.wt(y,m);default:return m=Xe,e.ot=x,e.ct=_,y.We=v,y.qe+=A-y.nt,y.nt=A,e.write=S,e.wt(y,m)}},e.ht=()=>{}}ot.dt=(e,t,n,r)=>(e[0]=9,t[0]=5,n[0]=et,r[0]=tt,0);const ft=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];function at(e,t){const n=this;let r,s=0,o=0,c=0,a=0;const l=[0],u=[0],w=new ct;let h=0,d=new f(4320);const p=new ot;n.ct=0,n.ot=0,n.lt=new i(t),n.end=t,n.read=0,n.write=0,n.reset=(e,t)=>{t&&(t[0]=0),6==s&&w.ht(e),s=0,n.ct=0,n.ot=0,n.read=n.write=0},n.reset(e,null),n.wt=(e,t)=>{let r,s,i;return s=e.rt,i=n.read,r=(i>n.write?n.end:n.write)-i,r>e.tt&&(r=e.tt),0!==r&&t==Ze&&(t=0),e.tt-=r,e.Ge+=r,e.$e.set(n.lt.subarray(i,i+r),s),s+=r,i+=r,i==n.end&&(i=0,n.write==n.end&&(n.write=0),r=n.write-i,r>e.tt&&(r=e.tt),0!==r&&t==Ze&&(t=0),e.tt-=r,e.Ge+=r,e.$e.set(n.lt.subarray(i,i+r),s),s+=r,i+=r),e.rt=s,n.read=i,t},n.ut=(e,t)=>{let i,f,y,m,b,g,k,v;for(m=e.nt,b=e.We,f=n.ot,y=n.ct,g=n.write,k=g<n.read?n.read-g-1:n.end-g;;){let S,z,C,x,_,A,I,D;switch(s){case 0:for(;3>y;){if(0===b)return n.ot=f,n.ct=y,e.We=b,e.qe+=m-e.nt,e.nt=m,n.write=g,n.wt(e,t);t=0,b--,f|=(255&e.ft(m++))<<y,y+=8}switch(i=7&f,h=1&i,i>>>1){case 0:f>>>=3,y-=3,i=7&y,f>>>=i,y-=i,s=1;break;case 1:S=[],z=[],C=[[]],x=[[]],ot.dt(S,z,C,x),w.init(S[0],z[0],C[0],0,x[0],0),f>>>=3,y-=3,s=6;break;case 2:f>>>=3,y-=3,s=3;break;case 3:return f>>>=3,y-=3,s=9,e.Le="invalid block type",t=Ye,n.ot=f,n.ct=y,e.We=b,e.qe+=m-e.nt,e.nt=m,n.write=g,n.wt(e,t)}break;case 1:for(;32>y;){if(0===b)return n.ot=f,n.ct=y,e.We=b,e.qe+=m-e.nt,e.nt=m,n.write=g,n.wt(e,t);t=0,b--,f|=(255&e.ft(m++))<<y,y+=8}if((~f>>>16&65535)!=(65535&f))return s=9,e.Le="invalid stored block lengths",t=Ye,n.ot=f,n.ct=y,e.We=b,e.qe+=m-e.nt,e.nt=m,n.write=g,n.wt(e,t);o=65535&f,f=y=0,s=0!==o?2:0!==h?7:0;break;case 2:if(0===b)return n.ot=f,n.ct=y,e.We=b,e.qe+=m-e.nt,e.nt=m,n.write=g,n.wt(e,t);if(0===k&&(g==n.end&&0!==n.read&&(g=0,k=g<n.read?n.read-g-1:n.end-g),0===k&&(n.write=g,t=n.wt(e,t),g=n.write,k=g<n.read?n.read-g-1:n.end-g,g==n.end&&0!==n.read&&(g=0,k=g<n.read?n.read-g-1:n.end-g),0===k)))return n.ot=f,n.ct=y,e.We=b,e.qe+=m-e.nt,e.nt=m,n.write=g,n.wt(e,t);if(t=0,i=o,i>b&&(i=b),i>k&&(i=k),n.lt.set(e.je(m,i),g),m+=i,b-=i,g+=i,k-=i,0!=(o-=i))break;s=0!==h?7:0;break;case 3:for(;14>y;){if(0===b)return n.ot=f,n.ct=y,e.We=b,e.qe+=m-e.nt,e.nt=m,n.write=g,n.wt(e,t);t=0,b--,f|=(255&e.ft(m++))<<y,y+=8}if(c=i=16383&f,(31&i)>29||(i>>5&31)>29)return s=9,e.Le="too many length or distance symbols",t=Ye,n.ot=f,n.ct=y,e.We=b,e.qe+=m-e.nt,e.nt=m,n.write=g,n.wt(e,t);if(i=258+(31&i)+(i>>5&31),!r||r.length<i)r=[];else for(v=0;i>v;v++)r[v]=0;f>>>=14,y-=14,a=0,s=4;case 4:for(;4+(c>>>10)>a;){for(;3>y;){if(0===b)return n.ot=f,n.ct=y,e.We=b,e.qe+=m-e.nt,e.nt=m,n.write=g,n.wt(e,t);t=0,b--,f|=(255&e.ft(m++))<<y,y+=8}r[ft[a++]]=7&f,f>>>=3,y-=3}for(;19>a;)r[ft[a++]]=0;if(l[0]=7,i=p.st(r,l,u,d,e),0!=i)return(t=i)==Ye&&(r=null,s=9),n.ot=f,n.ct=y,e.We=b,e.qe+=m-e.nt,e.nt=m,n.write=g,n.wt(e,t);a=0,s=5;case 5:for(;i=c,258+(31&i)+(i>>5&31)>a;){let o,w;for(i=l[0];i>y;){if(0===b)return n.ot=f,n.ct=y,e.We=b,e.qe+=m-e.nt,e.nt=m,n.write=g,n.wt(e,t);t=0,b--,f|=(255&e.ft(m++))<<y,y+=8}if(i=d[3*(u[0]+(f&$e[i]))+1],w=d[3*(u[0]+(f&$e[i]))+2],16>w)f>>>=i,y-=i,r[a++]=w;else{for(v=18==w?7:w-14,o=18==w?11:3;i+v>y;){if(0===b)return n.ot=f,n.ct=y,e.We=b,e.qe+=m-e.nt,e.nt=m,n.write=g,n.wt(e,t);t=0,b--,f|=(255&e.ft(m++))<<y,y+=8}if(f>>>=i,y-=i,o+=f&$e[v],f>>>=v,y-=v,v=a,i=c,v+o>258+(31&i)+(i>>5&31)||16==w&&1>v)return r=null,s=9,e.Le="invalid bit length repeat",t=Ye,n.ot=f,n.ct=y,e.We=b,e.qe+=m-e.nt,e.nt=m,n.write=g,n.wt(e,t);w=16==w?r[v-1]:0;do{r[v++]=w}while(0!=--o);a=v}}if(u[0]=-1,_=[],A=[],I=[],D=[],_[0]=9,A[0]=6,i=c,i=p.it(257+(31&i),1+(i>>5&31),r,_,A,I,D,d,e),0!=i)return i==Ye&&(r=null,s=9),t=i,n.ot=f,n.ct=y,e.We=b,e.qe+=m-e.nt,e.nt=m,n.write=g,n.wt(e,t);w.init(_[0],A[0],d,I[0],d,D[0]),s=6;case 6:if(n.ot=f,n.ct=y,e.We=b,e.qe+=m-e.nt,e.nt=m,n.write=g,1!=(t=w.ut(n,e,t)))return n.wt(e,t);if(t=0,w.ht(e),m=e.nt,b=e.We,f=n.ot,y=n.ct,g=n.write,k=g<n.read?n.read-g-1:n.end-g,0===h){s=0;break}s=7;case 7:if(n.write=g,t=n.wt(e,t),g=n.write,k=g<n.read?n.read-g-1:n.end-g,n.read!=n.write)return n.ot=f,n.ct=y,e.We=b,e.qe+=m-e.nt,e.nt=m,n.write=g,n.wt(e,t);s=8;case 8:return t=1,n.ot=f,n.ct=y,e.We=b,e.qe+=m-e.nt,e.nt=m,n.write=g,n.wt(e,t);case 9:return t=Ye,n.ot=f,n.ct=y,e.We=b,e.qe+=m-e.nt,e.nt=m,n.write=g,n.wt(e,t);default:return t=Xe,n.ot=f,n.ct=y,e.We=b,e.qe+=m-e.nt,e.nt=m,n.write=g,n.wt(e,t)}}},n.ht=e=>{n.reset(e,null),n.lt=null,d=null},n.yt=(e,t,r)=>{n.lt.set(e.subarray(t,t+r),0),n.read=n.write=r},n.bt=()=>1==s?1:0}const lt=13,ut=[0,0,255,255];function wt(){const e=this;function t(e){return e&&e.gt?(e.qe=e.Ge=0,e.Le=null,e.gt.mode=7,e.gt.kt.reset(e,null),0):Xe}e.mode=0,e.method=0,e.vt=[0],e.St=0,e.marker=0,e.zt=0,e.Ct=t=>(e.kt&&e.kt.ht(t),e.kt=null,0),e.xt=(n,r)=>(n.Le=null,e.kt=null,8>r||r>15?(e.Ct(n),Xe):(e.zt=r,n.gt.kt=new at(n,1<<r),t(n),0)),e._t=(e,t)=>{let n,r;if(!e||!e.gt||!e.et)return Xe;const s=e.gt;for(t=4==t?Ze:0,n=Ze;;)switch(s.mode){case 0:if(0===e.We)return n;if(n=t,e.We--,e.qe++,8!=(15&(s.method=e.ft(e.nt++)))){s.mode=lt,e.Le="unknown compression method",s.marker=5;break}if(8+(s.method>>4)>s.zt){s.mode=lt,e.Le="invalid win size",s.marker=5;break}s.mode=1;case 1:if(0===e.We)return n;if(n=t,e.We--,e.qe++,r=255&e.ft(e.nt++),((s.method<<8)+r)%31!=0){s.mode=lt,e.Le="incorrect header check",s.marker=5;break}if(0==(32&r)){s.mode=7;break}s.mode=2;case 2:if(0===e.We)return n;n=t,e.We--,e.qe++,s.St=(255&e.ft(e.nt++))<<24&4278190080,s.mode=3;case 3:if(0===e.We)return n;n=t,e.We--,e.qe++,s.St+=(255&e.ft(e.nt++))<<16&16711680,s.mode=4;case 4:if(0===e.We)return n;n=t,e.We--,e.qe++,s.St+=(255&e.ft(e.nt++))<<8&65280,s.mode=5;case 5:return 0===e.We?n:(n=t,e.We--,e.qe++,s.St+=255&e.ft(e.nt++),s.mode=6,2);case 6:return s.mode=lt,e.Le="need dictionary",s.marker=0,Xe;case 7:if(n=s.kt.ut(e,n),n==Ye){s.mode=lt,s.marker=0;break}if(0==n&&(n=t),1!=n)return n;n=t,s.kt.reset(e,s.vt),s.mode=12;case 12:return e.We=0,1;case lt:return Ye;default:return Xe}},e.At=(e,t,n)=>{let r=0,s=n;if(!e||!e.gt||6!=e.gt.mode)return Xe;const i=e.gt;return s<1<<i.zt||(s=(1<<i.zt)-1,r=n-s),i.kt.yt(t,r,s),i.mode=7,0},e.It=e=>{let n,r,s,i,o;if(!e||!e.gt)return Xe;const c=e.gt;if(c.mode!=lt&&(c.mode=lt,c.marker=0),0===(n=e.We))return Ze;for(r=e.nt,s=c.marker;0!==n&&4>s;)e.ft(r)==ut[s]?s++:s=0!==e.ft(r)?0:4-s,r++,n--;return e.qe+=r-e.nt,e.nt=r,e.We=n,c.marker=s,4!=s?Ye:(i=e.qe,o=e.Ge,t(e),e.qe=i,e.Ge=o,c.mode=7,0)},e.Dt=e=>e&&e.gt&&e.gt.kt?e.gt.kt.bt():Xe}function ht(){}function dt(e){const t=new ht,n=e&&e.chunkSize?r.floor(2*e.chunkSize):131072,o=new i(n);let c=!1;t.xt(),t.$e=o,this.append=(e,r)=>{const f=[];let a,l,u=0,w=0,h=0;if(0!==e.length){t.nt=0,t.et=e,t.We=e.length;do{if(t.rt=0,t.tt=n,0!==t.We||c||(t.nt=0,c=!0),a=t._t(0),c&&a===Ze){if(0!==t.We)throw new s("inflating: bad input")}else if(0!==a&&1!==a)throw new s("inflating: "+t.Le);if((c||1===a)&&t.We===e.length)throw new s("inflating: bad input");t.rt&&(t.rt===n?f.push(new i(o)):f.push(o.subarray(0,t.rt))),h+=t.rt,r&&t.nt>0&&t.nt!=u&&(r(t.nt),u=t.nt)}while(t.We>0||0===t.tt);return f.length>1?(l=new i(h),f.forEach((e=>{l.set(e,w),w+=e.length}))):l=f[0]?new i(f[0]):new i,l}},this.flush=()=>{t.Ct()}}ht.prototype={xt(e){const t=this;return t.gt=new wt,e||(e=15),t.gt.xt(t,e)},_t(e){const t=this;return t.gt?t.gt._t(t,e):Xe},Ct(){const e=this;if(!e.gt)return Xe;const t=e.gt.Ct(e);return e.gt=null,t},It(){const e=this;return e.gt?e.gt.It(e):Xe},At(e,t){const n=this;return n.gt?n.gt.At(n,e,t):Xe},ft(e){return this.et[e]},je(e,t){return this.et.subarray(e,e+t)}},self.initCodec=()=>{self.Deflate=Qe,self.Inflate=dt};\n'
  ], {
    type: "text/javascript"
  }));
  e2({
    workerScripts: {
      inflate: [
        t
      ],
      deflate: [
        t
      ]
    }
  });
}
var ERR_ITERATOR_COMPLETED_TOO_SOON = "Writer iterator completed too soon";
var HTTP_HEADER_CONTENT_TYPE = "Content-Type";
var DEFAULT_CHUNK_SIZE = 64 * 1024;
var PROPERTY_NAME_WRITABLE = "writable";
var Stream = class {
  constructor() {
    this.size = 0;
  }
  init() {
    this.initialized = true;
  }
};
var Reader = class extends Stream {
  get readable() {
    const reader = this;
    const { chunkSize = DEFAULT_CHUNK_SIZE } = reader;
    const readable = new ReadableStream({
      start() {
        this.chunkOffset = 0;
      },
      async pull(controller) {
        const { offset = 0, size, diskNumberStart } = readable;
        const { chunkOffset } = this;
        controller.enqueue(await readUint8Array(reader, offset + chunkOffset, Math.min(chunkSize, size - chunkOffset), diskNumberStart));
        if (chunkOffset + chunkSize > size) {
          controller.close();
        } else {
          this.chunkOffset += chunkSize;
        }
      }
    });
    return readable;
  }
};
var BlobReader = class extends Reader {
  constructor(blob) {
    super();
    Object.assign(this, {
      blob,
      size: blob.size
    });
  }
  async readUint8Array(offset, length) {
    const reader = this;
    const offsetEnd = offset + length;
    const blob = offset || offsetEnd < reader.size ? reader.blob.slice(offset, offsetEnd) : reader.blob;
    let arrayBuffer = await blob.arrayBuffer();
    if (arrayBuffer.byteLength > length) {
      arrayBuffer = arrayBuffer.slice(offset, offsetEnd);
    }
    return new Uint8Array(arrayBuffer);
  }
};
var BlobWriter = class extends Stream {
  constructor(contentType) {
    super();
    const writer = this;
    const transformStream = new TransformStream();
    const headers = [];
    if (contentType) {
      headers.push([
        HTTP_HEADER_CONTENT_TYPE,
        contentType
      ]);
    }
    Object.defineProperty(writer, PROPERTY_NAME_WRITABLE, {
      get() {
        return transformStream.writable;
      }
    });
    writer.blob = new Response(transformStream.readable, {
      headers
    }).blob();
  }
  getData() {
    return this.blob;
  }
};
var TextWriter = class extends BlobWriter {
  constructor(encoding) {
    super(encoding);
    Object.assign(this, {
      encoding,
      utf8: !encoding || encoding.toLowerCase() == "utf-8"
    });
  }
  async getData() {
    const { encoding, utf8: utf82 } = this;
    const blob = await super.getData();
    if (blob.text && utf82) {
      return blob.text();
    } else {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        Object.assign(reader, {
          onload: ({ target }) => resolve(target.result),
          onerror: () => reject(reader.error)
        });
        reader.readAsText(blob, encoding);
      });
    }
  }
};
var SplitDataReader = class extends Reader {
  constructor(readers) {
    super();
    this.readers = readers;
  }
  async init() {
    const reader = this;
    const { readers } = reader;
    reader.lastDiskNumber = 0;
    reader.lastDiskOffset = 0;
    await Promise.all(readers.map(async (diskReader, indexDiskReader) => {
      await diskReader.init();
      if (indexDiskReader != readers.length - 1) {
        reader.lastDiskOffset += diskReader.size;
      }
      reader.size += diskReader.size;
    }));
    super.init();
  }
  async readUint8Array(offset, length, diskNumber = 0) {
    const reader = this;
    const { readers } = this;
    let result;
    let currentDiskNumber = diskNumber;
    if (currentDiskNumber == -1) {
      currentDiskNumber = readers.length - 1;
    }
    let currentReaderOffset = offset;
    while (currentReaderOffset >= readers[currentDiskNumber].size) {
      currentReaderOffset -= readers[currentDiskNumber].size;
      currentDiskNumber++;
    }
    const currentReader = readers[currentDiskNumber];
    const currentReaderSize = currentReader.size;
    if (currentReaderOffset + length <= currentReaderSize) {
      result = await readUint8Array(currentReader, currentReaderOffset, length);
    } else {
      const chunkLength = currentReaderSize - currentReaderOffset;
      result = new Uint8Array(length);
      result.set(await readUint8Array(currentReader, currentReaderOffset, chunkLength));
      result.set(await reader.readUint8Array(offset + chunkLength, length - chunkLength, diskNumber), chunkLength);
    }
    reader.lastDiskNumber = Math.max(currentDiskNumber, reader.lastDiskNumber);
    return result;
  }
};
var SplitDataWriter = class extends Stream {
  constructor(writerGenerator, maxSize = 4294967295) {
    super();
    const zipWriter = this;
    Object.assign(zipWriter, {
      diskNumber: 0,
      diskOffset: 0,
      size: 0,
      maxSize,
      availableSize: maxSize
    });
    let diskSourceWriter, diskWritable, diskWriter;
    const writable = new WritableStream({
      async write(chunk) {
        const { availableSize } = zipWriter;
        if (!diskWriter) {
          const { value, done } = await writerGenerator.next();
          if (done && !value) {
            throw new Error(ERR_ITERATOR_COMPLETED_TOO_SOON);
          } else {
            diskSourceWriter = value;
            diskSourceWriter.size = 0;
            if (diskSourceWriter.maxSize) {
              zipWriter.maxSize = diskSourceWriter.maxSize;
            }
            zipWriter.availableSize = zipWriter.maxSize;
            await initStream(diskSourceWriter);
            diskWritable = value.writable;
            diskWriter = diskWritable.getWriter();
          }
          await this.write(chunk);
        } else if (chunk.length >= availableSize) {
          await writeChunk(chunk.slice(0, availableSize));
          await closeDisk();
          zipWriter.diskOffset += diskSourceWriter.size;
          zipWriter.diskNumber++;
          diskWriter = null;
          await this.write(chunk.slice(availableSize));
        } else {
          await writeChunk(chunk);
        }
      },
      async close() {
        await diskWriter.ready;
        await closeDisk();
      }
    });
    Object.defineProperty(zipWriter, PROPERTY_NAME_WRITABLE, {
      get() {
        return writable;
      }
    });
    async function writeChunk(chunk) {
      const chunkLength = chunk.length;
      if (chunkLength) {
        await diskWriter.ready;
        await diskWriter.write(chunk);
        diskSourceWriter.size += chunkLength;
        zipWriter.size += chunkLength;
        zipWriter.availableSize -= chunkLength;
      }
    }
    async function closeDisk() {
      diskWritable.size = diskSourceWriter.size;
      await diskWriter.close();
    }
  }
};
async function initStream(stream, initSize) {
  if (stream.init && !stream.initialized) {
    await stream.init(initSize);
  }
}
function initReader(reader) {
  if (Array.isArray(reader)) {
    reader = new SplitDataReader(reader);
  }
  if (reader instanceof ReadableStream) {
    reader = {
      readable: reader
    };
  }
  return reader;
}
function initWriter(writer) {
  if (writer.writable === UNDEFINED_VALUE && typeof writer.next == FUNCTION_TYPE) {
    writer = new SplitDataWriter(writer);
  }
  if (writer instanceof WritableStream) {
    writer = {
      writable: writer
    };
  }
  const { writable } = writer;
  if (writable.size === UNDEFINED_VALUE) {
    writable.size = 0;
  }
  const splitZipFile = writer instanceof SplitDataWriter;
  if (!splitZipFile) {
    Object.assign(writer, {
      diskNumber: 0,
      diskOffset: 0,
      availableSize: Infinity,
      maxSize: Infinity
    });
  }
  return writer;
}
function readUint8Array(reader, offset, size, diskNumber) {
  return reader.readUint8Array(offset, size, diskNumber);
}
var CP437 = "\0\u263A\u263B\u2665\u2666\u2663\u2660\u2022\u25D8\u25CB\u25D9\u2642\u2640\u266A\u266B\u263C\u25BA\u25C4\u2195\u203C\xB6\xA7\u25AC\u21A8\u2191\u2193\u2192\u2190\u221F\u2194\u25B2\u25BC !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\u2302\xC7\xFC\xE9\xE2\xE4\xE0\xE5\xE7\xEA\xEB\xE8\xEF\xEE\xEC\xC4\xC5\xC9\xE6\xC6\xF4\xF6\xF2\xFB\xF9\xFF\xD6\xDC\xA2\xA3\xA5\u20A7\u0192\xE1\xED\xF3\xFA\xF1\xD1\xAA\xBA\xBF\u2310\xAC\xBD\xBC\xA1\xAB\xBB\u2591\u2592\u2593\u2502\u2524\u2561\u2562\u2556\u2555\u2563\u2551\u2557\u255D\u255C\u255B\u2510\u2514\u2534\u252C\u251C\u2500\u253C\u255E\u255F\u255A\u2554\u2569\u2566\u2560\u2550\u256C\u2567\u2568\u2564\u2565\u2559\u2558\u2552\u2553\u256B\u256A\u2518\u250C\u2588\u2584\u258C\u2590\u2580\u03B1\xDF\u0393\u03C0\u03A3\u03C3\xB5\u03C4\u03A6\u0398\u03A9\u03B4\u221E\u03C6\u03B5\u2229\u2261\xB1\u2265\u2264\u2320\u2321\xF7\u2248\xB0\u2219\xB7\u221A\u207F\xB2\u25A0 ".split("");
var VALID_CP437 = CP437.length == 256;
function decodeCP437(stringValue) {
  if (VALID_CP437) {
    let result = "";
    for (let indexCharacter = 0; indexCharacter < stringValue.length; indexCharacter++) {
      result += CP437[stringValue[indexCharacter]];
    }
    return result;
  } else {
    return new TextDecoder().decode(stringValue);
  }
}
function decodeText(value, encoding) {
  if (encoding && encoding.trim().toLowerCase() == "cp437") {
    return decodeCP437(value);
  } else {
    return new TextDecoder(encoding).decode(value);
  }
}
var PROPERTY_NAME_FILENAME = "filename";
var PROPERTY_NAME_RAW_FILENAME = "rawFilename";
var PROPERTY_NAME_COMMENT = "comment";
var PROPERTY_NAME_RAW_COMMENT = "rawComment";
var PROPERTY_NAME_UNCOMPPRESSED_SIZE = "uncompressedSize";
var PROPERTY_NAME_COMPPRESSED_SIZE = "compressedSize";
var PROPERTY_NAME_OFFSET = "offset";
var PROPERTY_NAME_DISK_NUMBER_START = "diskNumberStart";
var PROPERTY_NAME_LAST_MODIFICATION_DATE = "lastModDate";
var PROPERTY_NAME_RAW_LAST_MODIFICATION_DATE = "rawLastModDate";
var PROPERTY_NAME_LAST_ACCESS_DATE = "lastAccessDate";
var PROPERTY_NAME_RAW_LAST_ACCESS_DATE = "rawLastAccessDate";
var PROPERTY_NAME_CREATION_DATE = "creationDate";
var PROPERTY_NAME_RAW_CREATION_DATE = "rawCreationDate";
var PROPERTY_NAME_INTERNAL_FILE_ATTRIBUTE = "internalFileAttribute";
var PROPERTY_NAME_EXTERNAL_FILE_ATTRIBUTE = "externalFileAttribute";
var PROPERTY_NAME_MS_DOS_COMPATIBLE = "msDosCompatible";
var PROPERTY_NAME_ZIP64 = "zip64";
var PROPERTY_NAMES = [
  PROPERTY_NAME_FILENAME,
  PROPERTY_NAME_RAW_FILENAME,
  PROPERTY_NAME_COMPPRESSED_SIZE,
  PROPERTY_NAME_UNCOMPPRESSED_SIZE,
  PROPERTY_NAME_LAST_MODIFICATION_DATE,
  PROPERTY_NAME_RAW_LAST_MODIFICATION_DATE,
  PROPERTY_NAME_COMMENT,
  PROPERTY_NAME_RAW_COMMENT,
  PROPERTY_NAME_LAST_ACCESS_DATE,
  PROPERTY_NAME_CREATION_DATE,
  PROPERTY_NAME_OFFSET,
  PROPERTY_NAME_DISK_NUMBER_START,
  PROPERTY_NAME_DISK_NUMBER_START,
  PROPERTY_NAME_INTERNAL_FILE_ATTRIBUTE,
  PROPERTY_NAME_EXTERNAL_FILE_ATTRIBUTE,
  PROPERTY_NAME_MS_DOS_COMPATIBLE,
  PROPERTY_NAME_ZIP64,
  "directory",
  "bitFlag",
  "encrypted",
  "signature",
  "filenameUTF8",
  "commentUTF8",
  "compressionMethod",
  "version",
  "versionMadeBy",
  "extraField",
  "rawExtraField",
  "extraFieldZip64",
  "extraFieldUnicodePath",
  "extraFieldUnicodeComment",
  "extraFieldAES",
  "extraFieldNTFS",
  "extraFieldExtendedTimestamp"
];
var Entry = class {
  constructor(data) {
    PROPERTY_NAMES.forEach((name) => this[name] = data[name]);
  }
};
var ERR_BAD_FORMAT = "File format is not recognized";
var ERR_EOCDR_NOT_FOUND = "End of central directory not found";
var ERR_EOCDR_ZIP64_NOT_FOUND = "End of Zip64 central directory not found";
var ERR_EOCDR_LOCATOR_ZIP64_NOT_FOUND = "End of Zip64 central directory locator not found";
var ERR_CENTRAL_DIRECTORY_NOT_FOUND = "Central directory header not found";
var ERR_LOCAL_FILE_HEADER_NOT_FOUND = "Local file header not found";
var ERR_EXTRAFIELD_ZIP64_NOT_FOUND = "Zip64 extra field not found";
var ERR_ENCRYPTED = "File contains encrypted entry";
var ERR_UNSUPPORTED_ENCRYPTION = "Encryption method not supported";
var ERR_UNSUPPORTED_COMPRESSION = "Compression method not supported";
var ERR_SPLIT_ZIP_FILE = "Split zip file";
var CHARSET_UTF8 = "utf-8";
var CHARSET_CP437 = "cp437";
var ZIP64_PROPERTIES = [
  [
    PROPERTY_NAME_UNCOMPPRESSED_SIZE,
    4294967295
  ],
  [
    PROPERTY_NAME_COMPPRESSED_SIZE,
    4294967295
  ],
  [
    PROPERTY_NAME_OFFSET,
    4294967295
  ],
  [
    PROPERTY_NAME_DISK_NUMBER_START,
    65535
  ]
];
var ZIP64_EXTRACTION = {
  [65535]: {
    getValue: getUint32,
    bytes: 4
  },
  [4294967295]: {
    getValue: getBigUint64,
    bytes: 8
  }
};
var ZipReader = class {
  constructor(reader, options = {}) {
    Object.assign(this, {
      reader: initReader(reader),
      options,
      config: getConfiguration()
    });
  }
  async *getEntriesGenerator(options = {}) {
    const zipReader = this;
    let { reader } = zipReader;
    const { config: config2 } = zipReader;
    await initStream(reader);
    if (reader.size === UNDEFINED_VALUE || !reader.readUint8Array) {
      reader = new BlobReader(await new Response(reader.readable).blob());
      await initStream(reader);
    }
    if (reader.size < 22) {
      throw new Error(ERR_BAD_FORMAT);
    }
    reader.chunkSize = getChunkSize(config2);
    const endOfDirectoryInfo = await seekSignature(reader, 101010256, reader.size, 22, 65535 * 16);
    if (!endOfDirectoryInfo) {
      const signatureArray = await readUint8Array(reader, 0, 4);
      const signatureView = getDataView(signatureArray);
      if (getUint32(signatureView) == 134695760) {
        throw new Error(ERR_SPLIT_ZIP_FILE);
      } else {
        throw new Error(ERR_EOCDR_NOT_FOUND);
      }
    }
    const endOfDirectoryView = getDataView(endOfDirectoryInfo);
    let directoryDataLength = getUint32(endOfDirectoryView, 12);
    let directoryDataOffset = getUint32(endOfDirectoryView, 16);
    const commentOffset = endOfDirectoryInfo.offset;
    const commentLength = getUint16(endOfDirectoryView, 20);
    const appendedDataOffset = commentOffset + 22 + commentLength;
    let lastDiskNumber = getUint16(endOfDirectoryView, 4);
    const expectedLastDiskNumber = reader.lastDiskNumber || 0;
    let diskNumber = getUint16(endOfDirectoryView, 6);
    let filesLength = getUint16(endOfDirectoryView, 8);
    let prependedDataLength = 0;
    let startOffset = 0;
    if (directoryDataOffset == 4294967295 || directoryDataLength == 4294967295 || filesLength == 65535 || diskNumber == 65535) {
      const endOfDirectoryLocatorArray = await readUint8Array(reader, endOfDirectoryInfo.offset - 20, 20);
      const endOfDirectoryLocatorView = getDataView(endOfDirectoryLocatorArray);
      if (getUint32(endOfDirectoryLocatorView, 0) != 117853008) {
        throw new Error(ERR_EOCDR_ZIP64_NOT_FOUND);
      }
      directoryDataOffset = getBigUint64(endOfDirectoryLocatorView, 8);
      let endOfDirectoryArray = await readUint8Array(reader, directoryDataOffset, 56, -1);
      let endOfDirectoryView2 = getDataView(endOfDirectoryArray);
      const expectedDirectoryDataOffset = endOfDirectoryInfo.offset - 20 - 56;
      if (getUint32(endOfDirectoryView2, 0) != 101075792 && directoryDataOffset != expectedDirectoryDataOffset) {
        const originalDirectoryDataOffset = directoryDataOffset;
        directoryDataOffset = expectedDirectoryDataOffset;
        prependedDataLength = directoryDataOffset - originalDirectoryDataOffset;
        endOfDirectoryArray = await readUint8Array(reader, directoryDataOffset, ZIP64_END_OF_CENTRAL_DIR_LENGTH, -1);
        endOfDirectoryView2 = getDataView(endOfDirectoryArray);
      }
      if (getUint32(endOfDirectoryView2, 0) != 101075792) {
        throw new Error(ERR_EOCDR_LOCATOR_ZIP64_NOT_FOUND);
      }
      if (lastDiskNumber == 65535) {
        lastDiskNumber = getUint32(endOfDirectoryView2, 16);
      }
      if (diskNumber == 65535) {
        diskNumber = getUint32(endOfDirectoryView2, 20);
      }
      if (filesLength == 65535) {
        filesLength = getBigUint64(endOfDirectoryView2, 32);
      }
      if (directoryDataLength == 4294967295) {
        directoryDataLength = getBigUint64(endOfDirectoryView2, 40);
      }
      directoryDataOffset -= directoryDataLength;
    }
    if (expectedLastDiskNumber != lastDiskNumber) {
      throw new Error(ERR_SPLIT_ZIP_FILE);
    }
    if (directoryDataOffset < 0 || directoryDataOffset >= reader.size) {
      throw new Error(ERR_BAD_FORMAT);
    }
    let offset = 0;
    let directoryArray = await readUint8Array(reader, directoryDataOffset, directoryDataLength, diskNumber);
    let directoryView = getDataView(directoryArray);
    if (directoryDataLength) {
      const expectedDirectoryDataOffset = endOfDirectoryInfo.offset - directoryDataLength;
      if (getUint32(directoryView, offset) != 33639248 && directoryDataOffset != expectedDirectoryDataOffset) {
        const originalDirectoryDataOffset = directoryDataOffset;
        directoryDataOffset = expectedDirectoryDataOffset;
        prependedDataLength = directoryDataOffset - originalDirectoryDataOffset;
        directoryArray = await readUint8Array(reader, directoryDataOffset, directoryDataLength, diskNumber);
        directoryView = getDataView(directoryArray);
      }
    }
    const expectedDirectoryDataLength = endOfDirectoryInfo.offset - directoryDataOffset - (reader.lastDiskOffset || 0);
    if (directoryDataLength != expectedDirectoryDataLength && expectedDirectoryDataLength >= 0) {
      directoryDataLength = expectedDirectoryDataLength;
      directoryArray = await readUint8Array(reader, directoryDataOffset, directoryDataLength, diskNumber);
      directoryView = getDataView(directoryArray);
    }
    if (directoryDataOffset < 0 || directoryDataOffset >= reader.size) {
      throw new Error(ERR_BAD_FORMAT);
    }
    const filenameEncoding = getOptionValue(zipReader, options, "filenameEncoding");
    const commentEncoding = getOptionValue(zipReader, options, "commentEncoding");
    for (let indexFile = 0; indexFile < filesLength; indexFile++) {
      const fileEntry = new ZipEntry(reader, config2, zipReader.options);
      if (getUint32(directoryView, offset) != 33639248) {
        throw new Error(ERR_CENTRAL_DIRECTORY_NOT_FOUND);
      }
      readCommonHeader(fileEntry, directoryView, offset + 6);
      const languageEncodingFlag = Boolean(fileEntry.bitFlag.languageEncodingFlag);
      const filenameOffset = offset + 46;
      const extraFieldOffset = filenameOffset + fileEntry.filenameLength;
      const commentOffset2 = extraFieldOffset + fileEntry.extraFieldLength;
      const versionMadeBy = getUint16(directoryView, offset + 4);
      const msDosCompatible = (versionMadeBy & 0) == 0;
      const rawFilename = directoryArray.subarray(filenameOffset, extraFieldOffset);
      const commentLength2 = getUint16(directoryView, offset + 32);
      const endOffset = commentOffset2 + commentLength2;
      const rawComment = directoryArray.subarray(commentOffset2, endOffset);
      const filenameUTF8 = languageEncodingFlag;
      const commentUTF8 = languageEncodingFlag;
      const directory = msDosCompatible && (getUint8(directoryView, offset + 38) & 16) == 16;
      const offsetFileEntry = getUint32(directoryView, offset + 42) + prependedDataLength;
      Object.assign(fileEntry, {
        versionMadeBy,
        msDosCompatible,
        compressedSize: 0,
        uncompressedSize: 0,
        commentLength: commentLength2,
        directory,
        offset: offsetFileEntry,
        diskNumberStart: getUint16(directoryView, offset + 34),
        internalFileAttribute: getUint16(directoryView, offset + 36),
        externalFileAttribute: getUint32(directoryView, offset + 38),
        rawFilename,
        filenameUTF8,
        commentUTF8,
        rawExtraField: directoryArray.subarray(extraFieldOffset, commentOffset2)
      });
      const [filename, comment] = await Promise.all([
        decodeText(rawFilename, filenameUTF8 ? CHARSET_UTF8 : filenameEncoding || CHARSET_CP437),
        decodeText(rawComment, commentUTF8 ? CHARSET_UTF8 : commentEncoding || CHARSET_CP437)
      ]);
      Object.assign(fileEntry, {
        rawComment,
        filename,
        comment,
        directory: directory || filename.endsWith(DIRECTORY_SIGNATURE)
      });
      startOffset = Math.max(offsetFileEntry, startOffset);
      await readCommonFooter(fileEntry, fileEntry, directoryView, offset + 6);
      const entry = new Entry(fileEntry);
      entry.getData = (writer, options2) => fileEntry.getData(writer, entry, options2);
      offset = endOffset;
      const { onprogress } = options;
      if (onprogress) {
        try {
          await onprogress(indexFile + 1, filesLength, new Entry(fileEntry));
        } catch (_error) {
        }
      }
      yield entry;
    }
    const extractPrependedData = getOptionValue(zipReader, options, "extractPrependedData");
    const extractAppendedData = getOptionValue(zipReader, options, "extractAppendedData");
    if (extractPrependedData) {
      zipReader.prependedData = startOffset > 0 ? await readUint8Array(reader, 0, startOffset) : new Uint8Array();
    }
    zipReader.comment = commentLength ? await readUint8Array(reader, commentOffset + END_OF_CENTRAL_DIR_LENGTH, commentLength) : new Uint8Array();
    if (extractAppendedData) {
      zipReader.appendedData = appendedDataOffset < reader.size ? await readUint8Array(reader, appendedDataOffset, reader.size - appendedDataOffset) : new Uint8Array();
    }
    return true;
  }
  async getEntries(options = {}) {
    const entries = [];
    for await (const entry of this.getEntriesGenerator(options)) {
      entries.push(entry);
    }
    return entries;
  }
  async close() {
  }
};
var ZipEntry = class {
  constructor(reader, config2, options) {
    Object.assign(this, {
      reader,
      config: config2,
      options
    });
  }
  async getData(writer, fileEntry, options = {}) {
    const zipEntry = this;
    const { reader, offset, diskNumberStart, extraFieldAES, compressionMethod, config: config2, bitFlag, signature, rawLastModDate, uncompressedSize, compressedSize } = zipEntry;
    const localDirectory = fileEntry.localDirectory = {};
    const dataArray = await readUint8Array(reader, offset, 30, diskNumberStart);
    const dataView = getDataView(dataArray);
    let password = getOptionValue(zipEntry, options, "password");
    password = password && password.length && password;
    if (extraFieldAES) {
      if (extraFieldAES.originalCompressionMethod != 99) {
        throw new Error(ERR_UNSUPPORTED_COMPRESSION);
      }
    }
    if (compressionMethod != 0 && compressionMethod != 8) {
      throw new Error(ERR_UNSUPPORTED_COMPRESSION);
    }
    if (getUint32(dataView, 0) != 67324752) {
      throw new Error(ERR_LOCAL_FILE_HEADER_NOT_FOUND);
    }
    readCommonHeader(localDirectory, dataView, 4);
    localDirectory.rawExtraField = localDirectory.extraFieldLength ? await readUint8Array(reader, offset + 30 + localDirectory.filenameLength, localDirectory.extraFieldLength, diskNumberStart) : new Uint8Array();
    await readCommonFooter(zipEntry, localDirectory, dataView, 4, true);
    Object.assign(fileEntry, {
      lastAccessDate: localDirectory.lastAccessDate,
      creationDate: localDirectory.creationDate
    });
    const encrypted = zipEntry.encrypted && localDirectory.encrypted;
    const zipCrypto = encrypted && !extraFieldAES;
    if (encrypted) {
      if (!zipCrypto && extraFieldAES.strength === UNDEFINED_VALUE) {
        throw new Error(ERR_UNSUPPORTED_ENCRYPTION);
      } else if (!password) {
        throw new Error(ERR_ENCRYPTED);
      }
    }
    const dataOffset = offset + 30 + localDirectory.filenameLength + localDirectory.extraFieldLength;
    const size = compressedSize;
    const readable = reader.readable;
    Object.assign(readable, {
      diskNumberStart,
      offset: dataOffset,
      size
    });
    const signal = getOptionValue(zipEntry, options, "signal");
    const checkPasswordOnly = getOptionValue(zipEntry, options, "checkPasswordOnly");
    if (checkPasswordOnly) {
      writer = new WritableStream();
    }
    writer = initWriter(writer);
    await initStream(writer, uncompressedSize);
    const { writable } = writer;
    const { onstart, onprogress, onend } = options;
    const workerOptions = {
      options: {
        codecType: CODEC_INFLATE,
        password,
        zipCrypto,
        encryptionStrength: extraFieldAES && extraFieldAES.strength,
        signed: getOptionValue(zipEntry, options, "checkSignature"),
        passwordVerification: zipCrypto && (bitFlag.dataDescriptor ? rawLastModDate >>> 8 & 255 : signature >>> 24 & 255),
        signature,
        compressed: compressionMethod != 0,
        encrypted,
        useWebWorkers: getOptionValue(zipEntry, options, "useWebWorkers"),
        useCompressionStream: getOptionValue(zipEntry, options, "useCompressionStream"),
        transferStreams: getOptionValue(zipEntry, options, "transferStreams"),
        checkPasswordOnly
      },
      config: config2,
      streamOptions: {
        signal,
        size,
        onstart,
        onprogress,
        onend
      }
    };
    let outputSize = 0;
    try {
      ({ outputSize } = await runWorker1({
        readable,
        writable
      }, workerOptions));
    } catch (error) {
      if (!checkPasswordOnly || error.message != ERR_ABORT_CHECK_PASSWORD) {
        throw error;
      }
    } finally {
      const preventClose = getOptionValue(zipEntry, options, "preventClose");
      writable.size += outputSize;
      if (!preventClose && !writable.locked) {
        await writable.getWriter().close();
      }
    }
    return checkPasswordOnly ? void 0 : writer.getData ? writer.getData() : writable;
  }
};
function readCommonHeader(directory, dataView, offset) {
  const rawBitFlag = directory.rawBitFlag = getUint16(dataView, offset + 2);
  const encrypted = (rawBitFlag & 1) == 1;
  const rawLastModDate = getUint32(dataView, offset + 6);
  Object.assign(directory, {
    encrypted,
    version: getUint16(dataView, offset),
    bitFlag: {
      level: (rawBitFlag & 6) >> 1,
      dataDescriptor: (rawBitFlag & 8) == 8,
      languageEncodingFlag: (rawBitFlag & 2048) == 2048
    },
    rawLastModDate,
    lastModDate: getDate(rawLastModDate),
    filenameLength: getUint16(dataView, offset + 22),
    extraFieldLength: getUint16(dataView, offset + 24)
  });
}
async function readCommonFooter(fileEntry, directory, dataView, offset, localDirectory) {
  const { rawExtraField } = directory;
  const extraField = directory.extraField = /* @__PURE__ */ new Map();
  const rawExtraFieldView = getDataView(new Uint8Array(rawExtraField));
  let offsetExtraField = 0;
  try {
    while (offsetExtraField < rawExtraField.length) {
      const type = getUint16(rawExtraFieldView, offsetExtraField);
      const size = getUint16(rawExtraFieldView, offsetExtraField + 2);
      extraField.set(type, {
        type,
        data: rawExtraField.slice(offsetExtraField + 4, offsetExtraField + 4 + size)
      });
      offsetExtraField += 4 + size;
    }
  } catch (_error) {
  }
  const compressionMethod = getUint16(dataView, offset + 4);
  Object.assign(directory, {
    signature: getUint32(dataView, offset + 10),
    uncompressedSize: getUint32(dataView, offset + 18),
    compressedSize: getUint32(dataView, offset + 14)
  });
  const extraFieldZip64 = extraField.get(1);
  if (extraFieldZip64) {
    readExtraFieldZip64(extraFieldZip64, directory);
    directory.extraFieldZip64 = extraFieldZip64;
  }
  const extraFieldUnicodePath = extraField.get(28789);
  if (extraFieldUnicodePath) {
    await readExtraFieldUnicode(extraFieldUnicodePath, PROPERTY_NAME_FILENAME, PROPERTY_NAME_RAW_FILENAME, directory, fileEntry);
    directory.extraFieldUnicodePath = extraFieldUnicodePath;
  }
  const extraFieldUnicodeComment = extraField.get(25461);
  if (extraFieldUnicodeComment) {
    await readExtraFieldUnicode(extraFieldUnicodeComment, PROPERTY_NAME_COMMENT, PROPERTY_NAME_RAW_COMMENT, directory, fileEntry);
    directory.extraFieldUnicodeComment = extraFieldUnicodeComment;
  }
  const extraFieldAES = extraField.get(39169);
  if (extraFieldAES) {
    readExtraFieldAES(extraFieldAES, directory, compressionMethod);
    directory.extraFieldAES = extraFieldAES;
  } else {
    directory.compressionMethod = compressionMethod;
  }
  const extraFieldNTFS = extraField.get(10);
  if (extraFieldNTFS) {
    readExtraFieldNTFS(extraFieldNTFS, directory);
    directory.extraFieldNTFS = extraFieldNTFS;
  }
  const extraFieldExtendedTimestamp = extraField.get(21589);
  if (extraFieldExtendedTimestamp) {
    readExtraFieldExtendedTimestamp(extraFieldExtendedTimestamp, directory, localDirectory);
    directory.extraFieldExtendedTimestamp = extraFieldExtendedTimestamp;
  }
  const extraFieldUSDZ = extraField.get(6534);
  if (extraFieldUSDZ) {
    directory.extraFieldUSDZ = extraFieldUSDZ;
  }
}
function readExtraFieldZip64(extraFieldZip64, directory) {
  directory.zip64 = true;
  const extraFieldView = getDataView(extraFieldZip64.data);
  const missingProperties = ZIP64_PROPERTIES.filter(([propertyName, max]) => directory[propertyName] == max);
  for (let indexMissingProperty = 0, offset = 0; indexMissingProperty < missingProperties.length; indexMissingProperty++) {
    const [propertyName, max] = missingProperties[indexMissingProperty];
    if (directory[propertyName] == max) {
      const extraction = ZIP64_EXTRACTION[max];
      directory[propertyName] = extraFieldZip64[propertyName] = extraction.getValue(extraFieldView, offset);
      offset += extraction.bytes;
    } else if (extraFieldZip64[propertyName]) {
      throw new Error(ERR_EXTRAFIELD_ZIP64_NOT_FOUND);
    }
  }
}
async function readExtraFieldUnicode(extraFieldUnicode, propertyName, rawPropertyName, directory, fileEntry) {
  const extraFieldView = getDataView(extraFieldUnicode.data);
  const crc32 = new Crc32();
  crc32.append(fileEntry[rawPropertyName]);
  const dataViewSignature = getDataView(new Uint8Array(4));
  dataViewSignature.setUint32(0, crc32.get(), true);
  const signature = getUint32(extraFieldView, 1);
  Object.assign(extraFieldUnicode, {
    version: getUint8(extraFieldView, 0),
    [propertyName]: decodeText(extraFieldUnicode.data.subarray(5)),
    valid: !fileEntry.bitFlag.languageEncodingFlag && signature == getUint32(dataViewSignature, 0)
  });
  if (extraFieldUnicode.valid) {
    directory[propertyName] = extraFieldUnicode[propertyName];
    directory[propertyName + "UTF8"] = true;
  }
}
function readExtraFieldAES(extraFieldAES, directory, compressionMethod) {
  const extraFieldView = getDataView(extraFieldAES.data);
  const strength = getUint8(extraFieldView, 4);
  Object.assign(extraFieldAES, {
    vendorVersion: getUint8(extraFieldView, 0),
    vendorId: getUint8(extraFieldView, 2),
    strength,
    originalCompressionMethod: compressionMethod,
    compressionMethod: getUint16(extraFieldView, 5)
  });
  directory.compressionMethod = extraFieldAES.compressionMethod;
}
function readExtraFieldNTFS(extraFieldNTFS, directory) {
  const extraFieldView = getDataView(extraFieldNTFS.data);
  let offsetExtraField = 4;
  let tag1Data;
  try {
    while (offsetExtraField < extraFieldNTFS.data.length && !tag1Data) {
      const tagValue = getUint16(extraFieldView, offsetExtraField);
      const attributeSize = getUint16(extraFieldView, offsetExtraField + 2);
      if (tagValue == 1) {
        tag1Data = extraFieldNTFS.data.slice(offsetExtraField + 4, offsetExtraField + 4 + attributeSize);
      }
      offsetExtraField += 4 + attributeSize;
    }
  } catch (_error) {
  }
  try {
    if (tag1Data && tag1Data.length == 24) {
      const tag1View = getDataView(tag1Data);
      const rawLastModDate = tag1View.getBigUint64(0, true);
      const rawLastAccessDate = tag1View.getBigUint64(8, true);
      const rawCreationDate = tag1View.getBigUint64(16, true);
      Object.assign(extraFieldNTFS, {
        rawLastModDate,
        rawLastAccessDate,
        rawCreationDate
      });
      const lastModDate = getDateNTFS(rawLastModDate);
      const lastAccessDate = getDateNTFS(rawLastAccessDate);
      const creationDate = getDateNTFS(rawCreationDate);
      const extraFieldData = {
        lastModDate,
        lastAccessDate,
        creationDate
      };
      Object.assign(extraFieldNTFS, extraFieldData);
      Object.assign(directory, extraFieldData);
    }
  } catch (_error) {
  }
}
function readExtraFieldExtendedTimestamp(extraFieldExtendedTimestamp, directory, localDirectory) {
  const extraFieldView = getDataView(extraFieldExtendedTimestamp.data);
  const flags = getUint8(extraFieldView, 0);
  const timeProperties = [];
  const timeRawProperties = [];
  if (localDirectory) {
    if ((flags & 1) == 1) {
      timeProperties.push(PROPERTY_NAME_LAST_MODIFICATION_DATE);
      timeRawProperties.push(PROPERTY_NAME_RAW_LAST_MODIFICATION_DATE);
    }
    if ((flags & 2) == 2) {
      timeProperties.push(PROPERTY_NAME_LAST_ACCESS_DATE);
      timeRawProperties.push(PROPERTY_NAME_RAW_LAST_ACCESS_DATE);
    }
    if ((flags & 4) == 4) {
      timeProperties.push(PROPERTY_NAME_CREATION_DATE);
      timeRawProperties.push(PROPERTY_NAME_RAW_CREATION_DATE);
    }
  } else if (extraFieldExtendedTimestamp.data.length >= 5) {
    timeProperties.push(PROPERTY_NAME_LAST_MODIFICATION_DATE);
    timeRawProperties.push(PROPERTY_NAME_RAW_LAST_MODIFICATION_DATE);
  }
  let offset = 1;
  timeProperties.forEach((propertyName, indexProperty) => {
    if (extraFieldExtendedTimestamp.data.length >= offset + 4) {
      const time = getUint32(extraFieldView, offset);
      directory[propertyName] = extraFieldExtendedTimestamp[propertyName] = new Date(time * 1e3);
      const rawPropertyName = timeRawProperties[indexProperty];
      extraFieldExtendedTimestamp[rawPropertyName] = time;
    }
    offset += 4;
  });
}
async function seekSignature(reader, signature, startOffset, minimumBytes, maximumLength) {
  const signatureArray = new Uint8Array(4);
  const signatureView = getDataView(signatureArray);
  setUint32(signatureView, 0, signature);
  const maximumBytes = minimumBytes + maximumLength;
  return await seek(minimumBytes) || await seek(Math.min(maximumBytes, startOffset));
  async function seek(length) {
    const offset = startOffset - length;
    const bytes = await readUint8Array(reader, offset, length);
    for (let indexByte = bytes.length - minimumBytes; indexByte >= 0; indexByte--) {
      if (bytes[indexByte] == signatureArray[0] && bytes[indexByte + 1] == signatureArray[1] && bytes[indexByte + 2] == signatureArray[2] && bytes[indexByte + 3] == signatureArray[3]) {
        return {
          offset: offset + indexByte,
          buffer: bytes.slice(indexByte, indexByte + minimumBytes).buffer
        };
      }
    }
  }
}
function getOptionValue(zipReader, options, name) {
  return options[name] === UNDEFINED_VALUE ? zipReader.options[name] : options[name];
}
function getDate(timeRaw) {
  const date = (timeRaw & 4294901760) >> 16, time = timeRaw & 65535;
  try {
    return new Date(1980 + ((date & 65024) >> 9), ((date & 480) >> 5) - 1, date & 31, (time & 63488) >> 11, (time & 2016) >> 5, (time & 31) * 2, 0);
  } catch (_error) {
  }
}
function getDateNTFS(timeRaw) {
  return new Date(Number(timeRaw / BigInt(1e4) - BigInt(116444736e5)));
}
function getUint8(view, offset) {
  return view.getUint8(offset);
}
function getUint16(view, offset) {
  return view.getUint16(offset, true);
}
function getUint32(view, offset) {
  return view.getUint32(offset, true);
}
function getBigUint64(view, offset) {
  return Number(view.getBigUint64(offset, true));
}
function setUint32(view, offset, value) {
  view.setUint32(offset, value, true);
}
function getDataView(array) {
  return new DataView(array.buffer);
}
var ERR_DUPLICATED_NAME = "File already exists";
var ERR_INVALID_COMMENT = "Zip file comment exceeds 64KB";
var ERR_INVALID_ENTRY_COMMENT = "File entry comment exceeds 64KB";
var ERR_INVALID_ENTRY_NAME = "File entry name exceeds 64KB";
var ERR_INVALID_VERSION = "Version exceeds 65535";
var ERR_INVALID_ENCRYPTION_STRENGTH = "The strength must equal 1, 2, or 3";
var ERR_INVALID_EXTRAFIELD_TYPE = "Extra field type exceeds 65535";
var ERR_INVALID_EXTRAFIELD_DATA = "Extra field data exceeds 64KB";
var ERR_UNSUPPORTED_FORMAT = "Zip64 is not supported (make sure 'keepOrder' is set to 'true')";
var EXTRAFIELD_DATA_AES = new Uint8Array([
  7,
  0,
  2,
  0,
  65,
  69,
  3,
  0,
  0
]);
var workers = 0;
var pendingEntries = [];
var ZipWriter = class {
  constructor(writer, options = {}) {
    writer = initWriter(writer);
    Object.assign(this, {
      writer,
      addSplitZipSignature: writer instanceof SplitDataWriter,
      options,
      config: getConfiguration(),
      files: /* @__PURE__ */ new Map(),
      filenames: /* @__PURE__ */ new Set(),
      offset: writer.writable.size,
      pendingEntriesSize: 0,
      pendingAddFileCalls: /* @__PURE__ */ new Set(),
      bufferedWrites: 0
    });
  }
  async add(name = "", reader, options = {}) {
    const zipWriter = this;
    const { pendingAddFileCalls, config: config2 } = zipWriter;
    if (workers < config2.maxWorkers) {
      workers++;
    } else {
      await new Promise((resolve) => pendingEntries.push(resolve));
    }
    let promiseAddFile;
    try {
      name = name.trim();
      if (zipWriter.filenames.has(name)) {
        throw new Error(ERR_DUPLICATED_NAME);
      }
      zipWriter.filenames.add(name);
      promiseAddFile = addFile(zipWriter, name, reader, options);
      pendingAddFileCalls.add(promiseAddFile);
      return await promiseAddFile;
    } catch (error) {
      zipWriter.filenames.delete(name);
      throw error;
    } finally {
      pendingAddFileCalls.delete(promiseAddFile);
      const pendingEntry = pendingEntries.shift();
      if (pendingEntry) {
        pendingEntry();
      } else {
        workers--;
      }
    }
  }
  async close(comment = new Uint8Array(), options = {}) {
    const zipWriter = this;
    const { pendingAddFileCalls, writer } = this;
    const { writable } = writer;
    while (pendingAddFileCalls.size) {
      await Promise.all(Array.from(pendingAddFileCalls));
    }
    await closeFile(this, comment, options);
    const preventClose = getOptionValue1(zipWriter, options, "preventClose");
    if (!preventClose) {
      await writable.getWriter().close();
    }
    return writer.getData ? writer.getData() : writable;
  }
};
async function addFile(zipWriter, name, reader, options) {
  name = name.trim();
  if (options.directory && !name.endsWith(DIRECTORY_SIGNATURE)) {
    name += DIRECTORY_SIGNATURE;
  } else {
    options.directory = name.endsWith(DIRECTORY_SIGNATURE);
  }
  const rawFilename = encodeText(name);
  if (getLength(rawFilename) > 65535) {
    throw new Error(ERR_INVALID_ENTRY_NAME);
  }
  const comment = options.comment || "";
  const rawComment = encodeText(comment);
  if (getLength(rawComment) > 65535) {
    throw new Error(ERR_INVALID_ENTRY_COMMENT);
  }
  const version = getOptionValue1(zipWriter, options, "version", 20);
  if (version > 65535) {
    throw new Error(ERR_INVALID_VERSION);
  }
  const versionMadeBy = getOptionValue1(zipWriter, options, "versionMadeBy", 20);
  if (versionMadeBy > 65535) {
    throw new Error(ERR_INVALID_VERSION);
  }
  const lastModDate = getOptionValue1(zipWriter, options, PROPERTY_NAME_LAST_MODIFICATION_DATE, /* @__PURE__ */ new Date());
  const lastAccessDate = getOptionValue1(zipWriter, options, PROPERTY_NAME_LAST_ACCESS_DATE);
  const creationDate = getOptionValue1(zipWriter, options, PROPERTY_NAME_CREATION_DATE);
  const msDosCompatible = getOptionValue1(zipWriter, options, PROPERTY_NAME_MS_DOS_COMPATIBLE, true);
  const internalFileAttribute = getOptionValue1(zipWriter, options, PROPERTY_NAME_INTERNAL_FILE_ATTRIBUTE, 0);
  const externalFileAttribute = getOptionValue1(zipWriter, options, PROPERTY_NAME_EXTERNAL_FILE_ATTRIBUTE, 0);
  const password = getOptionValue1(zipWriter, options, "password");
  const encryptionStrength = getOptionValue1(zipWriter, options, "encryptionStrength", 3);
  const zipCrypto = getOptionValue1(zipWriter, options, "zipCrypto");
  const extendedTimestamp = getOptionValue1(zipWriter, options, "extendedTimestamp", true);
  const keepOrder = getOptionValue1(zipWriter, options, "keepOrder", true);
  const level = getOptionValue1(zipWriter, options, "level");
  const useWebWorkers = getOptionValue1(zipWriter, options, "useWebWorkers");
  const bufferedWrite = getOptionValue1(zipWriter, options, "bufferedWrite");
  const dataDescriptorSignature = getOptionValue1(zipWriter, options, "dataDescriptorSignature", false);
  const signal = getOptionValue1(zipWriter, options, "signal");
  const useCompressionStream = getOptionValue1(zipWriter, options, "useCompressionStream");
  let dataDescriptor = getOptionValue1(zipWriter, options, "dataDescriptor", true);
  let zip64 = getOptionValue1(zipWriter, options, PROPERTY_NAME_ZIP64);
  if (password !== UNDEFINED_VALUE && encryptionStrength !== UNDEFINED_VALUE && (encryptionStrength < 1 || encryptionStrength > 3)) {
    throw new Error(ERR_INVALID_ENCRYPTION_STRENGTH);
  }
  let rawExtraField = new Uint8Array();
  const { extraField } = options;
  if (extraField) {
    let extraFieldSize = 0;
    let offset = 0;
    extraField.forEach((data) => extraFieldSize += 4 + getLength(data));
    rawExtraField = new Uint8Array(extraFieldSize);
    extraField.forEach((data, type) => {
      if (type > 65535) {
        throw new Error(ERR_INVALID_EXTRAFIELD_TYPE);
      }
      if (getLength(data) > 65535) {
        throw new Error(ERR_INVALID_EXTRAFIELD_DATA);
      }
      arraySet(rawExtraField, new Uint16Array([
        type
      ]), offset);
      arraySet(rawExtraField, new Uint16Array([
        getLength(data)
      ]), offset + 2);
      arraySet(rawExtraField, data, offset + 4);
      offset += 4 + getLength(data);
    });
  }
  let maximumCompressedSize = 0;
  let maximumEntrySize = 0;
  let uncompressedSize = 0;
  const zip64Enabled = zip64 === true;
  if (reader) {
    reader = initReader(reader);
    await initStream(reader);
    if (reader.size === UNDEFINED_VALUE) {
      dataDescriptor = true;
      if (zip64 || zip64 === UNDEFINED_VALUE) {
        zip64 = true;
        uncompressedSize = maximumCompressedSize = MAX_32_BITS;
      }
    } else {
      uncompressedSize = reader.size;
      maximumCompressedSize = getMaximumCompressedSize1(uncompressedSize);
    }
  }
  const { diskOffset, diskNumber, maxSize } = zipWriter.writer;
  const zip64UncompressedSize = zip64Enabled || uncompressedSize >= 4294967295;
  const zip64CompressedSize = zip64Enabled || maximumCompressedSize >= 4294967295;
  const zip64Offset = zip64Enabled || zipWriter.offset + zipWriter.pendingEntriesSize - diskOffset >= 4294967295;
  const supportZip64SplitFile = getOptionValue1(zipWriter, options, "supportZip64SplitFile", true);
  const zip64DiskNumberStart = supportZip64SplitFile && zip64Enabled || diskNumber + Math.ceil(zipWriter.pendingEntriesSize / maxSize) >= 65535;
  if (zip64Offset || zip64UncompressedSize || zip64CompressedSize || zip64DiskNumberStart) {
    if (zip64 === false || !keepOrder) {
      throw new Error(ERR_UNSUPPORTED_FORMAT);
    } else {
      zip64 = true;
    }
  }
  zip64 = zip64 || false;
  options = Object.assign({}, options, {
    rawFilename,
    rawComment,
    version,
    versionMadeBy,
    lastModDate,
    lastAccessDate,
    creationDate,
    rawExtraField,
    zip64,
    zip64UncompressedSize,
    zip64CompressedSize,
    zip64Offset,
    zip64DiskNumberStart,
    password,
    level,
    useWebWorkers,
    encryptionStrength,
    extendedTimestamp,
    zipCrypto,
    bufferedWrite,
    keepOrder,
    dataDescriptor,
    dataDescriptorSignature,
    signal,
    msDosCompatible,
    internalFileAttribute,
    externalFileAttribute,
    useCompressionStream
  });
  const headerInfo = getHeaderInfo(options);
  const dataDescriptorInfo = getDataDescriptorInfo(options);
  const metadataSize = getLength(headerInfo.localHeaderArray, dataDescriptorInfo.dataDescriptorArray);
  maximumEntrySize = metadataSize + maximumCompressedSize;
  if (zipWriter.options.usdz) {
    maximumEntrySize += maximumEntrySize + 64;
  }
  zipWriter.pendingEntriesSize += maximumEntrySize;
  let fileEntry;
  try {
    fileEntry = await getFileEntry(zipWriter, name, reader, {
      headerInfo,
      dataDescriptorInfo,
      metadataSize
    }, options);
  } finally {
    zipWriter.pendingEntriesSize -= maximumEntrySize;
  }
  Object.assign(fileEntry, {
    name,
    comment,
    extraField
  });
  return new Entry(fileEntry);
}
async function getFileEntry(zipWriter, name, reader, entryInfo, options) {
  const { files, writer } = zipWriter;
  const { keepOrder, dataDescriptor, signal } = options;
  const { headerInfo } = entryInfo;
  const { usdz } = zipWriter.options;
  const previousFileEntry = Array.from(files.values()).pop();
  let fileEntry = {};
  let bufferedWrite;
  let releaseLockWriter;
  let releaseLockCurrentFileEntry;
  let writingBufferedEntryData;
  let writingEntryData;
  let fileWriter;
  files.set(name, fileEntry);
  try {
    let lockPreviousFileEntry;
    if (keepOrder) {
      lockPreviousFileEntry = previousFileEntry && previousFileEntry.lock;
      requestLockCurrentFileEntry();
    }
    if ((options.bufferedWrite || zipWriter.writerLocked || zipWriter.bufferedWrites && keepOrder || !dataDescriptor) && !usdz) {
      fileWriter = new BlobWriter();
      fileWriter.writable.size = 0;
      bufferedWrite = true;
      zipWriter.bufferedWrites++;
      await initStream(writer);
    } else {
      fileWriter = writer;
      await requestLockWriter();
    }
    await initStream(fileWriter);
    const { writable } = writer;
    let { diskOffset } = writer;
    if (zipWriter.addSplitZipSignature) {
      delete zipWriter.addSplitZipSignature;
      const signatureArray = new Uint8Array(4);
      const signatureArrayView = getDataView1(signatureArray);
      setUint321(signatureArrayView, 0, 134695760);
      await writeData(writable, signatureArray);
      zipWriter.offset += 4;
    }
    if (usdz) {
      appendExtraFieldUSDZ(entryInfo, zipWriter.offset - diskOffset);
    }
    if (!bufferedWrite) {
      await lockPreviousFileEntry;
      await skipDiskIfNeeded(writable);
    }
    const { diskNumber } = writer;
    writingEntryData = true;
    fileEntry.diskNumberStart = diskNumber;
    fileEntry = await createFileEntry(reader, fileWriter, fileEntry, entryInfo, zipWriter.config, options);
    writingEntryData = false;
    files.set(name, fileEntry);
    fileEntry.filename = name;
    if (bufferedWrite) {
      await fileWriter.writable.getWriter().close();
      let blob = await fileWriter.getData();
      await lockPreviousFileEntry;
      await requestLockWriter();
      writingBufferedEntryData = true;
      if (!dataDescriptor) {
        blob = await writeExtraHeaderInfo(fileEntry, blob, writable, options);
      }
      await skipDiskIfNeeded(writable);
      fileEntry.diskNumberStart = writer.diskNumber;
      diskOffset = writer.diskOffset;
      await blob.stream().pipeTo(writable, {
        preventClose: true,
        preventAbort: true,
        signal
      });
      writable.size += blob.size;
      writingBufferedEntryData = false;
    }
    fileEntry.offset = zipWriter.offset - diskOffset;
    if (fileEntry.zip64) {
      setZip64ExtraInfo(fileEntry, options);
    } else if (fileEntry.offset >= 4294967295) {
      throw new Error(ERR_UNSUPPORTED_FORMAT);
    }
    zipWriter.offset += fileEntry.length;
    return fileEntry;
  } catch (error) {
    if (bufferedWrite && writingBufferedEntryData || !bufferedWrite && writingEntryData) {
      zipWriter.hasCorruptedEntries = true;
      if (error) {
        try {
          error.corruptedEntry = true;
        } catch (_error) {
        }
      }
      if (bufferedWrite) {
        zipWriter.offset += fileWriter.writable.size;
      } else {
        zipWriter.offset = fileWriter.writable.size;
      }
    }
    files.delete(name);
    throw error;
  } finally {
    if (bufferedWrite) {
      zipWriter.bufferedWrites--;
    }
    if (releaseLockCurrentFileEntry) {
      releaseLockCurrentFileEntry();
    }
    if (releaseLockWriter) {
      releaseLockWriter();
    }
  }
  function requestLockCurrentFileEntry() {
    fileEntry.lock = new Promise((resolve) => releaseLockCurrentFileEntry = resolve);
  }
  async function requestLockWriter() {
    zipWriter.writerLocked = true;
    const { lockWriter } = zipWriter;
    zipWriter.lockWriter = new Promise((resolve) => releaseLockWriter = () => {
      zipWriter.writerLocked = false;
      resolve();
    });
    await lockWriter;
  }
  async function skipDiskIfNeeded(writable) {
    if (headerInfo.localHeaderArray.length > writer.availableSize) {
      writer.availableSize = 0;
      await writeData(writable, new Uint8Array());
    }
  }
}
async function createFileEntry(reader, writer, { diskNumberStart, lock }, entryInfo, config2, options) {
  const { headerInfo, dataDescriptorInfo, metadataSize } = entryInfo;
  const { localHeaderArray, headerArray, lastModDate, rawLastModDate, encrypted, compressed, version, compressionMethod, rawExtraFieldExtendedTimestamp, extraFieldExtendedTimestampFlag, rawExtraFieldNTFS, rawExtraFieldAES } = headerInfo;
  const { dataDescriptorArray } = dataDescriptorInfo;
  const { rawFilename, lastAccessDate, creationDate, password, level, zip64, zip64UncompressedSize, zip64CompressedSize, zip64Offset, zip64DiskNumberStart, zipCrypto, dataDescriptor, directory, versionMadeBy, rawComment, rawExtraField, useWebWorkers, onstart, onprogress, onend, signal, encryptionStrength, extendedTimestamp, msDosCompatible, internalFileAttribute, externalFileAttribute, useCompressionStream } = options;
  const fileEntry = {
    lock,
    versionMadeBy,
    zip64,
    directory: Boolean(directory),
    filenameUTF8: true,
    rawFilename,
    commentUTF8: true,
    rawComment,
    rawExtraFieldExtendedTimestamp,
    rawExtraFieldNTFS,
    rawExtraFieldAES,
    rawExtraField,
    extendedTimestamp,
    msDosCompatible,
    internalFileAttribute,
    externalFileAttribute,
    diskNumberStart
  };
  let compressedSize = 0;
  let uncompressedSize = 0;
  let signature;
  const { writable } = writer;
  if (reader) {
    reader.chunkSize = getChunkSize(config2);
    await writeData(writable, localHeaderArray);
    const readable = reader.readable;
    const size = readable.size = reader.size;
    const workerOptions = {
      options: {
        codecType: CODEC_DEFLATE,
        level,
        password,
        encryptionStrength,
        zipCrypto: encrypted && zipCrypto,
        passwordVerification: encrypted && zipCrypto && rawLastModDate >> 8 & 255,
        signed: true,
        compressed,
        encrypted,
        useWebWorkers,
        useCompressionStream,
        transferStreams: false
      },
      config: config2,
      streamOptions: {
        signal,
        size,
        onstart,
        onprogress,
        onend
      }
    };
    const result = await runWorker1({
      readable,
      writable
    }, workerOptions);
    writable.size += result.size;
    signature = result.signature;
    uncompressedSize = reader.size = readable.size;
    compressedSize = result.size;
  } else {
    await writeData(writable, localHeaderArray);
  }
  let rawExtraFieldZip64;
  if (zip64) {
    let rawExtraFieldZip64Length = 4;
    if (zip64UncompressedSize) {
      rawExtraFieldZip64Length += 8;
    }
    if (zip64CompressedSize) {
      rawExtraFieldZip64Length += 8;
    }
    if (zip64Offset) {
      rawExtraFieldZip64Length += 8;
    }
    if (zip64DiskNumberStart) {
      rawExtraFieldZip64Length += 4;
    }
    rawExtraFieldZip64 = new Uint8Array(rawExtraFieldZip64Length);
  } else {
    rawExtraFieldZip64 = new Uint8Array();
  }
  setEntryInfo({
    signature,
    rawExtraFieldZip64,
    compressedSize,
    uncompressedSize,
    headerInfo,
    dataDescriptorInfo
  }, options);
  if (dataDescriptor) {
    await writeData(writable, dataDescriptorArray);
  }
  Object.assign(fileEntry, {
    uncompressedSize,
    compressedSize,
    lastModDate,
    rawLastModDate,
    creationDate,
    lastAccessDate,
    encrypted,
    length: metadataSize + compressedSize,
    compressionMethod,
    version,
    headerArray,
    signature,
    rawExtraFieldZip64,
    extraFieldExtendedTimestampFlag,
    zip64UncompressedSize,
    zip64CompressedSize,
    zip64Offset,
    zip64DiskNumberStart
  });
  return fileEntry;
}
function getHeaderInfo(options) {
  const { rawFilename, lastModDate, lastAccessDate, creationDate, password, level, zip64, zipCrypto, dataDescriptor, directory, rawExtraField, encryptionStrength, extendedTimestamp } = options;
  const compressed = level !== 0 && !directory;
  const encrypted = Boolean(password && getLength(password));
  let version = options.version;
  let rawExtraFieldAES;
  if (encrypted && !zipCrypto) {
    rawExtraFieldAES = new Uint8Array(getLength(EXTRAFIELD_DATA_AES) + 2);
    const extraFieldAESView = getDataView1(rawExtraFieldAES);
    setUint16(extraFieldAESView, 0, 39169);
    arraySet(rawExtraFieldAES, EXTRAFIELD_DATA_AES, 2);
    setUint8(extraFieldAESView, 8, encryptionStrength);
  } else {
    rawExtraFieldAES = new Uint8Array();
  }
  let rawExtraFieldNTFS;
  let rawExtraFieldExtendedTimestamp;
  let extraFieldExtendedTimestampFlag;
  if (extendedTimestamp) {
    rawExtraFieldExtendedTimestamp = new Uint8Array(9 + (lastAccessDate ? 4 : 0) + (creationDate ? 4 : 0));
    const extraFieldExtendedTimestampView = getDataView1(rawExtraFieldExtendedTimestamp);
    setUint16(extraFieldExtendedTimestampView, 0, 21589);
    setUint16(extraFieldExtendedTimestampView, 2, getLength(rawExtraFieldExtendedTimestamp) - 4);
    extraFieldExtendedTimestampFlag = 1 + (lastAccessDate ? 2 : 0) + (creationDate ? 4 : 0);
    setUint8(extraFieldExtendedTimestampView, 4, extraFieldExtendedTimestampFlag);
    let offset = 5;
    setUint321(extraFieldExtendedTimestampView, offset, Math.floor(lastModDate.getTime() / 1e3));
    offset += 4;
    if (lastAccessDate) {
      setUint321(extraFieldExtendedTimestampView, offset, Math.floor(lastAccessDate.getTime() / 1e3));
      offset += 4;
    }
    if (creationDate) {
      setUint321(extraFieldExtendedTimestampView, offset, Math.floor(creationDate.getTime() / 1e3));
    }
    try {
      rawExtraFieldNTFS = new Uint8Array(36);
      const extraFieldNTFSView = getDataView1(rawExtraFieldNTFS);
      const lastModTimeNTFS = getTimeNTFS(lastModDate);
      setUint16(extraFieldNTFSView, 0, 10);
      setUint16(extraFieldNTFSView, 2, 32);
      setUint16(extraFieldNTFSView, 8, 1);
      setUint16(extraFieldNTFSView, 10, 24);
      setBigUint64(extraFieldNTFSView, 12, lastModTimeNTFS);
      setBigUint64(extraFieldNTFSView, 20, getTimeNTFS(lastAccessDate) || lastModTimeNTFS);
      setBigUint64(extraFieldNTFSView, 28, getTimeNTFS(creationDate) || lastModTimeNTFS);
    } catch (_error) {
      rawExtraFieldNTFS = new Uint8Array();
    }
  } else {
    rawExtraFieldNTFS = rawExtraFieldExtendedTimestamp = new Uint8Array();
  }
  let bitFlag = 2048;
  if (dataDescriptor) {
    bitFlag = bitFlag | BITFLAG_DATA_DESCRIPTOR;
  }
  let compressionMethod = 0;
  if (compressed) {
    compressionMethod = COMPRESSION_METHOD_DEFLATE;
  }
  if (zip64) {
    version = version > VERSION_ZIP64 ? version : VERSION_ZIP64;
  }
  if (encrypted) {
    bitFlag = bitFlag | BITFLAG_ENCRYPTED;
    if (!zipCrypto) {
      version = version > VERSION_AES ? version : VERSION_AES;
      compressionMethod = COMPRESSION_METHOD_AES;
      if (compressed) {
        rawExtraFieldAES[9] = COMPRESSION_METHOD_DEFLATE;
      }
    }
  }
  const headerArray = new Uint8Array(26);
  const headerView = getDataView1(headerArray);
  setUint16(headerView, 0, version);
  setUint16(headerView, 2, bitFlag);
  setUint16(headerView, 4, compressionMethod);
  const dateArray = new Uint32Array(1);
  const dateView = getDataView1(dateArray);
  let lastModDateMsDos;
  if (lastModDate < MIN_DATE) {
    lastModDateMsDos = MIN_DATE;
  } else if (lastModDate > MAX_DATE) {
    lastModDateMsDos = MAX_DATE;
  } else {
    lastModDateMsDos = lastModDate;
  }
  setUint16(dateView, 0, (lastModDateMsDos.getHours() << 6 | lastModDateMsDos.getMinutes()) << 5 | lastModDateMsDos.getSeconds() / 2);
  setUint16(dateView, 2, (lastModDateMsDos.getFullYear() - 1980 << 4 | lastModDateMsDos.getMonth() + 1) << 5 | lastModDateMsDos.getDate());
  const rawLastModDate = dateArray[0];
  setUint321(headerView, 6, rawLastModDate);
  setUint16(headerView, 22, getLength(rawFilename));
  const extraFieldLength = getLength(rawExtraFieldAES, rawExtraFieldExtendedTimestamp, rawExtraFieldNTFS, rawExtraField);
  setUint16(headerView, 24, extraFieldLength);
  const localHeaderArray = new Uint8Array(30 + getLength(rawFilename) + extraFieldLength);
  const localHeaderView = getDataView1(localHeaderArray);
  setUint321(localHeaderView, 0, 67324752);
  arraySet(localHeaderArray, headerArray, 4);
  arraySet(localHeaderArray, rawFilename, 30);
  arraySet(localHeaderArray, rawExtraFieldAES, 30 + getLength(rawFilename));
  arraySet(localHeaderArray, rawExtraFieldExtendedTimestamp, 30 + getLength(rawFilename, rawExtraFieldAES));
  arraySet(localHeaderArray, rawExtraFieldNTFS, 30 + getLength(rawFilename, rawExtraFieldAES, rawExtraFieldExtendedTimestamp));
  arraySet(localHeaderArray, rawExtraField, 30 + getLength(rawFilename, rawExtraFieldAES, rawExtraFieldExtendedTimestamp, rawExtraFieldNTFS));
  return {
    localHeaderArray,
    headerArray,
    headerView,
    lastModDate,
    rawLastModDate,
    encrypted,
    compressed,
    version,
    compressionMethod,
    extraFieldExtendedTimestampFlag,
    rawExtraFieldExtendedTimestamp,
    rawExtraFieldNTFS,
    rawExtraFieldAES,
    extraFieldLength
  };
}
function appendExtraFieldUSDZ(entryInfo, zipWriterOffset) {
  const { headerInfo } = entryInfo;
  let { localHeaderArray, extraFieldLength } = headerInfo;
  let localHeaderArrayView = getDataView1(localHeaderArray);
  let extraBytesLength = 64 - (zipWriterOffset + localHeaderArray.length) % 64;
  if (extraBytesLength < 4) {
    extraBytesLength += 64;
  }
  const rawExtraFieldUSDZ = new Uint8Array(extraBytesLength);
  const extraFieldUSDZView = getDataView1(rawExtraFieldUSDZ);
  setUint16(extraFieldUSDZView, 0, 6534);
  setUint16(extraFieldUSDZView, 2, extraBytesLength - 2);
  const previousLocalHeaderArray = localHeaderArray;
  headerInfo.localHeaderArray = localHeaderArray = new Uint8Array(previousLocalHeaderArray.length + extraBytesLength);
  arraySet(localHeaderArray, previousLocalHeaderArray);
  arraySet(localHeaderArray, rawExtraFieldUSDZ, previousLocalHeaderArray.length);
  localHeaderArrayView = getDataView1(localHeaderArray);
  setUint16(localHeaderArrayView, 28, extraFieldLength + extraBytesLength);
  entryInfo.metadataSize += extraBytesLength;
}
function getDataDescriptorInfo(options) {
  const { zip64, dataDescriptor, dataDescriptorSignature } = options;
  let dataDescriptorArray = new Uint8Array();
  let dataDescriptorView, dataDescriptorOffset = 0;
  if (dataDescriptor) {
    dataDescriptorArray = new Uint8Array(zip64 ? dataDescriptorSignature ? 24 : 20 : dataDescriptorSignature ? 16 : 12);
    dataDescriptorView = getDataView1(dataDescriptorArray);
    if (dataDescriptorSignature) {
      dataDescriptorOffset = 4;
      setUint321(dataDescriptorView, 0, 134695760);
    }
  }
  return {
    dataDescriptorArray,
    dataDescriptorView,
    dataDescriptorOffset
  };
}
function setEntryInfo(entryInfo, options) {
  const { signature, rawExtraFieldZip64, compressedSize, uncompressedSize, headerInfo, dataDescriptorInfo } = entryInfo;
  const { headerView, encrypted } = headerInfo;
  const { dataDescriptorView, dataDescriptorOffset } = dataDescriptorInfo;
  const { zip64, zip64UncompressedSize, zip64CompressedSize, zipCrypto, dataDescriptor } = options;
  if ((!encrypted || zipCrypto) && signature !== UNDEFINED_VALUE) {
    setUint321(headerView, 10, signature);
    if (dataDescriptor) {
      setUint321(dataDescriptorView, dataDescriptorOffset, signature);
    }
  }
  if (zip64) {
    const rawExtraFieldZip64View = getDataView1(rawExtraFieldZip64);
    setUint16(rawExtraFieldZip64View, 0, 1);
    setUint16(rawExtraFieldZip64View, 2, rawExtraFieldZip64.length - 4);
    let rawExtraFieldZip64Offset = 4;
    if (zip64UncompressedSize) {
      setUint321(headerView, 18, 4294967295);
      setBigUint64(rawExtraFieldZip64View, rawExtraFieldZip64Offset, BigInt(uncompressedSize));
      rawExtraFieldZip64Offset += 8;
    }
    if (zip64CompressedSize) {
      setUint321(headerView, 14, 4294967295);
      setBigUint64(rawExtraFieldZip64View, rawExtraFieldZip64Offset, BigInt(compressedSize));
    }
    if (dataDescriptor) {
      setBigUint64(dataDescriptorView, dataDescriptorOffset + 4, BigInt(compressedSize));
      setBigUint64(dataDescriptorView, dataDescriptorOffset + 12, BigInt(uncompressedSize));
    }
  } else {
    setUint321(headerView, 14, compressedSize);
    setUint321(headerView, 18, uncompressedSize);
    if (dataDescriptor) {
      setUint321(dataDescriptorView, dataDescriptorOffset + 4, compressedSize);
      setUint321(dataDescriptorView, dataDescriptorOffset + 8, uncompressedSize);
    }
  }
}
async function writeExtraHeaderInfo(fileEntry, entryData, writable, { zipCrypto }) {
  let arrayBuffer;
  arrayBuffer = await entryData.slice(0, 26).arrayBuffer();
  if (arrayBuffer.byteLength != 26) {
    arrayBuffer = arrayBuffer.slice(0, 26);
  }
  const arrayBufferView = new DataView(arrayBuffer);
  if (!fileEntry.encrypted || zipCrypto) {
    setUint321(arrayBufferView, 14, fileEntry.signature);
  }
  if (fileEntry.zip64) {
    setUint321(arrayBufferView, 18, 4294967295);
    setUint321(arrayBufferView, 22, 4294967295);
  } else {
    setUint321(arrayBufferView, 18, fileEntry.compressedSize);
    setUint321(arrayBufferView, 22, fileEntry.uncompressedSize);
  }
  await writeData(writable, new Uint8Array(arrayBuffer));
  return entryData.slice(arrayBuffer.byteLength);
}
function setZip64ExtraInfo(fileEntry, options) {
  const { rawExtraFieldZip64, offset, diskNumberStart } = fileEntry;
  const { zip64UncompressedSize, zip64CompressedSize, zip64Offset, zip64DiskNumberStart } = options;
  const rawExtraFieldZip64View = getDataView1(rawExtraFieldZip64);
  let rawExtraFieldZip64Offset = 4;
  if (zip64UncompressedSize) {
    rawExtraFieldZip64Offset += 8;
  }
  if (zip64CompressedSize) {
    rawExtraFieldZip64Offset += 8;
  }
  if (zip64Offset) {
    setBigUint64(rawExtraFieldZip64View, rawExtraFieldZip64Offset, BigInt(offset));
    rawExtraFieldZip64Offset += 8;
  }
  if (zip64DiskNumberStart) {
    setUint321(rawExtraFieldZip64View, rawExtraFieldZip64Offset, diskNumberStart);
  }
}
async function closeFile(zipWriter, comment, options) {
  const { files, writer } = zipWriter;
  const { diskOffset, writable } = writer;
  let { diskNumber } = writer;
  let offset = 0;
  let directoryDataLength = 0;
  let directoryOffset = zipWriter.offset - diskOffset;
  let filesLength = files.size;
  for (const [, fileEntry] of files) {
    const { rawFilename, rawExtraFieldZip64, rawExtraFieldAES, rawComment, rawExtraFieldNTFS, rawExtraField, extendedTimestamp, extraFieldExtendedTimestampFlag, lastModDate } = fileEntry;
    let rawExtraFieldTimestamp;
    if (extendedTimestamp) {
      rawExtraFieldTimestamp = new Uint8Array(9);
      const extraFieldExtendedTimestampView = getDataView1(rawExtraFieldTimestamp);
      setUint16(extraFieldExtendedTimestampView, 0, 21589);
      setUint16(extraFieldExtendedTimestampView, 2, 5);
      setUint8(extraFieldExtendedTimestampView, 4, extraFieldExtendedTimestampFlag);
      setUint321(extraFieldExtendedTimestampView, 5, Math.floor(lastModDate.getTime() / 1e3));
    } else {
      rawExtraFieldTimestamp = new Uint8Array();
    }
    fileEntry.rawExtraFieldCDExtendedTimestamp = rawExtraFieldTimestamp;
    directoryDataLength += 46 + getLength(rawFilename, rawComment, rawExtraFieldZip64, rawExtraFieldAES, rawExtraFieldNTFS, rawExtraFieldTimestamp, rawExtraField);
  }
  const directoryArray = new Uint8Array(directoryDataLength);
  const directoryView = getDataView1(directoryArray);
  await initStream(writer);
  let directoryDiskOffset = 0;
  for (const [indexFileEntry, fileEntry] of Array.from(files.values()).entries()) {
    const { offset: fileEntryOffset, rawFilename, rawExtraFieldZip64, rawExtraFieldAES, rawExtraFieldCDExtendedTimestamp, rawExtraFieldNTFS, rawExtraField, rawComment, versionMadeBy, headerArray, directory, zip64: zip642, zip64UncompressedSize, zip64CompressedSize, zip64DiskNumberStart, zip64Offset, msDosCompatible, internalFileAttribute, externalFileAttribute, diskNumberStart, uncompressedSize, compressedSize } = fileEntry;
    const extraFieldLength = getLength(rawExtraFieldZip64, rawExtraFieldAES, rawExtraFieldCDExtendedTimestamp, rawExtraFieldNTFS, rawExtraField);
    setUint321(directoryView, offset, 33639248);
    setUint16(directoryView, offset + 4, versionMadeBy);
    const headerView = getDataView1(headerArray);
    if (!zip64UncompressedSize) {
      setUint321(headerView, 18, uncompressedSize);
    }
    if (!zip64CompressedSize) {
      setUint321(headerView, 14, compressedSize);
    }
    arraySet(directoryArray, headerArray, offset + 6);
    setUint16(directoryView, offset + 30, extraFieldLength);
    setUint16(directoryView, offset + 32, getLength(rawComment));
    setUint16(directoryView, offset + 34, zip642 && zip64DiskNumberStart ? 65535 : diskNumberStart);
    setUint16(directoryView, offset + 36, internalFileAttribute);
    if (externalFileAttribute) {
      setUint321(directoryView, offset + 38, externalFileAttribute);
    } else if (directory && msDosCompatible) {
      setUint8(directoryView, offset + 38, 16);
    }
    setUint321(directoryView, offset + 42, zip642 && zip64Offset ? 4294967295 : fileEntryOffset);
    arraySet(directoryArray, rawFilename, offset + 46);
    arraySet(directoryArray, rawExtraFieldZip64, offset + 46 + getLength(rawFilename));
    arraySet(directoryArray, rawExtraFieldAES, offset + 46 + getLength(rawFilename, rawExtraFieldZip64));
    arraySet(directoryArray, rawExtraFieldCDExtendedTimestamp, offset + 46 + getLength(rawFilename, rawExtraFieldZip64, rawExtraFieldAES));
    arraySet(directoryArray, rawExtraFieldNTFS, offset + 46 + getLength(rawFilename, rawExtraFieldZip64, rawExtraFieldAES, rawExtraFieldCDExtendedTimestamp));
    arraySet(directoryArray, rawExtraField, offset + 46 + getLength(rawFilename, rawExtraFieldZip64, rawExtraFieldAES, rawExtraFieldCDExtendedTimestamp, rawExtraFieldNTFS));
    arraySet(directoryArray, rawComment, offset + 46 + getLength(rawFilename) + extraFieldLength);
    const directoryEntryLength = 46 + getLength(rawFilename, rawComment) + extraFieldLength;
    if (offset - directoryDiskOffset > writer.availableSize) {
      writer.availableSize = 0;
      await writeData(writable, directoryArray.slice(directoryDiskOffset, offset));
      directoryDiskOffset = offset;
    }
    offset += directoryEntryLength;
    if (options.onprogress) {
      try {
        await options.onprogress(indexFileEntry + 1, files.size, new Entry(fileEntry));
      } catch (_error) {
      }
    }
  }
  await writeData(writable, directoryDiskOffset ? directoryArray.slice(directoryDiskOffset) : directoryArray);
  let lastDiskNumber = writer.diskNumber;
  const { availableSize } = writer;
  if (availableSize < 22) {
    lastDiskNumber++;
  }
  let zip64 = getOptionValue1(zipWriter, options, "zip64");
  if (directoryOffset >= 4294967295 || directoryDataLength >= 4294967295 || filesLength >= 65535 || lastDiskNumber >= 65535) {
    if (zip64 === false) {
      throw new Error(ERR_UNSUPPORTED_FORMAT);
    } else {
      zip64 = true;
    }
  }
  const endOfdirectoryArray = new Uint8Array(zip64 ? ZIP64_END_OF_CENTRAL_DIR_TOTAL_LENGTH : 22);
  const endOfdirectoryView = getDataView1(endOfdirectoryArray);
  offset = 0;
  if (zip64) {
    setUint321(endOfdirectoryView, 0, 101075792);
    setBigUint64(endOfdirectoryView, 4, BigInt(44));
    setUint16(endOfdirectoryView, 12, 45);
    setUint16(endOfdirectoryView, 14, 45);
    setUint321(endOfdirectoryView, 16, lastDiskNumber);
    setUint321(endOfdirectoryView, 20, diskNumber);
    setBigUint64(endOfdirectoryView, 24, BigInt(filesLength));
    setBigUint64(endOfdirectoryView, 32, BigInt(filesLength));
    setBigUint64(endOfdirectoryView, 40, BigInt(directoryDataLength));
    setBigUint64(endOfdirectoryView, 48, BigInt(directoryOffset));
    setUint321(endOfdirectoryView, 56, 117853008);
    setBigUint64(endOfdirectoryView, 64, BigInt(directoryOffset) + BigInt(directoryDataLength));
    setUint321(endOfdirectoryView, 72, lastDiskNumber + 1);
    const supportZip64SplitFile = getOptionValue1(zipWriter, options, "supportZip64SplitFile", true);
    if (supportZip64SplitFile) {
      lastDiskNumber = MAX_16_BITS;
      diskNumber = MAX_16_BITS;
    }
    filesLength = MAX_16_BITS;
    directoryOffset = MAX_32_BITS;
    directoryDataLength = MAX_32_BITS;
    offset += ZIP64_END_OF_CENTRAL_DIR_LENGTH + ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH;
  }
  setUint321(endOfdirectoryView, offset, 101010256);
  setUint16(endOfdirectoryView, offset + 4, lastDiskNumber);
  setUint16(endOfdirectoryView, offset + 6, diskNumber);
  setUint16(endOfdirectoryView, offset + 8, filesLength);
  setUint16(endOfdirectoryView, offset + 10, filesLength);
  setUint321(endOfdirectoryView, offset + 12, directoryDataLength);
  setUint321(endOfdirectoryView, offset + 16, directoryOffset);
  const commentLength = getLength(comment);
  if (commentLength) {
    if (commentLength <= 65535) {
      setUint16(endOfdirectoryView, offset + 20, commentLength);
    } else {
      throw new Error(ERR_INVALID_COMMENT);
    }
  }
  await writeData(writable, endOfdirectoryArray);
  if (commentLength) {
    await writeData(writable, comment);
  }
}
async function writeData(writable, array) {
  const streamWriter = writable.getWriter();
  await streamWriter.ready;
  writable.size += getLength(array);
  await streamWriter.write(array);
  streamWriter.releaseLock();
}
function getTimeNTFS(date) {
  if (date) {
    return (BigInt(date.getTime()) + BigInt(116444736e5)) * BigInt(1e4);
  }
}
function getOptionValue1(zipWriter, options, name, defaultValue) {
  const result = options[name] === UNDEFINED_VALUE ? zipWriter.options[name] : options[name];
  return result === UNDEFINED_VALUE ? defaultValue : result;
}
function getMaximumCompressedSize1(uncompressedSize) {
  return uncompressedSize + 5 * (Math.floor(uncompressedSize / 16383) + 1);
}
function setUint8(view, offset, value) {
  view.setUint8(offset, value);
}
function setUint16(view, offset, value) {
  view.setUint16(offset, value, true);
}
function setUint321(view, offset, value) {
  view.setUint32(offset, value, true);
}
function setBigUint64(view, offset, value) {
  view.setBigUint64(offset, value, true);
}
function arraySet(array, typedArray, offset) {
  array.set(typedArray, offset);
}
function getDataView1(array) {
  return new DataView(array.buffer);
}
function getLength(...arrayLikes) {
  let result = 0;
  arrayLikes.forEach((arrayLike) => arrayLike && (result += arrayLike.length));
  return result;
}
var importMeta = {
  url: "https://deno.land/x/zipjs@v2.7.29/lib/zip-fs.js",
  main: false
};
var baseURL;
try {
  baseURL = importMeta.url;
} catch (_error) {
}
configure({
  baseURL
});
e(configure);
configure({
  Deflate: ZipDeflate,
  Inflate: ZipInflate
});

// helpers/constants.js
var Constants = class {
  static AudioArray = ["audio omitted"];
  static ImageArray = ["image omitted"];
  static LaughArray = ["haha", "hahaha", "hahahaha", "hahah", "lol", "lmao", "lmfao", "hehe", "\u{1F606}", "\u{1F605}", "\u{1F602}", "\u{1F923}"];
  static LanguageDateTimeSeperators = [" klo"];
  static LanguageTimeIndicatorsAM = ["s ochtends", "s middags"];
  static LanguageTimeIndicatorsPM = ["s avonds", "s nachts"];
  static LanguageTimeIndicatorsToRemove = ["middernacht"];
  static EncryptionAndSubjectMessages = ["changed this", "created group", "end-to-end encrypted", "changed the subject to", "changed their phone number", "messages et les appels", "changement", "nachrichten und anrufe", "\xE4nderte den betreff in", "ihre telefonnummer ge\xE4ndert", "messaggi e chiamate", "cambiato l'argomento in", "cambiato il proprio numero di telefono", "berichten en oproepen", "veranderde het onderwerp in", "hun telefoonnummer hebben gewijzigd", "mensajes y llamadas", "cambi\xF3 el tema a", "cambiaron su n\xFAmero de tel\xE9fono", "meddelanden och samtal", " \xE4ndrade \xE4mnet till ", "\xE4ndrat telefonnummer", "beskeder og opkald", " \xE6ndrede emnet til ", "\xE6ndrede deres telefonnummer", "extremo a extremo", "fuera de este chat", "end-to-end", "added you"];
  static SkipWordsDanish = ["billede", "\u200Eaudio", "lyd udeladt", "billede", "den", "jeg", "til", "a", "du", "og", "s\xE5", "i", "af", "for", "min", "det", "p\xE5", "s\xE5", "er", "mig", "jeg", "dette", "det", "v\xE6re", "var", "har", "vi", "med", "men", "bare", "f\xE5", "ikke", "din", "hvis", "ved", "op", "kan", "ud", "hvad", "fik", "er", "g\xF8r", "som", "om", "alle", "jeg", "som", "nu", "jeg har", "g\xE5r", "det er", "hvordan", "hvorn\xE5r", "fra", "en", "tid", "jeg har", "jeg", "g\xE5", "eller", "yh", "v\xE6ret", "t\xE6nke", "dag", "g\xE5 til", "slukket", "havde", "behov", "se", "ved", "en", "virkelig", "han", "hun", "ham", "hende", "vil", "tilbage", "ogs\xE5", "gjorde", "nej", "ikke", "nogle", "det er", "g\xF8r", "ville", "de", "der", "nogen", "efter", "har", "udeladt", "medier", "<medier", "<medier udeladt>", "fordi", "vi er", "jeg", "\xE5h", "sagde", "ok", "ja", "okay", "ikke", "dem", "u", "din", "ikke", "besked", "ah", "at", "g\xE5", "ogs\xE5", "hvorfor", "hans", "endda", "kan ikke", "kan ikke", "er ikke", "er ikke", "selvom", "du er", "du er", "gjorde ikke", "gjorde ikke", "jeg har", "im", "dens", "?klisterm\xE6rke", "?savnet", "reagerede", "sendte", "syntes godt om"];
  static SkipWordsDutch = ["\u200Eafbeelding", "\u200Egeluid", "audio weggelaten", "afbeelding", "de", "naar", "jij", "en", "dan", "van", "voor", "mijn", "het", "op", "dus", "mij", "dit", "dat", "zijn", "hebben", "wij", "met", "maar", "zojuist", "krijgen", "niet", "jouw", "als", "bij", "omhoog", "kan", "uit", "wat", "gekregen", "zijn", "doen", "over", "alle", "als", "nu", "gaan", "hoe", "wanneer", "van", "een", "tijd", "gaan", "of", "geweest", "denken", "dag", "ga", "uit", "behoefte", "zien", "weten", "een", "echt", "hij", "zij", "hem", "haar", "zullen", "rug", "te", "deed", "sommige", "nee", "maken", "zou", "zij", "daar", "elk", "na", "heeft", "overgeslagen", "<media overgeslagen>", "daar", "omdat", "gezegd", "ja", "ok\xE9", "hen", "bericht", "bij", "gaan", "doen", "ook", "waarom", "zijn", "zelfs", "hoewel", "?gemist", "reageerde", "verzonden", "geliked"];
  static SkipWordsEnglish = ["sticker", "\u200Esticker", "\u200Eimage", "\u200Eaudio", "audio omitted", "image", "the", "i", "to", "a", "you", "and", "then", "in", "of", "for", "my", "it", "on", "so", "is", "me", "i\u2019m", "this", "that", "be", "was", "have", "we", "with", "but", "just", "get", "not", "your", "if", "at", "up", "can", "out", "what", "got", "are", "do", "like", "about", "all", "i'm", "as", "now", "i've", "going", "it\u2019s", "how", "when", "from", "one", "time", "i\u2019ve", "i\u2019ll", "go", "or", "yh", "been", "think", "day", "gonna", "off", "had", "need", "see", "know", "an", "really", "he", "she", "him", "her", "will", "back", "too", "did", "no", "don\u2019t", "some", "it's", "make", "would", "they", "there", "any", "after", "has", "omitted", "media", "<media", "<media omitted>", "because", "we're", "i'll", "oh", "said", "ok", "yeah", "okay", "don't", "them", "u", "ur", "dont", "message", "ah", "at", "go", "also", "why", "his", "even", "can't", "can\u2019t", "isn't", "isn\u2019t", "though", "you're", "you\u2019re", "didn't", "didn\u2019t", "i've", "im", "its", "?sticker", "?missed", "reacted", "sent", "liked", "ill", "coz", "cuz", "bc", "bcuz", "bcz", "&", "content"];
  static SkipWordsFrench = ["\u200El'audio", "audio omis", "la", "le", "je", "\xE0", "une", "un", "toi", "et", "alors", "dans", "de", "pour", "ma", "mon", "il", "sur", "donc", "est", "moi", "suis", "ce", "cette", "\xEAtre", "\xE9tait", "avoir", "nous", "avec", "mais", "juste", "obtenir", "pas", "ton", "si", "peut", "dehors", "dehors", "sont", "faire", "comme", "tout", "toute", "maintenant", "j'ai", "c'est", "comment", "quand", "depuis", "une", "un", "temps", "j\u2019ai", "aller", "ou", "ouais", "pense", "jour", "d\xE9sactiv\xE9", "avait", "besoin", "voir", "savoir", "un", "vraiment", "il", "elle", "lui", "son", "volont\xE9", "dos", "aussi", "quelques", "non", "quelques", "c\u2019est", "faire", "serait", "ils", "elles", "l\xE0", "apr\xE8s", "omis", "m\xE9dias", "<m\xE9dias", "<m\xE9dias omis>", "l\xE0", "dit", "dite", "eux", "que", "tu", "votre", "en", "les", "des", "va", "cest", "au", "te", "vous", "oui", "fait", "aussi", "pourquoi", "son", "m\xEAme", "cependant", "?autocollant", "?manqu\xE9e", "?manqu\xE9", "a r\xE9agi", "envoy\xE9", "aim\xE9"];
  static SkipWordsGerman = ["dich", "noch", "auf", "schon", "bin", "dass", "\u200Ebild", "\u200Eaudio", "audio weggelassen", "bild", "die", "ich", "zu", "du", "und", "dann", "von", "f\xFCr", "mein", "es", "an", "ist", "mich", "ich bin", "das", "sei", "war", "haben", "wir", "mit", "aber", "nur", "erhalten", "nicht", "dein", "with", "wenn", "bei", "hoch", "d\xFCrfen", "aus", "bekommen", "sind", "tun", "wie", "um", "alle", "tun", "als", "jetzt", "ich habe", "gehen", "es ist", "wie", "wann", "aus", "eins", "zeit", "gehen", "oder", "arbeiten", "jh", "gewesen", "denken", "hatte", "brauchen", "sehen", "wissen", "ein", "wirklich", "er", "sie", "ihn", "ihr", "wille", "zur\xFCck", "zu", "tat", "manche", "nein", "es ist", "machen", "w\xFCrde", "sie", "dort", "beliebig", "nach", "hat", "weggelassen", "medien", "<medien", "<medien weggelassen>", "da", "er", "sie", "weil", "sagte", "ja", "ihnen", "dein", "gehen", "auch", "warum", "sein", "sogar", "kippen", "obwohl", "?aufkleber", "?verpasst", "reagiert", "gesendet", "geliked", "voll", "hab", "dir", "mir", "sehr", "mal", "heute", "hast"];
  static SkipWordsItalian = ["immagine", "\u200Eaudio", "audio omesso", "immagine", "il", "io", "a", "a", "tu", "e", "poi", "in", "di", "per", "mio", "esso", "su", "cos\xEC", "\xE8", "io", "sono", "questo", "quello", "essere", "era", "avere", "noi", "con", "ma", "solo", "ottenere", "non", "tuo", "se", "a", "su", "pu\xF2", "fuori", "cosa", "ottenuto", "sono", "fare", "come", "circa", "tutti", "sono", "come", "ora", "ho", "andando", "\xE8", "come", "quando", "da", "uno", "tempo", "ho", "io", "andr\xF2", "o", "yh", "stato", "pensa", "giorno", "andr\xF2", "spento", "aveva", "bisogno", "vedere", "sapere", "un", "davvero", "lui", "lei", "lei", "lui", "sar\xE0", "indietro", "troppo", "fatto", "no", "non", "alcuni", "\xE8", "fare", "vorrebbe", "loro", "l\xEC", "qualsiasi", "dopo", "ha", "omesso", "media", "<media", "<media omessi>", "perch\xE9", "siamo", "io", "oh", "detto", "ok", "s\xEC", "va bene", "non", "loro", "u", "tuo", "non", "messaggio", "ah", "a", "andare", "anche", "perch\xE9", "suo", "anche", "non posso", "non posso", "non \xE8", "non \xE8", "per\xF2", "sei", "sei", "non l'ho fatto", "non l'ho fatto", "ho", "im", "suo", "?adesivo", "?mancato", "ha reagito", "inviato", "mi \xE8 piaciuto"];
  static SkipWordsRussian = ["\u0432", "\u043D\u0435", "\u0438", "\u044F", "\u043D\u0430", "\u0447\u0442\u043E", "\u0441", "\u043A\u0430\u043A", "\u0442\u044B", "\u0443", "\u0430", "\u043D\u043E", "\u043F\u043E", "\u0443\u0436\u0435", "\u044D\u0442\u043E", "\u043D\u0443", "\u0442\u0430\u043A", "\u0442\u0430\u043C", "\u0442\u043E\u043B\u044C\u043A\u043E", "\u0436\u0435", "\u0442\u043E\u0436\u0435", "\u0435\u0441\u043B\u0438", "\u0432\u043E\u0442", "\u043C\u043D\u0435", "\u043A", "\u0434\u043E", "\u0432\u0441\u0435", "\u0442\u043E", "\u043C\u0435\u043D\u044F", "\u0438\u043B\u0438", "\u0437\u0430", "\u0442\u0435\u0431\u044F", "\u0435\u0449\u0435", "\u043C\u044B", "\u0431\u0443\u0434\u0435\u0442", "\u0435\u0449\u0451", "\u043F\u0440\u044F\u043C", "\u043D\u0430\u0434\u043E"];
  static SkipWordsSpanish = ["\u200Eimagen", "\u200Eaudio", "audio omitido", "imagen", "el", "a", "t\xFA", "y", "entonces", "en", "de", "para", "mi", "\xE9l", "en", "entonces", "es", "soy", "este", "eso", "ser", "era", "tener", "nosotros", "con", "pero", "justo", "conseguir", "no", "su", "si", "en", "arriba", "poder", "afuera", "qu\xE9", "consigui\xF3", "son", "hacer", "como", "todo", "ahora", "tengo", "yendo", "es", "c\xF3mo", "cuando", "de", "uno", "tiempo", "ir", "o", "estado", "pensar", "d\xEDa", "apagado", "ten\xEDa", "necesidad", "ver", "saber", "un", "realidad", "\xE9l", "ella", "su", "voluntad", "atr\xE1s", "tambi\xE9n", "hizo", "alguno", "hacer", "har\xEDa", "ellos", "cualquier", "despu\xE9s", "tiene", "omitido", "somos", "vaya", "dicho", "s\xED", "mensaje", "en", "ir", "tambi\xE9n", "su", "incluso", "aunque", "eres", "?pegatina", "?omitido", "reaccion\xF3", "envi\xF3", "me gust\xF3"];
  static SkipWordsSwedish = ["image", "\u200Eaudio", "ljud utel\xE4mnat", "image", "the", "i", "to", "a", "du", "och", "d\xE5", "i", "av", "f\xF6r", "min", "det", "p\xE5", "s\xE5", "\xE4r", "mig", "jag", "det", "det", "var", "har", "vi", "med", "men", "bara", "f\xE5", "inte", "din", "om", "vid", "upp", "kan", "ut", "vad", "fick", "\xE4r", "g\xF6r", "som", "om", "alla", "jag", "som", "nu", "jag", "g\xE5r", "det", "hur", "n\xE4r", "fr\xE5n", "en", "tid", "jag", "jag", "g\xE5", "eller", "yh", "varit", "tror", "dag", "ska", "av", "hade", "beh\xF6ver", "se", "vet", "en", "verkligen", "han", "hon", "honom", "henne", "kommer", "tillbaka", "ocks\xE5", "gjorde", "nej", "inte", "n\xE5gra", "det", "det", "skulle", "de", "d\xE4r", "n\xE5gon", "efter", "har", "utel\xE4mnade", "media", "<media", "<media utel\xE4mnade>", "eftersom", "vi", "jag", "\xE5h", "sa", "ok", "ja", "okej", "inte", "dem", "u", "din", "inte", "meddelande", "ah", "vid", "g\xE5", "\xE4ven", "\xE4ven", "varf\xF6r", "hans", "\xE4ven", "kan inte", "kan inte", "\xE4r inte", "\xE4r inte", "men", "du", "du'\xE4r", "gjorde inte", "gjorde inte", "jag", "im", "dess", "?klisterm\xE4rke", "?missade", , "reagerade", "skickade", "gillade"];
  static SkipWordsSymbols = ["\u200Evideo", "\u200Eimage", "\u200Egif", "gif", "x", "xx", "xxx", "xxxx", "xxxxx", "xxxxxx", "xxxxxxx", "xxxxxxxx", "xxxxxxxxx", "xxxxxxxxxx", "xxxxxxxxxxx", "xxxxxxxxxxxx", "xxxxxxxxxxxxx", "xxxxxxxxxxxxxx", "xxxxxxxxxxxxxxx", "-", "]", "[", "/", "PM", "AM", "am", "pm", "am]", "pm]", "AM]", "PM]", "<", ">", "", "false", "true", "[]", "(file", "exporting", "settings", "data", "change", "<?this", "<this", "?<this", "<?this", "\u200E<this", "text"];
  static SwearWordsEnglish = ["fuck", "shit", "crap", "bloody", "cunt", "fucking", "shitting", "shat", "fuckk", "fuuck", "twat", "bollocks"];
  static SwearWordsFrench = ["merde", "sanglant"];
  static SwearWordsGerman = ["fotze"];
  static SwearWordsItalian = ["cazzo", "merda", "sanguinoso", "fica", "caga"];
  static SwearWordsSpanish = ["joder", "mierda", "maldito", "co\xF1o", "follar", "joder", "tonter\xEDas"];
  static SwearWordsSwedish = ["knulla", "skit", "blodig", "skita", "fitta"];
  static SwearWordsCollection = [this.SwearWordsEnglish, this.SwearWordsFrench, this.SwearWordsGerman, this.SwearWordsItalian, this.SwearWordsItalian, this.SwearWordsSpanish, this.SwearWordsSwedish];
  static FileTypes = {
    Json: "application/json",
    Text: "text/plain",
    Zip: "application/zip",
    ZipCompressed: "application/x-zip-compressed"
  };
  static Platform = {
    IMessage: "IMESSAGE",
    Meta: "META",
    Telegram: "TELEGRAM",
    WhatsApp: "WHATSAPP"
  };
  static RegExPatterns = {
    Dashes: /\//gm,
    Hyphens: /-/gm,
    LanguageTimeIndicatorsAM: [/s ochtends/gm, /s middags/gm],
    LanguageTimeIndicatorsPM: [/s avonds/gm, /s nachts/gm],
    Numbers: /([0-9])+/g,
    NotSquareBrackets: /[^\[\]]/g,
    PeriodsNextToIntegers: /(?<![a-zA-Z])\.+(?![a-zA-Z])/g,
    Punctuation: /[!?,.:;_)]$/g,
    ReturnCarriage: /[\r\n]+|\.|[\r\n]+$/g,
    StartsWithDate: /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)(\d{2}|\d{4}), ([0-9][0-9]):([0-9][0-9]) -/g,
    Timestamp1: /\[(.*?)\]/,
    Timestamp2: /\d{2}\/\d{2}\/\d{4}, \d{2}.\d{2}/
  };
};

// controllers/converters.js
var import_utf82 = __toESM(require_utf8());
var Converters = class {
  static GenerateChatObjectsFromIMessage(strippedChatString) {
    const messages = strippedChatString.split("\r\n\r\n----------------------------------------------------\r").filter(Boolean);
    const parsedMessages = messages.map((message) => {
      const lines = message.trim().split("\n").filter(Boolean);
      const authorLine = lines[0];
      const dateTimeLine = lines[1];
      const contentLines = lines.slice(2).join("\n").trim();
      const [date, time, direction] = dateTimeLine.split(" ");
      const [year, month, day] = date.split("-");
      const formattedDate = `${day}/${month}/${year}`;
      const author = direction === "to" ? "Enter Your Name Here" : authorLine;
      return {
        Author: author,
        Date: formattedDate,
        Time: time,
        MessageBody: contentLines
      };
    });
    return parsedMessages;
  }
  static GenerateChatObjectsFromDiscord(jsonString) {
    const parsedData = [];
    var jsObj = JSON.parse(jsonString);
    for (let i = 0; i < jsObj.length; i++) {
      let currentMessage = jsObj[i];
      let convertedDate = GetDateFromTimestamp(currentMessage.timestamp);
      let convertedTime = GetTimeFromTimestamp(currentMessage.timestamp);
      if (currentMessage.type != 0 && currentMessage.content != "" && currentMessage.content != null) {
        continue;
      }
      try {
        currentMessage.content = import_utf8.decode(currentMessage.content);
      } catch {
        currentMessage.content = import_utf8.decode(import_utf8.encode(currentMessage.content));
      }
      const messageModel = {
        Date: convertedDate,
        Time: convertedTime,
        Author: currentMessage.author.global_name,
        MessageBody: currentMessage.content
      };
      parsedData.push(messageModel);
    }
    return parsedData.reverse();
  }
  static GenerateChatObjectsFromMeta(jsonString) {
    const parsedData = [];
    var jsObj = JSON.parse(jsonString);
    const jsonFormat = DetermineJsonFormat(jsObj);
    let timestampKey = jsonFormat == "formatOne" ? "timestamp_ms" : "timestamp";
    let contentKey = jsonFormat == "formatOne" ? "content" : "text";
    let senderKey = jsonFormat == "formatOne" ? "sender_name" : "senderName";
    for (let i = 0; i < jsObj.messages.length; i++) {
      let currentMessage = jsObj.messages[i];
      let convertedDate = GetDateFromTimestamp2(currentMessage[timestampKey]);
      let convertedTime = GetTimeFromTimestamp2(currentMessage[timestampKey]);
      if (currentMessage[contentKey] != null && currentMessage[contentKey] != void 0) {
        try {
          currentMessage[contentKey] = import_utf82.decode(currentMessage[contentKey]);
        } catch {
          currentMessage[contentKey] = import_utf82.decode(import_utf82.encode(currentMessage[contentKey]));
        }
      }
      const messageModel = {
        Date: convertedDate,
        Time: convertedTime,
        Author: currentMessage[senderKey],
        MessageBody: currentMessage[contentKey]
      };
      if (currentMessage.share != void 0) {
        messageModel.MessageBody = "Shared a link";
      } else if (currentMessage.photos != void 0) {
        messageModel.MessageBody = "Sent a photo";
      } else if (currentMessage.gifs != void 0) {
        messageModel.MessageBody = "Sent a GIF";
      } else if (currentMessage.videos != void 0) {
        messageModel.MessageBody = "Sent a video";
      } else if (currentMessage.audio_files != void 0) {
        messageModel.MessageBody = "Sent an audio file";
      } else if (currentMessage.sticker != void 0) {
        messageModel.MessageBody = "Sent a sticker";
      } else if (currentMessage.files != void 0) {
        messageModel.MessageBody = "Sent a file";
      }
      if (!currentMessage.is_unsent && messageModel.MessageBody != void 0 && !messageModel.MessageBody.includes("connected on messenger") && messageModel.Author != "meta ai") {
        parsedData.push(messageModel);
      }
    }
    return parsedData.reverse();
  }
  static GenerateChatObjectsFromTelegram(jsonString) {
    const parsedData = [];
    var jsObj = JSON.parse(jsonString);
    for (let i = 0; i < jsObj.messages.length; i++) {
      let currentMessage = jsObj.messages[i];
      const unixInMilliseconds = currentMessage.date_unixtime * 1e3;
      let convertedDate = GetDateFromTimestamp2(unixInMilliseconds);
      let convertedTime = GetTimeFromTimestamp2(unixInMilliseconds);
      if (Array.isArray(currentMessage.text)) {
        currentMessage.text = currentMessage.text[0];
      }
      if (currentMessage.text != null && currentMessage.text != void 0) {
        try {
          currentMessage.text = import_utf82.decode(currentMessage.text);
        } catch {
          currentMessage.text = import_utf82.decode(import_utf82.encode(currentMessage.text));
        }
      }
      const messageModel = {
        Date: convertedDate,
        Time: convertedTime,
        Author: currentMessage.from,
        MessageBody: currentMessage.text
      };
      if (currentMessage.photo != void 0) {
        messageModel.MessageBody = "Sent a photo";
      } else if (currentMessage.animation != void 0) {
        messageModel.MessageBody = "Sent a GIF";
      } else if (currentMessage.media_type == "video_file") {
        messageModel.MessageBody = "Sent a video";
      } else if (currentMessage.media_type == "audio_file") {
        messageModel.MessageBody = "Sent an audio file";
      } else if (currentMessage.media_type == "sticker") {
        messageModel.MessageBody = "Sent a sticker";
      } else if (currentMessage.contact_information != void 0) {
        messageModel.MessageBody = "Sent a contact";
      } else if (currentMessage.location_information != void 0) {
        messageModel.MessageBody = "Sent a location";
      } else if (currentMessage.media_type == "video_message") {
        messageModel.MessageBody = "Sent a video message";
      } else if (currentMessage.media_type == "voice_message") {
        messageModel.MessageBody = "Sent a voice message";
      } else if (currentMessage.file != void 0) {
        messageModel.MessageBody = "Sent a file";
      }
      if (messageModel.MessageBody != null && messageModel.MessageBody != void 0 && messageModel.Author != null && messageModel.Author != void 0) {
        parsedData.push(messageModel);
      }
    }
    return parsedData;
  }
  static GenerateChatObjectsFromWhatsApp(strippedChatString) {
    const linesArray = this.GenerateStringArrayFromStrippedChatString(strippedChatString);
    const parsedData = [];
    for (let i = 0; i < linesArray.length; i++) {
      let message = linesArray[i];
      if (message != "") {
        let m = message.match(Constants.RegExPatterns.StartsWithDate);
        if (m != null) {
          let date = message.substr(0, 10);
          let time = message.substr(12, 5);
          let tempSubstr = message.substr(message.indexOf("-") + 2);
          let authorLength = tempSubstr.indexOf(":");
          let author = message.substr(message.indexOf("-") + 2, authorLength);
          let trimmedAuthor = author.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2580-\u27BF]|\uD83E[\uDD10-\uDDFF]/g, "").replace(/[^\x20-\x7E]/g, "").trim();
          let messageBody = message.substr(message.indexOf("-") + 4 + authorLength);
          const messageModel = {
            Date: date,
            Time: time,
            Author: trimmedAuthor,
            MessageBody: messageBody
          };
          if (author != "") {
            parsedData.push(messageModel);
          }
        } else {
          let latestEntry = parsedData[parsedData.length - 1];
          latestEntry.MessageBody += "\n" + message;
          parsedData[parsedData.length - 1] = latestEntry;
        }
      }
    }
    return parsedData;
  }
  static GenerateStringArrayFromStrippedChatString(strippedChatString) {
    let linesArray = new Array();
    linesArray = strippedChatString.split("\n");
    linesArray = StandardiseCharacters(linesArray);
    linesArray = StandardiseDateFormat(linesArray);
    linesArray = StandardiseClockFormat(linesArray);
    return linesArray;
  }
};

// controllers/datacontroller.js
async function GenerateChatChartModel(uploadedFiles) {
  let cumulativeStrippedChatString = "";
  const allChatObjects = new Array();
  for (const uploadedFile of uploadedFiles) {
    let chatObjects = new Array();
    const fileContent = await GetContentFromFile(uploadedFile);
    const platform = DeterminePlatform(uploadedFile, fileContent);
    const strippedChatString = GenerateLowerCaseChat(fileContent, platform);
    cumulativeStrippedChatString += strippedChatString;
    if (platform == Constants.Platform.Telegram) {
      chatObjects = Converters.GenerateChatObjectsFromTelegram(fileContent);
    } else if (platform == Constants.Platform.Meta) {
      chatObjects = Converters.GenerateChatObjectsFromMeta(fileContent);
    } else if (platform == Constants.Platform.WhatsApp) {
      chatObjects = Converters.GenerateChatObjectsFromWhatsApp(strippedChatString);
    } else {
      chatObjects = Converters.GenerateChatObjectsFromIMessage(strippedChatString);
    }
    for (const chatObject of chatObjects) {
      allChatObjects.push(chatObject);
    }
  }
  const chatTitle = allChatObjects[0].Author;
  const sortedChatObjects = SortChatObjects(allChatObjects);
  const chattersArray = GenerateChatters(sortedChatObjects);
  return {
    WholeChatString: cumulativeStrippedChatString,
    ArrayOfMessageObjs: sortedChatObjects,
    Chatters: chattersArray,
    ChatTitle: chatTitle
  };
}
async function Unpack(input) {
  const uploadedFiles = Array.from(input);
  let unpackedFilesAndEntries = new Array();
  for (const uploadedFile of uploadedFiles) {
    if (uploadedFile.type == Constants.FileTypes.Zip || uploadedFile.type == Constants.FileTypes.ZipCompressed) {
      const extractedFiles = await GetZippedEntries(uploadedFile);
      for (let i = 0; i < extractedFiles.length; i++) {
        let extractedFile = extractedFiles[i];
        if (extractedFile.filename.includes(".json") || extractedFile.filename.includes(".txt")) {
          unpackedFilesAndEntries.push(extractedFile);
        }
      }
    } else {
      unpackedFilesAndEntries.push(uploadedFile);
    }
  }
  return unpackedFilesAndEntries;
}
function RemoveUnwantedJsonCharacters(str) {
  return str.replace(/[\n\r]+/g, "").replace("\n", "").replace("{\n", "").replace("},\n", "").replace("[\n", "").replace("}\n", "").replace("],\n", "").replace(/[{}]/g, "").replace(/['"]+/g, "").replace(/generic/g, "");
}
function GenerateChatters(chatObjArr) {
  const chatters = /* @__PURE__ */ new Set();
  for (const element of chatObjArr) {
    chatters.add(element.Author);
  }
  return Array.from(chatters);
}
function DeterminePlatform(uploadedFileOrEntry, fileContent) {
  const beginningSnippet = fileContent.substr(0, 50);
  if (beginningSnippet.includes("------------------------")) {
    return Constants.Platform.IMessage;
  }
  if (uploadedFileOrEntry.type == Constants.FileTypes.Text || "filename" in uploadedFileOrEntry && uploadedFileOrEntry.filename.includes(".txt")) {
    return Constants.Platform.WhatsApp;
  }
  if (beginningSnippet.includes("participants")) {
    return Constants.Platform.Meta;
  } else {
    return Constants.Platform.Telegram;
  }
}
function DetermineJsonFormat(jsonData) {
  if (Array.isArray(jsonData.participants)) {
    if (jsonData.participants.every((participant) => typeof participant === "object" && "name" in participant)) {
      return "formatOne";
    }
    if (jsonData.participants.every((participant) => typeof participant === "string")) {
      return "formatTwo";
    }
  }
  return "unknownFormat";
}
function GenerateLowerCaseChat(fileContent, platform) {
  if (platform == Constants.Platform.WhatsApp || platform == Constants.Platform.IMessage) {
    return fileContent.toLowerCase();
  } else {
    return RemoveUnwantedJsonCharacters(fileContent.toLowerCase());
  }
}
async function GetZippedEntries(uploadedFile) {
  const zipFileReader = new BlobReader(uploadedFile);
  const zipReader = new ZipReader(zipFileReader);
  const entries = await zipReader.getEntries();
  await zipReader.close();
  return entries;
}
async function GetContentFromFile(uploadedFile) {
  const isAnEntry = uploadedFile.filename != void 0;
  let fileContent;
  if (isAnEntry) {
    fileContent = await uploadedFile.getData(new TextWriter());
  } else {
    const zipFileWriter = new BlobWriter();
    const helloWorldReader = new BlobReader(uploadedFile);
    const zipWriter = new ZipWriter(zipFileWriter);
    await zipWriter.add("chat-thing.txt", helloWorldReader);
    await zipWriter.close();
    const zipFileBlob = await zipFileWriter.getData();
    const zipFileReader = new BlobReader(zipFileBlob);
    const zipReader = new ZipReader(zipFileReader);
    const entries = await zipReader.getEntries();
    fileContent = await entries[0].getData(new TextWriter());
    await zipReader.close();
  }
  return fileContent;
}
function SortChatObjects(chatObjects) {
  return chatObjects.sort((a, b) => {
    const aDate = ConvertChatObjDateAndTimeToDateTime(a);
    const bDate = ConvertChatObjDateAndTimeToDateTime(b);
    return aDate - bDate;
  });
}
function ReplaceLanguageTimeSeperators(lineString) {
  let buffer = lineString;
  for (let seperator of Constants.LanguageTimeIndicatorsAM) {
    if (lineString.includes(seperator)) {
      const indexOfReplacement = lineString.indexOf(seperator) - 1;
      buffer = ReplaceUsingIndexAndInput(buffer, indexOfReplacement, seperator, "am");
      break;
    }
  }
  for (let seperator of Constants.LanguageTimeIndicatorsPM) {
    if (lineString.includes(seperator)) {
      const indexOfReplacement = lineString.indexOf(seperator) - 1;
      buffer = ReplaceUsingIndexAndInput(buffer, indexOfReplacement, seperator, "pm");
      break;
    }
  }
  return buffer;
}
function ReplaceUsingIndexAndInput(input, index, stringToReplace, replacement) {
  const firstHalf = input.substring(0, index);
  const secondHalf = input.substring(index + stringToReplace.length + 1);
  return firstHalf + replacement + secondHalf;
}
function GetTimeFromTimestamp2(timestamp) {
  const date = new Date(timestamp);
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}
function ConvertChatObjDateAndTimeToDateTime(chatObj) {
  const dateString = chatObj.Date;
  const timeString = chatObj.Time;
  const dateStringArray = dateString.split("/");
  const day = dateStringArray[0];
  const month = dateStringArray[1];
  const year = dateStringArray[2];
  const dateTimeString = `${year}-${month}-${day}T${timeString}:00`;
  return new Date(dateTimeString);
}
function IsProperLine(lineString) {
  let dashCount = (lineString.match(Constants.RegExPatterns.Dashes) || []).length;
  let hyphenCount = (lineString.match(Constants.RegExPatterns.Hyphens) || []).length;
  return hyphenCount >= 2 || dashCount >= 2;
}
function GetClockFormat(linesArray) {
  let i = 0;
  while (i < linesArray.length) {
    let lineString = linesArray[i];
    if (lineString.length > 0 && lineString.includes(":")) {
      if (lineString[0] == String.fromCharCode(8206)) {
        lineString = lineString.substr(1);
      }
      lineString = ReplaceLanguageTimeSeperators(lineString);
      if (lineString.includes("am -") || lineString.includes("pm -") || lineString.includes("p.m. -") || lineString.includes("a.m. -")) {
        return "12";
      } else {
        return "24";
      }
    }
    i++;
  }
}
function GetDateFormat(linesArray) {
  let i = 0;
  while (i < linesArray.length) {
    let lineString = linesArray[i];
    if (lineString.length > 0 && IsProperLine(lineString)) {
      const dateSlashSplit = lineString.split("/");
      const firstDateSection = dateSlashSplit[0];
      const secondDateSection = dateSlashSplit[1];
      if (parseInt(firstDateSection) > 2e3) {
        return "YEARFIRST";
      }
      if (parseInt(firstDateSection) > 12) {
        return "ENG";
      }
      if (parseInt(secondDateSection) > 12) {
        return "USA";
      }
    }
    i++;
  }
}
function GetDateFromTimestamp2(timestamp) {
  const date = new Date(timestamp);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}
function GetDateSeparator(input) {
  let maxCount = 0;
  let separator = "";
  const numberOfFullStops = input.replace(/[^.]/g, "").length;
  const numberOfSlashes = input.replace(/[^/]/g, "").length;
  const numberOfHyphens = input.replace(/[^-]/g, "").length;
  const counts = [{ key: ".", value: numberOfFullStops }, { key: "/", value: numberOfSlashes }, { key: "-", value: numberOfHyphens }];
  counts.forEach((x) => {
    if (x.value > maxCount) {
      maxCount = x.value;
      separator = x.key;
    }
  });
  return separator;
}
function StandardiseCharacters(linesArray) {
  for (var i = 0; i < linesArray.length; i++) {
    let currentLine = StripInvisibleChar(linesArray[i]);
    if (currentLine.length == 0) {
      linesArray[i] = "";
      continue;
    }
    if (currentLine.replace(/[^\[\]]/g, "").length == 4 || currentLine.includes("[mobile]") || currentLine.includes("[name]")) {
      linesArray[i] = "";
      for (var j = 1; j < 20; j++) {
        linesArray[i + j] = "";
        j++;
      }
      i += 20;
      continue;
    }
    if (currentLine.includes("[ ]")) {
      linesArray[i] = "";
      for (var j = 1; j < 40; j++) {
        linesArray[i + j] = "";
        j++;
      }
      i += 40;
      continue;
    }
    currentLine = StandardiseDateSeparator(currentLine);
    currentLine = StandardiseDateTimeSeparator(currentLine);
    currentLine = StandardiseTimeSeparator(currentLine);
    currentLine = StandardiseDateTimeMessageSeparator(currentLine);
    linesArray[i] = currentLine;
  }
  return linesArray;
}
function StripInvisibleChar(input) {
  if (input[0] == String.fromCharCode(8206)) {
    return input.substr(1);
  } else {
    return input;
  }
}
function StandardiseClockFormat(linesArray) {
  const hourLookupTable = {
    "1": "13",
    "2": "14",
    "3": "15",
    "4": "16",
    "5": "17",
    "6": "18",
    "7": "19",
    "8": "20",
    "9": "21",
    "10": "22",
    "11": "23"
  };
  const clockFormat = GetClockFormat(linesArray);
  let i = 0;
  while (i < linesArray.length) {
    let currentLine = linesArray[i];
    if (currentLine.length > 0 && currentLine.includes(":") && currentLine.indexOf("/") == 2) {
      currentLine = ReplaceLanguageTimeSeperators(currentLine);
      const commaIndex = currentLine.indexOf(", ");
      const colonIndex = currentLine.indexOf(":");
      const dashIndex = currentLine.indexOf(" - ");
      let hourString = currentLine.substring(commaIndex + 2, colonIndex);
      let minuteString = currentLine.substring(colonIndex + 1, colonIndex + 3);
      if (clockFormat == "12") {
        if (currentLine.toLowerCase().includes("am -") || currentLine.toLowerCase().includes("a.m. -")) {
          if (hourString.length == 1) {
            hourString = "0" + hourString;
          } else if (hourString == "12") {
            hourString = "00";
          }
        } else {
          hourString = hourLookupTable[hourString] || "12";
        }
      }
      const firstHalf = currentLine.substring(0, commaIndex + 2);
      const secondHalf = currentLine.substring(dashIndex);
      hourString = hourString.length == 1 ? "0" + hourString : hourString;
      const timeFormatted = `${hourString}:${minuteString}`;
      linesArray[i] = firstHalf + timeFormatted + secondHalf;
    }
    i++;
  }
  return linesArray;
}
function StandardiseDateFormat(linesArray) {
  const dateFormat = GetDateFormat(linesArray);
  let i = 0;
  while (i < linesArray.length) {
    let currentLine = linesArray[i];
    let beginningOfLine = currentLine.substr(0, 30);
    try {
      if (beginningOfLine.length > 0 && beginningOfLine.includes(":") && beginningOfLine.includes(",") && beginningOfLine.includes("-") && (beginningOfLine.indexOf("/") == 1 || beginningOfLine.indexOf("/") == 2 || beginningOfLine.indexOf("/") == 4)) {
        const dateString = currentLine.split(",")[0];
        let dayString = "";
        let monthString = "";
        let yearString = "";
        if (dateFormat == "ENG") {
          dayString = dateString.split("/")[0].length == 2 ? dateString.split("/")[0] : "0" + dateString.split("/")[0];
          monthString = dateString.split("/")[1].length == 2 ? dateString.split("/")[1] : "0" + dateString.split("/")[1];
          yearString = dateString.split("/")[2].length == 4 ? dateString.split("/")[2] : "20" + dateString.split("/")[2];
        } else if (dateFormat == "USA") {
          dayString = dateString.split("/")[1].length == 2 ? dateString.split("/")[1] : "0" + dateString.split("/")[1];
          monthString = dateString.split("/")[0].length == 2 ? dateString.split("/")[0] : "0" + dateString.split("/")[0];
          yearString = dateString.split("/")[2].length == 4 ? dateString.split("/")[2] : "20" + dateString.split("/")[2];
        } else {
          dayString = dateString.split("/")[2].length == 2 ? dateString.split("/")[2] : "0" + dateString.split("/")[2];
          monthString = dateString.split("/")[1].length == 2 ? dateString.split("/")[1] : "0" + dateString.split("/")[0];
          yearString = dateString.split("/")[0].length == 4 ? dateString.split("/")[0] : "20" + dateString.split("/")[0];
        }
        const dateFormatted = `${dayString}/${monthString}/${yearString}`;
        const newLine = currentLine.replace(dateString, dateFormatted);
        linesArray[i] = newLine;
      }
      i++;
    } catch {
      i++;
    }
  }
  return linesArray;
}
function StandardiseDateSeparator(input) {
  let dateLine = input.substr(0, 11);
  let restOfLine = input.substr(11);
  const dateSeparator = GetDateSeparator(dateLine);
  if (dateSeparator == "-") {
    return dateLine.replaceAll("-", "/") + restOfLine;
  } else if (dateSeparator == ".") {
    return dateLine.replaceAll(".", "/") + restOfLine;
  } else {
    return input;
  }
}
function StandardiseDateTimeMessageSeparator(input) {
  let dateLine = input.substr(0, 11);
  if (dateLine.includes("[")) {
    return input.replace("[", "").replace("]", " -");
  } else {
    return input;
  }
}
function StandardiseDateTimeSeparator(input) {
  let buffer = input;
  let dateTime = input.substr(0, 18);
  for (let wordSeperator of Constants.LanguageDateTimeSeperators) {
    if (dateTime.includes(wordSeperator)) {
      buffer = input.replace(wordSeperator, ",");
      dateTime = dateTime.replace(wordSeperator, ",");
      break;
    }
  }
  if (!dateTime.includes(",")) {
    buffer = input.replace(" ", ", ");
  }
  return buffer;
}
function StandardiseTimeSeparator(str) {
  const beginningOfLine = str.substr(0, 24);
  const timestamp1Match = beginningOfLine.match(Constants.RegExPatterns.Timestamp1);
  const timestamp2Match = beginningOfLine.match(Constants.RegExPatterns.Timestamp2);
  if (timestamp1Match) {
    const timestamp = timestamp1Match[1];
    const spaceDelimitedArray = timestamp.split(" ");
    const datePart = spaceDelimitedArray[0];
    const timePart = spaceDelimitedArray[1].replace(Constants.RegExPatterns.PeriodsNextToIntegers, ":");
    let formattedTimestamp;
    if (spaceDelimitedArray.length > 2) {
      formattedTimestamp = `${datePart} ${timePart} ${spaceDelimitedArray[2]}`;
    } else {
      formattedTimestamp = `${datePart} ${timePart}`;
    }
    return str.replace(timestamp, formattedTimestamp);
  } else if (timestamp2Match) {
    const timestamp = timestamp2Match[0];
    const spaceDelimitedArray = timestamp.split(" ");
    const datePart = spaceDelimitedArray[0];
    const timePart = spaceDelimitedArray[1].replace(Constants.RegExPatterns.PeriodsNextToIntegers, ":");
    let formattedTimestamp;
    if (spaceDelimitedArray.length > 2) {
      formattedTimestamp = `${datePart} ${timePart} ${spaceDelimitedArray[2]}`;
    } else {
      formattedTimestamp = `${datePart} ${timePart}`;
    }
    return str.replace(timestamp, formattedTimestamp);
  } else {
    return str;
  }
}

// helpers/emojiregex.js
var EmojiRegex = class {
  static Pattern = /(?:\ud83e\uddd1\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c\udffc|\ud83e\uddd1\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c\udffd|\ud83e\uddd1\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c\udffe|\ud83e\uddd1\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c\udfff|\ud83e\uddd1\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c\udffb|\ud83e\uddd1\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c\udffd|\ud83e\uddd1\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c\udffe|\ud83e\uddd1\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c\udfff|\ud83e\uddd1\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c\udffb|\ud83e\uddd1\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c\udffc|\ud83e\uddd1\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c\udffe|\ud83e\uddd1\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c\udfff|\ud83e\uddd1\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c\udffb|\ud83e\uddd1\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c\udffc|\ud83e\uddd1\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c\udffd|\ud83e\uddd1\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c\udfff|\ud83e\uddd1\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c\udffb|\ud83e\uddd1\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c\udffc|\ud83e\uddd1\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c\udffd|\ud83e\uddd1\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83e\uddd1\ud83c\udffe|\ud83d\udc69\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffb|\ud83d\udc69\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffc|\ud83d\udc69\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffd|\ud83d\udc69\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffe|\ud83d\udc69\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udfff|\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffb|\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffc|\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffd|\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffe|\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udfff|\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffb|\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffc|\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffd|\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffe|\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udfff|\ud83d\udc69\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffb|\ud83d\udc69\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffc|\ud83d\udc69\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffd|\ud83d\udc69\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffe|\ud83d\udc69\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udfff|\ud83d\udc69\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffb|\ud83d\udc69\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffc|\ud83d\udc69\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffd|\ud83d\udc69\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffe|\ud83d\udc69\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udfff|\ud83d\udc68\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffb|\ud83d\udc68\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffc|\ud83d\udc68\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffd|\ud83d\udc68\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffe|\ud83d\udc68\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udfff|\ud83d\udc68\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffb|\ud83d\udc68\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffc|\ud83d\udc68\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffd|\ud83d\udc68\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffe|\ud83d\udc68\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udfff|\ud83d\udc68\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffb|\ud83d\udc68\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffc|\ud83d\udc68\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffd|\ud83d\udc68\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffe|\ud83d\udc68\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udfff|\ud83d\udc68\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffb|\ud83d\udc68\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffc|\ud83d\udc68\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffd|\ud83d\udc68\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffe|\ud83d\udc68\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udfff|\ud83d\udc68\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffb|\ud83d\udc68\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffc|\ud83d\udc68\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffd|\ud83d\udc68\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udffe|\ud83d\udc68\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68\ud83c\udfff|\ud83d\udc69\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c\udffb|\ud83d\udc69\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c\udffc|\ud83d\udc69\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c\udffd|\ud83d\udc69\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c\udffe|\ud83d\udc69\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c\udfff|\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c\udffb|\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c\udffc|\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c\udffd|\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c\udffe|\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c\udfff|\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c\udffb|\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c\udffc|\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c\udffd|\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c\udffe|\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c\udfff|\ud83d\udc69\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c\udffb|\ud83d\udc69\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c\udffc|\ud83d\udc69\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c\udffd|\ud83d\udc69\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c\udffe|\ud83d\udc69\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c\udfff|\ud83d\udc69\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c\udffb|\ud83d\udc69\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c\udffc|\ud83d\udc69\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c\udffd|\ud83d\udc69\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c\udffe|\ud83d\udc69\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c\udfff|\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc65\udb40\udc6e\udb40\udc67\udb40\udc7f|\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc73\udb40\udc63\udb40\udc74\udb40\udc7f|\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc77\udb40\udc6c\udb40\udc73\udb40\udc7f|\ud83e\uddd1\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udffb|\ud83e\uddd1\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udffc|\ud83e\uddd1\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udffd|\ud83e\uddd1\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udffe|\ud83e\uddd1\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udfff|\ud83e\uddd1\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udffb|\ud83e\uddd1\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udffc|\ud83e\uddd1\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udffd|\ud83e\uddd1\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udffe|\ud83e\uddd1\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udfff|\ud83e\uddd1\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udffb|\ud83e\uddd1\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udffc|\ud83e\uddd1\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udffd|\ud83e\uddd1\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udffe|\ud83e\uddd1\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udfff|\ud83e\uddd1\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udffb|\ud83e\uddd1\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udffc|\ud83e\uddd1\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udffd|\ud83e\uddd1\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udffe|\ud83e\uddd1\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udfff|\ud83e\uddd1\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udffb|\ud83e\uddd1\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udffc|\ud83e\uddd1\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udffd|\ud83e\uddd1\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udffe|\ud83e\uddd1\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udfff|\ud83d\udc69\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udffc|\ud83d\udc69\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udffd|\ud83d\udc69\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udffe|\ud83d\udc69\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udfff|\ud83d\udc69\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udffb|\ud83d\udc69\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udffd|\ud83d\udc69\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udffe|\ud83d\udc69\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udfff|\ud83d\udc69\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udffb|\ud83d\udc69\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udffc|\ud83d\udc69\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udffe|\ud83d\udc69\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udfff|\ud83d\udc69\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udffb|\ud83d\udc69\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udffc|\ud83d\udc69\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udffd|\ud83d\udc69\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udfff|\ud83d\udc69\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udffb|\ud83d\udc69\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udffc|\ud83d\udc69\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udffd|\ud83d\udc69\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udffe|\ud83d\udc69\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffc|\ud83d\udc69\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffd|\ud83d\udc69\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffe|\ud83d\udc69\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udfff|\ud83d\udc69\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffb|\ud83d\udc69\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffd|\ud83d\udc69\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffe|\ud83d\udc69\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udfff|\ud83d\udc69\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffb|\ud83d\udc69\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffc|\ud83d\udc69\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffe|\ud83d\udc69\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udfff|\ud83d\udc69\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffb|\ud83d\udc69\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffc|\ud83d\udc69\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffd|\ud83d\udc69\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udfff|\ud83d\udc69\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffb|\ud83d\udc69\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffc|\ud83d\udc69\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffd|\ud83d\udc69\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffe|\ud83d\udc68\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffc|\ud83d\udc68\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffd|\ud83d\udc68\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffe|\ud83d\udc68\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udfff|\ud83d\udc68\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffb|\ud83d\udc68\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffd|\ud83d\udc68\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffe|\ud83d\udc68\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udfff|\ud83d\udc68\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffb|\ud83d\udc68\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffc|\ud83d\udc68\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffe|\ud83d\udc68\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udfff|\ud83d\udc68\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffb|\ud83d\udc68\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffc|\ud83d\udc68\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffd|\ud83d\udc68\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udfff|\ud83d\udc68\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffb|\ud83d\udc68\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffc|\ud83d\udc68\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffd|\ud83d\udc68\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffe|\ud83e\uddd1\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c\udffc|\ud83e\uddd1\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c\udffd|\ud83e\uddd1\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c\udffe|\ud83e\uddd1\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c\udfff|\ud83e\uddd1\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c\udffb|\ud83e\uddd1\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c\udffd|\ud83e\uddd1\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c\udffe|\ud83e\uddd1\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c\udfff|\ud83e\uddd1\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c\udffb|\ud83e\uddd1\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c\udffc|\ud83e\uddd1\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c\udffe|\ud83e\uddd1\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c\udfff|\ud83e\uddd1\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c\udffb|\ud83e\uddd1\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c\udffc|\ud83e\uddd1\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c\udffd|\ud83e\uddd1\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c\udfff|\ud83e\uddd1\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c\udffb|\ud83e\uddd1\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c\udffc|\ud83e\uddd1\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c\udffd|\ud83e\uddd1\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83e\uddd1\ud83c\udffe|\ud83d\udc69\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffb|\ud83d\udc69\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffc|\ud83d\udc69\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffd|\ud83d\udc69\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffe|\ud83d\udc69\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udfff|\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffb|\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffc|\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffd|\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffe|\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udfff|\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffb|\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffc|\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffd|\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffe|\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udfff|\ud83d\udc69\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffb|\ud83d\udc69\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffc|\ud83d\udc69\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffd|\ud83d\udc69\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffe|\ud83d\udc69\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udfff|\ud83d\udc69\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffb|\ud83d\udc69\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffc|\ud83d\udc69\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffd|\ud83d\udc69\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffe|\ud83d\udc69\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udfff|\ud83d\udc68\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffb|\ud83d\udc68\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffc|\ud83d\udc68\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffd|\ud83d\udc68\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffe|\ud83d\udc68\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udfff|\ud83d\udc68\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffb|\ud83d\udc68\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffc|\ud83d\udc68\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffd|\ud83d\udc68\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffe|\ud83d\udc68\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udfff|\ud83d\udc68\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffb|\ud83d\udc68\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffc|\ud83d\udc68\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffd|\ud83d\udc68\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffe|\ud83d\udc68\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udfff|\ud83d\udc68\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffb|\ud83d\udc68\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffc|\ud83d\udc68\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffd|\ud83d\udc68\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffe|\ud83d\udc68\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udfff|\ud83d\udc68\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffb|\ud83d\udc68\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffc|\ud83d\udc68\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffd|\ud83d\udc68\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udffe|\ud83d\udc68\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc68\ud83c\udfff|\ud83d\udc69\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c\udffb|\ud83d\udc69\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c\udffc|\ud83d\udc69\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c\udffd|\ud83d\udc69\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c\udffe|\ud83d\udc69\ud83c\udffb\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c\udfff|\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c\udffb|\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c\udffc|\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c\udffd|\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c\udffe|\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c\udfff|\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c\udffb|\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c\udffc|\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c\udffd|\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c\udffe|\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c\udfff|\ud83d\udc69\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c\udffb|\ud83d\udc69\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c\udffc|\ud83d\udc69\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c\udffd|\ud83d\udc69\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c\udffe|\ud83d\udc69\ud83c\udffe\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c\udfff|\ud83d\udc69\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c\udffb|\ud83d\udc69\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c\udffc|\ud83d\udc69\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c\udffd|\ud83d\udc69\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c\udffe|\ud83d\udc69\ud83c\udfff\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c\udfff|\ud83d\udc69\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68|\ud83d\udc68\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68|\ud83d\udc69\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69|\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc66|\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc67|\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d\udc67\u200d\ud83d\udc66|\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d\udc67\u200d\ud83d\udc67|\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc66|\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc67|\ud83e\uddd1\u200d\ud83e\uddd1\u200d\ud83e\uddd2\u200d\ud83e\uddd2|\ud83d\udeb6\ud83c\udffb\u200d\u2640\ufe0f\u200d\u27a1\ufe0f|\ud83d\udeb6\ud83c\udffc\u200d\u2640\ufe0f\u200d\u27a1\ufe0f|\ud83d\udeb6\ud83c\udffd\u200d\u2640\ufe0f\u200d\u27a1\ufe0f|\ud83d\udeb6\ud83c\udffe\u200d\u2640\ufe0f\u200d\u27a1\ufe0f|\ud83d\udeb6\ud83c\udfff\u200d\u2640\ufe0f\u200d\u27a1\ufe0f|\ud83d\udeb6\ud83c\udffb\u200d\u2642\ufe0f\u200d\u27a1\ufe0f|\ud83d\udeb6\ud83c\udffc\u200d\u2642\ufe0f\u200d\u27a1\ufe0f|\ud83d\udeb6\ud83c\udffd\u200d\u2642\ufe0f\u200d\u27a1\ufe0f|\ud83d\udeb6\ud83c\udffe\u200d\u2642\ufe0f\u200d\u27a1\ufe0f|\ud83d\udeb6\ud83c\udfff\u200d\u2642\ufe0f\u200d\u27a1\ufe0f|\ud83e\uddce\ud83c\udffb\u200d\u2640\ufe0f\u200d\u27a1\ufe0f|\ud83e\uddce\ud83c\udffc\u200d\u2640\ufe0f\u200d\u27a1\ufe0f|\ud83e\uddce\ud83c\udffd\u200d\u2640\ufe0f\u200d\u27a1\ufe0f|\ud83e\uddce\ud83c\udffe\u200d\u2640\ufe0f\u200d\u27a1\ufe0f|\ud83e\uddce\ud83c\udfff\u200d\u2640\ufe0f\u200d\u27a1\ufe0f|\ud83e\uddce\ud83c\udffb\u200d\u2642\ufe0f\u200d\u27a1\ufe0f|\ud83e\uddce\ud83c\udffc\u200d\u2642\ufe0f\u200d\u27a1\ufe0f|\ud83e\uddce\ud83c\udffd\u200d\u2642\ufe0f\u200d\u27a1\ufe0f|\ud83e\uddce\ud83c\udffe\u200d\u2642\ufe0f\u200d\u27a1\ufe0f|\ud83e\uddce\ud83c\udfff\u200d\u2642\ufe0f\u200d\u27a1\ufe0f|\ud83e\uddd1\ud83c\udffb\u200d\ud83e\uddaf\u200d\u27a1\ufe0f|\ud83e\uddd1\ud83c\udffc\u200d\ud83e\uddaf\u200d\u27a1\ufe0f|\ud83e\uddd1\ud83c\udffd\u200d\ud83e\uddaf\u200d\u27a1\ufe0f|\ud83e\uddd1\ud83c\udffe\u200d\ud83e\uddaf\u200d\u27a1\ufe0f|\ud83e\uddd1\ud83c\udfff\u200d\ud83e\uddaf\u200d\u27a1\ufe0f|\ud83d\udc68\ud83c\udffb\u200d\ud83e\uddaf\u200d\u27a1\ufe0f|\ud83d\udc68\ud83c\udffc\u200d\ud83e\uddaf\u200d\u27a1\ufe0f|\ud83d\udc68\ud83c\udffd\u200d\ud83e\uddaf\u200d\u27a1\ufe0f|\ud83d\udc68\ud83c\udffe\u200d\ud83e\uddaf\u200d\u27a1\ufe0f|\ud83d\udc68\ud83c\udfff\u200d\ud83e\uddaf\u200d\u27a1\ufe0f|\ud83d\udc69\ud83c\udffb\u200d\ud83e\uddaf\u200d\u27a1\ufe0f|\ud83d\udc69\ud83c\udffc\u200d\ud83e\uddaf\u200d\u27a1\ufe0f|\ud83d\udc69\ud83c\udffd\u200d\ud83e\uddaf\u200d\u27a1\ufe0f|\ud83d\udc69\ud83c\udffe\u200d\ud83e\uddaf\u200d\u27a1\ufe0f|\ud83d\udc69\ud83c\udfff\u200d\ud83e\uddaf\u200d\u27a1\ufe0f|\ud83e\uddd1\ud83c\udffb\u200d\ud83e\uddbc\u200d\u27a1\ufe0f|\ud83e\uddd1\ud83c\udffc\u200d\ud83e\uddbc\u200d\u27a1\ufe0f|\ud83e\uddd1\ud83c\udffd\u200d\ud83e\uddbc\u200d\u27a1\ufe0f|\ud83e\uddd1\ud83c\udffe\u200d\ud83e\uddbc\u200d\u27a1\ufe0f|\ud83e\uddd1\ud83c\udfff\u200d\ud83e\uddbc\u200d\u27a1\ufe0f|\ud83d\udc68\ud83c\udffb\u200d\ud83e\uddbc\u200d\u27a1\ufe0f|\ud83d\udc68\ud83c\udffc\u200d\ud83e\uddbc\u200d\u27a1\ufe0f|\ud83d\udc68\ud83c\udffd\u200d\ud83e\uddbc\u200d\u27a1\ufe0f|\ud83d\udc68\ud83c\udffe\u200d\ud83e\uddbc\u200d\u27a1\ufe0f|\ud83d\udc68\ud83c\udfff\u200d\ud83e\uddbc\u200d\u27a1\ufe0f|\ud83d\udc69\ud83c\udffb\u200d\ud83e\uddbc\u200d\u27a1\ufe0f|\ud83d\udc69\ud83c\udffc\u200d\ud83e\uddbc\u200d\u27a1\ufe0f|\ud83d\udc69\ud83c\udffd\u200d\ud83e\uddbc\u200d\u27a1\ufe0f|\ud83d\udc69\ud83c\udffe\u200d\ud83e\uddbc\u200d\u27a1\ufe0f|\ud83d\udc69\ud83c\udfff\u200d\ud83e\uddbc\u200d\u27a1\ufe0f|\ud83e\uddd1\ud83c\udffb\u200d\ud83e\uddbd\u200d\u27a1\ufe0f|\ud83e\uddd1\ud83c\udffc\u200d\ud83e\uddbd\u200d\u27a1\ufe0f|\ud83e\uddd1\ud83c\udffd\u200d\ud83e\uddbd\u200d\u27a1\ufe0f|\ud83e\uddd1\ud83c\udffe\u200d\ud83e\uddbd\u200d\u27a1\ufe0f|\ud83e\uddd1\ud83c\udfff\u200d\ud83e\uddbd\u200d\u27a1\ufe0f|\ud83d\udc68\ud83c\udffb\u200d\ud83e\uddbd\u200d\u27a1\ufe0f|\ud83d\udc68\ud83c\udffc\u200d\ud83e\uddbd\u200d\u27a1\ufe0f|\ud83d\udc68\ud83c\udffd\u200d\ud83e\uddbd\u200d\u27a1\ufe0f|\ud83d\udc68\ud83c\udffe\u200d\ud83e\uddbd\u200d\u27a1\ufe0f|\ud83d\udc68\ud83c\udfff\u200d\ud83e\uddbd\u200d\u27a1\ufe0f|\ud83d\udc69\ud83c\udffb\u200d\ud83e\uddbd\u200d\u27a1\ufe0f|\ud83d\udc69\ud83c\udffc\u200d\ud83e\uddbd\u200d\u27a1\ufe0f|\ud83d\udc69\ud83c\udffd\u200d\ud83e\uddbd\u200d\u27a1\ufe0f|\ud83d\udc69\ud83c\udffe\u200d\ud83e\uddbd\u200d\u27a1\ufe0f|\ud83d\udc69\ud83c\udfff\u200d\ud83e\uddbd\u200d\u27a1\ufe0f|\ud83c\udfc3\ud83c\udffb\u200d\u2640\ufe0f\u200d\u27a1\ufe0f|\ud83c\udfc3\ud83c\udffc\u200d\u2640\ufe0f\u200d\u27a1\ufe0f|\ud83c\udfc3\ud83c\udffd\u200d\u2640\ufe0f\u200d\u27a1\ufe0f|\ud83c\udfc3\ud83c\udffe\u200d\u2640\ufe0f\u200d\u27a1\ufe0f|\ud83c\udfc3\ud83c\udfff\u200d\u2640\ufe0f\u200d\u27a1\ufe0f|\ud83c\udfc3\ud83c\udffb\u200d\u2642\ufe0f\u200d\u27a1\ufe0f|\ud83c\udfc3\ud83c\udffc\u200d\u2642\ufe0f\u200d\u27a1\ufe0f|\ud83c\udfc3\ud83c\udffd\u200d\u2642\ufe0f\u200d\u27a1\ufe0f|\ud83c\udfc3\ud83c\udffe\u200d\u2642\ufe0f\u200d\u27a1\ufe0f|\ud83c\udfc3\ud83c\udfff\u200d\u2642\ufe0f\u200d\u27a1\ufe0f|\ud83e\udef1\ud83c\udffb\u200d\ud83e\udef2\ud83c\udffc|\ud83e\udef1\ud83c\udffb\u200d\ud83e\udef2\ud83c\udffd|\ud83e\udef1\ud83c\udffb\u200d\ud83e\udef2\ud83c\udffe|\ud83e\udef1\ud83c\udffb\u200d\ud83e\udef2\ud83c\udfff|\ud83e\udef1\ud83c\udffc\u200d\ud83e\udef2\ud83c\udffb|\ud83e\udef1\ud83c\udffc\u200d\ud83e\udef2\ud83c\udffd|\ud83e\udef1\ud83c\udffc\u200d\ud83e\udef2\ud83c\udffe|\ud83e\udef1\ud83c\udffc\u200d\ud83e\udef2\ud83c\udfff|\ud83e\udef1\ud83c\udffd\u200d\ud83e\udef2\ud83c\udffb|\ud83e\udef1\ud83c\udffd\u200d\ud83e\udef2\ud83c\udffc|\ud83e\udef1\ud83c\udffd\u200d\ud83e\udef2\ud83c\udffe|\ud83e\udef1\ud83c\udffd\u200d\ud83e\udef2\ud83c\udfff|\ud83e\udef1\ud83c\udffe\u200d\ud83e\udef2\ud83c\udffb|\ud83e\udef1\ud83c\udffe\u200d\ud83e\udef2\ud83c\udffc|\ud83e\udef1\ud83c\udffe\u200d\ud83e\udef2\ud83c\udffd|\ud83e\udef1\ud83c\udffe\u200d\ud83e\udef2\ud83c\udfff|\ud83e\udef1\ud83c\udfff\u200d\ud83e\udef2\ud83c\udffb|\ud83e\udef1\ud83c\udfff\u200d\ud83e\udef2\ud83c\udffc|\ud83e\udef1\ud83c\udfff\u200d\ud83e\udef2\ud83c\udffd|\ud83e\udef1\ud83c\udfff\u200d\ud83e\udef2\ud83c\udffe|\ud83d\udeb6\u200d\u2640\ufe0f\u200d\u27a1\ufe0f|\ud83d\udeb6\u200d\u2642\ufe0f\u200d\u27a1\ufe0f|\ud83e\uddce\u200d\u2640\ufe0f\u200d\u27a1\ufe0f|\ud83e\uddce\u200d\u2642\ufe0f\u200d\u27a1\ufe0f|\ud83e\uddd1\u200d\ud83e\uddaf\u200d\u27a1\ufe0f|\ud83d\udc68\u200d\ud83e\uddaf\u200d\u27a1\ufe0f|\ud83d\udc69\u200d\ud83e\uddaf\u200d\u27a1\ufe0f|\ud83e\uddd1\u200d\ud83e\uddbc\u200d\u27a1\ufe0f|\ud83d\udc68\u200d\ud83e\uddbc\u200d\u27a1\ufe0f|\ud83d\udc69\u200d\ud83e\uddbc\u200d\u27a1\ufe0f|\ud83e\uddd1\u200d\ud83e\uddbd\u200d\u27a1\ufe0f|\ud83d\udc68\u200d\ud83e\uddbd\u200d\u27a1\ufe0f|\ud83d\udc69\u200d\ud83e\uddbd\u200d\u27a1\ufe0f|\ud83c\udfc3\u200d\u2640\ufe0f\u200d\u27a1\ufe0f|\ud83c\udfc3\u200d\u2642\ufe0f\u200d\u27a1\ufe0f|\ud83e\uddd1\u200d\ud83e\udd1d\u200d\ud83e\uddd1|\ud83d\udc69\u200d\u2764\ufe0f\u200d\ud83d\udc68|\ud83d\udc68\u200d\u2764\ufe0f\u200d\ud83d\udc68|\ud83d\udc69\u200d\u2764\ufe0f\u200d\ud83d\udc69|\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc66|\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67|\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d\udc66|\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d\udc67|\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d\udc66|\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d\udc67|\ud83d\udc68\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc68\u200d\ud83d\udc67\u200d\ud83d\udc66|\ud83d\udc68\u200d\ud83d\udc67\u200d\ud83d\udc67|\ud83d\udc69\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc66|\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc67|\ud83e\uddd1\u200d\ud83e\uddd1\u200d\ud83e\uddd2|\ud83e\uddd1\u200d\ud83e\uddd2\u200d\ud83e\uddd2|\ud83d\udc41\ufe0f\u200d\ud83d\udde8\ufe0f|\ud83e\uddd4\ud83c\udffb\u200d\u2642\ufe0f|\ud83e\uddd4\ud83c\udffc\u200d\u2642\ufe0f|\ud83e\uddd4\ud83c\udffd\u200d\u2642\ufe0f|\ud83e\uddd4\ud83c\udffe\u200d\u2642\ufe0f|\ud83e\uddd4\ud83c\udfff\u200d\u2642\ufe0f|\ud83e\uddd4\ud83c\udffb\u200d\u2640\ufe0f|\ud83e\uddd4\ud83c\udffc\u200d\u2640\ufe0f|\ud83e\uddd4\ud83c\udffd\u200d\u2640\ufe0f|\ud83e\uddd4\ud83c\udffe\u200d\u2640\ufe0f|\ud83e\uddd4\ud83c\udfff\u200d\u2640\ufe0f|\ud83d\udc68\ud83c\udffb\u200d\ud83e\uddb0|\ud83d\udc68\ud83c\udffc\u200d\ud83e\uddb0|\ud83d\udc68\ud83c\udffd\u200d\ud83e\uddb0|\ud83d\udc68\ud83c\udffe\u200d\ud83e\uddb0|\ud83d\udc68\ud83c\udfff\u200d\ud83e\uddb0|\ud83d\udc68\ud83c\udffb\u200d\ud83e\uddb1|\ud83d\udc68\ud83c\udffc\u200d\ud83e\uddb1|\ud83d\udc68\ud83c\udffd\u200d\ud83e\uddb1|\ud83d\udc68\ud83c\udffe\u200d\ud83e\uddb1|\ud83d\udc68\ud83c\udfff\u200d\ud83e\uddb1|\ud83d\udc68\ud83c\udffb\u200d\ud83e\uddb3|\ud83d\udc68\ud83c\udffc\u200d\ud83e\uddb3|\ud83d\udc68\ud83c\udffd\u200d\ud83e\uddb3|\ud83d\udc68\ud83c\udffe\u200d\ud83e\uddb3|\ud83d\udc68\ud83c\udfff\u200d\ud83e\uddb3|\ud83d\udc68\ud83c\udffb\u200d\ud83e\uddb2|\ud83d\udc68\ud83c\udffc\u200d\ud83e\uddb2|\ud83d\udc68\ud83c\udffd\u200d\ud83e\uddb2|\ud83d\udc68\ud83c\udffe\u200d\ud83e\uddb2|\ud83d\udc68\ud83c\udfff\u200d\ud83e\uddb2|\ud83d\udc69\ud83c\udffb\u200d\ud83e\uddb0|\ud83d\udc69\ud83c\udffc\u200d\ud83e\uddb0|\ud83d\udc69\ud83c\udffd\u200d\ud83e\uddb0|\ud83d\udc69\ud83c\udffe\u200d\ud83e\uddb0|\ud83d\udc69\ud83c\udfff\u200d\ud83e\uddb0|\ud83e\uddd1\ud83c\udffb\u200d\ud83e\uddb0|\ud83e\uddd1\ud83c\udffc\u200d\ud83e\uddb0|\ud83e\uddd1\ud83c\udffd\u200d\ud83e\uddb0|\ud83e\uddd1\ud83c\udffe\u200d\ud83e\uddb0|\ud83e\uddd1\ud83c\udfff\u200d\ud83e\uddb0|\ud83d\udc69\ud83c\udffb\u200d\ud83e\uddb1|\ud83d\udc69\ud83c\udffc\u200d\ud83e\uddb1|\ud83d\udc69\ud83c\udffd\u200d\ud83e\uddb1|\ud83d\udc69\ud83c\udffe\u200d\ud83e\uddb1|\ud83d\udc69\ud83c\udfff\u200d\ud83e\uddb1|\ud83e\uddd1\ud83c\udffb\u200d\ud83e\uddb1|\ud83e\uddd1\ud83c\udffc\u200d\ud83e\uddb1|\ud83e\uddd1\ud83c\udffd\u200d\ud83e\uddb1|\ud83e\uddd1\ud83c\udffe\u200d\ud83e\uddb1|\ud83e\uddd1\ud83c\udfff\u200d\ud83e\uddb1|\ud83d\udc69\ud83c\udffb\u200d\ud83e\uddb3|\ud83d\udc69\ud83c\udffc\u200d\ud83e\uddb3|\ud83d\udc69\ud83c\udffd\u200d\ud83e\uddb3|\ud83d\udc69\ud83c\udffe\u200d\ud83e\uddb3|\ud83d\udc69\ud83c\udfff\u200d\ud83e\uddb3|\ud83e\uddd1\ud83c\udffb\u200d\ud83e\uddb3|\ud83e\uddd1\ud83c\udffc\u200d\ud83e\uddb3|\ud83e\uddd1\ud83c\udffd\u200d\ud83e\uddb3|\ud83e\uddd1\ud83c\udffe\u200d\ud83e\uddb3|\ud83e\uddd1\ud83c\udfff\u200d\ud83e\uddb3|\ud83d\udc69\ud83c\udffb\u200d\ud83e\uddb2|\ud83d\udc69\ud83c\udffc\u200d\ud83e\uddb2|\ud83d\udc69\ud83c\udffd\u200d\ud83e\uddb2|\ud83d\udc69\ud83c\udffe\u200d\ud83e\uddb2|\ud83d\udc69\ud83c\udfff\u200d\ud83e\uddb2|\ud83e\uddd1\ud83c\udffb\u200d\ud83e\uddb2|\ud83e\uddd1\ud83c\udffc\u200d\ud83e\uddb2|\ud83e\uddd1\ud83c\udffd\u200d\ud83e\uddb2|\ud83e\uddd1\ud83c\udffe\u200d\ud83e\uddb2|\ud83e\uddd1\ud83c\udfff\u200d\ud83e\uddb2|\ud83d\udc71\ud83c\udffb\u200d\u2640\ufe0f|\ud83d\udc71\ud83c\udffc\u200d\u2640\ufe0f|\ud83d\udc71\ud83c\udffd\u200d\u2640\ufe0f|\ud83d\udc71\ud83c\udffe\u200d\u2640\ufe0f|\ud83d\udc71\ud83c\udfff\u200d\u2640\ufe0f|\ud83d\udc71\ud83c\udffb\u200d\u2642\ufe0f|\ud83d\udc71\ud83c\udffc\u200d\u2642\ufe0f|\ud83d\udc71\ud83c\udffd\u200d\u2642\ufe0f|\ud83d\udc71\ud83c\udffe\u200d\u2642\ufe0f|\ud83d\udc71\ud83c\udfff\u200d\u2642\ufe0f|\ud83d\ude4d\ud83c\udffb\u200d\u2642\ufe0f|\ud83d\ude4d\ud83c\udffc\u200d\u2642\ufe0f|\ud83d\ude4d\ud83c\udffd\u200d\u2642\ufe0f|\ud83d\ude4d\ud83c\udffe\u200d\u2642\ufe0f|\ud83d\ude4d\ud83c\udfff\u200d\u2642\ufe0f|\ud83d\ude4d\ud83c\udffb\u200d\u2640\ufe0f|\ud83d\ude4d\ud83c\udffc\u200d\u2640\ufe0f|\ud83d\ude4d\ud83c\udffd\u200d\u2640\ufe0f|\ud83d\ude4d\ud83c\udffe\u200d\u2640\ufe0f|\ud83d\ude4d\ud83c\udfff\u200d\u2640\ufe0f|\ud83d\ude4e\ud83c\udffb\u200d\u2642\ufe0f|\ud83d\ude4e\ud83c\udffc\u200d\u2642\ufe0f|\ud83d\ude4e\ud83c\udffd\u200d\u2642\ufe0f|\ud83d\ude4e\ud83c\udffe\u200d\u2642\ufe0f|\ud83d\ude4e\ud83c\udfff\u200d\u2642\ufe0f|\ud83d\ude4e\ud83c\udffb\u200d\u2640\ufe0f|\ud83d\ude4e\ud83c\udffc\u200d\u2640\ufe0f|\ud83d\ude4e\ud83c\udffd\u200d\u2640\ufe0f|\ud83d\ude4e\ud83c\udffe\u200d\u2640\ufe0f|\ud83d\ude4e\ud83c\udfff\u200d\u2640\ufe0f|\ud83d\ude45\ud83c\udffb\u200d\u2642\ufe0f|\ud83d\ude45\ud83c\udffc\u200d\u2642\ufe0f|\ud83d\ude45\ud83c\udffd\u200d\u2642\ufe0f|\ud83d\ude45\ud83c\udffe\u200d\u2642\ufe0f|\ud83d\ude45\ud83c\udfff\u200d\u2642\ufe0f|\ud83d\ude45\ud83c\udffb\u200d\u2640\ufe0f|\ud83d\ude45\ud83c\udffc\u200d\u2640\ufe0f|\ud83d\ude45\ud83c\udffd\u200d\u2640\ufe0f|\ud83d\ude45\ud83c\udffe\u200d\u2640\ufe0f|\ud83d\ude45\ud83c\udfff\u200d\u2640\ufe0f|\ud83d\ude46\ud83c\udffb\u200d\u2642\ufe0f|\ud83d\ude46\ud83c\udffc\u200d\u2642\ufe0f|\ud83d\ude46\ud83c\udffd\u200d\u2642\ufe0f|\ud83d\ude46\ud83c\udffe\u200d\u2642\ufe0f|\ud83d\ude46\ud83c\udfff\u200d\u2642\ufe0f|\ud83d\ude46\ud83c\udffb\u200d\u2640\ufe0f|\ud83d\ude46\ud83c\udffc\u200d\u2640\ufe0f|\ud83d\ude46\ud83c\udffd\u200d\u2640\ufe0f|\ud83d\ude46\ud83c\udffe\u200d\u2640\ufe0f|\ud83d\ude46\ud83c\udfff\u200d\u2640\ufe0f|\ud83d\udc81\ud83c\udffb\u200d\u2642\ufe0f|\ud83d\udc81\ud83c\udffc\u200d\u2642\ufe0f|\ud83d\udc81\ud83c\udffd\u200d\u2642\ufe0f|\ud83d\udc81\ud83c\udffe\u200d\u2642\ufe0f|\ud83d\udc81\ud83c\udfff\u200d\u2642\ufe0f|\ud83d\udc81\ud83c\udffb\u200d\u2640\ufe0f|\ud83d\udc81\ud83c\udffc\u200d\u2640\ufe0f|\ud83d\udc81\ud83c\udffd\u200d\u2640\ufe0f|\ud83d\udc81\ud83c\udffe\u200d\u2640\ufe0f|\ud83d\udc81\ud83c\udfff\u200d\u2640\ufe0f|\ud83d\ude4b\ud83c\udffb\u200d\u2642\ufe0f|\ud83d\ude4b\ud83c\udffc\u200d\u2642\ufe0f|\ud83d\ude4b\ud83c\udffd\u200d\u2642\ufe0f|\ud83d\ude4b\ud83c\udffe\u200d\u2642\ufe0f|\ud83d\ude4b\ud83c\udfff\u200d\u2642\ufe0f|\ud83d\ude4b\ud83c\udffb\u200d\u2640\ufe0f|\ud83d\ude4b\ud83c\udffc\u200d\u2640\ufe0f|\ud83d\ude4b\ud83c\udffd\u200d\u2640\ufe0f|\ud83d\ude4b\ud83c\udffe\u200d\u2640\ufe0f|\ud83d\ude4b\ud83c\udfff\u200d\u2640\ufe0f|\ud83e\uddcf\ud83c\udffb\u200d\u2642\ufe0f|\ud83e\uddcf\ud83c\udffc\u200d\u2642\ufe0f|\ud83e\uddcf\ud83c\udffd\u200d\u2642\ufe0f|\ud83e\uddcf\ud83c\udffe\u200d\u2642\ufe0f|\ud83e\uddcf\ud83c\udfff\u200d\u2642\ufe0f|\ud83e\uddcf\ud83c\udffb\u200d\u2640\ufe0f|\ud83e\uddcf\ud83c\udffc\u200d\u2640\ufe0f|\ud83e\uddcf\ud83c\udffd\u200d\u2640\ufe0f|\ud83e\uddcf\ud83c\udffe\u200d\u2640\ufe0f|\ud83e\uddcf\ud83c\udfff\u200d\u2640\ufe0f|\ud83d\ude47\ud83c\udffb\u200d\u2642\ufe0f|\ud83d\ude47\ud83c\udffc\u200d\u2642\ufe0f|\ud83d\ude47\ud83c\udffd\u200d\u2642\ufe0f|\ud83d\ude47\ud83c\udffe\u200d\u2642\ufe0f|\ud83d\ude47\ud83c\udfff\u200d\u2642\ufe0f|\ud83d\ude47\ud83c\udffb\u200d\u2640\ufe0f|\ud83d\ude47\ud83c\udffc\u200d\u2640\ufe0f|\ud83d\ude47\ud83c\udffd\u200d\u2640\ufe0f|\ud83d\ude47\ud83c\udffe\u200d\u2640\ufe0f|\ud83d\ude47\ud83c\udfff\u200d\u2640\ufe0f|\ud83e\udd26\ud83c\udffb\u200d\u2642\ufe0f|\ud83e\udd26\ud83c\udffc\u200d\u2642\ufe0f|\ud83e\udd26\ud83c\udffd\u200d\u2642\ufe0f|\ud83e\udd26\ud83c\udffe\u200d\u2642\ufe0f|\ud83e\udd26\ud83c\udfff\u200d\u2642\ufe0f|\ud83e\udd26\ud83c\udffb\u200d\u2640\ufe0f|\ud83e\udd26\ud83c\udffc\u200d\u2640\ufe0f|\ud83e\udd26\ud83c\udffd\u200d\u2640\ufe0f|\ud83e\udd26\ud83c\udffe\u200d\u2640\ufe0f|\ud83e\udd26\ud83c\udfff\u200d\u2640\ufe0f|\ud83e\udd37\ud83c\udffb\u200d\u2642\ufe0f|\ud83e\udd37\ud83c\udffc\u200d\u2642\ufe0f|\ud83e\udd37\ud83c\udffd\u200d\u2642\ufe0f|\ud83e\udd37\ud83c\udffe\u200d\u2642\ufe0f|\ud83e\udd37\ud83c\udfff\u200d\u2642\ufe0f|\ud83e\udd37\ud83c\udffb\u200d\u2640\ufe0f|\ud83e\udd37\ud83c\udffc\u200d\u2640\ufe0f|\ud83e\udd37\ud83c\udffd\u200d\u2640\ufe0f|\ud83e\udd37\ud83c\udffe\u200d\u2640\ufe0f|\ud83e\udd37\ud83c\udfff\u200d\u2640\ufe0f|\ud83e\uddd1\ud83c\udffb\u200d\u2695\ufe0f|\ud83e\uddd1\ud83c\udffc\u200d\u2695\ufe0f|\ud83e\uddd1\ud83c\udffd\u200d\u2695\ufe0f|\ud83e\uddd1\ud83c\udffe\u200d\u2695\ufe0f|\ud83e\uddd1\ud83c\udfff\u200d\u2695\ufe0f|\ud83d\udc68\ud83c\udffb\u200d\u2695\ufe0f|\ud83d\udc68\ud83c\udffc\u200d\u2695\ufe0f|\ud83d\udc68\ud83c\udffd\u200d\u2695\ufe0f|\ud83d\udc68\ud83c\udffe\u200d\u2695\ufe0f|\ud83d\udc68\ud83c\udfff\u200d\u2695\ufe0f|\ud83d\udc69\ud83c\udffb\u200d\u2695\ufe0f|\ud83d\udc69\ud83c\udffc\u200d\u2695\ufe0f|\ud83d\udc69\ud83c\udffd\u200d\u2695\ufe0f|\ud83d\udc69\ud83c\udffe\u200d\u2695\ufe0f|\ud83d\udc69\ud83c\udfff\u200d\u2695\ufe0f|\ud83e\uddd1\ud83c\udffb\u200d\ud83c\udf93|\ud83e\uddd1\ud83c\udffc\u200d\ud83c\udf93|\ud83e\uddd1\ud83c\udffd\u200d\ud83c\udf93|\ud83e\uddd1\ud83c\udffe\u200d\ud83c\udf93|\ud83e\uddd1\ud83c\udfff\u200d\ud83c\udf93|\ud83d\udc68\ud83c\udffb\u200d\ud83c\udf93|\ud83d\udc68\ud83c\udffc\u200d\ud83c\udf93|\ud83d\udc68\ud83c\udffd\u200d\ud83c\udf93|\ud83d\udc68\ud83c\udffe\u200d\ud83c\udf93|\ud83d\udc68\ud83c\udfff\u200d\ud83c\udf93|\ud83d\udc69\ud83c\udffb\u200d\ud83c\udf93|\ud83d\udc69\ud83c\udffc\u200d\ud83c\udf93|\ud83d\udc69\ud83c\udffd\u200d\ud83c\udf93|\ud83d\udc69\ud83c\udffe\u200d\ud83c\udf93|\ud83d\udc69\ud83c\udfff\u200d\ud83c\udf93|\ud83e\uddd1\ud83c\udffb\u200d\ud83c\udfeb|\ud83e\uddd1\ud83c\udffc\u200d\ud83c\udfeb|\ud83e\uddd1\ud83c\udffd\u200d\ud83c\udfeb|\ud83e\uddd1\ud83c\udffe\u200d\ud83c\udfeb|\ud83e\uddd1\ud83c\udfff\u200d\ud83c\udfeb|\ud83d\udc68\ud83c\udffb\u200d\ud83c\udfeb|\ud83d\udc68\ud83c\udffc\u200d\ud83c\udfeb|\ud83d\udc68\ud83c\udffd\u200d\ud83c\udfeb|\ud83d\udc68\ud83c\udffe\u200d\ud83c\udfeb|\ud83d\udc68\ud83c\udfff\u200d\ud83c\udfeb|\ud83d\udc69\ud83c\udffb\u200d\ud83c\udfeb|\ud83d\udc69\ud83c\udffc\u200d\ud83c\udfeb|\ud83d\udc69\ud83c\udffd\u200d\ud83c\udfeb|\ud83d\udc69\ud83c\udffe\u200d\ud83c\udfeb|\ud83d\udc69\ud83c\udfff\u200d\ud83c\udfeb|\ud83e\uddd1\ud83c\udffb\u200d\u2696\ufe0f|\ud83e\uddd1\ud83c\udffc\u200d\u2696\ufe0f|\ud83e\uddd1\ud83c\udffd\u200d\u2696\ufe0f|\ud83e\uddd1\ud83c\udffe\u200d\u2696\ufe0f|\ud83e\uddd1\ud83c\udfff\u200d\u2696\ufe0f|\ud83d\udc68\ud83c\udffb\u200d\u2696\ufe0f|\ud83d\udc68\ud83c\udffc\u200d\u2696\ufe0f|\ud83d\udc68\ud83c\udffd\u200d\u2696\ufe0f|\ud83d\udc68\ud83c\udffe\u200d\u2696\ufe0f|\ud83d\udc68\ud83c\udfff\u200d\u2696\ufe0f|\ud83d\udc69\ud83c\udffb\u200d\u2696\ufe0f|\ud83d\udc69\ud83c\udffc\u200d\u2696\ufe0f|\ud83d\udc69\ud83c\udffd\u200d\u2696\ufe0f|\ud83d\udc69\ud83c\udffe\u200d\u2696\ufe0f|\ud83d\udc69\ud83c\udfff\u200d\u2696\ufe0f|\ud83e\uddd1\ud83c\udffb\u200d\ud83c\udf3e|\ud83e\uddd1\ud83c\udffc\u200d\ud83c\udf3e|\ud83e\uddd1\ud83c\udffd\u200d\ud83c\udf3e|\ud83e\uddd1\ud83c\udffe\u200d\ud83c\udf3e|\ud83e\uddd1\ud83c\udfff\u200d\ud83c\udf3e|\ud83d\udc68\ud83c\udffb\u200d\ud83c\udf3e|\ud83d\udc68\ud83c\udffc\u200d\ud83c\udf3e|\ud83d\udc68\ud83c\udffd\u200d\ud83c\udf3e|\ud83d\udc68\ud83c\udffe\u200d\ud83c\udf3e|\ud83d\udc68\ud83c\udfff\u200d\ud83c\udf3e|\ud83d\udc69\ud83c\udffb\u200d\ud83c\udf3e|\ud83d\udc69\ud83c\udffc\u200d\ud83c\udf3e|\ud83d\udc69\ud83c\udffd\u200d\ud83c\udf3e|\ud83d\udc69\ud83c\udffe\u200d\ud83c\udf3e|\ud83d\udc69\ud83c\udfff\u200d\ud83c\udf3e|\ud83e\uddd1\ud83c\udffb\u200d\ud83c\udf73|\ud83e\uddd1\ud83c\udffc\u200d\ud83c\udf73|\ud83e\uddd1\ud83c\udffd\u200d\ud83c\udf73|\ud83e\uddd1\ud83c\udffe\u200d\ud83c\udf73|\ud83e\uddd1\ud83c\udfff\u200d\ud83c\udf73|\ud83d\udc68\ud83c\udffb\u200d\ud83c\udf73|\ud83d\udc68\ud83c\udffc\u200d\ud83c\udf73|\ud83d\udc68\ud83c\udffd\u200d\ud83c\udf73|\ud83d\udc68\ud83c\udffe\u200d\ud83c\udf73|\ud83d\udc68\ud83c\udfff\u200d\ud83c\udf73|\ud83d\udc69\ud83c\udffb\u200d\ud83c\udf73|\ud83d\udc69\ud83c\udffc\u200d\ud83c\udf73|\ud83d\udc69\ud83c\udffd\u200d\ud83c\udf73|\ud83d\udc69\ud83c\udffe\u200d\ud83c\udf73|\ud83d\udc69\ud83c\udfff\u200d\ud83c\udf73|\ud83e\uddd1\ud83c\udffb\u200d\ud83d\udd27|\ud83e\uddd1\ud83c\udffc\u200d\ud83d\udd27|\ud83e\uddd1\ud83c\udffd\u200d\ud83d\udd27|\ud83e\uddd1\ud83c\udffe\u200d\ud83d\udd27|\ud83e\uddd1\ud83c\udfff\u200d\ud83d\udd27|\ud83d\udc68\ud83c\udffb\u200d\ud83d\udd27|\ud83d\udc68\ud83c\udffc\u200d\ud83d\udd27|\ud83d\udc68\ud83c\udffd\u200d\ud83d\udd27|\ud83d\udc68\ud83c\udffe\u200d\ud83d\udd27|\ud83d\udc68\ud83c\udfff\u200d\ud83d\udd27|\ud83d\udc69\ud83c\udffb\u200d\ud83d\udd27|\ud83d\udc69\ud83c\udffc\u200d\ud83d\udd27|\ud83d\udc69\ud83c\udffd\u200d\ud83d\udd27|\ud83d\udc69\ud83c\udffe\u200d\ud83d\udd27|\ud83d\udc69\ud83c\udfff\u200d\ud83d\udd27|\ud83e\uddd1\ud83c\udffb\u200d\ud83c\udfed|\ud83e\uddd1\ud83c\udffc\u200d\ud83c\udfed|\ud83e\uddd1\ud83c\udffd\u200d\ud83c\udfed|\ud83e\uddd1\ud83c\udffe\u200d\ud83c\udfed|\ud83e\uddd1\ud83c\udfff\u200d\ud83c\udfed|\ud83d\udc68\ud83c\udffb\u200d\ud83c\udfed|\ud83d\udc68\ud83c\udffc\u200d\ud83c\udfed|\ud83d\udc68\ud83c\udffd\u200d\ud83c\udfed|\ud83d\udc68\ud83c\udffe\u200d\ud83c\udfed|\ud83d\udc68\ud83c\udfff\u200d\ud83c\udfed|\ud83d\udc69\ud83c\udffb\u200d\ud83c\udfed|\ud83d\udc69\ud83c\udffc\u200d\ud83c\udfed|\ud83d\udc69\ud83c\udffd\u200d\ud83c\udfed|\ud83d\udc69\ud83c\udffe\u200d\ud83c\udfed|\ud83d\udc69\ud83c\udfff\u200d\ud83c\udfed|\ud83e\uddd1\ud83c\udffb\u200d\ud83d\udcbc|\ud83e\uddd1\ud83c\udffc\u200d\ud83d\udcbc|\ud83e\uddd1\ud83c\udffd\u200d\ud83d\udcbc|\ud83e\uddd1\ud83c\udffe\u200d\ud83d\udcbc|\ud83e\uddd1\ud83c\udfff\u200d\ud83d\udcbc|\ud83d\udc68\ud83c\udffb\u200d\ud83d\udcbc|\ud83d\udc68\ud83c\udffc\u200d\ud83d\udcbc|\ud83d\udc68\ud83c\udffd\u200d\ud83d\udcbc|\ud83d\udc68\ud83c\udffe\u200d\ud83d\udcbc|\ud83d\udc68\ud83c\udfff\u200d\ud83d\udcbc|\ud83d\udc69\ud83c\udffb\u200d\ud83d\udcbc|\ud83d\udc69\ud83c\udffc\u200d\ud83d\udcbc|\ud83d\udc69\ud83c\udffd\u200d\ud83d\udcbc|\ud83d\udc69\ud83c\udffe\u200d\ud83d\udcbc|\ud83d\udc69\ud83c\udfff\u200d\ud83d\udcbc|\ud83e\uddd1\ud83c\udffb\u200d\ud83d\udd2c|\ud83e\uddd1\ud83c\udffc\u200d\ud83d\udd2c|\ud83e\uddd1\ud83c\udffd\u200d\ud83d\udd2c|\ud83e\uddd1\ud83c\udffe\u200d\ud83d\udd2c|\ud83e\uddd1\ud83c\udfff\u200d\ud83d\udd2c|\ud83d\udc68\ud83c\udffb\u200d\ud83d\udd2c|\ud83d\udc68\ud83c\udffc\u200d\ud83d\udd2c|\ud83d\udc68\ud83c\udffd\u200d\ud83d\udd2c|\ud83d\udc68\ud83c\udffe\u200d\ud83d\udd2c|\ud83d\udc68\ud83c\udfff\u200d\ud83d\udd2c|\ud83d\udc69\ud83c\udffb\u200d\ud83d\udd2c|\ud83d\udc69\ud83c\udffc\u200d\ud83d\udd2c|\ud83d\udc69\ud83c\udffd\u200d\ud83d\udd2c|\ud83d\udc69\ud83c\udffe\u200d\ud83d\udd2c|\ud83d\udc69\ud83c\udfff\u200d\ud83d\udd2c|\ud83e\uddd1\ud83c\udffb\u200d\ud83d\udcbb|\ud83e\uddd1\ud83c\udffc\u200d\ud83d\udcbb|\ud83e\uddd1\ud83c\udffd\u200d\ud83d\udcbb|\ud83e\uddd1\ud83c\udffe\u200d\ud83d\udcbb|\ud83e\uddd1\ud83c\udfff\u200d\ud83d\udcbb|\ud83d\udc68\ud83c\udffb\u200d\ud83d\udcbb|\ud83d\udc68\ud83c\udffc\u200d\ud83d\udcbb|\ud83d\udc68\ud83c\udffd\u200d\ud83d\udcbb|\ud83d\udc68\ud83c\udffe\u200d\ud83d\udcbb|\ud83d\udc68\ud83c\udfff\u200d\ud83d\udcbb|\ud83d\udc69\ud83c\udffb\u200d\ud83d\udcbb|\ud83d\udc69\ud83c\udffc\u200d\ud83d\udcbb|\ud83d\udc69\ud83c\udffd\u200d\ud83d\udcbb|\ud83d\udc69\ud83c\udffe\u200d\ud83d\udcbb|\ud83d\udc69\ud83c\udfff\u200d\ud83d\udcbb|\ud83e\uddd1\ud83c\udffb\u200d\ud83c\udfa4|\ud83e\uddd1\ud83c\udffc\u200d\ud83c\udfa4|\ud83e\uddd1\ud83c\udffd\u200d\ud83c\udfa4|\ud83e\uddd1\ud83c\udffe\u200d\ud83c\udfa4|\ud83e\uddd1\ud83c\udfff\u200d\ud83c\udfa4|\ud83d\udc68\ud83c\udffb\u200d\ud83c\udfa4|\ud83d\udc68\ud83c\udffc\u200d\ud83c\udfa4|\ud83d\udc68\ud83c\udffd\u200d\ud83c\udfa4|\ud83d\udc68\ud83c\udffe\u200d\ud83c\udfa4|\ud83d\udc68\ud83c\udfff\u200d\ud83c\udfa4|\ud83d\udc69\ud83c\udffb\u200d\ud83c\udfa4|\ud83d\udc69\ud83c\udffc\u200d\ud83c\udfa4|\ud83d\udc69\ud83c\udffd\u200d\ud83c\udfa4|\ud83d\udc69\ud83c\udffe\u200d\ud83c\udfa4|\ud83d\udc69\ud83c\udfff\u200d\ud83c\udfa4|\ud83e\uddd1\ud83c\udffb\u200d\ud83c\udfa8|\ud83e\uddd1\ud83c\udffc\u200d\ud83c\udfa8|\ud83e\uddd1\ud83c\udffd\u200d\ud83c\udfa8|\ud83e\uddd1\ud83c\udffe\u200d\ud83c\udfa8|\ud83e\uddd1\ud83c\udfff\u200d\ud83c\udfa8|\ud83d\udc68\ud83c\udffb\u200d\ud83c\udfa8|\ud83d\udc68\ud83c\udffc\u200d\ud83c\udfa8|\ud83d\udc68\ud83c\udffd\u200d\ud83c\udfa8|\ud83d\udc68\ud83c\udffe\u200d\ud83c\udfa8|\ud83d\udc68\ud83c\udfff\u200d\ud83c\udfa8|\ud83d\udc69\ud83c\udffb\u200d\ud83c\udfa8|\ud83d\udc69\ud83c\udffc\u200d\ud83c\udfa8|\ud83d\udc69\ud83c\udffd\u200d\ud83c\udfa8|\ud83d\udc69\ud83c\udffe\u200d\ud83c\udfa8|\ud83d\udc69\ud83c\udfff\u200d\ud83c\udfa8|\ud83e\uddd1\ud83c\udffb\u200d\u2708\ufe0f|\ud83e\uddd1\ud83c\udffc\u200d\u2708\ufe0f|\ud83e\uddd1\ud83c\udffd\u200d\u2708\ufe0f|\ud83e\uddd1\ud83c\udffe\u200d\u2708\ufe0f|\ud83e\uddd1\ud83c\udfff\u200d\u2708\ufe0f|\ud83d\udc68\ud83c\udffb\u200d\u2708\ufe0f|\ud83d\udc68\ud83c\udffc\u200d\u2708\ufe0f|\ud83d\udc68\ud83c\udffd\u200d\u2708\ufe0f|\ud83d\udc68\ud83c\udffe\u200d\u2708\ufe0f|\ud83d\udc68\ud83c\udfff\u200d\u2708\ufe0f|\ud83d\udc69\ud83c\udffb\u200d\u2708\ufe0f|\ud83d\udc69\ud83c\udffc\u200d\u2708\ufe0f|\ud83d\udc69\ud83c\udffd\u200d\u2708\ufe0f|\ud83d\udc69\ud83c\udffe\u200d\u2708\ufe0f|\ud83d\udc69\ud83c\udfff\u200d\u2708\ufe0f|\ud83e\uddd1\ud83c\udffb\u200d\ud83d\ude80|\ud83e\uddd1\ud83c\udffc\u200d\ud83d\ude80|\ud83e\uddd1\ud83c\udffd\u200d\ud83d\ude80|\ud83e\uddd1\ud83c\udffe\u200d\ud83d\ude80|\ud83e\uddd1\ud83c\udfff\u200d\ud83d\ude80|\ud83d\udc68\ud83c\udffb\u200d\ud83d\ude80|\ud83d\udc68\ud83c\udffc\u200d\ud83d\ude80|\ud83d\udc68\ud83c\udffd\u200d\ud83d\ude80|\ud83d\udc68\ud83c\udffe\u200d\ud83d\ude80|\ud83d\udc68\ud83c\udfff\u200d\ud83d\ude80|\ud83d\udc69\ud83c\udffb\u200d\ud83d\ude80|\ud83d\udc69\ud83c\udffc\u200d\ud83d\ude80|\ud83d\udc69\ud83c\udffd\u200d\ud83d\ude80|\ud83d\udc69\ud83c\udffe\u200d\ud83d\ude80|\ud83d\udc69\ud83c\udfff\u200d\ud83d\ude80|\ud83e\uddd1\ud83c\udffb\u200d\ud83d\ude92|\ud83e\uddd1\ud83c\udffc\u200d\ud83d\ude92|\ud83e\uddd1\ud83c\udffd\u200d\ud83d\ude92|\ud83e\uddd1\ud83c\udffe\u200d\ud83d\ude92|\ud83e\uddd1\ud83c\udfff\u200d\ud83d\ude92|\ud83d\udc68\ud83c\udffb\u200d\ud83d\ude92|\ud83d\udc68\ud83c\udffc\u200d\ud83d\ude92|\ud83d\udc68\ud83c\udffd\u200d\ud83d\ude92|\ud83d\udc68\ud83c\udffe\u200d\ud83d\ude92|\ud83d\udc68\ud83c\udfff\u200d\ud83d\ude92|\ud83d\udc69\ud83c\udffb\u200d\ud83d\ude92|\ud83d\udc69\ud83c\udffc\u200d\ud83d\ude92|\ud83d\udc69\ud83c\udffd\u200d\ud83d\ude92|\ud83d\udc69\ud83c\udffe\u200d\ud83d\ude92|\ud83d\udc69\ud83c\udfff\u200d\ud83d\ude92|\ud83d\udc6e\ud83c\udffb\u200d\u2642\ufe0f|\ud83d\udc6e\ud83c\udffc\u200d\u2642\ufe0f|\ud83d\udc6e\ud83c\udffd\u200d\u2642\ufe0f|\ud83d\udc6e\ud83c\udffe\u200d\u2642\ufe0f|\ud83d\udc6e\ud83c\udfff\u200d\u2642\ufe0f|\ud83d\udc6e\ud83c\udffb\u200d\u2640\ufe0f|\ud83d\udc6e\ud83c\udffc\u200d\u2640\ufe0f|\ud83d\udc6e\ud83c\udffd\u200d\u2640\ufe0f|\ud83d\udc6e\ud83c\udffe\u200d\u2640\ufe0f|\ud83d\udc6e\ud83c\udfff\u200d\u2640\ufe0f|\ud83d\udd75\ud83c\udffb\u200d\u2642\ufe0f|\ud83d\udd75\ud83c\udffc\u200d\u2642\ufe0f|\ud83d\udd75\ud83c\udffd\u200d\u2642\ufe0f|\ud83d\udd75\ud83c\udffe\u200d\u2642\ufe0f|\ud83d\udd75\ud83c\udfff\u200d\u2642\ufe0f|\ud83d\udd75\ud83c\udffb\u200d\u2640\ufe0f|\ud83d\udd75\ud83c\udffc\u200d\u2640\ufe0f|\ud83d\udd75\ud83c\udffd\u200d\u2640\ufe0f|\ud83d\udd75\ud83c\udffe\u200d\u2640\ufe0f|\ud83d\udd75\ud83c\udfff\u200d\u2640\ufe0f|\ud83d\udc82\ud83c\udffb\u200d\u2642\ufe0f|\ud83d\udc82\ud83c\udffc\u200d\u2642\ufe0f|\ud83d\udc82\ud83c\udffd\u200d\u2642\ufe0f|\ud83d\udc82\ud83c\udffe\u200d\u2642\ufe0f|\ud83d\udc82\ud83c\udfff\u200d\u2642\ufe0f|\ud83d\udc82\ud83c\udffb\u200d\u2640\ufe0f|\ud83d\udc82\ud83c\udffc\u200d\u2640\ufe0f|\ud83d\udc82\ud83c\udffd\u200d\u2640\ufe0f|\ud83d\udc82\ud83c\udffe\u200d\u2640\ufe0f|\ud83d\udc82\ud83c\udfff\u200d\u2640\ufe0f|\ud83d\udc77\ud83c\udffb\u200d\u2642\ufe0f|\ud83d\udc77\ud83c\udffc\u200d\u2642\ufe0f|\ud83d\udc77\ud83c\udffd\u200d\u2642\ufe0f|\ud83d\udc77\ud83c\udffe\u200d\u2642\ufe0f|\ud83d\udc77\ud83c\udfff\u200d\u2642\ufe0f|\ud83d\udc77\ud83c\udffb\u200d\u2640\ufe0f|\ud83d\udc77\ud83c\udffc\u200d\u2640\ufe0f|\ud83d\udc77\ud83c\udffd\u200d\u2640\ufe0f|\ud83d\udc77\ud83c\udffe\u200d\u2640\ufe0f|\ud83d\udc77\ud83c\udfff\u200d\u2640\ufe0f|\ud83d\udc73\ud83c\udffb\u200d\u2642\ufe0f|\ud83d\udc73\ud83c\udffc\u200d\u2642\ufe0f|\ud83d\udc73\ud83c\udffd\u200d\u2642\ufe0f|\ud83d\udc73\ud83c\udffe\u200d\u2642\ufe0f|\ud83d\udc73\ud83c\udfff\u200d\u2642\ufe0f|\ud83d\udc73\ud83c\udffb\u200d\u2640\ufe0f|\ud83d\udc73\ud83c\udffc\u200d\u2640\ufe0f|\ud83d\udc73\ud83c\udffd\u200d\u2640\ufe0f|\ud83d\udc73\ud83c\udffe\u200d\u2640\ufe0f|\ud83d\udc73\ud83c\udfff\u200d\u2640\ufe0f|\ud83e\udd35\ud83c\udffb\u200d\u2642\ufe0f|\ud83e\udd35\ud83c\udffc\u200d\u2642\ufe0f|\ud83e\udd35\ud83c\udffd\u200d\u2642\ufe0f|\ud83e\udd35\ud83c\udffe\u200d\u2642\ufe0f|\ud83e\udd35\ud83c\udfff\u200d\u2642\ufe0f|\ud83e\udd35\ud83c\udffb\u200d\u2640\ufe0f|\ud83e\udd35\ud83c\udffc\u200d\u2640\ufe0f|\ud83e\udd35\ud83c\udffd\u200d\u2640\ufe0f|\ud83e\udd35\ud83c\udffe\u200d\u2640\ufe0f|\ud83e\udd35\ud83c\udfff\u200d\u2640\ufe0f|\ud83d\udc70\ud83c\udffb\u200d\u2642\ufe0f|\ud83d\udc70\ud83c\udffc\u200d\u2642\ufe0f|\ud83d\udc70\ud83c\udffd\u200d\u2642\ufe0f|\ud83d\udc70\ud83c\udffe\u200d\u2642\ufe0f|\ud83d\udc70\ud83c\udfff\u200d\u2642\ufe0f|\ud83d\udc70\ud83c\udffb\u200d\u2640\ufe0f|\ud83d\udc70\ud83c\udffc\u200d\u2640\ufe0f|\ud83d\udc70\ud83c\udffd\u200d\u2640\ufe0f|\ud83d\udc70\ud83c\udffe\u200d\u2640\ufe0f|\ud83d\udc70\ud83c\udfff\u200d\u2640\ufe0f|\ud83d\udc69\ud83c\udffb\u200d\ud83c\udf7c|\ud83d\udc69\ud83c\udffc\u200d\ud83c\udf7c|\ud83d\udc69\ud83c\udffd\u200d\ud83c\udf7c|\ud83d\udc69\ud83c\udffe\u200d\ud83c\udf7c|\ud83d\udc69\ud83c\udfff\u200d\ud83c\udf7c|\ud83d\udc68\ud83c\udffb\u200d\ud83c\udf7c|\ud83d\udc68\ud83c\udffc\u200d\ud83c\udf7c|\ud83d\udc68\ud83c\udffd\u200d\ud83c\udf7c|\ud83d\udc68\ud83c\udffe\u200d\ud83c\udf7c|\ud83d\udc68\ud83c\udfff\u200d\ud83c\udf7c|\ud83e\uddd1\ud83c\udffb\u200d\ud83c\udf7c|\ud83e\uddd1\ud83c\udffc\u200d\ud83c\udf7c|\ud83e\uddd1\ud83c\udffd\u200d\ud83c\udf7c|\ud83e\uddd1\ud83c\udffe\u200d\ud83c\udf7c|\ud83e\uddd1\ud83c\udfff\u200d\ud83c\udf7c|\ud83e\uddd1\ud83c\udffb\u200d\ud83c\udf84|\ud83e\uddd1\ud83c\udffc\u200d\ud83c\udf84|\ud83e\uddd1\ud83c\udffd\u200d\ud83c\udf84|\ud83e\uddd1\ud83c\udffe\u200d\ud83c\udf84|\ud83e\uddd1\ud83c\udfff\u200d\ud83c\udf84|\ud83e\uddb8\ud83c\udffb\u200d\u2642\ufe0f|\ud83e\uddb8\ud83c\udffc\u200d\u2642\ufe0f|\ud83e\uddb8\ud83c\udffd\u200d\u2642\ufe0f|\ud83e\uddb8\ud83c\udffe\u200d\u2642\ufe0f|\ud83e\uddb8\ud83c\udfff\u200d\u2642\ufe0f|\ud83e\uddb8\ud83c\udffb\u200d\u2640\ufe0f|\ud83e\uddb8\ud83c\udffc\u200d\u2640\ufe0f|\ud83e\uddb8\ud83c\udffd\u200d\u2640\ufe0f|\ud83e\uddb8\ud83c\udffe\u200d\u2640\ufe0f|\ud83e\uddb8\ud83c\udfff\u200d\u2640\ufe0f|\ud83e\uddb9\ud83c\udffb\u200d\u2642\ufe0f|\ud83e\uddb9\ud83c\udffc\u200d\u2642\ufe0f|\ud83e\uddb9\ud83c\udffd\u200d\u2642\ufe0f|\ud83e\uddb9\ud83c\udffe\u200d\u2642\ufe0f|\ud83e\uddb9\ud83c\udfff\u200d\u2642\ufe0f|\ud83e\uddb9\ud83c\udffb\u200d\u2640\ufe0f|\ud83e\uddb9\ud83c\udffc\u200d\u2640\ufe0f|\ud83e\uddb9\ud83c\udffd\u200d\u2640\ufe0f|\ud83e\uddb9\ud83c\udffe\u200d\u2640\ufe0f|\ud83e\uddb9\ud83c\udfff\u200d\u2640\ufe0f|\ud83e\uddd9\ud83c\udffb\u200d\u2642\ufe0f|\ud83e\uddd9\ud83c\udffc\u200d\u2642\ufe0f|\ud83e\uddd9\ud83c\udffd\u200d\u2642\ufe0f|\ud83e\uddd9\ud83c\udffe\u200d\u2642\ufe0f|\ud83e\uddd9\ud83c\udfff\u200d\u2642\ufe0f|\ud83e\uddd9\ud83c\udffb\u200d\u2640\ufe0f|\ud83e\uddd9\ud83c\udffc\u200d\u2640\ufe0f|\ud83e\uddd9\ud83c\udffd\u200d\u2640\ufe0f|\ud83e\uddd9\ud83c\udffe\u200d\u2640\ufe0f|\ud83e\uddd9\ud83c\udfff\u200d\u2640\ufe0f|\ud83e\uddda\ud83c\udffb\u200d\u2642\ufe0f|\ud83e\uddda\ud83c\udffc\u200d\u2642\ufe0f|\ud83e\uddda\ud83c\udffd\u200d\u2642\ufe0f|\ud83e\uddda\ud83c\udffe\u200d\u2642\ufe0f|\ud83e\uddda\ud83c\udfff\u200d\u2642\ufe0f|\ud83e\uddda\ud83c\udffb\u200d\u2640\ufe0f|\ud83e\uddda\ud83c\udffc\u200d\u2640\ufe0f|\ud83e\uddda\ud83c\udffd\u200d\u2640\ufe0f|\ud83e\uddda\ud83c\udffe\u200d\u2640\ufe0f|\ud83e\uddda\ud83c\udfff\u200d\u2640\ufe0f|\ud83e\udddb\ud83c\udffb\u200d\u2642\ufe0f|\ud83e\udddb\ud83c\udffc\u200d\u2642\ufe0f|\ud83e\udddb\ud83c\udffd\u200d\u2642\ufe0f|\ud83e\udddb\ud83c\udffe\u200d\u2642\ufe0f|\ud83e\udddb\ud83c\udfff\u200d\u2642\ufe0f|\ud83e\udddb\ud83c\udffb\u200d\u2640\ufe0f|\ud83e\udddb\ud83c\udffc\u200d\u2640\ufe0f|\ud83e\udddb\ud83c\udffd\u200d\u2640\ufe0f|\ud83e\udddb\ud83c\udffe\u200d\u2640\ufe0f|\ud83e\udddb\ud83c\udfff\u200d\u2640\ufe0f|\ud83e\udddc\ud83c\udffb\u200d\u2642\ufe0f|\ud83e\udddc\ud83c\udffc\u200d\u2642\ufe0f|\ud83e\udddc\ud83c\udffd\u200d\u2642\ufe0f|\ud83e\udddc\ud83c\udffe\u200d\u2642\ufe0f|\ud83e\udddc\ud83c\udfff\u200d\u2642\ufe0f|\ud83e\udddc\ud83c\udffb\u200d\u2640\ufe0f|\ud83e\udddc\ud83c\udffc\u200d\u2640\ufe0f|\ud83e\udddc\ud83c\udffd\u200d\u2640\ufe0f|\ud83e\udddc\ud83c\udffe\u200d\u2640\ufe0f|\ud83e\udddc\ud83c\udfff\u200d\u2640\ufe0f|\ud83e\udddd\ud83c\udffb\u200d\u2642\ufe0f|\ud83e\udddd\ud83c\udffc\u200d\u2642\ufe0f|\ud83e\udddd\ud83c\udffd\u200d\u2642\ufe0f|\ud83e\udddd\ud83c\udffe\u200d\u2642\ufe0f|\ud83e\udddd\ud83c\udfff\u200d\u2642\ufe0f|\ud83e\udddd\ud83c\udffb\u200d\u2640\ufe0f|\ud83e\udddd\ud83c\udffc\u200d\u2640\ufe0f|\ud83e\udddd\ud83c\udffd\u200d\u2640\ufe0f|\ud83e\udddd\ud83c\udffe\u200d\u2640\ufe0f|\ud83e\udddd\ud83c\udfff\u200d\u2640\ufe0f|\ud83d\udc86\ud83c\udffb\u200d\u2642\ufe0f|\ud83d\udc86\ud83c\udffc\u200d\u2642\ufe0f|\ud83d\udc86\ud83c\udffd\u200d\u2642\ufe0f|\ud83d\udc86\ud83c\udffe\u200d\u2642\ufe0f|\ud83d\udc86\ud83c\udfff\u200d\u2642\ufe0f|\ud83d\udc86\ud83c\udffb\u200d\u2640\ufe0f|\ud83d\udc86\ud83c\udffc\u200d\u2640\ufe0f|\ud83d\udc86\ud83c\udffd\u200d\u2640\ufe0f|\ud83d\udc86\ud83c\udffe\u200d\u2640\ufe0f|\ud83d\udc86\ud83c\udfff\u200d\u2640\ufe0f|\ud83d\udc87\ud83c\udffb\u200d\u2642\ufe0f|\ud83d\udc87\ud83c\udffc\u200d\u2642\ufe0f|\ud83d\udc87\ud83c\udffd\u200d\u2642\ufe0f|\ud83d\udc87\ud83c\udffe\u200d\u2642\ufe0f|\ud83d\udc87\ud83c\udfff\u200d\u2642\ufe0f|\ud83d\udc87\ud83c\udffb\u200d\u2640\ufe0f|\ud83d\udc87\ud83c\udffc\u200d\u2640\ufe0f|\ud83d\udc87\ud83c\udffd\u200d\u2640\ufe0f|\ud83d\udc87\ud83c\udffe\u200d\u2640\ufe0f|\ud83d\udc87\ud83c\udfff\u200d\u2640\ufe0f|\ud83d\udeb6\ud83c\udffb\u200d\u2642\ufe0f|\ud83d\udeb6\ud83c\udffc\u200d\u2642\ufe0f|\ud83d\udeb6\ud83c\udffd\u200d\u2642\ufe0f|\ud83d\udeb6\ud83c\udffe\u200d\u2642\ufe0f|\ud83d\udeb6\ud83c\udfff\u200d\u2642\ufe0f|\ud83d\udeb6\ud83c\udffb\u200d\u2640\ufe0f|\ud83d\udeb6\ud83c\udffc\u200d\u2640\ufe0f|\ud83d\udeb6\ud83c\udffd\u200d\u2640\ufe0f|\ud83d\udeb6\ud83c\udffe\u200d\u2640\ufe0f|\ud83d\udeb6\ud83c\udfff\u200d\u2640\ufe0f|\ud83d\udeb6\ud83c\udffb\u200d\u27a1\ufe0f|\ud83d\udeb6\ud83c\udffc\u200d\u27a1\ufe0f|\ud83d\udeb6\ud83c\udffd\u200d\u27a1\ufe0f|\ud83d\udeb6\ud83c\udffe\u200d\u27a1\ufe0f|\ud83d\udeb6\ud83c\udfff\u200d\u27a1\ufe0f|\ud83e\uddcd\ud83c\udffb\u200d\u2642\ufe0f|\ud83e\uddcd\ud83c\udffc\u200d\u2642\ufe0f|\ud83e\uddcd\ud83c\udffd\u200d\u2642\ufe0f|\ud83e\uddcd\ud83c\udffe\u200d\u2642\ufe0f|\ud83e\uddcd\ud83c\udfff\u200d\u2642\ufe0f|\ud83e\uddcd\ud83c\udffb\u200d\u2640\ufe0f|\ud83e\uddcd\ud83c\udffc\u200d\u2640\ufe0f|\ud83e\uddcd\ud83c\udffd\u200d\u2640\ufe0f|\ud83e\uddcd\ud83c\udffe\u200d\u2640\ufe0f|\ud83e\uddcd\ud83c\udfff\u200d\u2640\ufe0f|\ud83e\uddce\ud83c\udffb\u200d\u2642\ufe0f|\ud83e\uddce\ud83c\udffc\u200d\u2642\ufe0f|\ud83e\uddce\ud83c\udffd\u200d\u2642\ufe0f|\ud83e\uddce\ud83c\udffe\u200d\u2642\ufe0f|\ud83e\uddce\ud83c\udfff\u200d\u2642\ufe0f|\ud83e\uddce\ud83c\udffb\u200d\u2640\ufe0f|\ud83e\uddce\ud83c\udffc\u200d\u2640\ufe0f|\ud83e\uddce\ud83c\udffd\u200d\u2640\ufe0f|\ud83e\uddce\ud83c\udffe\u200d\u2640\ufe0f|\ud83e\uddce\ud83c\udfff\u200d\u2640\ufe0f|\ud83e\uddce\ud83c\udffb\u200d\u27a1\ufe0f|\ud83e\uddce\ud83c\udffc\u200d\u27a1\ufe0f|\ud83e\uddce\ud83c\udffd\u200d\u27a1\ufe0f|\ud83e\uddce\ud83c\udffe\u200d\u27a1\ufe0f|\ud83e\uddce\ud83c\udfff\u200d\u27a1\ufe0f|\ud83e\uddd1\ud83c\udffb\u200d\ud83e\uddaf|\ud83e\uddd1\ud83c\udffc\u200d\ud83e\uddaf|\ud83e\uddd1\ud83c\udffd\u200d\ud83e\uddaf|\ud83e\uddd1\ud83c\udffe\u200d\ud83e\uddaf|\ud83e\uddd1\ud83c\udfff\u200d\ud83e\uddaf|\ud83d\udc68\ud83c\udffb\u200d\ud83e\uddaf|\ud83d\udc68\ud83c\udffc\u200d\ud83e\uddaf|\ud83d\udc68\ud83c\udffd\u200d\ud83e\uddaf|\ud83d\udc68\ud83c\udffe\u200d\ud83e\uddaf|\ud83d\udc68\ud83c\udfff\u200d\ud83e\uddaf|\ud83d\udc69\ud83c\udffb\u200d\ud83e\uddaf|\ud83d\udc69\ud83c\udffc\u200d\ud83e\uddaf|\ud83d\udc69\ud83c\udffd\u200d\ud83e\uddaf|\ud83d\udc69\ud83c\udffe\u200d\ud83e\uddaf|\ud83d\udc69\ud83c\udfff\u200d\ud83e\uddaf|\ud83e\uddd1\ud83c\udffb\u200d\ud83e\uddbc|\ud83e\uddd1\ud83c\udffc\u200d\ud83e\uddbc|\ud83e\uddd1\ud83c\udffd\u200d\ud83e\uddbc|\ud83e\uddd1\ud83c\udffe\u200d\ud83e\uddbc|\ud83e\uddd1\ud83c\udfff\u200d\ud83e\uddbc|\ud83d\udc68\ud83c\udffb\u200d\ud83e\uddbc|\ud83d\udc68\ud83c\udffc\u200d\ud83e\uddbc|\ud83d\udc68\ud83c\udffd\u200d\ud83e\uddbc|\ud83d\udc68\ud83c\udffe\u200d\ud83e\uddbc|\ud83d\udc68\ud83c\udfff\u200d\ud83e\uddbc|\ud83d\udc69\ud83c\udffb\u200d\ud83e\uddbc|\ud83d\udc69\ud83c\udffc\u200d\ud83e\uddbc|\ud83d\udc69\ud83c\udffd\u200d\ud83e\uddbc|\ud83d\udc69\ud83c\udffe\u200d\ud83e\uddbc|\ud83d\udc69\ud83c\udfff\u200d\ud83e\uddbc|\ud83e\uddd1\ud83c\udffb\u200d\ud83e\uddbd|\ud83e\uddd1\ud83c\udffc\u200d\ud83e\uddbd|\ud83e\uddd1\ud83c\udffd\u200d\ud83e\uddbd|\ud83e\uddd1\ud83c\udffe\u200d\ud83e\uddbd|\ud83e\uddd1\ud83c\udfff\u200d\ud83e\uddbd|\ud83d\udc68\ud83c\udffb\u200d\ud83e\uddbd|\ud83d\udc68\ud83c\udffc\u200d\ud83e\uddbd|\ud83d\udc68\ud83c\udffd\u200d\ud83e\uddbd|\ud83d\udc68\ud83c\udffe\u200d\ud83e\uddbd|\ud83d\udc68\ud83c\udfff\u200d\ud83e\uddbd|\ud83d\udc69\ud83c\udffb\u200d\ud83e\uddbd|\ud83d\udc69\ud83c\udffc\u200d\ud83e\uddbd|\ud83d\udc69\ud83c\udffd\u200d\ud83e\uddbd|\ud83d\udc69\ud83c\udffe\u200d\ud83e\uddbd|\ud83d\udc69\ud83c\udfff\u200d\ud83e\uddbd|\ud83c\udfc3\ud83c\udffb\u200d\u2642\ufe0f|\ud83c\udfc3\ud83c\udffc\u200d\u2642\ufe0f|\ud83c\udfc3\ud83c\udffd\u200d\u2642\ufe0f|\ud83c\udfc3\ud83c\udffe\u200d\u2642\ufe0f|\ud83c\udfc3\ud83c\udfff\u200d\u2642\ufe0f|\ud83c\udfc3\ud83c\udffb\u200d\u2640\ufe0f|\ud83c\udfc3\ud83c\udffc\u200d\u2640\ufe0f|\ud83c\udfc3\ud83c\udffd\u200d\u2640\ufe0f|\ud83c\udfc3\ud83c\udffe\u200d\u2640\ufe0f|\ud83c\udfc3\ud83c\udfff\u200d\u2640\ufe0f|\ud83c\udfc3\ud83c\udffb\u200d\u27a1\ufe0f|\ud83c\udfc3\ud83c\udffc\u200d\u27a1\ufe0f|\ud83c\udfc3\ud83c\udffd\u200d\u27a1\ufe0f|\ud83c\udfc3\ud83c\udffe\u200d\u27a1\ufe0f|\ud83c\udfc3\ud83c\udfff\u200d\u27a1\ufe0f|\ud83e\uddd6\ud83c\udffb\u200d\u2642\ufe0f|\ud83e\uddd6\ud83c\udffc\u200d\u2642\ufe0f|\ud83e\uddd6\ud83c\udffd\u200d\u2642\ufe0f|\ud83e\uddd6\ud83c\udffe\u200d\u2642\ufe0f|\ud83e\uddd6\ud83c\udfff\u200d\u2642\ufe0f|\ud83e\uddd6\ud83c\udffb\u200d\u2640\ufe0f|\ud83e\uddd6\ud83c\udffc\u200d\u2640\ufe0f|\ud83e\uddd6\ud83c\udffd\u200d\u2640\ufe0f|\ud83e\uddd6\ud83c\udffe\u200d\u2640\ufe0f|\ud83e\uddd6\ud83c\udfff\u200d\u2640\ufe0f|\ud83e\uddd7\ud83c\udffb\u200d\u2642\ufe0f|\ud83e\uddd7\ud83c\udffc\u200d\u2642\ufe0f|\ud83e\uddd7\ud83c\udffd\u200d\u2642\ufe0f|\ud83e\uddd7\ud83c\udffe\u200d\u2642\ufe0f|\ud83e\uddd7\ud83c\udfff\u200d\u2642\ufe0f|\ud83e\uddd7\ud83c\udffb\u200d\u2640\ufe0f|\ud83e\uddd7\ud83c\udffc\u200d\u2640\ufe0f|\ud83e\uddd7\ud83c\udffd\u200d\u2640\ufe0f|\ud83e\uddd7\ud83c\udffe\u200d\u2640\ufe0f|\ud83e\uddd7\ud83c\udfff\u200d\u2640\ufe0f|\ud83c\udfcc\ud83c\udffb\u200d\u2642\ufe0f|\ud83c\udfcc\ud83c\udffc\u200d\u2642\ufe0f|\ud83c\udfcc\ud83c\udffd\u200d\u2642\ufe0f|\ud83c\udfcc\ud83c\udffe\u200d\u2642\ufe0f|\ud83c\udfcc\ud83c\udfff\u200d\u2642\ufe0f|\ud83c\udfcc\ud83c\udffb\u200d\u2640\ufe0f|\ud83c\udfcc\ud83c\udffc\u200d\u2640\ufe0f|\ud83c\udfcc\ud83c\udffd\u200d\u2640\ufe0f|\ud83c\udfcc\ud83c\udffe\u200d\u2640\ufe0f|\ud83c\udfcc\ud83c\udfff\u200d\u2640\ufe0f|\ud83c\udfc4\ud83c\udffb\u200d\u2642\ufe0f|\ud83c\udfc4\ud83c\udffc\u200d\u2642\ufe0f|\ud83c\udfc4\ud83c\udffd\u200d\u2642\ufe0f|\ud83c\udfc4\ud83c\udffe\u200d\u2642\ufe0f|\ud83c\udfc4\ud83c\udfff\u200d\u2642\ufe0f|\ud83c\udfc4\ud83c\udffb\u200d\u2640\ufe0f|\ud83c\udfc4\ud83c\udffc\u200d\u2640\ufe0f|\ud83c\udfc4\ud83c\udffd\u200d\u2640\ufe0f|\ud83c\udfc4\ud83c\udffe\u200d\u2640\ufe0f|\ud83c\udfc4\ud83c\udfff\u200d\u2640\ufe0f|\ud83d\udea3\ud83c\udffb\u200d\u2642\ufe0f|\ud83d\udea3\ud83c\udffc\u200d\u2642\ufe0f|\ud83d\udea3\ud83c\udffd\u200d\u2642\ufe0f|\ud83d\udea3\ud83c\udffe\u200d\u2642\ufe0f|\ud83d\udea3\ud83c\udfff\u200d\u2642\ufe0f|\ud83d\udea3\ud83c\udffb\u200d\u2640\ufe0f|\ud83d\udea3\ud83c\udffc\u200d\u2640\ufe0f|\ud83d\udea3\ud83c\udffd\u200d\u2640\ufe0f|\ud83d\udea3\ud83c\udffe\u200d\u2640\ufe0f|\ud83d\udea3\ud83c\udfff\u200d\u2640\ufe0f|\ud83c\udfca\ud83c\udffb\u200d\u2642\ufe0f|\ud83c\udfca\ud83c\udffc\u200d\u2642\ufe0f|\ud83c\udfca\ud83c\udffd\u200d\u2642\ufe0f|\ud83c\udfca\ud83c\udffe\u200d\u2642\ufe0f|\ud83c\udfca\ud83c\udfff\u200d\u2642\ufe0f|\ud83c\udfca\ud83c\udffb\u200d\u2640\ufe0f|\ud83c\udfca\ud83c\udffc\u200d\u2640\ufe0f|\ud83c\udfca\ud83c\udffd\u200d\u2640\ufe0f|\ud83c\udfca\ud83c\udffe\u200d\u2640\ufe0f|\ud83c\udfca\ud83c\udfff\u200d\u2640\ufe0f|\ud83c\udfcb\ud83c\udffb\u200d\u2642\ufe0f|\ud83c\udfcb\ud83c\udffc\u200d\u2642\ufe0f|\ud83c\udfcb\ud83c\udffd\u200d\u2642\ufe0f|\ud83c\udfcb\ud83c\udffe\u200d\u2642\ufe0f|\ud83c\udfcb\ud83c\udfff\u200d\u2642\ufe0f|\ud83c\udfcb\ud83c\udffb\u200d\u2640\ufe0f|\ud83c\udfcb\ud83c\udffc\u200d\u2640\ufe0f|\ud83c\udfcb\ud83c\udffd\u200d\u2640\ufe0f|\ud83c\udfcb\ud83c\udffe\u200d\u2640\ufe0f|\ud83c\udfcb\ud83c\udfff\u200d\u2640\ufe0f|\ud83d\udeb4\ud83c\udffb\u200d\u2642\ufe0f|\ud83d\udeb4\ud83c\udffc\u200d\u2642\ufe0f|\ud83d\udeb4\ud83c\udffd\u200d\u2642\ufe0f|\ud83d\udeb4\ud83c\udffe\u200d\u2642\ufe0f|\ud83d\udeb4\ud83c\udfff\u200d\u2642\ufe0f|\ud83d\udeb4\ud83c\udffb\u200d\u2640\ufe0f|\ud83d\udeb4\ud83c\udffc\u200d\u2640\ufe0f|\ud83d\udeb4\ud83c\udffd\u200d\u2640\ufe0f|\ud83d\udeb4\ud83c\udffe\u200d\u2640\ufe0f|\ud83d\udeb4\ud83c\udfff\u200d\u2640\ufe0f|\ud83d\udeb5\ud83c\udffb\u200d\u2642\ufe0f|\ud83d\udeb5\ud83c\udffc\u200d\u2642\ufe0f|\ud83d\udeb5\ud83c\udffd\u200d\u2642\ufe0f|\ud83d\udeb5\ud83c\udffe\u200d\u2642\ufe0f|\ud83d\udeb5\ud83c\udfff\u200d\u2642\ufe0f|\ud83d\udeb5\ud83c\udffb\u200d\u2640\ufe0f|\ud83d\udeb5\ud83c\udffc\u200d\u2640\ufe0f|\ud83d\udeb5\ud83c\udffd\u200d\u2640\ufe0f|\ud83d\udeb5\ud83c\udffe\u200d\u2640\ufe0f|\ud83d\udeb5\ud83c\udfff\u200d\u2640\ufe0f|\ud83e\udd38\ud83c\udffb\u200d\u2642\ufe0f|\ud83e\udd38\ud83c\udffc\u200d\u2642\ufe0f|\ud83e\udd38\ud83c\udffd\u200d\u2642\ufe0f|\ud83e\udd38\ud83c\udffe\u200d\u2642\ufe0f|\ud83e\udd38\ud83c\udfff\u200d\u2642\ufe0f|\ud83e\udd38\ud83c\udffb\u200d\u2640\ufe0f|\ud83e\udd38\ud83c\udffc\u200d\u2640\ufe0f|\ud83e\udd38\ud83c\udffd\u200d\u2640\ufe0f|\ud83e\udd38\ud83c\udffe\u200d\u2640\ufe0f|\ud83e\udd38\ud83c\udfff\u200d\u2640\ufe0f|\ud83e\udd3d\ud83c\udffb\u200d\u2642\ufe0f|\ud83e\udd3d\ud83c\udffc\u200d\u2642\ufe0f|\ud83e\udd3d\ud83c\udffd\u200d\u2642\ufe0f|\ud83e\udd3d\ud83c\udffe\u200d\u2642\ufe0f|\ud83e\udd3d\ud83c\udfff\u200d\u2642\ufe0f|\ud83e\udd3d\ud83c\udffb\u200d\u2640\ufe0f|\ud83e\udd3d\ud83c\udffc\u200d\u2640\ufe0f|\ud83e\udd3d\ud83c\udffd\u200d\u2640\ufe0f|\ud83e\udd3d\ud83c\udffe\u200d\u2640\ufe0f|\ud83e\udd3d\ud83c\udfff\u200d\u2640\ufe0f|\ud83e\udd3e\ud83c\udffb\u200d\u2642\ufe0f|\ud83e\udd3e\ud83c\udffc\u200d\u2642\ufe0f|\ud83e\udd3e\ud83c\udffd\u200d\u2642\ufe0f|\ud83e\udd3e\ud83c\udffe\u200d\u2642\ufe0f|\ud83e\udd3e\ud83c\udfff\u200d\u2642\ufe0f|\ud83e\udd3e\ud83c\udffb\u200d\u2640\ufe0f|\ud83e\udd3e\ud83c\udffc\u200d\u2640\ufe0f|\ud83e\udd3e\ud83c\udffd\u200d\u2640\ufe0f|\ud83e\udd3e\ud83c\udffe\u200d\u2640\ufe0f|\ud83e\udd3e\ud83c\udfff\u200d\u2640\ufe0f|\ud83e\udd39\ud83c\udffb\u200d\u2642\ufe0f|\ud83e\udd39\ud83c\udffc\u200d\u2642\ufe0f|\ud83e\udd39\ud83c\udffd\u200d\u2642\ufe0f|\ud83e\udd39\ud83c\udffe\u200d\u2642\ufe0f|\ud83e\udd39\ud83c\udfff\u200d\u2642\ufe0f|\ud83e\udd39\ud83c\udffb\u200d\u2640\ufe0f|\ud83e\udd39\ud83c\udffc\u200d\u2640\ufe0f|\ud83e\udd39\ud83c\udffd\u200d\u2640\ufe0f|\ud83e\udd39\ud83c\udffe\u200d\u2640\ufe0f|\ud83e\udd39\ud83c\udfff\u200d\u2640\ufe0f|\ud83e\uddd8\ud83c\udffb\u200d\u2642\ufe0f|\ud83e\uddd8\ud83c\udffc\u200d\u2642\ufe0f|\ud83e\uddd8\ud83c\udffd\u200d\u2642\ufe0f|\ud83e\uddd8\ud83c\udffe\u200d\u2642\ufe0f|\ud83e\uddd8\ud83c\udfff\u200d\u2642\ufe0f|\ud83e\uddd8\ud83c\udffb\u200d\u2640\ufe0f|\ud83e\uddd8\ud83c\udffc\u200d\u2640\ufe0f|\ud83e\uddd8\ud83c\udffd\u200d\u2640\ufe0f|\ud83e\uddd8\ud83c\udffe\u200d\u2640\ufe0f|\ud83e\uddd8\ud83c\udfff\u200d\u2640\ufe0f|\ud83d\ude36\u200d\ud83c\udf2b\ufe0f|\ud83d\udd75\ufe0f\u200d\u2642\ufe0f|\ud83d\udd75\ufe0f\u200d\u2640\ufe0f|\ud83c\udfcc\ufe0f\u200d\u2642\ufe0f|\ud83c\udfcc\ufe0f\u200d\u2640\ufe0f|\ud83c\udfcb\ufe0f\u200d\u2642\ufe0f|\ud83c\udfcb\ufe0f\u200d\u2640\ufe0f|\ud83c\udff3\ufe0f\u200d\ud83c\udf08|\ud83c\udff3\ufe0f\u200d\u26a7\ufe0f|\u26f9\ud83c\udffb\u200d\u2642\ufe0f|\u26f9\ud83c\udffc\u200d\u2642\ufe0f|\u26f9\ud83c\udffd\u200d\u2642\ufe0f|\u26f9\ud83c\udffe\u200d\u2642\ufe0f|\u26f9\ud83c\udfff\u200d\u2642\ufe0f|\u26f9\ud83c\udffb\u200d\u2640\ufe0f|\u26f9\ud83c\udffc\u200d\u2640\ufe0f|\u26f9\ud83c\udffd\u200d\u2640\ufe0f|\u26f9\ud83c\udffe\u200d\u2640\ufe0f|\u26f9\ud83c\udfff\u200d\u2640\ufe0f|\ud83d\ude2e\u200d\ud83d\udca8|\ud83d\ude42\u200d\u2194\ufe0f|\ud83d\ude42\u200d\u2195\ufe0f|\ud83d\ude35\u200d\ud83d\udcab|\u2764\ufe0f\u200d\ud83d\udd25|\u2764\ufe0f\u200d\ud83e\ude79|\ud83e\uddd4\u200d\u2642\ufe0f|\ud83e\uddd4\u200d\u2640\ufe0f|\ud83d\udc68\u200d\ud83e\uddb0|\ud83d\udc68\u200d\ud83e\uddb1|\ud83d\udc68\u200d\ud83e\uddb3|\ud83d\udc68\u200d\ud83e\uddb2|\ud83d\udc69\u200d\ud83e\uddb0|\ud83e\uddd1\u200d\ud83e\uddb0|\ud83d\udc69\u200d\ud83e\uddb1|\ud83e\uddd1\u200d\ud83e\uddb1|\ud83d\udc69\u200d\ud83e\uddb3|\ud83e\uddd1\u200d\ud83e\uddb3|\ud83d\udc69\u200d\ud83e\uddb2|\ud83e\uddd1\u200d\ud83e\uddb2|\ud83d\udc71\u200d\u2640\ufe0f|\ud83d\udc71\u200d\u2642\ufe0f|\ud83d\ude4d\u200d\u2642\ufe0f|\ud83d\ude4d\u200d\u2640\ufe0f|\ud83d\ude4e\u200d\u2642\ufe0f|\ud83d\ude4e\u200d\u2640\ufe0f|\ud83d\ude45\u200d\u2642\ufe0f|\ud83d\ude45\u200d\u2640\ufe0f|\ud83d\ude46\u200d\u2642\ufe0f|\ud83d\ude46\u200d\u2640\ufe0f|\ud83d\udc81\u200d\u2642\ufe0f|\ud83d\udc81\u200d\u2640\ufe0f|\ud83d\ude4b\u200d\u2642\ufe0f|\ud83d\ude4b\u200d\u2640\ufe0f|\ud83e\uddcf\u200d\u2642\ufe0f|\ud83e\uddcf\u200d\u2640\ufe0f|\ud83d\ude47\u200d\u2642\ufe0f|\ud83d\ude47\u200d\u2640\ufe0f|\ud83e\udd26\u200d\u2642\ufe0f|\ud83e\udd26\u200d\u2640\ufe0f|\ud83e\udd37\u200d\u2642\ufe0f|\ud83e\udd37\u200d\u2640\ufe0f|\ud83e\uddd1\u200d\u2695\ufe0f|\ud83d\udc68\u200d\u2695\ufe0f|\ud83d\udc69\u200d\u2695\ufe0f|\ud83e\uddd1\u200d\ud83c\udf93|\ud83d\udc68\u200d\ud83c\udf93|\ud83d\udc69\u200d\ud83c\udf93|\ud83e\uddd1\u200d\ud83c\udfeb|\ud83d\udc68\u200d\ud83c\udfeb|\ud83d\udc69\u200d\ud83c\udfeb|\ud83e\uddd1\u200d\u2696\ufe0f|\ud83d\udc68\u200d\u2696\ufe0f|\ud83d\udc69\u200d\u2696\ufe0f|\ud83e\uddd1\u200d\ud83c\udf3e|\ud83d\udc68\u200d\ud83c\udf3e|\ud83d\udc69\u200d\ud83c\udf3e|\ud83e\uddd1\u200d\ud83c\udf73|\ud83d\udc68\u200d\ud83c\udf73|\ud83d\udc69\u200d\ud83c\udf73|\ud83e\uddd1\u200d\ud83d\udd27|\ud83d\udc68\u200d\ud83d\udd27|\ud83d\udc69\u200d\ud83d\udd27|\ud83e\uddd1\u200d\ud83c\udfed|\ud83d\udc68\u200d\ud83c\udfed|\ud83d\udc69\u200d\ud83c\udfed|\ud83e\uddd1\u200d\ud83d\udcbc|\ud83d\udc68\u200d\ud83d\udcbc|\ud83d\udc69\u200d\ud83d\udcbc|\ud83e\uddd1\u200d\ud83d\udd2c|\ud83d\udc68\u200d\ud83d\udd2c|\ud83d\udc69\u200d\ud83d\udd2c|\ud83e\uddd1\u200d\ud83d\udcbb|\ud83d\udc68\u200d\ud83d\udcbb|\ud83d\udc69\u200d\ud83d\udcbb|\ud83e\uddd1\u200d\ud83c\udfa4|\ud83d\udc68\u200d\ud83c\udfa4|\ud83d\udc69\u200d\ud83c\udfa4|\ud83e\uddd1\u200d\ud83c\udfa8|\ud83d\udc68\u200d\ud83c\udfa8|\ud83d\udc69\u200d\ud83c\udfa8|\ud83e\uddd1\u200d\u2708\ufe0f|\ud83d\udc68\u200d\u2708\ufe0f|\ud83d\udc69\u200d\u2708\ufe0f|\ud83e\uddd1\u200d\ud83d\ude80|\ud83d\udc68\u200d\ud83d\ude80|\ud83d\udc69\u200d\ud83d\ude80|\ud83e\uddd1\u200d\ud83d\ude92|\ud83d\udc68\u200d\ud83d\ude92|\ud83d\udc69\u200d\ud83d\ude92|\ud83d\udc6e\u200d\u2642\ufe0f|\ud83d\udc6e\u200d\u2640\ufe0f|\ud83d\udc82\u200d\u2642\ufe0f|\ud83d\udc82\u200d\u2640\ufe0f|\ud83d\udc77\u200d\u2642\ufe0f|\ud83d\udc77\u200d\u2640\ufe0f|\ud83d\udc73\u200d\u2642\ufe0f|\ud83d\udc73\u200d\u2640\ufe0f|\ud83e\udd35\u200d\u2642\ufe0f|\ud83e\udd35\u200d\u2640\ufe0f|\ud83d\udc70\u200d\u2642\ufe0f|\ud83d\udc70\u200d\u2640\ufe0f|\ud83d\udc69\u200d\ud83c\udf7c|\ud83d\udc68\u200d\ud83c\udf7c|\ud83e\uddd1\u200d\ud83c\udf7c|\ud83e\uddd1\u200d\ud83c\udf84|\ud83e\uddb8\u200d\u2642\ufe0f|\ud83e\uddb8\u200d\u2640\ufe0f|\ud83e\uddb9\u200d\u2642\ufe0f|\ud83e\uddb9\u200d\u2640\ufe0f|\ud83e\uddd9\u200d\u2642\ufe0f|\ud83e\uddd9\u200d\u2640\ufe0f|\ud83e\uddda\u200d\u2642\ufe0f|\ud83e\uddda\u200d\u2640\ufe0f|\ud83e\udddb\u200d\u2642\ufe0f|\ud83e\udddb\u200d\u2640\ufe0f|\ud83e\udddc\u200d\u2642\ufe0f|\ud83e\udddc\u200d\u2640\ufe0f|\ud83e\udddd\u200d\u2642\ufe0f|\ud83e\udddd\u200d\u2640\ufe0f|\ud83e\uddde\u200d\u2642\ufe0f|\ud83e\uddde\u200d\u2640\ufe0f|\ud83e\udddf\u200d\u2642\ufe0f|\ud83e\udddf\u200d\u2640\ufe0f|\ud83d\udc86\u200d\u2642\ufe0f|\ud83d\udc86\u200d\u2640\ufe0f|\ud83d\udc87\u200d\u2642\ufe0f|\ud83d\udc87\u200d\u2640\ufe0f|\ud83d\udeb6\u200d\u2642\ufe0f|\ud83d\udeb6\u200d\u2640\ufe0f|\ud83d\udeb6\u200d\u27a1\ufe0f|\ud83e\uddcd\u200d\u2642\ufe0f|\ud83e\uddcd\u200d\u2640\ufe0f|\ud83e\uddce\u200d\u2642\ufe0f|\ud83e\uddce\u200d\u2640\ufe0f|\ud83e\uddce\u200d\u27a1\ufe0f|\ud83e\uddd1\u200d\ud83e\uddaf|\ud83d\udc68\u200d\ud83e\uddaf|\ud83d\udc69\u200d\ud83e\uddaf|\ud83e\uddd1\u200d\ud83e\uddbc|\ud83d\udc68\u200d\ud83e\uddbc|\ud83d\udc69\u200d\ud83e\uddbc|\ud83e\uddd1\u200d\ud83e\uddbd|\ud83d\udc68\u200d\ud83e\uddbd|\ud83d\udc69\u200d\ud83e\uddbd|\ud83c\udfc3\u200d\u2642\ufe0f|\ud83c\udfc3\u200d\u2640\ufe0f|\ud83c\udfc3\u200d\u27a1\ufe0f|\ud83d\udc6f\u200d\u2642\ufe0f|\ud83d\udc6f\u200d\u2640\ufe0f|\ud83e\uddd6\u200d\u2642\ufe0f|\ud83e\uddd6\u200d\u2640\ufe0f|\ud83e\uddd7\u200d\u2642\ufe0f|\ud83e\uddd7\u200d\u2640\ufe0f|\ud83c\udfc4\u200d\u2642\ufe0f|\ud83c\udfc4\u200d\u2640\ufe0f|\ud83d\udea3\u200d\u2642\ufe0f|\ud83d\udea3\u200d\u2640\ufe0f|\ud83c\udfca\u200d\u2642\ufe0f|\ud83c\udfca\u200d\u2640\ufe0f|\u26f9\ufe0f\u200d\u2642\ufe0f|\u26f9\ufe0f\u200d\u2640\ufe0f|\ud83d\udeb4\u200d\u2642\ufe0f|\ud83d\udeb4\u200d\u2640\ufe0f|\ud83d\udeb5\u200d\u2642\ufe0f|\ud83d\udeb5\u200d\u2640\ufe0f|\ud83e\udd38\u200d\u2642\ufe0f|\ud83e\udd38\u200d\u2640\ufe0f|\ud83e\udd3c\u200d\u2642\ufe0f|\ud83e\udd3c\u200d\u2640\ufe0f|\ud83e\udd3d\u200d\u2642\ufe0f|\ud83e\udd3d\u200d\u2640\ufe0f|\ud83e\udd3e\u200d\u2642\ufe0f|\ud83e\udd3e\u200d\u2640\ufe0f|\ud83e\udd39\u200d\u2642\ufe0f|\ud83e\udd39\u200d\u2640\ufe0f|\ud83e\uddd8\u200d\u2642\ufe0f|\ud83e\uddd8\u200d\u2640\ufe0f|\ud83d\udc68\u200d\ud83d\udc66|\ud83d\udc68\u200d\ud83d\udc67|\ud83d\udc69\u200d\ud83d\udc66|\ud83d\udc69\u200d\ud83d\udc67|\ud83e\uddd1\u200d\ud83e\uddd2|\ud83d\udc15\u200d\ud83e\uddba|\ud83d\udc3b\u200d\u2744\ufe0f|\ud83d\udc26\u200d\ud83d\udd25|\ud83c\udf4b\u200d\ud83d\udfe9|\ud83c\udf44\u200d\ud83d\udfeb|\u26d3\ufe0f\u200d\ud83d\udca5|\ud83c\udff4\u200d\u2620\ufe0f|\ud83d\udc08\u200d\u2b1b|\ud83d\udc26\u200d\u2b1b|\ud83c\udde6\ud83c\udde8|\ud83c\udde6\ud83c\udde9|\ud83c\udde6\ud83c\uddea|\ud83c\udde6\ud83c\uddeb|\ud83c\udde6\ud83c\uddec|\ud83c\udde6\ud83c\uddee|\ud83c\udde6\ud83c\uddf1|\ud83c\udde6\ud83c\uddf2|\ud83c\udde6\ud83c\uddf4|\ud83c\udde6\ud83c\uddf6|\ud83c\udde6\ud83c\uddf7|\ud83c\udde6\ud83c\uddf8|\ud83c\udde6\ud83c\uddf9|\ud83c\udde6\ud83c\uddfa|\ud83c\udde6\ud83c\uddfc|\ud83c\udde6\ud83c\uddfd|\ud83c\udde6\ud83c\uddff|\ud83c\udde7\ud83c\udde6|\ud83c\udde7\ud83c\udde7|\ud83c\udde7\ud83c\udde9|\ud83c\udde7\ud83c\uddea|\ud83c\udde7\ud83c\uddeb|\ud83c\udde7\ud83c\uddec|\ud83c\udde7\ud83c\udded|\ud83c\udde7\ud83c\uddee|\ud83c\udde7\ud83c\uddef|\ud83c\udde7\ud83c\uddf1|\ud83c\udde7\ud83c\uddf2|\ud83c\udde7\ud83c\uddf3|\ud83c\udde7\ud83c\uddf4|\ud83c\udde7\ud83c\uddf6|\ud83c\udde7\ud83c\uddf7|\ud83c\udde7\ud83c\uddf8|\ud83c\udde7\ud83c\uddf9|\ud83c\udde7\ud83c\uddfb|\ud83c\udde7\ud83c\uddfc|\ud83c\udde7\ud83c\uddfe|\ud83c\udde7\ud83c\uddff|\ud83c\udde8\ud83c\udde6|\ud83c\udde8\ud83c\udde8|\ud83c\udde8\ud83c\udde9|\ud83c\udde8\ud83c\uddeb|\ud83c\udde8\ud83c\uddec|\ud83c\udde8\ud83c\udded|\ud83c\udde8\ud83c\uddee|\ud83c\udde8\ud83c\uddf0|\ud83c\udde8\ud83c\uddf1|\ud83c\udde8\ud83c\uddf2|\ud83c\udde8\ud83c\uddf3|\ud83c\udde8\ud83c\uddf4|\ud83c\udde8\ud83c\uddf5|\ud83c\udde8\ud83c\uddf7|\ud83c\udde8\ud83c\uddfa|\ud83c\udde8\ud83c\uddfb|\ud83c\udde8\ud83c\uddfc|\ud83c\udde8\ud83c\uddfd|\ud83c\udde8\ud83c\uddfe|\ud83c\udde8\ud83c\uddff|\ud83c\udde9\ud83c\uddea|\ud83c\udde9\ud83c\uddec|\ud83c\udde9\ud83c\uddef|\ud83c\udde9\ud83c\uddf0|\ud83c\udde9\ud83c\uddf2|\ud83c\udde9\ud83c\uddf4|\ud83c\udde9\ud83c\uddff|\ud83c\uddea\ud83c\udde6|\ud83c\uddea\ud83c\udde8|\ud83c\uddea\ud83c\uddea|\ud83c\uddea\ud83c\uddec|\ud83c\uddea\ud83c\udded|\ud83c\uddea\ud83c\uddf7|\ud83c\uddea\ud83c\uddf8|\ud83c\uddea\ud83c\uddf9|\ud83c\uddea\ud83c\uddfa|\ud83c\uddeb\ud83c\uddee|\ud83c\uddeb\ud83c\uddef|\ud83c\uddeb\ud83c\uddf0|\ud83c\uddeb\ud83c\uddf2|\ud83c\uddeb\ud83c\uddf4|\ud83c\uddeb\ud83c\uddf7|\ud83c\uddec\ud83c\udde6|\ud83c\uddec\ud83c\udde7|\ud83c\uddec\ud83c\udde9|\ud83c\uddec\ud83c\uddea|\ud83c\uddec\ud83c\uddeb|\ud83c\uddec\ud83c\uddec|\ud83c\uddec\ud83c\udded|\ud83c\uddec\ud83c\uddee|\ud83c\uddec\ud83c\uddf1|\ud83c\uddec\ud83c\uddf2|\ud83c\uddec\ud83c\uddf3|\ud83c\uddec\ud83c\uddf5|\ud83c\uddec\ud83c\uddf6|\ud83c\uddec\ud83c\uddf7|\ud83c\uddec\ud83c\uddf8|\ud83c\uddec\ud83c\uddf9|\ud83c\uddec\ud83c\uddfa|\ud83c\uddec\ud83c\uddfc|\ud83c\uddec\ud83c\uddfe|\ud83c\udded\ud83c\uddf0|\ud83c\udded\ud83c\uddf2|\ud83c\udded\ud83c\uddf3|\ud83c\udded\ud83c\uddf7|\ud83c\udded\ud83c\uddf9|\ud83c\udded\ud83c\uddfa|\ud83c\uddee\ud83c\udde8|\ud83c\uddee\ud83c\udde9|\ud83c\uddee\ud83c\uddea|\ud83c\uddee\ud83c\uddf1|\ud83c\uddee\ud83c\uddf2|\ud83c\uddee\ud83c\uddf3|\ud83c\uddee\ud83c\uddf4|\ud83c\uddee\ud83c\uddf6|\ud83c\uddee\ud83c\uddf7|\ud83c\uddee\ud83c\uddf8|\ud83c\uddee\ud83c\uddf9|\ud83c\uddef\ud83c\uddea|\ud83c\uddef\ud83c\uddf2|\ud83c\uddef\ud83c\uddf4|\ud83c\uddef\ud83c\uddf5|\ud83c\uddf0\ud83c\uddea|\ud83c\uddf0\ud83c\uddec|\ud83c\uddf0\ud83c\udded|\ud83c\uddf0\ud83c\uddee|\ud83c\uddf0\ud83c\uddf2|\ud83c\uddf0\ud83c\uddf3|\ud83c\uddf0\ud83c\uddf5|\ud83c\uddf0\ud83c\uddf7|\ud83c\uddf0\ud83c\uddfc|\ud83c\uddf0\ud83c\uddfe|\ud83c\uddf0\ud83c\uddff|\ud83c\uddf1\ud83c\udde6|\ud83c\uddf1\ud83c\udde7|\ud83c\uddf1\ud83c\udde8|\ud83c\uddf1\ud83c\uddee|\ud83c\uddf1\ud83c\uddf0|\ud83c\uddf1\ud83c\uddf7|\ud83c\uddf1\ud83c\uddf8|\ud83c\uddf1\ud83c\uddf9|\ud83c\uddf1\ud83c\uddfa|\ud83c\uddf1\ud83c\uddfb|\ud83c\uddf1\ud83c\uddfe|\ud83c\uddf2\ud83c\udde6|\ud83c\uddf2\ud83c\udde8|\ud83c\uddf2\ud83c\udde9|\ud83c\uddf2\ud83c\uddea|\ud83c\uddf2\ud83c\uddeb|\ud83c\uddf2\ud83c\uddec|\ud83c\uddf2\ud83c\udded|\ud83c\uddf2\ud83c\uddf0|\ud83c\uddf2\ud83c\uddf1|\ud83c\uddf2\ud83c\uddf2|\ud83c\uddf2\ud83c\uddf3|\ud83c\uddf2\ud83c\uddf4|\ud83c\uddf2\ud83c\uddf5|\ud83c\uddf2\ud83c\uddf6|\ud83c\uddf2\ud83c\uddf7|\ud83c\uddf2\ud83c\uddf8|\ud83c\uddf2\ud83c\uddf9|\ud83c\uddf2\ud83c\uddfa|\ud83c\uddf2\ud83c\uddfb|\ud83c\uddf2\ud83c\uddfc|\ud83c\uddf2\ud83c\uddfd|\ud83c\uddf2\ud83c\uddfe|\ud83c\uddf2\ud83c\uddff|\ud83c\uddf3\ud83c\udde6|\ud83c\uddf3\ud83c\udde8|\ud83c\uddf3\ud83c\uddea|\ud83c\uddf3\ud83c\uddeb|\ud83c\uddf3\ud83c\uddec|\ud83c\uddf3\ud83c\uddee|\ud83c\uddf3\ud83c\uddf1|\ud83c\uddf3\ud83c\uddf4|\ud83c\uddf3\ud83c\uddf5|\ud83c\uddf3\ud83c\uddf7|\ud83c\uddf3\ud83c\uddfa|\ud83c\uddf3\ud83c\uddff|\ud83c\uddf4\ud83c\uddf2|\ud83c\uddf5\ud83c\udde6|\ud83c\uddf5\ud83c\uddea|\ud83c\uddf5\ud83c\uddeb|\ud83c\uddf5\ud83c\uddec|\ud83c\uddf5\ud83c\udded|\ud83c\uddf5\ud83c\uddf0|\ud83c\uddf5\ud83c\uddf1|\ud83c\uddf5\ud83c\uddf2|\ud83c\uddf5\ud83c\uddf3|\ud83c\uddf5\ud83c\uddf7|\ud83c\uddf5\ud83c\uddf8|\ud83c\uddf5\ud83c\uddf9|\ud83c\uddf5\ud83c\uddfc|\ud83c\uddf5\ud83c\uddfe|\ud83c\uddf6\ud83c\udde6|\ud83c\uddf7\ud83c\uddea|\ud83c\uddf7\ud83c\uddf4|\ud83c\uddf7\ud83c\uddf8|\ud83c\uddf7\ud83c\uddfa|\ud83c\uddf7\ud83c\uddfc|\ud83c\uddf8\ud83c\udde6|\ud83c\uddf8\ud83c\udde7|\ud83c\uddf8\ud83c\udde8|\ud83c\uddf8\ud83c\udde9|\ud83c\uddf8\ud83c\uddea|\ud83c\uddf8\ud83c\uddec|\ud83c\uddf8\ud83c\udded|\ud83c\uddf8\ud83c\uddee|\ud83c\uddf8\ud83c\uddef|\ud83c\uddf8\ud83c\uddf0|\ud83c\uddf8\ud83c\uddf1|\ud83c\uddf8\ud83c\uddf2|\ud83c\uddf8\ud83c\uddf3|\ud83c\uddf8\ud83c\uddf4|\ud83c\uddf8\ud83c\uddf7|\ud83c\uddf8\ud83c\uddf8|\ud83c\uddf8\ud83c\uddf9|\ud83c\uddf8\ud83c\uddfb|\ud83c\uddf8\ud83c\uddfd|\ud83c\uddf8\ud83c\uddfe|\ud83c\uddf8\ud83c\uddff|\ud83c\uddf9\ud83c\udde6|\ud83c\uddf9\ud83c\udde8|\ud83c\uddf9\ud83c\udde9|\ud83c\uddf9\ud83c\uddeb|\ud83c\uddf9\ud83c\uddec|\ud83c\uddf9\ud83c\udded|\ud83c\uddf9\ud83c\uddef|\ud83c\uddf9\ud83c\uddf0|\ud83c\uddf9\ud83c\uddf1|\ud83c\uddf9\ud83c\uddf2|\ud83c\uddf9\ud83c\uddf3|\ud83c\uddf9\ud83c\uddf4|\ud83c\uddf9\ud83c\uddf7|\ud83c\uddf9\ud83c\uddf9|\ud83c\uddf9\ud83c\uddfb|\ud83c\uddf9\ud83c\uddfc|\ud83c\uddf9\ud83c\uddff|\ud83c\uddfa\ud83c\udde6|\ud83c\uddfa\ud83c\uddec|\ud83c\uddfa\ud83c\uddf2|\ud83c\uddfa\ud83c\uddf3|\ud83c\uddfa\ud83c\uddf8|\ud83c\uddfa\ud83c\uddfe|\ud83c\uddfa\ud83c\uddff|\ud83c\uddfb\ud83c\udde6|\ud83c\uddfb\ud83c\udde8|\ud83c\uddfb\ud83c\uddea|\ud83c\uddfb\ud83c\uddec|\ud83c\uddfb\ud83c\uddee|\ud83c\uddfb\ud83c\uddf3|\ud83c\uddfb\ud83c\uddfa|\ud83c\uddfc\ud83c\uddeb|\ud83c\uddfc\ud83c\uddf8|\ud83c\uddfd\ud83c\uddf0|\ud83c\uddfe\ud83c\uddea|\ud83c\uddfe\ud83c\uddf9|\ud83c\uddff\ud83c\udde6|\ud83c\uddff\ud83c\uddf2|\ud83c\uddff\ud83c\uddfc|\ud83d\udc4b\ud83c\udffb|\ud83d\udc4b\ud83c\udffc|\ud83d\udc4b\ud83c\udffd|\ud83d\udc4b\ud83c\udffe|\ud83d\udc4b\ud83c\udfff|\ud83e\udd1a\ud83c\udffb|\ud83e\udd1a\ud83c\udffc|\ud83e\udd1a\ud83c\udffd|\ud83e\udd1a\ud83c\udffe|\ud83e\udd1a\ud83c\udfff|\ud83d\udd90\ud83c\udffb|\ud83d\udd90\ud83c\udffc|\ud83d\udd90\ud83c\udffd|\ud83d\udd90\ud83c\udffe|\ud83d\udd90\ud83c\udfff|\ud83d\udd96\ud83c\udffb|\ud83d\udd96\ud83c\udffc|\ud83d\udd96\ud83c\udffd|\ud83d\udd96\ud83c\udffe|\ud83d\udd96\ud83c\udfff|\ud83e\udef1\ud83c\udffb|\ud83e\udef1\ud83c\udffc|\ud83e\udef1\ud83c\udffd|\ud83e\udef1\ud83c\udffe|\ud83e\udef1\ud83c\udfff|\ud83e\udef2\ud83c\udffb|\ud83e\udef2\ud83c\udffc|\ud83e\udef2\ud83c\udffd|\ud83e\udef2\ud83c\udffe|\ud83e\udef2\ud83c\udfff|\ud83e\udef3\ud83c\udffb|\ud83e\udef3\ud83c\udffc|\ud83e\udef3\ud83c\udffd|\ud83e\udef3\ud83c\udffe|\ud83e\udef3\ud83c\udfff|\ud83e\udef4\ud83c\udffb|\ud83e\udef4\ud83c\udffc|\ud83e\udef4\ud83c\udffd|\ud83e\udef4\ud83c\udffe|\ud83e\udef4\ud83c\udfff|\ud83e\udef7\ud83c\udffb|\ud83e\udef7\ud83c\udffc|\ud83e\udef7\ud83c\udffd|\ud83e\udef7\ud83c\udffe|\ud83e\udef7\ud83c\udfff|\ud83e\udef8\ud83c\udffb|\ud83e\udef8\ud83c\udffc|\ud83e\udef8\ud83c\udffd|\ud83e\udef8\ud83c\udffe|\ud83e\udef8\ud83c\udfff|\ud83d\udc4c\ud83c\udffb|\ud83d\udc4c\ud83c\udffc|\ud83d\udc4c\ud83c\udffd|\ud83d\udc4c\ud83c\udffe|\ud83d\udc4c\ud83c\udfff|\ud83e\udd0c\ud83c\udffb|\ud83e\udd0c\ud83c\udffc|\ud83e\udd0c\ud83c\udffd|\ud83e\udd0c\ud83c\udffe|\ud83e\udd0c\ud83c\udfff|\ud83e\udd0f\ud83c\udffb|\ud83e\udd0f\ud83c\udffc|\ud83e\udd0f\ud83c\udffd|\ud83e\udd0f\ud83c\udffe|\ud83e\udd0f\ud83c\udfff|\ud83e\udd1e\ud83c\udffb|\ud83e\udd1e\ud83c\udffc|\ud83e\udd1e\ud83c\udffd|\ud83e\udd1e\ud83c\udffe|\ud83e\udd1e\ud83c\udfff|\ud83e\udef0\ud83c\udffb|\ud83e\udef0\ud83c\udffc|\ud83e\udef0\ud83c\udffd|\ud83e\udef0\ud83c\udffe|\ud83e\udef0\ud83c\udfff|\ud83e\udd1f\ud83c\udffb|\ud83e\udd1f\ud83c\udffc|\ud83e\udd1f\ud83c\udffd|\ud83e\udd1f\ud83c\udffe|\ud83e\udd1f\ud83c\udfff|\ud83e\udd18\ud83c\udffb|\ud83e\udd18\ud83c\udffc|\ud83e\udd18\ud83c\udffd|\ud83e\udd18\ud83c\udffe|\ud83e\udd18\ud83c\udfff|\ud83e\udd19\ud83c\udffb|\ud83e\udd19\ud83c\udffc|\ud83e\udd19\ud83c\udffd|\ud83e\udd19\ud83c\udffe|\ud83e\udd19\ud83c\udfff|\ud83d\udc48\ud83c\udffb|\ud83d\udc48\ud83c\udffc|\ud83d\udc48\ud83c\udffd|\ud83d\udc48\ud83c\udffe|\ud83d\udc48\ud83c\udfff|\ud83d\udc49\ud83c\udffb|\ud83d\udc49\ud83c\udffc|\ud83d\udc49\ud83c\udffd|\ud83d\udc49\ud83c\udffe|\ud83d\udc49\ud83c\udfff|\ud83d\udc46\ud83c\udffb|\ud83d\udc46\ud83c\udffc|\ud83d\udc46\ud83c\udffd|\ud83d\udc46\ud83c\udffe|\ud83d\udc46\ud83c\udfff|\ud83d\udd95\ud83c\udffb|\ud83d\udd95\ud83c\udffc|\ud83d\udd95\ud83c\udffd|\ud83d\udd95\ud83c\udffe|\ud83d\udd95\ud83c\udfff|\ud83d\udc47\ud83c\udffb|\ud83d\udc47\ud83c\udffc|\ud83d\udc47\ud83c\udffd|\ud83d\udc47\ud83c\udffe|\ud83d\udc47\ud83c\udfff|\ud83e\udef5\ud83c\udffb|\ud83e\udef5\ud83c\udffc|\ud83e\udef5\ud83c\udffd|\ud83e\udef5\ud83c\udffe|\ud83e\udef5\ud83c\udfff|\ud83d\udc4d\ud83c\udffb|\ud83d\udc4d\ud83c\udffc|\ud83d\udc4d\ud83c\udffd|\ud83d\udc4d\ud83c\udffe|\ud83d\udc4d\ud83c\udfff|\ud83d\udc4e\ud83c\udffb|\ud83d\udc4e\ud83c\udffc|\ud83d\udc4e\ud83c\udffd|\ud83d\udc4e\ud83c\udffe|\ud83d\udc4e\ud83c\udfff|\ud83d\udc4a\ud83c\udffb|\ud83d\udc4a\ud83c\udffc|\ud83d\udc4a\ud83c\udffd|\ud83d\udc4a\ud83c\udffe|\ud83d\udc4a\ud83c\udfff|\ud83e\udd1b\ud83c\udffb|\ud83e\udd1b\ud83c\udffc|\ud83e\udd1b\ud83c\udffd|\ud83e\udd1b\ud83c\udffe|\ud83e\udd1b\ud83c\udfff|\ud83e\udd1c\ud83c\udffb|\ud83e\udd1c\ud83c\udffc|\ud83e\udd1c\ud83c\udffd|\ud83e\udd1c\ud83c\udffe|\ud83e\udd1c\ud83c\udfff|\ud83d\udc4f\ud83c\udffb|\ud83d\udc4f\ud83c\udffc|\ud83d\udc4f\ud83c\udffd|\ud83d\udc4f\ud83c\udffe|\ud83d\udc4f\ud83c\udfff|\ud83d\ude4c\ud83c\udffb|\ud83d\ude4c\ud83c\udffc|\ud83d\ude4c\ud83c\udffd|\ud83d\ude4c\ud83c\udffe|\ud83d\ude4c\ud83c\udfff|\ud83e\udef6\ud83c\udffb|\ud83e\udef6\ud83c\udffc|\ud83e\udef6\ud83c\udffd|\ud83e\udef6\ud83c\udffe|\ud83e\udef6\ud83c\udfff|\ud83d\udc50\ud83c\udffb|\ud83d\udc50\ud83c\udffc|\ud83d\udc50\ud83c\udffd|\ud83d\udc50\ud83c\udffe|\ud83d\udc50\ud83c\udfff|\ud83e\udd32\ud83c\udffb|\ud83e\udd32\ud83c\udffc|\ud83e\udd32\ud83c\udffd|\ud83e\udd32\ud83c\udffe|\ud83e\udd32\ud83c\udfff|\ud83e\udd1d\ud83c\udffb|\ud83e\udd1d\ud83c\udffc|\ud83e\udd1d\ud83c\udffd|\ud83e\udd1d\ud83c\udffe|\ud83e\udd1d\ud83c\udfff|\ud83d\ude4f\ud83c\udffb|\ud83d\ude4f\ud83c\udffc|\ud83d\ude4f\ud83c\udffd|\ud83d\ude4f\ud83c\udffe|\ud83d\ude4f\ud83c\udfff|\ud83d\udc85\ud83c\udffb|\ud83d\udc85\ud83c\udffc|\ud83d\udc85\ud83c\udffd|\ud83d\udc85\ud83c\udffe|\ud83d\udc85\ud83c\udfff|\ud83e\udd33\ud83c\udffb|\ud83e\udd33\ud83c\udffc|\ud83e\udd33\ud83c\udffd|\ud83e\udd33\ud83c\udffe|\ud83e\udd33\ud83c\udfff|\ud83d\udcaa\ud83c\udffb|\ud83d\udcaa\ud83c\udffc|\ud83d\udcaa\ud83c\udffd|\ud83d\udcaa\ud83c\udffe|\ud83d\udcaa\ud83c\udfff|\ud83e\uddb5\ud83c\udffb|\ud83e\uddb5\ud83c\udffc|\ud83e\uddb5\ud83c\udffd|\ud83e\uddb5\ud83c\udffe|\ud83e\uddb5\ud83c\udfff|\ud83e\uddb6\ud83c\udffb|\ud83e\uddb6\ud83c\udffc|\ud83e\uddb6\ud83c\udffd|\ud83e\uddb6\ud83c\udffe|\ud83e\uddb6\ud83c\udfff|\ud83d\udc42\ud83c\udffb|\ud83d\udc42\ud83c\udffc|\ud83d\udc42\ud83c\udffd|\ud83d\udc42\ud83c\udffe|\ud83d\udc42\ud83c\udfff|\ud83e\uddbb\ud83c\udffb|\ud83e\uddbb\ud83c\udffc|\ud83e\uddbb\ud83c\udffd|\ud83e\uddbb\ud83c\udffe|\ud83e\uddbb\ud83c\udfff|\ud83d\udc43\ud83c\udffb|\ud83d\udc43\ud83c\udffc|\ud83d\udc43\ud83c\udffd|\ud83d\udc43\ud83c\udffe|\ud83d\udc43\ud83c\udfff|\ud83d\udc76\ud83c\udffb|\ud83d\udc76\ud83c\udffc|\ud83d\udc76\ud83c\udffd|\ud83d\udc76\ud83c\udffe|\ud83d\udc76\ud83c\udfff|\ud83e\uddd2\ud83c\udffb|\ud83e\uddd2\ud83c\udffc|\ud83e\uddd2\ud83c\udffd|\ud83e\uddd2\ud83c\udffe|\ud83e\uddd2\ud83c\udfff|\ud83d\udc66\ud83c\udffb|\ud83d\udc66\ud83c\udffc|\ud83d\udc66\ud83c\udffd|\ud83d\udc66\ud83c\udffe|\ud83d\udc66\ud83c\udfff|\ud83d\udc67\ud83c\udffb|\ud83d\udc67\ud83c\udffc|\ud83d\udc67\ud83c\udffd|\ud83d\udc67\ud83c\udffe|\ud83d\udc67\ud83c\udfff|\ud83e\uddd1\ud83c\udffb|\ud83e\uddd1\ud83c\udffc|\ud83e\uddd1\ud83c\udffd|\ud83e\uddd1\ud83c\udffe|\ud83e\uddd1\ud83c\udfff|\ud83d\udc71\ud83c\udffb|\ud83d\udc71\ud83c\udffc|\ud83d\udc71\ud83c\udffd|\ud83d\udc71\ud83c\udffe|\ud83d\udc71\ud83c\udfff|\ud83d\udc68\ud83c\udffb|\ud83d\udc68\ud83c\udffc|\ud83d\udc68\ud83c\udffd|\ud83d\udc68\ud83c\udffe|\ud83d\udc68\ud83c\udfff|\ud83e\uddd4\ud83c\udffb|\ud83e\uddd4\ud83c\udffc|\ud83e\uddd4\ud83c\udffd|\ud83e\uddd4\ud83c\udffe|\ud83e\uddd4\ud83c\udfff|\ud83d\udc69\ud83c\udffb|\ud83d\udc69\ud83c\udffc|\ud83d\udc69\ud83c\udffd|\ud83d\udc69\ud83c\udffe|\ud83d\udc69\ud83c\udfff|\ud83e\uddd3\ud83c\udffb|\ud83e\uddd3\ud83c\udffc|\ud83e\uddd3\ud83c\udffd|\ud83e\uddd3\ud83c\udffe|\ud83e\uddd3\ud83c\udfff|\ud83d\udc74\ud83c\udffb|\ud83d\udc74\ud83c\udffc|\ud83d\udc74\ud83c\udffd|\ud83d\udc74\ud83c\udffe|\ud83d\udc74\ud83c\udfff|\ud83d\udc75\ud83c\udffb|\ud83d\udc75\ud83c\udffc|\ud83d\udc75\ud83c\udffd|\ud83d\udc75\ud83c\udffe|\ud83d\udc75\ud83c\udfff|\ud83d\ude4d\ud83c\udffb|\ud83d\ude4d\ud83c\udffc|\ud83d\ude4d\ud83c\udffd|\ud83d\ude4d\ud83c\udffe|\ud83d\ude4d\ud83c\udfff|\ud83d\ude4e\ud83c\udffb|\ud83d\ude4e\ud83c\udffc|\ud83d\ude4e\ud83c\udffd|\ud83d\ude4e\ud83c\udffe|\ud83d\ude4e\ud83c\udfff|\ud83d\ude45\ud83c\udffb|\ud83d\ude45\ud83c\udffc|\ud83d\ude45\ud83c\udffd|\ud83d\ude45\ud83c\udffe|\ud83d\ude45\ud83c\udfff|\ud83d\ude46\ud83c\udffb|\ud83d\ude46\ud83c\udffc|\ud83d\ude46\ud83c\udffd|\ud83d\ude46\ud83c\udffe|\ud83d\ude46\ud83c\udfff|\ud83d\udc81\ud83c\udffb|\ud83d\udc81\ud83c\udffc|\ud83d\udc81\ud83c\udffd|\ud83d\udc81\ud83c\udffe|\ud83d\udc81\ud83c\udfff|\ud83d\ude4b\ud83c\udffb|\ud83d\ude4b\ud83c\udffc|\ud83d\ude4b\ud83c\udffd|\ud83d\ude4b\ud83c\udffe|\ud83d\ude4b\ud83c\udfff|\ud83e\uddcf\ud83c\udffb|\ud83e\uddcf\ud83c\udffc|\ud83e\uddcf\ud83c\udffd|\ud83e\uddcf\ud83c\udffe|\ud83e\uddcf\ud83c\udfff|\ud83d\ude47\ud83c\udffb|\ud83d\ude47\ud83c\udffc|\ud83d\ude47\ud83c\udffd|\ud83d\ude47\ud83c\udffe|\ud83d\ude47\ud83c\udfff|\ud83e\udd26\ud83c\udffb|\ud83e\udd26\ud83c\udffc|\ud83e\udd26\ud83c\udffd|\ud83e\udd26\ud83c\udffe|\ud83e\udd26\ud83c\udfff|\ud83e\udd37\ud83c\udffb|\ud83e\udd37\ud83c\udffc|\ud83e\udd37\ud83c\udffd|\ud83e\udd37\ud83c\udffe|\ud83e\udd37\ud83c\udfff|\ud83d\udc6e\ud83c\udffb|\ud83d\udc6e\ud83c\udffc|\ud83d\udc6e\ud83c\udffd|\ud83d\udc6e\ud83c\udffe|\ud83d\udc6e\ud83c\udfff|\ud83d\udd75\ud83c\udffb|\ud83d\udd75\ud83c\udffc|\ud83d\udd75\ud83c\udffd|\ud83d\udd75\ud83c\udffe|\ud83d\udd75\ud83c\udfff|\ud83d\udc82\ud83c\udffb|\ud83d\udc82\ud83c\udffc|\ud83d\udc82\ud83c\udffd|\ud83d\udc82\ud83c\udffe|\ud83d\udc82\ud83c\udfff|\ud83e\udd77\ud83c\udffb|\ud83e\udd77\ud83c\udffc|\ud83e\udd77\ud83c\udffd|\ud83e\udd77\ud83c\udffe|\ud83e\udd77\ud83c\udfff|\ud83d\udc77\ud83c\udffb|\ud83d\udc77\ud83c\udffc|\ud83d\udc77\ud83c\udffd|\ud83d\udc77\ud83c\udffe|\ud83d\udc77\ud83c\udfff|\ud83e\udec5\ud83c\udffb|\ud83e\udec5\ud83c\udffc|\ud83e\udec5\ud83c\udffd|\ud83e\udec5\ud83c\udffe|\ud83e\udec5\ud83c\udfff|\ud83e\udd34\ud83c\udffb|\ud83e\udd34\ud83c\udffc|\ud83e\udd34\ud83c\udffd|\ud83e\udd34\ud83c\udffe|\ud83e\udd34\ud83c\udfff|\ud83d\udc78\ud83c\udffb|\ud83d\udc78\ud83c\udffc|\ud83d\udc78\ud83c\udffd|\ud83d\udc78\ud83c\udffe|\ud83d\udc78\ud83c\udfff|\ud83d\udc73\ud83c\udffb|\ud83d\udc73\ud83c\udffc|\ud83d\udc73\ud83c\udffd|\ud83d\udc73\ud83c\udffe|\ud83d\udc73\ud83c\udfff|\ud83d\udc72\ud83c\udffb|\ud83d\udc72\ud83c\udffc|\ud83d\udc72\ud83c\udffd|\ud83d\udc72\ud83c\udffe|\ud83d\udc72\ud83c\udfff|\ud83e\uddd5\ud83c\udffb|\ud83e\uddd5\ud83c\udffc|\ud83e\uddd5\ud83c\udffd|\ud83e\uddd5\ud83c\udffe|\ud83e\uddd5\ud83c\udfff|\ud83e\udd35\ud83c\udffb|\ud83e\udd35\ud83c\udffc|\ud83e\udd35\ud83c\udffd|\ud83e\udd35\ud83c\udffe|\ud83e\udd35\ud83c\udfff|\ud83d\udc70\ud83c\udffb|\ud83d\udc70\ud83c\udffc|\ud83d\udc70\ud83c\udffd|\ud83d\udc70\ud83c\udffe|\ud83d\udc70\ud83c\udfff|\ud83e\udd30\ud83c\udffb|\ud83e\udd30\ud83c\udffc|\ud83e\udd30\ud83c\udffd|\ud83e\udd30\ud83c\udffe|\ud83e\udd30\ud83c\udfff|\ud83e\udec3\ud83c\udffb|\ud83e\udec3\ud83c\udffc|\ud83e\udec3\ud83c\udffd|\ud83e\udec3\ud83c\udffe|\ud83e\udec3\ud83c\udfff|\ud83e\udec4\ud83c\udffb|\ud83e\udec4\ud83c\udffc|\ud83e\udec4\ud83c\udffd|\ud83e\udec4\ud83c\udffe|\ud83e\udec4\ud83c\udfff|\ud83e\udd31\ud83c\udffb|\ud83e\udd31\ud83c\udffc|\ud83e\udd31\ud83c\udffd|\ud83e\udd31\ud83c\udffe|\ud83e\udd31\ud83c\udfff|\ud83d\udc7c\ud83c\udffb|\ud83d\udc7c\ud83c\udffc|\ud83d\udc7c\ud83c\udffd|\ud83d\udc7c\ud83c\udffe|\ud83d\udc7c\ud83c\udfff|\ud83c\udf85\ud83c\udffb|\ud83c\udf85\ud83c\udffc|\ud83c\udf85\ud83c\udffd|\ud83c\udf85\ud83c\udffe|\ud83c\udf85\ud83c\udfff|\ud83e\udd36\ud83c\udffb|\ud83e\udd36\ud83c\udffc|\ud83e\udd36\ud83c\udffd|\ud83e\udd36\ud83c\udffe|\ud83e\udd36\ud83c\udfff|\ud83e\uddb8\ud83c\udffb|\ud83e\uddb8\ud83c\udffc|\ud83e\uddb8\ud83c\udffd|\ud83e\uddb8\ud83c\udffe|\ud83e\uddb8\ud83c\udfff|\ud83e\uddb9\ud83c\udffb|\ud83e\uddb9\ud83c\udffc|\ud83e\uddb9\ud83c\udffd|\ud83e\uddb9\ud83c\udffe|\ud83e\uddb9\ud83c\udfff|\ud83e\uddd9\ud83c\udffb|\ud83e\uddd9\ud83c\udffc|\ud83e\uddd9\ud83c\udffd|\ud83e\uddd9\ud83c\udffe|\ud83e\uddd9\ud83c\udfff|\ud83e\uddda\ud83c\udffb|\ud83e\uddda\ud83c\udffc|\ud83e\uddda\ud83c\udffd|\ud83e\uddda\ud83c\udffe|\ud83e\uddda\ud83c\udfff|\ud83e\udddb\ud83c\udffb|\ud83e\udddb\ud83c\udffc|\ud83e\udddb\ud83c\udffd|\ud83e\udddb\ud83c\udffe|\ud83e\udddb\ud83c\udfff|\ud83e\udddc\ud83c\udffb|\ud83e\udddc\ud83c\udffc|\ud83e\udddc\ud83c\udffd|\ud83e\udddc\ud83c\udffe|\ud83e\udddc\ud83c\udfff|\ud83e\udddd\ud83c\udffb|\ud83e\udddd\ud83c\udffc|\ud83e\udddd\ud83c\udffd|\ud83e\udddd\ud83c\udffe|\ud83e\udddd\ud83c\udfff|\ud83d\udc86\ud83c\udffb|\ud83d\udc86\ud83c\udffc|\ud83d\udc86\ud83c\udffd|\ud83d\udc86\ud83c\udffe|\ud83d\udc86\ud83c\udfff|\ud83d\udc87\ud83c\udffb|\ud83d\udc87\ud83c\udffc|\ud83d\udc87\ud83c\udffd|\ud83d\udc87\ud83c\udffe|\ud83d\udc87\ud83c\udfff|\ud83d\udeb6\ud83c\udffb|\ud83d\udeb6\ud83c\udffc|\ud83d\udeb6\ud83c\udffd|\ud83d\udeb6\ud83c\udffe|\ud83d\udeb6\ud83c\udfff|\ud83e\uddcd\ud83c\udffb|\ud83e\uddcd\ud83c\udffc|\ud83e\uddcd\ud83c\udffd|\ud83e\uddcd\ud83c\udffe|\ud83e\uddcd\ud83c\udfff|\ud83e\uddce\ud83c\udffb|\ud83e\uddce\ud83c\udffc|\ud83e\uddce\ud83c\udffd|\ud83e\uddce\ud83c\udffe|\ud83e\uddce\ud83c\udfff|\ud83c\udfc3\ud83c\udffb|\ud83c\udfc3\ud83c\udffc|\ud83c\udfc3\ud83c\udffd|\ud83c\udfc3\ud83c\udffe|\ud83c\udfc3\ud83c\udfff|\ud83d\udc83\ud83c\udffb|\ud83d\udc83\ud83c\udffc|\ud83d\udc83\ud83c\udffd|\ud83d\udc83\ud83c\udffe|\ud83d\udc83\ud83c\udfff|\ud83d\udd7a\ud83c\udffb|\ud83d\udd7a\ud83c\udffc|\ud83d\udd7a\ud83c\udffd|\ud83d\udd7a\ud83c\udffe|\ud83d\udd7a\ud83c\udfff|\ud83d\udd74\ud83c\udffb|\ud83d\udd74\ud83c\udffc|\ud83d\udd74\ud83c\udffd|\ud83d\udd74\ud83c\udffe|\ud83d\udd74\ud83c\udfff|\ud83e\uddd6\ud83c\udffb|\ud83e\uddd6\ud83c\udffc|\ud83e\uddd6\ud83c\udffd|\ud83e\uddd6\ud83c\udffe|\ud83e\uddd6\ud83c\udfff|\ud83e\uddd7\ud83c\udffb|\ud83e\uddd7\ud83c\udffc|\ud83e\uddd7\ud83c\udffd|\ud83e\uddd7\ud83c\udffe|\ud83e\uddd7\ud83c\udfff|\ud83c\udfc7\ud83c\udffb|\ud83c\udfc7\ud83c\udffc|\ud83c\udfc7\ud83c\udffd|\ud83c\udfc7\ud83c\udffe|\ud83c\udfc7\ud83c\udfff|\ud83c\udfc2\ud83c\udffb|\ud83c\udfc2\ud83c\udffc|\ud83c\udfc2\ud83c\udffd|\ud83c\udfc2\ud83c\udffe|\ud83c\udfc2\ud83c\udfff|\ud83c\udfcc\ud83c\udffb|\ud83c\udfcc\ud83c\udffc|\ud83c\udfcc\ud83c\udffd|\ud83c\udfcc\ud83c\udffe|\ud83c\udfcc\ud83c\udfff|\ud83c\udfc4\ud83c\udffb|\ud83c\udfc4\ud83c\udffc|\ud83c\udfc4\ud83c\udffd|\ud83c\udfc4\ud83c\udffe|\ud83c\udfc4\ud83c\udfff|\ud83d\udea3\ud83c\udffb|\ud83d\udea3\ud83c\udffc|\ud83d\udea3\ud83c\udffd|\ud83d\udea3\ud83c\udffe|\ud83d\udea3\ud83c\udfff|\ud83c\udfca\ud83c\udffb|\ud83c\udfca\ud83c\udffc|\ud83c\udfca\ud83c\udffd|\ud83c\udfca\ud83c\udffe|\ud83c\udfca\ud83c\udfff|\ud83c\udfcb\ud83c\udffb|\ud83c\udfcb\ud83c\udffc|\ud83c\udfcb\ud83c\udffd|\ud83c\udfcb\ud83c\udffe|\ud83c\udfcb\ud83c\udfff|\ud83d\udeb4\ud83c\udffb|\ud83d\udeb4\ud83c\udffc|\ud83d\udeb4\ud83c\udffd|\ud83d\udeb4\ud83c\udffe|\ud83d\udeb4\ud83c\udfff|\ud83d\udeb5\ud83c\udffb|\ud83d\udeb5\ud83c\udffc|\ud83d\udeb5\ud83c\udffd|\ud83d\udeb5\ud83c\udffe|\ud83d\udeb5\ud83c\udfff|\ud83e\udd38\ud83c\udffb|\ud83e\udd38\ud83c\udffc|\ud83e\udd38\ud83c\udffd|\ud83e\udd38\ud83c\udffe|\ud83e\udd38\ud83c\udfff|\ud83e\udd3d\ud83c\udffb|\ud83e\udd3d\ud83c\udffc|\ud83e\udd3d\ud83c\udffd|\ud83e\udd3d\ud83c\udffe|\ud83e\udd3d\ud83c\udfff|\ud83e\udd3e\ud83c\udffb|\ud83e\udd3e\ud83c\udffc|\ud83e\udd3e\ud83c\udffd|\ud83e\udd3e\ud83c\udffe|\ud83e\udd3e\ud83c\udfff|\ud83e\udd39\ud83c\udffb|\ud83e\udd39\ud83c\udffc|\ud83e\udd39\ud83c\udffd|\ud83e\udd39\ud83c\udffe|\ud83e\udd39\ud83c\udfff|\ud83e\uddd8\ud83c\udffb|\ud83e\uddd8\ud83c\udffc|\ud83e\uddd8\ud83c\udffd|\ud83e\uddd8\ud83c\udffe|\ud83e\uddd8\ud83c\udfff|\ud83d\udec0\ud83c\udffb|\ud83d\udec0\ud83c\udffc|\ud83d\udec0\ud83c\udffd|\ud83d\udec0\ud83c\udffe|\ud83d\udec0\ud83c\udfff|\ud83d\udecc\ud83c\udffb|\ud83d\udecc\ud83c\udffc|\ud83d\udecc\ud83c\udffd|\ud83d\udecc\ud83c\udffe|\ud83d\udecc\ud83c\udfff|\ud83d\udc6d\ud83c\udffb|\ud83d\udc6d\ud83c\udffc|\ud83d\udc6d\ud83c\udffd|\ud83d\udc6d\ud83c\udffe|\ud83d\udc6d\ud83c\udfff|\ud83d\udc6b\ud83c\udffb|\ud83d\udc6b\ud83c\udffc|\ud83d\udc6b\ud83c\udffd|\ud83d\udc6b\ud83c\udffe|\ud83d\udc6b\ud83c\udfff|\ud83d\udc6c\ud83c\udffb|\ud83d\udc6c\ud83c\udffc|\ud83d\udc6c\ud83c\udffd|\ud83d\udc6c\ud83c\udffe|\ud83d\udc6c\ud83c\udfff|\ud83d\udc8f\ud83c\udffb|\ud83d\udc8f\ud83c\udffc|\ud83d\udc8f\ud83c\udffd|\ud83d\udc8f\ud83c\udffe|\ud83d\udc8f\ud83c\udfff|\ud83d\udc91\ud83c\udffb|\ud83d\udc91\ud83c\udffc|\ud83d\udc91\ud83c\udffd|\ud83d\udc91\ud83c\udffe|\ud83d\udc91\ud83c\udfff|\u0023\ufe0f\u20e3|\u002a\ufe0f\u20e3|\u0030\ufe0f\u20e3|\u0031\ufe0f\u20e3|\u0032\ufe0f\u20e3|\u0033\ufe0f\u20e3|\u0034\ufe0f\u20e3|\u0035\ufe0f\u20e3|\u0036\ufe0f\u20e3|\u0037\ufe0f\u20e3|\u0038\ufe0f\u20e3|\u0039\ufe0f\u20e3|\u270b\ud83c\udffb|\u270b\ud83c\udffc|\u270b\ud83c\udffd|\u270b\ud83c\udffe|\u270b\ud83c\udfff|\u270c\ud83c\udffb|\u270c\ud83c\udffc|\u270c\ud83c\udffd|\u270c\ud83c\udffe|\u270c\ud83c\udfff|\u261d\ud83c\udffb|\u261d\ud83c\udffc|\u261d\ud83c\udffd|\u261d\ud83c\udffe|\u261d\ud83c\udfff|\u270a\ud83c\udffb|\u270a\ud83c\udffc|\u270a\ud83c\udffd|\u270a\ud83c\udffe|\u270a\ud83c\udfff|\u270d\ud83c\udffb|\u270d\ud83c\udffc|\u270d\ud83c\udffd|\u270d\ud83c\udffe|\u270d\ud83c\udfff|\u26f9\ud83c\udffb|\u26f9\ud83c\udffc|\u26f9\ud83c\udffd|\u26f9\ud83c\udffe|\u26f9\ud83c\udfff|\ud83d\ude00|\ud83d\ude03|\ud83d\ude04|\ud83d\ude01|\ud83d\ude06|\ud83d\ude05|\ud83e\udd23|\ud83d\ude02|\ud83d\ude42|\ud83d\ude43|\ud83e\udee0|\ud83d\ude09|\ud83d\ude0a|\ud83d\ude07|\ud83e\udd70|\ud83d\ude0d|\ud83e\udd29|\ud83d\ude18|\ud83d\ude17|\ud83d\ude1a|\ud83d\ude19|\ud83e\udd72|\ud83d\ude0b|\ud83d\ude1b|\ud83d\ude1c|\ud83e\udd2a|\ud83d\ude1d|\ud83e\udd11|\ud83e\udd17|\ud83e\udd2d|\ud83e\udee2|\ud83e\udee3|\ud83e\udd2b|\ud83e\udd14|\ud83e\udee1|\ud83e\udd10|\ud83e\udd28|\ud83d\ude10|\ud83d\ude11|\ud83d\ude36|\ud83e\udee5|\ud83d\ude0f|\ud83d\ude12|\ud83d\ude44|\ud83d\ude2c|\ud83e\udd25|\ud83e\udee8|\ud83d\ude0c|\ud83d\ude14|\ud83d\ude2a|\ud83e\udd24|\ud83d\ude34|\ud83d\ude37|\ud83e\udd12|\ud83e\udd15|\ud83e\udd22|\ud83e\udd2e|\ud83e\udd27|\ud83e\udd75|\ud83e\udd76|\ud83e\udd74|\ud83d\ude35|\ud83e\udd2f|\ud83e\udd20|\ud83e\udd73|\ud83e\udd78|\ud83d\ude0e|\ud83e\udd13|\ud83e\uddd0|\ud83d\ude15|\ud83e\udee4|\ud83d\ude1f|\ud83d\ude41|\ud83d\ude2e|\ud83d\ude2f|\ud83d\ude32|\ud83d\ude33|\ud83e\udd7a|\ud83e\udd79|\ud83d\ude26|\ud83d\ude27|\ud83d\ude28|\ud83d\ude30|\ud83d\ude25|\ud83d\ude22|\ud83d\ude2d|\ud83d\ude31|\ud83d\ude16|\ud83d\ude23|\ud83d\ude1e|\ud83d\ude13|\ud83d\ude29|\ud83d\ude2b|\ud83e\udd71|\ud83d\ude24|\ud83d\ude21|\ud83d\ude20|\ud83e\udd2c|\ud83d\ude08|\ud83d\udc7f|\ud83d\udc80|\ud83d\udca9|\ud83e\udd21|\ud83d\udc79|\ud83d\udc7a|\ud83d\udc7b|\ud83d\udc7d|\ud83d\udc7e|\ud83e\udd16|\ud83d\ude3a|\ud83d\ude38|\ud83d\ude39|\ud83d\ude3b|\ud83d\ude3c|\ud83d\ude3d|\ud83d\ude40|\ud83d\ude3f|\ud83d\ude3e|\ud83d\ude48|\ud83d\ude49|\ud83d\ude4a|\ud83d\udc8c|\ud83d\udc98|\ud83d\udc9d|\ud83d\udc96|\ud83d\udc97|\ud83d\udc93|\ud83d\udc9e|\ud83d\udc95|\ud83d\udc9f|\ud83d\udc94|\ud83e\ude77|\ud83e\udde1|\ud83d\udc9b|\ud83d\udc9a|\ud83d\udc99|\ud83e\ude75|\ud83d\udc9c|\ud83e\udd0e|\ud83d\udda4|\ud83e\ude76|\ud83e\udd0d|\ud83d\udc8b|\ud83d\udcaf|\ud83d\udca2|\ud83d\udca5|\ud83d\udcab|\ud83d\udca6|\ud83d\udca8|\ud83d\udd73|\ud83d\udcac|\ud83d\udde8|\ud83d\uddef|\ud83d\udcad|\ud83d\udca4|\ud83d\udc4b|\ud83e\udd1a|\ud83d\udd90|\ud83d\udd96|\ud83e\udef1|\ud83e\udef2|\ud83e\udef3|\ud83e\udef4|\ud83e\udef7|\ud83e\udef8|\ud83d\udc4c|\ud83e\udd0c|\ud83e\udd0f|\ud83e\udd1e|\ud83e\udef0|\ud83e\udd1f|\ud83e\udd18|\ud83e\udd19|\ud83d\udc48|\ud83d\udc49|\ud83d\udc46|\ud83d\udd95|\ud83d\udc47|\ud83e\udef5|\ud83d\udc4d|\ud83d\udc4e|\ud83d\udc4a|\ud83e\udd1b|\ud83e\udd1c|\ud83d\udc4f|\ud83d\ude4c|\ud83e\udef6|\ud83d\udc50|\ud83e\udd32|\ud83e\udd1d|\ud83d\ude4f|\ud83d\udc85|\ud83e\udd33|\ud83d\udcaa|\ud83e\uddbe|\ud83e\uddbf|\ud83e\uddb5|\ud83e\uddb6|\ud83d\udc42|\ud83e\uddbb|\ud83d\udc43|\ud83e\udde0|\ud83e\udec0|\ud83e\udec1|\ud83e\uddb7|\ud83e\uddb4|\ud83d\udc40|\ud83d\udc41|\ud83d\udc45|\ud83d\udc44|\ud83e\udee6|\ud83d\udc76|\ud83e\uddd2|\ud83d\udc66|\ud83d\udc67|\ud83e\uddd1|\ud83d\udc71|\ud83d\udc68|\ud83e\uddd4|\ud83d\udc69|\ud83e\uddd3|\ud83d\udc74|\ud83d\udc75|\ud83d\ude4d|\ud83d\ude4e|\ud83d\ude45|\ud83d\ude46|\ud83d\udc81|\ud83d\ude4b|\ud83e\uddcf|\ud83d\ude47|\ud83e\udd26|\ud83e\udd37|\ud83d\udc6e|\ud83d\udd75|\ud83d\udc82|\ud83e\udd77|\ud83d\udc77|\ud83e\udec5|\ud83e\udd34|\ud83d\udc78|\ud83d\udc73|\ud83d\udc72|\ud83e\uddd5|\ud83e\udd35|\ud83d\udc70|\ud83e\udd30|\ud83e\udec3|\ud83e\udec4|\ud83e\udd31|\ud83d\udc7c|\ud83c\udf85|\ud83e\udd36|\ud83e\uddb8|\ud83e\uddb9|\ud83e\uddd9|\ud83e\uddda|\ud83e\udddb|\ud83e\udddc|\ud83e\udddd|\ud83e\uddde|\ud83e\udddf|\ud83e\uddcc|\ud83d\udc86|\ud83d\udc87|\ud83d\udeb6|\ud83e\uddcd|\ud83e\uddce|\ud83c\udfc3|\ud83d\udc83|\ud83d\udd7a|\ud83d\udd74|\ud83d\udc6f|\ud83e\uddd6|\ud83e\uddd7|\ud83e\udd3a|\ud83c\udfc7|\ud83c\udfc2|\ud83c\udfcc|\ud83c\udfc4|\ud83d\udea3|\ud83c\udfca|\ud83c\udfcb|\ud83d\udeb4|\ud83d\udeb5|\ud83e\udd38|\ud83e\udd3c|\ud83e\udd3d|\ud83e\udd3e|\ud83e\udd39|\ud83e\uddd8|\ud83d\udec0|\ud83d\udecc|\ud83d\udc6d|\ud83d\udc6b|\ud83d\udc6c|\ud83d\udc8f|\ud83d\udc91|\ud83d\udde3|\ud83d\udc64|\ud83d\udc65|\ud83e\udec2|\ud83d\udc6a|\ud83d\udc63|\ud83e\uddb0|\ud83e\uddb1|\ud83e\uddb3|\ud83e\uddb2|\ud83d\udc35|\ud83d\udc12|\ud83e\udd8d|\ud83e\udda7|\ud83d\udc36|\ud83d\udc15|\ud83e\uddae|\ud83d\udc29|\ud83d\udc3a|\ud83e\udd8a|\ud83e\udd9d|\ud83d\udc31|\ud83d\udc08|\ud83e\udd81|\ud83d\udc2f|\ud83d\udc05|\ud83d\udc06|\ud83d\udc34|\ud83e\udece|\ud83e\udecf|\ud83d\udc0e|\ud83e\udd84|\ud83e\udd93|\ud83e\udd8c|\ud83e\uddac|\ud83d\udc2e|\ud83d\udc02|\ud83d\udc03|\ud83d\udc04|\ud83d\udc37|\ud83d\udc16|\ud83d\udc17|\ud83d\udc3d|\ud83d\udc0f|\ud83d\udc11|\ud83d\udc10|\ud83d\udc2a|\ud83d\udc2b|\ud83e\udd99|\ud83e\udd92|\ud83d\udc18|\ud83e\udda3|\ud83e\udd8f|\ud83e\udd9b|\ud83d\udc2d|\ud83d\udc01|\ud83d\udc00|\ud83d\udc39|\ud83d\udc30|\ud83d\udc07|\ud83d\udc3f|\ud83e\uddab|\ud83e\udd94|\ud83e\udd87|\ud83d\udc3b|\ud83d\udc28|\ud83d\udc3c|\ud83e\udda5|\ud83e\udda6|\ud83e\udda8|\ud83e\udd98|\ud83e\udda1|\ud83d\udc3e|\ud83e\udd83|\ud83d\udc14|\ud83d\udc13|\ud83d\udc23|\ud83d\udc24|\ud83d\udc25|\ud83d\udc26|\ud83d\udc27|\ud83d\udd4a|\ud83e\udd85|\ud83e\udd86|\ud83e\udda2|\ud83e\udd89|\ud83e\udda4|\ud83e\udeb6|\ud83e\udda9|\ud83e\udd9a|\ud83e\udd9c|\ud83e\udebd|\ud83e\udebf|\ud83d\udc38|\ud83d\udc0a|\ud83d\udc22|\ud83e\udd8e|\ud83d\udc0d|\ud83d\udc32|\ud83d\udc09|\ud83e\udd95|\ud83e\udd96|\ud83d\udc33|\ud83d\udc0b|\ud83d\udc2c|\ud83e\uddad|\ud83d\udc1f|\ud83d\udc20|\ud83d\udc21|\ud83e\udd88|\ud83d\udc19|\ud83d\udc1a|\ud83e\udeb8|\ud83e\udebc|\ud83d\udc0c|\ud83e\udd8b|\ud83d\udc1b|\ud83d\udc1c|\ud83d\udc1d|\ud83e\udeb2|\ud83d\udc1e|\ud83e\udd97|\ud83e\udeb3|\ud83d\udd77|\ud83d\udd78|\ud83e\udd82|\ud83e\udd9f|\ud83e\udeb0|\ud83e\udeb1|\ud83e\udda0|\ud83d\udc90|\ud83c\udf38|\ud83d\udcae|\ud83e\udeb7|\ud83c\udff5|\ud83c\udf39|\ud83e\udd40|\ud83c\udf3a|\ud83c\udf3b|\ud83c\udf3c|\ud83c\udf37|\ud83e\udebb|\ud83c\udf31|\ud83e\udeb4|\ud83c\udf32|\ud83c\udf33|\ud83c\udf34|\ud83c\udf35|\ud83c\udf3e|\ud83c\udf3f|\ud83c\udf40|\ud83c\udf41|\ud83c\udf42|\ud83c\udf43|\ud83e\udeb9|\ud83e\udeba|\ud83c\udf44|\ud83c\udf47|\ud83c\udf48|\ud83c\udf49|\ud83c\udf4a|\ud83c\udf4b|\ud83c\udf4c|\ud83c\udf4d|\ud83e\udd6d|\ud83c\udf4e|\ud83c\udf4f|\ud83c\udf50|\ud83c\udf51|\ud83c\udf52|\ud83c\udf53|\ud83e\uded0|\ud83e\udd5d|\ud83c\udf45|\ud83e\uded2|\ud83e\udd65|\ud83e\udd51|\ud83c\udf46|\ud83e\udd54|\ud83e\udd55|\ud83c\udf3d|\ud83c\udf36|\ud83e\uded1|\ud83e\udd52|\ud83e\udd6c|\ud83e\udd66|\ud83e\uddc4|\ud83e\uddc5|\ud83e\udd5c|\ud83e\uded8|\ud83c\udf30|\ud83e\udeda|\ud83e\udedb|\ud83c\udf5e|\ud83e\udd50|\ud83e\udd56|\ud83e\uded3|\ud83e\udd68|\ud83e\udd6f|\ud83e\udd5e|\ud83e\uddc7|\ud83e\uddc0|\ud83c\udf56|\ud83c\udf57|\ud83e\udd69|\ud83e\udd53|\ud83c\udf54|\ud83c\udf5f|\ud83c\udf55|\ud83c\udf2d|\ud83e\udd6a|\ud83c\udf2e|\ud83c\udf2f|\ud83e\uded4|\ud83e\udd59|\ud83e\uddc6|\ud83e\udd5a|\ud83c\udf73|\ud83e\udd58|\ud83c\udf72|\ud83e\uded5|\ud83e\udd63|\ud83e\udd57|\ud83c\udf7f|\ud83e\uddc8|\ud83e\uddc2|\ud83e\udd6b|\ud83c\udf71|\ud83c\udf58|\ud83c\udf59|\ud83c\udf5a|\ud83c\udf5b|\ud83c\udf5c|\ud83c\udf5d|\ud83c\udf60|\ud83c\udf62|\ud83c\udf63|\ud83c\udf64|\ud83c\udf65|\ud83e\udd6e|\ud83c\udf61|\ud83e\udd5f|\ud83e\udd60|\ud83e\udd61|\ud83e\udd80|\ud83e\udd9e|\ud83e\udd90|\ud83e\udd91|\ud83e\uddaa|\ud83c\udf66|\ud83c\udf67|\ud83c\udf68|\ud83c\udf69|\ud83c\udf6a|\ud83c\udf82|\ud83c\udf70|\ud83e\uddc1|\ud83e\udd67|\ud83c\udf6b|\ud83c\udf6c|\ud83c\udf6d|\ud83c\udf6e|\ud83c\udf6f|\ud83c\udf7c|\ud83e\udd5b|\ud83e\uded6|\ud83c\udf75|\ud83c\udf76|\ud83c\udf7e|\ud83c\udf77|\ud83c\udf78|\ud83c\udf79|\ud83c\udf7a|\ud83c\udf7b|\ud83e\udd42|\ud83e\udd43|\ud83e\uded7|\ud83e\udd64|\ud83e\uddcb|\ud83e\uddc3|\ud83e\uddc9|\ud83e\uddca|\ud83e\udd62|\ud83c\udf7d|\ud83c\udf74|\ud83e\udd44|\ud83d\udd2a|\ud83e\uded9|\ud83c\udffa|\ud83c\udf0d|\ud83c\udf0e|\ud83c\udf0f|\ud83c\udf10|\ud83d\uddfa|\ud83d\uddfe|\ud83e\udded|\ud83c\udfd4|\ud83c\udf0b|\ud83d\uddfb|\ud83c\udfd5|\ud83c\udfd6|\ud83c\udfdc|\ud83c\udfdd|\ud83c\udfde|\ud83c\udfdf|\ud83c\udfdb|\ud83c\udfd7|\ud83e\uddf1|\ud83e\udea8|\ud83e\udeb5|\ud83d\uded6|\ud83c\udfd8|\ud83c\udfda|\ud83c\udfe0|\ud83c\udfe1|\ud83c\udfe2|\ud83c\udfe3|\ud83c\udfe4|\ud83c\udfe5|\ud83c\udfe6|\ud83c\udfe8|\ud83c\udfe9|\ud83c\udfea|\ud83c\udfeb|\ud83c\udfec|\ud83c\udfed|\ud83c\udfef|\ud83c\udff0|\ud83d\udc92|\ud83d\uddfc|\ud83d\uddfd|\ud83d\udd4c|\ud83d\uded5|\ud83d\udd4d|\ud83d\udd4b|\ud83c\udf01|\ud83c\udf03|\ud83c\udfd9|\ud83c\udf04|\ud83c\udf05|\ud83c\udf06|\ud83c\udf07|\ud83c\udf09|\ud83c\udfa0|\ud83d\udedd|\ud83c\udfa1|\ud83c\udfa2|\ud83d\udc88|\ud83c\udfaa|\ud83d\ude82|\ud83d\ude83|\ud83d\ude84|\ud83d\ude85|\ud83d\ude86|\ud83d\ude87|\ud83d\ude88|\ud83d\ude89|\ud83d\ude8a|\ud83d\ude9d|\ud83d\ude9e|\ud83d\ude8b|\ud83d\ude8c|\ud83d\ude8d|\ud83d\ude8e|\ud83d\ude90|\ud83d\ude91|\ud83d\ude92|\ud83d\ude93|\ud83d\ude94|\ud83d\ude95|\ud83d\ude96|\ud83d\ude97|\ud83d\ude98|\ud83d\ude99|\ud83d\udefb|\ud83d\ude9a|\ud83d\ude9b|\ud83d\ude9c|\ud83c\udfce|\ud83c\udfcd|\ud83d\udef5|\ud83e\uddbd|\ud83e\uddbc|\ud83d\udefa|\ud83d\udeb2|\ud83d\udef4|\ud83d\udef9|\ud83d\udefc|\ud83d\ude8f|\ud83d\udee3|\ud83d\udee4|\ud83d\udee2|\ud83d\udede|\ud83d\udea8|\ud83d\udea5|\ud83d\udea6|\ud83d\uded1|\ud83d\udea7|\ud83d\udedf|\ud83d\udef6|\ud83d\udea4|\ud83d\udef3|\ud83d\udee5|\ud83d\udea2|\ud83d\udee9|\ud83d\udeeb|\ud83d\udeec|\ud83e\ude82|\ud83d\udcba|\ud83d\ude81|\ud83d\ude9f|\ud83d\udea0|\ud83d\udea1|\ud83d\udef0|\ud83d\ude80|\ud83d\udef8|\ud83d\udece|\ud83e\uddf3|\ud83d\udd70|\ud83d\udd5b|\ud83d\udd67|\ud83d\udd50|\ud83d\udd5c|\ud83d\udd51|\ud83d\udd5d|\ud83d\udd52|\ud83d\udd5e|\ud83d\udd53|\ud83d\udd5f|\ud83d\udd54|\ud83d\udd60|\ud83d\udd55|\ud83d\udd61|\ud83d\udd56|\ud83d\udd62|\ud83d\udd57|\ud83d\udd63|\ud83d\udd58|\ud83d\udd64|\ud83d\udd59|\ud83d\udd65|\ud83d\udd5a|\ud83d\udd66|\ud83c\udf11|\ud83c\udf12|\ud83c\udf13|\ud83c\udf14|\ud83c\udf15|\ud83c\udf16|\ud83c\udf17|\ud83c\udf18|\ud83c\udf19|\ud83c\udf1a|\ud83c\udf1b|\ud83c\udf1c|\ud83c\udf21|\ud83c\udf1d|\ud83c\udf1e|\ud83e\ude90|\ud83c\udf1f|\ud83c\udf20|\ud83c\udf0c|\ud83c\udf24|\ud83c\udf25|\ud83c\udf26|\ud83c\udf27|\ud83c\udf28|\ud83c\udf29|\ud83c\udf2a|\ud83c\udf2b|\ud83c\udf2c|\ud83c\udf00|\ud83c\udf08|\ud83c\udf02|\ud83d\udd25|\ud83d\udca7|\ud83c\udf0a|\ud83c\udf83|\ud83c\udf84|\ud83c\udf86|\ud83c\udf87|\ud83e\udde8|\ud83c\udf88|\ud83c\udf89|\ud83c\udf8a|\ud83c\udf8b|\ud83c\udf8d|\ud83c\udf8e|\ud83c\udf8f|\ud83c\udf90|\ud83c\udf91|\ud83e\udde7|\ud83c\udf80|\ud83c\udf81|\ud83c\udf97|\ud83c\udf9f|\ud83c\udfab|\ud83c\udf96|\ud83c\udfc6|\ud83c\udfc5|\ud83e\udd47|\ud83e\udd48|\ud83e\udd49|\ud83e\udd4e|\ud83c\udfc0|\ud83c\udfd0|\ud83c\udfc8|\ud83c\udfc9|\ud83c\udfbe|\ud83e\udd4f|\ud83c\udfb3|\ud83c\udfcf|\ud83c\udfd1|\ud83c\udfd2|\ud83e\udd4d|\ud83c\udfd3|\ud83c\udff8|\ud83e\udd4a|\ud83e\udd4b|\ud83e\udd45|\ud83c\udfa3|\ud83e\udd3f|\ud83c\udfbd|\ud83c\udfbf|\ud83d\udef7|\ud83e\udd4c|\ud83c\udfaf|\ud83e\ude80|\ud83e\ude81|\ud83d\udd2b|\ud83c\udfb1|\ud83d\udd2e|\ud83e\ude84|\ud83c\udfae|\ud83d\udd79|\ud83c\udfb0|\ud83c\udfb2|\ud83e\udde9|\ud83e\uddf8|\ud83e\ude85|\ud83e\udea9|\ud83e\ude86|\ud83c\udccf|\ud83c\udc04|\ud83c\udfb4|\ud83c\udfad|\ud83d\uddbc|\ud83c\udfa8|\ud83e\uddf5|\ud83e\udea1|\ud83e\uddf6|\ud83e\udea2|\ud83d\udc53|\ud83d\udd76|\ud83e\udd7d|\ud83e\udd7c|\ud83e\uddba|\ud83d\udc54|\ud83d\udc55|\ud83d\udc56|\ud83e\udde3|\ud83e\udde4|\ud83e\udde5|\ud83e\udde6|\ud83d\udc57|\ud83d\udc58|\ud83e\udd7b|\ud83e\ude71|\ud83e\ude72|\ud83e\ude73|\ud83d\udc59|\ud83d\udc5a|\ud83e\udead|\ud83d\udc5b|\ud83d\udc5c|\ud83d\udc5d|\ud83d\udecd|\ud83c\udf92|\ud83e\ude74|\ud83d\udc5e|\ud83d\udc5f|\ud83e\udd7e|\ud83e\udd7f|\ud83d\udc60|\ud83d\udc61|\ud83e\ude70|\ud83d\udc62|\ud83e\udeae|\ud83d\udc51|\ud83d\udc52|\ud83c\udfa9|\ud83c\udf93|\ud83e\udde2|\ud83e\ude96|\ud83d\udcff|\ud83d\udc84|\ud83d\udc8d|\ud83d\udc8e|\ud83d\udd07|\ud83d\udd08|\ud83d\udd09|\ud83d\udd0a|\ud83d\udce2|\ud83d\udce3|\ud83d\udcef|\ud83d\udd14|\ud83d\udd15|\ud83c\udfbc|\ud83c\udfb5|\ud83c\udfb6|\ud83c\udf99|\ud83c\udf9a|\ud83c\udf9b|\ud83c\udfa4|\ud83c\udfa7|\ud83d\udcfb|\ud83c\udfb7|\ud83e\ude97|\ud83c\udfb8|\ud83c\udfb9|\ud83c\udfba|\ud83c\udfbb|\ud83e\ude95|\ud83e\udd41|\ud83e\ude98|\ud83e\ude87|\ud83e\ude88|\ud83d\udcf1|\ud83d\udcf2|\ud83d\udcde|\ud83d\udcdf|\ud83d\udce0|\ud83d\udd0b|\ud83e\udeab|\ud83d\udd0c|\ud83d\udcbb|\ud83d\udda5|\ud83d\udda8|\ud83d\uddb1|\ud83d\uddb2|\ud83d\udcbd|\ud83d\udcbe|\ud83d\udcbf|\ud83d\udcc0|\ud83e\uddee|\ud83c\udfa5|\ud83c\udf9e|\ud83d\udcfd|\ud83c\udfac|\ud83d\udcfa|\ud83d\udcf7|\ud83d\udcf8|\ud83d\udcf9|\ud83d\udcfc|\ud83d\udd0d|\ud83d\udd0e|\ud83d\udd6f|\ud83d\udca1|\ud83d\udd26|\ud83c\udfee|\ud83e\ude94|\ud83d\udcd4|\ud83d\udcd5|\ud83d\udcd6|\ud83d\udcd7|\ud83d\udcd8|\ud83d\udcd9|\ud83d\udcda|\ud83d\udcd3|\ud83d\udcd2|\ud83d\udcc3|\ud83d\udcdc|\ud83d\udcc4|\ud83d\udcf0|\ud83d\uddde|\ud83d\udcd1|\ud83d\udd16|\ud83c\udff7|\ud83d\udcb0|\ud83e\ude99|\ud83d\udcb4|\ud83d\udcb5|\ud83d\udcb6|\ud83d\udcb7|\ud83d\udcb8|\ud83d\udcb3|\ud83e\uddfe|\ud83d\udcb9|\ud83d\udce7|\ud83d\udce8|\ud83d\udce9|\ud83d\udce4|\ud83d\udce5|\ud83d\udce6|\ud83d\udceb|\ud83d\udcea|\ud83d\udcec|\ud83d\udced|\ud83d\udcee|\ud83d\uddf3|\ud83d\udd8b|\ud83d\udd8a|\ud83d\udd8c|\ud83d\udd8d|\ud83d\udcdd|\ud83d\udcbc|\ud83d\udcc1|\ud83d\udcc2|\ud83d\uddc2|\ud83d\udcc5|\ud83d\udcc6|\ud83d\uddd2|\ud83d\uddd3|\ud83d\udcc7|\ud83d\udcc8|\ud83d\udcc9|\ud83d\udcca|\ud83d\udccb|\ud83d\udccc|\ud83d\udccd|\ud83d\udcce|\ud83d\udd87|\ud83d\udccf|\ud83d\udcd0|\ud83d\uddc3|\ud83d\uddc4|\ud83d\uddd1|\ud83d\udd12|\ud83d\udd13|\ud83d\udd0f|\ud83d\udd10|\ud83d\udd11|\ud83d\udddd|\ud83d\udd28|\ud83e\ude93|\ud83d\udee0|\ud83d\udde1|\ud83d\udca3|\ud83e\ude83|\ud83c\udff9|\ud83d\udee1|\ud83e\ude9a|\ud83d\udd27|\ud83e\ude9b|\ud83d\udd29|\ud83d\udddc|\ud83e\uddaf|\ud83d\udd17|\ud83e\ude9d|\ud83e\uddf0|\ud83e\uddf2|\ud83e\ude9c|\ud83e\uddea|\ud83e\uddeb|\ud83e\uddec|\ud83d\udd2c|\ud83d\udd2d|\ud83d\udce1|\ud83d\udc89|\ud83e\ude78|\ud83d\udc8a|\ud83e\ude79|\ud83e\ude7c|\ud83e\ude7a|\ud83e\ude7b|\ud83d\udeaa|\ud83d\uded7|\ud83e\ude9e|\ud83e\ude9f|\ud83d\udecf|\ud83d\udecb|\ud83e\ude91|\ud83d\udebd|\ud83e\udea0|\ud83d\udebf|\ud83d\udec1|\ud83e\udea4|\ud83e\ude92|\ud83e\uddf4|\ud83e\uddf7|\ud83e\uddf9|\ud83e\uddfa|\ud83e\uddfb|\ud83e\udea3|\ud83e\uddfc|\ud83e\udee7|\ud83e\udea5|\ud83e\uddfd|\ud83e\uddef|\ud83d\uded2|\ud83d\udeac|\ud83e\udea6|\ud83e\uddff|\ud83e\udeac|\ud83d\uddff|\ud83e\udea7|\ud83e\udeaa|\ud83c\udfe7|\ud83d\udeae|\ud83d\udeb0|\ud83d\udeb9|\ud83d\udeba|\ud83d\udebb|\ud83d\udebc|\ud83d\udebe|\ud83d\udec2|\ud83d\udec3|\ud83d\udec4|\ud83d\udec5|\ud83d\udeb8|\ud83d\udeab|\ud83d\udeb3|\ud83d\udead|\ud83d\udeaf|\ud83d\udeb1|\ud83d\udeb7|\ud83d\udcf5|\ud83d\udd1e|\ud83d\udd03|\ud83d\udd04|\ud83d\udd19|\ud83d\udd1a|\ud83d\udd1b|\ud83d\udd1c|\ud83d\udd1d|\ud83d\uded0|\ud83d\udd49|\ud83d\udd4e|\ud83d\udd2f|\ud83e\udeaf|\ud83d\udd00|\ud83d\udd01|\ud83d\udd02|\ud83d\udd3c|\ud83d\udd3d|\ud83c\udfa6|\ud83d\udd05|\ud83d\udd06|\ud83d\udcf6|\ud83d\udedc|\ud83d\udcf3|\ud83d\udcf4|\ud83d\udff0|\ud83d\udcb1|\ud83d\udcb2|\ud83d\udd31|\ud83d\udcdb|\ud83d\udd30|\ud83d\udd1f|\ud83d\udd20|\ud83d\udd21|\ud83d\udd22|\ud83d\udd23|\ud83d\udd24|\ud83c\udd70|\ud83c\udd8e|\ud83c\udd71|\ud83c\udd91|\ud83c\udd92|\ud83c\udd93|\ud83c\udd94|\ud83c\udd95|\ud83c\udd96|\ud83c\udd7e|\ud83c\udd97|\ud83c\udd7f|\ud83c\udd98|\ud83c\udd99|\ud83c\udd9a|\ud83c\ude01|\ud83c\ude02|\ud83c\ude37|\ud83c\ude36|\ud83c\ude2f|\ud83c\ude50|\ud83c\ude39|\ud83c\ude1a|\ud83c\ude32|\ud83c\ude51|\ud83c\ude38|\ud83c\ude34|\ud83c\ude33|\ud83c\ude3a|\ud83c\ude35|\ud83d\udd34|\ud83d\udfe0|\ud83d\udfe1|\ud83d\udfe2|\ud83d\udd35|\ud83d\udfe3|\ud83d\udfe4|\ud83d\udfe5|\ud83d\udfe7|\ud83d\udfe6|\ud83d\udfea|\ud83d\udfeb|\ud83d\udd36|\ud83d\udd37|\ud83d\udd38|\ud83d\udd39|\ud83d\udd3a|\ud83d\udd3b|\ud83d\udca0|\ud83d\udd18|\ud83d\udd33|\ud83d\udd32|\ud83c\udfc1|\ud83d\udea9|\ud83c\udf8c|\ud83c\udff4|\ud83c\udff3|\ud83c\udffb|\ud83c\udffc|\ud83c\udffd|\ud83c\udffe|\ud83c\udfff|\u263a|\u2639|\u2620|\u2763|\u2764|\u270b|\u270c|\u261d|\u270a|\u270d|\u26f7|\u26f9|\u2618|\u2615|\u26f0|\u26ea|\u26e9|\u26f2|\u26fa|\u2668|\u26fd|\u2693|\u26f5|\u26f4|\u2708|\u231b|\u23f3|\u231a|\u23f0|\u23f1|\u23f2|\u2600|\u2b50|\u2601|\u26c5|\u26c8|\u2602|\u2614|\u26f1|\u26a1|\u2744|\u2603|\u26c4|\u2604|\u2728|\u26bd|\u26be|\u26f3|\u26f8|\u2660|\u2665|\u2666|\u2663|\u265f|\u26d1|\u260e|\u2328|\u2709|\u270f|\u2712|\u2702|\u26cf|\u2692|\u2694|\u2699|\u2696|\u26d3|\u2697|\u26b0|\u26b1|\u267f|\u26a0|\u26d4|\u2622|\u2623|\u2b06|\u2197|\u27a1|\u2198|\u2b07|\u2199|\u2b05|\u2196|\u2195|\u2194|\u21a9|\u21aa|\u2934|\u2935|\u269b|\u2721|\u2638|\u262f|\u271d|\u2626|\u262a|\u262e|\u2648|\u2649|\u264a|\u264b|\u264c|\u264d|\u264e|\u264f|\u2650|\u2651|\u2652|\u2653|\u26ce|\u25b6|\u23e9|\u23ed|\u23ef|\u25c0|\u23ea|\u23ee|\u23eb|\u23ec|\u23f8|\u23f9|\u23fa|\u23cf|\u2640|\u2642|\u26a7|\u2716|\u2795|\u2796|\u2797|\u267e|\u203c|\u2049|\u2753|\u2754|\u2755|\u2757|\u3030|\u2695|\u267b|\u269c|\u2b55|\u2705|\u2611|\u2714|\u274c|\u274e|\u27b0|\u27bf|\u303d|\u2733|\u2734|\u2747|\u00a9|\u00ae|\u2122|\u2139|\u24c2|\u3297|\u3299|\u26ab|\u26aa|\u25fc|\u25fb|\u25fe|\u25fd|\u25aa|\u25ab)/g;
};

// controllers/metricmodulecontroller.js
function CountSwearWords(text) {
  let totalOccurrences = 0;
  Constants.SwearWordsCollection.forEach((arr) => {
    arr.forEach((term) => {
      const regex = new RegExp(term, "gi");
      const matches = text.match(regex);
      if (matches) {
        totalOccurrences += matches.length;
      }
    });
  });
  return totalOccurrences;
}
function GenerateChatComposition(messageObjectArray) {
  let chatters = [];
  let authorIndex = 0;
  for (const element of messageObjectArray) {
    let chatterInArray = false;
    for (const x of chatters) {
      if (x.Name === element.Author) {
        chatterInArray = true;
        x.MessageCount += 1;
        x.WordCount += element.MessageBody.split(" ").length;
        x.EmojiCount += ((element.MessageBody || "").match(EmojiRegex.Pattern) || []).length;
        x.SwearCount += CountSwearWords(element.MessageBody);
      }
    }
    if (!chatterInArray) {
      authorIndex++;
      let chatter = new Chatter(authorIndex, element.Author, 1, 0, 0, 0, "0 mins", 0, 0, 0);
      chatters.push(chatter);
    }
  }
  let totalMessages = 0;
  for (const m of chatters) {
    totalMessages += m.MessageCount;
  }
  for (const y of chatters) {
    y.MessagePercent = Math.round(y.MessageCount / totalMessages * 100);
    y.MinutesSpentMessaging = CalculateMinutesSpentMessaging(y.WordCount);
    y.AverageMessageLength = (y.WordCount / y.MessageCount).toFixed(2);
  }
  CapMessagePercentage(chatters);
  GenerateTimeSpentMessagingStrings(chatters);
  return new ChatComposition(chatters);
}
function CapMessagePercentage(chatters) {
  let percentDifference;
  let totalMessages;
  let authorNumber;
  for (const y of chatters) {
    if (y.MessagePercent > 64) {
      percentDifference = y.MessagePercent - 64;
      y.MessagePercent = 64;
      totalMessages = Math.round(y.MessageCount / 0.64);
      authorNumber = y.AuthorNumber;
    }
  }
  if (!percentDifference > 0) {
    return;
  }
  const percentageSplit = Math.round(percentDifference / (chatters.length - 1));
  let newPercentageTotal = 0;
  for (const y of chatters) {
    if (y.AuthorNumber != authorNumber) {
      y.MessagePercent += percentageSplit;
      y.MessageCount = Math.round(totalMessages * (y.MessagePercent / 100));
      newPercentageTotal += y.MessagePercent;
    } else {
      newPercentageTotal += y.MessagePercent;
    }
  }
  if (newPercentageTotal != 100) {
    const percentageDifference = 100 - newPercentageTotal;
    for (const y of chatters) {
      if (y.AuthorNumber != authorNumber) {
        y.MessagePercent += percentageDifference;
        break;
      }
    }
  }
}
function CalculateMinutesSpentMessaging(wordCount) {
  return wordCount / 37;
}
function GenerateTimeSpentMessagingStrings(chatters) {
  const hasDays = chatters.find((c) => c.MinutesSpentMessaging > 1440);
  if (hasDays) {
    for (const c of chatters) {
      let daysSpentMessaging = Math.round(c.MinutesSpentMessaging / 1440 * 10) / 10;
      c.TimeSpentMessagingString = `${daysSpentMessaging} days`;
    }
  } else {
    for (const c of chatters) {
      let hoursSpentMessaging = Math.round(c.MinutesSpentMessaging / 60 * 10) / 10;
      c.TimeSpentMessagingString = `${hoursSpentMessaging} hrs`;
    }
  }
}
function GenerateFirstEncounter(chatObjArrUntrimmed) {
  let chatObjArr = RemoveSystemMessages(chatObjArrUntrimmed);
  let firstMessage = chatObjArr[0];
  let firstMessageDate = firstMessage["Date"];
  let firstMessageTime = firstMessage["Time"];
  let firstMessageAuthor = firstMessage["Author"];
  let firstMessageBody = firstMessage["MessageBody"];
  let replierIndex = chatObjArr.indexOf(chatObjArr.find((x) => x.Author != firstMessageAuthor));
  let replyMessage = chatObjArr[replierIndex];
  let replyDate = replyMessage["Date"];
  let replyTime = replyMessage["Time"];
  let replyAuthor = replyMessage["Author"];
  let replyMessageBody = replyMessage["MessageBody"];
  let arrFromSecondAuth = chatObjArr.slice(replierIndex, 50);
  let thirdAuthorIndex = arrFromSecondAuth.indexOf(arrFromSecondAuth.find((x) => x.Author != replyAuthor));
  firstMessageBody = GetMessageComposite(chatObjArr, replierIndex, firstMessageBody).replace("omitted", "post");
  replyMessageBody = GetMessageComposite(arrFromSecondAuth, thirdAuthorIndex, replyMessageBody).replace("omitted", "post");
  return new FirstEncounter(firstMessageDate, firstMessageTime, firstMessageAuthor, firstMessageBody, replyDate, replyTime, replyAuthor, replyMessageBody);
}
function RemoveSystemMessages(chatObjArr) {
  var skipThisMessage;
  var indexToSkipTo = 0;
  for (var x = 0; x < chatObjArr.length; x++) {
    skipThisMessage = false;
    const currentLine = chatObjArr[x].MessageBody;
    for (let encryptionWord of Constants.EncryptionAndSubjectMessages) {
      if (currentLine.includes(encryptionWord)) {
        skipThisMessage = true;
        indexToSkipTo = x + 1;
        break;
      }
    }
    if (!skipThisMessage) {
      for (let timeIndicator of Constants.LanguageTimeIndicatorsToRemove) {
        if (currentLine.includes(timeIndicator)) {
          skipThisMessage = true;
          indexToSkipTo = x + 1;
          break;
        }
      }
    }
    if (!skipThisMessage) {
      return chatObjArr.slice(indexToSkipTo);
    }
  }
}
function GetLaughCount(chatString) {
  const stringsToCount = Constants.LaughArray;
  let totalCount = 0;
  stringsToCount.forEach((str) => {
    const regex = new RegExp(str, "g");
    const matches = chatString.match(regex);
    if (matches) {
      totalCount += matches.length;
    }
  });
  return totalCount;
}
function GetPersonalWordCount(chatString, personalWord) {
  if (personalWord.length === 0) {
    return 0;
  }
  let regex = new RegExp(`\\b${personalWord}\\b`, "gi");
  let matches = chatString.match(regex);
  return matches ? matches.length : 0;
}
function GetTopEmojis(chatObjArr) {
  let chatStringWithoutAuthors = "";
  for (var x = 0; x < chatObjArr.length; x++) {
    chatStringWithoutAuthors += chatObjArr[x].MessageBody + " ";
  }
  const emojis = chatStringWithoutAuthors.match(EmojiRegex.Pattern);
  if (!emojis) {
    return [];
  }
  const emojiCounts = emojis.reduce((acc, emoji) => {
    acc[emoji] = (acc[emoji] || 0) + 1;
    return acc;
  }, {});
  const result = Object.keys(emojiCounts).map((emoji) => {
    return { Emoji: emoji, Count: emojiCounts[emoji] };
  });
  result.sort((a, b) => b.Count - a.Count);
  return result.slice(0, 15);
}
function GenerateMessageDays(chatObjArr) {
  let dayArray = [{ Day: "Monday", Count: 0, Percent: 0 }, { Day: "Tuesday", Count: 0, Percent: 0 }, { Day: "Wednesday", Count: 0, Percent: 0 }, { Day: "Thursday", Count: 0, Percent: 0 }, { Day: "Friday", Count: 0, Percent: 0 }, { Day: "Saturday", Count: 0, Percent: 0 }, { Day: "Sunday", Count: 0, Percent: 0 }];
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let totalCount = 0;
  chatObjArr.forEach((x) => {
    let dateString = x.Date;
    let date = parseInt(dateString.split("/")[0]);
    let month = parseInt(dateString.split("/")[1]);
    let year = parseInt(dateString.split("/")[2]);
    let dateBuilder = /* @__PURE__ */ new Date();
    dateBuilder.setDate(date);
    dateBuilder.setMonth(month - 1);
    dateBuilder.setFullYear(year);
    let day = days[dateBuilder.getDay()];
    dayArray.forEach((y) => day === y.Day ? y.Count++ : null);
    totalCount++;
  });
  let percentTotal = 0;
  dayArray.forEach((x) => {
    if (dayArray.indexOf(x) == 6) {
      x.Percent = 100 - percentTotal;
    } else {
      x.Percent = Math.round(x.Count / totalCount * 100);
      percentTotal += x.Percent;
    }
  });
  return new MessageDays(dayArray);
}
function GenerateMessageTimes(chatObjArr) {
  let timeArray = [];
  for (let i = 0; i < 10; i++) {
    timeArray.push({ Hour: "0" + i.toString(), Count: 0 });
  }
  for (let i = 10; i < 24; i++) {
    timeArray.push({ Hour: i.toString(), Count: 0 });
  }
  chatObjArr.forEach((x) => {
    let hour = x.Time.split(":")[0];
    timeArray.forEach((y) => {
      if (hour === y.Hour) {
        y.Count++;
      }
    });
  });
  return new MessageTimes(timeArray);
}
function GenerateTopWords(wholeChatString, namesArray, personalWord) {
  const topWordsTable = [];
  const newNameSet = /* @__PURE__ */ new Set();
  const filteredArray = [];
  const counts = /* @__PURE__ */ new Map();
  namesArray.forEach((name) => {
    name.split(" ").forEach((word) => newNameSet.add(word.toLowerCase()));
  });
  const wordsArray = wholeChatString.replace(/(’s)/g, "").replace(/('s)/g, "").split(" ");
  wordsArray.forEach((word) => {
    if (word.length < 10 && word.length > 1 && !Constants.SkipWordsSymbols.includes(word) && !Constants.SkipWordsGerman.includes(word) && !Constants.SkipWordsEnglish.includes(word) && !Constants.SkipWordsFrench.includes(word) && !Constants.SkipWordsDutch.includes(word) && !Constants.SkipWordsSpanish.includes(word) && !Constants.SkipWordsSwedish.includes(word) && !Constants.SkipWordsDanish.includes(word) && !Constants.SkipWordsItalian.includes(word) && !Constants.SkipWordsRussian.includes(word) && !word.match(Constants.RegExPatterns.Punctuation) && !word.match(Constants.RegExPatterns.Numbers) && !word.match(EmojiRegex.Pattern) && !newNameSet.has(word)) {
      filteredArray.push(word);
    }
  });
  filteredArray.forEach((word) => {
    counts.set(word, (counts.get(word) || 0) + 1);
  });
  counts.forEach((count, word) => {
    if (word.trim().toLowerCase() != personalWord.trim().toLowerCase() && !Constants.LaughArray.includes(word.toLowerCase())) {
      topWordsTable.push({ Word: word, Count: count });
    }
  });
  topWordsTable.sort((a, b) => b.Count - a.Count);
  topWordsTable.length = Math.min(topWordsTable.length, 15);
  return new TopWords(topWordsTable);
}
function GetMessageComposite(chatObjArr, replierIndex, message) {
  const returnRegEx = new RegExp(Constants.RegExPatterns.ReturnCarriage, "g");
  message = message.trim().replace(returnRegEx, "... ");
  if (replierIndex > 1) {
    const messageBodies = chatObjArr.slice(1, replierIndex).map((currentMessage) => currentMessage["MessageBody"].trim());
    if (messageBodies.length > 0) {
      messageBodies.forEach((x) => {
        x = x.replace(returnRegEx, "").trim();
      });
      const joinedMessageBodies = messageBodies.join("... ");
      const puncRegEx = new RegExp(Constants.RegExPatterns.Punctuation, "g");
      if (message.match(puncRegEx)) {
        message += " " + joinedMessageBodies;
      } else {
        message += "... " + joinedMessageBodies;
      }
    }
  }
  if (message[message.length - 2] == ".") {
    message = message.substring(0, message.length - 2);
  }
  return message;
}

// models/productbuilder.js
var ProductBuilder = class {
  constructor(chatComposition, fromDate, toDate, messageTimes, messageDays, firstEncounter, topWords, daysDifference, personalWord, chatTitle, personalWordCount, topEmojis, laughCount) {
    this.ChatComposition = chatComposition, this.FromDate = fromDate, this.ToDate = toDate, this.MessageTimes = messageTimes, this.MessageDays = messageDays, this.FirstEncounter = firstEncounter, this.TopWords = topWords, this.DaysDifference = daysDifference, this.PersonalWord = personalWord, this.ChatTitle = chatTitle, this.PersonalWordCount = personalWordCount, this.TopEmojis = topEmojis, this.LaughCount = laughCount;
  }
};

// controllers/productbuildercontroller.js
async function PopulateProductBuilder(chatMaster, personalWord) {
  const {
    ArrayOfMessageObjs,
    WholeChatString,
    ChatTitle
  } = chatMaster;
  const chatComposition = GenerateChatComposition(ArrayOfMessageObjs);
  const timeArray = GenerateMessageTimes(ArrayOfMessageObjs);
  const dayArray = GenerateMessageDays(ArrayOfMessageObjs);
  const firstEncounter = GenerateFirstEncounter(ArrayOfMessageObjs);
  const personalWordCount = GetPersonalWordCount(WholeChatString, personalWord);
  const topEmojis = GetTopEmojis(ArrayOfMessageObjs);
  let laughCount = GetLaughCount(WholeChatString);
  const fromDateStr = firstEncounter.FirstMessageDate;
  const toDateStr = ArrayOfMessageObjs[ArrayOfMessageObjs.length - 1].Date;
  const authors = chatComposition.Chatters.map((x) => x.Name);
  const tWtable = GenerateTopWords(WholeChatString, authors, personalWord);
  tWtable.TopWordsTable.forEach((x) => {
    if (x.Word.toLowerCase() === personalWord.toLowerCase()) {
      x.Count = personalWordCount;
    }
  });
  tWtable.TopWordsTable.forEach((x) => {
    if (Constants.LaughArray.includes(x.Word.toLowerCase())) {
      laughCount = Math.round(x.Count * 3.5);
    }
  });
  tWtable.TopWordsTable.sort((a, b) => b.Count - a.Count);
  const [fromDay, fromMonth, fromYear] = fromDateStr.split("/");
  const fromDate = new Date(fromYear, fromMonth - 1, fromDay);
  const [toDay, toMonth, toYear] = toDateStr.split("/");
  const toDate = new Date(toYear, toMonth - 1, toDay);
  const daysDifference = Math.round((toDate - fromDate) / 1e3 / 60 / 60 / 24);
  return new ProductBuilder(
    chatComposition,
    fromDateStr,
    toDateStr,
    timeArray,
    dayArray,
    firstEncounter,
    tWtable,
    daysDifference,
    personalWord,
    ChatTitle,
    personalWordCount,
    topEmojis,
    laughCount
  );
}