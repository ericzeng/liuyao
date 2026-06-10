export type CoinFace = "head" | "tail";
export type LineCoins = [CoinFace, CoinFace, CoinFace];
export type CoinLines = [LineCoins, LineCoins, LineCoins, LineCoins, LineCoins, LineCoins];
export type ElementName = "木" | "火" | "土" | "金" | "水";
export type TrigramName = "乾" | "兑" | "离" | "震" | "巽" | "坎" | "艮" | "坤";
export type SixRelation = "兄弟" | "子孙" | "父母" | "官鬼" | "妻财" | "";

export interface TrigramInfo {
  name: TrigramName;
  symbol: string;
  element: ElementName;
}

export interface HexInfo {
  bits: string;
  name: string;
  lower: TrigramInfo;
  upper: TrigramInfo;
  symbol: string;
}

export interface PalaceInfo {
  name: TrigramName;
  element: ElementName;
  shi: number;
  ying: number;
  stage: string;
}

export interface GanZhiCalendar {
  year: string;
  month: string;
  day: string;
  hour: string;
  note: string;
}

export interface LineDetail {
  position: string;
  baseYang: boolean;
  changedYang: boolean;
  score: number;
  moving: boolean;
  relation: SixRelation;
  role: "世" | "应" | "";
  ganZhi: string;
  element: ElementName;
}

export interface ChartInput {
  question: string;
  datetime: string;
  lines: CoinLines;
}

export interface ChartResult {
  question: string;
  datetime: string;
  calendar: GanZhiCalendar;
  baseHex: HexInfo;
  changedHex: HexInfo;
  palace: PalaceInfo;
  movingLines: string[];
  lines: LineDetail[];
}

export interface HistoryRecord {
  id: string;
  createdAt: string;
  question: string;
  datetime: string;
  lines: CoinLines;
  chartResult: ChartResult;
}
