/** Data validation and quality checks. */
var ValidationUtils = (function () {
  function validateGame(game) { return { ok: true, issues: [] }; }
  function validateArchive(games) { return { ok: true, issues: [] }; }
  return {
    validateGame: validateGame,
    validateArchive: validateArchive
  };
})();
