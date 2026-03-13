@echo off
echo EARS Favicon Downloader
echo ======================
echo.
echo This batch file will help you download a new favicon for your EARS application.
echo.

REM Backup the existing favicon
if exist favicon.ico (
    copy favicon.ico favicon_backup.ico
    echo Backed up existing favicon to favicon_backup.ico
)

echo Choose a favicon type:
echo 1. Blue background with 'E' letter
echo 2. Document icon (for application review system)
echo 3. User icon (for employee system)
echo.

set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    set faviconUrl=https://www.favicon.cc/favicon/255/255/favicon.ico
    set description=Blue background with 'E' letter
) else if "%choice%"=="2" (
    set faviconUrl=https://www.favicon.cc/favicon/378/718/favicon.ico
    set description=Document icon
) else if "%choice%"=="3" (
    set faviconUrl=https://www.favicon.cc/favicon/378/719/favicon.ico
    set description=User icon
) else (
    echo Invalid choice. Using default favicon.
    set faviconUrl=https://www.favicon.cc/favicon/255/255/favicon.ico
    set description=Default favicon (blue background with 'E' letter)
)

echo.
echo Downloading %description% favicon...
echo.

REM Use PowerShell to download the favicon
powershell -Command "Invoke-WebRequest -Uri '%faviconUrl%' -OutFile 'favicon.ico'"

if exist favicon.ico (
    echo Successfully downloaded new favicon!
    echo The favicon has been saved as favicon.ico in the public directory.
    echo Restart your development server to see the changes.
) else (
    echo Error downloading favicon.
    echo If you have a backup, you can restore it by renaming favicon_backup.ico to favicon.ico
)

echo.
echo For more favicon options, visit these websites:
echo - https://favicon.io/ (Text, Image, or Emoji to Favicon)
echo - https://realfavicongenerator.net/ (Advanced Favicon Generator)
echo - https://www.favicon.cc/ (Draw Your Own Favicon)
echo.
echo After creating your favicon, download it and replace the favicon.ico file in this directory.
echo.

pause 