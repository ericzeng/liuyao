import { historyStorageKey } from "./constants";
import type { ChartInput, ChartResult, CoinLines, HistoryRecord } from "./types";

export function loadHistoryRecords(): HistoryRecord[] {
  try {
    const raw = localStorage.getItem(historyStorageKey);
    if (!raw) return [];
    const records = JSON.parse(raw);
    return Array.isArray(records) ? records.filter(isHistoryRecord) : [];
  } catch {
    return [];
  }
}

export function saveHistoryRecord(input: ChartInput, chartResult: ChartResult): HistoryRecord | null {
  const record: HistoryRecord = {
    id: createHistoryId(),
    createdAt: new Date().toISOString(),
    question: input.question,
    datetime: input.datetime,
    lines: cloneJson(input.lines),
    chartResult: cloneJson(chartResult)
  };

  try {
    const records = loadHistoryRecords();
    writeHistoryRecords([record, ...records]);
    return record;
  } catch {
    return null;
  }
}

export function writeHistoryRecords(records: HistoryRecord[]): void {
  localStorage.setItem(historyStorageKey, JSON.stringify(records));
}

export function deleteHistoryRecord(id: string): HistoryRecord[] {
  const records = loadHistoryRecords().filter((record) => record.id !== id);
  writeHistoryRecords(records);
  return records;
}

export function clearHistoryRecords(): void {
  localStorage.removeItem(historyStorageKey);
}

export function filterHistoryRecords(records: HistoryRecord[], keyword: string): HistoryRecord[] {
  const text = keyword.trim().toLowerCase();
  if (!text) return records;

  return records.filter((record) => {
    const title = record.question || `${record.chartResult.baseHex.name} 之 ${record.chartResult.changedHex.name}`;
    const summary = `${title} ${record.chartResult.baseHex.name} ${record.chartResult.changedHex.name} ${record.chartResult.palace.name}宫 ${record.datetime}`;
    return summary.toLowerCase().includes(text);
  });
}

export function isHistoryRecord(record: unknown): record is HistoryRecord {
  const candidate = record as Partial<HistoryRecord> | null;
  return Boolean(
    candidate &&
      candidate.id &&
      candidate.createdAt &&
      candidate.datetime &&
      Array.isArray(candidate.lines) &&
      isCoinLines(candidate.lines) &&
      candidate.chartResult &&
      candidate.chartResult.baseHex &&
      candidate.chartResult.changedHex
  );
}

function isCoinLines(value: unknown): value is CoinLines {
  return (
    Array.isArray(value) &&
    value.length === 6 &&
    value.every(
      (line) =>
        Array.isArray(line) &&
        line.length === 3 &&
        line.every((face) => face === "head" || face === "tail")
    )
  );
}

function createHistoryId(): string {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
