import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { SCENES } from './scenes';
import type { Anim, El, Fill, Stage } from './types';
import './rag.css';

/**
 * The walkthrough island.
 *
 * React owns the shell — steps, phases, captions, controls — and the SVG *tree* is
 * declared once per step from the scene data. The motion is Web Animations: every
 * shape carries the moment it should appear (`data-at`) and how long it takes, and
 * one rAF loop keeps the whole step at `time` ms by writing `currentTime` onto the
 * paused animations. Scrubbing is therefore exact and playback never re-renders
 * React, which is what keeps it smooth on a phone.
 */

const FILL: Record<Fill, string> = {
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
};

const MARKERS = {
  ink: 'rag-arrow-ink',
  muted: 'rag-arrow-muted',
  accent: 'rag-arrow-accent',
  rule: 'rag-arrow-rule',
} as const;

const EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

const KEYFRAMES: Record<Anim, Keyframe[]> = {
  fade: [{ opacity: '0' }, { opacity: '1' }],
  pop: [{ opacity: '0', transform: 'scale(0.94)' }, { opacity: '1', transform: 'scale(1)' }],
  rise: [{ opacity: '0', transform: 'translateY(7px)' }, { opacity: '1', transform: 'translateY(0)' }],
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

const markerFor = (token: Fill | undefined) => `url(#${MARKERS[(token ?? 'rule') as keyof typeof MARKERS] ?? MARKERS.rule})`;

function Shape({ e }: { e: El }) {
  const kind = (e.anim ?? (e.t === 'line' || e.t === 'path' ? 'fade' : 'fade')) as Anim;
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
            const h = e.h * (0.3 + 0.7 * Math.abs(Math.sin(k * 1.7 + 0.6)));
            return (
              <rect
                key={k}
                data-anim="growy"
                data-at={Math.round((e.at ?? 0) + k * (e.stagger ?? 16))}
                data-dur={Math.round(e.dur ?? 400)}
                x={e.x + k * step + step * 0.16}
                y={e.y + e.h - h}
                width={Math.max(1, step * 0.68)}
                height={h}
                rx={1.5}
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

/** Renders the scene's shapes, one React element per shape. */
function Layers({ els }: { els: El[] }) {
  return (
    <>
      {els.map((e, i) => (
        <Shape key={i} e={e} />
      ))}
    </>
  );
}

export default function RagExplainer() {
  const stageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const meterRef = useRef<HTMLSpanElement>(null);
  const scrubRef = useRef<HTMLInputElement>(null);
  const anims = useRef<Animation[]>([]);
  const counts = useRef<Array<{ el: SVGTextElement; from: number; to: number; at: number; dur: number }>>([]);
  const time = useRef(0);
  const raf = useRef(0);
  const last = useRef(0);
  const playing = useRef(true);
  const phaseRef = useRef(0);

  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [box, setBox] = useState({ W: 900, H: 470 });

  const scene = SCENES[step];
  const still = useMemo(() => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  const stage: Stage = useMemo(() => {
    const pad = box.W < 420 ? 12 : 16;
    return { W: box.W, H: box.H, pad, tall: box.W < 620 || box.H > box.W * 0.95, still };
  }, [box, still]);

  const els = useMemo(() => scene.els(stage), [scene, stage]);
  const phaseAt = useCallback((ms: number) => {
    let k = 0;
    scene.phases.forEach((ph, i) => {
      if (ms >= ph.at) k = i;
    });
    return k;
  }, [scene]);

  /** Writes the timeline onto every animation. Cheap: no React work. */
  const apply = useCallback(() => {
    const ms = time.current;
    for (const a of anims.current) a.currentTime = ms;
    for (const c of counts.current) {
      const p = Math.min(1, Math.max(0, (ms - c.at) / Math.max(1, c.dur)));
      const v = Math.round(c.from + (c.to - c.from) * (1 - Math.pow(1 - p, 3)));
      const text = v.toLocaleString('en-US');
      if (c.el.textContent !== text) c.el.textContent = text;
    }
    if (meterRef.current) meterRef.current.style.transform = `scaleX(${Math.min(1, ms / scene.dur)})`;
    if (scrubRef.current) scrubRef.current.value = String(Math.round(Math.min(1, ms / scene.dur) * 1000));
    const next = phaseAt(ms);
    if (next !== phaseRef.current) {
      phaseRef.current = next;
      setPhase(next);
    }
  }, [phaseAt, scene.dur]);

  /* --- measure the stage, so scenes draw in the space they are given ------- */
  const useIsoEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
  useIsoEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const read = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0) setBox({ W: Math.round(r.width), H: Math.round(r.height) });
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
    // Cancel the previous round: React reuses the same SVG nodes when only the
    // geometry changed, and a stale animation with `fill: both` would keep winning
    // the cascade. One live animation per shape, always.
    for (const a of anims.current) a.cancel();
    anims.current = [];
    counts.current = [];
    svg.querySelectorAll<SVGElement>('[data-anim]').forEach((el) => {
      const kind = (el.dataset.anim ?? 'fade') as Anim;
      const a = el.animate(KEYFRAMES[kind], {
        duration: Math.max(1, Number(el.dataset.dur ?? 400)),
        delay: Number(el.dataset.at ?? 0),
        easing: kind === 'draw' ? 'linear' : EASE,
        fill: 'both',
      });
      a.pause();
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
    apply();
  }, [els, apply]);

  /* --- the loop ----------------------------------------------------------- */
  useEffect(() => {
    const loop = (ts: number) => {
      raf.current = requestAnimationFrame(loop);
      const dt = last.current ? Math.min(64, ts - last.current) : 0;
      last.current = ts;
      if (!playing.current) return;
      time.current += dt;
      if (time.current >= scene.dur) {
        if (step < SCENES.length - 1) {
          time.current = 0;
          setStep(step + 1);
          return;
        }
        time.current = scene.dur;
        playing.current = false;
        setIsPlaying(false);
      }
      apply();
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [apply, scene.dur, step]);

  const play = useCallback(
    (next?: boolean) => {
      if (still) return;
      const value = next ?? !playing.current;
      playing.current = value;
      setIsPlaying(value);
      last.current = 0;
    },
    [still]
  );

  const go = useCallback((to: number) => {
    const next = Math.max(0, Math.min(SCENES.length - 1, to));
    time.current = 0;
    last.current = 0;
    phaseRef.current = 0;
    setPhase(0);
    setStep(next);
    if (typeof history !== 'undefined') history.replaceState(null, '', `#s=${next + 1}`);
  }, []);

  const seek = useCallback((ms: number) => {
    time.current = Math.max(0, ms);
    last.current = 0;
    apply();
  }, [apply]);

  const jumpToPhase = useCallback((at: number) => {
    play(false);
    time.current = Math.max(0, at - scene.dur * 0.08);
    last.current = 0;
    apply();
  }, [apply, play, scene.dur]);

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
      if (document.hidden) play(false);
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [play]);

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
        <div className="rag__stage" ref={stageRef}>
          <svg ref={svgRef} viewBox={`0 0 ${stage.W} ${stage.H}`} role="img" aria-label={`${scene.title}. ${scene.sum}`}>
            <defs>
              {(Object.keys(MARKERS) as Array<keyof typeof MARKERS>).map((token) => (
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
            <Layers els={els} />
          </svg>
        </div>

        <div className="rag__panel">
          <h3 className="rag__title">{scene.title}</h3>
          <p className="rag__sum">{scene.sum}</p>
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
          <p className="rag__caption" aria-live="polite" dangerouslySetInnerHTML={{ __html: scene.phases[phase]?.cap ?? '' }} />
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
