    # ============================================================================
    # make-dev-package.ps1 – interactive version
    # Lets the user pick: frontend, backend, or both.
    # Creates a clean ZIP without staging folders, preserving structure.
    # ============================================================================

    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
    $repoRoot = Resolve-Path (Join-Path $scriptDir "..")
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

    switch ($choice) {
        "1" { $includeFrontend = $true;  $includeBackend = $false }
        "2" { $includeFrontend = $false; $includeBackend = $true  }
        "3" { $includeFrontend = $true;  $includeBackend = $true  }
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

    # Remove old ZIP if exists
    if (Test-Path $zipPath) {
        Remove-Item $zipPath -Force
    }

    # ---------------------------------------------------------------------------
    # 2. Exclusions
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
    # 3. Include patterns
    # ---------------------------------------------------------------------------
    $includePatterns = @()

    if ($includeFrontend) {
        $includePatterns += @(
            "frontend/src/*",
            "frontend/public/*",
            "frontend/package.json",
            "frontend/package-lock.json",
            "frontend/pnpm-lock.yaml",
            "frontend/vite.config.*",
            "frontend/*.env*"
        )
    }

    if ($includeBackend) {
        $includePatterns += @(
            "backend/src/*",
            "backend/pom.xml",
            "backend/*.env*",
            "backend/Dockerfile*",
            "backend/*.properties"
        )
    }

    # Common files for all options
    $includePatterns += @(
        "docker-compose*",
        "compose*",
        "*.md",
        "*.txt",
        "*.yml",
        "*.yaml",
        "LICENSE"
    )

    Write-Host ""
    Write-Host "Collecting matching files..." -ForegroundColor Yellow

    function Get-Relative([string] $fullPath) {
        return $fullPath.Substring($repoRoot.ProviderPath.Length).TrimStart('\', '/')
    }

    # ---------------------------------------------------------------------------
    # 4. Build file list
    # ---------------------------------------------------------------------------
    $fileList = Get-ChildItem -Path $repoRoot -Recurse -File | Where-Object {
        $rel = Get-Relative $_.FullName
        $parts = $rel -split '/'

        # Ignore excluded directories
        if ($excludeDirs | Where-Object { $parts -contains $_ }) { return $false }

        # Match include patterns
        foreach ($pattern in $includePatterns) {
            if ($rel -like $pattern) { return $true }
        }
        return $false
    }

    if ($fileList.Count -eq 0) {
        Write-Host "ERROR: No files matched patterns." -ForegroundColor Red
        exit 1
    }

    Write-Host "Found $($fileList.Count) files." -ForegroundColor Green

    # ---------------------------------------------------------------------------
    # 5. Create ZIP directly from file list
    # ---------------------------------------------------------------------------
    Compress-Archive -Path $fileList.FullName -DestinationPath $zipPath -CompressionLevel Optimal

    Write-Host ""
    Write-Host "ZIP created successfully:" -ForegroundColor Green
    Write-Host "  $zipPath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Upload the ZIP to ChatGPT." -ForegroundColor Yellow
    Write-Host ""
