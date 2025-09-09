/** Reusable utilities: logging, rate limiting, formatting. */
var UtilitiesEx = (function () {
  function sleepMs(ms) {
    Utilities.sleep(ms);
  }
  function logInfo(msg, data) {
    if (data !== undefined) {
      console.log("INFO:", msg, JSON.stringify(data));
    } else {
      console.log("INFO:", msg);
    }
  }
  function logError(msg, err) {
    console.error("ERROR:", msg, err && err.stack ? err.stack : err);
  }
  function chunk(array, size) {
    var result = [];
    for (var i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  }
  function parsePgnKeepingGameAtBottom(pgnText) {
    if (!pgnText) return { headers: {}, game: "" };
    var lines = pgnText.split(/\r?\n/);
    var headers = {};
    var i = 0;
    while (i < lines.length) {
      var line = lines[i].trim();
      if (line.startsWith("[")) {
        var match = line.match(/^\[(\w+)\s+"(.*)"\]$/);
        if (match) {
          headers[match[1]] = match[2];
          i++;
          continue;
        }
      }
      break;
    }
    var gameText = lines.slice(i).join("\n").trim();
    return { headers: headers, game: gameText };
  }
  return { sleepMs: sleepMs, logInfo: logInfo, logError: logError, chunk: chunk, parsePgnKeepingGameAtBottom: parsePgnKeepingGameAtBottom };
})();
