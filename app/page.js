'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import CanvasWorkspace from '@/components/CanvasWorkspace';
import TruthTable from '@/components/TruthTable';

export default function Home() {
    const [selectedGateType, setSelectedGateType] = useState(null);
    const [circuitTruthTable, setCircuitTruthTable] = useState(null);

    return (
        <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden font-sans selection:bg-blue-500/30">
            <Sidebar />

            <main className="flex-1 flex flex-col relative">
                <CanvasWorkspace
                    onSelectionChange={setSelectedGateType}
                    onAnalyze={setCircuitTruthTable}
                />

                {/* Floating Truth Table Panel */}
                <div className="absolute bottom-6 right-6 w-80 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all">
                    <TruthTable type={selectedGateType} circuitTable={circuitTruthTable} />
                </div>
            </main>
        </div>
    );
}
