// MoneyParticles — one-shot burst of $ symbols that fly to the cash counter then stop
import { useEffect, useRef, useCallback } from 'react';

export default function MoneyParticles({ isPositive = true, intensity = 1, targetRef, onComplete }) {
    const canvasRef = useRef(null);

    const onCompleteCb = useCallback(() => onComplete?.(), [onComplete]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animId;
        let dead = false;

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

        const getTarget = () => {
            if (targetRef?.current) {
                const rect = targetRef.current.getBoundingClientRect();
                const cr = canvas.getBoundingClientRect();
                return { x: rect.left + rect.width / 2 - cr.left, y: rect.top + rect.height / 2 - cr.top };
            }
            return { x: W() / 2, y: 40 };
        };

        const colors = isPositive
            ? ['#34d399', '#6ee7b7', '#10b981', '#059669', '#a7f3d0']
            : ['#f87171', '#fca5a5', '#ef4444', '#dc2626', '#fecaca'];

        // Spawn one burst — staggered start times so they arrive in waves
        const count = Math.floor(40 * Math.max(intensity, 0.5));
        const particles = [];
        for (let i = 0; i < count; i++) {
            const target = getTarget();
            const side = Math.random();
            let x, y;
            if (side < 0.25) { x = Math.random() * W(); y = H() + 20; }
            else if (side < 0.5) { x = Math.random() * W(); y = -20; }
            else if (side < 0.75) { x = -20; y = Math.random() * H(); }
            else { x = W() + 20; y = Math.random() * H(); }

            // Stagger: wave 1 (0-0.15), wave 2 (0.1-0.25), wave 3 (0.2-0.35)
            const wave = Math.floor(Math.random() * 3);
            const delay = wave * 0.1 + Math.random() * 0.15;

            particles.push({
                startX: x, startY: y, x, y,
                targetX: target.x + (Math.random() - 0.5) * 30,
                targetY: target.y + (Math.random() - 0.5) * 15,
                size: 10 + Math.random() * 14,
                baseAlpha: 0.7 + Math.random() * 0.3,
                speed: 0.012 + Math.random() * 0.008,
                progress: -delay, // negative = waiting
                symbol: '$',
                color: colors[Math.floor(Math.random() * colors.length)],
                trail: [],
            });
        }

        function animate() {
            if (dead) return;
            ctx.clearRect(0, 0, W(), H());

            let alive = 0;
            for (const p of particles) {
                p.progress += p.speed;
                if (p.progress < 0) { alive++; continue; } // still waiting
                if (p.progress >= 1) continue; // done
                alive++;

                const t = p.progress;
                // Ease-in-out cubic
                const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

                p.x = p.startX + (p.targetX - p.startX) * ease;
                p.y = p.startY + (p.targetY - p.startY) * ease;

                // Store trail positions
                p.trail.push({ x: p.x, y: p.y, a: p.baseAlpha * 0.3 });
                if (p.trail.length > 6) p.trail.shift();

                // Fade: quick fade-in, longer sustain, rapid fadeout at end
                let alpha = p.baseAlpha;
                if (t < 0.08) alpha *= t / 0.08;
                if (t > 0.75) alpha *= (1 - t) / 0.25;

                // Draw trail
                for (let i = 0; i < p.trail.length - 1; i++) {
                    const tp = p.trail[i];
                    const ta = tp.a * (i / p.trail.length) * (t > 0.75 ? (1 - t) / 0.25 : 1);
                    ctx.globalAlpha = ta;
                    ctx.fillStyle = p.color;
                    const r = 1.5 + (i / p.trail.length) * 2;
                    ctx.beginPath();
                    ctx.arc(tp.x, tp.y, r, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Draw symbol
                ctx.globalAlpha = alpha;
                ctx.font = `800 ${p.size}px "SF Mono", "JetBrains Mono", monospace`;
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 12;
                ctx.fillText(p.symbol, p.x - p.size * 0.3, p.y + p.size * 0.35);
                ctx.shadowBlur = 0;
            }

            ctx.globalAlpha = 1;

            if (alive === 0) {
                // All particles done — fire flash on target
                if (targetRef?.current) {
                    targetRef.current.style.transition = 'filter 0.15s, transform 0.15s';
                    targetRef.current.style.filter = `drop-shadow(0 0 20px ${isPositive ? '#34d399' : '#f87171'})`;
                    targetRef.current.style.transform = 'scale(1.15)';
                    setTimeout(() => {
                        if (targetRef.current) {
                            targetRef.current.style.filter = '';
                            targetRef.current.style.transform = '';
                        }
                    }, 400);
                }
                onCompleteCb();
                dead = true;
                return;
            }

            animId = requestAnimationFrame(animate);
        }

        animate();

        return () => {
            dead = true;
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
        };
    }, [isPositive, intensity, targetRef, onCompleteCb]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-50"
            style={{ width: '100%', height: '100%' }}
        />
    );
}
