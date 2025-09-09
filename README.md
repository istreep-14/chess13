# Chess Analysis - Google Apps Script

This project scaffolds a Google Apps Script system to fetch and analyze Chess.com games, organizing data across Google Sheets for incremental updates and full rebuilds.

## Structure
- `gas/appsscript.json`: Manifest
- `gas/Code.gs`: Entry points
- `gas/ChessComAPI.gs`: API layer
- `gas/DataProcessing.gs`: Game processing
- `gas/SheetManager.gs`: Sheet operations
- `gas/ConfigManager.gs`: Configuration access
- `gas/AnalysisEngine.gs`: Advanced calculations
- `gas/ValidationUtils.gs`: Data quality checks
- `gas/Utilities.gs`: Helpers
- `gas/Triggers.gs`: Installable triggers

## Next Steps
1. Confirm configuration source (sheet names, spreadsheet location).
2. Choose API fetch format (JSON archives vs PGN parsing).
3. Decide processing cadence and trigger schedules.
4. Define minimum viable metrics and derived stats.
5. Implement incremental vs full rebuild logic.
6. Add logging and data quality reporting sheets.

## Development
Copy the files in `gas/` into a Google Apps Script project, or use `clasp` to push them.
