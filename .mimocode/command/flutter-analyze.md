---
description: "Run Flutter analyze on pet health app to verify code compiles without errors. Use after making Dart/Flutter code changes."
agent: main
---

# Flutter Analyze

Run Flutter static analysis on the pet health app to verify code compiles without errors.

## Steps

1. **Run Flutter Analyze**
   ```bash
   flutter analyze lib/ 2>&1
   ```
   Working directory: `D:\pet-collar\Code\pet_health_app`
   Timeout: 120 seconds

2. **Check Output**
   - Look for "No issues found" or count of errors/warnings
   - If specific files were modified, can analyze only those:
     ```bash
     flutter analyze lib/pages/firmware_upgrade_page.dart lib/ble/ota_manager.dart 2>&1
     ```

## Success Criteria

- No errors in output (warnings are acceptable)
- Analysis completes without timeout

## Error Handling

- If analyze fails, check for missing imports or syntax errors
- Run `flutter pub get` if dependency issues occur
- For BLE-related errors, verify `universal_ble` package version (v2.x required)

## Notes

- Project uses Flutter with Dart
- Common files to analyze: `lib/pages/`, `lib/ble/`, `lib/providers/`
- BLE-related code requires `universal_ble` v2.1.0+ for `readRssi()` support
