# ======================================================================
# Kjør med denne: pwsh ./scripts/setup-everything.ps1 -SkipTemplates -ResetDb -NoBuild
# ONE-SHOT DEVELOPMENT SETUP SCRIPT
# Creates everything needed for dev:
#  - application.yml + dev/prod profiles
#  - schema.sql + data-test.sql (idempotent)
#  - docker-compose.dev.yml
#  - scripts/start-* and stop-docker
#  - IntelliJ .idea/runConfigurations/*.xml
#  - Missing folders
#  - Optional: reset local dev database (Postgres data dir)
#
# Use:
#   pwsh ./scripts/setup-everything.ps1               # prompts before overwriting existing files
#   pwsh ./scripts/setup-everything.ps1 -ResetDb      # wipe dev DB data dir (prompts)
# ======================================================================

param(
    [switch]$ResetDb,        # Wipe local dev database data directory (will prompt)
    [switch]$SkipTemplates,  # Skip writing/overwriting template files (no prompts)
    [switch]$NoBuild         # Do not rebuild docker images (faster if already built)
)

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "==  ONE-SHOT SETUP FOR RESTRUCTURING        ==" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Find project root (scripts folder lives under root)
$scriptDir   = $PSScriptRoot
$projectRoot = Split-Path $scriptDir -Parent

Write-Host "-> Project root: $projectRoot"

$composeFile  = Join-Path $projectRoot "infra\docker-compose.dev.yml"
$dbContainer  = "restructuring-dev-db"
$dbName       = "restructuring_dev"
$dbUser       = "restructuring"

function Ensure-Dir {
    param([string]$Path)
    if (!(Test-Path $Path)) {
        Write-Host "   Creating directory: $Path"
        New-Item -ItemType Directory -Path $Path | Out-Null
    }
}

$OverwriteAll = $false
$SkipAll = $false
function Should-Overwrite {
    param([string]$Path, [string]$Label)

    if (-not (Test-Path $Path)) { return $true }
    if ($OverwriteAll) { return $true }
    if ($SkipAll) { return $false }

    $answer = Read-Host ("   {0} exists. Overwrite? (y=yes, n=no, a=all, s=skip all)" -f $Label)
    switch ($answer.ToLowerInvariant()) {
        "y" { return $true }
        "a" { $global:OverwriteAll = $true; return $true }
        "s" { $global:SkipAll = $true; return $false }
        default { return $false }
    }
}

function Write-Template {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Content,
        [Parameter(Mandatory = $true)][string]$Label
    )

    if (Test-Path $Path) {
        $shouldWrite = Should-Overwrite -Path $Path -Label $Label
        if (-not $shouldWrite) {
            Write-Host "   Skipping $Label (kept existing)" -ForegroundColor Yellow
            return
        }
    }

    $Content | Set-Content -Path $Path -Encoding UTF8
    Write-Host "   Wrote $Label" -ForegroundColor Green
}

function Reset-DevDatabase {
    Write-Host ""
    Write-Host "------------------------------------------------" -ForegroundColor Yellow
    Write-Host "-> RESETTING DEV DATABASE (Postgres data dir)   " -ForegroundColor Yellow
    Write-Host "------------------------------------------------" -ForegroundColor Yellow

    $dataDir = Join-Path $projectRoot "infra\docker\data"

    # Stop container if it exists
    try {
        $containerId = docker ps -a --filter "name=restructuring-dev-db" --format "{{.ID}}" 2>$null
        if ($containerId) {
            Write-Host "   Stopping container restructuring-dev-db..." -ForegroundColor Yellow
            docker stop restructuring-dev-db | Out-Null
        } else {
            Write-Host "   No existing restructuring-dev-db container found." -ForegroundColor DarkGray
        }
    } catch {
        Write-Host "   Docker not available or error when checking containers. Skipping stop." -ForegroundColor Red
    }

    # Take down stack and remove volumes (handles Postgres 18 layout)
    try {
        docker compose -f $composeFile down --volumes --remove-orphans | Out-Null
    } catch {
        Write-Host "   Failed to run docker compose down -v: $($_.Exception.Message)" -ForegroundColor Red
    }

    # Remove data dir (legacy bind mount)
    if (Test-Path $dataDir) {
        Write-Host "   Removing Postgres data directory: $dataDir" -ForegroundColor Yellow
        try {
            Remove-Item -Recurse -Force $dataDir
        } catch {
            Write-Host ("   Failed to remove {0}: {1}" -f $dataDir, $_) -ForegroundColor Red
        }
    }

    # Remove named volumes that may exist from previous runs
    $volumesToClean = @("infra_db_data", "restructuring_db_data")
    foreach ($vol in $volumesToClean) {
        try {
            docker volume rm $vol 2>$null | Out-Null
        } catch {
            # ignore
        }
    }

    Ensure-Dir $dataDir
    Write-Host "   Dev database will be recreated clean when Docker starts (start-docker.ps1)." -ForegroundColor Green
}

function Init-Db-In-Container {
    Write-Host ""
    Write-Host "-> Starting docker (db) to initialize schema/data..." -ForegroundColor Cyan

    $compose = Join-Path $projectRoot "infra/docker-compose.dev.yml"
    docker compose -f $compose up -d

    Write-Host "-> Waiting for database in container..."
    for ($i=0; $i -lt 30; $i++) {
        $r = docker exec restructuring-dev-db pg_isready -U restructuring 2>$null
        if ($r -match "accepting connections") {
            Write-Host "[OK] Database is ready in container." -ForegroundColor Green
            break
        }
        Start-Sleep 1
    }

    Write-Host "-> Applying schema.sql and data-test.sql inside container..."
    Get-Content -Raw "$resources\schema.sql" | docker exec -i restructuring-dev-db psql -U restructuring -d restructuring_dev
    Get-Content -Raw "$resources\data-test.sql" | docker exec -i restructuring-dev-db psql -U restructuring -d restructuring_dev
    Write-Host "[OK] Schema and seed data applied." -ForegroundColor Green
}

# ------------------------------------------------------------
# 0. Ensure required directories
# ------------------------------------------------------------

$paths = @(
    "$projectRoot\backend\src\main\resources",
    "$projectRoot\infra",
    "$projectRoot\infra\docker",
    "$projectRoot\infra\docker\data",
    "$projectRoot\.idea",
    "$projectRoot\.idea\runConfigurations",
    "$projectRoot\scripts"
)

foreach ($p in $paths) { Ensure-Dir $p }

$resources = "$projectRoot\backend\src\main\resources"
$runConfig = "$projectRoot\.idea\runConfigurations"

# Helper: docker compose invoker
function Invoke-Compose {
    param(
        [Parameter(ValueFromRemainingArguments = $true)]
        [string[]]$Args
    )
    docker compose -f $composeFile @Args
}

function Wait-ForDatabase {
    param([int]$TimeoutSeconds = 60)

    Write-Host "-> Waiting for database health (container: $dbContainer)..."
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    while ($sw.Elapsed.TotalSeconds -lt $TimeoutSeconds) {
        $status = docker inspect --format '{{.State.Health.Status}}' $dbContainer 2>$null
        if ($status -eq "healthy") {
            Write-Host "[OK] Database is healthy." -ForegroundColor Green
            return
        }
        Start-Sleep 2
    }
    Write-Host "Database did not become healthy within $TimeoutSeconds seconds." -ForegroundColor Red
    exit 1
}

function Apply-SqlFile {
    param([string]$Path, [string]$Label)
    Write-Host "-> Applying $Label..."
    Get-Content -Raw $Path | docker exec -i $dbContainer psql -v ON_ERROR_STOP=1 -U $dbUser -d $dbName
}

# ------------------------------------------------------------
# 1. Templates (skip with -SkipTemplates)
# ------------------------------------------------------------
if ($SkipTemplates) {
    Write-Host "-> Skipping template file writes (-SkipTemplates supplied)" -ForegroundColor Yellow
} else {
# ------------------------------------------------------------
# 1. application.yml (GLOBAL)
# ------------------------------------------------------------
Write-Template -Path "$resources\application.yml" -Label "application.yml" -Content @'
spring:
  application:
    name: restructuring-backend

server:
  port: ${PORT:8080}

logging:
  level:
    org.springframework: INFO

management:
  endpoints:
    web:
      base-path: /actuator
      exposure:
        include: health,info,metrics

  endpoint:
    health:
      probes:
        enabled: true
'@

# ------------------------------------------------------------
# 2. application-dev.yml
# ------------------------------------------------------------
Write-Template -Path "$resources\application-dev.yml" -Label "application-dev.yml" -Content @'
spring:
  config:
    activate:
      on-profile: dev

  datasource:
    url: jdbc:postgresql://localhost:5432/restructuring_dev
    username: restructuring
    password: restructuring
    driver-class-name: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.PostgreSQLDialect
    open-in-view: false

  sql:
    init:
      mode: always
      schema-locations: classpath:schema.sql
      data-locations: classpath:data-test.sql
'@

# ------------------------------------------------------------
# 3. application-prod.yml
# ------------------------------------------------------------
Write-Template -Path "$resources\application-prod.yml" -Label "application-prod.yml" -Content @'
spring:
  config:
    activate:
      on-profile: prod

  datasource:
    url: ${SPRING_DATASOURCE_URL}
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}
    driver-class-name: org.postgresql.Driver
    hikari:
      connectionTimeout: 2000
      maximumPoolSize: 2
      minimumIdle: 1

  jpa:
    hibernate:
      ddl-auto: none
      open-in-view: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
'@

# ------------------------------------------------------------
# 4. schema.sql
# ------------------------------------------------------------
Write-Template -Path "$resources\schema.sql" -Label "schema.sql" -Content @'
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    ssn VARCHAR(11),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_plans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    phase VARCHAR(50),
    persona VARCHAR(255),
    needs TEXT,
    diary TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS insurance_request (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    xml_content TEXT NOT NULL,
    status VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
'@

# ------------------------------------------------------------
# 5. data-test.sql (idempotent seed)
# ------------------------------------------------------------
Write-Template -Path "$resources\data-test.sql" -Label "data-test.sql" -Content @'
WITH upsert_user AS (
  INSERT INTO users (email, password, first_name, last_name, ssn)
  VALUES (
    'test@example.com',
    '$2a$10$abcdefghijklmnopqrstuv',
    'Testbruker',
    'Testesen',
    '12345678901'
  )
  ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
  RETURNING id
), resolved_user AS (
  SELECT id FROM upsert_user
  UNION ALL
  SELECT id FROM users WHERE email = 'test@example.com'
)
INSERT INTO user_plans (user_id, phase, persona, needs, diary)
SELECT id, 'INTRO', 'Testpersona', 'need1,need2', 'Standard testplan diary'
FROM resolved_user ru
WHERE NOT EXISTS (
  SELECT 1 FROM user_plans WHERE user_id = ru.id
);

INSERT INTO insurance_request (user_id, xml_content, status)
SELECT id, '<InsuranceRequest><UserId>1</UserId><Test>OK</Test></InsuranceRequest>', 'SENT'
FROM resolved_user ru
WHERE NOT EXISTS (
  SELECT 1 FROM insurance_request WHERE user_id = ru.id
);
'@

# ------------------------------------------------------------
# 6. docker-compose.dev.yml
# ------------------------------------------------------------
Write-Template -Path "$projectRoot\infra\docker-compose.dev.yml" -Label "docker-compose.dev.yml" -Content @'
version: "3.8"

services:
  restructuring-dev-db:
    container_name: restructuring-dev-db
    image: postgres:18
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: restructuring_dev
      POSTGRES_USER: restructuring
      POSTGRES_PASSWORD: restructuring
    volumes:
      - db_data:/var/lib/postgresql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U restructuring"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  db_data:
'@

# ------------------------------------------------------------
# 7. scripts
# ------------------------------------------------------------

# start-docker.ps1
Write-Template -Path "$projectRoot\scripts\start-docker.ps1" -Label "scripts/start-docker.ps1" -Content @'
Write-Host "== Starting PostgreSQL Docker (dev)..." -ForegroundColor Cyan

$compose = Join-Path $PSScriptRoot "../infra/docker-compose.dev.yml"
docker compose -f $compose up -d

Write-Host "-> Waiting for database..."

for ($i=0; $i -lt 30; $i++) {
    $ps = docker ps --filter "name=restructuring-dev-db" --format "{{.Status}}" 2>$null
    if (-not $ps) {
        Start-Sleep 1
        continue
    }

    $r = docker exec restructuring-dev-db pg_isready -U restructuring 2>$null
    if ($r -match "accepting connections") {
        Write-Host "[OK] Database is ready!"
        exit 0
    }
    Start-Sleep 1
}

Write-Host "!! Database did not start in time."
exit 1
'@

# start-frontend.ps1
Write-Template -Path "$projectRoot\scripts\start-frontend.ps1" -Label "scripts/start-frontend.ps1" -Content @'
Write-Host "== Starting Vite frontend..." -ForegroundColor Cyan
Set-Location (Join-Path $PSScriptRoot "../frontend")
npm run dev
'@

# start-backend.ps1
Write-Template -Path "$projectRoot\scripts\start-backend.ps1" -Label "scripts/start-backend.ps1" -Content @'
Write-Host "-> Checking DB readiness (via Docker)..."
for ($i=0; $i -lt 20; $i++) {
    $ps = docker ps --filter "name=restructuring-dev-db" --format "{{.Status}}" 2>$null
    if (-not $ps) {
        Write-Host "!! Database container not running. Start it with scripts/start-docker.ps1" -ForegroundColor Red
        exit 1
    }

    $r = docker exec restructuring-dev-db pg_isready -U restructuring 2>$null
    if ($r -match "accepting connections") {
        Write-Host "[OK] Database ready."
        break
    }
    Start-Sleep 1
}
Write-Host "== Starting backend..."
Set-Location (Join-Path $PSScriptRoot "../backend")
./mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
'@

# stop-docker.ps1
Write-Template -Path "$projectRoot\scripts\stop-docker.ps1" -Label "scripts/stop-docker.ps1" -Content @'
Write-Host "== Stopping database container..."
docker stop restructuring-dev-db 2>$null | Out-Null
'@

Write-Host "-> scripts/start-* and stop-docker.ps1" -ForegroundColor Green

# ------------------------------------------------------------
# 8. IntelliJ Run Configs
# ------------------------------------------------------------

# StartDocker
Write-Template -Path "$runConfig\StartDocker.run.xml" -Label "StartDocker.run.xml" -Content @'
<component name="ProjectRunConfigurationManager">
  <configuration name="StartDocker" type="PowerShellRunConfigurationType">
    <option name="scriptUrl" value="$PROJECT_DIR$/scripts/start-docker.ps1" />
    <method v="2" />
  </configuration>
</component>
'@

# FrontendDev
Write-Template -Path "$runConfig\FrontendDev.run.xml" -Label "FrontendDev.run.xml" -Content @'
<component name="ProjectRunConfigurationManager">
  <configuration name="FrontendDev" type="js.build_tools.npm" factoryName="npm">
    <package-json value="$PROJECT_DIR$/frontend/package.json" />
    <command value="run" />
    <scripts>
      <script value="dev" />
    </scripts>
    <method v="2" />
  </configuration>
</component>
'@

# Backend
Write-Template -Path "$runConfig\RestructuringApplication.run.xml" -Label "RestructuringApplication.run.xml" -Content @'
<component name="ProjectRunConfigurationManager">
  <configuration name="RestructuringApplication" type="SpringBootApplicationConfigurationType" factoryName="Spring Boot">
    <module name="restructuring-backend" />
    <option name="SPRING_PROFILES_ACTIVE" value="dev" />
    <option name="MAIN_CLASS_NAME" value="io.ltj.restructuring.RestructuringApplication" />
    <method v="2" />
  </configuration>
</component>
'@

# Compound
Write-Template -Path "$runConfig\restructuring.run.xml" -Label "restructuring.run.xml" -Content @'
<component name="ProjectRunConfigurationManager">
  <configuration default="false" name="restructuring" type="CompoundRunConfigurationType" factoryName="Compound Run Configuration">
    <option name="runConfigurations">
      <list>
        <item itemvalue="PowerShell.StartDocker" />
        <item itemvalue="Spring Boot.RestructuringApplication" />
        <item itemvalue="NPM.FrontendDev" />
      </list>
    </option>
    <method v="2" />
  </configuration>
</component>
'@

} # end SkipTemplates guard

# ------------------------------------------------------------
# 9. Reset dev database (optional)
# ------------------------------------------------------------
if ($ResetDb) {
    $answer = Read-Host "Confirm wipe of dev database data dir? Type 'yes' to proceed"
    if ([string]::IsNullOrWhiteSpace($answer)) {
        $answer = "yes"  # default to yes when non-interactive
    }
    if ($answer.ToLowerInvariant() -eq "yes") {
        Reset-DevDatabase
        Init-Db-In-Container
    } else {
        Write-Host "-> Dev DB reset cancelled by user input." -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "-> Skipping dev DB reset (run with -ResetDb to wipe data dir)" -ForegroundColor Yellow
}

# ------------------------------------------------------------
# 10. Start and seed Postgres (Docker) with schema + dummy data
# ------------------------------------------------------------

Write-Host ""
Write-Host "-> Starting Postgres (docker-compose.dev.yml)..." -ForegroundColor Cyan

$dbArgs = @("up", "-d", "restructuring-dev-db")
if (-not $NoBuild) { $dbArgs = @("up", "-d", "--build", "restructuring-dev-db") }
Invoke-Compose @dbArgs

Wait-ForDatabase

Apply-SqlFile -Path "$resources\schema.sql" -Label "schema.sql"
Apply-SqlFile -Path "$resources\data-test.sql" -Label "data-test.sql"

Write-Host "[OK] Database is up with seeded test data." -ForegroundColor Green

Write-Host ""
Write-Host "===============================================" -ForegroundColor Green
Write-Host "== ONE-SHOT SETUP DONE                     =="
Write-Host "-> Next steps:" -ForegroundColor Green
Write-Host "   1) Open IntelliJ and load the project" -ForegroundColor Green
Write-Host "   2) Run 'restructuring' run config" -ForegroundColor Green
Write-Host "   3) Rerun setup-everything.ps1 -ResetDb if you need a clean local database" -ForegroundColor Green
Write-Host "==============================================="
