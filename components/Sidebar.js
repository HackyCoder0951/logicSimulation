import React from 'react';

const Sidebar = ({ isOpen, onClose }) => {
    const handleDragStart = (e, type) => {
        e.dataTransfer.setData('type', type);
    };

    const renderItem = (type, label) => (
        <div
            key={type}
            className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex flex-col items-center gap-2 cursor-grab hover:border-blue-500 hover:shadow-[0_0_12px_rgba(59,130,246,0.5)] transition-all transform hover:-translate-y-0.5"
            draggable
            onDragStart={(e) => handleDragStart(e, type)}
        >
            <div className={`gate-icon ${type.toLowerCase()}-gate w-10 h-8 bg-slate-700 rounded flex items-center justify-center text-[10px] text-slate-400 font-mono`}>
                {/* Placeholder for icon */}
                {type.substring(0, 3)}
            </div>
            <span className="text-xs font-medium text-slate-200 text-center">{label || type}</span>
        </div>
    );

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-50
                w-64 bg-slate-800 border-r border-slate-700 
                flex flex-col p-6 gap-6 shadow-xl h-full overflow-y-auto
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="logo shrink-0 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-50">Logic<span className="text-blue-500">Sim</span></h1>
                    <button
                        onClick={onClose}
                        className="md:hidden text-slate-400 hover:text-white"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="component-group">
                    <h2 className="text-xs uppercase tracking-wider text-slate-400 mb-3 font-semibold">Basic Gates</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'].map(t => renderItem(t))}
                    </div>
                </div>

                <div className="component-group">
                    <h2 className="text-xs uppercase tracking-wider text-slate-400 mb-3 font-semibold">Arithmetic & Logic</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {renderItem('HALF_ADDER', 'Half Adder')}
                        {renderItem('FULL_ADDER', 'Full Adder')}
                        {renderItem('COMPARATOR', 'Comparator')}
                        {renderItem('ALU_1BIT', 'ALU (1-bit)')}
                    </div>
                </div>

                <div className="component-group">
                    <h2 className="text-xs uppercase tracking-wider text-slate-400 mb-3 font-semibold">Plexers</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {renderItem('MUX_2_1', 'Mux 2:1')}
                        {renderItem('DECODER_2_4', 'Decoder 2:4')}
                    </div>
                </div>

                <div className="component-group">
                    <h2 className="text-xs uppercase tracking-wider text-slate-400 mb-3 font-semibold">I/O & Timing</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {renderItem('SWITCH', 'Switch')}
                        {renderItem('BULB', 'Light Bulb')}
                        {renderItem('CLOCK', 'Clock')}
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
