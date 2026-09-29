import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { SCENES } from './scenes';
import type { Anim, El, Fill, Stage } from './types';
import './rag.css';

/**
 * The walkthrough island.
 *
 * React owns the shell — steps, phases, captions, controls — and the SVG tree is
 * declared once per step from the scene data. The motion is the browser's own Web
 * Animations: every shape carries the moment it should appear (`data-at`) and how
 * long it takes, and the animations run *natively* on the compositor.
 *
 * That last point is the whole trick. An earlier version kept every animation
 * paused and wrote `currentTime` onto all of them from one rAF loop, which meant
 * sixty-odd style recalcs per frame and visible stutter on a phone. Now the rAF
 * loop only paints the progress meter, the counter text and the phase label; it
 * never touches a shape. Pausing pauses the animations, scrubbing seeks them, and
 * everything in between is the compositor's problem.
 */

const HUES = ['blue', 'teal', 'amber', 'green', 'violet', 'red'] as const;

/** Site tokens first, then the diagram's own categorical hues (see rag.css). */
const FILL = {
  ink: 'var(--ink)',
  muted: 'var(--muted)',
  faint: 'var(--faint)',
  rule: 'var(--rule)',
  accent: 'var(--accent)',
  'accent-soft': 'color-mix(in oklab, var(--accent) 15%, transparent)',
  'accent-line': 'color-mix(in oklab, var(--accent) 60%, transparent)',
  'ink-soft': 'color-mix(in oklab, var(--ink) 7%, transparent)',
  panel: 'var(--surface)',
  paper: 'var(--paper)',
  ...Object.fromEntries(
    HUES.flatMap((h) => [
      [h, `var(--d-${h})`],
      [`${h}-soft`, `var(--d-${h}-soft)`],
      [`${h}-line`, `var(--d-${h}-line)`],
    ])
  ),
} as Record<Fill, string>;

const MARKERS = Object.fromEntries([['ink'], ['muted'], ['accent'], ['rule'], ...HUES.map((h) => [h])].flat().map((k) => [k, `rag-arrow-${k}`])) as Record<string, string>;

/** Calm by design: a long tail keeps arrivals from looking like a twitch. */
const EASE = 'cubic-bezier(0.33, 1, 0.68, 1)';

const KEYFRAMES: Record<Anim, Keyframe[]> = {
  fade: [{ opacity: '0' }, { opacity: '1' }],
  pop: [{ opacity: '0', transform: 'scale(0.97)' }, { opacity: '1', transform: 'scale(1)' }],
  rise: [{ opacity: '0', transform: 'translateY(6px)' }, { opacity: '1', transform: 'translateY(0)' }],
  draw: [{ strokeDashoffset: '100' }, { strokeDashoffset: '0' }],
  growx: [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
  growy: [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }],
  none: [{ opacity: '1' }, { opacity: '1' }],
};

const ORIGIN: Partial<Record<Anim, string>> = {
  growx: 'left center',
  growy: 'center bottom',
  pop: 'center center',
  rise: 'center center',
};

const fillOf = (token: Fill | undefined, fallback: Fill = 'ink') => FILL[token ?? fallback];

const markerFor = (token: Fill | undefined) => {
  const key = (token ?? 'rule').replace(/-(soft|line)$/, '');
  return `url(#${MARKERS[key] ?? MARKERS.rule})`;
};

function Shape({ e }: { e: El }) {
  const kind = (e.anim ?? 'fade') as Anim;
  const common = {
    'data-anim': kind,
    'data-at': Math.round(e.at ?? 0),
    'data-dur': Math.round(e.dur ?? 400),
  } as Record<string, string>;
  const style: CSSProperties = {
    transformBox: 'fill-box',
    transformOrigin: ORIGIN[kind] ?? 'center center',
  };

  switch (e.t) {
    case 'box':
      return (
        <rect
          {...common}
          x={e.x} y={e.y} width={e.w} height={e.h} rx={e.r ?? 6}
          fill={fillOf(e.fill, 'ink-soft')}
          stroke={e.stroke ? fillOf(e.stroke) : 'none'}
          strokeWidth={e.sw ?? 1}
          strokeDasharray={e.dash ? '4 4' : undefined}
          style={style}
        />
      );
    case 'text':
      return (
        <text
          {...common}
          x={e.x} y={e.y}
          textAnchor={e.anchor ?? 'start'}
          dominantBaseline="middle"
          fontSize={e.size ?? 12}
          fontWeight={e.strong ? 600 : 400}
          fontFamily={e.mono ? 'var(--font-mono)' : 'var(--font-sans)'}
          fill={fillOf(e.fill)}
          style={style}
        >
          {e.s}
        </text>
      );
    case 'line':
      return (
        <line
          {...common}
          x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
          stroke={fillOf(e.stroke, 'rule')}
          strokeWidth={e.sw ?? 1}
          strokeDasharray={kind === 'draw' ? '100' : e.dash ? '4 4' : undefined}
          pathLength={kind === 'draw' ? 100 : undefined}
          markerEnd={e.arrow ? markerFor(e.stroke) : undefined}
          style={style}
        />
      );
    case 'path':
      return (
        <path
          {...common}
          d={e.d}
          stroke={fillOf(e.stroke, 'rule')}
          strokeWidth={e.sw ?? 1}
          strokeDasharray={kind === 'draw' ? '100' : undefined}
          pathLength={kind === 'draw' ? 100 : undefined}
          markerEnd={e.arrow ? markerFor(e.stroke) : undefined}
          style={style}
        />
      );
    case 'circle':
      return (
        <circle
          {...common}
          cx={e.cx} cy={e.cy} r={e.r}
          fill={fillOf(e.fill, 'accent')}
          stroke={e.stroke ? fillOf(e.stroke) : 'none'}
          strokeWidth={e.sw ?? 1}
          style={style}
        />
      );
    case 'bars': {
      const step = e.w / e.n;
      return (
        <g>
          {Array.from({ length: e.n }, (_, k) => {
            const h = e.h * (0.35 + 0.65 * Math.abs(Math.sin(k * 1.7 + 0.6)));
            return (
              <rect
                key={k}
                data-anim="growy"
                data-at={Math.round((e.at ?? 0) + k * (e.stagger ?? 16))}
                data-dur={Math.round(e.dur ?? 400)}
                x={e.x + k * step + step * 0.22}
                y={e.y + e.h - h}
                width={Math.max(1, step * 0.56)}
                height={h}
                rx={2}
                fill={fillOf(e.fill, 'accent')}
                style={{ transformBox: 'fill-box', transformOrigin: 'center bottom' }}
              />
            );
          })}
        </g>
      );
    }
    case 'count':
      return (
        <g>
          <text
            data-count
            data-from={e.from}
            data-to={e.to}
            data-at={Math.round(e.at ?? 0)}
            data-dur={Math.round(e.dur ?? 800)}
            x={e.x} y={e.y}
            textAnchor={e.anchor ?? 'start'}
            dominantBaseline="middle"
            fontSize={e.size ?? 32}
            fontWeight={600}
            fill={fillOf(e.fill)}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {e.from.toLocaleString('en-US')}
          </text>
          {e.label ? (
            <text {...common} x={e.x} y={e.y + Math.max(16, (e.size ?? 32) * 0.9)} fontSize={12} fill="var(--muted)">
              {e.label}
            </text>
          ) : null}
        </g>
      );
    default:
      return null;
  }
}

export default function RagExplainer() {
  const svgRef = useRef<SVGSVGElement>(null);
  const meterRef = useRef<HTMLSpanElement>(null);
  const scrubRef = useRef<HTMLInputElement>(null);
  const anims = useRef<Animation[]>([]);
  const counts = useRef<Array<{ el: SVGTextElement; from: number; to: number; at: number; dur: number }>>([]);
  const clock = useRef({ start: 0, elapsed: 0, running: false });
  const raf = useRef(0);
  const playing = useRef(true);
  const phaseRef = useRef(0);
  const meterAt = useRef(-1);
  const countAt = useRef(0);

  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [box, setBox] = useState({ W: 900, H: 420 });

  const scene = SCENES[step];
  const still = useMemo(() => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  const stage: Stage = useMemo(() => {
    const pad = box.W < 420 ? 12 : 16;
    return { W: box.W, H: box.H, pad, tall: box.W < 620 || box.H > box.W * 0.95, still };
  }, [box, still]);

  const els = useMemo(() => scene.els(stage), [scene, stage]);

  /** The three things that are not the compositor's job. Small on purpose. */
  const paint = useCallback((ms: number) => {
    // A rolling number should not force a text layout on every frame: 20 a second
    // is past the point where the eye can tell, and the final value is written
    // regardless because `done` bypasses the throttle.
    const now = performance.now();
    const due = now - countAt.current >= 50;
    if (due) countAt.current = now;
    for (const c of counts.current) {
      const p = Math.min(1, Math.max(0, (ms - c.at) / Math.max(1, c.dur)));
      if (!due && !(p >= 1)) continue;
      const v = Math.round(c.from + (c.to - c.from) * (1 - Math.pow(1 - p, 3)));
      const text = v.toLocaleString('en-US');
      if (c.el.textContent !== text) c.el.textContent = text;
    }
    const pct = Math.round(Math.min(1, ms / scene.dur) * 1000);
    if (meterAt.current !== pct) {
      meterAt.current = pct;
      if (meterRef.current) meterRef.current.style.transform = `scaleX(${pct / 1000})`;
      // 4 parts in 1000, not one: the slider is a nicety, the meter is the readout.
      if (scrubRef.current && Math.abs(Number(scrubRef.current.value) - pct) >= 4) scrubRef.current.value = String(pct);
    }
    let next = 0;
    scene.phases.forEach((ph, i) => {
      if (ms >= ph.at) next = i;
    });
    if (next !== phaseRef.current) {
      phaseRef.current = next;
      setPhase(next);
    }
  }, [scene]);

  /** Start or stop the animations themselves — one call each, no per-frame work. */
  const setRun = useCallback((on: boolean) => {
    const c = clock.current;
    if (on) {
      c.start = performance.now() - c.elapsed;
      for (const a of anims.current) {
        const t = (a.effect as KeyframeEffect | null)?.getTiming();
        const end = Number(t?.delay ?? 0) + Number(t?.duration ?? 0);
        // Past its end already: leave it completed rather than restart it.
        if (c.elapsed < end) a.play();
      }
      c.running = true;
    } else {
      if (c.running) c.elapsed = performance.now() - c.start;
      for (const a of anims.current) a.pause();
      c.running = false;
    }
  }, []);

  /* --- measure the stage, so scenes draw in the space they are given ------- */
  const useIsoEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
  useIsoEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const read = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) setBox({ W: Math.round(r.width), H: Math.round(r.height) });
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* --- one animation per shape, built when the tree changes ---------------- */
  useIsoEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    // React reuses SVG nodes when only geometry changed, and a stale animation with
    // `fill: both` would keep winning the cascade. One live animation per shape.
    for (const a of anims.current) a.cancel();
    anims.current = [];
    counts.current = [];

    svg.querySelectorAll<SVGElement>('[data-anim]').forEach((el) => {
      const kind = (el.dataset.anim ?? 'fade') as Anim;
      if (kind === 'none') return;
      const a = el.animate(KEYFRAMES[kind], {
        duration: Math.max(1, Number(el.dataset.dur ?? 400)),
        delay: Number(el.dataset.at ?? 0),
        easing: kind === 'draw' ? 'linear' : EASE,
        fill: 'both',
      });
      a.pause();
      a.currentTime = 0;
      anims.current.push(a);
    });
    svg.querySelectorAll<SVGTextElement>('[data-count]').forEach((el) => {
      counts.current.push({
        el,
        from: Number(el.dataset.from ?? 0),
        to: Number(el.dataset.to ?? 0),
        at: Number(el.dataset.at ?? 0),
        dur: Number(el.dataset.dur ?? 800),
      });
    });

    clock.current.elapsed = still ? scene.dur : 0;
    clock.current.running = false;
    meterAt.current = -1;
    for (const a of anims.current) a.currentTime = clock.current.elapsed;
    paint(clock.current.elapsed);
    if (!still && playing.current) setRun(true);
  }, [els, paint, scene.dur, setRun, still]);

  /* --- the loop: progress and copy only ---------------------------------- */
  useEffect(() => {
    const loop = () => {
      raf.current = requestAnimationFrame(loop);
      const c = clock.current;
      if (!c.running) return;
      const ms = performance.now() - c.start;
      c.elapsed = ms;
      paint(ms);
      if (ms >= scene.dur) {
        if (step < SCENES.length - 1) {
          setStep(step + 1);
        } else {
          setRun(false);
          playing.current = false;
          setIsPlaying(false);
        }
      }
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [paint, scene.dur, setRun, step]);

  const play = useCallback(
    (next?: boolean) => {
      if (still) return;
      const value = next ?? !playing.current;
      if (value === playing.current) return;
      playing.current = value;
      setIsPlaying(value);
      if (value) {
        if (clock.current.elapsed >= scene.dur) {
          clock.current.elapsed = 0;
          for (const a of anims.current) a.currentTime = 0;
        }
        setRun(true);
      } else {
        setRun(false);
      }
    },
    [scene.dur, setRun, still]
  );

  const go = useCallback((to: number) => {
    const next = Math.max(0, Math.min(SCENES.length - 1, to));
    clock.current.elapsed = 0;
    clock.current.running = false;
    phaseRef.current = -1;
    meterAt.current = -1;
    setStep(next);
    if (typeof history !== 'undefined') history.replaceState(null, '', `#s=${next + 1}`);
  }, []);

  const seek = useCallback((ms: number) => {
    const c = clock.current;
    c.elapsed = Math.max(0, Math.min(scene.dur, ms));
    c.start = performance.now() - c.elapsed;
    for (const a of anims.current) a.currentTime = c.elapsed;
    paint(c.elapsed);
  }, [paint, scene.dur]);

  const jumpToPhase = useCallback((at: number) => {
    play(false);
    seek(Math.max(0, at - scene.dur * 0.06));
  }, [play, scene.dur, seek]);

  /* --- deep links, keys, and pausing in a background tab ------------------ */
  useEffect(() => {
    const fromHash = () => {
      const m = /s=(\d+)/.exec(location.hash);
      if (m) go(Number(m[1]) - 1);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, [go]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowRight') go(step + 1);
      else if (e.key === 'ArrowLeft') go(step - 1);
      else if (e.key === ' ') {
        e.preventDefault();
        play();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, play, step]);

  useEffect(() => {
    const onHide = () => {
      if (document.hidden && clock.current.running) {
        setRun(false);
        playing.current = false;
        setIsPlaying(false);
      }
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [setRun]);

  return (
    <div className="rag" data-still={still ? 'true' : undefined}>
      <nav className="rag__steps" aria-label="Pipeline steps">
        <ol>
          {SCENES.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                aria-current={i === step ? 'step' : undefined}
                onClick={() => {
                  play(false);
                  go(i);
                }}
              >
                <span className="rag__step-n">{i + 1}</span>
                <span>{s.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="rag__main">
        <div className="rag__stage">
          <svg ref={svgRef} viewBox={`0 0 ${stage.W} ${stage.H}`} role="img" aria-label={`${scene.title}. ${scene.sum}`}>
            <defs>
              {(Object.keys(MARKERS) as string[]).map((token) => (
                <marker
                  key={token}
                  id={MARKERS[token]}
                  viewBox="0 0 8 8"
                  refX="6.5"
                  refY="4"
                  markerWidth="5.5"
                  markerHeight="5.5"
                  orient="auto-start-reverse"
                >
                  <path d="M0,1 L6.5,4 L0,7 z" fill={FILL[token]} />
                </marker>
              ))}
            </defs>
            {els.map((e, i) => (
              <Shape key={`${scene.id}-${i}`} e={e} />
            ))}
          </svg>
        </div>

        <div className="rag__panel">
          <h3 className="rag__title">{scene.title}</h3>
          <p className="rag__caption" aria-live="polite" dangerouslySetInnerHTML={{ __html: scene.phases[phase]?.cap ?? '' }} />
          <div className="rag__phases" aria-label="Phases">
            {scene.phases.map((ph, i) => (
              <button
                key={ph.label}
                type="button"
                aria-current={i === phase ? 'true' : undefined}
                onClick={() => jumpToPhase(ph.at)}
              >
                {ph.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rag__dock">
          <span className="rag__track" aria-hidden="true">
            <span className="rag__meter" ref={meterRef} />
          </span>
          <input
            className="rag__scrub"
            ref={scrubRef}
            type="range"
            min={0}
            max={1000}
            defaultValue={0}
            aria-label="Timeline for this step"
            onChange={(e) => {
              play(false);
              seek((Number(e.currentTarget.value) / 1000) * scene.dur);
            }}
          />
          <div className="rag__buttons">
            <button type="button" onClick={() => { play(false); go(step - 1); }} disabled={step === 0}>
              Prev
            </button>
            <button type="button" className="rag__play" onClick={() => play()} aria-pressed={isPlaying} disabled={still}>
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button type="button" onClick={() => { play(false); go(step + 1); }} disabled={step === SCENES.length - 1}>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
