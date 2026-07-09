import React, { useState, useRef } from "react";
import logoImg from "./assets/logo.png";
import paletteImg from "./assets/pal.png";

/**
 * Hue Hunt — 색을 찾는 일주일 사진 챌린지
 * 디자인 프로토타입 (mock 데이터만 사용, 실제 카메라/저장 기능 없음)
 *
 * 브랜드 톤: 크림 + 오늘의 색(자연스러운 어스 톤) 그러데이션, Instrument Sans.
 * 화면 구성: 스플래시 / 홈 / 카메라(mock) / 결과 / 위클리 팔레트 / 아카이브
 */

// ---------- Mock 데이터 ----------

const WEEK_DATA = [
  {
    day: 1,
    label: "월",
    colorName: "Moss Green",
    colorHex: "#6B7F5E",
    emoji: "🌲",
    poetic: "깊은 숲 그늘이 머금은 색",
    captured: true,
    photoUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=600&auto=format&fit=crop",
  },
  {
    day: 2,
    label: "화",
    colorName: "Misty Daisy",
    colorHex: "#EDEAE2",
    emoji: "🌼",
    poetic: "새벽 안개에 씻긴 데이지 색",
    captured: true,
    photoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Daisy_from_below_in_macro_%28Unsplash%29.jpg/960px-Daisy_from_below_in_macro_%28Unsplash%29.jpg",
  },
  {
    day: 3,
    label: "수",
    colorName: "Sage Garden",
    colorHex: "#8FA998",
    emoji: "🌿",
    poetic: "숨 쉬는 숲의 아침 같은 색",
    captured: false, // 오늘
  },
  {
    day: 4,
    label: "목",
    colorName: "Clay Terracotta",
    colorHex: "#B97457",
    emoji: "🏺",
    poetic: "볕에 그을린 흙담의 색",
    captured: true,
    photoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Porto%27s_Terracotta_Rooftops_and_Riverside_Charm_%2855245763617%29.jpg/960px-Porto%27s_Terracotta_Rooftops_and_Riverside_Charm_%2855245763617%29.jpg",
  },
  {
    day: 5,
    label: "금",
    colorName: "Dune Sand",
    colorHex: "#D8C39A",
    emoji: "🌾",
    poetic: "바람이 쌓아 올린 모래 언덕 색",
    captured: true,
    photoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Namib-Naukluft_Sand_Dunes_%282011%29.jpg/960px-Namib-Naukluft_Sand_Dunes_%282011%29.jpg",
  },
  {
    day: 6,
    label: "토",
    colorName: "Stone Taupe",
    colorHex: "#A79C8E",
    emoji: "🪨",
    poetic: "오래된 돌담이 품은 색",
    captured: true,
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Stone_Wall_Texture.jpg/960px-Stone_Wall_Texture.jpg",
  },
  {
    day: 7,
    label: "일",
    colorName: "Dusty Blue",
    colorHex: "#8797A8",
    emoji: "🌫️",
    poetic: "해 질 녘 안개가 스민 색",
    captured: true,
    photoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Caherconree-3085%2C_Dingle_Peninsula%2C_Co._Kerry%2C_Ireland.jpg/960px-Caherconree-3085%2C_Dingle_Peninsula%2C_Co._Kerry%2C_Ireland.jpg",
  },
];

const TODAY_INDEX = 2;

const ARCHIVE_DATA = [
  {
    month: "January",
    weeks: 4,
    bases: [
      ["#4B5C49", "#8FA998", "#D8C39A"],
      ["#8797A8", "#EDEAE2", "#A79C8E"],
      ["#B97457", "#6B7F5E", "#8FA998"],
      ["#A79C8E", "#B97457", "#4B5C49"],
    ],
  },
  {
    month: "February",
    weeks: 3,
    bases: [
      ["#8797A8", "#A79C8E", "#EDEAE2"],
      ["#B97457", "#D8C39A", "#6B7F5E"],
      ["#4B5C49", "#8FA998", "#A79C8E"],
    ],
  },
  {
    month: "March",
    weeks: 4,
    bases: [
      ["#B97457", "#A79C8E", "#8797A8"],
      ["#6B7F5E", "#8FA998", "#D8C39A"],
      ["#B97457", "#C98A6B", "#EDEAE2"],
      ["#8797A8", "#4B5C49", "#A79C8E"],
    ],
  },
  {
    month: "April",
    weeks: 2,
    bases: [
      ["#8FA998", "#D8C39A", "#B97457"],
      ["#A79C8E", "#8797A8", "#6B7F5E"],
    ],
  },
];

const TABS = [
  { id: "home", label: "HOME" },
  { id: "camera", label: "CAMERA" },
  { id: "result", label: "RESULT" },
  { id: "palette", label: "PALETTE" },
  { id: "archive", label: "ARCHIVE" },
];

// ---------- 유틸 ----------

function hexToRgba(hex, alpha) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function mix(hex, target, amt) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const nr = Math.round(r + (target.r - r) * amt);
  const ng = Math.round(g + (target.g - g) * amt);
  const nb = Math.round(b + (target.b - b) * amt);
  return `rgb(${nr}, ${ng}, ${nb})`;
}

function lighten(hex, amt) {
  return mix(hex, { r: 255, g: 255, b: 255 }, amt);
}

function darken(hex, amt) {
  return mix(hex, { r: 0, g: 0, b: 0 }, amt);
}

function buildTile(base) {
  const [a, b, c] = base;
  return [a, lighten(b, 0.15), c, darken(a, 0.2), b, lighten(c, 0.2), c, darken(b, 0.15), a];
}

// ---------- 디자인 토큰 ----------

const CREAM = "#FCF8F2";
const INK = "#1C1A17";
const INK_SOFT = "#8C8375";
const HAIRLINE = hexToRgba(INK, 0.1);
const SANS =
  "'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";

const styles = {
  page: {
    minHeight: "100vh",
    background: CREAM,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "24px 0",
    fontFamily: SANS,
  },
  phone: {
    width: 390,
    maxWidth: "100%",
    height: 820,
    background: CREAM,
    borderRadius: 40,
    boxShadow: `0 30px 60px ${hexToRgba(INK, 0.22)}, 0 2px 8px ${hexToRgba(INK, 0.12)}`,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    border: `1px solid ${HAIRLINE}`,
  },
  screenArea: {
    flex: 1,
    overflowY: "auto",
    padding: "30px 22px 12px",
    WebkitOverflowScrolling: "touch",
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: INK_SOFT,
    margin: 0,
  },
  h1: {
    fontSize: 23,
    fontWeight: 700,
    color: INK,
    margin: 0,
    letterSpacing: -0.3,
    lineHeight: 1.3,
  },
  h2: {
    fontSize: 15,
    fontWeight: 700,
    color: INK,
    margin: 0,
    letterSpacing: -0.1,
  },
  sub: {
    fontSize: 13,
    color: INK_SOFT,
    margin: 0,
    lineHeight: 1.55,
  },
  card: {
    background: "#FFFEFB",
    borderRadius: 22,
    border: `1px solid ${HAIRLINE}`,
    boxShadow: `0 10px 26px ${hexToRgba(INK, 0.06)}`,
    padding: 20,
  },
  primaryButton: (bg = INK, color = CREAM) => ({
    border: "none",
    borderRadius: 16,
    padding: "16px 20px",
    fontSize: 15,
    fontWeight: 700,
    color,
    background: bg,
    cursor: "pointer",
    width: "100%",
    letterSpacing: -0.1,
  }),
  secondaryButton: {
    border: `1.5px solid ${INK}`,
    borderRadius: 16,
    padding: "14.5px 20px",
    fontSize: 14,
    fontWeight: 700,
    color: INK,
    background: "transparent",
    cursor: "pointer",
    width: "100%",
  },
  bottomNav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px calc(10px + env(safe-area-inset-bottom, 0px))",
    background: hexToRgba("#FFFEFB", 0.96),
    backdropFilter: "blur(10px)",
    borderTop: `1px solid ${HAIRLINE}`,
  },
  navPill: (active) => ({
    border: "none",
    background: active ? INK : "transparent",
    color: active ? CREAM : INK_SOFT,
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: 0.4,
    padding: "9px 13px",
    borderRadius: 999,
    cursor: "pointer",
    textTransform: "uppercase",
    fontFamily: SANS,
  }),
};

const fontImport = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap');
  * { box-sizing: border-box; }
  ::-webkit-scrollbar { display: none; }
  @keyframes hueHuntPulseRing {
    0% { box-shadow: 0 24px 44px rgba(0,0,0,0.18), inset 0 0 26px rgba(255,255,255,0.15), 0 0 0 0 rgba(255,255,255,0.4); }
    70% { box-shadow: 0 24px 44px rgba(0,0,0,0.18), inset 0 0 26px rgba(255,255,255,0.15), 0 0 0 16px rgba(255,255,255,0); }
    100% { box-shadow: 0 24px 44px rgba(0,0,0,0.18), inset 0 0 26px rgba(255,255,255,0.15), 0 0 0 0 rgba(255,255,255,0); }
  }
  @keyframes hueHuntBounce {
    0%, 100% { transform: translateY(0); opacity: 0.55; }
    50% { transform: translateY(6px); opacity: 1; }
  }
`;

// ---------- 화면: 스플래시 ----------

function SplashScreen({ onStart }) {
  return (
    <div
      style={{
        margin: "-30px -22px -12px",
        height: "calc(100% + 42px)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "64px 32px 48px",
        background: CREAM,
      }}
    >
      <div style={{ width: "100%" }} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 44,
          position: "relative",
        }}
      >
        <img src={logoImg} alt="THE HUE Hunt" style={{ width: 148, height: 148, objectFit: "contain" }} />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, width: 260 }}>
          <img
            src={paletteImg}
            alt="color palette"
            style={{ width: "100%", height: "auto", display: "block" }}
          />
          <div
            style={{
              textAlign: "center",
              color: INK,
              fontWeight: 600,
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            Find Colors.
            <br />
            Find Yourself.
          </div>
        </div>
      </div>

      <button
        onClick={onStart}
        style={{
          border: "none",
          background: "transparent",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          fontSize: 20,
          fontWeight: 600,
          color: INK,
          cursor: "pointer",
          padding: "10px 24px",
          fontFamily: SANS,
        }}
      >
        Get Started
        <span style={{ fontSize: 16 }}>→</span>
      </button>
    </div>
  );
}

// ---------- 화면: 홈 ----------

function HomeScreen({ today, yesterday, onStart, onGoArchive }) {
  const [showToday, setShowToday] = useState(false);

  return (
    <div
      style={{
        margin: "-30px -22px -12px",
        minHeight: "calc(100% + 42px)",
        padding: "26px 22px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        background: `radial-gradient(130% 85% at 50% -15%, ${lighten(today.colorHex, 0.35)} 0%, ${
          today.colorHex
        } 42%, ${darken(today.colorHex, 0.55)} 100%)`,
      }}
    >
      <span style={{ color: "#fff", fontSize: 15, fontWeight: 600, opacity: 0.92 }}>Good Morning.</span>

      <h1
        style={{
          color: darken(today.colorHex, 0.82),
          fontSize: 24,
          fontWeight: 700,
          lineHeight: 1.35,
          margin: 0,
          letterSpacing: -0.3,
        }}
      >
        오늘은 어떤 Hue를
        <br />
        발견할까요?
      </h1>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, margin: "4px 0 2px" }}>
        <button
          onClick={() => setShowToday((v) => !v)}
          style={{
            width: 164,
            height: 164,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.4)",
            background: "radial-gradient(circle at 35% 28%, rgba(255,255,255,0.4), rgba(255,255,255,0.08) 65%)",
            backdropFilter: "blur(6px)",
            boxShadow: "0 24px 44px rgba(0,0,0,0.18), inset 0 0 26px rgba(255,255,255,0.15)",
            animation: showToday ? "none" : "hueHuntPulseRing 2.4s ease-out infinite",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 58,
            cursor: "pointer",
          }}
        >
          {today.emoji}
        </button>
        {!showToday && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", letterSpacing: 0.2 }}>
              탭해서 오늘의 색 보기
            </span>
            <span
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.8)",
                animation: "hueHuntBounce 1.6s ease-in-out infinite",
              }}
            >
              ⌄
            </span>
          </div>
        )}
      </div>

      <div
        style={{
          maxHeight: showToday ? 420 : 0,
          opacity: showToday ? 1 : 0,
          transform: showToday ? "translateY(0)" : "translateY(-16px)",
          overflow: "hidden",
          transition: "max-height 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease, transform 0.45s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div
          style={{
            background: "rgba(255,253,249,0.5)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.45)",
            borderRadius: 26,
            padding: 22,
            boxShadow: "0 16px 34px rgba(0,0,0,0.16)",
          }}
        >
          <p style={{ ...styles.eyebrow, color: "rgba(255,255,255,0.85)" }}>TODAY&apos;S HUE</p>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: "#fff", margin: "6px 0 2px", letterSpacing: -0.4 }}>
            {today.colorName}
          </h2>
          <p style={{ ...styles.sub, color: "rgba(255,255,255,0.8)", fontWeight: 700, letterSpacing: 0.3 }}>
            {today.colorHex.toUpperCase()}
          </p>
          <p style={{ ...styles.sub, color: "rgba(255,255,255,0.8)", marginTop: 10, fontStyle: "italic" }}>
            {today.poetic}
          </p>
          <button
            onClick={onStart}
            style={{
              marginTop: 16,
              width: "100%",
              border: "none",
              borderRadius: 16,
              padding: "15px 18px",
              background: darken(today.colorHex, 0.35),
              color: "#fff",
              fontWeight: 700,
              fontSize: 14.5,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontFamily: SANS,
            }}
          >
            Open Camera
          </button>
        </div>
      </div>

      <button
        onClick={onGoArchive}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: "rgba(255,253,249,0.92)",
          borderRadius: 20,
          padding: 14,
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          fontFamily: SANS,
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            flexShrink: 0,
            background: `linear-gradient(155deg, ${lighten(yesterday.colorHex, 0.3)}, ${yesterday.colorHex})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            border: `1px solid ${HAIRLINE}`,
          }}
        >
          {yesterday.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ ...styles.eyebrow, fontSize: 10 }}>YESTERDAY</p>
          <p style={{ fontWeight: 700, color: INK, margin: "2px 0 0", fontSize: 14 }}>{yesterday.colorName}</p>
          <p style={{ ...styles.sub, marginTop: 1 }}>{yesterday.colorHex.toUpperCase()}</p>
        </div>
        <span style={{ fontSize: 18, color: INK_SOFT }}>→</span>
      </button>
    </div>
  );
}

// ---------- 화면: 카메라 (mock) ----------

function CameraScreen({ today, onCapture, onBack }) {
  return (
    <div
      style={{
        margin: "-30px -22px -12px",
        height: "calc(100% + 42px)",
        background: "#171512",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 18px 8px",
        }}
      >
        <button
          onClick={onBack}
          style={{
            border: "none",
            background: "rgba(255,255,255,0.12)",
            color: CREAM,
            width: 36,
            height: 36,
            borderRadius: "50%",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          ✕
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,255,255,0.12)",
            padding: "6px 12px",
            borderRadius: 999,
          }}
        >
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: today.colorHex }} />
          <span style={{ color: CREAM, fontSize: 12, fontWeight: 700 }}>{today.colorName}</span>
        </div>
        <div style={{ width: 36 }} />
      </div>

      <div
        style={{
          flex: 1,
          margin: "8px 18px",
          borderRadius: 28,
          background: `linear-gradient(155deg, ${hexToRgba(today.colorHex, 0.3)} 0%, #2A2620 55%, #171512 100%)`,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {[
          { top: 16, left: 16, borderWidth: "3px 0 0 3px" },
          { top: 16, right: 16, borderWidth: "3px 3px 0 0" },
          { bottom: 16, left: 16, borderWidth: "0 0 3px 3px" },
          { bottom: 16, right: 16, borderWidth: "0 3px 3px 0" },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 28,
              height: 28,
              borderColor: "rgba(255,255,255,0.55)",
              borderStyle: "solid",
              ...pos,
            }}
          />
        ))}

        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: "50%",
            border: `3px dashed ${hexToRgba("#FFFFFF", 0.6)}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 46,
          }}
        >
          {today.emoji}
        </div>

        <div style={{ position: "absolute", bottom: 20, left: 20, right: 20, textAlign: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, margin: 0 }}>
            이 원 안에 오늘의 색과 닮은 장면을 담아보세요
          </p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "22px 0 34px" }}>
        <button
          onClick={onCapture}
          style={{
            width: 78,
            height: 78,
            borderRadius: "50%",
            background: CREAM,
            border: `5px solid ${hexToRgba("#FFFFFF", 0.25)}`,
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
          }}
        />
      </div>
    </div>
  );
}

// ---------- 화면: 결과 ----------

function ResultScreen({ today, onRetake, onSave }) {
  const accent = darken(today.colorHex, 0.35);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <p style={{ ...styles.eyebrow, marginBottom: 6 }}>DAY {today.day} · 오늘의 기록</p>
        <h1 style={styles.h1}>색을 찾으셨네요!</h1>
      </div>

      <div style={{ borderRadius: 24, overflow: "hidden", border: `1px solid ${HAIRLINE}`, position: "relative" }}>
        <div
          style={{
            aspectRatio: "4 / 5",
            background: `radial-gradient(circle at 70% 20%, ${hexToRgba(today.colorHex, 0.95)}, ${hexToRgba(
              today.colorHex,
              0.55
            )} 60%, #201C17 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 64 }}>{today.emoji}</span>
        </div>
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            background: INK,
            borderRadius: 999,
            padding: "6px 12px",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.5,
            color: CREAM,
          }}
        >
          92% MATCH
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={{ ...styles.h2, marginBottom: 14 }}>색 비교</h2>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div
              style={{
                width: "100%",
                aspectRatio: "1 / 1",
                borderRadius: 16,
                background: today.colorHex,
                marginBottom: 8,
                border: `1px solid ${hexToRgba(INK, 0.15)}`,
              }}
            />
            <p style={{ ...styles.sub, fontWeight: 700, color: INK }}>오늘의 색</p>
          </div>
          <div style={{ fontSize: 18, color: INK_SOFT }}>≈</div>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div
              style={{
                width: "100%",
                aspectRatio: "1 / 1",
                borderRadius: 16,
                background: `linear-gradient(135deg, ${hexToRgba(today.colorHex, 0.85)}, ${hexToRgba(
                  today.colorHex,
                  0.5
                )})`,
                marginBottom: 8,
                border: `1px solid ${hexToRgba(INK, 0.15)}`,
              }}
            />
            <p style={{ ...styles.sub, fontWeight: 700, color: INK }}>내 사진의 색</p>
          </div>
        </div>
        <p style={{ ...styles.sub, marginTop: 14 }}>
          따뜻함이 잘 담겼어요. 이 순간의 색이 위클리 팔레트에 더해집니다.
        </p>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <button style={styles.secondaryButton} onClick={onRetake}>
            Retake
          </button>
        </div>
        <div style={{ flex: 1.4 }}>
          <button style={styles.primaryButton(accent)} onClick={onSave}>
            Save to Palette
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- 화면: 위클리 팔레트 ----------

function GradientBar({ today }) {
  const todayPct = (WEEK_DATA.findIndex((d) => d.day === today.day) / (WEEK_DATA.length - 1)) * 100;
  return (
    <div style={{ position: "relative", padding: "20px 2px 0" }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: `${todayPct}%`,
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
        }}
      >
        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 0.6, color: INK_SOFT }}>TODAY</span>
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "4px solid transparent",
            borderRight: "4px solid transparent",
            borderTop: `5px solid ${INK}`,
          }}
        />
      </div>
      <div
        style={{
          height: 46,
          borderRadius: 15,
          background: `linear-gradient(90deg, ${WEEK_DATA.map((d) => d.colorHex).join(", ")})`,
          border: `1px solid ${hexToRgba(INK, 0.12)}`,
          boxShadow: `0 10px 24px ${hexToRgba(INK, 0.12)}`,
        }}
      />
    </div>
  );
}

function StackCardFace({ card }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 28,
        position: "relative",
        overflow: "hidden",
        boxShadow: `0 20px 40px ${hexToRgba(INK, 0.22)}`,
        background: card.colorHex,
      }}
    >
      <img
        src={card.photoUrl}
        alt={card.colorName}
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          pointerEvents: "none",
          userSelect: "none",
          WebkitUserDrag: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 42%)",
        }}
      />
      <div style={{ position: "absolute", left: 20, bottom: 18, right: 20 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.35)" }}>
          {card.label}요일 · {card.colorName}
        </span>
      </div>
    </div>
  );
}

const STACK_CARDS = WEEK_DATA.filter((d) => d.captured);

const SPRING_EASE = "cubic-bezier(0.34, 1.56, 0.64, 1)";

function CardCarousel({ cards }) {
  const [active, setActive] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startYRef = useRef(0);

  const cardHeight = 340;
  const step = 88;
  const scaleStep = 0.09;
  const opacityStep = 0.4;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const getY = (e) => (e.touches ? e.touches[0].clientY : e.clientY);

  const onDown = (e) => {
    if (e.pointerId != null && e.currentTarget.setPointerCapture) {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    setDragging(true);
    startYRef.current = getY(e);
  };
  const onMove = (e) => {
    if (!dragging) return;
    const atTop = active === 0;
    const atBottom = active === cards.length - 1;
    let d = getY(e) - startYRef.current;
    if ((atTop && d > 0) || (atBottom && d < 0)) d *= 0.35;
    setDragY(d);
  };
  const onUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (dragY > 60) {
      setActive((a) => clamp(a - 1, 0, cards.length - 1));
    } else if (dragY < -60) {
      setActive((a) => clamp(a + 1, 0, cards.length - 1));
    }
    setDragY(0);
  };

  const dragOffsetIndex = dragging ? -dragY / step : 0;

  return (
    <div
      style={{
        position: "relative",
        height: 420,
        margin: "8px 0",
        touchAction: "none",
        cursor: "grab",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
    >
      {cards.map((card, i) => {
        const offset = clamp(i - active + dragOffsetIndex, -3, 3);
        const absOffset = Math.abs(offset);
        const translateY = offset * step;
        const scale = clamp(1 - absOffset * scaleStep, 0.6, 1);
        const opacity = clamp(1 - absOffset * opacityStep, 0, 1);
        const zIndex = 100 - Math.round(absOffset * 10);

        return (
          <div
            key={card.day}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "50%",
              height: cardHeight,
              marginTop: -cardHeight / 2,
              zIndex,
              transform: `translateY(${translateY}px) scale(${scale})`,
              opacity,
              transition: dragging ? "none" : `transform 0.5s ${SPRING_EASE}, opacity 0.4s ease`,
            }}
          >
            <StackCardFace card={card} />
          </div>
        );
      })}
    </div>
  );
}

function PaletteScreen({ today }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      <div>
        <h1 style={styles.h1}>Week Palette</h1>
        <p style={{ ...styles.sub, marginTop: 6 }}>하루하루 모은 색들이 자연스러운 그러데이션을 그려요.</p>
      </div>

      <GradientBar today={today} />

      <CardCarousel cards={STACK_CARDS} />
    </div>
  );
}

// ---------- 화면: 아카이브 ----------

function MosaicTile({ colors }) {
  return (
    <div
      style={{
        width: 72,
        height: 72,
        borderRadius: 16,
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "repeat(3, 1fr)",
        border: `1px solid ${HAIRLINE}`,
        flexShrink: 0,
      }}
    >
      {colors.map((c, i) => (
        <div key={i} style={{ background: c }} />
      ))}
    </div>
  );
}

function ArchiveScreen() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={styles.h1}>Archive</h1>
          <p style={{ ...styles.sub, marginTop: 6 }}>7일 동안 발견한 색들이 하나의 장면이 되었어요.</p>
        </div>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: hexToRgba(INK, 0.06),
            border: `1px solid ${HAIRLINE}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            flexShrink: 0,
          }}
        >
          📅
        </div>
      </div>

      {ARCHIVE_DATA.map((group) => (
        <div key={group.month} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ ...styles.h2, fontSize: 16 }}>{group.month}</span>
            <span style={{ ...styles.sub, fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
              {group.weeks} weeks <span style={{ fontSize: 14 }}>›</span>
            </span>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {group.bases.map((base, i) => (
              <MosaicTile key={i} colors={buildTile(base)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------- 하단 탭 ----------

function BottomNav({ current, onChange }) {
  return (
    <div style={styles.bottomNav}>
      {TABS.map((tab) => (
        <button key={tab.id} style={styles.navPill(current === tab.id)} onClick={() => onChange(tab.id)}>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ---------- 루트 컴포넌트 ----------

export default function ColorHuntApp() {
  const [screen, setScreen] = useState("splash");
  const today = WEEK_DATA[TODAY_INDEX];
  const yesterday = WEEK_DATA[TODAY_INDEX - 1];

  return (
    <div style={styles.page}>
      <style>{fontImport}</style>
      <div style={styles.phone}>
        <div style={screen === "splash" ? { flex: 1, overflow: "hidden" } : styles.screenArea}>
          {screen === "splash" && <SplashScreen onStart={() => setScreen("home")} />}
          {screen === "home" && (
            <HomeScreen
              today={today}
              yesterday={yesterday}
              onStart={() => setScreen("camera")}
              onGoArchive={() => setScreen("archive")}
            />
          )}
          {screen === "camera" && (
            <CameraScreen today={today} onCapture={() => setScreen("result")} onBack={() => setScreen("home")} />
          )}
          {screen === "result" && (
            <ResultScreen today={today} onRetake={() => setScreen("camera")} onSave={() => setScreen("palette")} />
          )}
          {screen === "palette" && <PaletteScreen today={today} />}
          {screen === "archive" && <ArchiveScreen />}
        </div>
        {screen !== "splash" && <BottomNav current={screen} onChange={setScreen} />}
      </div>
    </div>
  );
}
