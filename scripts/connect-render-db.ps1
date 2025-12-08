# ------------------------------------------------------------
# connect-render-db.ps1
# Åpner psql direkte mot PostgreSQL-databasen på Render
# ------------------------------------------------------------

Write-Host "== Connecting to Render PostgreSQL database..." -ForegroundColor Cyan

# 🔧 Sett inn din connection string fra Render → External Connection
# (Bytt ut USERNAME, PASSWORD, HOST og DATABASE)
# OBS! Ikke fjern ?sslmode=require på slutten, ellers får du connection error.

$connectionString = "postgresql://restructuringdb_hs4d_user:TG3J0fuImowby7EUPAwvlJl4g2HcjnSp@dpg-d410mlv5r7bs7389sp90-a.oregon-postgres.render.com/restructuring_db"

# 🔍 Sjekk at psql finnes
$psql = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psql) {
    Write-Host "❌ psql er ikke installert eller ikke i PATH." -ForegroundColor Red
    Write-Host "Installer via:"
    Write-Host "  winget install PostgreSQL.PostgreSQL"
    exit 1
}

# 🚀 Koble til
Write-Host "Starter psql..."
psql $connectionString
