import { formatDateTime } from "./date";
import type { ChartResult } from "./types";

export function buildText(result: ChartResult): string {
  const rows = result.lines
    .slice()
    .reverse()
    .map((line) => {
      const base = line.baseYang ? "阳" : "阴";
      const changed = line.changedYang ? "阳" : "阴";
      return `${line.position}${line.moving ? "动" : "  "} ${base}->${changed} ${line.relation} ${line.role || "　"} ${line.ganZhi}${line.element}`;
    });

  return [
    result.question ? `占事：${result.question}` : "",
    `时间：${formatDateTime(result.datetime)}`,
    `干支：${result.calendar.year}年 ${result.calendar.month}月 ${result.calendar.day}日 ${result.calendar.hour}时`,
    `本卦：${result.baseHex.name} ${result.baseHex.symbol}`,
    `变卦：${result.changedHex.name} ${result.changedHex.symbol}`,
    `动爻：${result.movingLines.length ? result.movingLines.join("、") : "无"}`,
    `宫位：${result.palace.name}宫 ${result.palace.stage}`,
    ...rows
  ]
    .filter(Boolean)
    .join("\n");
}
