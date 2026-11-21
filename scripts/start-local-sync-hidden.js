// Iniciador da tarefa agendada: roda o start-local-sync.ps1 da mesma pasta sem
// nenhuma janela. O Agendador cria um console visível para todo programa de
// console (powershell.exe, node.exe) antes de ele começar; -WindowStyle Hidden
// só o esconde depois, e nesse meio-tempo ele toma o foco do que está na tela.
// O wscript.exe é um programa gráfico: não ganha console. Run(comando, 0, true)
// cria o PowerShell já oculto, espera só esse processo (não os descendentes,
// como o servidor da porta 5174) e devolve o código de saída dele, que vira o
// resultado da tarefa.
//
// Roda no Windows Script Host como JScript (ES3), não no Node: sem let/const,
// arrow functions ou vírgula final em listas.
var shell = new ActiveXObject('WScript.Shell');
var files = new ActiveXObject('Scripting.FileSystemObject');
var here = files.GetParentFolderName(WScript.ScriptFullName);
var project = files.GetParentFolderName(here);
var launcher = files.BuildPath(here, 'start-local-sync.ps1');
var system = shell.ExpandEnvironmentStrings('%SystemRoot%\\System32');
var powershell = system + '\\WindowsPowerShell\\v1.0\\powershell.exe';
var command =
  '"' +
  powershell +
  '" -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "' +
  launcher +
  '"';
var code = 1;
try {
  code = shell.Run(command, 0, true);
} catch (error) {
  // O PowerShell nem iniciou, então nada registrou a falha: deixa o motivo no
  // log de erro do lançador. Sem a pasta, a tarefa ainda termina com falha.
  try {
    var path = files.BuildPath(project, '.local-app\\sync-launch-error.log');
    var line = new Date().toUTCString() + ' iniciador oculto: ' + error.message;
    var log = files.OpenTextFile(path, 8, true);
    log.WriteLine(line);
    log.Close();
    // ES3 não aceita catch sem identificador.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (ignored) {
    // Sem onde registrar: o código de saída basta.
  }
}
WScript.Quit(code);
