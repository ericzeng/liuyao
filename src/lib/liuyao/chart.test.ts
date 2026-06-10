import { buildChart, buildText, createDefaultLines, getLineScore, getSixRelation } from ".";
import type { CoinLines } from "./types";

describe("liuyao core", () => {
  it("uses head as 2 and tail as 3", () => {
    expect(getLineScore(["head", "head", "head"])).toBe(6);
    expect(getLineScore(["head", "head", "tail"])).toBe(7);
    expect(getLineScore(["head", "tail", "tail"])).toBe(8);
    expect(getLineScore(["tail", "tail", "tail"])).toBe(9);
  });

  it("builds base hex, changed hex and moving lines like old version", () => {
    const result = buildChart({
      question: "测试",
      datetime: "2026-06-10T18:30",
      lines: createDefaultLines()
    });

    expect(result.baseHex.name).toBe("坤为地");
    expect(result.changedHex.name).toBe("乾为天");
    expect(result.movingLines).toEqual(["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"]);
    expect(result.palace.name).toBe("坤");
    expect(result.palace.stage).toBe("本宫");
  });

  it("keeps unchanged lines when score is 7 or 8", () => {
    const lines: CoinLines = [
      ["head", "head", "tail"],
      ["head", "tail", "tail"],
      ["head", "head", "tail"],
      ["head", "tail", "tail"],
      ["head", "head", "tail"],
      ["head", "tail", "tail"]
    ];

    const result = buildChart({ question: "", datetime: "2026-06-10T18:30", lines });

    expect(result.movingLines).toEqual([]);
    expect(result.baseHex.bits).toBe(result.changedHex.bits);
  });

  it("maps six relations from palace element and line element", () => {
    expect(getSixRelation("金", "金")).toBe("兄弟");
    expect(getSixRelation("金", "水")).toBe("子孙");
    expect(getSixRelation("金", "土")).toBe("父母");
    expect(getSixRelation("金", "火")).toBe("官鬼");
    expect(getSixRelation("金", "木")).toBe("妻财");
  });

  it("exports text in the old field order", () => {
    const result = buildChart({
      question: "测试",
      datetime: "2026-06-10T18:30",
      lines: createDefaultLines()
    });

    expect(buildText(result).split("\n").slice(0, 7)).toEqual([
      "占事：测试",
      "时间：2026-06-10 18:30",
      `干支：${result.calendar.year}年 ${result.calendar.month}月 ${result.calendar.day}日 ${result.calendar.hour}时`,
      "本卦：坤为地 ☷☷",
      "变卦：乾为天 ☰☰",
      "动爻：初爻、二爻、三爻、四爻、五爻、上爻",
      "宫位：坤宫 本宫"
    ]);
  });
});
