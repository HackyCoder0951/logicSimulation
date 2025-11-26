'use client';

// import React, { useState } from 'react';
import React, { useState, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import CanvasWorkspace from '@/components/CanvasWorkspace';
import TruthTable from '@/components/TruthTable';
import WaveformViewer from '@/components/WaveformViewer';

export default function Home() {
    const [selectedGateType, setSelectedGateType] = useState(null);
    const [circuitTruthTable, setCircuitTruthTable] = useState(null);
    const [currentInputs, setCurrentInputs] = useState([]);

    // Waveform State
    const [activeTab, setActiveTab] = useState('waveform'); // 'table' or 'waveform'
    const [waveformHistory, setWaveformHistory] = useState([]);
    const [monitoredSignals, setMonitoredSignals] = useState([]);
    const historyBufferRef = useRef([]);

    const handleSignalUpdate = (frame, gates) => {
        // Update buffer
        historyBufferRef.current.unshift(frame);
        if (historyBufferRef.current.length > 500) { // Keep last 500 frames
            historyBufferRef.current.pop();
        }

        // Throttled State Update (every 5 frames or so to save React renders)
        // Actually, for 60fps, updating React state every frame is heavy.
        // Let's update every 10 frames (~6 times a second)
        if (historyBufferRef.current.length % 5 === 0) {
            setWaveformHistory([...historyBufferRef.current]);

            // Update signal metadata if changed count
            if (gates.length !== monitoredSignals.length) {
                setMonitoredSignals(gates.map(g => ({ id: g.id, label: g.label || g.type })));
            }
        }
    };

    // Panel Size State
    const [panelSize, setPanelSize] = useState({ width: 320, height: 300 });
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

        setPanelSize(prev => ({
            width: Math.max(200, prev.width - dx), // Dragging left increases width
            height: Math.max(150, prev.height - dy) // Dragging up increases height
        }));

        lastMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleResizeEnd = () => {
        isResizingRef.current = false;
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
    };

    return (
        <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden font-sans selection:bg-blue-500/30">
            <Sidebar />

            <main className="flex-1 flex flex-col relative">
                <CanvasWorkspace
                    onSelectionChange={setSelectedGateType}
                    onAnalyze={setCircuitTruthTable}
                    onInputStateChange={setCurrentInputs}
                    onSignalHistoryUpdate={handleSignalUpdate}
                />

                {/* Floating Panel */}
                <div
                    className="absolute bottom-6 right-6 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col transition-none"
                    style={{ width: panelSize.width, height: panelSize.height }}
                >
                    {/* Resize Handle */}
                    <div
                        className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize z-20 hover:bg-blue-500/50 rounded-br"
                        onMouseDown={handleResizeStart}
                    />

                    {/* Tabs */}
                    <div className="flex border-b border-slate-700 bg-slate-800/50">
                        <button
                            onClick={() => setActiveTab('table')}
                            className={`flex-1 py-2 text-xs font-medium transition-colors ${activeTab === 'table' ? 'text-blue-400 bg-slate-800 border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Truth Table
                        </button>
                        <button
                            onClick={() => setActiveTab('waveform')}
                            className={`flex-1 py-2 text-xs font-medium transition-colors ${activeTab === 'waveform' ? 'text-green-400 bg-slate-800 border-b-2 border-green-500' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Waveform
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden relative">
                        {activeTab === 'table' ? (
                            <TruthTable
                                type={selectedGateType}
                                circuitTable={circuitTruthTable}
                                currentInputs={currentInputs}
                            />
                        ) : (
                            <WaveformViewer
                                history={waveformHistory}
                                signals={monitoredSignals}
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
