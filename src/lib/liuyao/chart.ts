import {
  branchElements,
  elementControls,
  elementGenerates,
  hexTable,
  lineNames,
  naJia,
  palaceOrder,
  trigrams,
  trigramBitsByName
} from "./constants";
import { getGanZhi } from "./ganzhi";
import type {
  ChartInput,
  ChartResult,
  CoinFace,
  CoinLines,
  ElementName,
  HexInfo,
  LineDetail,
  LineCoins,
  PalaceInfo,
  SixRelation,
  TrigramName
} from "./types";

export function createDefaultLines(): CoinLines {
  return Array.from({ length: 6 }, () => ["head", "head", "head"] as LineCoins) as CoinLines;
}

export function getLineScore(coins: readonly CoinFace[]): number {
  return coins.reduce<number>((sum, face) => sum + (face === "head" ? 2 : 3), 0);
}

export function buildChart(input: ChartInput): ChartResult {
  const scores = input.lines.map(getLineScore);
  const baseLines = scores.map((score) => (score === 7 || score === 9 ? 1 : 0));
  const changedLines = scores.map((score, index) => (score === 6 || score === 9 ? 1 - baseLines[index] : baseLines[index]));
  const baseHex = getHex(baseLines);
  const changedHex = getHex(changedLines);
  const palace = getPalace(baseLines);
  const innerNaJia = naJia[baseHex.lower.name].inner;
  const outerNaJia = naJia[baseHex.upper.name].outer;
  const lineDetails: LineDetail[] = baseLines.map((line, index) => {
    const ganZhi = index < 3 ? innerNaJia[index] : outerNaJia[index - 3];
    const branch = ganZhi.slice(1);
    const element = branchElements[branch];
    const relation = getSixRelation(palace.element, element);

    const role: LineDetail["role"] = index + 1 === palace.shi ? "世" : index + 1 === palace.ying ? "应" : "";

    return {
      position: lineNames[index],
      baseYang: line === 1,
      changedYang: changedLines[index] === 1,
      score: scores[index],
      moving: scores[index] === 6 || scores[index] === 9,
      relation,
      role,
      ganZhi,
      element
    };
  });

  return {
    question: input.question,
    datetime: input.datetime,
    calendar: getGanZhi(new Date(input.datetime)),
    baseHex,
    changedHex,
    palace,
    movingLines: lineDetails.filter((item) => item.moving).map((item) => item.position),
    lines: lineDetails
  };
}

export function getHex(lines: number[]): HexInfo {
  const bits = lines.join("");
  const lowerBits = bits.slice(0, 3);
  const upperBits = bits.slice(3, 6);
  const lower = trigrams[lowerBits];
  const upper = trigrams[upperBits];

  return {
    bits,
    name: hexTable[upper.name][lower.name],
    lower,
    upper,
    symbol: `${upper.symbol}${lower.symbol}`
  };
}

export function getPalace(lines: number[]): PalaceInfo {
  const target = lines.join("");
  for (const palaceName of palaceOrder) {
    const pureBits = trigramBitsByName[palaceName] + trigramBitsByName[palaceName];
    const sequence = buildPalaceSequence(pureBits);
    const match = sequence.find((item) => item.bits === target);

    if (match) {
      return {
        ...match,
        name: palaceName,
        element: trigrams[trigramBitsByName[palaceName]].element
      };
    }
  }

  return { name: "乾", element: "金", shi: 6, ying: 3, stage: "本宫" };
}

function buildPalaceSequence(pureBits: string): Array<{ bits: string; stage: string; shi: number; ying: number }> {
  const stages: Array<{ stage: string; shi: number; ying: number; flip: number | number[] | null }> = [
    { stage: "本宫", shi: 6, ying: 3, flip: null },
    { stage: "一世", shi: 1, ying: 4, flip: 0 },
    { stage: "二世", shi: 2, ying: 5, flip: 1 },
    { stage: "三世", shi: 3, ying: 6, flip: 2 },
    { stage: "四世", shi: 4, ying: 1, flip: 3 },
    { stage: "五世", shi: 5, ying: 2, flip: 4 },
    { stage: "游魂", shi: 4, ying: 1, flip: 3 },
    { stage: "归魂", shi: 3, ying: 6, flip: [0, 1, 2] }
  ];
  const bits = pureBits.split("").map(Number);

  return stages.map((step) => {
    if (Array.isArray(step.flip)) {
      step.flip.forEach((index) => {
        bits[index] = 1 - bits[index];
      });
    } else if (typeof step.flip === "number") {
      bits[step.flip] = 1 - bits[step.flip];
    }

    return { bits: bits.join(""), stage: step.stage, shi: step.shi, ying: step.ying };
  });
}

export function getSixRelation(palaceElement: ElementName, lineElement: ElementName): SixRelation {
  if (palaceElement === lineElement) return "兄弟";
  if (elementGenerates[palaceElement] === lineElement) return "子孙";
  if (elementGenerates[lineElement] === palaceElement) return "父母";
  if (elementControls[lineElement] === palaceElement) return "官鬼";
  if (elementControls[palaceElement] === lineElement) return "妻财";
  return "";
}

export function setCoinFace(lines: CoinLines, lineIndex: number, coinIndex: number, face: CoinFace): CoinLines {
  return lines.map((line, currentLineIndex) =>
    line.map((coin, currentCoinIndex) =>
      currentLineIndex === lineIndex && currentCoinIndex === coinIndex ? face : coin
    )
  ) as CoinLines;
}

export function toggleCoinFace(lines: CoinLines, lineIndex: number, coinIndex: number): CoinLines {
  const current = lines[lineIndex][coinIndex];
  return setCoinFace(lines, lineIndex, coinIndex, current === "head" ? "tail" : "head");
}

export function cloneLines(lines: CoinLines): CoinLines {
  return lines.map((line) => [...line]) as CoinLines;
}
