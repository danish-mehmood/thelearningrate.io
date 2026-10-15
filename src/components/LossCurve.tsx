import { useEffect, useRef, useState } from 'react';
import rough from 'roughjs';

/**
 * A sketchy loss-curve diagram with a ball that rolls to the minimum.
 * Reusable island — drop <LossCurve client:visible /> into any post.
 */
export default function LossCurve() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const ballRef = useRef<SVGGElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [runId, setRunId] = useState(0); // bump to replay

  // curve: y(x) = YB - A*(x-CX)^2   (a valley in SVG coords)
  const CX = 300;
  const A = 0.00417;
  const YB = 300;
  const BALL_X = 300;
  const BALL_Y = 300;
  const curveY = (x: number) => YB - A * (x - CX) * (x - CX);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const reduce =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cssVar = (n: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(n).trim() || '#333';

    function build() {
      if (!svg) return;
      // keep <text> labels, clear previously drawn groups
      svg.querySelectorAll('g').forEach((g) => g.remove());
      const rc = rough.svg(svg);
      const ink = cssVar('--ink');
      const inkSoft = cssVar('--ink-soft');
      const accent = cssVar('--accent');
      const accent2 = cssVar('--accent2');

      // axes
      svg.appendChild(rc.line(55, 40, 55, 320, { stroke: inkSoft, strokeWidth: 2, roughness: 1.4 }));
      svg.appendChild(rc.line(55, 320, 560, 320, { stroke: inkSoft, strokeWidth: 2, roughness: 1.4 }));

      // the bowl
      let d = '';
      for (let x = 72; x <= 544; x += 8) {
        d += (d ? ' L' : 'M') + x.toFixed(1) + ' ' + curveY(x).toFixed(1);
      }
      svg.appendChild(rc.path(d, { stroke: accent, strokeWidth: 3.4, roughness: 1.6, bowing: 1 }));

      // faded previous positions
      [110, 150, 195, 245].forEach((x) => {
        const dot = rc.circle(x, curveY(x), 9, {
          stroke: inkSoft,
          strokeWidth: 1.4,
          roughness: 1.6,
          fill: inkSoft,
          fillStyle: 'solid',
        });
        dot.style.opacity = '0.35';
        svg.appendChild(dot);
      });

      // ball (drawn at base point, moved via transform)
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.appendChild(
        rc.circle(BALL_X, BALL_Y, 26, {
          stroke: ink,
          strokeWidth: 2,
          roughness: 1.3,
          fill: accent2,
          fillStyle: 'solid',
          fillWeight: 2,
        })
      );
      svg.appendChild(g);
      ballRef.current = g;
    }

    function easeOutBack(t: number) {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }
    function setBall(x: number) {
      const g = ballRef.current;
      if (!g) return;
      g.setAttribute('transform', `translate(${x - BALL_X},${curveY(x) - BALL_Y})`);
    }
    function roll() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const startX = 100;
      const endX = CX;
      const dur = 1700;
      if (reduce) {
        setBall(endX);
        return;
      }
      setBall(startX);
      let t0: number | null = null;
      const frame = (ts: number) => {
        if (t0 === null) t0 = ts;
        const p = Math.min(1, (ts - t0) / dur);
        setBall(startX + (endX - startX) * easeOutBack(p));
        if (p < 1) rafRef.current = requestAnimationFrame(frame);
      };
      rafRef.current = requestAnimationFrame(frame);
    }

    build();
    roll();

    const onTheme = () => {
      build();
      setBall(CX);
    };
    const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    mq?.addEventListener('change', onTheme);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      mq?.removeEventListener('change', onTheme);
    };
  }, [runId]);

  return (
    <div>
      <svg
        ref={svgRef}
        viewBox="0 0 600 360"
        style={{ display: 'block', width: '100%', height: 'auto' }}
        role="img"
        aria-label="A sketchy loss curve shaped like a bowl, with a ball rolling down to the lowest point."
      >
        <text x="300" y="348" textAnchor="middle" fill="var(--ink-soft)" fontFamily="var(--font-hand)" fontSize="20">
          parameter  →
        </text>
        <text x="22" y="40" fill="var(--ink-soft)" fontFamily="var(--font-hand)" fontSize="20">
          loss
        </text>
      </svg>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2px' }}>
        <button
          onClick={() => setRunId((n) => n + 1)}
          style={{
            fontFamily: 'var(--font-hand)',
            fontSize: '1rem',
            color: 'var(--accent)',
            background: 'transparent',
            border: '1.5px dashed var(--accent)',
            borderRadius: '20px',
            padding: '4px 14px',
            cursor: 'pointer',
            transform: 'rotate(-.8deg)',
          }}
        >
          ▶ watch it roll again
        </button>
      </div>
    </div>
  );
}
