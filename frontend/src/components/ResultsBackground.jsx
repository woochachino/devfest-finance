// ResultsBackground — full-screen animated canvas: grid, scan lines, floating tickers, pulsing rings
import { useEffect, useRef } from 'react';

export default function ResultsBackground({ isPositive = true }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animId;
        let t = 0;

        const dpr = window.devicePixelRatio || 1;
        const resize = () => {
            canvas.width = canvas.offsetWidth * dpr;
            canvas.height = canvas.offsetHeight * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        window.addEventListener('resize', resize);

        const W = () => canvas.offsetWidth;
        const H = () => canvas.offsetHeight;

        // Color palette
        const accent = isPositive ? [52, 211, 153] : [248, 113, 113]; // emerald / red
        const accentDim = isPositive ? [16, 185, 129] : [239, 68, 68];
        const accentHex = isPositive ? '#10b981' : '#ef4444';
        const accentGlow = isPositive ? '#34d39940' : '#f8717140';

        // Floating ticker tape
        const tickers = [
            'NVDA +34.2%', 'MSFT +4.9%', 'DVN +30.8%', 'JPM +11.6%',
            'AAPL +5.9%', 'XOM +14.2%', 'SNAP +16.0%', 'GOOGL +9.4%',
            'META -5.8%', 'SCHW -3.8%', 'KRE -0.2%', 'PFE -2.3%',
            'AMZN +0.8%', 'COST -7.8%', 'IBM +10.9%', 'LMT +3.0%',
        ];
        const tickerRows = [];
        for (let i = 0; i < 4; i++) {
            const row = [];
            const y = 80 + i * (H() / 5);
            const speed = 0.15 + Math.random() * 0.25;
            const dir = i % 2 === 0 ? 1 : -1;
            for (let j = 0; j < 8; j++) {
                row.push({
                    text: tickers[(i * 8 + j) % tickers.length],
                    x: j * 220 + Math.random() * 40,
                    baseY: y,
                    speed: speed * dir,
                    alpha: 0.04 + Math.random() * 0.04,
                });
            }
            tickerRows.push(row);
        }

        // Scan lines
        const scanLines = [
            { y: 0, speed: 0.8, alpha: 0.06, width: 2 },
            { y: H() * 0.6, speed: 0.5, alpha: 0.04, width: 1 },
        ];

        // Pulsing rings (from center)
        const rings = [];
        let ringTimer = 0;

        // Floating geometric shapes
        const shapes = [];
        for (let i = 0; i < 15; i++) {
            shapes.push({
                x: Math.random() * 2000,
                y: Math.random() * 2000,
                size: 2 + Math.random() * 4,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.2,
                alpha: 0.05 + Math.random() * 0.1,
                type: Math.random() > 0.5 ? 'diamond' : 'cross',
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.01,
            });
        }

        // Vertical grid lines (subtle)
        function drawGrid() {
            const spacing = 60;
            ctx.strokeStyle = `rgba(${accent[0]},${accent[1]},${accent[2]}, 0.03)`;
            ctx.lineWidth = 0.5;
            // Vertical
            for (let x = 0; x < W(); x += spacing) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, H());
                ctx.stroke();
            }
            // Horizontal
            for (let y = 0; y < H(); y += spacing) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(W(), y);
                ctx.stroke();
            }
        }

        // Central radial gradient that breathes
        function drawCenterGlow() {
            const pulse = 0.12 + Math.sin(t * 0.015) * 0.04;
            const cx = W() / 2;
            const cy = H() * 0.25;
            const r = Math.max(W(), H()) * 0.5;
            const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
            grad.addColorStop(0, `rgba(${accent[0]},${accent[1]},${accent[2]}, ${pulse})`);
            grad.addColorStop(0.4, `rgba(${accentDim[0]},${accentDim[1]},${accentDim[2]}, ${pulse * 0.3})`);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W(), H());
        }

        // Second glow bottom-right
        function drawSecondGlow() {
            const pulse = 0.06 + Math.sin(t * 0.02 + 2) * 0.03;
            const cx = W() * 0.8;
            const cy = H() * 0.8;
            const r = Math.max(W(), H()) * 0.35;
            const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
            grad.addColorStop(0, `rgba(${accent[0]},${accent[1]},${accent[2]}, ${pulse})`);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W(), H());
        }

        function drawScanLines() {
            for (const sl of scanLines) {
                sl.y += sl.speed;
                if (sl.y > H()) sl.y = -10;

                const grad = ctx.createLinearGradient(0, sl.y - 20, 0, sl.y + 20);
                grad.addColorStop(0, 'rgba(0,0,0,0)');
                grad.addColorStop(0.5, `rgba(${accent[0]},${accent[1]},${accent[2]}, ${sl.alpha})`);
                grad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = grad;
                ctx.fillRect(0, sl.y - 20, W(), 40);
            }
        }

        function drawTickers() {
            ctx.font = '600 11px "SF Mono", "JetBrains Mono", monospace';
            for (const row of tickerRows) {
                for (const tk of row) {
                    tk.x += tk.speed;
                    // Wrap
                    if (tk.speed > 0 && tk.x > W() + 100) tk.x = -200;
                    if (tk.speed < 0 && tk.x < -200) tk.x = W() + 100;

                    const wobble = Math.sin(t * 0.01 + tk.x * 0.005) * 3;
                    const isNeg = tk.text.includes('-');
                    ctx.globalAlpha = tk.alpha;
                    ctx.fillStyle = isNeg ? '#f87171' : '#34d399';
                    ctx.fillText(tk.text, tk.x, tk.baseY + wobble);
                }
            }
            ctx.globalAlpha = 1;
        }

        function drawRings() {
            ringTimer++;
            if (ringTimer % 120 === 0) {
                rings.push({
                    cx: W() / 2,
                    cy: H() * 0.3,
                    r: 0,
                    maxR: Math.max(W(), H()) * 0.6,
                    alpha: 0.12,
                    speed: 1.5,
                });
            }

            for (let i = rings.length - 1; i >= 0; i--) {
                const ring = rings[i];
                ring.r += ring.speed;
                ring.alpha *= 0.995;

                if (ring.r > ring.maxR || ring.alpha < 0.001) {
                    rings.splice(i, 1);
                    continue;
                }

                ctx.beginPath();
                ctx.arc(ring.cx, ring.cy, ring.r, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(${accent[0]},${accent[1]},${accent[2]}, ${ring.alpha})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }

        function drawShapes() {
            for (const s of shapes) {
                s.x += s.vx;
                s.y += s.vy;
                s.rotation += s.rotSpeed;

                // Wrap
                if (s.x < -20) s.x = W() + 20;
                if (s.x > W() + 20) s.x = -20;
                if (s.y < -20) s.y = H() + 20;
                if (s.y > H() + 20) s.y = -20;

                ctx.save();
                ctx.translate(s.x, s.y);
                ctx.rotate(s.rotation);
                ctx.globalAlpha = s.alpha;
                ctx.strokeStyle = accentHex;
                ctx.lineWidth = 0.8;

                if (s.type === 'diamond') {
                    ctx.beginPath();
                    ctx.moveTo(0, -s.size);
                    ctx.lineTo(s.size, 0);
                    ctx.lineTo(0, s.size);
                    ctx.lineTo(-s.size, 0);
                    ctx.closePath();
                    ctx.stroke();
                } else {
                    ctx.beginPath();
                    ctx.moveTo(-s.size, 0);
                    ctx.lineTo(s.size, 0);
                    ctx.moveTo(0, -s.size);
                    ctx.lineTo(0, s.size);
                    ctx.stroke();
                }

                ctx.restore();
            }
            ctx.globalAlpha = 1;
        }

        // Horizontal data stream bars (like stock data flowing)
        const dataBars = [];
        for (let i = 0; i < 8; i++) {
            dataBars.push({
                y: 50 + Math.random() * (H() - 100),
                width: 30 + Math.random() * 80,
                x: Math.random() * W(),
                speed: 0.5 + Math.random() * 1.5,
                alpha: 0.02 + Math.random() * 0.03,
                height: 1 + Math.random() * 2,
            });
        }

        function drawDataBars() {
            for (const bar of dataBars) {
                bar.x += bar.speed;
                if (bar.x > W() + bar.width) {
                    bar.x = -bar.width;
                    bar.y = 50 + Math.random() * (H() - 100);
                }

                const grad = ctx.createLinearGradient(bar.x, 0, bar.x + bar.width, 0);
                grad.addColorStop(0, 'rgba(0,0,0,0)');
                grad.addColorStop(0.3, `rgba(${accent[0]},${accent[1]},${accent[2]}, ${bar.alpha})`);
                grad.addColorStop(0.7, `rgba(${accent[0]},${accent[1]},${accent[2]}, ${bar.alpha})`);
                grad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = grad;
                ctx.fillRect(bar.x, bar.y, bar.width, bar.height);
            }
        }

        function animate() {
            t++;
            ctx.clearRect(0, 0, W(), H());

            drawGrid();
            drawCenterGlow();
            drawSecondGlow();
            drawDataBars();
            drawTickers();
            drawScanLines();
            drawRings();
            drawShapes();

            animId = requestAnimationFrame(animate);
        }

        animate();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
        };
    }, [isPositive]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ width: '100%', height: '100%' }}
        />
    );
}
