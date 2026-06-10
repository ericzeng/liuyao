import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import DownloadIcon from "@mui/icons-material/Download";
import HistoryIcon from "@mui/icons-material/History";
import ImageIcon from "@mui/icons-material/Image";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import RestoreIcon from "@mui/icons-material/Restore";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Card,
  Chip,
  Divider,
  Drawer,
  Modal,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import type { AlertColor } from "@mui/material/Alert";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildChart,
  buildText,
  clearHistoryRecords,
  cloneLines,
  createDefaultLines,
  deleteHistoryRecord,
  filterHistoryRecords,
  formatDateTime,
  formatDatetimeLocal,
  generateChartImage,
  getLineScore,
  parseDatetimeLocal,
  lineNames,
  loadHistoryRecords,
  saveHistoryRecord,
  toDatetimeLocal,
  toggleCoinFace,
  type ChartResult,
  type CoinLines,
  type HistoryRecord,
} from "./lib/liuyao";

function App() {
  const [question, setQuestion] = useState("");
  const [datetime, setDatetime] = useState(() => toDatetimeLocal(new Date()));
  const [lines, setLines] = useState<CoinLines>(() => createDefaultLines());
  const [chartResult, setChartResult] = useState<ChartResult | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [historyQuery, setHistoryQuery] = useState("");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: "", severity: "success" });
  const [isRestored, setIsRestored] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageOpened, setImageOpened] = useState(false);
  const [resultOpened, setResultOpened] = useState(false);
  const [activeTab, setActiveTab] = useState("chart");
  const isMobile = useMediaQuery("(max-width: 900px)");
  const audioRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    setHistory(loadHistoryRecords());
  }, []);

  const filteredHistory = useMemo(
    () => filterHistoryRecords(history, historyQuery),
    [history, historyQuery],
  );

  const showStatus = (message: string) => {
    if (!message) {
      setSnackbar((current) => ({ ...current, open: false }));
      return;
    }

    const severity: AlertColor =
      message.includes("请先") ||
      (message.includes("失败") && !message.includes("保存失败"))
        ? "error"
        : message.includes("保存失败") || message.includes("不允许")
          ? "warning"
          : "success";

    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar((current) => ({ ...current, open: false }));
  };

  const playCoinSound = () => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const audioContext = audioRef.current ?? new AudioContextClass();
    audioRef.current = audioContext;
    if (audioContext.state === "suspended") void audioContext.resume();

    const playNote = (
      frequency: number,
      startTime: number,
      duration: number,
    ) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();

      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(frequency, startTime);
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(3400, startTime);
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(0.14, startTime + 0.004);
      gain.gain.setValueAtTime(0.14, startTime + duration * 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(startTime);
      oscillator.stop(startTime + duration + 0.02);
    };

    const now = audioContext.currentTime;
    playNote(987.77, now, 0.05);
    playNote(1318.51, now + 0.045, 0.17);
  };

  const handleCoinToggle = (lineIndex: number, coinIndex: number) => {
    playCoinSound();
    setLines((current) => toggleCoinFace(current, lineIndex, coinIndex));
    showStatus("");
  };

  const handleCast = () => {
    const input = {
      question: question.trim(),
      datetime,
      lines,
    };

    if (!input.datetime) {
      showStatus("请先填写起卦时间。");
      return;
    }

    const result = buildChart(input);
    setChartResult(result);
    setIsRestored(false);
    const saved = saveHistoryRecord(input, result);
    setHistory(loadHistoryRecords());
    showStatus(
      saved ? "排盘已生成。" : "排盘已生成，但历史记录保存失败。",
    );
    if (isMobile) setResultOpened(true);
  };

  const handleReset = () => {
    setQuestion("");
    setDatetime(toDatetimeLocal(new Date()));
    setLines(createDefaultLines());
    setChartResult(null);
    setIsRestored(false);
    setImageUrl(null);
    setImageOpened(false);
    setResultOpened(false);
    showStatus("已重置。");
  };

  const handleCopy = async () => {
    if (!chartResult) return;

    try {
      await navigator.clipboard.writeText(buildText(chartResult));
      showStatus("排盘文本已复制。");
    } catch {
      showStatus("当前浏览器不允许直接复制，可生成图片或手动选择结果。");
    }
  };

  const handleImage = async () => {
    if (!chartResult) return;

    try {
      const url = await generateChartImage(chartResult);
      setImageUrl(url);
      setImageOpened(true);
      showStatus("图片已生成。");
    } catch (error) {
      showStatus(error instanceof Error ? error.message : "图片生成失败。");
    }
  };

  const handleRestore = (record: HistoryRecord) => {
    setQuestion(record.question || "");
    setDatetime(record.datetime);
    setLines(cloneLines(record.lines));
    setChartResult(record.chartResult);
    setIsRestored(true);
    setImageUrl(null);
    setImageOpened(false);
    showStatus("");
    if (isMobile) setResultOpened(true);
  };

  const handleDeleteHistory = (id: string) => {
    setHistory(deleteHistoryRecord(id));
    showStatus("历史记录已删除。");
  };

  const handleClearHistory = () => {
    clearHistoryRecords();
    setHistory([]);
    showStatus("历史记录已清空。");
  };

  return (
    <Box className="app-root">
      <main className="shell">
        <Stack className="app-frame" spacing={0}>
          <Box className="workspace-grid">
            <Paper
              className="glass-panel control-panel"
              sx={{ borderRadius: 0, p: { xs: 2, sm: 3 }, height: "100%" }}
            >
              <Stack className="control-panel-content" spacing={2}>
                <Stack spacing={0.5} className="app-title-wrap">
                  <Typography variant="h1">六爻排盘</Typography>
                  <Typography variant="body2" color="text.secondary">
                    点币起卦、即时排盘、历史管理、文本与图片导出。
                  </Typography>
                </Stack>

                <Box className="workspace-tabs">
                  <Tabs
                    value={activeTab}
                    onChange={(_, value: string) => setActiveTab(value)}
                    variant="fullWidth"
                  >
                    <Tab
                      value="chart"
                      label="六爻排盘"
                      icon={<AutoAwesomeIcon sx={{ fontSize: 18 }} />}
                      iconPosition="start"
                    />
                    <Tab
                      value="history"
                      label="历史记录"
                      icon={<HistoryIcon sx={{ fontSize: 18 }} />}
                      iconPosition="start"
                    />
                  </Tabs>

                  {activeTab === "chart" ? (
                    <Box className="workspace-tab-panel" sx={{ pt: 2 }}>
                      <Stack spacing={2.5}>
                        <Stack spacing={1.5}>
                          <TextField
                            fullWidth
                            label="占事"
                            multiline
                            minRows={2}
                            maxRows={5}
                            placeholder="例如：近期合作是否顺利"
                            value={question}
                            onChange={(event) =>
                              setQuestion(event.currentTarget.value)
                            }
                          />
                          <DateTimePicker
                            label="起卦时间"
                            value={parseDatetimeLocal(datetime)}
                            onChange={(value) =>
                              setDatetime(formatDatetimeLocal(value))
                            }
                            ampm={false}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                              },
                            }}
                          />
                        </Stack>

                        <CoinBoard lines={lines} onToggle={handleCoinToggle} />

                        <Box className="action-button-grid">
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleCast}
                            startIcon={<AutoAwesomeIcon />}
                          >
                            生成排盘
                          </Button>
                          <Button
                            variant="outlined"
                            color="inherit"
                            onClick={handleReset}
                            startIcon={<RestartAltIcon />}
                          >
                            重置
                          </Button>
                        </Box>
                      </Stack>
                    </Box>
                  ) : null}

                  {activeTab === "history" ? (
                    <Box className="workspace-tab-panel" sx={{ pt: 2 }}>
                      <HistoryPanel
                        records={filteredHistory}
                        total={history.length}
                        query={historyQuery}
                        onQueryChange={setHistoryQuery}
                        onRestore={handleRestore}
                        onDelete={handleDeleteHistory}
                        onClear={handleClearHistory}
                      />
                    </Box>
                  ) : null}
                </Box>
              </Stack>
            </Paper>

            <Box sx={{ display: { xs: "none", md: "block" }, height: "100%", minHeight: 0 }}>
              <ResultPanel
                result={chartResult}
                isRestored={isRestored}
                onCopy={handleCopy}
                onImage={handleImage}
              />
            </Box>
          </Box>
        </Stack>
      </main>

      <Box className="mobile-action-bar" hidden={!chartResult}>
        <Stack direction="row" spacing={1}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => setResultOpened(true)}
            startIcon={<VisibilityIcon />}
            sx={{ flex: 2 }}
          >
            查看排盘结果
          </Button>
          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            onClick={handleCopy}
            startIcon={<ContentCopyIcon />}
            sx={{ flex: 1 }}
          >
            复制
          </Button>
          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            onClick={handleImage}
            startIcon={<ImageIcon />}
            sx={{ flex: 1 }}
          >
            图片
          </Button>
        </Stack>
      </Box>

      <Drawer
        open={resultOpened}
        onClose={() => setResultOpened(false)}
        anchor="bottom"
        slotProps={{
          paper: {
            sx: {
              height: "88%",
              p: 2,
              pt: 1.5,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              boxShadow: "0 -8px 40px rgba(30,35,41,0.14)",
            },
          },
        }}
      >
        <Stack spacing={2} sx={{ height: "100%", minHeight: 0 }}>
          <Box sx={{ display: "flex", justifyContent: "center", pb: 0.5 }}>
            <Box
              sx={{
                width: 36,
                height: 4,
                borderRadius: 999,
                background: "rgba(30,35,41,0.14)",
              }}
            />
          </Box>
          <ResultPanel
            result={chartResult}
            isRestored={isRestored}
            onCopy={handleCopy}
            onImage={handleImage}
          />
        </Stack>
      </Drawer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={(_, reason) => {
          if (reason === "clickaway") return;
          closeSnackbar();
        }}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          role="status"
          aria-live="polite"
          onClose={closeSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Modal open={imageOpened} onClose={() => setImageOpened(false)}>
        <Paper
          className="image-modal"
          sx={{
            p: 3,
            borderRadius: "20px",
            boxShadow: "0 24px 80px rgba(30,35,41,0.22)",
            border: "1px solid rgba(143, 49, 46, 0.10)",
          }}
        >
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="h2">导出图片</Typography>
              <Button
                size="small"
                variant="text"
                color="inherit"
                onClick={() => setImageOpened(false)}
                startIcon={<CloseIcon />}
                sx={{ minWidth: 0, color: "text.secondary" }}
              >
                关闭
              </Button>
            </Stack>
            {imageUrl ? (
              <>
                <Box
                  component="img"
                  src={imageUrl}
                  alt="六爻排盘导出图"
                  sx={{
                    width: "100%",
                    borderRadius: "12px",
                    boxShadow: "0 4px 20px rgba(30,35,41,0.12)",
                    border: "1px solid rgba(143, 49, 46, 0.10)",
                  }}
                />
                <Button
                  component="a"
                  variant="contained"
                  color="primary"
                  href={imageUrl}
                  download="liuyao-chart.png"
                  startIcon={<DownloadIcon />}
                  fullWidth
                >
                  下载图片
                </Button>
              </>
            ) : (
              <Typography color="text.secondary">暂无图片。</Typography>
            )}
          </Stack>
        </Paper>
      </Modal>
    </Box>
  );
}

function CoinBoard({
  lines,
  onToggle,
}: {
  lines: CoinLines;
  onToggle: (lineIndex: number, coinIndex: number) => void;
}) {
  return (
    <Stack spacing={1.5}>
      <Stack spacing={0.5} className="coin-board-header">
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography variant="h2" sx={{ flexShrink: 0 }}>
            逐爻点币
          </Typography>
          <Box className="coin-legend-pill">
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              字阴
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 900, color: "rgba(30,35,41,0.4)" }}>
              ·
            </Typography>
            <Typography variant="caption" color="primary.dark" sx={{ fontWeight: 700 }}>
              2
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 900, color: "rgba(30,35,41,0.3)" }}>
              /
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              背阳
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 900, color: "rgba(30,35,41,0.4)" }}>
              ·
            </Typography>
            <Typography variant="caption" color="primary.dark" sx={{ fontWeight: 700 }}>
              3
            </Typography>
          </Box>
        </Stack>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: { xs: "0.78rem", sm: "0.875rem" }, lineHeight: 1.55 }}
        >
          从初爻开始，每爻三枚铜钱。点击铜钱切换字面/背面。
        </Typography>
      </Stack>

      <Box
        sx={{
          borderRadius: "12px",
          border: "1px solid rgba(143, 49, 46, 0.10)",
          overflow: "hidden",
          background: "rgba(255, 253, 248, 0.60)",
        }}
      >
        {lines
          .map((coins, lineIndex) => ({ coins, lineIndex }))
          .reverse()
          .map(({ coins, lineIndex }, idx, arr) => (
            <Stack
              key={lineIndex}
              direction="row"
              spacing={1}
              sx={{
                alignItems: "center",
                flexWrap: "nowrap",
                justifyContent: "space-between",
                px: 1.5,
                py: 1,
                borderBottom: idx < arr.length - 1
                  ? "1px solid rgba(143, 49, 46, 0.07)"
                  : "none",
                transition: "background 0.16s ease",
                "&:hover": {
                  background: "rgba(143, 49, 46, 0.04)",
                },
              }}
            >
              <Typography
                sx={{
                  width: 46,
                  fontWeight: 900,
                  fontSize: "0.88rem",
                  color: "text.primary",
                  flexShrink: 0,
                }}
              >
                {lineNames[lineIndex]}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "nowrap" }}>
                {coins.map((face, coinIndex) => (
                  <ButtonBase
                    key={`${lineIndex}-${coinIndex}`}
                    className="coin-button"
                    disableRipple
                    sx={{ display: "grid", flexShrink: 0 }}
                    aria-label={`${lineNames[lineIndex]}第${coinIndex + 1}枚${face === "head" ? "字面" : "背面"}`}
                    onClick={() => onToggle(lineIndex, coinIndex)}
                  >
                    <span
                      className={`coin-flip${face === "tail" ? " is-tail" : ""}`}
                    >
                      <span className="coin-face coin-face-front">
                        <img src="/coin_head.png" alt="字" />
                      </span>
                      <span className="coin-face coin-face-back">
                        <img src="/coin_tail.png" alt="背" />
                      </span>
                    </span>
                  </ButtonBase>
                ))}
              </Stack>
              <Box
                sx={{
                  minWidth: 44,
                  textAlign: "center",
                  flexShrink: 0,
                }}
              >
                <Typography
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "rgba(45, 104, 83, 0.10)",
                    color: "secondary.dark",
                    fontWeight: 900,
                    fontSize: "0.92rem",
                  }}
                >
                  {getLineScore(coins)}
                </Typography>
              </Box>
            </Stack>
          ))}
      </Box>
    </Stack>
  );
}

function ResultPanel({
  result,
  isRestored,
  onCopy,
  onImage,
}: {
  result: ChartResult | null;
  isRestored: boolean;
  onCopy: () => void;
  onImage: () => void;
}) {
  if (!result) {
    return (
      <Paper
        className="glass-panel result-panel"
        sx={{ borderRadius: 0, p: 4, minHeight: 420, height: "100%" }}
      >
        <Stack
          spacing={2.5}
          sx={{
            alignItems: "center",
            height: 360,
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(143,49,46,0.10), rgba(45,104,83,0.08))",
              border: "1.5px solid rgba(143, 49, 46, 0.14)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
            }}
          >
            ☯
          </Box>
          <Stack spacing={1} sx={{ alignItems: "center" }}>
            <Chip color="secondary" label="等待起卦" />
            <Typography variant="h2">排盘结果会显示在这里</Typography>
          </Stack>
          <Typography color="text.secondary" sx={{ maxWidth: 380, fontSize: "0.88rem", lineHeight: 1.7 }}>
            完成六爻铜钱输入后点击生成排盘，系统会即时计算本卦、变卦、动爻、干支、六亲与世应。
          </Typography>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper
      className="glass-panel result-panel"
      sx={{ borderRadius: 0, p: { xs: 2, sm: 3 }, height: "100%" }}
    >
      <Stack spacing={2}>
        {isRestored ? (
          <Alert severity="warning">
            以下是从历史中恢复的排盘，如需重排请先点击「重置」。
          </Alert>
        ) : null}

        <Box
          sx={{
            borderRadius: "12px",
            p: { xs: 1.75, sm: 2.25 },
            background:
              "linear-gradient(135deg, rgba(255, 253, 248, 0.95), rgba(247, 244, 237, 0.85))",
            border: "1px solid rgba(143, 49, 46, 0.10)",
            boxShadow: "0 2px 8px rgba(30, 35, 41, 0.04)",
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: "0.98rem", sm: "1.08rem" },
              lineHeight: 1.6,
              fontWeight: 800,
              wordBreak: "break-word",
            }}
          >
            {result.question ||
              `${result.baseHex.name} 之 ${result.changedHex.name}`}
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.25}
            sx={{
              alignItems: { xs: "stretch", sm: "center" },
              justifyContent: "space-between",
              pt: 1.5,
              mt: 1.25,
              borderTop: "1px solid rgba(143, 49, 46, 0.08)",
            }}
          >
            <Typography color="text.secondary" sx={{ fontSize: "0.82rem" }}>
              起卦 {formatDateTime(result.datetime)}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={onCopy}
                startIcon={<ContentCopyIcon />}
              >
                复制排盘
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="secondary"
                onClick={onImage}
                startIcon={<DownloadIcon />}
              >
                下载图片
              </Button>
            </Stack>
          </Stack>
        </Box>

        <Box className="summary-grid">
          <SummaryCard
            label="本卦"
            value={`${result.baseHex.name} ${result.baseHex.symbol}`}
          />
          <SummaryCard
            label="变卦"
            value={`${result.changedHex.name} ${result.changedHex.symbol}`}
          />
          <SummaryCard
            label="动爻"
            value={
              result.movingLines.length ? result.movingLines.join("、") : "无"
            }
          />
          <SummaryCard
            label="干支"
            value={`${result.calendar.year}年 ${result.calendar.month}月 ${result.calendar.day}日 ${result.calendar.hour}时`}
          />
        </Box>

        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          <Chip color="primary" label={`${result.palace.name}宫`} />
          <Chip color="secondary" label={result.palace.stage} />
          {result.calendar.note ? (
            <Chip color="default" label={result.calendar.note} />
          ) : null}
        </Stack>

        <TableContainer className="result-table-scroll">
          <Table
            size="small"
            sx={{
              minWidth: 680,
              "& .MuiTableRow-body:last-child .MuiTableCell-root": {
                borderBottom: 0,
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>爻位</TableCell>
                <TableCell>本卦</TableCell>
                <TableCell>变卦</TableCell>
                <TableCell>六亲</TableCell>
                <TableCell>世应</TableCell>
                <TableCell>纳甲</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {result.lines
                .slice()
                .reverse()
                .map((line) => (
                  <TableRow
                    key={line.position}
                    hover
                    sx={
                      line.moving
                        ? {
                            background: "rgba(143, 49, 46, 0.04) !important",
                          }
                        : undefined
                    }
                  >
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={0.75}
                        sx={{ alignItems: "center", flexWrap: "nowrap" }}
                      >
                        <Typography sx={{ fontWeight: 900, fontSize: "0.88rem" }}>
                          {line.position}
                        </Typography>
                        {line.moving ? (
                          <Chip size="small" color="primary" label="动" />
                        ) : null}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: "center", flexWrap: "nowrap" }}
                      >
                        <YaoMark isYang={line.baseYang} isMoving={line.moving} />
                        <Typography sx={{ fontSize: "0.82rem", color: "text.secondary" }}>
                          {line.score}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <YaoMark isYang={line.changedYang} isMoving={false} />
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700, fontSize: "0.88rem" }}>
                        {line.relation}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {line.role ? (
                        <Chip
                          size="small"
                          variant="outlined"
                          label={line.role}
                          color={line.role === "世" ? "primary" : "secondary"}
                        />
                      ) : (
                        <Typography sx={{ color: "text.secondary", fontSize: "0.82rem" }}>—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: "0.88rem" }}>
                        {line.ganZhi}{" "}
                        <Box
                          component="span"
                          sx={{
                            color: "text.secondary",
                            fontSize: "0.78rem",
                          }}
                        >
                          {line.element}
                        </Box>
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Paper>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Box className="summary-card">
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontWeight: 700, display: "block", mb: 0.25 }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 900, fontSize: "0.95rem", lineHeight: 1.4 }}>{value}</Typography>
    </Box>
  );
}

function YaoMark({ isYang, isMoving = false }: { isYang: boolean; isMoving?: boolean }) {
  return (
    <span
      className={`yao-mark${isMoving ? " is-moving" : ""}`}
      aria-label={isYang ? "阳爻" : "阴爻"}
    >
      <span className={isYang ? "solid-line" : "broken-line"} />
    </span>
  );
}

function HistoryPanel({
  records,
  total,
  query,
  onQueryChange,
  onRestore,
  onDelete,
  onClear,
}: {
  records: HistoryRecord[];
  total: number;
  query: string;
  onQueryChange: (value: string) => void;
  onRestore: (record: HistoryRecord) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}) {
  return (
    <Stack className="history-panel" spacing={2}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: "center", justifyContent: "space-between" }}
      >
        <Stack spacing={0}>
          <Typography variant="h2">历史记录</Typography>
          <Typography variant="body2" color="text.secondary">
            保存在本机浏览器，兼容旧版记录。
          </Typography>
        </Stack>
        <Button
          variant="text"
          color="error"
          disabled={!total}
          onClick={onClear}
          startIcon={<DeleteSweepIcon />}
        >
          清空
        </Button>
      </Stack>

      <TextField
        fullWidth
        label="搜索历史"
        placeholder="输入占事、卦名或日期"
        value={query}
        onChange={(event) => onQueryChange(event.currentTarget.value)}
      />

      <Divider />

      {!total ? (
        <Box
          sx={{
            borderRadius: "12px",
            p: 4,
            textAlign: "center",
            border: "1px dashed rgba(143, 49, 46, 0.18)",
            background: "rgba(143, 49, 46, 0.025)",
          }}
        >
          <Typography sx={{ fontSize: "28px", mb: 1, opacity: 0.4 }}>📜</Typography>
          <Typography color="text.secondary" sx={{ fontSize: "0.88rem" }}>
            生成排盘后会记录在这里。
          </Typography>
        </Box>
      ) : records.length ? (
        <Stack className="history-list" spacing={1.5}>
          {records.map((record) => {
            const title =
              record.question ||
              `${record.chartResult.baseHex.name} 之 ${record.chartResult.changedHex.name}`;
            return (
              <Card key={record.id} variant="outlined">
                <Stack spacing={1.25} sx={{ p: 2 }}>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                    }}
                  >
                    <Stack spacing={0.4} sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 900,
                          fontSize: "0.95rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.78rem" }}>
                        起卦 {formatDateTime(record.datetime)}
                      </Typography>
                      <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", alignItems: "center" }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.78rem" }}>
                          {record.chartResult.baseHex.name} {record.chartResult.baseHex.symbol}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.disabled", fontSize: "0.76rem" }}>→</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.78rem" }}>
                          {record.chartResult.changedHex.name} {record.chartResult.changedHex.symbol}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Chip
                      label={`${record.chartResult.palace.name}宫`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ flexShrink: 0 }}
                    />
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ pt: 0.25, borderTop: "1px solid rgba(143,49,46,0.06)" }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={() => onRestore(record)}
                      startIcon={<RestoreIcon />}
                      sx={{ flex: 1 }}
                    >
                      恢复
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => onDelete(record.id)}
                      startIcon={<DeleteIcon />}
                      sx={{
                        borderColor: "rgba(211, 47, 47, 0.3)",
                        "&:hover": { borderColor: "error.main", background: "rgba(211,47,47,0.04)" },
                      }}
                    >
                      删除
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            );
          })}
        </Stack>
      ) : (
        <Box
          sx={{
            borderRadius: "12px",
            p: 4,
            textAlign: "center",
            border: "1px dashed rgba(143, 49, 46, 0.18)",
            background: "rgba(143, 49, 46, 0.025)",
          }}
        >
          <Typography color="text.secondary" sx={{ fontSize: "0.88rem" }}>
            没有匹配的历史记录。
          </Typography>
        </Box>
      )}
    </Stack>
  );
}

export default App;
