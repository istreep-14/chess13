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

  // Preserve existing Fetch and last_fetched values keyed by sheet_name
  var existingMap = {};
  try {
    var lastRow = archivesSheet.getLastRow();
    var lastCol = archivesSheet.getLastColumn();
    if (lastRow >= 2 && lastCol >= 1) {
      var grid = archivesSheet.getRange(1, 1, lastRow, lastCol).getValues();
      var hdr = grid[0] || [];
      var idxSheet = hdr.indexOf("sheet_name");
      var idxFetch = hdr.indexOf("Fetch");
      var idxLast = hdr.indexOf("last_fetched");
      if (idxSheet >= 0) {
        for (var r = 1; r < grid.length; r++) {
          var key = String(grid[r][idxSheet] || "").trim();
          if (!key) continue;
          existingMap[key] = {
            fetch: idxFetch >= 0 ? Boolean(grid[r][idxFetch]) : false,
            last: idxLast >= 0 ? grid[r][idxLast] : ""
          };
        }
      }
    }
  } catch (e) {
    UtilitiesEx.logError("Failed reading existing Archives sheet", e);
  }

  SheetManager.clearSheet(archivesSheet);
  var header = ["Fetch","year","month","archive_url","sheet_name","exists","last_fetched"];
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
    var fetchVal = false;
    var lastFetchedVal = "";
    if (match) {
      year = match[1];
      month = match[2];
      sheetName = year.slice(-2) + "_" + month;
      exists = existingNames.indexOf(sheetName) !== -1;
      if (existingMap[sheetName]) {
        fetchVal = Boolean(existingMap[sheetName].fetch);
        lastFetchedVal = existingMap[sheetName].last || "";
      }
    }
    rows.push([fetchVal, year, month, u, sheetName, exists ? "TRUE" : "FALSE", lastFetchedVal]);
  }

  rows.sort(function (a, b) {
    var ay = parseInt(a[1], 10) || 0;
    var by = parseInt(b[1], 10) || 0;
    if (ay !== by) return by - ay;
    var am = parseInt(a[2], 10) || 0;
    var bm = parseInt(b[2], 10) || 0;
    return bm - am;
  });

  if (rows.length) {
    SheetManager.writeRows(archivesSheet, 2, 1, rows);
    // Apply checkbox validation to Fetch column
    try {
      var dv = SpreadsheetApp.newDataValidation().requireCheckbox().setAllowInvalid(true).build();
      archivesSheet.getRange(2, 1, rows.length, 1).setDataValidation(dv);
    } catch (e2) {
      UtilitiesEx.logError("Failed to set checkbox validation", e2);
    }
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

function runFetchSelectedMonths() {
  var username = ConfigManager.getUsername();
  if (!username) {
    UtilitiesEx.logError("Config username is empty", null);
    return;
  }
  var spreadsheetId = ConfigManager.getSpreadsheetId();
  var ss = SpreadsheetApp.openById(spreadsheetId);
  var archivesSheet = ss.getSheetByName("Archives");
  if (!archivesSheet) {
    UtilitiesEx.logInfo("Archives sheet not found. Run refreshArchivesSheet() first.", null);
    return;
  }
  var lastRow = archivesSheet.getLastRow();
  var lastCol = archivesSheet.getLastColumn();
  if (lastRow < 2 || lastCol < 2) return;
  var grid = archivesSheet.getRange(1, 1, lastRow, lastCol).getValues();
  var header = grid[0];
  var idxFetch = header.indexOf("Fetch");
  var idxYear = header.indexOf("year");
  var idxMonth = header.indexOf("month");
  var idxLastFetched = header.indexOf("last_fetched");
  if (idxFetch < 0 || idxYear < 0 || idxMonth < 0) {
    UtilitiesEx.logError("Archives sheet is missing required columns", null);
    return;
  }

  var headerOrder = [
    "url_json","rated_json","time_class_json","rules_json","time_control_json","end_time_json","tcn_json","uuid_json","initial_setup_json","fen_json",
    "white.username_json","white.rating_json","white.result_json","white.uuid_json","white.@id_json",
    "black.username_json","black.rating_json","black.result_json","black.uuid_json","black.@id_json",
    "accuracies.white_json","accuracies.black_json",
    "pgn_json",
    "Event_pgn","Site_pgn","Date_pgn","Round_pgn","White_pgn","Black_pgn","Result_pgn","WhiteElo_pgn","BlackElo_pgn","TimeControl_pgn","ECO_pgn","Opening_pgn","Termination_pgn","CurrentPosition_pgn","UTCDate_pgn","UTCTime_pgn","StartTime_pgn","EndTime_pgn","FEN_pgn","SetUp_pgn","Variant_pgn","Game_pgn"
  ];

  var nowTs = new Date();
  var rowsToUpdate = [];

  for (var r = 1; r < grid.length; r++) {
    var fetchFlag = Boolean(grid[r][idxFetch]);
    if (!fetchFlag) continue;
    var yearStr = String(grid[r][idxYear] || "");
    var monthStr = String(grid[r][idxMonth] || "");
    var year = parseInt(yearStr, 10);
    var month = parseInt(monthStr, 10);
    if (!year || !month) continue;

    try {
      var games = ChessComAPI.fetchMonthlyArchive(username, year, month);
      var processed = DataProcessing.processArchive(games);
      var sheet = SheetManager.ensureMonthlySheet(spreadsheetId, year, month);
      SheetManager.clearSheet(sheet);
      SheetManager.writeRows(sheet, 1, 1, [headerOrder]);
      var rows = processed.map(function (rec) { return headerOrder.map(function (k) { return rec[k] !== undefined ? rec[k] : ""; }); });
      if (rows.length) {
        SheetManager.writeRows(sheet, 2, 1, rows);
      }
      if (idxLastFetched >= 0) {
        rowsToUpdate.push({ row: r + 1, value: nowTs });
      }
      var rate = ConfigManager.getRateLimitMs();
      if (rate && rate > 0) UtilitiesEx.sleepMs(rate);
    } catch (e) {
      UtilitiesEx.logError("Failed fetching month " + year + "-" + month, e);
    }
  }

  if (rowsToUpdate.length && idxLastFetched >= 0) {
    for (var i = 0; i < rowsToUpdate.length; i++) {
      archivesSheet.getRange(rowsToUpdate[i].row, idxLastFetched + 1).setValue(rowsToUpdate[i].value);
    }
  }
}
