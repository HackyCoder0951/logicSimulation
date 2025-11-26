import React, { useRef, useEffect, useState } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';

const WaveformViewer = ({ history, signals }) => {
    const canvasRef = useRef(null);
    const [zoom, setZoom] = useState(2); // Pixels per frame (time unit)

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
        const timeScale = zoom; // Use state zoom

        // Calculate startX globally for all signals
        const contentWidth = history.length * timeScale;
        let startX = 0;
        if (contentWidth > width) {
            startX = width - contentWidth;
        }

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

            // Draw from left to right (oldest at left)
            // history[0] is newest, history[length-1] is oldest

            let prevVal = null;

            // Iterate from oldest to newest for drawing path correctly
            for (let i = history.length - 1; i >= 0; i--) {
                const x = startX + ((history.length - 1 - i) * timeScale);

                // Optimization: Don't draw if off-screen left
                if (x < -timeScale) continue;
                // Stop if off-screen right
                if (x > width) break;

                const frame = history[i];
                const val = frame[signal.id]; // 0 or 1
                const y = val ? yBase - 10 : yBase;

                if (prevVal === null) {
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

        // Time Cursor (Current) - Always at the newest point
        const cursorX = startX + (history.length - 1) * timeScale;
        if (cursorX >= 0 && cursorX <= width) {
            ctx.strokeStyle = '#fbbf24'; // amber-400
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cursorX, 0);
            ctx.lineTo(cursorX, height);
            ctx.stroke();
        }

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
        <div className="w-full h-full bg-slate-950 overflow-hidden relative group">
            <canvas ref={canvasRef} className="block" />

            {/* Zoom Controls */}
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800/80 p-1 rounded border border-slate-700">
                <button onClick={() => setZoom(z => Math.max(0.5, z - 0.5))} className="p-1 hover:bg-slate-700 rounded text-slate-300">
                    -
                </button>
                <span className="text-xs text-slate-400 flex items-center px-1">{zoom}x</span>
                <button onClick={() => setZoom(z => Math.min(10, z + 0.5))} className="p-1 hover:bg-slate-700 rounded text-slate-300">
                    +
                </button>
            </div>
        </div>
    );
};

export default WaveformViewer;
