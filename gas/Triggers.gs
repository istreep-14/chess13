/** Installable triggers and scheduling. */
var Triggers = (function () {
  function installDailyIncremental() {}
  function installWeeklyFullCurrentMonth() {}
  function removeAll() {}
  return {
    installDailyIncremental: installDailyIncremental,
    installWeeklyFullCurrentMonth: installWeeklyFullCurrentMonth,
    removeAll: removeAll
  };
})();
