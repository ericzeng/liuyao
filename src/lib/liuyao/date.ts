import dayjs, { type Dayjs } from "dayjs";

export function toDatetimeLocal(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function parseDatetimeLocal(value: string): Dayjs | null {
  if (!value) return null;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
}

export function formatDatetimeLocal(value: Dayjs | null): string {
  if (!value?.isValid()) return "";
  return value.format("YYYY-MM-DDTHH:mm");
}

export function formatDateTime(value: string): string {
  return value.replace("T", " ");
}
