/** Sheet operations: create/get, read/write, housekeeping. */
var SheetManager = (function () {
  function getOrCreateSheet(spreadsheetId, sheetName) {
    var ss = SpreadsheetApp.openById(spreadsheetId);
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    return sheet;
  }
  function writeRows(sheet, startRow, startCol, values) {
    if (!values || values.length === 0) return;
    sheet.getRange(startRow, startCol, values.length, values[0].length).setValues(values);
  }
  function clearSheet(sheet) {
    sheet.clear({ contentsOnly: true });
  }
  function ensureMonthlySheet(spreadsheetId, year, month) {
    var yy = String(year).slice(-2);
    var mm = ("0" + month).slice(-2);
    var name = yy + "_" + mm;
    return getOrCreateSheet(spreadsheetId, name);
  }
  function getSheetByName(spreadsheetId, sheetName) {
    var ss = SpreadsheetApp.openById(spreadsheetId);
    return ss.getSheetByName(sheetName);
  }
  function getAllSheetNames(spreadsheetId) {
    var ss = SpreadsheetApp.openById(spreadsheetId);
    return ss.getSheets().map(function (s) { return s.getName(); });
  }
  return {
    getOrCreateSheet: getOrCreateSheet,
    writeRows: writeRows,
    clearSheet: clearSheet,
    ensureMonthlySheet: ensureMonthlySheet,
    getSheetByName: getSheetByName,
    getAllSheetNames: getAllSheetNames
  };
})();
