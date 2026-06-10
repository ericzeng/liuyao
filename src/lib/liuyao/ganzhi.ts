import { branches, stems } from "./constants";
import type { GanZhiCalendar } from "./types";

export function getGanZhi(date: Date): GanZhiCalendar {
  const solarYear = getSolarYear(date);
  const yearIndex = cycleIndex(solarYear - 1984);
  const month = getSolarMonth(date);
  const monthBranchIndex = (2 + month.index) % 12;
  const firstMonthStemByYearStem = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0];
  const monthStemIndex = (firstMonthStemByYearStem[yearIndex % 10] + month.index) % 10;
  const dayIndex = getDayCycleIndex(date);
  const hourBranchIndex = Math.floor(((date.getHours() + 1) % 24) / 2);
  const hourStemIndex = (((dayIndex % 10) % 5) * 2 + hourBranchIndex) % 10;

  return {
    year: stems[yearIndex % 10] + branches[yearIndex % 12],
    month: stems[monthStemIndex] + branches[monthBranchIndex],
    day: stems[dayIndex % 10] + branches[dayIndex % 12],
    hour: stems[hourStemIndex] + branches[hourBranchIndex],
    note: month.approx ? "月柱按近似节气划分" : ""
  };
}

function getSolarYear(date: Date): number {
  const boundary = new Date(date.getFullYear(), 1, 4, 0, 0, 0);
  return date >= boundary ? date.getFullYear() : date.getFullYear() - 1;
}

function getSolarMonth(date: Date): { index: number; approx: boolean } {
  const y = date.getFullYear();
  const boundaries = [
    [1, 4],
    [2, 6],
    [3, 5],
    [4, 6],
    [5, 6],
    [6, 7],
    [7, 8],
    [8, 8],
    [9, 8],
    [10, 7],
    [11, 7],
    [0, 6]
  ].map(([month, day], index) => ({ index, date: new Date(y, month, day) }));

  let monthIndex = 11;
  for (const item of boundaries) {
    if (date >= item.date) monthIndex = item.index;
  }

  return { index: monthIndex, approx: true };
}

function getDayCycleIndex(date: Date): number {
  const base = Date.UTC(2000, 0, 1);
  const current = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const days = Math.floor((current - base) / 86400000);
  return cycleIndex(days + 4);
}

function cycleIndex(value: number): number {
  return ((value % 60) + 60) % 60;
}
