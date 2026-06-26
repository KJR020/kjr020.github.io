import { useCallback, useEffect, useRef, useState } from "react";
import { MoonIcon, SunIcon } from "@/components/icons";
import "./ThemeAnimationLab.css";

type VariantId = "quiet-eclipse" | "paper-lantern" | "ink-ripple" | "orbit-shift";
type Direction = "to-dark" | "to-light";

interface VariantConfig {
  id: VariantId;
  name: string;
  concept: string;
  motion: string;
  fit: string;
  switchAtMs: number;
  doneAtMs: number;
  scores: {
    quiet: number;
    clear: number;
    repeat: number;
  };
}

const variants: VariantConfig[] = [
  {
    id: "quiet-eclipse",
    name: "Quiet Eclipse",
    concept: "ボタンから夜と朝が静かに広がる",
    motion: "円形波 / 560ms / ease-out",
    fit: "本命。読書中でも邪魔になりにくい",
    switchAtMs: 260,
    doneAtMs: 760,
    scores: { quiet: 5, clear: 5, repeat: 5 },
  },
  {
    id: "paper-lantern",
    name: "Paper Lantern",
    concept: "紙面に照明を落とす、または戻す",
    motion: "縦ワイプ / 620ms / soft ease",
    fit: "記事本文との相性がよく、紙面感が出る",
    switchAtMs: 300,
    doneAtMs: 820,
    scores: { quiet: 4, clear: 4, repeat: 4 },
  },
  {
    id: "ink-ripple",
    name: "Ink Ripple",
    concept: "インクの一滴が紙面に広がる",
    motion: "二重リップル / 680ms / organic",
    fit: "印象は残るが、毎回見るには少し強い",
    switchAtMs: 300,
    doneAtMs: 880,
    scores: { quiet: 3, clear: 5, repeat: 3 },
  },
  {
    id: "orbit-shift",
    name: "Orbit Shift",
    concept: "太陽と月がボタンの周りで入れ替わる",
    motion: "小軌道 / 520ms / crisp",
    fit: "控えめだが、背景変化の因果は弱い",
    switchAtMs: 180,
    doneAtMs: 620,
    scores: { quiet: 5, clear: 3, repeat: 5 },
  },
];

const scoreDotKeys = ["1", "2", "3", "4", "5"] as const;

interface ThemeAnimationLabProps {
  initialPlaySignal?: number;
}

type CssVars = React.CSSProperties & Record<`--${string}`, string | number>;

export function ThemeAnimationLab({ initialPlaySignal = 0 }: ThemeAnimationLabProps) {
  const [playAllSignal, setPlayAllSignal] = useState(initialPlaySignal);

  return (
    <section className="theme-lab" aria-labelledby="theme-lab-title">
      <div className="theme-lab__toolbar">
        <div>
          <p className="theme-lab__eyebrow">Theme motion study</p>
          <h1 id="theme-lab-title" className="theme-lab__title">
            ダークモード切替アニメーション比較
          </h1>
        </div>
        <button
          type="button"
          className="theme-lab__play-all"
          onClick={() => setPlayAllSignal((value) => value + 1)}
        >
          全部再生
        </button>
      </div>

      <div className="theme-lab__grid">
        {variants.map((variant) => (
          <VariantPreview key={variant.id} variant={variant} playSignal={playAllSignal} />
        ))}
      </div>

      <div className="theme-lab__matrix">
        <div className="theme-lab__matrix-head">Pattern</div>
        <div className="theme-lab__matrix-head">Quiet</div>
        <div className="theme-lab__matrix-head">Clear</div>
        <div className="theme-lab__matrix-head">Repeat</div>
        {variants.map((variant) => (
          <ScoreRow key={variant.id} variant={variant} />
        ))}
      </div>
    </section>
  );
}

function VariantPreview({ variant, playSignal }: { variant: VariantConfig; playSignal: number }) {
  const [isDark, setIsDark] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [direction, setDirection] = useState<Direction>("to-dark");
  const [runId, setRunId] = useState(0);
  const timersRef = useRef<number[]>([]);
  const latestPlaySignalRef = useRef(playSignal);

  const clearTimers = useCallback(() => {
    for (const timer of timersRef.current) {
      window.clearTimeout(timer);
    }
    timersRef.current = [];
  }, []);

  const play = useCallback(() => {
    clearTimers();

    const nextDark = !isDark;
    const nextDirection: Direction = nextDark ? "to-dark" : "to-light";
    setDirection(nextDirection);
    setIsPlaying(true);
    setRunId((value) => value + 1);

    timersRef.current.push(
      window.setTimeout(() => {
        setIsDark(nextDark);
      }, variant.switchAtMs),
      window.setTimeout(() => {
        setIsPlaying(false);
      }, variant.doneAtMs),
    );
  }, [clearTimers, isDark, variant.doneAtMs, variant.switchAtMs]);

  useEffect(() => {
    return clearTimers;
  }, [clearTimers]);

  useEffect(() => {
    if (latestPlaySignalRef.current === playSignal) return;
    latestPlaySignalRef.current = playSignal;
    play();
  }, [play, playSignal]);

  const effectColor = direction === "to-dark" ? "hsl(225 12% 7%)" : "hsl(0 0% 100%)";
  const effectAccent = direction === "to-dark" ? "hsl(225 75% 65%)" : "hsl(230 70% 50%)";
  const effectStyle = {
    "--effect-color": effectColor,
    "--effect-accent": effectAccent,
    "--effect-duration": `${variant.doneAtMs}ms`,
  } satisfies CssVars;

  return (
    <article className="theme-lab__card">
      <div className="theme-lab__card-header">
        <div>
          <h2>{variant.name}</h2>
          <p>{variant.concept}</p>
        </div>
        <button type="button" className="theme-lab__small-button" onClick={play}>
          再生
        </button>
      </div>

      <div
        className="theme-lab__stage"
        data-theme={isDark ? "dark" : "light"}
        data-variant={variant.id}
      >
        <div className="theme-lab__mock-header">
          <div className="theme-lab__mock-brand">
            <span className="theme-lab__avatar" />
            <span>KJR020's Blog</span>
          </div>
          <button
            type="button"
            className="theme-lab__toggle-dot"
            onClick={play}
            aria-label="preview"
          >
            <span className="theme-lab__toggle-icon" data-dark={isDark}>
              <SunIcon className="theme-lab__sun" />
              <MoonIcon className="theme-lab__moon" />
            </span>
          </button>
        </div>

        <div className="theme-lab__mock-body">
          <p className="theme-lab__kicker">Design note</p>
          <h3>テーマ切替の質感</h3>
          <p>
            アニメーションは状態変化を知らせるための短いサインとして扱い、本文の読み心地を優先する。
          </p>
          <div className="theme-lab__mock-lines" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>

        {isPlaying && (
          <EffectLayer
            key={`${variant.id}-${runId}`}
            variantId={variant.id}
            direction={direction}
            style={effectStyle}
          />
        )}
      </div>

      <div className="theme-lab__notes">
        <span>{variant.motion}</span>
        <strong>{variant.fit}</strong>
      </div>
    </article>
  );
}

function EffectLayer({
  variantId,
  direction,
  style,
}: {
  variantId: VariantId;
  direction: Direction;
  style: CssVars;
}) {
  return (
    <div
      className="theme-lab__effect"
      data-effect={variantId}
      data-direction={direction}
      style={style}
      aria-hidden="true"
    >
      {variantId === "quiet-eclipse" && <span className="theme-lab__quiet-wave" />}
      {variantId === "paper-lantern" && (
        <>
          <span className="theme-lab__lantern-wash" />
          <span className="theme-lab__lantern-edge" />
        </>
      )}
      {variantId === "ink-ripple" && (
        <>
          <span className="theme-lab__ink-drop" />
          <span className="theme-lab__ink-ring theme-lab__ink-ring--one" />
          <span className="theme-lab__ink-ring theme-lab__ink-ring--two" />
        </>
      )}
      {variantId === "orbit-shift" && (
        <>
          <span className="theme-lab__orbit-ring" />
          <span className="theme-lab__orbit-body theme-lab__orbit-body--sun">
            <SunIcon />
          </span>
          <span className="theme-lab__orbit-body theme-lab__orbit-body--moon">
            <MoonIcon />
          </span>
        </>
      )}
    </div>
  );
}

function ScoreRow({ variant }: { variant: VariantConfig }) {
  return (
    <>
      <div className="theme-lab__matrix-name">{variant.name}</div>
      <ScoreDots value={variant.scores.quiet} />
      <ScoreDots value={variant.scores.clear} />
      <ScoreDots value={variant.scores.repeat} />
    </>
  );
}

function ScoreDots({ value }: { value: number }) {
  return (
    <div className="theme-lab__score" role="img" aria-label={`${value} / 5`}>
      {scoreDotKeys.map((key, index) => (
        <span key={key} data-filled={index < value} />
      ))}
    </div>
  );
}
