/** Configuration handling from Config_Control sheet. */
var ConfigManager = (function () {
  function getUsername() { return ""; }
  function getSpreadsheetId() { return ""; }
  function getRateLimitMs() { return 200; }
  function isHistoricalStatic() { return true; }
  function getProcessingParams() { return {}; }
  return {
    getUsername: getUsername,
    getSpreadsheetId: getSpreadsheetId,
    getRateLimitMs: getRateLimitMs,
    isHistoricalStatic: isHistoricalStatic,
    getProcessingParams: getProcessingParams
  };
})();
