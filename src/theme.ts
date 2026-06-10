import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#8f312e",
      light: "#d26a5f",
      dark: "#662321",
      contrastText: "#fffdf8",
    },
    secondary: {
      main: "#2d6853",
      light: "#5bb390",
      dark: "#183d30",
      contrastText: "#fffdf8",
    },
    background: {
      default: "#f7f4ed",
      paper: "#fffdf8",
    },
    text: {
      primary: "#1e2329",
      secondary: "rgba(30, 35, 41, 0.62)",
    },
    divider: "rgba(143, 49, 46, 0.10)",
  },
  typography: {
    fontFamily: '"Noto Serif SC", "Source Han Serif SC", "Songti SC", serif',
    h1: {
      fontSize: "clamp(1.9rem, 4.5vw, 3rem)",
      fontWeight: 900,
      lineHeight: 1.12,
      letterSpacing: "-0.01em",
    },
    h2: {
      fontSize: "1.28rem",
      fontWeight: 900,
      lineHeight: 1.28,
      letterSpacing: "0.01em",
    },
    body1: {
      lineHeight: 1.7,
    },
    body2: {
      lineHeight: 1.6,
    },
    caption: {
      lineHeight: 1.5,
      letterSpacing: "0.02em",
    },
    button: {
      fontWeight: 700,
      textTransform: "none",
      letterSpacing: "0.01em",
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    "none",
    "0 1px 4px rgba(30, 35, 41, 0.07)",
    "0 3px 10px rgba(30, 35, 41, 0.08)",
    "0 6px 18px rgba(30, 35, 41, 0.09)",
    "0 10px 28px rgba(30, 35, 41, 0.10)",
    "0 14px 38px rgba(30, 35, 41, 0.11)",
    "0 18px 46px rgba(30, 35, 41, 0.12)",
    "0 20px 50px rgba(30, 35, 41, 0.13)",
    "0 22px 54px rgba(30, 35, 41, 0.14)",
    "0 24px 58px rgba(30, 35, 41, 0.15)",
    "0 26px 62px rgba(30, 35, 41, 0.16)",
    "0 28px 66px rgba(30, 35, 41, 0.17)",
    "0 30px 70px rgba(30, 35, 41, 0.18)",
    "0 32px 74px rgba(30, 35, 41, 0.19)",
    "0 34px 78px rgba(30, 35, 41, 0.20)",
    "0 36px 82px rgba(30, 35, 41, 0.21)",
    "0 38px 86px rgba(30, 35, 41, 0.22)",
    "0 40px 90px rgba(30, 35, 41, 0.23)",
    "0 42px 94px rgba(30, 35, 41, 0.24)",
    "0 44px 98px rgba(30, 35, 41, 0.25)",
    "0 46px 102px rgba(30, 35, 41, 0.26)",
    "0 48px 106px rgba(30, 35, 41, 0.27)",
    "0 50px 110px rgba(30, 35, 41, 0.28)",
    "0 52px 114px rgba(30, 35, 41, 0.29)",
    "0 54px 118px rgba(30, 35, 41, 0.30)",
  ],
  components: {
    MuiButton: {
      defaultProps: {
        variant: "contained",
      },
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "7px 18px",
          transition: "all 0.18s ease",
          "&:hover": {
            transform: "translateY(-1px)",
          },
          "&:active": {
            transform: "translateY(0)",
          },
        },
        sizeSmall: {
          padding: "4px 12px",
          fontSize: "0.82rem",
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #a33a37, #8f312e)",
          boxShadow: "0 2px 8px rgba(143, 49, 46, 0.30)",
          "&:hover": {
            background: "linear-gradient(135deg, #b44441, #9a3533)",
            boxShadow: "0 4px 14px rgba(143, 49, 46, 0.38)",
          },
        },
        containedSecondary: {
          background: "linear-gradient(135deg, #358060, #2d6853)",
          boxShadow: "0 2px 8px rgba(45, 104, 83, 0.28)",
          "&:hover": {
            background: "linear-gradient(135deg, #3d9070, #358060)",
            boxShadow: "0 4px 14px rgba(45, 104, 83, 0.36)",
          },
        },
        outlinedInherit: {
          borderColor: "rgba(30, 35, 41, 0.22)",
          "&:hover": {
            borderColor: "rgba(30, 35, 41, 0.40)",
            background: "rgba(30, 35, 41, 0.04)",
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          background: "rgba(255, 253, 248, 0.8)",
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(143, 49, 46, 0.35)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#8f312e",
            borderWidth: 1.5,
          },
        },
        notchedOutline: {
          borderColor: "rgba(143, 49, 46, 0.18)",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          "&.Mui-focused": {
            color: "#8f312e",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: "rgba(255, 253, 248, 0.80)",
          backgroundImage: "none",
          border: "1px solid rgba(143, 49, 46, 0.09)",
          transition: "box-shadow 0.2s ease, transform 0.2s ease",
          "&:hover": {
            boxShadow: "0 4px 20px rgba(30, 35, 41, 0.09)",
            transform: "translateY(-1px)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 900,
          background: "rgba(143, 49, 46, 0.04)",
          borderBottom: "1px solid rgba(143, 49, 46, 0.12) !important",
          color: "#662321",
          fontSize: "0.82rem",
          letterSpacing: "0.03em",
        },
        body: {
          fontSize: "0.88rem",
          borderBottom: "1px solid rgba(216, 221, 217, 0.40)",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: "background 0.15s ease",
          "&.MuiTableRow-hover:hover": {
            background: "rgba(143, 49, 46, 0.035)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          fontSize: "0.78rem",
          height: 26,
          letterSpacing: "0.01em",
        },
        colorPrimary: {
          background: "rgba(143, 49, 46, 0.10)",
          color: "#662321",
          border: "1px solid rgba(143, 49, 46, 0.18)",
        },
        colorSecondary: {
          background: "rgba(45, 104, 83, 0.10)",
          color: "#183d30",
          border: "1px solid rgba(45, 104, 83, 0.18)",
        },
        colorDefault: {
          background: "rgba(30, 35, 41, 0.06)",
          color: "rgba(30, 35, 41, 0.72)",
          border: "1px solid rgba(30, 35, 41, 0.12)",
        },
        filled: {
          "&.MuiChip-colorPrimary": {
            background: "rgba(143, 49, 46, 0.12)",
          },
          "&.MuiChip-colorSecondary": {
            background: "rgba(45, 104, 83, 0.12)",
          },
        },
        sizeSmall: {
          height: 20,
          fontSize: "0.72rem",
          padding: "0 6px",
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 40,
          borderRadius: 10,
          background: "rgba(143, 49, 46, 0.05)",
          padding: "3px",
        },
        indicator: {
          height: "100%",
          borderRadius: 8,
          background: "linear-gradient(135deg, #a33a37, #8f312e)",
          boxShadow: "0 2px 8px rgba(143, 49, 46, 0.28)",
          zIndex: 0,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 34,
          padding: "4px 12px",
          fontWeight: 700,
          fontSize: "0.88rem",
          borderRadius: 8,
          zIndex: 1,
          color: "rgba(30, 35, 41, 0.60)",
          transition: "color 0.18s ease",
          "&.Mui-selected": {
            color: "#fffdf8",
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "rgba(143, 49, 46, 0.10)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: "none",
          background: "rgba(255, 253, 248, 0.97)",
          backdropFilter: "blur(20px)",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontSize: "0.88rem",
        },
        filledSuccess: {
          background: "linear-gradient(135deg, #358060, #2d6853)",
        },
        filledError: {
          background: "linear-gradient(135deg, #b44441, #8f312e)",
        },
        filledWarning: {
          background: "linear-gradient(135deg, #c67c2a, #a85f1a)",
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          top: "16px !important",
        },
      },
    },
  },
});
