# ============================================================================
# make-dev-package.ps1 – FINAL, ROBUST, NON-FLAT VERSION
# Interactive: frontend, backend, or both.
# Creates a clean ZIP with preserved folder structure.
# ============================================================================

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot = (Join-Path $scriptDir "..")
$repoRoot = [System.IO.Path]::GetFullPath($repoRoot)

Set-Location $repoRoot

# ---------------------------------------------------------------------------
# 1. Ask user
# ---------------------------------------------------------------------------
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host " What would you like to include in the ZIP?" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1 = Frontend only"
Write-Host "2 = Backend only"
Write-Host "3 = Both frontend + backend"
Write-Host ""

$choice = Read-Host "Enter 1, 2 or 3"

$includeFrontend = $false
$includeBackend = $false

switch ($choice)
{
    "1" {
        $includeFrontend = $true
    }
    "2" {
        $includeBackend = $true
    }
    "3" {
        $includeFrontend = $true; $includeBackend = $true
    }
    default {
        Write-Host "Invalid choice." -ForegroundColor Red
        exit 1
    }
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmm"
$zipName = "restructuring-dev-$timestamp.zip"
$zipPath = Join-Path $scriptDir $zipName

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host " Creating ZIP: $zipName" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

if (Test-Path $zipPath)
{
    Remove-Item $zipPath -Force
}

# ---------------------------------------------------------------------------
# 2. Excluded directory names
# ---------------------------------------------------------------------------
$excludeDirs = @(
    "node_modules",
    "dist",
    "target",
    "build",
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

# ---------------------------------------------------------------------------
# 3. Include patterns (relative paths)
# ---------------------------------------------------------------------------
$includePatterns = @()

if ($includeFrontend)
{
    $includePatterns += @(
        "frontend/src/*",
        "frontend/src/**",
        "frontend/public/*",
        "frontend/public/**",
        "frontend/package.json",
        "frontend/package-lock.json",
        "frontend/pnpm-lock.yaml",
        "frontend/vite.config.*",
        "frontend/tsconfig*.json",
        "frontend/*.env*"
    )
}

if ($includeBackend)
{
    $includePatterns += @(
        "backend/src/*",
        "backend/src/**",
        "backend/pom.xml",
        "backend/*.env*",
        "backend/Dockerfile*",
        "backend/*.properties",
        "backend/src/main/resources/**"
    )
}

$includePatterns += @(
    "docker-compose*",
    "compose*",
    "*.md",
    "*.txt",
    "*.yml",
    "*.yaml",
    "LICENSE"
)

# ---------------------------------------------------------------------------
# 4. Helper functions (NO Resolve-Path)
# ---------------------------------------------------------------------------
function To-RelativePath([string]$fullPath)
{
    $full = [System.IO.Path]::GetFullPath($fullPath)
    $rel = $full.Substring($repoRoot.Length).TrimStart('\', '/')
    return ($rel -replace '\\', '/')
}

function Is-Excluded([string]$relPath)
{
    $parts = $relPath -split '/'
    foreach ($d in $excludeDirs)
    {
        if ($parts -contains $d)
        {
            return $true
        }
    }
    return $false
}

function Matches-Include([string]$relPath)
{
    foreach ($pattern in $includePatterns)
    {
        if ($relPath -like $pattern)
        {
            return $true
        }
    }
    return $false
}

# ---------------------------------------------------------------------------
# 5. Collect files
# ---------------------------------------------------------------------------
Write-Host ""
Write-Host "Collecting matching files..." -ForegroundColor Yellow

$allFiles = Get-ChildItem -Path $repoRoot -Recurse -File -Force

$fileList = New-Object System.Collections.Generic.List[string]

foreach ($file in $allFiles)
{
    $rel = To-RelativePath $file.FullName
    if ( [string]::IsNullOrWhiteSpace($rel))
    {
        continue
    }

    if (Is-Excluded $rel)
    {
        continue
    }
    if (Matches-Include $rel)
    {
        $fileList.Add($file.FullName) | Out-Null
    }
}

if ($fileList.Count -eq 0)
{
    Write-Host "ERROR: No files matched patterns." -ForegroundColor Red
    exit 1
}

Write-Host "Found $( $fileList.Count ) files." -ForegroundColor Green

# ---------------------------------------------------------------------------
# 6. Create ZIP (NON-FLAT, correct paths)
# ---------------------------------------------------------------------------
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::Open(
        $zipPath,
        [System.IO.Compression.ZipArchiveMode]::Create
)

try
{
    foreach ($fullPath in $fileList)
    {
        $entryName = To-RelativePath $fullPath
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
                $zip,
                $fullPath,
                $entryName,
                [System.IO.Compression.CompressionLevel]::Optimal
        ) | Out-Null
    }
}
finally
{
    $zip.Dispose()
}

# ---------------------------------------------------------------------------
# 7. Done
# ---------------------------------------------------------------------------
Write-Host ""
Write-Host "ZIP created successfully (structure preserved):" -ForegroundColor Green
Write-Host "  $zipPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "This ZIP is NOT flat and safe to upload to ChatGPT." -ForegroundColor Yellow
Write-Host ""
