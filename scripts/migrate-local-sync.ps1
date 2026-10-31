param(
  [ValidateSet('preflight', 'prepare', 'activate', 'rollback', 'status')][string]$Mode = 'status'
)
$ErrorActionPreference = 'Stop'
$project = Split-Path -Parent $PSScriptRoot
$store = Join-Path $project '.local-app'
$oldCheckout = Join-Path $store 'publication'
$newCheckout = Join-Path $store 'publication-main'
$configPath = Join-Path $store 'sync-config.json'
$preparedPath = Join-Path $store 'migration-main-prepared.json'
$backup = Join-Path $store 'migration-main-backup'
$agent = Join-Path $store 'agent/scripts'
$scripts = @('sync-local.mjs', 'local-sync-config.mjs', 'local-sync-core.mjs', 'local-security-policy.mjs', 'local-process-lock.mjs', 'publish-local.mjs', 'local-release-store.mjs', 'verify-package.mjs', 'serve-static.mjs', 'static-server.mjs')
$digest = [BitConverter]::ToString(([Security.Cryptography.SHA256]::Create()).ComputeHash([Text.Encoding]::UTF8.GetBytes($project))).Replace('-', '').Substring(0, 10)
$taskName = 'LMUP GitHub Sync ' + $digest

function Invoke-GitChecked([string]$directory, [string[]]$gitArgs) {
  $value = & git.exe -C $directory @gitArgs
  if ($LASTEXITCODE -ne 0) { throw ('Git falhou: ' + ($gitArgs -join ' ')) }
  return ($value | Out-String).Trim()
}
function Save-Json([string]$path, $value) {
  $temporary = $path + '.new'
  [IO.File]::WriteAllText($temporary, ($value | ConvertTo-Json -Depth 8), (New-Object Text.UTF8Encoding $false))
  if (Test-Path -LiteralPath $path) { [IO.File]::Replace($temporary, $path, $null) }
  else { Move-Item -LiteralPath $temporary -Destination $path }
}
function Check-Locks {
  foreach ($name in @('sync-daemon.lock', 'publish.lock')) {
    if (Test-Path -LiteralPath (Join-Path $store $name)) {
      throw "Sincronização em andamento ou trava pendente ($name). Nenhum estado foi trocado."
    }
  }
}
function Check-Copy([string]$directory, [string]$branch, [string]$url) {
  if (!(Test-Path -LiteralPath $directory)) { throw "Cópia isolada ausente: $directory" }
  if ((Get-Item -LiteralPath $directory -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw "Cópia isolada redirecionada: $directory" }
  if ((Invoke-GitChecked $directory @('branch', '--show-current')) -ne $branch) { throw "Branch inesperada na cópia: $directory" }
  if ((Invoke-GitChecked $directory @('remote', 'get-url', 'origin')) -ne $url) { throw "Remoto inesperado na cópia: $directory" }
  if (Invoke-GitChecked $directory @('status', '--porcelain', '--untracked-files=all')) { throw "Alterações locais na cópia: $directory" }
}
function Compare-Release([string]$first, [string]$second) {
  $files = @(Get-ChildItem -LiteralPath $first -File -Recurse)
  $copies = @(Get-ChildItem -LiteralPath $second -File -Recurse)
  if (!$files.Count -or $files.Count -ne $copies.Count) { throw 'Backup da publicação incompleto.' }
  foreach ($file in $files) {
    $relative = $file.FullName.Substring($first.Length).TrimStart('\', '/')
    $copy = Join-Path $second $relative
    if (!(Test-Path -LiteralPath $copy) -or (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash -ne (Get-FileHash -LiteralPath $copy -Algorithm SHA256).Hash) {
      throw ('Backup da publicação divergente: ' + $relative)
    }
  }
}
function Restore-Backup {
  if (!(Test-Path -LiteralPath (Join-Path $backup 'sync-config.json'))) { throw 'Backup da migração ausente.' }
  $savedConfig = Get-Content -LiteralPath (Join-Path $backup 'sync-config.json') -Raw | ConvertFrom-Json
  if ($savedConfig.branch -ne 'release/lmup-local' -or $savedConfig.checkout -ne $oldCheckout) { throw 'Backup da configuração inválido. O estado atual foi preservado.' }
  $savedActivePath = Join-Path $backup 'active.json'
  if (Test-Path -LiteralPath $savedActivePath) {
    $savedActive = Get-Content -LiteralPath $savedActivePath -Raw | ConvertFrom-Json
    if ($savedActive.id -notmatch '^[a-f0-9-]+$') { throw 'Identificador da publicação anterior inválido.' }
    $releasePath = Join-Path (Join-Path $store 'releases') $savedActive.id
    $releaseBackup = Join-Path $backup 'release'
    if (!(Test-Path -LiteralPath $releaseBackup)) { throw 'Backup dos arquivos da publicação ausente. O estado atual foi preservado.' }
    if (!(Test-Path -LiteralPath $releasePath)) { Copy-Item -LiteralPath $releaseBackup -Destination $releasePath -Recurse }
    Compare-Release $releaseBackup $releasePath
  }
  Copy-Item -LiteralPath (Join-Path $backup 'sync-config.json') -Destination $configPath -Force
  foreach ($name in $scripts) {
    $old = Join-Path $backup $name
    if (Test-Path -LiteralPath $old) { Copy-Item -LiteralPath $old -Destination (Join-Path $agent $name) -Force }
  }
  if (Test-Path -LiteralPath $savedActivePath) {
    $restoring = Join-Path $store 'active.json.restoring'
    Copy-Item -LiteralPath $savedActivePath -Destination $restoring -Force
    $activePath = Join-Path $store 'active.json'
    if (Test-Path -LiteralPath $activePath) { [IO.File]::Replace($restoring, $activePath, $null) }
    else { Move-Item -LiteralPath $restoring -Destination $activePath }
  }
}

if (!(Test-Path -LiteralPath $configPath)) { throw 'Configuração da instalação ausente.' }
$config = Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json
if ($config.url -notmatch '^https://github.com/[^/]+/[^/]+(\.git)?$' -or $config.remote -ne 'origin') { throw 'Remoto da instalação inesperado.' }

if ($Mode -eq 'status') {
  [pscustomobject]@{
    branch = $config.branch
    enabled = $config.enabled
    prepared = Test-Path -LiteralPath $preparedPath
    backup = Test-Path -LiteralPath $backup
    installedVersion = if (Test-Path -LiteralPath (Join-Path $store 'active.json')) { (Get-Content -LiteralPath (Join-Path $store 'active.json') -Raw | ConvertFrom-Json).version } else { $null }
  } | ConvertTo-Json
  exit
}

if ($Mode -eq 'preflight') {
  if ($config.branch -ne 'release/lmup-local') { throw 'A instalação já não usa a branch antiga.' }
  Check-Copy $oldCheckout 'release/lmup-local' $config.url
  $task = Get-ScheduledTask -TaskName $taskName -ErrorAction Stop
  Write-Output ('Pré-verificação aprovada. Tarefa: ' + $task.TaskName + '. Publicação atual preservada.')
  exit
}

if ($Mode -eq 'prepare') {
  if ($config.branch -ne 'release/lmup-local') { throw 'A preparação exige uma instalação antiga ainda na branch release/lmup-local.' }
  Check-Copy $oldCheckout 'release/lmup-local' $config.url
  $env:GIT_TERMINAL_PROMPT = '0'
  if (!(Test-Path -LiteralPath $newCheckout)) {
    & git.exe -c core.hooksPath= clone --origin origin --branch main --single-branch --depth 1 $config.url $newCheckout
    if ($LASTEXITCODE -ne 0) { throw 'Não foi possível preparar a cópia main. A versão instalada foi mantida.' }
  } else {
    Check-Copy $newCheckout 'main' $config.url
    Invoke-GitChecked $newCheckout @('fetch', '--no-tags', 'origin', 'main') | Out-Null
    Invoke-GitChecked $newCheckout @('-c', 'core.hooksPath=', 'merge', '--ff-only', '--no-edit', 'origin/main') | Out-Null
  }
  Check-Copy $newCheckout 'main' $config.url
  $commit = Invoke-GitChecked $newCheckout @('rev-parse', 'HEAD')
  $remoteLine = Invoke-GitChecked $newCheckout @('ls-remote', '--heads', 'origin', 'main')
  $remote = ($remoteLine -split '\s+')[0]
  if ($commit -ne $remote) { throw 'A main avançou durante a preparação. Repita o comando.' }
  $env:CI = 'true'
  $env:HUSKY = '0'
  $env:LMU_BROWSER_CHANNEL = 'chrome'
  $env:LMU_INSTALLATION_PROJECT = $null
  $env:LMU_PUBLICATION_ROOT = $null
  $env:LMU_PREVIEW_PORT = $null
  Push-Location $newCheckout
  try {
    foreach ($npmArguments in @(@('ci', '--no-audit', '--no-fund'), @('run', 'audit:security'), @('run', 'verify'), @('run', 'test:pwa'), @('run', 'test:package'))) {
      & $config.node $config.npmCli @npmArguments
      if ($LASTEXITCODE -ne 0) { throw ('Validação local falhou em npm ' + ($npmArguments -join ' ') + '. A versão instalada foi mantida.') }
    }
  } finally { Pop-Location }
  Check-Copy $newCheckout 'main' $config.url
  if ((Invoke-GitChecked $newCheckout @('rev-parse', 'HEAD')) -ne $commit) { throw 'A cópia mudou durante a validação.' }
  Save-Json $preparedPath @{ commit = $commit; oldCommit = (Invoke-GitChecked $oldCheckout @('rev-parse', 'HEAD')); preparedAt = (Get-Date).ToUniversalTime().ToString('o') }
  Write-Output "Main preparada e validada em $commit. A versão instalada ainda não mudou."
  exit
}

if ($Mode -eq 'activate') {
  if ($config.branch -ne 'release/lmup-local' -or !(Test-Path -LiteralPath $preparedPath)) { throw 'Execute a preparação antes da ativação.' }
  if (!$config.enabled) { throw 'Habilite a sincronização antiga antes da migração para conferir a publicação inicial.' }
  if (Test-Path -LiteralPath $backup) {
    if (Test-Path -LiteralPath (Join-Path $backup 'sync-config.json')) {
      $saved = Get-Content -LiteralPath (Join-Path $backup 'sync-config.json') -Raw | ConvertFrom-Json
      if ($saved.branch -ne 'release/lmup-local' -or $saved.checkout -ne $config.checkout) { throw 'Backup anterior incompatível. Confira o estado antes de repetir.' }
    }
  }
  $prepared = Get-Content -LiteralPath $preparedPath -Raw | ConvertFrom-Json
  if ($prepared.commit -notmatch '^[a-f0-9]{40}$' -or $prepared.oldCommit -notmatch '^[a-f0-9]{40}$') { throw 'Registro da preparação inválido.' }
  Check-Copy $project 'main' $config.url
  if ((Invoke-GitChecked $project @('rev-parse', 'HEAD')) -ne $prepared.commit) { throw 'Execute a migração a partir do mesmo commit validado na main.' }
  Check-Copy $oldCheckout 'release/lmup-local' $config.url
  Check-Copy $newCheckout 'main' $config.url
  if (!(Test-Path -LiteralPath (Join-Path $store 'active.json'))) { throw 'Publicação ativa ausente. A migração foi interrompida.' }
  if ((Invoke-GitChecked $oldCheckout @('rev-parse', 'HEAD')) -ne $prepared.oldCommit -or (Invoke-GitChecked $newCheckout @('rev-parse', 'HEAD')) -ne $prepared.commit) { throw 'Uma das cópias mudou após a preparação. Prepare novamente.' }
  $remoteLine = Invoke-GitChecked $newCheckout @('ls-remote', '--heads', 'origin', 'main')
  $remote = ($remoteLine -split '\s+')[0]
  if ($remote -ne $prepared.commit) { throw 'A main avançou após a validação. Prepare novamente.' }
  $task = Get-ScheduledTask -TaskName $taskName -ErrorAction Stop
  $wasEnabled = $task.State -ne 'Disabled'
  Disable-ScheduledTask -TaskName $taskName | Out-Null
  try {
    Check-Locks
    if (!(Test-Path -LiteralPath $backup)) { New-Item -ItemType Directory -Path $backup -ErrorAction Stop | Out-Null }
    if (!(Test-Path -LiteralPath (Join-Path $backup 'sync-config.json'))) { Copy-Item -LiteralPath $configPath -Destination (Join-Path $backup 'sync-config.json') }
    if ((Test-Path -LiteralPath (Join-Path $store 'active.json')) -and !(Test-Path -LiteralPath (Join-Path $backup 'active.json'))) { Copy-Item -LiteralPath (Join-Path $store 'active.json') -Destination (Join-Path $backup 'active.json') }
    $savedActive = Get-Content -LiteralPath (Join-Path $backup 'active.json') -Raw | ConvertFrom-Json
    if ($savedActive.id -notmatch '^[a-f0-9-]+$') { throw 'Identificador da publicação ativa inválido.' }
    $releasePath = Join-Path (Join-Path $store 'releases') $savedActive.id
    $releaseBackup = Join-Path $backup 'release'
    if (!(Test-Path -LiteralPath $releaseBackup)) { Copy-Item -LiteralPath $releasePath -Destination $releaseBackup -Recurse }
    Compare-Release $releasePath $releaseBackup
    foreach ($name in $scripts) {
      $old = Join-Path $agent $name
      if ((Test-Path -LiteralPath $old) -and !(Test-Path -LiteralPath (Join-Path $backup $name))) { Copy-Item -LiteralPath $old -Destination (Join-Path $backup $name) }
      Copy-Item -LiteralPath (Join-Path $PSScriptRoot $name) -Destination $old -Force
    }
    $config.branch = 'main'
    $config.checkout = $newCheckout
    Save-Json $configPath $config
    $env:LMU_INSTALLATION_PROJECT = $project
    & $config.node (Join-Path $agent 'sync-local.mjs')
    if ($LASTEXITCODE -ne 0) { throw 'O primeiro ciclo da main falhou.' }
    $result = Get-Content -LiteralPath (Join-Path $store 'sync-status.json') -Raw | ConvertFrom-Json
    if ($result.state -notin @('published', 'current') -or $result.commit -ne $prepared.commit) { throw ('A main não foi publicada: ' + $result.state + ' / ' + $result.reason) }
    if ($wasEnabled) { Enable-ScheduledTask -TaskName $taskName | Out-Null }
    Write-Output ('Migração ativa na main. Versão publicada: ' + $result.version + '. Backup: ' + $backup)
  } catch {
    if (Test-Path -LiteralPath (Join-Path $backup 'sync-config.json')) { Restore-Backup }
    if ($wasEnabled) { Enable-ScheduledTask -TaskName $taskName | Out-Null }
    throw
  }
  exit
}

if ($Mode -eq 'rollback') {
  if (!(Test-Path -LiteralPath $backup)) { throw 'Não há backup para rollback.' }
  $task = Get-ScheduledTask -TaskName $taskName -ErrorAction Stop
  $wasEnabled = $task.State -ne 'Disabled'
  Disable-ScheduledTask -TaskName $taskName | Out-Null
  try {
    Check-Locks
    Restore-Backup
    if ($wasEnabled) { Enable-ScheduledTask -TaskName $taskName | Out-Null }
    Write-Output 'Configuração, controlador e publicação anterior restaurados. As cópias e os dados do Chrome foram preservados.'
  } catch {
    if ($wasEnabled) { Enable-ScheduledTask -TaskName $taskName | Out-Null }
    throw
  }
}
