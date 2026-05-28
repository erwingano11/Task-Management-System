# Database Setup Script for Windows

$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$dbFile = "backend\database.sql"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Work Management System - Database Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check if MySQL exists
if (-Not (Test-Path $mysqlPath)) {
    Write-Host "ERROR: MySQL not found at $mysqlPath" -ForegroundColor Red
    Write-Host "Please ensure MySQL is installed and the path is correct." -ForegroundColor Yellow
    exit 1
}

Write-Host "`nSetting up database..." -ForegroundColor Green

# Create database and import schema
& $mysqlPath -u root < $dbFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nDatabase setup completed successfully!" -ForegroundColor Green
    Write-Host "✓ Database 'work_management' created" -ForegroundColor Green
    Write-Host "✓ Tables 'users' and 'tasks' created" -ForegroundColor Green
} else {
    Write-Host "`nERROR: Failed to set up database" -ForegroundColor Red
    Write-Host "Please check your MySQL installation and try again." -ForegroundColor Yellow
}

Write-Host "`nYou can now start the backend server with: npm start" -ForegroundColor Cyan
