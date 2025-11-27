'use client';

// import React, { useState } from 'react';
import React, { useState, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import CanvasWorkspace from '@/components/CanvasWorkspace';
import TruthTable from '@/components/TruthTable';
import WaveformViewer from '@/components/WaveformViewer';
import TestbenchModal from '@/components/TestbenchModal';

export default function Home() {
    const [selectedGateType, setSelectedGateType] = useState(null);
    const [circuitTruthTable, setCircuitTruthTable] = useState(null);
    const [currentInputs, setCurrentInputs] = useState([]);

    // Waveform State
    const [activeTab, setActiveTab] = useState('waveform'); // 'table' or 'waveform'
    const [waveformHistory, setWaveformHistory] = useState([]);
    const [monitoredSignals, setMonitoredSignals] = useState([]);
    const historyBufferRef = useRef([]);

    // Testbench State
    const [isTestbenchOpen, setIsTestbenchOpen] = useState(false);
    const workspaceRef = useRef(null); // To access runTestbench

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

    // Sidebar State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        document.addEventListener('touchmove', handleResizeMove);
        document.addEventListener('touchend', handleResizeEnd);
    };

    const handleResizeMove = (e) => {
        if (!isResizingRef.current) return;

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const dx = clientX - lastMouseRef.current.x;
        const dy = clientY - lastMouseRef.current.y;

        setPanelSize(prev => ({
            width: Math.max(200, prev.width - dx), // Dragging left increases width
            height: Math.max(150, prev.height - dy) // Dragging up increases height
        }));

        lastMouseRef.current = { x: clientX, y: clientY };
    };

    const handleResizeEnd = () => {
        isResizingRef.current = false;
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
        document.removeEventListener('touchmove', handleResizeMove);
        document.removeEventListener('touchend', handleResizeEnd);
    };

    const handleRunTestbench = (script) => {
        // Access runTestbench from canvas ref (hacky but effective)
        // We need to find the canvas element's property we attached
        const canvas = document.querySelector('canvas');
        if (canvas && canvas.runTestbench) {
            const result = canvas.runTestbench(script);
            setWaveformHistory(result.history);
            setMonitoredSignals(result.signals);
            setActiveTab('waveform');
        }
    };

    return (
        <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden font-sans selection:bg-blue-500/30">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 flex flex-col relative w-full h-full overflow-hidden">
                {/* Mobile Header / Toolbar */}
                <div className="absolute top-4 left-4 z-30 flex items-center gap-4">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="md:hidden p-2 bg-slate-800 rounded-md text-slate-200 shadow-lg border border-slate-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                {/* Run Testbench Button */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-max">
                    <button
                        onClick={() => setIsTestbenchOpen(true)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-md shadow-lg font-medium hover:bg-purple-500 transition-all text-sm flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        <span className="hidden sm:inline">Run Testbench</span>
                        <span className="sm:hidden">Run</span>
                    </button>
                </div>

                <CanvasWorkspace
                    onSelectionChange={setSelectedGateType}
                    onAnalyze={setCircuitTruthTable}
                    onInputStateChange={setCurrentInputs}
                    onSignalHistoryUpdate={handleSignalUpdate}
                />

                {/* Floating Panel */}
                <div
                    className="absolute bottom-0 right-0 md:bottom-6 md:right-6 bg-slate-900/95 backdrop-blur-md border-t md:border border-slate-700 md:rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all z-20"
                    style={{
                        width: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : panelSize.width,
                        height: typeof window !== 'undefined' && window.innerWidth < 768 ? '35vh' : panelSize.height,
                        maxHeight: '80vh'
                    }}
                >
                    {/* Resize Handle (Desktop Only) */}
                    <div
                        className="hidden md:block absolute top-0 left-0 w-4 h-4 cursor-nwse-resize z-20 hover:bg-blue-500/50 rounded-br"
                        onMouseDown={handleResizeStart}
                    />

                    {/* Tabs */}
                    <div className="flex border-b border-slate-700 bg-slate-800/50 shrink-0">
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

                <TestbenchModal
                    isOpen={isTestbenchOpen}
                    onClose={() => setIsTestbenchOpen(false)}
                    onRun={handleRunTestbench}
                    inputs={monitoredSignals.filter(s => !s.label.includes('Out') && !s.label.includes('Sum') && !s.label.includes('Cout')).map(s => s.label)}
                />
            </main>
        </div>
    );
}
