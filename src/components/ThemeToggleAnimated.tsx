import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoonIcon, SunIcon } from "./icons";

const QUIET_ECLIPSE_MOTION = {
  switchAtMs: 260,
  waveMs: 560,
  fadeMs: 140,
  settleMs: 720,
  easing: "cubic-bezier(0.16, 1, 0.3, 1)",
} as const;

interface WaveGeometry {
  left: number;
  top: number;
  size: number;
}

// DOM状態から現在のテーマを取得（ThemeInit.astroで設定済み）
function getInitialTheme(): boolean {
  if (typeof document !== "undefined") {
    return document.documentElement.classList.contains("dark");
  }
  return false;
}

function getWaveGeometry(button: HTMLButtonElement): WaveGeometry {
  const rect = button.getBoundingClientRect();
  const left = rect.left + rect.width / 2;
  const top = rect.top + rect.height / 2;
  const corners = [
    [0, 0],
    [window.innerWidth, 0],
    [0, window.innerHeight],
    [window.innerWidth, window.innerHeight],
  ] as const;
  const radius = Math.max(...corners.map(([x, y]) => Math.hypot(x - left, y - top)));

  return {
    left,
    top,
    size: radius * 2,
  };
}

export function ThemeToggleAnimated() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showWave, setShowWave] = useState(false);
  const [waveStyle, setWaveStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);

  // マウント時にテーマ状態を同期
  useEffect(() => {
    setMounted(true);
    setIsDark(getInitialTheme());
  }, []);

  const toggleTheme = useCallback(() => {
    if (isAnimating) return;
    const button = buttonRef.current;
    if (!button) return;

    const geometry = getWaveGeometry(button);
    const nextDark = !isDark;
    const effectColor = nextDark ? "rgb(10, 10, 10)" : "rgb(250, 250, 250)";

    setIsAnimating(true);

    // ボタン起点の静かな円形波を設定
    setWaveStyle({
      left: geometry.left,
      top: geometry.top,
      width: geometry.size,
      height: geometry.size,
      transform: "translate(-50%, -50%) scale(0)",
      borderRadius: "999px",
      opacity: 0.86,
      backgroundColor: effectColor,
    });
    setShowWave(true);

    // 波を広げる
    requestAnimationFrame(() => {
      setWaveStyle((prev) => ({
        ...prev,
        transform: "translate(-50%, -50%) scale(1)",
        transition: [
          `transform ${QUIET_ECLIPSE_MOTION.waveMs}ms ${QUIET_ECLIPSE_MOTION.easing}`,
          `opacity ${QUIET_ECLIPSE_MOTION.fadeMs}ms ease-out ${QUIET_ECLIPSE_MOTION.waveMs}ms`,
        ].join(", "),
      }));
    });

    // テーマを切り替え（波が半分ほど広がったタイミング）
    setTimeout(() => {
      setIsDark(nextDark);
      if (nextDark) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    }, QUIET_ECLIPSE_MOTION.switchAtMs);

    // 波をフェードアウト
    setTimeout(() => {
      setShowWave(false);
    }, QUIET_ECLIPSE_MOTION.waveMs);

    // アニメーション完了
    setTimeout(() => {
      setIsAnimating(false);
      setWaveStyle({});
    }, QUIET_ECLIPSE_MOTION.settleMs);
  }, [isDark, isAnimating]);

  // SSRハイドレーション対策：マウント前はプレースホルダーを返す
  if (!mounted) {
    return (
      <button
        type="button"
        className="relative w-10 h-10 rounded-full flex items-center justify-center"
      >
        <div className="w-5 h-5" />
      </button>
    );
  }

  return (
    <>
      {/* 波オーバーレイ - React Portal でbody直下にレンダリング */}
      {createPortal(
        <div
          className={`fixed inset-0 z-60 pointer-events-none overflow-hidden transition-opacity duration-200 ${
            showWave ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        >
          {/* ボタン起点の円形波 */}
          <div className="absolute rounded-full" style={waveStyle} />
        </div>,
        document.body,
      )}

      {/* トグルボタン */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleTheme}
        disabled={isAnimating}
        className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors disabled:cursor-not-allowed z-50"
        aria-label={isDark ? "ライトモードに切り替える" : "ダークモードに切り替える"}
      >
        <div className="relative w-5 h-5 overflow-hidden">
          {/* 太陽アイコン（小） */}
          <SunIcon
            className={`absolute inset-0 w-full h-full text-foreground transition-all duration-300 ease-out ${
              isDark ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
            }`}
          />

          {/* 月アイコン（小） */}
          <MoonIcon
            className={`absolute inset-0 w-full h-full text-foreground transition-all duration-300 ease-out ${
              isDark ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
            }`}
          />
        </div>
      </button>
    </>
  );
}
