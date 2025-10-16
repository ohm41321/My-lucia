@echo off
chcp 65001 > nul
title Lucia AI Chat Server

echo ===================================================================
echo                Lucia AI Chat - Debug Mode
echo ===================================================================
echo.

REM --- Define the command for Ollama ---
set "OLLAMA_CMD=ollama"
set "OLLAMA_PATH=%LOCALAPPDATA%\Programs\Ollama\ollama.exe"

if exist "%OLLAMA_PATH%" (
    set "OLLAMA_CMD="%OLLAMA_PATH%""
) 

REM Step 1: Check if Ollama service is running (with visible output)
echo [1/4] Checking for Ollama service...
echo       (Running command: %OLLAMA_CMD% ps)
echo -------------------------------------------------------------------

REM Execute the command and show its output
%OLLAMA_CMD% ps

echo -------------------------------------------------------------------

if %errorlevel% neq 0 (
    echo.
    echo [DEBUG] The 'ollama ps' command failed with a non-zero exit code.
    echo [ERROR] This usually means the Ollama application is not running.
    echo         Please ensure you have started Ollama and can see its icon in the system tray.
    echo.
    pause
    exit /b
)

echo       Ollama service detected successfully.


REM Step 2: Install/update dependencies
echo.
echo [2/4] Installing/updating required components (npm install)...
call npm install
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] 'npm install' failed. Please ensure Node.js is installed correctly.
    echo.
    pause
    exit /b
)
echo       Components are up to date.

REM Step 3: Start the Node.js server in a new window
echo.
echo [3/4] Starting Lucia AI server in a new window...
start "Lucia Server" cmd /c "title Lucia Server && node server-ollama.js && pause"

REM Step 4: Wait and open the browser
echo.
echo [4/4] Waiting for server to initialize (5 seconds)...
timeout /t 5 /nobreak >nul

echo.
echo       Opening chat interface in your default browser...
start http://localhost:3000


echo.
echo ===================================================================
echo  Setup complete! The server is running in a separate window.
echo         You can close this window now.
echo ===================================================================
echo.
pause
