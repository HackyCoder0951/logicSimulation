import React, { useState, useEffect, useRef } from 'react';

const TestbenchModal = ({ isOpen, onClose, onRun, inputs }) => {
    const [script, setScript] = useState('');
    const [error, setError] = useState(null);
    const [size, setSize] = useState({ width: 600, height: 500 });
    const isResizingRef = useRef(false);
    const lastMouseRef = useRef({ x: 0, y: 0 });

    const handleResizeStart = (e) => {
        e.preventDefault();
        isResizingRef.current = true;
        lastMouseRef.current = { x: e.clientX, y: e.clientY };
        document.addEventListener('mousemove', handleResizeMove);
        document.addEventListener('mouseup', handleResizeEnd);
    };

    const handleResizeMove = (e) => {
        if (!isResizingRef.current) return;
        const dx = e.clientX - lastMouseRef.current.x;
        const dy = e.clientY - lastMouseRef.current.y;

        setSize(prev => ({
            width: Math.max(400, prev.width + dx),
            height: Math.max(300, prev.height + dy)
        }));

        lastMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleResizeEnd = () => {
        isResizingRef.current = false;
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
    };

    // Default example script
    useEffect(() => {
        if (isOpen && !script) {
            const example = [
                { time: 0, inputs: {} },
                { time: 100, inputs: {} },
                { time: 200, inputs: {} }
            ];

            // Pre-fill with available inputs
            if (inputs.length > 0) {
                inputs.forEach(inp => {
                    example[0].inputs[inp] = 0;
                    example[1].inputs[inp] = 1;
                    example[2].inputs[inp] = 0;
                });
            }

            setScript(JSON.stringify(example, null, 2));
        }
    }, [isOpen, inputs]);

    const handleRun = () => {
        try {
            const parsed = JSON.parse(script);
            if (!Array.isArray(parsed)) throw new Error("Script must be an array of events.");
            onRun(parsed);
            onClose();
        } catch (e) {
            setError(e.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div
                className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col relative"
                style={{ width: size.width, height: size.height }}
            >
                {/* Resize Handle */}
                <div
                    className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-20 hover:bg-blue-500/50 rounded-br"
                    onMouseDown={handleResizeStart}
                />
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white">Testbench Runner</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
                </div>

                <div className="p-4 flex-1 flex flex-col overflow-hidden">
                    <p className="text-sm text-slate-400 mb-2">
                        Define a sequence of input changes in JSON format. Time is in nanoseconds (ns).
                    </p>

                    <div className="flex-1 relative">
                        <textarea
                            value={script}
                            onChange={(e) => { setScript(e.target.value); setError(null); }}
                            className="w-full h-full bg-slate-950 text-green-400 font-mono text-sm p-4 rounded border border-slate-700 outline-none resize-none focus:border-blue-500"
                            spellCheck="false"
                        />
                    </div>

                    {error && (
                        <div className="mt-2 text-red-400 text-xs bg-red-900/20 p-2 rounded border border-red-900/50">
                            Error: {error}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-700 flex justify-end gap-2 bg-slate-800/50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleRun}
                        className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-500 rounded font-medium shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all"
                    >
                        Run Testbench
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TestbenchModal;
