param(
  [ValidateSet('status', 'apply', 'rollback')][string]$Mode = 'status',
  [string]$TaskName,
  [string]$BackupDirectory,
  [string]$Backup,
  [int]$WaitSeconds = 900
)
# Troca só a ação de uma tarefa de sincronização já instalada: do powershell.exe
# (que abre um console visível e toma o foco a cada disparo) para o iniciador
# oculto start-local-sync-hidden.js, rodado pelo wscript.exe. Gatilhos, usuário,
# configurações, diretório de trabalho e o lançador start-local-sync.ps1 que a
# tarefa já roda ficam como estão. Antes de mudar, exporta a definição inteira
# da tarefa; `-Mode rollback -Backup <xml>` a registra de volta.
$ErrorActionPreference = 'Stop'
$project = Split-Path -Parent $PSScriptRoot
if (!$TaskName) {
  $hash = [Security.Cryptography.SHA256]::Create()
  $digest = [BitConverter]::ToString($hash.ComputeHash([Text.Encoding]::UTF8.GetBytes($project))).Replace('-', '').Substring(0, 10)
  $TaskName = 'LMUP GitHub Sync ' + $digest
}
if (!$BackupDirectory) { $BackupDirectory = Join-Path $project '.local-app' }
$hiddenName = 'start-local-sync-hidden.js'
$hiddenSource = Join-Path $PSScriptRoot $hiddenName
$wscript = Join-Path $env:SystemRoot 'System32\wscript.exe'

function Get-SyncTask {
  $found = @(Get-ScheduledTask -TaskName $TaskName -ErrorAction Stop)
  if ($found.Count -ne 1) { throw "Mais de uma tarefa chamada '$TaskName'. Nada foi alterado." }
  return $found[0]
}
# Qual mecanismo a tarefa usa e qual lançador ela roda.
function Read-SyncAction($task) {
  $actions = @($task.Actions)
  if ($actions.Count -ne 1) { throw 'A tarefa não tem exatamente uma ação. Nada foi alterado.' }
  $action = $actions[0]
  $program = [IO.Path]::GetFileName([Environment]::ExpandEnvironmentVariables($action.Execute)).ToLowerInvariant()
  if ($program -eq 'powershell.exe' -and $action.Arguments -match '-File "(?<path>[^"]+\\start-local-sync\.ps1)"') {
    return [pscustomobject]@{ mode = 'console'; launcher = $Matches.path; hidden = Join-Path (Split-Path -Parent $Matches.path) $hiddenName; action = $action }
  }
  if ($program -eq 'wscript.exe' -and $action.Arguments -match '"(?<path>[^"]+\\start-local-sync-hidden\.js)"') {
    return [pscustomobject]@{ mode = 'hidden'; launcher = Join-Path (Split-Path -Parent $Matches.path) 'start-local-sync.ps1'; hidden = $Matches.path; action = $action }
  }
  throw 'A ação da tarefa não é a do sincronizador do LMUP. Nada foi alterado.'
}
function Wait-NotRunning {
  $limit = (Get-Date).AddSeconds($WaitSeconds)
  while ((Get-SyncTask).State -eq 'Running') {
    if ((Get-Date) -gt $limit) { throw 'A tarefa continua em execução. Nada foi alterado; tente de novo depois do ciclo.' }
    Start-Sleep -Seconds 2
  }
}
# Definição da tarefa sem a ação: o que precisa continuar igual.
function Get-Rest([string]$xmlText) {
  $document = New-Object Xml.XmlDocument
  $document.PreserveWhitespace = $false
  $document.LoadXml($xmlText)
  [void]$document.DocumentElement.RemoveChild($document.DocumentElement.Item('Actions'))
  return $document.OuterXml
}
function Save-Definition([string]$path, [string]$xmlText) {
  [IO.File]::WriteAllText($path, $xmlText, [Text.Encoding]::Unicode)
}
function Restore-Definition($task, [string]$xmlText) {
  Register-ScheduledTask -TaskName $task.TaskName -TaskPath $task.TaskPath -Xml $xmlText -Force | Out-Null
  $restored = Export-ScheduledTask -TaskName $task.TaskName -TaskPath $task.TaskPath
  if ((Get-Rest $restored) -ne (Get-Rest $xmlText) -or ([xml]$restored).Task.Actions.OuterXml -ne ([xml]$xmlText).Task.Actions.OuterXml) {
    throw 'A definição registrada de volta difere da exportada.'
  }
}

$task = Get-SyncTask

if ($Mode -eq 'status') {
  $current = Read-SyncAction $task
  [pscustomobject]@{ task = $task.TaskName; state = [string]$task.State; mode = $current.mode; execute = $current.action.Execute; arguments = $current.action.Arguments; workingDirectory = $current.action.WorkingDirectory } | Format-List
  exit
}

if ($Mode -eq 'apply') {
  $current = Read-SyncAction $task
  if (!(Test-Path -LiteralPath $current.launcher -PathType Leaf)) { throw "Lançador ausente: $($current.launcher). Nada foi alterado." }
  if (!(Test-Path -LiteralPath $hiddenSource -PathType Leaf)) { throw "Iniciador oculto ausente: $hiddenSource. Nada foi alterado." }
  if (!(Test-Path -LiteralPath $wscript -PathType Leaf)) { throw "wscript.exe ausente: $wscript. Nada foi alterado." }
  $sourceHash = (Get-FileHash -LiteralPath $hiddenSource -Algorithm SHA256).Hash
  if (Test-Path -LiteralPath $current.hidden) {
    if ((Get-FileHash -LiteralPath $current.hidden -Algorithm SHA256).Hash -ne $sourceHash) { throw "Já existe outro $hiddenName em $(Split-Path -Parent $current.hidden). Nada foi alterado." }
  }
  if ($current.mode -eq 'hidden') {
    if (!(Test-Path -LiteralPath $current.hidden)) { throw "A tarefa já usa o iniciador oculto, mas ele não existe: $($current.hidden)." }
    Write-Output ('A tarefa já roda sem console: ' + $current.hidden)
    exit
  }
  Wait-NotRunning
  $task = Get-SyncTask
  $original = Export-ScheduledTask -TaskName $task.TaskName -TaskPath $task.TaskPath
  New-Item -ItemType Directory -Path $BackupDirectory -Force | Out-Null
  $backupPath = Join-Path $BackupDirectory ('sync-task-antes-janela-oculta-' + (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssZ') + '.xml')
  Save-Definition $backupPath $original
  if ((Get-Content -LiteralPath $backupPath -Raw -Encoding Unicode) -ne $original) { throw 'O backup da tarefa não confere. Nada foi alterado.' }
  $copied = $false
  try {
    if (!(Test-Path -LiteralPath $current.hidden)) {
      Copy-Item -LiteralPath $hiddenSource -Destination $current.hidden
      $copied = $true
      if ((Get-FileHash -LiteralPath $current.hidden -Algorithm SHA256).Hash -ne $sourceHash) { throw 'A cópia do iniciador oculto não confere.' }
    }
    $action = New-ScheduledTaskAction -Execute $wscript -Argument ('//B //NoLogo //E:jscript "' + $current.hidden + '"') -WorkingDirectory $current.action.WorkingDirectory
    Set-ScheduledTask -TaskName $task.TaskName -TaskPath $task.TaskPath -Action $action | Out-Null
    $changed = Export-ScheduledTask -TaskName $task.TaskName -TaskPath $task.TaskPath
    if ((Get-Rest $changed) -ne (Get-Rest $original)) { throw 'Além da ação, a definição da tarefa mudou.' }
    $after = Read-SyncAction (Get-SyncTask)
    if ($after.mode -ne 'hidden' -or $after.hidden -ne $current.hidden -or $after.action.WorkingDirectory -ne $current.action.WorkingDirectory) { throw 'A nova ação não ficou como esperado.' }
    # Só os testes usam: prova que uma falha depois da troca restaura a tarefa.
    if ($env:LMUP_TASK_ACTION_TEST_FAIL -eq 'after-set') { throw 'falha simulada depois da troca' }
  } catch {
    $failure = $_
    Restore-Definition $task $original
    if ($copied) { Remove-Item -LiteralPath $current.hidden -Force }
    throw ('A tarefa original foi restaurada. Motivo: ' + $failure)
  }
  Write-Output ('Ação trocada para o iniciador oculto: ' + $current.hidden)
  Write-Output ('Gatilhos, usuário e configurações conferidos. Backup da definição anterior: ' + $backupPath)
  exit
}

if ($Mode -eq 'rollback') {
  if (!$Backup -or !(Test-Path -LiteralPath $Backup -PathType Leaf)) { throw 'Informe em -Backup o XML exportado pelo modo apply.' }
  $saved = Get-Content -LiteralPath $Backup -Raw -Encoding Unicode
  $savedDocument = [xml]$saved
  $savedArguments = [string]$savedDocument.Task.Actions.Exec.Arguments
  if ($savedArguments -notmatch 'start-local-sync\.ps1') { throw 'O backup não é de uma tarefa do sincronizador do LMUP.' }
  Wait-NotRunning
  Restore-Definition $task $saved
  Write-Output ('Definição anterior da tarefa restaurada de ' + $Backup)
}
