# Stop npm cleanly when IntelliJ stops the PowerShell host
$process = Start-Process "npm" -ArgumentList "run", "dev" -NoNewWindow -PassThru

Write-Host "Vite dev server running (PID: $($process.Id))"

# Wait and listen for IntelliJ termination
try {
    Wait-Process -Id $process.Id
}
catch {
    Write-Host "Stopping Vite dev server..."
    Stop-Process -Id $process.Id -Force
}
