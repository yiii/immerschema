#!/usr/bin/env pwsh

Write-Output "Starting command sequence..."
Write-Output "=========================="

try {
    Write-Output "1. Publishing with yalc..."
    yalc publish
    if ($LASTEXITCODE -ne 0) {
        throw "yalc publish failed with exit code $LASTEXITCODE"
    }
    Write-Output "✓ yalc publish completed successfully"
    Write-Output ""

    Write-Output "2. Updating all yalc packages..."
    yalc update --all
    if ($LASTEXITCODE -ne 0) {
        throw "yalc update --all failed with exit code $LASTEXITCODE"
    }
    Write-Output "✓ yalc update --all completed successfully"
    Write-Output ""

    Write-Output "3. Running validation..."
    node validate_project.js
    if ($LASTEXITCODE -ne 0) {
        throw "node validate.js failed with exit code $LASTEXITCODE"
    }
    Write-Output "✓ node validate.js completed successfully"
    Write-Output ""

    Write-Output "=========================="
    Write-Output "All commands completed successfully!"
}
catch {
    Write-Error "Command sequence failed: $_"
    exit 1
} 