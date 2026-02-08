import { useEffect, useRef } from 'react';

export default function AnimatedStockChart() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width = window.innerWidth;
        const height = canvas.height = window.innerHeight;

        // Generate random stock data
        const generateStockData = (points = 100) => {
            const data = [];
            let price = 100;
            for (let i = 0; i < points; i++) {
                price += (Math.random() - 0.48) * 5; // Slight upward bias
                data.push({
                    x: (i / points) * width,
                    y: height / 2 + (100 - price) * 3,
                    price: price
                });
            }
            return data;
        };

        // Generate candlestick data
        const generateCandlesticks = (count = 40) => {
            const candles = [];
            let price = 100;
            const candleWidth = width / count;

            for (let i = 0; i < count; i++) {
                const open = price;
                const close = price + (Math.random() - 0.48) * 8;
                const high = Math.max(open, close) + Math.random() * 5;
                const low = Math.min(open, close) - Math.random() * 5;

                candles.push({
                    x: i * candleWidth,
                    open,
                    close,
                    high,
                    low,
                    bullish: close > open
                });

                price = close;
            }
            return candles;
        };

        let stockData = generateStockData();
        let candlesticks = generateCandlesticks();
        let offset = 0;
        let animationFrame;

        const draw = () => {
            // Clear with fade effect
            ctx.fillStyle = 'rgba(11, 15, 25, 0.1)';
            ctx.fillRect(0, 0, width, height);

            // Draw grid lines
            ctx.strokeStyle = 'rgba(71, 85, 105, 0.1)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 10; i++) {
                const y = (height / 10) * i;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            // Draw candlesticks
            const candleWidth = width / candlesticks.length;
            candlesticks.forEach((candle, i) => {
                const x = candle.x - offset;
                if (x < -candleWidth || x > width) return;

                const centerY = height / 2;
                const scale = 2;

                const openY = centerY - (candle.open - 100) * scale;
                const closeY = centerY - (candle.close - 100) * scale;
                const highY = centerY - (candle.high - 100) * scale;
                const lowY = centerY - (candle.low - 100) * scale;

                // Draw wick
                ctx.strokeStyle = candle.bullish
                    ? 'rgba(16, 185, 129, 0.3)'
                    : 'rgba(239, 68, 68, 0.3)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x + candleWidth / 2, highY);
                ctx.lineTo(x + candleWidth / 2, lowY);
                ctx.stroke();

                // Draw body
                ctx.fillStyle = candle.bullish
                    ? 'rgba(16, 185, 129, 0.2)'
                    : 'rgba(239, 68, 68, 0.2)';
                const bodyHeight = Math.abs(closeY - openY);
                ctx.fillRect(x + 2, Math.min(openY, closeY), candleWidth - 4, bodyHeight || 1);
            });

            // Draw smooth line chart overlay
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            stockData.forEach((point, i) => {
                const x = point.x - offset;
                if (i === 0) {
                    ctx.moveTo(x, point.y);
                } else {
                    ctx.lineTo(x, point.y);
                }
            });
            ctx.stroke();

            // Draw glow effect
            ctx.shadowBlur = 20;
            ctx.shadowColor = 'rgba(59, 130, 246, 0.5)';
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Animate offset
            offset += 0.5;
            if (offset > width / 2) {
                offset = 0;
                stockData = generateStockData();
                candlesticks = generateCandlesticks();
            }

            animationFrame = requestAnimationFrame(draw);
        };

        draw();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrame);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{ mixBlendMode: 'screen' }}
        />
    );
}
