import { useEffect, useMemo, useRef, useState } from "react";

interface Candle {
  open: number;
  close: number;
  high: number;
  low: number;
  bull: boolean;
}

const VIEW_W = 480;
const VIEW_H = 280;
const CANDLE_W = 20;
const CANDLE_GAP = 10;
const STRIDE = CANDLE_W + CANDLE_GAP;
/** Room for stroke + round wick caps so nothing clips. */
const PAD_Y = 18;
/** Exact integer wave cycles so the duplicated strip seams perfectly. */
const WAVE_CYCLES = 2;
const COUNT = 24;

function buildWaveCandles(count: number): Candle[] {
  const midY = VIEW_H / 2;
  const amp = VIEW_H * 0.22;
  const raw: Omit<Candle, never>[] = [];

  for (let i = 0; i < count; i++) {
    const t = i / count;
    const angle = t * Math.PI * 2 * WAVE_CYCLES;
    const wave =
      Math.sin(angle) * amp +
      Math.sin(angle * 2) * amp * 0.2;
    const center = midY - wave;

    const bodyH = 20 + Math.abs(Math.sin(angle * 1.5)) * 36;
    const wickExtra = 10 + Math.abs(Math.cos(angle * 1.25)) * 14;
    const bull = Math.sin(angle + 0.4) >= 0;

    const open = bull ? center + bodyH / 2 : center - bodyH / 2;
    const close = bull ? center - bodyH / 2 : center + bodyH / 2;
    const high = Math.min(open, close) - wickExtra;
    const low = Math.max(open, close) + wickExtra * 0.8;

    raw.push({ open, close, high, low, bull });
  }

  // Fit entire series into the viewBox with padding — no hard per-candle crop
  let minY = Infinity;
  let maxY = -Infinity;
  for (const c of raw) {
    minY = Math.min(minY, c.high);
    maxY = Math.max(maxY, c.low);
  }

  const usable = VIEW_H - PAD_Y * 2;
  const span = Math.max(1, maxY - minY);
  const scale = usable / span;

  return raw.map((c) => ({
    open: PAD_Y + (c.open - minY) * scale,
    close: PAD_Y + (c.close - minY) * scale,
    high: PAD_Y + (c.high - minY) * scale,
    low: PAD_Y + (c.low - minY) * scale,
    bull: c.bull,
  }));
}

function CandleStick({ candle, x }: { candle: Candle; x: number }) {
  const top = Math.min(candle.open, candle.close);
  const bottom = Math.max(candle.open, candle.close);
  const bodyH = Math.max(4, bottom - top);
  const cx = x + CANDLE_W / 2;

  return (
    <g>
      <line
        x1={cx}
        y1={candle.high}
        x2={cx}
        y2={candle.low}
        stroke="black"
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Solid bull / outlined bear — survives invert + screen blend */}
      <rect
        x={x}
        y={top}
        width={CANDLE_W}
        height={bodyH}
        rx={1}
        fill={candle.bull ? "black" : "none"}
        stroke="black"
        strokeWidth={2}
      />
    </g>
  );
}

export default function Volumes({
  width = "100%",
  height = "100%",
  style,
  hovered: parentHovered = false,
}: {
  width?: string;
  height?: string;
  style?: React.CSSProperties;
  hovered?: boolean;
}) {
  const [localHovered, setLocalHovered] = useState(false);
  const isHovered = parentHovered || localHovered;

  const stripRef = useRef<SVGGElement>(null);
  const offsetRef = useRef(0);
  const rafRef = useRef(0);

  const candles = useMemo(() => buildWaveCandles(COUNT), []);
  const strip = useMemo(
    () => [...candles, ...candles, ...candles],
    [candles]
  );
  const loopWidth = COUNT * STRIDE;

  useEffect(() => {
    const apply = (x: number) => {
      if (stripRef.current) {
        stripRef.current.setAttribute("transform", `translate(${x} 0)`);
      }
    };

    const speed = isHovered ? 1.4 : 0.7;

    const tick = () => {
      offsetRef.current += speed;
      if (offsetRef.current >= loopWidth) {
        offsetRef.current -= loopWidth;
      }
      apply(offsetRef.current - loopWidth);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isHovered, loopWidth]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        overflow: "visible",
        ...style,
      }}
      onMouseEnter={() => setLocalHovered(true)}
      onMouseLeave={() => setLocalHovered(false)}
    >
      <g ref={stripRef}>
        {strip.map((candle, i) => (
          <CandleStick key={i} candle={candle} x={i * STRIDE} />
        ))}
      </g>
    </svg>
  );
}
