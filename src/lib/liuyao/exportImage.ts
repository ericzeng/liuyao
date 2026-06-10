import { serifFont } from "./constants";
import { formatDateTime } from "./date";
import type { ChartResult } from "./types";

export async function generateChartImage(result: ChartResult): Promise<string> {
  await ensureFontLoaded();
  const canvas = document.createElement("canvas");
  const scale = Math.max(2, Math.ceil(window.devicePixelRatio || 1));
  const width = 1080;
  const lineHeight = 64;
  const bottomPadding = 64;
  const height = 406 + result.lines.length * lineHeight + bottomPadding;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("当前浏览器不支持 Canvas 导出");
  }

  canvas.width = width * scale;
  canvas.height = height * scale;
  ctx.scale(scale, scale);
  drawExport(ctx, result, width, height, lineHeight);
  return canvas.toDataURL("image/png");
}

function drawExport(ctx: CanvasRenderingContext2D, result: ChartResult, width: number, height: number, lineHeight: number): void {
  ctx.fillStyle = "#fffdf8";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#8f312e";
  ctx.font = `700 30px ${serifFont}`;
  ctx.fillText("六爻排盘", 54, 64);
  ctx.fillStyle = "#1e2329";
  ctx.font = `700 42px ${serifFont}`;
  const titleText = result.question || `${result.baseHex.name} 之 ${result.changedHex.name}`;
  ctx.fillText(titleText, 54, 120);
  ctx.font = `24px ${serifFont}`;
  ctx.fillStyle = "#647078";
  wrapText(
    ctx,
    `时间：${formatDateTime(result.datetime)}    干支：${result.calendar.year}年 ${result.calendar.month}月 ${result.calendar.day}日 ${result.calendar.hour}时`,
    54,
    166,
    960,
    32
  );

  ctx.fillStyle = "#ffffff";
  roundRect(ctx, 54, 220, 972, 110, 8, true, false);
  ctx.strokeStyle = "#d8ddd9";
  ctx.strokeRect(54, 220, 972, 110);
  ctx.fillStyle = "#1e2329";
  ctx.font = `700 28px ${serifFont}`;
  ctx.fillText(`本卦：${result.baseHex.name} ${result.baseHex.symbol}`, 84, 266);
  ctx.fillText(`变卦：${result.changedHex.name} ${result.changedHex.symbol}`, 540, 266);
  ctx.font = `22px ${serifFont}`;
  ctx.fillStyle = "#647078";
  ctx.fillText(`动爻：${result.movingLines.length ? result.movingLines.join("、") : "无"}    ${result.palace.name}宫 ${result.palace.stage}`, 84, 306);

  const top = 360;
  const cols = [54, 160, 330, 500, 650, 760, 1026];
  ctx.fillStyle = "#2d6853";
  ctx.fillRect(54, top, 972, 46);
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 22px ${serifFont}`;
  ["爻位", "本卦", "变卦", "六亲", "世应", "纳甲"].forEach((label, i) => {
    ctx.fillText(label, cols[i] + 16, top + 31);
  });

  ctx.font = `22px ${serifFont}`;
  result.lines
    .slice()
    .reverse()
    .forEach((line, i) => {
      const y = top + 46 + i * lineHeight;
      ctx.fillStyle = i % 2 ? "#fbfaf6" : "#ffffff";
      ctx.fillRect(54, y, 972, lineHeight);
      ctx.strokeStyle = "#d8ddd9";
      ctx.strokeRect(54, y, 972, lineHeight);
      ctx.fillStyle = "#1e2329";
      ctx.fillText(`${line.position}${line.moving ? " 动" : ""}`, cols[0] + 16, y + 40);
      drawYao(ctx, line.baseYang, cols[1] + 16, y + 24);
      ctx.fillText(String(line.score), cols[1] + 96, y + 40);
      drawYao(ctx, line.changedYang, cols[2] + 16, y + 24);
      ctx.fillText(line.relation, cols[3] + 16, y + 40);
      ctx.fillText(line.role || "-", cols[4] + 16, y + 40);
      ctx.fillText(`${line.ganZhi} ${line.element}`, cols[5] + 16, y + 40);
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
  let line = "";
  Array.from(text).forEach((char) => {
    const testLine = line + char;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = char;
      y += lineHeight;
    } else {
      line = testLine;
    }
  });
  if (line) ctx.fillText(line, x, y);
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
