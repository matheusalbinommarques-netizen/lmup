param(
  [ValidateSet('install', 'status', 'remove')][string]$Mode = 'install',
  [string]$Branch,
  [string]$Remote = 'origin',
  [switch]$Enable
)
$ErrorActionPreference = 'Stop'
$syncProject = Split-Path -Parent $PSScriptRoot
$syncStore = Join-Path $syncProject '.local-app'
$syncHash = [System.Security.Cryptography.SHA256]::Create()
$syncDigest = [BitConverter]::ToString($syncHash.ComputeHash([Text.Encoding]::UTF8.GetBytes($syncProject))).Replace('-', '').Substring(0, 10)
$syncTaskName = 'LMUP GitHub Sync ' + $syncDigest
$syncTask = Get-ScheduledTask -TaskName $syncTaskName -ErrorAction SilentlyContinue
if ($Mode -eq 'status') {
  if ($syncTask) { $syncTask | Select-Object TaskName, State; Get-ScheduledTaskInfo -TaskName $syncTaskName }
  if (Test-Path -LiteralPath (Join-Path $syncStore 'sync-status.json')) { Get-Content -LiteralPath (Join-Path $syncStore 'sync-status.json') }
  exit
}
$syncLauncher = Join-Path $PSScriptRoot 'start-local-sync.ps1'
if ($syncTask -and $syncTask.Actions.Arguments -notlike ('*' + $syncLauncher + '*')) { throw 'Há uma tarefa diferente com esse nome; ela foi preservada.' }
if ($Mode -eq 'remove') {
  if ($syncTask) { Stop-ScheduledTask -TaskName $syncTaskName; Unregister-ScheduledTask -TaskName $syncTaskName -Confirm:$false }
  Write-Output 'Sincronização automática removida. A versão publicada e seus dados foram preservados.'
  exit
}
if (!$Branch) { throw 'Informe a branch que deve alimentar o app.' }
if ($Branch -ne 'release/lmup-local') { throw 'A fonte oficial deve ser release/lmup-local.' }
Push-Location $syncProject
try {
  & git check-ref-format --branch $Branch | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'Branch inválida.' }
  $syncRemoteUrl = & git remote get-url $Remote
  if ($LASTEXITCODE -ne 0 -or $syncRemoteUrl -notmatch '^https://github.com/[^/]+/[^/]+(\.git)?$') { throw 'Selecione um remoto HTTPS do GitHub sem credenciais na URL.' }
  $syncNode = (Get-Command node.exe).Source
  $syncNpmCli = Join-Path (Split-Path -Parent (Get-Command npm.cmd).Source) 'node_modules/npm/bin/npm-cli.js'
  if (!(Test-Path -LiteralPath $syncNpmCli)) { throw 'Não foi possível localizar o npm instalado.' }
  New-Item -ItemType Directory -Path $syncStore -Force | Out-Null
  $syncCheckout = Join-Path $syncStore 'publication'
  if (!(Test-Path -LiteralPath $syncCheckout)) {
    $env:GIT_TERMINAL_PROMPT = '0'
    & git -c core.hooksPath= clone --origin origin --branch $Branch --single-branch --depth 1 $syncRemoteUrl $syncCheckout
    if ($LASTEXITCODE -ne 0) { throw 'A cópia de publicação não foi criada. Nenhum arquivo local foi descartado.' }
  }
  $syncConfigJson = @{ enabled = [bool]$Enable; remote = 'origin'; branch = $Branch; url = $syncRemoteUrl; checkout = $syncCheckout; node = $syncNode; npmCli = $syncNpmCli } | ConvertTo-Json
  [System.IO.File]::WriteAllText((Join-Path $syncStore 'sync-config.json'), $syncConfigJson, (New-Object System.Text.UTF8Encoding $false))
  [System.IO.File]::WriteAllText((Join-Path $syncStore 'config.json'), '{"enabled":false}', (New-Object System.Text.UTF8Encoding $false))
  $syncAgent = Join-Path $syncStore 'agent/scripts'
  New-Item -ItemType Directory -Path $syncAgent -Force | Out-Null
  foreach ($syncScript in @('sync-local.mjs', 'local-sync-core.mjs', 'local-security-policy.mjs', 'local-process-lock.mjs', 'publish-local.mjs', 'local-release-store.mjs', 'verify-package.mjs', 'serve-static.mjs', 'static-server.mjs')) {
    Copy-Item -LiteralPath (Join-Path $PSScriptRoot $syncScript) -Destination (Join-Path $syncAgent $syncScript)
  }
  $syncUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
  $syncAction = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument ('-NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "' + $syncLauncher + '"') -WorkingDirectory $syncProject
  $syncTriggers = @(
    (New-ScheduledTaskTrigger -AtLogOn -User $syncUser),
    (New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 5))
  )
  $syncSettings = New-ScheduledTaskSettingsSet -Hidden -StartWhenAvailable -MultipleInstances IgnoreNew -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Hours 1)
  $syncPrincipal = New-ScheduledTaskPrincipal -UserId $syncUser -LogonType Interactive -RunLevel Limited
  Register-ScheduledTask -TaskName $syncTaskName -Action $syncAction -Trigger $syncTriggers -Settings $syncSettings -Principal $syncPrincipal -Description ('LMUP: sincronizar ' + $Branch + ' e publicar somente após verificações. Origem: ' + $syncProject) -Force | Out-Null
  if ($Enable) {
    Enable-ScheduledTask -TaskName $syncTaskName | Out-Null
    Start-ScheduledTask -TaskName $syncTaskName
    Write-Output ('Sincronização ativa: ' + $Branch + ', a cada 5 minutos e ao entrar no Windows. Tarefa: ' + $syncTaskName)
  } else {
    Disable-ScheduledTask -TaskName $syncTaskName | Out-Null
    Write-Output ('Sincronização preparada e desativada, aguardando aprovação de segurança. Tarefa: ' + $syncTaskName)
  }
} finally { Pop-Location }
