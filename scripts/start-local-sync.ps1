$ErrorActionPreference = 'Stop'
$syncProject = Split-Path -Parent $PSScriptRoot
$syncConfig = Get-Content -LiteralPath (Join-Path $syncProject '.local-app/sync-config.json') -Raw | ConvertFrom-Json
$syncEntry = Join-Path $syncProject '.local-app/agent/scripts/sync-local.mjs'
$env:LMU_INSTALLATION_PROJECT = $syncProject
$syncProcess = Start-Process -FilePath $syncConfig.node -ArgumentList ('"' + $syncEntry + '"') -WorkingDirectory $syncProject -WindowStyle Hidden -Wait -PassThru -RedirectStandardOutput (Join-Path $syncProject '.local-app/sync-launch.log') -RedirectStandardError (Join-Path $syncProject '.local-app/sync-launch-error.log')
exit $syncProcess.ExitCode
