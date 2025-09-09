/** Game-level parsing, normalization, and metric derivation. */
var DataProcessing = (function () {
  function normalizeGame(rawGame) { return rawGame || {}; }
  function deriveMetrics(game) { return {}; }

  function extractRequestedFields(rawGame, pgnText) {
    var parsed = UtilitiesEx.parsePgnKeepingGameAtBottom(pgnText || "");
    var headers = parsed.headers || {};
    var gameBody = parsed.game || "";

    var white = (rawGame && rawGame.white) || {};
    var black = (rawGame && rawGame.black) || {};
    var accuracies = (rawGame && rawGame.accuracies) || {};

    return {
      "url_json": rawGame && rawGame.url !== undefined ? rawGame.url : "",
      "rated_json": rawGame && rawGame.rated !== undefined ? rawGame.rated : "",
      "time_class_json": rawGame && rawGame.time_class !== undefined ? rawGame.time_class : "",
      "rules_json": rawGame && rawGame.rules !== undefined ? rawGame.rules : "",
      "time_control_json": rawGame && rawGame.time_control !== undefined ? rawGame.time_control : "",
      "end_time_json": rawGame && rawGame.end_time !== undefined ? rawGame.end_time : "",
      "tcn_json": rawGame && rawGame.tcn !== undefined ? rawGame.tcn : "",
      "uuid_json": rawGame && rawGame.uuid !== undefined ? rawGame.uuid : "",
      "initial_setup_json": rawGame && rawGame.initial_setup !== undefined ? rawGame.initial_setup : "",
      "fen_json": rawGame && rawGame.fen !== undefined ? rawGame.fen : "",
      "white.username_json": white.username !== undefined ? white.username : "",
      "white.rating_json": white.rating !== undefined ? white.rating : "",
      "white.result_json": white.result !== undefined ? white.result : "",
      "white.uuid_json": white.uuid !== undefined ? white.uuid : "",
      "white.@id_json": white["@id"] !== undefined ? white["@id"] : "",
      "black.username_json": black.username !== undefined ? black.username : "",
      "black.rating_json": black.rating !== undefined ? black.rating : "",
      "black.result_json": black.result !== undefined ? black.result : "",
      "black.uuid_json": black.uuid !== undefined ? black.uuid : "",
      "black.@id_json": black["@id"] !== undefined ? black["@id"] : "",
      "accuracies.white_json": accuracies.white !== undefined ? accuracies.white : "",
      "accuracies.black_json": accuracies.black !== undefined ? accuracies.black : "",
      "pgn_json": rawGame && rawGame.pgn !== undefined ? rawGame.pgn : "",
      "Event_pgn": headers.Event || "",
      "Site_pgn": headers.Site || "",
      "Date_pgn": headers.Date || "",
      "Round_pgn": headers.Round || "",
      "White_pgn": headers.White || "",
      "Black_pgn": headers.Black || "",
      "Result_pgn": headers.Result || "",
      "WhiteElo_pgn": headers.WhiteElo || "",
      "BlackElo_pgn": headers.BlackElo || "",
      "TimeControl_pgn": headers.TimeControl || "",
      "ECO_pgn": headers.ECO || "",
      "Opening_pgn": headers.Opening || "",
      "Termination_pgn": headers.Termination || "",
      "CurrentPosition_pgn": headers.CurrentPosition || "",
      "UTCDate_pgn": headers.UTCDate || "",
      "UTCTime_pgn": headers.UTCTime || "",
      "StartTime_pgn": headers.StartTime || "",
      "EndTime_pgn": headers.EndTime || "",
      "FEN_pgn": headers.FEN || "",
      "SetUp_pgn": headers.SetUp || "",
      "Variant_pgn": headers.Variant || "",
      "Game_pgn": gameBody || ""
    };
  }

  function processArchive(rawGames) {
    var rows = [];
    for (var i = 0; i < rawGames.length; i++) {
      var g = rawGames[i];
      var pgnText = g.pgn || "";
      var record = extractRequestedFields(g, pgnText);
      rows.push(record);
    }
    return rows;
  }
  return {
    normalizeGame: normalizeGame,
    deriveMetrics: deriveMetrics,
    processArchive: processArchive,
    extractRequestedFields: extractRequestedFields
  };
})();
