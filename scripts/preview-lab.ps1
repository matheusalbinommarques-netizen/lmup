param(
  [ValidatePattern('^/laboratorio/[a-z0-9-]+$')]
  [string]$Route = '/laboratorio/acampamento',
  [string]$Branch = 'feat/sanctuary-pan-zoom-lab',
  [ValidateRange(1024, 65535)]
  [int]$Port = 5175
)
$ErrorActionPreference = 'Stop'
if ($Port -eq 5174) { throw 'A porta 5174 pertence à instalação. Escolha outra porta.' }
$previewRoot = Split-Path -Parent $PSScriptRoot
$previewBranch = (git -C $previewRoot branch --show-current).Trim()
if ($LASTEXITCODE -ne 0 -or $previewBranch -ne $Branch) {
  throw "Checkout incorreto: $previewBranch. Esperado: $Branch. Nenhuma branch foi alterada."
}
$previewCommit = (git -C $previewRoot rev-parse HEAD).Trim()
$previewRouteFile = Join-Path $previewRoot ('src/routes' + $Route + '/+page.svelte')
if (-not (Test-Path -LiteralPath $previewRouteFile -PathType Leaf)) {
  throw "A rota não existe neste checkout: $previewRouteFile"
}
$previewListener = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue
if ($previewListener) {
  $previewListener | ForEach-Object {
    Get-CimInstance Win32_Process -Filter "ProcessId = $($_.OwningProcess)" |
      Format-List ProcessId, CommandLine | Out-Host
  }
  throw "Porta $Port ocupada. Nenhum processo foi interrompido. Use -Port com outra porta."
}
$previewLogs = Join-Path ([IO.Path]::GetTempPath()) "lmup-preview-$Port"
New-Item -ItemType Directory -Path $previewLogs -Force | Out-Null
$previewProcess = Start-Process -FilePath (Get-Command node).Source -WorkingDirectory $previewRoot `
  -ArgumentList @('node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', "$Port", '--strictPort') `
  -WindowStyle Hidden -RedirectStandardOutput (Join-Path $previewLogs 'stdout.log') `
  -RedirectStandardError (Join-Path $previewLogs 'stderr.log') -PassThru
$previewUrl = "http://127.0.0.1:$Port$Route"
$previewReady = $false
$previewDeadline = [DateTime]::UtcNow.AddSeconds(25)
while ([DateTime]::UtcNow -lt $previewDeadline) {
  $previewProcess.Refresh()
  if ($previewProcess.HasExited) { throw "Servidor encerrou. Consulte $previewLogs" }
  try {
    $previewResponse = Invoke-WebRequest -Uri $previewUrl -UseBasicParsing -TimeoutSec 1
    if ($previewResponse.StatusCode -eq 200) { $previewReady = $true; break }
  } catch { }
  Start-Sleep -Milliseconds 250
}
if (-not $previewReady) { throw "Prévia ainda não respondeu. Consulte $previewLogs. PID: $($previewProcess.Id)" }
$previewInfo = [ordered]@{
  directory = $previewRoot; branch = $previewBranch; commit = $previewCommit
  dirty = [bool](git -C $previewRoot status --porcelain)
  pid = $previewProcess.Id; url = $previewUrl; checkedAt = [DateTime]::UtcNow.ToString('o')
}
$previewInfo | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $previewLogs 'preview.json') -Encoding utf8
$previewInfo | Format-List | Out-Host
Write-Host "Logs: $previewLogs"
Write-Host 'Antes de entregar o link, confirme a página renderizada e o console no navegador.'
