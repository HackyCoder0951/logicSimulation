import React, { useRef, useEffect } from 'react';

const WaveformViewer = ({ history, signals }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !history || history.length === 0 || !signals || signals.length === 0) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear
        ctx.fillStyle = '#0f172a'; // slate-900
        ctx.fillRect(0, 0, width, height);

        // Grid
        ctx.strokeStyle = '#1e293b'; // slate-800
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x < width; x += 50) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
        }
        ctx.stroke();

        // Draw Signals
        const rowHeight = 40;
        const padding = 10;
        const timeScale = 2; // Pixels per frame

        signals.forEach((signal, index) => {
            const yBase = index * rowHeight + padding + 20;

            // Label
            ctx.fillStyle = '#94a3b8'; // slate-400
            ctx.font = '10px monospace';
            ctx.fillText(signal.label, 5, yBase - 15);

            // Waveform
            ctx.strokeStyle = '#22c55e'; // green-500
            ctx.lineWidth = 2;
            ctx.beginPath();

            // Draw from right to left (newest at right)
            // history[0] is newest
            let prevVal = null;

            for (let i = 0; i < history.length; i++) {
                const x = width - (i * timeScale);
                if (x < 0) break;

                const frame = history[i];
                const val = frame[signal.id]; // 0 or 1
                const y = val ? yBase - 10 : yBase;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, prevVal !== val ? (prevVal ? yBase - 10 : yBase) : y); // Vertical line
                    ctx.lineTo(x, y); // Horizontal line
                }
                prevVal = val;
            }
            ctx.stroke();

            // Divider
            ctx.strokeStyle = '#334155'; // slate-700
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, index * rowHeight + rowHeight);
            ctx.lineTo(width, index * rowHeight + rowHeight);
            ctx.stroke();
        });

        // Time Cursor (Current)
        ctx.strokeStyle = '#fbbf24'; // amber-400
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(width - 1, 0);
        ctx.lineTo(width - 1, height);
        ctx.stroke();

    }, [history, signals]);

    // Resize observer to handle container resizing
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                canvas.width = width;
                canvas.height = height;
            }
        });

        resizeObserver.observe(canvas.parentElement);
        return () => resizeObserver.disconnect();
    }, []);

    return (
        <div className="w-full h-full bg-slate-950 overflow-hidden relative">
            <canvas ref={canvasRef} className="block" />
        </div>
    );
};

export default WaveformViewer;
