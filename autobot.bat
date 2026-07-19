@echo off
set KENKU_PATH=C:\Users\Rohan\AppData\Local\kenku-fm\kenku-fm.exe
set DEBUG_PORT=9222

echo Starting Kenku FM with remote debugging...
start "" "%KENKU_PATH%" --remote-debugging-port=%DEBUG_PORT%

echo Starting HarambeBot...
cd "C:\Users\Rohan\Documents\Coding Projects\HarambeBot"
node index.js
