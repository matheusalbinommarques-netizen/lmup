$ErrorActionPreference = 'Stop'
$syncProject = Split-Path -Parent $PSScriptRoot
$syncConfig = Get-Content -LiteralPath (Join-Path $syncProject '.local-app/sync-config.json') -Raw | ConvertFrom-Json
$syncEntry = Join-Path $syncProject '.local-app/agent/scripts/sync-local.mjs'
$env:LMU_INSTALLATION_PROJECT = $syncProject
# Espera so o processo do ciclo. Start-Process -Wait espera tambem os
# descendentes, e o ciclo pode deixar aberto o servidor da porta 5174: a tarefa
# ficaria presa e os disparos seguintes seriam recusados.
$syncProcess = Start-Process -FilePath $syncConfig.node -ArgumentList ('"' + $syncEntry + '"') -WorkingDirectory $syncProject -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $syncProject '.local-app/sync-launch.log') -RedirectStandardError (Join-Path $syncProject '.local-app/sync-launch-error.log')
# No Windows PowerShell 5.1, sem abrir o Handle antes do fim o ExitCode vem vazio.
$null = $syncProcess.Handle
$syncProcess.WaitForExit()
if ($null -eq $syncProcess.ExitCode) { exit 1 }
exit $syncProcess.ExitCode
