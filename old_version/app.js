const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const branchElements = {
  子: "水", 亥: "水", 寅: "木", 卯: "木", 巳: "火", 午: "火",
  申: "金", 酉: "金", 辰: "土", 戌: "土", 丑: "土", 未: "土"
};
const elementGenerates = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
const elementControls = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" };
const lineNames = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];
const serifFont = '"Noto Serif SC", "Source Han Serif SC", serif';
const historyStorageKey = "liuyaoChartHistory";
const trigrams = {
  "111": { name: "乾", symbol: "☰", element: "金" },
  "110": { name: "兑", symbol: "☱", element: "金" },
  "101": { name: "离", symbol: "☲", element: "火" },
  "100": { name: "震", symbol: "☳", element: "木" },
  "011": { name: "巽", symbol: "☴", element: "木" },
  "010": { name: "坎", symbol: "☵", element: "水" },
  "001": { name: "艮", symbol: "☶", element: "土" },
  "000": { name: "坤", symbol: "☷", element: "土" }
};
const palaceOrder = ["乾", "兑", "离", "震", "巽", "坎", "艮", "坤"];
const trigramBitsByName = Object.fromEntries(Object.entries(trigrams).map(([bits, info]) => [info.name, bits]));
const hexTable = {
  乾: { 乾: "乾为天", 兑: "天泽履", 离: "天火同人", 震: "天雷无妄", 巽: "天风姤", 坎: "天水讼", 艮: "天山遯", 坤: "天地否" },
  兑: { 乾: "泽天夬", 兑: "兑为泽", 离: "泽火革", 震: "泽雷随", 巽: "泽风大过", 坎: "泽水困", 艮: "泽山咸", 坤: "泽地萃" },
  离: { 乾: "火天大有", 兑: "火泽睽", 离: "离为火", 震: "火雷噬嗑", 巽: "火风鼎", 坎: "火水未济", 艮: "火山旅", 坤: "火地晋" },
  震: { 乾: "雷天大壮", 兑: "雷泽归妹", 离: "雷火丰", 震: "震为雷", 巽: "雷风恒", 坎: "雷水解", 艮: "雷山小过", 坤: "雷地豫" },
  巽: { 乾: "风天小畜", 兑: "风泽中孚", 离: "风火家人", 震: "风雷益", 巽: "巽为风", 坎: "风水涣", 艮: "风山渐", 坤: "风地观" },
  坎: { 乾: "水天需", 兑: "水泽节", 离: "水火既济", 震: "水雷屯", 巽: "水风井", 坎: "坎为水", 艮: "水山蹇", 坤: "水地比" },
  艮: { 乾: "山天大畜", 兑: "山泽损", 离: "山火贲", 震: "山雷颐", 巽: "山风蛊", 坎: "山水蒙", 艮: "艮为山", 坤: "山地剥" },
  坤: { 乾: "地天泰", 兑: "地泽临", 离: "地火明夷", 震: "地雷复", 巽: "地风升", 坎: "地水师", 艮: "地山谦", 坤: "坤为地" }
};
const naJia = {
  乾: { inner: ["甲子", "甲寅", "甲辰"], outer: ["壬午", "壬申", "壬戌"] },
  坤: { inner: ["乙未", "乙巳", "乙卯"], outer: ["癸丑", "癸亥", "癸酉"] },
  震: { inner: ["庚子", "庚寅", "庚辰"], outer: ["庚午", "庚申", "庚戌"] },
  巽: { inner: ["辛丑", "辛亥", "辛酉"], outer: ["辛未", "辛巳", "辛卯"] },
  坎: { inner: ["戊寅", "戊辰", "戊午"], outer: ["戊申", "戊戌", "戊子"] },
  离: { inner: ["己卯", "己丑", "己亥"], outer: ["己酉", "己未", "己巳"] },
  艮: { inner: ["丙辰", "丙午", "丙申"], outer: ["丙戌", "丙子", "丙寅"] },
  兑: { inner: ["丁巳", "丁卯", "丁丑"], outer: ["丁亥", "丁酉", "丁未"] }
};
const state = {
  question: "",
  datetime: "",
  lines: Array.from({ length: 6 }, () => ["head", "head", "head"]),
  chartResult: null
};

const editor = document.querySelector("#line-editor");
const statusEl = document.querySelector("#status");
const datetimeInput = document.querySelector("#datetime");
const questionInput = document.querySelector("#question");
const chartCard = document.querySelector("#chart-card");
const emptyState = document.querySelector("#empty-state");
const restoreNotice = document.querySelector("#restore-notice");
const copyBtn = document.querySelector("#copy-btn");
const imageBtn = document.querySelector("#image-btn");
const historyList = document.querySelector("#history-list");
const historyEmpty = document.querySelector("#history-empty");
const tabButtons = document.querySelectorAll(".tab-button");
const tabPanes = document.querySelectorAll(".tab-pane");
let audioCtx = null;

function playCoinSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  if (!audioCtx) audioCtx = new AudioContextClass();
  if (audioCtx.state === "suspended") audioCtx.resume();

  const now = audioCtx.currentTime;

  const playMarioNote = (frequency, startTime, duration) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = "square";
    osc.frequency.setValueAtTime(frequency, startTime);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(3400, startTime);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(0.14, startTime + 0.004);
    gain.gain.setValueAtTime(0.14, startTime + duration * 0.4);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  };

  // Super Mario Bros 吃金币：B5 短促 → E6 上扬
  playMarioNote(987.77, now, 0.05);
  playMarioNote(1318.51, now + 0.045, 0.17);
}

function init() {
  datetimeInput.value = toDatetimeLocal(new Date());
  renderEditor();
  renderHistory();
  tabButtons.forEach(button => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
  });
  document.querySelector("#cast-btn").addEventListener("click", castChart);
  document.querySelector("#reset-btn").addEventListener("click", resetAll);
  copyBtn.addEventListener("click", copyText);
  imageBtn.addEventListener("click", generateImage);
  document.querySelector("#close-preview").addEventListener("click", () => {
    document.querySelector("#image-preview").classList.add("hidden");
  });
}

function renderEditor() {
  editor.innerHTML = "";
  [...state.lines.keys()].reverse().forEach(lineIndex => {
    const coins = state.lines[lineIndex];
    const row = document.createElement("div");
    row.className = "line-row";

    const name = document.createElement("div");
    name.className = "line-name";
    name.textContent = lineNames[lineIndex];

    const group = document.createElement("div");
    group.className = "coin-group";
    coins.forEach((face, coinIndex) => {
      const button = document.createElement("button");
      button.className = "coin-button";
      button.type = "button";
      button.dataset.coin = `${lineIndex}-${coinIndex}`;
      button.setAttribute("aria-label", `${lineNames[lineIndex]}第${coinIndex + 1}枚${face === "head" ? "字面" : "背面"}`);

      const flip = document.createElement("div");
      flip.className = `coin-flip${face === "tail" ? " is-tail" : ""}`;

      const front = document.createElement("div");
      front.className = "coin-face coin-face-front";
      const frontImg = document.createElement("img");
      frontImg.src = "coin_head.png";
      frontImg.alt = "字";
      front.appendChild(frontImg);

      const back = document.createElement("div");
      back.className = "coin-face coin-face-back";
      const backImg = document.createElement("img");
      backImg.src = "coin_tail.png";
      backImg.alt = "背";
      back.appendChild(backImg);

      flip.append(front, back);
      button.appendChild(flip);
      button.addEventListener("click", () => {
        playCoinSound();
        const nextFace = state.lines[lineIndex][coinIndex] === "head" ? "tail" : "head";
        state.lines[lineIndex][coinIndex] = nextFace;
        flip.classList.toggle("is-tail", nextFace === "tail");
        button.setAttribute("aria-label", `${lineNames[lineIndex]}第${coinIndex + 1}枚${nextFace === "head" ? "字面" : "背面"}`);
        updateLineScore(lineIndex);
        setStatus("");
      });
      group.appendChild(button);
    });

    const score = document.createElement("div");
    score.className = "line-score";
    score.dataset.line = String(lineIndex);
    score.textContent = getLineScore(coins);

    row.append(name, group, score);
    editor.appendChild(row);
  });
}

function updateLineScore(lineIndex) {
  const scoreEl = document.querySelector(`.line-score[data-line="${lineIndex}"]`);
  if (scoreEl) scoreEl.textContent = getLineScore(state.lines[lineIndex]);
}

function castChart() {
  state.question = questionInput.value.trim();
  state.datetime = datetimeInput.value;
  if (!state.datetime) {
    setStatus("请先填写起卦时间。");
    return;
  }
  state.chartResult = buildChart(state);
  renderChart(state.chartResult);
  setRestoreNotice(false);
  copyBtn.disabled = false;
  imageBtn.disabled = false;
  const saved = saveHistoryRecord();
  setStatus(saved ? "排盘已生成。" : "排盘已生成，但历史记录保存失败。");
}

function loadHistoryRecords() {
  try {
    const raw = localStorage.getItem(historyStorageKey);
    if (!raw) return [];
    const records = JSON.parse(raw);
    return Array.isArray(records) ? records.filter(isHistoryRecord) : [];
  } catch {
    return [];
  }
}

function writeHistoryRecords(records) {
  localStorage.setItem(historyStorageKey, JSON.stringify(records));
}

function saveHistoryRecord() {
  if (!state.chartResult) return false;
  const record = {
    id: createHistoryId(),
    createdAt: new Date().toISOString(),
    question: state.question,
    datetime: state.datetime,
    lines: cloneJson(state.lines),
    chartResult: cloneJson(state.chartResult)
  };

  try {
    const records = loadHistoryRecords();
    writeHistoryRecords([record, ...records]);
    renderHistory();
    return true;
  } catch {
    return false;
  }
}

function renderHistory() {
  if (!historyList || !historyEmpty) return;
  const records = loadHistoryRecords();
  historyList.innerHTML = "";
  historyEmpty.classList.toggle("hidden", records.length > 0);

  records.forEach(record => {
    const item = document.createElement("button");
    item.className = "history-item";
    item.type = "button";
    item.addEventListener("click", () => restoreHistoryRecord(record));

    const title = document.createElement("strong");
    title.textContent = record.question || `${record.chartResult.baseHex.name} 之 ${record.chartResult.changedHex.name}`;

    const meta = document.createElement("span");
    meta.textContent = `${formatDateTime(record.datetime)} · ${formatDateTime(record.createdAt.slice(0, 16))}`;

    const summary = document.createElement("small");
    summary.textContent = `本卦 ${record.chartResult.baseHex.name}，变卦 ${record.chartResult.changedHex.name}`;

    item.append(title, meta, summary);
    historyList.appendChild(item);
  });
}

function restoreHistoryRecord(record) {
  state.question = record.question || "";
  state.datetime = record.datetime;
  state.lines = cloneJson(record.lines);
  state.chartResult = cloneJson(record.chartResult);
  questionInput.value = state.question;
  datetimeInput.value = state.datetime;
  renderEditor();
  renderChart(state.chartResult);
  setRestoreNotice(true);
  copyBtn.disabled = false;
  imageBtn.disabled = false;
  document.querySelector("#image-preview").classList.add("hidden");
  switchTab("chart");
  setStatus("");
}

function switchTab(tabName) {
  tabButtons.forEach(button => {
    const isActive = button.dataset.tab === tabName;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
  tabPanes.forEach(pane => {
    pane.classList.toggle("hidden", pane.id !== `${tabName}-tab`);
  });
}

function createHistoryId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function isHistoryRecord(record) {
  return Boolean(
    record &&
    record.id &&
    record.createdAt &&
    record.datetime &&
    Array.isArray(record.lines) &&
    record.chartResult &&
    record.chartResult.baseHex &&
    record.chartResult.changedHex
  );
}

function buildChart(input) {
  const scores = input.lines.map(getLineScore);
  const baseLines = scores.map(score => score === 7 || score === 9 ? 1 : 0);
  const changedLines = scores.map((score, index) => score === 6 || score === 9 ? 1 - baseLines[index] : baseLines[index]);
  const baseHex = getHex(baseLines);
  const changedHex = getHex(changedLines);
  const palace = getPalace(baseLines);
  const innerNaJia = naJia[baseHex.lower.name].inner;
  const outerNaJia = naJia[baseHex.upper.name].outer;
  const lineDetails = baseLines.map((line, index) => {
    const ganZhi = index < 3 ? innerNaJia[index] : outerNaJia[index - 3];
    const branch = ganZhi.slice(1);
    const relation = getSixRelation(palace.element, branchElements[branch]);
    return {
      position: lineNames[index],
      baseYang: line === 1,
      changedYang: changedLines[index] === 1,
      score: scores[index],
      moving: scores[index] === 6 || scores[index] === 9,
      relation,
      role: index + 1 === palace.shi ? "世" : index + 1 === palace.ying ? "应" : "",
      ganZhi,
      element: branchElements[branch]
    };
  });

  return {
    question: input.question,
    datetime: input.datetime,
    calendar: getGanZhi(new Date(input.datetime)),
    baseHex,
    changedHex,
    palace,
    movingLines: lineDetails.filter(item => item.moving).map(item => item.position),
    lines: lineDetails
  };
}

function getHex(lines) {
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

function getPalace(lines) {
  const target = lines.join("");
  for (const palaceName of palaceOrder) {
    const pureBits = trigramBitsByName[palaceName] + trigramBitsByName[palaceName];
    const sequence = buildPalaceSequence(pureBits);
    const match = sequence.find(item => item.bits === target);
    if (match) {
      return { ...match, name: palaceName, element: trigrams[trigramBitsByName[palaceName]].element };
    }
  }
  return { name: "乾", element: "金", shi: 6, ying: 3, stage: "本宫" };
}

function buildPalaceSequence(pureBits) {
  const stages = [
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
  return stages.map(step => {
    if (Array.isArray(step.flip)) {
      step.flip.forEach(index => bits[index] = 1 - bits[index]);
    } else if (Number.isInteger(step.flip)) {
      bits[step.flip] = 1 - bits[step.flip];
    }
    return { bits: bits.join(""), stage: step.stage, shi: step.shi, ying: step.ying };
  });
}

function getLineScore(coins) {
  return coins.reduce((sum, face) => sum + (face === "head" ? 2 : 3), 0);
}

function getSixRelation(palaceElement, lineElement) {
  if (palaceElement === lineElement) return "兄弟";
  if (elementGenerates[palaceElement] === lineElement) return "子孙";
  if (elementGenerates[lineElement] === palaceElement) return "父母";
  if (elementControls[lineElement] === palaceElement) return "官鬼";
  if (elementControls[palaceElement] === lineElement) return "妻财";
  return "";
}

function getGanZhi(date) {
  const solarYear = getSolarYear(date);
  const yearIndex = cycleIndex(solarYear - 1984);
  const month = getSolarMonth(date);
  const monthBranchIndex = (2 + month.index) % 12;
  const firstMonthStemByYearStem = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0];
  const monthStemIndex = (firstMonthStemByYearStem[yearIndex % 10] + month.index) % 10;
  const dayIndex = getDayCycleIndex(date);
  const hourBranchIndex = Math.floor(((date.getHours() + 1) % 24) / 2);
  const hourStemIndex = ((dayIndex % 10) % 5 * 2 + hourBranchIndex) % 10;
  return {
    year: stems[yearIndex % 10] + branches[yearIndex % 12],
    month: stems[monthStemIndex] + branches[monthBranchIndex],
    day: stems[dayIndex % 10] + branches[dayIndex % 12],
    hour: stems[hourStemIndex] + branches[hourBranchIndex],
    note: month.approx ? "月柱按近似节气划分" : ""
  };
}

function getSolarYear(date) {
  const boundary = new Date(date.getFullYear(), 1, 4, 0, 0, 0);
  return date >= boundary ? date.getFullYear() : date.getFullYear() - 1;
}

function getSolarMonth(date) {
  const y = date.getFullYear();
  const boundaries = [
    [1, 4], [2, 6], [3, 5], [4, 6], [5, 6], [6, 7],
    [7, 8], [8, 8], [9, 8], [10, 7], [11, 7], [0, 6]
  ].map(([month, day], index) => ({ index, date: new Date(y, month, day) }));
  let monthIndex = 11;
  for (const item of boundaries) {
    if (date >= item.date) monthIndex = item.index;
  }
  return { index: monthIndex, approx: true };
}

function getDayCycleIndex(date) {
  const base = Date.UTC(2000, 0, 1);
  const current = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const days = Math.floor((current - base) / 86400000);
  return cycleIndex(days + 4);
}

function cycleIndex(value) {
  return ((value % 60) + 60) % 60;
}

function renderChart(result) {
  emptyState.classList.add("hidden");
  chartCard.classList.remove("hidden");
  document.querySelector("#hex-title").textContent = result.question || `${result.baseHex.name} 之 ${result.changedHex.name}`;
  document.querySelector("#date-pill").textContent = formatDateTime(result.datetime);
  document.querySelector("#base-hex").textContent = `${result.baseHex.name} ${result.baseHex.symbol}`;
  document.querySelector("#changed-hex").textContent = `${result.changedHex.name} ${result.changedHex.symbol}`;
  document.querySelector("#moving-lines").textContent = result.movingLines.length ? result.movingLines.join("、") : "无";
  document.querySelector("#ganzhi").textContent = `${result.calendar.year}年 ${result.calendar.month}月 ${result.calendar.day}日 ${result.calendar.hour}时`;

  const body = document.querySelector("#chart-body");
  body.innerHTML = "";
  result.lines.slice().reverse().forEach(line => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${line.position}${line.moving ? '<span class="moving-badge">动</span>' : ""}</td>
      <td>${yaoHtml(line.baseYang)} ${line.score}</td>
      <td>${yaoHtml(line.changedYang)}</td>
      <td>${line.relation}</td>
      <td>${line.role}</td>
      <td>${line.ganZhi} ${line.element}</td>
    `;
    body.appendChild(tr);
  });
}

function yaoHtml(isYang) {
  return `<span class="yao-mark"><span class="${isYang ? "solid-line" : "broken-line"}"></span></span>`;
}

function buildText(result) {
  const rows = result.lines.slice().reverse().map(line => {
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
  ].filter(Boolean).join("\n");
}

async function copyText() {
  if (!state.chartResult) return;
  const text = buildText(state.chartResult);
  try {
    await navigator.clipboard.writeText(text);
    setStatus("排盘文本已复制。");
  } catch {
    setStatus("当前浏览器不允许直接复制，可生成图片或手动选择结果。");
  }
}

async function generateImage() {
  if (!state.chartResult) return;
  await ensureFontLoaded();
  const canvas = document.createElement("canvas");
  const scale = Math.max(2, Math.ceil(window.devicePixelRatio || 1));
  const width = 1080;
  const lineHeight = 64;
  const bottomPadding = 64;
  const height = 406 + state.chartResult.lines.length * lineHeight + bottomPadding;
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);
  drawExport(ctx, state.chartResult, width, height, lineHeight);
  const url = canvas.toDataURL("image/png");
  document.querySelector("#export-image").src = url;
  document.querySelector("#download-link").href = url;
  document.querySelector("#image-preview").classList.remove("hidden");
  setStatus("图片已生成。");
}

function drawExport(ctx, result, width, height, lineHeight) {
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
  wrapText(ctx, `时间：${formatDateTime(result.datetime)}    干支：${result.calendar.year}年 ${result.calendar.month}月 ${result.calendar.day}日 ${result.calendar.hour}时`, 54, 166, 960, 32);

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
  ["爻位", "本卦", "变卦", "六亲", "世应", "纳甲"].forEach((label, i) => ctx.fillText(label, cols[i] + 16, top + 31));

  ctx.font = `22px ${serifFont}`;
  result.lines.slice().reverse().forEach((line, i) => {
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

function drawYao(ctx, isYang, x, y) {
  ctx.fillStyle = "#1e2329";
  if (isYang) {
    roundRect(ctx, x, y, 70, 9, 5, true, false);
  } else {
    roundRect(ctx, x, y, 30, 9, 5, true, false);
    roundRect(ctx, x + 40, y, 30, 9, 5, true, false);
  }
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  let line = "";
  Array.from(text).forEach(char => {
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

function resetAll() {
  state.lines = Array.from({ length: 6 }, () => ["head", "head", "head"]);
  state.chartResult = null;
  questionInput.value = "";
  datetimeInput.value = toDatetimeLocal(new Date());
  chartCard.classList.add("hidden");
  emptyState.classList.remove("hidden");
  setRestoreNotice(false);
  copyBtn.disabled = true;
  imageBtn.disabled = true;
  document.querySelector("#image-preview").classList.add("hidden");
  renderEditor();
  setStatus("已重置。");
}

function toDatetimeLocal(date) {
  const pad = value => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDateTime(value) {
  return value.replace("T", " ");
}

function setStatus(message) {
  statusEl.textContent = message;
}

function setRestoreNotice(isRestored) {
  if (restoreNotice) {
    restoreNotice.classList.toggle("hidden", !isRestored);
  }
}

async function ensureFontLoaded() {
  await Promise.all([
    document.fonts.load(`400 22px ${serifFont}`),
    document.fonts.load(`700 30px ${serifFont}`),
    document.fonts.load(`900 34px ${serifFont}`)
  ]);
  await document.fonts.ready;
}

init();
