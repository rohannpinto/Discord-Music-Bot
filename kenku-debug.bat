@echo off
REM Launches Kenku FM with remote debugging enabled so the bot's experimental
REM "/play <url>" command can drive a Kenku browser tab. Regular library
REM playback (/play <track name>, /pause, /skip, ...) does NOT need this --
REM it only needs "Remote" enabled inside Kenku FM's settings.
set PORT=9222

start "" "C:\Users\Rohan\AppData\Local\kenku-fm\kenku-fm.exe" --remote-debugging-port=%PORT%
