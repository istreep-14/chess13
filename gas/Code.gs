/**
 * Entry points and orchestration for the Chess Analysis project.
 */
function runIncrementalUpdate() {}
function runFullCurrentMonth() {}
function runCompleteRebuild() {}

function openSetup() {}

/** Debug helpers */
function debugTest() {}

function refreshArchivesSheet() {
  var username = ConfigManager.getUsername();
  if (!username) {
    UtilitiesEx.logError("Config username is empty", null);
    return;
  }

  var spreadsheetId = ConfigManager.getSpreadsheetId();
  var archivesSheet = SheetManager.getOrCreateSheet(spreadsheetId, "Archives");
  SheetManager.clearSheet(archivesSheet);
  var header = ["year","month","archive_url","sheet_name","exists"];
  SheetManager.writeRows(archivesSheet, 1, 1, [header]);

  var urls;
  try {
    urls = ChessComAPI.fetchArchivesIndex(username);
  } catch (e) {
    UtilitiesEx.logError("Failed to fetch archives index", e);
    urls = [];
  }
  if (!urls || urls.length === 0) {
    UtilitiesEx.logInfo("No archive URLs returned", null);
    return;
  }

  var existingNames = SheetManager.getAllSheetNames(spreadsheetId);
  var rows = [];
  for (var i = 0; i < urls.length; i++) {
    var u = urls[i];
    var match = u.match(/\/(\d{4})\/(\d{2})$/);
    var year = "";
    var month = "";
    var sheetName = "";
    var exists = false;
    if (match) {
      year = match[1];
      month = match[2];
      sheetName = year.slice(-2) + "_" + month;
      exists = existingNames.indexOf(sheetName) !== -1;
    }
    rows.push([year, month, u, sheetName, exists ? "TRUE" : "FALSE"]);
  }

  rows.sort(function (a, b) {
    var ay = parseInt(a[0], 10) || 0;
    var by = parseInt(b[0], 10) || 0;
    if (ay !== by) return by - ay;
    var am = parseInt(a[1], 10) || 0;
    var bm = parseInt(b[1], 10) || 0;
    return bm - am;
  });

  if (rows.length) {
    SheetManager.writeRows(archivesSheet, 2, 1, rows);
  }
}

function runFetchCurrentMonth() {
  var username = ConfigManager.getUsername();
  if (!username) {
    UtilitiesEx.logError("Config username is empty", null);
    return;
  }
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var spreadsheetId = ConfigManager.getSpreadsheetId();

  var games = ChessComAPI.fetchMonthlyArchive(username, year, month);
  var processed = DataProcessing.processArchive(games);

  var headerOrder = [
    "url_json","rated_json","time_class_json","rules_json","time_control_json","end_time_json","tcn_json","uuid_json","initial_setup_json","fen_json",
    "white.username_json","white.rating_json","white.result_json","white.uuid_json","white.@id_json",
    "black.username_json","black.rating_json","black.result_json","black.uuid_json","black.@id_json",
    "accuracies.white_json","accuracies.black_json",
    "pgn_json",
    "Event_pgn","Site_pgn","Date_pgn","Round_pgn","White_pgn","Black_pgn","Result_pgn","WhiteElo_pgn","BlackElo_pgn","TimeControl_pgn","ECO_pgn","Opening_pgn","Termination_pgn","CurrentPosition_pgn","UTCDate_pgn","UTCTime_pgn","StartTime_pgn","EndTime_pgn","FEN_pgn","SetUp_pgn","Variant_pgn","Game_pgn"
  ];

  var sheet = SheetManager.ensureMonthlySheet(spreadsheetId, year, month);
  SheetManager.clearSheet(sheet);
  var headerRow = [headerOrder];
  SheetManager.writeRows(sheet, 1, 1, headerRow);
  var rows = processed.map(function (r) { return headerOrder.map(function (k) { return r[k] !== undefined ? r[k] : ""; }); });
  if (rows.length) {
    SheetManager.writeRows(sheet, 2, 1, rows);
  }
}

function combineAllGames() {
  var spreadsheetId = ConfigManager.getSpreadsheetId();
  var ss = SpreadsheetApp.openById(spreadsheetId);
  var allSheet = SheetManager.getOrCreateSheet(spreadsheetId, "All_Games");
  SheetManager.clearSheet(allSheet);

  var names = SheetManager.getAllSheetNames(spreadsheetId);
  var monthRegex = /^\d{2}_\d{2}$/;
  var monthSheets = names.filter(function (n) { return monthRegex.test(n); });

  var header;
  var writeRow = 1;
  for (var i = 0; i < monthSheets.length; i++) {
    var sh = ss.getSheetByName(monthSheets[i]);
    if (!sh) continue;
    var lastRow = sh.getLastRow();
    var lastCol = sh.getLastColumn();
    if (lastRow < 2 || lastCol === 0) continue;
    var rng = sh.getRange(1, 1, lastRow, lastCol).getValues();
    if (!header) {
      header = rng[0];
      SheetManager.writeRows(allSheet, writeRow, 1, [header]);
      writeRow++;
    }
    if (i === 0) {
      if (lastRow > 1) {
        SheetManager.writeRows(allSheet, writeRow, 1, rng.slice(1));
        writeRow += (lastRow - 1);
      }
    } else {
      if (lastRow > 1) {
        SheetManager.writeRows(allSheet, writeRow, 1, rng.slice(1));
        writeRow += (lastRow - 1);
      }
    }
  }

  var sortColName = ConfigManager.getAllGamesSortColumn();
  var dir = ConfigManager.getAllGamesSortDirection();
  if (header && writeRow > 2) {
    var sortColIndex = header.indexOf(sortColName) + 1;
    if (sortColIndex > 0) {
      var range = allSheet.getRange(2, 1, allSheet.getLastRow() - 1, allSheet.getLastColumn());
      range.sort([{ column: sortColIndex, ascending: dir !== "desc" }]);
    }
  }
}
