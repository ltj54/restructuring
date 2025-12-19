# =====================================================================
# run-db-init.ps1
# Full database-init for Restructuring backend
# =====================================================================

# Konfigurasjon
$PSQL = "C:\Program Files\PostgreSQL\18\bin\psql.exe"  # <-- endre hvis du har annen versjon
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "postgres"
$DB_USER = "restructuring"

# Paths til SQL
$SCHEMA = "C:/Prosjekt/restructuring/backend/src/main/resources/schema.sql"
$DATA = "C:/Prosjekt/restructuring/backend/src/main/resources/data-test.sql"

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "   🚀 Kjører database-init (schema.sql + data-test.sql)" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# Trinn 1: Kjør schema.sql
Write-Host "📄 Kjører schema.sql..." -ForegroundColor Yellow
& $PSQL -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $SCHEMA

# Trinn 2: Kjør data-test.sql
Write-Host "`n📄 Kjører data-test.sql..." -ForegroundColor Yellow
& $PSQL -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $DATA

Write-Host "`n🎉 Ferdig! Tabeller og testdata er installert." -ForegroundColor Green
