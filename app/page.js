'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import CanvasWorkspace from '@/components/CanvasWorkspace';
import TruthTable from '@/components/TruthTable';

export default function Home() {
    const [selectedGateType, setSelectedGateType] = useState(null);

    return (
        <main className="flex h-screen bg-slate-900 text-slate-50 overflow-hidden font-sans">
            <div className="flex flex-col h-full">
                <Sidebar />
                <TruthTable type={selectedGateType} />
            </div>
            <CanvasWorkspace onSelectionChange={setSelectedGateType} />
        </main>
    );
}
