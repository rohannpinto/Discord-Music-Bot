@echo off
REM Launches Kenku FM with remote debugging enabled so the bot's experimental
REM "/play <url>" command can drive a Kenku browser tab. Regular library
REM playback (/play <track name>, /pause, /skip, ...) does NOT need this --
REM it only needs "Remote" enabled inside Kenku FM's settings.
set PORT=9222

for %%D in ("%LocalAppData%\kenku-fm" "%LocalAppData%\kenku_fm" "%LocalAppData%\Programs\kenku-fm" "%ProgramFiles%\Kenku FM") do (
  if exist "%%~D" (
    for /f "delims=" %%F in ('dir /b /s "%%~D\Kenku FM.exe" 2^>nul') do (
      start "" "%%F" --remote-debugging-port=%PORT%
      exit /b 0
    )
  )
)

echo Could not find "Kenku FM.exe" in the usual install locations.
echo Edit kenku-debug.bat and replace the search with the full path, e.g.:
echo   start "" "C:\path\to\Kenku FM.exe" --remote-debugging-port=%PORT%
pause
