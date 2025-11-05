// src/services/backupService.d.ts
export function exportarDados(): Promise<void>;
export function importarDados(file: File): Promise<void>;
