// src/services/backupService.d.ts
export function exportData(): Promise<void>;
export function importData(file: File): Promise<void>;
export function clearAllData(): Promise<void>;
