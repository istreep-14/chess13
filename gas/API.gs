/**
 * Chess.com API interaction layer.
 */
var ChessComAPI = (function () {
  function fetchMonthlyArchive(username, year, month) {
    var paddedMonth = ("0" + month).slice(-2);
    var url = "https://api.chess.com/pub/player/" + encodeURIComponent(username) + "/games/" + year + "/" + paddedMonth;
    var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    var code = response.getResponseCode();
    if (code >= 200 && code < 300) {
      var json = JSON.parse(response.getContentText());
      return json && json.games ? json.games : [];
    }
    return [];
  }

  function fetchArchivesIndex(username) {
    if (!username) return [];
    var url = "https://api.chess.com/pub/player/" + encodeURIComponent(username) + "/games/archives";
    try {
      var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      var code = response.getResponseCode();
      if (code >= 200 && code < 300) {
        var json = JSON.parse(response.getContentText());
        var archives = (json && json.archives) || [];
        return archives;
      }
      UtilitiesEx.logError("Archives index non-2xx", code);
    } catch (e) {
      UtilitiesEx.logError("Archives index fetch failed", e);
    }
    return [];
  }

  function fetchGamePgn(pgnUrl) {
    if (!pgnUrl) return "";
    var response = UrlFetchApp.fetch(pgnUrl, { muteHttpExceptions: true });
    var code = response.getResponseCode();
    if (code >= 200 && code < 300) {
      return response.getContentText();
    }
    return "";
  }

  return { fetchMonthlyArchive: fetchMonthlyArchive, fetchGamePgn: fetchGamePgn, fetchArchivesIndex: fetchArchivesIndex };
})();
