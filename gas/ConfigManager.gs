/** Configuration handling from Config_Control sheet. */
var ConfigManager = (function () {
  var MASTER_SPREADSHEET_NAME = "Chess Master";
  var CONFIG_SHEET_NAME = "Config_Control";

  function getOrCreateMasterSpreadsheet() {
    var files = DriveApp.getFilesByName(MASTER_SPREADSHEET_NAME);
    if (files.hasNext()) {
      var file = files.next();
      return SpreadsheetApp.openById(file.getId());
    }
    var ss = SpreadsheetApp.create(MASTER_SPREADSHEET_NAME);
    return ss;
  }

  function getConfigSheet() {
    var ss = getOrCreateMasterSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG_SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG_SHEET_NAME);
      sheet.getRange(1, 1, 1, 2).setValues([["Key", "Value"]]);
      // sensible defaults
      sheet.getRange(2, 1, 4, 2).setValues([
        ["username", ""],
        ["rate_limit_ms", "200"],
        ["all_games_sort_column", "end_time_json"],
        ["all_games_sort_direction", "desc"]
      ]);
    }
    return sheet;
  }

  function getSpreadsheetId() {
    return getOrCreateMasterSpreadsheet().getId();
  }

  function getValue(key) {
    var sheet = getConfigSheet();
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return "";
    var data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
    for (var i = 0; i < data.length; i++) {
      if (String(data[i][0]).trim() === key) {
        return String(data[i][1]).trim();
      }
    }
    return "";
  }

  function getUsername() { return getValue("username"); }
  function getRateLimitMs() {
    var v = parseInt(getValue("rate_limit_ms"), 10);
    return isNaN(v) ? 200 : v;
  }
  function isHistoricalStatic() { return true; }
  function getProcessingParams() { return {}; }
  function getAllGamesSortColumn() { return getValue("all_games_sort_column") || "end_time_json"; }
  function getAllGamesSortDirection() { return (getValue("all_games_sort_direction") || "desc").toLowerCase(); }
  return {
    getUsername: getUsername,
    getSpreadsheetId: getSpreadsheetId,
    getRateLimitMs: getRateLimitMs,
    isHistoricalStatic: isHistoricalStatic,
    getProcessingParams: getProcessingParams,
    getAllGamesSortColumn: getAllGamesSortColumn,
    getAllGamesSortDirection: getAllGamesSortDirection,
    getConfigSheet: getConfigSheet
  };
})();
