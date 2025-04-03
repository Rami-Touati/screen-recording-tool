@echo off
echo Building Screen Recorder...

:: Build the application
call npm run build

:: Create desktop shortcut
echo Set oWS = WScript.CreateObject("WScript.Shell") > CreateShortcut.vbs
echo sLinkFile = oWS.ExpandEnvironmentStrings("%USERPROFILE%\Desktop\Screen Recorder.lnk") >> CreateShortcut.vbs
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> CreateShortcut.vbs
echo oLink.TargetPath = "%~dp0start-app.bat" >> CreateShortcut.vbs
echo oLink.WorkingDirectory = "%~dp0" >> CreateShortcut.vbs
echo oLink.Description = "Screen Recorder Application" >> CreateShortcut.vbs
echo oLink.IconLocation = "%~dp0build\icon.ico" >> CreateShortcut.vbs
echo oLink.Save >> CreateShortcut.vbs
cscript //nologo CreateShortcut.vbs
del CreateShortcut.vbs

echo.
echo Screen Recorder has been built and a shortcut has been created on your desktop.
echo You can now launch the application by double-clicking the shortcut.
pause 