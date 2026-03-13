# PowerShell script to download a new favicon for the EARS application

# Backup the existing favicon
if (Test-Path "favicon.ico") {
    Copy-Item -Path "favicon.ico" -Destination "favicon_backup.ico" -Force
    Write-Host "Backed up existing favicon to favicon_backup.ico" -ForegroundColor Green
}

# Ask user for favicon type
Write-Host "EARS Favicon Downloader" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Choose a favicon type:" -ForegroundColor Yellow
Write-Host "1. Blue background with 'E' letter"
Write-Host "2. Document icon (for application review system)"
Write-Host "3. User icon (for employee system)"
Write-Host "4. Custom URL (provide your own favicon URL)"
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        $faviconUrl = "https://www.favicon.cc/favicon/255/255/favicon.ico"
        $description = "Blue background with 'E' letter"
    }
    "2" {
        $faviconUrl = "https://www.favicon.cc/favicon/378/718/favicon.ico"
        $description = "Document icon"
    }
    "3" {
        $faviconUrl = "https://www.favicon.cc/favicon/378/719/favicon.ico"
        $description = "User icon"
    }
    "4" {
        $faviconUrl = Read-Host "Enter the URL of the favicon you want to download"
        $description = "Custom favicon"
    }
    default {
        Write-Host "Invalid choice. Using default favicon." -ForegroundColor Red
        $faviconUrl = "https://www.favicon.cc/favicon/255/255/favicon.ico"
        $description = "Default favicon (blue background with 'E' letter)"
    }
}

# Download the new favicon
try {
    Write-Host "Downloading $description favicon from $faviconUrl..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $faviconUrl -OutFile "favicon.ico" -ErrorAction Stop
    Write-Host "Successfully downloaded new favicon!" -ForegroundColor Green
    Write-Host "The favicon has been saved as favicon.ico in the public directory." -ForegroundColor Green
    Write-Host "Restart your development server to see the changes." -ForegroundColor Yellow
}
catch {
    Write-Host "Error downloading favicon: $_" -ForegroundColor Red
    Write-Host "If you have a backup, you can restore it by renaming favicon_backup.ico to favicon.ico" -ForegroundColor Yellow
}

# Instructions for manual favicon creation
Write-Host ""
Write-Host "For more favicon options, visit these websites:" -ForegroundColor Cyan
Write-Host "- https://favicon.io/ (Text, Image, or Emoji to Favicon)" -ForegroundColor Cyan
Write-Host "- https://realfavicongenerator.net/ (Advanced Favicon Generator)" -ForegroundColor Cyan
Write-Host "- https://www.favicon.cc/ (Draw Your Own Favicon)" -ForegroundColor Cyan
Write-Host ""
Write-Host "After creating your favicon, download it and replace the favicon.ico file in this directory." -ForegroundColor Cyan 