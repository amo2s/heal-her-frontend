[CmdletBinding()]
param (
    [Parameter(Position = 0)]
    [string]$EnvFilePath = "backend/services/auth/.env"
)

# 1. Check if Koyeb CLI is installed
if (-not (Get-Command koyeb -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Koyeb CLI ('koyeb') is not installed or not found in PATH." -ForegroundColor Red
    Write-Host "Please install it from https://www.koyeb.com/docs/build-and-deploy/cli/installation before running this script." -ForegroundColor Yellow
    exit 1
}

# 2. Check if .env file exists
if (-not (Test-Path $EnvFilePath)) {
    Write-Host "[ERROR] Specified .env file not found at: $EnvFilePath" -ForegroundColor Red
    exit 1
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Synchronizing Secrets to Koyeb Vault from: $EnvFilePath" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$lines = Get-Content -Path $EnvFilePath

foreach ($rawLine in $lines) {
    $line = $rawLine.Trim()

    # Ignore empty lines and comments
    if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith("#")) {
        continue
    }

    # Split at first '=' delimiter
    $equalIndex = $line.IndexOf("=")
    if ($equalIndex -le 0) {
        continue
    }

    $key = $line.Substring(0, $equalIndex).Trim()
    $value = $line.Substring($equalIndex + 1).Trim()

    # Strip surrounding single or double quotes
    if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
        if ($value.Length -ge 2) {
            $value = $value.Substring(1, $value.Length - 2)
        }
    }

    Write-Host "Processing secret: $key ... " -NoNewline -ForegroundColor Gray

    # Attempt koyeb secret create; if fails, fallback to koyeb secret update
    $createOutput = koyeb secret create $key --value "$value" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[CREATED]" -ForegroundColor Green
    } else {
        $updateOutput = koyeb secret update $key --value "$value" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[UPDATED]" -ForegroundColor Yellow
        } else {
            Write-Host "[FAILED]" -ForegroundColor Red
            Write-Host "  Error: $updateOutput" -ForegroundColor DarkRed
        }
    }
}

Write-Host "`nSecret synchronization process complete." -ForegroundColor Cyan

