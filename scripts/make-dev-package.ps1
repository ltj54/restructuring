# ============================================================================
# make-dev-package.ps1
# Creates a ZIP with exactly the files needed for analysis and debugging.
# Includes frontend/backend source, config, and docs.
# Excludes build artifacts, dependency folders, IDE metadata, and logs.
# ============================================================================

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")
Set-Location $repoRoot

$timestamp = Get-Date -Format "yyyyMMdd-HHmm"
$zipName = "restructuring-dev-$timestamp.zip"
# Keep the ZIP beside the script so it is easy to find.
$zipPath = Join-Path $scriptDir $zipName

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host " Creating development package (ZIP)" -ForegroundColor Cyan
Write-Host " Root: $repoRoot" -ForegroundColor Cyan
Write-Host " Output: $zipPath" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ---------------------------------------------------------------------
# 1. Remove old ZIP if it exists
# ---------------------------------------------------------------------
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

# ---------------------------------------------------------------------
# 2. Directories that must always be excluded
# ---------------------------------------------------------------------
$excludeDirs = @(
    "node_modules",
    "dist",
    "build",
    "target",
    "coverage",
    "logs",
    ".git",
    ".github",
    ".idea",
    ".vscode",
    ".gradle",
    "out",
    "tmp"
)

# ---------------------------------------------------------------------
# 3. Exact include patterns (relative to repo root, using / separators)
# ---------------------------------------------------------------------
$includePatterns = @(
    "frontend/src/*",
    "frontend/public/*",
    "frontend/package.json",
    "frontend/package-lock.json",
    "frontend/pnpm-lock.yaml",
    "frontend/vite.config.*",
    "frontend/*.env*",

    "backend/src/*",
    "backend/pom.xml",
    "backend/*.env*",
    "backend/Dockerfile*",
    "backend/*.properties",

    "docker-compose*",
    "compose*",

    "*.md",
    "*.txt",
    "*.yml",
    "*.yaml",
    "LICENSE"
)

Write-Host "Collecting files..." -ForegroundColor Yellow

function Get-NormalizedRelativePath([string] $fullPath) {
    $relative = $fullPath.Substring($repoRoot.ProviderPath.Length).TrimStart('\', '/')
    return ($relative -replace '[\\/]', '/')
}

# ---------------------------------------------------------------------
# 4. Filter all files: drop excluded dirs, keep only matching patterns
# ---------------------------------------------------------------------
$allFiles = Get-ChildItem -Path $repoRoot -Recurse -File | Where-Object {
    $relative = Get-NormalizedRelativePath $_.FullName
    $parts = $relative -split '/'

    # Skip if any path segment is in the excluded list
    if ($excludeDirs | Where-Object { $parts -contains $_ }) {
        return $false
    }

    foreach ($pattern in $includePatterns) {
        if ($relative -like $pattern) { return $true }
    }

    return $false
}

# ---------------------------------------------------------------------
# 5. Safety check
# ---------------------------------------------------------------------
if (-not $allFiles -or $allFiles.Count -eq 0) {
    Write-Host "No files matched the include list. Nothing to zip." -ForegroundColor Red
    exit 1
}

# ---------------------------------------------------------------------
# 6. Create ZIP
# ---------------------------------------------------------------------
Compress-Archive -Path $allFiles.FullName -DestinationPath $zipPath -CompressionLevel Optimal

Write-Host ""
Write-Host "ZIP created:" -ForegroundColor Green
Write-Host "  $zipPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "Drag the ZIP into ChatGPT or share as needed." -ForegroundColor Yellow
Write-Host ""
