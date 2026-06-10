import { serifFont } from "./constants";
import { formatDateTime } from "./date";
import type { ChartResult } from "./types";

const EXPORT_WIDTH = 1280;
const CONTENT_MARGIN = 72;
const CONTENT_X = CONTENT_MARGIN;
const CONTENT_WIDTH = EXPORT_WIDTH - CONTENT_MARGIN * 2;
const TABLE_COL_WIDTHS = [130, 170, 170, 150, 130];

function getTableCols(contentX: number, tableWidth: number): number[] {
  const cols = [contentX];
  TABLE_COL_WIDTHS.forEach((colWidth) => cols.push(cols[cols.length - 1]! + colWidth));
  cols.push(contentX + tableWidth);
  return cols;
}

export async function generateChartImage(result: ChartResult): Promise<string> {
  await ensureFontLoaded();
  const canvas = document.createElement("canvas");
  const scale = Math.max(2, Math.ceil(window.devicePixelRatio || 1));
  const width = EXPORT_WIDTH;
  const contentWidth = CONTENT_WIDTH;
  const lineHeight = 72;
  const titleLineHeight = 50;
  const titleText = result.question || `${result.baseHex.name} 之 ${result.changedHex.name}`;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("当前浏览器不支持 Canvas 导出");
  }

  ctx.font = `900 34px ${serifFont}`;
  const titleLines = wrapTextLines(ctx, titleText, contentWidth);
  const height =
    72 +
    titleLines.length * titleLineHeight +
    28 +
    36 +
    34 +
    112 +
    36 +
    30 +
    34 +
    54 +
    result.lines.length * lineHeight +
    72;

  canvas.width = width * scale;
  canvas.height = height * scale;
  ctx.scale(scale, scale);
  drawExport(ctx, result, width, height, lineHeight, titleLines, titleLineHeight);
  return canvas.toDataURL("image/png");
}

function drawExport(
  ctx: CanvasRenderingContext2D,
  result: ChartResult,
  width: number,
  height: number,
  lineHeight: number,
  titleLines: string[],
  titleLineHeight: number
): void {
  ctx.fillStyle = "#fffdf8";
  ctx.fillRect(0, 0, width, height);

  const contentX = CONTENT_X;
  const contentWidth = CONTENT_WIDTH;
  let y = 72;

  ctx.fillStyle = "#1e2329";
  ctx.font = `900 34px ${serifFont}`;
  titleLines.forEach((line, index) => {
    ctx.fillText(line, contentX, y + 32 + index * titleLineHeight);
  });

  y += titleLines.length * titleLineHeight + 28;
  ctx.font = `24px ${serifFont}`;
  ctx.fillStyle = "#647078";
  ctx.fillText(formatDateTime(result.datetime), contentX, y + 24);

  y += 70;
  drawSummaryGrid(ctx, result, contentX, y, contentWidth);

  y += 148;
  let chipX = contentX;
  chipX = drawChip(ctx, `${result.palace.name}宫`, chipX, y, "primary") + 14;
  chipX = drawChip(ctx, result.palace.stage, chipX, y, "secondary") + 14;
  if (result.calendar.note) {
    drawChip(ctx, result.calendar.note, chipX, y, "default");
  }

  y += 64;
  const top = y;
  const tableHeaderHeight = 54;
  const tableWidth = contentWidth;
  const cols = getTableCols(contentX, tableWidth);
  ctx.strokeStyle = "rgba(143, 49, 46, 0.09)";
  roundRect(ctx, contentX, top, tableWidth, tableHeaderHeight + result.lines.length * lineHeight, 14, false, true);
  ctx.fillStyle = "#f9f3ef";
  roundRect(ctx, contentX, top, tableWidth, tableHeaderHeight, 14, true, false);
  ctx.fillRect(contentX, top + 14, tableWidth, tableHeaderHeight - 14);
  ctx.fillStyle = "#662321";
  ctx.font = `700 22px ${serifFont}`;
  ["爻位", "本卦", "变卦", "六亲", "世应", "纳甲"].forEach((label, i) => {
    ctx.fillText(label, cols[i] + 18, top + 35);
  });

  ctx.font = `22px ${serifFont}`;
  result.lines
    .slice()
    .reverse()
    .forEach((line, i) => {
      const y = top + tableHeaderHeight + i * lineHeight;
      const rowBaseline = y + 45;
      const chipY = y + 24;
      const yaoY = y + 29;
      ctx.fillStyle = line.moving ? "#fcf6f4" : i % 2 ? "#fbfaf6" : "#ffffff";
      ctx.fillRect(contentX, y, tableWidth, lineHeight);
      ctx.strokeStyle = "#d8ddd9";
      drawLine(ctx, contentX, y + lineHeight, contentX + tableWidth, y + lineHeight);
      ctx.fillStyle = "#1e2329";
      ctx.font = `700 22px ${serifFont}`;
      ctx.fillText(line.position, cols[0] + 18, rowBaseline);
      if (line.moving) {
        drawChip(ctx, "动", cols[0] + 72, chipY, "primary", "small");
      }
      drawYao(ctx, line.baseYang, cols[1] + 18, yaoY);
      ctx.font = `22px ${serifFont}`;
      ctx.fillStyle = "#647078";
      ctx.fillText(String(line.score), cols[1] + 100, rowBaseline);
      drawYao(ctx, line.changedYang, cols[2] + 18, yaoY);
      ctx.fillStyle = "#1e2329";
      ctx.font = `700 22px ${serifFont}`;
      ctx.fillText(line.relation, cols[3] + 18, rowBaseline);
      if (line.role) {
        drawChip(ctx, line.role, cols[4] + 18, chipY, line.role === "世" ? "primary" : "secondary", "small", true);
      } else {
        ctx.font = `22px ${serifFont}`;
        ctx.fillStyle = "#647078";
        ctx.fillText("-", cols[4] + 18, rowBaseline);
      }
      ctx.fillStyle = "#1e2329";
      ctx.font = `22px ${serifFont}`;
      const najiaX = cols[5] + 18;
      ctx.fillText(line.ganZhi, najiaX, rowBaseline);
      const elementX = najiaX + ctx.measureText(`${line.ganZhi} `).width;
      ctx.fillStyle = "rgba(30, 35, 41, 0.62)";
      ctx.font = `20px ${serifFont}`;
      ctx.fillText(line.element, elementX, rowBaseline);
    });
}

function drawSummaryGrid(ctx: CanvasRenderingContext2D, result: ChartResult, x: number, y: number, width: number): void {
  const gap = 14;
  const cardHeight = 112;
  const cardWidth = (width - gap * 3) / 4;
  const cards = [
    { label: "本卦", value: `${result.baseHex.name} ${result.baseHex.symbol}` },
    { label: "变卦", value: `${result.changedHex.name} ${result.changedHex.symbol}` },
    { label: "动爻", value: result.movingLines.length ? result.movingLines.join("、") : "无" },
    { label: "干支", value: `${result.calendar.year}年 ${result.calendar.month}月 ${result.calendar.day}日 ${result.calendar.hour}时` }
  ];

  cards.forEach((card, index) => {
    const cardX = x + index * (cardWidth + gap);
    ctx.fillStyle = "#fffdf8";
    roundRect(ctx, cardX, y, cardWidth, cardHeight, 14, true, false);
    ctx.strokeStyle = "rgba(143, 49, 46, 0.16)";
    roundRect(ctx, cardX, y, cardWidth, cardHeight, 14, false, true);
    ctx.fillStyle = "#647078";
    ctx.font = `700 18px ${serifFont}`;
    ctx.fillText(card.label, cardX + 18, y + 32);
    ctx.fillStyle = "#1e2329";
    ctx.font = `900 22px ${serifFont}`;
    wrapText(ctx, card.value, cardX + 18, y + 70, cardWidth - 36, 28);
  });
}

function drawYao(ctx: CanvasRenderingContext2D, isYang: boolean, x: number, y: number): void {
  ctx.fillStyle = "#1e2329";
  if (isYang) {
    roundRect(ctx, x, y, 70, 9, 5, true, false);
  } else {
    roundRect(ctx, x, y, 30, 9, 5, true, false);
    roundRect(ctx, x + 40, y, 30, 9, 5, true, false);
  }
}

function drawChip(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: "primary" | "secondary" | "default",
  size: "normal" | "small" = "normal",
  outlined = false
): number {
  const height = size === "small" ? 24 : 30;
  const fontSize = size === "small" ? 16 : 18;
  const paddingX = size === "small" ? 10 : 14;
  ctx.font = `700 ${fontSize}px ${serifFont}`;
  const width = Math.ceil(ctx.measureText(text).width) + paddingX * 2;
  const colors = {
    primary: { bg: "rgba(143, 49, 46, 0.12)", border: "rgba(143, 49, 46, 0.24)", text: "#662321" },
    secondary: { bg: "rgba(45, 104, 83, 0.12)", border: "rgba(45, 104, 83, 0.24)", text: "#183d30" },
    default: { bg: "rgba(30, 35, 41, 0.06)", border: "rgba(30, 35, 41, 0.14)", text: "rgba(30, 35, 41, 0.72)" }
  }[color];

  ctx.fillStyle = outlined ? "#fffdf8" : colors.bg;
  roundRect(ctx, x, y, width, height, height / 2, true, false);
  ctx.strokeStyle = colors.border;
  roundRect(ctx, x, y, width, height, height / 2, false, true);
  ctx.fillStyle = colors.text;
  ctx.fillText(text, x + paddingX, y + Math.round(height / 2 + fontSize / 2 - 4));

  return x + width;
}

function drawLine(ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number): void {
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: boolean,
  stroke: boolean
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): void {
  wrapTextLines(ctx, text, maxWidth).forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight);
  });
}

function wrapTextLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];

  text.split(/\r?\n/).forEach((paragraph) => {
    let line = "";
    Array.from(paragraph).forEach((char) => {
      const testLine = line + char;
      if (ctx.measureText(testLine).width > maxWidth && line) {
        lines.push(line);
        line = char;
      } else {
        line = testLine;
      }
    });
    lines.push(line);
  });

  return lines.length ? lines : [""];
}

async function ensureFontLoaded(): Promise<void> {
  if (!("fonts" in document)) return;

  await Promise.all([
    document.fonts.load(`400 22px ${serifFont}`),
    document.fonts.load(`700 30px ${serifFont}`),
    document.fonts.load(`900 34px ${serifFont}`)
  ]);
  await document.fonts.ready;
}
