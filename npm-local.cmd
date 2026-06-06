@echo off
setlocal
set "PROJECT_ROOT=%~dp0"
set "PATH=%PROJECT_ROOT%.tools\node;%PATH%"
set "NPM_CONFIG_PREFIX=%PROJECT_ROOT%.npm-global"
call "%PROJECT_ROOT%.tools\node\npm.cmd" %*
exit /b %ERRORLEVEL%
