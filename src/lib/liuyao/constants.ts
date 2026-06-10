import type { ElementName, TrigramInfo, TrigramName } from "./types";

export const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
export const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;
export const lineNames = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"] as const;
export const historyStorageKey = "liuyaoChartHistory";
export const serifFont = '"Noto Serif SC", "Source Han Serif SC", "Songti SC", serif';

export const branchElements: Record<string, ElementName> = {
  子: "水",
  亥: "水",
  寅: "木",
  卯: "木",
  巳: "火",
  午: "火",
  申: "金",
  酉: "金",
  辰: "土",
  戌: "土",
  丑: "土",
  未: "土"
};

export const elementGenerates: Record<ElementName, ElementName> = {
  木: "火",
  火: "土",
  土: "金",
  金: "水",
  水: "木"
};

export const elementControls: Record<ElementName, ElementName> = {
  木: "土",
  土: "水",
  水: "火",
  火: "金",
  金: "木"
};

export const trigrams: Record<string, TrigramInfo> = {
  "111": { name: "乾", symbol: "☰", element: "金" },
  "110": { name: "兑", symbol: "☱", element: "金" },
  "101": { name: "离", symbol: "☲", element: "火" },
  "100": { name: "震", symbol: "☳", element: "木" },
  "011": { name: "巽", symbol: "☴", element: "木" },
  "010": { name: "坎", symbol: "☵", element: "水" },
  "001": { name: "艮", symbol: "☶", element: "土" },
  "000": { name: "坤", symbol: "☷", element: "土" }
};

export const palaceOrder: TrigramName[] = ["乾", "兑", "离", "震", "巽", "坎", "艮", "坤"];

export const trigramBitsByName = Object.fromEntries(
  Object.entries(trigrams).map(([bits, info]) => [info.name, bits])
) as Record<TrigramName, string>;

export const hexTable: Record<TrigramName, Record<TrigramName, string>> = {
  乾: { 乾: "乾为天", 兑: "天泽履", 离: "天火同人", 震: "天雷无妄", 巽: "天风姤", 坎: "天水讼", 艮: "天山遯", 坤: "天地否" },
  兑: { 乾: "泽天夬", 兑: "兑为泽", 离: "泽火革", 震: "泽雷随", 巽: "泽风大过", 坎: "泽水困", 艮: "泽山咸", 坤: "泽地萃" },
  离: { 乾: "火天大有", 兑: "火泽睽", 离: "离为火", 震: "火雷噬嗑", 巽: "火风鼎", 坎: "火水未济", 艮: "火山旅", 坤: "火地晋" },
  震: { 乾: "雷天大壮", 兑: "雷泽归妹", 离: "雷火丰", 震: "震为雷", 巽: "雷风恒", 坎: "雷水解", 艮: "雷山小过", 坤: "雷地豫" },
  巽: { 乾: "风天小畜", 兑: "风泽中孚", 离: "风火家人", 震: "风雷益", 巽: "巽为风", 坎: "风水涣", 艮: "风山渐", 坤: "风地观" },
  坎: { 乾: "水天需", 兑: "水泽节", 离: "水火既济", 震: "水雷屯", 巽: "水风井", 坎: "坎为水", 艮: "水山蹇", 坤: "水地比" },
  艮: { 乾: "山天大畜", 兑: "山泽损", 离: "山火贲", 震: "山雷颐", 巽: "山风蛊", 坎: "山水蒙", 艮: "艮为山", 坤: "山地剥" },
  坤: { 乾: "地天泰", 兑: "地泽临", 离: "地火明夷", 震: "地雷复", 巽: "地风升", 坎: "地水师", 艮: "地山谦", 坤: "坤为地" }
};

export const naJia: Record<TrigramName, { inner: string[]; outer: string[] }> = {
  乾: { inner: ["甲子", "甲寅", "甲辰"], outer: ["壬午", "壬申", "壬戌"] },
  坤: { inner: ["乙未", "乙巳", "乙卯"], outer: ["癸丑", "癸亥", "癸酉"] },
  震: { inner: ["庚子", "庚寅", "庚辰"], outer: ["庚午", "庚申", "庚戌"] },
  巽: { inner: ["辛丑", "辛亥", "辛酉"], outer: ["辛未", "辛巳", "辛卯"] },
  坎: { inner: ["戊寅", "戊辰", "戊午"], outer: ["戊申", "戊戌", "戊子"] },
  离: { inner: ["己卯", "己丑", "己亥"], outer: ["己酉", "己未", "己巳"] },
  艮: { inner: ["丙辰", "丙午", "丙申"], outer: ["丙戌", "丙子", "丙寅"] },
  兑: { inner: ["丁巳", "丁卯", "丁丑"], outer: ["丁亥", "丁酉", "丁未"] }
};
